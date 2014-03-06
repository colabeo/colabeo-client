var Entity     = require('famous/entity');
var SpecParser = require('famous/spec-parser');

/**
 * @class A tree node wrapping a
 *   {@link renderableComponent} (like a {@link FamousTransform} or
 *   {@link FamousSurface}) for insertion into the render tree.
 *
 * @description Note that class may be removed in the near future.
 *
 * Scope: Ideally, RenderNode should not be visible below the level
 * of component developer.
 *
 * @name RenderNode
 * @constructor
 *
 * @example  < This should not be used by component engineers >
 *
 * @param {renderableComponent} child Target renderable component
 */
function RenderNode(object) {
    this._object = object ? object : null;
    this._child = null;

    this._hasCached   = false;
    this._resultCache = {};
    this._prevResults = {};

    this._childResult = null;
};

/**
 * Append a renderable to its children.
 *
 * @name RenderNode#add
 * @function
 *
 * @returns {RenderNode} this render node
 */
RenderNode.prototype.add = function(child) {
    var childNode = (child instanceof RenderNode) ? child : new RenderNode(child);

    if(this._child instanceof Array) this._child.push(childNode);
    else if(this._child) {
        this._child = [this._child, childNode];
        this._childResult = []; // to be used later
    }
    else this._child = childNode;

    return childNode;
};

RenderNode.prototype.get = function() {
    return this._object || this._child.get();
};

RenderNode.prototype.getSize = function() {
    var target = this.get();
    if(target && target.getSize) {
        return target.getSize();
    }
    else {
        return (this._child && this._child.getSize) ? this._child.getSize() : null;
    }
};

RenderNode.prototype.commit = function(context) {
    var renderResult = this.render(undefined, this._hasCached);

    if(renderResult !== true) {
        // free up some divs from the last loop
        for(var i in this._prevResults) {
            if(!(i in this._resultCache)) {
                var object = Entity.get(i);
                if(object.cleanup) object.cleanup(context.allocator);
            }
        }

        this._prevResults = this._resultCache;
        this._resultCache = {};
        _applyCommit(renderResult, context, this._resultCache);

        this._hasCached = true;
    }
};

function _applyCommit(spec, context, cacheStorage) {
    var result = SpecParser.parse(spec, context);
    for(var i in result) {
        var childNode = Entity.get(i);
        var commitParams = result[i];
        commitParams.allocator = context.allocator;
        var commitResult = childNode.commit(commitParams);
        if(commitResult) _applyCommit(commitResult, context, cacheStorage);
        else cacheStorage[i] = commitParams;
    }
};

/**
 * Render the component wrapped directly by this node.
 *
 * @name RenderNode#render
 * @function
 *
 * @returns {renderSpec} render specification for the component subtree
 *    only under this node.
 */
RenderNode.prototype.render = function() {
    if(this._object && this._object.render) return this._object.render();

    var result = null;
    if(this._child instanceof Array) {
        result = this._childResult;
        var children = this._child;
        for(var i = 0; i < children.length; i++) {
            result[i] = children[i].render();
        }
    }
    else if(this._child) {
        result = this._child.render();
    }
    if(this._object && this._object.modify) result = this._object.modify(result);
    return result;
};

module.exports = RenderNode;