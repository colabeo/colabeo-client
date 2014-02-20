// Import core Famous dependencies
var View         = require('famous/view');
var Surface      = require('famous/surface');
var EventHandler = require('famous/event-handler');
var Modifier     = require("famous/modifier");
var Transform    = require("famous/transform");

function CameraView(options) {
    View.call(this);
    this.model = options.model;

    // Set up event handlers
    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    this.localVideoSurface = new Surface({
        content: '<div class="camera local-video blur off"><video muted="true" autoplay poster="content/images/transparent.png"></video></div>'
    });
    this.remoteVideoSurface = new Surface({
        properties: {
            zIndex: -3
        },
        content: '<div class="camera remote-video"><video autoplay poster="content/images/transparent.png"></video></div>'
    });
    this.localVideoSurface.pipe(this.eventOutput);
    this.remoteVideoSurface.pipe(this.eventOutput);

    this.transform = new Modifier({
        origin: [0.9, 0.1]
    });
    this._add(new Modifier({
        transform: Transform.translate(0,0,-5)
    })).link(this.remoteVideoSurface);
    this._add(this.transform).link(this.localVideoSurface);
    this.turnOff();
}

CameraView.prototype = Object.create(View.prototype);
CameraView.prototype.constructor = CameraView;

CameraView.prototype.turnOn = function() {
    $('.remote-video').show();
    this.transform.setTransform(Transform.move(Transform.scale(.25,.25), [0,0,-5]), { duration: 500 });
};

CameraView.prototype.turnOff = function() {
    $('.remote-video').hide();
    this.transform.setTransform(Transform.move(Transform.scale(1, 1), [0,0,-5]), { duration: 500 });
};

module.exports = CameraView;
