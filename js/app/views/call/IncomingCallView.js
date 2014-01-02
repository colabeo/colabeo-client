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

        var remindMeButton = '<button class="remind-me-button big-button"><i class="fa fa-clock-o fa-lg"></i> Remind Me</button>';
        var messageButton = '<button class="message-button big-button"><i class="fa fa-comment fa-lg"></i> Message</button>';
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

        this.footer.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("decline-button")) {
                this.stop(target);
            }
            else if (target.hasClass("answer-button")) {
                this.accept(target);
            }
        }.bind(this));

        this.eventInput.on('incomingCall', function() {
            console.log("incomingCall");
        });
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

        html += '<div class="caller-info">FamousTime...</div>';

        this.header.setContent(html);
    };

    IncomingCallView.prototype.startCalltone = function() {
        var e = document.getElementById('ringtone');
        e && e.play();
        this.footerLightBox.show(this.footer);
        this.headerLightBox.show(this.header);
    };

    IncomingCallView.prototype.stopCalltone = function() {
        var e = document.getElementById('ringtone');
        e && e.pause();
        e.currentTime = 0;
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
        var newCall = {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            pictureUrl: false,
            type: 'incoming',
            time: Date.now(),
            roomId: data.roomId
        };
        this.collection.create(newCall);
        this.startCalltone();
        $('.camera').removeClass('blur');
    }

    IncomingCallView.prototype.stop = function(button) {
        if (!this.on) return;
        this.on = false;
        if (button) {
            this.model.save({
                success: false
            });
            button.addClass('exiting');
        }
        this.stopCalltone();
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

    IncomingCallView.prototype.accept = function(button) {
        this.on = false;
        this.model.save({
            success: true
        });
        if (button) button.addClass('exiting');
        this.stopCalltone();
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