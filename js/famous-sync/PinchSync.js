define(function(require, exports, module) {
    var TwoFingerSync = require('./TwoFingerSync');

    function PinchSync(targetSync,options) {
        TwoFingerSync.call(this,targetSync,options);
        this._dist = undefined;
    }

    PinchSync.prototype = Object.create(TwoFingerSync.prototype);

    function _calcDist(posA, posB) {
        var diffX = posB[0] - posA[0];
        var diffY = posB[1] - posA[1];
        return Math.sqrt(diffX*diffX + diffY*diffY);
    };

    PinchSync.prototype._startUpdate = function() {
        this._dist = _calcDist(this.posA, this.posB);
        this._vel = 0;
        this.output.emit('start', {count: event.touches.length, touches: [this.touchAId, this.touchBId], distance: this._dist});
    };

    PinchSync.prototype._moveUpdate = function(diffTime) {
        var currDist = _calcDist(this.posA, this.posB);
        var diffZ = currDist - this._dist;
        var veloZ = diffZ / diffTime;

        var prevPos = this.targetGet();
        var scale = this.options.scale;
        this.output.emit('update', {p: prevPos + scale*diffZ, v: scale*veloZ, touches: [this.touchAId, this.touchBId], distance: currDist});

        this._dist = currDist;
        this._vel = veloZ;
    };

    module.exports = PinchSync;
});
