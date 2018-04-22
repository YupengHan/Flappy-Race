'use strict';

// -----------------------------------------------------------------------------------------
var mysql = require('mysql');

var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Lab6",
        database: "hafdb"
        // port: 8080
});


// -----------------------------------------------------------------------------------------

let http = require('http');
let express = require('express');
let socketio = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketio(server);

var matching = false;

var roomNo = 2;

var users = new Map();
users.set("sam:123", 0);

io.on('connection', onConnection);

app.use(express.static(__dirname + '/'));
server.listen(8080, () => console.log(__dirname));


function onConnection(sock) {
    sock.on('match', function () {
        if (!matching) {
            sock.leave(Object.keys(sock.rooms)[0]);
            sock.join(roomNo);
            matching = true;
        } else {
            sock.join(roomNo);
            sock.leave(Object.keys(sock.rooms)[0]);
            io.in(roomNo).emit('matchStart');
            ++roomNo;
            matching = false;
        }
    });
    sock.on('pos', function (x, y) {
        //console.log(Object.keys(sock.rooms)[0]);
        sock.to(Object.keys(sock.rooms)[0]).emit('pos', x, y);
    });
    sock.on('fire', function (x, y, direction) {
        console.log(x+'and'+y+'and'+direction);
        io.in(Object.keys(sock.rooms)[0]).emit('firec', x, y, direction);
    });
    sock.on('login', function (nameAndPass) {
        console.log(nameAndPass);
        var midexist;
        con.connect(function(err) {
        	if (err) throw err;
        	console.log("Connected!");
        	var sql = "SELECT EXISTS(SELECT 1 FROM customer WHERE name='a');";
        	con.query(sql, function (err, result) {
        		if (err) throw err;
        		console.log("1 record inserted");
        		midexist=true;
        	});
        });

        if(midexist){
            sock.emit('login', nameAndPass, users.get(nameAndPass));
        } else {
            sock.emit('login', 'guest');
        }
    });
    sock.on('score', function (nameAndPass, score) {
        console.log(nameAndPass + score);
        if(users.has(nameAndPass)){
            users.set(nameAndPass, score);
        }
    });
}