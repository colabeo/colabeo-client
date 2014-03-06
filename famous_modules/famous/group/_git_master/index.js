var Context   = require('famous/context');
var Transform = require('famous/transform');
var Surface   = require('famous/surface');

/**
 * @class (DEPRECATED) An object designed to contain surfaces and set properties
 *   to be applied to all of them at once.
 *
 * @description
 *  NOTE: DEPRECATED, consider using ContainerSurface instead
 *  * A group will enforce these properties on the 
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
 * @name Group
 * @extends Surface
 * @constructor
 */
function Group(options) {
    Surface.call(this, options);
    this._shouldRecalculateSize = false;
    this._container = document.createDocumentFragment();
    this.context = new Context(this._container);
    this.setContent(this._container);
    this._groupSize = [undefined, undefined];

    this._origin = undefined;
    this._originTransfer = {
        render: function(input) {
            return {origin: this._origin, target: input};
        }.bind(this)
    };
};

/** @const */ Group.SIZE_ZERO = [0, 0];

Group.prototype = Object.create(Surface.prototype);
Group.prototype.elementType = 'div';
Group.prototype.elementClass = 'famous-group';

Group.prototype.add = function() {
    var segment = this.context.add(this._originTransfer);
    return segment.add.apply(segment, arguments);
};
Group.prototype.add = function() { return this.context.add.apply(this.context, arguments); };

Group.prototype.render = function() {
    return Surface.prototype.render.call(this);
};

Group.prototype.deploy = function(target) {
    this.context.migrate(target);
};

Group.prototype.recall = function(target) {
    this._container = document.createDocumentFragment();
    this.context.migrate(this._container);
};

Group.prototype.commit = function(context) {
    var transform = context.transform;
    var opacity = context.opacity;
    var origin = context.origin;
    var size = context.size;

    transform = Transform.moveThen([-origin[0]*size[0], -origin[1]*size[1], 0], transform);
    var result = Surface.prototype.commit.call(this, context, transform, opacity, origin, Group.SIZE_ZERO);
    this._origin = origin;
    if(size[0] != this._groupSize[0] || size[1] != this._groupSize[1]) {
        this.context.setSize(size);
        this._groupSize[0] = size[0];
        this._groupSize[1] = size[1];
    }
    this.context.update();
    return result;
}; 

module.exports = Group;