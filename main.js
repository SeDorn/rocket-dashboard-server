// Require the serialport node module
var SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')

var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

var ourWS = null;

app.get('/', function(req, res, next){
  res.end();
});

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    handleMessage(ws, msg);
  });
});

var handleMessage = function(ws, msg){
    console.log(msg);
    var json = JSON.parse(msg);

    switch(json.type){
        case "status":
            if(json.data == "connected"){
                ourWS = ws;
            }
        break;
        case "launch":
            if(ws == ourWS){
                console.log("Launcing rocket at " + json.date);
            }
        break;
    }
}

var sendMessage = function(type, data){
    if(ourWS){
        var msg = {
            type: type,
            data: data,
            sender: "server",
            date: Date.now()
        }
        ourWS.send(JSON.stringify(msg));
    }
}

app.listen(3000);

// Open the port
var port = new SerialPort("COM3", {
    baudRate: 9600
});

// Read the port data
port.on("open", function () {
    console.log('open');
    const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
    parser.on('data', function(data){
        //console.log(data);
        try{
            sendMessage("altitude", data.split("Alt: ")[1].split(" Temp:")[0])
        } catch(e){}

        try{
            sendMessage("temperature", data.split("Temp: ")[1]);
        } catch(e){}
    });
});







