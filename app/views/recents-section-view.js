// Import core Famous dependencies
var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var VerticalScrollView       = require('vertical-scroll-view');
var Engine           = require('famous/engine');

var Templates        = require('templates');
var RecentItemView   = require('recent-item-view');

function RecentsSectionView(options) {

    View.call(this);

    // Set up navigation and title bar information
    this.title = '<button class="left clear-button" id="clear-button"></button>';
    this.title += Templates.recentsToggle();
    this.title += '<button class="right edit-button" id="recent-edit-contact"></button>';
    this.navigation = {
        caption: 'Recents',
        icon: '<i class="fa fa-clock-o"></i>'
    };

    this.collection = options.collection;
    this.scrollview = new VerticalScrollView({
        startAt: 'top'
    });
    this.pipe(this.scrollview);
    this._link(this.scrollview);
    this.loadItems();

    this.collection.on('all', function(e, model, collection, options) {
//            console.log(e, model, collection, options);
        switch(e)
        {
            case 'remove':
                this.scrollview.removeByIndex(options.index);
                break;
//                case 'sync':
            case 'add':
                this.addItem(model);
                break;
        }
    }.bind(this));

    window.rr = this;

}

RecentsSectionView.prototype = Object.create(View.prototype);
RecentsSectionView.prototype.constructor = RecentsSectionView;

RecentsSectionView.prototype.loadItems = function() {
    this.collection.fetch();
    this.scrollview.setPosition(0);
    this.sequence = this.collection.map(function(item){
        var surface = new RecentItemView({model: item});
        this.eventInput.pipe(surface);
        surface.pipe(this.eventOutput);
        return surface;
    }.bind(this));
    this.scrollview.sequenceFrom(this.sequence);
};

RecentsSectionView.prototype.addItem = function(call) {
    var surface = new RecentItemView({model: call});
    this.eventInput.pipe(surface);
    surface.pipe(this.eventOutput);
    this.scrollview.addByIndex(0, surface);
};

RecentsSectionView.prototype.clearAll = function(){
    _.invoke(this.collection.all(), 'destroy');
};

RecentsSectionView.prototype.setMissedOnly = function(miss){
    var missedOnly = (miss == 'missed');
    _.each(this.sequence, function(itemView){
        if (!itemView.collapse) return;
        if (missedOnly) {
            if (!itemView.model.isMissed())
                itemView.collapse();
        }
        else itemView.expand();
    }.bind(this));
};

module.exports = RecentsSectionView;
