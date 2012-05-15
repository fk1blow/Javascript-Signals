var HelloWorldSignal = function() {
	this.radio = null;
	this.messageListener = null;
	this.initialize();
}

HelloWorldSignal.prototype = {
	radio: null,
	messageListener: null,

	initialize: function() {
		this.radio = new Radio();
		this.messageListener = new MessageListener();

		this.radio.messageChanged.add(this.messageListener.onMessageChanged, { priority: 1 });
		this.radio.messageChanged.add(this.messageListener.onMessageChangedB, { priority: 2 });
		this.radio.messageChanged.add(this.messageListener.onMessageChangedC, { priority: 0 } );
	},

	removeA: function(listener) {
		this.radio.messageChanged.remove(this.messageListener[listener]);
	},

	removeAll: function() {
		this.radio.messageChanged.removeAll();
	}
}


var Radio = function() {
	this.messageChanged = null;
	this.initialize();
}

Radio.prototype = {
	messageChanged: null,

	message: 'Hello World',

	initialize: function() {
		this.messageChanged = new SK.PrioritySignal();
	},

	sendMessage: function(val) {
		this.messageChanged.dispatch(val);
	}
}


var MessageListener = function() {

}

MessageListener.prototype = {
	onMessageChanged: function(message) {
		console.log('heard a message: ', message);
	},

	onMessageChangedB: function(message) {
		console.log('heard b message: ', message);
	},

	onMessageChangedC: function(message) {
		console.log('heard c message: ', message);
	}
}


var r = new HelloWorldSignal();

r.radio.sendMessage('Xenia has a pen');