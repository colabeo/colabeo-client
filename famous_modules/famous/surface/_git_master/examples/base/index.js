require("famous/polyfills");

var Engine  = require("famous/engine");
var Surface = require("famous/surface");

var mainCtx = Engine.createContext();

var surface= new Surface({
	size: [200, 200],
	content: "Hello World",
	classes: ["famousTestSurface"],
	properties: {
		color: "white",
		backgroundColor: "black"
	}
});

mainCtx.add(surface);
