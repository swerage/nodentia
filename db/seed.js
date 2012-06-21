(function() {
	var mongoose = require('mongoose')
	  , connection = mongoose.createConnection('mongodb://localhost/nodentia_db')
	  , schemas = require('../db/schemas')["schemas"]
	  , team = require('../models/team')['team']
	  , Team = connection.model('team', schemas.teamSchema);
	
	team.establishDatabaseConnection(connection);
	
	(function addTeams() {
		team.getModel().remove({}, function() {
			team.addTeam({ abbr: 'AIK', name: 'Allmänna Idrottsklubben' }, function() {
				team.addTeam({ abbr: 'DIF', name: 'Djurgårdens IF' }, function() {
					team.addTeam({ abbr: 'HIF', name: 'Hammarby IF' }, function() {
						process.exit(1);
					});
				});
			});
		});
	}());
}());