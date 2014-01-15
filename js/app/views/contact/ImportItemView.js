define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Contact      = require('app/models/Contact');
    var Templates    = require('app/custom/Templates');
    var Mod              = require("famous/Modifier");

    // Import app specific dependencies

    function ImportItemView(options) {
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
            if (target.hasClass("add-button")) {
                //TODO: add function
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

    ImportItemView.prototype = Object.create(View.prototype);
    ImportItemView.prototype.constructor = ImportItemView;

    ImportItemView.prototype.template = function() {
        var email = this.model.get('email');
        contact = email + '<div><i class="fa fa-plus-circle"> </i> </div>';
        this.surface.setContent(contact);
    };

    module.exports = ImportItemView;
});