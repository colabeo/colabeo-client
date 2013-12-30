define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');

    function CameraView(options) {
        View.call(this);

        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.surface = new Surface({
            classes: ['surface', 'camera-view'],
            size: [undefined, undefined],
            properties: {
                backgroundColor: 'black'
            }
        });

        this.surface.on('click', function() {

        }.bind(this));

        this.template();

        this.surface.pipe(this.eventOutput);
        this._link(this.surface);

    }

    CameraView.prototype = Object.create(View.prototype);
    CameraView.prototype.constructor = CameraView;

    CameraView.prototype.template = function() {
        var html = '<iframe class="camera" src="https://koalabearate.appspot.com"></iframe>';
        this.surface.setContent(html);
    };

    module.exports = CameraView;
});