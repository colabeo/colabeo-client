define(function(require, exports, module) {
    var Constraint = require('famous-physics/constraints/Constraint');
    var Vector = require('famous-physics/math/Vector');

    /** @constructor */
    function Rope(opts){
        this.opts = {
            length : 0,
            anchor : undefined,
            dampingRatio : 0,
            period : 0
        };

        if (opts) this.setOpts(opts);

        this.impulse  = new Vector();
        this.n        = new Vector();
        this.diffP    = new Vector();
        this.diffV    = new Vector();

    };

    Rope.prototype = Object.create(Constraint.prototype);
    Rope.prototype.constructor = Constraint;

    Rope.prototype.setOpts = function(opts){
        if (opts.anchor !== undefined){
            if (opts.anchor   instanceof Vector) this.opts.anchor = opts.anchor;
            if (opts.anchor.p instanceof Vector) this.opts.anchor = opts.anchor.p;
            if (opts.anchor   instanceof Array)  this.opts.anchor = new Vector(opts.anchor);
        }
        if (opts.length !== undefined) this.opts.length = opts.length;
        if (opts.dampingRatio !== undefined) this.opts.dampingRatio = opts.dampingRatio;
        if (opts.period !== undefined) this.opts.period = opts.period;
    };

    function calcError(impulse){
        return impulse.norm();
    };

    Rope.prototype.applyConstraint = function(targets, source, dt){
        var n        = this.n;
        var diffP    = this.diffP;
        var diffV    = this.diffV;
        var impulse  = this.impulse;

        if (source){
            var p2 = source.p;
            var w2 = source.mInv;
            var v2 = source.v;
        }
        else{
            var p2 = this.opts.anchor;
            var w2 = 0;
        };

        var length = this.opts.length;
        var err = 0;

        for (var i = 0; i < targets.length; i++){

            var particle = targets[i];

            var v1 = particle.v;
            var p1 = particle.p;
            var w1 = particle.mInv;

            diffP.set(p1.sub(p2));

            var dist = diffP.norm() - length;

            //dist < 0 means not extended
            if (dist < 0) return;

            n.set(diffP.normalize());

            if (source) diffV.set(v1.sub(v2))
            else        diffV.set(v1);

            var effMass = 1 / (w1 + w2);

            if (this.opts.period == 0){
                var gamma = 0;
                var beta = 1;
            }
            else{
                var c = 4 * effMass * Math.PI * this.opts.dampingRatio / this.opts.period;
                var k = 4 * effMass * Math.PI * Math.PI / (this.opts.period * this.opts.period);

                var gamma = 1 / (c + dt*k);
                var beta  = dt*k / (c + dt*k);
            };

            var antiDrift = beta/dt * dist;
            var lambda    = -(n.dot(diffV) + antiDrift) / (gamma + dt/effMass);

            impulse.set(n.mult(dt*lambda));
            particle.applyImpulse(impulse);

            if (source) source.applyImpulse(impulse.mult(-1));

            // err += calcError(impulse);
            err += Math.abs(lambda);

        };

        return err;
    };

    Rope.prototype.setupSlider = function(slider, property){
        property = property || slider.opts.name;
        slider.setOpts({value : this.opts[property]});
        slider.init();
        slider.on('change', function(data){
            this.opts[property] = data.value;
        }.bind(this));
    };

    module.exports = Rope;
});