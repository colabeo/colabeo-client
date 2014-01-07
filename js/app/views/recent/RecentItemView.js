define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Contact      = require('app/models/Contact');
    var Templates    = require('app/custom/Templates');
    var TimeAgo        = require('famous-utils/TimeAgo');
    var Mod              = require("famous/Modifier");
    var FM               = require("famous/Matrix");

    // Import app specific dependencies

    function RecentItemView(options) {
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

//        // Bind click event to load new tweet
        this.surface.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("delete-button")) {
                this.model.destroy();
            }
            else {
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

        this.model.on('all', function(e) {
            switch(e)
            {
                case 'change':
//                    console.log(e);
                    this.template();
                    break;

            }
        }.bind(this));
    }

    RecentItemView.prototype = Object.create(View.prototype);
    RecentItemView.prototype.constructor = RecentItemView;

    RecentItemView.prototype.template = function() {
        var name;
        if (this.model.get('firstname') && this.model.get('lastname')) {
            name = this.model.get('firstname') + " <b>" + this.model.get('lastname') + "</b>";
        } else {
            name = this.model.get('email');
        }
        var icon = ''; //'<i class="fa fa-sign-in"></i>';
        var missed = '';
        if (this.model.get('type') == 'outgoing')
            icon = '<i class="fa fa-sign-out"></i>';
        else {
            if (!this.model.get('success'))
                missed = "missed";
        }
        var contact = '<div class="source '+missed+'"><div class="call-type">'+icon+'</div>' + name;
        contact += '<div class="call-time">' + TimeAgo.parse(this.model.get('time')) + ' ago</div></div>';
        contact = Templates.deleteButton() + contact;
        this.surface.setContent(contact);
    };

    RecentItemView.prototype.collapse = function(callback) {
        this.mod.setOpacity(0,{duration:600}, callback);
    };

    RecentItemView.prototype.getSize = function() {
        var sh = this.mod.opacityState.get();
        var size = this.surface.getSize();
        size[1] = Math.floor(size[1]*sh);
        return size;
    };

    module.exports = RecentItemView;
});