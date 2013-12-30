define(function(require, exports, module) {
    var Force = require('famous-physics/forces/Force');
    var Vector = require('../math/Vector');

    /** @constructor */
    function VectorField(opts){
        this.opts = {
            strength : 1,
            field : VectorField.FIELDS.CONSTANT
        };

        if (opts) this.setOpts(opts);

        this.setFieldOptions(this.opts.field);

        this.timeDependent = (this.opts.field.length == 3);
        this.tOrig         = undefined;

        //registers
        this.register = new Vector(0,0,0);

        Force.call(this);
    };

    VectorField.prototype = Object.create(Force.prototype);
    VectorField.prototype.constructor = Force;

    VectorField.FIELDS = {
        CONSTANT            : function(v, opts){ return v.set(opts.direction) },
        LINEAR              : function(v, opts){ return v.set(v.mult(opts.k)) },
        RADIAL_GRAVITY      : function(v, opts){ return v.set(v.mult(-1, v)) },
        SPHERE_ATTRACTOR    : function(v, opts){ return v.set(v.mult((opts.radius - v.norm()) / v.norm())) },
        POINT_ATTRACTOR     : function(v, opts){ return v.set(opts.p.sub(v)) }
    };

    VectorField.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    VectorField.prototype.evaluate = function(v, t){
        this.register.set(v);
        return this.opts.field(this.register, this.opts, t);
    };

    VectorField.prototype.applyForce = function(particles){
        var force = this.force;
        var t;
        if (this.timeDependent){
            if (this.tOrig) this.tOrig = Date.now();
            t = (Date.now() - this.tOrig) * 0.001; //seconds
        }
        else t = undefined;

        for (var i = 0; i < particles.length; i++){
            var particle = particles[i];
            force.set(this.evaluate(particle.p, t).mult(particle.m * this.opts.strength))
            particle.applyForce(force);
        };
    };

    VectorField.prototype.setFieldOptions = function(field){
        var FIELDS = VectorField.FIELDS;

        switch (field){
            case FIELDS.CONSTANT:
                if (!this.opts.direction) this.opts.direction = new Vector(0,1,0);
                break;
            case FIELDS.POINT_ATTRACTOR:
                if (!this.opts.p) this.opts.p = new Vector(0,0,0);
                break;
            case FIELDS.SPHERE_ATTRACTOR:
                if (!this.opts.radius) this.opts.radius = 1;
                break;
            case FIELDS.LINEAR:
                if (!this.opts.k) this.opts.k = 1;
                break;
        };

    };

    module.exports = VectorField;

});