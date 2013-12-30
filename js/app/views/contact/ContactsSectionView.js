define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ContactItemView  = require('app/views/contact/ContactItemView');

    function ContactsSection(options) {

        View.call(this);

        // Set up navigation and title bar information
//        this.title = '<button class="left import-contacts">Import</button><div>All Contacts</div><button class="right add-contact"><i class="fa fa-plus"></i></button>';
        this.title = '<button class="left edit-button"></button><div>All Contacts</div><button class="right add-contact"><i class="fa fa-plus"></i></button>';
        this.navigation = {
            caption: 'Contacts',
            icon: '<i class="fa fa-users"></i>'
        };

        this.collection = options.collection;
        this.scrollview = new Scrollview({
            direction: Util.Direction.Y,
            margin: 10000
        });
        this.pipe(this.scrollview);
        this._link(this.scrollview);

        // When Firebase returns the data switch out of the loading screen
        this.collection.on('all', function(e) {
//            console.log(e);
            switch(e)
            {
                case 'remove':
                case 'sync':
                    this.loadContacts();
                    break;

            }
        }.bind(this));

    }

    ContactsSection.prototype = Object.create(View.prototype);
    ContactsSection.prototype.constructor = ContactsSection;

    ContactsSection.prototype.loadContacts = function() {
        var firstChar;
        this.scrollview.sequenceFrom(this.collection.map(function(item) {
            var isFirst = false;
            if (item.get('lastname') && firstChar != item.get('lastname')[0].toUpperCase()) {
                firstChar = item.get('lastname')[0].toUpperCase();
                isFirst = firstChar;
            }
            var surface = new ContactItemView({model: item}, isFirst);
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this)));
    }

    module.exports = ContactsSection;
});
