exports.category = (function() {
	var addCategory, addTeamToCategory, Category, establishDatabaseConnection, eventEmitter, events, getCategory, getAllDivisions, 
		getModel, mongoose, removeTeamFromCategory, _;
	
	events = require('events');
	eventEmitter = new events.EventEmitter();
	_ = require('../libs/underscore');
	
	addCategory = function(callback) {
		var category = new Category();
		
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
	
	function getMatchupFromTeams(teams) {
		return _.pluck(teams, 'abbr').join('');
	}
	
	eventEmitter.on('gameWasRemoved', function(gameId, callback) {
		Category.find({ 'latestGame._id': gameId }, function (e, cat){
			cat.latestGame = {};
			cat.save(function() {
				callback();
			});
		});
		
	});
	
	return {
	  	addCategory: addCategory
	  ,	addTeamToCategory: addTeamToCategory
	  ,	establishDatabaseConnection: establishDatabaseConnection
	  , getAllDivisions: getAllDivisions
	  ,	getCategory: getCategory
	  , getModel: getModel	
	  , removeTeamFromCategory: removeTeamFromCategory
	}
}());