define(function(require, exports, module) {
    var PE = require('famous-physics/PhysicsEngine');
    // var Spring = require('famous-physics/forces/Spring');
    var Spring = require('famous-physics/constraints/StiffSpring');
    var Wall = require('famous-physics/constraints/Wall');
    var Vector = require('famous-physics/math/Vector');

    /** @deprecated */

    /** @constructor */
    function PhysicsTransition(state){
        this.defaultDefinition = {
            spring : {
                period : 300,
                dampingRatio : 0.5
            },
            v : 0,
            wall : false
        };

        state = state || 0;

        this._anchor    = new Vector(state, 0, 0);
        this.endState   = state;
        this.prevState  = undefined;
        this.direction  = undefined;
        this.atRest     = true;

        this.spring = new Spring({
            anchor : this._anchor
        });

        this.wall = new Wall({
            restitution : 0.5,
            k : 0,
            n : new Vector(-1,0,0)
        });

        this.attachedWall = undefined;

        this.PE = new PE();
        this.particle = this.PE.createParticle({ p : [state, 0, 0]});
        this.attachedSpring = this.PE.attach(this.spring, this.particle);
    }

    PhysicsTransition.forceFunctions = Spring.forceFunctions;

    var restTolerance = 1e-5;
    function _update(){
        if (this.atRest) return;

        this.PE.step();
        var energy = _getEnergy.call(this);
        if (energy < restTolerance) {
            this.atRest = true;
            _setParticlePosition.call(this, this.endState);
            if (this.callback) this.callback();
        };
    }

    function _getEnergy(){
        return this.particle.getEnergy() + this.spring.getEnergy(this.particle);
    }

    function _setupDefinition(def){
        //setup spring
        this.spring.setOpts(def.spring);

        //setup particle
        _setParticleVelocity.call(this, def.v);

        //setup wall
        (def.wall) ? _attachWall.call(this) : _detachWall.call(this);
    }

    function _setTarget(x){
        this.prevState = this.endState;
        this.endState = x;

        if (this.endState - this.prevState > 0)
            this.direction = 1;
        else if (this.endState < 0)
            this.direction = -1;
        else this.direction = 0;


        if (this.attachedSpring !== undefined) this._anchor.x = x;
        if (this.attachedWall   !== undefined) {
            this.wall.setOpts({
                d : Math.abs(x),
                n : [-this.direction, 0, 0]
            });
        };

        //correct for velocity sign
        _setParticleVelocity.call(this, this.direction * _getParticleVelocity.call(this));
    }

    function _attachWall(){
        this.attachedWall = this.PE.attach(this.wall, this.particle);
    }

    function _detachWall(){
        if (this.attachedWall !== undefined) this.PE.detach(this.attachedWall);
    }

    function _setParticlePosition(p){
        this.particle.p.x = p;
    }

    function _setParticleVelocity(v){
        this.particle.v.x = v;
    }

    function _getParticlePosition(){
        return this.particle.p.x;
    }

    function _getParticleVelocity(){
        return this.particle.v.x;
    }

    function _setCallback(callback){
        this.callback = callback;
    }

    PhysicsTransition.prototype.reset = function(pos, vel){
        pos = pos || 0;
        vel = vel || 0;
        this.prevState = undefined;
        _setParticlePosition.call(this, pos);
        _setParticleVelocity.call(this, vel);
        _setTarget.call(this, pos);
        _setCallback.call(this, undefined);
    }

    PhysicsTransition.prototype.getVelocity = function(){
        _update.call(this);
        return _getParticleVelocity.call(this);
    }

    PhysicsTransition.prototype.halt = function(){
        this.set(this.get());
    }

    PhysicsTransition.prototype.get = function(){
        _update.call(this);
        return _getParticlePosition.call(this);
    }

    PhysicsTransition.prototype.set = function(endState, definition, callback){
        if (!definition){
            this.reset(endState)
            if (callback) callback();
            return;
        };

        this.atRest = false;
        _setupDefinition.call(this, definition);
        _setTarget.call(this, endState);
        _setCallback.call(this, callback);
    }

    module.exports = PhysicsTransition;

});