// Import core Famous dependencies
var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var Scrollview       = require('famous/views/scrollview');

var FavoriteItemView  = require('favorite-item-view');

function FavoritesSectionView(options) {

    View.call(this);

    // Set up navigation and title bar information
    this.title = '<button class="left edit-button" id="edit-contact"></button><div>Favorites</div>';
    this.navigation = {
        caption: 'Favorites',
        icon: '<i class="fa fa-star"></i>'
    };

    this.collection = options.collection;
    this.scrollview = new Scrollview({
        classes: ['favorites-scrollview'],
        direction: Utility.Direction.Y,
        margin: 10000
    });
    this.pipe(this.scrollview);
    this._link(this.scrollview);

    // When Firebase returns the data switch out of the loading screen
    this.collection.on('all', function(e, model, collection, options) {
//            console.log(e, model, collection, options);
        switch(e)
        {
            case 'change:favorite':
//                    if (model.changed.favorite)
//                        this.loadFavorites();
//                    else {
//                        this.removeContact(model.collection.favorites().indexOf(model));
//                    }
//                    break;
            case 'remove':
                this.curIndex = this.scrollview.getCurrentNode().index;
                this.curPosition = this.scrollview.getPosition();
                this.loadFavorites();
                this.scrollTo(this.curIndex,this.curPosition);
                break;
            case 'sync':
                this.loadFavorites();
                break;
        }
    }.bind(this));
}

FavoritesSectionView.prototype = Object.create(View.prototype);
FavoritesSectionView.prototype.constructor = FavoritesSectionView;

FavoritesSectionView.prototype.loadFavorites = function() {
    var favoritesCollection = this.collection.favorites();
    var sequence = favoritesCollection.map(function(item){
        var surface = new FavoriteItemView({model: item});
        surface.pipe(this.eventOutput);
        return surface;
    }.bind(this))

    var extraHeight = this.scrollview.getSize()[1] + 40 ;
    for (i = 0; i < sequence.length; i++){
        extraHeight -= sequence[i].getSize()[1];
        if (extraHeight <= 0) break;
    }
    if (extraHeight > 0){
        var emptySurface = new Surface({
            size: [undefined, extraHeight]
        })
        emptySurface.pipe(this.eventOutput);
        sequence.push(emptySurface);
    }
    this.scrollview.sequenceFrom(sequence);
};

FavoritesSectionView.prototype.removeContact = function(index) {
    if (this.scrollview.node) {
        var removedNode = this.scrollview.node.array[index];
        removedNode.collapse(function() {
            this.scrollview.node.splice(index,1);
        }.bind(this));
    }
};

FavoritesSectionView.prototype.scrollTo = function(index, position){
    if (!index) index = 0;
    if (!position) position = 0;
    this.scrollview.setVelocity(0);
    this.scrollview.setPosition(position);
    this.scrollview.node.index = index;
}

module.exports = FavoritesSectionView;
