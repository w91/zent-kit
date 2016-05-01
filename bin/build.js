#!/usr/bin/env node
var path = require('path');
var webpack = require('webpack');
var named = require('vinyl-named');
var gulp = require('gulp');
var symlink = require('gulp-sym');
var runSequence = require('run-sequence');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var logger = console.log.bind(console);

var projectPath = process.cwd();    // 执行命令所在目录

var paths = {
  webpack: path.resolve(__dirname, '../webpack.conf.js'),   // webpack
  index: path.resolve(__dirname, '../manuel/index.jsx'),  // index源文件
  tmp: path.resolve(__dirname, '../.tmp'),    // 拷贝临时目录
  examples: path.resolve(projectPath, './examples')  // 需要监听的examples文件
};

gulp.task('index', function() {
    return gulp.src(paths.index)
        .pipe(gulp.dest(paths.tmp));
});

// 部分情况下不清楚链接会发生错误
gulp.task('clean', function() {
    logger('------->   Clean  old examples');

    return gulp.src(paths.tmp + '/examples', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('examples', function() {
    logger('------->    Read  new examples');
    return gulp.src(paths.examples)
        .pipe(symlink(paths.tmp + '/examples', {force: true}));
});

var webpackConfig = require(paths.webpack)(path.join(paths.tmp, 'index.jsx'), path.join(paths.tmp, 'build'));
gulp.task('webpack', function(callback) {
    webpack(webpackConfig, function(err, stats) {
        gutil.log('[webpack]', stats.toString({}));
    })
});

runSequence(['index', 'clean', 'examples'], 'webpack');
