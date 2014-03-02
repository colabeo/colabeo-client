var Templates    = require('templates');
var RowView    = require('row-view');
var ItemView = RowView.ItemView;

function ContactItemView(options, isFirst) {

    this.model = options.model;
    options.paddingRight = 40;

    options.leftButtons =[{
        content: Templates.crossButton(),
        event: 'deleteContact'
    },{
        content: Templates.favoriteButton(this.model.get('favorite')),
        event: 'toggleFavorite'
    }];
    options.rightButton ={
        content: Templates.phoneButton(),
        event: 'outgoingCall'
    };
    options.itemButton = {
        classes: ['contact-item', 'editable'],
        content: Templates.contactItemView(options.model),
        event: 'editContact'
    };

    ItemView.apply(this, arguments);

    this.model.on('all', function(e, model, collection, options) {
        switch(e)
        {
            case 'change:favorite':
                $(this['leftButton1']._currTarget).find('.favorite-button').toggleClass('active');
                break;
        }
    }.bind(this));

    this.eventInput.on('toggleAllContact', this.onToggleAll.bind(this));
    this.eventInput.on('backToNoneEditing', this.setEditingOff.bind(this));
}

ContactItemView.prototype = Object.create(ItemView.prototype);
ContactItemView.prototype.constructor = ContactItemView;

module.exports = ContactItemView;
