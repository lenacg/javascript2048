class Player{
	constructor(){
		this.name = '';
		this.point = 0;
		//this.id = id;
	}
	
	addPoint(value){
		this.point += value;
	}
}

module.exports = Player;