define(function(require, exports, module) {

    var cubicBezier = require('./CubicBezier');

    function FamousPiecewiseCubicBezier(options) {

        options = options || {};
        this.split = options.split || .5;
        var overshoot = options.overshoot || 0;

        var vLeft = options.vLeft || [0, 1+overshoot, 0, 0];
        var vRight = options.vRight || [1+overshoot, 1, 0, 0];

        this.bezLeft =  new cubicBezier(vLeft).create();
        this.bezRight = new cubicBezier(vRight).create();

    };

    FamousPiecewiseCubicBezier.prototype.create = function() {
        var self = this;
        return function(t) {
            t = t || 0;
            var tNew;
            var split = self.split;

            if (t < split){
                tNew = t / split;
                return self.bezLeft(tNew);
            }
            else{
                tNew = (t - split) / (1 - split);
                return self.bezRight(tNew);
            }
        };
    };

    module.exports = FamousPiecewiseCubicBezier;

});
