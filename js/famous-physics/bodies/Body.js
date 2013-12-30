define(function(require, exports, module) {
    var Particle = require('./Particle');
    var Vector = require('famous-physics/math/Vector');
    var Quaternion = require('famous-physics/math/Quaternion');
    var FM = require('famous/Matrix');

    function Body(opts){
        Particle.call(this, opts);

        this.q = (opts.q) ? new Quaternion(opts.q) : new Quaternion();  //orientation
        this.w = (opts.w) ? new Vector(opts.w) : new Vector();          //angular velocity
        this.L = (opts.L) ? new Vector(opts.L) : new Vector();          //angular momentum
        this.t = (opts.t) ? new Vector(opts.t) : new Vector();          //torque

        this.I    = [1,0,0,1,0,0,1,0,0];   //inertia tensor
        this.Iinv = [1,0,0,1,0,0,1,0,0];   //inverse inertia tensor
        this.w.w  = 0;                     //quaternify the angular velocity

        //register
        this.pWorld = new Vector();        //placeholder for world space position
    };

    Body.prototype = Object.create(Particle.prototype);
    Body.prototype.constructor = Body;

    Body.IMMUNITIES = Particle.IMMUNITIES;

    Body.prototype.updateAngularVelocity = function(){
        var Iinv = this.Iinv;
        var L = this.L;
        var Lx = L.x, Ly = L.y, Lz = L.z;
        var I0 = Iinv[0], I1 = Iinv[1], I2 = Iinv[2];
        
        this.w.setXYZ(
            I0[0] * Lx + I0[1] * Ly + I0[2] * Lz,
            I1[0] * Lx + I1[1] * Ly + I1[2] * Lz,
            I2[0] * Lx + I2[1] * Ly + I2[2] * Lz
        );
    };

    Body.prototype.toWorldCoordinates = function(localPosition){
        var q = this.q;
        localPosition.w = 0;
        return this.pWorld.set(q.inverse().multiply(localPosition).multiply(q));
    };

    Body.prototype.getEnergy = function(){
        var w = this.w;
        var I = this.I;
        var wx = w.x, wy = w.y, wz = w.z;
        var I0 = this.I[0], I1 = I[1], I2 = I[2];
        return 0.5 * (
            this.m * this.v.normSquared() +
            I0[0]*wx*wx + I0[1]*wx*wy + I0[2]*wx*wz +
            I1[0]*wy*wx + I1[1]*wy*wy + I1[2]*wy*wz +
            I2[0]*wz*wx + I2[1]*wz*wy + I2[2]*wz*wz
        );
    };

    Body.prototype.reset = function(p,v,q,L){
        this.setPos(p || [0,0,0]);
        this.setVel(v || [0,0,0]);
        this.w.clear();
        this.setOrientation(q || [1,0,0,0]);
        this.setAngularMomentum(L || [0,0,0]);
    };

    Body.prototype.setOrientation = function(q){
        this.q.set(q);
    };

    Body.prototype.setAngularMomentum = function(L){
        this.L.set(L);
    };

    Body.prototype.applyForce = function(force, location){
        if (this.hasImmunity(Body.IMMUNITIES.AGENTS)) return;
        this.f.set(this.f.add(force));
        if (location !== undefined) this.applyTorque(location.cross(force));
    };

    Body.prototype.applyTorque = function(torque){
        if (this.hasImmunity(Body.IMMUNITIES.ROTATION)) return;
        this.t.set(this.t.add(torque));
    };

    Body.prototype.getTransform = function(){
        return FM.move(this.q.getMatrix(), this.p.get());
    };

    module.exports = Body;

});
