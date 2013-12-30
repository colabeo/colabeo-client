define(function(require, exports, module) {

    var View = require('famous/View');
    var Matrix       = require('famous/Matrix');
    var Surface = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var LightBox     = require('app/custom/LightBox');
    var Templates        = require('app/custom/Templates');
    var Easing = require('famous-animation/Easing');

    function OutgoingCallView(options){

        View.call(this);
        this.collection = options.collection;

        this.headerLightBox = new LightBox({
            inTransition:false,
            outTransition:false,
            showOrigin: [0.5, 0.1],
            overlap:true
        });

        this.footerLightBox = new LightBox({
            inTransform: Matrix.translate(0, 900, 0),
            inTransition: {duration: 900, curve: Easing.inQuadNorm()},
            inOpacity: 0,
            inOrigin: [0.5, 0.5],
            outTransform: Matrix.translate(0, 900, 0),
            outOpacity: 0,
            outOrigin: [0.5, 0.5],
            outTransition: {duration:900, curve: Easing.outQuadNorm()},
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.9],
            overlap:true
        });

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);


        this.header = new Surface({
            classes:['outgoing-call-view'],
            size: [undefined, 300],
            _origin:[0.5,-0.5],
            properties: {
                backgroundColor: 'transparent'
            }
        });

        var videoButton = Templates.toggleButton({
            classes: ["video-button"],
            checked: true,
            onContent: '<i class="fa fa-eye fa-lg"></i>',
            offContent: '<i class="fa fa-eye-slash fa-lg"></i>',
            onBackgroundColor: '#dadbd9',
            offBackgroundColor: '#dadbd9',
            size: [70,70]
        });
        var endButton = Templates.button({
            classes: ["end-button"],
            checked: true,
            content: 'End',
            size: [160,70]
        });
        var audioButton = Templates.toggleButton({
            classes:["audio-button"],
            checked: true,
            onContent: '<i class="fa fa-microphone fa-lg"></i>',
            offContent: '<i class="fa fa-microphone-slash fa-lg"></i>',
            onBackgroundColor: '#dadbd9',
            offBackgroundColor: '#dadbd9',
            size: [70,70]
        });
        this.footer = new Surface({
            classes: ['outgoing-call-view-buttons'],
            size: [undefined, 80],
            properties: {
                backgroundColor: 'transparent'
            },
            content: '<div class="box">' + videoButton + endButton + audioButton + '</div>'
//            content: '<div class="box"><button class="end-button"></button></div>'
        });

        this._add(this.headerLightBox);
        this._add(this.footerLightBox);

        _.bindAll(this, 'template');
        this.collection.bind('add', this.template);

        this.footer.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("end-button")) {
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
                }.bind(this), 1000);
            }
        }.bind(this));
    }


    OutgoingCallView.prototype = Object.create(View.prototype);
    OutgoingCallView.prototype.constructor = OutgoingCallView;

    OutgoingCallView.prototype.template = function() {
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

    OutgoingCallView.prototype.startCalltone = function() {
        var e = document.getElementById('calltone');
        e && e.play();
        this.footerLightBox.show(this.footer);
        this.headerLightBox.show(this.header);
    };

    OutgoingCallView.prototype.stopCalltone = function() {
        var e = document.getElementById('calltone');
        e && e.pause();
        e.currentTime = 0;
    };

    module.exports = OutgoingCallView;

});