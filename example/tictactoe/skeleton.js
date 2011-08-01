function Skeleton(client) {
    this.client = client;
    this.server = this.client.server;
    this.session = undefined;
    this.sessionId = undefined;
    
    this.client.onDisconnect = function() {
        if(this.skeleton.session !== undefined && this.skeleton.session.user !== undefined) {
            this.skeleton.session.user.removeClient(this.skeleton.sessionId);
        }
        
        this.server.gameSubscriptions.removeAllSubscriptions(this);
        this.server.gameListSubscriptions.removeAllSubscriptions(this);
    }
    
    // Session management
    
    this.newSession = function(credentials) {
        this.session = {};
        this.sessionId = this.server.sessionStorage.createSession(this.session);
        this.session.user = this.server.getUser(credentials.username);
        this.session.user.addClient(this.sessionId, this.client);
        return {success: true, sessionId: this.sessionId};
    }
    
    this.resumeSession = function(sessionId) {
        this.session = this.server.sessionStorage.getSession(sessionId);
        this.sessionId = sessionId;
        if(this.session !== undefined) {
            return {success: true, sessionId: sessionId};
        } else {
            return {success: false, sessionId: null};
        }
    }
    
    this.closeSession = function() {
        var success = this.server.sessionStorage.deleteSession(this.sessionId);
        return {success: success};
    }

    // Game management
        
    this.subscribeGameList = function() {
        this.server.gameListSubscriptions.addSubscription(this.client);
        return this.server.gameList();
    }
    
    this.newGame = function(gameName) {
        if(this.session === undefined) {
            return {success: false, reason: "notLoggedIn"};
        }
        
        if(this.server.newGame(gameName)) {
            this.server.getGame(gameName).addPlayer(this.session.user);
            var username = this.session.user.username;
            
            this.server.gameListSubscriptions.forSubscribers(function(s) {
                s.stub.newGame(gameName);
                s.stub.addPlayer({game:gameName, user:username});
            });
            
            this.server.gameSubscriptions.forSubscribers(function(s) {
                s.stub.joined(username);
            }, gameName);
            
            return {success: true};
        } else {
            return {success: false, reason: "alreadyExists"};
        }
    }
    
    this.canResetGame = function(gameName) {
        return this.server.canResetGame(this.session.user, gameName);
    }
    
    this.resetGame = function(gameName) {
        if(!this.server.resetGame(this.session.user, gameName)) {
            return {success: false};
        }
        
        this.server.gameSubscriptions.forSubscribers(function(s) {
            s.stub.reset();
        }, gameName);
            
        return {success: true};
    }
    
    this.canJoinGame = function(gameName) {
        var game = this.server.getGame(gameName);
        return game.numPlayers() < 2;
    }
    
    this.joinGame = function(gameName) {
        if(this.session === undefined) {
            return {success: false, reason: "notLoggedIn"};
        }

        if(this.server.joinGame(this.session.user, gameName)) {
            var username = this.session.user.username;
            this.server.gameSubscriptions.forSubscribers(function(s) {
                s.stub.joined(username);
            }, gameName);
            
            this.server.gameListSubscriptions.forSubscribers(function(s) {
                s.stub.addPlayer({game:gameName, user:username});
            });
            
            return {success: true};
        } else {
            return {success: false, reason: "cannotJoin"};
        }
    }
    
    this.subscribeGame = function(gameName) {
        if(this.session === undefined) {
            return {success: false, reason: "notLoggedIn"};
        }
        
        var game = this.server.getGame(gameName);

        if(game === undefined) {
            return {success: false, reason: "noSuchGame"};
        }

        this.server.gameSubscriptions.addSubscription(this.client, gameName);
        
        var players = game.players.map(function(user) { return user.username; });
        
        return {success: true, grid: game.grid, players:players};
    }
    
    // Game
    
    this.play = function(params) {
        if(this.session === undefined) {
            return {success: false, reason: "notLoggedIn"};
        }
        
        var game = this.server.getGame(params.game)

        if(game === undefined) {
            return {success: false, reason: "noSuchGame"};
        } 

        if(this.session.user !== game.inTurn()) {
            return {success: false, reason: "notInTurn"};
        }
        
        var player = game.turn;
        
        if(game.play(params.x, params.y)) {
            
            var winner = game.checkWinner();
            
            this.server.gameSubscriptions.forSubscribers(function(s) {
                s.stub.setMark({player: player, x: params.x, y: params.y});
            
                if(winner !== null) {
                    s.stub.winner(winner);
                }
            }, params.game);
            
            return {success: true};
        } else {
            return {success: false, reason: "illegalMove"};
        }
    }
}

exports.Skeleton = Skeleton;
