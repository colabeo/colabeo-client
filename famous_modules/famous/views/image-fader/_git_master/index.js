var RenderNode = require('famous/render-node');
var Fader      = require('famous/views/fader');
var Transform  = require('famous/transform');

/**
 * @name ImageFader
 * @constructor
 * To be deleted.
 */
function ImageFader(options) {
    this.options = Object.create(ImageFader.DEFAULT_OPTIONS);
    this._nodes = [];
    this._faders = [];
    this._mode = -1;

    if(options) this.setOptions(options);
    this._output = [];
}

ImageFader.DEFAULT_OPTIONS = {
    crossfade: false
};

ImageFader.prototype.getMode = function() {
    return this._mode;
};

ImageFader.prototype.setMode = function(mode, transition, callback) {
    this._mode = mode;
    if(this.options.crossfade) {
        for(var i = 0; i < this._faders.length; i++) this._faders[i].set(0, transition);
        this._faders[mode].set(1, transition, callback);
    }
    else {
        this._faders[mode].set(1, transition, (function() {
            if(this._mode != mode) return;
            for(var i = 0; i < this._faders.length; i++) if(i != mode) this._faders[i].set(0);
            if(callback) callback();
        }).bind(this));
    }
};

ImageFader.prototype.forMode = function(mode) {
    if(!this._nodes[mode]) {
        this._nodes[mode] = new RenderNode();
        this._faders[mode] = new Fader(this.options);
    }
    return this._nodes[mode];
};

ImageFader.prototype.setOptions = function(options) {
    if(options.crossfade !== undefined) this.options.crossfade = options.crossfade;
};

ImageFader.behindMatrix = Transform.translate(0,0,-0.01);
ImageFader.prototype.render = function(input) {
    if(this._nodes.length > this._output.length) this._output.splice(this._nodes.length);
    for(var i = 0; i < this._nodes.length; i++) {
        var rendered = this._faders[i].render(this._nodes[i].render());
        if(i !== this._mode) rendered = {transform: ImageFader.behindMatrix, target: rendered};
        this._output[i] = rendered;
    }
    return this._output;
};

module.exports = ImageFader;