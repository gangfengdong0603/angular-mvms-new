var fs = require('fs');
var join = require('path').join;
var paths = ['partials', 'javascripts', 'stylesheets', 'template', 'images', 'normalize-css'];
var jade = require('jade');
var cheerio = require('cheerio')
var uglifyjs = require('uglify-js');
var cleanCss = require('clean-css');
var _ = require('underscore');
var stylus = require('stylus');

console.log();

// 处理js
fs.readdir('public/javascripts', function(err, files) {
  while(file = files.pop()) {
    (function(file) {
      readFile(join('public/javascripts', file), function(str) {
        createFile(file, str);
      });
    })(file);
  }
});

// 处理style css
stylus(fs.readFileSync('public/stylesheets/style.styl', 'utf8'))
  .render(function(err, css){
    if (err) throw err;
    createFile('stylesheets', 'style.css', css);
  });


// w.css
stylus(fs.readFileSync('public/stylesheets/w.styl', 'utf8'))
  .render(function(err, css){
    if (err) throw err;
    createFile('stylesheets', 'w.css', css);
  });

// 处理index.html
jade.renderFile('views/index.jade', {pretty: true}, function(err, html) {
  createFile('index.html', html);
});

// 处理partials
(handlePartials = function(dir) {
  fs.readdir(join('public/partials', dir || ''), function(err, files) {
    _.each(files, function(file) {
      // 递归目录
      if(/^\w+$/.test(file)) {
        handlePartials(file);
      } else {
        // 如果是jade模板读取模板
        if(/jade$/.test(file)) {
          (function(file) {
            jade.renderFile(join('public/partials', dir || '', file), {pretty: true}, function(err, str) {
              createFile(join('partials', dir || ''), file.replace('jade', 'html'), str);
            });
          })(file);
        } else {
          if(~files.indexOf(file.replace('html', 'jade'))) return;
          (function(file) {
            readFile(join('public/partials', dir || '', file), function(str) {
              createFile(join('partials', dir || ''), file, str);
            });
          })(file);
        }
      }
    });
  });
})();

// 处理template
(handleTemplate = function(dir) {
  fs.readdir(join('public/template', dir || ''), function(err, files) {
    while(file = files.pop()) {
      if(/^\w+$/.test(file)) {
        handleTemplate(file);
      } else {
        (function(file) {
          readFile(join('public/template', dir || '', file), function(str) {
            createFile(join('template', dir || ''), file, str);
          });
        })(file);
      }
    }
  });
})();

// create file
// put file in release dir
function createFile(dir, file, str) {

  // dir not supported
  if(!str) {
    str = file;
    file = dir;
    dir = '';
  }
  fs.createWriteStream(join('release', dir, file), {flags: 'a'}).write(handle(str, file));
}

// read file
function readFile(path, fn) {
  fs.readFile(path, 'utf8', function(err, file) {
    if(err) throw err;
    fn(file);
  });
}

// 替换静态目录
function replaceStaticRoot(str) {
  for(var i = 0; i < paths.length; i++) 
    str = str.replace(new RegExp('\\/?' + paths[i] + '\\/', 'g'), join('/static/mvms', paths[i] + '/'));
  return str;
}

function handle(str, file) {
  console.log('  \033[90m处理 \033[36m%s\033[m', file);
  // 如果是service，设置jsonp为 false
  if('service.js' == file) {
    str = str.replace(/jsonp:(?:\s+)?(true)/, function(match, a) {return match.replace(a, false)});
  }
  // 如果是style.css, 去掉@import
  if('style.css' == file) {
    str = str.replace(/@import\s+url\(.*\)?/g, '');
  }
  // 改变底部js调本, 并页面压缩内嵌js脚本
  if('index.html' == file) {
    //str = str.replace(/load\(\[(.*)\]\)/, function(match, a) {
    str = str.replace(/loads(?:\s+)?=(?:\s+)?\[(.*)\]/, function(match, a) {
      return match.replace(a, '"/javascripts/release.js"')
    });
    var dom = cheerio.load(str);;
    el = dom('script').eq(1);
    el.html(uglifyjs.minify(el.html(), {fromString: true}).code);
    str = dom.html();
  }
  str = replaceStaticRoot(str);
  return str;
}
