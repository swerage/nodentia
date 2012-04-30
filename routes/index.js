var bz = require('../business/nodentia.index')
  , formatter = require('../business/nodentia.formatter');

exports.index = function(req, res) {
	bz.getIndexData(function(err, viewModel){
		res.render('index.html', { viewModel: viewModel });
	});
};

exports.show = function(req, res) {
	var sport = req.params.sport,
		division = req.params.division;
	
	bz.getShowData(sport, division, function(err, game) {
		
		if (!game) {
			res.redirect("back");
		} else {
			game.category.sport = formatter.toProperCase(game.category.sport);
			game.category.division = formatter.toProperCase(game.category.division);
			
			res.render('show.html', game);
		}
	});
};

exports.admin = function(req, res) {
	
	bz.getAdminData(function(err, data) {
		res.render('admin.html', { viewData: data });
	});
};

exports.editGame = function(req, res) {
	var data = {};
	
	bz.getTeams(function(teams){
		data.teams = teams;
		
		bz.getCategories(function(categories){
			data.categories = categories;
			
			if (!req.query.id) {
				data.game = {};				
				
				res.render('_gameEditor.html', { viewData: data });			
			} else {

				bz.getGameById(req.query.id, function(game){
					game.dateString = formatter.getDateString(new Date(game.played));
					game.timeString = formatter.getTimeString(new Date(game.played));

					data.game = game;
					
					res.render('_gameEditor.html', { viewData: data });
				});
			}
		});
	});
};

exports.editCategory = function(req, res) {
	var data = {}
	  , i;
	
	bz.getSports(function(sports){
		data.sports = [];
		
		for (i in sports) {
			data.sports.push({ name: sports[i], proper: formatter.toProperCase(sports[i]) });
		}
		
		bz.getLeagues(function(leagues) {
			data.leagues = leagues;
			
			bz.getDivisions(function(divisions) {
				data.divisions = divisions;
				
				if (!req.query.id) {
					data.category = {};
					
					res.render("_categoryEditor.html", { viewData: data });
				} else {
					
					bz.getCategory(req.query.id, function(category) {
						data.category = category;
						
						res.render("_categoryEditor.html", { viewData: data });
					});
				}
			});
		});
	});
};

exports.saveGame = function(req, res) {
	
	bz.saveGame(req.body.game, function(status){
		res.send({ ok: status });
	});
};

exports.saveCategory = function(req, res) {
	bz.saveCategory(req.body.category, function(status){
		res.send({ ok: status });
	});
};

exports.addTeamRow = function(req, res) {
	bz.getTeamsNotIn(req.params.teams, function(teams){
		res.render('_teamRow.html', { teams: teams, selectedTeam: '' });
	});
};

exports.deleteTeamRow = function(req, res) {
	bz.deleteTeamFromCategory(req.body.categoryId, req.body.teamAbbr, function(status){
		res.send({ ok: status });
	});
};

exports.about = function(req, res) {
	res.render('about.html');
};