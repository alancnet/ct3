var gulp = require('gulp'),
  babel = require('gulp-babel'),
  nodemon = require('gulp-nodemon')
  jasmine = require('gulp-jasmine');


gulp.task('build', function () {
    return gulp.src(['server.js', 'lib/*.js'], {base: "."})
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('start', function () {
  nodemon({
    script: 'dist/server.js',
    ignore: ['dist/**/*.*'],
    ext: 'js yml',
    env: { 'NODE_ENV': 'development' },
    tasks: ['build']
  })
});

gulp.task('test', function() {
  return  gulp.src(['spec/test.js'], {base: "."})
    .pipe(jasmine());
});

gulp.task('default', ['build', 'start']);
