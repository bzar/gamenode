function Client(server, conn, skeletonConstructor) {
    this.server = server;
    this.conn = conn;
    this.onDisconnect = function() { };
    this.onMessage = function(msg) { };
    this.onMethodListReceived = function(client) { };
    this.onError = function(client) { };
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

    try {
      if(request.type == "message") {
          this.onMessage(request.content);
      } else if(request.type == "call") {
          this.handleMethodCallRequest(request);
      } else if(request.type == "methodList") {
          this.handleMethodListRequest(request);
      } else if(request.type == "response") {
          var callback = this.callbacks[request.id];
          if(callback !== undefined) {
              callback(request.content);
              delete this.callbacks[request.id];
          }
      } else if(request.type == "error") {
        this.onError(request.message);
      } else {
          this.sendError("Unknown message type " + request.type);
      }
    } catch(error) {
        this.sendError("Unhandled exception! " + error);
        if(this.server.crashOnException) {
          throw error;
        }
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

Client.prototype.sendMethodListRequest = function() {
    var methods = [];
    for(propertyName in this.skeleton) {
        var property = this.skeleton[propertyName];
        if(typeof(property) == "function") {
            methods.push(propertyName);
        }
    }

    this.send({
      type: "methodList",
      methodList: methods
    });
}

Client.prototype.handleMethodListRequest = function(request) {
    if(request.methodList !== undefined) {
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
    } else {
      this.stub = new GameNodeStub(this, request.content);
    }

    this.onMethodListReceived(this);
    this.server.initialized(this.conn.id);
}

Client.prototype.handleMethodCallRequest = function(request) {
    var methodName = request.method;
    var methodParams = request.params;

    if(!(methodParams instanceof Array)) {
      this.sendError("Method parameter list must be an array");
    } else if(typeof(this.skeleton[methodName]) == "function") {
        this.requestId = request.id;
        var response = this.skeleton[methodName].apply(this.skeleton, methodParams);
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
            return function() {
                var id = new Date().getTime() + this.client.messageCount;
                var args = [];
                for(var i = 0; i < arguments.length; ++i) {
                  args.push(arguments[i]);
                }

                var callback = args[args.length-1];
                if(typeof(callback) != "function") {
                  callback = null;
                }

                var params = args.slice(0, callback === null ? arguments.length : -1);
                var msg = {type: "call", method: methodName, params: params, id: id};

                if(callback !== null) {
                    this.client.callbacks[id] = callback;
                }

                this.client.send(msg);
            }
        }(methodName);
    }
}


