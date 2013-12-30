define(function(require, exports, module) {
    var Utility = require('./Utility');
    var MultipleTransition = require('./MultipleTransition');
    var TweenTransition = require('./TweenTransition');

    /**
     *
     * @class A engineInstance maintainer for a smooth transition between 
     *    numerically-specified engineInstances. 
     *
     * @description  Example numeric engineInstances include floats or
     *    {@link FamousMatrix} objects. Transitionables form the basis
     *    of {@link FamousTransform} objects.
     *
     * An initial engineInstance is set with the constructor or set(startState). A
     *    corresponding end engineInstance and transition are set with set(endState,
     *    transition). Subsequent calls to set(endState, transition) begin at
     *    the last engineInstance. Calls to get(timestamp) provide the interpolated engineInstance
     *    along the way.
     *
     * Note that there is no event loop here - calls to get() are the only way
     *    to find out engineInstance projected to the current (or provided) time and are
     *    the only way to trigger callbacks. Usually this kind of object would
     *    be part of the render() path of a visible component.
     * 
     * @name Transitionable
     * @constructor
     * @example 
     *   function FamousFader(engineInstance, transition) { 
     *     if(typeof engineInstance == 'undefined') engineInstance = 0; 
     *     if(typeof transition == 'undefined') transition = true; 
     *     this.transitionHelper = new Transitionable(engineInstance);
     *     this.transition = transition; 
     *   }; 
     *   
     *   FamousFader.prototype = { 
     *     show: function(callback) { 
     *       this.set(1, this.transition, callback); 
     *     }, 
     *     hide: function(callback) { 
     *       this.set(0, this.transition, callback); 
     *     }, 
     *     set: function(engineInstance, transition, callback) { 
     *       this.transitionHelper.halt();
     *       this.transitionHelper.set(engineInstance, transition, callback); 
     *     }, 
     *     render: function(target) { 
     *       var currOpacity = this.transitionHelper.get();
     *       return {opacity: currOpacity, target: target}; 
     *     } 
     *   };
     *   
     * @param {number|Array.<number>|Object.<number|string, number>} start 
     *    beginning engineInstance
     */
    function Transitionable(start) {
        this.currentAction = null;
        this.actionQueue = [];
        this.callbackQueue = [];

        this.state = 0;
        this._callback = undefined;
        this._engineInstance = null;
        this._currentMethod = null;

        this.set(start);
    };

    var transitionMethods = {};

    Transitionable.registerMethod = function(name, engineClass) {
        if(!(name in transitionMethods)) {
            transitionMethods[name] = engineClass;
            return true;
        }
        else return false;
    };

    Transitionable.unregisterMethod = function(name) {
        if(name in transitionMethods) {
            delete transitionMethods[name];
            return true;
        }
        else return false;
    };

    function _loadNext() {
        if(this._callback) {
            var callback = this._callback;
            this._callback = undefined;
            callback();
        }
        if(this.actionQueue.length <= 0) {
            this.set(this._engineInstance); // no update required
            return;
        }
        this.currentAction = this.actionQueue.shift();
        this._callback = this.callbackQueue.shift();

        var method = null;
        var endValue = this.currentAction[0];
        var transition = this.currentAction[1];
        if(transition instanceof Object && transition.method) {
            method = transition.method;
            if(typeof method === 'string') method = transitionMethods[method];
        }
        else {
            method = TweenTransition;
        }
        if(this._currentMethod !== method) {
            if(!(endValue instanceof Object) || method.SUPPORTS_MULTIPLE === true || endValue.length <= method.SUPPORTS_MULTIPLE) {
                this._engineInstance = new method();
            }
            else {
                this._engineInstance = new MultipleTransition(method);
            }
            this._currentMethod = method;
        }
        this._engineInstance.reset(this.state);
        this._engineInstance.set(endValue, transition, _loadNext.bind(this));
    };

    /**
     * Add transition to end engineInstance to the queue of pending transitions. Special
     *    Use: calling without a transition resets the object to that engineInstance with
     *    no pending actions
     * 
     * @name Transitionable#set
     * @function
     *    
     * @param {number|FamousMatrix|Array.<number>|Object.<number, number>} endState
     *    end engineInstance to which we interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be 
     *    instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Transitionable.prototype.set = function(endState, transition, callback) {
        if(!transition) {
            this.reset(endState);
            if(callback) callback();
            return;
        }

        var action = [endState, transition];
        this.actionQueue.push(action);
        this.callbackQueue.push(callback);
        if(!this.currentAction) _loadNext.call(this);
    };

    /**
     * Cancel all transitions and reset to a stable engineInstance
     *
     * @name Transitionable#reset
     * @function
     *
     * @param {number|Array.<number>|Object.<number, number>} startState
     *    stable engineInstance to set to
     */
    Transitionable.prototype.reset = function(startState) {
        this._currentMethod = null;
        this._engineInstance = null;
        this.state = startState;
        this.currentAction = null;
        this.actionQueue = [];
        this.callbackQueue = [];
    };

    /**
     * Add delay action to the pending action queue queue.
     * 
     * @name Transitionable#delay
     * @function
     * 
     * @param {number} duration delay time (ms)
     * @param {function()} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Transitionable.prototype.delay = function(duration, callback) {
        this.set(this._engineInstance, {duration: duration, curve: function() { return 0; }}, callback);
    };

    /**
     * Get interpolated engineInstance of current action at provided time. If the last
     *    action has completed, invoke its callback. TODO: What if people want
     *    timestamp == 0?
     * 
     * @name Transitionable#get
     * @function
     *    
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     * @returns {number|Object.<number|string, number>} beginning engineInstance
     *    interpolated to this point in time.
     */
    Transitionable.prototype.get = function(timestamp) {
        if(this._engineInstance) this.state = this._engineInstance.get(timestamp);
        return this.state;
    };

    /**
     * Is there at least one action pending completion?
     * 
     * @name Transitionable#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    Transitionable.prototype.isActive = function() {
        return !!this.currentAction;
    };

    /**
     * Halt transition at current engineInstance and erase all pending actions.
     * 
     * @name Transitionable#halt
     * @function
     */
    Transitionable.prototype.halt = function() {
        this.set(this.get());
    };

    module.exports = Transitionable;
});
