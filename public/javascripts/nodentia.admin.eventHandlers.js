window.nodentia = window.nodentia || {};

window.nodentia.admin.eventHandlers = (function(){
	var settings, bind, bindPlugins;
	
	settings = {
		teams: []
	};
	
	bind = function(){
		
		$(document).on('change', '#games', function() {
			var id = $("#games").val();
			
			if (+id === -1) {
				return;
			}
			
			nodentia.admin.renderGameEditor(id);
		});
		
		$(document).on('change', '#categories', function() {
			var id = $("#categories").val();
			
			if (+id === -1) {
				return;
			}
			
			nodentia.admin.renderCategoryEditor(id);
		});
		
		$(document).on('click', '#newGame', function() {
			nodentia.admin.renderGameEditor();
		});
		
		$(document).on('click', '#newCategory', function() {
			nodentia.admin.renderCategoryEditor();
		})
		
		$(document).on('click', '#saveGame', function() {
			var game, id;
			
			game = {
				home: 		 $('#home').find('option:selected').data('team')
			  ,	away: 		 $('#away').find('option:selected').data('team')
			  ,	homeScore: 	 $('#homeScore').val()
			  ,	awayScore: 	 $('#awayScore').val()
			  ,	overtimeWin: $('#overtimeWin').is(':checked') ? 1 : 0
			  ,	shootoutWin: $('#shootoutWin').is(':checked') ? 1 : 0
			  ,	played: 	 $('#play-date').val() + ' ' + $("#play-time").val()
			  ,	season: 	 $('#season').val()
			  ,	category: 	 $('#category').val()
			  ,	arena: 		 $('#arena').val()
			};
			
			id = $("#_id").val();			
			if (!!id && id.length > 0) {
				game._id = id;
			}
			
			nodentia.admin.saveGame(game, function() {
				$("#edit-area").slideUp();
			});
		});
		
		$(document).on('click', '#removeGame', function() {
			var id = $("#_id").val();			
			
			nodentia.admin.removeGame(id, function() {
				$("#edit-area").slideUp();
			});
		});
		
		$(document).on('click', '#saveCategory', function() {
			var category, id;
			
			category = {
				sport: 	  $("#sport").val(),
				league:   $("#league").val(),
				division: $("#division").val(),
				starts:   $("#starts").val(),
				ends: 	  $("#ends").val(),
				teams: 	  $.map($(".team-row").find("option:selected"), function(el, i) { return $(el).data("team"); })
			};
			
			id = $("#_id").val();
			if (!!id && id.length > 0) {
				category._id = id;
			}
			
			nodentia.admin.saveCategory(category, function() {
				$("#edit-area").slideUp();
			});
		});
		
		$(document).on('click', '#addTeam', function() {
			nodentia.admin.renderTeamRowWithTeams(settings.teams);
		});
		
		$(document).on('click', '.removeTeam', function() {
			var categoryId = $("#_id").val(),
				teamId = $(this).data("team-_id");
			
			nodentia.admin.removeTeam(categoryId, teamId, function(ok) {
				if (ok) {
					$(this).closest("div").remove();
				}
			});
		});
		
		$(document).on('click', '#newSport', function(e) {
			$(this).prev().replaceWith('<input id="sport" type="text" />').end().remove();
			e.preventDefault();
		});
		
		$(document).on('click', '#newLeague', function(e) {
			$(this).prev().replaceWith('<input id="league" type="text" />').end().remove();
			e.preventDefault();
		});
		
		$(document).on('click', '#newDivision', function(e) {
			$(this).prev().replaceWith('<input id="division" type="text" />').end().remove();
			e.preventDefault();
		});
	};
	
	bindPlugins = function() {
		
		$(".date-picker").datepicker({
			dateFormat: 'yy-mm-dd',
		});		
	};
	
	return {
		bind: bind,
		bindPlugins: bindPlugins
	};
}());
