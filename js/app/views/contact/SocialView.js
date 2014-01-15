define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var SocialItemView  = require('app/views/contact/SocialItemView');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');

    function SocialView(options) {

        View.call(this);

        this.searchBarSize = 50;
        this.abcSurfaceWidth = 30;
        this.abcSurfaceHeight = undefined;
        this.a2zString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#';


        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: this.searchBarSize,
            footerSize: 0
        });

        this.searchSurface = new Surface({
            size: [undefined, this.searchBarSize],
            classes: ['import-section-search-bar'],
            content: '<div><i class="fa fa-search"></i>   ' +
                '<input type="text" class="search-import" placeholder = "Search" ></div></div>',
            properties:{
                backgroundColor: 'rgba(15,15,15,0.9)',
                color: 'white',
                zIndex:2
            }
        });

        this.collection = options.collection;
        this.scrollview = new Scrollview({
            direction: Util.Direction.Y,
            margin: 10000
        });

        this.headerFooterLayout.id.header.link(this.searchSurface);
        this.headerFooterLayout.id.content.add(this.scrollview);
        this.headerFooterLayout.id.content.add(this.abcMod).link(this.abcSurface);

        this.pipe(this.scrollview);
        this._add(this.headerFooterLayout);

        this.loadContacts();

        $('body').on('keyup', '.search-contact', function(e){
            this.loadContacts(e.target.value);
        }.bind(this));
    }

    SocialView.prototype = Object.create(View.prototype);
    SocialView.prototype.constructor = SocialView;

    SocialView.prototype.loadContacts = function(searchKey) {
        if (searchKey) this.currentCollection = this.collection.searchContactByEmail(searchKey.toUpperCase());
        else this.currentCollection = this.collection;
        console.log(this.currentCollection);
        this.scrollview.sequenceFrom(this.currentCollection.map(function(item) {
            var surface = new SocialItemView({model: item}, false);
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this)));
    };

    module.exports = SocialView;
});
