define(function(require, exports, module) {
    var Constraint = require('famous-physics/constraints/Constraint');
    var Vector = require('../math/Vector');
    var EventHandler = require('famous/EventHandler');

    /** @constructor */
    function StiffSpring(opts){

        this.opts = {
            length         : 0,
            anchor         : undefined,
            dampingRatio   : 1,
            period         : 1000,
            restTolerance  : 1e-5
        };

        if (opts) this.setOpts(opts);

        //registers
        this.pDiff  = new Vector();
        this.vDiff  = new Vector();
        this.n      = new Vector();
        this.impulse1 = new Vector();
        this.impulse2 = new Vector();

        this.eventOutput = undefined;
        this._atRest = false;

    };

    StiffSpring.prototype = Object.create(Constraint.prototype);
    StiffSpring.prototype.constructor = Constraint;

    function _fireAtRest(energy, target){
        //TODO: BUG when callback can be fired twice. Energy not always monotonic
        if (energy < this.opts.restTolerance){
            if (!this._atRest) this.eventOutput.emit('atRest', {particle : target});
            this._atRest = true;
        }
        else this._atRest = false;
    };

    function _getEnergy(impulse, disp, dt){
        var energy = Math.abs(impulse.dot(disp)/dt);
        return energy;
    }

    StiffSpring.prototype.setOpts = function(opts){
        if (opts.anchor !== undefined){
            if (opts.anchor   instanceof Vector) this.opts.anchor = opts.anchor;
            if (opts.anchor.p instanceof Vector) this.opts.anchor = opts.anchor.p;
            if (opts.anchor   instanceof Array)  this.opts.anchor = new Vector(opts.anchor);
        }
        if (opts.length !== undefined) this.opts.length = opts.length;
        if (opts.dampingRatio !== undefined) this.opts.dampingRatio = opts.dampingRatio;
        if (opts.period !== undefined) this.opts.period = opts.period;
        if (opts.restTolerance !== undefined) this.opts.restTolerance = opts.restTolerance;
    };

    StiffSpring.prototype.setAnchor = function(v){
        if (this.opts.anchor === undefined) this.opts.anchor = new Vector();
        this.opts.anchor.set(v);
    };

    StiffSpring.prototype.applyConstraint = function(targets, source, dt){

        var opts         = this.opts;
        var pDiff        = this.pDiff;
        var vDiff        = this.vDiff;
        var impulse1     = this.impulse1;
        var impulse2     = this.impulse2;
        var length       = opts.length;
        var anchor       = opts.anchor || source.p;
        var period       = opts.period;
        var dampingRatio = opts.dampingRatio;

        for (var i = 0; i < targets.length ; i++){
            var target = targets[i];

            var p1 = target.p;
            var v1 = target.v;
            var m1 = target.m;
            var w1 = target.mInv;

            pDiff.set(p1.sub(anchor));
            var dist = pDiff.norm() - length;

            if (source){
                var w2 = source.mInv;
                var v2 = source.v;
                vDiff.set(v1.sub(v2));
                var effMass = 1/(w1 + w2);
            }
            else{
                vDiff.set(v1);
                var effMass = m1;
            }

            if (this.opts.period == 0){
                var gamma = 0;
                var beta = 1;
            }
            else{
                var k = 4 * effMass * Math.PI * Math.PI / (period * period);
                var c = 4 * effMass * Math.PI * dampingRatio / period;

                var beta  = dt * k / (c + dt * k);
                var gamma = 1 / (c + dt*k);
            };

            var antiDrift = beta/dt * dist;
            pDiff.normalize(-antiDrift)
                .sub(vDiff)
                .mult(dt / (gamma + dt/effMass))
                .put(impulse1);

            // var n = new Vector();
            // n.set(pDiff.normalize());
            // var lambda = -(n.dot(vDiff) + antiDrift) / (gamma + dt/effMass);
            // impulse2.set(n.mult(dt*lambda));

            target.applyImpulse(impulse1);

            if (source){
                impulse1.mult(-1).put(impulse2);
                source.applyImpulse(impulse2);
            };

            if (this.eventOutput) {
                var energy = target.getEnergy() + _getEnergy(impulse1, pDiff, dt);
                _fireAtRest.call(this, energy, target);
            };
        };

    };

    StiffSpring.prototype.getEnergy = function(target, source){
        var opts        = this.opts;
        var restLength  = opts.length,
            period      = opts.period,
            anchor      = opts.anchor || source.p;

        if (period === 0) return 0;

        var strength = 4 * target.m * Math.PI * Math.PI / (period * period);
        var displacement = anchor.sub(target.p);
        var dist = displacement.norm() - restLength;

        return 0.5 * strength * dist * dist;
    }

    function _createEventOutput() {
        this.eventOutput = new EventHandler();
        this.eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this.eventOutput);
    };

    StiffSpring.prototype.on = function() { _createEventOutput.call(this); return this.on.apply(this, arguments); }
    StiffSpring.prototype.unbind = function() { _createEventOutput.call(this); return this.unbind.apply(this, arguments); }
    StiffSpring.prototype.pipe = function() { _createEventOutput.call(this); return this.pipe.apply(this, arguments); }
    StiffSpring.prototype.unpipe = function() { _createEventOutput.call(this); return this.unpipe.apply(this, arguments); }

    module.exports = StiffSpring;

});