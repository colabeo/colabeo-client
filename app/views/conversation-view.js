// Import core Famous dependencies
var View = require('famous/view');
var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform          = require('famous/transform');
var Lightbox            = require('famous/views/light-box');
var Scrollview = require('famous/views/scrollview');
var Utility = require('famous/utilities/utility');
var HeaderFooterLayout = require('famous/views/header-footer-layout');
var Engine = require('famous/engine');
var SoundPlayer  = require('famous/audio/sound-player');
var Transitionable   = require('famous/transitions/transitionable');
var WallTransition   = require('famous/transitions/wall-transition');
Transitionable.registerMethod('wall', WallTransition);

var Templates    = require('templates');
var VerticalScrollView       = require('vertical-scroll-view');
var ConversationItemView   = require('conversation-item-view');

var ConversationCollection = require('models').ConversationCollection;
var ChatCollection = require('models').ChatCollection;

var Helper = require('helpers');

function ConversationView(appSettings, call) {

    View.call(this);

    this.setupBeepeTone();
    this.setupcall(appSettings,call);
    this.initHeader();
    this.initFooter();
    this.initConversation();
    this.setupLayout();
    this.setupTransition();
    this.loadMsg();
    this.onResize();
    this.collectionEvents();
    this.buttonsEvents();
    this.textingEvents();

    // TODO: hack, for Dev;
    this.inputSourceLocal=true;

    window.con = this;


    this._eventInput.on('incomingChat', function(evt){
        this.addRemote(evt.content);
    }.bind(this));
}

ConversationView.prototype = Object.create(View.prototype);
ConversationView.prototype.constructor = ConversationView;

ConversationView.prototype.setupBeepeTone = function(){
    this.messageTone = new SoundPlayer([
        'content/audio/beep.mp3'
    ]);
    this.playBeepe = _.debounce(function(){
        this.messageTone.playSound(0, 0.3);
    }.bind(this), 300);
};

ConversationView.prototype.setupcall = function(appSettings,call){
    this.appSettings = appSettings;

    this.appSettings.on({
        'change:video': this._eventOutput.emit('setVideo'),
        'change:audio': this._eventOutput.emit('setAudio')
    });

    this.call = call;
    
    if (!Helper.isDev()) {
        var url = appSettings.get('firebaseUrl') + 'chats/' + appSettings.get('cid')+ '/' + call.get('cid');
        this.collection = new ChatCollection([], {
            firebase: url
        });
    } else {
        this.collection = new ConversationCollection();
        this.call = undefined;
    }
};

ConversationView.prototype.initHeader = function(){
    this.exitSurface = new Surface({
        size:[window.innerWidth - 225, 50],
        classes:["conversation-exit"],
        content: Templates.conversationViewHeader(this.call),
        properties:{
            cursor: "pointer"
        }
    });
    this.exitSurface.pipe(this._eventOutput);
    this.exitSurfaceMod = new Modifier({
        transform:Transform.translate(0,0,3)
    });

    this.callSurface = new Surface({
        size:[225, 50],
        classes:["conversation-call"],
        content:'<div><i class="fa fa-phone fa-lg"></i></div>',
        properties:{
            cursor: "pointer"
        }
    });
    this.callSurfaceMod = new Modifier({
        origin:[1,0],
        transform: Transform.translate(0,0,4)
    });

    this.endCallSurface = new Surface({
        size:[75, 50],
        classes:['conversation-endCall'],
        content: '<div><i class="fa fa-phone fa-lg"></i></div>',
        properties:{
            cursor: "pointer"
        }
    });
    this.endCallSurface.pipe(this._eventOutput);
    this.endCallSurfaceMod = new Modifier({
        origin:[1,0],
        transform: Transform.translate(-150,0,3)
    }); 
    
    this.audioSurface = new Surface({
        size:[75, 50],
        classes:['conversation-audio'],
        properties:{
            cursor: "pointer"
        }
    });
    this.audioSurface.pipe(this._eventOutput);
    this.audioSurfaceMod = new Modifier({
        origin:[1,0],
        transform: Transform.translate(0,0,3)
    });

    this.cameraSurface = new Surface({
        size:[75, 50],
        classes:['conversation-camera'],
        properties:{
            cursor: "pointer"
        }
    });
    this.cameraSurfaceMod = new Modifier({
        origin:[1,0],
        transform: Transform.translate(-75,0,3)
    });
    this.cameraSurfaceSetContent();
    this.audioSurfaceSetContent();

    if (!Helper.isDev() && this.call.get('success')) {
        this.callSurfaceMod.setTransform(Transform.translate(225,0,0), this.buttonTransition);
    }
};

ConversationView.prototype.cameraSurfaceSetContent = function(){
    if (this.appSettings.attributes.video == true) {
        this.cameraSurface.setContent('<button class="fa fa-video-camera fa-lg on"></button>');
    } else {
        this.cameraSurface.setContent('<button class="fa fa-video-camera fa-lg off"></button>');
    }
};
ConversationView.prototype.audioSurfaceSetContent = function(){
    if (this.appSettings.attributes.audio == true) {
        this.audioSurface.setContent('<button class="fa fa-microphone fa-lg on"></button>');
    } else {
        this.audioSurface.setContent('<button class="fa fa-microphone fa-lg off"></button>');
    }
};

ConversationView.prototype.initFooter = function(){
    this.inputSurface = new Surface({
        size:[window.innerWidth - 100, 50],
        classes:['conversation-input-bar'],
        content: '<textarea class="input-msg" name="message"></textarea>',
        properties:{
            backgroundColor: "black"
        }
    });
    this.inputSurfaceMod = new Modifier({
        transform:Transform.translate(0,0,2)
    });

    this.sendSurface = new Surface({
        size:[100, 50],
        classes:['conversation-input-bar'],
        content: '<div><button class="send-text-button">Send</button></div>',
        properties:{
            backgroundColor: "black",
            cursor: "pointer"
        }
    });
    this.sendSurfaceMod = new Modifier({
        origin:[1,0],
        transform:Transform.translate(0,0,2)
    });
};

ConversationView.prototype.initConversation = function(){
    this.scrollview = new VerticalScrollView({
        startAt:'bottom',
        direction:Utility.Direction.Y
    });
    this.pipe(this.scrollview);
    this.scrollview.sequenceFrom([]);
    this.conversationLightbox = new Lightbox({
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
        overlap: false});
    this.conversationLightbox.show(this.scrollview);
};

ConversationView.prototype.setupLayout = function(){
    this.headerFooterLayout = new HeaderFooterLayout({
        headerSize:50,
        footerSize:50
    });
    this.backSurface = new Surface({
        classes:['backGroundSurface'],
        size:[undefined,undefined]
    });
    this.backSurfaceMod = new Modifier({
        transform:Transform.translate(0,0,0)
    });

    this.headerFooterLayout.id.header.add(this.exitSurfaceMod).add(this.exitSurface);
    this.headerFooterLayout.id.header.add(this.callSurfaceMod).add(this.callSurface);
    this.headerFooterLayout.id.header.add(this.endCallSurfaceMod).add(this.endCallSurface);
    this.headerFooterLayout.id.header.add(this.audioSurfaceMod).add(this.audioSurface);
    this.headerFooterLayout.id.header.add(this.cameraSurfaceMod).add(this.cameraSurface);
    this.headerFooterLayout.id.content.add(this.conversationLightbox);
//    this.headerFooterLayout.id.content.add(this.backSurfaceMod).add(this.backSurface);
    this.headerFooterLayout.id.footer.add(this.inputSurfaceMod).add(this.inputSurface);
    this.headerFooterLayout.id.footer.add(this.sendSurfaceMod).add(this.sendSurface);

    this._add(this.headerFooterLayout);
};

ConversationView.prototype.onResize = function(){
    var resizeTimeout;
    var onResize = function() {
        if (!this.scrollview) return;
        // just in case horizontal resize from wide to narrow
//        if (!Helpers.isMobile())
        this.scrollview.setVelocity(-99);
//        this.loadMsg();
    };
//        Engine.on('resize', onResize.bind(this));
    Engine.on('resize', function(){
//            if (Helpers.isMobile()) return;
        this.exitSurface.setSize([window.innerWidth-225,50]);
        this.inputSurface.setSize([window.innerWidth-100,50]);
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(onResize.bind(this), 300);
    }.bind(this));
};

ConversationView.prototype.setupTransition = function(){
    this.buttonTransition = {
        method: 'wall',
        period: 200,
        dampingRatio: 1
    }
};

ConversationView.prototype.stop = function(){
    this.collection.off();
};

ConversationView.prototype.collectionEvents = function(){
    this.collection.on('all', function(e,model,collection,options){
        switch(e){
            case 'add':
                this.addMsg(model);
                this.playBeepe();
                // only keep at most 100 messages
                if (this.collection.size()>=100) {
                    this.collection.shift();
                }
                this.showConversation();
                break;
        }
    }.bind(this));
};

ConversationView.prototype.buttonsEvents = function(){
    this.exitSurface.on('click', function(){
        this._eventOutput.emit('end-call', {exit:true});
    }.bind(this));

    this.callSurface.on('click', function(){
        this.callSurfaceMod.setTransform(Transform.translate(225,0,4), this.buttonTransition);
//        this._eventOutput.emit('outgoingCall',this.call);
    }.bind(this));

    this.endCallSurface.on('click', function(){
        this.callSurfaceMod.setTransform(Transform.translate(0,0,4), this.buttonTransition);
        this._eventOutput.emit('end-call', {exit:true});
    }.bind(this));

    this.audioSurface.on('click', function(){
        this.appSettings.save({audio : !this.appSettings.attributes.audio});
        this.audioSurfaceSetContent();
    }.bind(this));
    
    this.cameraSurface.on('click', function(){
        this.appSettings.save({video : !this.appSettings.attributes.video});
        this.cameraSurfaceSetContent();
    }.bind(this));

    this.sendSurface.on('click', function(){
        this.addChat();
    }.bind(this));

    this.backSurface.on('click',function(){
        this._eventOutput.emit('toggleMsg');
    }.bind(this));
};

ConversationView.prototype.textingEvents = function(){
    this.inputSurface.on('keyup', function(e){
        if (e.keyCode == 13 && this.inputSurface._currTarget.children[0].value != ''){
            this.addChat();
        }
    }.bind(this));

    this._eventInput.on('incomingChat', function(evt){
        this.addRemote(evt.content);
    }.bind(this));

    this._eventOutput.on('toggleMsg',function(){
        // TODO: no toggle for now
        return;
        if(this.conversationLightbox._showing) this.conversationLightbox.hide();
        else this.conversationLightbox.show(this.scrollview);
    }.bind(this));
};
ConversationView.prototype.createMsgItem = function(model){
    var surface = new ConversationItemView({model:model});
    surface.pipe(this._eventOutput);
    return surface;
};

ConversationView.prototype.loadMsg = function(){
    this.sequence = this.collection.map(function(item){
        return this.createMsgItem(item);
    }.bind(this));
    this.scrollview.sequenceFrom(this.sequence);
    setTimeout(function(){this.scrollview.scrollToEnd()}.bind(this),300);
};

ConversationView.prototype.addChat = function(){
    var message = document.getElementsByClassName('input-msg')[0].value;
    if (!message || message == '') return;
    document.getElementsByClassName('input-msg')[0].value = "";
    if (this.call) {
        // TODO: this is for testing
        if (Helper.isDev()) return;
        this._eventOutput.emit('sendChat', {contact: this.call, message: message});
    } else {
        // TODO: this is for testing
        this.inputSourceLocal = !this.inputSourceLocal;
        if (this.inputSourceLocal) this.addLocal(message);
        else this.addRemote(message);
    }
};

ConversationView.prototype.addLocal = function(message){
    var newMsg = {
        content:message,
        source:'local',
        type:'text',
        from: window._cola_g.cid,
        time:Date.now()
    };
    if (Helper.isDev()) {
        this.collection.create(newMsg);
        return;
    }
    this.collection.add(newMsg);
    this._eventOutput.emit('outgoingChat', newMsg);
};

ConversationView.prototype.addRemote = function(message){
    var newMsg = {
        content: message,
        source: 'remote',
        type: 'text',
        time: Date.now()
    };
    if (Helper.isDev()) {
        this.collection.create(newMsg);
        return;
    }
    this.collection.add(newMsg);
};

ConversationView.prototype.showConversation = function (){
    if (this.conversationLightbox._showing == false)
        this.conversationLightbox.show(this.scrollview);
};

ConversationView.prototype.addMsg = function(model){
    this.scrollview.push(this.createMsgItem(model));
    setTimeout(function(){this.scrollview.scrollToEnd()}.bind(this),300);
};

module.exports = ConversationView;
