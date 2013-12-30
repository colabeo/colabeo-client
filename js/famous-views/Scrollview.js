define(function(require, exports, module) {
    var Utility = require('famous/Utility');

    var PhysicsEngine = require('famous-physics/PhysicsEngine');
    var Particle = require('famous-physics/bodies/Particle');
    var Drag = require('famous-physics/forces/Drag');
    var Spring = require('famous-physics/forces/Spring');

    var Matrix = require('famous/Matrix');
    var EventHandler = require('famous/EventHandler');
    var GenericSync = require('famous-sync/GenericSync');
    var ViewSequence = require('famous/ViewSequence');
    var Group = require('famous/Group');
    var Entity = require('famous/Entity');

    /**
     * @class Lays out the sequenced renderables sequentially and makes them scrollable.
     * @description
     * @name Scrollview
     * @constructor
     * @example 
     * define(function(require, exports, module) {
     *     var Engine = require('famous/Engine');
     *     var Scrollview = require('famous-views/Scrollview');
     *     var Surface = require('famous/Surface');
     * 
     *     var Context = Engine.createContext();
     *     var scrollview = new Scrollview({
     *         itemSpacing: 20
     *     });
     * 
     *     var surfaces = [];
     *     for (var index = 0; index < 50; index++) {
     *         surfaces.push(
     *             new Surface({
     *                 content: 'test ' + String(index + 1),
     *                 size: [300, 100],
     *                 properties: {
     *                     backgroundColor: 'white',
     *                     color: 'black'
     *                 }
     *             })
     *         );
     *     }
     * 
     *     scrollview.sequenceFrom(surfaces);
     *     Engine.pipe(scrollview);
     *     Context.link(scrollview);
     * });
     */
    function Scrollview(options) {
        this.options = {
            direction: Utility.Direction.Y,
            rails: true,
            defaultItemSize: [100, 100],
            itemSpacing: 0,
            clipSize: undefined,
            margin: undefined,
            drag: 0.001,
            edgeGrip: 0.5,
            edgePeriod: 300,
            edgeDamp: 1,
            paginated: false,
            pagePeriod: 500,
            pageDamp: 0.8,
            pageStopSpeed: Infinity,
            pageSwitchSpeed: 1,
            speedLimit: 10
        };

        this.physicsEngine = new PhysicsEngine();
        this.particle = new Particle();
        this.physicsEngine.addBody(this.particle);

        this.spring = new Spring({anchor: [0, 0, 0]});
        this.drag = new Drag();

        this.sync = new GenericSync((function() {
            return -this.getPosition();
        }).bind(this), {direction: (this.options.direction == Utility.Direction.X) ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y});
        
        this.eventInput = new EventHandler();
        this.eventOutput = new EventHandler();
        this.sync.pipe(this.eventInput);
        this.sync.pipe(this.eventOutput);

        EventHandler.setOutputHandler(this, this.eventOutput);

        this._outputFunction = undefined;
        this._masterOutputFunction = undefined;
        this.setOutputFunction(); // use default

        this.touchCount = 0;
        this._springAttached = false;
        this.currSpring = undefined;
        this._onEdge = 0; // -1 for top, 1 for bottom
        this._springPosition = 0;
        this._touchVelocity = undefined;
        this._earlyEnd = false;

        this._masterOffset = 0; // minimize writes
        this._lastFrameNode = undefined;
        
        if(options) this.setOptions(options);
        else this.setOptions({});

        _bindEvents.call(this);

        this.group = new Group();
        this.group.link({render: _innerRender.bind(this)});

        this._entityId = Entity.register(this);
        this._contextSize = [window.innerWidth, window.innerHeight];

        this._offsets = {};
    }

    function _handleStart(event) {
        this.touchCount = event.count;
        if(event.count === undefined) this.touchCount = 1;
        
        _detachAgents.call(this);
        this.setVelocity(0);
        this._touchVelocity = 0;
        this._earlyEnd = false;
    }

    function _handleMove(event) {
        var pos = -event.p;
        var vel = -event.v;
        if(this._onEdge && event.slip) {
            if((vel < 0 && this._onEdge < 0) || (vel > 0 && this._onEdge > 0)) {
                if(!this._earlyEnd) {
                    _handleEnd.call(this, event);
                    this._earlyEnd = true;
                }
            }
            else if(this._earlyEnd && (Math.abs(vel) > Math.abs(this.particle.getVel()[0]))) {
                _handleStart.call(this, event);
            }
        }
        if(this._earlyEnd) return;
        this._touchVelocity = vel;
        this.setPosition(pos);
    }

    function _handleEnd(event) {
        this.touchCount = event.count || 0;
        if(!this.touchCount) {
            _detachAgents.call(this);
            if(this._onEdge) this._springAttached = true;
            _attachAgents.call(this);
            var vel = -event.v;
            var speedLimit = this.options.speedLimit;
            if(event.slip) speedLimit *= this.options.edgeGrip;
            if(vel < -speedLimit) vel = -speedLimit;
            else if(vel > speedLimit) vel = speedLimit;
            this.setVelocity(vel);
            this._touchVelocity = undefined;
        }
    }

    function _bindEvents() {
        this.eventInput.on('start', _handleStart.bind(this));
        this.eventInput.on('update', _handleMove.bind(this));
        this.eventInput.on('end', _handleEnd.bind(this));
    }

    function _attachAgents() {
        if(this._springAttached) this.physicsEngine.attach([this.spring], this.particle);
        else this.physicsEngine.attach([this.drag], this.particle);
    }

    function _detachAgents() {
        this._springAttached = false;
        this.physicsEngine.detachAll();
    }

    function _sizeForDir(size) {
        if(!size) size = this.options.defaultItemSize;
        return size[(this.options.direction == Utility.Direction.X) ? 0 : 1];
    }

    function _shiftOrigin(amount) {
        this._springPosition += amount;
        this.setPosition(this.getPosition() + amount);
        this.spring.setOpts({anchor: [this._springPosition, 0, 0]});
    }

    function _normalizeState() {
        var atEdge = false;
        while(!atEdge && this.getPosition() < 0) {
            var prevNode = this.node.getPrevious ? this.node.getPrevious() : undefined;
            if(prevNode) {
                var prevSize = prevNode.getSize ? prevNode.getSize() : this.options.defaultItemSize;
                var dimSize = _sizeForDir.call(this, prevSize) + this.options.itemSpacing;
                _shiftOrigin.call(this, dimSize);
                this._masterOffset -= dimSize;
                this.node = prevNode;
            }
            else atEdge = true;
        }
        var size = (this.node && this.node.getSize) ? this.node.getSize() : this.options.defaultItemSize;
        while(!atEdge && this.getPosition() >= _sizeForDir.call(this, size) + this.options.itemSpacing) {
            var nextNode = this.node.getNext ? this.node.getNext() : undefined;
            if(nextNode) {
                var dimSize = _sizeForDir.call(this, size) + this.options.itemSpacing;
                _shiftOrigin.call(this, -dimSize);
                this._masterOffset += dimSize;
                this.node = nextNode;
                size = this.node.getSize ? this.node.getSize() : this.options.defaultItemSize;
            }
            else atEdge = true;
        }
        if(Math.abs(this._masterOffset) > (_getClipSize.call(this) + this.options.margin)) this._masterOffset = 0;
    }

    function _handleEdge(edgeDetected) {
        if(!this._onEdge && edgeDetected) {
            this.sync.setOptions({scale: this.options.edgeGrip});
            if(!this.touchCount && !this._springAttached) {
                this._springAttached = true;
                this.physicsEngine.attach([this.spring], this.particle);
            }
        }
        else if(this._onEdge && !edgeDetected) {
            this.sync.setOptions({scale: 1});
            if(this._springAttached) {
                // reset agents, detaching the spring
                _detachAgents.call(this);
                _attachAgents.call(this);
            }
        }
        this._onEdge = edgeDetected;
    }

    function _handlePagination() {
        if(this.touchCount == 0 && !this._springAttached && !this._onEdge) {
            if(this.options.paginated && Math.abs(this.getVelocity()) < this.options.pageStopSpeed) {
                var nodeSize = this.node.getSize ? this.node.getSize() : this.options.defaultItemSize;

                // parameters to determine when to switch
                var velSwitch = Math.abs(this.getVelocity()) > this.options.pageSwitchSpeed;
                var velNext = this.getVelocity() > 0;
                var posNext = this.getPosition() > 0.5*_sizeForDir.call(this, nodeSize);

                if((velSwitch && velNext)|| (!velSwitch && posNext)) this.goToNextPage();
                // no need to handle prev case since the origin is already the 'previous' page

                _setSpring.call(this, 0, {period: this.options.pagePeriod, damp: this.options.pageDamp});
                this._springAttached = true;
                this.physicsEngine.attach([this.spring], this.particle);
            }
        }
    }

    function _setSpring(position, parameters) {
        if(!parameters) parameters = {period: this.options.edgePeriod, damp: this.options.edgeDamp};
        this._springPosition = position;
        this.spring.setOpts({
            anchor: [this._springPosition, 0, 0],
            period: parameters.period,
            dampingRatio: parameters.damp
        });
    }

    function _output(node, offset, target) {
        var size = node.getSize ? node.getSize() : this.options.defaultItemSize;
        if(!size) size = this.options.defaultItemSize;
        var transform = this._outputFunction(offset);
        target.push({transform: transform, target: node.render()});
        return size[(this.options.direction == Utility.Direction.X) ? 0 : 1];
    }

    function _getClipSize() {
        if(this.options.clipSize) return this.options.clipSize;
        else return _sizeForDir.call(this, this._contextSize);
    }

    Scrollview.prototype.emit = function(type, data) {
        if(type == 'update' || type == 'start' || type == 'end') this.eventInput.emit(type, data);
        else this.sync.emit(type, data);
    }

    Scrollview.prototype.getPosition = function(node) {
        var pos = this.particle.getPos()[0];
        if( node === undefined ) return pos;
        else {
            var offset = this._offsets[node];
            if(offset !== undefined) return pos - offset;
            else return undefined;
        }
    }

    Scrollview.prototype.setPosition = function(pos) {
        this.particle.setPos([pos, 0, 0]);
    }

    Scrollview.prototype.getVelocity = function() {
        return this.touchCount ? this._touchVelocity : this.particle.getVel()[0];
    }

    Scrollview.prototype.setVelocity = function(v) {
        this.particle.setVel([v, 0, 0]);
    }

    Scrollview.prototype.getOptions = function() {
        return this.options;
    }

    Scrollview.prototype.setOptions = function(options) {
        if(options.direction !== undefined) {
            this.options.direction = options.direction;
            if(this.options.direction === 'x') this.options.direction = Utility.Direction.X;
            else if(this.options.direction === 'y') this.options.direction = Utility.Direction.Y;
        }
        if(options.rails !== undefined) this.options.rails = options.rails;
        if(options.defaultItemSize !== undefined) this.options.defaultItemSize = options.defaultItemSize;
        if(options.itemSpacing !== undefined) this.options.itemSpacing = options.itemSpacing;
        if(options.clipSize !== undefined) this.options.clipSize = options.clipSize;
        if(options.margin !== undefined) this.options.margin = options.margin;

        if(options.drag !== undefined) this.options.drag = options.drag;
        if(options.friction !== undefined) this.options.friction = options.friction;

        if(options.edgeGrip !== undefined) this.options.edgeGrip = options.edgeGrip;
        if(options.edgePeriod !== undefined) this.options.edgePeriod = options.edgePeriod;
        if(options.edgeDamp !== undefined) this.options.edgeDamp = options.edgeDamp;

        if(options.paginated !== undefined) this.options.paginated = options.paginated;
        if(options.pageStopSpeed !== undefined) this.options.pageStopSpeed = options.pageStopSpeed;
        if(options.pageSwitchSpeed !== undefined) this.options.pageSwitchSpeed = options.pageSwitchSpeed;
        if(options.pagePeriod !== undefined) this.options.pagePeriod = options.pagePeriod;
        if(options.pageDamp !== undefined) this.options.pageDamp = options.pageDamp;

        if(options.speedLimit !== undefined) this.options.speedLimit = options.speedLimit;

        if(this.options.margin === undefined) this.options.margin = 0.5*Math.max(window.innerWidth, window.innerHeight);

        this.drag.setOpts({strength: this.options.drag});
        this.spring.setOpts({
            period: this.options.edgePeriod,
            dampingRatio: this.options.edgeDamp
        });

        this.sync.setOptions({
            rails: this.options.rails, 
            direction: (this.options.direction == Utility.Direction.X) ? GenericSync.DIRECTION_X : GenericSync.DIRECTION_Y
        });
    }

    Scrollview.prototype.setOutputFunction = function(fn, masterFn) {
        if(!fn) {
            fn = (function(offset) {
                return (this.options.direction == Utility.Direction.X) ? Matrix.translate(offset, 0) : Matrix.translate(0, offset);
            }).bind(this);
            masterFn = fn;
        }
        this._outputFunction = fn;
        this._masterOutputFunction = masterFn ? masterFn : function(offset) {
            return Matrix.inverse(fn(-offset));
        };
    }

    Scrollview.prototype.goToPreviousPage = function() {
        var prevNode = this.node.getPrevious ? this.node.getPrevious() : undefined;
        if(prevNode) {
            var positionModification = _sizeForDir.call(this, this.node.getSize()) + this.options.itemSpacing;
            this.setPosition(this.getPosition() + positionModification);
            this.node = prevNode;
            for(var i in this.offsets) this.offsets[i] += positionModification;
        }
        return prevNode;
    }

    Scrollview.prototype.goToNextPage = function() {
        var nextNode = this.node.getNext ? this.node.getNext() : undefined;
        if(nextNode) {
            var positionModification = _sizeForDir.call(this, this.node.getSize()) + this.options.itemSpacing;
            this.setPosition(this.getPosition() - positionModification);
            this.node = nextNode;
            for(var i in this.offsets) this.offsets[i] -= positionModification;
        }
        return nextNode;
    }

    Scrollview.prototype.getCurrentNode = function() {
        return this.node;
    }

    Scrollview.prototype.sequenceFrom = function(node) {
        if(node instanceof Array) node = new ViewSequence(node);
        this.node = node;
        this._lastFrameNode = node;
    }

    Scrollview.prototype.getSize = function() {
        if(this.options.direction == Utility.Direction.X) return [_getClipSize.call(this), undefined];
        else return [undefined, _getClipSize.call(this)];
    }

    Scrollview.prototype.render = function() {
        this.physicsEngine.step();
        return this._entityId;
    }

    Scrollview.prototype.commit = function(context, transform, opacity, origin, size) {
        this._contextSize = size;
        _normalizeState.call(this);
        var pos = this.getPosition();
        var scrollTransform = this._masterOutputFunction(-(pos + this._masterOffset));
        return {
            transform: Matrix.moveThen([-origin[0]*size[0], -origin[1]*size[1], 0], transform),
            opacity: opacity,
            origin: origin,
            size: size,
            target: {
                transform: scrollTransform,
                origin: origin,
                target: this.group.render()
            }
        };
    }

    function _innerRender() {
        var offsets = {};
        if(this.node) {
            var pos = this.getPosition();
            var result = [];

            var edgeDetected = 0; // -1 for top, 1 for bottom

            // forwards
            var offset = 0;
            var currNode = this.node;
            offsets[currNode] = 0;
            while(currNode && offset - pos < _getClipSize.call(this) + this.options.margin) {
                offset += _output.call(this, currNode, offset + this._masterOffset, result) + this.options.itemSpacing;
                currNode = currNode.getNext ? currNode.getNext() : undefined;
                offsets[currNode] = offset;
                if(!currNode && offset - pos - this.options.itemSpacing <= _getClipSize.call(this)) {
                    if(!this._onEdge) _setSpring.call(this, offset - _getClipSize.call(this) - this.options.itemSpacing);
                    edgeDetected = 1;
                }
            }

            // backwards
            currNode = (this.node && this.node.getPrevious) ? this.node.getPrevious() : undefined;
            offset = 0;
            if(currNode) {
                var size = currNode.getSize ? currNode.getSize() : this.options.defaultItemSize;
                offset -= _sizeForDir.call(this, size) + this.options.itemSpacing;
            }
            else {
                if(pos <= 0) {
                    if(!this._onEdge) _setSpring.call(this, 0);
                    edgeDetected = -1;
                }
            }
            while(currNode && ((offset - pos) > -(_getClipSize.call(this) + this.options.margin))) {
                offsets[currNode] = offset;
                _output.call(this, currNode, offset + this._masterOffset, result);
                currNode = currNode.getPrevious ? currNode.getPrevious() : undefined;
                if(currNode) {
                    var size = currNode.getSize ? currNode.getSize() : this.options.defaultItemSize;
                    offset -= _sizeForDir.call(this, size) + this.options.itemSpacing;
                }
            }

            this._offsets = offsets;

            _handleEdge.call(this, edgeDetected);
            _handlePagination.call(this);

            if(this.options.paginated && (this._lastFrameNode !== this.node)) {
                this.eventOutput.emit('pageChange');
                this._lastFrameNode = this.node;
            }

            return result;
        }
        else return;
    }

    module.exports = Scrollview;

});
