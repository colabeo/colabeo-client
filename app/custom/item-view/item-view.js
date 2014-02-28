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

var Templates = require('templates');

Transitionable.registerMethod('wall', WallTransition);
Transitionable.registerMethod('spring', SpringTransition);

function ItemView(options){
    View.apply(this, arguments);
    this.model = options.model;
    this.options = {
        paddingLeft : 20,
        paddingRight : 20,
        buttonSizeX : 50,
        buttonSizeY : 50,
        _leftEndOrigin : [0, 0],
        _rightEndOrigin : [1, 0],
        size : [true, 50]
    };

    this.setOptions(options);

    this.setupSurfaces();

    this.pos = [0,0];
    this.isEditingMode = false;
    this.areEditingMode = false;

    var sync = new GenericSync(function(){
        return this.pos;
    }.bind(this), {
            syncClasses:[MouseSync,TouchSync]
        }
    );

    this.returnZeroOpacityTransition = {
        'curve' : Easing.linearNorm,
        'duration' : 100
    };

    this.wallTransition = {
        method: 'wall',
        period: 300,
        dampingRatio: 1
    };

    this.itemSurface.pipe(sync);

    this.events();

    sync.on('start', function() {
        this.pos = this.isEditingMode? [this.options.nButtons*this.options.buttonSizeX, 0] : [0,0];
    }.bind(this));

    sync.on('update', function(data) {
        this.pos = data.p;  // the displacement from the start touch point.
        this.animateItem();
        this.animateLeftButtons();
        this.animateRightButtons();
    }.bind(this));

    sync.on('end', function(data) {
        this.pos = data.p;
        if (this.pos[0] > this.options.nButtons*this.options.buttonSizeX){
            this.toggleEditing();
        } else {
            this.setEditingOff();
        }
        if (this.pos[0] < -0.5 * window.innerWidth) {
            this.eventOutput.emit(this.options.rightButton.event, this.model);
            this.setEditingOff();
        }
    }.bind(this));

    Engine.on('resize', this.resizeItem.bind(this));

    window.tt=this;

//        function stopEvents ( e ) {
//            e.preventDefault();
//            e.stopPropagation();
//        }
}

ItemView.prototype = Object.create(View.prototype);
ItemView.prototype.constructor = ItemView;

ItemView.prototype.setOptions = function(options){
    _.extend(this.options, options);
    this.options.nButtons = options.leftButtons.length;
};

ItemView.prototype.setupSurfaces = function(){
    this.surfaces = new RenderNode ();
    this.surfacesMod = new Modifier();

//        var bc = this.model.collection.indexOf(this.model)%2 ? 0.1 : 0.2;
    this.backgroundSurface = new Surface({
        content: Templates.itemFrame(this.options.paddingLeft, this.options.paddingRight),
        size: this.options.size
    });
    this.surfaces.add(this.backgroundSurface);
    _(this.options.leftButtons).each(function (b, i){
        this['leftButton'+i] = new Surface({
            content: b.content,
            size: [this.options.buttonSizeX,this.options.buttonSizeY]
        });
        this['leftButton'+i+'Mod'] = new Modifier({
            origin: this.options._leftEndOrigin,
            opacity: 0,
            transform:Transform.translate(this.options.paddingLeft + this.options.buttonSizeX * (i) ,0,0)
        });
        this['leftButton'+i].pipe(this.eventOutput);
        this.surfaces.add(this['leftButton'+i+'Mod']).link(this['leftButton'+i]);
    }.bind(this));

    this.rightButton = new Surface({
        content: this.options.rightButton.content,
        size: [this.options.buttonSizeX, this.options.buttonSizeY]
    });
    this.rightButtonMod = new Modifier({
        origin: this.options._rightEndOrigin,
        opacity: 0,
        transform: Transform.translate(-this.options.paddingRight,0,0)
    });
    this.surfaces.add(this.rightButtonMod).link(this.rightButton);

    this.itemSurface = new Surface({
        classes: this.options.itemButton.classes,
        content: this.options.itemButton.content,
        size: this.options.size,
        properties:{
            backgroundColor: "transparent",
            zIndex:9
        }
    });
    this.itemMod = new Modifier({
        origin: this.options._leftEndOrigin
    });
    this.itemSurface.pipe(this.eventOutput);

    this.surfaces.add(this.itemMod).link(this.itemSurface);

    this.node.link(this.surfacesMod).link(this.surfaces)

};

ItemView.prototype.animateItem = function(){
    this.itemMod.setTransform(Transform.translate(this.pos[0], 0, 0));
};

ItemView.prototype.animateItemEnd = function(){
    var translate = Transform.identity;
    if (this.isEditingMode) {
        translate = Transform.translate(this.options.nButtons * this.options.buttonSizeX,0,0);
    } else {
        translate = Transform.translate(0,0,0);
    }
    this.itemMod.setTransform(translate, this.wallTransition);
};

ItemView.prototype.animateLeftButtons = function(){
    for (var i = 0; i < this.options.nButtons; i++) {
        var Opacity = Math.min((this.pos[0] - this.options.buttonSizeX * i )/(this.options.nButtons*this.options.buttonSizeX), 1);
        this['leftButton'+i+'Mod'].setOpacity(Opacity);
    }
};

ItemView.prototype.animateLeftButtonsEnd = function(){
    for (var i = 0; i < this.options.nButtons; i++) {
        if (this.isEditingMode) {
            this['leftButton'+i+'Mod'].setOpacity(1, this.returnZeroOpacityTransition);
        } else {
            this['leftButton'+i+'Mod'].setOpacity(0, this.returnZeroOpacityTransition);
        }
    }
};

ItemView.prototype.animateRightButtons = function(){
    if (this.pos[0] < 0) {
        this.rightButtonMod.setOpacity(Math.min(-1*this.pos[0]/(0.5*window.innerWidth),1));
    }
};

ItemView.prototype.animateRightButtonsEnd = function(){
    this.rightButtonMod.setOpacity(0, this.returnZeroOpacityTransition)
};

ItemView.prototype.resizeItem = function(){
    if (this.itemSurface._currTarget) this.itemSurface._currTarget.children[0].style.width = window.innerWidth + 'px';
    if (this.backgroundSurface._currTarget) {
        this.backgroundSurface._currTarget.children[0].style.width = window.innerWidth - this.options.paddingLeft - this.options.paddingRight + 'px';
//            outerHTML = Templates.itemFrame(this.options.paddingLeft, this.options.paddingRight);
    }
};

ItemView.prototype.setEditingOn = function(){
    this.isEditingMode = true;
    this.animateItemEnd();
    this.animateLeftButtonsEnd();
    this.animateRightButtonsEnd();
};

ItemView.prototype.setEditingOff = function(){
    setTimeout(function(){
        this.isEditingMode = false;
        this.animateItemEnd();
        this.animateLeftButtonsEnd();
        this.animateRightButtonsEnd();
    }.bind(this),100);
};

ItemView.prototype.toggleEditing = function(){
    this.isEditingMode = !this.isEditingMode;
    this.animateItemEnd();
    this.animateLeftButtonsEnd();
    this.animateRightButtonsEnd();
};

ItemView.prototype.collapse = function(callback) {
    this.surfacesMod.setOpacity(0,{duration:600}, callback);
};

ItemView.prototype.expand = function(callback) {
    this.surfacesMod.setOpacity(1,{duration:600}, callback);
};

ItemView.prototype.getSize = function() {
    var sh = this.surfacesMod.opacityState.get();
    return [this.options.size[0], Math.floor(this.options.size[1]*sh) || 1];
};

ItemView.prototype.onToggleAll = function (){
    if ( this.areEditingMode == false){
        this.setEditingOn();
    } else {
        this.setEditingOff();
    }
    this.areEditingMode =! this.areEditingMode;
};

ItemView.prototype.events = function() {
    _(this.options.leftButtons).each(function (b, i) {
        this['leftButton'+i].on('click', function(b) {
            console.log(b.event);
            this.eventOutput.emit(b.event, this.model);
        }.bind(this,b));
    }.bind(this));

    this.itemSurface.on('click', function(){
        if (this.pos[0] == 0 && this.pos[1] == 0 && this.isEditingMode == false){
            this.eventOutput.emit(this.options.itemButton.event, this.model);
        }
    }.bind(this));

    this.eventInput.on('backToNoneEditing', function(){this.areEditingMode = false}.bind(this))
};

module.exports = ItemView;

