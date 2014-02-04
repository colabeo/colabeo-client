define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('app/custom/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ConversationItemView  = require('views/Conversation/ConversationItemView');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');

    Scrollview.prototype.scrollToEnd = function() {
        var arrays = _.values(this._offsets);
        var i = 1;
        while (i != arrays.length && _.last(arrays) - arrays[arrays.length - i] < this.getSize()[1]) i++;
        console.log(i,_.last(arrays) - arrays[arrays.length - i] - this.getSize()[1]);
        this.node.index = arrays.length - i;
        setTimeout(function(){this.setPosition(_.last(arrays) - arrays[arrays.length - i] - this.getSize()[1])}.bind(this),10);
    };

    function ConversationView(options) {

        View.call(this);

        this.inputSourceLocal=true;

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
            this.addLocal("What's ff aafa");
            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
            this.addLocal('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
            this.addLocal("What's ff aafa");
            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
            this.addLocal('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');

        }.bind(this),1000);


        this.collection.on('all', function(e,model,collection,options){
            switch(e){
                case 'add':
                    this.addMsg(model);
                    break;
                case 'sync':
//                    this.loadMsg();
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
        this.scrollview.sequenceFrom(sequence);
    };

    ConversationView.prototype.addMsg = function (model){
        var surface = new ConversationItemView({model: model});
        surface.pipe(this.eventOutput);
        this.scrollview.node.push(surface);
    };

    ConversationView.prototype.addChat = function(){
        if (document.getElementsByClassName('input-msg')[0].value == "") return;
        var message= document.getElementsByClassName('input-msg')[0].value;
        document.getElementsByClassName('input-msg')[0].value = "";

        // TODO: this is a hack
        this.inputSourceLocal = !this.inputSourceLocal;
        if (this.inputSourceLocal) this.addLocal(message);
        else this.addRemote(message);
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
