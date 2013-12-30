define(function(require, exports, module) {
    var Matrix = require('./Matrix');
    var Transitionable = require('./Transitionable');
    var Utility = require('./Utility');

    /**
     *
     * @class A collection of visual changes to be
     *    applied to another renderable component. 
     *
     * @description This collection includes a
     *    transform matrix, an opacity contstant, and an origin specifier. These
     *    are all managed separately inside this object, and each operates
     *    independently. Modifier objects are typically applied within a
     *    {@link FamousRenderNode}. The object's subsequent siblings and children
     *    are transformed by the amounts specified in the object's properties.
     *
     * Renaming suggestion: Change parameters named "transform" to 
     * "transformMatrix" in here.
     *    
     * @name Modifier
     * @constructor
     */ 
    function Modifier(opts) {
        var transform = Matrix.identity;
        var opacity = 1;
        var origin = undefined;
        var size = undefined;

        /* maintain backwards compatibility for scene compiler */
        if(arguments.length > 1 || arguments[0] instanceof Array) {
            if(arguments[0] !== undefined) transform = arguments[0];
            if(arguments[1] !== undefined) opacity = arguments[1];
            origin = arguments[2];
            size = arguments[3];
        }
        else if(opts) {
            if(opts.transform) transform = opts.transform;
            if(opts.opacity !== undefined) opacity = opts.opacity;
            if(opts.origin) origin = opts.origin;
            if(opts.size) size = opts.size;
        }

        this.transformTranslateState = new Transitionable([0, 0, 0]);
        this.transformRotateState = new Transitionable([0, 0, 0]);
        this.transformSkewState = new Transitionable([0, 0, 0]);
        this.transformScaleState = new Transitionable([1, 1, 1]);
        this.opacityState = new Transitionable(opacity);
        this.originState = new Transitionable([0, 0]);
        this.sizeState = new Transitionable([0, 0]);

        this._originEnabled = false;
        this._sizeEnabled = false;

        this.setTransform(transform);
        this.setOpacity(opacity);
        this.setOrigin(origin);
        this.setSize(size);
    };

    /**
     * Get current interpolated positional transform matrix at this point in
     *    time.
     * (Scope: Component developers and deeper)
     *
     * @name Modifier#getTransform
     * @function
     *  
     * @returns {FamousMatrix} webkit-compatible positional transform matrix.
     */
    Modifier.prototype.getTransform = function() {
        if(this.isActive()) {
            return Matrix.build({
                translate: this.transformTranslateState.get(),
                rotate: this.transformRotateState.get(),
                skew: this.transformSkewState.get(),
                scale: this.transformScaleState.get()
            });
        }
        else return this.getFinalTransform();
    };

    /**
     * Get most recently provided end state positional transform matrix.
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#getFinalTransform
     * @function
     * 
     * @returns {FamousMatrix} webkit-compatible positional transform matrix.
     */
    Modifier.prototype.getFinalTransform = function() {
        return this._finalTransform;
    };

    /**
     * Add positional transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions Note: If we called setTransform in that "start state" way,
     *    then called with a transition, we begin form that start state.
     * 
     * @name Modifier#setTransform
     * @function
     *    
     * @param {FamousMatrix} transform end state positional transformation to
     *    which we interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setTransform = function(transform, transition, callback) {
        var _callback = callback ? Utility.after(4, callback) : undefined;
        if(transition) {
            if(this._transformDirty) {
                var startState = Matrix.interpret(this.getFinalTransform());
                this.transformTranslateState.set(startState.translate);
                this.transformRotateState.set(startState.rotate);
                this.transformSkewState.set(startState.skew);
                this.transformScaleState.set(startState.scale);
                this._transformDirty = false;
            }
            var endState = Matrix.interpret(transform);
            this.transformTranslateState.set(endState.translate, transition, _callback);
            this.transformRotateState.set(endState.rotate, transition, _callback);
            this.transformSkewState.set(endState.skew, transition, _callback);
            this.transformScaleState.set(endState.scale, transition, _callback);
        }
        else {
            this.transformTranslateState.halt();
            this.transformRotateState.halt();
            this.transformSkewState.halt();
            this.transformScaleState.halt();
            this._transformDirty = true;
        }
        this._finalTransform = transform;
    };

    /**
     * Get current interpolated opacity constant at this point in time.
     * 
     * @name Modifier#getOpacity
     * @function
     * 
     * @returns {number} interpolated opacity number. float w/ range [0..1]
     */
    Modifier.prototype.getOpacity = function() {
        return this.opacityState.get();
    };

    /**
     * Add opacity transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions.
     * 
     * @name Modifier#setOpacity
     * @function
     *    
     * @param {number} opacity end state opacity constant to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. If undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */ 
    Modifier.prototype.setOpacity = function(opacity, transition, callback) {
        this.opacityState.set(opacity, transition, callback);
    };

    /**
     * Get current interpolated origin pair at this point in time.
     *
     * @returns {Array.<number>} interpolated origin pair
     */
    Modifier.prototype.getOrigin = function() {
        return this._originEnabled ? this.originState.get() : undefined;
    };

    /**
     * Add origin transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions
     * 
     * @name Modifier#setOrigin
     * @function
     *    
     * @param {Array.<number>} origin end state origin pair to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. if undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setOrigin = function(origin, transition, callback) {
        this._originEnabled = !!origin;
        if(!origin) origin = [0, 0];
        if(!(origin instanceof Array)) origin = Utility.origins[origin];
        this.originState.set(origin, transition, callback);
    };

    /**
     * Get current interpolated size at this point in time.
     *
     * @returns {Array.<number>} interpolated size
     */
    Modifier.prototype.getSize = function() {
        return this._sizeEnabled ? this.sizeState.get() : undefined;
    };

    /**
     * Add size transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions
     * 
     * @name Modifier#setSize
     * @function
     *    
     * @param {Array.<number>} size end state size to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. if undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setSize = function(size, transition, callback) {
        this._sizeEnabled = !!size;
        if(!size) size = [0, 0];
        this.sizeState.set(size, transition, callback);
    };

    /**
     * Copy object to internal "default" transition. Missing properties in
     *    provided transitions inherit from this default.
     * 
     * (Scope: Component developers and deeper)
     * @name Modifier#setDefaultTransition
     * @function
     *    
     * @param {transition} transition {duration: number, curve: f[0,1] -> [0,1]}
     */
    Modifier.prototype.setDefaultTransition = function(transition) {
        this.transformTranslateState.setDefault(transition);
        this.transformRotateState.setDefault(transition);
        this.transformSkewState.setDefault(transition);
        this.transformScaleState.setDefault(transition);

        this.opacityState.setDefault(transition);
        this.originState.setDefault(transition);
        this.sizeState.setDefault(transition);
    };

    /**
     * Halt the entire transformation at current state.
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#halt
     * @function
     */
    Modifier.prototype.halt = function() {
        this.transformTranslateState.halt();
        this.transformRotateState.halt();
        this.transformSkewState.halt();
        this.transformScaleState.halt();

        this.opacityState.halt();
        this.originState.halt();
        this.sizeState.halt();
    };

    /**
     * Have we reached our end state in the motion transform?
     * 
     * @name Modifier#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    Modifier.prototype.isActive = function() {
        return this.transformTranslateState.isActive() ||
            this.transformRotateState.isActive() ||
            this.transformSkewState.isActive() ||
            this.transformScaleState.isActive();
    };

    /**
     * * Return {@renderSpec} for this Modifier, applying to the provided
     *    target component. The transform will be applied to the entire target
     *    tree in the following way: 
     *    * Positional Matrix (this.getTransform) - Multiplicatively 
     *    * Opacity (this.getOpacity) - Applied multiplicatively.
     *    * Origin (this.getOrigin) - Children shadow parents
     *
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#render
     * @function
     * 
     * @param {renderSpec} target (already rendered) renderable component to
     *    which to apply the transform.
     * @returns {renderSpec} render spec for this Modifier, including the
     *    provided target
     */
    Modifier.prototype.render = function(target) {
        return {transform: this.getTransform(), opacity: this.getOpacity(), origin: this.getOrigin(), size: this.getSize(), target: target};
    };

    module.exports = Modifier;
});
