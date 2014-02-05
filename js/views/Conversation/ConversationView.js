define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('app/custom/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var ConversationItemView  = require('views/Conversation/ConversationItemView');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Engine           = require('famous/Engine');

    Scrollview.prototype.scrollToEnd = function(emptySurfaceHeight) {
        var speed = 1; // 1 per node
        var nodeHeight = 72;
        var lastNode = this.node.array.length;
        var currNode = this.node.index;
        var screenSize = this.getSize()[1];
        if (emptySurfaceHeight == 0) {
            var v = (lastNode - (currNode + Math.floor(screenSize/nodeHeight))) * speed
            console.log(v)
            this.setVelocity(v);
        }


///////// Old method: shifting node.index and position.
//        var i = 0;
//        var height = 0;
//        while (i < heightArray.length && height < this.getSize()[1]){
//            i++;
//            // sum the height of the last i surfaces;
//            height = _.reduce(_.last(heightArray, i),function(memo, num){return memo + num;},0);
//        }
//        var position = height - this.getSize()[1];
//        console.log(heightArray.length- i, position);
//        this.node.index = heightArray.length - i;
//        Engine.nextTick(function(){
//            this.setPosition(position-1);
//        }.bind(this));
//////////////////////////////////////
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

        this.emptySurface = this.makeEmptySurface(0, this.scrollview.getSize()[1])

        this.scrollview.sequenceFrom([this.emptySurface]);

        //TODO: will delete this part
        setTimeout(function(){
//            this.addRemote('Hi');
//            this.addLocal("What's ff aafa");
//            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
//            this.addLocal('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
//            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
//            this.addLocal("What's ff aafa");
//            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
//            this.addLocal('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');
//            this.addRemote('Aafs afw faaw faa afaffafewffa afffzefafaf afaffwa fawewfwaf asfa fffafaefagrag faefaefa');

        }.bind(this),1000);


        this.collection.on('all', function(e,model,collection,options){
            switch(e){
                case 'add':
                    this.addMsg(model);
                    setTimeout(function(){this.scrollview.scrollToEnd(this.emptySurface.getSize()[1])}.bind(this),100);
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

        Engine.on('resize', function(e){
            this.emptySurfaceResize();
            console.log(this.emptySurface.getSize())
        }.bind(this));
    }

    ConversationView.prototype = Object.create(View.prototype);
    ConversationView.prototype.constructor = ConversationView;

    ConversationView.prototype.start = function(){
        //TODO: NOthing yet
    };

    ConversationView.prototype.addMsg = function (model){
        var surface = new ConversationItemView({model: model});
        surface.pipe(this.eventOutput);
        this.scrollview.node.push(surface);
        setTimeout(function(){this.emptySurfaceResize()}.bind(this),100);
    };

    ConversationView.prototype.addChat = function(){
        if (document.getElementsByClassName('input-msg')[0].value == "") return;
        var message= document.getElementsByClassName('input-msg')[0].value;
        document.getElementsByClassName('input-msg')[0].value = "";

        // TODO: this is a hack
        this.inputSourceLocal = !this.inputSourceLocal;
        if (this.inputSourceLocal) this.addLocal(message);
        else this.addRemote(message);
//        Engine.nextTick(function(){this.scrollview.scrollToEnd()}.bind(this));
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

    ConversationView.prototype.makeEmptySurface = function (arraysHeight, screenHeight){
        var emptySurface = new Surface({
            size: [undefined, screenHeight - arraysHeight],
            properties:{
                backgroundColor: "yellow"
            }
        })
        return emptySurface;
    };

    ConversationView.prototype.emptySurfaceResize = function (){
        var heightArray = this.scrollview.node.array.map(function(item){return item.getSize()[1]});
        heightArray.shift();
        var totalHeight = _.reduce(heightArray,function(memo,num){return memo + num}, 0);
        var height = this.scrollview.getSize()[1] - totalHeight;
        if (height < 0) height = 0;
        this.emptySurface.setSize([undefined, height]);
    };

    module.exports = ConversationView;
});
