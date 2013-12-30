define(function(require, exports, module) {
    var FEH = require('famous/EventHandler');

    function TwoFingerSync(targetSync,options) {
        this.targetGet = targetSync;

        this.options = {
            scale: 1
        };

        if (options) {
            this.setOptions(options);
        } else {
            this.setOptions(this.options);
        }

        this.input = new FEH();
        this.output = new FEH();

        FEH.setInputHandler(this, this.input);
        FEH.setOutputHandler(this, this.output);

        this.touchAId = undefined;
        this.posA = undefined;
        this.timestampA = undefined;
        this.touchBId = undefined;
        this.posB = undefined;
        this.timestampB = undefined;

        this.input.on('touchstart', this.handleStart.bind(this));
        this.input.on('touchmove', this.handleMove.bind(this));
        this.input.on('touchend', this.handleEnd.bind(this));
        this.input.on('touchcancel', this.handleEnd.bind(this));
    };

    TwoFingerSync.prototype.getOptions = function() {
        return this.options;
    };

    TwoFingerSync.prototype.setOptions = function(options) {
        if(options.scale !== undefined) this.options.scale = options.scale;
    };

    TwoFingerSync.prototype.handleStart = function(event) {
        for(var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            if(!this.touchAId) {
                this.touchAId = touch.identifier;
                this.posA = [touch.pageX, touch.pageY];
                this.timestampA = Date.now();
            }
            else if(!this.touchBId) {
                this.touchBId = touch.identifier;
                this.posB = [touch.pageX, touch.pageY];
                this.timestampB = Date.now();
                this._startUpdate();
            }
        }
    };

    TwoFingerSync.prototype.handleMove = function(event) {
        if(!(this.touchAId && this.touchBId)) return;
        var prevTimeA = this.timestampA;
        var prevTimeB = this.timestampB;
        var diffTime;
        for(var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            if(touch.identifier == this.touchAId) {
                this.posA = [touch.pageX, touch.pageY];
                this.timestampA = Date.now();
                diffTime = this.timestampA - prevTimeA;
            }
            else if(touch.identifier == this.touchBId) {
                this.posB = [touch.pageX, touch.pageY];
                this.timestampB = Date.now();
                diffTime = this.timestampB - prevTimeB;
            }
        }
        if(diffTime) { //change detected
            this._moveUpdate(diffTime);
        }
    };

    TwoFingerSync.prototype.handleEnd = function(event) {
        var pos = this.targetGet();
        var scale = this.options.scale;
        for(var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            if(touch.identifier == this.touchAId || touch.identifier == this.touchBId) {
                if(this.touchAId && this.touchBId) this.output.emit('end', {p: pos, v: scale*this._vel, touches: [this.touchAId, this.touchBId], angle: this._angle});
                this.touchAId = undefined;
                this.touchBId = undefined;
            }
        }
    };

    module.exports = TwoFingerSync;

});
