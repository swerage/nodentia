(function() {
	var mongoose        = require('mongoose')
	  , connection      = mongoose.createConnection('mongodb://localhost/nodentia_db')
	  , db              = require('../db/seed_test')['db']
	  , schemas         = require('../db/schemas')["schemas"]
	  , team            = require('../models/team')['team']
	  , category        = require('../models/category')['category']
	  , game            = require('../models/game')['game'];
	
	team.establishDatabaseConnection(connection);
	category.establishDatabaseConnection(connection);
	game.establishDatabaseConnection(connection);
	
	db.clearData(function() {
		db.seedData(false, function() {
			process.exit(1);
		});
	});
}());
