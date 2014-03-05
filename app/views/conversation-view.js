// Import core Famous dependencies
var View               = require('famous/view');
var Utility            = require('famous/utilities/utility');
var Utils              = require('famous/utilities/utils');
var Scrollview         = require('famous/views/scrollview');
var HeaderFooterLayout = require('famous/views/header-footer-layout');
var Engine             = require('famous/engine');
var Transform          = require('famous/transform');
var Surface            = require('famous/surface');
var SoundPlayer  = require('famous/audio/sound-player');

var LightBox = require('light-box');
var Templates    = require('templates');
var VerticalScrollView       = require('vertical-scroll-view');

var ConversationCollection = require('models').ConversationCollection;
var ChatCollection = require('models').ChatCollection;
var ConversationItemView   = require('conversation-item-view');

function ConversationView(appSettings, callee) {

    View.call(this);
    this.callee = callee;
    this.messageTone = new SoundPlayer([
        'content/audio/beep.mp3'
    ]);

    this.inputSourceLocal=true;

    this.headerFooterLayout = new HeaderFooterLayout({
        headerSize: 0,
        footerSize: 50
    });

    this.inputSurface = new Surface({
        size:[undefined, this.headerFooterLayout.footerSize],
        classes: ['conversation-input-bar'],
        content: Templates.conversationInputBar(),
        properties:{
            backgroundColor: '#000',
            opacity: 0.9,
            zIndex: 4
        }
    });

    this.contentLightBox = new LightBox({
        inTransform: Transform.identity,
        inOpacity: 0,
        inOrigin: [0.0, 0.0],
        outTransform: Transform.identity,
        outOpacity: 0,
        outOrigin: [0.0, 0.0],
        showTransform: Transform.identity,
        showOpacity: 1,
        showOrigin: [0.0, 0.0],
        inTransition: true,
        outTransition: true,
        overlap: false
    });

    if (callee) {
            var url = appSettings.get('firebaseUrl') + 'chats/' + appSettings.get('cid')+ '/' + callee;
        this.collection = new ChatCollection([], {
            firebase: url
        });
    } else {
        this.collection = new ConversationCollection();
    }

    this.scrollview = new VerticalScrollView({
        startAt:'bottom',
        direction: Utility.Direction.Y
    });

    this.headerFooterLayout.id.content.add(this.contentLightBox);
    this.headerFooterLayout.id.footer.add(this.inputSurface);

    this.pipe(this.scrollview);
    this._add(this.headerFooterLayout);

    this.loadMsg();

    this.collection.on('all', function(e,model,collection,options){
        switch(e){
            case 'add':
                this.addMsg(model);
                this.messageTone.playSound(0, 0.3);
                break;
        }
    }.bind(this));

    this.inputSurface.on('click', function(e){
        var target = $(e.target);
        if (target.hasClass("send-text-button")) this.addChat();
        else if (target.hasClass("menu-toggle-button")) {
            this.toggleMenuToggleButton();
        } else if (target.hasClass("menu-end-button")) {
            this.eventOutput.emit('end-call',$('.someRandomNull'));
        } else if (target.hasClass("input-msg")) {
            this.setConversationOn();
        }
    }.bind(this));

    this.inputSurface.on('keyup', function(e){
        if (e.keyCode == 13){
            this.addChat();
        }
    }.bind(this));

//        window.scrollview = this.scrollview;
        window.con = this;
    var resizeTimeout;
    var onResize = function() {
        if (!this.scrollview) return;
        // just in case horizontal resize from wide to narrow
//        if (!Utils.isMobile())
            this.scrollview.setVelocity(-99);
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
    this.scrollview.push(surface);
//        this.scrollview.node.splice(this.scrollview.node.array.length-1, 0, surface);

//        Engine.defer(this.scrollview.scrollToEnd.bind(this.scrollview));
    setTimeout(function(){this.scrollview.scrollToEnd()}.bind(this),300);
};

ConversationView.prototype.loadMsg = function (){
    var sequence =  this.collection.map(function(item){
        var surface = new ConversationItemView({model: item});
        surface.pipe(this.eventOutput);
        return surface;
    }.bind(this));
    this.scrollview.sequenceFrom(sequence);

    setTimeout(function(){this.scrollview.scrollToEnd()}.bind(this),300);
};

ConversationView.prototype.addChat = function(){
    var message= document.getElementsByClassName('input-msg')[0].value;
    if (!message) return;
    document.getElementsByClassName('input-msg')[0].value = "";
    if (this.callee) {
        this.eventOutput.emit('sendChat', {id: this.callee, message: message});
    } else {
        // TODO: this is for testing
//        this.inputSourceLocal = !this.inputSourceLocal;
        if (this.inputSourceLocal) this.addLocal(message);
        else this.addRemote(message);
    }
};

ConversationView.prototype.addRemote = function(message){
    var newMsg = {
        content: message,
        source: 'remote',
        type: 'text',
        time: Date.now()
    };
    this.setConversationOn();
    this.collection.add(newMsg);
};

ConversationView.prototype.addLocal = function(message){
    var newMsg = {
        content: message,
        source: 'local',
        type: 'text',
        from: _cola_g.cid,
        time: Date.now()
    };
    this.collection.add(newMsg);
    this.setConversationOn();
    this.eventOutput.emit('outgoingChat', newMsg);
};

ConversationView.prototype.toggleMenuToggleButton = function (){
    if ($('.menu-toggle-button').hasClass('fade')) {
        this.setConversationOn();
    }
    else {
        this.setConversationOff();
    }
};

ConversationView.prototype.setConversationOff = function (){
    $('.menu-toggle-button').addClass('fade');
    $('.menu-end-button').removeClass('toShow');
    $('.input-msg').removeClass('short');
    this.contentLightBox.hide();
    this.eventOutput.emit('menu-toggle-button', false);
};

ConversationView.prototype.setConversationOn = function (){
    $('.menu-toggle-button').removeClass('fade');
    $('.menu-end-button').addClass('toShow');
    $('.input-msg').addClass('short');
    if (!this.contentLightBox._showing) this.contentLightBox.show(this.scrollview);
    this.eventOutput.emit('menu-toggle-button', true);
};

module.exports = ConversationView;
