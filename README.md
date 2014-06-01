# gulp-ruby-haml

This is a [gulp](http://gulpjs.com/) plugin that will use the `haml` command
line script to compile your Haml files into HTML. You need both Ruby and Haml
installed to use this. Try `gem install haml`. If you use
[Bundler](http://bundler.io/), add `gem 'haml'` to your Gemfile and run
`bundle install`.

## Options

### style
Output style. Can be indented (default) or ugly.

`{style: ugly}`


### format
Output format. Can be html5 (default), xhtml, or html4.

`{format: "xhtml"}`


### require

Require additional ruby files. Same as 'ruby -r'.

`{require: "./my_haml_helpers.rb"}`


### escapeHtml

Escape HTML characters (like ampersands and angle brackets) by default.

`{escapeHtml: true}`


### noEscapeAttrs

Don't escape HTML characters (like ampersands and angle brackets) in attributes.

`{noEscapeAttrs: true}`


### doubleQuoteAttributes

Set attribute wrapper to double-quotes (default is single).

`{doubleQuote: true}`


### trace

Show a full traceback on error

`{trace: true}`


### unixNewlines (false)

Use Unix-style newlines in written files.

`{unixNewlines: true}`

### cdata

Always add CDATA sections to javascript and css blocks.

`{cdata: true}`

### autoclose

List of elements to be automatically self-closed.

`{autoclose: ["img", "input", "br", ...]}`

### loadPath

specify $LOAD_PATH directory (may be used more than once). Same as 'ruby -I'.

`{loadPath: "my/load/path"}`

## gulpfile.js example

    var gulp = require('gulp');
    var watch = require('gulp-watch');
    var haml = require('gulp-ruby-haml');

    // Compile Haml into HTML
    gulp.task('haml', function() {
      gulp.src('./app/assets/haml/**/*.haml', {read: false}).
           pipe(haml()).
           pipe(gulp.dest('./public'));
    });

    // Compile Haml into HTML with double quotes around attributes
    // Same as haml -q
    gulp.task('haml-double-quote', function() {
      gulp.src('./app/assets/haml/**/*.haml', {read: false}).
           pipe(haml({doubleQuote: true})).
           pipe(gulp.dest('./public'));
    });

    // Watch for changes in Haml files
    gulp.task('haml-watch', function() {
      gulp.src('./app/assets/haml/**/*.haml', {read: false}).
           pipe(watch()).
           pipe(haml()).
           pipe(gulp.dest('./public'));
    });

## Thanks

This largely came from [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass) by Sindre Sorhus.
