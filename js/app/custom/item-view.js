define(function(require, exports, module) {
    var RenderNode = require('famous/RenderNode');
    var Surface = require('famous/Surface');
    var View = require('famous/View');
    var Modifier = require('famous/Modifier');
    var GenericSync = require('famous-sync/GenericSync');
    var MouseSync = require('famous-sync/MouseSync');
    var TouchSync = require('famous-sync/TouchSync');
    var Transform = require('famous/Matrix');
    var Easing = require('famous-animation/Easing');
    var TimeAgo        = require('famous-utils/TimeAgo');
    var Transitionable   = require('famous/Transitionable');
    var WallTransition   = require('famous-physics/utils/WallTransition');
    var SpringTransition   = require('famous-physics/utils/SpringTransition');
    var Templates = require('app/custom/Templates');

    var Engine = require('famous/Engine');

    Transitionable.registerMethod('wall', WallTransition);
    Transitionable.registerMethod('spring', SpringTransition);

    // leftButton1Content, rightButtonContent, itemClasses(array)
    
    function TestContactItemView(options){
        View.apply(this, arguments);

        this.model = options.model;
        this.options = {
            paddingLeft : 10,
            paddingRight : 20,
            buttonSizeX : 50,
            buttonSizeY : 50,
            _leftEndOrigin : [0, 0],
            _rightEndOrigin : [1, 0],
            _editingOrigin : this.setEditingOrigion()
        };

        this.setOptions(options);

        this.setupSurfaces(options);

        this.pos = [0,0];
        this.isEditingMode = false;

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
                this.eventOutput.emit('outgoingCall', this.model);
                this.setEditingOff();
            }
        }.bind(this));

        Engine.on('resize', this.resizeItem.bind(this));

        window.tt=this;

        function stopEvents ( e ) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    TestContactItemView.prototype = Object.create(View.prototype);
    TestContactItemView.prototype.constructor = TestContactItemView;

    TestContactItemView.prototype.setOptions = function(options){
        _.extend(this.options, options);
        this.options.nButtons = options.leftButtons.length;
    };

    TestContactItemView.prototype.setupSurfaces = function(options){
        this.surfaces = new RenderNode ();
        this.surfacesMod = new Modifier();
        
        var bc = this.model.collection.indexOf(this.model)%2 ? 0.1 : 0.2;
        this.backgroundSurface = new Surface({
            content: Templates.itemFrame(20),
            size: [true, this.options.buttonSizeY]
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
                transform:Transform.translate(this.options.paddingLeft * 2 + this.options.buttonSizeX * (i) ,0,0)
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
            classes: options.itemClasses,
            size: [true, this.options.buttonSizeY],
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

    TestContactItemView.prototype.setEditingOrigion = function(){
        return [(this.options.nButtons*this.options.buttonSizeX)/window.innerWidth, 0];
    };

    TestContactItemView.prototype.animateItem = function(){
        this.itemMod.setTransform(Transform.translate(this.pos[0], 0, 0));
    };

    TestContactItemView.prototype.animateItemEnd = function(){
        var translate = Transform.identity;
        if (this.isEditingMode) {
            translate = Transform.translate(this.options.nButtons * this.options.buttonSizeX,0,0);
        } else {
            translate = Transform.translate(0,0,0);
        }
        this.itemMod.setTransform(translate, this.wallTransition);
    };

    TestContactItemView.prototype.animateLeftButtons = function(){
        for (var i = 0; i < this.options.nButtons; i++) {
            var Opacity = Math.min((this.pos[0] - this.options.buttonSizeX * i )/(this.options.nButtons*this.options.buttonSizeX), 1);
            this['leftButton'+i+'Mod'].setOpacity(Opacity);
        }
    };

    TestContactItemView.prototype.animateLeftButtonsEnd = function(){
        for (var i = 0; i < this.options.nButtons; i++) {
            if (this.isEditingMode) {
                this['leftButton'+i+'Mod'].setOpacity(1, this.returnZeroOpacityTransition);
            } else {
                this['leftButton'+i+'Mod'].setOpacity(0, this.returnZeroOpacityTransition);
            }
        }
    };

    TestContactItemView.prototype.animateRightButtons = function(){
        if (this.pos[0] < 0) {
            this.rightButtonMod.setOpacity(Math.min(-1*this.pos[0]/(0.5*window.innerWidth),1));
        }
    };

    TestContactItemView.prototype.animateRightButtonsEnd = function(){
        this.rightButtonMod.setOpacity(0, this.returnZeroOpacityTransition)
    };

    TestContactItemView.prototype.resizeItem = function(){
        this.options._editingOrigin = this.setEditingOrigion();
        if (this.isEditingMode) this.itemMod.setOrigin(this.options._editingOrigin);
        if (this.itemSurface._currTarget) this.itemSurface._currTarget.children[0].style.width = window.innerWidth + 'px';
        if (this.backgroundSurface._currTarget) {
            jeff = this.backgroundSurface._currTarget.children[0];
            this.backgroundSurface._currTarget.children[0].outerHTML = Templates.itemFrame(20);
        }
    };

    TestContactItemView.prototype.setEditingOn = function(){
        this.isEditingMode = true;
        this.animateItemEnd();
        this.animateLeftButtonsEnd();
        this.animateRightButtonsEnd();
    };

    TestContactItemView.prototype.setEditingOff = function(){
        setTimeout(function(){
            this.isEditingMode = false;
            this.animateItemEnd();
            this.animateLeftButtonsEnd();
            this.animateRightButtonsEnd();
        }.bind(this),100);
    };

    TestContactItemView.prototype.toggleEditing = function(){
        this.isEditingMode = !this.isEditingMode;
        this.animateItemEnd();
        this.animateLeftButtonsEnd();
        this.animateRightButtonsEnd();
    };

    TestContactItemView.prototype.getSize = function() {
        var sh = this.surfacesMod.opacityState.get();
        var size = this.itemSurface.getSize();
        size[1] = Math.floor(size[1]*sh);
        return size;
    };

    TestContactItemView.prototype.events = function() {
        _(this.options.leftButtons).each(function (b, i) {
            this['leftButton'+i].on('click', function(b) {
                console.log(b.event);
                this.eventOutput.emit(b.event, this.model);
            }.bind(this,b));
        }.bind(this));

        this.itemSurface.on('click', function(){
            if (this.pos[0] == 0 && this.pos[1] == 0 && this.isEditingMode == false){
                this.eventOutput.emit('clickItem');
            }
        }.bind(this));

        this.areEditingMode = false;
        Engine.on('click', function(e){
            if ($(e.target).hasClass('edit-button')){
                if ( this.areEditingMode == false){
                    this.setEditingOn();
                } else {
                    this.setEditingOff();
                }
                this.areEditingMode =! this.areEditingMode;
            }
        }.bind(this));
    };

    module.exports = TestContactItemView;

});