define(function(require, exports, module) {
    var RenderNode = require('famous/RenderNode');
    var Matrix = require('famous/Matrix');
    var Modifier = require('famous/Modifier');

    /**
     * @class Swappable
     * @desciption
     * Allows you to swap different renderables in and out.
     * @name Swappable
     * @constructor
     * @example
     *   define(function(require, exports, module) {
     *       var Engine = require('famous/Engine');
     *       var Swappable = require('famous-modifiers/Swappable');
     *       var Surface = require('famous/Surface');
     *
     *       var swappable = new Swappable();
     *
     *       for (var i = 0; i < 5; i++) {
     *           var color = 'hsl(' + String(i<<4) + ',80%,80%)';
     *
     *           var surface = new Surface({
     *               content: 'test ' + String(i + 1),
     *               size: [300, 300],
     *               properties: {
     *                   backgroundColor: color,
     *                   textShadow: '0px 0px 5px black',
     *                   textAlign: 'center'
     *               }
     *           });
     *
     *           swappable.item(i).link(surface);
     *       }
     *
     *       var Context = Engine.createContext();
     *
     *       var item = 0;
     *
     *       var iterate = function() {
     *           swappable.select(item);
     *           if (item >= 4) {
     *               item = 0;
     *           } else {
     *               item++;
     *           }
     *       };
     *
     *       Context.link(swappable);
     *       iterate();
     *       Engine.on('click', iterate);
     *   });
     */
    function Swappable(options) {

        this.options = {
            initTransform  : Matrix.identity,
            initOpacity    : 0,
            finalTransform : Matrix.identity,
            finalOpacity   : 0,
            inTransition   : {duration : 500, curve : 'easeInOut'},
            outTransition  : {duration : 500, curve : 'easeInOut'},
            async          : false
        };

        this.nodes = {};
        this.transforms = [];

        this.currIndex = -1;
        this.prevIndex = -1;

        this.setOptions(options);

    }

    Swappable.prototype.item = function(i) {
        var result = new RenderNode(new Modifier(this.options.initTransform, this.options.initOpacity), true);
        this.nodes[i] = result;
        return result;
    };

    Swappable.prototype.select = function(i, callback) {
        if(i == this.currIndex) return;

        if(this.options.async) {
            _transitionOut.call(this, this.currIndex, (function() {
                _transitionIn.call(this, this.currIndex, callback);
            }).bind(this));
        }
        else{
            _transitionOut.call(this, this.currIndex);
            _transitionIn.call(this, i, callback);
        }
        this.currIndex = i;
    };

    function _transition(i, initTransform, initOpacity, finalTransform, finalOpacity, transition, callback) {
        if(!(i in this.nodes)) return;
        var transform = this.nodes[i].modifiers[0];
        console.log(this.nodes[i]);
        if(transform.isMoving && !transform.isMoving()) {
            if(initTransform) transform.setTransform(initTransform);
            if(initOpacity !== undefined) transform.setOpacity(initOpacity);
        }
        transform.setTransform(finalTransform, transition);
        transform.setOpacity(finalOpacity, transition, callback);
    }

    function _transitionIn(i, callback) {
        _transition.call(this, i, this.options.initTransform, this.options.initOpacity, Matrix.identity, 1, this.options.inTransition, callback);
    }

    function _transitionOut(i, callback) {
        _transition.call(this, i, undefined, undefined, this.options.finalTransform, this.options.finalOpacity, this.options.outTransition, callback);
    }

    Swappable.prototype.setOptions = function(options){
        for (var key in options) this.options[key] = options[key];
    };

    Swappable.prototype.getOptions = function(){
        return this.options;
    };

    Swappable.prototype.render = function() {
        var result = [];
        for(var i in this.nodes) {
            result.push(this.nodes[i].render());
        }
        return result;
    };

    module.exports = Swappable;

});
