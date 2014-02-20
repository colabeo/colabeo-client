require("famous/polyfills");

var Engine  = require("famous/engine");
var Surface = require("famous/surface");
var Fader   = require("famous/views/fader");

var mainCtx = Engine.createContext();

var fader = new Fader();

var surface = new Surface({
  size: [300, 300],
  content: "Click anywhere to fade me in and out",
  properties: {
      backgroundColor: "red"
  }
});

mainCtx.link(fader).link(surface);

fader.show();
var showing = true;

Engine.on("click", function() {
  if (showing) {
      fader.hide();
      showing = false;
  } else {
      fader.show();
      showing = true;
  }
});

