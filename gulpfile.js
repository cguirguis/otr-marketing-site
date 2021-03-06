// Include gulp
var gulp = require('gulp');

// Include plugins
var gutil = require('gulp-util');
var sass = require('gulp-ruby-sass');
var concat = require('gulp-concat');
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant'); // $ npm i -D imagemin-pngquant
var uglify   = require('gulp-uglify');
var replace = require('gulp-replace-task');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var connect = require('gulp-connect-multi')();
var rename = require('gulp-rename');
var preprocess = require('gulp-preprocess');
var argv = require('yargs').argv;

gulp.task('minify-sass', function () {
    return sass('./assets/scss/*.scss')
        .pipe(concat('all-scss-otr.min.css'))
        .pipe(cleanCSS({debug: true, compatibility: 'ie8'}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(gulp.dest('build/assets/css'));
});


gulp.task('minify-css', ['minify-sass'], function() {
    return gulp.src('assets/css/**/*.css')
        .pipe(concat('all-otr.min.css'))
        .pipe(cleanCSS({debug: true, compatibility: 'ie8'}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
        .pipe(gulp.dest('build/assets/css'))
        .pipe(connect.reload());
});

gulp.task('minify-js', function() {
    return gulp.src(['app/**/*.js', 'js/bioep.min.js', '!app/app-config/config.js'])
        .pipe(concat('all-otr.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/assets/js'))
        .pipe(connect.reload());
});

gulp.task('compress-img', function() {
    return gulp.src('assets/img/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/assets/img'));
});

gulp.task('replace-vars', function() {
    gulp.src('index.html')
        .pipe(replace({
            patterns: [
                {
                    match: 'base-build',
                    replacement: 'assets'
                }
            ]
        }))
        .pipe(preprocess({context: { IS_PROD: argv.prod ? true : false}})) // see @if or @ifdef statements
        .pipe(gulp.dest('build'));

    var domain = {
        domainName: 'DEVO',
        endpoint: 'https://otr-backend-service-us-devo.offtherecord.com'
    }

    if(argv.prod) {
        domain.domainName = 'PROD'
        domain.endpoint = 'https://otr-backend-service-us-prod.offtherecord.com'
    }

    return gulp.src('app/app-config/config.js')
        .pipe(replace({
            patterns: [
                {
                    match: 'domain-name',
                    replacement: domain.domainName
                },
                {
                    match: 'endpoint',
                    replacement: domain.endpoint
                }
            ]
        }))
        .pipe(uglify())
        .pipe(rename('config.min.js'))
        .pipe(gulp.dest('build/assets/js'));
});

/********************************************
 * This will install all the dependencies in
 * your bower.json file to bower_components/
 * ******************************************/
gulp.task('bower', function() {
    var install = require("gulp-install");
    var installPipe = install();

    return gulp.src(['./bower.json'])
        .pipe(installPipe);

});

gulp.task('install-dep', function() {
    runSequence('bower', 'copy-src');
});

gulp.task('copy-src', function() {
    var bower =
        gulp.src('./bower_components/**/*')
            .pipe(gulp.dest('./build/bower_components/'));

    var app =
        gulp.src('./app/**/*')
            .pipe(gulp.dest('./build/app/'));

    var robotsFile = argv.prod ? 'crawler/prod/robots.txt' : 'crawler/devo/robots.txt';

    var seoFiles =
        gulp.src([robotsFile, 'sitemap.txt'])
            .pipe(gulp.dest('./build/'));

    return merge(bower, app, seoFiles);
});

gulp.task('concat-css', function() {
    return gulp.src(['build/assets/css/all-otr.min.css', 'build/assets/css/all-scss-otr.min.css'])
        .pipe(concat('all-stylesheets.min.css'))
        .pipe(gulp.dest('build/assets/css'));
});

gulp.task('connect', connect.server({
        root: ['build'],
        port: 8888,
        livereload: false,
        open: {
            browser: 'Google Chrome' // if not working OS X browser: 'Google Chrome'
        }
    })
);

gulp.task('watch', function() {
    gulp.watch(['assets/scss/**/*.scss'], ['minify-sass']);
    gulp.watch(['app/**/*.js','js/bioep.min.js'], ['minify-js']);
});

gulp.task('build', ['install-dep', 'minify-css', 'minify-js', 'compress-img', 'replace-vars'], function() {
    runSequence('concat-css');
});

gulp.task('server', function() {
    runSequence('build', 'connect', 'watch');
});

gulp.task('clean', function() {
    return del(['build']);
});

gulp.task('default', ['clean']);