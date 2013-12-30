define(function(require, exports, module) {
    var Constraint = require('famous-physics/constraints/Constraint');
    var Vector = require('famous-physics/math/vector');
    var EventHandler = require('famous/EventHandler');

    /** @constructor */
    function CollisionJacobian(opts){
        this.opts = {
            k : 0.5,
            restitution : 0.5
        };

        if (opts) this.setOpts(opts);

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        //registers
        this.n        = new Vector();
        this.pDiff    = new Vector();
        this.vDiff    = new Vector();
        this.impulse1 = new Vector();
        this.impulse2 = new Vector();
        this.slop     = 0;
    };

    CollisionJacobian.prototype = Object.create(Constraint.prototype);
    CollisionJacobian.prototype.constructor = Constraint;

    CollisionJacobian.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    function normalVelocity(particle1, particle2){
        return particle1.v.dot(particle2.v);
    };

    CollisionJacobian.prototype.applyConstraint = function(particles, source, dt){

        if (source === undefined) return;

        var v1 = source.v,
            p1 = source.p,
            w1 = source.mInv,
            r1 = source.r;

        var k    = this.opts.k;
        var n    = this.n;
        var pDiff = this.pDiff;
        var vDiff = this.vDiff;
        var impulse1 = this.impulse1;
        var impulse2 = this.impulse2;

        var restitution1 = source.restitution;

        for (var i = 0; i < particles.length; i++){
            var target = particles[i];

            if (target == source) continue;

            var v2 = target.v,
                p2 = target.p,
                w2 = target.mInv,
                r2 = target.r;

            var restitution2 = target.restitution;

            var restitution = (this.opts.restitution !== undefined)
                ? this.opts.restitution
                : Math.sqrt(restitution1 * restitution2)

            pDiff.set(p2.sub(p1));
            vDiff.set(v2.sub(v1));

            var dist = pDiff.norm();
            var overlap = dist - (r1 + r2);
            var effMass = 1/(w1 + w2);
            var gamma = 0;

            if (overlap < 0){

                n.set(pDiff.normalize());
                var collisionData = {target : target, source : source, overlap : overlap, normal : n};

                //TODO: create pre and post solve methods so this event is only fired once
                this.eventOutput.emit('preCollision', collisionData);
                this.eventOutput.emit('collision', collisionData);

                var lambda = (overlap <= this.slop)
                    ? ((1 + restitution) * n.dot(vDiff) + k/dt * (overlap - this.slop)) / (gamma + dt/effMass)
                    : ((1 + restitution) * n.dot(vDiff)) / (gamma + dt/effMass)

                n.mult(dt*lambda).put(impulse1);
                impulse1.mult(-1).put(impulse2);

                source.applyImpulse(impulse1);
                target.applyImpulse(impulse2);

                p1.add(n.mult( overlap/2), p1);
                p2.add(n.mult(-overlap/2), p2);

                this.eventOutput.emit('postCollision', collisionData);

            };

        };

    };

    module.exports = CollisionJacobian;
});