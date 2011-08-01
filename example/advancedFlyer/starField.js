function Star(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    if(z >= 4) {
        this.strokeStyle = "rgb(196, 196, 196)";
    } else if(z == 3) {
        this.strokeStyle = "rgb(128, 128, 128)";
    } else if(z == 2) {
        this.strokeStyle = "rgb(64, 64, 64)";
    } else if(z <= 1) {
        this.strokeStyle = "rgb(16, 16, 16)";
    }

}

Star.prototype.draw = function(ctx, view) {
    ctx.save();
    ctx.translate(this.x + view.x, this.y + view.y);
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(5,5);
    ctx.moveTo(5, -5);
    ctx.lineTo(-5, 5);
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.strokeStyle = this.strokeStyle;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

}

function StarField(width, height, numStars) {
    this.width = width;
    this.height = height;
    this.numStars = numStars;
    this.stars = [];
    this.buffer = 10;
}

StarField.prototype.update = function(x, y) {
    if(this.stars.length == 0) {
        for(var i = this.stars.length; i < this.numStars; ++i) {
            var star = new Star((Math.random() - 0.5) * this.width + x,
                                (Math.random() - 0.5) * this.height + y,
                                parseInt(Math.random() * 4 + 1));
            this.stars.push(star);
        }
        
        return;
    }
    
    for(var i = 0; i < this.stars.length; ++i) {
        if(Math.abs(this.stars[i].x - x) > this.width/2 + this.buffer ||
           Math.abs(this.stars[i].y - y) > this.height/2 + this.buffer) {
            var star = undefined;
            if(Math.random() > 0.5) {
                star = new Star((Math.random() - 0.5) * this.width + x,
                                (parseInt(Math.random() * 2) - 0.5) * (this.height + this.buffer) + y,
                                parseInt(Math.random() * 4 + 1));
            } else {
                star = new Star((parseInt(Math.random() * 2) - 0.5) * (this.width + this.buffer) + x,
                                (Math.random() - 0.5) * this.height + y,
                                parseInt(Math.random() * 4 + 1));
            }
            this.stars[i] = star;
        }
    }
}


StarField.prototype.drawStars = function(ctx, view) {
    for(var i = 0; i < this.stars.length; ++i) {
        this.stars[i].draw(ctx, view);
    }
}

