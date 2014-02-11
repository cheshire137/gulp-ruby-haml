'use strict';
var assert = require('assert');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var haml = require('../index');
var es = require('event-stream');
var path = require('path');

var createFile = function (file_path, contents) {
  var base = path.dirname(file_path);
  return new gutil.File({
    path: file_path,
    base: base,
    cwd: path.dirname(base),
    contents: contents
  });
};

afterEach(function() {
  fs.unlink('test/fixture.html', function (err) {
  });
});

it('compiles Haml to HTML', function (done) {
  var fixture_path = 'test/fixture.haml';
  var contents = new Buffer(fs.readFileSync(fixture_path));
  var expected = "<p>Hello world!</p>\n<a href='http://example.com'>Example</a>\n<div ng-include=\"'tpl.html'\"></div>\n";
  haml().on('error', done).
         on('data', function(newFile) {
           assert.equal(newFile.path, 'test/fixture.html');
           assert.equal(newFile.relative, path.basename('test/fixture.html'));
           fs.stat(newFile.path, function (err, stat) {
             assert.equal(err, null, 'HTML file ' + newFile.path +
                                     ' was not written');
           });
           var actual = String(fs.readFileSync(newFile.path));
           assert.equal(actual, expected)
           done();
         }).
         write(createFile(fixture_path, contents));
});
