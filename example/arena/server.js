var Server = require("../../server/gameNodeServer").GameNodeServer,
    FileServer = require("../../server/fileServer").FileServer,
    Skeleton = require("./skeleton").Skeleton,
    FlyerGame = require("./flyerGame").FlyerGame;

var GAME_FPS = 30;
var UPDATE_INTERVAL = 3;

function FlyerServer() {
    this.clients = [];
    this.game = new FlyerGame();
    this.updateCounter = 0;
    
    this.start = function() {
        var this_ = this;
        
        this.game.onUpdate = function() {
            this.interact();
            if(this_.updateCounter++ % UPDATE_INTERVAL == 0) {
                this_.updateClients();
            }
        }
        this.game.start(GAME_FPS);
    }

    this.addPlayer = function(client) {
        var player = this.game.newPlayer();
        this.clients.push({client:client, player:player});
        return player;
    }
    
    this.removePlayer = function(client) {
        for(var i = 0; i < this.clients.length; ++i) {
            if(this.clients[i].client === client) {
                this.game.removePlayer(this.clients[i].player);
                this.clients.splice(i, 1);
                --i;
            }
        }
    }
    
    this.updateClients = function() {
        var players = this.game.players.map(function(p){return p.getDataObject();});
        
        for(var i = 0; i < this.clients.length; ++i) {
            var c = this.clients[i];
            var self = null;
            
            for(var j = 0; j < this.game.players.length; ++j) {
                if(c.player === this.game.players[j]) {
                    self = j;
                    break;
                }
            }
            
            c.client.sendMessage({
                type:"statusUpdate", 
                self: j,
                players: players
            });
        }
    }
}



FlyerServer.prototype = new Server(Skeleton);

var server = new FlyerServer();
var fileServer = new FileServer(
    ["game.html", "starField.js", "clientSettings.js", "flyerGame.js", "player.js", "vec2d.js", "fpsCounter.js", "vec2dUtils.js"], 
    {gamenode: "../../web"}, __dirname, "game.html");


server.start();
server.listen(8888);
fileServer.attachTo(server);

