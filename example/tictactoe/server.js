var Server = require("../../server/gameNodeServer").GameNodeServer,
    FileServer = require("../../server/fileServer").FileServer,
    SessionStorage = require("../../server/sessionStorage").SessionStorage,
    SubscriptionManager = require("../../server/subscriptionManager").SubscriptionManager,
    Skeleton = require("./skeleton").Skeleton,
    TicTacToe = require("./tictactoe").TicTacToe;

function User(username) {
    this.username = username;
    this.clients = {};
    this.games = []
    
    this.addClient = function(sessionId, client) {
        this.clients[sessionId] = client;
    }
    
    this.removeClient = function(sessionId) {
        delete this.clients[sessionId];
    }
}

function TicTacToeServer() {
    this.sessionStorage = new SessionStorage();
    this.games = {};
    this.users = {};
    this.gameSubscriptions = new SubscriptionManager();
    this.gameListSubscriptions = new SubscriptionManager();
    
    this.gameList = function() {
        var list = [];
        for(gameName in this.games) {
            var game = this.getGame(gameName);
            var gameInfo = {name:gameName, players:[]};
            for(var i = 0; i < game.numPlayers(); ++i) {
                gameInfo.players.push(game.players[i].username);
            }
            list.push(gameInfo);
        }
        
        return list;
    }
    
    this.newGame = function(gameName) {
        if(this.games[gameName] !== undefined) {
            return false;
        }
        
        this.games[gameName] = new TicTacToe();
        return true;
    }
    
    this.joinGame = function(user, gameName) {
        var game = this.games[gameName];
        if(game === undefined) {
            return false;
        }
        
        if(!game.addPlayer(user)) {
            return false;
        }
        
        user.games.push(game);
        return true;
    }
    
    this.getGame = function(gameName) {
        return this.games[gameName];
    }
    
    this.canResetGame = function(user, gameName) {
        var game = this.games[gameName];
        if(game === undefined) {
            return false;
        }
        
        var player = false;
        for(var i = 0; i < game.players.length; ++i) {
            if(game.players[i].username == user.username) {
                player = true;
                break;
            }
        }
        
        if(!player) {
            return false;
        }
        
        if(game.checkWinner() === null) {
            return false;
        }
        
        return true;    
    }
    
    this.resetGame = function(user, gameName) {
        if(this.canResetGame(user, gameName)) {
            var game = this.games[gameName];
            game.reset();
            return true;
        }
        
        return false;        
    }
    
    this.getUser = function(username) {
        if(this.users[username] !== undefined) {
            return this.users[username];
        } else {
            this.users[username] = new User(username);
            return this.users[username];
        }
    }
    
}



TicTacToeServer.prototype = new Server(Skeleton);

var server = new TicTacToeServer();
var fileServer = new FileServer(
    ["login.html", "gamelist.html", "game.html", "clientSettings.js"], 
    {gamenode: "../../web"}, __dirname, "gamelist.html");

server.listen(8888);
fileServer.attachTo(server);

