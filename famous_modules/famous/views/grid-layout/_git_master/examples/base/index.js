require("famous/polyfills");

var Engine     = require("famous/engine");
var Surface    = require("famous/surface");
var GridLayout = require("famous/views/grid-layout");

var mainCtx = Engine.createContext();

var grid = new GridLayout({
    dimensions: [4, 2]
});

var surfaces = [];
grid.sequenceFrom(surfaces);

for(var i = 0; i < 8; i++) {
    surfaces.push(new Surface({
        content: "I am panel " + (i + 1),
        size: [undefined, undefined],
        properties: {
            backgroundColor: "hsl(" + (i * 360 / 8) + ", 100%, 50%)",
            color: "black"
        }
    }));
}

mainCtx.add(grid);
