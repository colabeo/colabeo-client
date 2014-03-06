var EventHandler   = require('famous/event-handler');
var OptionsManager = require('famous/options-manager');
var RenderNode     = require('famous/render-node');

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
    this._node = new RenderNode();

    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    EventHandler.setOutputHandler(this, this._eventOutput);

    this.options = Object.create(this.constructor.DEFAULT_OPTIONS || View.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if(options) this.setOptions(options);
}

View.DEFAULT_OPTIONS = {}; // no defaults

View.prototype.getOptions = function() {
    return this._optionsManager.value();
};

View.prototype.setOptions = function(options) {
    this._optionsManager.patch(options);
};

//TODO: remove underscore
//Mark comments: remove this function instead; non-underscored version would present abstraction violation
View.prototype._add = function() { return this._node.add.apply(this._node, arguments); };

View.prototype.render =  function() {
    return this._node.render.apply(this._node, arguments);
};

View.prototype.getSize = function() {
    if(this._node && this._node.getSize) {
        return this._node.getSize.apply(this._node, arguments) || this.options.size;
    }
    else return this.options.size;
};

module.exports = View;