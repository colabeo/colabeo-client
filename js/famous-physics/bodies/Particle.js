define(function(require, exports, module) {
    var RenderNode = require('famous/RenderNode');
    var Vector = require('famous-physics/math/Vector');
    var FM = require('famous/Matrix');

    /**
     *
     * @class A unit controlled by the physics engine which serves to provide position. 
     *
     * @description This is essentially the state object for the a particle's
     *    fundamental properties of position, velocity, acceleration, and force,
     *    which makes its position available through the render() function.
     *    Legal opts: (p)osition, (v)elocity, (a)cceleration, (f)orce, (m)ass,
     *       restitution, and dissipation.
     * 
     *
     * * Class/Namespace TODOs
     *
     * @name Particle
     * @constructor
     */     
     function Particle(opts){
        opts = opts || {};

        this.p = (opts.p) ? new Vector(opts.p) : new Vector(0,0,0);
        this.v = (opts.v) ? new Vector(opts.v) : new Vector(0,0,0);
        this.f = (opts.f) ? new Vector(opts.f) : new Vector(0,0,0);

        //scalars
        this.m           = (opts.m           !== undefined) ? opts.m           : 1;         //mass
        this.restitution = (opts.restitution !== undefined) ? opts.restitution : 0.5;       //collision damping
        this.dissipation = (opts.dissipation !== undefined) ? opts.dissipation : 0;         //velocity damping
        this.axis        = (opts.axis        !== undefined) ? opts.axis        : undefined; //TODO: find better solution

        this.setImmunity(opts.immunity || Particle.IMMUNITIES.NONE);

        this.mInv = 1 / this.m;
        this.size = [0,0,0];    //bounding box

        this.node = undefined;
        this.spec = {
            size : [0,0],
            target : {
                origin : [0.5,0.5],
                transform : undefined,
                target : undefined
            }
        };
    };

    Particle.AXIS = {
        X   : 0x0001,
        Y   : 0x0002,
        Z   : 0x0004
    };

    Particle.IMMUNITIES = {
        NONE     : 0x0000,
        POSITION : 0x0001,
        VELOCITY : 0x0002,
        ROTATION : 0x0004,
        AGENTS   : 0x0008,
        UPDATE   : 0x0010
    };

    for (var key in Particle.IMMUNITIES)
        Particle.IMMUNITIES.ALL |= Particle.IMMUNITIES[key];

        /**
     * Basic setter function for position Vector  
     * @name Particle#setPos
     * @function
     */
    Particle.prototype.setPos = function(p){
        this.p.set(p);
    };

    /**
     * Basic getter function for position Vector 
     * @name Particle#getPos
     * @function
     */
    Particle.prototype.getPos = function(){
        return this.p.get();
    };

    /**
     * Basic setter function for velocity Vector 
     * @name Particle#setVel
     * @function
     */
    Particle.prototype.setVel = function(v){
        if (this.hasImmunity(Particle.IMMUNITIES.VELOCITY)) return;
        this.v.set(v);
    };

    /**
     * Basic getter function for velocity Vector 
     * @name Particle#getVel
     * @function
     */
    Particle.prototype.getVel = function(){
        return this.v.get();
    };

    /**
     * Basic setter function for mass quantity 
     * @name Particle#setMass
     * @function
     */
    Particle.prototype.setMass = function(m){
        this.m = m; this.mInv = 1 / m;
    };

    /**
     * Basic getter function for mass quantity 
     * @name Particle#getMass
     * @function
     */
    Particle.prototype.getMass = function(){
        return this.m;
    };

    Particle.prototype.addImmunity = function(immunity){
        if (typeof immunity == 'string') immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        this.immunity |= immunity;
    };

    Particle.prototype.removeImmunity = function(immunity){
        if (typeof immunity == 'string') immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        this.immunity &= ~immunity;
    };

    Particle.prototype.setImmunity = function(immunity){
        if (typeof immunity == 'string') immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        this.immunity = immunity;
    };

    Particle.prototype.hasImmunity = function(immunity){
        if (typeof immunity == 'string') immunity = Particle.IMMUNITIES[immunity.toUpperCase()];
        return (this.getImmunity() & immunity);
    }

    /**
     * Basic getter function for immunity
     * @name Particle#getImmunity
     * @function
     */
    Particle.prototype.getImmunity = function(){
        return this.immunity;
    };

    /**
     * Set position, velocity, force, and accel Vectors each to (0, 0, 0)
     * @name Particle#reset
     * @function
     */
    Particle.prototype.reset = function(p,v){
        p = p || [0,0,0];
        v = v || [0,0,0];
        this.setPos(p);
        this.setVel(v);
    };

    /**
     * Add force Vector to existing internal force Vector
     * @name Particle#applyForce
     * @function
     */
    Particle.prototype.applyForce = function(force){
        if (this.hasImmunity(Particle.IMMUNITIES.AGENTS)) return;
        this.f.set(this.f.add(force));
    };

    /**
     * Add impulse (force*time) Vector to this Vector's velocity. 
     * @name Particle#applyImpulse
     * @function
     */
    Particle.prototype.applyImpulse = function(impulse){
        if (this.hasImmunity(Particle.IMMUNITIES.AGENTS)) return;
        this.setVel(this.v.add(impulse.mult(this.mInv)));
    };

    /**
     * Get kinetic energy of the particle.
     * @name Particle#getEnergy
     * @function
     */
    Particle.prototype.getEnergy = function(){
        return 0.5 * this.m * this.v.normSquared();
    };

    /**
     * Generate current positional transform from position (calculated)
     *   and rotation (provided only at construction time)
     * @name Particle#getTransform
     * @function
     */
    Particle.prototype.getTransform = function(){
        var p    = this.p;
        var axis = this.axis;

        if (axis !== undefined){
            if (axis & ~Particle.AXIS.X) {p.x = 0};
            if (axis & ~Particle.AXIS.Y) {p.y = 0};
            if (axis & ~Particle.AXIS.Z) {p.z = 0};
        };

        return FM.translate(p.x, p.y, p.z);
    };

    /**
     * Declare that this Particle's position will affect the provided node
     *    in the render tree.
     * 
     * @name Particle#link
     * @function
     *    
     * @returns {FamousRenderNode} a new render node for the provided
     *    renderableComponent.
     */
    Particle.prototype.link = function(obj){
        if (!this.node) this.node = new RenderNode();
        return this.node.link(obj);
    };

    Particle.prototype.add = function(obj){
        if (!this.node) this.node = new RenderNode();
        return this.node.add(obj);
    };

    Particle.prototype.replace = function(obj){
        this.node.object = obj;
    };

    /**
     * Return {@link renderSpec} of this particle.  This will render the render tree
     *   attached via #from and adjusted by the particle's caluculated position
     *
     * @name Particle#render
     * @function
     */

    Particle.prototype.render = function(target){
        target = (target !== undefined) ? target : this.node.render();
        this.spec.target.transform = this.getTransform();
        this.spec.target.target = target;
        return this.spec;
    };

    module.exports = Particle;

});