import Tile from './tile'
import Player from './player'
const R = require('ramda');

var rotateLeft = function (matrix) {
    var rows = matrix.length;
    var columns = matrix[0].length;
    var res = [];
    for (var row = 0; row < rows; ++row) {
        res.push([]);
        for (var column = 0; column < columns; ++column) {
            res[row][column] = matrix[column][columns - row - 1];
        }
    }
    return res;
};

// 00 01 02 03
// 10 11 12 13
// 20 21 22 23
// 30 31 32 33

//03 13 23 33
//02 12 22 32
//01 11 21 31
//00 10 20 30
class Board{
    constructor(){
		this.players = new Player();
        this.tiles = [];
        this.cells = [];
        this.size = 5;
        for (var i = 0; i < this.size; ++i) {
            this.cells[i] = [this.addTile(), this.addTile(), this.addTile(), this.addTile(),this.addTile()];
        }
        this.addRandomTile();
        this.setPositions();
        this.won = false;
        this.fourProbability = 0.1;
        this.deltaX = [-1, 0, 1, 0];
        this.deltaY = [0, -1, 0, 1];
    }
	
    addTile(){
        var res = new Tile;
        Tile.apply(res, arguments);
		this.tiles = R.append(res)(this.tiles);
        return res;
    }

    moveLeft(){
        var hasChanged = false;
        for (var row = 0; row < this.size; ++row) {
			var currentRow = R.filter(tile => tile.value!==0)(this.cells[row]);
            var resultRow = [];
            for (var target = 0; target < this.size; ++target) {
                var targetTile = currentRow.length ? currentRow.shift() : this.addTile();
                if (currentRow.length > 0 && currentRow[0].value == targetTile.value) {
                    var tile1 = targetTile;
                    targetTile = this.addTile(targetTile.value);
                    tile1.mergedInto = targetTile;
                    var tile2 = currentRow.shift();
                    tile2.mergedInto = targetTile;
                    targetTile.value += tile2.value;
					this.players.addPoint(targetTile.value);
                }
                resultRow[target] = targetTile;
				this.won = R.or(this.won,targetTile.value == 2048);
				hasChanged = R.or(hasChanged,targetTile.value != this.cells[row][target].value);
//                 this.won |= (targetTile.value == 2048);
//                 hasChanged |= (targetTile.value != this.cells[row][target].value);
            }
            this.cells[row] = resultRow;
        }
        return hasChanged;
    }

    setPositions(){
        this.cells.forEach((row, rowIndex) => {
            row.forEach((tile, columnIndex) => {
                tile.oldRow = tile.row;
                tile.oldColumn = tile.column;
                tile.row = rowIndex;
                tile.column = columnIndex;
                tile.markForDeletion = false;
            });
        });
    }

    addRandomTile(){
        var emptyCells = [];
        for (var r = 0; r < this.size; ++r) {
            for (var c = 0; c < this.size; ++c) {
                if (this.cells[r][c].value === 0) {
                    emptyCells.push({r: r, c: c});
                }
            }
        }
        var index = ~~(Math.random() * emptyCells.length);
        var cell = emptyCells[index];
        var newValue = Math.random() < this.fourProbability ? 4 : 2;
        this.cells[cell.r][cell.c] = this.addTile(newValue);
    }

    move(direction){
        // 0 -> left, 1 -> up, 2 -> right, 3 -> down
        this.clearOldTiles();
        for (var i = 0; i < direction; ++i) {
            this.cells = rotateLeft(this.cells);
        }
        var hasChanged = this.moveLeft();
        for (var i = direction; i < 4; ++i) {
            this.cells = rotateLeft(this.cells);
        }
        if (hasChanged) {
            this.addRandomTile();
        }
        this.setPositions();
        return this;
    }

    clearOldTiles(){
		this.tiles = R.filter(tile => tile.markForDeletion == false)(this.tiles);
		R.forEach(tile => { tile.markForDeletion = true; })(this.tiles);
    }

    hasWon(){
        return this.won;
    }

    hasLost(){
        var canMove = false;
        for (var row = 0; row < this.size; ++row) {
            for (var column = 0; column < this.size; ++column) {
                canMove |= (this.cells[row][column].value == 0);
                for (var dir = 0; dir < 4; ++dir) {
                    var newRow = row + this.deltaX[dir];
                    var newColumn = column + this.deltaY[dir];
                    if (newRow < 0 || newRow >= this.size || newColumn < 0 || newColumn >= this.size) {
                        continue;
                    }
                    canMove |= (this.cells[row][column].value == this.cells[newRow][newColumn].value);
                }
            }
        }
        return !canMove;
    }

}

module.exports = Board;
