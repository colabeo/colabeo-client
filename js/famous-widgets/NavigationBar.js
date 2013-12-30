define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var Utility = require('famous/Utility');
    var View = require('famous/View');
    var GridLayout = require('famous-views/GridLayout');
    var ToggleButton = require('./ToggleButton');

    function NavigationBar(options) {
        View.apply(this, arguments);

        this.layout = new GridLayout();
        this.buttons = [];
        this._buttonIds = {};
        this._buttonCallbacks = {};

        this.layout.sequenceFrom(this.buttons);
        this._link(this.layout);

        this.optionsManager.on('change', _updateOptions.bind(this));
    };
    NavigationBar.prototype = Object.create(View.prototype);
    NavigationBar.prototype.constructor = NavigationBar;

    NavigationBar.DEFAULT_OPTIONS = {
        sections: [],
        widget: ToggleButton,
        size: [undefined, 50],
        direction: Utility.Direction.X,
        buttons: {
            toggleMode: ToggleButton.ON
        }
    };

    function _updateOptions(data) {
        var id = data.id;
        var value = data.value;
        
        if(id === 'direction') {
            this.layout.setOptions({size: _resolveGridDimensions.call(this.buttons.length, this.options.direction)});
        }
        else if(id === 'buttons') {
            for(var i in this.buttons) {
                this.buttons[i].setOptions(value);
            }
        }
        else if(id === 'sections') {
            for(var id in this.options.sections) {
                this.defineSection(id, this.options.sections[id]);
            }
        }
    };

    function _resolveGridDimensions(count, direction) {
        if(direction === Utility.Direction.X) return [count, 1];
        else return [1, count];
    };

    NavigationBar.prototype.defineSection = function(id, content) {
        var button;
        var i = this._buttonIds[id];

        if(i === undefined) {
            i = this.buttons.length;
            this._buttonIds[id] = i;
            var widget = this.options.widget;
            button = new widget();
            this.buttons[i] = button;
            this.layout.setOptions({size: _resolveGridDimensions(this.buttons.length, this.options.direction)});
        }
        else {
            button = this.buttons[i];
            button.unbind('select', this._buttonCallbacks[id]);
        }

        if(this.options.buttons) button.setOptions(this.options.buttons);
        button.setOptions(content);

        this._buttonCallbacks[id] = this.select.bind(this, id);
        button.on('select', this._buttonCallbacks[id]);
    };

    NavigationBar.prototype.select = function(id) {
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

    module.exports = NavigationBar;
});
