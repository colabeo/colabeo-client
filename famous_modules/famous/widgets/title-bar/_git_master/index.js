var Transform = require('famous/transform');
var Surface   = require('famous/surface');
var LightBox  = require('famous/views/light-box');

 function TitleBar(options) {
    this.options = Object.create(TitleBar.DEFAULT_OPTIONS);
    this.lightbox = new LightBox();
    this._surfaces = {};
    if(options) this.setOptions(options);
};

TitleBar.DEFAULT_OPTIONS = {
    widget: Surface,
    inOrigin: [0.5, 0],
    outOrigin: [0.5, 0],
    showOrigin: [0.5, 0],
    inTransition: true,
    outTransition: true,
    size: [undefined, 50],
    look: undefined
};

TitleBar.prototype.show = function(title) {
    var widget = this.options.widget;
    if(!(title in this._surfaces)) {
        var surface = new widget({
            size: this.options.size
        });
        surface.setOptions(this.options.look);
        surface.setContent(title);
        this._surfaces[title] = surface;
    }
    this.lightbox.show(this._surfaces[title]);
};

TitleBar.prototype.getSize = function() {
    return this.options.size;
};

TitleBar.prototype.setOptions = function(options) {
    this.lightbox.setOptions(options);
    if(options.widget) {
        this.options.widget = options.widget;
        this._surfaces = {};
    }
    if(options.look) {
        this.options.look = options.look;
    }
    if(options.size) {
        this.options.size = options.size;
        var sourceTransform = Transform.translate(0, -this.options.size[1]);
        this.lightbox.setOptions({
            inTransform: sourceTransform,
            outTransform: sourceTransform
        });
    }
};

TitleBar.prototype.render = function() {
    return this.lightbox.render();
};

module.exports = TitleBar;