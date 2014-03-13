var Templates    = require('templates');
var RowView    = require('row-view');
var ItemView = RowView.ItemView;

function SocialItemView(options) {

    this.model = options.model;
    options.paddingRight = 40;

    options.itemButton = {
        classes: ['contact-item', 'editable'],
        content: Templates.socialItemView(options.model),
        event: 'goBack'
    };

    ItemView.apply(this, arguments);
}

SocialItemView.prototype = Object.create(ItemView.prototype);
SocialItemView.prototype.constructor = SocialItemView;

SocialItemView.prototype.setupEvent = function(){
    this.itemSurface.pipe(this._eventOutput);
};

module.exports = SocialItemView;
