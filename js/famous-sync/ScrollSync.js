define(function(require, exports, module) {
    var FEH = require('famous/EventHandler');
    var FE = require('famous/Engine');

    function ScrollSync(targetSync,options) {
        this.targetGet = targetSync;

        this.options = {
            direction: undefined,
            minimumEndSpeed: Infinity,
            rails: false,
            scale: 1,
            stallTime: 50
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

        this._prevTime = undefined;
        this._prevVel = undefined;
        this._lastFrame = undefined;
        this.input.on('mousewheel', _handleMove.bind(this));
        this.input.on('wheel', _handleMove.bind(this));
        this.inProgress = false;

        this._loopBound = false;
    };

    /** @const */ ScrollSync.DIRECTION_X = 0;
    /** @const */ ScrollSync.DIRECTION_Y = 1;

    function _newFrame() {
        var now = Date.now();
        if (this.inProgress && now - this._prevTime > this.options.stallTime) {
            var pos = this.targetGet();
            this.inProgress = false;
            var finalVel = 0;
            if(Math.abs(this._prevVel) >= this.options.minimumEndSpeed) finalVel = this._prevVel;
            this.output.emit('end', {p: pos, v: finalVel, slip: true});
        }
    };

    function _handleMove(e) {
        e.preventDefault();
        if (!this.inProgress) {
            this.inProgress = true;
            this.output.emit('start', {slip: true});
            if(!this._loopBound) {
                FE.on('prerender', _newFrame.bind(this));
                this._loopBound = true;
            }
        };

        var prevTime = this._prevTime;
        var diffX = (e.wheelDeltaX !== undefined) ? e.wheelDeltaX : -e.deltaX;
        var diffY = (e.wheelDeltaY !== undefined) ? e.wheelDeltaY : -e.deltaY;
        var currTime = Date.now();

        if(this.options.rails) {
            if(Math.abs(diffX) > Math.abs(diffY)) diffY = 0;
            else diffX = 0;
        }

        var diffTime = Math.max(currTime - prevTime, 8); // minimum tick time

        var velX = diffX / diffTime;
        var velY = diffY / diffTime;

        var prevPos = this.targetGet();

        var scale = this.options.scale;

        var nextPos;
        var nextVel;

        if(this.options.direction == ScrollSync.DIRECTION_X) {
            nextPos = prevPos + scale*diffX;
            nextVel = scale*velX;
        }
        else if(this.options.direction == ScrollSync.DIRECTION_Y) {
            nextPos = prevPos + scale*diffY;
            nextVel = scale*velY;
        }
        else {
            nextPos = [prevPos[0] + scale*diffX, prevPos[1] + scale*diffY];
            nextVel = [scale*velX, scale*velY];
        }

        this.output.emit('update', {p: nextPos, v: nextVel, slip: true});

        this._prevTime = currTime;
        this._prevVel = nextVel;
    };

    ScrollSync.prototype.getOptions = function() {
        return this.options;
    };

    ScrollSync.prototype.setOptions = function(options) {
        if(options.direction !== undefined) this.options.direction = options.direction;
        if(options.minimumEndSpeed !== undefined) this.options.minimumEndSpeed = options.minimumEndSpeed;
        if(options.rails !== undefined) this.options.rails = options.rails;
        if(options.scale !== undefined) this.options.scale = options.scale;
        if(options.stallTime !== undefined) this.options.stallTime = options.stallTime;
    };

    module.exports = ScrollSync;

});
