define(function(require, exports, module) {
    var ContainerSurface = require('famous/ContainerSurface');
    var EventHandler = require('famous/EventHandler');
    var Scrollview = require('./Scrollview');
    var Utility = require('famous/Utility');

    /**
     * @class A scrollview linked within a container surface.
     * @description
     * @name ScrollContainer
     * @constructor
     * @example 
     *   define(function(require, exports, module) {
     *       var Engine = require('famous/Engine');
     *       var ScrollContainer = require('famous-views/ScrollContainer');
     *       var Surface = require('famous/Surface');
     *
     *       var Context = Engine.createContext();
     *       var scrollcontainer = new ScrollContainer({
     *           feel: {
     *               itemSpacing: 20
     *           },
     *           look: {
     *               size: [undefined, 500],
     *               properties: {
     *                   backgroundColor: '#3cf'
     *               }
     *           }
     *       });
     *
     *       var surfaces = [];
     *       for (var index = 0; index < 10; index++) {
     *           surfaces.push(
     *               new Surface({
     *                   content: 'test ' + String(index),
     *                   size: [300, 100],
     *                   properties: {
     *                       backgroundColor: 'white',
     *                       color: 'black'
     *                   }
     *               })
     *           );
     *       }
     *
     *       scrollcontainer.sequenceFrom(surfaces);
     *       Context.link(scrollcontainer);
     *   });
     */

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
