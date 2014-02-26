define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var RecentItemView   = require('views/recent/recent-item-view');
    var Templates        = require('app/custom/Templates');
    var Engine           = require('famous/Engine');

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
            direction: Util.Direction.Y,
            margin: 10000
        });
        this.pipe(this.scrollview);
        this._link(this.scrollview);

        // TODO & Important: fetch first and then add this.collections.on
        // Otherwise, add event will be trigged n^2 times, and create n^2 item-view.
        this.collection.fetch();
        this.loadContacts();
        // When Firebase returns the data switch out of the loading screen
        this.collection.on('all', function(e, model, collection, options) {
            switch(e)
            {
                case 'remove':
                    var i = this.curCollection.indexOf(model);
                    // TODO: Hack?
                    if (i<0) i = options.index;
                    this.removeContact(i);
                    break;
//                case 'sync':
                case 'add':
                    this.addContacts(model);
//                    this.loadContacts();  // loadContacts lead to memory leak.
                    break;
            }
        }.bind(this));

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
        this.sequence = this.curCollection.map(function(item){
            var surface = new RecentItemView({model: item});
            this.eventInput.pipe(surface);
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this));

        // added empty item
        // media access bar messed up the height so add 40

        var extraHeight = this.scrollview.getSize()[1] + 40;
        for (var i = 0; i<this.sequence.length; i++){
            extraHeight -= this.sequence[i].getSize()[1];
            if (extraHeight < 0) break;
        }

        if (extraHeight > 0) {
            this.emptysurface = new Surface({
                size:[undefined, extraHeight]
            });
            this.emptysurface.pipe(this.eventOutput);
            this.sequence.push(this.emptysurface);
        }

        this.scrollview.sequenceFrom(this.sequence);
    };

    RecentsSectionView.prototype.addContacts = function(call) {
        this.curCollection = this.missedOnly? this.collection.missed() : this.collection;
        var surface = new RecentItemView({model: call});
        this.eventInput.pipe(surface);
        surface.pipe(this.eventOutput);
        this.sequence.splice(0, 0, surface);

        var extraHeight = this.scrollview.getSize()[1] + 40;
        for (var i = 0; i<this.sequence.length; i++){
            extraHeight -= this.sequence[i].getSize()[1];
            if (extraHeight < 0) break;
        }

        this.emptysurface.setSize([undefined, this.emptysurface.getSize()[1]-50])
    };

    RecentsSectionView.prototype.removeContact = function(index) {
        this.curCollection = this.missedOnly? this.collection.missed() : this.collection;
        if (this.scrollview.node) {
            var removedNode = this.scrollview.node.array[index];
            removedNode.collapse(function() {
                Engine.defer( function(index) {this.scrollview.node.splice(index,1)}.bind(this, index) );
            }.bind(this));
        }
    };

    RecentsSectionView.prototype.clearContact = function(){
        _.invoke(this.collection.all(), 'destroy');
    };

    RecentsSectionView.prototype.setMissOnly = function(miss){
        this.missedOnly = (miss == 'missed');
    };


    module.exports = RecentsSectionView;
});
