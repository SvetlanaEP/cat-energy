import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
//import squoosh from "gulp-libsquoosh";
import webp from 'gulp-webp'
import svgstore from 'gulp-svgstore'
import csso from 'postcss-csso';
import rename from 'gulp-rename';


// Styles

const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// html

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'))
}

// Scripts

const script = () => {
  return gulp.src('source/js/app.js')
    .pipe(terser())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('build/js'))
}


//Images

//const optimizeImages = () => {
 // return gulp.src('source/img/**/*.{jpg,png,svg}')
  //  .pipe(squoosh())
  //  .pipe(gulp.dest('build/img'))
//}


const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
    .pipe(gulp.dest('build/img'))
}

// Webp

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'))
}

// Sprite

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgstore( {
      inLineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'))
}

// Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/img/**/*.svg',
    '!source/img/icons/*.svg',
  ],
    {
      base: 'source'
    })
    .pipe(gulp.dest('build'))
  done()
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html)).on('change', browser.reload);
  gulp.watch('source/**/*.js', gulp.series(script)).on('change', browser.reload);
  gulp.watch('source/img/**/*.*', gulp.series(copyImages)).on('change', browser.reload);
}


export default gulp.series(
  styles, html,  copyImages, copy, createWebp, sprite, script, server, watcher
);

