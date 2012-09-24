var Server = require("gamenode").Server,
    FileServer = require("gamenode").FileServer;

function Skeleton(client) {

    client.onMessage = function(msg) {
        this.sendMessage(msg);
    }

    this.echo = function(params) {
        return params;
    }

    this.calc = function(params) {
        var matches = /[0-9 \+\-\/\*]+/.exec(params);
        if(matches !== null && matches.length == 1 && matches[0] == params) {
            return eval(params);
        } else {
            return null;
        }
    }

    this.rmiTest = function(message) {
        client.stub.rmiTest(message);
    }
}

var server = new Server(Skeleton);
var fileServer = new FileServer(["testClient.html"], {gamenode: "../../web"}, __dirname, "testClient.html");

server.listen(8888);
fileServer.attachTo(server);

