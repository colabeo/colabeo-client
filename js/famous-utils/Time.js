define(function(require, exports, module) { 
    var FamousEngine = require('famous/Engine');

    function setInterval(func, duration) { 
        var t = Date.now();
        var execute = function() { 
            var t2 = Date.now();
            if(t2 - t >= duration) { 
                func(); 
                t = Date.now();
            }
        }
        FamousEngine.on('prerender', execute);
        return execute;
    };
    function removeInterval(func) {
        FamousEngine.unbind('prerender', func);
    };
    function executeOver(duration, func, callback) { 
        var t = Date.now();
        var execute = function(){
            var t2 = Date.now();
            var percent = (t2 - t) / duration;

            if (t2 - t >= duration){
                func(1); // 100% complete
                FamousEngine.unbind('prerender', execute);
                if(callback) callback();
                return;
            } else { 
                func(percent);
            }
        };
        FamousEngine.on('prerender', execute);
    };
    function setTimeout(func, duration) { 
        var t = Date.now();
        var execute = function() {
            var t2 = Date.now();
            if(t2 - t >= duration) {
                FamousEngine.unbind('prerender', execute);
                func()
                return;
            }
        }
        FamousEngine.on('prerender', execute);
        return execute;
    };
    function removeTimeout(func) { 
        FamousEngine.unbind('prerender', func);
    }

    module.exports = {
        setInterval: setInterval,
        removeInterval: removeInterval,
        executeOver: executeOver,
        setTimeout: setTimeout,
        removeTimeout: removeTimeout
    }

});
