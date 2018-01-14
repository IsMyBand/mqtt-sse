//Private
var _ID;
var _ACTIONS;

var _mqtt;

var _STATE;

var _reporter;

function Thing(n, pub) {
    this._ID = n;
    this._mqtt = pub;   
    this._STATE = 0;

    this._SEND_TOPIC = "SEN";
    this._ACTIONS = {};
    this._ACTIONS["100"] = this.doGet;
    this._ACTIONS["200"] = this.doSet;
    this._ACTIONS["300"] = this.doReport;
    this._ACTIONS["400"] = this.doStopReport;
}

Thing.prototype.doGet = function(self, payload){
    console.log(self);
    console.log("doing action doGet: " +  self._SEND_TOPIC);    
    self.send( self._SEND_TOPIC, self._ID + ";" + self._STATE);
}

Thing.prototype.doSet = function(self, payload){
    console.log("doing action doSet: " + payload);
    var newStatus = payload;
    self._STATE = newStatus;
    self.send( self._SEND_TOPIC, self._ID + ";" + self._STATE);
}

Thing.prototype.doReport = function(self, payload){
    console.log("doing action doReport: " + payload);    
    
    self._reporter = setInterval(
        function(){
            self.send( self._SEND_TOPIC, self._ID + ";" + self._STATE);
        },
        payload
    )
}

Thing.prototype.doStopReport = function(self, payload){
    console.log("doing action doStopReport: " + payload);
    clearInterval(self._reporter);
}

Thing.prototype.execute = function(msg){
    console.log("Executing action: " + msg);

    var _ACTION = (msg + "").split(";")[1];
    var payload = (msg + "").split(";")[2];

    if ( this._ACTIONS[_ACTION] ) 
        this._ACTIONS[_ACTION](this, payload);
	else {
		console.log(_ACTION + " command not registered: " + _ACTION);
	}
}

Thing.prototype.send = function(){};

//Public
module.exports = Thing;