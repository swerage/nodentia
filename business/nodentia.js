var mongoose = require('mongoose')
  , formatter = require('../business/formatter')
  , _ = require('../libs/underscore.js')
  , connection = mongoose.createConnection('mongodb://localhost/nodentia_db')
  , category = require('../models/category')['category']
  , game = require('../models/game')['game']
  , team = require('../models/team')['team'];

game.establishDatabaseConnection(connection);
team.establishDatabaseConnection(connection);
category.establishDatabaseConnection(connection);

exports.deleteGame = function(gameId, callback) {
	game.removeGame({ _id: gameId }, function() {
		callback();
	});
};

exports.deleteTeamFromCategory = function(categoryId, teamId, callback) {
	category.removeTeamFromCategory(function() {
		callback();
	});
};

exports.getAdminViewModel = function(callback) {
	
	category.getAllCategories(function(categories) {
		team.getAllTeams(function(teams) {
			game.getAllGames(function(games) {
				
				var result = {
					categories: categories
				  , teams: teams
				  , games: games
				};
				
				callback(result);
			});
		});
	});
};

exports.getEditCategoryViewModel = function(categoryId, callback) {

	category.getAllSports(function(sports) {
		category.getAllLeagues(function(leagues) {
			category.getAllDivisions(function(divisions) {
				
				var vm = {
					sports: sports
				  , leagues: leagues
				  , divisions: divisions
				  , category: {}
				};
				
				if (!!categoryId) {
					category.getCategoryById(categoryId, function(fetchedCategory) {
						vm.category = fetchedCategory;						
						callback(vm);
					});
				} else {
					callback(vm);
				}
			});
		});
	});
};

exports.getEditGameViewModel = function(gameId, callback) {
	team.getAllTeams(function(teams) {
		category.getAllCategories(function(categories) {		
			var vm = {
				teams: teams
			  ,	categories: categories
			  , game: {}
			};
			
			if (!!gameId) {
				game.getGame(gameId, function(gameToEdit) {
					vm.dateString = formatter.getDateString(gameToEdit.played);
					vm.timeString = formatter.getTimeString(gameToEdit.played);
					vm.game = gameToEdit;
					
					callback(vm);
				});
			} else {
				callback(vm);
			}
		});
	});
};

exports.getDivisions = function(callback) {
	category.getAllDivisions(function(divisions) {
		callback(divisions);
	});
};
	
exports.getGame = function(id, callback) {
	game.getGame(id, function(game) {
		callback(game);
	});
};
	
exports.getIndexViewModel = function(callback) {
	category.getAllCategories(function(categories) {
		var viewModel = formatter.getCategoryViewModel(categories);						
		callback(viewModel);
	});
};
	
exports.getLeagues = function(callback) {
	category.getAllLeagues(function(leagues) {
		callback(leagues);
	});
};
	
exports.getShowViewModel = function(route, callback) {
	
	category.getCategoryByRoute(route, function(gameCategory) {	
		game.getGame(gameCategory.latestGame._id, function(fetchedGame) {
			if (!fetchedGame) {
				callback(null);
			} else {		
				category.getCategoryById(fetchedGame.category, function(fetchedCategory) {
					fetchedGame.styleClass = !!fetchedGame.winner[0] ? fetchedGame.winner[0].abbr.toLowerCase() : fetchedGame.home[0].abbr.toLowerCase() + fetchedGame.away[0].abbr.toLowerCase();
					
					callback(fetchedGame, fetchedCategory);
				});
			}
		});
	});
};
	
exports.getCategories = function(callback) {
	category.getAllCategories(function(categories) {
		callback(categories);
	});
};
	
exports.getCategory = function(id, callback) {
	category.getCategory(id, function(category){
		callback(category);
	});
};
	
exports.getSports = function(callback) {
	category.getAllSports(function(sports) {
		callback(sports);
	});
};

exports.getTeams = function(callback) {
	team.getAllTeams(function(teams){
		callback(teams);
	});
};

exports.saveCategory = function(editedCategory, callback) {
	category.saveCategory(editedCategory, function() { 
		callback();
	});
};
	
exports.saveGame = function(gameToSave, callback) {
	game.saveGame(gameToSave, function() { 
		callback();
	});
};