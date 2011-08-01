var Server = require("../../server/gameNodeServer").GameNodeServer,
    FileServer = require("../../server/fileServer").FileServer;

function ChatServer() {
    this.channels = {};
    
    this.joinChannel = function(client, channelName) {
        var channel = this.channels[channelName];
        if(channel === undefined) {
            this.channels[channelName] = [];
            channel = this.channels[channelName];
        }
        
        for(var i = 0; i < channel.length; ++i) {
            if(this.channels[i] === client) {
                return false;
            }
        }
        
        channel.push(client);
        
        this.channelMessage(channelName, {
            type: "join",
            channel: channelName, 
            nick: client.nick, 
        }); 
        
        return true;
    }
    
    this.partChannel = function(client, channelName) {
        var channel = this.channels[channelName];
        if(channel !== undefined) {
            for(var i = 0; i < channel.length; ++i) {
                if(channel[i] === client) {
                    channel.splice(i, 1);
                    break;
                }
            }
            
            if(channel == []) {
                delete this.channels[channelName];
            }
        }
        
        this.channelMessage(channelName, {
            type: "part",
            channel: channelName, 
            nick: client.nick, 
        }); 
    }
    
    this.say = function(client, channelName, message) {
        this.channelMessage(channelName, {
            type: "say",
            channel: channelName, 
            from: client.nick, 
            message: message
        });
    }
    
    this.channelMessage = function(channelName, message) {
        var channel = this.channels[channelName];
        if(channel !== undefined) {
            for(var i = 0; i < channel.length; ++i) {
                channel[i].client.sendMessage(message);
            }
        }    
    }
}

function ChatSkeleton(client) {
    this.client = client;
    this.server = client.server;
    this.nick = "anonymous";
    this.channels = [];
    
    var this_ = this;
    client.onDisconnect = function() {
        for(var i = 0; i < this_.channels.length; ++i) {
            this.server.partChannel(this_, this_.channels[i]);
        }
    };
}

ChatSkeleton.prototype.setNick = function(nick) {
    if(typeof(nick) != "string") {
        return "nick must be a string";
    }

    this.nick = nick;
    return "ok";
};

ChatSkeleton.prototype.joinChannel = function(channel) {
    if(typeof(channel) != "string") {
        return "channel must be a string";
    }

    if(this.server.joinChannel(this, channel)) {
        this.channels.push(channel);
    }
    return "ok";
};

ChatSkeleton.prototype.say = function(params) {
    if(typeof(params.channel) != "string") {
        return "channel must be a string";
    }

    if(typeof(params.message) != "string") {
        return "message must be a string";
    }

    this.server.say(this, params.channel, params.message);
    return "ok";
};

ChatServer.prototype = new Server(ChatSkeleton);

var server = new ChatServer();
var fileServer = new FileServer(
    ["chatClient.html", "chatClient.js"], 
    {gamenode: "../../web"}, 
    __dirname,
    "chatClient.html");
    
server.listen(8888);
fileServer.attachTo(server);

