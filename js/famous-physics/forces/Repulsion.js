define(function(require, exports, module) {
    var Force = require('famous-physics/forces/Force');
    var Vector = require('famous-physics/math/Vector');

    /** @constructor */
    function Repulsion(opts){
        this.opts = {
            strength        : 1,
            anchor          : undefined,
            radii           : { min : 0, max : Infinity },
            cutoff          : 0,
            cap             : Infinity,
            decayFunction   : Repulsion.DECAY_FUNCTIONS.GRAVITY
        };

        if (opts) this.setOpts(opts);
        this.setOpts(opts);

        //registers
        this.disp  = new Vector();

        Force.call(this);
    };

    Repulsion.prototype = Object.create(Force.prototype);
    Repulsion.prototype.constructor = Force;

    Repulsion.DECAY_FUNCTIONS = {
        LINEAR : function (r, cutoff){
            return Math.max(1 - (1 / cutoff) * r, 0)
        },
        MORSE : function (r, cutoff){
            var r0 = (cutoff == 0) ? 100 : cutoff;
            var rShifted = r + r0 * (1 - Math.log(2)); //shift by x-intercept
            return Math.max(1 - Math.pow(1 - Math.exp(rShifted/r0 - 1), 2), 0);
        },
        INVERSE : function(r, cutoff){
            return 1 / (1 - cutoff + r);
        },
        GRAVITY : function(r, cutoff){
            return 1 / (1 - cutoff + r*r);
        }
    };

    Repulsion.prototype.setOpts = function(opts){
        if (opts.anchor !== undefined){
            if (opts.anchor.p instanceof Vector) this.opts.anchor = opts.anchor.p;
            if (opts.anchor   instanceof Array)  this.opts.anchor = new Vector(opts.anchor);
            delete opts.anchor;
        }
        for (var key in opts) this.opts[key] = opts[key];
    };

    Repulsion.prototype.applyForce = function(particles, source){

        var opts        = this.opts,
            force       = this.force,
            disp        = this.disp;

        var strength    = opts.strength,
            anchor      = opts.anchor || source.p,
            cap         = opts.cap,
            cutoff      = opts.cutoff,
            rMax        = opts.radii.max,
            rMin        = opts.radii.min,
            decayFn     = opts.decayFunction;

        if (strength == 0) return;

        for (var index in particles){
            var particle = particles[index];

            if (particle == source) continue;

            var m1 = particle.m,
                p1 = particle.p;

            disp.set(p1.sub(anchor));
            var r = disp.norm();

            if (r < rMax && r > rMin){
                force.set(disp.normalize(strength * m1 * decayFn(r, cutoff)).cap(cap));
                particle.applyForce(force);
            };
        };

    };

    module.exports = Repulsion;

});