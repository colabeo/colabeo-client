define(function(require, exports, module) {
    // Import core Famous dependencies
    var FamousEngine = require('famous/Engine');
    var Matrix       = require('famous/Matrix');
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var LightBox     = require('app/custom/LightBox');
    var Easing       = require('famous-animation/Easing');
    var ScrollContainer = require('famous-views/ScrollContainer');
    var Mod = require('famous/Modifier');

    function PendingCallView(options) {
        View.call(this);
        this.size = [1000, 1000];
        this.model = options.model;
        this.lightbox = new LightBox({
//            inTransform: Matrix.identity,
            inOpacity: 0,
            inOrigin: [0.5, 0.5],
//            outTransform: Matrix.identity,
            outOpacity: 0,
            outOrigin: [0.5, 0.5],
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.5]
        });

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        var buttons =[];

        this.surface = new Surface({
            classes: ['surface', 'pending-call-view'],
            size: [undefined, undefined],
            properties: {
                backgroundColor: 'transparent',
                zIndex: 1
            }
        });

        this.videoButton = new Surface({
            classes: ['button'],
            size: [80, 80],
            content: '<i class="fa fa-eye fa-lg"></i>',
            properties: {
                textAlign: "center",
                background: "#cfcbce",
                color: "#0b0b0b",
                borderRadius: "10px",
                opacity: "0.88",
                zIndex: 2
            }
        });
        this.endButton = new Surface({
            classes: ['end-button'],
            size: [200, 80],
            content: 'End',
            properties: {
                textAlign: "center",
                background: "#c23635",
                color: "#fff",
                fontSize: "40px",
                borderRadius: "10px",
                opacity: "0.88",
                zIndex: 2
            }
        });
        this.audioButton = new Surface({
//            position: [0.5*window.innerWidth, 0.5*window.innerHeight],
            size: [80, 80],
            content: '<i class="fa fa-microphone fa-lg"></i>',
//            classes: ['panel'],
            properties: {
                textAlign: "center",
                background: "#cfcbce",
                color: "#0b0b0b",
                borderRadius: "10px",
                opacity: "0.88",
                zIndex: 2,
                cursor: "pointer"
            }
        });
        buttons.push(this.videoButton);
        buttons.push(this.endButton);
        buttons.push(this.audioButton);

        this.surface.on('click', function() {
//            this.lightbox.hide();
        }.bind(this));

        this.scrollContainer = new ScrollContainer({
            feel: {
                itemSpacing:10
            }
        });

        var transform = new Mod({
            transform: Matrix.translate(0.5*window.innerWidth-190, 0.85*window.innerHeight,0)
        })

        this.scrollContainer.sequenceFrom(buttons);
        this._add(transform).link(this.lightbox);


        this.template();

        this.surface.pipe(this.eventOutput);

        this._add(this.surface);

        _.bindAll(this, 'template');
        this.model.bind('change', this.template);


    }

    PendingCallView.prototype = Object.create(View.prototype);
    PendingCallView.prototype.constructor = PendingCallView;

    PendingCallView.prototype.template = function() {
        var html = '<div class="box">';

        html += '<div class="name">' + this.model.get('firstname') + " " + this.model.get('lastname') + "</div>";

        if (this.model.get('pictureUrl'))
            html += '<img class="picture" src="' + this.model.get('pictureUrl') + '"></img>';
        else {
            var initial = this.model.get('firstname')[0] + this.model.get('lastname')[0];
            html += '<div class="initial">'+initial+'</div>';
        }

        html += '<div class="info">FamousTime...</div>';

        html += '<button class="sync-button"><i class="fa fa-exchange fa-lg"></i></button>';
        html += '<button class="close-button">End</button>';
        html += '<button class="audio-button"><i class="fa fa-microphone fa-lg"></i></button></div>';
        this.surface.setContent(html);
    };

    PendingCallView.prototype.startCalltone = function() {
        var e = document.getElementById('calltone');
        e && e.play();
        this.lightbox.show(this.scrollContainer);
    };

    PendingCallView.prototype.stopCalltone = function() {
        var e = document.getElementById('calltone');
        e && e.pause();
        e.currentTime = 0;
    };

    module.exports = PendingCallView;
});