describe("Category", function() {
	var mongoose = require('mongoose')  
	  , should = require('should')
	  , conn = mongoose.createConnection('mongodb://localhost/nodentia_test_db')
	  , _ = require('../libs/underscore')
	  , category = require('../models/category')['category']
	  , game = require('../models/game')['game']
	  , team = require('../models/team')['team']
	  , eventHandling = require('../business/eventHandling')['eventHandling']
	  , eventEmitter = eventHandling.getEventEmitter()
	  , testCategory;
	
	category.establishDatabaseConnection(conn);
	
	beforeEach(function(done) {
		game.addGame({ played: new Date('2012-03-01') }, function(newGame) {
			team.addTeam({ abbr: 'T1', name: 'Team1'}, function(t1) {
				team.addTeam({ abbr: 'T2', name: 'Team2'}, function(t2) {						
						
					category.addCategory({ sport: 'Ping Pong', league: 'Ping Pong League', division: 'Men', link: '/c/pingpong', teams: [t1, t2], starts: new Date('2012-01-01'), ends: new Date('2012-12-31'), latestGame: { _id: newGame._id, played: newGame.played } }, function(newCategory) {
						testCategory = newCategory;
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
	
	it('can add a category', function(done) {
		testCategory.sport.should.equal('Ping Pong');
		testCategory.league.should.equal('Ping Pong League');
		testCategory.division.should.equal('Men');
		testCategory.link.should.equal('/c/pingpong');
		testCategory.teams.length.should.equal(2);
		testCategory.starts.should.equal(new Date('2012-01-01'));
		testCategory.ends.should.equal(new Date('2012-12-31'));
		
		done();
	});
	
	it('removes team from category', function(done) {
		done();
	});
	
	it('gets divisions', function(done) {
		category.getAllDivisions(function(divisions) {
			divisions.should.not.be.empty;
			done();
		});
	});
	
	it('can add a team', function(done) {
		
		team.addTeam({ abbr: 'T3', name: 'Team3'}, function(t3) {
			testCategory.teams.push(t3);
			
			testCategory.save(function(e, savedCategory) {
				savedCategory.teams.should.not.be.empty;
				done();
			});
		});
	});

	it('can remove a team', function(done) {
		var team1 = testCategory.teams[0];
		
		testCategory.teams = _.without(testCategory.teams, team1);	
		testCategory.save(function(e, savedCategory) {
			savedCategory.teams.should.not.include(team1);
			done();
		});
	});

	it('updates matchup when a team is added', function (done) {
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
	
	it('updates latestGame if the game is most recent when such an event is emitted', function(done) {

		game.getGame(testCategory.latestGame, function(initialGame) {
			initialGame.played.should.equal(new Date('2012-03-01'));
			
			game.addGame({ played: new Date('2012-03-05') }, function(newGame) {
				eventEmitter.emit('updateLatestGameForCategory', { categoryId: testCategory._id, game: newGame, callback: function(updatedCategory) {
					updatedCategory.latestGame._id.should.equal(newGame._id);
					updatedCategory.latestGame.played.should.equal(newGame.played);
					done();
				} });
			});
		});
	});
	
	it('does not update latestGame if the game is not most recent when such an event is emitted', function(done) {
		game.getGame(testCategory.latestGame, function(initialGame) {
			initialGame.played.should.equal(new Date('2012-03-01'));
			
			game.addGame({ played: new Date('2012-02-28') }, function(newGame) {
				eventEmitter.emit('updateLatestGameForCategory', { categoryId: testCategory._id, game: newGame, callback: function(updatedCategory) {
					updatedCategory.latestGame._id.should.not.equal(newGame._id);
					updatedCategory.latestGame.played.should.equal(initialGame.played);
					done();
				}});
			});
		});
	});
	
	it('clears latestGame when such an event is emitted', function (done) {
		testCategory.latestGame.should.not.be.null;
		
		eventEmitter.emit('gameWasRemoved', { gameId: testCategory.latestGame._id, callback: function(returnedCategory) {
			returnedCategory.latestGame.should.be.null;	
			done();
		}});
	});
});






