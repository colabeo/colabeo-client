define(function(require, exports, module) {
    var FamousSurface = require('./Surface');

    /**
     * @class An object designed to contain surfaces, and set properties
     *   to be applied to all of them at once.
     *
     * @description 
     *  * A container surface will enforce these properties on the 
     *   surfaces it contains:
     *     * size (clips contained surfaces to its own width and height)
     *     * origin
     *     * its own opacity and transform, which will be automatically 
     *       applied to  all Surfaces contained directly and indirectly.
     *   These properties are maintained through a {@link 
     *   FamousSurfaceManager} unique to this Canvas Surface.
     *   Implementation note: in the DOM case, this will generate a div with 
     *   the style 'containerSurface' applied.
     *   
     * @name FamousCanvasSurface
     * @extends FamousSurface
     * @constructor
     */
    function FamousCanvasSurface(options) {
        if(options && options.canvasSize) this.canvasSize = options.canvasSize;
        FamousSurface.call(this, options);
        if(!this.canvasSize) this.canvasSize = this.getSize();
        this.backBuffer = document.createElement('canvas');
        if(this.canvasSize) {
            this.backBuffer.width = this.canvasSize[0];
            this.backBuffer.height = this.canvasSize[1];
        }
        this._contextId = undefined;
    };

    FamousCanvasSurface.prototype = Object.create(FamousSurface.prototype);
    FamousCanvasSurface.prototype.elementType = 'canvas';
    FamousCanvasSurface.prototype.elementClass = 'surface';

    FamousCanvasSurface.prototype.setContent = function() {};

    FamousCanvasSurface.prototype.deploy = function(target) {
        if(this.canvasSize) {
            target.width = this.canvasSize[0];
            target.height = this.canvasSize[1];
        }

        if(this._contextId == '2d') {
            target.getContext(this._contextId).drawImage(this.backBuffer, 0, 0);
            this.backBuffer.width = 0;
            this.backBuffer.height = 0;
        }

    };

    FamousCanvasSurface.prototype.recall = function(target) {
        var size = this.getSize();

        this.backBuffer.width = target.width;
        this.backBuffer.height = target.height;

        if(this._contextId == '2d') {
            this.backBuffer.getContext(this._contextId).drawImage(target, 0, 0);
            target.width = 0;
            target.height = 0;
        }
    };

    /**
     * Returns the canvas element's context
     *
     * @name FamousCanvasSurface#getContext
     * @function
     * @param {string} contextId context identifier
     */
    FamousCanvasSurface.prototype.getContext = function(contextId) {
        this._contextId = contextId;
        return this._currTarget ? this._currTarget.getContext(contextId) : this.backBuffer.getContext(contextId);
    };

    FamousCanvasSurface.prototype.setSize = function(size, canvasSize) {
        FamousSurface.prototype.setSize.apply(this, arguments);
        if(canvasSize) this.canvasSize = canvasSize.slice(0);
        if(this._currTarget) {
            this._currTarget.width = this.canvasSize[0];
            this._currTarget.height = this.canvasSize[1];
        }
    };

    module.exports = FamousCanvasSurface;
});

