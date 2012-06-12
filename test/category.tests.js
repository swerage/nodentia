describe("Category", function() {
	var mongoose = require('mongoose')  
	  , should = require("should")
	  , conn = mongoose.createConnection('mongodb://localhost/nodentia_test_db')
	  , category = require('../models/category')["category"];
	
	category.establishDatabaseConnection(conn);
	
	beforeEach(function(done) {
		category.addCategory({ 
			sport: 'Ping Pong', 
			league: 'Ping Pong League', 
			division: 'Men', 
			link: '/c/pingpong',
			teams: [],
			matchup: 'team1team2',
			starts: '2012-01-01',
			ends: '2012-12-31',
			latestGame: {}
		}, function() {
			done();
		});
	});	
	afterEach(function(done) {
		var categoryModel = category.getModel(); 
		categoryModel.remove({}, function() {
			done();
		});
	});
});