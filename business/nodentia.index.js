var databaseUrl = 'nodentia_db'
  , collections = ['teams', 'categories', 'games']
  , db = require('mongojs').connect(databaseUrl, collections)
  , formatter = require('../business/nodentia.formatter')
  , _ = require('../libs/underscore.js');

exports.deleteTeamFromCategory = function(categoryId, teamAbbr, callback) {
	db.categories.update({ _id : db.ObjectId(categoryId) }, {$pull : { "teams" : { "abbr": teamAbbr } } });
	callback(true);
};

exports.getAdminData = function(callback) {
	var result = {};
	
	db.categories.find(function(err, categories){
		result.categories = categories;
		
		db.teams.find(function(err, teams){
			result.teams = teams;
			
			db.games.find(function(err, games){
				result.games = games;
				
				callback(err, result);
			})
		});
	})
};

exports.getDivisions = function(callback) {
	db.categories.distinct("division", function(err, divisions){
		callback(divisions);
	});
};
	
exports.getGameById = function(id, callback) {
	db.games.findOne({ _id: db.ObjectId(id) }, function(err, game){
		callback(game);
	});
};
	
exports.getIndexData = function(callback) {
	db.categories.find(function(err, categories) {
		var viewModel = formatter.getCategoryViewModel(categories);						
		callback(err, viewModel);
	});
};
	
exports.getLeagues = function(callback) {
	db.categories.distinct("league", function(err, leagues){			
		callback(leagues);
	});
};
	
exports.getShowData = function(sport, division, callback) {
	var criteria = { "category.sport": sport, "category.division": division };
	
	if (!criteria["category.division"]) {
		criteria["category.division"] = 'herr';
	}

	db.games.findOne(criteria, function(err, game){
		
		if (!game){
			callback(err, null);
		} else {
			game.styleClass = !!game.winner ? game.winner.toLowerCase() : game.home.toLowerCase() + game.away.toLowerCase();
			game.title = game.winner;

			callback(err, game);
		}	
	});
};
	
exports.getCategories = function(callback) {
	db.categories.find(function(err, categories){
		callback(categories);
	});
};
	
exports.getCategory = function(id, callback) {
	db.categories.findOne({ _id: db.ObjectId(id) }, function(err, category){
		callback(category);
	});
};
	
exports.getSports = function(callback) {
	db.categories.distinct("sport", function(err, sports){
		callback(sports);
	});
};
	
exports.getTeams = function(callback) {
	db.teams.find(function(err, teams) {
		callback(teams);
	});
};

exports.getTeamsNotIn = function(existingTeams, callback) {
	db.teams.find(function(err, teams){
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
	
	game._id = game._id ? { _id:  db.ObjectId(game._id) } : null;
	
	db.games.update(game._id, { $set : data }, { upsert: true }, function(err) {
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
	});
}
