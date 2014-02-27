define(function(require, exports, module) {
    var ItemView = require('app/custom/item-view');
    var Templates = require('app/custom/Templates');

    function FavoriteItemView(options){
        options.leftButtons =[{
            content: Templates.crossButton(),
            event: 'deleteFavorite'
        }];
        options.rightButton ={
            content: Templates.phoneButton(),
            event: 'outgoingCall'
        };
        options.itemButton = {
            classes: ['contact-item', 'favorite-item', 'recent-item', 'editable'],
            content: Templates.favoriteItemView(options.model),
            event: 'editContact'
        };

        ItemView.apply(this, arguments);

        this.eventInput.on('toggleAllFavorite', this.onToggleAll.bind(this));
        this.eventInput.on('backToNoneEditing', this.setEditingOff.bind(this));
    }

    FavoriteItemView.prototype = Object.create(ItemView.prototype);
    FavoriteItemView.prototype.constructor = FavoriteItemView;

    module.exports = FavoriteItemView;
});