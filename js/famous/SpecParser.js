define(function(require, exports, module) {
    var FM = require('./Matrix');

    /**
     * @class This object translates the the rendering instructions of type 
     *   {@link renderSpec} that {@link renderableComponent} objects generate 
     *   into direct document update instructions of type {@link updateSpec} 
     *   for the {@link SurfaceManager}.
     * 
     * @description 
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
    SpecParser.parse = function(spec, callback) {
        var sp = new SpecParser();
        var result = sp.parse(spec);
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
    SpecParser.prototype.parse = function(spec) {
        this.reset();
        this._parseSpec(spec, FM.identity, 1, [0, 0], undefined, FM.identity);
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
    SpecParser.prototype._parseSpec = function(spec, parentTransform, parentOpacity, parentOrigin, parentSize, sizeCtx) {
        if(spec == undefined) {
            // do nothing
        }
        else if(typeof spec == 'number') {
            var id = spec;
            var originAdjust = parentSize ? [parentOrigin[0]*parentSize[0], parentOrigin[1]*parentSize[1], 0] : [0, 0, 0];
            if(!parentTransform) parentTransform = FM.identity;
            this.result[id] = [
                FM.move(parentTransform, _vecInContext(originAdjust, sizeCtx)),
                parentOpacity,
                parentOrigin,
                parentSize
            ]; // transform, opacity, origin, size
        }
        else if(spec instanceof Array) {
            for(var i = 0; i < spec.length; i++) {
                this._parseSpec(spec[i], parentTransform, parentOpacity, parentOrigin, parentSize, sizeCtx);
            }
        }
        else if(spec.target !== undefined) {
            var target = spec.target;
            var transform = parentTransform;
            var opacity = parentOpacity;
            var origin = parentOrigin;
            var size = parentSize;

            if(spec.opacity !== undefined) opacity = parentOpacity * spec.opacity;
            if(spec.transform) transform = FM.multiply(spec.transform, parentTransform);
            if(spec.origin) origin = spec.origin;
            if(spec.size) {
                size = spec.size;
                if(size[0] === undefined) size[0] = parentSize[0];
                if(size[1] === undefined) size[1] = parentSize[1];
                if(!parentSize) parentSize = size;
                if(!origin) origin = [0, 0];
                if(!transform) transform = FM.identity;
                transform = FM.move(transform, _vecInContext([origin[0]*parentSize[0], origin[1]*parentSize[1], 0], sizeCtx));
                transform = FM.moveThen([-origin[0]*size[0], -origin[1]*size[1], 0], transform);
                sizeCtx = parentTransform ? parentTransform : FM.identity;
                origin = [0, 0];
            }

            this._parseSpec(target, transform, opacity, origin, size, sizeCtx);
        }
    };

    module.exports = SpecParser;
});
