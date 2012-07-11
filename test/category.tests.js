describe("Category", function() {
	var mongoose      = require('mongoose')  
	  , should        = require('should')
	  , db 			  = require('../db/seed')['db']
	  , _             = require('../libs/underscore')
	  , category      = require('../models/category')['category']
	  , game          = require('../models/game')['game']
	  , team          = require('../models/team')['team']
	  , eventHandling = require('../business/eventHandling')['eventHandling']
	  , eventEmitter  = eventHandling.getEventEmitter()
	  , connection    = mongoose.createConnection('mongodb://localhost/nodentia_test_db')
	  , testCategory
	  , testGame;
	
	team.establishDatabaseConnection(connection);
	category.establishDatabaseConnection(connection);
	game.establishDatabaseConnection(connection);
	
	beforeEach(function(done) {
		db.seedData(true, function(data) {
			testCategory = data.testCategory;
			testGame     = data.testGame;
			done();
		});
	});	
	
	afterEach(function(done) {
		testCategory = testGame = {};	
		
		db.clearData(function() {
			done();
		})
	});
	
	it('can add a category', function(done) {
		testCategory.sport.should.equal('fotboll');
		testCategory.league.should.equal('Allsvenskan');
		testCategory.division.should.equal('herr');
		testCategory.route.should.equal('/g/fotboll');
		testCategory.teams.length.should.equal(2);
		testCategory.starts.should.equal(new Date('2012-05-08'));
		testCategory.ends.should.equal(new Date('2012-10-21'));
		testCategory.latestGame.should.not.be.null;
		testCategory.nextGame.should.not.be.null;
		
		done();
	});
	
	it('can edit a category', function(done) {
		var id = testCategory._id;
		
		testCategory.sport.should.equal('fotboll');
		testCategory.sport = 'Table Tennis';
		
		category.saveCategory(testCategory, function(savedCategory) {
			savedCategory.sport.should.equal('Table Tennis');
			savedCategory._id.toString().should.equal(id.toString());
			done();
		});
	});
	
	it('can get a category by id', function(done) {
		category.getCategoryById(testCategory._id, function(fetchedCategory){
			fetchedCategory.should.not.be.null;
			fetchedCategory._id.toString().should.equal(testCategory._id.toString());
			done();
		});
	});
	
	it('can get a category by route', function(done) {
		category.getCategoryByRoute('/g/fotboll', function(fetchedCategory) {
			fetchedCategory.should.not.be.null;
			fetchedCategory.route.should.equal('/g/fotboll');
			done();
		});
	});
	
	it('can get all categories', function(done) {
		category.getAllCategories(function(categories){
			categories.should.be.an.instanceOf(Array);
			categories.length.should.equal(1);
			done();
		});
	});
	
	it('removes team from category', function(done) {
		team.getTeam(testCategory.teams[0]._id, function() {
			testCategory.teams.length.should.equal(2);
			done();
		});
	});
	
	it('can get all divisions', function(done) {
		category.getAllDivisions(function(divisions) {
			divisions.should.not.be.empty;
			done();
		});
	});
	
	it('can get all leagues', function(done) {
		category.getAllLeagues(function(leagues) {
			leagues.should.not.be.empty;
			done();
		});
	});
	
	it('can get all sports', function(done) {
		category.getAllSports(function(sports) {
			sports.length.should.not.equal(0);
			sports.should.include('fotboll');
			done();
		});
	});
	
	it('can add a team', function(done) {
		
		team.addTeam({ abbr: 'T4', name: 'Team4'}, function(t4) {
			testCategory.teams.push(t4);
			
			testCategory.save(function(e, savedCategory) {
				savedCategory.teams.length.should.equal(3);
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
	
	it('adds a new category when it is saved but doesnt exist', function(done) {
		var newCategory = new category.getModel();
		newCategory.sport = 'Table Tennis';
		
		newCategory.should.not.have.property('_id');
		
		category.saveCategory(newCategory, function(savedCategory) {
			savedCategory._id.should.exist;
			savedCategory.sport.should.equal('Table Tennis');
			done();
		});
	});
	
	it('creates a matchup when a category is created', function (done) {
		testCategory.teams.length.should.equal(2);
		testCategory.matchup.should.exist;
		testCategory.matchup.should.equal('aikdif');
		done();
	});
	
	it('updates matchup when a team is added', function (done) {
		testCategory.matchup.should.equal('aikdif');
		
		team.addTeam({ abbr: 'T4', name: 'Team4'}, function(t4) {
			category.addTeamToCategory(testCategory, t4, function() {
				category.getCategoryById(testCategory._id, function(savedCategory) {
					savedCategory.matchup.should.equal('aikdift4');
					done();
				});
			});
		});
	});
	
	it('updates matchup when a team is removed', function(done) {
		testCategory.matchup.should.equal('aikdif');
		
		category.removeTeamFromCategory(testCategory, testCategory.teams[0], function() {
			category.getCategoryById(testCategory._id, function(savedCategory) {
				savedCategory.matchup.should.equal('dif');
				done();
			});
		});
	});
	
	it('updates latestGame if an added played game is more recent', function(done) {
		game.getGame(testCategory.latestGame, function(initialGame) {
			initialGame.played.should.equal(new Date('2012-03-01'));
			
			testGame.played = new Date('2012-03-06');
			
			game.addGame(testGame, function(newGame) {
				eventEmitter.emit('gameWasSaved', { game: newGame, callback: function(updatedCategory) {
					updatedCategory.latestGame._id.toString().should.equal(newGame._id.toString());
					updatedCategory.latestGame.played.should.equal(newGame.played);
					done();
				} });
			});
		});
	});
	
	it('updates nextGame if an added unplayed game is closer in time', function(done) {
		game.getGame(testCategory.nextGame, function(initialGame) {
			initialGame.played.should.equal(new Date('2014-05-21'));
			
			testGame.played = new Date('2013-05-21');
			
			game.addGame(testGame, function(newGame) {
				eventEmitter.emit('gameWasSaved', { game: newGame, callback: function(updatedCategory) {

					updatedCategory.nextGame._id.toString().should.equal(newGame._id.toString());
					updatedCategory.nextGame.played.should.equal(newGame.played);
					done();
				} });
			});
		});
	});
	
	it('updates latestGame when the current latest game is edited', function(done) {
		game.getGame(testCategory.latestGame, function(latestGame) { 
			latestGame.homeScore.should.equal(3);
			latestGame.winner[0].abbr.should.equal('AIK');
			
			latestGame.homeScore = 0;
			
			eventEmitter.emit('gameWasSaved', { game: latestGame, callback: function(updatedCategory) {
				updatedCategory.latestGame.homeScore.should.equal(0);
				updatedCategory.latestGame.winner[0].abbr.should.equal('DIF');
				done();
			}});
		});
	});
	
	it('updates nextGame when the closest future game is edited', function (done) {
		game.getGame(testCategory.nextGame, function(nextGame) {
			var newHome = nextGame.away[0]
			  , newAway = nextGame.home[0];
			
			nextGame.home[0].abbr.should.equal('DIF');
			nextGame.away[0].abbr.should.equal('AIK');
			nextGame.played.should.equal(new Date('2014-05-21'));
			
			nextGame.home   = newHome;
			nextGame.away   = newAway;
			nextGame.played = new Date('2014-05-22');
			
			game.saveGame(nextGame, function(savedGame) {
				eventEmitter.emit('gameWasSaved', { game: savedGame, callback: function(updatedCategory) {

					updatedCategory.nextGame._id.toString().should.equal(nextGame._id.toString());
					updatedCategory.nextGame.played.should.equal(nextGame.played);
					updatedCategory.nextGame.home[0].abbr.should.equal('AIK');
					updatedCategory.nextGame.away[0].abbr.should.equal('DIF');
					done();
				} });
			});
		});
	});
	
	it('does not update latestGame if the game saved is not most recent', function(done) {
		game.getGame(testCategory.latestGame, function(initialGame) {
			initialGame.played.should.equal(new Date('2012-03-01'));			
			initialGame.played = new Date('2012-02-28');
			
			game.addGame(initialGame, function(newGame) {
				eventEmitter.emit('gameWasSaved', { game: newGame, callback: function(updatedCategory) {
					updatedCategory.latestGame.should.not.equal(newGame._id);					
					updatedCategory.latestGame.played.should.equal(new Date('2012-03-01'));
					done();
				}});
			});
		});
	});
	
	it('does not update nextGame if the game saved is not closer in time than the current', function(done) {
		game.getGame(testCategory.nextGame, function(initialGame) {
			initialGame.played.should.equal(new Date('2014-05-21'));
			initialGame.played = new Date('2014-05-22');
			
			game.addGame(initialGame, function(newGame) {
				eventEmitter.emit('gameWasSaved', { game: newGame, callback: function(updatedCategory) {
					updatedCategory.nextGame.should.not.equal(newGame._id);					
					updatedCategory.nextGame.played.should.equal(new Date('2014-05-21'));
					done();
				}});
			});
		});
	});
	
	it('clears latestGame when that game is removed', function (done) {
		testCategory.latestGame.should.not.be.null;	
		
		eventEmitter.emit('gameWasRemoved', { gameId: testCategory.latestGame, callback: function(updatedCategory) {
			category.getCategoryById(testCategory._id, function(updatedCategory) {
				updatedCategory.should.have.property('latestGame', null);	
				done();
			});
		}});
	});
	
	it('clears nextGame when that game is removed', function(done) {
		testCategory.nextGame.should.not.be.null;

		eventEmitter.emit('gameWasRemoved', { gameId: testCategory.nextGame._id, callback: function(updatedCategory) {
			category.getCategoryById(testCategory._id, function(updatedCategory) {
				updatedCategory.should.have.property('nextGame', null);	
				done();
			});
		}});
	});
	
	it('properly formats a route based on sport', function(done) {
		testCategory.sport = 'kast med liten gubbe';
		category.saveCategory(testCategory, function(savedCategory) {
			savedCategory.should.have.property('route', '/g/kastmedlitengubbe');
			done();
		});
	});
});






