define(function(require, exports, module) {

    /**
     * @class An immutable three-element floating point vector.
     *
     * @description Note that if not using the "out" parameter,
     *    then funtions return a common reference to an internal register.
     *    
     * * Class/Namespace TODOs:
     *   * Are there any vector STANDARDS in JS that we can use instead of our own library?
     *   * Is it confusing that this is immutable?
     *   * All rotations are counter-clockwise in a right-hand system.  Need to doc this 
     *     somewhere since Famous render engine's rotations are left-handed (clockwise)
     * 
     * Constructor: Take three elts or an array and make new vec.
     *    
     * @name Vector
     * @constructor
     */ 
    function Vector(x,y,z){
        if (arguments.length === 1) this.set(x)
        else{
            this.x = x || 0.0;
            this.y = y || 0.0;
            this.z = z || 0.0;
        };
        return this;
    };

    var register = new Vector(0,0,0);

    /**
     * Add to another Vector, element-wise.
     *
     * @name Vector#add
     * @function
     * @returns {Vector}
     */
    Vector.prototype.add = function(v, out){
        out = out || register;
        return out.setXYZ(
            this.x + (v.x || 0.0),
            this.y + (v.y || 0.0),
            this.z + (v.z || 0.0)
        );
    };

    /**
     * Subtract from another Vector, element-wise.
     *    
     * @name Vector#sub
     * @function
     * @returns {Vector}
     */
    Vector.prototype.sub = function(v, out){
        out = out || register;
        return out.setXYZ(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    };

    /**
     * Scale Vector by floating point r.
     *    
     * @name Vector#mult
     * @function
     * @returns {number}
     */
    Vector.prototype.mult = function(r, out){
        out = out || register;
        return out.setXYZ(
            r * this.x,
            r * this.y,
            r * this.z
        );
    };

    /**
     * Scale Vector by floating point 1/r.
     *    
     * @name Vector#div
     * @function
     * @returns {number}
     */
    Vector.prototype.div = function(r, out){
        return this.mult(1/r, out);
    };

    /**
     * Return cross product with another Vector
     *    
     * @name Vector#cross
     * @function
     * @returns {Vector}
     */
    Vector.prototype.cross = function(v, out){
        out = out || register;
        return out.setXYZ(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );

        //corrects for reversed y-axis
//        return out.setXYZ(
//            -this.y * v.z + this.z * v.y,
//             this.z * v.x - this.x * v.z,
//            -this.x * v.y + this.y * v.x
//        );
    };

    /**
     * Component-wise equality test between this and Vector v.
     * @name Vector#equals
     * @function
     * @returns {boolean}
     */
    Vector.prototype.equals = function(v){
        return (v.x == this.x && v.y == this.y && v.z == this.z);
    };

    /**
     * Rotate counter-clockwise around x-axis by theta degrees.
     *
     * @name Vector#rotateX
     * @function
     * @returns {Vector}
     */
    Vector.prototype.rotateX = function(theta, out){
        out = out || register;
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

    /**
     * Rotate counter-clockwise around y-axis by theta degrees.
     *
     * @name Vector#rotateY
     * @function
     * @returns {Vector}
     */
    Vector.prototype.rotateY = function(theta, out){
        out = out || register;
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

    /**
     * Rotate counter-clockwise around z-axis by theta degrees.
     *
     * @name Vector#rotateZ
     * @function
     * @returns {Vector}
     */
    Vector.prototype.rotateZ = function(theta, out){
        out = out || register;
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

    /**
     * Take dot product of this with a second Vector
     *       
     * @name Vector#dot
     * @function
     * @returns {number}
     */
    Vector.prototype.dot = function(v){
        return this.x * v.x + this.y * v.y + this.z * v.z;
    };

    /**
     * Take dot product of this with a this Vector
     *
     * @name Vector#normSquared
     * @function
     * @returns {number}
     */
    Vector.prototype.normSquared = function(){
        return this.dot(this);
    };

    /**
     * Find Euclidean length of the Vector.
     *       
     * @name Vector#norm
     * @function
     * @returns {number}
     */
    Vector.prototype.norm = function(){
        return Math.sqrt(this.normSquared());
    };

    /**
     * Scale Vector to specified length.
     * If length is less than internal tolerance, set vector to [length, 0, 0].
     * 
     * * TODOs: 
     *    * There looks to be a bug or unexplained behavior in here.  Why would
     *      we defer to a multiple of e_x for being below tolerance?
     *  
     * @name Vector#normalize
     * @function
     * @returns {Vector}
     */
    Vector.prototype.normalize = function(length, out){
        length  = (length !== undefined) ? length : 1.0;
        out     = out || register;

        var tolerance = 1e-7;
        var norm = this.norm();

        if (Math.abs(norm) > tolerance) return this.mult(length / norm, out);
        else return out.setXYZ(length, 0.0, 0.0);
    };

    /**
     * Make a separate copy of the Vector.
     *
     * @name Vector#clone
     * @function
     * @returns {Vector}
     */
    Vector.prototype.clone = function(){
        return new Vector(this);
    };

    /**
     * True if and only if every value is 0 (or falsy)
     *
     * @name Vector#isZero
     * @function
     * @returns {boolean}
     */
    Vector.prototype.isZero = function(){
        return !(this.x || this.y || this.z);
    };

    /**
     * Set this Vector to the values in the provided Array or Vector.
     *
     * TODO: set from Array disambiguation
     *
     * @name Vector#set
     * @function
     * @returns {Vector}
     */
    Vector.prototype.set = function(v){
        if (v instanceof Array){
            this.setFromArray(v);
        }
        else{
            this.x = v.x;
            this.y = v.y;
            this.z = v.z || 0.0;
        }
        if (this !== register) register.clear();
        return this;
    };

    Vector.prototype.setFromArray = function(v){
        this.x = v[0];
        this.y = v[1];
        this.z = v[2] || 0.0;
    };

    /**
     * Put result of last internal calculation in 
     *   specified output vector.
     *
     * @name Vector#put
     * @function
     * @returns {Vector}
     */
    Vector.prototype.put = function(v){
        v.set(register);
    };

    /**
     * Set elements directly and clear internal register.
     *   This is the a "mutating" method on this Vector.
     *  
     *
     * @name Vector#setXYZ
     * @function
     */
    Vector.prototype.setXYZ = function(x,y,z){
        register.clear();
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };

    /**
     * Set elements to 0.
     *
     * @name Vector#clear
     * @function
     */
    Vector.prototype.clear = function(){
        this.x = 0;
        this.y = 0;
        this.z = 0;
    };

    /**
     * Scale this Vector down to specified "cap" length.
     * If Vector shorter than cap, or cap is Infinity, do nothing.
     *
     * 
     * @name Vector#cap
     * @function
     * @returns {Vector}
     */
    Vector.prototype.cap = function(cap, out){
        if (cap === Infinity) return this;
        out = out || register;
        var norm = this.norm();
        if (norm > cap) return this.normalize(cap, out);
        else return this;
    };

    /**
     * Return projection of this Vector onto another.
     * 
     * @name Vector#project
     * @function
     * @returns {Vector}
     */
    Vector.prototype.project = function(n, out){
        out = out || register;
        return n.mult(this.dot(n), out);
    };

    /**
     * Reflect this Vector across provided vector.
     *
     * @name Vector#reflect
     * @function
     */
    Vector.prototype.reflectAcross = function(n, out){
        out = out || register;
        n.normalize();
        return this.sub(this.project(n).mult(2), out);
    };

    /**
     * Convert Vector to three-element array.
     * 
     * * TODOs: 
     *   * Why do we have this and get()?
     *       
     * @name Vector#toArray
     * @function
     */
    Vector.prototype.toArray = function(){
        return [this.x, this.y, this.z];
    };

    /**
     * Convert Vector to three-element array.
     * 
     * * TODOs: 
     *   * Why do we have this and toArray()?
     *           
     * @name Vector#get
     * @function
     */
    Vector.prototype.get = function(){
        return this.toArray();
    };

    module.exports = Vector;

});
