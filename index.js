var spawn = require('win-spawn');
var gutil = require('gulp-util');
var Buffer = require('buffer').Buffer;
var path = require('path');
var through = require('through2');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-ruby-haml';

module.exports = function (opt) {
  function modifyFile(file, enc, callback) {
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      this.emit('error',
                new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      return callback();
    }

    opt = opt || {};
    var options = {};
    options.outExtension = opt.outExtension || '.html';

    var str = file.contents.toString('utf8');
    var destination = gutil.replaceExtension(file.path, options.outExtension);

    var args = ['haml', file.path, destination];
    var cp = spawn(args.shift(), args);

    var self = this;
    cp.on('error', function (err) {
      self.emit('error', new PluginError(PLUGIN_NAME, err));
      return callback();
    });

    var errors = '';
    cp.stderr.setEncoding('utf8');
    cp.stderr.on('data', function (data) { errors += data.toString(); });

    cp.on('close', function (code) {
      if (errors) {
        self.emit('error', new PluginError(PLUGIN_NAME, errors));
        self.push(file);
        return callback();
      }

      if (code > 0) {
        self.emit('error', new PluginError(PLUGIN_NAME,
                                           'Exited with error code ' + code));
        self.push(file);
        return callback();
      }

      file.path = destination;
      self.emit('data', file);
      return callback();
    });
  }

  return through.obj(modifyFile);
};
