exports.team = (function() {
	var addTeam, establishConnection, getAllTeams, getModel, Team, mongoose, schema;
	
	addTeam = function (doc, callback) {
		var newTeam = new Team();
		newTeam.abbr = doc.abbr;
		newTeam.name = doc.name;
		
		newTeam.save(function(e, savedTeam) {
			callback(savedTeam);
		});
	};
	
	establishDatabaseConnection = function(connection) {
		schema = require('../db/schemas')["schemas"].teamSchema;
		Team = connection.model('team', schema);
	};
	
	getAllTeams = function (callback) {
		Team.find(function(e, teams) {
			callback(teams);
		});
	};
	
	getModel = function() {
		return Team;
	};
	
	return {
		addTeam: addTeam
	  ,	establishDatabaseConnection: establishDatabaseConnection
	  ,	getAllTeams: getAllTeams
	  ,	getModel: getModel
	}
}());