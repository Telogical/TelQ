'use strict';
var gulp = require('gulp');
// var {task, } = require('gulp');
// var fs = import('fs');
var {readFileSync} = require('fs');
var istanbul = require('gulp-istanbul');
var mocha = import('gulp-mocha');

var jsHintArgs = JSON.parse(readFileSync('./.jshintrc', 'utf8'));

var src = [
    'src/**/*.js',
    'lib/**/*.js',
    'dbMongoose/*.js',
    'dbSql/*.js'
];

function test(cb) {
    var mochaPromise = import('gulp-mocha'); // Use dynamic import for ES modules

    mochaPromise.then((mocha) => {
        var mochaOpts = {
            reporter: 'nyan'
        };

        var istanbul = require('gulp-istanbul');

        var istanbulOptions = {
            includeUntested: true
        };

        function runner() {
            gulp.src(['test/**/*.js'])
                .pipe(mocha.default(mochaOpts)) // Use mocha.default as a function here
                .pipe(istanbul.writeReports('./artifacts/coverage'))
                .on('end', function() {
                    console.log('Test task has finished successfully.');
                    cb(); // Call the callback function to indicate task completion
                });
        }

        gulp.src(src)
            .pipe(istanbul(istanbulOptions))
            .pipe(istanbul.hookRequire())
            .on('finish', runner);
    });
}


function ci(cb) {
    gulp.series(test, function(done) {
        console.log('ci task has finished successfully.');
        done();
        cb();
    })();
}


    gulp.task('test', test)
    gulp.task('ci', ci);