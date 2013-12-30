define(function(require, exports, module) {
    var Easing = require('./Easing');
    var TweenTransition = require('famous/TweenTransition');

    function getAvailableTransitionCurves() { 
        var normRe = /norm/gi;
        var keys = getKeys(Easing).filter(function(key){ return normRe.test(key); }).sort();
        var curves = {};
        for (var i = 0; i < keys.length; i++) {
            curves[keys[i]] = (Easing[keys[i]]);
        };
        return curves;
    }

    function getKeys(obj){
        var keys = [];
        for (key in obj) {
            if (obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }
        return keys;
    };

    function registerKeys () {
        var curves = getAvailableTransitionCurves();
        for ( var key in curves ) {
            TweenTransition.registerCurve( key, curves[key] )
        };  
    }

    registerKeys();

});
