define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var FavoriteItemView  = require('app/views/favorite/FavoriteItemView');

    function FavoritesSectionView(options) {

        View.call(this);

        // Set up navigation and title bar information
        this.title = '<button class="left edit-button"></button><div>Favorites</div>';
        this.navigation = {
            caption: 'Favorites',
            icon: '<i class="fa fa-star"></i>'
        };

        this.collection = options.collection;
        this.scrollview = new Scrollview({
            classes: ['favorites-scrollview'],
            direction: Util.Direction.Y,
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

        var extraHeight = this.scrollview.getSize()[1] - 100 ;
        for (i = 0; i < sequence.length; i++){
            extraHeight -= sequence[i].getSize()[1];
            if (extraHeight <= 0) break;
            console.log(extraHeight);
        }
        if (extraHeight > 0){
            var emptySurface = new Surface({
                size: [undefined, extraHeight]
            })
            emptySurface.pipe(this.eventOutput);
            sequence.push(emptySurface);
        }
        console.log(this.scrollview.getSize());
        console.log(emptySurface.getSize());
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

    module.exports = FavoritesSectionView;
});
