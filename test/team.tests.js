describe("Teams", function() {	
	var mongoose = require('mongoose')  
	  , should = require("should")
	  , conn = mongoose.createConnection('mongodb://localhost/nodentia_test_db')
	  , team = require('../models/team')["team"]
	  , testTeam;
	
	team.establishDatabaseConnection(conn);
	
	beforeEach(function(done) {
		team.addTeam({ abbr: "TM1", name: "Team1" }, function(doc) {			
			team.addTeam({ abbr: "TM2", name: "Team2" }, function(doc2) {
				testTeam = doc;
				done();
			});
		});
	});	
	afterEach(function(done) {
		var teamsModel = team.getModel(); 
		teamsModel.remove({}, function() {
			done();
		});
	});
		
	it('adds a team', function(done) {
		team.addTeam({ abbr: 'AIK', name: 'Allmänna Idrottsklubben'}, function(e){
			var teamsModel = team.getModel();
			
			teamsModel.findOne({ abbr: 'AIK' }, function(e, aik) {
				aik.abbr.should.equal('AIK');
				aik.name.should.equal('Allmänna Idrottsklubben');
				done();
			});
		});
	});
	
	it('can get a team by id', function(done) {
		team.getTeam(testTeam._id, function(fetchedTeam) {
			fetchedTeam.should.not.be.null;
			fetchedTeam._id.toString().should.equal(testTeam._id.toString());
			done();
		});
	});
	
	it('lists all teams', function(done) {
		team.getAllTeams(function(teams) {
			teams.length.should.not.equal(0);
			done();
		});
	});
	
	it('rubs the lotion on its skin or else it gets the hose again', function (okayokay) {
		okayokay();
	});
});