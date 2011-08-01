function Skeleton(client) {
    this.client = client;
    this.server = this.client.server;
    this.player = this.server.addPlayer(this.client);
    
    this.client.onDisconnect = function() {
        this.server.removePlayer(this);
    }
    
    this.rotateLeft = function() {
        this.player.rotateLeft();
    }
    
    this.rotateRight = function() {
        this.player.rotateRight();
    }
    
    this.accelerate = function() {
        this.player.accelerate();
    }

    this.strafeLeft = function() {
        this.player.strafeLeft();
    }
    
    this.strafeRight = function() {
        this.player.strafeRight();
    }
    
    this.stopRotateLeft = function() {
        this.player.stopRotateLeft();
    }
    
    this.stopRotateRight = function() {
        this.player.stopRotateRight();
    }
    
    this.stopStrafeLeft = function() {
        this.player.stopStrafeLeft();
    }
    
    this.stopStrafeRight = function() {
        this.player.stopStrafeRight();
    }
    
    this.stopAccelerate = function() {
        this.player.stopAccelerate();
    }
    
    this.shoot = function() {
        this.player.shoot();
    }
}

exports.Skeleton = Skeleton;
