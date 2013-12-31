define(function(require, exports, module) {
    // Import core Famous dependencies
    var View = require('famous/View');
    var Matrix       = require('famous/Matrix');
    var Surface = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var LightBox     = require('app/custom/LightBox');
    var Templates        = require('app/custom/Templates');
    var Easing = require('famous-animation/Easing');

    function IncomingCallView(options) {
        View.call(this);
        this.collection = options.collection;
        var duration = 500;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

//        this.headerLightBox = new LightBox({
//            inTransform: Matrix.identity,//Matrix.scale(0.001,0.001,0.001),
//            inTransition: Matrix.identity,
//            inOpacity: 1,
//            inOrigin: [0.5, 0.5],
//            outTransform: Matrix.scale(0.001,0.001,0.001),
//            outOpacity: 1,
//            outOrigin: [0.5, 0.5],
//            outTransition: Matrix.identity,
//            showTransform: Matrix.identity,
//            showOpacity: 1,
//            showOrigin: [0.5, 0.1],
//            overlap: true
//        });
//
//        this.footerLightBox = new LightBox({
//            inTransform: Matrix.scale(0.01,0.01,0.01),
//            inTransition: {duration: 900, curve: Easing.inQuadNorm()},
//            inOpacity: 1,
//            inOrigin: [0.5, 0.5],
//            outTransform: Matrix.scale(0.001,0.001,0.001),
//            outOpacity: 1,
//            outOrigin: [0.5, 0.5],
//            outTransition: {duration: 900, curve: Easing.inQuadNorm()},
//            showTransform: Matrix.identity,
//            showOpacity: 1,
//            showOrigin: [0.5, 0.9],
//            overlap: true
//        });

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
                var button = target;
                button.addClass('exiting');
                this.model.save({
                    success: false
                });
                this.stopCalltone();
                setTimeout(function() {
                    this.footerLightBox.hide();
                    this.headerLightBox.hide();
                    this.eventOutput.emit('showApp',function(){
                        button.removeClass('exiting');
                    });
                }.bind(this), duration);
            }
            else if (target.hasClass("answer-button")) {
                var button = target;
                button.addClass('exiting');
                this.model.save({
                    success: true
                });
                this.stopCalltone();
                setTimeout(function() {
                    this.footerLightBox.hide();
                    this.headerLightBox.hide();
                    this.eventOutput.emit('connectedCall', function(){
                        button.removeClass('exiting');
                    });
                }.bind(this), duration);
            }
        }.bind(this));
    }

    IncomingCallView.prototype = Object.create(View.prototype);
    IncomingCallView.prototype.constructor = IncomingCallView;

    IncomingCallView.prototype.template = function() {
        this.model = this.collection.models[0];
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

    module.exports = IncomingCallView;
});