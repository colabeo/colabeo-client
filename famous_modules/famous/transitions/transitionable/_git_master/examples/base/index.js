require("famous/polyfills");

var Engine         = require("famous/engine");
var Transitionable = require("famous/transitions/transitionable");
var Surface        = require("famous/surface");

var mainCtx = Engine.createContext();

var color = new Transitionable([0, 100, 50]);
var hue = 360;

var colorMod = function() {
	surface.setProperties({
		backgroundColor: "hsl(" + this.get()[0] + ", 100%, 50%)"
	});
};

var surface = new Surface({
	size: [200, 200],
	properties: {
		backgroundColor: "hsl(0, 100%, 50%)"
	}
});

mainCtx.add(surface);

Engine.on("prerender", colorMod.bind(color));

var inProgress = false;
Engine.on("click", function() {
	if (!inProgress) {
		inProgress = true
		this.set([hue, 100, 50], {
			curve: "easeInOut",
			duration: 2000
		}, function() {
			inProgress = false;
			hue = hue === 0 ? 360 : 0;
		}.bind(this));
	}
}.bind(color));
