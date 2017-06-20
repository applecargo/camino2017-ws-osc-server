//
// this is a node.js server
// 

// uses both socket.io & osc.js

// socket.io for web-browser clients. (mobile & pc clients)
// osc.js/udp for mobmuplat client. (mobile client)

////common lib
var express = require('express');
var http = require('http');

//// socket.io service - for Instruments clients (:5500)
var ioInstApp = express();
var ioInstServer = http.Server(ioInstApp);
var ioInst = require('socket.io')(ioInstServer, {'pingInterval': 1000, 'pingTimeout': 3000});

ioInst.on('connection', function(socket){

    //
    console.log('a instrument user connected');
    
    //msg. for everybody - oneshot sounds
    socket.on('sound', function(msg) {
	socket.broadcast.emit('sound', msg);
	console.log('sound :' + msg);
    });

    //msg. for everyone - notes
    socket.on('sing-note', function(msg) {
	socket.broadcast.emit('sing-note', msg);
	console.log('sing-note :' + msg);
    });

    //
    socket.on('disconnect', function(){
    	console.log('instrument user disconnected');
    });
});

ioInstServer.listen(5500, function(){
    console.log('[socket.io] listening on *:5500');
});

//// osc.js/udp service
var osc = require("osc");

var udp_sc = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 52000,
    metadata: true
});

//message handler
udp_sc.on("message", function (oscmsg, timetag, info) {
    console.log("[udp] got osc message:", oscmsg);

    //EX)
    // //method [1] : just relay as a whole
    // ioInst.emit('osc-msg', oscmsg); //broadcast

    //EX)
    // //method [2] : each fields
    // ioInst.emit('osc-address', oscmsg.address); //broadcast
    // ioInst.emit('osc-type', oscmsg.type); //broadcast
    // ioInst.emit('osc-args', oscmsg.args); //broadcast
    // ioInst.emit('osc-value0', oscmsg.args[0].value); //broadcast

    //just grab i need.. note!
    ioInst.emit('sing-note', oscmsg.address); //broadcast
});
//open port
udp_sc.open();
udp_sc.on("ready", function() {
    console.log("[udp] ready... - 0.0.0.0:", udp_sc.options.localPort);
});
