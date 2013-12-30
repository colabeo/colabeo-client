define(function(require, exports, module) {
    var FEH = require('famous/EventHandler');

    /** @constructor */
    function TouchTracker(selective) {
        this.selective = selective;
        this.touchHistory = {};
        this.eventHandler = new FEH(true);
    };

    function _timestampTouch(touch, origin, history, count) {
        var touchClone = {};
        for(var i in touch) touchClone[i] = touch[i];
        return {
            touch: touchClone,
            origin: origin,
            timestamp: +Date.now(),
            count: count,
            history: history
        };
    };

    function _handleStart(event) {
        for(var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var data = _timestampTouch(touch, event.origin, undefined, event.touches.length);
            this.eventHandler.emit('trackstart', data);
            if(!this.selective && !this.touchHistory[touch.identifier]) this.track(data);
        }
    };

    function _handleMove(event) {
        for(var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var history = this.touchHistory[touch.identifier];
            if(history) {
                var data = _timestampTouch(touch, event.origin, history, event.touches.length);
                this.touchHistory[touch.identifier].push(data);
                this.eventHandler.emit('trackmove', data);
            }
        }
    };

    function _handleEnd(event) {
        for(var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var history = this.touchHistory[touch.identifier];
            if(history) {
                var data = _timestampTouch(touch, event.origin, history, event.touches.length);
                this.eventHandler.emit('trackend', data);
                delete this.touchHistory[touch.identifier];
            }
        }
    };
    
    function _handleUnpipe(event) {
        for(var i in this.touchHistory) {
            var history = this.touchHistory[i];
            this.eventHandler.emit('trackend', {
                touch: history[history.length - 1].touch,
                timestamp: +Date.now(),
                count: 0,
                history: history
            });
            delete this.touchHistory[i];
        }
    };

    TouchTracker.prototype.track = function(data) {
        this.touchHistory[data.touch.identifier] = [data];
    };

    TouchTracker.prototype.emit = function(type, data) {
        if(type == 'touchstart') return _handleStart.call(this, data);
        else if(type == 'touchmove') return _handleMove.call(this, data);
        else if(type == 'touchend') return _handleEnd.call(this, data);
        else if(type == 'touchcancel') return _handleEnd.call(this, data);
        else if(type == 'unpipe') return _handleUnpipe.call(this);
    };

    TouchTracker.prototype.on = function(type, handler) { return this.eventHandler.on(type, handler); };
    TouchTracker.prototype.unbind = function(type, handler) { return this.eventHandler.unbind(type, handler); };
    TouchTracker.prototype.pipe = function(target) { return this.eventHandler.pipe(target); };
    TouchTracker.prototype.unpipe = function(target) { return this.eventHandler.unpipe(target); };

    module.exports = TouchTracker;
});
