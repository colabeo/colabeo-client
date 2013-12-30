define(function(require, exports, module) {

    /** @constructor */
    function SymplecticEuler(opts){
        this.opts = {
            velocityCap : Infinity,
            angularVelocityCap : Infinity
        };

        if (opts) this.setOpts(opts);
    };

    SymplecticEuler.prototype.integrateVelocity = function(particle, dt){
        var v = particle.v,
            m = particle.m,
            f = particle.f;

        if (f.isZero()) return;
        particle.setVel(v.add(f.mult(dt/m)));
        f.clear();
    };

    SymplecticEuler.prototype.integratePosition = function(particle, dt){
        var p = particle.p,
            v = particle.v;

        if (v.isZero()) return;
        v.set(v.cap(this.opts.velocityCap));
        particle.setPos(p.add(v.mult(dt)));
    };

    SymplecticEuler.prototype.integrateAngularMomentum = function(particle, dt){
        var L = particle.L,
            t = particle.t;

        if (t.isZero()) return;
        t.set(t.cap(this.opts.angularVelocityCap));
        L.add(t.mult(dt)).put(L);
        t.clear();
    };

    SymplecticEuler.prototype.integrateOrientation = function(particle, dt){
        var q = particle.q,
            w = particle.w;

        if (w.isZero()) return;
        q.set(q.add(q.multiply(w).scalarMult(0.5 * dt)));
        q.set(q.normalize());
    };

    SymplecticEuler.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    module.exports = SymplecticEuler;

});