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
     *   FamousSurfaceManager} unique to this Image Surface.
     *   Implementation note: in the DOM case, this will generate a div with 
     *   the style 'containerSurface' applied.
     *   
     * @name FamousImageSurface
     * @extends FamousSurface
     * @constructor
     */
    function FamousImageSurface(opts) {
        this.imageUrl = undefined;
        FamousSurface.apply(this, arguments);
    };

    FamousImageSurface.prototype = Object.create(FamousSurface.prototype);
    FamousImageSurface.prototype.surfaceEvents = FamousSurface.prototype.surfaceEvents.concat(['load']);
    FamousImageSurface.prototype.elementType = 'img';
    FamousImageSurface.prototype.elementClass = 'surface';

    FamousImageSurface.prototype.setContent = function(imageUrl) {
        this.imageUrl = imageUrl;
        this._contentDirty = true;
    };

    FamousImageSurface.prototype.deploy = function(target) {
        target.src = this.imageUrl || '';
    };

    FamousImageSurface.prototype.recall = function(target) {
        target.src = '';
    };

    module.exports = FamousImageSurface;
});

