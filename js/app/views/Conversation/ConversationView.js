define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ConversationItemView  = require('app/views/Conversation/ConversationItemView');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');

    function ConversationView(options) {

        View.call(this);

        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: 400,
            footerSize: 30
        });

        this.inputSurface = new Surface({
            size:[undefined, 25],
            classes: ['conversation-input-bar'],
            content: '<div><input type = "text"  class="input-msg" name="message"><button class="send-text-button">send</button></div>',
            properties:{
                backgroundColor: 'red'
            }
        });

        this.collection = options.collection;
        this.scrollview = new Scrollview({
            direction: Util.Direction.Y
        });

        this.headerFooterLayout.id.content.link(this.scrollview);
        this.headerFooterLayout.id.footer.link(this.inputSurface);

        this.pipe(this.scrollview);
        this._add(this.headerFooterLayout);

        this.collection.on('all', function(e,model,collection,options){
            switch(e){
                case 'sync-msg':
                    console.log('sync-msg');
                    this.loadMsg();
                    break;
            }
        });

        this.inputSurface.on('click', function(e){
            var target = $(e.target);
            if (target.hasClass("send-text-button")){
                this.addChat(document.getElementsByClassName('input-msg')[0].value);
            }
            this.loadMsg();
        }.bind(this));
    }

    ConversationView.prototype = Object.create(View.prototype);
    ConversationView.prototype.constructor = ConversationView;

    ConversationView.prototype.start = function(){
        //TODO: NOthing yet
    };

    ConversationView.prototype.loadMsg = function (){
        this.scrollview.sequenceFrom(this.collection.map(function(item){
            var surface = new ConversationItemView({model: item});
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this)));
    };

    ConversationView.prototype.addChat = function(content){
        var newMsg = {
            content: content,
//            class: [from],
//            type: type,
            time: Date.now()
        };
        console.log(newMsg);
        this.collection.create(newMsg);
    };

    module.exports = ConversationView;
});
