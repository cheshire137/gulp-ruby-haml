'use strict';
var assert = require('assert');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var haml = require('../index');
var path = require('path');

var proj_dir = path.join(__dirname, '..');
var dest_dir = path.join(proj_dir, 'tmp');
var fixture_dir = path.join(__dirname, 'fixtures');

describe('basic Haml conversion', function() {
  var in_path = path.join(fixture_dir, 'basic.haml');

  gulp.task('basic-haml', function() {
    return gulp.src(in_path).
                pipe(haml()).
                pipe(gulp.dest(dest_dir));
  });

  it('compiles Haml into HTML', function (done) {
    var out_path = path.join(dest_dir, 'basic.html');
    gulp.run('basic-haml', function() {
      assert.equal(fs.existsSync(out_path), true,
                   'Expected ' + out_path + ' to exist');
      var out_contents = fs.readFileSync(out_path);
      var expected = "<p>Hello world!</p>\n" +
                     "<a href='http://example.com'>Example</a>\n" +
                     "<div ng-include=\"'tpl.html'\"></div>\n";
      assert.equal(out_contents, expected, 'Haml was not compiled as expected');
      fs.unlink(out_path, function (err) {});
      done();
    });
  });
});

describe('it throws error on invalid Haml', function() {
  var in_path = path.join(fixture_dir, 'invalid.haml');
  var error = null;

  gulp.task('invalid-haml', function() {
    return gulp.src(in_path).
                pipe(haml().on('error', function (err) { error = err; })).
                pipe(gulp.dest(dest_dir));
  });

  it('does not compile invalid Haml into HTML', function (done) {
    var out_path = path.join(dest_dir, 'invalid.html');
    gulp.run('invalid-haml', function() {
      assert.equal(fs.existsSync(out_path), false,
                   'Expected ' + out_path + ' to not exist');
      done();
    });
  });

  it('emits an error', function (done) {
    gulp.run('invalid-haml', function() {
      assert(error.message.indexOf('Syntax error') > -1);
      done();
    });
  });
});
