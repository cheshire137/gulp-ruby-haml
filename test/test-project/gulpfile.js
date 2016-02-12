var gulp = require('gulp');
var watch = require('gulp-watch');
var haml = require('gulp-ruby-haml');

gulp.task('default', function() {
  gulp.src('../fixtures/*.haml', {read: false}).
       pipe(watch()).
       pipe(haml()).
       pipe(gulp.dest('./'));
});
