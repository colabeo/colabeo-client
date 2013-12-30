define(function(require, exports, module) {
    var Scrollview = require('./Scrollview');
    var HeaderFooter = require('./MediaReader');
    var ImageSurface = require('famous/ImageSurface');
    var Matrix = require('famous/Matrix');
    var EventHandler = require('famous/EventHandler');
    var Utility = require('famous/Utility');
    /**
     * @class MediaReader
     * @description
     * Needs to be refactored before interface is documented.
     */
    function MediaReader(opts) {
        this.opts = Object.create(MediaReader.DEFAULT_OPTS);
        if (opts) {
            this.setOpts(opts);
        } else {
            this.setOpts(this.opts);
        }
        var HFdir = (this.opts.axis == 'y') ? HeaderFooter.DIR_X : HeaderFooter.DIR_Y;
        var scrollDir = Utility.Direction[this.opts.axis.toUpperCase()];

        this.layout = new HeaderFooter({
            footerSize: this.opts.menuSize,
            dir: HFdir
        });

        this.display = new Scrollview({direction: scrollDir, margin: this.opts.displayMargin, paginated: true, pageStopSpeed: this.opts.pageStopSpeed, clipSize: this.opts.clipSize, itemSpacing: this.opts.itemSpacing});
        this.menu = new Scrollview({direction: scrollDir, margin: this.opts.menuMargin, paginated: true, pageStopSpeed: this.opts.pageStopSpeed, clipSize: this.opts.clipSize, itemSpacing: this.opts.itemSpacing});

        var displayTransform = function(context) {
            var clip = this.opts.clipSize>>1;
            var imageCenterWidth = this.opts.images[0].width>>2;
            var imageCenterHeight = this.opts.images[0].height>>2;
            var widthOffset = clip - imageCenterWidth;
            var heightOffset = clip - imageCenterHeight;
            return function(offset) {
                return (this.options.direction == Utility.Direction.X) ? Matrix.translate(offset + widthOffset, heightOffset) : Matrix.translate(widthOffset, offset + heightOffset);
            }.bind(context);
        }.bind(this);

        var menuTransform = function(context) {
            var clip = this.opts.clipSize>>1;
            var widthOffset = clip - ((this.opts.images[0].width>>2)>>this.opts.scale);
            var heightOffset = clip - ((this.opts.images[0].height>>2)>>this.opts.scale);
            return function(offset) {
                return (this.options.direction == Utility.Direction.X) ? Matrix.translate(offset + widthOffset, 0) : Matrix.translate(0, offset + heightOffset);
            }.bind(context);
        }.bind(this);

        this.display.setOutputFunction(displayTransform(this.display));
        this.menu.setOutputFunction(menuTransform(this.menu));

        this.layout.id.content.link(this.display);
        this.layout.id.footer.link(this.menu);

        this.displayInput = new EventHandler();
        EventHandler.setInputHandler(this, this.displayInput);
        this.display.pipe(this.displayInput);

        this.displayInput.on('pageChange',function() {
//            this.select(this.display.node.index,'menu');
            this.menu.node.index = this.display.node.index;
        }.bind(this));

        this.load(this.opts.images);
    }


    MediaReader.DEFAULT_OPTS = {
        pageStopSpeed: 3,
        axis: 'x',
        scale: 3,
        displayMargin: 10000,
        images: [],
        menuMargin: 10000,
        menuSize: 100,
        displayClasses: [],
        menuClasses: [],
        onClasses: [],
        clipSize: undefined,
        itemSpacing: 0
    };

    MediaReader.prototype.getSize = function() {
        return this.scrollview.getSize();
    };

    MediaReader.prototype.setSize = function(size) {
        this.scrollview.setOpts({
            clipSize: size[1]
        });
    };

    MediaReader.prototype.select = function(index, item) {
        var itemIndex = this[item].node.index;
        var comparisonIndex = index;
        var difference = comparisonIndex - itemIndex;
        if (difference & -1){
            var negative = difference < 0;
            var steps = negative ? -difference : difference;
            var flip = negative ? this[item].prevPage.bind(this[item]) : this[item].nextPage.bind(this[item]);
            for (var i = 0; i < steps; i++){
                flip();
            }
        }
    };

    MediaReader.prototype.load = function(images) {
        var menuImages = [];
        var displayImage, menuImage;
        this.display.sequenceFrom(images.map(function(image, index) {
            displayImage = new ImageSurface({
                content: image.url,
                size: [image.width,image.height],
                classes: this.opts.displayClasses
            });
            displayImage.pipe(this.display);

            menuImage = new ImageSurface({
                content: image.url,
                size: [image.width>>this.opts.scale, image.height>>this.opts.scale],
                classes: this.opts.menuClasses
            });

            menuImage.on('mousedown', function() {
                this.notDragging = true;
            }.bind(this));
            menuImage.on('mousemove', function() {
                this.notDragging = false;
            }.bind(this));
            menuImage.on('mouseup', function() {
                this.notDragging && this.select(index, 'display');
            }.bind(this));

            menuImage.pipe(this.menu);
            menuImages.push(menuImage);
            return displayImage;
        }.bind(this)));
        this.menu.sequenceFrom(menuImages);
    };

    MediaReader.prototype.render = function() {
        return this.layout.render();
    };

    MediaReader.prototype.getOpts = function() {
        return this.opts;
    };

    MediaReader.prototype.setOpts = function(opts) {
        for (var key in MediaReader.DEFAULT_OPTS) {
            if(opts[key] !== undefined) this.opts[key] = opts[key];
        }
    };

    module.exports = MediaReader;


});
