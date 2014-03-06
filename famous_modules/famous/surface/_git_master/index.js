var Entity       = require('famous/entity');
var EventHandler = require('famous/event-handler');
var Transform    = require('famous/transform');

var usePrefix = document.body.style.webkitTransform !== undefined;

/**
 * @class Surface
 * @description A base class for viewable content and event
 *    targets inside a Famous applcation, containing a renderable document
 *    fragment. Like an HTML div, it can accept internal markup,
 *    properties, classes, and handle events. This is a public
 *    interface and can be extended.
 * 
 * @name Surface
 * @constructor
 * 
 * @param {Array.<number>} size Width and height in absolute pixels (array of ints)
 * @param {string} content Document content (e.g. HTML) managed by this
 *    surface.
 */
function Surface(options) {
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
    this.eventHandler = new EventHandler();
    this.eventHandler.bindThis(this);

    this.id = Entity.register(this);

    if(options) this.setOptions(options);

    this._currTarget = undefined;
};
Surface.prototype.elementType = 'div';
Surface.prototype.elementClass = 'famous-surface';

/**
 * Bind a handler function to occurrence of event type on this surface.
 *   Document events have the opportunity to first be intercepted by the 
 *   on() method of the Surface upon which the event occurs, then 
 *   by the on() method of the FamousContext containing that surface, and
 *   finally as a default, the FamousEngine itself.
 * 
 * @name Surface#on
 * @function
 * @param  {string} type event type key (for example, 'click')
 * @param {function(string, Object)} handler callback
 */
Surface.prototype.on = function(type, fn) {
    if(this._currTarget) this._currTarget.addEventListener(type, this.eventForwarder);
    this.eventHandler.on(type, fn);
};

/**
 * Unbind an event by type and handler.  
 *   This undoes the work of {@link Surface#on}
 * 
 * @name Surface#unbind
 * @function
 * @param {string} type event type key (for example, 'click')
 * @param {function(string, Object)} handler 
 */
Surface.prototype.unbind = function(type, fn) {
    this.eventHandler.unbind(type, fn);
};

/**
 * Trigger an event, sending to all downstream handlers
 *   matching provided 'type' key.
 * 
 * @name Surface#emit
 * @function
 * @param  {string} type event type key (for example, 'click')
 * @param  {Object} event event data
 * @returns {boolean}  true if event was handled along the event chain.
 */
Surface.prototype.emit = function(type, event) {
    if(event && !event.origin) event.origin = this;
    var handled = this.eventHandler.emit(type, event);
    if(handled && event.stopPropagation) event.stopPropagation();
    return handled;
};

/**
 * Pipe all events to a target {@link emittoerObject}
 *
 * @name Surface#pipe
 * @function
 * @param {emitterObject} target emitter object
 * @returns {emitterObject} target (to allow for chaining)
 */
Surface.prototype.pipe = function(target) {
    return this.eventHandler.pipe(target);
};

/**
 * Stop piping all events at the FamousEngine level to a target emitter 
 *   object.  Undoes the work of #pipe.
 * 
 * @name Surface#unpipe
 * @function
 * @param {emitterObject} target emitter object
 */
Surface.prototype.unpipe = function(target) {
    return this.eventHandler.unpipe(target);
};

/**
 * Return spec for this surface. Note that for a base surface, this is
 *    simply an id.
 * 
 * (Scope: Device developers and deeper)
 * @name Surface#render
 * @function
 * @returns {number} Spec for this surface (spec id)
 */
Surface.prototype.render = function() {
    return this.id;
};

/**
 * Set CSS-style properties on this Surface. Note that this will cause
 *    dirtying and thus re-rendering, even if values do not change (confirm)
 *    
 * @name Surface#setProperties
 * @function
 * @param {Object} properties property dictionary of "key" => "value"
 */
Surface.prototype.setProperties = function(properties) {
    for(var n in properties) {
        this.properties[n] = properties[n];
    }
    this._stylesDirty = true;
};

/**
 * Get CSS-style properties on this Surface.
 * 
 * @name Surface#getProperties
 * @function
 * @returns {Object} Dictionary of properties of this Surface.
 */
Surface.prototype.getProperties = function() {
    return this.properties;
};

/**
 * Add CSS-style class to the list of classes on this Surface. Note
 *   this will map directly to the HTML property of the actual
 *   corresponding rendered <div>. 
 *   These will be deployed to the document on call to .setup().
 *    
 * @param {string} className name of class to add
 */
Surface.prototype.addClass = function(className) {
    if(this.classList.indexOf(className) < 0) {
        this.classList.push(className);
        this._classesDirty = true;
    }
};

/**
 * Remove CSS-style class from the list of classes on this Surface.
 *   Note this will map directly to the HTML property of the actual
 *   corresponding rendered <div>. 
 *   These will be deployed to the document on call to #setup().
 *    
 * @name Surface#removeClass
 * @function
 * @param {string} className name of class to remove
 */
Surface.prototype.removeClass = function(className) {
    var i = this.classList.indexOf(className);
    if(i >= 0) {
        this._dirtyClasses.push(this.classList.splice(i, 1)[0]);
        this._classesDirty = true;
    }
};

Surface.prototype.setClasses = function(classList) {
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
 * @name Surface#getClasslist
 * @function
 * @returns {Array.<string>} Returns an array of classNames
 */
Surface.prototype.getClassList = function() {
    return this.classList;
};

/**
 * Set or overwrite inner (HTML) content of this surface. Note that this
 *    causes a re-rendering if the content has changed.
 * 
 * @name Surface#setContent
 * @function
 *    
 * @param {string} content HTML content
 */
Surface.prototype.setContent = function(content) {
    if(this.content != content) {
        this.content = content;
        this._contentDirty = true;
    }
};

/**
 * Return inner (HTML) content of this surface.
 * 
 * @name Surface#getContent
 * @function
 * 
 * @returns {string} inner (HTML) content
 */
Surface.prototype.getContent = function() {
    return this.content;
};

/**
 * Set options for this surface
 *
 * @name Surface#setOptions
 * @function
 *
 * @param {Object} options options hash
 */
Surface.prototype.setOptions = function(options) {
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
    for(var i in this.eventHandler.listeners) {
        target.addEventListener(i, this.eventForwarder);
    }
};

/**
 *   Detach Famous event handling from document events emanating from target
 *     document element.  This occurs just before recall from the document.
 *     Calling this enables methods like #on and #pipe.
 *    
 * 
 * @name Surface#_unbindEvents
 * @function
 * @private
 * @param {Element} target document element
 */
function _unbindEvents(target) {
    for(var i in this.eventHandler.listeners) {
        target.removeEventListener(i, this.eventForwarder);
    }
};

/**
 *  Apply to document all changes from #removeClass since last #setup().
 *    
 * @name Surface#_cleanupClasses
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
 * @name Surface#_applyStyles
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
 * @name Surface#_cleanupStyles
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
 * @name SurfaceManager#setMatrix
 * @function
 * @static
 * @private
 * @param {Element} element document element
 * @param {FamousMatrix} matrix 
 */ 
if(usePrefix) _setMatrix = function(element, matrix) { element.style.webkitTransform = Transform.formatCSS(matrix); };
else _setMatrix = function(element, matrix) { element.style.transform = Transform.formatCSS(matrix); };

/**
 * Directly apply given origin coordinates to the document element as the 
 *   appropriate webkit CSS style.
 * 
 * @name SurfaceManager#setOrigin
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
 * @name SurfaceManager#setInvisible
 * @function
 * @static
 * @private
 * @param {Element} element document element
 */
if(usePrefix) _setInvisible = function(element) { element.style.webkitTransform = 'scale3d(0.0001,0.0001,1)'; element.style.opacity = 0; };
else _setInvisible = function(element) { element.style.transform = 'scale3d(0.0001,0.0001,1)'; element.style.opacity = 0; };

function _xyNotEquals(a, b) {
    if(!(a && b)) return a !== b;
    return a[0] !== b[0] || a[1] !== b[1];
};

function _formatCSSOrigin(origin) {
    return (100*origin[0]).toFixed(6) + '% ' + (100*origin[1]).toFixed(6) + '%';
};

/**
 * Sets up an element to be ready for commits
 *  
 * (Scope: Device developers and deeper)
 * @name Surface#setup
 * @function
 * 
 * @param {Element} target document element
 */
Surface.prototype.setup = function(allocator) {
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
 * transforms or opacities, which are managed by (@link SurfaceManager).
 * 
 * (Scope: Device developers and deeper)
 * @name Surface#commit
 * @function
 */
Surface.prototype.commit = function(context) {
    if(!this._currTarget) this.setup(context.allocator);
    var target = this._currTarget;

    var matrix = context.transform;
    var opacity = context.opacity;
    var origin = context.origin;
    var size = context.size;

    if(this.size) {
        var origSize = size;
        size = [this.size[0], this.size[1]];
        if(size[0] === undefined && origSize[0]) size[0] = origSize[0];
        if(size[1] === undefined && origSize[1]) size[1] = origSize[1];
    }

    if(_xyNotEquals(this._size, size)) {
        this._size = [size[0], size[1]];
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

    if(_xyNotEquals(this._origin, origin) || Transform.notEquals(this._matrix, matrix)) {
        if(!matrix) matrix = Transform.identity;
        if(!origin) origin = [0, 0];
        this._origin = [origin[0], origin[1]];
        this._matrix = matrix;
        var aaMatrix = matrix;
        if(origin) {
            aaMatrix = Transform.moveThen([-this._size[0]*origin[0], -this._size[1]*origin[1]], matrix);
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
        this.eventHandler.emit('deploy');
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
 * @name Surface#cleanup
 * @function
 * @param {Element} target target document element
 */
Surface.prototype.cleanup = function(allocator) {
    var target = this._currTarget;
    this.eventHandler.emit('recall');
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
 * @name Surface#deploy
 * @function
 * @param {Element} target Document parent of this container
 */
Surface.prototype.deploy = function(target) {
    var content = this.getContent();
    if(content instanceof Node) {
        while (target.hasChildNodes()) target.removeChild(target.firstChild);
        target.appendChild(content);
    }
    else target.innerHTML = content;
};

/**
 * Remove any contained document content associated with this surface 
 *   from the actual document.  
 * 
 * (Scope: Device developers and deeper)
 * @name Surface#recall
 * @function
 */
Surface.prototype.recall = function(target) {
    var df = document.createDocumentFragment();
    while(target.hasChildNodes()) df.appendChild(target.firstChild);
    this.setContent(df);
};

/** 
 *  Get the x and y dimensions of the surface.  This normally returns
 *    the size of the rendered surface unless setSize() was called
 *    more recently than setup().
 * 
 * @name Surface#getSize
 * @function
 * @param {boolean} actual return actual size
 * @returns {Array.<number>} [x,y] size of surface
 */
Surface.prototype.getSize = function(actual) {
    if(actual) return this._size;
    else return this.size || this._size;
};

/**
 * Set x and y dimensions of the surface.  This takes effect upon
 *   the next call to this.{#setup()}.
 * 
 * @name Surface#setSize
 * @function
 * @param {Array.<number>} size x,y size array
 */
Surface.prototype.setSize = function(size) {
    this.size = size ? [size[0], size[1]] : undefined;
    this._sizeDirty = true;
};

module.exports = Surface;