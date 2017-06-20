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

//// socket.io service - for Monitoring client (:5700)
var ioMonApp = express();
var ioMonServer = http.Server(ioMonApp);
var ioMon = require('socket.io')(ioMonServer);

////shared
var seats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//
// server stat protocol example...
//
// example stat)
//
// 'prog' == 'gymsession'
// 'sched_start' == clock time
// 'sched_stop' == clock time
//
var stat = {
    'prog':'wait',
    // 'sched_start':0,
    // 'sched_stop':0,
    'ctime':0
};

ioMon.on('connection', function(socket){
    //
    console.log('a monitoring user connected!');

    // //periodically report server stat.
    // var rollcnt = 0;
    // var stat_reporter = setInterval(function() {
    // 	rollcnt++;
    // 	socket.emit('stat', {
    // 	    'rollcnt': rollcnt,
    // 	    'seats': seats,
    // 	    'stat': stat
    // 	});
    // }, 1000);
    
    //announcements
    socket.on('54321-all',        function() { ioInst.emit('54321'); });
    socket.on('10meg-all',        function() { ioInst.emit('10meg'); });
    socket.on('ansanintro-all',   function() { ioInst.emit('ansanintro'); });
    socket.on('citizenintro-all', function() { ioInst.emit('citizenintro'); });
    socket.on('clap-all',         function() { ioInst.emit('clap'); });
    socket.on('enablespk-all',    function() { ioInst.emit('enablespk'); });
    socket.on('enablespk-w-all',  function() { ioInst.emit('enablespk-w'); });
    socket.on('maxvol-d-all',     function() { ioInst.emit('maxvol-d'); });
    socket.on('maxvol-w-all',     function() { ioInst.emit('maxvol-w'); });
    socket.on('playhelp-all',     function() { ioInst.emit('playhelp'); });
    socket.on('spkon-all',        function() { ioInst.emit('spkon'); });
    socket.on('spkon-slow-all',   function() { ioInst.emit('spkon-slow'); });
    socket.on('spkon-w-all',      function() { ioInst.emit('spkon-w'); });
    socket.on('trybutton-w-all',  function() { ioInst.emit('trybutton-w'); });
    socket.on('webpage2-w-all',   function() { ioInst.emit('webpage2-w'); });
    socket.on('webpage-w-all',    function() { ioInst.emit('webpage-w'); });

    // //play! (sound#)
    // socket.on('playall-start', function(msg){
    // 	console.log('playall-start: ' + msg);
    // 	ioInst.emit('playall-start', msg); //broadcast
    // });
    
    // //stop! (sound#)
    // socket.on('playall-stop', function(msg){
    // 	console.log('playall-stop: ' + msg);
    // 	ioInst.emit('playall-stop', msg); //broadcast
    // });

    //schedule --> no schedule, will fire sound immediately
    socket.on('schedule', function(msg) {
    	console.log('schedule: ' + msg);
    	console.log('schedule.prog: ' + msg.prog);
    	stat.prog = msg.prog;
    	// stat.sched_start = msg.sched_start;
    	// stat.sched_stop = msg.sched_stop;
    	stat.ctime = Date.now();
    	ioInst.emit('schedule', stat); //broadcast
    });
    
    //
    socket.on('disconnect', function(){
    	console.log('monitoring user disconnected');
	// clearInterval(stat_reporter);
    });
});

ioInst.on('connection', function(socket){

    //
    console.log('a instrument user connected');
    
    // //
    // stat.ctime = Date.now();
    // socket.emit('schedule', stat);

    // //
    // var seatNo = -1;
    // socket.on('seatsel', function(msg){
    // 	console.log('got message seatsel : ' + msg);
    // 	console.log('which means seat# : ' + (msg+1));
    // 	seats[msg] = 1; // we won't care colliding selections.
    // 	seatNo = msg; // remember for later!
    // });

    //
    socket.on('disconnect', function(){
    	console.log('instrument user disconnected');
	
	// // clear the flag : again, we won't care colliding selections!
	// if (seatNo != -1) {
	//     seats[seatNo] = 0;
	// }
    });

    // //
    // socket.on('query-schedule', function() {
    // 	console.log('query-schedule');
    // 	stat.ctime = Date.now();
    // 	socket.emit('schedule', stat);
    // });
});

ioInstServer.listen(5500, function(){
    console.log('[socket.io] listening on *:5500');
});

ioMonServer.listen(5700, function(){
    console.log('[socket.io] listening on *:5700');
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
