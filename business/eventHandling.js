exports.eventHandling = (function() {
	var eventEmitter, events, getEventEmitter;
	
	events = require('events');
	
	getEventEmitter = function() {
		return !!eventEmitter ? eventEmitter : eventEmitter = new events.EventEmitter();
	};
	
	return {
		getEventEmitter: getEventEmitter
	};
}());