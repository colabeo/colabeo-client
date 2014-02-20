require("famous/polyfills");

var Engine = require("famous/engine");

var mainCtx = Engine.createContext();

mainCtx.add(new Surface({
    size: [undefined, undefined],
    content: "Inner Surface",
    properties: {
        backgroundColor: "#3cf"
    }
}));