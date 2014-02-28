var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var Scrollview       = require('famous/views/scrollview');
var Engine           = require('famous/engine');

function VerticalScrollView(options) {
    Scrollview.apply(this,arguments);
    this.prepareEmptySurface();
    this.prepareResize();
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
            backgroundColor: 'yellow'
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
    if (this.options.startAt == 'top') {
        node.push(this.emptySurface);
    } else {
        node.unshift(this.emptySurface);
    }
    Object.getPrototypeOf (VerticalScrollView.prototype).sequenceFrom.apply(this, arguments);
    this.emptySurfaceResize();
};

VerticalScrollView.prototype.emptySurfaceResize = function (){
    if (this.emptySurface) {
        var itemSequence = _.filter(this.node.array, function(i){return i instanceof Surface == false});
        var extraHeight = this.getSize()[1];
        for (var i = 0; i < itemSequence.length; i++){
            extraHeight -= itemSequence[i].getSize()[1];
            if (extraHeight <= 0) {
                extraHeight = 0;
                break;
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
        var removedNode = this.node.array[index];
        removedNode.collapse(function() {
            Engine.defer( function(index) {
                this.node.splice(index,1);
            }.bind(this, index));
        }.bind(this));
    }
};

module.exports = VerticalScrollView;
