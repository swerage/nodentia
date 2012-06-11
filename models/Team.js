var team = (function() {
	var addTeam, establishConnection, getAll, getModel, getSchema, Team, mongoose, schema;
	
	(function init() {
		mongoose = require('mongoose');
		schema = new mongoose.Schema({
			abbr: String
		  , name: String
		});
	}());
	
	addTeam = function (doc, callback) {
		var newTeam = new Team();
		newTeam.abbr = doc.abbr;
		newTeam.name = doc.name;
		
		newTeam.save(function(e) {
			callback();
		});
	};
	
	establishDatabaseConnection = function(connection) {
		Team = connection.model('team', schema);
	};
	
	getAll = function (callback) {
		Team.find(function(e, teams) {
			callback(teams);
		});
	};
	
	getModel = function() {
		return Team;
	};
	
	getSchema = function() {
		return schema;
	};
	
	return {
		addTeam: addTeam
	  ,	establishDatabaseConnection: establishDatabaseConnection
	  ,	getAll: getAll
	  ,	getModel: getModel
	}
}());

exports.team = team;