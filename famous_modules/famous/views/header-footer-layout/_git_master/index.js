var Entity     = require('famous/entity');
var RenderNode = require('famous/render-node');
var Transform  = require('famous/transform');

/**
 * @class A flexible layout that can sequentially lay out three renderables
 * @description
 *   Takes a header and footer of determinate length and a content of 
 *   flexible length. If headerSize property is omitted the size of the
 *   linked renderable will be used as the header size.
 * @name HeaderFooterLayout
 * @constructor
 * @example 
 *   var header = new Surface({
 *       size: [undefined, 100],
 *       content: 'Header / Caption'
 *   });
 *   var content = new Surface({
 *       content: 'Lorem ipsum sit dolor amet'
 *   });
 *   var footer = new Surface({
 *       size: [undefined, 100],
 *       content: 'Footer goes here'
 *   });
 *
 *   var myLayout = new HeaderFooterLayout();
 *   myLayout.id.header.link(header); // attach header
 *   myLayout.id.content.link(content); // attach content (will be auto-sized)
 *   myLayout.id.footer.link(footer); // attach footer
 *
 *   myContext.link(myLayout);
 */
function HeaderFooterLayout(options) {
    this.options = Object.create(HeaderFooterLayout.DEFAULT_OPTIONS);
    if(options) this.setOptions(options);

    this._entityId = Entity.register(this);

    this._header = new RenderNode();
    this._footer = new RenderNode();
    this._content = new RenderNode();

    this.id = {
        'header': this._header,
        'footer': this._footer,
        'content': this._content
    };
}

/** @const */ HeaderFooterLayout.DIRECTION_X = 0;
/** @const */ HeaderFooterLayout.DIRECTION_Y = 1;

HeaderFooterLayout.DEFAULT_OPTIONS = {
    direction: HeaderFooterLayout.DIRECTION_Y,
    headerSize: undefined,
    footerSize: undefined,
    defaultHeaderSize: 0,
    defaultFooterSize: 0
};

HeaderFooterLayout.prototype.render = function() {
    return this._entityId;
};

HeaderFooterLayout.prototype.setOptions = function(options) {
    for (var key in HeaderFooterLayout.DEFAULT_OPTIONS) {
        if(options[key] !== undefined) this.options[key] = options[key];
    }
};

function _resolveNodeSize(node, defaultSize) {
    var nodeSize = node.getSize();
    return nodeSize ? nodeSize[this.options.direction] : defaultSize;
}

function _outputTransform(offset) {
    if(this.options.direction == HeaderFooterLayout.DIRECTION_X) return Transform.translate(offset, 0, 0);
    else return Transform.translate(0, offset, 0);
}

function _finalSize(directionSize, size) {
    if(this.options.direction == HeaderFooterLayout.DIRECTION_X) return [directionSize, size[1]];
    else return [size[0], directionSize];
}

HeaderFooterLayout.prototype.commit = function(context) {
    var transform = context.transform;
    var opacity = context.opacity;
    var origin = context.origin;
    var size = context.size;

    var headerSize = this.options.headerSize !== undefined ? this.options.headerSize : _resolveNodeSize.call(this, this._header, this.options.defaultHeaderSize);
    var footerSize = this.options.footerSize !== undefined ? this.options.footerSize : _resolveNodeSize.call(this, this._footer, this.options.defaultFooterSize);
    var contentSize = size[this.options.direction] - headerSize - footerSize;

    var topOrigin = [0.5, 0.5];
    var bottomOrigin = [0.5, 0.5];
    topOrigin[this.options.direction] = 0;
    bottomOrigin[this.options.direction] = 1;

    var result = [
        {
            origin: topOrigin,
            size: _finalSize.call(this, headerSize, size),
            target: this._header.render()
        },
        {
            transform: _outputTransform.call(this, headerSize),
            origin: topOrigin,
            size: _finalSize.call(this, contentSize, size),
            target: this._content.render()
        },
        {
            origin: bottomOrigin,
            size: _finalSize.call(this, footerSize, size),
            target: this._footer.render()
        }
    ];

    transform = Transform.moveThen([-size[0]*origin[0], -size[1]*origin[1], 0], transform);

    var nextSpec = {
        transform: transform,
        opacity: opacity,
        origin: origin,
        size: size,
        target: result
    };

    return nextSpec;
};

module.exports = HeaderFooterLayout;
