var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var Scrollview       = require('famous/views/scrollview');
var Engine           = require('famous/engine');

function VerticalScrollView(options) {
    Scrollview.apply(this,arguments);
    this.prepareEmptySurface();
    this.prepareResize();
    this.itemArray = [];
    window.ss=this
}

VerticalScrollView.prototype = Object.create(Scrollview.prototype);
VerticalScrollView.prototype.constructor = VerticalScrollView;

VerticalScrollView.prototype.setOptions = function (options){
    this.options.startAt = 'top'; // 'bottom'
    this.options.direction = Utility.Direction.Y;
    this.options.margin = 10000;
    Object.getPrototypeOf (VerticalScrollView.prototype).setOptions.apply(this, arguments);
    _.extend(this.options, options);
};

VerticalScrollView.prototype.prepareEmptySurface = function(){
    this.emptySurface = new Surface({
        properties: {
//            backgroundColor: 'yellow'
        },
        size:[undefined, 0]
    });
    this.emptySurface.pipe(this);
};

VerticalScrollView.prototype.prepareResize = function(){
    var resizeTimeout;
    var onResize = function() {
        this.emptySurfaceResize();
    };
    Engine.on('resize', function(){
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(onResize.bind(this), 300);
    }.bind(this));
};

VerticalScrollView.prototype.sequenceFrom = function(node){
    this.itemArray = _.clone(node);
//    _.each(this.itemArray, function(item) {
//        item.pipe(this);
//    }.bind(this));
    if (this.options.startAt == 'top') {
        node.push(this.emptySurface);
    } else {
        node.unshift(this.emptySurface);
    }
    // TODO: this.sequence need garbage collection
    Object.getPrototypeOf (VerticalScrollView.prototype).sequenceFrom.apply(this, arguments);
    Engine.defer( function() {
        this.emptySurfaceResize();
    }.bind(this));
};

VerticalScrollView.prototype.emptySurfaceResize = function (){
    if (this.emptySurface) {
        var extraHeight = this.getSize()[1];
        if (this.node) {
            var itemSequence = _.filter(this.node.array, function(i){return i instanceof Surface == false});
            for (var i = 0; i < itemSequence.length; i++){
                extraHeight -= itemSequence[i].getSize()[1];
                if (extraHeight <= 0) {
                    extraHeight = 1;
                    break;
                }
            }
        }
        this.emptySurface.setSize([undefined, extraHeight]);
    }
};

VerticalScrollView.prototype.scrollTo = function(index, position){
    if (!index) index = 0;
    if (!position) position = 0;
    this.setPosition(position);
    this.node.index = index;
};

VerticalScrollView.prototype.removeByIndex = function(index) {
    if (index<0) return;
    if (this.node) {
        var removedNode = this.itemArray.splice(index,1)[0];
        removedNode.collapse(function() {
            Engine.defer( function() {
                var i = this.node.array.indexOf(removedNode);
                this.node.splice(i,1);
                // this fixes first item removal return index -1 bug
                if (i==0) this.node.index = 0;
                this.emptySurfaceResize();
            }.bind(this));
        }.bind(this));
    }
};

VerticalScrollView.prototype.addByIndex = function(index, item) {
//    item.pipe(this);
    this.itemArray.splice(index, 0, item);
    this.node.splice(index, 0, item);
    // reset position
    this.node.index = 0;
    this.emptySurfaceResize();
};

module.exports = VerticalScrollView;
