var PE = require('famous/physics/engine');
var Spring = require('famous/physics/forces/spring');
var Vector = require('famous/math/vector');

/** @constructor */
function SpringTransition(state){
    state = state || 0;
    this.endState  = new Vector(state);
    this.initState = new Vector();

    this._dimensions       = undefined;
    this._restTolerance    = 1e-8;
    this._absRestTolerance = this._restTolerance;
    this._active           = false;
    this._callback         = undefined;

    this.PE       = new PE();
    this.spring   = new Spring({anchor : this.endState});
    this.particle = this.PE.createParticle();
    this.PE.attach(this.spring, this.particle);
}

SpringTransition.SUPPORTS_MULTIPLE = 3;
SpringTransition.DEFAULT_OPTIONS = {
    period       : 300,
    dampingRatio : 0.5,
    velocity     : 0
}

function _update(){
    if (!this._active){
        if (this._callback) {
            var cb = this._callback;
            this._callback = undefined;
            cb();
        }
        return;
    }
    this.PE.step();
    if (_getEnergy.call(this) < this._absRestTolerance) {
        _setParticlePosition.call(this, this.endState);
        _setParticleVelocity.call(this, [0,0,0]);
        _sleep.call(this);
    }
}

function _getEnergy(){
    return this.particle.getEnergy() + this.spring.getEnergy(this.particle);
}

function _setupDefinition(def){
    var defaults = SpringTransition.DEFAULT_OPTIONS;
    if (def.period === undefined)       def.period       = defaults.period;
    if (def.dampingRatio === undefined) def.dampingRatio = defaults.dampingRatio;
    if (def.velocity === undefined)     def.velocity     = defaults.velocity;

    if (def.period < 150) console.warn('period may be unstable, increase the period or use a stiff transition');

    //setup spring
    this.spring.setOpts({
        period       : def.period,
        dampingRatio : def.dampingRatio
    });

    //setup particle
    _setParticleVelocity.call(this, def.velocity);
}

function _setAbsoluteRestTolerance(){
    var distance = this.endState.sub(this.initState).normSquared();
    this._absRestTolerance = (distance === 0)
        ? this._restTolerance
        : this._restTolerance * distance;
}

function _setTarget(target){
    this.endState.set(target);
    _setAbsoluteRestTolerance.call(this);
}

function _wake(){
    this.PE.play();
    this._active = true;
}

function _sleep(){
    this.PE.pause();
    this._active = false;
}

function _setParticlePosition(p){
    this.particle.p.set(p);
}

function _setParticleVelocity(v){
    this.particle.v.set(v);
}

function _getParticlePosition(){
    return (this._dimensions === 0)
        ? this.particle.p.x
        : this.particle.p.get();
}

function _getParticleVelocity(){
    return (this._dimensions === 0)
        ? this.particle.v.x
        : this.particle.v.get();
}

function _setCallback(callback){
    this._callback = callback;
}

SpringTransition.prototype.reset = function(pos, vel){
    this._dimensions = (pos instanceof Array)
        ? pos.length
        : 0;

    this.initState.set(pos);
    _setParticlePosition.call(this, pos);
    _setTarget.call(this, pos);
    if (vel) _setParticleVelocity.call(this, vel);
    _setCallback.call(this, undefined);
}

SpringTransition.prototype.getVelocity = function(){
    return _getParticleVelocity.call(this);
}

SpringTransition.prototype.setVelocity = function(v){
    this.call(this, _setParticleVelocity(v));
}

SpringTransition.prototype.halt = function(){
    this.set(this.get());
}

SpringTransition.prototype.get = function(){
    _update.call(this);
    return _getParticlePosition.call(this);
}

SpringTransition.prototype.set = function(endState, definition, callback){
    if (!definition){
        this.reset(endState)
        if (callback) callback();
        return;
    }

    this._dimensions = (endState instanceof Array)
        ? endState.length
        : 0;

    _wake.call(this);
    _setupDefinition.call(this, definition);
    _setTarget.call(this, endState);
    _setCallback.call(this, callback);
}

module.exports = SpringTransition;
