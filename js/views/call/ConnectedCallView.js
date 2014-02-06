define(function(require, exports, module) {

    var View = require('famous/View');
    var Matrix       = require('famous/Matrix');
    var Surface = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var LightBox     = require('app/custom/LightBox');
    var Templates        = require('app/custom/Templates');
    var Easing = require('famous-animation/Easing');
    var ConversationView = require('views/conversation/ConversationView');
    var Call = require("app/models/Call");
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
            inTransform: Matrix.identity,
            inTransition: {duration: duration, curve: Easing.inQuadNorm()},
            inOpacity: 0,
            inOrigin: [0.5, 0.9],
            outTransform: Matrix.identity,
            outOpacity: 0,
            outOrigin: [0.5, 0.9],
            outTransition: {duration:duration, curve: Easing.outQuadNorm()},
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.9]
//            overlap:true
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

        this.conversationView = new ConversationView();
        this.conversationView.pipe(this.eventOutput);
        this.eventInput.pipe(this.conversationView);

        this.footer.on('click', function(e) {
            var target = $(e.target);
            console.log(target);
            if (target.hasClass("end-button")) {
                this.stop(target);
            }
            else if (target.hasClass("sync-button")) {
                this.eventOutput.emit('sync');
                $('.sync-button').removeClass('synced').addClass('syncing');
            }
        }.bind(this));

        this.backSurface.on('click',function(e){
            this.footerLightBox.show(this.conversationView,true);
        }.bind(this))

        this.eventOutput.on('exit-conversation', this.onExitConversation);
        this.eventInput.on('incomingChat', function(evt) {
            console.log("incomingChat ConnectedCallView", evt);
        }.bind(this));
    }

    ConnectedCallView.prototype = Object.create(View.prototype);
    ConnectedCallView.prototype.constructor = ConnectedCallView;

    ConnectedCallView.prototype.start = function(appSetting) {
        this.model = this.collection.models[0] || new Call();
        this.appSettings = appSetting;
        // myId hisID
        console.log(this.model,this.appSettings);
//        this.conversationView.
        $('.camera').removeClass('blur');
        this.footerLightBox.show(this.conversationView);

        var videoButton = Templates.toggleButton({
            id: 'video',
            classes: ["video-button", "big-button"],
            checked: this.appSettings?this.appSettings.get('video'):true,
            onContent: '<i class="fa fa-eye fa-lg"></i>',
            offContent: '<i class="fa fa-eye-slash fa-lg"></i>',
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
            onContent: '<i class="fa fa-microphone fa-lg"></i>',
            offContent: '<i class="fa fa-microphone-slash fa-lg"></i>',
            onBackgroundColor: '#dadbd9',
            offBackgroundColor: '#dadbd9',
            size: [70,70]
        });
        var html = '<div class="box">' + videoButton + endButton + audioButton + syncButton + '</div>';
        this.footer.setContent(html);
    };

    ConnectedCallView.prototype.stop = function(button) {
        if (button) button.addClass('exiting');
        setTimeout(function() {
            this.footerLightBox.hide();
            this.eventOutput.emit('showApp',function(){
                if (button) button.removeClass('exiting');
            });
        }.bind(this), duration);
        if (button) {
            this.eventOutput.emit('outgoingCallEnd', this.model);
            this.eventOutput.emit('incomingCallEnd', this.model);
        }
    };

    ConnectedCallView.prototype.onExitConversation = function(){
        this.footerLightBox.show(this.footer)
    }

    module.exports = ConnectedCallView;

});