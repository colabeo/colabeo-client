require("famous/polyfills");

var Engine     = require("famous/engine");
var RenderNode = require("famous/render-node");
var Surface    = require("famous/surface");
var Modifier   = require("famous/modifier");
var Transform  = require("famous/transform");

var mainCtx = Engine.createContext();

var node = new RenderNode();
var node2 = new RenderNode();

var surface = new Surface({
    size: [200, 200],
    content: "Hello World",
    classes: ["famousTestSurface"],
    properties: {
        color: "white",
        backgroundColor: "black"
    }
});

var surface2 = new Surface({
    size: [200, 200],
    content: "Secondary",
    classes: ["famousTestSurface"],
    properties: {
        color: "yellow",
        backgroundColor: "black"
    }
});

var mod = new Modifier({
    transform: Transform.move(Transform.rotateZ(Math.PI * 0.25),[200, 100, 0]),
    opacity: [0.6]
});

node.link(surface);
node2.link(mod).link(surface2);

mainCtx.add(node);
mainCtx.add(node2);