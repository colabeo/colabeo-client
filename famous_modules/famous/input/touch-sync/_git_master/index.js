var TouchTracker = require('famous/input/touch-tracker');
var EventHandler = require('famous/event-handler');

/**
 * @class Handles piped in touch events. On update it outputs an
 *        object with position, velocity, acceleration, and touch id. On end
 *        it outputs an object with position, velocity, count, and touch id.
 * @description
 * @name TouchSync
 * @constructor
 * @example
 * 
 *     var Engine = require('famous/Engine');
 *     var Surface = require('famous/Surface');
 *     var Modifier = require('famous/Modifier');
 *     var FM = require('famous/Matrix');
 *     var TouchSync = require('famous-sync/TouchSync');
 *     var Context = Engine.createContext();
 *
 *     var surface = new Surface({
 *         size: [200,200],
 *         properties: {
 *             backgroundColor: 'red'
 *         }
 *     });
 *
 *     var modifier = new Modifier({
 *         transform: undefined
 *     });
 *
 *     var position = 0;
 *     var sync = new TouchSync(function(){
 *         return position;
 *     }, {direction: TouchSync.DIRECTION_Y});  
 *
 *     surface.pipe(sync);
 *     sync.on('update', function(data) {
 *         var edge = window.innerHeight - (surface.getSize()[1])
 *         if (data.p > edge) {
 *             position = edge;
 *         } else if (data.p < 0) {
 *             position = 0;
 *         } else {
 *             position = data.p;
 *         }
 *         modifier.setTransform(FM.translate(0, position, 0));
 *         surface.setContent('position' + position + '<br>' + 'velocity' + data.v.toFixed(2));
 *     });
 *     Context.link(modifier).link(surface);
 * 
 */
function TouchSync(targetSync,options) {
    this.targetGet = targetSync;

    this.output = new EventHandler();
    this.touchTracker = new TouchTracker();

    this.options = {
        direction: undefined,
        rails: false,
        scale: 1
    };

    if (options) {
        this.setOptions(options);
    } else {
        this.setOptions(this.options);
    }

    EventHandler.setOutputHandler(this, this.output);
    EventHandler.setInputHandler(this, this.touchTracker);

    this.touchTracker.on('trackstart', _handleStart.bind(this));
    this.touchTracker.on('trackmove', _handleMove.bind(this));
    this.touchTracker.on('trackend', _handleEnd.bind(this));
}

/** @const */ TouchSync.DIRECTION_X = 0;
/** @const */ TouchSync.DIRECTION_Y = 1;

function _handleStart(data) {
    this.output.emit('start', {count: data.count, touch: data.touch.identifier});
};

function _handleMove(data) {
    var history = data.history;
    var prevTime = history[history.length - 2].timestamp;
    var currTime = history[history.length - 1].timestamp;
    var prevTouch = history[history.length - 2].touch;
    var currTouch = history[history.length - 1].touch;

    var diffX = currTouch.pageX - prevTouch.pageX;
    var diffY = currTouch.pageY - prevTouch.pageY;
    
    if(this.options.rails) {
        if(Math.abs(diffX) > Math.abs(diffY)) diffY = 0;
        else diffX = 0;
    }

    var diffTime = Math.max(currTime - prevTime, 8); // minimum tick time

    var velX = diffX / diffTime;
    var velY = diffY / diffTime;

    //DV edits to send acceleration and velocity
    if (history.length > 2){
        var prevprevTouch = history[history.length - 3].touch;
        var accelX = (currTouch.pageX - 2*prevTouch.pageX + prevprevTouch.pageX) / (diffTime*diffTime);
        var accelY = (currTouch.pageY - 2*prevTouch.pageY + prevprevTouch.pageY) / (diffTime*diffTime);
    }
    else{
        var accelX = 0;
        var accelY = 0;
    }

    var prevPos = this.targetGet();
    var scale = this.options.scale;
    var nextPos;
    var nextVel;
    var nextAccel;
    if(this.options.direction == TouchSync.DIRECTION_X) {
        nextPos = prevPos + scale*diffX;
        nextVel = scale*velX;
        nextAccel = scale*velY;
    }
    else if(this.options.direction == TouchSync.DIRECTION_Y) {
        nextPos = prevPos + scale*diffY;
        nextVel = scale*velY;
        nextAccel = scale*accelY;
    }
    else {
        nextPos = [prevPos[0] + scale*diffX, prevPos[1] + scale*diffY];
        nextVel = [scale*velX, scale*velY];
        nextAccel = [scale*accelX, scale*accelY];
    }

    this.output.emit('update', {
        p: nextPos,
        v: nextVel,
        a: nextAccel,
        touch: data.touch.identifier
    });
};

function _handleEnd(data) {
    var nextVel = (this.options.direction !== undefined) ? 0 : [0, 0];
    var history = data.history;
    var count = data.count;
    var pos = this.targetGet();
    if(history.length > 1) {
        var prevTime = history[history.length - 2].timestamp;
        var currTime = history[history.length - 1].timestamp;
        var prevTouch = history[history.length - 2].touch;
        var currTouch = history[history.length - 1].touch;
        var diffX = currTouch.pageX - prevTouch.pageX;
        var diffY = currTouch.pageY - prevTouch.pageY;

        if(this.options.rails) {
            if(Math.abs(diffX) > Math.abs(diffY)) diffY = 0;
            else diffX = 0;
        }

        var diffTime = Math.max(currTime - prevTime, 1); // minimum tick time
        var velX = diffX / diffTime;
        var velY = diffY / diffTime;
        var scale = this.options.scale;

        var nextVel;
        if(this.options.direction == TouchSync.DIRECTION_X) nextVel = scale*velX;
        else if(this.options.direction == TouchSync.DIRECTION_Y) nextVel = scale*velY;
        else nextVel = [scale*velX, scale*velY];
    }
    this.output.emit('end', {p: pos, v: nextVel, count: count, touch: data.touch.identifier});
};

TouchSync.prototype.setOptions = function(options) {
    if(options.direction !== undefined) this.options.direction = options.direction;
    if(options.rails !== undefined) this.options.rails = options.rails;
    if(options.scale !== undefined) this.options.scale = options.scale;
};

TouchSync.prototype.getOptions = function() {
    return this.options;
};

module.exports = TouchSync;
