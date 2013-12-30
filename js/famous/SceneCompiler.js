define(function(require, exports, module) {
    var FM = require('./Matrix');

    /**
     * @function compile a scene definition into a loader function
     *
     * @name Scene
     * @constructor
     */
    function compile(def) {
        var obj = {varCounter: 0};
        var codeLines = [];
        var resultVar = _parse.call(obj, def, codeLines);
        codeLines.push('return ' + resultVar + ';');
        return new Function(['FT', 'RenderNode', 'RN_link', 'RN_include', 'id', 'transforms'], codeLines.join('\n'));
    };

    function _assignVar(name, value) {
        return 'var ' + name + ' = ' + value + ';';
    };

    function _assignId(name, value) {
        return 'id.' + name + ' = ' + value + ';';
    };

    function _pushTransform(name) {
        return 'transforms.push(' + name + ');';
    };

    function _genVarName() {
        return '_' + this.varCounter++;
    };

    function _parse(def, output) {
        var result;
        if(def instanceof Array) {
            result = _parseArray.call(this, def, output);
        }
        else {
            result = _genVarName.call(this);
            if(def['target']) {
                var targetObj = _parse.call(this, def['target'], output);
                var obj = _parseTransform.call(this, def, output);
                output.push(_assignVar(result, 'new RenderNode(' + obj + ')'));
                output.push('RN_link.call(' + result + ', ' + targetObj + ');');
                if(def['id']) output.push(_assignId(def['id'], obj));
                output.push(_pushTransform(obj));
            }
            else if(def['id']) {
                output.push(_assignVar(result, 'new RenderNode()'));
                output.push(_assignId(def['id'], result));
            }
        }
        return result;
    };

    function _parseArray(def, output) {
        var result = _genVarName.call(this);
        output.push(_assignVar(result, 'new RenderNode()'));
        for(var i = 0; i < def.length; i++) {
            var obj = _parse.call(this, def[i], output);
            if(obj) {
                output.push('RN_include.call(' + result + ', ' + obj + ');');
            }
        }
        return result;
    };

    function _parseTransform(def, output) {
        var transformDef = def['transform'];
        var opacity = def['opacity'];
        var origin = def['origin'];
        var size = def['size'];
        var target = def['target'];
        var transform = FM.identity;
        if(transformDef instanceof Array) {
            if(transformDef.length == 16 && typeof transformDef[0] == 'number') {
                transform = transformDef;
            }
            else {
                for(var i = 0; i < transformDef.length; i++) {
                    transform = FM.multiply(transform, _resolveTransformMatrix(transformDef[i]));
                }
            }
        }
        else if(transformDef instanceof Object) {
            transform = _resolveTransformMatrix(transformDef);
        }

        var result = _genVarName.call(this);
        var transformStr = '[' + transform.join(',') + ']';
        var originStr = origin ? '[' + origin.join(',') + ']' : undefined;
        var sizeStr = size ? '[' + size.join(',') + ']' : undefined;
        output.push(_assignVar(result, 'new FT(' + transformStr + ',' + opacity + ',' + originStr + ',' + sizeStr + ')'));
        return result;
    };

    var _MATRIX_GENERATORS = {
        'translate': FM.translate,
        'rotate': FM.rotate,
        'rotateX': FM.rotateX,
        'rotateY': FM.rotateY,
        'rotateZ': FM.rotateZ,
        'rotateAxis': FM.rotateAxis,
        'scale': FM.scale,
        'skew': FM.skew,
        'matrix3d': function() { return arguments; }
    };

    function _resolveTransformMatrix(matrixDef) {
        for(var type in _MATRIX_GENERATORS) {
            if(type in matrixDef) {
                var args = matrixDef[type];
                if(!(args instanceof Array)) args = [args];
                return _MATRIX_GENERATORS[type].apply(this, args);
            }
        }
    };

    module.exports = {compile: compile};
});
