define(function(require, exports, module) {
    var Surface = require('./Surface');
    var Context = require('./Context');

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
     *   SurfaceManager} unique to this Container Surface.
     *   Implementation note: in the DOM case, this will generate a div with 
     *   the style 'containerSurface' applied.
     *   
     * @name ContainerSurface
     * @extends Surface
     * @constructor
     */
    function ContainerSurface(options) {
        Surface.call(this, options);
        this._container = document.createElement('div');
        this._container.classList.add('group');
        this._container.style.width = '100%';
        this._container.style.height = '100%';
        this._container.style.position = 'relative';
        this._shouldRecalculateSize = false;
        this.context = new Context(this._container);
        this.setContent(this._container);
    };

    ContainerSurface.prototype = Object.create(Surface.prototype);
    ContainerSurface.prototype.elementType = 'div';
    ContainerSurface.prototype.elementClass = 'surface';

    ContainerSurface.prototype.link = function() { return this.context.link.apply(this.context, arguments); };
    ContainerSurface.prototype.add = function() { return this.context.add.apply(this.context, arguments); };
    ContainerSurface.prototype.mod = function() { return this.context.mod.apply(this.context, arguments); };

    ContainerSurface.prototype.render = function() {
        if(this._sizeDirty) this._shouldRecalculateSize = true;
        return Surface.prototype.render.call(this);
    };

    ContainerSurface.prototype.commit = function() {
        var result = Surface.prototype.commit.apply(this, arguments);
        if(this._shouldRecalculateSize) {
            this.context.setSize();
            this._shouldRecalculateSize = false;
        }
        this.context.update();
        return result;
    }; 

    module.exports = ContainerSurface;
});

