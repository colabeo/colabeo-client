define(function(require, exports, module) {
    var Constraint = require('famous-physics/constraints/Constraint');
    var Vector = require('../math/Vector');
    var EventHandler = require('famous/EventHandler');

    /** @constructor */
    function Collision(opts){

        this.opts = {
            restitution : .5
        };

        if (opts) this.setOpts(opts);

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        //registers
        this.n      = new Vector();
        this.vRel   = new Vector();
        this.I      = new Vector();
        this.disp   = new Vector();

    };

    Collision.prototype = Object.create(Constraint.prototype);
    Collision.prototype.constructor = Constraint;

    Collision.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    Collision.prototype.applyConstraint = function(particles, source, dt){

        if (source === undefined) return;

        var p1 = source.p;
        var r1 = source.r;
        var v1 = source.v;

        var n = this.n;
        var I = this.I;
        var vRel = this.vRel;
        var disp = this.disp;
        var restitution = this.opts.restitution;

        for (var index = 0; index < particles.length; index++){

            var target = particles[index];

            if (source == target) continue;

            var p2 = target.p;
            var r2 = target.r;
            var m1Inv = source.mInv;

            disp.set(p1.sub(p2));
            var dist = disp.norm();

            var overlap = r1 + r2 - dist;

            if (overlap > 0){

                n.set(disp.normalize()); //n register set

                var collisionData = {target : target, source : source, overlap : overlap, normal : n};

                //TODO: create pre and post solve methods so this event is only fired once
                this.eventOutput.emit('preCollision', collisionData);
                this.eventOutput.emit('collision', collisionData);

                var v2 = target.v;
                var m2Inv = target.mInv;

                vRel.set(v1.sub(v2)); //vRel in register

                //TODO: add k from collision jacobian
                I.set(n.mult((1 + restitution) * vRel.dot(n) / (m1Inv + m2Inv)));

                v1.sub(I.mult(m1Inv), v1);
                p1.add(n.mult(overlap/2), p1);

                v2.add(I.mult(m2Inv), v2);
                p2.add(n.mult(-overlap/2), p2);

                this.eventOutput.emit('postCollision', collisionData);

            };

        };

    };

    module.exports = Collision;

});