define(function(require, exports, module) {

    /**
     * @class A linear equation solver using the Gauss-Seidel method.
     *
     * @description Solves for x in the matrix equation Mx = b for positive-definite
     *   matrices with lower resources than standard Gaussian elimination.
     *   
     * * TODOs:
     *   * Should calcError really be a private method?
     *   * Along those lines, should this simply be a static function rather than 
     *     an object?  Why construct it without M and b, also? 
     *     
     * @name GaussSeidel
     * @constructor
     */ 
    function GaussSeidel(numIterations, tolerance){
        this.numIterations  = numIterations || 10;
        this.tolerance      = tolerance || 1e-7;
        this.prevX          = [];
        this.x              = [];
    }

    function calcError(){
        var err = 0;
        var n = this.x.length;

        for (var i = 0; i < n; i++)
            err += Math.pow(this.prevX[i] - this.x[i],2) / (this.x[i] * this.x[i]);
        return Math.sqrt(err);
    }

    /**
     * Given two-dimensional array ("matrix") M and array ("column vector")
     * b, solve for "column vector" x.
     *
     * @name GaussSeidel#solve
     * @function
     * @returns {Array.<number>}
     */
    GaussSeidel.prototype.solve = function(M, b){

        var numIterations = this.numIterations;
        var n = b.length;
        var x = this.x;
        var prevX = this.prevX;
        var sigma;

        //init x
        for (var i = 0; i < n; i++) this.x[i] = 0;

        //iteration
        var iteration = 0;
        var err = Infinity;
        while (iteration < numIterations && err > this.tolerance){

            for (var i = 0; i < n; i++){

                prevX[i] = x[i];
                sigma = 0;

                for (var j = 0; j < n; j++){
                    if (j != i)
                        sigma += M[i][j] * x[j];
                };

                x[i] = (b[i] - sigma) / M[i][i];

            };

            err = calcError();
            iteration++;

        };

        return x;

    };

    module.exports = GaussSeidel;

});