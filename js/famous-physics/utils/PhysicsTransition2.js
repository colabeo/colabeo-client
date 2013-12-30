define(function(require, exports, module) {
    var PE = require('famous-physics/PhysicsEngine');
    var Spring = require('famous-physics/constraints/StiffSpring');
    var VectorField = require('famous-physics/forces/VectorField');
    var Wall = require('famous-physics/constraints/Wall');
    var Vector = require('famous-physics/math/Vector');
    var FEH = require('famous/EventHandler');

    /** @deprecated */

    /*
     * Define a physical transition by specifying a physics tween to a target location
     * after which a spring or wall is attached to give a bounce effect
     * The definition for the transition allows one to specify the parameters of the
     * physics tween, which is an initial velocity and acceleration (thrust), in addition
     * to spring and wall parameters
     */

    /** @constructor */
    function PhysicsTransition(start){

        start = start || 0;
        this.endState  = start;
        this.prevState = undefined;
        this.direction = undefined;

        this.defaultDefinition = {
            transition : {
                curve : {v : 1, thrust : 0},
                duration : 500
            },
            bounce : {period : 0, dampingRatio : 0},
            walls : false
        };

        this._anchor = new Vector(start, 0, 0);

        this.stageOneActive = false;

        this.attachedSpring = undefined;
        this.attachedWall   = undefined;
        this.attachedThrust = undefined;

        this.eventHandler = new FEH();
        this.eventHandler.on('initStageTwo', _stageTwo.bind(this));

        this.PE = new PE();
        this.particle = this.PE.createBody({
            p : [start, 0, 0],
            v : [0, 0, 0]
        });

        this.spring = new Spring({anchor : this._anchor});

        this.thrust = new VectorField({
            strength : 0,
            field : VectorField.FIELDS.CONSTANT,
            direction : [1,0,0]
        });

        this.wall = new Wall({
            restitution : 0.5,
            k : 0,
            n : new Vector(-1,0,0)
        });

    }

    PhysicsTransition.TRANSITIONS = {
        linear  : { v :  1, thrust : 0},
        easeIn  : { v :  0, thrust : 2},
        backIn  : { v : -1, thrust : 2}
    }

    PhysicsTransition.BOUNCE = {
        none    : {dampingRatio : 0,   period : 0},
        low     : {dampingRatio : 0.5, period : 300},
        medium  : {dampingRatio : 0.3, period : 600},
        high    : {dampingRatio : 0.1, period : 800}
    }

    var time;
    PhysicsTransition.forceFunctions = Spring.forceFunctions;

    function _getDirection(){
        return (this.particle.p.x <= this.endState) ? 1 : -1;
    }

    function _setDirection(direction){
        this.direction = direction;
    }

    function _checkDirection(){
        if (this.stageOneActive == true && this.direction != _getDirection.call(this))
            this.eventHandler.emit('initStageTwo');
    }

    function _setupDefinition(def){
        var T = def.transition.duration;
        var curve = def.transition.curve;

        var a, v;
        if (typeof curve == 'string') curve = PhysicsTransition.TRANSITIONS[curve];

        v = this.direction * curve.v;
        a = this.direction * curve.thrust;

        var D = this.endState - this.particle.p.x;

        if (T == 0){
            this.v = v || 0;
            this.a = 0;
        }
        else{
            //solving x0 + v(Tt) + 1/2a(Tt)^2 = D for t
            var scaledDuration;
            if (a == 0){
                scaledDuration = D / (v * T);
            }
            else{
                if (v*v + 2*a*D < 0) console.warn('unphysical choices for (v,a), target cannot be reached');
                scaledDuration = (D > 0)
                    ? (-v + Math.sqrt(v*v + 2*a*D)) / (a * T)
                    : (-v - Math.sqrt(v*v + 2*a*D)) / (a * T);
            }

            this.v = scaledDuration * v;
            this.a = scaledDuration * scaledDuration * a;
        }

        var bounce = def.bounce;
        if (typeof bounce == 'string') bounce = PhysicsTransition.BOUNCE[bounce];

        this.spring.setOpts({
            period          : bounce.period,
            dampingRatio    : bounce.dampingRatio
        });

        this.wallsActive = def.walls;
    }

    function _setTarget(x){
        this.prevState = this.endState;
        this.endState  = x;
        _setDirection.call(this, _getDirection.call(this));
    }

    function _attachSpring(pos){
        if (this.attachedSpring !== undefined) return;
        this._anchor.x = pos;
        this.attachedSpring = this.PE.attach(this.spring, this.particle);
    }

    function _detachSpring(){
        if (this.attachedSpring === undefined) return;
        this.PE.detach(this.attachedSpring, this.particle);
        this.attachedSpring = undefined;
    }

    function _attachWall(position, direction){
        if (!this.wallsActive) return;
        this.wall.setOpts({
            d : Math.abs(position),
            n : [-direction,0,0]
        });
        this.attachedWall = this.PE.attach(this.wall, this.particle);
    }

    function _detachWall(){
        if (this.attachedWall === undefined) return;
        this.PE.detach(this.attachedWall, this.particle);
        this.attachedWall = undefined;
    }

    function _attachThrust(strength){
        this.thrust.setOpts({strength : strength});
        this.attachedThrust = this.PE.attach(this.thrust, this.particle);
    }

    function _detachThrust(){
        if (this.attachedThrust === undefined) return;
        this.PE.detach(this.attachedThrust);
        this.attachedThrust = undefined;
    }

    function _stageOne(){
        this.stageOneActive = true;
        _detachSpring.call(this);
        _detachThrust.call(this);
        _detachWall.call(this);
        _attachThrust.call(this, this.a);
        _setVelocity.call(this, this.v);
        time = Date.now();
    }

    function _stageTwo(){
        console.log('Duration : ', Date.now() - time);
        this.stageOneActive = false;
        _detachThrust.call(this);
        _setPosition.call(this, this.endState);
        _attachSpring.call(this, this.endState);
        _attachWall.call(this, this.endState, this.direction);
    }

    function _setVelocity(v){
        this.particle.v.x = v;
    }

    function _setPosition(p){
        this.particle.p.x = p;
    }

    function _setCallback(callback){
        this.spring.setOpts({callback : callback});
    }

    function _update(){
        this.PE.step();
        _checkDirection.call(this);
    }

    //------------------------------------------------------------PUBLIC METHODS

    PhysicsTransition.prototype.reset = function(p,v){
        v = v || 0;
        p = p || 0;
        this.PE.detachAll();
        _setPosition.call(this, p);
        _setVelocity.call(this, v);
        _setCallback.call(this, undefined);
    }

    PhysicsTransition.prototype.set = function(endState, definition, callback){
        if (!definition){
            this.reset(endState)
            if (callback) callback();
            return;
        };

        _setTarget.call(this, endState);
        _setupDefinition.call(this, definition);
        _setCallback.call(this, callback);
        _stageOne.call(this);
    }

    PhysicsTransition.prototype.get = function(){
        _update.call(this);
        return this.particle.p.x;
    }

    PhysicsTransition.prototype.getVelocity = function(){
        _update.call(this);
        return this.particle.v.x;
    }

    PhysicsTransition.prototype.getTarget = function(){
        return this.endState;
    }

    module.exports = PhysicsTransition;

});