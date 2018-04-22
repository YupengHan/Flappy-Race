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
        var wincount;
        con.connect(function(err) {
        	if (err) throw err;
        	console.log("Connected!");
        	var sql = "SELECT EXISTS(SELECT 1 FROM users WHERE nameandpass='"+nameAndPass+"');";
        	console.log(sql);        		
        	con.query(sql, function (err, result) {
        		var result_str=JSON.stringify(result);
        		console.log(result_str);
        		console.log("result_str.indexOf(})"+result_str.indexOf("}"));
        		var result_index_num=result_str.indexOf("}")-1;
        		console.log('result_index_num'+result_index_num);
        		midexist=result_str[result_index_num];
        		console.log(midexist);

        		if (err) throw err;
        		// console.log(result);
        		// console.log("Object.keys(result)[1]:"+Object.keys(result)[1]);
        		// console.log("Object.keys(result): "+Object.keys(result));
        		// console.log("Object.getOwnPropertyNames(result)[0]: "+Object.getOwnPropertyNames(result[0])   );	
        		// console.log('------------------------------------------------------')
        		// console.log('result[0]'+result[0][0]);
        		// console.log('result[1]'+result[0][1]);
        		// var prop_name=Object.getOwnPropertyNames(result)[0];
        		// console.log(prop_name);
        		// console.log(result.prop_name);
        		// console.log('prop_name:'+prop_name);
        		// const desp1 = Object.getOwnPropertyDescriptor(result,prop_name);
        		// midexis=desp1.value;

        		// console.log(midexist);
        		console.log("Exisits");
        		midexist=true;
        	});

        });

        if(midexist){
        	console.log("midexist=true");
        	var wincount;
        	// Hard Code
        	con.connect(function(err) {
        	if (err) throw err;
        	console.log("Connected!");
        	var sql = "SELECT wincount from users where nameandpass ='"+nameAndPass+"';";
        	console.log(sql);
        	con.query(sql, function (err, result) {
        		console.log('-----------------------------------------------------------------------')
        		console.log(result);
        		console.log(rows[0]['wincount']);
        		console.log('-----------------------------------------------------------------------')
        		if (err) throw err;
        		console.log("Wincount is :"+result);
        		midexist=true;
        	});
        	});


        	// wincount=0;
            sock.emit('login', nameAndPass, wincount);
        } else {
            console.log('Guseting');
            alert("Login Failed! \nYou are playing as a guest.");
            sock.emit('login', 'guest');
//            alert("Login Failed");
        }
    });
    sock.on('score', function (nameAndPass, score) {
        console.log(nameAndPass + score);
        if(users.has(nameAndPass)){
            users.set(nameAndPass, score);
        }
    });
}