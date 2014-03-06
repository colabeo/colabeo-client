require("famous/polyfills");

var Engine       = require("famous/engine");
var Surface      = require("famous/surface");
var ViewSequence = require("famous/view-sequence");

var mainCtx = Engine.createContext();

var viewSequence = new ViewSequence();

for(var i = 0; i < 8; i++) {
    viewSequence.push(new Surface({
        content: "I am panel " + (i + 1),
        size: [200, 200],
        properties: {
            backgroundColor: "hsl(" + (i * 306 / 8) + ", 100%, 50%)",
            color: "black"
        }
    }));
}

var counter = 0;
setInterval(function() {
    viewSequence.index = counter++ % (viewSequence.array.length - 1)
}, 1000);

mainCtx.add(viewSequence);
