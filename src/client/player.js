class Player{
	constructor(name){
		this.name = name;
		this.point = 0;
	}
	
	addPoint(value){
		this.point += value;
	}
}

module.exports = Player;