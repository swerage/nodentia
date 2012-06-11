var nodentia = require('../business/nodentia')
  , should = require("should");
	
describe('nodentia', function() {
	it("gets divisions", function(done) {
		nodentia.getDivisions(function(divisions) {
			divisions.should.not.be.empty;
			done();
		});
	});
});