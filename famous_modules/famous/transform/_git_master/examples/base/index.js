require("famous/polyfills");

var Engine    = require("famous/engine");
var Surface   = require("famous/surface");
var Modifier  = require("famous/modifier");
var Transform = require("famous/transform");

var mainCtx = Engine.createContext();

var transform = new Modifier({
    transform: Transform.move(Transform.rotateZ(Math.PI * 0.25),[200, 100, 0]),
    opacity: [0.6]
});

var surface = new Surface({
	size: [200, 200],
	content: "Hello World",
	classes: ["famousTestSurface"],
	properties: {
		color: "white",
		backgroundColor: "black"
	}
});

mainCtx.link(transform).link(surface);