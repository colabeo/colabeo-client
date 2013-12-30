define(function(require, exports, module) {
    var ContainerSurface = require('famous/ContainerSurface');
    var EventHandler = require('famous/EventHandler');
    var SequentialLayout = require('famous-views/SequentialLayout');
    var Utility = require('famous/Utility');

    function ShrinkContainer(options) {
        this.options = Object.create(ShrinkContainer.DEFAULT_OPTIONS);

        this.surface = new ContainerSurface(this.options.look);
        this.layout = new SequentialLayout(this.options);

        if(options) this.setOptions(options);

        this.surface.link(this.layout);

        EventHandler.setInputHandler(this, this.surface);
        EventHandler.setOutputHandler(this, this.surface, true);
    };

    ShrinkContainer.DEFAULT_OPTIONS = {
        look: undefined
    };

    ShrinkContainer.prototype.getSize = function() {
        return this.surface.getSize();
    };

    ShrinkContainer.prototype.setOptions = function(options) {
        this.layout.setOptions(options);
        if(options.look !== undefined) {
            this.options.look = options.look;
            this.surface.setOptions(this.options.look);
        }
    };

    ShrinkContainer.prototype.sequenceFrom = function() {
        return this.layout.sequenceFrom.apply(this.layout, arguments);
    };

    function _updateSize() {
        var contentSize = this.layout.getSize();
        var surfaceSize = this.surface.getSize();
        var surfaceContextSize = this.surface.context.getSize();
        if(contentSize && surfaceSize && surfaceContextSize) {
            var finalSize = [contentSize[0] + (surfaceSize[0] - surfaceContextSize[0]), contentSize[1] + (surfaceSize[1] - surfaceContextSize[1])];
            if(isNaN(finalSize[0])) finalSize[0] = undefined;
            if(isNaN(finalSize[1])) finalSize[1] = undefined;
            if(finalSize[0] != surfaceSize[0] || finalSize[1] != surfaceSize[1]) this.surface.setSize.call(this.surface, finalSize);
        }
    };

    ShrinkContainer.prototype.mod = function() {
        return this.surface.mod.apply(this.surface, arguments);
    };

    ShrinkContainer.prototype.render = function() {
        _updateSize.call(this);
        return this.surface.render.apply(this.surface, arguments);
    };

    module.exports = ShrinkContainer;
});
