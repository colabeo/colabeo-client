var EventHandler = require('famous/event-handler');
var OptionsManager = require('famous/options-manager');
var RenderNode = require('famous/render-node');

/**
 * @class View
 *
 * @description 
 *  Consists of a render node paired with an input event handler and an
 *  output event handler. Useful for quickly creating elements within applications
 *  with large event systems.
 *   
 * @name View
 * @constructor
 * @example
 *   var Engine = require('famous/Engine');
 *   var FamousSurface = require('famous/Surface');
 *   var View = require('famous/View');
 *
 *   var Context = Engine.createContext();
 *
 *   var surface = new FamousSurface({
 *      size: [500,500],
 *      properties: {
 *           backgroundColor: 'red'
 *      }
 *   });
 *   
 *   var view = new View();
 *   view._link(surface);
 *
 *   Context.link(view);
 */
function View(options) {
    this.node = new RenderNode();

    this.eventInput = new EventHandler();
    this.eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    EventHandler.setOutputHandler(this, this.eventOutput);

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS || View.DEFAULT_OPTIONS);
    this.optionsManager = new OptionsManager(this.options);

    if(options) this.setOptions(options);
}

View.DEFAULT_OPTIONS = {}; // no defaults

View.prototype.getOptions = function() {
    return this.optionsManager.value();
};

View.prototype.setOptions = function(options) {
    this.optionsManager.patch(options);
};

View.prototype._add = function() { return this.node.add.apply(this.node, arguments); };
View.prototype._link = function() { return this.node.link.apply(this.node, arguments); };

View.prototype.render =  function() {
    return this.node.render.apply(this.node, arguments);
};

View.prototype.getSize = function() {
    var target = this.node.get();
    if(target.getSize) return target.getSize.apply(target, arguments);
    else return this.options.size;
};

module.exports = View;
