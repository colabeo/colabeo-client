// import famous modules
var View               = require('famous/view');
var HeaderFooterLayout = require('famous/views/header-footer-layout');
var Utility            = require('famous/utilities/utility');
var Modifier           = require('famous/modifier');
var GenericSync        = require('famous/input/generic-sync');
var Surface            = require('famous/surface');
var Easing = require('famous/transitions/easing');

// import custom modules
var TouchSync          = require('custom-touch-sync');
var Templates          = require('templates');
var Transform = require('famous/transform');

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

    window.ccc = this;

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
    this.LayoutMod = new Modifier();

    this.searchSurface = new Surface({
        size: [undefined, this.searchBarSize],
        classes: ['contact-section-search-bar'],
        content: '<div><i class="fa fa-search"></i>   ' +
            '<input type="text" class="search-contact" placeholder = "Search" ><span class="cancel">cancel</span></input></div></div>',
        properties:{
            backgroundColor: 'rgba(15,15,15,0.9)',
            color: 'white',
            zIndex: 10
        }
    });
    this.searchSurfaceMod = new Modifier({
        transform:Transform.translate(0,0,3)
    });
    this.searhBarTransition = {
//        'curve' : Easing.linearNorm,
        'duration' : 300
    };
    this.searchMode = false;

    this.abcSurface = new Surface({
        size: [this.abcSurfaceWidth, this.abcSurfaceHeight],
        classes: ['abcButton'],
        content: '<button id="A">A</button><button id="B">B</button><button id="C">C</button><button id="D">D</button><button id="E">E</button><button id="F">F</button><button id="G">G</button><button id="H">H</button><button id="I">I</button><button id="J">J</button><button id="K">K</button><button id="L">L</button><button id="M">M</button><button id="N">N</button><button id="O">O</button><button id="P">P</button><button id="Q">Q</button><button id="R">R</button><button id="S">S</button><button id="T">T</button><button id="U">U</button><button id="V">V</button><button id="W">W</button><button id="X">X</button><button id="Y">Y</button><button id="Z">Z</button><button id="#">#</button>',
        properties:{
            backgroundColor: 'rgba(160,160,160,0.0)',
            zIndex:2
        }
    });
    this.eventInput.pipe(this.searchSurface);
    this.abcMod = new Modifier({
        origin: [1.0, 0.0],
        transform: Transform.translate(0,0,10)
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

    this.headerFooterLayout.id.header.add(this.searchSurfaceMod).add(this.searchSurface);
    this.headerFooterLayout.id.content.add(this.scrollview);
    this.headerFooterLayout.id.content.add(this.abcMod).add(this.abcSurface);

    this.pipe(this.scrollview);
    this._add(this.LayoutMod).add(this.headerFooterLayout);
};

ContactsSection.prototype.scrollTo = function(index, position) {
    if (index<0) return;
    this.scrollview.setVelocity(0);
    this.scrollview.node.index = index;
    if (!position) position = 0;
    this.scrollview.setPosition(position);
};

ContactsSection.prototype.setupHeaderSurfaces = function() {
    return _.map(this.a2zString, function(i){
        var headerSurface = new HeaderView({
            content: Templates.headerItemView(i,0,0),
            header: i,
            collection: this.collection
        });
        headerSurface.pipe(this.scrollview);
        return headerSurface;
    }.bind(this));
};



ContactsSection.prototype.refreshContacts = function(searchKey) {
    $('body').removeClass('editing');

    if (this.searchMode == true) {
        this.abcSurface.setContent('');
        this.currentSequence = [];
        if (searchKey == undefined || searchKey == '') {
            this.scrollview.sequenceFrom(this.currentSequence);
            return
        }
        this.currentCollection = this.collection.searchContact(searchKey.toUpperCase());
    } else {
        this.currentCollection = this.collection.models;
        this.currentSequence = _.clone(this.headerSequence);
        this.abcSurface.setContent(Templates.abcButtons());
    }

    this.currentContactsSequence = _.map(this.currentCollection, function(item){
        return this.contactSequence[item.collection.indexOf(item)];
    }.bind(this));

    this.firstChar = undefined;
    this.a2zIndexArray = [0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];


    for (var ii=0; ii<this.currentContactsSequence.length; ii++){
        var isFirst = false;
        var initialChar = this.getInitialChar(this.currentContactsSequence[ii].model);
        if (this.firstChar != initialChar) {
            this.firstChar = initialChar;
            isFirst = this.firstChar
        }
        var currIndex = this.getCurrentIndex(this.currentContactsSequence[ii], ii, isFirst);
        this.currentSequence.splice(currIndex,0,this.currentContactsSequence[ii]);
    }

    while (this.a2zIndexArray.indexOf(-1) != -1){
        this.a2zIndexArray[this.a2zIndexArray.indexOf(-1)]=this.a2zIndexArray[this.a2zIndexArray.indexOf(-1)-1];
    }

    // added empty item
    // media access bar messed up the height so add 40
//
//    var lastGroupIndex = _.last(this.a2zIndexArray);
//    var extraHeight = this.scrollview.getSize()[1] + 40;
//    for (var i = lastGroupIndex; i<this.sequence.length; i++) {
//        extraHeight -= this.sequence[i].getSize()[1];
//    }
//
//    if (extraHeight > 0) {
//        var emptySurface = new Surface({
//            size: [undefined, extraHeight]
//        });
//        this.sequence.push(emptySurface);
//        emptySurface.pipe(this.eventOutput);
//
//        if (this.collection.length == 0) {
//            var firstAdd = '<div class="firstAdd"><div> <i class="fa fa-plus fa-5x" ></i> </div> <div> Your contact list is empty,</div><div> Please add your first contact</div></div>';
//            emptySurface.setContent(firstAdd);
//            emptySurface.on('click',function(e){
//                if ($(e.target).hasClass('fa-plus'))
//                    this.eventOutput.emit('editContact');
//            }.bind(this))
//        } else if (this.currentCollection.length == 0) {
//            var noMatch = '<div class="no-match-found"><div> No match found</div></div>';
//            emptySurface.setContent(noMatch);
//        }
//    }

    this.scrollview.sequenceFrom(this.currentSequence);
};

ContactsSection.prototype.initContacts = function() {

    this.headerSequence = this.setupHeaderSurfaces();
    this.contactSequence = this.collection.map(function(item){
        return this.createItem(item);
    }.bind(this));
    this.refreshContacts();
};

ContactsSection.prototype.getCurrentIndex = function (item, index, isFirst){
    console.log(item.model.get('lastname'),this.currentContactsSequence.indexOf(item),this.a2zString.indexOf(this.firstChar));
    var value = this.currentContactsSequence.indexOf(item)+this.a2zString.indexOf(this.firstChar)+1;
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

ContactsSection.prototype.createItem = function (item){
    var surface = new ContactItemView({model: item});
    surface.pipe(this.eventOutput);
    this.eventInput.pipe(surface);
    return surface;
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
        console.log(e, model, collection, options);
        switch(e)
        {
            case 'change':
                this.changeItem(model);
                break;
            case 'remove':
                this.removeItemByIndex(model, options.index);
                this.reIndex(model);
                break;
//            case 'change':
            case 'add':
                if (this.noInit == true){
                    console.log('adddd')
                    this.addItemByIndex(model);
                }
                break;
            case 'sync':
                if (!this.noInit){
                    this.noInit = true;
                    console.log('dsfdsfdfsdf')
                    this.initContacts();
                }
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

ContactsSection.prototype.addItemByIndex = function(item) {
    var indexInCollection = this.collection.indexOf(item)
    var indexInScrollview = this.getIndexInScrollview(item, indexInCollection);
    var newContact = this.createItem(item);
    this.collection.models.map(function(i){console.log(i.attributes.lastname)})
    this.contactSequence.splice(this.collection.indexOf(item),0,newContact);
    this.refreshContacts();
};

ContactsSection.prototype.changeItem = function(item) {
    var newContact = this.createItem(item);
//    var OldIndex =
//    this.contactSequence.splice(OldIndex,1);
    this.contactSequence.splice(this.collection.indexOf(item),1,newContact);
    this.refreshContacts();

};

ContactsSection.prototype.searchSurfaceEvents = function() {
    this.searchSurface.on('click', function(e){
        console.log(e);
        if (e.target.className == 'search-contact') {
            this.eventInput.emit('searchOnFocus');
        }
        else if  (e.target.className == 'cancel') {
            e.currentTarget.children[0].children[1].value = '';
            this.eventInput.emit('searchOnBlur');
            this.refreshContacts('');
        }
    }.bind(this));

    this.eventInput.on('searchOnFocus', this.searchOnFocus.bind(this));
    this.eventInput.on('searchOnBlur', this.searchOnBlur.bind(this));
    this.searchSurface.on('keyup', function(e){
        this.refreshContacts(e.target.value);
    }.bind(this));
};

ContactsSection.prototype.getInitialChar = function(item){
    if (item.get('lastname') != undefined && item.get('lastname') != '') {
        return isEnglish(item.get('lastname')) ? item.get('lastname')[0].toUpperCase() : '#';
    } else {
        return '#';
    }

    function isEnglish (words){
        return /^[a-zA-Z]+$/.test(words[0])
    }
};

ContactsSection.prototype.searchOnFocus = function(){
    this.searchMode =true;
    this.scrollview.scrollTo(0,0);
    this.refreshContacts();
    this.LayoutMod.setTransform(Transform.translate(0,-50,0), this.searhBarTransition);
    this.searchSurface._currTarget.children[0].children[2].style.opacity = 1;
    this.searchSurface._currTarget.style.paddingRight = "100px";
};
ContactsSection.prototype.searchOnBlur = function(){
    this.searchMode = false;
    this.LayoutMod.setTransform(Transform.translate(0,0,0), this.searhBarTransition)
    this.searchSurface._currTarget.children[0].children[2].style.opacity = 0;
    this.searchSurface._currTarget.style.paddingRight = "10px";
};
ContactsSection.prototype.filterContactSequence = function(searchKey){
    if (this.searchMode == true) {
        this.abcSurface.setContent('');
        this.currentSequence = [];
        this.currentCollection = this.collection.searchContact(searchKey.toUpperCase());
    } else {
        this.abcSurface.setContent(Templates.abcButtons());
        this.currentSequence = _.clone(this.headerSequence);
        this.currentCollection = this.collection.models;
    }

    this.currentContactsSequence = _.map(this.currentCollection, function(item){
        return this.contactSequence[item.collection.indexOf(item)];
    }.bind(this));

    this.currentSequence = this.currentSequence.concat(this.currentContactsSequence)
};

ContactsSection.prototype.sortByLastname = function(){
    this.currentSequence = _.sortBy(this.currentSequence, sortByLastname);
    this.scrollview.sequenceFrom(this.currentSequence);
};

ContactsSection.prototype.sortByFirstname = function(){
    this.currentSequence = _.sortBy(this.currentSequence, sortByFirstname);
    this.scrollview.sequenceFrom(this.currentSequence);
};

function sortByLastname(item){
    var l, f, h;
    l = f = h = '';
    if (item.model) l = item.model.get('lastname');
    if (item.model) f = item.model.get('firstname');
    if (item.options && item.options.header) h = item.options.header;
    var str = h + l + ' ' + f;
    if (!/^[a-zA-Z]+$/.test(str[0]))
        str = "zzzz" + str;
    return str.toUpperCase();
}

function sortByLastname(item){
    var l, f, h;
    l = f = h = '';
    if (item.model) l = item.model.get('lastname');
    if (item.model) f = item.model.get('firstname');
    if (item.options && item.options.header) h = item.options.header;
    var str = h + l + ' ' + f;
    if (!/^[a-zA-Z]+$/.test(str[0]))
        str = "zzzz" + str;
    return str.toUpperCase();
}

function sortByFirstname(item){
    var l, f, h;
    l = f = h = '';
    if (item.model) l = item.model.get('lastname');
    if (item.model) f = item.model.get('firstname');
    if (item.options && item.options.header) h = item.options.header;
    var str = h + f + ' ' + l;
    if (!/^[a-zA-Z]+$/.test(str[0]))
        str = "zzzz" + str;
    return str.toUpperCase();
}



module.exports = ContactsSection;



//A a1 B b1 C c1 D d1 E e1    b1->d2
//A a1 B C c1 D d1 d2 E e1