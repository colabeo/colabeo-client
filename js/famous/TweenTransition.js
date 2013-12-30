define(function(require, exports, module) {
    var Utility = require('famous/Utility');

    /**
     *
     * @class A state maintainer for a smooth transition between 
     *    numerically-specified states. 
     *
     * @description  Example numeric states include floats or
     *    {@link FamousMatrix} objects. TweenTransitions form the basis
     *    of {@link FamousTransform} objects.
     *
     * An initial state is set with the constructor or set(startValue). A
     *    corresponding end state and transition are set with set(endValue,
     *    transition). Subsequent calls to set(endValue, transition) begin at
     *    the last state. Calls to get(timestamp) provide the _interpolated state
     *    along the way.
     *
     * Note that there is no event loop here - calls to get() are the only way
     *    to find out state projected to the current (or provided) time and are
     *    the only way to trigger callbacks. Usually this kind of object would
     *    be part of the render() path of a visible component.
     *
     * @name TweenTransition
     * @constructor
     *   
     * @param {number|Array.<number>|Object.<number|string, number>} start 
     *    beginning state
     */
    function TweenTransition(options) {
        this.options = Object.create(TweenTransition.DEFAULT_OPTIONS);
        if(options) this.setOptions(options);

        this._startTime = 0;
        this._startValue = 0;
        this._updateTime = 0;
        this._endValue = 0;
        this._curve = undefined;
        this._duration = 0;
        this._active = false;
        this._callback = undefined;
        this.state = 0;
    };

    TweenTransition.SUPPORTS_MULTIPLE = true;
    TweenTransition.DEFAULT_OPTIONS = {
        curve: Utility.Curve.linear,
        duration: 500,
        speed: 0 /* considered only if positive */
    };

    var registeredCurves = {};

    /**
     * Add "unit" curve to internal dictionary of registered curves.
     * 
     * @name TweenTransition#registerCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @param {unitCurve} curve function of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     * @returns {boolean} false if key is taken, else true
     */
    TweenTransition.registerCurve = function(curveName, curve) {
        if(!registeredCurves[curveName]) {
            registeredCurves[curveName] = curve;
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * Remove object with key "curveName" from internal dictionary of registered
     *    curves.
     * 
     * @name TweenTransition#unregisterCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @returns {boolean} false if key has no dictionary value
     */
    TweenTransition.unregisterCurve = function(curveName) {
        if(registeredCurves[curveName]) {
            delete registeredCurves[curveName];
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * Retrieve function with key "curveName" from internal dictionary of
     *    registered curves. Default curves are defined in the 
     *    {@link Utility.Curve} array, where the values represent {@link
     *    unitCurve} functions.
     *    
     * @name TweenTransition#getCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @returns {unitCurve} curve function of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     */
    TweenTransition.getCurve = function(curveName) {
        return registeredCurves[curveName];
    };

    /**
     * Retrieve all available curves.
     *    
     * @name TweenTransition#getCurves
     * @function
     * @static
     * 
     * @returns {object} curve functions of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     */
    TweenTransition.getCurves = function() {
        return registeredCurves; 
    };

    /**
     * Interpolate: If a linear function f(0) = a, f(1) = b, then return f(t)
     *
     * 
     * @name _interpolate
     * @function
     * @static
     * @private 
     * @param {number} a f(0) = a
     * @param {number} b f(1) = b
     * @param {number} t independent variable 
     * @returns {number} f(t) assuming f is linear
     */ 
    function _interpolate(a, b, t) {
        return ((1 - t) * a) + (t * b);
    };

    function _clone(obj) {
        if(obj instanceof Object) {
            if(obj instanceof Array) return obj.slice(0);
            else return Object.create(obj); 
        }
        else return obj;
    };

    /**
     * Fill in missing properties in "transition" with those in defaultTransition, and
     *    convert internal named curve to function object, returning as new
     *    object.
     *    
     * 
     * @name _normalize
     * @function
     * @static
     * @private
     * 
     * @param {transition} transition shadowing transition
     * @param {transition} defaultTransition transition with backup properties
     * @returns {transition} newly normalized transition
     */ 
    function _normalize(transition, defaultTransition) {
        var result = {curve: defaultTransition.curve};
        if(defaultTransition.duration) result.duration = defaultTransition.duration;
        if(defaultTransition.speed) result.speed = defaultTransition.speed;
        if(transition instanceof Object) {
            if(transition.duration !== undefined) result.duration = transition.duration;
            if(transition.curve) result.curve = transition.curve;
            if(transition.speed) result.speed = transition.speed;
        }
        if(typeof result.curve === 'string') result.curve = TweenTransition.getCurve(result.curve);
        return result;
    };

    /**
     * Copy object to internal "default" transition. Missing properties in
     *    provided transitions inherit from this default.
     * 
     * @name TweenTransition#setOptions
     * @function
     *    
     * @param {transition} transition {duration: number, curve: f[0,1] -> [0,1]}
     */
    TweenTransition.prototype.setOptions = function(options) {
        if(options.curve !== undefined) this.options.curve = options.curve;
        if(options.duration !== undefined) this.options.duration = options.duration;
        if(options.speed !== undefined) this.options.speed = options.speed;
    };

    /**
     * Add transition to end state to the queue of pending transitions. Special
     *    Use: calling without a transition resets the object to that state with
     *    no pending actions
     * 
     * @name TweenTransition#set
     * @function
     *    
     * @param {number|FamousMatrix|Array.<number>|Object.<number, number>} endValue
     *    end state to which we _interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be 
     *    instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    TweenTransition.prototype.set = function(endValue, transition, callback) {
        if(!transition) {
            this.reset(endValue);
            if(callback) callback();
            return;
        }
        
        this._startValue = _clone(this.get());
        transition = _normalize(transition, this.options);
        if(transition.speed) {
            var startValue = this._startValue;
            if(startValue instanceof Object) {
                var variance = 0;
                for(var i in startValue) variance += (endValue[i] - startValue[i]) * (endValue[i] - startValue[i]);
                transition.duration = Math.sqrt(variance) / transition.speed;
            }
            else {
                transition.duration = Math.abs(endValue - startValue) / transition.speed;
            }
        }

        this._startTime = Date.now();
        this._endValue = _clone(endValue);
        this._duration = transition.duration;
        this._curve = transition.curve;
        this._active = true;
        this._callback = callback;
    };

    /**
     * Cancel all transitions and reset to a stable state
     *
     * @name TweenTransition#reset
     * @function
     *
     * @param {number|Array.<number>|Object.<number, number>} startValue
     *    stable state to set to
     */
    TweenTransition.prototype.reset = function(startValue) {
        if(this._callback) { 
            var callback = this._callback;
            this._callback = undefined;
            callback();
        }
        this.state = _clone(startValue);
        this._startTime = 0;
        this._duration = 0;
        this._updateTime = 0;
        this._startValue = this.state;
        this._endValue = this.state;
        this._active = false;
    };

    /**
     * Get _interpolated state of current action at provided time. If the last
     *    action has completed, invoke its callback.
     * 
     * @name TweenTransition#get
     * @function
     *    
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     * @returns {number|Object.<number|string, number>} beginning state
     *    _interpolated to this point in time.
     */
    TweenTransition.prototype.get = function(timestamp) {
        this.update(timestamp);
        return this.state;
    };

    /**
     * Update internal state to the provided timestamp. This may invoke the last
     *    callback and begin a new action.
     * 
     * @name TweenTransition#update
     * @function
     * 
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     */
    TweenTransition.prototype.update = function(timestamp) {
        if(!this._active) {
            if(this._callback) {
                var callback = this._callback;
                this._callback = undefined;
                callback();
            }
            return;
        }

        if(!timestamp) timestamp = Date.now();
        if(this._updateTime >= timestamp) return;
        this._updateTime = timestamp;

        var timeSinceStart = timestamp - this._startTime;
        if(timeSinceStart >= this._duration) {
            this.state = this._endValue;
            this._active = false;
        }
        else if(timeSinceStart < 0) {
            this.state = this._startValue;
        }
        else { 
            var t = timeSinceStart / this._duration;
            if(this.state instanceof Object) {
                for(var i in this.state) this.state[i] = _interpolate(this._startValue[i], this._endValue[i], this._curve(t));
            }
            else {
                this.state = _interpolate(this._startValue, this._endValue, this._curve(t));
            }
        }
    };

    /**
     * Is there at least one action pending completion?
     * 
     * @name TweenTransition#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    TweenTransition.prototype.isActive = function() {
        return this._active;
    };

    /**
     * Halt transition at current state and erase all pending actions.
     * 
     * @name TweenTransition#halt
     * @function
     */
    TweenTransition.prototype.halt = function() {
        this.reset(this.get());
    };

    /* Register all the default curves */
    TweenTransition.registerCurve('linear', Utility.Curve.linear);
    TweenTransition.registerCurve('easeIn', Utility.Curve.easeIn);
    TweenTransition.registerCurve('easeOut', Utility.Curve.easeOut);
    TweenTransition.registerCurve('easeInOut', Utility.Curve.easeInOut);
    TweenTransition.registerCurve('easeOutBounce', Utility.Curve.easeOutBounce);
    TweenTransition.registerCurve('spring', Utility.Curve.spring);

    module.exports = TweenTransition;
});
