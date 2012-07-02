describe('Formatter', function() {
	var formatter = require('../business/formatter');
	
	it('serves up a properly formatted category view model', function(done) {
		var mockCategories, viewModel, firstCategory, secondCategory;
		
		mockCategories = [{ 
			_id: '4fedeac01acc2f9c26000008'
		  , division: 'herr'
		  ,	latestGame: { 
				awayScore: 0
			  ,	homeScore: 10
			  ,	winner: [ { abbr: 'AIK' } ]
			  ,	away: [ { abbr: 'DIF' } ]
			  ,	home: [ { abbr: 'AIK' } ] 
			}
		  ,	matchup: 'AIKDIF'
		  ,	sport: 'fotboll'
		  ,	starts: new Date('Mon, 07 May 2012 22:00:00 GMT')
		}, { 
			_id: '4fedeac01acc2f9c26000009'
		  ,	division: 'dam'
		  ,	matchup: 'difaik'
		  ,	sport: 'fotboll'
		  ,	starts: new Date('Mon, 10 May 2012 22:00:00 GMT')
		}];
		
		viewModel = formatter.getCategoryViewModel(mockCategories);		
		viewModel.length.should.equal(2);
		
		firstCategory  = viewModel[0].category;
		secondCategory = viewModel[1].category;
		
		firstCategory.division.should.equal('herr');
		firstCategory.should.have.property('latestGame');
		firstCategory.latestGame.should.not.be.null;
		firstCategory.matchup.should.equal('aikdif');
		firstCategory.sport.should.equal('fotboll');
		
		done();
	});
});
