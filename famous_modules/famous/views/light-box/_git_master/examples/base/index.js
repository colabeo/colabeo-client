require("famous/polyfills");

var Engine   = require("famous/engine");
var Surface  = require("famous/surface");
var Lightbox = require("famous/views/light-box");

var mainCtx = Engine.createContext();
var lightbox = new Lightbox();
var surfaces = [];
var counter = 0;

for (var i = 0; i < 10; i++) {
    surfaces.push(new Surface({
         content: "test",
         size: [200, 200],
         properties: {
             backgroundColor: "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
             lineHeight: "200px"
         }
    }));
}

lightbox.show(surfaces[0]);

Engine.on("click", function() {
    var next = (counter++ + 1) % surfaces.length;
    this.show(surfaces[next]);
}.bind(lightbox));

mainCtx.add(lightbox);
