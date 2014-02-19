# gulp-ruby-haml

This is a [gulp](http://gulpjs.com/) plugin that will use the `haml` command
line script to compile your Haml files into HTML. You need both Ruby and Haml
installed to use this. Try `gem install haml`. If you use
[Bundler](http://bundler.io/), add `gem 'haml'` to your Gemfile and run
`bundle install`.

## Options

Pass `{doubleQuote: true}` to use `"` around HTML attributes instead of `'`.
This uses the `-q`/`--double-quote-attributes` option with `haml`.

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
