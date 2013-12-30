define(function(require, exports, module) {
    var Matrix = require('famous/Matrix');
    var RenderNode = require('famous/RenderNode');
    var PhysicsEngine = require('famous-physics/PhysicsEngine');
    var Spring = require('famous-physics/forces/Spring');
    var Fader = require('./Fader');
    /**
     * @name SatelliteMenu
     * @constructor
     * To be deleted.
     */
    function SatelliteMenu(options) {
        this.options = {
            startAngle: (-Math.PI/2),
            radius: 200,
            duration: 300,
            damp: 0.5,
            separation: 0.125*Math.PI,
            startAngle: 0,
            opacitate: true,
            cull: false
        };

        this.faders = [];
        this.springs = [];

        this.physics = new PhysicsEngine();
        this._isOpen = false;

        if(options) this.setOptions(options);
    };

    function _updateSprings() {
        for(var i = 0; i < this.springs.length; i++) {
            var tX = 0;
            var tY = 0;
            if(this._isOpen) {
                var angle = this.options.startAngle + i*this.options.separation;
                tX = this.options.radius * Math.cos(angle);
                tY = this.options.radius * Math.sin(angle);
            }
            if(this.options.opacitate) {
                if(this._isOpen) this.faders[i].show();
                else this.faders[i].hide();
            }
            this.springs[i].setOptions({
                period: this.options.duration,
                dampingRatio: this.options.damp,
                anchor: [tX, tY, 0]
            });
        }
    };

    SatelliteMenu.prototype.includeFrom = function(obj) {
        var fader = new Fader({
            cull: this.options.cull, 
            transition: {duration: this.options.duration}
        });
        this.faders.push(fader);

        var pe = this.physics;
        var pid = pe.createParticle();

        var spring = new Spring();
        this.springs.push(spring);
        _updateSprings.call(this);

        pe.attach([spring], pid);
        var node = pe.getParticle(pid).from(fader);
        node.from(obj);

        return node;
    };

    SatelliteMenu.prototype.open = function() {
        this._isOpen = true;
        _updateSprings.call(this);
    };

    SatelliteMenu.prototype.close = function() {
        this._isOpen = false;
        _updateSprings.call(this);
    };

    SatelliteMenu.prototype.setOptions = function(options) {
        var shouldUpdateFaders = false;

        if(options.startAngle !== undefined) this.options.startAngle = options.startAngle;
        if(options.radius !== undefined) this.options.radius = options.radius;
        if(options.duration !== undefined) {
            this.options.duration = options.duration;
            shouldUpdateFaders = true;
        }
        if(options.damp !== undefined) this.options.damp = options.damp;
        if(options.separation !== undefined) this.options.separation = options.separation;
        if(options.startAngle !== undefined) this.options.startAngle = options.startAngle;
        if(options.opacitate !== undefined) {
            this.options.opacitate = options.opacitate;
            shouldUpdateFaders = true;
        }
        if(options.cull !== undefined) {
            this.options.cull = options.cull;
            shouldUpdateFaders = true;
        }

        if(shouldUpdateFaders) {
            var transition = {duration: this.options.duration};
            for(var i = 0; i < this.faders.length; i++) {
                this.faders[i].setOptions({cull: this.options.cull, transition: transition});
                if(!this.options.opacitate) {
                    if(this._isOpen) this.faders[i].show();
                    else this.faders[i].hide();
                }
            }
        }
        if(this._isOpen) _updateSprings.call(this);
    };

    SatelliteMenu.prototype.render = function() {
        return this.physics.render();
    };

    module.exports = SatelliteMenu;
});
