require("famous/polyfills");

var Engine    = require("famous/engine");
var Surface   = require("famous/surface");
var Modifier  = require("famous/modifier");
var Transform = require("famous/transform");

var mainCtx = Engine.createContext();

var transform = new Modifier({
    transform: Transform.translate(200, 100, 0)
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