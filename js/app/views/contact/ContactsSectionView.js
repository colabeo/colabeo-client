define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ContactItemView  = require('app/views/contact/ContactItemView');
    var Matrix           = require('famous/Matrix');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Utility = require('famous/Utility');
    var ContainerSurface = require('famous/ContainerSurface');
    var Mod              = require('famous/Modifier');

    function ContactsSection(options) {

        View.call(this);

        this.searchBarSize = 50;
        this.abcSurfaceWidth = 25;
        this.abcSurfaceHeight = 450;


        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: this.searchBarSize,
            footerSize: 0
        })

        this.searchSurface = new Surface({
            size: [undefined, this.searchBarSize],
            classes: ['contact-section'],
            content: '<form class="contact-section"><div><i class="fa fa-search fa-spin"></i>   <input type="text" class="search-contact" placeholder="Search"></div></form>',
            properties:{
                backgroundColor: 'rgba(15,15,15,0.9)',
                color: 'white',
                zIndex:2
            }
        });

        this.abcSurface = new Surface({
            size: [this.abcSurfaceWidth, this.abcSurfaceHeight],
            classes: ['abcButton'],
            properties:{
                backgroundColor: 'rgba(160,160,160,0.5)',
                zIndex:2
            }
        });

        this.abcMod = new Mod({
            transform: Matrix.translate(0,this.searchBarSize),
            origin: [1.0, 0.0]
        })

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

        this.pipe(this.scrollview);
        this._add(this.abcMod).link(this.abcSurface);
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
