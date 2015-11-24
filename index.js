var spawn = require('win-spawn');
var gutil = require('gulp-util');
var Buffer = require('buffer').Buffer;
var PluginError = gutil.PluginError;
var clone = require('clone');
var through = require('through2');

var PLUGIN_NAME = 'gulp-ruby-haml';

var isArray = function(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]"
}

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
    //Clone 'opt' into options
    for(var key in opt) { options[key] = opt[key]; }
    options.outExtension = options.outExtension || '.html';
    options.doubleQuote = options.doubleQuote || false;
    options.encodings = options.encodings || false;
    options.require = options.require || false;

    var fileContents = file.contents.toString('utf8');
    var args = ['haml'];

    if (options.trace)
      args.push('--trace');

    if (options.unixNewlines)
      args.push('--unix-newlines');

    if (options.style != null)
      args.push('-t', options.style.toString());

    if (options.format != null)
      args.push('-f', options.format.toString());

    if (options.escapeHtml)
      args.push('-e');

    if (options.noEscapeAttrs)
      args.push('--no-escape-attrs')

    args.push('-s');

    if (options.doubleQuote || options.doubleQuoteAttributes)
      args.push('-q');

    if (options.cdata)
      args.push('--cdata');

    if (options.autoclose != null) {
      var list = options.autoclose;
      if(isArray(list))
        list = list.join(",");
      args.push('--autoclose', list.toString());
    }

    if (options.require != null)
      args.push('-r', '"' + options.require + '"');

    if(options.suppressEval)
      args.push('--suppress-eval');

    if(options.loadPath != null)
      args.push('-I', '"' + options.loadPath + '"');

    if (options.encodings) {
      args.push('-E');
      args.push(options.encodings);
    }
    if (options.require) {
      args.push('-r');
      args.push(options.require);
    }

    var cp = spawn(args.shift(), args);

    var self = this;
    cp.on('error', function(err) {
      self.emit('error', new PluginError(PLUGIN_NAME, err));
      return callback(null, file);
    });

    var hamlData = '';
    cp.stdout.on('data', function(data) { hamlData += data.toString(); });

    var errors = '';
    cp.stderr.setEncoding('utf8');
    cp.stderr.on('data', function(data) { errors += data.toString(); });

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
