var express = require('express');
var mqtt = require('mqtt');
var router = express.Router();
var url = require('url');

var mqtt_url = process.env.CLOUDMQTT_URL || 'ws://broker.hivemq.com:8000/mqtt';
var _HOST_ID = process.env.CLOUDMQTT_TOPIC || 'HAB0001';
var topic = _HOST_ID + "/#" ;
var client = mqtt.connect(mqtt_url);

/* GET home page. */
router.get('/', function(req, res, next) {
  var config =  url.parse(mqtt_url);
  config.topic = topic;
  res.render('index', {
	connected: client.connected,
	config: config
  });
});

var Things = require("../devices/Things");
var things = new Things(_HOST_ID, client);

client.on('connect', function() {  
  
  console.log("A side connected!");

  var Thing = require("../devices/Thing");
  var device1 = new Thing("DEVICE001");
  things.registerThing(device1);

  console.log(device1);

  router.post('/publish', function(req, res) {
    var msg = JSON.stringify({
      date: new Date().toString(),
      msg: req.body.msg
    });
    client.publish(topic, msg, function() {
      res.writeHead(204, { 'Connection': 'keep-alive' });
      res.end();
    });
  });

  client.subscribe(topic, function() {
    console.log("Suscribed to " + topic);
    client.on('message', function(topic, msg, pkt) {
      //res.write("New message\n");
      console.log("Got " + topic + " --: " + msg );
      things.execute(topic, msg);
      //var json = JSON.parse(msg);
      //res.write("data: " + json.date + ": " + json.msg + "\n\n");
    });
  });

  router.get('/stream', function(req, res) {
    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');

    // Timeout timer, send a comment line every 20 sec
    var timer = setInterval(function() {
      res.write('event: ping' + '\n\n');
    }, 20000);

    client.subscribe(topic, function() {
      console.log("Suscribed to " + topic);
      client.on('message', function(topic, msg, pkt) {
        //res.write("New message\n");
       //console.log("Got " + topic + " --: " + msg + " [" + JSON.stringify(pkt) + "]" );
       var json = {date: Date.now(), msg: msg};
       res.write("data: " + json.date + ": " + json.msg + "\n\n");
      });
    });
  });
});

module.exports = router;
