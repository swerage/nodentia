exports.db = (function() {
	var mongoose        = require('mongoose')
	  , schemas         = require('../db/schemas')["schemas"]
	  , team            = require('../models/team')['team']
	  , category        = require('../models/category')['category']
	  , game            = require('../models/game')['game']
	  , createdTeams    = []
	  , createdCategory = {}
	  , clearData
	  , seedData;
	
	clearData = function(callback) {
		var Category = category.getModel()
		  , Team = team.getModel()
		  , Game = game.getModel();
		
		createdTeams = [];
		createdCategory = {};
		
		Category.remove({}, function() {			
			Team.remove({}, function() {
				Game.remove({}, function() {
					callback();	
				});
			});
		});
	};
	
	seedData = function(seedTestData, callback) {
		addTeams(seedTestData, callback);
	};
	
	function addTeams(seedTestData, callback) {
		team.addTeam({ abbr: 'AIK', name: 'Allmänna Idrottsklubben' }, function(t1) {
			team.addTeam({ abbr: 'DIF', name: 'Djurgårdens IF' }, function(t2) {
				team.addTeam({ abbr: 'HIF', name: 'Hammarby IF' }, function(t3) {
					createdTeams.push(t1);
					createdTeams.push(t2);
					
					if (seedTestData) {
						addCategories(callback);
					} else {
						callback();
					}					
				});
			});
		});
	};
	
	function addCategories(callback) {
		category.addCategory({ sport: 'fotboll', league: 'Allsvenskan', division: 'herr', teams: createdTeams, starts: new Date('2012-05-08'), ends: new Date('2012-10-21') }, function(savedCategory) {
			createdCategory = savedCategory;
			
			addGames(callback);
		});
	}
	
	function addGames(callback) {
		game.addGame({ home: createdTeams[0], away: createdTeams[1], homeScore: 3, awayScore: 1, overtimeWin: false, shootoutWin: false, played: new Date('2012-03-01'), season: '2012', category: createdCategory, arena: 'Råsunda' }, function(createdGame) {
			game.addGame({ home: createdTeams[1], away: createdTeams[0], homeScore: 0, awayScore: 0, overtimeWin: false, shootoutWin: false, played: new Date('2014-05-21'), season:  '2012', category: createdCategory, arena: 'Råsunda' }, function() {
				category.getCategoryById(createdCategory._id, function(updatedCategory) {
					callback({ 
						testCategory: updatedCategory
					  , testGame: createdGame 
					  , testTeams: createdTeams
					});
				});
			});				
		});
	}
	
	return {
		clearData: clearData
	  ,	seedData: seedData
	}
}());
