exports.category = (function() {
	var addCategory, addTeamToCategory, Category, removeGameFromCategory, establishDatabaseConnection, eventEmitter, eventHandling,
		getAllCategories, getAllDivisions, getAllLeagues, getAllSports, getCategoryById, getCategoryByRoute, getModel,
		removeTeamFromCategory, saveCategory, updateLatestGame, updateNextGame, _;
	
	eventHandling = require('../business/eventHandling')['eventHandling'];
	eventEmitter = eventHandling.getEventEmitter();
	_ = require('../libs/underscore');
	
	addCategory = function(props, callback) {
		var category = new Category();
		
		category.sport      = props.sport;
		category.league     = props.league;
		category.division   = props.division;
		category.starts     = props.starts;
		category.ends       = props.ends;
		category.latestGame = props.latestGame;
		category.teams      = props.teams;
		category.matchup    = getMatchupFromTeams(category.teams);
		category.route      = getRouteFromSportAndDivision(category.sport, category.division);
		
		category.save(function(e, savedCategory) {
			callback(savedCategory);
		});
	};
	
	addTeamToCategory = function(category, team, callback) {
		category.teams.push(team);
		category.matchup = getMatchupFromTeams(category.teams);
		
		category.save(function() {
			callback();
		});
	};
	
	establishDatabaseConnection = function(connection) {
		var mongoose               = require('mongoose')
			, schemas                = require('../db/schemas')["schemas"]
			, categorySchema         = schemas.categorySchema
			, gameSchema             = schemas.gameSchema;
		
		Category = connection.model('Category', categorySchema);
		mongoose.model('Game', gameSchema);
	};
	
	getAllCategories = function(callback) {
		Category.find({}).populate('latestGame').exec(function(err, categories) {
			callback(categories);
		});
	};
		
	getAllDivisions = function(callback) {
		Category.find({}, 'division', function (e, divisions){
			var uniqueResults = _.uniq(_.pluck(divisions, 'division')); //todo: super lame but mongoose distinct just didnt work, why?
			callback(uniqueResults);
		});
	};
	
	getAllLeagues = function(callback) {
		Category.find({}, 'league', function(e, leagues) {
			var uniqueResults = _.uniq(_.pluck(leagues, 'league'));
			callback(uniqueResults);
		});
	};
	
	getAllSports = function(callback) {
		Category.find({}, 'sport', function(e, sports) {
			var uniqueResults = _.uniq(_.pluck(sports, 'sport'));
			callback(uniqueResults);
		});
	};
	
	getCategoryById = function(id, callback) {
		Category.findOne({ _id: id }).populate('latestGame').populate('nextGame').exec(function(err, category) {
			callback(category);
		});
	};
	
	getCategoryByRoute = function(route, callback) {
		Category.findOne({ route: route }).populate('latestGame').exec(function(err, category) {
			callback(category);
		});
	};
	
	getModel = function() {
		return Category;
	};
	
	removeGameFromCategory = function(gameId, callback) {
		Category.update({ latestGame: gameId }, { latestGame: null }, null, function() {
			Category.update({ nextGame: gameId }, { nextGame: null }, null, function() {
				if (!!callback) {
					callback();
				}
			});
		});
	};
	
	removeTeamFromCategory = function(category, team, callback) {
		category.teams = _.without(category.teams, team);
		category.matchup = getMatchupFromTeams(category.teams);
		
		category.save(function() {
			callback();
		});
	};
	
	saveCategory = function(category, callback) {

		getCategoryById(category._id, function(existingCategory) {
			if (!!existingCategory) {
				existingCategory.sport      = category.sport;
				existingCategory.league     = category.league;
				existingCategory.division   = category.division;
				existingCategory.route      = category.route;
				existingCategory.starts     = category.starts;
				existingCategory.ends       = category.ends;
				existingCategory.latestGame = category.latestGame;
				existingCategory.teams      = category.teams;
				existingCategory.matchup    = getMatchupFromTeams(category.teams);
				existingCategory.route      = getRouteFromSportAndDivision(category.sport, category.division);
				
				existingCategory.save(function(e, savedCategory) {
					callback(savedCategory);
				});
			} else {
				addCategory(category, callback);
			}
		});
	};
	
	updateLatestGame = function(params, callback) {
		getCategoryById(params.game.category, function(category) {
			var savedGameIsLatestGame = !!category.latestGame && category.latestGame._id.toString() === params.game._id.toString()
				, savedGameIsNewerThanCurrentLatestGame =  !category.latestGame || category.latestGame.played < params.game.played;
			
			if (savedGameIsLatestGame) {
				updateExistingCategoryGame(category, category.latestGame, params.game, function(updatedCategory) {
					callback(updatedCategory);
				});
			} else if (savedGameIsNewerThanCurrentLatestGame) {
				category.latestGame = params.game;
				
				category.save(function(e, updatedCategory) {
					getCategoryById(updatedCategory._id, callback);
				});
			} else {
				callback(category);
			}
		});
	};
	
	updateNextGame = function(params, callback) {
		getCategoryById(params.game.category, function(category) {
			var savedGameIsNextGame = !!category.nextGame && category.nextGame._id.toString() === params.game._id.toString()
				, savedGameIsCloserToNowThanCurrentNextGame = !category.nextGame || category.nextGame.played > params.game.played;
			
			if (savedGameIsNextGame) {
				updateExistingCategoryGame(category, category.nextGame, params.game, function(updatedCategory) {
					callback(updatedCategory);
				});
			} else if (savedGameIsCloserToNowThanCurrentNextGame) {
				category.nextGame = params.game;

				category.save(function(e, updatedCategory) {
					getCategoryById(updatedCategory._id, callback);
				});
			} else {
				callback(category);
			}
		});
	};
	
	function getMatchupFromTeams(teams) {
		return _.pluck(teams, 'abbr').join('').toLowerCase();
	}
	
	function getRouteFromSportAndDivision(sport, division) {
		var route = '/g/' + sport.replace(/\s/g, '').toLowerCase();
		return !!division && division.toLowerCase() !== 'herr' ? route + '/' + division.toLowerCase() : route;
	}
	
	function removeLatestGameFromCategory(gameId, callback) {
		Category.findOne({ 'latestGame': gameId }, function (e, category) {
			if (!!category) {
				category.latestGame = null;
				saveCategory(category, function(savedCategory) {
					callback(savedCategory);
				});
			} else {
				callback();
			}
		});
	}
	
	function removeNextGameFromCategory(gameId, callback) {
		Category.findOne({ 'nextGame': gameId }, function (e, category) {
			if (!!category) {
				category.nextGame = null;
				saveCategory(category, function(savedCategory) {
					callback(savedCategory);
				});
			} else {
				callback();
			}
		});
	}
	
	function updateExistingCategoryGame(category, categoryGame, savedGame, callback) {
		categoryGame.played			= savedGame.played;
		categoryGame.homeScore	= savedGame.homeScore;
		categoryGame.awayScore	= savedGame.awayScore;

		if (+categoryGame.homeScore !== +categoryGame.awayScore) {
			categoryGame.winner = categoryGame.homeScore > categoryGame.awayScore ? categoryGame.home : categoryGame.away;
		} else {
			categoryGame.winner = [];
		}

		category.save(function(e, updatedCategory) {
			callback(updatedCategory);
		});
	}
	
	eventEmitter.on('gameWasRemoved', function(params) {
		removeGameFromCategory(params.gameId, params.callback);
	});

	eventEmitter.on('gameWasSaved', function(params) {
		var gameHasBeenPlayed = params.game.played <= new Date();

		if (gameHasBeenPlayed) {
			updateLatestGame(params, params.callback);
		} else {
			updateNextGame(params, params.callback);
		}
	});
	
	return {
		addCategory: addCategory
	,	addTeamToCategory: addTeamToCategory
	,	establishDatabaseConnection: establishDatabaseConnection
	, getAllCategories: getAllCategories
	, getAllDivisions: getAllDivisions
	, getAllLeagues: getAllLeagues
	, getAllSports: getAllSports
	,	getCategoryById: getCategoryById
	, getCategoryByRoute: getCategoryByRoute
	, getModel: getModel
	, getRouteFromSportAndDivision: getRouteFromSportAndDivision
	, removeGameFromCategory: removeGameFromCategory
	, removeTeamFromCategory: removeTeamFromCategory
	, saveCategory: saveCategory
	, updateLatestGame: updateLatestGame
	, updateNextGame: updateNextGame
	};
}());