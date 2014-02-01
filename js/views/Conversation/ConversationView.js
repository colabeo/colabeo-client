define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('app/custom/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ConversationItemView  = require('views/Conversation/ConversationItemView');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');

    function ConversationView(options) {

        View.call(this);

        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: 0,
            footerSize: 50
        });

        this.inputSurface = new Surface({
            size:[undefined, this.headerFooterLayout.footerSize],
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
                this.addChat();
            }
            this.loadMsg();
        }.bind(this));
        this.inputSurface.on('keyup', function(e){
            if (e.keyCode == 13){
                this.addChat();
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
//        this.scrollview.setVelocity(0);
//        this.scrollview.node.index = this.collection.length - 1;
//        this.scrollview.setPosition (0);
    };

    ConversationView.prototype.addChat = function(){
        if (document.getElementsByClassName('input-msg')[0].value == "") return;
        var newMsg = {
            content: document.getElementsByClassName('input-msg')[0].value,
//            class: [from],
//            type: type,
            time: Date.now()
        };
        document.getElementsByClassName('input-msg')[0].value = "";
        this.collection.create(newMsg);
    };

    module.exports = ConversationView;
});
