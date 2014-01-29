define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Contact      = require('app/models/Contact');
    var Templates    = require('app/custom/Templates');
    var Mod              = require("famous/Modifier");
    var FM               = require("famous/Matrix");

    // Import app specific dependencies

    function FavoriteItemView(options) {
        View.call(this);

        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.surface = new Surface({
            classes: ['contact-item', 'editable'],
            size: [undefined, 51]
        });

        // Bind click event to load new tweet
        this.surface.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("delete-button")) {
                this.model.toggleFavorite();
            }
            else {
                if ($('body').hasClass('editing'))
                    this.eventOutput.emit('editContact', this.model);
                else
                    this.eventOutput.emit('outgoingCall', this.model);
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

    FavoriteItemView.prototype = Object.create(View.prototype);
    FavoriteItemView.prototype.constructor = FavoriteItemView;

    FavoriteItemView.prototype.template = function() {
        var name;
        var initial = "";
        if (this.model.get('firstname') || this.model.get('lastname')) {
            name = this.model.get('firstname') + " <b>" + this.model.get('lastname') + "</b>";
            if (this.model.get('firstname')) initial = this.model.get('firstname')[0];
            if (this.model.get('lastname')) initial +=  this.model.get('lastname')[0];
        } else {
            name = this.model.get('email');
            if (name) initial = name[0];
        }
        var contact = '<div class="source"><div class="initial">'+initial+'</div>' + name + '</div>';
        contact = Templates.deleteButton() + contact;
        this.surface.setContent(contact);
    };

    FavoriteItemView.prototype.collapse = function(callback) {
        this.mod.setOpacity(0,{duration:600}, callback);
    };

    FavoriteItemView.prototype.getSize = function() {
        var sh = this.mod.opacityState.get();
        var size = this.surface.getSize();
        size[1] = Math.floor(size[1]*sh);
        return size;
    };

    module.exports = FavoriteItemView;
});