// import famous modules
var View         = require('famous/view');
var Surface      = require('famous/surface');
var EventHandler = require('famous/event-handler');
var Modifier     = require("famous/modifier");

var Templates    = require('templates');

// Import app specific dependencies

function ContactItemView(options, isFirst) {
    View.call(this);

    this.model = options.model;

    // Set up event handlers
    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    var height = 51;
    if (isFirst) height = 77;
    this.surface = new Surface({
        classes: ['contact-item', 'editable'],
        size: [undefined, height]
    });

//        // Bind click event to load new tweet
    this.surface.on('click', function(e) {
        var target = $(e.target);
        if (target.hasClass("delete-button")) {
            this.model.collection.remove(this.model);
        }
        else if (target.hasClass("favorite-button")) {
            this.model.toggleFavorite();
        }
        else if (target.hasClass("first-char")) {

        }
        else {
            if ($('body').hasClass('editing'))
                this.eventOutput.emit('editContact', this.model);
            else
                this.eventOutput.emit('outgoingCall', this.model);
        }
    }.bind(this));

    this.template(isFirst);

    this.surface.pipe(this.eventOutput);

    this.mod = new Modifier({
        transform: undefined
    });
    this._link(this.mod);
    this._link(this.surface);

    this.model.on('all', function(e) {
        switch(e)
        {
            case 'change:favorite':
                $(this.surface._currTarget).find('.favorite-button').toggleClass('active');
                break;

        }
    }.bind(this));
}

ContactItemView.prototype = Object.create(View.prototype);
ContactItemView.prototype.constructor = ContactItemView;

ContactItemView.prototype.template = function(isFirst) {
//        console.log(this.model);
    var name;
    var initial;
    if (this.model.get('firstname') || this.model.get('lastname')) {
        name = this.model.get('firstname') + " <b>" + this.model.get('lastname') + "</b>";
        initial = this.model.get('firstname')[0] + this.model.get('lastname')[0];
    } else {
        name = this.model.get('email');
    }
    var contact = '<div class="source">' + name;
    contact = Templates.deleteButton() + Templates.favoriteButton(this.model.get('favorite')) + contact;
    if (isFirst) contact = '<div class="first-char">' + isFirst + '</div>' + contact;
    if (this.model.attributes.email) contact = contact + '<i class="fa fa-envelope contact-icon"></i>';
    if (this.model.attributes.facebook) contact = contact + '<i class="fa fa-facebook-square contact-icon"></i>';
    if (this.model.attributes.google) contact = contact + '<i class="fa fa-google-plus-square contact-icon"></i>';
    contact += '</div>';

    this.surface.setContent(contact);
};

//    ContactItemView.prototype.collapse = function(callback) {
//        this.mod.setOpacity(0,{duration:600}, callback);
//    };
//
//    ContactItemView.prototype.getSize = function() {
//        var sh = this.mod.opacityState.get();
//        var size = this.surface.getSize();
//        size[1] = Math.floor(size[1]*sh);
//        return size;
//    };

module.exports = ContactItemView;
