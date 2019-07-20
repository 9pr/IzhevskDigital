'use strict';

const gulp = require('gulp');
const debug = require('gulp-debug');
const plugins = require('gulp-load-plugins')();
const del = require('del');
const watch = require('gulp-watch');
const include = require('gulp-include');
const sass = require('gulp-sass');
const prefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
//const sourcemaps   = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const imageminWebp = require('imagemin-webp');
const pngquant = require('imagemin-pngquant');
const svgo = require('gulp-svgo');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const nunjucksRender = require('gulp-nunjucks-render');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
//const plumber      = require('gulp-plumber');
//const notify       = require('gulp-notify');


/* Конфиг */
var CONFIG = {
    output: 'public', /* Корневая папка сайта */
    input: '.distr/', /* Корневая папка дистрибутива */
    pages: '.distr/pages', /* Структура сайта в дистрибутиве */
    templates: '.distr/templates', /* Шаблоны сайта в дистрибутиве */
    blocks: '.distr/blocks' /* Блоки сайта в дистрибутиве */
};


/* Задачи */

/* Задача для запуска browserSync, используя в качестве прокси PHP-сервер на порту 8001 */
gulp.task('browserSync', function() {
    console.log('* Запуск browserSync *');

    browserSync.init({
        //proxy: '127.0.0.1:' + CONFIG.proxyPortPhp,
        open: false,
        reloadOnRestart: true,
        injectChanges: true
        //port: CONFIG.proxyPortBs
    });
});

/* Задача для очистки конечной сборки (удаляется всё в CONFIG.output) */
gulp.task('clean', function () {
    console.log('* Удаление предыдущей сборки *');

    return del(['**', '!' + CONFIG.input + '**'], {force: true, cwd: CONFIG.output});
});


/* Задача для картинок */
gulp.task('images', function () {
    console.log('* Копирование картинок *');
    return gulp.src(['**/img/**/*.*', '!**/img/**/*.ps*'], {cwd: CONFIG.blocks})
    //.pipe( plugins.rev() )
    .pipe(svgo())
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        use: [
            pngquant(),
            imageminWebp({quality: 50})
        ]
    }))

    .pipe(rename(function (path) {
        path.dirname = path.dirname.replace('\\img', ''); /* Замена пути к картинкам для конечного пути: block/img/*.* -> img/block/*.* */
    }))
    .pipe(gulp.dest(CONFIG.output + '/img/blocks/'))
    ;
});


/* Задача для конвертирования графики в формат webp */
gulp.task('images:webp', function () {
    console.log('* Копирование картинок webp *');

    return gulp.src(['**/img/**/*.*', '!**/img/**/*.ps*'], {cwd: CONFIG.blocks})
        .pipe(webp({
            method: 4,
            quality: 50,
            lossless: true
        }))
        .pipe( plugins.rename(function (path) {
            path.dirname = path.dirname.replace('\\img', '');
        }) )
        .pipe(gulp.dest(CONFIG.output + '/img/blocks/'))
        ;
});


/* Задача для JS */
gulp.task('scripts', function () {
    console.log('* Копирование скриптов *');

    return gulp.src('**/*.js', {cwd: CONFIG.pages})
        .pipe(include({
            extensions: "js",
            includePaths: [
                CONFIG.blocks,
                __dirname + '/node_modules'
            ]
        }))
        //.pipe( plugins.rev() )
        .pipe(uglify())
        .pipe(gulp.dest(CONFIG.output))
        ;
});


/* Задача для CSS */
gulp.task('styles:css', function () {
    console.log('* Копирование стилей *');

    return gulp.src('**/*.scss', {cwd: CONFIG.pages})
        .pipe(include({
            extensions: "css",
            includePaths: [
                __dirname + '/node_modules'
            ]
        }))
        .pipe(plugins.sass({
            includePaths: [CONFIG.blocks],
            indentType: 'tab',
            indentWidth: 1,
            outputStyle: 'compressed'
        }))
        .pipe(plugins.autoprefixer({
            browsers: ['last 10 versions']
        }))
        //.pipe( plugins.rev() )
        .pipe(gulp.dest(CONFIG.output))
        ;
});


/* Задача для рендеринга шаблонов Nunjucks */
gulp.task('nunjucks', ['styles:css', 'scripts'], function () {
    console.log('* Рендеринг шаблонов (Nunjucks) *');

    return gulp.src('**/*.php', {cwd: CONFIG.pages})
        .pipe(nunjucksRender({
            path: [CONFIG.templates, CONFIG.blocks],
            inheritExtension: true,
            throwOnUndefined: true
        }))
        .pipe(gulp.dest(CONFIG.output))
        ;
});


/* Задача для копирования остальных файлов */
gulp.task('other.pages', ['nunjucks'], function () {
    console.log('* Копирование остальных файлов *');

    return gulp.src(['**/**', '!**/*.{php,scss}'], {cwd: CONFIG.pages})
        .pipe(gulp.dest(CONFIG.output))
        ;
});


// /* Задача для замены имён файлов в HTML и CSS */
gulp.task('revreplace', ['nunjucks'], function (callback) {

    console.log('* Замена имён файлов *');

    let
        manifestCss = gulp.src('manifest/css.json'),
        manifestImages = gulp.src('manifest/images.json'),
        manifestJs = gulp.src('manifest/js.json')
    ;

    return gulp.src(['**/*.php', '**/*.css'], {cwd: CONFIG.output})
        .pipe(plugins.revReplace({
            replaceInExtensions: ['.php', '.css'],
            manifest: manifestCss
        }))
        .pipe(plugins.revReplace({
            replaceInExtensions: ['.php', '.css'],
            manifest: manifestImages
        }))
        .pipe(plugins.revReplace({
            replaceInExtensions: ['.php'],
            manifest: manifestJs
        }))
        .pipe(plugins.debug({title: 'revReplace + manifest'}))
        .pipe(gulp.dest(CONFIG.output))
        ;
});


/* Задача для слежения за измениями в исходных файлах */
gulp.task('watch', function () {
    /* Копирование, когда изменились картинки  */
    gulp.watch('**/img/*.{jpg,png,gif,svg,webp}', {cwd: CONFIG.blocks}, ['images']);

    gulp.watch('**/img/*.{jpg,png,gif}', {cwd: CONFIG.blocks}, ['images, images:webp']);

    /* Пересборка CSS, когда изменились стили  */
    gulp.watch('**/*.scss', {cwd: CONFIG.input}, ['styles:css']);

    /* Пересборка JS, когда изменились скрипты  */
    gulp.watch('**/*.js', {cwd: CONFIG.input}, ['scripts']);

    /* Пересборка HTML, когда изменились страницы, шаблоны или блоки */
    //gulp.watch('**/*.php', {cwd: CONFIG.input}, ['nunjucks', 'revreplace']);

    /* Обработка остальных файлов */
    gulp.watch('**/*.*', {cwd: CONFIG.pages}, ['other.pages']);

    /* Перезагрузка браузера, когда что-то изменилось в сборке */
    //gulp.watch(['**/*.*', '!.distr/**'], {cwd: CONFIG.output}).on('change', browserSync.reload);
});


/* Задача для конечной сборки (для prod) */
gulp.task('build', function () {
    runSequence.options.ignoreUndefinedTasks = true;

    return runSequence(
        'clean',
        ['styles:css', 'scripts', 'other.pages'],
        'nunjucks',
        'images:webp',
        'images'
        //'revreplace'
    );
});


/* Задача по умолчанию (для dev) */
gulp.task('default', function () {
    return runSequence(
        'build',
        //'browserSync',
        'watch'
    );
});
