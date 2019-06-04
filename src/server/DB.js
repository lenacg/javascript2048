var mysql  = require('mysql');  

export const connection = mysql.createConnection({     
  host     : 'localhost',       
  user     : 'root',              
  password : 'zucc',       
  port: '3306',                   
  database: 'game' 
}); 
 
connection.connect();

