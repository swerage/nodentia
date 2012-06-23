(function() {
	var mongoose = require('mongoose')
	  , connection = mongoose.createConnection('mongodb://localhost/nodentia_db')
	  , schemas = require('../db/schemas')["schemas"]
	  , team = require('../models/team')['team']
	  , category = require('../models/category')['category']
	  , game = require('../models/game')['game']
	  , Team = connection.model('team', schemas.teamSchema)
	  , Category = connection.model('category', schemas.categorySchema)
	  , Game = connection.model('game', schemas.gameSchema)
	  , createdTeams = []
	  , createdCategory = {};
	
	team.establishDatabaseConnection(connection);
	category.establishDatabaseConnection(connection);
	game.establishDatabaseConnection(connection);
	
	(function addTeams() {
		team.getModel().remove({}, function() {
			team.addTeam({ abbr: 'AIK', name: 'Allmänna Idrottsklubben' }, function(t1) {
				team.addTeam({ abbr: 'DIF', name: 'Djurgårdens IF' }, function(t2) {
					team.addTeam({ abbr: 'HIF', name: 'Hammarby IF' }, function(t3) {
						createdTeams.push(t1);
						createdTeams.push(t2);
						addCategories();
					});
				});
			});
		});
	}());
	
	function addCategories() {
		category.getModel().remove({}, function() {
			category.addCategory({ sport: 'fotboll', league: 'Allsvenskan', division: 'herr', route: '/g/fotboll', teams: createdTeams, matchup: 'aikdif', starts: '2012-05-08', ends: '2012-10-21', latestGame: {} }, function(savedCategory) {
				createdCategory = savedCategory;
				addGames();
			});
		});
	}
	
	function addGames() {
		game.getModel().remove({}, function() {
			
			game.addGame({ home: createdTeams[0], away: createdTeams[1], homeScore: 10, awayScore: 0, overtimeWin: false, shootoutWin: false, played: new Date(), season: new Date().getFullYear(), category: createdCategory, arena: 'Råsunda' }, function() {
				process.exit(1);	
			});
		});
	}
}());