define(function(require, exports, module) {
    /**
     * @namespace FamousMatrix
     * 
     * @description 
     *  * A high-performance matrix math library used to calculate 
     *   affine transforms on surfaces and other renderables.
     *   Famous uses 4x4 matrices corresponding directly to
     *   WebKit matrices (row-major order)
     *    
     *    The internal "type" of a FamousMatrix is a 16-long float array in 
     *    row-major order, with:
     *      * elements [0],[1],[2],[4],[5],[6],[8],[9],[10] forming the 3x3
     *          transformation matrix
     *      * elements [12], [13], [14] corresponding to the t_x, t_y, t_z 
     *          affine translation.
     *      * element [15] always set to 1.
     * 
     * Scope: Ideally, none of these functions should be visible below the 
     * component developer level.
     *
     * @static
     * 
     * @name FamousMatrix
     */
    var FamousMatrix = {};

    // WARNING: these matrices correspond to WebKit matrices, which are
    //    transposed from their math counterparts
    FamousMatrix.precision = 1e-6;
    FamousMatrix.identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    /**
     * Multiply two or more FamousMatrix types to return a FamousMatrix.
     *
     * @name FamousMatrix#multiply4x4
     * @function
     * @param {FamousMatrix} a left matrix
     * @param {FamousMatrix} b right matrix
     * @returns {FamousMatrix} the resulting matrix
     */
    FamousMatrix.multiply4x4 = function multiply4x4(a, b) {
        var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        result[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
        result[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
        result[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
        result[3] = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];
        result[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
        result[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
        result[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
        result[7] = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];
        result[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
        result[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
        result[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
        result[11] = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];
        result[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
        result[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
        result[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
        result[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
        if(arguments.length <= 2)  return result;
        else return multiply4x4.apply(null, [result].concat(Array.prototype.slice.call(arguments, 2)));
    };

    /**
     * Fast-multiply two or more FamousMatrix types to return a
     *    FamousMatrix, assuming right column on each is [0 0 0 1]^T.
     *    
     * @name FamousMatrix#multiply
     * @function
     * @param {FamousMatrix} a left matrix
     * @param {FamousMatrix} b right matrix
     * @param {...FamousMatrix} c additional matrices to be multiplied in 
     *    order
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.multiply = function multiply(a, b, c) {
        if(!a || !b) return a || b;
        var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        result[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8];
        result[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9];
        result[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10];
        result[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8];
        result[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9];
        result[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10];
        result[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8];
        result[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9];
        result[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10];
        result[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + b[12];
        result[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + b[13];
        result[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + b[14];
        if(arguments.length <= 2)  return result;
        else return multiply.apply(null, [result].concat(Array.prototype.slice.call(arguments, 2)));
    };

    /**
     * Return a FamousMatrix translated by additional amounts in each
     *    dimension.
     *    
     * @name FamousMatrix#move
     * @function
     * @param {FamousMatrix} m a matrix
     * @param {Array.<number>} t delta vector (array of floats && 
     *    array.length == 2 || 3)
     * @returns {FamousMatrix} the resulting translated matrix
     */ 
    FamousMatrix.move = function(m, t) {
        if(!t[2]) t[2] = 0;
        return [m[0], m[1], m[2], 0, m[4], m[5], m[6], 0, m[8], m[9], m[10], 0, m[12] + t[0], m[13] + t[1], m[14] + t[2], 1];
    };

    /**
     * Return a FamousMatrix which represents the result of a transform matrix
     * applied after a move. This is faster than the equivalent multiply.
     * 
     * @name FamousMatrix#moveThen
     * @function
     *
     * @param {Array.number} v vector representing initial movement
     * @param {FamousMatrix} m matrix to apply afterwards
     * @returns {FamousMatrix} the resulting matrix
     */
    FamousMatrix.moveThen = function(v, m) {
        if(!v[2]) v[2] = 0;
        var t0 = v[0]*m[0] + v[1]*m[4] + v[2]*m[8];
        var t1 = v[0]*m[1] + v[1]*m[5] + v[2]*m[9];
        var t2 = v[0]*m[2] + v[1]*m[6] + v[2]*m[10];
        return FamousMatrix.move(m, [t0, t1, t2]);
    };

    /**
     * Return a FamousMatrix which represents a translation by specified
     *    amounts in each dimension.
     *    
     * @name FamousMatrix#translate
     * @function
     * @param {number} x x translation (delta_x)
     * @param {number} y y translation (delta_y)
     * @param {number} z z translation (delta_z)
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.translate = function(x, y, z) {
        if(z === undefined) z = 0;
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
    };

    /**
     * Return a FamousMatrix which represents a scale by specified amounts
     *    in each dimension.
     *    
     * @name FamousMatrix#scale
     * @function  
     *
     * @param {number} x x scale factor
     * @param {number} y y scale factor
     * @param {number} z z scale factor
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.scale = function(x, y, z) {
        if(z === undefined) z = 1;
        return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
    };

    /**
     * Return a FamousMatrix which represents a specified clockwise
     *    rotation around the x axis.
     *    
     * @name FamousMatrix#rotateX
     * @function
     *
     * @param {number} theta radians
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.rotateX = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [1, 0, 0, 0, 0, cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1];
    };

    /**
     * Return a FamousMatrix which represents a specified clockwise
     *    rotation around the y axis.
     *    
     * @name FamousMatrix#rotateY
     * @function
     *
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.rotateY = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [cosTheta, 0, -sinTheta, 0, 0, 1, 0, 0, sinTheta, 0, cosTheta, 0, 0, 0, 0, 1];
    };

    /**
     * Return a FamousMatrix which represents a specified clockwise
     *    rotation around the z axis.
     *    
     * @name FamousMatrix#rotateZ
     * @function
     *
     * @param {number} theta radians
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.rotateZ = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    };

    /**
     * Return a FamousMatrix which represents composed clockwise
     *    rotations along each of the axes. Equivalent to the result of
     *    multiply(rotateX(phi), rotateY(theta), rotateZ(psi))
     *    
     * @name FamousMatrix#rotate
     * @function
     *
     * @param {number} phi radians to rotate about the positive x axis
     * @param {number} theta radians to rotate about the positive y axis
     * @param {number} psi radians to rotate about the positive z axis
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.rotate = function(phi, theta, psi) {
        var cosPhi = Math.cos(phi);
        var sinPhi = Math.sin(phi);
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var cosPsi = Math.cos(psi);
        var sinPsi = Math.sin(psi);
        var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        result[0] = cosTheta * cosPsi;
        result[1] = cosPhi * sinPsi + sinPhi * sinTheta * cosPsi;
        result[2] = sinPhi * sinPsi - cosPhi * sinTheta * cosPsi;
        result[4] = -cosTheta * sinPsi;
        result[5] = cosPhi * cosPsi - sinPhi * sinTheta * sinPsi;
        result[6] = sinPhi * cosPsi + cosPhi * sinTheta * sinPsi;
        result[8] = sinTheta;
        result[9] = -sinPhi * cosTheta;
        result[10] = cosPhi * cosTheta;
        return result;
    };

    /**
     * Return a FamousMatrix which represents an axis-angle rotation
     *
     * @name FamousMatrix#rotateAxis
     * @function
     *
     * @param {Array.number} v unit vector representing the axis to rotate about
     * @param {number} theta radians to rotate clockwise about the axis
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.rotateAxis = function(v, theta) {
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var verTheta = 1 - cosTheta; // versine of theta

        var xxV = v[0]*v[0]*verTheta;
        var xyV = v[0]*v[1]*verTheta;
        var xzV = v[0]*v[2]*verTheta;
        var yyV = v[1]*v[1]*verTheta;
        var yzV = v[1]*v[2]*verTheta;
        var zzV = v[2]*v[2]*verTheta;
        var xs = v[0]*sinTheta;
        var ys = v[1]*sinTheta;
        var zs = v[2]*sinTheta;

        var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        result[0] = xxV + cosTheta;
        result[1] = xyV + zs;
        result[2] = xzV - ys;
        result[4] = xyV - zs;
        result[5] = yyV + cosTheta;
        result[6] = yzV + xs;
        result[8] = xzV + ys;
        result[9] = yzV - xs;
        result[10] = zzV + cosTheta;
        return result;
    };

    /**
     * Return a FamousMatrix which represents a transform matrix applied about
     * a separate origin point.
     * 
     * @name FamousMatrix#aboutOrigin
     * @function
     *
     * @param {Array.number} v origin point to apply matrix
     * @param {FamousMatrix} m matrix to apply
     * @returns {FamousMatrix} the resulting matrix
     */
    FamousMatrix.aboutOrigin = function(v, m) {
        var t0 = v[0] - (v[0]*m[0] + v[1]*m[4] + v[2]*m[8]);
        var t1 = v[1] - (v[0]*m[1] + v[1]*m[5] + v[2]*m[9]);
        var t2 = v[2] - (v[0]*m[2] + v[1]*m[6] + v[2]*m[10]);
        return FamousMatrix.move(m, [t0, t1, t2]);
    };

    /**
     * Return a FamousMatrix's webkit css representation to be used with the
     *    CSS3 -webkit-transform style. 
     * @example: -webkit-transform: matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,716,243,0,1)
     *
     * @name FamousMatrix#formatCSS
     * @function
     * 
     * @param {FamousMatrix} m a Famous matrix
     * @returns {string} matrix3d CSS style representation of the transform
     */ 
    FamousMatrix.formatCSS = function(m) {
        var n = m.slice(0);
        for(var i = 0; i < n.length; i++) if(n[i] < 0.000001 && n[i] > -0.000001) n[i] = 0;
        return 'matrix3d(' + n.join() + ')';
    };

    /**
     * Return a FamousMatrix representatikon of a skew transformation
     *
     * @name FamousMatrix#skew
     * @function
     * 
     * @param {number} psi radians skewed about the yz plane
     * @param {number} theta radians skewed about the xz plane
     * @param {number} phi radians skewed about the xy plane
     * @returns {FamousMatrix} the resulting matrix
     */ 
    FamousMatrix.skew = function(phi, theta, psi) {
        return [1, 0, 0, 0, Math.tan(psi), 1, 0, 0, Math.tan(theta), Math.tan(phi), 1, 0, 0, 0, 0, 1];
    };

    /**
     * Return translation vector component of given FamousMatrix
     * 
     * @name FamousMatrix#getTranslate
     * @function
     *
     * @param {FamousMatrix} m matrix
     * @returns {Array.<number>} the translation vector [t_x, t_y, t_z]
     */ 
    FamousMatrix.getTranslate = function(m) {
        return [m[12], m[13], m[14]];
    };

    /**
     * Return inverse affine matrix for given FamousMatrix. 
     * Note: This assumes m[3] = m[7] = m[11] = 0, and m[15] = 1. 
     *       Incorrect results if not invertable or preconditions not met.
     *
     * @name FamousMatrix#inverse
     * @function
     * 
     * @param {FamousMatrix} m matrix
     * @returns {FamousMatrix} the resulting inverted matrix
     */ 
    FamousMatrix.inverse = function(m) {
        var result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];
        // only need to consider 3x3 section for affine
        var c0 = m[5]*m[10] - m[6]*m[9];
        var c1 = m[4]*m[10] - m[6]*m[8];
        var c2 = m[4]*m[9] - m[5]*m[8];
        var c4 = m[1]*m[10] - m[2]*m[9];
        var c5 = m[0]*m[10] - m[2]*m[8];
        var c6 = m[0]*m[9] - m[1]*m[8];
        var c8 = m[1]*m[6] - m[2]*m[5];
        var c9 = m[0]*m[6] - m[2]*m[4];
        var c10 = m[0]*m[5] - m[1]*m[4];
        var detM = m[0]*c0 - m[1]*c1 + m[2]*c2;
        var invD = 1/detM;
        result[0] = invD * c0;
        result[1] = -invD * c4;
        result[2] = invD * c8;
        result[4] = -invD * c1;
        result[5] = invD * c5;
        result[6] = -invD * c9;
        result[8] = invD * c2;
        result[9] = -invD * c6;
        result[10] = invD * c10;
        result[12] = -m[12]*result[0] - m[13]*result[4] - m[14]*result[8];
        result[13] = -m[12]*result[1] - m[13]*result[5] - m[14]*result[9];
        result[14] = -m[12]*result[2] - m[13]*result[6] - m[14]*result[10];
        return result;
    };

    /**
     * Decompose FamousMatrix into separate .translate, .rotate, .scale,
     *    .skew components.
     *    
     * @name FamousMatrix#interpret
     * @function
     *
     * @param {FamousMatrix} M matrix
     * @returns {matrixSpec} object with component matrices .translate,
     *    .rotate, .scale, .skew
     */ 
    FamousMatrix.interpret = function(M) {

        // QR decomposition via Householder reflections

        function normSquared(v){
            if (v.length == 2)
                return v[0]*v[0] + v[1]*v[1];
            else
                return v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
        };

        function norm(v){
            return Math.sqrt(normSquared(v));
        };

        function sign(n){
            return (n < 0) ? -1 : 1;
        };


        //FIRST ITERATION

        //default Q1 to the identity matrix;
        var x = [M[0], M[1], M[2]];                 // first column vector
        var sgn = sign(x[0]);                       // sign of first component of x (for stability)
        var xNorm = norm(x);                       // norm of first column vector
        var v = [x[0] + sgn * xNorm, x[1], x[2]];  // v = x + sign(x[0])|x|e1
        var mult = 2 / normSquared(v);              // mult = 2/v'v

        //evaluate Q1 = I - 2vv'/v'v
        var Q1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

        //diagonals
        Q1[0]  = 1 - mult * v[0] * v[0];    // 0,0 entry
        Q1[5]  = 1 - mult * v[1] * v[1];    // 1,1 entry
        Q1[10] = 1 - mult * v[2] * v[2];    // 2,2 entry

        //upper diagonal
        Q1[1] = -mult * v[0] * v[1];        // 0,1 entry
        Q1[2] = -mult * v[0] * v[2];        // 0,2 entry
        Q1[6] = -mult * v[1] * v[2];        // 1,2 entry

        //lower diagonal
        Q1[4] = Q1[1];                      // 1,0 entry
        Q1[8] = Q1[2];                      // 2,0 entry
        Q1[9] = Q1[6];                      // 2,1 entry

        //reduce first column of M
        var MQ1 = FamousMatrix.multiply(M, Q1);


        //SECOND ITERATION on (1,1) minor
        var x2 = [MQ1[5], MQ1[6]];
        var sgn2 = sign(x2[0]);                              // sign of first component of x (for stability)
        var x2Norm = norm(x2);                              // norm of first column vector
        var v2 = [x2[0] + sgn2 * x2Norm, x2[1]];            // v = x + sign(x[0])|x|e1
        var mult2 = 2 / normSquared(v2);                     // mult = 2/v'v

        //evaluate Q2 = I - 2vv'/v'v
        var Q2 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1];

        //diagonal
        Q2[5]  = 1 - mult2 * v2[0] * v2[0]; // 1,1 entry
        Q2[10] = 1 - mult2 * v2[1] * v2[1]; // 2,2 entry

        //off diagonals
        Q2[6] = -mult2 * v2[0] * v2[1];     // 2,1 entry
        Q2[9] = Q2[6];                      // 1,2 entry


        //calc QR decomposition. Q = Q1*Q2, R = Q'*M
        var Q = FamousMatrix.multiply(Q1, Q2);              //note: really Q transpose
        var R = FamousMatrix.multiply(M, Q);

        //remove negative scaling
        var remover = FamousMatrix.scale(R[0] < 0 ? -1 : 1, R[5] < 0 ? -1 : 1, R[10] < 0 ? -1 : 1);
        R = FamousMatrix.multiply(remover, R);
        Q = FamousMatrix.multiply(Q, remover);

        //decompose into rotate/scale/skew matrices
        var result = {};
        result.translate = FamousMatrix.getTranslate(M);
        result.rotate = [Math.atan2(-Q[6], Q[10]), Math.asin(Q[2]), Math.atan2(-Q[1], Q[0])];
        if(!result.rotate[0]) {
            result.rotate[0] = 0;
            result.rotate[2] = Math.atan2(Q[4], Q[5]);
        }
        result.scale = [R[0], R[5], R[10]];
        result.skew = [Math.atan(R[9]/result.scale[2]), Math.atan(R[8]/result.scale[2]), Math.atan(R[4]/result.scale[0])];

        //double rotation workaround
        if(Math.abs(result.rotate[0]) + Math.abs(result.rotate[2]) > 1.5*Math.PI) {
            result.rotate[1] = Math.PI - result.rotate[1];
            if(result.rotate[1] > Math.PI) result.rotate[1] -= 2*Math.PI;
            if(result.rotate[1] < -Math.PI) result.rotate[1] += 2*Math.PI;
            if(result.rotate[0] < 0) result.rotate[0] += Math.PI;
            else result.rotate[0] -= Math.PI;
            if(result.rotate[2] < 0) result.rotate[2] += Math.PI;
            else result.rotate[2] -= Math.PI;
        }   

        return result;

    };

    /**
     * Compose .translate, .rotate, .scale, .skew components into into
     *    FamousMatrix
     *    
     * @name FamousMatrix#build
     * @function
     *
     * @param {matrixSpec} spec object with component matrices .translate,
     *    .rotate, .scale, .skew
     * @returns {FamousMatrix} composed martix
     */ 
    FamousMatrix.build = function(spec) {
        var scaleMatrix = FamousMatrix.scale(spec.scale[0], spec.scale[1], spec.scale[2]);
        var skewMatrix = FamousMatrix.skew(spec.skew[0], spec.skew[1], spec.skew[2]);
        var rotateMatrix = FamousMatrix.rotate(spec.rotate[0], spec.rotate[1], spec.rotate[2]);
        return FamousMatrix.move(FamousMatrix.multiply(scaleMatrix, skewMatrix, rotateMatrix), spec.translate);
    };

    /**
     * Determine if two FamousMatrixes are component-wise equal
     * 
     * @name FamousMatrix#equals
     * @function
     * 
     * @param {FamousMatrix} a matrix
     * @param {FamousMatrix} b matrix
     * @returns {boolean} 
     */ 
    FamousMatrix.equals = function(a, b) {
        if(a === b) return true;
        if(!a || !b) return false;
        for(var i = 0; i < a.length; i++) if(a[i] != b[i]) return false;
        return true;
    };

    /**
     * Constrain angle-trio components to range of [-pi, pi).
     *
     * @name FamousMatrix#normalizeRotation
     * @function
     * 
     * @param {Array.<number>} rotation phi, theta, psi (array of floats 
     *    && array.length == 3)
     * @returns {Array.<number>} new phi, theta, psi triplet
     *    (array of floats && array.length == 3)
     */ 
    FamousMatrix.normalizeRotation = function(rotation) {
        var result = rotation.slice(0);
        if(result[0] == Math.PI/2 || result[0] == -Math.PI/2) {
            result[0] = -result[0];
            result[1] = Math.PI - result[1];
            result[2] -= Math.PI;
        }
        if(result[0] > Math.PI/2) {
            result[0] = result[0] - Math.PI;
            result[1] = Math.PI - result[1];
            result[2] -= Math.PI;
        }
        if(result[0] < -Math.PI/2) {
            result[0] = result[0] + Math.PI;
            result[1] = -Math.PI - result[1];
            result[2] -= Math.PI;
        }
        while(result[1] < -Math.PI) result[1] += 2*Math.PI;
        while(result[1] >= Math.PI) result[1] -= 2*Math.PI;
        while(result[2] < -Math.PI) result[2] += 2*Math.PI;
        while(result[2] >= Math.PI) result[2] -= 2*Math.PI;
        return result;
    };

    /**
     * Transform vector by a matrix, through right-multiplying by matrix.
     * 
     * @name FamousMatrix#vecMultiply
     * @function
     *
     * @param {Array.<number>} vec x,y,z vector 
     *    (array of floats && array.length == 3)
     * @param {FamousMatrix} m matrix
     * @returns {Array.<number>} the resulting vector
     *    (array of floats && array.length == 3)
     */ 
    FamousMatrix.vecMultiply = function(vec, m) {
        return [
            vec[0]*m[0] + vec[1]*m[4] + vec[2]*m[8] + m[12],
            vec[0]*m[1] + vec[1]*m[5] + vec[2]*m[9] + m[13],
            vec[0]*m[2] + vec[1]*m[6] + vec[2]*m[10] + m[14]
        ];
    };

    /** 
     * Apply visual perspective factor p to vector.
     *
     * @name FamousMatrix#applyPerspective
     * @function
     * @param {Array.<number>} vec x,y,z vector (array of floats && array.length == 3)
     * @param {number} p perspective factor
     * @returns {Array.<number>} the resulting x,y vector (array of floats 
     *    && array.length == 2)
     */
    FamousMatrix.applyPerspective = function(vec, p) {
        var scale = p/(p - vec[2]);
        return [scale * vec[0], scale * vec[1]];
    };

    module.exports = FamousMatrix;
});
