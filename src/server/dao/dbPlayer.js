 import {connection} from '../DB.js'

function searchPlayer(name,password){
	// connection.connect();
	var flag;
	var sql = 'SELECT * FROM player WHERE name='+"'"+name+"'";
	connection.query(sql,function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
		console.log(result);
		if(result.length!==0){
			console.log(result[0].password)
			if(password === result[0].password){
				console.log("yes");
				flag = 0;
			}else{
				console.log("no1");
				flag = 1;
			}
		}else{
			console.log("no2");
			flag = -1;
		}
       
	});
	if(flag === 0){
		return {code:0}
	}else if(flag ===1){
		return {code:1}
	}else if(flag === -1){
		return {code:-1}
	}
}

module.exports = {
	searchPlayer:searchPlayer
}

// searchPlayer("Akadn","123456");