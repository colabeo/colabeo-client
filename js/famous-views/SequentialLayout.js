define(function(require, exports, module) {
    var Matrix = require('famous/Matrix');
    var Transitionable = require('famous/Transitionable');
    var Modifier = require('famous/Modifier');
    var RenderNode = require('famous/RenderNode');
    var ViewSequence = require('famous/ViewSequence');
    var Utility = require('famous/Utility');

    /**
     * @class Lays out specified renderables sequentially.
     * @description
     * @name SequentialLayout
     * @constructor
     * @example 
     *   define(function(require, exports, module) {
     *           var Engine = require('famous/Engine');
     *           var SequentialLayout = require('famous-views/SequentialLayout');
     *           var Surface = require('famous/Surface');
     *
     *           var Context = Engine.createContext();
     *           var sequentiallayout = new SequentialLayout({
     *               itemSpacing: 2
     *           });
     *
     *           var surfaces = [];
     *           for (var index = 0; index < 10; index++) {
     *               surfaces.push(
     *                   new Surface({
     *                       content: 'test ' + String(index + 1),
     *                       size: [window.innerWidth * 0.1 - 1, undefined],
     *                       properties: {
     *                           backgroundColor: '#3cf',
     *                       }
     *                   })
     *               );
     *           }
     *
     *           sequentiallayout.sequenceFrom(surfaces);
     *           Context.link(sequentiallayout);
     *   });
     */
    function SequentialLayout(options) {
        this.items = undefined;

        this._size = undefined;

        this.options = Object.create(SequentialLayout.DEFAULT_OPTIONS);
        if(options) this.setOptions(options);
    }

    SequentialLayout.DEFAULT_OPTIONS = {
        direction: Utility.Direction.X,
        defaultItemSize: [50, 50],
        itemSpacing: 0
    };

    SequentialLayout.prototype.getSize = function() {
        if(!this._size) this.render(); // hack size in
        return this._size;
    };

    SequentialLayout.prototype.sequenceFrom = function(items) {
        if(items instanceof Array) items = new ViewSequence(items);
        this.items = items;
    };

    SequentialLayout.prototype.setOptions = function(options) {
        if(options.direction !== undefined) this.options.direction = options.direction;
        if(options.defaultItemSize !== undefined) this.options.defaultItemSize = options.defaultItemSize;
        if(options.itemSpacing !== undefined) this.options.itemSpacing = options.itemSpacing;
        if(options.transition !== undefined) this.options.transition = options.transition;
    };

    SequentialLayout.prototype.render = function() {
        var length = 0;
        var girth = 0;

        var lengthDim = (this.options.direction == Utility.Direction.X) ? 0 : 1;
        var girthDim = (this.options.direction == Utility.Direction.X) ? 1 : 0;

        var currentNode = this.items;
        var result = [];
        while(currentNode) {
            var item = currentNode.get();

            if(length) length += this.options.itemSpacing; // start flush

            var itemSize;
            if(item && item.getSize) itemSize = item.getSize();
            if(!itemSize) itemSize = this.options.defaultItemSize;
            if(girth && itemSize[girthDim] !== true) girth = Math.max(girth, itemSize[girthDim]);

            var transform = (this.options.direction == Utility.Direction.X) ? Matrix.translate(length, 0) : Matrix.translate(0, length);
            result.push({
                transform: transform,
                target: item.render()
            });
            
            if(itemSize[lengthDim] && (itemSize[lengthDim] !== true)) length += itemSize[lengthDim];
            currentNode = currentNode.getNext();
        }

        if(!girth) girth = undefined;

        if(!this._size) this._size = [0, 0];
        this._size[lengthDim] = length;
        this._size[girthDim] = girth;

        return {
            group: true,
            target: result
        };
    };

    module.exports = SequentialLayout;
});
