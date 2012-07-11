describe('Formatter', function() {
	var mongoose     = require('mongoose')  
	  , should       = require('should')
	  , db           = require('../db/seed')['db']
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
	
	it('serves up a properly formatted category view model', function(done) {
		testCategory.division.should.equal('herr');
		testCategory.should.have.property('latestGame');
		testCategory.latestGame.should.not.be.null;
		testCategory.matchup.should.equal('aikdif');
		testCategory.sport.should.equal('fotboll');
		
		done();
	});
});
