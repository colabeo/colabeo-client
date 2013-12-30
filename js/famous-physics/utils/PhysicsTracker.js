define(function(require, exports, module) {
    var GenericSync = require('famous-sync/GenericSync');
    var MouseSync = require('famous-sync/MouseSync');
    var TouchSync = require('famous-sync/TouchSync');
    var FEH = require('famous/EventHandler');
    var Timer = require('famous/Timer');
    var Vector = require('famous-physics/math/Vector');

    /** @constructor */
    function PhysicsTracker(particle, opts){
        this.particle = particle;
        this.opts = {
            scale : 1,
            torque : {
                strength : 0,
                anchor : new Vector(0,50,0)
            }
        };

        if (opts) this.setOpts(opts);

        this.sync = new GenericSync(
            function(){
                return this.particle.getPos();
            }.bind(this),
            {
                syncClasses : [MouseSync, TouchSync]
            }
        );

        this.eventOutput = new FEH();
        FEH.setInputHandler(this, this.sync);
        FEH.setOutputHandler(this, this.eventOutput);

        this.originalImmunity = undefined;
        this.moving = false;
        this.touchIds = [];

        _bindEvents.call(this);
    }

    function _bindEvents() {
        this.sync.on('start',  _handleStart.bind(this));
        this.sync.on('update', _handleUpdate.bind(this));
        this.sync.on('end',    _handleEnd.bind(this));
    }

    function _handleStart(data) {
        var touchId = data.touch || 0;
        this.touchIds.push(touchId);

        if (this.touchIds[0] == touchId){
            var particle = this.particle;
            data.particle = particle;
            this.originalImmunity = particle.getImmunity();
            particle.addImmunity('agents');
            particle.addImmunity('update');
            particle.v.clear();
            this.eventOutput.emit('start', data);
        }
    }

    function _handleUpdate(data) {
        var touchId = data.touch || 0;

        if (this.touchIds[0] == touchId){
            this.moving = true;

            //TODO: optimize repeated bind calls
//            var debounce = function(){
//                if (!this.moving) this.particle.v.clear();
//            };
//            Timer.after(debounce.bind(this), 2);

            //TODO: update velocity for collisions
            var particle = this.particle;
            data.particle = particle;
            particle.setPos(data.p);
            particle.setVel(data.v);

            if (this.opts.torque && this.opts.torque.strength && particle.applyTorque){
                var v = new Vector(data.v);
                v.y *= -1;
                particle.applyTorque(this.opts.torque.anchor.cross(v).mult(this.opts.torque.strength));
            };

            this.eventOutput.emit('update', data);
        }
    }

    function _handleEnd(data) {
        var touchId = data.touch || 0;

        if (this.touchIds.length == 1){
            this.moving = false;
            var particle = this.particle;
            data.particle = particle;
            var scale = this.opts.scale;
            particle.setVel([data.v[0]*scale, data.v[1]*scale]);
            particle.setImmunity(this.originalImmunity);
            this.eventOutput.emit('end', data);
        }

        var index = this.touchIds.indexOf(touchId);
        if (index > -1) this.touchIds.splice(index, 1);
    }

    PhysicsTracker.prototype.setParticle = function(particle){
        this.particle = particle;
    }

    PhysicsTracker.prototype.setOpts = function(opts){
        if (opts.torque){
            if (opts.torque.anchor !== undefined) this.opts.torque.anchor = new Vector(opts.torque.anchor);
            if (opts.torque.strength !== undefined) this.opts.torque.strength = opts.torque.strength;
        }
        if (opts.scale !== undefined) this.opts.scale = opts.scale;
    }

    module.exports = PhysicsTracker;

});