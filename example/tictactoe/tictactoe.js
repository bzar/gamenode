var gridSize = 3

function TicTacToe() {
    this.players = [];
    this.turn = 1;
    this.grid = [];
    this.finished = false;

    this.reset();
}
    
TicTacToe.prototype.reset = function() {
    this.grid = [];
    this.finished = false;
    
    for(var i = 0; i < gridSize; ++i) {
        this.grid.push([]);
        for(var j = 0; j < gridSize; ++j) {
            this.grid[i].push(null);
        }
    }    
}

TicTacToe.prototype.play = function(x, y) {
    if(this.finished || this.grid[y] === undefined || this.grid[y][x] !== null) {
        return false;
    }
    
    this.grid[y][x] = this.turn;
    this.turn = (this.turn % 2) + 1;
    return true;
}

TicTacToe.prototype.inTurn = function() {
    return this.players[this.turn - 1];
}

TicTacToe.prototype.numPlayers = function() {
    return this.players.length;
}

TicTacToe.prototype.addPlayer = function(player) {
    if(this.numPlayers() < 2) {
        this.players.push(player);
        return true;
    } else {
        return false;
    }
}

TicTacToe.prototype.checkWinner = function() {
    var winner = null;
    for(var i = 0; i < gridSize && winner === null; ++i) {
        winner = this.grid[i][0];
        for(var j = 1; j < gridSize; ++j) {
            if(this.grid[i][j] != winner) {
                winner = null;
                break;
            }                
        }
    }
            
    for(var i = 0; i < gridSize && winner === null; ++i) {
        winner = this.grid[0][i];
        for(var j = 1; j < gridSize; ++j) {
            if(this.grid[j][i] != winner) {
                winner = null;
                break;
            }                
        }
    }

    if(winner === null) {
        winner = this.grid[0][0];
        for(var i = 1; i < gridSize; ++i) {            
            if(this.grid[i][i] != winner) {
                winner = null;
                break;
            }
        }
    }

    if(winner === null) {
        winner = this.grid[gridSize-1][0];
        for(var i = 1; i < gridSize; ++i) {            
            if(this.grid[gridSize-1-i][i] != winner) {
                winner = null;
                break;
            }
        }
    }
    
    this.finished = winner !== null;
    return winner;
}


exports.TicTacToe = TicTacToe;
