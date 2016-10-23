var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');

gulp.task('styles', function() {
  gulp.src('css/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css/'))
    .pipe(connect.reload());
});

gulp.task('html', function () {
  gulp.src('./*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch('css/*.scss', ['styles']);
  gulp.watch(['./*.html'], ['html']);
});

gulp.task('connect', function() {
  connect.server({
    root: 'app',
    livereload: true,
    port: 3000,
    root: './'
  });
});

gulp.task('default', ['connect', 'watch']);