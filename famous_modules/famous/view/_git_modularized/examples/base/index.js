require("famous/polyfills");

var Engine    = require("famous/engine");
var View      = require("famous/view");
var Surface   = require("famous/surface");
var Modifier  = require("famous/modifier");
var Transform = require("famous/transform");

var mainCtx = Engine.createContext();

var view = new View();

var surface = new Surface({
    size: [200, 200],
    content: "Primary",
    classes: ["famousTestSurface"],
    properties: {
        color: "white",
        backgroundColor: "black"
    }
});

surface.pipe(view);

view.eventInput.on("click", function() {
    alert("Primary Surface Clicked");
});

var view2 = new View();

var mod = new Modifier({
    transform: Transform.move(Transform.rotateZ(Math.PI * 0.25),[200, 100, 0]),
    opacity: [0.6]
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

surface2.pipe(view2);

view2.eventInput.on("click", function() {
    alert("Secondary Surface Clicked");
});

view._link(surface);
view2._link(mod).link(surface2);

mainCtx.add(surface);
mainCtx.add(view2);