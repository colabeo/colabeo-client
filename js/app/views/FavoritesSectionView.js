define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var FavoriteItemView  = require('app/views/FavoriteItemView');

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
        this.collection.on('all', function(e) {
//            console.log(e);
            switch(e)
            {
                case 'remove':
                case 'sync':
                case 'change:favorite':
                    this.loadFavorites();
                    break;
            }
        }.bind(this));
    }

    FavoritesSectionView.prototype = Object.create(View.prototype);
    FavoritesSectionView.prototype.constructor = FavoritesSectionView;

    FavoritesSectionView.prototype.loadFavorites = function() {
        var favoritesCollection = this.collection.favorites();
        this.scrollview.sequenceFrom(favoritesCollection.map(function(item) {
            var surface = new FavoriteItemView({model: item});
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this)));
    }
    module.exports = FavoritesSectionView;
});
