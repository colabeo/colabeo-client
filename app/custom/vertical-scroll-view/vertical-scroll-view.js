var View             = require('famous/view');
var Utility          = require('famous/utilities/utility');
var Surface          = require('famous/surface');
var Scrollview       = require('famous/views/scrollview');
var Engine           = require('famous/engine');

function VerticalScrollView(options) {
    Scrollview.apply(this,arguments);

//    this.setOptions(options);

    window.ss=this
}

VerticalScrollView.prototype = Object.create(Scrollview.prototype);
VerticalScrollView.prototype.constructor = VerticalScrollView;

VerticalScrollView.prototype.setOptions = function (options){
    this.options.startAt= 'top'; // 'bottom'
    Object.getPrototypeOf (VerticalScrollView.prototype).setOptions.apply(this, arguments);
    _.extend(this.options, options);
};



//VerticalScrollView.prototype.setEmptySurface = function(){
//    this.emptySurface = new Surface({
////        properties: {
////            backgroundColor: 'yellow'
////        },
//        size:[undefined, 0]
//    });
//    this.emptySurface.pipe(this.eventOutput);
//};
//
//VerticalScrollView.prototype.scrollTo = function(index, position){
//    if (!index) index = 0;
//    if (!position) position = 0;
//    this.scrollview.setPosition(position);
//    this.scrollview.node.index = index;
//};
//
//VerticalScrollView.prototype.emptySurfaceResize = function (){
//    if (this.emptySurface) {
//        var itemSequence = _.filter(this.sequence, function(i){return i instanceof Surface == false})
//        var extraHeight = this.scrollview.getSize()[1];
//        for (var i = 0; i < itemSequence.length; i++){
//            extraHeight -= itemSequence[i].getSize()[1];
//            if (extraHeight <= 0) {
//                extraHeight = 0;
//                break;
//            }
//        }
//        this.emptySurface.setSize([undefined, extraHeight]);
//    }
//};
//
//VerticalScrollView.prototype.windowResize = function(){
//    var resizeTimeout;
//    var onResize = function() {
//        this.emptySurfaceResize();
//    };
//    Engine.on('resize', function(){
//        if (resizeTimeout) clearTimeout(resizeTimeout);
//        resizeTimeout = setTimeout(onResize.bind(this), 300);
//    }.bind(this));
//};

module.exports = VerticalScrollView;
