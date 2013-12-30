define(function(require, exports, module) {
    var RenderNode = require('famous/RenderNode');
    var Matrix = require('famous/Matrix');
    var EventHandler = require('famous/EventHandler');
    var Shaper = require('./Shaper');
    var GenericSync = require('famous-sync/GenericSync');
    var EnergyHelper = require('./EnergyHelper');
    var Transitionable = require('famous/Transitionable');

    /**
     * @name SelectionBall
     * @constructor
     * To be deleted.
     */
    function SelectionBall(items, options) {
        this.options = {
            radius: undefined,
            zoomDistance: 0,
            spinDrag: 0.001,
            spinFriction: 1e-6,
            spinTightness: 0.0001,
            spinDamp: 0.8,
            recenterTightness: 0.001,
            recenterDamp: 5,
            zoomTransition: {duration: 1000, curve: 'easeInOut'},
            tileSize: [500, 500]
        };

        if(options) this.setOptions(options);

        if(!this.options.radius) {
            var tileArea = this.options.tileSize[0] * this.options.tileSize[1];
            var totalArea = items.length * tileArea;
            this.options.radius = Math.sqrt(totalArea / (Math.PI * 4));
        }

        this.zoom = new Transitionable(2*this.options.radius);
        this.shaper = new Shaper();

        this.scrollH = new EnergyHelper(0, 0, 0.01/this.options.radius);
        this.scrollV = new EnergyHelper(0, 0, 0.01/this.options.radius);
        var dragAgent = EnergyHelper.drag(this.options.spinDrag);
        var frictionAgent = EnergyHelper.friction(this.options.spinFriction);
        var recenterAgent = EnergyHelper.spring(0, this.options.recenterTightness, this.options.recenterDamp);

        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();

        EventHandler.setInputHandler(this, this.eventInput);
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.sync = new GenericSync((function() {
            return [this.scrollH.getPos(), this.scrollV.getPos()];
        }).bind(this), {
            scale: Math.PI/this.options.radius
        });
        this.sync.pipe(this.eventInput);

        this.eventInput.pipe(function(type, data) {
            if(type != 'start' && type != 'update' && type != 'end') {
                this.sync.emit(type, data); 
            }
        }.bind(this));

        this.eventInput.on('start', (function(data) {
            this.scrollH.setAgents([]);
            this.scrollH.setVelo(0);
            this.scrollV.setAgents([]);
            this.scrollV.setVelo(0);
        }).bind(this));
        this.eventInput.on('update', (function(data) {
            this.scrollH.setPos(data.p[0]);
            
            var vPos = data.p[1];
            if(vPos < -0.2*Math.PI) vPos = Math.min(-0.2*Math.PI, this.scrollV.getPos());
            else if(vPos > 0.2*Math.PI) vPos = Math.max(0.2*Math.PI, this.scrollV.getPos());
            this.scrollV.setPos(vPos);
        }).bind(this));
        this.eventInput.on('end', (function(data) {
            this.scrollH.setVelo(data.v[0]);
            this.scrollH.setAgents([dragAgent, frictionAgent]);
            this.scrollV.setVelo(data.v[1]);
            this.scrollV.setAgents([dragAgent, frictionAgent, recenterAgent]);
        }).bind(this));

        var sphereAngles = _generateSphereAngles(items.length, this.options.radius, this.options.tileSize);
        var sphereShape = _sphereAnglesToShape(sphereAngles, this.options.radius);

        for(var i = 0; i < items.length; i++) {
            this.shaper.side(i).from(items[i]);
            items[i].on('click', (function(i) {
                var spinTarget = -sphereAngles[i][1];
                var spinStart = this.scrollH.getPos() % (2*Math.PI);
                if(spinStart - spinTarget > Math.PI) this.scrollH.setPos(spinStart - 2*Math.PI);
                if(spinStart - spinTarget < -Math.PI) this.scrollH.setPos(spinStart + 2*Math.PI);
                var spinAgent = EnergyHelper.spring(spinTarget, this.options.spinTightness, this.options.spinDamp);
                this.scrollH.setAgents([spinAgent]);

                var tiltTarget = sphereAngles[i][0];
                var tiltAgent = EnergyHelper.spring(tiltTarget, this.options.spinTightness, this.options.spinDamp);
                this.scrollV.setAgents([tiltAgent]);

                this.zoom.set(this.options.radius + this.options.zoomDistance, this.options.zoomTransition, this.eventOutput.emit.bind(this.eventOutput, 'select', {id: i}));
            }).bind(this, i));
        }
        this.shaper.setShapeAll(sphereShape);
    };

    function _generateSphereAngles(n, r, size) {
        var result = [];
        var nCirc = Math.round(2 * r / size[1]);
        for(var i = 0; i <= nCirc; i++) {
            var phi = (0.2*Math.PI) - i * (0.4*Math.PI/nCirc);
            var nPanel = Math.round(2 * Math.PI * r * Math.cos(phi) / size[0]);
            if(nPanel == 0) nPanel = 1;
            for(var j = 0; j < nPanel; j++) {
                var theta = j * (2*Math.PI/nPanel) - Math.PI;
                result.push([phi, theta]);
            }
        }
        return result;
    };

    function _sphereAnglesToShape(sphereAngles, r) {
        var result = [];
        for(var i = 0; i < sphereAngles.length; i++) {
            result.push(Matrix.moveThen([0, 0, r], Matrix.multiply(Matrix.rotateX(sphereAngles[i][0]), Matrix.rotateY(sphereAngles[i][1]))));
        }
        return result;
    };

    SelectionBall.prototype.reset = function() {
        this.zoom.set(2*this.options.radius, this.options.zoomTransition);
        var resetAgent = EnergyHelper.spring(0, this.options.spinTightness, this.options.spinDamp);
        this.scrollH.setAgents([resetAgent]);
        this.scrollV.setAgents([resetAgent]);
    };

    SelectionBall.prototype.setOptions = function(options) {
        if(options.radius !== undefined) this.options.radius = options.radius;
        if(options.spinDrag !== undefined) this.options.spinDrag = options.spinDrag;
        if(options.spinFriction !== undefined) this.options.spinFriction = options.spinFriction;
        if(options.spinTightness !== undefined) this.options.spinTightness = options.spinTightness;
        if(options.spinDamp !== undefined) this.options.spinDamp = options.spinDamp;
        if(options.recenterTightness !== undefined) this.options.recenterTightness = options.recenterTightness;
        if(options.recenterDamp !== undefined) this.options.recenterDamp = options.recenterDamp;
        if(options.tileSize !== undefined) this.options.tileSize = options.tileSize;
        if(options.zoomDistance !== undefined) this.options.zoomDistance = options.zoomDistance;
    };

    SelectionBall.prototype.render = function() {
        return {
            transform: Matrix.move(Matrix.rotate(-this.scrollV.getPos(), this.scrollH.getPos(), 0), [0, 0, -this.zoom.get()]),
            group: true,
            target: this.shaper.render()
        };
    };

    module.exports = SelectionBall;
});
