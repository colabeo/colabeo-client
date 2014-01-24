define(function(require, exports, module) {

    /**
     * @constructor
     */
    function Vector(x,y,z){
        if (arguments.length == 1){
            if (x instanceof Array) this.setXYZ(x[0], x[1], x[2]);
            if (x.constructor.name == "Vector") this.set(x);
        }
        else{
            this.x = x || 0.0;
            this.y = y || 0.0;
            this.z = z || 0.0;
        };
        return this;
    };

    Vector.prototype.add = function(v, out){
        out = out || this.register;
        return out.setXYZ(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        );
    };

    Vector.prototype.sub = function(v, out){
        out = out || this.register;
        return out.setXYZ(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    };

    Vector.prototype.mult = function(r, out){
        out = out || this.register;
        return out.setXYZ(
            r * this.x,
            r * this.y,
            r * this.z
        );
    };

    Vector.prototype.div = function(r, out){
        return this.mult(1/r, out);
    };

    Vector.prototype.cross = function(v, out)
    {
        out = out || this.register;
        return out.setXYZ(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    };

    Vector.prototype.rotate = function(v, out){
        var theta = v.x;
        var phi = v.y;
        var psi = v.z;
        return this.rotateX(theta, out).rotateY(phi, out).rotateZ(psi, out);
    };

    Vector.prototype.rotateX = function(theta, out){
        out = out || this.register;
        var x = this.x;
        var y = this.y;
        var z = this.z;

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
        var x = this.x;
        var y = this.y;
        var z = this.z;

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
        var x = this.x;
        var y = this.y;
        var z = this.z;

        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);

        return out.setXYZ(
            -y * sinTheta + x * cosTheta,
             y * cosTheta + x * sinTheta,
             z
        );
    };

    Vector.prototype.dot = function(v){
        return this.x * v.x + this.y * v.y + this.z * v.z;
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
        return new Vector(this.x, this.y, this.z);
    };

    Vector.prototype.isZero = function(){
        return (!this.x && !this.y && !this.z);
    };

    Vector.prototype.set = function(v){
        if (v instanceof Array){
            this.x = v[0];
            this.y = v[1];
            this.z = v[2] || 0;
        }
        else{
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        }
        if (this != this.register) this.register.clear();
        return this;
    };

    Vector.prototype.setXYZ = function(x,y,z){
        this.register.clear();
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };

    Vector.prototype.clear = function(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
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

    Vector.prototype.toArray = function(){
        return [this.x, this.y, this.z];
    };

    Vector.prototype.fromArray = function(a){
        this.x = a[0]; this.y = a[1]; this.z = a[2]; 
    };

    Vector.prototype.get = function(){
        return this.toArray();
    };

    Vector.prototype.register   = new Vector(0,0,0);
    Vector.prototype.zero       = new Vector(0,0,0);
    Vector.prototype.one        = new Vector(1,1,1);

    module.exports = Vector;

});