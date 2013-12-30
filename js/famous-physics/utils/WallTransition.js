define(function(require, exports, module) {
    var PE = require('famous-physics/PhysicsEngine');
    var Spring = require('famous-physics/forces/Spring');
    // var Spring = require('famous-physics/constraints/StiffSpring');
    var Wall = require('famous-physics/constraints/Wall');
    var Vector = require('famous-physics/math/Vector');

    /*
    * Define a physical transition by attaching a spring and or wall to a target location
    * The definition for the transition allows one to specify the parameters of the
    * spring and wall and starting velocity
    */

     /** @constructor */
    function WallTransition(state){
        state = state || 0;

        this._anchor    = new Vector(state, 0, 0);
        this.endState   = state;
        this.prevState  = undefined;
        this.atRest     = true;

        this.spring = new Spring({anchor : this._anchor});
        this.wall   = new Wall();

        this.PE = new PE();
        this.particle = this.PE.createParticle({ p : [state, 0, 0] });
        this.PE.attach(this.spring, this.particle);
        this.PE.attach(this.wall, this.particle);
    }

    WallTransition.DEFAULT_OPTIONS = {
        period : 300,
        dampingRatio : 0,
        restitution : 0.4,
        velocity : 0
    };

    WallTransition.forceFunctions = Spring.forceFunctions;

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
        var defaults = WallTransition.DEFAULT_OPTIONS;
        if (def.period === undefined) def.period = defaults.period;
        if (def.dampingRatio === undefined) def.dampingRatio = defaults.dampingRatio;
        if (def.velocity === undefined) def.velocity = defaults.velocity;
        if (def.restitution === undefined) def.restitution = defaults.restitution;

        //setup spring
        this.spring.setOpts({
            period : def.period,
            dampingRatio : def.dampingRatio
        });

        //setup wall
        this.wall.setOpts({
            restitution : def.restitution
        });

        //setup particle
        _setParticleVelocity.call(this, def.velocity);
    }

    function _setTarget(x){
        this.prevState = this.endState;
        this.endState = x;

        var direction;
        if (this.endState - this.prevState > 0) direction =  1;
        else if (this.endState < 0)             direction = -1;
        else                                    direction =  0;

        this._anchor.x = x;

        this.wall.setOpts({
            d : Math.abs(x),
            n : [-direction, 0, 0]
        });

        //correct for velocity sign
        _setParticleVelocity.call(this, direction * _getParticleVelocity.call(this));
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

    WallTransition.prototype.reset = function(pos, vel){
        pos = pos || 0;
        vel = vel || 0;
        this.prevState = undefined;
        _setParticlePosition.call(this, pos);
        _setParticleVelocity.call(this, vel);
        _setTarget.call(this, pos);
        _setCallback.call(this, undefined);
    }

    WallTransition.prototype.getVelocity = function(){
        _update.call(this);
        return _getParticleVelocity.call(this);
    }

    WallTransition.prototype.halt = function(){
        this.set(this.get());
    }

    WallTransition.prototype.get = function(){
        _update.call(this);
        return _getParticlePosition.call(this);
    }

    WallTransition.prototype.set = function(endState, definition, callback){
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

    module.exports = WallTransition;

});