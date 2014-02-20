require("famous/polyfills");

var Engine     = require("famous/engine");
var Surface    = require("famous/surface");
var Scrollview = require("famous/views/scrollview");

var mainCtx = Engine.createContext();

var scrollview = new Scrollview();
var surfaces = [];

scrollview.sequenceFrom(surfaces);

for (var i = 0, temp; i < 10; i++) {
	temp = new Surface({
         content: "Surface: " + (i + 1),
         size: [200, 200],
         properties: {
             backgroundColor: "hsl(" + (i * 360 / 10) + ", 100%, 50%)",
             lineHeight: "200px",
             textAlign: "center"
         }
    });

    temp.pipe(scrollview);
    surfaces.push(temp);
}

mainCtx.add(scrollview);
