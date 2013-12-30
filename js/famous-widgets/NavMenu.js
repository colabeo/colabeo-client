define(function(require, exports, module) {
    var Utility = require('famous/Utility');
    var EventHandler = require('famous/EventHandler');
    var Scrollview = require('famous-views/Scrollview');
    var ToggleButton = require('./ToggleButton');
    var ContainerSurface = require('famous/ContainerSurface');

    function NavMenu(options) {
        this.buttons = [];
        this._buttonIds = {};

        this.options = Object.create(NavMenu.DEFAULT_OPTIONS);
        if(options) this.setOptions(options);

        this.scrollview = new Scrollview({
            direction: this.options.look.direction,
            itemSpacing: this.options.look.itemSpacing
        });

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);
        EventHandler.setInputHandler(this, this.scrollview);

        this.scrollview.sequenceFrom(this.buttons);
       
        this.surface = new ContainerSurface(this.options.look);
        this.surface.link(this.scrollview);
        this.surface.pipe(this.scrollview);
    };

    NavMenu.DEFAULT_OPTIONS = {
        sections: [],
        widget: ToggleButton,
        look: {
            size: [200, undefined],
            direction: Utility.Direction.X,
            itemSize: [undefined, 50],
            itemSpacing: 10,
            crossfade: true 
        },
        feel: undefined
    };

    function _prepareButton(id) {
        var def = this.options.sections[id];
        var widget = this.options.widget;
        var button = new widget();
        if(this.options.feel) button.setOptions(this.options.feel);
        if(this.options.look) {
            var buttonLook = Object.create(this.options.look);
            buttonLook.size = this.options.look.itemSize;
            button.setOptions(buttonLook);
        };
        button.setOptions(def);
        button.on('select', this.select.bind(this, id));
        var i = this.buttons.length;
        this.buttons[i] = button;
        this._buttonIds[id] = i;
    };

    NavMenu.prototype.select = function(id) {
        var btn = this._buttonIds[id];
        // this prevents event loop
        if(this.buttons[btn] && this.buttons[btn].isSelected()) {
            this.eventOutput.emit('select', {id: id});
        }
        else {
            this.buttons[btn] && this.buttons[btn].select();
        }

        for(var i = 0; i < this.buttons.length; i++) {
            if(i != btn) this.buttons[i].deselect();
        }
    };

    NavMenu.prototype.setOptions = function(options) {
        if(options.widget !== undefined) {
            this.options.widget = options.widget;
        }
        if(options.look !== undefined) {
            this.options.look = options.look;
            if(this.surface) this.surface.setOptions(this.options.look);
            var buttonLook = Object.create(this.options.look);
            buttonLook.size = this.options.look.itemSize;
            for(var i = 0; i < this.buttons.length; i++) {
                this.buttons[i].setOptions(buttonLook);
            }
        }
        if(options.feel !== undefined) {
            this.options.feel = options.feel;
            for(var i = 0; i < this.buttons.length; i++) {
                this.buttons[i].setOptions(this.options.feel);
            }
        }
        if(options.sections !== undefined) {
            this.options.sections = options.sections;
            for(var id in this.options.sections) {
                if(!(id in this._buttonIds)) _prepareButton.call(this, id);
            }
        }
    };

    NavMenu.prototype.getSize = function() {
        return this.options.look.size;
    };

    NavMenu.prototype.render = function() {
        if(!this.buttons.length) return undefined;
        return this.surface.render();
    };

    module.exports = NavMenu;

});
