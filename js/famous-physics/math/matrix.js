define(function(require, exports, module) {

    /**
     * @class A class for general NxM matrix manipulation.
     *
     * @description TODO
     *
     * * Class/Namespace TODOs
     *   * Is the main difference between this and FamousMatrix
     *     the assumptions made by FamousMatrix for speed? 
     *   *  Why is this lower-case file "matrix.js"? 
     *   *  Why is this JS object code style different from the other style 
     *      of Matrix.prototype.loop = function...
     * 
     * Create empty matrix (for this constructor) and optionally fill with fn(row, col)
     * for each row, col.
     * @name Matrix
     * @constructor
     */ 
    function Matrix(nRows, nCols, values, fn){
        this.nRows = nRows;
        this.nCols = nCols;
        this.values = values || [[]];

        if (fn) this.loop(fn);
    };

    // TODO: Why is this JS object style different from the other style 
    // of Matrix.prototype.loop = function...
    Matrix.prototype = {
        /**
         * Apply fn(row,col) to generate each (row, col) entry in the Matrix.
         * @name Matrix#loop
         * @function
         */
        loop : function(fn){
            var M = this.values;
            for (var row = 0; row < this.nRows; row++){
                M[row] = [];
                for (var col = 0; col < this.nCols; col++)
                    M[row][col] = fn(row,col);
            };
            return this;
        },

        /**
         * Set matrix values to provided two-dimensional array.
         *
         * * TODOs:
         *   * This has to be an internal, since this doesn't reset 
         *     nRows and nCols.
         * @name Matrix#set
         * @function
         */
        set : function(values){
            this.values = values;
            return this;
        },

        /**
         * Set matrix values to provided two-dimensional array.
         * 
         * * TODOs:
         *   * Rename to generate() or similar.  The object has already
         *     been "created" by the time we get here.
         * @name Matrix#create
         * @function
         */
        create : function(fn){
            return this.loop(fn);
        },

        /**
         * Turn this matrix into an identity matrix.
         *
         * * TODOs:
         *   * Should we throw error if not a square?
         *   * Should rename function, since Matrix.identity() looks awkward. It 
         *     sounds like a static variable, not a function.  
         *     More like generateIdentity().
         * @name Matrix#identity
         * @function
         */
        identity : function(){
            return this.loop(function(row,col){
                if (row == col) return 1;
                else return 0;
            });
        },

       /**
         * Pretty print content of matrix to console.
         *
         * * TODOs:
         *   * We need to get rid of eval() here for sure.  Definitnely a security
         *     risk, since the input to the matrix is not even "type"-checked as numeric.
         * @name Matrix#print
         * @function
         */
        print : function(){
            for (var row = 0; row < this.nRows; row++){
                var str = 'console.log(';
                for (var col = 0; col < this.nCols; col++){
                    str += 'this.values[' + row + '][' + col + '].toFixed(1)';
                    if (col < this.nCols-1) str += ',';
                }
                str += ')';
                eval(str);
            };
        },

       /**
         * Take this matrix A, input matrix B, and return matrix product A*B.
         * Note: If not a valid multiplication, this function proceeds anyway.
         * @name Matrix#rightMult
         * @function
         */
        rightMult : function(M2, out){

            if (M2.nRows != this.nCols) console.warn('cant multiply');

            var vals1 = this.values;
            var vals2 = M2.values;
            var nRows = this.nRows;
            var nCols = M2.nCols;

            var vals = [];
            for (var row = 0; row < nRows; row++){
                vals[row] = [];
                for (var col = 0; col < nCols; col++){
                    var sum = 0;
                    for (var i = 0; i < this.nCols; i++){
                        sum += vals1[row][i] * vals2[i][col];
                    }
                    vals[row][col] = sum;
                };
            };

            if (out) return out.set(vals);
            else return new Matrix(nRows, nCols).set(vals);
        },

       /**
         * Take this matrix A, input array V interpreted as a column vector, 
         *   and return matrix product A*V.
         *
         * * TODOs:
         *   * This may be confusing if public: v is not a Matrix nor a Vector.
         * @name Matrix#vMult
         * @function
         */
        vMult : function(v){
            var n = v.length;
            var Mv = [];
            for (var row = 0; row < this.nRows; row++){
                var sum = 0;
                for (var i = 0; i < n; i++) sum += this.values[row][i] * v[i]
                Mv[row] = sum;
            };
            return Mv;
        },


       /**
         * Modify this matrix to diagnonal matrix with element (i,i) replaced with 
         *   the ith element of input array.
         * 
         * * TODOs:
         *   * This may be confusing if public: v is not a Matrix nor a Vector.
         * @name Matrix#diag
         * @function
         */
        diag : function(diagonal){
            var fn = function(row,col){
                if (row == col) return diagonal[row];
                else return 0;
            };
            return this.loop(fn);
        },

       /**
         * Creates (or modifies "out" to) a Matrix which is the transpose of this.
         * @name Matrix#transpose
         * @function
         */
        transpose : function(out){
            var fun = function(row,col){
                return this.values[col][row];
            }.bind(this);

            if (out)
                return out.loop(fun); //only for square matrices!
            else
                return new Matrix(this.nCols, this.nRows, [[]], fun);
        }
    };

    module.exports = Matrix;
});