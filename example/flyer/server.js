var Server = require("../../server/gameNodeServer").GameNodeServer,
    FileServer = require("../../server/fileServer").FileServer,
    Skeleton = require("./skeleton").Skeleton,
    FlyerGame = require("./flyerGame").FlyerGame;

function FlyerServer() {
    this.clients = [];
    this.game = new FlyerGame(this);
    this.game.start();
    
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
        for(var i = 0; i < this.clients.length; ++i) {
            var c = this.clients[i];
            
            var self = c.player.getDataObject();
            var others = c.player.getOthers();
            
            c.client.sendMessage({
                type:"statusUpdate", 
                self: self,
                others: others
            });
        }
    }
}



FlyerServer.prototype = new Server(Skeleton);

var server = new FlyerServer();
var fileServer = new FileServer(
    ["game.html", "starField.js", "clientSettings.js"], 
    {gamenode: "../../web"}, 
    __dirname, "game.html");

server.listen(8888);
fileServer.attachTo(server);

