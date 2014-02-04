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

        this.loadMsg();

        //TODO: will delete this part
        setTimeout(function(){
            this.addRemote('Hi');
            this.addLocal("What's going on? WE waaa fawefaf af faa aff aafa");
            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
            this.addLocal('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
        }.bind(this),1000);


        this.collection.on('all', function(e,model,collection,options){
            switch(e){
                case 'add':
                case 'sync':
                    this.curIndex = this.scrollview.getCurrentNode().index;
                    this.curPosition = this.scrollview.getPosition();
                    this.loadMsg();
//                    this.scrollTo(this.curIndex,this.curPosition);
                    break;
            }
        }.bind(this));

        this.inputSurface.on('click', function(e){
            var target = $(e.target);
            if (target.hasClass("send-text-button")){
                this.addChat();
            }
        }.bind(this));
        this.inputSurface.on('keyup', function(e){
            if (e.keyCode == 13){
                this.addChat();
            }
        }.bind(this));
    }

    ConversationView.prototype = Object.create(View.prototype);
    ConversationView.prototype.constructor = ConversationView;

    ConversationView.prototype.start = function(){
        //TODO: NOthing yet
    };

    ConversationView.prototype.loadMsg = function (){
        var sequence =  this.collection.map(function(item){
            var surface = new ConversationItemView({model: item});
            surface.pipe(this.eventOutput);
            console.log(surface.getSize(true));
            return surface;
        }.bind(this))

        var msgHeight = 0;

        for (var ii=0; ii<sequence.length; ii++){
            msgHeight = msgHeight + sequence[ii].getSize()[1];
            console.log(msgHeight);
            if (msgHeight >= this.scrollview.getSize()[1]) {
                msgHeight = 0;
                break
            }
        }
//
//        if (msgHeight != 0) {
//            console.log('ys empty' + msgHeight);
//            this.emptySurface = new Surface({
//                size:[undefined, this.scrollview.getSize()[1]-msgHeight],
//                properties:{
//                    backgroundColor: "rgba(12,144,55,0.4)"
//                }
//            });
//            this.emptySurface.pipe(this.scrollview);
//
//            var templateSequence = []
////            templateSequence.push(this.emptySurface);
//
//            for (var ii=0; ii<sequence.length; ii++){
//                templateSequence.push(sequence[ii])
//            }
//
//            sequence = templateSequence;
//
//        } else {this.emptySurface = undefined};

        this.scrollview.sequenceFrom(sequence);

//        this.scrollview.setVelocity(0);
//        this.scrollview.node.index = 0;
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
        this.collection.add(newMsg);
    };

    ConversationView.prototype.scrollTo = function(index, position) {
        if (index<0) return;
        this.scrollview.setVelocity(0);
        if (this.emptySurface) {
            this.scrollview.node.index = 0;
            this.scrollview.setPosition(0);
        } else {
            this.scrollview.node.index = index+1;
            if (!position) position = 0;
            this.scrollview.setPosition(position);
        }
    };

    //TODO: will delete this part
    ConversationView.prototype.addRemote = function(Sth){
        var newMsg = {
            content: Sth,
            source: 'remote',
            time: Date.now()
        };
        this.collection.add(newMsg);
    };

    ConversationView.prototype.addLocal = function(Sth){
        var newMsg = {
            content: Sth,
            source: 'local',
            time: Date.now()
        };
        this.collection.add(newMsg);
    };

    module.exports = ConversationView;
});
