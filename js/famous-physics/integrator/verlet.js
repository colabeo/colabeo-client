define(function(require, exports, module) {
    var Vector = require('../math/Vector');
    // x  = x + (x - xOld) + a * dt * dt
    // v  = (x - xOld) / (2*dt)

    /**
     * @constructor
     */
    function Verlet(options){
        options   = options || {};
        this.vCap = options.vCap || Infinity;
        this.aCap = options.aCap || Infinity;
        this.drag = options.drag || 1;

        this.diff = new Vector();
        this.pOldCopy = new Vector();
        this.dragVector = new Vector();
    };

    Verlet.prototype.integrate = function(particle, dt, firstFrame){

        var pOld    = particle.pOld,
            p       = particle.p,
            a       = particle.a;

        this.diff.set(p.sub(pOld));

        if (firstFrame){
            var v = particle.v;
            if (!particle.hasImmunity('velocity'))
                v.add(a.mult(0.5 * dt), v);

            if (!particle.hasImmunity('position')){
                pOld.set(p);
                p.add(v.mult(dt), p);
            };
        }
        else {
            this.pOldCopy.set(pOld);
            if (!particle.hasImmunity('position')){
                this.dragVector.set(this.diff.mult(this.drag));
                pOld.set(p);
                p.add(a.mult(dt*dt), p);
                p.add(this.dragVector, p);
            };
        };

        // second order accurate velocity for previous time using predictor
        // if (!particle.hasImmunity('velocity'))
        //     particle.v.set(p.sub(this.pOldCopy).div(2 * dt));

    };

    // accelerations
    Verlet.prototype.integrateVelocity = function(particle, dt, firstFrame){
        var p = particle.p;
        var a = particle.a;
        if (firstFrame){
            var v = particle.v;
            v.add(a.mult(0.5 * dt), v);
            p.add(v.mult(dt), p);
        }
        else p.add(a.mult(dt*dt), p);
    };

    // inertia
    Verlet.prototype.integratePosition = function(particle){
        var p        = particle.p;
        var pOld     = particle.pOld;
        var pOldCopy = this.pOldCopy;

        pOldCopy.set(pOld);
        pOld.set(p);
        p.add(p.sub(pOldCopy).mult(this.drag), p);
    };

    module.exports = Verlet;

});