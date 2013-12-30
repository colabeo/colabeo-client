define(function(require, exports, module) {


    /**
     * @class Looks to be an UNUSED version of Vector.   
     *
     * @description TODO: Remove this file.
     * @deprecated
     * @name VectorArray
     * @constructor
     */ 
    function Vector(x,y,z){
        if (x instanceof Array) this.v = x.splice(0);
        else if (x instanceof Vector) this.v = x.v;
        else this.v = [x || 0, y || 0, z || 0];
        return this;
    };

    Vector.prototype.add = function(vec, out){
        out = out || this.register;
        var v = this.v;
        var w = vec.v;
        return out.setXYZ(
            v[0] + w[0],
            v[1] + w[1],
            v[2] + w[2]
        );
    };

    Vector.prototype.sub = function(vec, out){
        out = out || this.register;
        var v = this.v;
        var w = vec.v;
        return out.setXYZ(
            v[0] - w[0],
            v[1] - w[1],
            v[2] - w[2]
        );
    };

    Vector.prototype.mult = function(r, out){
        out = out || this.register;
        var v = this.v;
        return out.setXYZ(
            r * v[0],
            r * v[1],
            r * v[2]
        );
    };

    Vector.prototype.div = function(r, out){
        return this.mult(1/r, out);
    };

    Vector.prototype.cross = function(vec, out){
        var v = this.v;
        var w = vec.v;
        out = out || this.register;
        return out.setXYZ(
            v[1] * w[2] - v[2] * w[1],
            v[2] * w[0] - v[0] * w[2],
            v[0] * w[1] - v[1] * w[0]
        );
    };

    Vector.prototype.rotate = function(theta, phi, psi, out){
        return this.rotateX(theta, out).rotateY(phi, out).rotateZ(psi, out);
    };

    Vector.prototype.rotateX = function(theta, out){
        out = out || this.register;
        var v = this.v, x = v[0], y = v[1], z = v[2];

        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);

        return out.setXYZ(
            x,
           -z * sinTheta + y * cosTheta,
            z * cosTheta - y * sinTheta
        );
    };

    Vector.prototype.rotateY = function(theta, out){
        out = out || this.register;
        var v = this.v, x = v[0], y = v[1], z = v[2];

        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);

        return out.setXYZ(
           -z * sinTheta + x * cosTheta,
            y,
            z * cosTheta + x * sinTheta
        );

    };

    Vector.prototype.rotateZ = function(theta, out){
        out = out || this.register;
        var v = this.v, x = v[0], y = v[1], z = v[2];

        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);

        return out.setXYZ(
           -y * sinTheta + x * cosTheta,
            y * cosTheta + x * sinTheta,
            z
        );
    };

    Vector.prototype.dot = function(vec){
        var v = this.v;
        var w = vec.v;
        return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
    };

    Vector.prototype.normSquared = function(){
        return this.dot(this);
    };

    Vector.prototype.norm = function(){
        return Math.sqrt(this.normSquared());
    };

    Vector.prototype.normalize = function(length, out){
        length  = length    || 1;
        out     = out       || this.register;

        var tolerance = 1e-7;
        var norm = this.norm();

        if (Math.abs(norm) > tolerance) return this.mult(length / norm, out);
        else return out.setXYZ(length, 0, 0);
    };

    Vector.prototype.clone = function(){
        return new Vector(this.v);
    };

    Vector.prototype.isZero = function(){
        var v = this.v;
        return (!v[0] && !v[1] && !v[2]);
    };

    Vector.prototype.get = function(){
        return this.v;
    };

    Vector.prototype.set = function(vec){
        var w = vec.v;
        var v = this.v;
        v[0] = w[0];
        v[1] = w[1];
        v[2] = w[2];
        if (this != this.register) this.register.clear();
        return this;
    };

    Vector.prototype.setXYZ = function(x,y,z){
        this.register.clear();
        this.v = [x,y,z];
        return this;
    };

    Vector.prototype.clear = function(){
        this.v = [0,0,0];
    };

    Vector.prototype.cap = function(cap){
        if (cap == Infinity) return this;
        var norm = this.norm();
        if (norm > cap) this.normalize().mult(cap, this);
        return this;
    };

    Vector.prototype.project = function(n, out){
        out = out || this.register;
        return n.mult(this.dot(n), out);
    };

    Vector.prototype.reflect = function(n, out){
        out = out || this.register;
        n.normalize();
        return this.sub(this.project(n).mult(2), out);
    };

    Vector.prototype.register = new Vector(0,0,0);

    module.exports = Vector;

});
