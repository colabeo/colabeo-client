require('famous/polyfills');

var Engine = require('famous/engine');
var Surface = require('famous/surface');
var Fader = require('famous/views/fader');

var mainCtx = Engine.createContext();

var fader = new Fader();

var surface = new Surface({
  size: [300, 300],
  properties: {
      backgroundColor: 'red'
  },
  content: 'Click anywhere to fade me in and out'
});

fader.show();

var showing = true;
var toggle = function() {
  if (showing) {
      fader.hide();
      showing = false;
  } else {
      fader.show();
      showing = true;
  }
};

Engine.on('click', toggle);

mainCtx.link(fader).link(surface);
