var gulp = require('gulp'),
	sass = require('gulp-sass'),
	plumber = require('gulp-plumber'),
	autoprefixer = require('gulp-autoprefixer'),
	rigger = require('gulp-rigger'),
	browserSync = require('browser-sync').create(),
	babel = require('gulp-babel'),
	uglify = require('gulp-uglify'),
	runSequence = require('run-sequence'),
	tinypng = require('gulp-tinypng');
	del = require('del'),
	browserify = require('browserify'),
	buffer = require('vinyl-buffer'),
	babelify = require('babelify'),
	source = require('vinyl-source-stream'),
	gutil = require('gulp-util'),
	chalk = require('chalk');

function error(err) {

	if (err.fileName) {

		gutil.log(chalk.red(err.name)
		+ ': '
		+ chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
		+ ': '
		+ 'Line '
		+ chalk.magenta(err.lineNumber)
		+ ' & '
		+ 'Column '
		+ chalk.magenta(err.columnNumber || err.column)
		+ ': '
		+ chalk.blue(err.description))

	} else {

		gutil.log(chalk.red(err.name)
		+ ': '
		+ chalk.yellow(err.message))
	}

	this.emit('end')

}

gulp.task('clean', function(){
	return del(['build']);
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: './build',
			directory: true
		},
		open: true,
		browser: 'google chrome',
		port: 3000,
		files: [ './build/**/*.*' ]
	});
});

gulp.task('image', () =>
	gulp.src('./src/img/*.*')
		.pipe(plumber())
		.pipe(gulp.dest('./build/img'))
);

gulp.task('imageProd', () =>
	gulp.src(['./src/img/*.png', './src/img/*.jpeg', './src/img/*.jpg'])
		.pipe(plumber())
		.pipe(tinypng('qo8K-ctRnzbtw3tuMxEQ7ONvX0nm50mS'))
		.pipe(gulp.dest('./build/img'))
);

gulp.task('svg', () =>
	gulp.src('./src/img/**/*.svg')
		.pipe(plumber())
		.pipe(gulp.dest('./build/img'))
);

gulp.task('media', function () {
	gulp.src('./src/media/**/*.*')
		.pipe(gulp.dest('./build/media/'))
});

gulp.task('html', function () {
	gulp.src('./src/*.html')
		.pipe(plumber())
		.pipe(rigger())
		.pipe(gulp.dest('./build/'))	
});

gulp.task('css', function () {
	gulp.src('./src/styles/*.css')
		.pipe(plumber())
		.pipe(autoprefixer('> 1%', 'last 5 versions', 'Firefox < 20', 'ie 8', 'ie 9'))		
		.pipe(gulp.dest('./build/styles/'))
});

gulp.task('sass', function () {
	gulp.src('./src/styles/app.sass')
		.pipe(plumber())		
		.pipe(sass())
		.pipe(autoprefixer('> 1%', 'last 5 versions', 'Firefox < 20', 'ie 8', 'ie 9'))	
		.pipe(gulp.dest('./build/styles/'))	
});

gulp.task('js', function () {
	var bundler = browserify('./src/js/app.js', { debug: true }).transform( babelify, { presets: [ 'es2015' ] } );

	return bundler.bundle()
		.on('error', error)
		.pipe(source('build.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./build/js'))
});

gulp.task('jsProd', function () {
	var bundler = browserify('./src/js/app.js', { debug: false }).transform( babelify, { presets: [ 'es2015' ] } );

	return bundler.bundle()
		.on('error', error)
		.pipe(plumber())
		.pipe(source('build.js'))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest('./build/js'))
});

gulp.task('jsLibs', function () {
	gulp.src('./src/js/libs/*.js')
		.pipe(plumber())
		.pipe(gulp.dest('./build/js/libs/'))
});

gulp.task('static', function () {
  gulp.src('./src/static/**')
    .pipe(plumber())
    .pipe(gulp.dest('./build/'))
});

gulp.task('watch', function () {
	gulp.watch('./src/**/*.html', ['html'])

	gulp.watch('./src/styles/*.css', ['css'])
	gulp.watch('./src/styles/*.sass', ['sass'])
	
	gulp.watch('./src/js/*.js', ['js'])
	gulp.watch('./src/js/libs/*.js', ['jsLibs'])
	
	gulp.watch('./src/img/*.*', ['image'])
	gulp.watch('./src/img/*.svg', ['svg'])
});

gulp.task('prod', function(callback) {
	runSequence(
		'clean',
		[
			'media',
			'imageProd',
			'svg',
			'html',
			'css',
			'sass',
			'jsProd',
			'jsLibs',
			'static',
		],
		callback
	);
});

gulp.task('default', function(callback) {
	runSequence(
		'clean',
		[
			'media',
			'image',
			'html',
			'svg',
			'css',
			'sass',
			'js',
			'jsLibs'
		],
		'watch',
		'browserSync',
		callback
	);
});