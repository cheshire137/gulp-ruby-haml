'use strict';
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var spawn = require('win-spawn');
var tempWrite = require('temp-write');
var dargs = require('dargs');
var which = require('which');

module.exports = function (options) {
  options = options || {};
  var passedArgs = dargs(options, ['bundleExec']);
  var bundleExec = options.bundleExec;

  try {
    which.sync('haml');
  } catch (err) {
    throw new gutil.PluginError('gulp-ruby-haml',
                                'You need to have Ruby and Haml installed ' +
                                'and in your PATH for this task to work. ' +
                                'Try gem install haml.');
  }

  return through.obj(function (file, enc, cb) {
    var self = this;

    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error',
                new gutil.PluginError('gulp-ruby-haml',
                                      'Streaming not supported'));
      return cb();
    }

    var outExtension = passedArgs.outExtension || '.html';
    var dest = gutil.replaceExtension(file.path, outExtension);

    tempWrite(file.contents, path.basename(file.path), function (err, tempFile) {
      if (err) {
        self.emit('error', new gutil.PluginError('gulp-ruby-haml', err));
        self.push(file);
        return cb();
      }

      var args = ['haml', tempFile].concat(passedArgs);

      if (bundleExec) {
        args.unshift('bundle', 'exec');
      }

      var cp = spawn(args.shift(), args);

      cp.on('error', function (err) {
        self.emit('error', new gutil.PluginError('gulp-ruby-haml', err));
        self.push(file);
        return cb();
      });

      var haml_data = '';
      cp.stdout.on('data', function (data) { haml_data += data.toString(); });

      var errors = '';
      cp.stderr.setEncoding('utf8');
      cp.stderr.on('data', function (data) { errors += data; });

      cp.on('close', function (code) {
        if (errors) {
          self.emit('error', new gutil.PluginError('gulp-ruby-haml', '\n' + errors.replace(tempFile, file.path).
                   replace('Use --trace for backtrace.\n', '')));
          self.push(file);
          return cb();
        }

        if (code > 0) {
          self.emit('error', new gutil.PluginError('gulp-ruby-haml',
                                                   'Exited with error code ' +
                                                   code));
          self.push(file);
          return cb();
        }

        if (err) {
          self.emit('error', new gutil.PluginError('gulp-ruby-haml', err));
          self.push(file);
          return cb();
        }

        file.contents = new Buffer(haml_data);
        file.path = dest;
        self.emit('data', file);

        return cb();
      });
    });
  });
};
