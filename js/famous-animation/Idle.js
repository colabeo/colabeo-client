define(function(require, exports, module) {

    /**
    * @constructor
    */
    function FamousIdle(idleFn, timeout) {
        this.idleFn = idleFn;
        this.timeout = timeout;
        this.enabled = timeout > 0;
        
        this.reset();
    };

    FamousIdle.prototype.timeoutIn = function(delay) {
        this.lastTouchTime = (new Date()).getTime() - this.timeout + delay;
    };
    
    FamousIdle.prototype.enable = function() {
        this.enabled = true;
    };
    
    FamousIdle.prototype.disable = function() {
        this.enabled = false;
    };
    
    FamousIdle.prototype.setIdleFunction = function(idleFn) {
        this.idleFn = idleFn;
    };
    
    FamousIdle.prototype.update = function() {
        if(this.idling || !this.enabled || !this.idleFn) return;
        var currTime = (new Date()).getTime();
        if(currTime - this.lastTouchTime > this.timeout) {
            this.idling = true;
            this.idleFn.call(this);
        }
    };
    
    FamousIdle.prototype.isIdling = function() {
        return this.idling;
    };
    
    FamousIdle.prototype.reset = function() {
        this.lastTouchTime = (new Date()).getTime();
        this.idling = false;
    };
    
    FamousIdle.prototype.emit = function(type, event) {
        this.reset();
    };

    module.exports = FamousIdle;
});
