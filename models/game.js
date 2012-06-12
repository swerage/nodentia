exports.game = (function() {
	var establishDatabaseConnection, Game, getGame, mongoose, schema;
	
	establishDatabaseConnection = function(connection) {
		schema = require('../db/schemas')["schemas"].gameSchema;
		Game = connection.model('game', schema);
	};
	
	getGame = function(id, callback) {
		Game.findOne({ _id: id }, function(e, game) {
			callback(game);
		});
	};
	
	return {
		establishDatabaseConnection: establishDatabaseConnection
	  ,	getGame: getGame
	};
}());