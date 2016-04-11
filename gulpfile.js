// Include gulp
var gulp = require('gulp');

// Include plugins
var gutil = require('gulp-util');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');

gulp.task('sass', function () {
    return sass('./assets/scss/*.scss')
        .pipe(gulp.dest('./assets/css'));
});

// Concatenate CSS Files
gulp.task('concat-css', ['sass'], function() {
    return gulp.src([
            'assets/css/site.css',
            'assets/css/state-page.css',
            'assets/css/fight-page.css'
        ])
        .pipe(concat('site.css'))
        .pipe(gulp.dest('assets/css'));
});

gulp.task('watch', function() {
    // Watches for changes in sass/ and runs the sass task
    gulp.watch('./assets/scss/*.scss', ['sass', 'concat-css'])
});

gulp.task('default', ['concat-css']);