define(function(require, exports, module) {
    /**
     * @namespace FamousEngine
     * 
     * @description The singleton object initiated upon process
     *    startup which manages all active {@link FamousContext} instances, runs
     *    the render dispatch loop, and acts as a global listener and dispatcher
     *    for all events. Public functions include
     *    adding contexts and functions for execution at each render tick.
     * 
     *   On static initialization, window.requestAnimationFrame is called with
     *   the event loop function, step().
     * 
     *   Note: Any window in which FamousEngine runs will prevent default 
     *     scrolling behavior on the 'touchmove' event.
     * @static
     * 
     * @name FamousEngine
     * 
     * @example
     *   var mainDiv = document.querySelector('#main'); 
     *   var mainContext = FamousEngine.createContext(mainDiv);
     *   var surface = new FamousSurface([300,50], 'Hello World');
     *   mainContext.from(helloWorldSurface);
     */
    var FamousContext = require('./Context');
    var FamousEventHandler = require('./EventHandler');
    var Utils       = require('famous-utils/Utils');

    var contexts = [];
    var nextTickQueue = [];
    var deferQueue = [];

    var lastTime = Date.now();
    var frameTime = undefined;
    var frameTimeLimit = undefined;
    var eventHandler = new FamousEventHandler();

    /** @const */ var MAX_DEFER_FRAME_TIME = 10;

    var entities = [];

    /**
     * Inside requestAnimationFrame loop, this function is called which:
     *   - calculates current FPS (throttling loop if over limit set in setFPSCap)
     *   - emits dataless 'prerender' event on start of loop
     *   - call in order any one-shot function registered by nextTick on last loop.
     *   - call FamousContext.update on all {@link FamousContext} objects registered.
     *   - emits dataless 'postrender' event on end of loop
     * @name FamousEngine#step
     * @function
     * @private
     */
    function step() {
        var currTime = Date.now();
        // skip frame if we're over our framerate cap
        if(frameTimeLimit && currTime - lastTime < frameTimeLimit) {
            requestAnimationFrame(step);
            return;
        }
        frameTime = currTime - lastTime;
        lastTime = currTime;

        eventHandler.emit('prerender');

        // empty the queue
        for(var i = 0; i < nextTickQueue.length; i++) nextTickQueue[i].call(this);
        nextTickQueue = [];

        // limit total execution time for deferrable functions
        while(deferQueue.length && (Date.now() - currTime) < MAX_DEFER_FRAME_TIME) {
            deferQueue.shift().call(this);
        }

        for(var i = 0; i < contexts.length; i++) contexts[i].update();

        eventHandler.emit('postrender');

        requestAnimationFrame(step);
    };

    requestAnimationFrame(step);

    /**
     * Upon main document window resize (unless on an "input" HTML element)
     *   - scroll to the top left corner of the window
     *   - For each managed {@link FamousContext}: emit the 'resize' and update its size 
     *     with any {@link FamousSurfaceManager} managing that context.
     * @name FamousEngine#step
     * @function
     * @static
     * @private
     * 
     * @param {Object=} event
     */
    // TODO: hacks
    function handleResize(event) {
        if(Utils.isMobile() && document.activeElement && document.activeElement.nodeName == 'INPUT') {
            if (document.activeElement.name == 'message') {
                doResize();
            }
            return;
        }
        doResize();
    };
    function doResize() {
        window.scrollTo(0, 0);
        for(var i = 0; i < contexts.length; i++) {
            contexts[i].emit('resize');
        }
        eventHandler.emit('resize');
    }
    window.addEventListener('resize', handleResize.bind(this), false);
    handleResize();

    on('click', onEngineTouchstart.bind(this));
    function onEngineTouchstart(e) {
        if (e.target.tagName == 'INPUT') {
            $(e.target).focus();
            this._input = e.target;
        } else if (e.target.className != 'send-text-button') {
            if (this._input) {
                $(this._input).blur();
                this._input = null;
            }
        }
    }

    // prevent scrolling via browser
    window.addEventListener('touchmove', function(event) { event.preventDefault(); }, false);

    /**
     * Pipes all events to a target object that implements the #emit() interface.
     * TODO: Confirm that "uncaught" events that bubble up to the document.
     * @name FamousEngine#pipe
     * @function
     * @param {emitterObject} target target emitter object
     * @returns {emitterObject} target emitter object (for chaining)
     */
    function pipe(target) { 
        return eventHandler.pipe(target);
    };

    /**
     * WARNING: DEPRECATED
     * @deprecated
     *
     * @name FamousEngine#pipeEvents
     * @function
     * @param {emitterObject} target target emitter object
     * @returns {emitterObject} target meitter object (for chaining)
     */
    function pipeEvents(target) {
        console.warn('pipeEvents is deprecated; use pipe instead');
        return pipeEvents(target);
    };

    /**
     * Stop piping all events at the FamousEngine level to a target emitter 
     *   object.  Undoes the work of {@link FamousEngine#pipe}.
     * 
     * @name FamousEngine#unpipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    function unpipe(target) { 
        return eventHandler.unpipe(target);
    };

    var eventTypes = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'click', 'keydown', 'keyup', 'keypress', 'mouseup', 'mousedown', 'mousemove', 'mouseover', 'mouseout', 'mousewheel', 'wheel', 'resize'];
    for(var i = 0; i < eventTypes.length; i++) {
        var type = eventTypes[i];
        document.body.addEventListener(type, function(event) {
            eventHandler.emit(event.type, event, false);
        }, false);
    }

    /**
     * Bind a handler function to a document or Engine event.
     *   These events will either come from calling {@link FamousEngine#emit} or
     *   directly from the document.  The document events to which FamousEngine 
     *   listens by default include: 'touchstart', 'touchmove', 'touchend', 
     *   'touchcancel', 
     *   'click', 'keydown', 'keyup', 'keypress', 'mousemove', 
     *   'mouseover', 'mouseout'.  
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the FamousSurface upon which the event occurs, then 
     *   by the on() method of the FamousContext containing that surface, and
     *   finally as a default, the FamousEngine itself.
     * @static
     * @name FamousEngine#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    function on(type, handler) { 
        eventHandler.on(type, handler); 
    };

    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     *
     * @static
     * @name FamousEngine#emit
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     */
    function emit(type, event) { 
        eventHandler.emit(type, event); 
    };

    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link FamousEngine#on}
     * 
     * @static
     * @name FamousEngine#unbind
     * @function
     * @param {string} type 
     * @param {function(string, Object)} handler 
     */
    function unbind(type, handler) { 
        eventHandler.unbind(type, handler); 
    };

    /**
     * Return the current calculated frames per second of the FamousEngine.
     * 
     * @static
     * @name FamousEngine#getFPS
     * @function
     * @returns {number} calculated fps
     */
    function getFPS() {
        return 1000 / frameTime;
    };

    /**
     * Set the maximum fps at which the system should run. If internal render
     *    loop is called at a greater frequency than this FPSCap, Engine will
     *    throttle render and update until this rate is achieved.
     * 
     * @static
     * @name FamousEngine#setFPS
     * @function
     * @param {number} fps desired fps
     */
    function setFPSCap(fps) {
        frameTimeLimit = Math.floor(1000 / fps);
    };

    /**
     * Creates a new context for Famous rendering and event handling with
     *    provided HTML element as top of each tree. This will be tracked by the
     *    process-wide {@link FamousEngine}, and this will add a {@link
     *    FamousSurfaceManager} to the HTMLElement provided.
     *
     * @static
     * @name FamousEngine#createContext
     * @function
     * @param {Element} el Top of document tree
     * @returns {FamousContext}
     */
    function createContext(el) {
        if(el === undefined) {
            el = document.createElement('div');
            el.classList.add('container');
            document.body.appendChild(el);
        }
        else if(!(el instanceof Element)) {
            el = document.createElement('div');
            console.warn('Tried to create context on non-existent element');
        }
        var context = new FamousContext(el);
        contexts.push(context);
        return context;
    };

    /**
     * Queue a function to be executed on the next tick of the {@link
     *    FamousEngine}.  The function's only argument will be the 
     *    JS window object.
     *    
     * @static
     * @name FamousEngine#nextTick
     * @function
     * @param {Function} fn
     */
    function nextTick(fn) {
        nextTickQueue.push(fn);
    };

    function getEntity(id) {
        return entities[id];
    };

    function registerEntity(entity) {
        var id = entities.length;
        entities[id] = entity;
        return id;
    };

    /**
     * Queue a function to be executed sometime soon, at a time that is
     *    unlikely to affect framerate.
     *
     * @static
     * @name FamousEngine#defer
     * @function
     * @param {Function} fn
     */
    function defer(fn) {
        deferQueue.push(fn);
    };

    module.exports = {
        on: on,
        defer: defer,
        emit: emit,
        unbind: unbind,
        pipe: pipe,
        unpipe: unpipe,
        createContext: createContext,
        getFPS: getFPS,
        setFPSCap: setFPSCap,
        nextTick: nextTick,
        getEntity: getEntity,
        registerEntity: registerEntity
    };
});
