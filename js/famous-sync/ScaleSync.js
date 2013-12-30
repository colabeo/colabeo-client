define(function(require, exports, module) {
    var TwoFingerSync = require('./TwoFingerSync');

    function ScaleSync(targetSync,options) {
        TwoFingerSync.call(this,targetSync,options);
        this._startDist = undefined;
        this._prevScale = undefined;
        this.input.on('pipe', _reset.bind(this));
    }

    ScaleSync.prototype = Object.create(TwoFingerSync.prototype);

    function _calcDist(posA, posB) {
        var diffX = posB[0] - posA[0];
        var diffY = posB[1] - posA[1];
        return Math.sqrt(diffX*diffX + diffY*diffY);
    };

    function _reset() {
        this.touchAId = undefined;
        this.touchBId = undefined;
    };

    ScaleSync.prototype._startUpdate = function() {
        this._prevScale = 1;
        this._startDist = _calcDist(this.posA, this.posB);
        this._vel = 0;
        this.output.emit('start', {count: event.touches.length, touches: [this.touchAId, this.touchBId], distance: this._startDist});
    };

    ScaleSync.prototype._moveUpdate = function(diffTime) {
        var currDist = _calcDist(this.posA, this.posB);
        var currScale = currDist / this._startDist;
        var diffScale = currScale - this._prevScale;
        var veloScale = diffScale / diffTime;

        var prevPos = this.targetGet();
        var scale = this.options.scale;
        this.output.emit('update', {p: prevPos + scale*diffScale, v: scale*veloScale, touches: [this.touchAId, this.touchBId], distance: currDist});

        this._prevScale = currScale;
        this._vel = veloScale;
    };

    module.exports = ScaleSync;
});
