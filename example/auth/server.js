var Server = require("../../server/gameNodeServer").GameNodeServer,
    SessionStorage = require("../../server/sessionStorage").SessionStorage,
    FileServer = require("../../server/fileServer").FileServer;

function MyServer() {
    this.sessionStorage = new SessionStorage();
    
    this.authenticate = function(username, password) {
        return username == "user" && password == "pass";
    }
}

function MySkeleton(client) {
    this.client = client;
    this.server = this.client.server;
    this.session = undefined;
    this.sessionId = undefined;
    
    this.newSession = function(credentials) {
        if(this.server.authenticate(credentials.username, credentials.password)) {
            this.session = {};
            this.sessionId = this.server.sessionStorage.createSession(this.session);
            return {success: true, sessionId: this.sessionId};
        } else {
            return {success: false, sessionId: null};
        }
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
    
    this.getStuff = function() {
        if(this.session === undefined) return null;
                    
        return "GameNode rocks!";
    }
}


MyServer.prototype = new Server(MySkeleton);

var server = new MyServer();
var fileServer = new FileServer(["login.html", "main.html", "other.html", "clientSettings.js"], {gamenode: "../../web"}, __dirname, "main.html");

server.listen(8888);
fileServer.attachTo(server);
