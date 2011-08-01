var Base64 = require("../lib/base64").Base64;

function SessionStorage() {
    this.sessions = {};
    this.sessionCount = 0;
}

exports.SessionStorage = SessionStorage;

SessionStorage.prototype.getSession = function(sessionId) {
    return this.sessions[sessionId];
}

SessionStorage.prototype.createSession = function(session) {
    var sessionId = Base64.encode((new Date().getTime() + this.sessionCount).toString());
    this.sessions[sessionId] = session;
    ++this.sessionCount;
    return sessionId;
}

SessionStorage.prototype.deleteSession = function(sessionId) {
    if(sessionId in this.sessions) {
        delete this.sessions[sessionId];
        --this.sessionCount;
        return true;
    }
    
    return false;
}
