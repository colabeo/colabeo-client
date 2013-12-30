define(function(require, exports, module) {
    var Transitionable = require('famous/Transitionable');

    /**
     * @class Allows you to control the opacity of shown renderables dynamically.
     * @description
     * @name Fader
     * @constructor
     * @example 
     * define(function(require, exports, module) {
     *     var Engine  = require('famous/Engine');
     *     var Fader   = require('famous-views/Fader');
     *     var Surface = require('famous/Surface');
     * 
     *     var fader = new Fader();
     * 
     *     var surface = new Surface({
     *         size: [300, 300],
     *         properties: {
     *             backgroundColor: 'red'
     *         },
     *         content: 'test'
     *     });
     * 
     *     var Context = Engine.createContext();
     * 
     *     Context.link(fader).link(surface);
     * 
     *     fader.show();
     * 
     *     var showing     = true;
     *     var toggle   = function() {
     *         if (showing) {
     *             fader.hide();
     *             showing = false;
     *         } else {
     *             fader.show();
     *             showing = true;
     *         }
     *     };
     * 
     *     Engine.on('click', toggle);
     * });
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
});
