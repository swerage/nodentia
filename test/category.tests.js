describe("Category", function() {
	var mongoose = require('mongoose')  
	  , should = require("should")
	  , conn = mongoose.createConnection('mongodb://localhost/nodentia_test_db')
	  , _ = require('../libs/underscore')
	  , category = require('../models/category')["category"]
	  , team = require('../models/team')["team"]
	  , testCategory;
	
	category.establishDatabaseConnection(conn);
	
	beforeEach(function(done) {
		category.addCategory(function(newCategory) {
			testCategory = newCategory;
			
			testCategory.sport = 'Ping Pong'; 
			testCategory.league = 'Ping Pong League';
			testCategory.division = 'Men';
			testCategory.link = '/c/pingpong';
			testCategory.teams = [];
			testCategory.matchup = 'T1T2';
			testCategory.starts = new Date('2012-01-01');
			testCategory.ends = new Date('2012-12-31');
			
			team.addTeam({ abbr: 'T1', name: 'Team1'}, function(t1) {
				testCategory.teams.push(t1);
					
				team.addTeam({ abbr: 'T2', name: 'Team2'}, function(t2) {
					testCategory.teams.push(t2);
					testCategory.save(function(e, savedCategory) {
						testCategory = savedCategory;
						done();	
					});
				});
			});
		});
	});	
	
	afterEach(function(done) {
		var teamModel = team.getModel()
		  ,	categoryModel = category.getModel(); 
		
		testCategory = {};
		
		categoryModel.remove({}, function() {			
			teamModel.remove({}, function() {
				done();
			});
		});
	});
	
	it("can add a category", function(done) {
		testCategory.sport.should.equal('Ping Pong');
		testCategory.league.should.equal('Ping Pong League');
		testCategory.division.should.equal('Men');
		testCategory.link.should.equal('/c/pingpong');
		testCategory.teams.length.should.equal(2);
		testCategory.starts.should.equal(new Date('2012-01-01'));
		testCategory.ends.should.equal(new Date('2012-12-31'));
		
		done();
	});
	
	it("removes team from category", function(done) {
		done();
	});
	
	it("gets divisions", function(done) {
		category.getAllDivisions(function(divisions) {
			divisions.should.not.be.empty;
			done();
		});
	});
	
	it("can add a team", function(done) {
		
		team.addTeam({ abbr: 'T3', name: 'Team3'}, function(t3) {
			testCategory.teams.push(t3);
			
			testCategory.save(function(e, savedCategory) {
				savedCategory.teams.should.not.be.empty;
				done();
			});
		});
	});

	it("can remove a team", function(done) {
		var team1 = testCategory.teams[0];
		
		testCategory.teams = _.without(testCategory.teams, team1);	
		testCategory.save(function(e, savedCategory) {
			savedCategory.teams.should.not.include(team1);
			done();
		});
	});

	it("updates matchup when a team is added", function (done) {
		testCategory.matchup.should.equal('T1T2');
		
		team.addTeam({ abbr: 'T3', name: 'Team3'}, function(t3) {
			category.addTeamToCategory(testCategory, t3, function() {
				category.getCategory(testCategory._id, function(savedCategory) {
					savedCategory.matchup.should.equal('T1T2T3');
					done();
				});
			});
		});
	});
	
	it('updates matchup when a team is removed', function(done) {
		testCategory.matchup.should.equal('T1T2');
		
		category.removeTeamFromCategory(testCategory, testCategory.teams[0], function() {
			category.getCategory(testCategory._id, function(savedCategory) {
				savedCategory.matchup.should.equal('T2');
				done();
			});
		});
	});

	it('reacts to a game being removed by also clearing any categories "latestGame" prop for that game', function (done) {
		done();
	});
});






