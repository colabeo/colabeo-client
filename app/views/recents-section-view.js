// Import core Famous dependencies
var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var Scrollview       = require('famous/views/scrollview');
var Engine           = require('famous/engine');

var Templates        = require('templates');
var RecentItemView   = require('recent-item-view');

function RecentsSectionView(options) {

    View.call(this);
    this.missedOnly = false;

    // Set up navigation and title bar information
    this.title = '<button class="left clear-button" id="clear-button"></button>';
    this.title += Templates.recentsToggle();
    this.title += '<button class="right edit-button" id="recent-edit-contact"></button>';
    this.navigation = {
        caption: 'Recents',
        icon: '<i class="fa fa-clock-o"></i>'
    };

    this.collection = options.collection;
    this.scrollview = new Scrollview({
        //This will make sure it will work on both master and modularized.
        defaultItemSize: [undefined,50],
        direction: Utility.Direction.Y,
        margin: 10000
    });
    this.pipe(this.scrollview);
    this._link(this.scrollview);

    this.emptySurface = new Surface({
        size:[undefined, 0],
        properties: {
            backgroundColor: 'yellow'
        }
    });
    this.emptySurface.pipe(this.eventOutput);

    // TODO & Important: fetch first and then add this.collections.on
    // Otherwise, add event will be trigged n^2 times, and create n^2 item-view.
    this.collection.fetch();
    this.loadContacts();
    // When Firebase returns the data switch out of the loading screen
    this.collection.on('all', function(e, model, collection, options) {
//            console.log(e, model, collection, options);
        switch(e)
        {
            case 'remove':
                // TODO: fast remove will cause collection and scrollview index different due to animation delay
                if (this.missedOnly) var i = this.curCollection.indexOf(model);
                else var i = options.index;
                this.removeFromScrollView(i);
                break;
//                case 'sync':
            case 'add':
                this.addContacts(model);
//                    this.loadContacts();  // loadContacts lead to memory leak.
                break;
        }
    }.bind(this));

    var resizeTimeout;
    var onResize = function() {
        this.emptySurfaceResize();
    };
    Engine.on('resize', function(e){
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(onResize.bind(this), 300);
    }.bind(this));

    window.rr = this;
//        $('body').on('click', '.header button.clear-button', function(e){
//            _.invoke(this.collection.all(), 'destroy');
//            this.loadContacts();
//        }.bind(this));

//        $('body').on('click', '.header input[name=recents-toggle]', function(e){
//            this.missedOnly = ($('input[name=recents-toggle]:checked').val() == 'missed');
//            this.loadContacts();
//        }.bind(this));

}

RecentsSectionView.prototype = Object.create(View.prototype);
RecentsSectionView.prototype.constructor = RecentsSectionView;

RecentsSectionView.prototype.loadContacts = function() {
    this.scrollview.setPosition(0);
    this.curCollection = this.missedOnly? this.collection.missed() : this.collection;
    // TODO: this.sequence need garbage collection
    this.sequence = this.curCollection.map(function(item){
        var surface = new RecentItemView({model: item});
        this.eventInput.pipe(surface);
        surface.pipe(this.eventOutput);
        return surface;
    }.bind(this));

    this.sequence.push(this.emptySurface);
    this.scrollview.sequenceFrom(this.sequence);
    this.emptySurfaceResize();
};

RecentsSectionView.prototype.addContacts = function(call) {
    this.curCollection = this.missedOnly? this.collection.missed() : this.collection;
    var surface = new RecentItemView({model: call});
    this.eventInput.pipe(surface);
    surface.pipe(this.eventOutput);
    this.sequence.splice(0, 0, surface);
    this.emptySurfaceResize();
};

RecentsSectionView.prototype.removeFromScrollView = function(index) {
    this.curCollection = this.missedOnly? this.collection.missed() : this.collection;
    if (index<0) return;
    if (this.scrollview.node) {
        var removedNode = this.scrollview.node.array[index];
        removedNode.collapse(function() {
            Engine.defer( function(index) {
//                    this.sequence.splice(index, 1);
                this.scrollview.node.splice(index,1);
                this.emptySurfaceResize();
            }.bind(this, index));
        }.bind(this));
    }
};

RecentsSectionView.prototype.clearContact = function(){
    _.invoke(this.collection.all(), 'destroy');
};

RecentsSectionView.prototype.setMissOnly = function(miss){
    this.missedOnly = (miss == 'missed');
};

RecentsSectionView.prototype.emptySurfaceResize = function (){
    if (this.emptySurface) {
//            this.emptySurface.setSize([undefined, Math.max(this.scrollview.getSize()[1] - (this.sequence.length - 1) * this.sequence[0].getSize()[1], 0)]);
        var extraHeight = this.scrollview.getSize()[1];
        for (var i = 0; i < this.sequence.length - 1; i++){
            extraHeight -= this.sequence[i].getSize()[1];
            if (extraHeight <= 0) {
                extraHeight = 0;
                break;
            }
        }
        this.emptySurface.setSize([undefined, extraHeight]);
    }
};

module.exports = RecentsSectionView;
