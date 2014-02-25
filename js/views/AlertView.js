define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var LightBox = require('app/custom/LightBox');
    var Mod          = require("famous/Modifier");
    var Matrix       = require("famous/Matrix");
    var Easing = require('famous-animation/Easing');

    function AlertView(message, okHidden) {
        View.call(this);
        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.options = {
            inTransform: Matrix.identity,
//            inOpacity: 1,
//            inOrigin: [0.5, 0.5],
            outTransform: Matrix.identity,
//            outOpacity: 1,
//            outOrigin: [0.5, 0.5],
            showTransform: Matrix.identity,
//            showOpacity: 1,
//            showOrigin: [0.5, 0.5],
            inTransition: {duration: 100},
            outTransition: {duration: 100},
            overlap: true
        };


        this.bigSurface = new Surface({
            size: [undefined, undefined],
            properties:{
                background: "rgba(0,0,0,0.5)",
                zIndex: 1000
            }
        });
        this.alertSurface = new Surface({
            classes:['alert'],
            size: [340, 220],
            properties:{
                borderRadius: "10px",
                background: "rgba(59, 59, 59, 0.90)",
                color: 'rgba(245, 236, 236,1)',
//                textAlign: "center",
                zIndex:1001
            }
        });

        this.alertLightBox = new LightBox({
            inTransform: Matrix.identity,
            inOpacity: 0.1,
            inOrigin: [0.5, 0.45],
            outTransform: Matrix.scale(0.001,0.001,0.001),
            outOpacity: 1,
            outOrigin: [0.5, 0.45],
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.45],
            inTransition: {duration: 200, curve: Easing.inQuadNorm()},
            outTransition: {duration: 100, curve: Easing.outQuintNorm()},
        });

        this.setAlertMessage(message, okHidden);

        this._add(this.bigSurface);
        this._add(this.alertLightBox);

        this.alertLightBox.show(this.alertSurface);
    }

    AlertView.prototype = Object.create(View.prototype);
    AlertView.prototype.constructor = AlertView;

    AlertView.prototype.setAlertMessage = function (message, okHidden){
        var content = [
                        '<div class="alert-title"><b>Beepe</b></div><div id="message">',
                        message,
                        '</div>'
                      ];
        if (!okHidden) content.push('<div id="close-alert"> OK </div>');
        this.alertSurface.setContent(content.join(''));
    }

    module.exports = AlertView;
});