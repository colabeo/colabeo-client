define(function(require, exports, module) {
    
    function Timer()
    {
        if (window.performance) 
        {
            if(window.performance.now) 
            {
                this.getTime = function() { return window.performance.now(); };
            } 
            else if(window.performance.webkitNow) 
            {           
                this.getTime = function() { return window.performance.webkitNow(); };
            } 
        } 
        else 
        {
            this.getTime = function() { return Date.now(); };
        }
    }
    
    module.exports = Timer;
});