var RenderNode = require('famous/render-node');
var Surface = require('famous/surface');
var View = require('famous/view');
var Modifier = require('famous/modifier');
var GenericSync = require('famous/input/generic-sync');
var MouseSync = require('famous/input/mouse-sync');
var TouchSync = require('famous/input/touch-sync');
var Transform = require('famous/transform');
var Easing = require('famous/transitions/easing');
var Transitionable   = require('famous/transitions/transitionable');
var WallTransition   = require('famous/transitions/wall-transition');
var SpringTransition   = require('famous/transitions/spring-transition');
var Engine = require('famous/engine');
var Utility = require('famous/utilities/utility');

var Templates = require('templates');

Transitionable.registerMethod('wall', WallTransition);
Transitionable.registerMethod('spring', SpringTransition);

function ItemHeaderView(options){
    View.apply(this, arguments);
    this.model = options.model;
    this.options = {
        buttonSizeY: 20,
        header: undefined,
        classes: [],
        content: '',
        size: [true, 20]
    };

    this.setOptions(options);
    this.collection=options.collection.lastnameInit(this.options.content);
    this.containElements = this.collection.length != 0;

    this.itemHeight = this.containElements? this.options.buttonSizeY : 1;

    this.setupSurfaces();

    this.events();

    window.hh=this;

}

ItemHeaderView.prototype = Object.create(View.prototype);
ItemHeaderView.prototype.constructor = ItemHeaderView;

ItemHeaderView.prototype.setOptions = function(options){
    _.extend(this.options, options);
};

ItemHeaderView.prototype.setupSurfaces = function(){
    this.surfaces = new RenderNode ();
    this.surfacesMod = new Modifier();
    this.headerSurface = new Surface({
        classes: this.options.classes,
        content: this.options.content,
        size: [true, this.itemHeight],
        properties:{
            backgroundColor: "black",
            color: "white"
        }
    });
    this.headerMod = new Modifier();
    this.headerSurface.pipe(this.eventOutput);
    this.surfaces.link(this.headerMod).link(this.headerSurface);
    this.node.link(this.surfacesMod).link(this.surfaces);
};

ItemHeaderView.prototype.resizeItem = function(){
    if (this.headerSurface._currTarget) this.headerSurface._currTarget.children[0].style.width = window.innerWidth + 'px';
};

ItemHeaderView.prototype.collapse = function(callback) {
    this.surfacesMod.setOpacity(0,{duration:600}, callback);
};


ItemHeaderView.prototype.expand = function(callback) {
    this.surfacesMod.setOpacity(1,{duration:600}, callback);
};

ItemHeaderView.prototype.getSize = function() {
    var sh = this.surfacesMod.opacityState.get();
    return [this.options.size[0], Math.floor(this.options.size[1]*sh) || 1];
};

ItemHeaderView.prototype.events = function() {
    this.collection.on('all', function(e, model, collection, options) {
        if (this.containElements && this.collection.length == 0){
            this.containElements = false;
            this.collapse();
        }
        if (!!this.containElements && this.collection.length != 1){
            this.containElements = true;
            this.expand();
        }
    }.bind(this))
};

module.exports = ItemHeaderView;

