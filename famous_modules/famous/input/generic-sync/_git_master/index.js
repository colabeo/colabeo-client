var EventHandler = require('famous/event-handler');
var TouchSync    = require('famous/input/touch-sync');
var ScrollSync   = require('famous/input/scroll-sync');

/**
 * @class Combines multiple types of event handling (e.g. touch, trackpad 
 *     scrolling) into one standardized interface for inclusion in  
 *     widgets. TouchSync and ScrollSync are enabled by default.
 * @description
 * @name GenericSync
 * @constructor
 * @example 
 * 
 *     var Engine = require('famous/Engine');
 *     var Surface = require('famous/Surface');
 *     var Modifier = require('famous/Modifier');
 *     var FM = require('famous/Matrix');
 *     var GenericSync = require('famous-sync/GenericSync');
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
 *     var sync = new GenericSync(function(){
 *         return position;
 *     }, {direction: GenericSync.DIRECTION_Y});  
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

function GenericSync(targetGet, options) {
    this.targetGet = targetGet;

    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    
    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    this._handlers = undefined;

    this.options = {
        syncClasses: defaultClasses
    };

    this._handlerOptions = this.options;

    if(options) this.setOptions(options);
    if(!this._handlers) _updateHandlers.call(this);
};

var defaultClasses = [TouchSync, ScrollSync];
GenericSync.register = function(syncClass) {
    if(defaultClasses.indexOf(syncClass) < 0) defaultClasses.push(syncClass);
};
/** @const */ GenericSync.DIRECTION_X = 0;
/** @const */ GenericSync.DIRECTION_Y = 1;
/** @const */ GenericSync.DIRECTION_Z = 2;

function _updateHandlers() {
    if(this._handlers) {
        for(var i = 0; i < this._handlers.length; i++) {
            this.eventInput.unpipe(this._handlers[i]);
            this._handlers[i].unpipe(this.eventOutput);
        }
    }
    this._handlers = [];
    for(var i = 0; i < this.options.syncClasses.length; i++) {
        var _SyncClass = this.options.syncClasses[i];
        this._handlers[i] = new _SyncClass(this.targetGet, this._handlerOptions);
        this.eventInput.pipe(this._handlers[i]);
        this._handlers[i].pipe(this.eventOutput);
    }
}

GenericSync.prototype.setOptions = function(options) {
    this._handlerOptions = options;
    if(options.syncClasses) {
        this.options.syncClasses = options.syncClasses;
        _updateHandlers.call(this);
    }
    if(this._handlers) {
        for(var i = 0; i < this._handlers.length; i++) {
            this._handlers[i].setOptions(this._handlerOptions);
        }
    }
};

module.exports = GenericSync;
