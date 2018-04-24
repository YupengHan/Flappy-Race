var mysql = require('mysql');

var pool;

exports.init = function(){
	pool = mysql.createPool({
		connectionLimit :10,
		host     : 'localhost',
		user     : 'root',
		password : '12345678',
		database : 'hafdb',
		port     : 3306 //3000, 本地的时候可能是8080

	});
}

exports.get = function(callback) {
    //callback(pool.getConnection(callback));
    pool.getConnection(callback);
}
exports.release = function(connection) {
    connection.release();
}
//callback = function(error,results,fields)
exports.query = function(sql, callback) {
    pool.query(sql, callback);
}
exports.query = function(sql, values, callback) {
    pool.query(sql, values, callback);
}
