var Transitionable = require('famous/transitions/transitionable');

/*
 * @class Modifier which fades renderables in and out via opacity
 * @description
 * @name Fader
 * @constructor
 * @example 
 *     var fader = new Fader();
 *     var surface = new Surface();
 *     myContext.link(fader).link(surface);
 *     fader.show(); // fades in the surface
 */
function FamousFader(options, startState) {
    this.options = {
        cull: false,
        transition: true,
        pulseInTransition: true,
        pulseOutTransition: true,
        visibilityThreshold: 0
    };

    if(options) this.setOptions(options);

    if(!startState) startState = 0;
    this.transitionHelper = new Transitionable(startState);
}

FamousFader.prototype.getOptions = function() {
    return this.options;
};

FamousFader.prototype.setOptions = function(options) {
    if(options.cull !== undefined) this.options.cull = options.cull;
    if(options.transition !== undefined) this.options.transition = options.transition;
    if(options.pulseInTransition !== undefined) this.options.pulseInTransition = options.pulseInTransition;
    if(options.pulseOutTransition !== undefined) this.options.pulseOutTransition = options.pulseOutTransition;
    if(options.visibilityThreshold !== undefined) this.options.visibilityThreshold = options.visibilityThreshold;
};

FamousFader.prototype.show = function(callback) {
    this.set(1, this.options.transition, callback);
};

FamousFader.prototype.hide = function(callback) {
    this.set(0, this.options.transition, callback);
};

FamousFader.prototype.pulse = function(state, callback) {
    if(state === undefined) state = 1;
    var startState = this.transitionHelper.get();
    this.transitionHelper.set(state, this.options.pulseInTransition);
    this.transitionHelper.set(startState, this.options.pulseOutTransition, callback);
};

FamousFader.prototype.set = function(state, transition, callback) {
    this.transitionHelper.halt();
    this.transitionHelper.set(state, transition, callback);
};

FamousFader.prototype.render = function(target) {
    var currOpacity = this.transitionHelper.get();
    if(this.options.cull && !currOpacity) return;
    else return {opacity: currOpacity, target: target};
};

FamousFader.prototype.isVisible = function() {
    var threshold = this.options.visibilityThreshold;
    if(threshold >= 1) return this.transitionHelper.get() == 1;
    else return this.transitionHelper.get() > threshold;
};

module.exports = FamousFader;