define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var RenderNode = require('famous/RenderNode');
    var Fader = require('./Fader');
   
    /**
     * @name RenderArbiter
     * @constructor
     * To be deleted.
     */
    function RenderArbiter(cull) {
        this.nodes = {};
        this.faders = {};
        this.mode = -1;
        this.cull = cull;

        this.outputEvents = new EventHandler();
        EventHandler.setOutputHandler(this, this.outputEvents);
    };

    RenderArbiter.prototype.getMode = function() {
        return this.mode;
    };

    RenderArbiter.prototype.setMode = function(mode, transition, callback) {
        for(var i in this.faders) {
            if(i != mode) this.faders[i].set(0, transition);
            else this.faders[i].set(1, transition, callback);
        }
        var oldMode = this.mode;
        this.mode = mode;
        this.outputEvents.emit('change', {from: oldMode, to: mode});
    };

    RenderArbiter.prototype.forMode = function(mode) {
        if(!this.nodes[mode]) {
            this.nodes[mode] = new RenderNode();
            this.faders[mode] = new Fader({cull: this.cull});
        }
        return this.nodes[mode];
    };

    RenderArbiter.prototype.render = function(input) {
        var result = [];
        for(var i in this.nodes) {
            if(this.faders[i].isVisible()) result.push(this.faders[i].render(this.nodes[i].render()));
        }
        return result;
    };

    module.exports = RenderArbiter;
});
