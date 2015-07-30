'use strict';
var gulp = require('gulp');
var fs = require('fs');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var plato = require('plato');
var runSequence = require('run-sequence');
var taskListing = require('gulp-task-listing');

var jsHintArgs = JSON.parse(fs.readFileSync('./.jshintrc', 'utf8'));

var src = [
    'src/**/*.js',
    'lib/**/*.js',
    'dbMongoose/*.js',
    'dbSql/*.js'
];

function test(cb) {

    var mochaOpts = {
        reporter: 'nyan'
    };

    var istanbulOptions = {
        includeUntested: true
    };

    function runner() {
        gulp
            .src(['test/**/*.js'])
            .pipe(mocha(mochaOpts))
            .pipe(istanbul.writeReports('./artifacts/coverage'))

        .on('end', cb);
    }

    gulp
        .src(src)
        .pipe(istanbul(istanbulOptions))
        .pipe(istanbul.hookRequire())
        .on('finish', runner);
}



function complexity() {

    var defaultJsHintOpts = {
            strict: true,
            curly: true,
            unused: true,
            undef: true,
            node: true
        },
        complexityArgs = {
            trycatch: true,
            newmi: true
        },
        platoArgs = {
            jshint: jsHintArgs || defaultJsHintOpts,
            complexity: complexityArgs
        };

    function callback() {

    }

    return plato.inspect(src, 'artifacts/complexity', platoArgs, callback);
}

function ci(cb) {
    runSequence('test', 'complexity', cb);
}


gulp
    .task('test', test)
    .task('complexity', complexity)
    .task('default', taskListing)
    .task('ci', ci);