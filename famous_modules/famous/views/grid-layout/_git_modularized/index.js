var Entity = require('famous/entity');
var RenderNode = require('famous/render-node');
var Transform = require('famous/transform');
var ViewSequence = require('famous/view-sequence');
var Modifier = require('famous/modifier');
var OptionsManager = require('famous/options-manager');

/**
 * @class Layout which divides a context into several evenly-sized grid cells
 * @name GridLayout
 * @description
 *     If dimensions are provided, the grid is evenly subdivided with children
 *     cells representing their own context.
 *     If dimensions are not provided, the cellSize property is used to compute
 *     dimensions so that items of cellSize will fit.
 * @constructor
 * @example 
 *     var myLayout = new GridLayout({
 *         size: [5, 2]
 *     });
 *     var mySurfaces = new ViewSequence();
 *     for(var i = 0; i < 10; i++) {
 *         mySurfaces.push(new Surface({content: 'Item ' + i}));
 *     }
 *     myLayout.sequenceFrom(mySurfaces); // takes ViewSequence, autoboxes Array
 *     context.link(myLayout); // distribute the surfaces in a 5x2 grid
 *   });
 */
function GridLayout(options) {
    this.options = Object.create(GridLayout.DEFAULT_OPTIONS);
    this.optionsManager = new OptionsManager(this.options);
    if(options) this.setOptions(options);

    this.id = Entity.register(this);

    this._modifiers = [];
    this._contextSizeCache = [0, 0];
    this._dimensionsCache = [0, 0];
    this._activeCount = 0;
};

GridLayout.DEFAULT_OPTIONS = {
    dimensions: [1, 1],
    cellSize: [250, 250],
    transition: false
};

GridLayout.prototype.render = function() {
    return this.id;
};

GridLayout.prototype.setOptions = function(options) {
    return this.optionsManager.setOptions(options);
};

GridLayout.prototype.sequenceFrom = function(sequence) {
    if(sequence instanceof Array) sequence = new ViewSequence(sequence);
    this.sequence = sequence;
};

GridLayout.prototype.commit = function(context) {
    var transform = context.transform;
    var opacity = context.opacity;
    var origin = context.origin;
    var size = context.size;

    var cols = this.options.dimensions[0];
    var rows = this.options.dimensions[1];

    if(size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1] || cols !== this._dimensionsCache[0] || rows !== this._dimensionsCache[1]) {
        if(!rows) rows = Math.floor(size[1] / this.options.cellSize[1]);
        if(!cols) cols = Math.floor(size[0] / this.options.cellSize[0]);
        var rowSize = size[1] / rows;
        var colSize = size[0] / cols;
        for(var i = 0; i < rows; i++) {
            var currY = Math.round(rowSize * i);
            for(var j = 0; j < cols; j++) {
                var currX = Math.round(colSize * j);
                var currIndex = i * cols + j;
                if(!(currIndex in this._modifiers)) this._modifiers[currIndex] = new Modifier({opacity: 0});
                var currModifier = this._modifiers[currIndex];
                currModifier.halt();
                currModifier.setTransform(Transform.translate(currX, currY), this.options.transition);
                currModifier.setSize([Math.round(colSize * (j + 1)) - currX, Math.round(rowSize * (i + 1)) - currY], this.options.transition);
                currModifier.setOpacity(1, this.options.transition);
            }
        }
        this._dimensionsCache = [this.options.dimensions[0], this.options.dimensions[1]];
        this._contextSizeCache = [size[0], size[1]];

        this._activeCount = rows * cols;
        for(var i = this._activeCount ; i < this._modifiers.length; i++) {
            var currModifier = this._modifiers[i];
            currModifier.halt();
            currModifier.setTransform(Transform.identity, this.options.transition);
            currModifier.setSize([Math.round(colSize), Math.round(rowSize)], this.options.transition);
            currModifier.setOpacity(0, this.options.transition);
        }
    }

    var sequence = this.sequence;
    var result = [];
    var currIndex = 0;
    while(sequence && (currIndex < this._modifiers.length)) {
        var item = sequence.get();
        var modifier = this._modifiers[currIndex];
        if(currIndex >= this._activeCount && !modifier.isActive()) this._modifiers.splice(currIndex);
        if(item) {
            result[currIndex] = modifier.render({
                origin: origin,
                target: item.render()
            });
        }
        sequence = sequence.getNext();
        currIndex++;
    }

    if(size) transform = Transform.moveThen([-size[0]*origin[0], -size[1]*origin[1], 0], transform);
    var nextSpec = {
        transform: transform,
        opacity: opacity,
        size: size,
        target: result
    };
    return nextSpec;
};

module.exports = GridLayout;
