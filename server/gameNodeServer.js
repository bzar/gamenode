var sys = require("sys"),
    http = require("http"),
    io = require("../lib/socket.io"),
    Client = require("./client").Client;

function GameNodeServer(clientSkeletonConstructor) {
    this.server = undefined;
    this.io = undefined;
    this.clients = {};
    this.clientSkeletonConstructor = clientSkeletonConstructor;
    this.onMessage = function(msg) {}
    this.crashOnException = false;
}

exports.GameNodeServer = GameNodeServer;

GameNodeServer.prototype.handleRequest = function(request, response) {
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end('<h1>This is not a web server</h1>');
}

GameNodeServer.prototype.listen = function(port, hostname) {
    var this_ = this;
    
    this.server = http.createServer(function(req, res) {
        this_.handleRequest(req, res);
    });
    
    // Handle WebSocket Requests
    this.io = io.listen(this.server);
    
    this.io.configure('production', function(){
      this_.io.enable('browser client etag');
      this_.io.set('log level', 1);

      this_.io.set('transports', [
        'websocket'
      , 'flashsocket'
      , 'htmlfile'
      , 'xhr-polling'
      , 'jsonp-polling'
      ]);
    });
    
    this.io.configure('development', function(){
      this_.io.set('log level', 2);
    });
    
    this.io.sockets.on("connection", function(conn) {
        this_.newConnection(conn);
    });

    this.server.listen(port, hostname);
}

GameNodeServer.prototype.newConnection = function(conn) {
    var client = new Client(this, conn, this.clientSkeletonConstructor);
    this.clients[conn.id] = client;
    
    conn.on("message", function(message){
        client.handle(message);
    });
    
    var this_ = this;
    conn.on("disconnect", function(){
        this_.removeConnection(conn);
    });
}

GameNodeServer.prototype.removeConnection = function(conn) {
    if(conn.id in this.clients) {
        this.clients[conn.id].onDisconnect();
        delete this.clients[conn.id];
    }
}
