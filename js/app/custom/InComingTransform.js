define(function(require, exports, module) {
    var Matrix = require('famous/Matrix');
    var Modifier = require('famous/Modifier');
    var RenderNode = require('famous/RenderNode');
    var Utility = require('famous/Utility');
    var Easing = require('famous-animation/Easing');

    function InComingTransform(options) {
        this.options = {
            inTransform: Matrix.scale(0.001, 0.001, 0.001),
            inOpacity: 1,
            inOrigin: [0.5, 0.5],
            outTransform: Matrix.scale(0.001, 0.001, 0.001),
            outOpacity: 1,
            outOrigin: [0.5, 0.5],
            showTransform: Matrix.identity,
            showOpacity: 1,
            showOrigin: [0.5, 0.5],
            inTransition: {duration: 500, curve: Easing.inQuintNorm()},
            outTransition: {duration: 500, curve: Easing.outQuintNorm()},
            overlap: true
        };
    }

    module.exports = InComingTransform;
});