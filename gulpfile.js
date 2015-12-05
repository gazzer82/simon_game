var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync  = require('browser-sync');

//Compile Jade
gulp.task('html', function(){
	gulp.src(['./src/jade/**/*.jade'])
	.pipe($.jade({pretty: true, doctype: 'html'}))
	.on('error',$.util.log)
	.pipe(gulp.dest('./public'));
});

//Compile SCSS
gulp.task('css', function(){
	gulp.src(['./src/scss/**/*.scss'])
	.pipe($.sass({style: 'expanded'})
	.on('error',$.sass.logError))
	.pipe(gulp.dest('./public/css'));
});

gulp.task('js',function (){
	return gulp
	.src('./src/js/**/*.js')
	.pipe(gulp.dest('./public/js'));
});

gulp.task('watch', function(){
	gulp.watch(['./src/jade/**/*.jade'],['html']);
	gulp.watch(['./src/scss/**/*.scss'],['css']);
	gulp.watch(['./src/js/**/*.scss'],['js']);
});

gulp.task('default', ['html','css','js','watch'],function(){});