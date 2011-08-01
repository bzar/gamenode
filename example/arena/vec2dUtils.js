if(typeof require !== "undefined") {
    var Vec2D = require("./vec2d").Vec2D;
}

// Determines if segments a and b intersect
function segmentIntersection(a1, a2, b1, b2) {
    var a1a2 = a2.subtract(a1);
    var b1b2 = b2.subtract(b1);
    
    if(a1a2.crossProduct(b1b2) != 0) {
        var t = b1.subtract(a1).crossProduct(b1b2) / a1a2.crossProduct(b1b2);
        var u = b1.subtract(a1).crossProduct(a1a2) / a1a2.crossProduct(b1b2);
        if(t > 0 && t < 1 && u > 0 && u < 1) {
            return true;
        }
    }

    return false;
}

function circleIntersection(c1, r1, c2, r2) {
    return c1.subtract(c2).lengthSquared() <= (r1 + r2) * (r1 + r2);
}

function fromPointToLine(p, l, direction) {
    var lc = c.subtract(l);
    var a = lc.projection(direction);
    return a.subtract(lc);
}

function fromPointToSegment(p, s1, s2) {
    var s1p = p.subtract(s1);
    var s1s2 = s2.subtract(s1);
    var a = s1p.projection(s1s2);
    
    if(a.lengthSquared() <= s1s2.lengthSquared()) {
        // point exists on segment's normal
        return a.subtract(s1p);
    } else {
        // point is closest to one of the endpoints
        var ps1 = s1p.negi();
        var ps2 = s2.subtract(p);
        
        if(ps1.lengthSquared() < ps2.lengthSquared()) {
            return ps1;
        } else {
            return ps2;
        }
    }
}

function circleSegmentIntersection(c, r, s1, s2) {
    return fromPointToSegment(c, s1, s2).lengthSquared() <= (r*r);
}


if(typeof exports !== "undefined") {
    exports.segmentIntersection = segmentIntersection;
    exports.circleIntersection = circleIntersection;
    exports.fromPointToLine = fromPointToLine;
    exports.fromPointToSegment = fromPointToSegment;
    exports.circleSegmentIntersection = circleSegmentIntersection;
}
