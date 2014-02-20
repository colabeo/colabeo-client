var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface');
var EventHandler = require('famous/event-handler');
var Easing = require('famous/transitions/easing');

var LightBox = require('light-box');
var Templates = require('templates');

var Call = require("models").Call;
var ConversationView = require('conversation-view');

var duration = 500;

function ConnectedCallView(options){

    View.call(this);
    this.collection = options.collection;

    this.backSurface = new Surface({
        size: [undefined,undefined],

        properties:{
            backgroundColor:'transparent',
            zIndex:-1
        }
    });

    this.footerLightBox = new LightBox({
        inTransform: Transform.identity,
        inTransition: {duration: duration, curve: Easing.inQuad()},
        inOpacity: 0,
        inOrigin: [0.5, 0.9],
        outTransform: Transform.identity,
        outOpacity: 0,
        outOrigin: [0.5, 0.9],
        outTransition: {duration:duration, curve: Easing.outQuad()},
        showTransform: Transform.identity,
        showOpacity: 1,
        showOrigin: [0.5, 0.9]
//            overlap:true
    });

    this.conversationLightBox = new LightBox({
        inTransform: Transform.identity,
        inTransition: {duration: duration, curve: Easing.inQuad()},
        inOpacity: 0,
        inOrigin: [0.5, 0.9],
        outTransform: Transform.identity,
        outOpacity: 0,
        outOrigin: [0.5, 0.9],
        outTransition: {duration:duration, curve: Easing.outQuad()},
        showTransform: Transform.identity,
        showOpacity: 1,
        showOrigin: [0.5, 0.9]
    });

    // Set up event handlers
    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    this.footer = new Surface({
        classes: ['connected-call-view-buttons'],
        size: [undefined, 80],
        properties: {
            backgroundColor: 'transparent',
            zIndex:3,
            opacity:0
        }
    });

    this._add(this.backSurface);
    this._add(this.footerLightBox);
    this._add(this.conversationLightBox);

    this.footer.on('click', function(e) {
        var target = $(e.target);
        if (target.hasClass("end-button")) {
            this.stop(target);
        }
        else if (target.hasClass("sync-button")) {
            this.eventOutput.emit('sync');
            $('.sync-button').removeClass('synced').addClass('syncing');
        }
    }.bind(this));

//        this.backSurface.on('click',function(e){
//            this.footerLightBox.show(this.conversationView,true);
//        }.bind(this))

    this.eventOutput.on('menu-toggle-button', this.onMenuToggleButton);
    this.eventOutput.on('end-call', this.stop);
}

ConnectedCallView.prototype = Object.create(View.prototype);
ConnectedCallView.prototype.constructor = ConnectedCallView;

ConnectedCallView.prototype.start = function(appSetting) {

    this.conversationView = new ConversationView();
    this.conversationView.pipe(this.eventOutput);
    this.eventInput.pipe(this.conversationView);
    this.conversationLightBox.show(this.conversationView)

    this.model = this.collection.models[0] || new Call();
    this.appSettings = appSetting;
    // myId hisID
//        this.conversationView.
    $('.camera').removeClass('blur');

    var videoButton = Templates.toggleButton({
        id: 'video',
        classes: ["video-button", "big-button"],
        checked: this.appSettings?this.appSettings.get('video'):true,
        onContent: '<i class="fa fa-eye fa-lg on"></i>',
        offContent: '<i class="fa fa-eye-slash fa-lg off"></i>',
        onBackgroundColor: '#dadbd9',
        offBackgroundColor: '#dadbd9',
        size: [70,70]
    });
    var syncButton = Templates.button({
        classes: ["sync-button", "big-button"],
        content: '<i class="sync-button fa fa-refresh fa-2x"></i>',
        size: [40,40]
    });
    var endButton = Templates.button({
        classes: ["end-button", "big-button"],
        content: 'End',
        size: [160,70]
    });
    var audioButton = Templates.toggleButton({
        id: 'audio',
        classes:["audio-button", "big-button"],
        checked: this.appSettings?this.appSettings.get('audio'):true,
        onContent: '<i class="fa fa-microphone fa-lg on"></i>',
        offContent: '<i class="fa fa-microphone-slash fa-lg off"></i>',
        onBackgroundColor: '#dadbd9',
        offBackgroundColor: '#dadbd9',
        size: [70,70]
    });
    var html = '<div class="box">' + videoButton + endButton + audioButton + '</div>';
    this.footer.setContent(html);

    this.footerLightBox.show(this.footer);

};

ConnectedCallView.prototype.stop = function(button) {
    if (button) button.addClass('exiting');
    this.conversationLightBox.hide();
    this.footerLightBox.hide();
    setTimeout(function() {
        this.eventOutput.emit('showApp',function(){
            if (button) button.removeClass('exiting');
        });
    }.bind(this), duration);
    if (button) {
        this.eventOutput.emit('outgoingCallEnd', this.model);
        this.eventOutput.emit('incomingCallEnd', this.model);
    }
};

ConnectedCallView.prototype.onMenuToggleButton = function(toHide){
    if (toHide === true) {
        this.footerLightBox.hide();
    } else {
        this.footerLightBox.show(this.footer);
    }
};

module.exports = ConnectedCallView;
