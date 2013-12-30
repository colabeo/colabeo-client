define(function(require, exports, module) {
    var ContainerSurface = require('famous/ContainerSurface');
    var EventHandler = require('famous/EventHandler');
    var Scrollview = require('famous-views/Scrollview');
    var Utility = require('famous/Utility');

    function ScrollContainer(options) {
        this.options = Object.create(ScrollContainer.DEFAULT_OPTIONS);

        this.surface = new ContainerSurface(this.options.look);
        this.scrollview = new Scrollview(this.options.feel);

        if(options) this.setOptions(options);

        this.surface.link(this.scrollview);

        EventHandler.setInputHandler(this, this.surface);
        EventHandler.setOutputHandler(this, this.surface);

        this.pipe(this.scrollview);
    };

    ScrollContainer.DEFAULT_OPTIONS = {
        look: undefined,
        feel: {direction: Utility.Direction.X}
    };

    ScrollContainer.prototype.setOptions = function(options) {
        if(options.look !== undefined) {
            this.options.look = options.look;
            this.surface.setOptions(this.options.look);
        }
        if(options.feel !== undefined) {
            this.options.feel = options.feel;
            this.scrollview.setOptions(this.options.feel);
        }
    };

    ScrollContainer.prototype.sequenceFrom = function() {
        return this.scrollview.sequenceFrom.apply(this.scrollview, arguments);
    };

    ScrollContainer.prototype.render = function() { 
        return this.surface.render.apply(this.surface, arguments);
    };

    module.exports = ScrollContainer;
});
