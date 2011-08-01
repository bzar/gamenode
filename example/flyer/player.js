var Vec2D = require("./vec2d").Vec2D;

var ACCELERATION = 0.1;
var SHOT_VELOCITY = 60.0;
var SHOT_LIFE = 70;

function Player(game, x, y) {
    this.game = game;
    this.position = new Vec2D(x, y);
    this.velocity = new Vec2D(0, 0);
    this.angle = 0.0;
    
    this.shots = [];
    
    this.rotatingLeft = false;
    this.rotatingRight = false;
    this.strafingLeft = false;
    this.strafingRight = false;
    this.accelerating = false;
}

function Shot(player, direction) {
    this.player = player;
    this.position = player.position.copy();
    this.velocity = direction.scale(SHOT_VELOCITY).add(player.velocity);
    this.life = SHOT_LIFE;
}

exports.Player = Player;

Player.prototype.getDataObject = function() {
    return {
        x: this.position.x,
        y: this.position.y,
        angle: this.angle,
        shots: this.shots.map(function(s){return s.getDataObject();})
    };
}

Player.prototype.getOthers = function() {
    var players = this.game.players;
    var others = [];
    
    for(var i = 0; i < players.length; ++i) {
        others.push(players[i].getDataObject());
    }
    
    return others;
}

Player.prototype.update = function() {
    if(this.rotatingLeft) {
        this.angle -= 0.1;
    }
    
    if(this.rotatingRight) {
        this.angle += 0.1;
    }
    
    var acceleration = new Vec2D(0, 0);
    
    if(this.accelerating) {
        acceleration.x += Math.cos(this.angle) * ACCELERATION
        acceleration.y += Math.sin(this.angle) * ACCELERATION
    }

    if(this.strafingLeft) {
        if(!this.strafingRight) {
            acceleration.x += Math.cos(this.angle - Math.PI/2) * ACCELERATION
            acceleration.y += Math.sin(this.angle - Math.PI/2) * ACCELERATION
        }
    }
    
    if(this.strafingRight) {
        if(!this.strafingLeft) {
            acceleration.x += Math.cos(this.angle + Math.PI/2) * ACCELERATION
            acceleration.y += Math.sin(this.angle + Math.PI/2) * ACCELERATION
        }
    }

    
    this.velocity.addi(acceleration);
    this.position.addi(this.velocity);
    
    for(var i = 0; i < this.shots.length; ++i) {
        this.shots[i].update();
        if(this.shots[i].life == 0) {
            this.shots.splice(i, 1);
            --i;
        }
    }
}

Player.prototype.rotateLeft = function() {
    this.rotatingLeft = true;
}

Player.prototype.rotateRight = function() {
    this.rotatingRight = true;
}

Player.prototype.strafeLeft = function() {
    this.strafingLeft = true;
}

Player.prototype.strafeRight = function() {
    this.strafingRight = true;
}

Player.prototype.accelerate = function() {
    this.accelerating = true;
}

Player.prototype.stopRotateLeft = function() {
     this.rotatingLeft = false;   
}

Player.prototype.stopRotateRight = function() {
    this.rotatingRight = false;
}

Player.prototype.stopStrafeLeft = function() {
     this.strafingLeft = false;   
}

Player.prototype.stopStrafeRight = function() {
    this.strafingRight = false;
}

Player.prototype.stopAccelerate = function() {
    this.accelerating = false;
}

Player.prototype.shoot = function() {
    var direction = new Vec2D(Math.cos(this.angle) * ACCELERATION,
                              Math.sin(this.angle) * ACCELERATION);
    this.shots.push(new Shot(this, direction));
}

Shot.prototype.update = function() {
    this.position.addi(this.velocity);
    --this.life;
}

Shot.prototype.getDataObject = function() {
    return {
        x: this.position.x,
        y: this.position.y,
    };
}

