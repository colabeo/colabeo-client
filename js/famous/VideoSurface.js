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
     *   FamousSurfaceManager} unique to this Video Surface.
     *   Implementation note: in the DOM case, this will generate a div with 
     *   the style 'containerSurface' applied.
     *   
     * @name FamousVideoSurface
     * @extends FamousSurface
     * @constructor
     */
    function FamousVideoSurface(opts) {
        this.autoplay = opts.autoplay || false;
        this.videoUrl = undefined;

        FamousSurface.apply(this, arguments);
    };

    FamousVideoSurface.prototype = Object.create(FamousSurface.prototype);
    FamousVideoSurface.prototype.elementType = 'video';
    FamousVideoSurface.prototype.elementClass = 'surface';

    FamousVideoSurface.prototype.setContent = function(videoUrl) {
        this.videoUrl = videoUrl;
        this.contentDirty = true;
    };

    FamousVideoSurface.prototype.deploy = function(target) {
        target.src = this.videoUrl;
        target.autoplay = this.autoplay;
    };

    FamousVideoSurface.prototype.recall = function(target) {
        target.src = '';
    };

    module.exports = FamousVideoSurface;
});

