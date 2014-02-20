var Entity = require('famous/entity');
var EventHandler = require('famous/event-handler');
var Transform = require('famous/transform');
var LightBox = require('famous/views/light-box');

/**
 * @class Container which handles swapping renderables from edge 
 * @description
 * @name EdgeSwapper
 * @constructor
 * @example 
 *   var edgeSwapper = new EdgeSwapper();
 *   context.link(edgeSwapper); // links edgeSwapper to context
 *   edgeSwapper.show(mySurface); // slide in mySurface
 */
function EdgeSwapper(options) {
    this.options = Object.create(EdgeSwapper.DEFAULT_OPTIONS);

    this._currTarget = undefined;
    this._size = [window.innerWidth, window.innerHeight];

    this.lightbox = new LightBox(this.options);

    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);

    this.id = Entity.register(this);
    if(options) this.setOptions(options);
}

EdgeSwapper.DEFAULT_OPTIONS = {
    inOrigin: [0, 0],
    outOrigin: [0, 0],
    showOrigin: [0, 0],
    inTransform: Transform.translate(window.innerWidth, 0, 0),
    outTransform: Transform.translate(window.innerWidth, 0, 0.01)
};

EdgeSwapper.prototype.show = function(content) {
    if(this._currTarget) this.eventInput.unpipe(this._currTarget);
    this._currTarget = content;
    if(this._currTarget) {
        if(this._currTarget.setSize) this._currTarget.setSize(this._size);
        if(this._currTarget.emit) this.eventInput.pipe(this._currTarget);
    }
    this.lightbox.show.apply(this.lightbox, arguments);
};

EdgeSwapper.prototype.setOptions = function(options) {
    this.lightbox.setOptions(options);
};

EdgeSwapper.prototype.render = function() {
    return this.id;
};

EdgeSwapper.prototype.commit = function(context) {
    var transform = context.transform;
    var opacity = context.opacity;
    var origin = context.origin;
    var size = context.size;

    if(size[0] != this._size[0] || size[1] != this._size[1]) {
        this._size = size;
        this.lightbox.setOptions({
            inTransform: Transform.translate(this._size[0], 0, 0),
            outTransform: Transform.translate(this._size[0], 0, 0.01)
        });
        if(this._currTarget && this._currTarget.setSize) this._currTarget.setSize(size);
    }

    return {
        transform: transform,
        opacity: opacity,
        origin: origin,
        size: size,
        target: this.lightbox.render()
    };
};

module.exports = EdgeSwapper;
