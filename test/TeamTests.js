var mongoose = require('mongoose') 
  , model = require('../models/Team') 
  , should = require("should")
  , conn = mongoose.createConnection('mongodb://localhost/nodentia_test_db');

describe("Teams", function() {
	
	model.team.establishDatabaseConnection(conn);
	
	beforeEach(function(done) {
		model.team.addTeam({ abbr: "TM1", name: "Team1" }, function(doc) {			
			model.team.addTeam({ abbr: "TM2", name: "Team2" }, function(doc) {
				done();
			});
		});
	});	
	afterEach(function(done) {
		var teamsModel = model.team.getModel(); 
		teamsModel.remove({}, function() {
			done();
		});
	});
	
	it("lists all teams", function(done) {
		model.team.getAll(function(teams) {
			teams.length.should.not.equal(0);
			done();
		});
	});
});