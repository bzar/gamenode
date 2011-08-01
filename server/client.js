function Client(server, conn, skeletonConstructor) {
    this.server = server;
    this.conn = conn;
    this.onDisconnect = function() { };
    this.onMessage = function(msg) { };
    this.skeleton = new skeletonConstructor(this);
    this.messageCount = 0;
    this.stub = null;
    this.callbacks = {};
    this.requestId = null;
    this.debug = false;
}

exports.Client = Client;

Client.prototype.handle = function(message) {
    if(this.debug) console.log("* RECV " + message);
    try {
        var request = JSON.parse(message);
    } catch(error) {
        this.sendError("Invalid JSON message: " + message);
        return;
    }
    
    if(request.type == "message") {
        this.onMessage(request.content);
    } else if(request.type == "call") {
        this.handleMethodCallRequest(request);
    } else if(request.type == "methodList") {
        this.handleMethodListRequest(request);
    } else {
        this.sendError("Unknown message type " + request.type);
    }
}

Client.prototype.send = function(obj) {
    if(this.debug) console.log("* SEND " + JSON.stringify(obj));
    this.conn.send(JSON.stringify(obj));
    ++this.messageCount;
}

Client.prototype.sendResponse = function(id, response) {
    this.send({
        type: "response",
        id: id,
        content: response
    });
}

Client.prototype.sendMessage = function(message) {
    this.send({
        type: "message",
        content: message
    });
}

Client.prototype.sendError = function(message) {
    this.send({
        type: "error",
        message: message
    });
}

Client.prototype.handleMethodListRequest = function(request) {
    var methods = [];
    for(propertyName in this.skeleton) {
        var property = this.skeleton[propertyName];
        if(typeof(property) == "function") {
            methods.push(propertyName);
        }
    }
    
    this.send({
        type: "methodList",
        content: methods
    });
    
    this.stub = new GameNodeStub(this, request.methodList);
}

Client.prototype.handleMethodCallRequest = function(request) {
    var methodName = request.method;
    var methodParams = request.params;
    
    if(typeof(this.skeleton[methodName]) == "function") {
        this.requestId = request.id;
        var response = this.skeleton[methodName](methodParams);
        this.requestId = null;
        if(response !== undefined) {
            this.sendResponse(request.id, response);
        }
    } else {
        this.sendError("Unknown method " + methodName);
    }
}

function GameNodeStub(client, methodList) {
    this.client = client;

    for(var i = 0; i < methodList.length; ++i) {
        var methodName = methodList[i];
        this[methodName] = function(methodName) {
            return function(params, callback) {
                var id = new Date().getTime() + this.client.messageCount;
                var msg = {type: "call", method: methodName, params: params, id: id};

                if(callback !== undefined) {
                    this.client.callbacks[id] = callback;
                }

                this.client.send(msg);
            }
        }(methodName);
    }
}


