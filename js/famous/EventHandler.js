define(function(require, exports, module) {
   
    /**
     * @class This object gives the user the opportunity to explicitly 
     *   control event propagation in their application.
     * @description FamousEventHandler forwards received events to a set of 
     *   provided callback functions.  It allows events to be either piped
     *   through to other layers of {@link FamousEventHandler} objects
     *   or "captured" at this layer (and not forwarded).
     *
     * @name FamousEventHandler
     * @constructor
     * @struct
     * 
     * @example
     *    var eventArbiter = new FamousEventArbiter(PAGES.COVER);
     *    var coverHandler = eventArbiter.forMode(PAGES.COVER);
     *    coverHandler.on('my_event', function(event) { 
     *      document.title = 'Cover'; 
     *    });
     *    var overviewHandler = eventArbiter.forMode(PAGES.OVERVIEW)
     *    overviewHandler.on('my_event', function(event) { 
     *      document.title = 'Overview'; 
     *    });
     *  
     *    function loadPage(page) {
     *      eventArbiter.setMode(page);
     *      eventArbiter.emit('my_event', {data: 123})
     *    };
     *
     *    loadPage(PAGES.COVER);
     * 
     */
    function FamousEventHandler() {
        this.listeners = {};
        this.downstream = []; // downstream event handlers
        this.downstreamFn = []; // downstream functions
        this.owner = this;
    };

    /**
     * Send event data to all handlers matching provided 'type' key. If handler 
     *    is not set to "capture", pass on to any next handlers also. Event's 
     *    "origin" field is set to this object if not yet set.
     *
     * @name FamousEventHandler#emit
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event received event data
     * @returns {boolean} true if this event has been handled by any handler
     */
    FamousEventHandler.prototype.emit = function(type, event) {
        if(!event) event = {};

        var handlers = this.listeners[type];
        var handled = false;
        if(handlers) {
            for(var i = 0; i < handlers.length; i++) {
                if(handlers[i].call(this.owner, event)) handled = true;
            }
        }

        return _emitNext.call(this, type, event) || handled;
    };

    /**
     * Send event data to downstream handlers responding to this event type.
     *
     * @name _emitNext
     * @function
     * @private
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event received event data
     * @returns {boolean} true if this event has been handled by any 
     *   downstream handler
     */
    function _emitNext(type, event) {
        var handled = false;
        for(var i = 0; i < this.downstream.length; i++) {
            handled = this.downstream[i].emit(type, event) || handled;
        }
        for(var i = 0; i < this.downstreamFn.length; i++) {
            handled = this.downstreamFn[i](type, event) || handled;
        }
        return handled;
    };

    /**
     * Add handler function to set of callback functions for the provided 
     *   event type.  
     *   The handler will receive the original emitted event data object
     *   as its sole argument.
     * 
     * @name FamousEventHandler#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {function(string, Object)} handler handler function
     * @returns {FamousEventHandler} this
     */
    FamousEventHandler.prototype.on = function(type, handler) {
        if(!this.listeners[type]) this.listeners[type] = [];
        var index = this.listeners[type].indexOf(handler);
        if(index < 0) this.listeners[type].push(handler);
        return this;
    };

    /**
     * Remove handler function from set of callback functions for the provided 
     *   event type. 
     * Undoes work of {@link EventHandler#on}
     * 
     * @name FamousEventHandler#unbind
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {function(string, Object)} handler
     */
    FamousEventHandler.prototype.unbind = function(type, handler) {
        var index = this.listeners[type].indexOf(handler);
        if(index >= 0) this.listeners[type].splice(index, 1);
    };

    /** 
     * Add handler object to set of DOWNSTREAM handlers.
     * 
     * @name FamousEventHandler#pipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    FamousEventHandler.prototype.pipe = function(target) {
        var downstreamCtx = (target instanceof Function) ? this.downstreamFn : this.downstream;
        var index = downstreamCtx.indexOf(target);
        if(index < 0) downstreamCtx.push(target);

        if(target instanceof Function) target('pipe');
        else target.emit('pipe');

        return target;
    };

    /**
     * Remove handler object from set of DOWNSTREAM handlers.
     * Undoes work of {@link EventHandler#pipe}
     * 
     * @name FamousEventHandler#unpipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    FamousEventHandler.prototype.unpipe = function(target) {
        var downstreamCtx = (target instanceof Function) ? this.downstreamFn : this.downstream;
        var index = downstreamCtx.indexOf(target);
        if(index >= 0) {
            downstreamCtx.splice(index, 1);
            if(target instanceof Function) target('unpipe');
            else target.emit('unpipe');
            return target;
        }
        else return false;
    };

    /**
     * Call event handlers with this set to owner
     *
     * @name FamousEventHandler#bindThis
     * @function
     * @param {Object} owner object this EventHandler belongs to
     */
    FamousEventHandler.prototype.bindThis = function(owner) {
        this.owner = owner;
    };

    /**
     * Assign an event handler to receive an object's events
     *
     * @name FamousEventHandler#setInputHandler
     * @static
     * @function
     * @param {Object} object object to mix in emit function
     * @param {emitterObject} handler assigned event handler
     */
    FamousEventHandler.setInputHandler = function(object, handler) {
        object.emit = handler.emit.bind(handler);
    };

    /**
     * Assign an event handler to emit an object's events
     *
     * @name FamousEventHandler#setOutputHandler
     * @static
     * @function
     * @param {Object} object object to mix in pipe/unpipe/on/unbind functions
     * @param {emitterObject} handler assigned event emitter
     */
    FamousEventHandler.setOutputHandler = function(object, handler) {
        if(handler instanceof FamousEventHandler) handler.bindThis(object);
        object.pipe = handler.pipe.bind(handler);
        object.unpipe = handler.unpipe.bind(handler);
        object.on = handler.on.bind(handler);
        object.unbind = handler.unbind.bind(handler);
    };

    module.exports = FamousEventHandler;
});
