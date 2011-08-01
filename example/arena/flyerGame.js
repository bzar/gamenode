if(typeof require !== "undefined") {
    var Player = require("./player").Player;
}

function FlyerGame() {
    this.players = [];
    this.intervalTimerId = null;
    
    this.onUpdate = function() {};
    this.nextObjectId = 0;
    this.prevUpdate = null;
}

if(typeof exports !== "undefined") {
    exports.FlyerGame = FlyerGame;
}

FlyerGame.prototype.newPlayer = function() {
    var objectId = this.getObjectId();
    var player = new Player(this, objectId, 0,0);
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

FlyerGame.prototype.start = function(fps) {
    var delay = 1000/fps;
    var this_ = this;
    this.prevUpdate = new Date().getTime();    
    
    var this_ = this;
    this.intervalTimerId = setInterval(function() {
        var now = new Date().getTime();
        var timeDelta = now - this_.prevUpdate;
        this_.update(timeDelta/1000);
        this_.prevUpdate = now;
    }, delay);
}

FlyerGame.prototype.stop = function() {
    clearInterval(this.intervalTimerId);
}

FlyerGame.prototype.update = function(timeDelta) {
    for(var i = 0; i < this.players.length; ++i) {
        this.players[i].update(timeDelta);
    }
    
    this.onUpdate();
}

FlyerGame.prototype.interact = function() {
    for(var i = 0; i < this.players.length; ++i) {
        this.players[i].interact();
    }
}

FlyerGame.prototype.getObjectId = function() {
    return ++this.nextObjectId;
}

FlyerGame.prototype.setData = function(playerData) {
    for(var i = 0; i < this.players.length; ++i) {
        this.players[i].dirty = true;
    }

    for(var i = 0; i < playerData.length; ++i) {
        var dPlayer = playerData[i]
        var player = null;
        for(var j = 0; j < this.players.length; ++j) {
            if(dPlayer.objectId == this.players[j].objectId) {
                player = this.players[j];
                player.dirty = false;
                break;
            }
        }
        
        if(player === null) {
            player = new Player(this, dPlayer.objectId, dPlayer.position.x, dPlayer.position.y);
            this.players.push(player);
        }
        
        player.setData(dPlayer);
    }
    
    for(var i = 0; i < this.players.length; ++i) {
        if(this.players[i].dirty) {
            this.players.splice(i, 1);
            --i;
        }
    }

}

