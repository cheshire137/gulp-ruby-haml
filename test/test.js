var assert = require('assert');
var gulp = require('gulp');
var fs = require('fs');
var haml = require('../index');
var path = require('path');

var proj_dir = path.join(__dirname, '..');
var dest_dir = path.join(proj_dir, 'tmp');
var fixture_dir = path.join(__dirname, 'fixtures');

describe('basic Haml conversion', function() {
  'use strict';
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
      var out_contents = fs.readFileSync(out_path, {encoding: 'utf8'});
      var expected = '<p>Hello world!</p>\n' +
                     '<a href=\'http://example.com\'>Example</a>\n' +
                     '<div ng-include="\'tpl.html\'"></div>\n';
      assert.equal(out_contents, expected, 'Haml was not compiled as expected');
      fs.unlink(out_path, function() {});
      done();
    });
  });
});

describe('basic Haml conversion with double quotes', function() {
  'use strict';
  var in_path = path.join(fixture_dir, 'basic.haml');

  gulp.task('quoted-haml', function() {
    return gulp.src(in_path).
                pipe(haml({doubleQuote: true})).
                pipe(gulp.dest(dest_dir));
  });

  it('compiles Haml into HTML with double-quoted attributes', function (done) {
    var out_path = path.join(dest_dir, 'basic.html');
    gulp.run('quoted-haml', function() {
      assert.equal(fs.existsSync(out_path), true,
                   'Expected ' + out_path + ' to exist');
      var out_contents = fs.readFileSync(out_path, {encoding: 'utf8'});
      var expected = '<p>Hello world!</p>\n' +
                     '<a href="http://example.com">Example</a>\n' +
                     '<div ng-include="\'tpl.html\'"></div>\n';
      assert.equal(out_contents, expected, 'Haml was not compiled as expected');
      fs.unlink(out_path, function() {});
      done();
    });
  });
});

describe('invalid Haml', function() {
  'use strict';
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

  it('does not copy source Haml file into destination dir', function (done) {
    var src_in_dest = path.join(dest_dir, 'invalid.haml');
    gulp.run('invalid-haml', function() {
      assert.equal(fs.existsSync(src_in_dest), false,
                   'Expected ' + src_in_dest + ' to not exist');
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

describe('basic Haml with view_helper', function() {
  'use strict';
  var in_path = path.join(fixture_dir, 'view_helper.haml');

  gulp.task('view-helper-haml', function() {
    return gulp.src(in_path).
                pipe(haml({require: ['./test/view_helper.rb']})).
                pipe(gulp.dest(dest_dir));
  });

  it('compiles Haml into HTML', function (done) {
    var out_path = path.join(dest_dir, 'view_helper.html');
    gulp.run('view-helper-haml', function() {
      assert.equal(fs.existsSync(out_path), true,
                   'Expected ' + out_path + ' to exist');
      var out_contents = fs.readFileSync(out_path, {encoding: 'utf8'});
      var expected = '<p>Hello world!</p>\n' +
                     '<a href=\'http://example.com\'>Example</a>\n' +
                     '<div ng-include="\'tpl.html\'"></div>\n';
      assert.equal(out_contents, expected, 'Haml was not compiled as expected');
      fs.unlink(out_path, function() {});
      done();
    });
  });
});

