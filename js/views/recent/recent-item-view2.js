define(function(require, exports, module) {
    var TimeAgo        = require('famous-utils/TimeAgo');

    var ItemView = require('app/custom/item-view');
    var Templates = require('app/custom/Templates');

    function RecentItemView(options){
        // leftButton1Content, rightButtonContent, itemClasses(array)
        this.options=options;
        this.options.leftButtons =[{
            content: Templates.crossButton(),
            event: 'deleteItem'
        }];
        this.options.rightButton ={
            content: Templates.phoneButton(),
            event: 'outgoingCall'
        };

        this.options.itemClasses = ['contact-item', 'recent-item'];

        this.itemView = new ItemView(this.options);

        this.setupItemContent(options.model);

        this.itemView.collapse = function(callback) {
            this.surfacesMod.setOpacity(0,{duration:600}, callback);
        };

        this.itemView.eventOutput.on('clickItem', onClickItem);
        this.itemView.eventOutput.on('deleteItem', onDeleteItem);


        function onClickItem (){
            this.eventOutput.emit('editContact', this.options.model)
        }
        function onDeleteItem () {
                this.options.model.destroy();
        }

        return this.itemView;
    }

    RecentItemView.prototype.setupItemContent = function (options){
        var name;
        if (options.get('firstname') || options.get('lastname')) {
            name = options.get('firstname') + " <b>" + options.get('lastname') + "</b>";
        } else {
            name = options.get('email');
        }
        var icon = ''; //'<i class="fa fa-sign-in"></i>';
        var missed = '';
        if (options.get('type') == 'outgoing')
            icon = '<i class="fa fa-sign-out"></i>';
        else {
            if (!options.get('success'))
                missed = "missed";
        }
        var contact = '<div style = " width: ' + window.innerWidth + 'px"><div class="source '+missed+'"><div class="call-type">'+icon+'</div>' + name;
        contact += '<div class="call-time">' + TimeAgo.parse(options.get('time')) + ' ago</div></div></div>';
        this.itemView.itemSurface.setContent(contact);
    };



    module.exports = RecentItemView;

});