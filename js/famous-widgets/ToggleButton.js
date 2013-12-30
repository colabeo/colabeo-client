define(function(require, exports, module) {
    var Surface = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var ImageFader = require('famous-views/ImageFader');

    function ToggleButton(options) {
        this.options = {
            content: '',
            offClasses: ['off'],
            onClasses: ['on'],
            size: undefined,
            outTransition: {curve: 'easeInOut', duration: 300},
            inTransition: {curve: 'easeInOut', duration: 300},
            toggleMode: ToggleButton.TOGGLE,
            crossfade: false
        };

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.offSurface = new Surface();
        this.offSurface.on('click', function() {
            if(this.options.toggleMode !== ToggleButton.OFF) this.select();
        }.bind(this));
        this.offSurface.pipe(this.eventOutput);

        this.onSurface = new Surface();
        this.onSurface.on('click', function() {
            if(this.options.toggleMode !== ToggleButton.ON) this.deselect();
        }.bind(this));
        this.onSurface.pipe(this.eventOutput);

        this.arbiter = new ImageFader({crossfade: this.options.crossfade});
        this.arbiter.forMode(ToggleButton.OFF).link(this.offSurface);
        this.arbiter.forMode(ToggleButton.ON).link(this.onSurface);

        this.arbiter.setMode(ToggleButton.OFF);
        this.selected = false;
        
        if(options) this.setOptions(options);
    };

    /** @const */ ToggleButton.OFF = 0;
    /** @const */ ToggleButton.ON = 1;
    /** @const */ ToggleButton.TOGGLE = 2; // only used for mode

    ToggleButton.prototype.select = function() {
        this.selected = true;
        this.arbiter.setMode(ToggleButton.ON, this.options.inTransition);
        this.eventOutput.emit('select');
    };

    ToggleButton.prototype.deselect = function() {
        this.selected = false;
        this.arbiter.setMode(ToggleButton.OFF, this.options.outTransition);
        this.eventOutput.emit('deselect');
    };

    ToggleButton.prototype.isSelected = function() {
        return this.selected;
    };

    ToggleButton.prototype.setOptions = function(options) {
        if(options.content !== undefined) {
            this.options.content = options.content;
            this.offSurface.setContent(this.options.content);
            this.onSurface.setContent(this.options.content);   
        }
        if(options.offClasses) {
            this.options.offClasses = options.offClasses;
            this.offSurface.setClasses(this.options.offClasses);
        }
        if(options.onClasses) {
            this.options.onClasses = options.onClasses;
            this.onSurface.setClasses(this.options.onClasses);
        }
        if(options.size !== undefined) {
            this.options.size = options.size;
            this.onSurface.setSize(this.options.size);
            this.offSurface.setSize(this.options.size);
        }
        if(options.toggleMode !== undefined) this.options.toggleMode = options.toggleMode;
        if(options.outTransition !== undefined) this.options.outTransition = options.outTransition;
        if(options.inTransition !== undefined) this.options.inTransition = options.inTransition;
        if(options.crossfade !== undefined) {
            this.options.crossfade = options.crossfade;
            this.arbiter.setOptions({crossfade: this.options.crossfade});
        }
    };

    ToggleButton.prototype.getSize = function() {
        return this.options.size;
    };

    ToggleButton.prototype.render = function() {
        return this.arbiter.render();
    };

    module.exports = ToggleButton;
});
