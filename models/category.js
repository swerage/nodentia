exports.category = (function() {
	var Category, establishDatabaseConnection, getCategory, getModel, mongoose, schema;
	
	establishDatabaseConnection = function(connection) {
		schema = require('../db/schemas')["schemas"].categorySchema;
		Category = connection.model('category', schema);
	};
	
	getCategory = function(id, callback) {
		Category.findOne({ _id: id }, function(err, category) {
			callback(category);
		});
	};
	
	getModel = function() {
		return Category;
	};
	
	return {
	  	establishDatabaseConnection: establishDatabaseConnection
	  ,	getCategory: getCategory
	  , getModel: getModel	
	}
}());