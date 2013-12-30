define(function(require, exports, module) {
    /**
     * @namespace Utility
     * 
     * @description This namespace holds standalone functionality. 
     *    Currently includes 
     *    name mapping for transition curves, name mapping for origin 
     *    pairs, and the after() function.
     *    
     * @static
     * @name Utility
     */
    var Utility = {};

    /**
     * Transition curves mapping independent variable t from domain [0,1] to a
     *    range within [0,1]. Includes functions 'linear', 'easeIn', 'easeOut',
     *    'easeInOut', 'easeOutBounce', 'spring'.
     *    
     * @name Utility#curves
     * @field
     */
    Utility.Curve = {
        linear: function(t) { return t; },
        easeIn: function(t) { return t*t; },
        easeOut: function(t) { return t*(2-t); },
        easeInOut: function(t) {
            if(t <= 0.5) return 2*t*t;
            else return -2*t*t + 4*t - 1;
        },
        easeOutBounce: function(t) { return t*(3 - 2*t); },
        spring: function(t) { return (1 - t) * Math.sin(6 * Math.PI * t) + t; }
    };

    Utility.Direction = {
        X: 0,
        Y: 1,
        Z: 2
    };

    /**
     * Table of strings mapping origin string types to origin pairs. Includes
     *    concepts of center and combinations of top, left, bottom, right, as
     *    'tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'.
     *    
     * @name Utility#origins
     * @field
     */
    Utility.Origin = {
        'tl': [0, 0],
        't': [0.5, 0],
        'tr': [1, 0],
        'l': [0, 0.5],
        'c': [0.5, 0.5],
        'r': [1, 0.5],
        'bl': [0, 1],
        'b': [0.5, 1],
        'br': [1, 1]
    };

    /** 
     * Return wrapper around callback function. Once the wrapper is called N
     *    times, invoke the callback function. Arguments and scope preserved.
     *    
     * @name Utility#after
     * @function 
     * @param {number} count number of calls before callback function invoked
     * @param {Function} callback wrapped callback function
     */
    Utility.after = function(count, callback) {
        var counter = count;
        return function() {
            counter--;
            if(counter === 0) callback.apply(this, arguments);
        };
    };

    /**
     * Load a URL and return its contents in a callback
     * 
     * @name Utility#loadURL
     * @function
     * @param {string} url URL of object
     * @param {function} callback callback to dispatch with content
     */
    Utility.loadURL = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(this.readyState == 4) {
                if(callback) callback(this.responseText);
            }
        };
        xhr.open('GET', url);
        xhr.send();
    };

    /** @const */ Utility.transformInFrontMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1];
    Utility.transformInFront = {
        render: function(input) {
            return {transform: Utility.transformInFrontMatrix, target: input};
        }
    };

    /** @const */ Utility.transformBehindMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 1];
    Utility.transformBehind = {
        render: function(input) {
            return {transform: Utility.transformBehindMatrix, target: input};
        }
    };

    /**
     * Create a new component based on an existing component configured with custom options
     *
     * @name Utility#customizeComponent
     * @function
     * @param {Object} component Base component class
     * @param {Object} customOptions Options to apply
     * @param {function} initialize Initialization function to run on creation
     * @returns {Object} customized component
     */
    Utility.customizeComponent = function(component, customOptions, initialize) {
        var result = function(options) {
            component.call(this, customOptions);
            if(options) this.setOptions(options);
            if(initialize) initialize.call(this);
        };
        result.prototype = Object.create(component.prototype);
        return result;
    };


    module.exports = Utility;
});
