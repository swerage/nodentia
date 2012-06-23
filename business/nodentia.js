var mongoose = require('mongoose')
  , formatter = require('../business/nodentia.formatter')
  , _ = require('../libs/underscore.js')
  , connection = mongoose.createConnection('mongodb://localhost/nodentia_db')
  , category = require('../models/category')['category']
  , game = require('../models/game')['game']
  , team = require('../models/team')['team'];

game.establishDatabaseConnection(connection);
team.establishDatabaseConnection(connection);
category.establishDatabaseConnection(connection);

exports.deleteTeamFromCategory = function(categoryId, teamId, callback) {
	category.removeTeamFromCategory(function() {
		callback();
	});
};

exports.getAdminViewModel = function(callback) {
	var result;
	
	category.getAllCategories(function(categories) {
		team.getAllTeams(function(teams) {
			game.getAllGames(function(games) {
				
				result = {
					categories: categories
				  , teams: teams
				  , games: games
				};
				
				callback(result);
			});
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
		console.error(gameCategory);
		game.getGame(gameCategory.latestGame._id, function(fetchedGame) {
			if (!fetchedGame) {
				callback(null);
			} else {
				fetchedGame.styleClass = !!fetchedGame.winner ? fetchedGame.winner.toLowerCase() : fetchedGame.home.toLowerCase() + fetchedGame.away.toLowerCase();
				fetchedGame.title = game.winner.name;
				callback(game);
			}
		});
	});
};
	
exports.getCategories = function(callback) {
	db.categories.find(function(err, categories){
		callback(categories);
	});
};
	
exports.getCategory = function(id, callback) {
	category.getCategory(id, function(category){
		callback(category);
	});
};
	
exports.getSports = function(callback) {
	db.categories.distinct("sport", function(err, sports){
		callback(sports);
	});
};

exports.getTeams = function(callback) {
	team.getAll(function(teams){
		callback(teams);
	});
};

exports.saveCategory = function(category, callback) {
	var id;
	
	category.latestGame = category.latestGame || {};
	category.matchup = _.map(category.teams, function(el) { return el.abbr.toLowerCase(); }).join(''); 
	
	if (!!category._id) {
		id = category._id;
		delete category._id;
		
		db.categories.update({_id: db.ObjectId(id) }, { $set : category }, function(err) {
			callback(!err);
		});
	} else {
		db.categories.insert(category, function(err) {
			callback(!err);
		});
	}
};
	
exports.saveGame = function(game, callback) {
	var result;

	if (game.homeScore !== game.awayScore) {
		game.winner = game.homeScore > game.awayScore ? game.home : game.away;
	} else {
		game.winner = '';
	}
	
	if (+game.categoryId !== -1) {
		exports.getCategory(game.categoryId, function(category) {
			game.category = category;
			saveGameInDB(game, callback);
		});
	} else {
		saveGameInDB(game, callback);
	}
};

function saveGameInDB(game, callback) {
	var data;
	
	data = {
	    home: game.home
	  , away: game.away
	  , homeScore: game.homeScore
	  , awayScore: game.awayScore
	  , winner: game.winner
	  , overtimeWin: (+game.overtimeWin === 1)
	  , shootoutWin: (+game.shootoutWin === 1)
	  , played: game.played
	  , season: game.season
	  , category: game.category
	  , arena: game.arena					
	};
	
	if (!!game._id) {
		db.games.update({ _id:  db.ObjectId(game._id) }, { $set : data }, { upsert: true }, function(err) { 
			saveGameCallback(err, data, callback); 
		});
	} else {
		db.games.insert(data, function(err) { 
			saveGameCallback(err, data, callback);
		});
	}
}

function saveGameCallback(err, data, callback) {
	if (!err) {
		
		exports.getCategory(data.category._id.toString(), function(category) {
			var dirty = false
			  , categoryId;
							
			if (!category.latestGame.played || category.latestGame.played < data.played) {
				category.latestGame = data;
				dirty = true;
			}
			
			if (!category.starts || category.starts > data.played) {
				category.starts = data.played;
				dirty = true;
			} 
			
			if (dirty) {
				categoryId = category._id.toString()
				delete category._id;
				
				db.categories.update({ _id: db.ObjectId(categoryId) }, { $set: category });
			}
		});
	}
	callback(!err);
}
