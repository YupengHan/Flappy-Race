var mysql = require('mysql');

var pool;

exports.init = function(){
	pool = mysql.createPool({
		connectionLimit :10,
		host     : 'mydbinstance.cdugxppvx9ky.us-east-2.rds.amazonaws.com',
		user     : 'han434',
		password : '12345678',
		database : 'hafdb',
		port     : 3306

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