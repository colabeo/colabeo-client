// Import core Famous dependencies
var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var VerticalScrollView       = require('vertical-scroll-view');
var Engine           = require('famous/engine');

var Templates        = require('templates');
var ChatItemView   = require('chat-item-view');

function ChatsSectionView(options) {

    View.call(this);

    this.title = Templates.chatsHeader();
    this.navigation = {
        caption: 'Messages',
        icon: '<i class="fa fa-comments-o"></i>'
    };

    this.collection = options.collection;
    this.scrollview = new VerticalScrollView({
        startAt: 'top'
    });
    this.pipe(this.scrollview);
    this._add(this.scrollview);
    this.loadItems();

    this.collection.on('all', function(e, model, collection, options) {
//        console.log(e, model, collection, options);
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

ChatsSectionView.prototype = Object.create(View.prototype);
ChatsSectionView.prototype.constructor = ChatsSectionView;

ChatsSectionView.prototype.updateItems = function() {
    _.each(this.sequence, function(itemView){
        if (itemView.updateItem) itemView.updateItem();
    });
};

ChatsSectionView.prototype.loadItems = function() {
    this.collection.fetch();
    this.scrollview.setPosition(0);
    this.sequence = this.collection.map(function(item){
        var surface = new ChatItemView({
            model: item
        });
        surface.pipe(this._eventOutput);
        this._eventInput.pipe(surface);
        return surface;
    }.bind(this));
    this.scrollview.sequenceFrom(this.sequence);
};

ChatsSectionView.prototype.addItem = function(call) {
    var surface = new ChatItemView({model: call});
    surface.pipe(this._eventOutput);
    this._eventInput.pipe(surface);
    this.scrollview.addByIndex(0, surface);
};

ChatsSectionView.prototype.removeItemByIndex = function(index) {
    this.scrollview.removeByIndex(index);
};

module.exports = ChatsSectionView;
