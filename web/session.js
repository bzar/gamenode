function Session(client) {
    this.sessionId = sessionStorage.getItem("sessionId");
    this.client = client;
    this.onAuthenticationFailure = function() {};
    this.onAuthenticationSuccess = function() {};
    this.onCloseSuccess = function() {};
    this.onCloseFailure = function() {};

    this.authenticated = false;
}

Session.prototype.authenticate = function(username, password) {
    var this_ = this;
    if(username !== undefined) {
        this.client.stub.newSession({
            username: username,
            password: password
        }, function(response) {
            if(response.success) {
                this_.sessionId = response.sessionId;
                sessionStorage.setItem("sessionId", response.sessionId);
                this_.authenticated = true;
                this_.onAuthenticationSuccess();
            } else {
                this_.authenticated = false;
                this_.onAuthenticationFailure();
            }
        });
    } else if(this.sessionId !== null) {
        this.client.stub.resumeSession(this.sessionId, function(response) {
            if(response.success) {
                this_.authenticated = true;
                this_.onAuthenticationSuccess();
            } else {
                this_.authenticated = false;
                this_.onAuthenticationFailure();
            }
        });
    } else {
        this.authenticated = false;
        this_.onAuthenticationFailure();
    }
}

Session.prototype.close = function() {
    sessionStorage.removeItem("sessionId");

    if(!this.authenticated) {
        this.onCloseSuccess();
        return;
    }
    
    var this_ = this;
    this.client.stub.closeSession(null, function(response) {
        if(response.success) {
            this_.authenticated = false;
            this_.onCloseSuccess();
        } else {
            this_.onCloseFailure();
        }
    });
}

function resumeSessionOrRedirect(client, serverUrl, failureRedirect, callback) {
    var session = new Session(client);

    session.onAuthenticationSuccess = function() {
        if(callback !== undefined) {
            callback(session);
        }
    }

    session.onAuthenticationFailure = session.onCloseSuccess = function() {
        location.replace(failureRedirect);
    }

    client.onConnected = function() {
        session.authenticate();
    }

    client.connect(serverUrl);
    
    return session;
}

