require("famous/polyfills");

var Engine      = require("famous/engine");
var Surface     = require("famous/surface");
var EdgeSwapper = require("famous/views/edge-swapper");

var mainCtx = Engine.createContext();

var edgeswapper = new EdgeSwapper();

var primary = new Surface({
    content: "Primary Surface",
    properties: {
        backgroundColor: "red"
    }
});

var secondary = new Surface({
    content: "Secondary Surface",
    properties: {
        backgroundColor: "blue"
    }
});

mainCtx.add(edgeswapper); 

edgeswapper.show(primary);

var showing = true;
Engine.on("click", function() {
    if (showing) {
        edgeswapper.show(secondary);
        showing = false;
    } else {
        edgeswapper.show(primary);
        showing = true;
    };
});