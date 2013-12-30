define(function(require, exports, module) {
    /**
     * @class ViewSequence
     *
     * @name ViewSequence
     * @constructor
     *
     * @param {Array} array Array that will be viewed
     * @param {number} index Index of array to begin at
     * @param {boolean} loop Whether to loop around the array at end
     */
    function ViewSequence(array, index, loop) {
        this.array = array || [];
        this.index = index || 0; 
        this.loop = loop || false;
        this._prev = undefined;
        this._prevIndex = undefined;
        this._next = undefined;
        this._nextIndex = undefined;
    };

    ViewSequence.prototype._createPrevious = function() {
        var prev = new (this.constructor)(this.array, this._prevIndex, this.loop);
        prev._next = this;
        prev._nextIndex = this.index;
        return prev;
    };

    ViewSequence.prototype._createNext = function() {
        var next = new (this.constructor)(this.array, this._nextIndex, this.loop);
        next._prev = this;
        next._prevIndex = this.index;
        return next;
    };

    ViewSequence.prototype.getPrevious = function() {
        var prevIndex = this.index - 1;
        if(this.index == 0) {
            if(this.loop) prevIndex = this.array.length - 1;
            else return undefined;
        }
        if(!this._prev || this._prevIndex != prevIndex) {
            this._prevIndex = prevIndex;
            this._prev = this._createPrevious();
        }
        return this._prev;
    };

    ViewSequence.prototype.getNext = function() {
        var nextIndex = this.index + 1;
        if(nextIndex >= this.array.length) {
            if(this.loop) nextIndex = 0;
            else return undefined;
        }
        if(!this._next || this._nextIndex != nextIndex) {
            this._nextIndex = nextIndex;
            this._next = this._createNext();
        }
        return this._next;
    };

    ViewSequence.prototype.toString = function() {
        return this.index;
    };

    ViewSequence.prototype.unshift = function(value) {
        if(!this._prev || this.index === 0) {
            var offset = arguments.length;
            this.array.unshift.apply(this.array, arguments);
            _reindex.call(this, offset);
        }
        else this._prev.unshift.apply(this._prev, arguments);
    };

    ViewSequence.prototype.push = function(value) {
        this.array.push.apply(this.array, arguments);
    };

    ViewSequence.prototype.splice = function(index, howMany, value) {
        if(!this._prev || this.index === index) {
            var offset = (this.index >= index) ? (arguments.length - 2) - howMany : 0;
            this.array.splice.apply(this.array, arguments);
            if(offset) _reindex.call(this, offset);
        }
        else this._prev.splice.apply(this._prev, arguments);
    };

    function _reindex(offset) {
        var i = this.index;
        var currentNode = this;
        while(currentNode && i < this.array.length) {
            currentNode.index += offset;
            if(currentNode._prevIndex !== undefined) currentNode._prevIndex += offset;
            if(currentNode._nextIndex !== undefined) currentNode._nextIndex += offset;
            currentNode = currentNode._next;
        }
    };

    ViewSequence.prototype.get = function() {
        return this.array[this.index];
    };

    ViewSequence.prototype.getSize = function() {
        var target = this.get();
        if(!target) return;
        if(!target.getSize) return undefined;
        return target.getSize.apply(target, arguments);
    };

    ViewSequence.prototype.render = function() {
        var target = this.get();
        if(!target) return;
        return target.render.apply(target, arguments);
    };

    module.exports = ViewSequence;
});
