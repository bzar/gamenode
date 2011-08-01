function FPSCounter(refreshInterval) {
    this.refreshInterval = refreshInterval
    this.numFrames = 0;
    this.startTime = null
    this.fps = 0;
}

FPSCounter.prototype.update = function() {
    var now = new Date().getTime();
    if(this.startTime === null)  {
        this.startTime = now;
    } 

    ++this.numFrames;
    var timeDelta = now - this.startTime;
    
    if(timeDelta >= this.refreshInterval) {
        this.fps = this.numFrames / (timeDelta/1000);
        this.startTime = now;
        this.numFrames = 0;
    }
    
    return this.fps;
}
