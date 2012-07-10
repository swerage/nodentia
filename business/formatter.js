exports.getCategoryViewModel = function(categories) {
	var viewModel = [], i;
	 
	for (i = 0; i < categories.length; i++) {
		var model = {}
		  , category = categories[i]
		  , today = new Date();
		
		model.category = category;
		model.division = category.division === 'dam' ? "- Dam" : category.division;
		model.sportProper = this.toProperCase(category.sport);
		
		if (!!category.latestGame && !!category.latestGame.home) {
			model.category.matchup = category.latestGame.home[0].abbr.toLowerCase() + category.latestGame.away[0].abbr.toLowerCase()
		}
		
		if (category.starts > today) { 
			model.daysLeft = getDayOfYear(category.starts) - getDayOfYear(today);
			model.overlay = model.daysLeft + " dagar kvar";
		} else {
			if (!!category.latestGame && !!category.latestGame.homeScore) {
				model.highlight = category.latestGame.homeScore + "-" + category.latestGame.awayScore;
				
				if (+category.latestGame.homeScore !== +category.latestGame.awayScore) {
					model.image = category.latestGame.winner[0].abbr.toLowerCase()
				} else {
					model.image = category.latestGame.home[0].abbr.toLowerCase() + category.latestGame.away[0].abbr.toLowerCase()
				}
			} else {
				model.overlay = "Ingen info."
			}
		}
		
		viewModel.push(model);
	}
	
	return viewModel;
};

exports.getDateString = function(date) {
	var year = addZeroIfNeeded(date.getFullYear())
	  , month = addZeroIfNeeded(date.getMonth() + 1)
	  , day = addZeroIfNeeded(date.getDate());				
	
	return year + '-' + month + '-' + day;
};

exports.getTimeString = function(date) {
	var hours = addZeroIfNeeded(date.getHours())
	  , minutes = addZeroIfNeeded(date.getMinutes());
	
	return hours + ":" + minutes;
};

exports.toProperCase = function(value) {
	return value.substr(0,1).toUpperCase() + value.substr(1);
};

function addZeroIfNeeded(digit) {
	return digit < 10 ? "0" + digit : digit;
}

function getDayOfYear(d) {
	var yn = d.getFullYear()
	  ,	mn = d.getMonth()
	  ,	dn = d.getDate()
	  ,	d1 = new Date(yn,0,1,12,0,0)
	  ,	d2 = new Date(yn,mn,dn,12,0,0)
	 	diff = Math.round((d2-d1)/864e5);

	return diff + 1;
}