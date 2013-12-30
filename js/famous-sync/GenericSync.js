define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var TouchSync = require('./TouchSync');
    var ScrollSync = require('./ScrollSync');

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
});
