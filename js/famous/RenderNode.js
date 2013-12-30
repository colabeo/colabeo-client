define(function(require, exports, module) {
    var Entity = require('./Entity');
    var SpecParser = require('./SpecParser');
    var FM = require('./Matrix');
    
    /**
     * @class A linked list objectect wrapping a
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
     * @param {renderableComponent} object Target render()able component 
     */
    function RenderNode(object) {
        this.modifiers = [];
        this.object = undefined;
        if(object) this.set(object);

        this._hasCached = false;
        this._resultCache = {};
        this._prevResults = {};
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
        if(!(this.get() instanceof Array)) this.set([]);
        var node = new RenderNode(object);
        this.get().push(node);
        return node;
    };

    /**
     * Adds a modifier to the chain
     *
     * Note: syntactic sugar
     *
     * @deprecated
     * 
     * @name RenderNode#mod
     * @function
     *
     * @returns [RenderNode} this render node
     */
    RenderNode.prototype.mod = function(object) {
        this.modifiers.push(object);
        return this;
    };

    RenderNode.prototype.commit = function(context, transform, opacity, origin, size) {
        var renderResult = this.render(undefined, this._hasCached);

        if(renderResult !== true) {
            // free up some divs from the last loop
            for(var i in this._prevResults) {
                if(!(i in this._resultCache)) {
                    var object = Entity.get(i);
                    if(object.cleanup) object.cleanup(context.getAllocator());
                }
            }

            this._prevResults = this._resultCache;
            this._resultCache = {};
            _applyCommit({
                transform: transform,
                size: size,
                origin: origin,
                opacity: opacity,
                target: renderResult
            }, context, this._resultCache);

            this._hasCached = true;
        }
    };

    function _applyCommit(spec, context, cacheStorage) {
        var result = SpecParser.parse(spec);
        for(var i in result) {
            var childNode = Entity.get(i);
            var commitParams = result[i];
            commitParams.unshift(context);
            var commitResult = childNode.commit.apply(childNode, commitParams);
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
});
