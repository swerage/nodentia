window.nodentia = window.nodentia || {};

nodentia.admin = (function() {
	var init, removeGame, removeTeam, renderGameEditor, renderCategoryEditor, saveCategory, saveGame;
	
	init = function() {
		nodentia.admin.eventHandlers.bind();
	};
	
	removeGame = function(id, callback) {
		$.post('/admin/game/delete', { id: id }, function() {
			callback();
		});
	};
	
	removeTeam = function(categoryId, teamAbbr, callback) {
		$.post('/admin/teamrow/delete', { categoryId: categoryId, teamAbbr: teamAbbr }, function(response) {
			callback(response.ok);
		});
	};
	
	renderGameEditor = function(id) {
		$.get("/admin/game/edit", { id: id }, function(gameMarkup){
			$("#edit-area").slideUp(function(){
				$(this).html(gameMarkup).slideDown();
				nodentia.admin.eventHandlers.bindPlugins();
			});
		});
	};
	
	renderCategoryEditor = function(id) {
		$.get("/admin/category/edit", { id: id }, function(categoryMarkup) {
			$("#edit-area").slideUp(function() {
				$(this).html(categoryMarkup).slideDown();
				nodentia.admin.eventHandlers.bindPlugins();
			});
		});
	};
	
	renderTeamRowWithTeams = function(teams) {
		$.get("/admin/teamrow/create", { teams: teams }, function(teamRowMarkup){
			$("#teams").append(teamRowMarkup);
		});
	};
	
	saveCategory = function(category, callback) {
		$.post('/admin/category/save', { category: category }, function(response) {
			callback();
		});
	};
	
	saveGame = function(game) {
		$.post('/admin/game/save', { game: game }, function(response) {
			callback();
		});
	};
	
	return {
		init: init
		, removeGame: removeGame
		,	removeTeam: removeTeam
		,	renderGameEditor: renderGameEditor
		,	renderCategoryEditor: renderCategoryEditor
		,	renderTeamRowWithTeams: renderTeamRowWithTeams
		,	saveCategory: saveCategory
		,	saveGame: saveGame
	};
}());