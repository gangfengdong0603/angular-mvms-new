
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user') , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , jade = require('jade');

var app = express();

// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(function(req, res, next) {
  if(/.*html/.test(req.url)) {
    if(/template\//.test(req.url)) return next();
    jade.renderFile(__dirname + '/public' + req.url.replace('html', 'jade'), {pretty: true}, function(err, html) {
      var file = fs.createWriteStream(__dirname + '/public' + req.url);
      file.write(html, function() {
        next();
      });
    });
  } else next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'data')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/channelManage', routes.index);
app.get('/columnManage/:cateCode', routes.index);
app.get('/content/:id', routes.index);
app.get('/others/:other', routes.index);
app.get('/appManage/:am', routes.index);

app.post('/cms/upload.do', function(req, res) {
  res.json(['http://img2.bdstatic.com/img/image/60358ee3d6d55fbb2fbc874c7de4e4a20a44723dc9b.jpg']);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
