//Private
var _HOST_ID;

var yThings;
var _mqtt;


//Public
module.exports = Things;
function Things(_HOST_ID, client) {
	this._HOST_ID = _HOST_ID;
	this._mqtt = client;
	this.yThings = {};
}

Things.prototype.registerThing = function(thing){
	console.log("Registering thing: " + thing._ID);
	
	var self = this;
	thing.send = function(topic, payload){
		console.log("publish: " + self._HOST_ID + "/" + topic + " --> " + payload);
		self._mqtt.publish(self._HOST_ID + "/" + topic, payload);
		console.log(self._mqtt.publish);
	};
	self.yThings[thing._ID] = thing;

}

Things.prototype.execute = function(topic, msg){
	console.log("THING Got " + topic + " --: " + msg );
	

	try {

		var _ID = (msg + "").split(";")[0];
		var _ACTION = topic.split("/")[1];

	} catch (e) {
		console.log("unknow transmission format, skipping");
		return;
	}	
	
	switch(_ACTION) {
		case "ACT":
			if ( this.yThings[_ID] ) {
				console.log("device found");
				console.log(this.yThings[_ID]);
				this.yThings[_ID].execute(msg);
			}else {
				console.log("device not registered: " + _ID);
			}
			break;
		case "SEN":
			break;
		default:
			console.log("unknown topic: " + _ACTION);
	}
	
}