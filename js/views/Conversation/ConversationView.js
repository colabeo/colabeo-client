define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Utils            = require('famous-utils/Utils');
    var Surface          = require('app/custom/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var Conversation = require('app/models/Conversation');
    var ConversationCollection = require('app/models/ConversationCollection');
    var ConversationItemView  = require('views/conversation/ConversationItemView');
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Engine           = require('famous/Engine');
    var EventHandler = require('famous/EventHandler');
    var LightBox = require('app/custom/LightBox');
    var Matrix = require('famous/Matrix');

    Scrollview.prototype.scrollToEnd = function() {
        var lastNode = this.node.array.length-1;
        var currNode = this.node.index;
        var screenSize = this.getSize()[1];
        var currPos = this.getPosition();
        var heightArray = this.node.array.map(function(d){
            if (d.getSize()[1]===true) return 100;
            return d.getSize()[1];
        });

        var totalPixelsToMove = _(heightArray).last(lastNode-currNode + 1).sum() - currPos - screenSize + 100;

        // 200ms animation, so avgVelocity = totalPixelsToMove/200ms, so v = 2*avgVelocity
        var v = Math.max(2*totalPixelsToMove/200,0);
        console.log(v);
        // TODO: hack, so it will never onEdge when scrollToEnd
        var pos = this.getPosition();
        if (this._onEdge==-1) {
            this.setPosition(pos+20);
        } else if (this._onEdge==1) {
            this.setPosition(pos-20);
        }
        Engine.defer(function(){this.setVelocity(v)}.bind(this));
    };

    function ConversationView() {

        View.call(this);

        this.inputSourceLocal=true;

        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: 0,
            footerSize: 50
        });

        this.inputSurface = new Surface({
            size:[undefined, this.headerFooterLayout.footerSize],
            classes: ['conversation-input-bar'],
            content: '<div><button class="fa fa-comments-o menu-toggle-button fade"></button><button class="fa fa-phone menu-end-button"></button><input type = "text"  class="input-msg" name="message"><button class="send-text-button">Send</button></div>',
            properties:{
                backgroundColor: '#000',
                opacity: 0.9,
                zIndex: 4
            }
        });

        this.contentLightBox = new LightBox({
            inTransform: Matrix.identity,
            inOpacity: 0,
            inOrigin: [0.0, 0.0],
            outTransform: Matrix.identity,
            outOpacity: 0,
            outOrigin: [0.0, 0.0],
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [0.0, 0.0],
            inTransition: true,
            outTransition: true,
            overlap: false
        });

        this.collection = new ConversationCollection();
        this.scrollview = new Scrollview({
            direction: Util.Direction.Y
        });

        this.headerFooterLayout.id.content.link(this.contentLightBox);
        this.headerFooterLayout.id.footer.link(this.inputSurface);

        this.pipe(this.scrollview);
        this._add(this.headerFooterLayout);

        this.emptyViews = this.makeEmptySurface(this.scrollview.getSize()[1]);

        this.scrollview.sequenceFrom(this.emptyViews);
        this.scrollview.scrollToEnd();
        // init empty surface
        this.loadMsg();

        this.BlueMenuToggleButton = false;

        this.collection.on('all', function(e,model,collection,options){
            switch(e){
                case 'add':
                    this.addMsg(model);
                    break;
            }
        }.bind(this));

        this.inputSurface.on('click', function(e){
            var target = $(e.target);
            if (target.hasClass("send-text-button")) this.addChat();
            else if (target.hasClass("menu-toggle-button")) {
                this.toggleMenuToggleButton(this.BlueMenuToggleButton);
                this.eventOutput.emit('menu-toggle-button', this.BlueMenuToggleButton);
            } else if (target.hasClass("menu-end-button")) {
                this.eventOutput.emit('end-call',$('.someRandomNull'));
            } else if ($('input')[0].tagName == 'INPUT') {
                this.toggleMenuToggleButton(false);
                this.eventOutput.emit('menu-toggle-button', true);
            }
        }.bind(this));

        this.inputSurface.on('keyup', function(e){
            if (e.keyCode == 13){
                this.addChat();
            }
        }.bind(this));

//        window.scrollview = this.scrollview;
//        window.con = this;
        var resizeTimeout;
        var onResize = function() {
            if (!this.scrollview) return;
            // just in case horizontal resize from wide to narrow
            if (!Utils.isMobile()) this.scrollview.setVelocity(-99);
            this.loadMsg();
        }
//        Engine.on('resize', onResize.bind(this));
        Engine.on('resize', function(e){
//            if (Utils.isMobile()) return;
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(onResize.bind(this), 300);
        }.bind(this));

        this.eventInput.on('incomingChat', function(evt){
            this.addRemote(evt.content);
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
//        this.scrollview.node.splice(this.scrollview.node.array.length-1, 0, surface);

//        Engine.defer(this.scrollview.scrollToEnd.bind(this.scrollview));
        setTimeout(function(){this.scrollview.scrollToEnd()}.bind(this),300);
//        setTimeout(this.emptySurfaceResize.bind(this), 100);
    };

    ConversationView.prototype.loadMsg = function (){
        var sequence =  this.collection.map(function(item){
            var surface = new ConversationItemView({model: item});
            surface.pipe(this.eventOutput);
            return surface;
        }.bind(this));
        sequence = this.emptyViews.concat(sequence);
        this.scrollview.sequenceFrom(sequence);

        setTimeout(function(){this.scrollview.scrollToEnd()}.bind(this),300);
//        Engine.defer(this.scrollview.scrollToEnd.bind(this.scrollview));
//        if (!Utils.isMobile()) setTimeout(function(){ this.emptySurfaceResize();}.bind(this),300);
    };

    ConversationView.prototype.addChat = function(){
        if (document.getElementsByClassName('input-msg')[0].value == "") return;
        var message= document.getElementsByClassName('input-msg')[0].value;
        document.getElementsByClassName('input-msg')[0].value = "";

        // TODO: this is for testing
//        this.inputSourceLocal = !this.inputSourceLocal;
        if (this.inputSourceLocal) this.addLocal(message);
        else this.addRemote(message);
    };

    //TODO: will delete this part
    ConversationView.prototype.addRemote = function(message){
        var newMsg = {
            content: message,
            source: 'remote',
            type: 'text',
            time: Date.now()
        };
        this.toggleMenuToggleButton(false);
        this.eventOutput.emit('menu-toggle-button', true);
        this.collection.add(newMsg);
    };

    ConversationView.prototype.addLocal = function(message){
        var newMsg = {
            content: message,
            source: 'local',
            type: 'text',
            time: Date.now()
        };
        this.collection.add(newMsg);
        this.toggleMenuToggleButton(false);
        this.eventOutput.emit('menu-toggle-button', true);
        this.eventOutput.emit('outgoingChat', newMsg);
    };

    ConversationView.prototype.makeEmptySurface = function (screenHeight){
        var views = [];
        for (var i = 0; i< 10; i++) {
            var emptyView = new View({})
            var emptySurface = new Surface({
                size: [undefined, screenHeight/10],
                properties:{
                background: "transparent"
                    // TODO: TEST
//                    background: "yellow"
                }
            });
            emptySurface.pipe(this.eventOutput);
            emptyView._link(emptySurface);
            views.push(emptyView);
        }
        return views;
    };

    ConversationView.prototype.emptySurfaceResize = function (){
        var heightArray = this.scrollview.node.array.map(function(item){return item.getSize()[1]});
        heightArray.shift();
        var totalHeight = _.reduce(heightArray,function(memo,num){return memo + num}, 0);
        var height = this.scrollview.getSize()[1] - totalHeight;
        if (height < 0) height = 0;
        // make sure the content is at less 1px longer than the scrollview
        console.log(height);
//        this.emptySurface.setSize([undefined, height]);
        this.emptyViews = this.makeEmptySurface(height);
    };

    ConversationView.prototype.emptySurfaceResize1 = function (){
        var heightArray = this.scrollview.node.array.map(function(item){return item.getSize()[1]});
        heightArray.pop();
        var totalHeight = _.reduce(heightArray,function(memo,num){return memo + num}, 0);
        var height = this.scrollview.getSize()[1] - totalHeight;
        if (height < 0) height = 0;
        // make sure the content is at less 1px longer than the scrollview
        height ++;
        console.log(height);
        this.emptySurface.setSize([undefined, height]);
    };

    ConversationView.prototype.toggleMenuToggleButton = function (Blue){
        if (Blue === true) {
            this.setConversationOff();
        }
        else {
            this.setConversationOn();
        }
    };

    ConversationView.prototype.setConversationOff = function (){
        $('.menu-toggle-button').addClass('fade');
        $('.menu-end-button').removeClass('toShow');
        $('.input-msg').removeClass('short');
        this.contentLightBox.hide();
        this.BlueMenuToggleButton = false;
    };

    ConversationView.prototype.setConversationOn = function (){
        $('.menu-toggle-button').removeClass('fade');
        $('.menu-end-button').addClass('toShow');
        $('.input-msg').addClass('short');
        if (!this.contentLightBox._showing) this.contentLightBox.show(this.scrollview);
    };

    module.exports = ConversationView;
});
