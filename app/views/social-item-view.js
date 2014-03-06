// Import core Famous dependencies
var View         = require('famous/view');
var Surface      = require('famous/surface');
var EventHandler = require('famous/event-handler');
var Modifier     = require("famous/modifier");

function SocialItemView(options, isFirst) {
    View.call(this);

    this.model = options.model;

    // Set up event handlers
    // this.eventInput = new EventHandler();
    // EventHandler.setInputHandler(this, this.eventInput);
    // this.eventOutput = new EventHandler();
    // EventHandler.setOutputHandler(this, this.eventOutput);

    var height = 51;
    if (isFirst) height = 77;

    this.surface = new Surface({
        classes: ['import-item', 'editable'],
        size: [undefined, height]
    });

//        // Bind click event to load new tweet
    this.surface.on('click', function(e) {
        var target = $(e.target);
        if (target.hasClass("import-source")) {
            this._eventOutput.emit('goBack', this.model);
        }
    }.bind(this));

    this.template(isFirst);

    this.surface.pipe(this._eventOutput);

    this.mod = new Modifier({
        transform: undefined
    });
    this._add(this.mod);
    this._add(this.surface);
}

SocialItemView.prototype = Object.create(View.prototype);
SocialItemView.prototype.constructor = SocialItemView;

SocialItemView.prototype.template = function(isFirst) {
    var name;
    var initial;
    if (this.model.get('firstname') || this.model.get('lastname')) {
        name = this.model.get('firstname') + " <b class='import-source'>" + this.model.get('lastname') + "</b>";
        initial = this.model.get('firstname')[0] + this.model.get('lastname')[0];
    } else {
        name = this.model.get('email');
    }
    var contact = '<div class="import-source">' + name + '</div>';
    if (isFirst) contact = '<div class="first-char">' + isFirst + '</div>' + contact;
    this.surface.setContent(contact);
};

module.exports = SocialItemView;
