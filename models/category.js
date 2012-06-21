exports.category = (function() {
	var addCategory, addTeamToCategory, Category, checkLatestGame, establishDatabaseConnection, eventEmitter, eventHandling, 
	getCategory, getAllDivisions, getModel, mongoose, removeTeamFromCategory, updateLatestGame, _;
	
	eventHandling = require('../business/eventHandling')['eventHandling'];
	eventEmitter = eventHandling.getEventEmitter();
	_ = require('../libs/underscore');
	
	addCategory = function(props, callback) {
		var category = new Category();
		
		category.sport = props.sport; 
		category.league = props.league;
		category.division = props.division;
		category.link = props.link;
		category.starts = props.starts;
		category.ends = props.ends;
		category.latestGame = props.latestGame;
		category.teams = props.teams;
		
		category.matchup = getMatchupFromTeams(category.teams);
		
		category.save(function(e, savedCategory) {
			callback(savedCategory);
		});
	};
	
	addTeamToCategory = function(category, team, callback) {

		category.teams.push(team);
		category.matchup = getMatchupFromTeams(category.teams);
		category.save(function() {
			callback();
		})
	};
	
	checkLatestGame = function(gameId, callback) {
		Category.findOne({ 'latestGame._id': gameId }, function (e, category) {
			
			if (!!category && !!category.save) {
				category.latestGame = null;
				category.save(function(e, savedCategory) {
					eventEmitter.emit('latestGameWasClearedForCategory', savedCategory._id);
					
					if (!!callback) {
						callback(savedCategory);
					}
				});
			} else {
				if (!!callback) {
					callback(category);
				}
			}
		});
	};
	
	establishDatabaseConnection = function(connection) {
		var schema = require('../db/schemas')["schemas"].categorySchema;
		Category = connection.model('category', schema);
	};
	
	getAllDivisions = function(callback) {
		Category.find({ }, 'division', function (e, divisions){
			var _ = require('../libs/underscore')
			  , uniqueResults = _.uniq(_.pluck(divisions, 'division')); //todo: super lame but mongoose distinct just didnt work, why?
			
			callback(uniqueResults);
		});
	};
	
	getCategory = function(id, callback) {
		Category.findOne({ _id: id }, function(err, category) {
			callback(category);
		});
	};
	
	getModel = function() {
		return Category;
	};
	
	removeTeamFromCategory = function(category, team, callback) {
		
		category.teams = _.without(category.teams, team);				
		category.matchup = getMatchupFromTeams(category.teams);
		category.save(function() {
			callback();
		});
	};
	
	updateLatestGame = function(params, callback) {
		getCategory(params.categoryId, function(category) {
			
			if (!!category && category.latestGame.played < params.game.played) {
				category.latestGame = params.game;
				
				category.save(function(e, updatedCategory) {
					if (!!callback) {
						callback(updatedCategory);
					}
				});
			} else {
				if (!!callback) {
					callback(category);
				}
				
			}
		});
	};
	
	function getMatchupFromTeams(teams) {
		return _.pluck(teams, 'abbr').join('');
	}
	
	eventEmitter.on('updateLatestGameForCategory', function(params){
		updateLatestGame(params, params.callback);
	});
	
	eventEmitter.on('gameWasRemoved', function(params) {
		checkLatestGame(params.gameId, params.callback);
	});
	
	return {
	  	addCategory: addCategory
	  ,	addTeamToCategory: addTeamToCategory
	  , checkLatestGame: checkLatestGame
	  ,	establishDatabaseConnection: establishDatabaseConnection
	  , getAllDivisions: getAllDivisions
	  ,	getCategory: getCategory
	  , getModel: getModel	
	  , removeTeamFromCategory: removeTeamFromCategory
	  , updateLatestGame: updateLatestGame
	}
}());