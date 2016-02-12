var assert = require('assert');
var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var projectDir = path.join(__dirname, '..');
var haml = require(projectDir + '/index');
var destDir = path.join(projectDir, 'tmp');
var fixtureDir = path.join(__dirname, 'fixtures');

describe('basic Haml conversion', function() {
  'use strict';
  var inPath = path.join(fixtureDir, 'basic.haml');

  before(function(done) {
    gulp.src(inPath).
         pipe(haml()).
         pipe(gulp.dest(destDir)).
         on('end', done);
  });

  it('compiles Haml into HTML', function(done) {
    var outPath = path.join(destDir, 'basic.html');
    assert.equal(fs.existsSync(outPath), true,
                 'Expected ' + outPath + ' to exist');
    var outContents = fs.readFileSync(outPath, {encoding: 'utf8'});
    var expected = '<p>Hello world!</p>\n' +
                   '<a href=\'http://example.com\'>Example</a>\n' +
                   '<div ng-include="\'tpl.html\'"></div>\n';
    assert.equal(outContents, expected, 'Haml was not compiled as expected');
    fs.unlink(outPath, done);
  });
});

describe('basic Haml conversion with double quotes', function() {
  'use strict';
  var inPath = path.join(fixtureDir, 'basic.haml');

  before(function(done) {
    gulp.src(inPath).
         pipe(haml({doubleQuote: true})).
         pipe(gulp.dest(destDir)).
         on('end', done);
  });

  it('compiles Haml into HTML with double-quoted attributes', function(done) {
    var outPath = path.join(destDir, 'basic.html');
    assert.equal(fs.existsSync(outPath), true,
                 'Expected ' + outPath + ' to exist');
    var outContents = fs.readFileSync(outPath, {encoding: 'utf8'});
    var expected = '<p>Hello world!</p>\n' +
                   '<a href="http://example.com">Example</a>\n' +
                   '<div ng-include="\'tpl.html\'"></div>\n';
    assert.equal(outContents, expected, 'Haml was not compiled as expected');
    fs.unlink(outPath, done);
  });
});

describe('invalid Haml', function() {
  'use strict';
  var inPath = path.join(fixtureDir, 'invalid.haml');
  var error = null;

  before(function(done) {
    gulp.src(inPath).
         pipe(haml().on('error', function(err) { error = err; })).
         pipe(gulp.dest(destDir)).
         on('end', done);
  });

  it('does not compile invalid Haml into HTML', function(done) {
    var outPath = path.join(destDir, 'invalid.html');
    assert.equal(fs.existsSync(outPath), false,
                 'Expected ' + outPath + ' to not exist');
    done();
  });

  it('does not copy source Haml file into destination dir', function(done) {
    var srcInDest = path.join(destDir, 'invalid.haml');
    assert.equal(fs.existsSync(srcInDest), false,
                 'Expected ' + srcInDest + ' to not exist');
    done();
  });

  it('emits an error', function(done) {
    assert(error.message.indexOf('Syntax error') > -1);
    done();
  });
});

describe('basic Haml with view_helper', function() {
  'use strict';
  var inPath = path.join(fixtureDir, 'view_helper.haml');

  before(function(done) {
    gulp.src(inPath).
         pipe(haml({require: ['./test/view_helper.rb']})).
         pipe(gulp.dest(destDir)).
         on('end', done);
  });

  it('compiles Haml into HTML', function(done) {
    var outPath = path.join(destDir, 'view_helper.html');
    assert.equal(fs.existsSync(outPath), true,
                 'Expected ' + outPath + ' to exist');
    var outContents = fs.readFileSync(outPath, {encoding: 'utf8'});
    var expected = '<p>Hello world!</p>\n' +
                   '<a href=\'http://example.com\'>Example</a>\n' +
                   '<div ng-include="\'tpl.html\'"></div>\n';
    assert.equal(outContents, expected, 'Haml was not compiled as expected');
    fs.unlink(outPath, done);
  });
});


describe('Haml conversion without haml installed', function() {
  'use strict';
  var inPath = path.join(fixtureDir, 'basic.haml');
  var expected = 'gulp-ruby-haml: the haml executable was not found, please ' +
                 'install Haml, e.g., gem install haml';

  it('says to install haml', function(done) {
    var gotError = false;
    gulp.src(inPath).
         pipe(haml({hamlPath: './no-haml-here'}).on('error', function(e) {
           assert(e.message.indexOf(expected) > -1);
           gotError = true;
           done();
         })).
         pipe(gulp.dest(destDir)).
         on('end', function() {
           assert(gotError, 'Should have thrown an error for missing haml');
           done();
         });
  });
});
