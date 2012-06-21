exports.schemas = (function() {
	var mongoose, Category, Game, ObjectId, Team, _;
	
	mongoose = require('mongoose');
	ObjectId = mongoose.Schema.ObjectId;
	_ = require('../libs/underscore');
	
	Team = new mongoose.Schema({
		abbr: String
	  , name: String
	});
	
	Category = new mongoose.Schema({ 
	  	sport: String 
	  ,	league: String
	  ,	division: String
	  ,	link: String
	  ,	teams: [Team]
	  ,	matchup: String
	  ,	starts: Date
	  ,	ends: Date
	  ,	latestGame: { _id: ObjectId, played: Date }
	});
	
	Game = new mongoose.Schema({
	    home: [Team]
	  , away: [Team]
	  , homeScore: Number
	  , awayScore: Number
	  , winner: [Team]
	  , overtimeWin: Boolean
	  , shootoutWin: Boolean
	  , played: Date
	  , season: String
	  , category: { type: ObjectId, ref: 'Category' }
	  , arena: String					
	});
	
	return {
		categorySchema: Category
	  , gameSchema: Game
	  ,	teamSchema: Team
	}
}());