define(function(require, exports, module) {

    var Particle = require('famous-physics/bodies/Particle');
    var Body = require('famous-physics/bodies/Body');
    var Circle = require('famous-physics/bodies/Circle');
    var Rectangle = require('famous-physics/bodies/Rectangle');
    var Force = require('famous-physics/forces/Force');
    var Constraint = require('famous-physics/constraints/Constraint');
    var Integrator = require('famous-physics/integrator/SymplecticEuler');

    /** @constructor */
    function PhysicsEngine(opts){

        //default options
        this.opts = {
            speed               : 1,
            steps               : 1,
            velocityCap         : Infinity,
            angularVelocityCap  : Infinity,
            constraintSteps     : 1,
            constraintTolerance : 1e-4
        };

        if (opts) this.setOpts(opts);

        this._particles     = [];   //list of managed particles
        this._agents        = {};   //list of managed agents
        this._forces        = [];   //list of IDs of agents that are forces
        this._constraints   = [];   //list of IDs of agents that are constraints

        this._playing       = true;
        this._buffer        = 0;
        this._timestep      = (1000 / 60) / this.opts.steps;

        this._prevTime      = undefined;
        this._currTime      = undefined;

        this._integrator    = new Integrator({
            velocityCap         : this.opts.velocityCap,
            angularVelocityCap  : this.opts.angularVelocityCap
        });

        this._currAgentId   = 0;

        this.BODIES = PhysicsEngine.BODIES;

    };

    /* enum */
    PhysicsEngine.BODIES = {
        POINT       : Particle,
        BODY        : Body,
        CIRCLE      : Circle,
        RECTANGLE   : Rectangle
    };

    PhysicsEngine.IMMUNITIES = Particle.IMMUNITIES;

    //PRIVATE METHODS
    function getTime(){
        return Date.now();
    };

    //PUBLIC METHODS
    PhysicsEngine.prototype.setOpts = function(opts){
        for (var key in opts) if (this.opts[key]) this.opts[key] = opts[key];
    };

    PhysicsEngine.prototype.addBody = function(body){
        this._particles.push(body);
        return body;
    };

    // TODO: deprecate
    PhysicsEngine.prototype.createParticle = function(opts){
        return this.addBody(new Particle(opts));
    };

    PhysicsEngine.prototype.createBody = function(opts){
        var shape = opts.shape || PhysicsEngine.BODIES.POINT;
        return this.addBody(new shape(opts));
    };

    PhysicsEngine.prototype.remove = function(target){
        var index = this._particles.indexOf(target);
        if (index > -1) {
            for (var i = 0; i < Object.keys(this._agents); i++) this.detachFrom(i, target);
            this._particles.splice(index,1);
        }
    };

    function attachOne(agent, targets, source){
        if (targets === undefined) targets = this.getParticles();
        if (!(targets instanceof Array)) targets = [targets];

        this._agents[this._currAgentId] = {
            agent   : agent,
            targets : targets,
            source  : source
        };

        _mapAgentArray.call(this, agent).push(this._currAgentId);
        return this._currAgentId++;
    };

    PhysicsEngine.prototype.attach = function(agents, targets, source){
        if (agents instanceof Array){
            var agentIDs = [];
            for (var i = 0; i < agents.length; i++)
                agentIDs[i] = attachOne.call(this, agents[i], targets, source);
            return agentIDs;
        }
        else return attachOne.call(this, agents, targets, source);
    };

    PhysicsEngine.prototype.attachTo = function(agentID, target){
        _getBoundAgent.call(this, agentID).targets.push(target);
    };

    PhysicsEngine.prototype.detach = function(id){
        // detach from forces/constraints array
        var agent = this.getAgent(id);
        var agentArray = _mapAgentArray.call(this, agent);
        var index = agentArray.indexOf(id);
        agentArray.splice(index,1);

        // detach agents array
        delete this._agents[id];
    };

    PhysicsEngine.prototype.detachFrom = function(id, target){
        var boundAgent = _getBoundAgent.call(this, id);
        if (boundAgent.source === target) this.detach(id);  
        else {
            var targets = boundAgent.targets;
            var index = targets.indexOf(target);
            if (index > -1) targets.splice(index,1);
        };
    };

    PhysicsEngine.prototype.detachAll = function(){
        this._agents        = {};
        this._forces        = [];
        this._constraints   = [];
        this._currAgentId   = 0;
    };

    function _mapAgentArray(agent){
        if (agent instanceof Force)      return this._forces;
        if (agent instanceof Constraint) return this._constraints;
    };

    function _getBoundAgent(id){
        return this._agents[id];
    };

    PhysicsEngine.prototype.getAgent = function(id){
        return _getBoundAgent.call(this, id).agent;
    };

    PhysicsEngine.prototype.getParticles = function(){
        return this._particles;
    };

    PhysicsEngine.prototype.getParticlesExcept = function(particles){
        var result = [];
        this.forEachParticle(function(particle){
            if (particles.indexOf(particle) === -1) result.push(particle);
        });
        return result;
    };

    PhysicsEngine.prototype.getPos       = function(particle){ return (particle || this._particles[0]).getPos(); };
    PhysicsEngine.prototype.getVel       = function(particle){ return (particle || this._particles[0]).getVel(); };
    PhysicsEngine.prototype.getTransform = function(particle){ return (particle || this._particles[0]).getTransform(); };

    PhysicsEngine.prototype.setPos       = function(pos, particle){ (particle || this._particles[0]).setPos(pos); };
    PhysicsEngine.prototype.setVel       = function(vel, particle){ (particle || this._particles[0]).setVel(vel); };

    PhysicsEngine.prototype.forEachParticle = function(fn, args){
        var particles = this.getParticles();
        for (var index = 0, len = particles.length; index < len; index++)
            fn.call(this, particles[index], args);
    };

    function _updateForce(index){
        var boundAgent  = _getBoundAgent.call(this, this._forces[index]);
        boundAgent.agent.applyForce(boundAgent.targets, boundAgent.source);
    };

    function _updateConstraint(index, dt){
        var boundAgent  = this._agents[this._constraints[index]];
        return boundAgent.agent.applyConstraint(boundAgent.targets, boundAgent.source, dt);
    };

    function updateForces(){
        for (var index = this._forces.length -1; index > -1; index--)
            _updateForce.call(this, index);
    };

    function updateConstraints(dt){
        //Todo: while statement here until tolerance is met
        var err = Infinity;
        var iteration = 0;
        var tolerance = this.opts.constraintTolerance;
        while (iteration < this.opts.constraintSteps){
            err = 0;
            for (var index = this._constraints.length -1; index > -1; index--)
                err += _updateConstraint.call(this, index, dt);
            iteration++;
        };
    };

    function _updateVelocity(particle, dt){
        if (particle.hasImmunity(Particle.IMMUNITIES.UPDATE)) return;
        this._integrator.integrateVelocity(particle, dt);
    };
    function _updateAngularVelocity(particle){
        if (particle.hasImmunity(Particle.IMMUNITIES.ROTATION)) return;
        if (particle instanceof Body) particle.updateAngularVelocity();
    };
    function _updateAngularMomentum(particle, dt){
        if (particle.hasImmunity(Particle.IMMUNITIES.ROTATION)) return;
        if (particle instanceof Body) this._integrator.integrateAngularMomentum(particle, dt);
    };
    function _updatePosition(particle, dt){
        if (particle.hasImmunity(Particle.IMMUNITIES.UPDATE)) return;
        this._integrator.integratePosition(particle, dt);
    };
    function _updateOrientation(particle, dt){
        if (particle.hasImmunity(Particle.IMMUNITIES.ROTATION)) return;
        if (particle instanceof Body) this._integrator.integrateOrientation(particle, dt);
    };

    function updateVelocities(dt){      this.forEachParticle(_updateVelocity, dt); };
    function updatePositions(dt){       this.forEachParticle(_updatePosition, dt); };
    function updateAngularVelocities(){ this.forEachParticle(_updateAngularVelocity); };
    function updateAngularMomenta(dt){  this.forEachParticle(_updateAngularMomentum, dt); };
    function updateOrientations(dt){    this.forEachParticle(_updateOrientation, dt); };

    function integrate(dt){
        updateForces.call(this);
        updateVelocities.call(this, dt);
        updateAngularMomenta.call(this, dt);
        updateAngularVelocities.call(this, dt);
        updateConstraints.call(this, dt);
        updatePositions.call(this, dt);
        updateOrientations.call(this, dt);
    };

    PhysicsEngine.prototype.step = function(){
        if (!this._playing) return;

        //set previous time on initialization
        if (!this._prevTime) this._prevTime = getTime();

        //set current frame's time
        this._currTime = getTime();

        //milliseconds elapsed since last frame
        var dtFrame = this._currTime - this._prevTime;

        this._prevTime = this._currTime;
        if (dtFrame == 0) return;

        //robust integration
        // this._buffer += dtFrame;
        // while (this._buffer > this._timestep){
        //     integrate.call(this, this.opts.speed * this._timestep);
        //     this._buffer -= this._timestep;
        // };

        //simple integration
        integrate.call(this, this.opts.speed * this._timestep);
    };

    PhysicsEngine.prototype.render = function(target){
        this.step();
        var result = [];
        this.forEachParticle(function(particle){
            result.push(particle.render(target));
        });
        return result;
    };

    PhysicsEngine.prototype.play = function(){
        this._prevTime = getTime();
        this._playing = true;
    };

    PhysicsEngine.prototype.pause = function(){
        this._playing = false;
    };

    PhysicsEngine.prototype.toggle = function(){
        (this._playing) ? this.pause() : this.play();
    };

    PhysicsEngine.prototype.reverseTime = function(){
        this.opts.speed *= -1;
    };

    PhysicsEngine.prototype.reverseVelocities = function(){
        this.forEachParticle(function(particle){ particle.v.mult(-1, particle.v); });
    };

    module.exports = PhysicsEngine;

});