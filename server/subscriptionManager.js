var DEFAULT_TOPIC_NAME = "default";

function SubscriptionManager() {
    this.subscriptions = {};

    this.getSubscribers = function(topicName) {
        topicName = topicName !== undefined ? topicName : DEFAULT_TOPIC_NAME;
        if(this.subscriptions[topicName] !== undefined) {
            return this.subscriptions[topicName];
        } else {
            return [];
        }
    }
    
    this.forSubscribers = function(callback, topicName) {
        topicName = topicName !== undefined ? topicName : DEFAULT_TOPIC_NAME;
        var subscribers = this.subscriptions[topicName];
        if(subscribers !== undefined) {
            for(var i = 0; i < subscribers.length; ++i) {
                callback(subscribers[i]);
            }
        }
    }
    
    this.addSubscription = function(subscriber, topicName) {
        topicName = topicName !== undefined ? topicName : DEFAULT_TOPIC_NAME;
        if(this.subscriptions[topicName] === undefined) {
            this.subscriptions[topicName] = [];
        } 
        
        this.subscriptions[topicName].push(subscriber);
    }
    
    this.removeSubscription = function(subscriber, topicName) {
        topicName = topicName !== undefined ? topicName : DEFAULT_TOPIC_NAME;
        var topicSubscribers = this.subscriptions[topicName];  

        if(topicSubscribers === undefined) {
            return;
        }
        
        for(var i = 0; i < topicSubscribers.length; ++i) {
            if(topicSubscribers[i] === subscriber) {
                topicSubscribers.splice(i, 1);
                --i;
            }
        }
    }
    
    this.removeAllSubscriptions = function(subscriber) {
        for(var topicName in this.subscriptions) {
            this.removeSubscription(subscriber, topicName)
        }    
    }
}

exports.SubscriptionManager = SubscriptionManager;
