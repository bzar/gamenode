function Vec2D(x, y) {
    this.x = x;
    this.y = y;
}

if(typeof exports !== "undefined") {
    exports.Vec2D = Vec2D;
}

Vec2D.prototype.add = function(other) {
    return new Vec2D(this.x + other.x, this.y + other.y);
}

Vec2D.prototype.neg = function() {
    return new Vec2D(-this.x, -this.y);
}

Vec2D.prototype.addi = function(other) {
    this.x += other.x;
    this.y += other.y;
}

Vec2D.prototype.copy = function(other) {
    return new Vec2D(this.x, this.y);
}

Vec2D.prototype.scale = function(integer) {
    return new Vec2D(this.x * integer, this.y * integer);
}

Vec2D.prototype.scalei = function(integer) {
    this.x *= integer;
    this.y *= integer;
}

Vec2D.prototype.unit = function() {
    if(this.x == 0 && this.y == 0)
        return new Vec2D(0,0);
        
    var l = this.length();
    return new Vec2D(this.x / l, this.y / l);
}

Vec2D.prototype.length = function(integer) {
    return Math.sqrt(this.lengthSquared());
}

Vec2D.prototype.lengthSquared = function(integer) {
    return this.x * this.x + this.y * this.y;
}

Vec2D.prototype.dotProduct = function(other) {
    return this.x * other.x + this.y * other.y;
}

Vec2D.prototype.crossProduct = function(other) {
    return this.x * other.y - this.y * other.x;
}

Vec2D.prototype.subtract = function(other) {
    return new Vec2D(this.x - other.x, this.y - other.y);
}

Vec2D.prototype.equals = function(other) {
    return this.x == other.x && this.y == other.y;
}
