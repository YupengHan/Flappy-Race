var mysql = require('mysql');
  
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Lab6"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Succesfully Connected!");
//   con.query("CREATE DATABASE mydb", function (err, result){
//     if (err) throw err;
//     console.log("DATABASE created");
  })
});
