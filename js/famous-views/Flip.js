define(function(require, exports, module) {
    var Matrix = require('famous/Matrix');
    var Transitionable = require('famous/Transitionable');
    var RenderNode = require('famous/RenderNode');

    /**
     * @class Allows you to link two renderables as front and back sides that can be 
     * 'flipped' back and forth along a chosen axis.
     * @description
     * @name Flip
     * @constructor
     * @example 
     *   define(function(require, exports, module) {
     *       var Engine = require('famous/Engine');
     *       var Flip = require('famous-views/Flip');
     *       var Surface = require('famous/Surface');
     *
     *       var Context = Engine.createContext();
     *       var flip = new Flip();
     *
     *       var surface = new Surface({
     *            content:'test',
     *            size: [300, 100],
     *            properties: {
     *                backgroundColor: 'red'
     *            }
     *       });
     *
     *       var surface2 = new Surface({
     *            content:'test2',
     *            size: [300, 100],
     *            properties: {
     *                backgroundColor: 'blue'
     *            }
     *       });
     *
     *       Context.link(flip);
     *
     *       flip.linkFront(surface);
     *
     *       flip.linkBack(surface2);
     *
     *       Engine.on('click', function() {
     *           flip.flip.bind(flip)();
     *       });
     *   });
     */
    function Flip(options) {
        this.options = {
            transition: true,
            cull: true
        };

        if(options) this.setOptions(options);

        this._side = 0;
        this.state = new Transitionable(0);
        
        this.frontNode = new RenderNode();
        this.backNode = new RenderNode();
    }

    Flip.prototype.setDefaultTransition = function(transition) {
        this.transition = transition;
    };

    Flip.prototype.flip = function(side, callback) {
        if(side === undefined) side = (this._side === 1) ? 0 : 1;
        this._side = side;
        this.state.set(side, this.options.transition, callback);
    };

    Flip.prototype.getOptions = function() {
        return this.options;
    };

    Flip.prototype.setOptions = function(options) {
        if(options.transition !== undefined) this.options.transition = options.transition;
        if(options.cull !== undefined) this.options.cull = options.cull;
    };

    Flip.prototype.linkFront = function(obj) {
        return this.frontNode.link(obj);
    };

    Flip.prototype.linkBack = function(obj) {
        return this.backNode.link(obj);
    };

    Flip.prototype.render = function(target) {
        var pos = this.state.get();
        if(target !== undefined) {
            return {
                transform: Matrix.rotateY(Math.PI * pos),
                target: target
            };
        }
        else {
            if(this.options.cull && !this.state.isActive()) {
                if(pos) return this.backNode.render();
                else return this.frontNode.render();
            }
            else {
                return [
                    {
                        transform: Matrix.rotateY(Math.PI * pos),
                        target: this.frontNode.render()
                    },
                    {
                        transform: Matrix.rotateY(Math.PI * (pos + 1)),
                        target: this.backNode.render()
                    }
                ];
            }
        }
    };

    module.exports = Flip;
});
