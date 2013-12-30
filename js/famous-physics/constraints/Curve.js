define(function(require, exports, module) {
    var Constraint = require('famous-physics/constraints/Constraint');
    var Vector = require('../math/Vector');

    /** @constructor */
    function Curve(opts){
        this.opts = {
            f  : function(x,y,z){ return Math.sin(x/100)*100 - y},
            df : undefined,
            g  : function(x,y,z){ return z },
            dg : undefined,
            dampingRatio : 0,
            period : 0
        };

        if (opts) this.setOpts(opts);

        this.J = new Vector();
        this.impulse  = new Vector();
    };

    Curve.prototype = Object.create(Constraint.prototype);
    Curve.prototype.constructor = Constraint;

    Curve.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    Curve.prototype.applyConstraint = function(targets, source, dt){

        var impulse  = this.impulse;
        var J = this.J;
        var f = this.opts.f;
        var g = this.opts.f;
        var df = this.opts.df;
        var dg = this.opts.dg;

        var err = 0;
        for (var i = 0; i < targets.length; i++){
            var particle = targets[i];

            var v = particle.v;
            var p = particle.p;
            var m = particle.m;

            if (this.opts.period == 0){
                var gamma = 0;
                var beta = 1;
            }
            else{
                var c = 4 * m * Math.PI * this.opts.dampingRatio / this.opts.period;
                var k = 4 * m * Math.PI * Math.PI / (this.opts.period * this.opts.period);

                var gamma = 1 / (c + dt*k);
                var beta  = dt*k / (c + dt*k);
            };

            if (df === undefined){
                var eps = 1e-7;
                var f0  = f(p.x, p.y, p.z);
                var dfx = (f(p.x + eps, p.y, p.z) - f0) / eps;
                var dfy = (f(p.x, p.y + eps, p.z) - f0) / eps;
                var dfz = (f(p.x, p.y, p.z + eps) - f0) / eps;

                var g0  = g(p.x, p.y, p.z);
                var dgx = (g(p.x + eps, p.y, p.z) - g0) / eps;
                var dgy = (g(p.x, p.y + eps, p.z) - g0) / eps;
                var dgz = (g(p.x, p.y, p.z + eps) - g0) / eps;

                J.setXYZ(dfx + dgx, dfy + dgy, dfz + dgz);
            }
            else {
                var d1 = df(p.x, p.y, p.z);
                var d2 = dg(p.x, p.y, p.z)
                J.setXYZ(d1[0] + d2[0], d1[1] + d2[1], d1[2] + d2[2]);
            }

            var antiDrift = beta/dt * (f(p.x, p.y, p.z) + g(p.x, p.y, p.z));
            var lambda = -(J.dot(v) + antiDrift) / (gamma + dt*J.normSquared() / m);

            impulse.set(J.mult(dt*lambda));
            particle.applyImpulse(impulse);

            // err += calcError(impulse);
            err += Math.abs(lambda);

        };

        return err;
    };

    Curve.prototype.setupSlider = function(slider, property){
        property = property || slider.opts.name;
        slider.setOpts({value : this.opts[property]});
        slider.init();
        slider.on('change', function(data){
            this.opts[property] = data.value;
        }.bind(this));
    };

    module.exports = Curve;
});