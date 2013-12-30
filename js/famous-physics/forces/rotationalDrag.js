define(function(require, exports, module) {
    var Force = require('famous-physics/forces/Force');
    var Vector = require('famous-physics/math/Vector');

    /** @constructor */
    function RotationalDrag(opts){
        this.opts = {
            strength : .01,
            forceFunction : RotationalDrag.FORCE_FUNCTIONS.LINEAR
        };

        if (opts) this.setOpts(opts);

        Force.call(this);
    };

    RotationalDrag.prototype = Object.create(Force.prototype);
    RotationalDrag.prototype.constructor = Force;

    RotationalDrag.FORCE_FUNCTIONS = {
        LINEAR : function(v){ return v; },
        QUADRATIC : function(v){ return v.mult(v.norm()); }
    };

    RotationalDrag.prototype.applyForce = function(particles){
        var strength        = this.opts.strength;
        var forceFunction   = this.opts.forceFunction;
        var force = this.force;

        //TODO: rotational drag as function of inertia
        for (var index in particles){
            var particle = particles[index];
            forceFunction(particle.w).mult(-100*strength).put(force);
            particle.applyTorque(force);
        };
    };

    RotationalDrag.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    module.exports = RotationalDrag;
});