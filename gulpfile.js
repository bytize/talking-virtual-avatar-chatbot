const { src, dest, series, parallel } = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var cleanCss = require('gulp-clean-css');
var rev = require('gulp-rev');
var del = require('del');

const clearJs = function () {
  return del([
    'public/dist/js/*.js'
  ]);
};

const clearCss = function () {
  return del([
    'public/dist/css/*.css'
  ]);
};

const packJs = function () {  
  return src(['public/js/jquery.min.js', 
  	'public/js/annyang.min.js', 
  	'public/js/bootstrap.min.js',
  	'public/js/prelodr.min.js',
  	'public/js/VideoFrame.js',
  	'public/js/soundmanager.js',
  	'public/js/siriwave.js',
  	'public/js/script.js'])
    .pipe(concat('bundle.js'))
    .pipe(minify({
        ext:{
            min:'.js'
        },
        noSource: true
    }))
    .pipe(rev())
    .pipe(dest('public/dist/js'))
    .pipe(rev.manifest('public/dist/manifest.json', {
      merge: true
    }));
};

const packCss = function () {  
  return src(['public/css/bootstrap.css', 
  	'public/css/prelodr.min.css',
  	'public/css/style.css'])
    .pipe(concat('stylesheet.css'))
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('public/dist/css'))
    .pipe(rev.manifest('public/dist/manifest.json', {
      merge: true
    }));
};

exports.build = series(clearJs, clearCss, parallel(packCss, packJs));