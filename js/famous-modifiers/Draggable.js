define(function(require, exports, module) {
	var FM = require('famous/Matrix');
	var MouseSync = require('famous-sync/MouseSync');
	var TouchSync = require('famous-sync/TouchSync');
	var GenericSync = require('famous-sync/GenericSync');
	var FTH = require('famous/Transitionable');
	var EventHandler = require('famous/EventHandler');

    /**
     * @class Draggable
     * @description
     * Makes the linked renderables responsive to dragging.
     * @name Draggable
     * @constructor
     * @example 
     *	define(function(require, exports, module) {
     *	    var Engine = require('famous/Engine');
     *	    var Draggable = require('famous-modifiers/Draggable');
     *	    var Surface = require('famous/Surface');
     *
     *	    var Context = Engine.createContext();
     *	    var draggable = new Draggable();
     *	    var surface = new Surface({
     *	        content: 'test',
     *	        properties: {
     *	            backgroundColor:'#3cf'
     *	        },
     *	        size: [300, 300]
     *	    });
     *
     *	    surface.pipe(draggable);
     *
     *	    Context.link(draggable).link(surface);
     *	});
     */
	function Draggable(options) {
		this.options = Object.create(Draggable.DEFAULT_OPTIONS);
		if (options) this.setOptions(options);

		this._positionState = new FTH([0,0]);
		this._cursorPos = [0, 0];
		this._active = true;

		this.sync = new GenericSync(
			(function() { return this._cursorPos; }).bind(this),
			{
				scale : this.options.scale,
				syncClasses : [MouseSync, TouchSync]
			}
		);

		this.eventOutput = new EventHandler();
		EventHandler.setInputHandler(this,  this.sync);
		EventHandler.setOutputHandler(this, this.eventOutput);

		_bindEvents.call(this);
	}

	//binary representation of directions for bitwise operations
	var _direction = {
		x : 0x001,         //001
		y : 0x002          //010
	}

	Draggable.DEFAULT_OPTIONS = {
		projection  : _direction.x | _direction.y,
		scale       : 1,
		maxX        : Infinity,
		maxY        : Infinity,
		snapX       : 0,
		snapY       : 0,
		transition  : {duration : 0}
	}

	function _handleStart(){
		var pos = this.getPosition();
		this._cursorPos = pos.slice();
		this.eventOutput.emit('dragstart', {p : pos});
	}

	function _handleMove(event){
		if (this._active){
			this.setPosition(_mapPosition.call(this, event.p), this.options.transition);
			this._cursorPos = event.p;
		}
		this.eventOutput.emit('dragmove', {p : this.getPosition()});
	}

	function _handleEnd(){
		this.eventOutput.emit('dragend', {p : this.getPosition()});
	}

	function _bindEvents() {
		this.sync.on('start',  _handleStart.bind(this));
		this.sync.on('update', _handleMove.bind(this));
		this.sync.on('end',    _handleEnd.bind(this));
	}

	function _mapPosition (pos){
		var opts        = this.options;
		var projection  = opts.projection;
		var maxX        = opts.maxX;
		var maxY        = opts.maxY;
		var snapX       = opts.snapX;
		var snapY       = opts.snapY;

		//axes
		var tx = (projection & _direction.x) ? pos[0] : 0;
		var ty = (projection & _direction.y) ? pos[1] : 0;

		//snapping
		if (snapX > 0) tx -= tx % snapX;
		if (snapY > 0) ty -= ty % snapY;

		//containment within maxX, maxY bounds
		tx = Math.max(Math.min(tx, maxX), -maxX);
		ty = Math.max(Math.min(ty, maxY), -maxY);

		return [tx,ty];
	}

	Draggable.prototype.setOptions = function(options){
		var opts = this.options;
		if (options.projection !== undefined){
			var proj = options.projection;
			this.options.projection = 0;
			['x', 'y'].forEach(function(val){
				if (proj.indexOf(val) != -1) opts.projection |= _direction[val];
			});
		};
		if (options.scale !== undefined)        opts.scale = options.scale;
		if (options.maxX !== undefined)         opts.maxX = options.maxX;
		if (options.maxY !== undefined)         opts.maxY = options.maxY;
		if (options.snapX !== undefined)        opts.snapX = options.snapX;
		if (options.snapY !== undefined)        opts.snapY = options.snapY;
		if (options.transition !== undefined)   opts.transition = options.transition;
	}

	Draggable.prototype.getPosition = function() {
		return this._positionState.get();
	};

	Draggable.prototype.setPosition = function(p, transition, callback) {
		if (this._positionState.isActive()) this._positionState.halt();
		this._positionState.set(p, transition, callback);
	};

	Draggable.prototype.activate = function(){
		this._active = true;
	}

	Draggable.prototype.deactivate = function(){
		this._active = false;
	}

	Draggable.prototype.toggle = function(){
		this._active = !this._active;
	}

	Draggable.prototype.render = function(target) {
		var pos = this.getPosition();
		return {
			transform: FM.translate(pos[0], pos[1]),
			target: target
		};
	}

	module.exports = Draggable;

});
