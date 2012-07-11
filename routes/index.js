var bz = require('../business/nodentia')
  , formatter = require('../business/formatter');

exports.index = function(req, res) {
	bz.getIndexViewModel(function(viewModel) {
		res.render('index.html', { viewModel: viewModel });
	});
};

exports.show = function(req, res) {
	var sport = req.params.sport,
		division = req.params.division;
	
	bz.getShowViewModel(req.url, function(viewModel) {
		!viewModel ? res.redirect("back") : res.render('show.html', viewModel);
	});
};

exports.admin = function(req, res) {
	
	bz.getAdminViewModel(function(viewModel) {
		res.render('admin.html', { viewData: viewModel });
	});
};

exports.editGame = function(req, res) {
	bz.getEditGameViewModel(req.query.id, function(viewModel) {
		res.render('_gameEditor.html', { viewData: viewModel });
	});
};

exports.editCategory = function(req, res) {
	bz.getEditCategoryViewModel(req.query.id, function(viewModel) {
		res.render("_categoryEditor.html", { viewData: viewModel });
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
	bz.getTeams(function(teams){
		res.render('_teamRow.html', { teams: teams, selectedTeam: '' });
	});
};

exports.deleteGame = function(req, res) {
	bz.deleteGame(req.body.id, function(status) {
		res.send({ ok: status });
	});
};

exports.deleteTeamRow = function(req, res) {
	bz.deleteTeamFromCategory(req.body.categoryId, req.body.teamId, function(status){
		res.send({ ok: status });
	});
};

exports.about = function(req, res) {
	res.render('about.html');
};