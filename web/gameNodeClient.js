function GameNodeStub(client, methodList) {
    this.client = client;

    for(var i = 0; i < methodList.length; ++i) {
        var methodName = methodList[i];
        this[methodName] = function(methodName) {
            return function() {
                var args = [];
                for(var i = 0; i < arguments.length; ++i) {
                  args.push(arguments[i]);
                }
                
                var callback = args[args.length-1];
                if(typeof(callback) != "function") {
                  callback = null;
                }
                
                var params = args.slice(0, callback === null ? arguments.length : -1);
                var id = new Date().getTime() + this.client.messageCount;
                var msg = {type: "call", method: methodName, params: params, id: id};

                if(callback !== null) {
                    this.client.callbacks[id] = callback;
                }

                this.client.send(msg);
            }
        }(methodName);
    }
}

function GameNodeClient(skeletonConstructor) {
    this.messageCount = 0;
    this.callbacks = {};
    this.onConnected = function() {};
    this.onMessage = function() {};
    if(skeletonConstructor !== undefined) {
        this.skeleton = new skeletonConstructor(this);
    }
    
    this.ws = null;
    this.stub = null;
}
    
GameNodeClient.prototype.connect = function(url) {
    if(this.ws)
      this.ws.disconnect();
    
    this.ws = io.connect(url);
    
    var this_ = this;
    
    this.ws.on("connect", function() {
        if(this_.stub !== null)
          return;
        
        var methods = [];
        for(propertyName in this_.skeleton) {
            var property = this_.skeleton[propertyName];
            if(typeof(property) == "function") {
                methods.push(propertyName);
            }
        }
        
        this_.ws.on("message", function(msg) {
            this_.handle(JSON.parse(msg));
        });
        
        this_.send({type:"methodList", methodList:methods});
    });
}
    
GameNodeClient.prototype.send = function(msg) {
    ++this.messageCount;
    return this.ws.send(JSON.stringify(msg));
}

GameNodeClient.prototype.sendMessage = function(content) {
    return this.send({
        type: "message",
        content: content
    });
}

GameNodeClient.prototype.sendResponse = function(id, response) {
    this.send({
        type: "response",
        id: id,
        content: response
    });
}

GameNodeClient.prototype.sendError = function(message) {
    this.send({
        type: "error",
        message: message
    });
}

    
GameNodeClient.prototype.handle = function(msg) {
    if(msg.type == "response") {
        var callback = this.callbacks[msg.id];
        if(callback !== undefined) {
            callback(msg.content);
            delete this.callbacks[msg.id];
        }
    } else if(msg.type == "message") {
        this.onMessage(msg.content);
    } else if(msg.type == "error") {
        alert(msg.message);
    } else if(msg.type == "call") {
        var methodName = msg.method;
        var methodParams = msg.params;
        
        if(typeof(this.skeleton[methodName]) == "function") {
            var response = this.skeleton[methodName].apply(this.skeleton, methodParams);
            if(response !== undefined) {
                this.sendResponse(msg.id, response);
            }
        } else {
            this.sendError("Unknown method " + methodName);
        }
    } else if(msg.type == "methodList") {
        var methodList = msg.content;
        this.stub = new GameNodeStub(this, methodList);

        try {
            this.onConnected();
        } catch(e) {
            console.log(e);
        }

    } else {
        alert("Unknown message type! " + JSON.stringify(msg));
    }
}

