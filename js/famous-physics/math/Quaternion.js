define(function(require, exports, module) {

    /**
     * @constructor
     */
    function Quaternion(w,x,y,z){
        if (arguments.length == 1) this.set(w)
        else{
            this.w = (w !== undefined) ? w : 1.0;  //Angle
            this.x = x || 0.0;  //Axis.x
            this.y = y || 0.0;  //Axis.y
            this.z = z || 0.0;  //Axis.z
        };
        return this;
    };

    var register = new Quaternion(1,0,0,0);

    Quaternion.prototype.add = function(q, out){
        out = out || register;
        return out.setWXYZ(
            this.w + q.w,
            this.x + q.x,
            this.y + q.y,
            this.z + q.z
        );
    };

    Quaternion.prototype.sub = function(q, out){
        out = out || register;
        return out.setWXYZ(
            this.w - q.w,
            this.x - q.x,
            this.y - q.y,
            this.z - q.z
        );
    };

    Quaternion.prototype.scalarDivide = function(s, out){
        out = out || register;
        return this.scalarMult(1/s, out);
    };

    Quaternion.prototype.scalarMult = function(s, out){
        out = out || register;
        return out.setWXYZ(
            this.w * s,
            this.x * s,
            this.y * s,
            this.z * s
        );
    };

    Quaternion.prototype.multiply = function(q, out){
        out = out || register;
        var x = this.x, y = this.y, z = this.z, w = this.w;
        var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        return out.setWXYZ(
            w*qw - x*qx - y*qy - z*qz,
            w*qx + x*qw + y*qz - z*qy,
            w*qy - x*qz + y*qw + z*qx,
            w*qz + x*qy - y*qx + z*qw
        );
    };

    Quaternion.prototype.vectorMultiply = function(v, out){
        out = out || register;
        v.w = 0;
        return out.set(this.inverse().multiply(v).multiply(this));
    };

    Quaternion.prototype.inverse = function(out){
        out = out || register;
        return this.conj().scalarDivide(this.normSquared(), out);
    };

    Quaternion.prototype.negate = function(out){
        out = out || register;
        return this.scalarMult(-1, out);
    };

    Quaternion.prototype.conj = function(out){
        out = out || register;
        return out.setWXYZ(
            this.w,
            -this.x,
            -this.y,
            -this.z
        );
    };

    Quaternion.prototype.normalize = function(out){
        out = out || register;
        var norm = this.norm();
        if (Math.abs(norm) < 1e-7)
            return out.setWXYZ(1,0,0,0);
        else
            return this.scalarDivide(norm, out);
    };

    Quaternion.prototype.makeFromAngleAndAxis = function(angle, v){
        v.normalize(1, v);
        var ha = angle*0.5;
        var s = Math.sin(ha);
        this.x = s*v.x;
        this.y = s*v.y;
        this.z = s*v.z;
        this.w = Math.cos(ha);
        return this;
    };

    Quaternion.prototype.getAngle = function(){
        return 2*Math.acos(this.w);
    };

    Quaternion.prototype.getAxis = function(){
        //sin(acos(x)) = sqrt(1 - x^2)
        var w = this.w;
        if (w >= 1) return [0,0,0]
        else {
            var s = 1 / Math.sqrt(1 - w*w);
            return [s*this.x, s*this.y, this.z];
        };
    };

    Quaternion.prototype.setWXYZ = function(w,x,y,z){
        register.clear();
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };

    Quaternion.prototype.set = function(v){
        if (v instanceof Array){
            this.w = v[0];
            this.x = v[1];
            this.y = v[2];
            this.z = v[3];
        }
        else{
            this.w = v.w;
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
        }
        if (this !== register) register.clear();
        return this;
    };

    Quaternion.prototype.put = function(quat){
        quat.set(register);
    };

    Quaternion.prototype.clone = function(){
        return new Quaternion(this);
    };

    Quaternion.prototype.clear = function(){
        this.w = 1.0;
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        return this;
    };

    Quaternion.prototype.isEqual = function(q){
        return (q.w == this.w && q.x == this.x && q.y == this.y && q.z == this.z);
    };

    Quaternion.prototype.dot = function(q){
        return (this.w*q.w + this.x*q.x + this.y*q.y + this.z*q.z);
    };

    Quaternion.prototype.normSquared = function(){
        return this.dot(this);
    };

    Quaternion.prototype.norm = function(){
        return Math.sqrt(this.normSquared());
    };

    Quaternion.prototype.isZero = function(){
        return !(this.x || this.y || this.z || this.w != 1);
    };

    Quaternion.prototype.zeroRotation = function(){
        this.x = 0; this.y = 0; this.z = 0; this.w = 1.0;
        return this;
    };

    Quaternion.prototype.getMatrix = function(){
        var inv_norm = 1 / this.norm();
        var x = this.x * inv_norm,
            y = this.y * inv_norm,
            z = this.z * inv_norm,
            w = this.w * inv_norm;

        //TODO: correct for y-axis direction
        return [
            1 - 2*y*y - 2*z*z,
              - 2*x*y - 2*z*w,
                2*x*z - 2*y*w,
            0,
              - 2*x*y + 2*z*w,
            1 - 2*x*x - 2*z*z,
              - 2*y*z - 2*x*w,
            0,
                2*x*z + 2*y*w,
              - 2*y*z + 2*x*w,
            1 - 2*x*x - 2*y*y,
            0,
            0,
            0,
            0,
            1
        ];
    };

    var epsilon  = 1e-5;
    Quaternion.prototype.slerp = function(q, t, out){
        out = out || register;
        var omega, cosomega, sinomega, scaleFrom, scaleTo;

        cosomega = this.dot(q);

        if (cosomega < 0.0) cosomega *= -1;

        if( (1.0 - cosomega) > epsilon ){
            omega       = Math.acos(cosomega);
            sinomega    = Math.sin(omega);
            scaleFrom   = Math.sin( (1.0 - t) * omega ) / sinomega;
            scaleTo     = Math.sin( t * omega ) / sinomega;
        }
        else {
            scaleFrom   = 1.0 - t;
            scaleTo     = t;
        };

        return this.scalarMult(scaleFrom/scaleTo).add(q).mult(scaleTo, out);
    };

    module.exports = Quaternion;

});