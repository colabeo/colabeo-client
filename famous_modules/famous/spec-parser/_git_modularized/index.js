var Transform = require('famous/transform');

/**
 * @class SpecParser 
 * 
 * @description 
 *   This object translates the rendering instructions of type 
 *   {@link renderSpec} that {@link renderableComponent} objects generate 
 *   into direct document update instructions of type {@link updateSpec} 
 *   for the {@link SurfaceManager}.
 *   Scope: The {@link renderSpec} should be visible to component developers
 *   and deeper.  However, SpecParser This should not be visible below the 
 *   level of device developer.
 *
 * @name SpecParser
 * @constructor
 * 
 * @example 
 *   var parsedSpec = SpecParser.parse(spec);
 *   this.surfaceManager.update(parsedSpec);
 */
function SpecParser() {
    this.reset();
};

/**
 * Convert a {@link renderSpec} coming from the context's render chain to an
 *    update spec for the update chain. This is the only major entrypoint
 *    for a consumer of this class. An optional callback of signature
 *    "function({@link updateSpec})" can be provided for call upon parse
 *    completion.
 *    
 * @name SpecParser#parse
 * @function
 * @static
 * 
 * @param {renderSpec} spec input render spec
 * @param {function(Object)} callback updateSpec-accepting function for 
 *   call on  completion
 * @returns {updateSpec} the resulting update spec (if no callback 
 *   specified, else none)
 */
SpecParser.parse = function(spec, context, callback) {
    var sp = new SpecParser();
    var result = sp.parse(spec, context, Transform.identity);
    if(callback) callback(result);
    else return result;
};

/**
 * Convert a renderSpec coming from the context's render chain to an update
 *    spec for the update chain. This is the only major entrypoint for a
 *    consumer of this class.
 *    
 * @name SpecParser#parse
 * @function
 * 
 * @param {renderSpec} spec input render spec
 * @returns {updateSpec} the resulting update spec
 */
SpecParser.prototype.parse = function(spec, context) {
    this.reset();
    this._parseSpec(spec, context, Transform.identity);
    return this.result;
};

/**
 * Prepare SpecParser for re-use (or first use) by setting internal state 
 *  to blank.
 *    
 * @name SpecParser#reset
 * @function
 */
SpecParser.prototype.reset = function() {
    this.result = {};
};

/**
 * Transforms a delta vector to apply inside the context of another transform
 *
 * @name _vecInContext
 * @function
 * @private
 *
 * @param {Array.number} vector to apply
 * @param {FamousMatrix} matrix context 
 * @returns {Array.number} transformed delta vector
 */
function _vecInContext(v, m) {
    return [
        v[0]*m[0] + v[1]*m[4] + v[2]*m[8],
        v[0]*m[1] + v[1]*m[5] + v[2]*m[9],
        v[0]*m[2] + v[1]*m[6] + v[2]*m[10]
    ];
};

/**
 * From the provided renderSpec tree, recursively compose opacities,
 *    origins, transforms, and groups corresponding to each surface id from
 *    the provided renderSpec tree structure. On completion, those
 *    properties of 'this' object should be ready to use to build an
 *    updateSpec.
 *    
 *    
 * @name SpecParser#_parseSpec
 * @function
 * @private
 * 
 * @param {renderSpec} spec input render spec for a node in the render tree.
 * @param {number|undefined} group group id to apply to this subtree
 * @param {FamousMatrix} parentTransform positional transform to apply to
 *    this subtree.
 * @param {origin=} parentOrigin origin behavior to apply to this subtree
 */
SpecParser.prototype._parseSpec = function(spec, parentContext, sizeCtx) {
    if(spec === undefined) {
        // do nothing
    }
    else if(typeof spec === 'number') {
        var id = spec;
        var originAdjust = parentContext.size ? [parentContext.origin[0]*parentContext.size[0], parentContext.origin[1]*parentContext.size[1], 0] : [0, 0, 0];
        this.result[id] = {
            transform: Transform.move(parentContext.transform, _vecInContext(originAdjust, sizeCtx)),
            opacity: parentContext.opacity,
            origin: parentContext.origin,
            size: parentContext.size
        };
    }
    else if(spec instanceof Array) {
        for(var i = 0; i < spec.length; i++) {
            this._parseSpec(spec[i], parentContext, sizeCtx);
        }
    }
    else if(spec.target !== undefined) {
        var target = spec.target;
        var transform = parentContext.transform;
        var opacity = parentContext.opacity;
        var origin = parentContext.origin;
        var size = parentContext.size;

        if(spec.opacity !== undefined) opacity = parentContext.opacity * spec.opacity;
        if(spec.transform) transform = Transform.multiply(parentContext.transform, spec.transform);
        if(spec.origin) origin = spec.origin;
        if(spec.size) {
            size = spec.size;
            var parentSize = parentContext.size;
            if(parentSize && origin) {
                size = [spec.size[0] || parentSize[0], spec.size[1] || parentSize[1]];
                transform = Transform.move(transform, _vecInContext([origin[0]*parentSize[0], origin[1]*parentSize[1], 0], sizeCtx));
                transform = Transform.moveThen([-origin[0]*size[0], -origin[1]*size[1], 0], transform);
            }
            origin = [0, 0];
        }

        this._parseSpec(target, {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size
        }, parentContext.transform);
    }
};

module.exports = SpecParser;
