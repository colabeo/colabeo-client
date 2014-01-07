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

        this.startPos = FM.translate(0,0,-5);
        this.endPos = FM.scale(0.25, 0.25);
        this.transform = new Mod({
            transform: this.startPos,
            origin: [0.9, 0.1]
        });
        this._add(new Mod({
            transform: this.startPos
        })).link(this.remoteVideoSurface);
        this._add(this.transform).link(this.localVideoSurface);

    }

    CameraView.prototype = Object.create(View.prototype);
    CameraView.prototype.constructor = CameraView;

    CameraView.prototype.turnOn = function() {
        this.transform.setTransform(this.endPos, { duration: 500 });
    };

    CameraView.prototype.turnOff = function() {
        this.transform.setTransform(this.startPos, { duration: 100 });
    };

    module.exports = CameraView;
});