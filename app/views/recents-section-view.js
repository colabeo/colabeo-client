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

    this.title = Templates.recentsHeader();
    this.navigation = {
        caption: 'Calls',
        icon: '<i class="fa fa-phone"></i>'
    };

    this.collection = options.collection;
    this.scrollview = new VerticalScrollView({
        startAt: 'top'
    });
    this.pipe(this.scrollview);
    this._add(this.scrollview);
    this.scrollview.sequenceFrom([]);

    this.collection.on('all', function(e, model, collection, options) {
//        console.log('recents ',e);
        switch(e)
        {
            case 'remove':
                this.scrollview.removeByIndex(options.index);
                this.updateItems();
                break;
            case 'add':
                this.addItem(model);
                this.updateItems();
                break;
            case 'change':
                var i = model.collection.indexOf(model);
                this.sequence[i].updateItem();
                break;
        }
    }.bind(this));
}

RecentsSectionView.prototype = Object.create(View.prototype);
RecentsSectionView.prototype.constructor = RecentsSectionView;

RecentsSectionView.prototype.updateItems = function() {
    _.each(this.sequence, function(itemView){
        if (itemView.updateItem) itemView.updateItem();
    });
};

RecentsSectionView.prototype.loadItems = function() {
//    this.collection.fetch();
    this.scrollview.setPosition(0);
    this.sequence = this.collection.map(function(item){
        var surface = new RecentItemView({model: item});
        surface.pipe(this._eventOutput);
        this._eventInput.pipe(surface);
        return surface;
    }.bind(this));
    this.scrollview.sequenceFrom(this.sequence);
};

RecentsSectionView.prototype.addItem = function(call) {
    var surface = new RecentItemView({model: call});
    surface.pipe(this._eventOutput);
    this._eventInput.pipe(surface);
    this.scrollview.addByIndex(0, surface);
};

RecentsSectionView.prototype.removeItemByIndex = function(index) {
    this.scrollview.removeByIndex(index);
};

RecentsSectionView.prototype.clearAll = function(){
//    _.invoke(this.collection.all(), 'destroy');
    _(this.collection.all()).each(function(item){item.collection.remove(item)});
};

RecentsSectionView.prototype.setMissedOnly = function(miss){
    var missedOnly = (miss == 'missed');
    if (missedOnly) {
        _.each(this.sequence, function(itemView){
            if (itemView.collapse && !itemView.model.isMissed()) {
                itemView.collapse();
            }
        }.bind(this));
    } else {
        this.scrollview.setVelocity(-1);
        _.each(this.sequence, function(itemView){
            if (itemView.expand) itemView.expand();
        }.bind(this));
    }
};

module.exports = RecentsSectionView;
