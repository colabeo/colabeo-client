define(function(require, exports, module) {
    var FamousEventHandler = require('./EventHandler');

    /**
     * 
     * @class A switch which wraps several event 
     *    destinations and redirects received events to at most one of them. 
     * @description Setting the 'mode' of the object dictates which one 
     *    of these destinations will receive events.  
     *    It is useful for transferring control among
     *    many actionable areas in the event tree (like 'pages'), only one of 
     *    which is currently visible.  
     * 
     * @name FamousEventArbiter
     * @constructor
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
     * @param {number|string} startMode initial setting of switch,
     */
    function FamousEventArbiter(startMode) {
        this.dispatchers = {};
        this.currMode = undefined;
        this.setMode(startMode);
    };

    /**
     * Set switch to this mode, passing events to the corresopnding 
     *   {@link FamousEventHandler}.  If mode has changed, emits 'change' 
     *   event to the  old mode's handler and 'modein' event to the new 
     *   mode's handler, passing along object {from: startMode, to: endMode}.
     *   
     * @name FamousEventArbiter#setMode
     * @function
     * @param {string|number} mode indicating which event handler to send to.
     */
    FamousEventArbiter.prototype.setMode = function(mode) {
        if(mode != this.currMode) {
            var startMode = this.currMode;
            if(this.dispatchers[this.currMode]) this.dispatchers[this.currMode].emit('unpipe');
            this.currMode = mode;
            if(this.dispatchers[mode]) this.dispatchers[mode].emit('pipe'); 
            this.emit('change', {from: startMode, to: mode});
        }
    };

    /**
     * Return the existing {@link FamousEventHandler} corresponding to this 
     *   mode, creating one if it doesn't exist. 
     * 
     * @name FamousEventArbiter#forMode
     * @function
     * @param {string|number} mode mode to which this eventHandler corresponds
     * @returns {FamousEventHandler} eventHandler behind this mode's "switch"
     */
    FamousEventArbiter.prototype.forMode = function(mode) {
        if(!this.dispatchers[mode]) this.dispatchers[mode] = new FamousEventHandler();
        return this.dispatchers[mode];
    };

    /**
     * Send event to currently selected handler.
     *
     * @name FamousEventArbiter#emit
     * @function
     * @param {string} eventType
     * @param {Object} event
     * @returns {boolean} true if the event was handled by at a leaf handler.
     */
    FamousEventArbiter.prototype.emit = function(eventType, event) {
        if(this.currMode == undefined) return false;
        if(!event) event = {};
        var dispatcher = this.dispatchers[this.currMode];
        if(dispatcher) return dispatcher.emit(eventType, event);
    };

    module.exports = FamousEventArbiter;
});
