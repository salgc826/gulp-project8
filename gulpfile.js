'use strict';

//set up dependencies
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var maps = require('gulp-sourcemaps');
var del = require('del');
var minifyStyles = require('gulp-clean-css');
var minifyImages = require('gulp-imagemin');
var browserSync = require('browser-sync');
var connect = require("gulp-connect");

//concatanate js files and map them. Saves file in js directory
gulp.task("concat", function() {
    return gulp.src([
            'js/global.js',
            'js/circle/autogrow.js',
            'js/circle/circle.js'
        ])
        .pipe(maps.init())
        .pipe(concat('app.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest("js"));
});

//depends on concat to run first. Then takes created js file and minifies. Saves it to dist folder.
gulp.task("scripts", ["concat"], function() {
    return gulp.src("js/app.js")
        .pipe(uglify())
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest('dist/scripts'));

});

//compiles sass into css. Maps it. Saves it in the css directory
gulp.task("compileCss", function() {
    return gulp.src('sass/global.scss')
        .pipe(maps.init())
        .pipe(sass())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('css'))
        .on("end", browserSync.reload);
});

//Depends on the compileCss to finish first. Takes that file and minimizes it and saves it to dist folder.
gulp.task('styles', ['compileCss'], function() {
    return gulp.src('css/global.css')
        .pipe(minifyStyles())
        .pipe(rename('all.min.css'))
        .pipe(gulp.dest('dist/styles'));
});

//task for minifying images. Saves them in dist folder.
gulp.task('images', function() {
    gulp.src('./images/*')
        .pipe(minifyImages(
            [
                minifyImages.jpegtran({ progressive: true }),
                minifyImages.optipng({ optimizationLevel: 5 })
            ]
        ))
        .pipe(gulp.dest('dist/content'))
});


//deletes files created from previous build
gulp.task('clean', function() {
    del(['dist', 'css/global.css*', 'js/app*.js*', 'js/all.min.js', 'all.min.css']);
});

//build can be called without starting the server
gulp.task('build', ['clean', 'styles', 'scripts', 'images'], function() {
    return gulp.src(['css/global.css', 'js/all.min.js', 'css/all.min.css', 'index.html', 'images/**', 'icons/**'], { base: './' })
        .pipe(gulp.dest('dist'));
});

//use gulp command to build and start the server, which also watches for changes
gulp.task("default", ['build'], function() {
    browserSync.init({ server: { baseDir: "./" } });
    gulp.watch("sass/*", ["styles"])

    connect.server({ port: 3000 });
});
