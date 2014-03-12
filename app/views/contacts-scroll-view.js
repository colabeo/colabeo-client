// import famous modules
var View               = require('famous/view');
var HeaderFooterLayout = require('famous/views/header-footer-layout');
var Utility            = require('famous/utilities/utility');
var Modifier           = require('famous/modifier');
var GenericSync        = require('famous/input/generic-sync');
var Surface            = require('famous/surface');
var Easing = require('famous/transitions/easing');

// import custom modules
var InputSync          = require('custom-input-sync');
var TouchSync          = InputSync.TouchSync;
var MouseSync          = InputSync.MouseSync;
var Templates          = require('templates');
var Transform = require('famous/transform');

// import views
var VerticalScrollView       = require('vertical-scroll-view');
var ContactItemView    = require('contact-item-view');
var RowView   = require('row-view');
var HeaderView = RowView.HeaderView;

function ContactsScrollView(options) {

    window.con=this
    View.call(this);

    this.searchBarSize = 50;
    this.abcSurfaceWidth = 30;
    this.abcSurfaceHeight = undefined;

    this.setupLayout(options);
    this.collectionEvents();
    this.abcSurfaceEvents();
    this.searchSurfaceEvents();
}

ContactsScrollView.prototype = Object.create(View.prototype);
ContactsScrollView.prototype.constructor = ContactsScrollView;

ContactsScrollView.prototype.setupLayout = function(options) {
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
        'duration' : 0
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
    this._eventInput.pipe(this.searchSurface);
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

ContactsScrollView.prototype.setupHeaderSurfaces = function() {
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

ContactsScrollView.prototype.initContacts = function() {

    this.headerSequence = this.setupHeaderSurfaces();
    this.contactSequence = this.collection.map(function(item){
        return this.createItem(item);
    }.bind(this));
    this.refreshContacts();
};

ContactsScrollView.prototype.createItem = function (item){
    var surface = new ContactItemView({model: item});
    surface.pipe(this._eventOutput);
    this._eventInput.pipe(surface);
    return surface;
};

ContactsScrollView.prototype.collectionEvents = function() {
    // When Firebase returns the data switch out of the loading screen
    this.collection.on('all', function(e, model, collection, options) {
        console.log(e, model, collection, options);
        switch(e)
        {
            case 'change':
                this.changeItem(model);
                this.collection.sort();
                break;
            case 'remove':
                this.removeItem(model);
                break;
            case 'add':
                if (this.noInit == true){
                    this.addItem(model);
                }
                break;
            case 'sync':
                if (!this.noInit){
                    this.noInit = true;
                    this.initContacts();
                }
                break;

        }
    }.bind(this));
};

ContactsScrollView.prototype.abcSurfaceEvents = function() {
    var mousePosition = [0,0];
    var sync = new GenericSync(function(){
        return mousePosition;
    },{
        syncClasses:[MouseSync,TouchSync]
    });
    this.abcSurface.pipe(sync);
    sync.on('start',function(data){
        this.scrollToContact(data);
    }.bind(this));
    sync.on('update',function(data){
        this.scrollToContact(data);
    }.bind(this));
};

ContactsScrollView.prototype.scrollToContact = function(data){
    var target = document.elementFromPoint(data.ap[0], data.ap[1]);
    if (!target || !target.id) return;

    for (var i in this.headerSequence) {
        if(this.headerSequence[i].options.header == target.id) {
            var index= this.currentSequence.indexOf(this.headerSequence[i]);
            break;
        }
    }
    this.scrollview.scrollTo(index,0);
};

ContactsScrollView.prototype.searchSurfaceEvents = function() {
    this.searchSurface.on('click', function(e){
//        console.log(e);
        if (e.target.className == 'search-contact') {
            this._eventInput.emit('searchOnFocus');
        }
        else if  (e.target.className == 'cancel') {
            e.currentTarget.children[0].children[1].value = '';
            this._eventInput.emit('searchOnBlur');
            this.refreshContacts('');
        }
    }.bind(this));

    this._eventInput.on('searchOnFocus', this.searchOnFocus.bind(this));
    this._eventInput.on('searchOnBlur', this.searchOnBlur.bind(this));
    this.searchSurface.on('keyup', function(e){
        this.refreshContacts(e.target.value);
    }.bind(this));
};

ContactsScrollView.prototype.searchOnFocus = function(){
    this.searchMode =true;
    this._eventInput.emit('backToNoneEditing');
    this.scrollview.scrollTo(0,0);
    this.refreshContacts();
    this.LayoutMod.setTransform(Transform.translate(0,-50,0), this.searhBarTransition);
    this.searchSurface._currTarget.children[0].children[2].style.opacity = 1;
    this.searchSurface._currTarget.style.paddingRight = "100px";
//    colabeo.app.header.collapse();
};

ContactsScrollView.prototype.searchOnBlur = function(){
    this.searchMode = false;
    this.LayoutMod.setTransform(Transform.translate(0,0,0), this.searhBarTransition)
    this.searchSurface._currTarget.children[0].children[2].style.opacity = 0;
    this.searchSurface._currTarget.style.paddingRight = "10px";
//    colabeo.app.header.expand();
};



ContactsScrollView.prototype.renderSequence = function(sequence, sortFunction, filterFunction){
    
};

ContactsScrollView.prototype.sortSequence = function (method){
    
};

ContactsScrollView.prototype.filterSequence = function (searchKey){

};

ContactsScrollView.prototype.addItem = function(item) {

};

ContactsScrollView.prototype.removeItem = function(item) {

};

ContactsScrollView.prototype.changeItem = function(item) {

};

ContactsScrollView.prototype.resort = function(item) {

};

ContactsScrollView.prototype.sortByLastname = function(){
    this.currentSequence = _.sortBy(this.currentSequence, sortByLastname);
};

ContactsScrollView.prototype.sortByFirstname = function(){
    this.currentSequence = _.sortBy(this.currentSequence, sortByFirstname);
};

function sortByName(item, method){
    var l, f, h;
    l = f = h = '';
    if (item.model) l = item.model.get('lastname');
    if (item.model) f = item.model.get('firstname');
    if (item.options && item.options.header) h = item.options.header;
    if (method.toLowerCase() == 'lastname') {var str = h + l + ' ' + f;}
    else if (method.toLowerCase() == 'firstname') {var str = h + f + ' ' + l;}
    if (!/^[a-zA-Z]+$/.test(str[0]))
        str = "zzzz" + str;
    return str.toUpperCase();
}

module.exports = ContactsScrollView;
