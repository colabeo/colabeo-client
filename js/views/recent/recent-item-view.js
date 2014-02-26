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

    var Engine = require('famous/Engine');

    Transitionable.registerMethod('wall', WallTransition);
    Transitionable.registerMethod('spring', SpringTransition);

    function TestContactItemView(options){
        View.apply(this, arguments);

        this.model = options.model;

        this.paddingLeft = 10;
        this.paddingRight = 20;
        this.surfaceOriginY = 0;
        this.buttonSizeX = 50;
        this.buttonSizeY = 50;
        this.leftEndOrigin = [0, this.surfaceOriginY];
        this.editingOrigin = this.setEditingOrigion();
        this.rightEndOrigin = [1, this.surfaceOriginY];

        this.setupSurfaces();

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
            this.pos = this.isEditingMode? [2*this.buttonSizeX, 0] : [0,0];
        }.bind(this));

        sync.on('update', function(data) {
            this.pos = data.p;  // the displacement from the start touch point.
            this.animateItem();
//            if (this.pos[0] > 0) {

            this.animateLeftButtons();
//            } else {
            this.animateRightButtons();
//            }
        }.bind(this));

        sync.on('end', function(data) {
            this.pos = data.p;
            if (this.pos[0] > 2*this.buttonSizeX){
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


    }

    TestContactItemView.prototype = Object.create(View.prototype);
    TestContactItemView.prototype.constructor = TestContactItemView;

    TestContactItemView.prototype.setupSurfaces = function(){
        var bc = this.model.collection.indexOf(this.model)%2 ? 0.1 : 0.2;
        this.backgroundSurface = new Surface({
            content: '<div style="width: ' + window.innerWidth + 'px"></div>',
            size: [true, this.buttonSizeY],
            properties:{
                backgroundColor: "rgba(111,111,111," + bc + ")"
            }
        });
        this.deleteSurface = new Surface({
            classes: ['item-buttons'],
            content:'<button class="fa fa-trash-o fa-2x delete-button2"></button>',
            size: [this.buttonSizeX,this.buttonSizeY]
        });
        this.deleteMod = new Modifier({
            origin: this.leftEndOrigin,
            opacity: 0,
            transform:Transform.translate(this.paddingLeft * 2 ,0,0)
        });

        this.favorSurface = new Surface({
            classes: ['item-buttons'],
            content:'<button class="fa fa-edit fa-2x edit-button2"></button>',
            size: [this.buttonSizeX,this.buttonSizeY]
        });
        this.favorMod = new Modifier({
            origin: this.leftEndOrigin,
            opacity: 0,
            transform:Transform.translate(this.buttonSizeX + this.paddingLeft * 2 ,0,0)
        });

        this.callSurface = new Surface({
            classes: ['item-buttons'],
            content:'<button class="fa fa-phone fa-2x call-button2"></button>',
            size: [this.buttonSizeX, this.buttonSizeY]
        });
        this.callMod = new Modifier({
            origin: this.rightEndOrigin,
            opacity: 0,
            transform: Transform.translate(-this.paddingRight,0,0)
        });


        this.itemSurface = new Surface({
            classes: ['contact-item', 'recent-item'],
            size: [true, this.buttonSizeY],
            properties:{
                backgroundColor: "transparent",
                zIndex:9
            }
        });
        this.setItemContent();
        this.itemMod = new Modifier({
            origin: this.leftEndOrigin
        });

        this.surfaces = new RenderNode ();
        this.surfacesMod = new Modifier();
        this.itemSurface.pipe(this.eventOutput);
        this.deleteSurface.pipe(this.eventOutput);
        this.favorSurface.pipe(this.eventOutput);

        this.surfaces.add(this.backgroundSurface);
        this.surfaces.add(this.deleteMod).link(this.deleteSurface);
        this.surfaces.add(this.favorMod).link(this.favorSurface);
        this.surfaces.add(this.callMod).link(this.callSurface);
        this.surfaces.add(this.itemMod).link(this.itemSurface);

        this.node.link(this.surfacesMod).link(this.surfaces)

    };

    TestContactItemView.prototype.setItemContent = function() {
        var name;
        if (this.model.get('firstname') || this.model.get('lastname')) {
            name = this.model.get('firstname') + " <b>" + this.model.get('lastname') + "</b>";
        } else {
            name = this.model.get('email');
        }
        var icon = ''; //'<i class="fa fa-sign-in"></i>';
        var missed = '';
        if (this.model.get('type') == 'outgoing')
            icon = '<i class="fa fa-sign-out"></i>';
        else {
            if (!this.model.get('success'))
                missed = "missed";
        }
//        var contact = '<div class="source '+missed+'" style="width: ' + window.innerWidth + 'px"><div class="call-type">'+icon+'</div>' + name;

        var contact = '<div style = " width: ' + window.innerWidth + 'px"><div class="source '+missed+'"><div class="call-type">'+icon+'</div>' + name;
        contact += '<div class="call-time">' + TimeAgo.parse(this.model.get('time')) + ' ago</div></div></div>';
        this.itemSurface.setContent(contact);
    };

    TestContactItemView.prototype.setEditingOrigion = function(){
        return [(2*this.buttonSizeX)/window.innerWidth, this.surfaceOriginY];
    };

    TestContactItemView.prototype.animateItem = function(){
        this.itemMod.setTransform(Transform.translate(this.pos[0], 0, 0));
    };

    TestContactItemView.prototype.animateItemEnd = function(){
        var translate = Transform.identity;
        if (this.isEditingMode) {
            translate = Transform.translate(2*this.buttonSizeX,0,0);
        } else {
            translate = Transform.translate(0,0,0);
        }
        this.itemMod.setTransform(translate, this.wallTransition);
    };

    TestContactItemView.prototype.animateLeftButtons = function(){
        var deleteOpacity = Math.min((this.pos[0] )/(2*this.buttonSizeX), 1);
        var favOpacity = Math.min((this.pos[0] - this.buttonSizeX )/(this.buttonSizeX), 1);
        this.deleteMod.setOpacity(deleteOpacity);
        this.favorMod.setOpacity(favOpacity);
    };

    TestContactItemView.prototype.animateLeftButtonsEnd = function(){
        if (this.isEditingMode) {
            this.deleteMod.setOpacity(1, this.returnZeroOpacityTransition);
            this.favorMod.setOpacity(1, this.returnZeroOpacityTransition)
        } else {
            this.deleteMod.setOpacity(0, this.returnZeroOpacityTransition);
            this.favorMod.setOpacity(0, this.returnZeroOpacityTransition)
        }
    };

    TestContactItemView.prototype.animateRightButtons = function(){
        if (this.pos[0] < 0) {
            this.callMod.setOpacity(Math.min(-1*this.pos[0]/(0.5*window.innerWidth),1));
        }
    };

    TestContactItemView.prototype.animateRightButtonsEnd = function(){
        this.callMod.setOpacity(0, this.returnZeroOpacityTransition)
    };

    TestContactItemView.prototype.resizeItem = function(){
        this.editingOrigin = this.setEditingOrigion();
        if (this.isEditingMode) this.itemMod.setOrigin(this.editingOrigin);
        if (this.itemSurface._currTarget) this.itemSurface._currTarget.children[0].style.width = window.innerWidth + 'px';
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

    TestContactItemView.prototype.collapse = function(callback) {
        this.surfacesMod.setOpacity(0,{duration:600}, callback);
    };

    TestContactItemView.prototype.getSize = function() {
        var sh = this.surfacesMod.opacityState.get();
        var size = this.itemSurface.getSize();
        size[1] = Math.floor(size[1]*sh);
        return size;
    };

    TestContactItemView.prototype.events = function() {
        this.deleteSurface.on('click', function() {
            this.model.destroy();
        }.bind(this));

        this.favorSurface.on('click', function(e){
            console.log(e);
        }.bind(this));

        this.itemSurface.on('click', function(){
            if (this.pos[0] == 0 && this.pos[1] == 0 && this.isEditingMode == false){
                this.eventOutput.emit('editContact', this.model)
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