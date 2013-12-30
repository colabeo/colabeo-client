define(function(require, exports, module) {
    var Time = require('./Time');    
    var FM = require('famous/Matrix');

    var Utils = {                
        rad2deg: function(rad)
        {
            return rad * 57.2957795; 
        },
    
        deg2rad: function(deg)
        {
            return deg * 0.0174532925; 
        },

        distance: function(x1, y1, x2, y2)
        {
            var deltaX = x2 - x1; 
            var deltaY = y2 - y1; 
            return Math.sqrt(deltaX*deltaX + deltaY*deltaY); 
        },

        distance3D: function(x1, y1, z1, x2, y2, z2)
        {
            var deltaX = x2 - x1; 
            var deltaY = y2 - y1; 
            var deltaZ = z2 - z1; 
            return Math.sqrt(deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ); 
        },

        map: function(value, inputMin, inputMax, outputMin, outputMax, clamp)
        {           
            var outValue = ((value - inputMin)/(inputMax - inputMin)) * (outputMax - outputMin) + outputMin; 
            if(clamp)
            {               
                if(outputMax > outputMin)
                {
                    if(outValue > outputMax)
                    {
                        outValue = outputMax; 
                    }
                    else if(outValue < outputMin)
                    {
                        outValue = outputMin; 
                    }   
                }
                else
                {
                    if(outValue < outputMax)
                    {
                        outValue = outputMax; 
                    }
                    else if(outValue > outputMin)
                    {
                        outValue = outputMin; 
                    }   
                }           
            }
            return outValue;         
        },

        limit: function(value, low, high)
        {
            value = Math.min(value, high); 
            value = Math.max(value, low); 
            return value;             
        },

        perspective: function(fovy, aspect, near, far) 
        {
            var out = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            var f = 1.0 / Math.tan(fovy / 2),
            nf = 1.0 / (near - far);
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;

            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            
            out[8] = 0;
            out[9] = 0;
            out[10] = (far + near) * nf;
            out[11] = -1;
            
            out[12] = 0;
            out[13] = 0;
            out[14] = (2 * far * near) * nf;
            out[15] = 0;
            return out;
        },

        ortho: function(left, right, bottom, top, near, far)
        {
            var out = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            var tx = -(right+left)/(right-left);
            var ty = -(top+bottom)/(top-bottom);
            var tz = -(far+near)/(far-near);

            out[0] = 2.0/(right-left); 
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;

            out[4] = 0;
            out[5] = 2.0/(top-bottom);
            out[6] = 0;
            out[7] = 0;
            
            out[8] = 0;
            out[9] = 0;
            out[10] = -2.0/(far-near);
            out[11] = -1;
            
            out[12] = tx; 
            out[13] = ty;
            out[14] = tz;
            out[15] = 1.0;
            return out;
        },

        normalFromFM: function (out, a) 
        {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,

            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (!det) { 
                return null; 
            }
            det = 1.0 / det;

            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

            out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

            out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

            return out;
        }, 

        clamp: function(v, min, max)        
        {
            if(v < min)
            {
                return min; 
            }
            else if(v > max)
            {
                return max; 
            }
            return v; 
        },

        color: function(red, green, blue, alpha)
        {
            return 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'; 
        },
        
        backgroundTransparent: function()
        {
            return {'backgroundColor': 'transparent'}; 
        },

        backgroundColor: function(red, green, blue, alpha)
        {
            return {'backgroundColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
        },

        borderRadius: function(r)
        {
            return {'borderRadius': r+'px'}; 
        },

        borderTopWidth: function(r)
        {
            return {'borderTopWidth': r+'px'}; 
        },

        borderBottomWidth: function(r)
        {
            return {'borderBottomWidth': r+'px'}; 
        },

        borderLeftWidth: function(r)
        {
            return {'borderLeftWidth': r+'px'}; 
        },

        borderRightWidth: function(r)
        {
            return {'borderRightWidth': r+'px'}; 
        },

        borderWidth: function(size)
        {
            return {'borderWidth': size+'px'};
        },

        borderColor: function(red, green, blue, alpha)
        {
            if(alpha == 0.0)
            {
                return {'borderColor': 'transparent'}; 
            }
            else
            {
                return {'borderColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
            }            
        },

        borderTopColor: function(red, green, blue, alpha)
        {
            if(alpha == 0.0)
            {
                return {'borderTopColor': 'transparent'}; 
            }
            else
            {
                return {'borderTopColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
            }            
        },

        borderBottomColor: function(red, green, blue, alpha)
        {
            if(alpha == 0.0)
            {
                return {'borderBottomColor': 'transparent'}; 
            }
            else
            {
                return {'borderBottomColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
            }            
        },

        borderRightColor: function(red, green, blue, alpha)
        {
            if(alpha == 0.0)
            {
                return {'borderRightColor': 'transparent'}; 
            }
            else
            {
                return {'borderRightColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
            }            
        },

        borderLeftColor: function(red, green, blue, alpha)
        {
            if(alpha == 0.0)
            {
                return {'borderLeftColor': 'transparent'}; 
            }
            else
            {
                return {'borderLeftColor': 'rgba('+Math.floor(red)+','+Math.floor(green)+','+Math.floor(blue)+','+alpha+')'}; 
            }            
        },

        borderStyle: function(style)
        {
            return {'borderStyle': style};
        },

        borderTopStyle: function(style)
        {
            return {'borderTopStyle': style};
        },

        borderBottomStyle: function(style)
        {
            return {'borderBottomStyle': style};
        },

        borderRightStyle: function(style)
        {
            return {'borderRightStyle': style};
        },

        borderLeftStyle: function(style)
        {
            return {'borderLeftStyle': style};
        },

        colorHSL: function(hue, saturation, lightness, alpha)
        {
            return 'hsla('+Math.floor(hue)+','+Math.floor(saturation)+'%,'+Math.floor(lightness)+'%,'+alpha+')'; 
        },

        backgroundTransparent: function()
        {
            return {'backgroundColor': 'transparent'};             
        }, 

        backgroundColorHSL: function(hue, saturation, lightness, alpha)
        {
            return {'backgroundColor': 'hsla('+Math.floor(hue)+','+Math.floor(saturation)+'%,'+Math.floor(lightness)+'%,'+alpha+')'}; 
        },

        backfaceVisible: function(value)
        {
            if(value === true)
            {
                return {
                   'backface-visibility':'visible',
                    '-webkit-backface-visibility':'visible',
                    'MozBackfaceVisibility':'visible',
                    '-ms-backface-visibility': 'visible',
                }; 
            }
            else
            {
                return {
                   'backface-visibility':'hidden',
                    '-webkit-backface-visibility':'hidden',
                    'MozBackfaceVisibility':'hidden',
                    '-ms-backface-visibility': 'hidden',
                }; 
            }
        }, 

        clipCircle: function(x, y, r)
        {
            return {'-webkit-clip-path': 'circle('+x+'px,'+y+'px,'+r+'px)'};
        },        

        getWidth: function()
        {            
            return window.innerWidth; 
        },

        getHeight: function()
        {
            return window.innerHeight;                        
        },

        getCenter: function()
        {
            return [Utils.getWidth()*.5, Utils.getHeight()*.5]; 
        },
        
        isMobile: function() { 
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
                return true;
            } 
            return false;
        },

        isString: function (maybeString) {
            return (typeof maybeString == 'string' || maybeString instanceof String) 
        },

        isArray: function (maybeArray) {
            return Object.prototype.toString.call( maybeArray ) === '[object Array]';
        },

        extend: function(a, b) {
            for(var key in b) { 
                a[key] = b[key];
            }
            return a;
        },

        getDevicePixelRatio: function()
        {
            return (window.devicePixelRatio ? window.devicePixelRatio : 1); 
        },

        supportsWebGL: function()
        {
            if( /Android|Chrome|Mozilla/i.test(navigator.appCodeName) && !!window.WebGLRenderingContext) {
                return true;
            } 
            return false;
        }, 

        getSurfacePosition: function getSurfacePosition(surface) {

            var currTarget = surface._currTarget;
            var transforms = [];
            var totalDist = [0, 0, 0];

            function getAllTransforms ( elem ) {

                var transform = getTransform(elem);

                if(transform !== "" && transform !== undefined ) {
                    var offset = parseTransform(transform);

                    totalDist[0] += offset[0];
                    totalDist[1] += offset[1];
                    totalDist[2] += offset[2];
                    
                }

                if( elem.parentElement !== document.body ) {
                    getAllTransforms(elem.parentNode);
                }
                
            }
            
            function parseTransform(transform) {
                var translate = []; 

                transform = removeMatrix3d( transform );

                translate[0] = parseInt(transform[12].replace(' ', '')); 
                translate[1] = parseInt(transform[13].replace(' ', ''));        
                translate[2] = parseInt(transform[14].replace(' ', ''));        

                for (var i = 0; i < translate.length; i++) {
                    if(typeof translate[i] == 'undefined') {
                        translate[i] = 0;
                    }
                };

                return translate;
            }

            function removeMatrix3d( mtxString ) { 
                mtxString = mtxString.replace('matrix3d(','');
                mtxString = mtxString.replace(')','');
                return mtxString.split(',');
            }

            function getTransform( elem ) { 
                var transform = elem['style']['webkitTransform'] || elem['style']['transform'] ;
                return transform;
            }

            if(currTarget) {

                getAllTransforms(currTarget);

            } else {

                return undefined;
            }

            return totalDist; 
        },

        // get center from [0, 0] origin
        getCenterMatrix: function ( pos, size, z) {
            if(z == undefined) z = 0;
            return FM.translate( pos[0] - size[0] * 0.5, pos[1] - size[1] * 0.5, z ); 
        },
        
        debounce: function (func, wait) {
           var timeout, ctx, timestamp, result, args;
           return function () {
                ctx = this;
                args = arguments;
                timestamp = new Date();

                var later =  function () {
                    var last = new Date() - timestamp;

                    if(last < wait) {
                        timeout = Time.setTimeout(later, wait - last);
                    } else { 
                        timeout = null;
                        result = func.apply(ctx, args);
                    }
                };

                if(!timeout) { 
                    timeout = Time.setTimeout(later, wait);
                }

                return result;
            };
        }, 

        hasUserMedia: function() {
            return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
        },

        getUserMedia: function()
        {
            return navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia; 
        }, 

        isWebkit: function () {
           return !!window.webkitURL; 
        }

    };

    module.exports = Utils;
});
