if(typeof require !== "undefined") {
    var Vec2D = require("./vec2d").Vec2D;
}

var ACCELERATION = 300.0;
var TURN_RATE = 3.0
var SHOT_VELOCITY = 300.0;
var SHOT_LIFE = 2;
var MAX_SHOTS = 5;

function Player(game, objectId, x, y) {
    this.game = game;
    this.objectId = objectId;
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

function Shot(player, direction, objectId) {
    this.objectId = objectId;
    this.player = player;
    this.position = player.position.copy();
    this.velocity = direction.scale(SHOT_VELOCITY).add(player.velocity);
    this.life = SHOT_LIFE;
}

if(typeof exports !== "undefined") {
    exports.Player = Player;
}

Player.prototype.getDataObject = function() {
    return {
        objectId: this.objectId,
        position: this.position,
        velocity: this.velocity,
        angle: this.angle,
        shots: this.shots.map(function(s){return s.getDataObject();}), 
        control: {
            rl: this.rotatingLeft,
            rr: this.rotatingRight,
            sl: this.strafingLeft,
            sr: this.strafingRight,
            a: this.accelerating
        }
    };
}

Player.prototype.update = function(timeDelta) {
    if(this.rotatingLeft) {
        this.angle -= timeDelta * TURN_RATE;
    }
    
    if(this.rotatingRight) {
        this.angle += timeDelta * TURN_RATE;
    }
    
    if(this.accelerating || this.strafingLeft || this.strafingRight) {
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

        acceleration.scalei(timeDelta);
        this.velocity.addi(acceleration);
    }
    
    this.position.addi(this.velocity.scale(timeDelta));
    
    for(var i = 0; i < this.shots.length; ++i) {
        this.shots[i].update(timeDelta);
        if(this.shots[i].life <= 0) {
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
    if(this.shots.length >= MAX_SHOTS) {
        return;
    }
        
    var direction = new Vec2D(Math.cos(this.angle),
                              Math.sin(this.angle));
    this.shots.push(new Shot(this, direction, this.game.getObjectId()));
}

Shot.prototype.update = function(timeDelta) {
    this.position.addi(this.velocity.scale(timeDelta));
    this.life -= timeDelta;
}

Shot.prototype.getDataObject = function() {
    return {
        objectId: this.objectId,
        position: this.position,
        velocity: this.velocity,
    };
}

Player.prototype.setData = function(dPlayer) {
    this.position.x = dPlayer.position.x;
    this.position.y = dPlayer.position.y;
    
    this.angle = dPlayer.angle;
    
    this.velocity.x = dPlayer.velocity.x;
    this.velocity.y = dPlayer.velocity.y;

    for(var i = 0; i < this.shots.length; ++i) {
        this.shots[i].dirty = true;
    }
    
    for(var i = 0; i < dPlayer.shots.length; ++i) {
        var dShot = dPlayer.shots[i];
        var shot = null;
        for(var j = 0; j < this.shots.length; ++j) {
            if(dShot.objectId == this.shots[j].objectId) {
                shot = this.shots[j];
                shot.dirty = false;
                break;
            }
        }
        
        if(shot === null) {
            shot = new Shot(this, new Vec2D(dShot.position.x, dShot.position.y), dShot.objectId);
            this.shots.push(shot);
        }
        
        shot.setData(dShot);
    }

    for(var i = 0; i < this.shots.length; ++i) {
        if(this.shots[i].dirty) {
            this.shots.splice(i, 1);
            --i;
        }
    }
    
    this.rotatingLeft = dPlayer.control.rl;
    this.rotatingRight = dPlayer.control.rr;
    this.strafingLeft = dPlayer.control.sl;
    this.strafingRight = dPlayer.control.sr;
    this.accelerating = dPlayer.control.a;
    
}

Shot.prototype.setData = function(dShot) {
    this.position.x = dShot.position.x;
    this.position.y = dShot.position.y;
    
    this.velocity.x = dShot.velocity.x;
    this.velocity.y = dShot.velocity.y;
}
