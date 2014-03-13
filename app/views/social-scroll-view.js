// import views
var SocialItemView    = require('social-item-view');
var RowView   = require('row-view');
var HeaderView = RowView.HeaderView;

var ContactsScrollView = require('contacts-scroll-view');

function SocialScrollView(options) {

    ContactsScrollView.apply(this, arguments);

}

SocialScrollView.prototype = Object.create(ContactsScrollView.prototype);
SocialScrollView.prototype.constructor = SocialScrollView;

SocialScrollView.prototype.createItem = function (item){
    var surface = new SocialItemView({model: item});
    surface.pipe(this._eventOutput);
    this._eventInput.pipe(surface);
    return surface;
};

module.exports = SocialScrollView;
