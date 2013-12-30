define(function(require, exports, module) {
    var Force = require('famous-physics/forces/Force');
    var Vector = require('famous-physics/math/Vector');

    /** @constructor */
    function Spring(opts){

        this.opts = {
            period        : 300,
            dampingRatio  : 0,
            length        : 0,
            lMin          : 0,
            lMax          : Infinity,
            anchor        : undefined,
            forceFunction : Spring.FORCE_FUNCTIONS.HOOK,
            callback      : undefined,
            callbackTolerance : 1e-7
        };

        if (opts) this.setOpts(opts);

        //registers
        this.torque  = new Vector();

        this.init();
        this._canFireCallback = undefined;

        Force.call(this);
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

    function setStiffness(opts){
        opts.stiffness = Math.pow(2 * Math.PI / opts.period, 2);
    };

    function setDamping(opts){
        opts.damping = 4 * Math.PI * opts.dampingRatio / opts.period ;
    };

    function getEnergy(strength, dist){
        return 0.5 * strength * dist * dist;
    };

    Spring.prototype.init = function(){
        var opts = this.opts;
        setForceFunction.call(this, opts.forceFunction);
        setStiffness.call(this, opts);
        setDamping.call(this, opts);
    };

    Spring.prototype.applyForce = function(targets, source){

        var torque       = this.torque;
        var opts         = this.opts;
        var disp         = this.disp;

        var stiffness    = opts.stiffness;
        var damping      = opts.damping;
        var restLength   = opts.length;
        var anchor       = opts.anchor;

        for (var i = 0; i < targets.length; i++){

            var target = targets[i];

            disp.set(anchor.sub(target.q));
            var dist = disp.norm() - restLength;

            if (dist == 0) return;

            //if dampingRatio specified, then override strength and damping
            var m      = target.m;
            stiffness *= m;
            damping   *= m;

            torque.set(disp.normalize(stiffness * this.forceFunction(dist, this.opts.lMax)));

            if (damping) torque.add(target.w.mult(-damping), torque);

            target.applyTorque(torque);

        };

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
        if (opts.callback !== undefined) this.opts.callback = opts.callback;
        if (opts.callbackTolerance !== undefined) this.opts.callbackTolerance = opts.callbackTolerance;

        this.init();
    };

    module.exports = Spring;

});