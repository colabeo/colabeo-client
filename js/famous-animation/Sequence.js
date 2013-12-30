define(function(require, exports, module) {
    /**
     * @constructor
     */
    function FamousSequence() {
        this.startTime = 0;
        this.setupPos = 0;
        this.schedule = [];
        this.seqLoc = -1;
    }

    FamousSequence.prototype._execute = function(pos) {
        if(this.seqLoc < 0) this.seqLoc = 0;
        while(this.seqLoc < this.schedule.length && this.schedule[this.seqLoc].pos <= pos) {
            this.schedule[this.seqLoc].action.call(this);
            this.seqLoc++;
        }
    };
    
    FamousSequence.prototype.update = function() {
        if(this.seqLoc < 0 || this.seqLoc >= this.schedule.length) return;

        var currPos = (new Date()).getTime() - this.startTime;
        this._execute(currPos);
    };
    
    FamousSequence.prototype.at = function(pos, action) {
        this.schedule.push({pos: pos, action: action});
        this.setupPos = pos;
    };
    
    FamousSequence.prototype.after = function(delay, action) {
        this.at(this.setupPos + delay, action);
    };
    
    FamousSequence.prototype.play = function(pos) {
        this.schedule.sort(function(a, b) { return a.pos - b.pos; });
        this.startTime = (new Date()).getTime();
        
        var seqLoc = 0;
        while(seqLoc < this.schedule.length && this.schedule[seqLoc].pos < pos) seqLoc++;
        this.seqLoc = seqLoc;
    };
    
    FamousSequence.prototype.fastForward = function(pos) {
        if(typeof pos == 'undefined') pos = Infinity;
        this._execute(pos);
    };
    
    FamousSequence.prototype.stop = function() {
        this.seqLoc = -1;
    };

    module.exports = FamousSequence;
});
