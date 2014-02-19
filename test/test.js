'use strict';
var assert = require('assert');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var haml = require('../index');
var path = require('path');

var in_path = path.join(__dirname, './fixture.haml');
var out_path = path.join(__dirname, './fixture.html');

gulp.task('haml', function() {
  return gulp.src(in_path).
              pipe(haml()).
              pipe(gulp.dest(__dirname));
});

it('compiles Haml into HTML', function (done) {
  gulp.run('haml', function() {
    assert.equal(fs.existsSync(out_path), true,
                 'Expected ' + out_path + ' to exist');
    var out_contents = fs.readFileSync(out_path);
    var expected = "<p>Hello world!</p>\n" +
                   "<a href='http://example.com'>Example</a>\n" +
                   "<div ng-include=\"'tpl.html'\"></div>\n";
    assert.equal(out_contents, expected, 'Haml was not compiled as expected');
    done();
  });
});

afterEach(function() {
  if (fs.readFileSync(out_path)) {
    fs.unlink(out_path, function (err) {});
  }
});
