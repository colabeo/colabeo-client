define(function(require, exports, module) {
    // Import core Famous dependencies
    var View = require('famous/View');
    var Matrix       = require('famous/Matrix');
    var Surface = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var LightBox     = require('app/custom/LightBox');
    var Templates        = require('app/custom/Templates');
    var Easing = require('famous-animation/Easing');
    var InComingTransform = require('app/custom/InComingTransform');

    function IncomingCallView(options) {
        View.call(this);

        var inComingTransform = new InComingTransform;

        if(options.inTransform === undefined) this.options.inTransform = inComingTransform.options.inTransform;
        if(options.outTransform === undefined) this.options.outTransform = inComingTransform.options.outTransform;
        if(options.inTransition === undefined) this.options.inTransition = inComingTransform.options.inTransition;
        if(options.outTransition === undefined) this.options.outTransition = inComingTransform.options.outTransition;
        if(options.inOpacity === undefined) this.options.inOpacity = inComingTransform.options.inOpacity;
        if(options.outOpacity === undefined) this.options.outOpacity = inComingTransform.options.outOpacity;


        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.surface = new Surface({
            classes: ['surface', 'incoming-call-view'],
            size: [undefined, undefined],
            properties: {
                backgroundColor: 'transparent'
            }
        });

        this.surface.on('click', function() {

        }.bind(this));

        this.template();

        this.surface.pipe(this.eventOutput);
        this._link(this.surface);

        _.bindAll(this, 'template');
        this.model.bind('change', this.template);

    }

    IncomingCallView.prototype = Object.create(View.prototype);
    IncomingCallView.prototype.constructor = IncomingCallView;

    IncomingCallView.prototype.template = function() {
        var html = '<div class="box"><div class="name">' + this.model.get('firstname') + " " + this.model.get('lastname') + "</div>";
        html += '<div class="info">FamousTime...</div>';
        if (this.model.get('pictureUrl'))
            html += '<img class="picture" src="' + this.model.get('pictureUrl') + '"></img>';
        else {
            var initial = this.model.get('firstname')[0] + this.model.get('lastname')[0];
            html += '<div class="initial">'+initial+'</div>';
        }
        html += '<button class="remind-me-button"><i class="fa fa-clock-o fa-lg"></i> Remind Me</button>';
        html += '<button class="message-button"><i class="fa fa-comment fa-lg"></i> Message</button>';
        html += '<button class="decline-button">Decline</button>';
        html += '<button class="answer-button">Answer</button></div>';
        this.surface.setContent(html);
    };

    IncomingCallView.prototype.startCalltone = function() {
        var e = document.getElementById('ringtone');
        e && e.play();
    };

    IncomingCallView.prototype.stopCalltone = function() {
        var e = document.getElementById('ringtone');
        e && e.pause();
        e.currentTime = 0;
    };

    module.exports = IncomingCallView;
});