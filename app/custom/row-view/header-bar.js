var TitleBar = require('famous/widgets/title-bar');
var Modifier = require('famous/modifier');

function HeaderBar(options){
    TitleBar.apply(this, arguments);
//    this.surfaces = new RenderNode ();
    this.surfacesMod = new Modifier();
//    this._node.add(this.surfacesMod).add(this.surfaces);
}

HeaderBar.prototype = Object.create(TitleBar.prototype);
HeaderBar.prototype.constructor = HeaderBar;

HeaderBar.prototype.collapse = function(callback) {
    this.hide();
};

HeaderBar.prototype.expand = function (callback) {
    this.show();
};

HeaderBar.prototype.getSize = function() {
    var n = -this.options.size[1];
    if (this.lightbox.transforms[0]) {
        n = this.lightbox.transforms[0].transformTranslateState.get()[1];
    };
    return [this.options.size[0], Math.floor(this.options.size[1] + n) || -1];
};

HeaderBar.prototype.show = function(title) {
    if (!title) title = this.curTitle;
    else this.curTitle = title;
    TitleBar.prototype.show.apply(this, [title]);
};

HeaderBar.prototype.hide = function() {
    this.lightbox.hide();
}

module.exports = HeaderBar;

