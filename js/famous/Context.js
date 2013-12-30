define(function(require, exports, module) {
    var RenderNode = require('./RenderNode');
    var FamousEventHandler = require('./EventHandler');
    var SpecParser = require('./SpecParser');
    var ElementAllocator = require('./ElementAllocator');
    var FM = require('./Matrix');
    var Transitionable = require('./Transitionable');

    /**
     * @class The top-level container for a Famous-renderable piece of the 
     *    document.  
     * @description It is directly updated
     *   by the process-wide FamousEngine object, and manages one 
     *   (render tree, event tree) pair, essentially defining their render
     *   and event space.
     *
     * The constructor should only be called by the engine.
     * @name Context
     * @constructor
     * 
     * @example
     *   var mainDiv = document.querySelector('#main'); 
     *   var mainContext = FamousEngine.createContext(mainDiv);
     *   var surface = new FamousSurface([300,50], 'Hello World');
     *   mainContext.link(helloWorldSurface);
     *
     * 
     * @param {FamousSurfaceManager} surfaceManager A {@link FamousSurfaceManager} 
     *   wrapping the top document element in this context.  Note that this div
     *   (for some reason?) is not the source of the document content.
     */
    function Context(container) {
        this.container = container;
        this.allocator = new ElementAllocator(container);

        this.srcNode = new RenderNode();
        this.eventHandler = new FamousEventHandler();
        this._size = [window.innerWidth, window.innerHeight];

        this.perspectiveState = new Transitionable(0);
        this._perspective = undefined;

        this.eventHandler.on('resize', function() {
            this._size = _getElementSize(this.container);
        }.bind(this));
    };

    function _getElementSize(element) {
        return [element.clientWidth, element.clientHeight];
    };

    Context.prototype.getAllocator = function() {
        return this.allocator;
    };

    /**
     * Add renderables to this Context
     *
     * @name Context#include
     * @function
     * @param {renderableComponent} obj 
     * @returns {RenderNode} new node wrapping this object
     */
    Context.prototype.link = function(obj) {
        return this.srcNode.link(obj);
    };

    /**
     * Add renderables to this Context
     *
     * @name Context#add
     * @function
     * @param {renderableComponent} obj 
     * @returns {RenderNode} new node wrapping this object
     */
    Context.prototype.add = function(obj) {
        return this.srcNode.add(obj);
    };

    /**
     * Add modifier renderables to this Context
     *
     * @name Context#mod
     * @function
     * @param {renderableComponent} obj 
     * @returns {RenderNode} new node wrapping this object
     */
    Context.prototype.mod = function(obj) {
        return this.srcNode.mod(obj);
    };

    /**
     * Move this context to another container
     *
     * @name Context#migrate
     * @function
     * @param {Node} container Container node to migrate to
     */
    Context.prototype.migrate = function(container) {
        if(container === this.container) return;
        this.container = container;
        this.allocator.migrate(container);
    };

    /**
     * Gets viewport size for Context
     *
     * @name Context#getSize
     * @function
     *
     * @returns {Array} viewport size
     */
    Context.prototype.getSize = function() {
        return this._size;
    };

    /**
     * Sets viewport size for Context
     *
     * @name Context#setSize
     * @function
     */
    Context.prototype.setSize = function(size) {
        if(!size) size = _getElementSize(this.container);
        this._size = size;
    };

    /**
     * Run the render loop and then the run the update loop for the content 
     *   managed by this context. 
     *   Update the surfaceManager for this context.
     *
     * @name Context#update
     * @function
     */
    Context.prototype.update = function() {
        var perspective = this.perspectiveState.get();
        if(perspective !== this._perspective) {
            this.container.style.perspective = perspective ? perspective.toFixed() + 'px' : '';
            this.container.style.webkitPerspective = perspective ? perspective.toFixed() : '';
            this._perspective = perspective;
        }
        
        if(this.srcNode) { 
            this.srcNode.commit(this, FM.identity, 1, [0, 0], this._size);
        }
    };

    /**
     * Get the 'final result' of engine properties to be applied to the surface
     *   before rendering.  Not used within the engine - primarily for 
     *   debugging or extension purposes.
     *
     * @name Context#getOutputTransform
     * @function
     * @param {Object} surface
     * @returns {surfaceOutputTransform}
     */
    Context.prototype.getOutputTransform = function(surface) {
        var pc = this.parsedCache;
        if(!pc) return;

        var id = surface.id;
        var result = {
            transform: pc.transforms[id],
            opacity: pc.opacities[id]
        };
        if(pc.origins[id]) result.origin = pc.origins[id];
        if(pc.groups[id]) {
            var gid = pc.groups[id];
            result.transform = FM.multiply(result.transform, pc.groupTransforms[gid]);
            if(pc.groupOpacities[gid]) result.opacity *= pc.groupOpacities[gid];
        }
        return result;
    };

    Context.prototype.getPerspective = function() {
        return this.perspectiveState.get();
    };

    Context.prototype.setPerspective = function(perspective, transition, callback) {
        return this.perspectiveState.set(perspective, transition, callback);
    };

    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     *
     * @name Context#emit
     * @function
     *
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     */
    Context.prototype.emit = function(type, event) {
        return this.eventHandler.emit(type, event);
    };

    /**
     * Bind a handler function to an event type occuring in the context.
     *   These events will either come link calling {@link Context#emit} or
     *   directly link the document.  
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the FamousSurface upon which the event occurs, then 
     *   by the on() method of the Context containing that surface, and
     *   finally as a default, the FamousEngine itself. 
     *
     * @name Context#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    Context.prototype.on = function(type, handler) {
        return this.eventHandler.on(type, handler);
    };

    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link Context#on}
     *
     * @name Context#unbind
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler 
     */
    Context.prototype.unbind = function(type, handler) {
        return this.eventHandler.unbind(type, handler);
    };

    /**
     * Emit Context events to downstream event handler
     *
     * @name Context#pipe
     * @function
     * @param {EventHandler} target downstream event handler
     */
    Context.prototype.pipe = function(target) {
        return this.eventHandler.pipe(target);
    };

    /**
     * Stop emitting events to a downstream event handler
     *
     * @name Context#unpipe
     * @function
     * @param {EventHandler} target downstream event handler
     */
    Context.prototype.unpipe = function(target) {
        return this.eventHandler.unpipe(target);
    };

    module.exports = Context;
});
