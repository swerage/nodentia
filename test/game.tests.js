describe('Games', function() {
	var mongoose     = require('mongoose')  
	  , should       = require('should')
	  , db           = require('../db/seed_test')['db']
	  , connection   = mongoose.createConnection('mongodb://localhost/nodentia_test_db')
	  , category     = require('../models/category')['category']
	  , game         = require('../models/game')['game']
	  , team         = require('../models/team')['team']
	  , category     = require('../models/category')['category']
	  , testCategory = {}
	  , testGame     = {};
	
	team.establishDatabaseConnection(connection);
	category.establishDatabaseConnection(connection);
	game.establishDatabaseConnection(connection);
	
	beforeEach(function(done){
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

	it('adds a game', function(done) {
		testGame.home[0].should.be.a('object').and.have.property('abbr', 'AIK'); 
		testGame.home[0].should.be.a('object').and.have.property('name', 'Allmänna Idrottsklubben');
		
		testGame.away[0].should.be.a('object').and.have.property('abbr', 'DIF'); 
		testGame.away[0].should.be.a('object').and.have.property('name', 'Djurgårdens IF');
		
		testGame.winner.length.should.not.equal(0);
		testGame.winner[0].should.be.a('object').and.have.property('_id', testGame.home[0]._id);
		
		testGame.homeScore.should.equal(3);
		testGame.awayScore.should.equal(1);
		testGame.overtimeWin.should.equal(false);
		testGame.shootoutWin.should.equal(false);
		testGame.played.should.equal(new Date('2012-03-01'));
		testGame.season.should.equal('2012');		
		
		testGame.category.should.not.equal('null');
		
		done();
	});
	
	it('sets a winner when a game is added if there is one', function(done) {
		testGame.winner.length.should.not.equal(0);
		testGame.winner[0].abbr.should.equal('AIK');
		done();
	});
	
	it('does not set a winner if there isnt one', function(done) {
		team.addTeam({ abbr: 'T3', name: 'Team3'}, function(t3) {
			team.addTeam({ abbr: 'T4', name: 'Team4' }, function(t4) {
				category.addCategory({ sport: 'Whatever' }, function(cat) {					
					game.addGame({ home: t3, away: t4, homeScore: 1, awayScore: 1, overtimeWin: false, shootoutWin: true, played: new Date('2012-01-01'), season: '2012', category: cat, arena: 'Buddy Arena' }, function(newGame) {
						newGame.winner.length.should.equal(0);
						done();
					});
				});
			});
		});
	});
	
	it('removes a game', function(done) {
		game.removeGame(testGame, function() {
			game.getAllGames(function(games) {
				games.length.should.equal(0);
				done();
			});
		});
	});

	it('gets all games', function(done) {
		game.addGame({ homeScore: 2, awayScore: 1, overtimeWin: false, shootoutWin: true, played: new Date('2012-01-01'), season: '2012', arena: 'Buddy Arena', category: testGame.category }, function(newGame) {
				
			game.getAllGames(function(games) {
				games.length.should.be.above(1);
				done();
			});
		});
	});
	
	it ('gets all games by category', function(done) {
		game.getAllGamesByCategory(testGame.category, function(games) {
			games.length.should.equal(1);
			games[0].category._id.toString().should.equal(testGame.category.toString());
			done();
		});
	});
	
	it('can have its properties updated', function(done) {
		var testGameId = testGame._id
		  ,	previousCategoryId = testGame.category;
		
		team.addTeam({ abbr: 'T3', name: 'Team3'}, function(t3) {
			team.addTeam({ abbr: 'T4', name: 'Team4' }, function(t4) {
				category.addCategory({ sport: 'Quidditch', teams: [t3, t4] }, function(cat2) {
					
					testGame.home = t3;
					testGame.away = t4;
					testGame.homeScore = 1;
					testGame.awayScore = 0;
					testGame.overtimeWin = true;
					testGame.shootoutWin = false;
					testGame.played = new Date('2012-10-21');
					testGame.season = '2009';
					testGame.category = cat2;
					testGame.arena = 'Pal Arena';
							
					testGame.save(function(e, savedGame) {
						savedGame._id.should.equal(testGameId);
						
						savedGame.home[0].should.be.a('object').and.have.property('abbr', 'T3'); 
						savedGame.home[0].should.be.a('object').and.have.property('name', 'Team3');

						savedGame.homeScore.should.equal(1);
						savedGame.awayScore.should.equal(0);
						savedGame.overtimeWin.should.equal(true);
						savedGame.shootoutWin.should.equal(false);
						savedGame.played.should.equal(new Date('2012-10-21'));
						savedGame.season.should.equal('2009');		

						savedGame.category.should.not.equal(previousCategoryId);
						
						done();
					});
				});
			});
		});
	});

	it('updates the winner when the score changes so that there is a new winner', function(done) {
		testGame.winner.length.should.not.equal(0);
		testGame.winner[0].abbr.should.equal('AIK');
		testGame.awayScore = 4;
		
		game.saveGame(testGame, function(savedGame) {
			savedGame.winner[0].abbr.should.equal('DIF');
			done();
		});
	});

	it('updates the winner when the score changes so that there is no winner when it is a draw', function (done) {
		testGame.winner.length.should.not.equal(0);
		testGame.winner[0].abbr.should.equal('AIK');
		testGame.awayScore = 3;
		
		game.saveGame(testGame, function(savedGame) {
			savedGame.homeScore.should.equal(3);
			savedGame.awayScore.should.equal(3);
			savedGame.winner.length.should.equal(0);
			done();
		});
	});
});






