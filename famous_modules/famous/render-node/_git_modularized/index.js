var Entity = require('famous/entity');
var SpecParser = require('famous/spec-parser');
var Transform = require('famous/transform');

/**
 * @class RenderNode
 *
 * @description A linked list object wrapping a
 *    {@link renderableComponent} (like a {@link FamousTransform} or 
 *    {@link FamousSurface}) for insertion into the render tree.
 * 
 * Scope: Ideally, RenderNode should not be visible below the level
 * of component developer.
 *
 * @name RenderNode
 * @constructor
 * 
 * @example  < This should not be used by component engineers >
 * 
 * @param {renderableComponent} object Target render()able component 
 */
function RenderNode(object) {
    this.modifiers = [];
    this.object = undefined;
    if(object) this.set(object);

    this._hasCached = false;
    this._resultCache = {};
    this._prevResults = {};

    // these flags purely for verification in debug builds
    this._objectsAdded = false;
    this._beenUsed = false;
};

/**
 * Get the wrapped {@link renderableComponent}
 * 
 * @name RenderNode#get
 * @function
 *
 * @returns {renderableComponent} 
 */
RenderNode.prototype.get = function() {
    return this.object;
};

/**
 * Set the wrapped (@link renderableComponent}
 *
 * @name RenderNode#set
 * @function
 */
RenderNode.prototype.set = function(object) {
    this.object = object;
};

/**
 * Declare that content for the wrapped renderableComponent will come link
 *    the provided renderableComponent, effectively adding the provided
 *    component to the render tree.
 *
 * Note: syntactic sugar
 * 
 * @name RenderNode#link
 * @function
 *    
 * @returns {RenderNode} this render node
 */
RenderNode.prototype.link = function(object) {
    if(this._objectsAdded) throw 'RenderNode: Illegal usage of link() after add()';
    if(this._beenUsed) throw 'RenderNode: Undefined behavior: link() called after setup; use set() instead';

    if(object instanceof Array) this.set(object);
    else {
        var currentObject = this.get();
        if(currentObject) {
            if(currentObject instanceof Array) {
                this.modifiers.unshift(object);
            }
            else {
                this.modifiers.unshift(currentObject);
                this.set(object);
            }
        }
        else {
            this.set(object);
        }
    }
    return this;
};

/**
 * Add an object to the set of objects rendered
 *
 * Note: syntactic sugar
 *
 * @name RenderNode#add
 * @function
 * 
 * @param {renderableComponent} object renderable to add
 * @returns {RenderNode} render node representing added branch
 */
RenderNode.prototype.add = function(object) {
    if(this._beenUsed) throw 'RenderNode: Potential abstraction violation: add() called after setup; use collection view instead';
    this._objectsAdded = true; // this flag purely for verification in debug builds

    if(!(this.get() instanceof Array)) this.set([]);
    var node = new RenderNode(object);
    this.get().push(node);
    return node;
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
RenderNode.prototype.render = function(input) {
    // this statement purely for verification in debug builds
    this._beenUsed = true;

    var result = input;
    var object = this.get();
    if(object) {
        if(object.render) result = object.render(input);
        else {
            var i = object.length - 1;
            result = new Array(i);
            while(i >= 0) {
                result[i] = object[i].render();
                i--;
            }
        }
    }
    var modifierCount = this.modifiers.length;
    for(var i = 0; i < modifierCount; i++) {
        result = this.modifiers[i].render(result);
    }
    return result;
};

module.exports = RenderNode;
