var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    replace = require('gulp-replace'),
    rev = require('gulp-rev'),
    through = require('through2'),
    fs = require('fs'),
    revCollector = require('gulp-rev-collector'),
    // ts = require('gulp-typescript'),
    browserSync = require("browser-sync"),
    gulpsync = require('gulp-sync')(gulp);

var __path = '',//如果多个项目可以修改这里

    configUrl='';

//将类style-b47bb72002.css修改为style.css?v=b47bb72002
function fixHash() {
    return through.obj(function(file, enc, cb) {
        let reg = new RegExp('(.*)-([0-9a-z]+).([a-z]+)');
        let settings = JSON.parse(file.contents.toString());
        Object.keys(settings).forEach((key) => {
            settings[key] = settings[key].replace(reg, '$1.$3?v=$2');
        });
        file.contents = new Buffer(JSON.stringify(settings).toString());
        return cb(null, file);
    });
}

// html
gulp.task('html', function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    return gulp.src('src/' + __path + '*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/' + __path))
        .pipe(notify({ message: 'html task complete' }));
})

// 样式
gulp.task('scss', function() {
    gulp.src(['src/' + __path + 'css/*.scss'])
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer('last 10 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        // .pipe(gulp.dest('src/' + __path + 'css'))
        // .pipe(rev())
        .pipe(minifycss())
        .pipe(gulp.dest('dist/' + __path + 'css'))
        // .pipe(rev.manifest())
        // .pipe(gulp.dest('src/'+__path+'rev/css'))

    /* 不用添加版本号的scss */
    // gulp.src(['src/'+__path+'scss/hero_detail.scss','src/'+__path+'scss/reset.scss'])
    // 	.pipe(sass({ style: 'expanded' }))
    // 	.pipe(autoprefixer('last 10 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    // 	.pipe(gulp.dest('src/'+__path+'css'))
    // 	.pipe(minifycss())
    // 	.pipe(gulp.dest('dist/'+__path+'css'))
});

// gulp.task('ts', function () {
// 	gulp.src(['src/' + __path + 'ts/**/*.ts'])
// 		.pipe(ts({
// 			noImplicitAny: true,
// 		}))
// 		.pipe(gulp.dest('src/' + __path + 'js'))
// })

// 公共文件复制
gulp.task('public',function(){
    gulp.src('src/public/**')
    .pipe(gulp.dest('dist/public'))
})

// 字体复制
gulp.task('font',function(){
    gulp.src('src/font/**')
    .pipe(gulp.dest('dist/font'))
})

// 脚本
gulp.task('js', function() {
    gulp.src(['src/' + __path + 'js/**/*.*', '!src/' + __path + 'js/common/*.js', '!src/' + __path + 'js/page/*.js'])
        // .pipe(uglify())
        .pipe(gulp.dest('dist/' + __path + 'js'))
    gulp.src(['src/' + __path + 'js/common/config.js'])
        .pipe(uglify())
        .pipe(replace('baseUrl:"js"', 'baseUrl:"'+configUrl+'js"'))   //打包绝对路径定义
    
        .pipe(gulp.dest('dist/' + __path + 'js/common'))
        // 给page目录下的js添加版本号
    gulp.src(['src/' + __path + 'js/page/*.js'])
        // .pipe(rev())
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('dist/' + __path + 'js/page'))
        // .pipe(rev.manifest())
        // .pipe(gulp.dest('src/'+__path+'rev/js/page'))
    gulp.src(['src/' + __path + 'js/common/*.js', '!src/' + __path + 'js/common/config.js'])
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('dist/' + __path + 'js/common'))
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(fixHash())
        .pipe(gulp.dest('src/' + __path + 'rev/js/common'))
})


// 图片
gulp.task('img', function() {
    return gulp.src('src/' + __path + 'images/**')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('dist/' + __path + 'images'))
});


// 清理
gulp.task('clean', function() {
    return gulp.src('dist')
        .pipe(clean())
})



// 版本
// gulp.task('rev', function() {
//     // gulp.src(['src/'+__path+'rev/**/*.json', 'dist/'+__path+'*.html'])
//     // 	.pipe(revCollector())
//     //        .pipe(gulp.dest('dist/'+__path))

//     gulp.src(['dist/' + __path + 'js/**/*.js'])
//         // .pipe(revCollector())
//         .pipe(replaceHash('src/' + __path + 'rev/js/common/rev-manifest.json'))
//         .pipe(gulp.dest('dist/' + __path + 'js'))
// })

//将html中的js/css的引用添加hash值
function replaceHash(filename) {
    let settings = JSON.parse(fs.readFileSync(filename));
    // fs.unlink(filename);
    return through.obj(function(file, enc, cb) {
        let str = file.contents.toString();
        Object.keys(settings).forEach(function(key) {
            str = str.replace(key, settings[key]);
        });
        file.contents = new Buffer(str);
        return cb(null, file);
    });
}


//开发环境
gulp.task('development', function () {
    function scssSolve(pathname) {
      var sass = require('node-sass');
      var str = '';
      if (pathname.match(/css/)) {
        var path = 'src' + pathname.replace(/\.css/, '.scss');
        str = sass.renderSync({
          file: path
        }).css.toString();
        return str;
      } else {
        console.log('不符合预期');
      }
    }
  
    browserSync.init({
      server: {
        baseDir: './src'
      },
      middleware: function (req, res, next) {
        var pathname = require("url").parse(req.url).pathname;
        if (pathname.match(/\.css/)) {
          var str = scssSolve(pathname);
          if (str) {
            res.end(str);
          }
        }
        next();
      }
    });
  
    gulp.watch('src/*.html').on('change', function () {
      browserSync.reload('*.html');
    });
    gulp.watch('src/css/**/*.scss').on('change', function () {
      browserSync.reload('*.css');
    });
    gulp.watch('src/js/**/*.js').on('change', function () {
      browserSync.reload('*.js');
    });
    browserSync.reload();
  
  });

// 生产环境
// gulp.task('build', gulpsync.sync(['clean', ['html', 'scss', 'js', 'img','public']]),function(){
//     console.log('编译打包完成');
// })

//生产环境
gulp.task('build', ['clean'], function () {
    // configUrl = '//wx.mop.com/v2/';//生产环境
    gulp.start(['html', 'scss', 'js', 'img','public'], function () {
      console.log('编译打包完成');
    });
  });
  
  //测试环境
  gulp.task('test', ['clean'], function () {
    // configUrl = '//wx.mop.com/v2/';//生产环境
    gulp.start(['html', 'scss', 'js', 'img','public'], function () {
        console.log('编译打包完成');
      });
  });
  