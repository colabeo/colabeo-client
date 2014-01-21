define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Contact      = require('app/models/Contact');
    var Templates    = require('app/custom/Templates');
    var Mod              = require("famous/Modifier");

    // Import app specific dependencies

    function SocialItemView(options) {
        View.call(this);

        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        var height = 51;

        this.surface = new Surface({
            classes: ['import-item', 'editable'],
            size: [undefined, height]
        });

//        // Bind click event to load new tweet
        this.surface.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("import-source")) {
                //TODO: add function
                this.eventOutput.emit('importSource', this.model);
                this.eventOutput.emit('goBack');
            }
        }.bind(this));

        this.template();

        this.surface.pipe(this.eventOutput);

        this.mod = new Mod({
            transform: undefined
        });
        this._link(this.mod);
        this._link(this.surface);
    }

    SocialItemView.prototype = Object.create(View.prototype);
    SocialItemView.prototype.constructor = SocialItemView;

    SocialItemView.prototype.template = function() {
        var name = '<div class="import-source">' + this.model.get('firstname') + " <b>" + this.model.get('lastname') + "</b>" + '</div>';;
        this.surface.setContent(name);
    };

    module.exports = SocialItemView;
});