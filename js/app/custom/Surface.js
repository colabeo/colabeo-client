define(function(require, exports, module) {
    var Entity = require('famous/Entity');
    var FamousEventHandler = require('famous/EventHandler');
    var FM = require('famous/Matrix');

    var usePrefix = document.body.style.webkitTransform !== undefined;

    /**
     * @class A base class for viewable content and event
     *    targets inside a Famous applcation, containing a renderable document
     *    fragment.
     * @description Like an HTML div, it can accept internal markup,
     *    properties, and classes, and handle events. This is a PUBLIC
     *    interface and can be extended.
     *
     * @name FamousSurface
     * @constructor
     *
     * @param {Array.<number>} size Width and height in absolute pixels (array of ints)
     * @param {string} content Document content (e.g. HTML) managed by this
     *    surface.
     */
    function FamousSurface(options) {
        this.options = {};

        this.properties = {};
        this.content = '';
        this.classList = [];
        this.size = undefined;

        this._classesDirty = true;
        this._stylesDirty = true;
        this._sizeDirty = true;
        this._contentDirty = true;

        this._dirtyClasses = [];

        this._matrix = undefined;
        this._opacity = 1;
        this._origin = undefined;
        this._size = undefined;

        /** @ignore */
        this.eventForwarder = function(event) {
            this.emit(event.type, event);
        }.bind(this);
        this.eventHandler = new FamousEventHandler();
        this.eventHandler.bindThis(this);

        this.id = Entity.register(this);

        if(options) this.setOptions(options);

        this._currTarget = undefined;
    };

    /**
     * Document events to which FamousSurface automatically listens.
     *   Bind to them with .on(), forward them with .pipe(), and similar.
     *
     * @name FamousSurface#surfaceEvents
     * @field
     * @type {Array.<string>}
     */
    FamousSurface.prototype.surfaceEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'click', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousewheel', 'wheel', 'keyup', 'keydown'];

    FamousSurface.prototype.elementType = 'div';
    FamousSurface.prototype.elementClass = 'surface';

    /**
     * Bind a handler function to occurrence of event type on this surface.
     *   Document events have the opportunity to first be intercepted by the
     *   on() method of the FamousSurface upon which the event occurs, then
     *   by the on() method of the FamousContext containing that surface, and
     *   finally as a default, the FamousEngine itself.
     *
     * @name FamousSurface#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    FamousSurface.prototype.on = function(type, fn) {
        this.eventHandler.on(type, fn);
    };

    /**
     * Unbind an event by type and handler.
     *   This undoes the work of {@link FamousSurface#on}
     *
     * @name FamousSurface#unbind
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler
     */
    FamousSurface.prototype.unbind = function(type, fn) {
        this.eventHandler.unbind(type, fn);
    };

    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     *
     * @name FamousSurface#emit
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {Object} event event data
     * @returns {boolean}  true if event was handled along the event chain.
     */
    FamousSurface.prototype.emit = function(type, event) {
        if(event && !event.origin) event.origin = this;
        var handled = this.eventHandler.emit(type, event);
        if(handled && event.stopPropagation) event.stopPropagation();
        return handled;
    };

    /**
     * Pipe all events to a target {@link emittoerObject}
     *
     * @name FamousSurface#pipe
     * @function
     * @param {emitterObject} target emitter object
     * @returns {emitterObject} target (to allow for chaining)
     */
    FamousSurface.prototype.pipe = function(target) {
        return this.eventHandler.pipe(target);
    };

    /**
     * (WARNING: DEPRECATED) Alias for FamousSurface#pipe
     * @deprecated
     *
     * @name FamousSurface#pipeEvents
     * @function
     * @param {emitterObject} target emitter object
     * @returns {emitterObject} target (to allow for chaining)
     */
    FamousSurface.prototype.pipeEvents = function(target) {
        console.warn('pipeEvents is deprecated; use pipe instead');
        return this.pipe.apply(this, arguments);
    };

    /**
     * Stop piping all events at the FamousEngine level to a target emitter
     *   object.  Undoes the work of #pipe.
     *
     * @name FamousSurface#unpipe
     * @function
     * @param {emitterObject} target emitter object
     */
    FamousSurface.prototype.unpipe = function(target) {
        return this.eventHandler.unpipe(target);
    };

    /**
     * Return spec for this surface. Note that for a base surface, this is
     *    simply an id.
     *
     * (Scope: Device developers and deeper)
     * @name FamousSurface#render
     * @function
     * @returns {number} Spec for this surface (spec id)
     */
    FamousSurface.prototype.render = function() {
        return this.id;
    };

    /**
     * Set CSS-style properties on this FamousSurface. Note that this will cause
     *    dirtying and thus re-rendering, even if values do not change (confirm)
     *
     * @name FamousSurface#setProperties
     * @function
     * @param {Object} properties property dictionary of "key" => "value"
     */
    FamousSurface.prototype.setProperties = function(properties) {
        for(n in properties) {
            this.properties[n] = properties[n];
        }
        this._stylesDirty = true;
    };

    /**
     * Get CSS-style properties on this FamousSurface.
     *
     * @name FamousSurface#getProperties
     * @function
     * @returns {Object} Dictionary of properties of this Surface.
     */
    FamousSurface.prototype.getProperties = function() {
        return this.properties;
    };

    /**
     * Add CSS-style class to the list of classes on this FamousSurface. Note
     *   this will map directly to the HTML property of the actual
     *   corresponding rendered <div>.
     *   These will be deployed to the document on call to .setup().
     *
     * @param {string} className name of class to add
     */
    FamousSurface.prototype.addClass = function(className) {
        if(this.classList.indexOf(className) < 0) {
            this.classList.push(className);
            this._classesDirty = true;
        }
    };

    /**
     * Remove CSS-style class from the list of classes on this FamousSurface.
     *   Note this will map directly to the HTML property of the actual
     *   corresponding rendered <div>.
     *   These will be deployed to the document on call to #setup().
     *
     * @name FamousSurface#removeClass
     * @function
     * @param {string} className name of class to remove
     */
    FamousSurface.prototype.removeClass = function(className) {
        var i = this.classList.indexOf(className);
        if(i >= 0) {
            this._dirtyClasses.push(this.classList.splice(i, 1)[0]);
            this._classesDirty = true;
        }
    };

    FamousSurface.prototype.setClasses = function(classList) {
        var removal = [];
        for(var i = 0; i < this.classList.length; i++) {
            if(classList.indexOf(this.classList[i]) < 0) removal.push(this.classList[i]);
        }
        for(var i = 0; i < removal.length; i++) this.removeClass(removal[i]);
        // duplicates are already checked by addClass()
        for(var i = 0; i < classList.length; i++) this.addClass(classList[i]);
    };

    /**
     * Get array of CSS-style classes attached to this div.
     *
     * @name FamousSurface#getClasslist
     * @function
     * @returns {Array.<string>} Returns an array of classNames
     */
    FamousSurface.prototype.getClassList = function() {
        return this.classList;
    };

    /**
     * Set or overwrite inner (HTML) content of this surface. Note that this
     *    causes a re-rendering if the content has changed.
     *
     * @name FamousSurface#setContent
     * @function
     *
     * @param {string} content HTML content
     */
    FamousSurface.prototype.setContent = function(content) {
        if(this.content != content) {
            this.content = content;
            this._contentDirty = true;
        }
    };

    /**
     * Return inner (HTML) content of this surface.
     *
     * @name FamousSurface#getContent
     * @function
     *
     * @returns {string} inner (HTML) content
     */
    FamousSurface.prototype.getContent = function() {
        return this.content;
    };

    /**
     * Set options for this surface
     *
     * @name FamousSurface#setOptions
     * @function
     *
     * @param {Object} options options hash
     */
    FamousSurface.prototype.setOptions = function(options) {
        if(options.size) this.setSize(options.size);
        if(options.classes) this.setClasses(options.classes);
        if(options.properties) this.setProperties(options.properties);
        if(options.content) this.setContent(options.content);
    };


    /**
     *   Attach Famous event handling to document events emanating from target
     *     document element.  This occurs just after deployment to the document.
     *     Calling this enables methods like #on and #pipe.
     *
     * @private
     * @param {Element} target document element
     */
    function _bindEvents(target) {
        var eventTypes = this.surfaceEvents;
        for(var i = 0; i < eventTypes.length; i++) {
            target.addEventListener(eventTypes[i], this.eventForwarder);
        }
    };

    /**
     *   Detach Famous event handling from document events emanating from target
     *     document element.  This occurs just before recall from the document.
     *     Calling this enables methods like #on and #pipe.
     *
     *
     * @name FamousSurface#_unbindEvents
     * @function
     * @private
     * @param {Element} target document element
     */
    function _unbindEvents(target) {
        var eventTypes = this.surfaceEvents;
        for(var i = 0; i < eventTypes.length; i++) {
            target.removeEventListener(eventTypes[i], this.eventForwarder);
        }
    };

    /**
     *  Apply to document all changes from #removeClass since last #setup().
     *
     * @name FamousSurface#_cleanupClasses
     * @function
     * @private
     * @param {Element} target document element
     */
    function _cleanupClasses(target) {
        for(var i = 0; i < this._dirtyClasses.length; i++) target.classList.remove(this._dirtyClasses[i]);
        this._dirtyClasses = [];
    };

    /**
     * Apply values of all Famous-managed styles to the document element.
     *   These will be deployed to the document on call to #setup().
     *
     * @name FamousSurface#_applyStyles
     * @function
     * @private
     * @param {Element} target document element
     */
    function _applyStyles(target) {
        for(var n in this.properties) {
            target.style[n] = this.properties[n];
        }
    };

    /**
     * Clear all Famous-managed styles from the document element.
     *   These will be deployed to the document on call to #setup().
     *
     * @name FamousSurface#_cleanupStyles
     * @function
     * @private
     * @param {Element} target document element
     */
    function _cleanupStyles(target) {
        for(var n in this.properties) {
            target.style[n] = '';
        }
    };

    var _setMatrix;
    var _setOrigin;
    var _setInvisible;

    /**
     * Directly apply given FamousMatrix to the document element as the
     *   appropriate webkit CSS style.
     *
     * @name FamousSurfaceManager#setMatrix
     * @function
     * @static
     * @private
     * @param {Element} element document element
     * @param {FamousMatrix} matrix
     */
    if(usePrefix) _setMatrix = function(element, matrix) { element.style.webkitTransform = FM.formatCSS(matrix); };
    else _setMatrix = function(element, matrix) { element.style.transform = FM.formatCSS(matrix); };

    /**
     * Directly apply given origin coordinates to the document element as the
     *   appropriate webkit CSS style.
     *
     * @name FamousSurfaceManager#setOrigin
     * @function
     * @static
     * @private
     * @param {Element} element document element
     * @param {FamousMatrix} matrix
     */
    if(usePrefix) _setOrigin = function(element, origin) { element.style.webkitTransformOrigin = _formatCSSOrigin(origin); };
    else _setOrigin = function(element, origin) { element.style.transformOrigin = _formatCSSOrigin(origin); };


    /**
     * Shrink given document element until it is effectively invisible.
     *   This destroys any existing transform properties.
     *   Note: Is this the ideal implementation?
     *
     * @name FamousSurfaceManager#setInvisible
     * @function
     * @static
     * @private
     * @param {Element} element document element
     */
    if(usePrefix) _setInvisible = function(element) { element.style.webkitTransform = 'scale3d(0.0001,0.0001,1)'; element.style.opacity = 0; };
    else _setInvisible = function(element) { element.style.transform = 'scale3d(0.0001,0.0001,1)'; element.style.opacity = 0; };

    /**
     * Comparator for length two numerical arrays (presumably, [x,y])
     *
     * @name FamousSurfaceManager#xyEquals
     * @function
     * @static
     * @param {Array.<number>} a
     * @param {Array.<number>} b
     * @returns {boolean} true if both falsy or both have equal [0] and [1] components.
     */
    function xyEquals(a, b) {
        if(!a && !b) return true;
        else if(!a || !b) return false;
        return a[0] == b[0] && a[1] == b[1];
    };

    function _formatCSSOrigin(origin) {
        return (100*origin[0]).toFixed(6) + '% ' + (100*origin[1]).toFixed(6) + '%';
    };

    /**
     * Sets up an element to be ready for commits
     *
     * (Scope: Device developers and deeper)
     * @name FamousSurface#setup
     * @function
     *
     * @param {Element} target document element
     */
    FamousSurface.prototype.setup = function(allocator) {
        var target = allocator.allocate(this.elementType);
        if(this.elementClass) {
            if(this.elementClass instanceof Array) {
                for(var i = 0; i < this.elementClass.length; i++) {
                    target.classList.add(this.elementClass[i]);
                }
            }
            else {
                target.classList.add(this.elementClass);
            }
        }
        _bindEvents.call(this, target);
        _setOrigin(target, [0, 0]); // handled internally
        this._currTarget = target;
        this._stylesDirty = true;
        this._classesDirty = true;
        this._sizeDirty = true;
        this._contentDirty = true;
        this._matrix = undefined;
        this._opacity = undefined;
        this._origin = undefined;
        this._size = undefined;
    };

    /**
     * Apply all changes stored in the Surface object to the actual element
     * This includes changes to classes, styles, size, and content, but not
     * transforms or opacities, which are managed by (@link FamousSurfaceManager).
     *
     * (Scope: Device developers and deeper)
     * @name FamousSurface#commit
     * @function
     */
    FamousSurface.prototype.commit = function(context, matrix, opacity, origin, size) {
        if(!this._currTarget) this.setup(context.getAllocator());
        var target = this._currTarget;

        if(this.size) {
            var origSize = size;
            size = this.size.slice(0);
            if(size[0] === undefined && origSize[0]) size[0] = origSize[0];
            if(size[1] === undefined && origSize[1]) size[1] = origSize[1];
        }

        if(!xyEquals(this._size, size)) {
            this._size = size.slice(0);
            this._sizeDirty = true;
        }

        if(!matrix && this._matrix) {
            this._matrix = undefined;
            this._opacity = 0;
            _setInvisible(target);
            return;
        }

        if(this._opacity !== opacity) {
            this._opacity = opacity;
            target.style.opacity = Math.min(opacity, 0.999999);
        }

        if(!xyEquals(this._origin, origin) || !FM.equals(this._matrix, matrix)) {
            if(!matrix) matrix = FM.identity;
            if(!origin) origin = [0, 0];
            this._origin = origin.slice(0);
            this._matrix = matrix;
            var aaMatrix = matrix;
            if(origin) {
                aaMatrix = FM.moveThen([-this._size[0]*origin[0], -this._size[1]*origin[1]], matrix);
            }
            _setMatrix(target, aaMatrix);
        }

        if(!(this._classesDirty || this._stylesDirty || this._sizeDirty || this._contentDirty)) return;

        if(this._classesDirty) {
            _cleanupClasses.call(this, target);
            var classList = this.getClassList();
            for(var i = 0; i < classList.length; i++) target.classList.add(classList[i]);
            this._classesDirty = false;
        }
        if(this._stylesDirty) {
            _applyStyles.call(this, target);
            this._stylesDirty = false;
        }
        if(this._sizeDirty) {
            if(this._size) {
                target.style.width = (this._size[0] !== true) ? this._size[0] + 'px' : '';
                target.style.height = (this._size[1] !== true) ? this._size[1] + 'px' : '';
            }
            this._sizeDirty = false;
        }
        if(this._contentDirty) {
            this.deploy(target);
            this._contentDirty = false;
        }
    };

    /**
     *  Remove all Famous-relevant attributes from a document element.
     *    This is called by SurfaceManager's detach().
     *    This is in some sense the reverse of .deploy().
     *    Note: If you're trying to destroy a surface, don't use this.
     *    Just remove it from the render tree.
     *
     * (Scope: Device developers and deeper)
     * @name FamousSurface#cleanup
     * @function
     * @param {Element} target target document element
     */
    FamousSurface.prototype.cleanup = function(allocator) {
        var target = this._currTarget;
        this.recall(target);
        target.style.width = '';
        target.style.height = '';
        this._size = undefined;
        _cleanupStyles.call(this, target);
        var classList = this.getClassList();
        _cleanupClasses.call(this, target);
        for(var i = 0; i < classList.length; i++) target.classList.remove(classList[i]);
        if(this.elementClass) {
            if(this.elementClass instanceof Array) {
                for(var i = 0; i < this.elementClass.length; i++) {
                    target.classList.remove(this.elementClass[i]);
                }
            }
            else {
                target.classList.remove(this.elementClass);
            }
        }
        _unbindEvents.call(this, target);
        this._currTarget = undefined;
        allocator.deallocate(target);
        _setInvisible(target);
    };
    /**
     * Directly output this surface's fully prepared inner document content to
     *   the provided containing parent element.
     *   This translates to innerHTML in the DOM sense.
     *
     * (Scope: Device developers and deeper)
     * @name FamousSurface#deploy
     * @function
     * @param {Element} target Document parent of this container
     */
    FamousSurface.prototype.deploy = function(target) {
        var content = this.getContent();
        if(typeof content == 'string') target.innerHTML = content;
        else target.appendChild(content);
    };

    /**
     * Remove any contained document content associated with this surface
     *   from the actual document.
     *
     * (Scope: Device developers and deeper)
     * @name FamousSurface#recall
     * @function
     */
    FamousSurface.prototype.recall = function(target) {
        var df = document.createDocumentFragment();
        while(target.hasChildNodes()) df.appendChild(target.firstChild);
        this.setContent(df);
    };

    /**
     *  Get the x and y dimensions of the surface.  This normally returns
     *    the size of the rendered surface unless setSize() was called
     *    more recently than setup().
     *
     * @name FamousSurface#getSize
     * @function
     * @param {boolean} actual return actual size
     * @returns {Array.<number>} [x,y] size of surface
     */
    FamousSurface.prototype.getSize = function(actual) {
        if(actual) return this._size;
        else return this.size || this._size;
    };

    /**
     * Set x and y dimensions of the surface.  This takes effect upon
     *   the next call to this.{#setup()}.
     *
     * @name FamousSurface#setSize
     * @function
     * @param {Array.<number>} size x,y size array
     */
    FamousSurface.prototype.setSize = function(size) {
        this.size = size ? size.slice(0,2) : undefined;
        this._sizeDirty = true;
    };

    module.exports = FamousSurface;
});