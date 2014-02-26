define(function(require, exports, module) {
    var ItemView = require('app/custom/item-view');
    var Templates = require('app/custom/Templates');

    function RecentItemView(options){
        options.leftButtons =[{
            content: Templates.crossButton(),
            event: 'deleteRecent'
        }];
        options.rightButton ={
            content: Templates.phoneButton(),
            event: 'outgoingCall'
        };
        options.itemButton = {
            classes: ['contact-item', 'recent-item'],
            content: Templates.recentItemView(options.model),
            event: 'editContact'
        };

        ItemView.apply(this, arguments);

        this.eventInput.on('toggleAllRecent', this.onToggleAll.bind(this));

    }

    RecentItemView.prototype = Object.create(ItemView.prototype);
    RecentItemView.prototype.constructor = RecentItemView;

    module.exports = RecentItemView;

});