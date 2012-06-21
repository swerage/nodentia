describe('Games', function() {
	var mongoose = require('mongoose')  
	  , should = require('should')
	  , conn = mongoose.createConnection('mongodb://localhost/nodentia_test_db')
	  , game = require('../models/game')['game']
	  , team = require('../models/team')['team']
	  , category = require('../models/category')['category']
	  , testGame = {};
	
	game.establishDatabaseConnection(conn);
	
	beforeEach(function(done){
		team.addTeam({ abbr: 'T1', name: 'Team1'}, function(t1) {
			team.addTeam({ abbr: 'T2', name: 'Team2' }, function(t2) {
				category.addCategory({ sport: 'Kast med liten gubbe'}, function(cat) {
					
					game.addGame({ home: t1, away: t2, homeScore: 2, awayScore: 1, overtimeWin: false, shootoutWin: true, 
						played: new Date('2012-01-01'), season: '2012', category: cat, arena: 'Buddy Arena' }, function(newGame) {
								
						testGame = newGame;
						done();
					});
				});
			});
		});
	});
	
	afterEach(function(done) {
		var gameModel = game.getModel();
		
		gameModel.remove({}, function() {
			done();
		});
	});

	it('adds a game', function(done) {
		testGame.home[0].should.be.a('object').and.have.property('abbr', 'T1'); 
		testGame.home[0].should.be.a('object').and.have.property('name', 'Team1');
		
		testGame.homeScore.should.equal(2);
		testGame.awayScore.should.equal(1);
		testGame.overtimeWin.should.equal(false);
		testGame.shootoutWin.should.equal(true);
		testGame.played.should.equal(new Date('2012-01-01'));
		testGame.season.should.equal('2012');		
		
		testGame.category.should.not.equal('null');
		
		done();
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
		game.addGame({ homeScore: 2, awayScore: 1, overtimeWin: false, shootoutWin: true, 
			played: new Date('2012-01-01'), season: '2012', arena: 'Buddy Arena' }, function(newGame) {
				
			game.getAllGames(function(games) {
				games.length.should.be.above(1);
				done();
			});
		});
	});

	it('can have its properties updated', function(done) {
		var testGameId = testGame._id
		  ,	previousCategoryId = testGame.category;
		
		team.addTeam({ abbr: 'T3', name: 'Team3'}, function(t3) {
			team.addTeam({ abbr: 'T4', name: 'Team4' }, function(t4) {
				category.addCategory({ sport: 'Quidditch' }, function(cat2) {
					
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
});






