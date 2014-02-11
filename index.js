var es = require('event-stream');
var spawn = require('win-spawn');
var gutil = require('gulp-util');
var Buffer = require('buffer').Buffer;
var path = require('path');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-ruby-haml';

module.exports = function (opt) {
  function modifyFile(file) {
    if (file.isNull()) {
      return this.emit('data', file);
    }

    if (file.isStream()) {
      return this.emit('error',
                       new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    var str = file.contents.toString('utf8');
    var dest = gutil.replaceExtension(file.path, ".html");

    var options = {};
    if (opt) {
    }

    var args = ['haml', file.path];
    var cp = spawn(args.shift(), args);

    var self = this;
    cp.on('error', function (err) {
      self.emit('error', new PluginError(PLUGIN_NAME, err));
      return callback();
    });

    var haml_data = '';
    cp.stdout.on('data', function (data) { haml_data += data.toString(); });

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

      file.contents = new Buffer(haml_data);
      file.path = dest;
      self.emit('data', file);
    });

    if (options.sourceMap) {
      sourceMapFile = new gutil.File({
        cwd: file.cwd,
        base: file.base,
        path: dest + '.map',
        contents: new Buffer(data.v3SourceMap)
      });
      this.emit('data', sourceMapFile);
      data = data.js + "\n/*\n//# sourceMappingURL=" + path.basename(sourceMapFile.path) + "\n*/\n";
    }
  }

  return es.through(modifyFile);
};
