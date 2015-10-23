'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _httpProxy = require('http-proxy');

var _httpProxy2 = _interopRequireDefault(_httpProxy);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _libUtil = require('./lib/util');

function main() {
  var options = {
    // key: fs.readFileSync('config/cert.key'),
    // cert: fs.readFileSync('config/cert.crt')
  };

  var app = (0, _express2['default'])();
  app.use((0, _cookieParser2['default'])());

  var servers = _config2['default'].get('servers');

  console.log("SERVERS: ", servers);
  var serverMap = servers.reduce(function (map, server) {
    return (map[server.name] = server.host, map);
  }, {});
  console.log(serverMap);

  //
  // Create a proxy server with custom application logic
  //
  var proxy = _httpProxy2['default'].createProxyServer({});

  proxy.on('error', function (error, req, res) {
    console.log('proxy error', error);
    res.status(500).end(error);
  });

  app.all('/*', function (req, res, next) {
    if (req.headers['X-Forwarded-Proto'] == 'http') {
      var newUrl = 'https://' + req.hostname + req.url;
      console.log('FORWARDING TO HTTPS: ' + newUrl);
      return res.redirect(301, newUrl);
    }

    if (!req.cookies.LB_STICKY) {
      var server = (0, _libUtil.randomByWeight)(servers, 'weight');
      res.cookie('LB_STICKY', server.name);
      console.log("REDIRECTING TO: " + req.path);
      res.redirect(301, req.path);
    } else {
      console.log('COOKIE: ' + req.cookies.LB_STICKY + ' - ' + req.path);
      var target = serverMap[req.cookies.LB_STICKY];
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
        });
      } else {
        res.clearCookie('LB_STICKY');
        console.log("CONFIG CHANGED.  REDIRECTING TO: " + req.path);
        res.redirect(301, req.path);
      }
    }
  });

  console.log("listening...");
  _http2['default'].createServer(app).listen(_config2['default'].get('http-port'));
  _https2['default'].createServer(options, app).listen(_config2['default'].get('https-port'));
}

main();