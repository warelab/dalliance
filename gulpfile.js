var gulp = require('gulp');
var closure = require('gulp-closure-compiler');
var browserify = require('browserify');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
// var utils = require('gulp-util');
// var gif = require('gulp-if');

/* Want to gulp-if conditional compile everything, but currently doesn't seem to work */

gulp.task('build-worker', function () {
  browserify({
    entries: 'js/fetchworker.js',
    debug: true,
    nobuiltins: true
  }).bundle()
    .pipe(source('js/fetchworker.js'))
    .pipe(buffer())
    .pipe(rename('worker-all.js'))
    .pipe(gulp.dest('build/'));
});


gulp.task('build-main', function () {
  browserify({
    entries: 'js/exports.js',
    debug: true,
    nobuiltins: true
  }).bundle()
    .pipe(source('js/exports.js'))
    .pipe(buffer())
    .pipe(rename('dalliance-all.js'))
    .pipe(gulp.dest('build/'));
});

gulp.task('compile-worker', function () {
  browserify({
    entries: 'js/fetchworker.js',
    debug: true,
    nobuiltins: true
  }).bundle()
    .pipe(source('js/fetchworker.js'))
    .pipe(buffer())
    .pipe(rename('worker-all.js'))
    .pipe(gulp.dest('tmp/'))
    // .pipe(gif(!isDev, closure()))   // Doesn't work
    .pipe(closure({
      compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
      fileName: 'worker-all.js',
      compilerFlags: {
        language_in: 'ECMASCRIPT5'
      }
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('compile-main', function () {
  browserify({
    entries: 'js/exports.js',
    debug: true,
    nobuiltins: true
  }).bundle()
    .pipe(source('js/exports.js'))
    .pipe(buffer())
    .pipe(rename('dalliance-all.js'))
    .pipe(gulp.dest('tmp/'))
    // .pipe(gif(!isDev, closure()))   // Doesn't work
    .pipe(closure({
      compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
      fileName: 'dalliance-all.js',
      compilerFlags: {
        language_in: 'ECMASCRIPT5'
      }
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('watch', function () {
  gulp.watch('js/*.js', ['default']);
});

gulp.task('default', ['build-main', 'build-worker']);
gulp.task('compile', ['compile-main', 'compile-worker']);
