define(function(require, exports, module) {
    var Force = require('famous-physics/forces/Force');
    var Vector = require('famous-physics/math/Vector');
    var EventHandler = require('famous/EventHandler');

    /** @constructor */
    function Spring(opts){

        this.opts = {
            period        : 300,
            dampingRatio  : 0.1,
            length        : 0,
            lMin          : 0,
            lMax          : Infinity,
            anchor        : undefined,
            forceFunction : Spring.FORCE_FUNCTIONS.HOOK,
            restTolerance : 1e-5
        };

        if (opts) this.setOpts(opts);

        this.eventOutput = undefined;
        this._atRest = false;

        this.init();

        Force.call(this);

        //registers
        this.disp = new Vector(0,0,0);

    };

    Spring.prototype = Object.create(Force.prototype);
    Spring.prototype.constructor = Force;

    Spring.FORCE_FUNCTIONS = {
        FENE : function (dist, rMax){
            var rMaxSmall = rMax * .99;
            var r = Math.max(Math.min(dist, rMaxSmall), -rMaxSmall);
            return r / (1 - r * r/(rMax * rMax))
        },
        HOOK : function(dist){
            return dist;
        }
    };

    function setForceFunction(fn){
        this.forceFunction = fn;
    };

    function calcStiffness(){
        var opts = this.opts;
        opts.stiffness = Math.pow(2 * Math.PI / opts.period, 2);
    };

    function calcDamping(){
        var opts = this.opts;
        opts.damping = 4 * Math.PI * opts.dampingRatio / opts.period ;
    };

    function getEnergy(strength, dist){
        return 0.5 * strength * dist * dist;
    };

    Spring.prototype.init = function(){
        setForceFunction.call(this, this.opts.forceFunction);
        calcStiffness.call(this);
        calcDamping.call(this);
    };

    Spring.prototype.applyForce = function(targets, source){

        var force        = this.force;
        var disp         = this.disp;
        var opts         = this.opts;

        var stiffness    = opts.stiffness;
        var damping      = opts.damping;
        var restLength   = opts.length;
        var lMax         = opts.lMax;
        var anchor       = opts.anchor || source.p;

        for (var i = 0; i < targets.length; i++){

            var target = targets[i];

            disp.set(anchor.sub(target.p));
            var dist = disp.norm() - restLength;

            if (dist == 0) return;

            //if dampingRatio specified, then override strength and damping
            var m      = target.m;
            stiffness *= m;
            damping   *= m;

            force.set(disp.normalize(stiffness * this.forceFunction(dist, lMax)));

            if (damping)
                if (source) force.set(force.add(target.v.sub(source.v).mult(-damping)));
                else        force.set(force.add(target.v.mult(-damping)));

            target.applyForce(force);
            if (source) source.applyForce(force.mult(-1));

            if (this.eventOutput) {
                var energy = target.getEnergy() + getEnergy(stiffness, dist);
                _fireAtRest.call(this, energy, target);
            };

        };

    };

    function _fireAtRest(energy, target){
        if (energy < this.opts.restTolerance){
            if (!this._atRest) this.eventOutput.emit('atRest', {particle : target});
            this._atRest = true;
        }
        else this._atRest = false;
    };

    Spring.prototype.getEnergy = function(target, source){
        var opts        = this.opts;
        var restLength  = opts.length,
            anchor      = opts.anchor || source.p,
            strength    = opts.stiffness;

        var dist = anchor.sub(target.p).norm() - restLength;

        return 0.5 * strength * dist * dist;
    };

    Spring.prototype.setOpts = function(opts){
        if (opts.anchor !== undefined){
            if (opts.anchor.p instanceof Vector) this.opts.anchor = opts.anchor.p;
            if (opts.anchor   instanceof Vector)  this.opts.anchor = opts.anchor;
            if (opts.anchor   instanceof Array)  this.opts.anchor = new Vector(opts.anchor);
        }
        if (opts.period !== undefined) this.opts.period = opts.period;
        if (opts.dampingRatio !== undefined) this.opts.dampingRatio = opts.dampingRatio;
        if (opts.length !== undefined) this.opts.length = opts.length;
        if (opts.lMin !== undefined) this.opts.lMin = opts.lMin;
        if (opts.lMax !== undefined) this.opts.lMax = opts.lMax;
        if (opts.forceFunction !== undefined) this.opts.forceFunction = opts.forceFunction;
        if (opts.restTolerance !== undefined) this.opts.restTolerance = opts.restTolerance;

        this.init();
    };

    Spring.prototype.setAnchor = function(anchor){
        if (this.opts.anchor === undefined) this.opts.anchor = new Vector();
        this.opts.anchor.set(anchor);
    };

    function _createEventOutput() {
        this.eventOutput = new EventHandler();
        this.eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this.eventOutput);
    };

    Spring.prototype.on = function() { _createEventOutput.call(this); return this.on.apply(this, arguments); }
    Spring.prototype.unbind = function() { _createEventOutput.call(this); return this.unbind.apply(this, arguments); }
    Spring.prototype.pipe = function() { _createEventOutput.call(this); return this.pipe.apply(this, arguments); }
    Spring.prototype.unpipe = function() { _createEventOutput.call(this); return this.unpipe.apply(this, arguments); }

    module.exports = Spring;

});