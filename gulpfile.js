var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-ruby-sass');

gulp.task('sass', function () {
    return sass('./assets/scss/site.scss')
        .pipe(gulp.dest('./assets/css'));
});

gulp.task('watch', function() {
    // Watches for changes in style.sass and runs the sass task
    gulp.watch('./assets/scss/site.scss', ['sass'])
});

gulp.task('default', ['sass', 'watch']);