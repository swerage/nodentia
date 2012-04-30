var databaseUrl = 'nodentia_db'
  , collections = ['teams', 'categories', 'games']
  , db = require('mongojs').connect(databaseUrl, collections) 
  , teamCallbacks = {}
  , categoryCallbacks = {};

initTeamCallbacks();
initCategoryCallbacks();

console.log("Clearing db...");

db.teams.remove();
db.categories.remove();
db.games.remove();

console.log("done.");
console.log("Creating teams...");

teamCallbacks.createTeams(function(){
	console.log("Creating categories...");

	categoryCallbacks.createCategories(function() {
		console.log("ALL DONE!")
	});
});

function initTeamCallbacks() {
	teamCallbacks = {
		createTeams: function(onComplete) { teamCallbacks.AIK(onComplete); }
	  ,	AIK: function(onComplete) { db.teams.save({ abbr: 'AIK', name: 'Allmänna Idrottsklubben' }, function() { teamCallbacks.DIF(onComplete); }) }
	  ,	DIF: function(onComplete) { db.teams.save({ abbr: 'DIF', name: 'Djurgårdens IF' }, function() { teamCallbacks.HIF(onComplete); }) }
	  , HIF: function(onComplete) { db.teams.save({ abbr: 'HIF', name: 'Hammarby IF' }, function(){ console.log("done."); onComplete(); }); }
	};
}

function initCategoryCallbacks() {
	categoryCallbacks = {
		createCategories: function(onComplete) {
			categoryCallbacks.fotbollHerrar(onComplete);
		}
	  ,	fotbollHerrar: function(onComplete) { 
			db.categories.insert({ 
				sport: 'fotboll', 
				league: 'Allsvenskan', 
				division: 'herr', 
				link: '/g/fotboll',
				teams: [],
				matchup: 'aikdif',
				starts: '2012-05-12',
				ends: '2012-10-21',
				latestGame: {}
			}, function(err, team) { 
				
				db.teams.findOne({ abbr: 'AIK' }, function(err, aik){
					db.categories.update({_id: team._id }, { $push: { teams: aik }});
					
					db.teams.findOne({ abbr: 'DIF' }, function(err, dif) {
						db.categories.update({_id: team._id }, { $push: { teams: dif }});
						
						categoryCallbacks.fotbollDamer(onComplete); 
					});
				});
			});
		} 
	  , fotbollDamer: function(onComplete) { 
			db.categories.save({
				sport: 'fotboll',
				league: 'Allsvenskan',
				division: 'dam',
				link: '/g/fotboll/dam',
				teams: [],
				starts: '2012-06-24',
				ends: '2012-10-27',
				matchup: 'difaik',
				latestGame: {}
			}, function(err, team) { 
				db.teams.findOne({ abbr: 'AIK' }, function(err, aik){
					db.categories.update({_id: team._id }, { $push: { teams: aik }});
					
					db.teams.findOne({ abbr: 'DIF' }, function(err, dif) {
						db.categories.update({_id: team._id }, { $push: { teams: dif }});
						
						categoryCallbacks.hockeyJ20(onComplete);
					});
				});
			});
		}
	  , hockeyJ20: function(onComplete) { 
			db.categories.save({
				sport: 'hockey',
				league: 'J20 SuperElit Norra',
				division: 'j20',
				link: '/g/hockey/j20',
				teams: [],
				matchup: 'aikdif',
				latestGame: {}
			}, function(err, team) { 
				db.teams.findOne({ abbr: 'AIK' }, function(err, aik){
					db.categories.update({_id: team._id }, { $push: { teams: aik }});
					
					db.teams.findOne({ abbr: 'DIF' }, function(err, dif) {
						db.categories.update({_id: team._id }, { $push: { teams: dif }});
						
						categoryCallbacks.hockeyJ18(onComplete); 
					});
				});
			});
		}
	  , hockeyJ18: function(onComplete) { 
			db.categories.save({
				sport: 'hockey',
				league: 'J18 Elit Östra',
				division: 'j18',
				link: '/g/hockey/j18',
				teams: [],
				matchup: 'aikdif',
				latestGame: {}
			}, function(err, team) {
				db.teams.findOne({ abbr: 'AIK' }, function(err, aik){
					db.categories.update({_id: team._id }, { $push: { teams: aik }});
					
					db.teams.findOne({ abbr: 'DIF' }, function(err, dif) {
						db.categories.update({_id: team._id }, { $push: { teams: dif }});
						
						console.log("done.");
						onComplete();
						process.exit(1);
					});
				});
			});
		}
	};
}