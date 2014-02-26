define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var FavoriteItemView  = require('views/favorite/favorite-item-view');
    var Engine           = require('famous/Engine');

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
            direction: Util.Direction.Y,
            margin: 10000
        });
        this.pipe(this.scrollview);
        this._link(this.scrollview);

        // When Firebase returns the data switch out of the loading screen
        this.collection.on('all', function(e, model, collection, options) {
            console.log(e, model.attributes, collection, options);
            switch(e)
            {
                case 'change:favorite':
                    if (model.changed.favorite)
                        this.loadFavorites();
                    else {
                        var i = this.curCollection.indexOf(model);
                        this.removeContact(i);
                    }
                    break;
                case 'remove':
                    this.curIndex = this.scrollview.getCurrentNode().index;
                    this.curPosition = this.scrollview.getPosition();
                    var i = this.curCollection.indexOf(model);
                    this.removeContact(i);
//                    this.loadFavorites();
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
        this.curCollection = this.collection.favorites();
        var sequence = this.curCollection.map(function(item){
            var surface = new FavoriteItemView({model: item});
            surface.pipe(this.eventOutput);
            this.eventInput.pipe(surface);
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
        this.curCollection = this.collection.favorites();
        if (this.scrollview.node) {
            var removedNode = this.scrollview.node.array[index];
            removedNode.collapse(function() {
                Engine.defer( function(index) {this.scrollview.node.splice(index,1)}.bind(this, index) );
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
});
