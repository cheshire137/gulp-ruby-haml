'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var haml = require('./index');

it('compiles Haml into HTML', function (cb) {
  var stream = haml({trace: true});

  stream.on('data', function (file) {
    assert.equal(file.relative, 'fixture.html');
    assert.equal(
      file.contents.toString(),
      "<p>Hello world!</p>\n<a href='http://example.com'>Example</a>\n<div ng-include=\"'tpl.html'\"></div>\n"
    );
  });

  stream.on('end', cb);

  stream.write(new gutil.File({
    path: 'fixture.haml',
    contents: new Buffer("%p Hello world!\n%a{href: 'http://example.com'} Example\n%div{ng: {include: \"'tpl.html'\"}}")
  }));

  stream.end();
});
