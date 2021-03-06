/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , config = require('./config');

function authorize(username, password) {
    return config.username === username & config.password === password;
}

var app = module.exports = express.createServer();

//Auth

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jqtpl');
  app.register(".html", require("jqtpl").express);
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express['static'](__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});


//Routes - Queries

app.get('/', routes.index);

app.get('/g/:sport', routes.show);
app.get('/g/:sport/:division', routes.show);

app.get('/admin/game/edit', routes.editGame);
app.get('/admin/category/edit', routes.editCategory);
app.get('/admin/teamrow/create', routes.addTeamRow);
app.get('/admin', express.basicAuth(authorize), routes.admin);
app.get('/about', routes.about);

//Routes - Commands

app.post('/admin/game/save', routes.saveGame);
app.post('/admin/game/delete', routes.deleteGame);
app.post('/admin/category/save', routes.saveCategory);
app.post('/admin/season/save', routes.saveSeason);
app.post('/admin/teamrow/delete', routes.deleteTeamRow);

//Start up

app.listen(8000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
