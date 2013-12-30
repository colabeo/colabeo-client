define(function(require, exports, module) {
    var Entity = require('famous/Entity');
    var RenderNode = require('famous/RenderNode');
    var Matrix = require('famous/Matrix');
    var ViewSequence = require('famous/ViewSequence');

    /**
     * @class Lays out sequenced renderables in a grid.
     * @description
     * If sequenced renderables do not
     * have a defined size they will be sized to fit the dimensions of the grid.
     * If sequenced renderables do have a defined size
     * they will still be placed on the screen according to the subdivisions of 
     * the grid but will retain their original width and height, and may overlap.
     * @name GridLayout
     * @constructor
     * @example 
     *   define(function(require, exports, module) {
     *       var Engine = require('famous/Engine');
     *       var GridLayout = require('famous-views/GridLayout');
     *       var Surface = require('famous/Surface');
     *
     *       var Context = Engine.createContext();
     *       var gridlayout= new GridLayout({
     *           size: [5, 2]
     *       });
     *       var surfaces = [];
     *
     *       for (var index = 0; index < 10; index++) {
     *            surfaces.push(
     *                new Surface({
     *                    content: 'test ' + String(index),
     *                    size: [undefined, undefined],
     *                    properties: {
     *                       backgroundColor: 'red',
     *                       border: '1px solid white'
     *                   }
     *            })
     *           );
     *       }
     *
     *       gridlayout.sequenceFrom(surfaces);
     *       Context.link(gridlayout);
     *   });
     */
    function GridLayout(options) {
        this.options = {
            size: [1, 1]
        };
        if(options) this.setOptions(options);

        this.id = Entity.register(this);

        this._targetPositionsCache = [];
        this._targetSizesCache = [];
        this._contextSizeCache = [0, 0];
        this._gridSizeCache = [0, 0];
    }

    GridLayout.prototype.render = function() {
        return this.id;
    };

    GridLayout.prototype.setOptions = function(options) {
        if(options.size !== undefined) this.options.size = options.size;
    };

    GridLayout.prototype.sequenceFrom = function(sequence) {
        if(sequence instanceof Array) sequence = new ViewSequence(sequence);
        this.sequence = sequence;
    };

    GridLayout.prototype.commit = function(context, transform, opacity, origin, size) {
        var rows = this.options.size[1];
        var cols = this.options.size[0];

        if(size[0] != this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1] || rows !== this._gridSizeCache[0] || cols !== this._gridSizeCache[1]) {
            var rowSize = size[1] / rows;
            var colSize = size[0] / cols;
            for(var i = 0; i < rows; i++) {
                var currY = Math.round(rowSize * i);
                for(var j = 0; j < cols; j++) {
                    var currX = Math.round(colSize * j);
                    var currIndex = i * cols + j;
                    this._targetPositionsCache[currIndex] = Matrix.translate(currX, currY);
                    this._targetSizesCache[currIndex] = [Math.round(colSize * (j + 1)) - currX, Math.round(rowSize * (i + 1)) - currY];
                }
            }
        }

        var sequence = this.sequence;
        var result = [];
        var currIndex = 0;
        while(sequence && (currIndex < this._targetPositionsCache.length)) {
            var item = sequence.get();
            if(item) {
                result[currIndex] = {
                    transform: this._targetPositionsCache[currIndex],
                    size: this._targetSizesCache[currIndex],
                    target: item.render()
                };
            }
            sequence = sequence.getNext();
            currIndex++;
        }

        if(size) transform = Matrix.move(transform, [-size[0]*origin[0], -size[1]*origin[1], 0]);
        var nextSpec = {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size,
            target: result
        };
        return nextSpec;
    };

    module.exports = GridLayout;
});
