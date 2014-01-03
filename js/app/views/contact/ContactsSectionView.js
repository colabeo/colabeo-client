define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ContactItemView  = require('app/views/contact/ContactItemView');
    var LightBox         = require('app/custom/LightBox');
    var Matrix           = require('famous/Matrix');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Utility = require('famous/Utility');
    var ContainerSurface = require('famous/ContainerSurface');

    function ContactsSection(options) {

        View.call(this);

        this.searchBarSize = 30;

        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: 30,
            footerSize: 0
        })

        this.abcLightBox = new LightBox({
            showTransform: Matrix.translate(-1,this.searchBarSize,0),
            showOrigin: [1.0, 0.0],
            inTransition: false
        })

        this.searchSurface = new Surface({
            size: [undefined, this.searchBarSize],
            classes: ['searchButton'],
            properties:{
                backgroundColor: 'red',
                zIndex:2
            }
        });

        this.abcSurface = new Surface({
            size: [20, window.innerHeight-102-this.searchBarSize],
            classes: ['abcButton'],
            properties:{
                backgroundColor: 'blue',
                zIndex:2
            }
        });

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

        this.headerFooterLayout.id.header.link(this.searchSurface);
        this.headerFooterLayout.id.content.link(this.scrollview);

        this.abcLightBox.show(this.abcSurface);
        this.pipe(this.scrollview);
        this._add(this.abcLightBox);
        this._add(this.headerFooterLayout);

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
