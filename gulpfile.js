var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync  = require('browser-sync');
var reload = browserSync.reload;

//Compile Jade
gulp.task('html', function(){
	return gulp.src(['./src/jade/**/*.jade'])
		.pipe($.jade({pretty: true, doctype: 'html'}))
		.on('error',$.util.log)
		.pipe(gulp.dest('./public'))
		.pipe(browserSync.stream());
});

//Compile SCSS
gulp.task('css', function(){
	return gulp.src(['./src/scss/**/*.scss'])
		.pipe($.sass({style: 'expanded'})
		.on('error',$.sass.logError))
		.pipe(gulp.dest('./public/css'))
		.pipe(browserSync.stream());
});

gulp.task('js',function (){
	return gulp
	.src('./src/js/**/*.js')
	.pipe(gulp.dest('./public/js'))
	.pipe(browserSync.stream());
});

gulp.task('images', function(){
	return gulp
	.src('./src/images/**/*.{png,gif,jpg}')
	.pipe(gulp.dest('./public/images'))
	.pipe(browserSync.stream());
});

gulp.task('serve', function(){
	browserSync({
		server: {
			baseDir: 'public'
		}
	});
});

gulp.task('watch', function(){
	gulp.watch(['./src/jade/**/*.jade'],['html'],reload);
	gulp.watch(['./src/scss/**/*.scss'],['css'],reload);
	gulp.watch(['./src/js/**/*.js'],['js'],reload);
	gulp.watch(['./src/images/**/*.*'],['images'],reload);
});

gulp.task('default', ['html','css','js','images','watch','serve'],function(){});