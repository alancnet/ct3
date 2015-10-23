import http from 'http'
import https from 'https'
import httpProxy from 'http-proxy'
import config from 'config'
import express from 'express'
import fs from 'fs'
import cookieParser from 'cookie-parser'
import {randomInt, randomByWeight} from './lib/util'

function main() {
  var options = {
    // key: fs.readFileSync('config/cert.key'),
    // cert: fs.readFileSync('config/cert.crt')
  };

  var app = express();
  app.use(cookieParser());

  var servers = config.get('servers');

  console.log("SERVERS: ", servers);
  var serverMap = servers.reduce((map, server) => (map[server.name] = server.host, map), {})
  console.log(serverMap);

  //
  // Create a proxy server with custom application logic
  //
  var proxy = httpProxy.createProxyServer({})

  proxy.on('error', function (error, req, res) {
      console.log('proxy error', error);
      res.status(500).end(error);
  });

  app.all('/*', function(req, res, next) {
    if (req.headers['X-Forwarded-Proto'] == 'http') {
      let newUrl = `https://${req.hostname}${req.url}`;
      console.log(`FORWARDING TO HTTPS: ${newUrl}`);
      return res.redirect(301, newUrl);
    }

    if (!req.cookies.LB_STICKY) {
      let server = randomByWeight(servers, 'weight');
      res.cookie('LB_STICKY', server.name)
      console.log("REDIRECTING TO: " + req.path)
      res.redirect(301, req.path);
    }
    else {
      console.log(`COOKIE: ${req.cookies.LB_STICKY} - ${req.path}`)
      var target = serverMap[req.cookies.LB_STICKY]
      if (target) {
        req.headers['X-For-App'] = req.cookies.LB_STICKY;
        req.headers['X-Forward-For'] = req.url;
        req.headers['X-Forward-Proto'] = req.protocol;
        req.headers['X-Forward-Host'] = req.hostname;
        proxy.web(req, res, {
          target: target,
          secure: false,
          xfwd: true,
          changeOrigin: true,
          autoRewrite: true
        })
      }
      else {
        res.clearCookie('LB_STICKY')
        console.log("CONFIG CHANGED.  REDIRECTING TO: " + req.path)
        res.redirect(301, req.path)
      }
    }
  })

  console.log("listening...")
  http.createServer(app).listen(config.get('http-port'))
  https.createServer(options, app).listen(config.get('https-port'))
}

main();
