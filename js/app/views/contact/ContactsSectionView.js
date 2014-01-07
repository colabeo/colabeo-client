define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ContactItemView  = require('app/views/contact/ContactItemView');
    var Matrix           = require('famous/Matrix');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Utility          = require('famous/Utility');
    var ContainerSurface = require('famous/ContainerSurface');
    var Mod              = require('famous/Modifier');

    function ContactsSection(options) {

        View.call(this);

        this.searchBarSize = 50;
        this.abcSurfaceWidth = 30;
        this.abcSurfaceHeight = 450;
        this.curIndex = 0;


        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: this.searchBarSize,
            footerSize: 0
        })

        this.searchSurface = new Surface({
            size: [undefined, this.searchBarSize],
            classes: ['contact-section-search-bar'],
            content: '<form class="contact-section-search-bar"><div class="search"><i class="fa fa-search"></i>   <input type="text" class="search-contact" placeholder="Search"></div></form>',
            properties:{
                backgroundColor: 'rgba(15,15,15,0.9)',
                color: 'white',
                zIndex:2
            }
        });

        this.abcSurface = new Surface({
            size: [this.abcSurfaceWidth, this.abcSurfaceHeight],
            classes: ['abcButton'],
            content: '<button id="A">A</button><button id="B">B</button><button id="C">C</button><button id="D">D</button><button id="E">E</button><button id="F">F</button><button id="G">G</button><button id="H">H</button><button id="I">I</button><button id="J">J</button><button id="K">K</button><button id="L">L</button><button id="M">M</button><button id="N">N</button><button id="O">O</button><button id="button">P</button><button id="Q">Q</button><button id="R">R</button><button id="S">S</button><button id="T">T</button><button id="U">U</button><button id="V">V</button><button id="W">W</button><button id="X">X</button><button id="Y">Y</button><button id="Z">Z</button><button id="Num">#</button>',
            properties:{
                backgroundColor: 'rgba(160,160,160,0.0)',
                zIndex:2
            }
        });

        this.abcMod = new Mod({
            transform: Matrix.translate(0,this.searchBarSize),
            origin: [1.0, 0.0]
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

        this.pipe(this.scrollview);
        this._add(this.abcMod).link(this.abcSurface);
        this._add(this.headerFooterLayout);

        // When Firebase returns the data switch out of the loading screen
        this.collection.on('all', function(e, model, collection, options) {
//            console.log(e);
            switch(e)
            {
                case 'remove':
//                    this.removeContact(options.index);
//                    break;
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
//        if (this.scrollview.node) this.curIndex = this.scrollview.node.index;
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
//        if (this.scrollview.node) this.scrollview.node.index = this.curIndex;
    };

    ContactsSection.prototype.removeContact = function(index) {
        if (this.scrollview.node) {
            var removedNode = this.scrollview.node.array[index];
            removedNode.collapse(function() {
                this.scrollview.node.splice(index,1);
            }.bind(this));
        }
    };

    module.exports = ContactsSection;
});
