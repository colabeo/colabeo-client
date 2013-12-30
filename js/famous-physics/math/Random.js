define(function(require, exports, module) {
    /**
     * @namespace Random
     *
     * @description
     *  Extremely simple uniform random number generator wrapping Math.random.
     *
     * @name Random
     *
     */

    function _randomFloat(min,max){ return min + Math.random() * (max - min); };
    function _randomInteger(min,max){ return Math.floor(min + Math.random() * (max - min + 1)); };

    module.exports = {

        /**
         * Get single random int between min and max (inclusive), or array
         *   of size dim if specified
         * @name FamousMatrix#int
         * @function
         * @param {number} min
         * @param {number} max
         * @param {number} max
         * @returns {number} random integer, or optionally an array
         */
        integer : function(min,max,dim){
            min = (min !== undefined) ? min : 0;
            max = (max !== undefined) ? max : 1;
            if (dim !== undefined){
                var result = [];
                for (var i = 0; i < dim; i++) result.push(_randomInteger(min,max));
                return result;
            }
            else return _randomInteger(min,max);
        },

        /**
         * Get single random float between min and max (inclusive), or array
         *   of size dim if specified
         * @name FamousMatrix#range
         * @function
         * @param {number} min
         * @param {number} max
         * @returns {number} random float, or optionally an array
         */
        range : function(min,max,dim){
            min = (min !== undefined) ? min : 0;
            max = (max !== undefined) ? max : 1;
            if (dim !== undefined){
                var result = [];
                for (var i = 0; i < dim; i++) result.push(_randomFloat(min,max));
                return result;
            }
            else return _randomFloat(min,max);
        },


        /**
         * Return random sign, either -1 or 1
         *
         * @name FamousMatrix#sign
         * @function
         * @param {number} prob probability of returning 1
         * @returns {number} random sign
         */
        sign : function(prob){
            prob = (prob !== undefined) ? prob : 0.5;
            return (Math.random() < prob) ? 1 : -1;
        },


        /**
         * Return random bool, either true or false
         *
         * @name FamousMatrix#boolean
         * @function
         * @param {number} prob probability of returning true
         * @returns {boolean} random bool
         */
        bool : function(prob){
            prob = (prob !== undefined) ? prob : 0.5;
            return Math.random() < prob;
        }

    };

});