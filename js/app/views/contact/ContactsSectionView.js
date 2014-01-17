define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('app/custom/Surface');
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
        this.abcSurfaceHeight = undefined;
        this.a2zString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#';


        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: this.searchBarSize,
            footerSize: 0
        })

        this.searchSurface = new Surface({
            size: [undefined, this.searchBarSize],
            classes: ['contact-section-search-bar'],
            content: '<div><i class="fa fa-search"></i>   ' +
                '<input type="text" class="search-contact" placeholder = "Search" ></div></div>',
            properties:{
                backgroundColor: 'rgba(15,15,15,0.9)',
                color: 'white',
                zIndex:2
            }
        });

        this.abcSurface = new Surface({
            size: [this.abcSurfaceWidth, this.abcSurfaceHeight],
            classes: ['abcButton'],
            content: '<button id="A">A</button><button id="B">B</button><button id="C">C</button><button id="D">D</button><button id="E">E</button><button id="F">F</button><button id="G">G</button><button id="H">H</button><button id="I">I</button><button id="J">J</button><button id="K">K</button><button id="L">L</button><button id="M">M</button><button id="N">N</button><button id="O">O</button><button id="P">P</button><button id="Q">Q</button><button id="R">R</button><button id="S">S</button><button id="T">T</button><button id="U">U</button><button id="V">V</button><button id="W">W</button><button id="X">X</button><button id="Y">Y</button><button id="Z">Z</button><button id="#">#</button>',
            properties:{
                backgroundColor: 'rgba(160,160,160,0.0)',
                zIndex:2
            }
        });

        this.abcMod = new Mod({
            origin: [1.0, 0.0]
        });

        // Set up navigation and title bar information
//        this.title = '<button class="left import-contacts">Import</button><div>All Contacts</div><button class="right add-contact"><i class="fa fa-plus"></i></button>';
        this.title = '<button class="left edit-button"></button><div>All Contacts</div><button class="right add-contact" id="add-contact"><i class="fa fa-plus" id="add-contact"></i></button>';
        this.navigation = {
            caption: 'Contacts',
            icon: '<i class="fa fa-users"></i>'
        };

        this.collection = options.collection;
        this.scrollview = new Scrollview({
            direction: Util.Direction.Y,
            margin: 10000
        });
//        Engine.pipe(this.scrollview);

        this.headerFooterLayout.id.header.link(this.searchSurface);
        this.headerFooterLayout.id.content.add(this.scrollview);
        this.headerFooterLayout.id.content.add(this.abcMod).link(this.abcSurface);

        this.pipe(this.scrollview);
        this._add(this.headerFooterLayout);

        // When Firebase returns the data switch out of the loading screen
        this.collection.on('all', function(e, model, collection, options) {
//            console.log(e);
            switch(e)
            {
                case 'remove':
                    this.curIndex = this.scrollview.getCurrentNode().index;
                    this.curPosition = this.scrollview.getPosition();
                    this.loadContacts();
                    this.scrollTo(this.curIndex,this.curPosition);
                    break;
//                    this.removeContact(options.index);
//                    break;
                case 'sync':
                    this.loadContacts();
                    break;

            }
        }.bind(this));

//        this.abcSurface.on('mousedown',onAbcTouch.bind(this));
        this.abcSurface.on('mousemove',onAbcTouch.bind(this));
//        this.abcSurface.on('mouseup',onAbcTouch.bind(this));
        this.abcSurface.on('touchstart',onAbcTouch.bind(this));
        this.abcSurface.on('touchmove',onAbcTouch.bind(this));
        this.abcSurface.on('touchend',onAbcTouch.bind(this));
//        window.addEventListener('resize', onResize.bind(this), false);

//        $('body').on('keyup', '.search-contact', function(e){
//            this.loadContacts(e.target.value);
//        }.bind(this));

        this.searchSurface.on('keyup', function(e){
            this.loadContacts(e.target.value);
        }.bind(this));

        function onAbcTouch(e) {
            if (!this.abcButtons) this.abcButtons = $('.abcButton button');
//            var index = Math.floor(27*(e.y-$('.abcButton').position().top)/(this.abcButtons.length*this.abcButtons.height()));
            var index = this.abcButtons.indexOf(e.target);
            index = this.a2zIndexArray[index];
            if (index == undefined || index == this.curAbcIndex) return;
            this.curAbcIndex = index;
            this.scrollTo(index);
        }

        function onResize(e) {
            console.log('resize');
            this.loadContacts();
        }

    }

    ContactsSection.prototype = Object.create(View.prototype);
    ContactsSection.prototype.constructor = ContactsSection;

    ContactsSection.prototype.scrollTo = function(index, position) {
        if (index<0) return;
        this.scrollview.setVelocity(0);
        this.scrollview.node.index = index;
        if (!position) position = 0;
        this.scrollview.setPosition(position);
    };

    ContactsSection.prototype.loadContacts = function(searchKey) {
        if (searchKey) this.currentCollection = this.collection.searchContact(searchKey.toUpperCase());
        else this.currentCollection = this.collection;
        this.firstChar = undefined;
        this.a2zIndexArray = [0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
        this.currentCollection;

        var sequence = this.currentCollection.map(function(item) {
            return this.getIndex(item);
        }.bind(this));

        while (this.a2zIndexArray.indexOf(-1) != -1){
            this.a2zIndexArray[this.a2zIndexArray.indexOf(-1)]=this.a2zIndexArray[this.a2zIndexArray.indexOf(-1)-1];
        };
        
        // added empty item
        // media access bar messed up the height so add 40

        var lastGroupIndex = _.last(this.a2zIndexArray);
        var extraHeight = this.scrollview.getSize()[1] + 40;
        for (var i = lastGroupIndex; i<sequence.length; i++) {
            extraHeight -= sequence[i].getSize()[1];
        }

        if (extraHeight > 0) {
            var emptySurface = new Surface({
                size: [undefined, extraHeight]
            })
            emptySurface.pipe(this.eventOutput);
            sequence.push(emptySurface);
        }

        this.scrollview.sequenceFrom(sequence);
    };

    ContactsSection.prototype.removeContact = function(index) {
        if (this.scrollview.node) {
            var removedNode = this.scrollview.node.array[index];
            removedNode.collapse(function() {
                this.scrollview.node.splice(index,1);
            }.bind(this));
        }
    };

    ContactsSection.prototype.getCurrentIndex = function (item){
        var index = this.currentCollection.indexOf(item);
        this.a2zIndexArray[this.a2zString.indexOf(this.firstChar)] = index;
    };

    ContactsSection.prototype.getIndex = function (item){
        var isFirst = false;
        if (!/^[a-zA-Z]+$/.test(item.get('lastname')[0])){
            if (this.firstChar != "#"){
                this.firstChar = "#";
                isFirst = "#";
                this.getCurrentIndex(item);
            }
        }
        else if (item.get('lastname') && this.firstChar != item.get('lastname')[0].toUpperCase()) {
            this.firstChar = item.get('lastname')[0].toUpperCase();
            isFirst = this.firstChar;
            this.getCurrentIndex(item);
        }
        var surface = new ContactItemView({model: item}, isFirst);
        surface.pipe(this.eventOutput);
        return surface;
    };

    module.exports = ContactsSection;
});
