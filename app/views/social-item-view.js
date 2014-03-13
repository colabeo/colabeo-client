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

// Overwrite the events functions since there is only one button event in Social-view,

SocialItemView.prototype.setupEvent = function(){
    this.itemSurface.pipe(this._eventOutput);
};

SocialItemView.prototype.buttonsClickEvents = function() {
    this.itemSurface.on('click', function(){
        this._eventOutput.emit(this.options.itemButton.event, this.model);
    }.bind(this));
};

module.exports = SocialItemView;
