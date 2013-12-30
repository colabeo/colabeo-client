define(function(require, exports, module) { 
    var RenderNode = require('./RenderNode');
    var EventHandler = require('./EventHandler');
    var OptionsManager = require('./OptionsManager');

    function View(options) {
        this.node = new RenderNode();

        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.options = Object.create(this.constructor.DEFAULT_OPTIONS || View.DEFAULT_OPTIONS);
        this.optionsManager = new OptionsManager(this.options);

        if(options) this.setOptions(options);
    };

    View.DEFAULT_OPTIONS = null; // no defaults

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
});
