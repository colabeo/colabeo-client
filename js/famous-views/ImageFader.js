define(function(require, exports, module) {
    var RenderNode = require('famous/RenderNode');
    var Fader = require('./Fader');
    var Matrix = require('famous/Matrix');
   
    /**
     * @name ImageFader
     * @constructor
     * To be deleted.
     */
    function ImageFader(options) {
        this.options = Object.create(ImageFader.DEFAULT_OPTIONS);
        this.nodes = [];
        this.faders = [];
        this.mode = -1;

        if(options) this.setOptions(options);
    }

    ImageFader.DEFAULT_OPTIONS = {
        crossfade: false
    };

    ImageFader.prototype.getMode = function() {
        return this.mode;
    };

    ImageFader.prototype.setMode = function(mode, transition, callback) {
        this.mode = mode;
        if(this.options.crossfade) {
            for(var i = 0; i < this.faders.length; i++) this.faders[i].set(0, transition);
            this.faders[mode].set(1, transition, callback);
        }
        else {
            this.faders[mode].set(1, transition, (function() {
                if(this.mode != mode) return;
                for(var i = 0; i < this.faders.length; i++) if(i != mode) this.faders[i].set(0);
                if(callback) callback();
            }).bind(this));
        }
    };

    ImageFader.prototype.forMode = function(mode) {
        if(!this.nodes[mode]) {
            this.nodes[mode] = new RenderNode();
            this.faders[mode] = new Fader(this.options);
        }
        return this.nodes[mode];
    };

    ImageFader.prototype.setOptions = function(options) {
        if(options.crossfade !== undefined) this.options.crossfade = options.crossfade;
    };

    ImageFader.behindMatrix = Matrix.translate(0,0,-0.01);
    ImageFader.prototype.render = function(input) {
        var result = [];
        for(var i = 0; i < this.nodes.length; i++) {
            var rendered = this.faders[i].render(this.nodes[i].render());
            if(i != this.mode) rendered = {transform: ImageFader.behindMatrix, target: rendered};
            result[i] = rendered;
        }
        return result;
    };

    module.exports = ImageFader;
});
