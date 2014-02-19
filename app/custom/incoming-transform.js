var Matrix = require('famous/transform');
var Modifier = require('famous/modifier');
var RenderNode = require('famous/render-node');
var Utility = require('famous/utilities/utility');
var Easing = require('famous/transitions/easing');

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
