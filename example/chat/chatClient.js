function ChatClient() {

}

ChatClient.prototype = new GameNodeClient();

ChatClient.prototype.say = function(channel, message, callback) {
    this.stub.say({
        channel: channel,
        message: message
    }, callback);
}

ChatClient.prototype.setNick = function(nick, callback) {
    this.stub.setNick(nick, callback);
}

ChatClient.prototype.joinChannel = function(channel, callback) {
    this.stub.joinChannel(channel, callback);
}

