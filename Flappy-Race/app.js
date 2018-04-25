'use strict';

let http = require('http');
let express = require('express');
let socketio = require('socket.io');
var db = require('mysql');

let app = express();
let server = http.createServer(app);
let io = socketio(server);
var con = db.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hr'
});


dbHas('NAN:123', function(has){
    console.log('has is: ' + has);
});

dbGet('sam:asd', function(score){
    console.log('score is: ' + score);
});



function dbInsert(nameAndPass){
    var newUser = {
        id: nameAndPass,
        score: 0
    };
    con.getConnection(function(error, connection){
        connection.query('insert into hr set ?', newUser, function(err, result) {
            if(err) {
                console.error(err);
            }
            console.log(result);
            connection.release();
        })
    });
}

function dbHas(nameAndPass, callback){
    con.getConnection(function(error, connection){
        connection.query('select score from hr where id = \'' + nameAndPass + '\'', function(err, result) {
            console.log('result: ' + result);
            if(result[0]){
                callback(true);
                console.log('ITHAS: ');
            }else{
                callback(false);
            }
            connection.release();
            if(err) throw error;
        })
    });
}

function dbGet(nameAndPass, callback){
    con.getConnection(function(error, connection){
        connection.query('select score from hr where id = \'' + nameAndPass + '\'', function(err, result) {
            if(err) {
                console.error(err);
            }
            callback(result[0].score);
            console.log(result[0].score);
            connection.release();
        })
    });
}

function dbSet(nameAndPass, score){
    con.getConnection(function(error, connection){
        var query = connection.query('UPDATE hr SET score = ' + score + ' WHERE id = \'' + nameAndPass + '\'', function(err, result) {
            if(err) {
                console.error(err);
            }
            connection.release();
        })
    });
}

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
        console.log('prem: '+nameAndPass);
        //console.log('dbgetreturn: '+dbGet(nameAndPass));
        dbHas(nameAndPass, function(has){
            if(has){
                dbGet(nameAndPass, function(score){
                    sock.emit('login', nameAndPass, score);
                });
            } else {
                console.log('dont have' + nameAndPass);
                sock.emit('login', 'guest');
            }
        });
    });
    sock.on('score', function (nameAndPass, score) {
        console.log(nameAndPass + score);
        dbHas(nameAndPass, function(has){
            if(has){
                dbSet(nameAndPass, score);
            }
        });
    });
    sock.on('signUp', function (nameAndPass) {
        console.log(nameAndPass);
        dbHas(nameAndPass, function(has){
            if(has){
                sock.emit('signUp', 'user exist');
            } else {
                dbInsert(nameAndPass);
                sock.emit('signUp', 'success');
            }
        })
    });
}