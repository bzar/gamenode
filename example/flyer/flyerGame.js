var Player = require("./player").Player;

var FPS = 30;
var MSEC_PER_FRAME = 1000 / FPS;

function FlyerGame(server) {
    this.server = server;
    this.players = [];
    this.intervalTimerId = null;
}

exports.FlyerGame = FlyerGame;

FlyerGame.prototype.newPlayer = function() {
    var player = new Player(this, 0,0);
    this.players.push(player);
    return player;
}

FlyerGame.prototype.removePlayer = function(player) {
    for(var i = 0; i < this.players.length; ++i) {
        if(this.players[i] === player) {
            this.players.splice(i, 1);
            --i;
        }
    }
}

FlyerGame.prototype.start = function() {
    var this_ = this;
    this.intervalTimerId = setInterval(function() {
        this_.update();
    }, MSEC_PER_FRAME);
}

FlyerGame.prototype.stop = function() {
    clearInterval(this.intervalTimerId);
}

FlyerGame.prototype.update = function() {
    for(var i = 0; i < this.players.length; ++i) {
        this.players[i].update();
    }
    
    this.server.updateClients();
}


