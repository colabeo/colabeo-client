define(function(require, exports, module) {
    var Force = require('famous-physics/forces/Force');

    /** @constructor */
    function Drag(opts){
        this.opts = {
            strength : .01,
            forceFunction : Drag.FORCE_FUNCTIONS.LINEAR
        };

        if (opts) this.setOpts(opts);

        Force.call(this);
    };

    Drag.prototype = Object.create(Force.prototype);
    Drag.prototype.constructor = Force;

    Drag.FORCE_FUNCTIONS = {
        LINEAR : function(v){ return v; },
        QUADRATIC : function(v){ return v.mult(v.norm()); }
    };

    Drag.prototype.applyForce = function(particles){
	    var strength        = this.opts.strength;
	    var forceFunction   = this.opts.forceFunction;
	    var force           = this.force;
        for (var index = 0; index < particles.length; index++){
            var particle = particles[index];
            forceFunction(particle.v).mult(-strength).put(force);
            particle.applyForce(force);
        };
    };

    Drag.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    module.exports = Drag;
});