exports.game = (function() {
	var addGame, establishDatabaseConnection, eventEmitter, eventHandling, Game, getAllGames, getGame, mongoose, saveGame, schema, _;
	
	eventHandling = require('../business/eventHandling')['eventHandling'];
	eventEmitter = eventHandling.getEventEmitter();
	_ = require('../libs/underscore');
	
	addGame = function(values, callback) {
		var game = new Game();
		
		game.home 		 = 	values.home;
		game.away 		 = 	values.away;
		game.homeScore 	 =  values.homeScore;
		game.awayScore 	 =  values.awayScore;
		game.overtimeWin = 	values.overtimeWin;
		game.shootoutWin = 	values.shootoutWin;
		game.played 	 = 	values.played;
		game.season 	 = 	values.season;
		game.category 	 = 	values.category;
		game.arena 	 	 = 	values.arena;
		
		if (+game.homeScore !== +game.awayScore) {
			game.winner = game.homeScore > game.awayScore ? game.home : game.away;
		}
		
		saveGame(game, callback);
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
		Game.findOne({ _id: id }, function(e, game) {
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
	
	saveGame = function(game, callback) {
		if (+game.homeScore !== +game.awayScore) {
			game.winner = game.homeScore > game.awayScore ? game.home : game.away;
		} else {
			game.winner = [];
		}
		
		game.save(function(e, savedGame) {
			getAllGames(function(games) {
				var mostRecentGame = _.max(games, function(current) { return current.played; })
				  , categoryId = savedGame.category;
				
				eventEmitter.emit('updateLatestGameForCategory', { categoryId: categoryId, game: mostRecentGame });
				callback(savedGame);
			});
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