define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var RecentItemView   = require('app/views/recent/RecentItemView');
    var Templates        = require('app/custom/Templates');

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
        this.collection.on('all', function(e) {
//            console.log(e, this.collection);
            switch(e)
            {
                case 'remove':
                case 'add':
                    console.log(e);
                    this.loadContacts();
                    break;
            }
        }.bind(this));

        $('body').on('click', '.header button.clear-button', function(e){
            _.invoke(this.collection.all(), 'destroy');
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
        if (this.missedOnly) collection = this.collection.missed();
        else collection = this.collection;
        this.scrollview.sequenceFrom(collection.map(function(item) {
            var surface = new RecentItemView({model: item});
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this)));
    }

    module.exports = RecentsSectionView;
});
