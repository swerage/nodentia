exports.team = (function() {
	var addTeam, establishConnection, getAllTeams, getModel, getTeam, Team, mongoose, schema;
	
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
	
	getTeam = function(id, callback) {
		Team.findOne({ _id: id }, function(err, team) {
			callback(team);
		});
	};
	
	return {
		addTeam: addTeam
		,	establishDatabaseConnection: establishDatabaseConnection
		,	getAllTeams: getAllTeams
		,	getModel: getModel
		, getTeam: getTeam
	};
}());