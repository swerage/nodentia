exports.game = (function() {
	var addGame, establishDatabaseConnection, eventEmitter, events, Game, getAllGames, getGame, mongoose, saveGame, schema;
	
	events = require('events');
	eventEmitter = new events.EventEmitter();
	
	addGame = function(callback) {
		var game = new Game();
		game.save(function(e, savedGame){
			callback(savedGame);
		})
	};
	
	establishDatabaseConnection = function(connection) {
		schema = require('../db/schemas')["schemas"].gameSchema;
		Game = connection.model('game', schema);
	};
	
	getAllGames = function(callback) {
		Game.find({}, function(err, games) {
			callback(games);
		});
	};
	
	getGame = function(id, callback) {
		Game.findById(id, function(e, game) {
			callback(game);
		});
	};
	
	getModel = function() {
		return Game;
	}
	
	removeGame = function(game, callback) {

		Game.find({ _id: game._id }).remove(function() {
			eventEmitter.emit('gameWasRemoved', game._id);
			callback();
		});
	};
	
	return {
	  	addGame: addGame
	  ,	establishDatabaseConnection: establishDatabaseConnection
	  , getAllGames: getAllGames
	  ,	getGame: getGame
	  , getModel: getModel
	  , removeGame: removeGame
	  , saveGame: saveGame
	};
}());