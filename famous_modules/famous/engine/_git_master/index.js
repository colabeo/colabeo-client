/**
 * @namespace Engine
 * 
 * @description The singleton object initiated upon process
 *    startup which manages all active {@link Context} instances, runs
 *    the render dispatch loop, and acts as a global listener and dispatcher
 *    for all events. Public functions include
 *    adding contexts and functions for execution at each render tick.
 * 
 *   On static initialization, window.requestAnimationFrame is called with
 *   the event loop function, step().
 * 
 *   Note: Any window in which Engine runs will prevent default 
 *     scrolling behavior on the 'touchmove' event.
 * @static
 * 
 * @name Engine
 * 
 * @example
 *   var mainDiv = document.querySelector('#main'); 
 *   var mainContext = Engine.createContext(mainDiv);
 *   var surface = new FamousSurface([300,50], 'Hello World');
 *   mainContext.from(helloWorldSurface);
 */
var Context = require('famous/context');
var EventHandler = require('famous/event-handler');
var OptionsManager = require('famous/options-manager');

var Engine = {};

var contexts = [];
var nextTickQueue = [];
var deferQueue = [];

var lastTime = Date.now();
var frameTime = undefined;
var frameTimeLimit = undefined;
var loopEnabled = true;
var eventForwarders = {};
var eventHandler = new EventHandler();

var options = {
    containerType: 'div',
    containerClass: 'famous-container',
    fpsCap: undefined,
    runLoop: true
};
var optionsManager = new OptionsManager(options);
optionsManager.on('change', function(data) {
    if(data.id === 'fpsCap') setFPSCap(data.value);
    else if(data.id === 'runLoop') {
        // kick off the loop only if it was stopped
        if(!loopEnabled && data.value) {
            loopEnabled = true;
            requestAnimationFrame(loop);
        }
    }
});

/** @const */ var MAX_DEFER_FRAME_TIME = 10;

/**
 * Inside requestAnimationFrame loop, this function is called which:
 *   - calculates current FPS (throttling loop if it is over limit set in setFPSCap)
 *   - emits dataless 'prerender' event on start of loop
 *   - calls in order any one-shot functions registered by nextTick on last loop.
 *   - calls Context.update on all {@link Context} objects registered.
 *   - emits dataless 'postrender' event on end of loop
 * @name Engine#step
 * @function
 * @private
 */
Engine.step = function() {
    var currentTime = Date.now();
    // skip frame if we're over our framerate cap
    if(frameTimeLimit && currentTime - lastTime < frameTimeLimit) return;
    frameTime = currentTime - lastTime;
    lastTime = currentTime;

    eventHandler.emit('prerender');

    // empty the queue
    for(var i = 0; i < nextTickQueue.length; i++) nextTickQueue[i].call(this);
    nextTickQueue.splice(0);

    // limit total execution time for deferrable functions
    while(deferQueue.length && (Date.now() - currentTime) < MAX_DEFER_FRAME_TIME) {
        deferQueue.shift().call(this);
    }

    for(var i = 0; i < contexts.length; i++) contexts[i].update();

    eventHandler.emit('postrender');
};

function loop() {
    if(options.runLoop) {
        Engine.step();
        requestAnimationFrame(loop);
    }
    else loopEnabled = false;
};
requestAnimationFrame(loop);

/**
 * Upon main document window resize (unless on an "input" HTML element)
 *   - scroll to the top left corner of the window
 *   - For each managed {@link Context}: emit the 'resize' event and update its size 
 * @name Engine#step
 * @function
 * @static
 * @private
 * 
 * @param {Object=} event
 */
function handleResize(event) {
    if(document.activeElement && document.activeElement.nodeName == 'INPUT') {
        document.activeElement.addEventListener('blur', function deferredResize() {
            this.removeEventListener('blur', deferredResize);
            handleResize(event);
        });
        return;
    }
    window.scrollTo(0, 0);
    for(var i = 0; i < contexts.length; i++) {
        contexts[i].emit('resize');
    }
    eventHandler.emit('resize');
};
window.addEventListener('resize', handleResize, false);
handleResize();

// prevent scrolling via browser
window.addEventListener('touchmove', function(event) { event.preventDefault(); }, false);

/**
 * Pipes all events to a target object that implements the #emit() interface.
 * TODO: Confirm that "uncaught" events that bubble up to the document.
 * @name Engine#pipe
 * @function
 * @param {emitterObject} target target emitter object
 * @returns {emitterObject} target emitter object (for chaining)
 */
Engine.pipe = function(target) { 
    if(target.subscribe instanceof Function) return target.subscribe(Engine);
    else return eventHandler.pipe(target);
};

/**
 * Stop piping all events at the Engine level to a target emitter 
 *   object.  Undoes the work of {@link Engine#pipe}.
 * 
 * @name Engine#unpipe
 * @function
 * @param {emitterObject} target target emitter object
 */
Engine.unpipe = function(target) {
    if(target.unsubscribe instanceof Function) return target.unsubscribe(Engine);
    else return eventHandler.unpipe(target);
};

/**
 * Bind a handler function to a document or Engine event.
 *   These events will either come from calling {@link Engine#emit} or
 *   directly from the document.  The document events to which Engine 
 *   listens by default include: 'touchstart', 'touchmove', 'touchend', 
 *   'touchcancel', 
 *   'click', 'keydown', 'keyup', 'keypress', 'mousemove', 
 *   'mouseover', 'mouseout'.  
 *   Document events have the opportunity to first be intercepted by the 
 *   on() method of the FamousSurface upon which the event occurs, then 
 *   by the on() method of the Context containing that surface, and
 *   finally as a default, the Engine itself.
 * @static
 * @name Engine#on
 * @function
 * @param  {string} type event type key (for example, 'click')
 * @param {function(string, Object)} handler callback
 */
Engine.on = function(type, handler) { 
    if(!(type in eventForwarders)) {
        eventForwarders[type] = eventHandler.emit.bind(eventHandler, type);
        document.body.addEventListener(type, eventForwarders[type]);
    }
    return eventHandler.on(type, handler); 
};

/**
 * Trigger an event, sending to all downstream handlers
 *   matching provided 'type' key.
 *
 * @static
 * @name Engine#emit
 * @function
 * @param {string} type event type key (for example, 'click')
 * @param {Object} event event data
 */
Engine.emit = function(type, event) { 
    return eventHandler.emit(type, event); 
};

/**
 * Unbind an event by type and handler.  
 *   This undoes the work of {@link Engine#on}
 * 
 * @static
 * @name Engine#unbind
 * @function
 * @param {string} type 
 * @param {function(string, Object)} handler 
 */
Engine.unbind = function(type, handler) { 
    return eventHandler.unbind(type, handler); 
};

/**
 * Return the current calculated frames per second of the Engine.
 * 
 * @static
 * @name Engine#getFPS
 * @function
 * @returns {number} calculated fps
 */
Engine.getFPS = function() {
    return 1000 / frameTime;
};

/**
 * Set the maximum fps at which the system should run. If internal render
 *    loop is called at a greater frequency than this FPSCap, Engine will
 *    throttle render and update until this rate is achieved.
 * 
 * @static
 * @name Engine#setFPS
 * @function
 * @param {number} fps desired fps
 */
Engine.setFPSCap = function(fps) {
    frameTimeLimit = Math.floor(1000 / fps);
};

/**
 * Return engine options
 * 
 * @static
 * @name Engine#getOptions
 * @function
 * @returns {Object} options
 */
Engine.getOptions = function() {
    return optionsManager.getOptions.apply(optionsManager, arguments);
};

/**
 * Set engine options
 * 
 * @static
 * @name Engine#setOptions
 * @function
 */
Engine.setOptions = function(options) {
    return optionsManager.setOptions.apply(optionsManager, arguments);
};

/**
 * Creates a new context for Famous rendering and event handling with
 *    provided HTML element as top of each tree. This will be tracked by the
 *    process-wide {@link Engine}.
 *
 * Note: syntactic sugar
 *
 * @static
 * @name Engine#createContext
 * @function
 * @param {Element} el Top of document tree
 * @returns {Context}
 */
Engine.createContext = function(el) {
    if(el === undefined) {
        el = document.createElement(options.containerType);
        el.classList.add(options.containerClass);
        document.body.appendChild(el);
    }
    else if(!(el instanceof Element)) {
        el = document.createElement(options.containerType);
        console.warn('Tried to create context on non-existent element');
    }
    var context = new Context(el);
    Engine.registerContext(context);
    return context;
};

/**
 * Registers a context
 *
 * @static
 * @name FamousEngine#registerContext
 * @function
 * @param {Context} context Context to register
 * @returns {FamousContext}
 */
Engine.registerContext = function(context) {
    contexts.push(context);
    return context;
};

/**
 * Queue a function to be executed on the next tick of the {@link
 *    Engine}.  The function's only argument will be the 
 *    JS window object.
 *    
 * @static
 * @name Engine#nextTick
 * @function
 * @param {Function} fn
 */
Engine.nextTick = function(fn) {
    nextTickQueue.push(fn);
};

/**
 * Queue a function to be executed sometime soon, at a time that is
 *    unlikely to affect framerate.
 *
 * @static
 * @name Engine#defer
 * @function
 * @param {Function} fn
 */
Engine.defer = function(fn) {
    deferQueue.push(fn);
};

module.exports = Engine;