define(function(require, exports, module) {
    // Import core Famous dependencies
    var View = require('famous/View');
    var Matrix       = require('famous/Matrix');
    var Surface = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var LightBox     = require('app/custom/LightBox');
    var Templates        = require('app/custom/Templates');
    var Easing = require('famous-animation/Easing');
    var Contact = require("app/models/Contact");
    var Call = require("app/models/Call");
    var SoundPlayer = require('famous-audio/SoundPlayer');
    var duration = 500;

    function IncomingCallView(options) {
        View.call(this);
        this.collection = options.collection;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.headerLightBox = new LightBox({
            inTransition:false,
            outTransition:false,
            showOrigin: [0.5, 0.1]
        });

        this.footerLightBox = new LightBox({
            inTransform: Matrix.translate(0, 900, 0),
            inTransition: {duration: duration, curve: Easing.inQuadNorm()},
            inOpacity: 0,
            inOrigin: [0.5, 0.5],
            outTransform: Matrix.translate(0, 900, 0),
            outOpacity: 0,
            outOrigin: [0.5, 0.5],
            outTransition: {duration:duration, curve: Easing.outQuadNorm()},
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.9]
        });

        this.header = new Surface({
            classes:['outgoing-call-view'],
            size: [undefined, 300],
            _origin:[0.5,-0.5],
            properties: {
                backgroundColor: 'transparent'
            }
        });

        var declineButton = Templates.button({
            classes:["decline-button", "big-button"],
            checked:true,
            content:'Decline',
            size:[160,70]
        })
        var answerButton = Templates.button({
            classes:["answer-button", "big-button"],
            checked:true,
            content:'Answer',
            size:[160,70]
        })

        this.footer = new Surface({
            classes: ['incoming-call-view-buttons'],
            size: [undefined, 80],
            properties: {
                backgroundColor: 'transparent'
            },
            content: '<div class="box">' + declineButton + answerButton + '</div>'
        });

        this._add(this.headerLightBox);
        this._add(this.footerLightBox);

        _.bindAll(this, 'template');
        this.collection.bind('add', this.template);

        this.ringtone = new SoundPlayer([
            'content/audio/ringtone.mp3'
        ]);

        this.footer.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("decline-button")) {
                this.stop();
            }
            else if (target.hasClass("answer-button")) {
                this.accept();
            }
        }.bind(this));

        this.eventInput.on('incomingCall', function() {
//            console.log("incomingCall");
        });
        this.eventInput.on('incomingCallAnswerClick', function() {
            this.accept();
        }.bind(this));
    }

    IncomingCallView.prototype = Object.create(View.prototype);
    IncomingCallView.prototype.constructor = IncomingCallView;

    IncomingCallView.prototype.template = function() {
        this.model = this.collection.models[0] || new Call();
        var html = '<div class="box">';

        html += '<div class="caller-name">' + this.model.get('firstname') + " " + this.model.get('lastname') + "</div>";

        if (this.model.get('pictureUrl'))
            html += '<img class="caller-picture" src="' + this.model.get('pictureUrl') + '"></img>';
        else {
            var initial = this.model.get('firstname')[0] + this.model.get('lastname')[0];
            html += '<div class="initial">'+initial+'</div>';
        }

        html += '<div class="caller-info"></div>';

        this.header.setContent(html);
    };

    IncomingCallView.prototype.startRingtone = function() {
        this.ringtone.playSound(0, 1);
        this.ringtoneRepeat = setInterval(function(){this.ringtone.playSound(0, 1)}.bind(this), 8000);
        this.footerLightBox.show(this.footer);
        this.headerLightBox.show(this.header);
    };

    IncomingCallView.prototype.stopRingtone = function() {
        clearInterval(this.ringtoneRepeat);
        this.ringtone.stopPlaying();
    };

    IncomingCallView.prototype.start = function(eventData) {
        this.on = true;
        var data;
        if (eventData instanceof Contact || eventData instanceof Call) {
            data = eventData.attributes;
        } else {
            this.model = this.collection.models[0] || new Call();
            data = this.model.attributes;
        }
        // TODO: use extend instead
        var newCall = {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            facebook: data.facebook,
            pictureUrl: false,
            type: 'incoming',
            time: Date.now(),
            roomId: data.roomId,
            caller: data.caller
        };
        this.collection.create(newCall);
        this.startRingtone();
        $('.camera').removeClass('blur');
    }

    IncomingCallView.prototype.stop = function() {
        var button = $('.decline-button');
        if (!this.on) return;
        this.on = false;
        if (button) {
            this.model.save({
                success: false
            });
            button.addClass('exiting');
        }
        this.stopRingtone();
        setTimeout(function() {
            this.footerLightBox.hide();
            this.headerLightBox.hide();
            this.eventOutput.emit('showApp', function(){
                if (button) button.removeClass('exiting');
            });
        }.bind(this), duration);
        /* decline shouldn't remove the call
        if (button) {
            this.eventOutput.emit('incomingCallEnd', this.model);
        }
        */
    };

    IncomingCallView.prototype.accept = function() {
        var button = $('.answer-button');
        this.on = false;
        this.model.save({
            success: true
        });
        if (button) button.addClass('exiting');
        this.stopRingtone();
        setTimeout(function() {
            this.footerLightBox.hide();
            this.headerLightBox.hide();
            this.eventOutput.emit('connectedCall', function(){
                if (button) button.removeClass('exiting');
            });
        }.bind(this), duration);
        if (button) {
            this.eventOutput.emit('incomingCallAnswer', this.model);
        }
    };

    module.exports = IncomingCallView;
});