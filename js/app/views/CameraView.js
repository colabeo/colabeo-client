define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Mod          = require("famous/Modifier");
    var FM           = require("famous/Matrix");

    function CameraView(options) {
        View.call(this);
        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.localVideoSurface = new Surface({
            classes: ['camera', 'local-video', 'blur'],
            properties: {
              zIndex: -2
            },
            content: '<video muted="true" autoplay></video>'
        });
        this.remoteVideoSurface = new Surface({
            classes: ['camera', 'remote-video'],
            properties: {
                zIndex: -3
            },
            content: '<video autoplay></video>'
        });
        this.localVideoSurface.pipe(this.eventOutput);
        this.remoteVideoSurface.pipe(this.eventOutput);

        this.transform = new Mod({
            origin: [0.9, 0.1]
        });
        this._add(new Mod({
            transform: FM.translate(0,0,-5)
        })).link(this.remoteVideoSurface);
        this._add(this.transform).link(this.localVideoSurface);
        this.turnOff();
    }

    CameraView.prototype = Object.create(View.prototype);
    CameraView.prototype.constructor = CameraView;

    CameraView.prototype.turnOn = function() {
        $('.remote-video').hide();
        this.transform.setTransform(FM.scale(.25,.25), { duration: 500 });
    };

    CameraView.prototype.turnOff = function() {
        $('.remote-video').show();
        this.transform.setTransform(FM.scale(1, 1), { duration: 500 });
    };

    module.exports = CameraView;
});