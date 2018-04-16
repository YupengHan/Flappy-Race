'use strict';

let http = require('http');
let express = require('express');
let socketio = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = socketio(server);

var matching = false;

var roomNo = 2;

io.on('connection', onConnection);

app.use(express.static(__dirname + '/'));
server.listen(8080, () => console.log(__dirname));


function onConnection(sock) {
    sock.on('match', function () {
        if (!matching) {
            sock.join(roomNo);
            matching = true;
        } else {
            sock.join(roomNo);
            io.in(roomNo).emit('matchStart');
            ++roomNo;
            matching = false;
        }
    });
    sock.on('pos', function (x, y) {
        console.log(Object.keys(sock.rooms)[0]);
        sock.to(Object.keys(sock.rooms)[0]).emit('pos', x, y);
    });
}