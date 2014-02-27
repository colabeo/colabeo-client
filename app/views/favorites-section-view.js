// Import core Famous dependencies
var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var Scrollview       = require('famous/views/scrollview');
var Engine           = require('famous/engine');

var FavoriteItemView  = require('favorite-item-view');

function FavoritesSectionView(options) {

    View.call(this);

    // Set up navigation and title bar information
    this.title = '<button class="left edit-button" id="favorite-edit-contact"></button><div>Favorites</div>';
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
                if (model.changed.favorite)
                    this.addFavorites(model);
//                        this.loadFavorites();
                else {
                    var i = this.curCollection.indexOf(model);
                    this.removeFavorite(i);
                }
                break;
            case 'remove':
                this.curIndex = this.scrollview.getCurrentNode().index;
                this.curPosition = this.scrollview.getPosition();
                var i = this.curCollection.indexOf(model);
                this.removeFavorite(i);
//                    this.loadFavorites();
                this.scrollTo(this.curIndex,this.curPosition);
                break;
            // sync is unnecessary, because loadFavorites() is done at init.
            case 'sync':
                if (this.firstLoad == undefined) {
                    this.loadFavorites();
                    this.firstLoad = true;
                }
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

    window.fff=this

}

FavoritesSectionView.prototype = Object.create(View.prototype);
FavoritesSectionView.prototype.constructor = FavoritesSectionView;

FavoritesSectionView.prototype.loadFavorites = function() {
    this.curCollection = this.collection.favorites();
    this.sequence = this.curCollection.map(function(item){
        var surface = new FavoriteItemView({model: item});
        surface.pipe(this.eventOutput);
        this.eventInput.pipe(surface);
        return surface;
    }.bind(this))

    var extraHeight = this.scrollview.getSize()[1] + 40 ;
    for (var i = 0; i < this.sequence.length; i++){
        extraHeight -= this.sequence[i].getSize()[1];
        if (extraHeight <= 0) {
            extraHeight = 0;
            break;
        }
    }
    this.emptySurface = new Surface({
        size: [undefined, extraHeight]
    });
    this.emptySurface.pipe(this.eventOutput);
    this.sequence.push(this.emptySurface);
    this.scrollview.sequenceFrom(this.sequence);
};

FavoritesSectionView.prototype.addFavorites = function(contact) {
    this.curCollection = this.collection.favorites();
    var i = this.curCollection.indexOf(contact);
    var surface = new FavoriteItemView({model: contact})
    surface.pipe(this.eventOutput);
    this.eventInput.pipe(surface);
    this.sequence.splice(i, 0, surface);
    this.emptySurfaceResize();
};

FavoritesSectionView.prototype.removeFavorite = function(index) {
    if (index<0) return;
    this.curCollection = this.collection.favorites();
    if (this.scrollview.node) {
        var removedNode = this.scrollview.node.array[index];
        removedNode.collapse(function() {
            Engine.defer( function(index) {this.scrollview.node.splice(index,1)}.bind(this, index) );
        }.bind(this));
    }
    this.sequence.splice(index,1);
    this.emptySurfaceResize();
};

FavoritesSectionView.prototype.scrollTo = function(index, position){
    if (!index) index = 0;
    if (!position) position = 0;
    this.scrollview.setVelocity(0);
    this.scrollview.setPosition(position);
    this.scrollview.node.index = index;
};

FavoritesSectionView.prototype.emptySurfaceResize = function (){
    if (this.emptySurface)
        this.emptySurface.setSize([undefined, Math.max(this.scrollview.getSize()[1] - (this.sequence.length - 1) * this.sequence[0].getSize()[1], 0)]);
};


module.exports = FavoritesSectionView;