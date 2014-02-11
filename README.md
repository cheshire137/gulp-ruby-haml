# gulp-ruby-haml

This is a [gulp](http://gulpjs.com/) plugin that will use the `haml` command line script to compile your Haml files into HTML. You need both Ruby and Haml installed to use this. Try `gem install haml` or add `gem 'haml'` to your Gemfile.

## gulpfile.js example

    // Compile Haml into HTML
    gulp.task('haml', function() {
      gulp.src('./haml/**/*.haml', {read: false}).
           pipe(watch()).
           pipe(haml()).
           pipe(gulp.dest('./public'));
    });

## Thanks

This largely came from [gulp-ruby-sass](https://github.com/sindresorhus/gulp-ruby-sass) by Sindre Sorhus.
