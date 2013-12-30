define(function(require, exports, module) {
    var Constraint = require('famous-physics/constraints/Constraint');
    var Vector = require('../math/Vector');
    var EventHandler = require('famous/EventHandler');

    /** @constructor */
    function Wall(opts){
        this.opts = {
            restitution : 0.7,
            k : 0,
            n : new Vector(),
            d : 0,
            onContact : Wall.ON_CONTACT.REFLECT
        };

        if (opts) this.setOpts(opts);

        //registers
        this.diff     = new Vector();
        this.impulse  = new Vector();
        this.slop     = -1;

        this.eventOutput = undefined;
    };

    Wall.prototype = Object.create(Constraint.prototype);
    Wall.prototype.constructor = Constraint;

    Wall.ON_CONTACT = {
        REFLECT : 0,
        WRAP    : 1,
        ABSORB  : 2
    };

    Wall.prototype.setOpts = function(opts){
        if (opts.restitution !== undefined) this.opts.restitution = opts.restitution;
        if (opts.k !== undefined) this.opts.k = opts.k;
        if (opts.d !== undefined) this.opts.d = opts.d;
        if (opts.onContact !== undefined) this.opts.onContact = opts.onContact;
        if (opts.n !== undefined) this.opts.n.set(opts.n);
    };

    Wall.prototype.getNormalVelocity = function(v){
        var n = this.opts.n;
        return v.dot(n);
    };

    Wall.prototype.getDistance = function(p){
        var n = this.opts.n,
            d = this.opts.d;
        return p.dot(n) + d;
    };

    Wall.prototype.onEnter = function(particle, overlap, dt){
        var p           = particle.p,
            v           = particle.v,
            m           = particle.m,
            n           = this.opts.n,
            action      = this.opts.onContact,
            restitution = this.opts.restitution,
            impulse     = this.impulse;

        var k = this.opts.k;
        var gamma = 0;


        if (this.eventOutput){
            var data = {particle : particle, wall : this, overlap : overlap};
            this.eventOutput.emit('preCollision', data);
            this.eventOutput.emit('collision', data);
        }

        switch (action){
            case Wall.ON_CONTACT.REFLECT:
                var lambda = (overlap < this.slop)
                    ? -((1 + restitution) * n.dot(v) + k/dt * (overlap - this.slop)) / (m*dt + gamma)
                    : -((1 + restitution) * n.dot(v)) / (m*dt + gamma)

                impulse.set(n.mult(dt*lambda));
                particle.applyImpulse(impulse);
                p.add(n.mult(-overlap), p);
                break;
            case Wall.ON_CONTACT.ABSORB:
                var lambda = n.dot(v) / (m*dt + gamma)
                impulse.set(n.mult(dt*lambda));
                particle.applyImpulse(impulse);
                p.add(n.mult(-overlap), p);
                v.clear();
                break;
            case Wall.ON_CONTACT.WRAP:
                if (overlap < -particle.r)
                break;
        };

        if (this.eventOutput) this.eventOutput.emit('postCollision', data);
    };

    Wall.prototype.onExit = function(particle, overlap, dt){
        var action = this.opts.onContact;
        var p = particle.p;
        var n = this.opts.n;

        if (action == Wall.ON_CONTACT.REFLECT){
            p.add(n.mult(-overlap), p);
        }
        else if (action == Wall.ON_CONTACT.WRAP){}
        else if (action == Wall.ON_CONTACT.ABSORB){}
    };

    Wall.prototype.applyConstraint = function(particles, source, dt){
        var n = this.opts.n;

        for (var i = 0; i < particles.length; i++){
            var particle = particles[i],
                p = particle.p,
                v = particle.v,
                r = particle.r || 0;

            var overlap = this.getDistance(p.add(n.mult(-r)));

            //if semi-penetrable then detect nv as well
            var nv = this.getNormalVelocity(v);

            if (overlap < 0){
                if (nv < 0) this.onEnter(particle, overlap, dt);
                else        this.onExit(particle, overlap, dt);
            };
        };
    };

    function _createEventOutput() {
        this.eventOutput = new EventHandler();
        this.eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this.eventOutput);
    };

    Wall.prototype.on = function() { _createEventOutput.call(this); return this.on.apply(this, arguments); }
    Wall.prototype.unbind = function() { _createEventOutput.call(this); return this.unbind.apply(this, arguments); }
    Wall.prototype.pipe = function() { _createEventOutput.call(this); return this.pipe.apply(this, arguments); }
    Wall.prototype.unpipe = function() { _createEventOutput.call(this); return this.unpipe.apply(this, arguments); }

    module.exports = Wall;

});