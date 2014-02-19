var Matrix = require('famous/transform');
var Modifier = require('famous/modifier');
var RenderNode = require('famous/render-node');
var Utility = require('famous/utilities/utility');
var Easing = require('famous/transitions/easing');

function UpDownTransform(options) {
    this.options = {
        inTransform: Matrix.translate(0, 1500, 0),
        inOpacity: 1,
        inOrigin: [0.5, 0.5],
        outTransform: Matrix.translate(0, 600, 0),
        outOpacity: 1,
        outOrigin: [0.5, 0.5],
        showTransform: Matrix.identity,
        showOpacity: 1,
        showOrigin: [0.5, 0.5],
        inTransition: {duration: 500, curve: Easing.inQuadNorm()},
        outTransition: {duration: 100, curve: Easing.outQuintNorm()},
        overlap: true
    };
}

module.exports = UpDownTransform;
