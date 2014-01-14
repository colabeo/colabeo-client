define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var RecentItemView   = require('app/views/recent/RecentItemView');
    var Templates        = require('app/custom/Templates');
    var Engine           = require('famous/Engine');

    function RecentsSectionView(options) {

        View.call(this);
        this.missedOnly = false;

        // Set up navigation and title bar information
        this.title = '<button class="left clear-button"></button>';
        this.title += Templates.recentsToggle();
        this.title += '<button class="right edit-button"></button>';
        this.navigation = {
            caption: 'Recents',
            icon: '<i class="fa fa-clock-o"></i>'
        };

        this.collection = options.collection;
        this.scrollview = new Scrollview({
            direction: Util.Direction.Y,
            margin: 10000
        });
        this.pipe(this.scrollview);
        this._link(this.scrollview);

        // When Firebase returns the data switch out of the loading screen
        this.collection.on('all', function(e, model, collection, options) {
//            console.log(e, model, collection, options);
            console.log(e);
            switch(e)
            {
                case 'remove':
                    var i = this.curCollection.indexOf(model);
                    if (i<0) i = options.index;
                    this.removeContact(i);
                    break;
//                case 'sync':
                case 'add':
                    this.loadContacts();
                    break;
            }
        }.bind(this));

        $('body').on('click', '.header button.clear-button', function(e){
            _.invoke(this.collection.all(), 'destroy');
            this.loadContacts();
        }.bind(this));

        $('body').on('click', '.header input[name=recents-toggle]', function(e){
            this.missedOnly = ($('input[name=recents-toggle]:checked').val() == 'missed');
            this.loadContacts();
        }.bind(this));

        this.collection.fetch();
    }

    RecentsSectionView.prototype = Object.create(View.prototype);
    RecentsSectionView.prototype.constructor = RecentsSectionView;

    RecentsSectionView.prototype.loadContacts = function() {
        this.scrollview.setPosition(0);
        if (this.missedOnly) collection = this.collection.missed();
        else collection = this.collection;
        this.curCollection = collection;

        var sequence = this.curCollection.map(function(item){
            var surface = new RecentItemView({model: item});
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this));

        // added empty item
        // media access bar messed up the height so add 40

        var extraHeight = this.scrollview.getSize()[1] + 40;
        for (var i = 0; i<sequence.length; i++){
            extraHeight -= sequence[i].getSize()[1];
            if (extraHeight < 0) break;
        }

        if (extraHeight > 0) {
            var emptySurface = new Surface({
                size:[undefined, extraHeight]
            })
            emptySurface.pipe(this.eventOutput);
            sequence.push(emptySurface);
        }

        this.scrollview.sequenceFrom(sequence);
    };

    RecentsSectionView.prototype.removeContact = function(index) {
        if (this.missedOnly) collection = this.collection.missed();
        else collection = this.collection;
        this.curCollection = collection;
        if (this.scrollview.node) {
            var removedNode = this.scrollview.node.array[index];
            removedNode.collapse(function() {
                Engine.defer( function(index) {this.scrollview.node.splice(index,1)}.bind(this, index) );
            }.bind(this));
        }

    };

    module.exports = RecentsSectionView;
});
