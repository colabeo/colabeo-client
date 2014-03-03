// import famous modules
var View               = require('famous/view');
var HeaderFooterLayout = require('famous/views/header-footer-layout');
var Utility            = require('famous/utilities/utility');
var Modifier           = require('famous/modifier');
var GenericSync        = require('famous/input/generic-sync');
var Surface            = require('famous/surface');

// import custom modules
var TouchSync          = require('custom-touch-sync');
var Templates          = require('templates');

// import views
var VerticalScrollView       = require('vertical-scroll-view');
var ContactItemView    = require('contact-item-view');
var RowView   = require('row-view');
var HeaderView = RowView.HeaderView;

function ContactsSection(options) {

    View.call(this);

    this.searchBarSize = 50;
    this.abcSurfaceWidth = 30;
    this.abcSurfaceHeight = undefined;
    this.a2zString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#';

    this.setupLayout(options);
    this.collectionEvents();
    this.abcSurfaceEvents();
    this.searchSurfaceEvents();
}

ContactsSection.prototype = Object.create(View.prototype);
ContactsSection.prototype.constructor = ContactsSection;

ContactsSection.prototype.setupLayout = function(options) {
    this.headerFooterLayout = new HeaderFooterLayout({
        headerSize: this.searchBarSize,
        footerSize: 0
    });

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

    this.abcMod = new Modifier({
        origin: [1.0, 0.0]
    });

    this.title = '<button class="left edit-button" id="contact-edit-contact"></button><div>All Contacts</div><button class="right add-contact" id="add-contact"><i class="fa fa-plus" id="add-contact"></i></button>';
    this.navigation = {
        caption: 'Contacts',
        icon: '<i class="fa fa-users"></i>'
    };

    this.collection = options.collection;
    this.scrollview = new VerticalScrollView({
        direction: Utility.Direction.Y,
        margin: 10000

    });

    this.headerFooterLayout.id.header.link(this.searchSurface);
    this.headerFooterLayout.id.content.add(this.scrollview);
    this.headerFooterLayout.id.content.add(this.abcMod).link(this.abcSurface);

    this.pipe(this.scrollview);
    this._add(this.headerFooterLayout);
};

ContactsSection.prototype.scrollTo = function(index, position) {
    if (index<0) return;
    this.scrollview.setVelocity(0);
    this.scrollview.node.index = index;
    if (!position) position = 0;
    this.scrollview.setPosition(position);
};

ContactsSection.prototype.setupHeaderSurfaces = function() {
    this.headerSequence = _.map(this.a2zString, function(i){
        var headerSurface = new HeaderView({
            content: Templates.headerItemView(i,0,0),
            header: i,
            collection: this.collection
        });
        headerSurface.pipe(this.scrollview);
        return headerSurface;
    }.bind(this));
};

ContactsSection.prototype.loadContacts = function(searchKey) {
    $('body').removeClass('editing');

    this.headerSequence = [];
    if (searchKey) this.currentCollection = this.collection.searchContact(searchKey.toUpperCase());
    else this.currentCollection = this.collection.models;
    if (searchKey == undefined || searchKey =='') this.setupHeaderSurfaces();

    this.firstChar = undefined;
    this.a2zIndexArray = [0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];

    this.sequence = this.headerSequence;
    for (var ii=0; ii<this.currentCollection.length;ii++){
        var surface = this.createItem(this.currentCollection[ii], ii);
        this.sequence.splice(surface[1],0,surface[0]);
    }

    while (this.a2zIndexArray.indexOf(-1) != -1){
        this.a2zIndexArray[this.a2zIndexArray.indexOf(-1)]=this.a2zIndexArray[this.a2zIndexArray.indexOf(-1)-1];
    }

    // added empty item
    // media access bar messed up the height so add 40

    var lastGroupIndex = _.last(this.a2zIndexArray);
    var extraHeight = this.scrollview.getSize()[1] + 40;
    for (var i = lastGroupIndex; i<this.sequence.length; i++) {
        extraHeight -= this.sequence[i].getSize()[1];
    }

    if (extraHeight > 0) {
        var emptySurface = new Surface({
            size: [undefined, extraHeight]
        });
        this.sequence.push(emptySurface);
        emptySurface.pipe(this.eventOutput);

        if (this.collection.length == 0) {
            var firstAdd = '<div class="firstAdd"><div> <i class="fa fa-plus fa-5x" ></i> </div> <div> Your contact list is empty,</div><div> Please add your first contact</div></div>';
            emptySurface.setContent(firstAdd);
            emptySurface.on('click',function(e){
                if ($(e.target).hasClass('fa-plus'))
                    this.eventOutput.emit('editContact');
            }.bind(this))
        } else if (this.currentCollection.length == 0) {
            var noMatch = '<div class="no-match-found"><div> No match found</div></div>';
            emptySurface.setContent(noMatch);
        }
    }

    this.scrollview.sequenceFrom(this.sequence);
};

ContactsSection.prototype.getCurrentIndex = function (item, index, isFirst){
    var value = this.currentCollection.indexOf(item)+this.a2zString.indexOf(this.firstChar)+1;
    if (isFirst) this.a2zIndexArray[this.a2zString.indexOf(this.firstChar)] = value - 1;
    return value;
};

ContactsSection.prototype.reIndex = function (item){
    var firstChar = this.getInitialChar(item);
    var index = this.a2zString.indexOf(firstChar);
    for (var i = index+1; i<this.a2zIndexArray.length; i++){
        this.a2zIndexArray[i] = this.a2zIndexArray[i] - 1
    }
};

ContactsSection.prototype.getIndexInScrollview = function (item, index){
    return index + this.a2zString.indexOf(this.getInitialChar(item)) + 1;
};

ContactsSection.prototype.createItem = function (item, index){
    var isFirst = false;
    var initialChar = this.getInitialChar(item);
    if (this.firstChar != initialChar) {
        this.firstChar = initialChar;
        isFirst = this.firstChar
    }

    var currIndex = this.getCurrentIndex(item, index, isFirst);

    var surface = new ContactItemView({model: item}, isFirst);
    surface.pipe(this.eventOutput);
    this.eventInput.pipe(surface);
    return [surface, currIndex];
};

ContactsSection.prototype.onAbcTouch = function(e) {
    if (!this.abcButtons) this.abcButtons = $('.abcButton button');
//            var index = Math.floor(27*(e.y-$('.abcButton').position().top)/(this.abcButtons.length*this.abcButtons.height()));
    var index = this.abcButtons.indexOf(e.target);
    index = this.a2zIndexArray[index];
    if (index == undefined || index == this.curAbcIndex) return;
    this.curAbcIndex = index;
    this.scrollTo(index);
};

ContactsSection.prototype.collectionEvents = function() {
    // When Firebase returns the data switch out of the loading screen
    this.collection.on('all', function(e, model, collection, options) {
    //            console.log(e);
        switch(e)
        {
            case 'remove':
                this.removeItemByIndex(model, options.index);
                this.reIndex(model);
                break;
            case 'sync':
                this.loadContacts();
                break;

        }
    }.bind(this));
};

ContactsSection.prototype.abcSurfaceEvents = function() {
    // abc-bar effect for laptop
    this.abcSurface.on('mousemove', function(e){
        this.onAbcTouch(e);
    }.bind(this));
    // abc-bar effect for cellphone
    var mousePosition = [0,0];
    var sync = new GenericSync(function(){
        return mousePosition;
    },{
        syncClasses:[TouchSync]
    });
    this.abcSurface.pipe(sync);
    sync.on('update',function(data){
        var target = document.elementFromPoint(data.ap[0], data.ap[1]);
        if (target.id == undefined || target.id =='' ) return;
        var index = this.a2zString.indexOf(target.id);
        index = this.a2zIndexArray[index];
        if (index == undefined || index == this.curAbcIndex) return;
        this.curAbcIndex = index;
        this.scrollTo(index);
    }.bind(this));
};

ContactsSection.prototype.removeItemByIndex = function(item, index) {
    var indexInScrollview = this.getIndexInScrollview(item,index);
    this.scrollview.removeByIndex(indexInScrollview);
};

ContactsSection.prototype.searchSurfaceEvents = function() {
    this.searchSurface.on('keyup', function(e){
        this.loadContacts(e.target.value);
    }.bind(this));
};

ContactsSection.prototype.getInitialChar = function(item){
    if (item.get('lastname')) {
        return isEnglish(item.get('lastname')) ? item.get('lastname')[0].toUpperCase() : '#';
    } else if (item.get('firstname')){
        return isEnglish(item.get('firstname')) ? item.get('firstname')[0].toUpperCase() : '#';
    } else {
        return isEnglish(item.get('email')) ? item.get('email')[0].toUpperCase() : '#';
    }

    function isEnglish (words){
        return /^[a-zA-Z]+$/.test(words[0])
    }
};

module.exports = ContactsSection;
