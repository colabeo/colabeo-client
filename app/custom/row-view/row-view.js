var RenderNode = require('famous/render-node');
var View = require('famous/view');
var Modifier = require('famous/modifier');

function RowView(options){
    View.apply(this, arguments);
    this.surfaces = new RenderNode ();
    this.surfacesMod = new Modifier();
    this.node.link(this.surfacesMod).link(this.surfaces);
}

RowView.prototype = Object.create(View.prototype);
RowView.prototype.constructor = RowView;

RowView.prototype.collapse = function(callback) {
    this.surfacesMod.setOpacity(0,{duration:600}, callback);
};

RowView.prototype.expand = function (size,callback) {
    if (!size) var size = 1;
    this.surfacesMod.setOpacity(size,{duration:0}, callback);
};

RowView.prototype.getSize = function() {
    var sh = this.surfacesMod.opacityState.get();
    return [this.options.size[0], Math.floor(this.options.size[1]*sh) || 1];
};



module.exports = RowView;

