// Include gulp
var gulp = require('gulp');

// Include plugins
var gutil = require('gulp-util');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var del = require('del');

gulp.task('sass', function () {
    return sass('./assets/scss/*.scss')
        .pipe(gulp.dest('./assets/css'));
});

gulp.task('concat-css', ['sass'], function() {
    return gulp.src([
            'assets/css/site.css',
            'assets/css/state-page.css',
            'assets/css/fight-page.css'
        ])
        .pipe(concat('site.css'))
        .pipe(gulp.dest('assets/css'));
});

gulp.task('clean', ['concat-css'], function() {
    return del([
        'assets/css/state-page.css',
        'assets/css/fight-page.css'
    ]);
});

gulp.task('watch', function() {
    // Watches for scss file changes
    gulp.watch('./assets/scss/*.scss', ['clean'])
});

gulp.task('default', ['clean']);