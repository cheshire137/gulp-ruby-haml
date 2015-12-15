var spawn = require('win-spawn');
var gutil = require('gulp-util');
var Buffer = require('buffer').Buffer;
var PluginError = gutil.PluginError;
var clone = require('clone');
var through = require('through2');

var PLUGIN_NAME = 'gulp-ruby-haml';

var isArray = function(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

module.exports = function(opt) {
  'use strict';
  function modifyFile(file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME,
                                         'Streaming not supported'));
      return callback(null, file);
    }

    opt = opt || {};
    var options = {};
    for (var key in opt) {
      options[key] = opt[key];
    }
    options.outExtension = options.outExtension || '.html';

    var fileContents = file.contents.toString('utf8');
    var args = ['haml', '-s']; // read from stdin
    if (options.trace) {
      args.push('--trace');
    }
    if (options.unixNewlines) {
      args.push('--unix-newlines');
    }
    if (typeof options.style !== 'undefined') {
      args.push('-t', options.style.toString());
    }
    if (typeof options.format !== 'undefined') {
      args.push('-f', options.format.toString());
    }
    if (options.escapeHtml) {
      args.push('-e');
    }
    if (options.noEscapeAttrs) {
      args.push('--no-escape-attrs');
    }
    if (options.doubleQuote || options.doubleQuoteAttributes) {
      args.push('-q');
    }
    if (options.cdata) {
      args.push('--cdata');
    }
    if (typeof options.autoclose !== 'undefined') {
      var closeList = options.autoclose;
      if (isArray(closeList)) {
        closeList = closeList.join(',');
      }
      args.push('--autoclose', closeList.toString());
    }
    if (typeof options.require !== 'undefined') {
      var requireList = options.require;
      if (!isArray(requireList)) {
        requireList = [requireList];
      }
      for (var i = 0; i < requireList.length; i++) {
        args.push('-r', requireList[i]);
      }
    }
    if (options.suppressEval) {
      args.push('--suppress-eval');
    }
    if (typeof options.loadPath !== 'undefined') {
      args.push('-I', '"' + options.loadPath + '"');
    }
    if (typeof options.encodings !== 'undefined') {
      args.push('-E');
      args.push(options.encodings);
    }

    var cp = spawn(args.shift(), args);

    var self = this;
    cp.on('error', function(err) {
      self.emit('error', new PluginError(PLUGIN_NAME, err));
      return callback(null, file);
    });

    var hamlData = new Buffer(0);
    cp.stdout.on('data', function(data) {
      hamlData = Buffer.concat([hamlData, data]);
    });

    var errors = '';
    cp.stderr.setEncoding('utf8');
    cp.stderr.on('data', function(data) {
      errors += data.toString();
    });

    cp.on('close', function(code) {
      if (errors) {
        self.emit('error', new PluginError(PLUGIN_NAME, errors));
        return callback(null, null);
      }

      if (code > 0) {
        self.emit('error', new PluginError(PLUGIN_NAME,
                                           'Exited with error code ' + code));
        return callback(null, null);
      }

      var newFile = clone(file);
      newFile.path = gutil.replaceExtension(file.path, options.outExtension);
      newFile.contents = new Buffer(hamlData);
      return callback(null, newFile);
    });

    cp.stdin.write(fileContents);
    cp.stdin.end();
  }

  return through.obj(modifyFile);
};
