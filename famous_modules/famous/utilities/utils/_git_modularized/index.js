/**
 * TODO: combine with Utility.js into single utilities object?
 * @class Collection of various utility functions
 */
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

    //TODO: can this use inRange, outRange arrays instead
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

    //TODO: can this be put into the matrix library?
    perspective: function(fovy, aspect, near, far)
    {
        var f = 1.0 / Math.tan(fovy / 2),
            nf = 1.0 / (near - far);
        return [
            f / aspect,
            0,
            0,
            0,
            0,
            f,
            0,
            0,
            0,
            0,
            (far + near) * nf,
            -1,
            0,
            0,
            (2 * far * near) * nf,
            0
        ];
    },

    //TODO: can this be put into the matrix library?
    ortho: function(left, right, bottom, top, near, far)
    {
        var tx = -(right+left)/(right-left);
        var ty = -(top+bottom)/(top-bottom);
        var tz = -(far+near)/(far-near);

        return [
            2.0/(right-left),
            0,
            0,
            0,
            0,
            2.0/(top-bottom),
            0,
            0,
            0,
            0,
            -2.0/(far-near),
            -1,
            tx,
            ty,
            tz,
            1.0
        ];
    },

    //TODO: can this be put into the matrix library?
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

    //TODO: convert to min/max array
    clamp: function(v, min, max)
    {
        return Math.max(Math.min(v, max), min);
    },

    isMobile: function() {
        return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) );
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
        return ( /Android|Chrome|Mozilla/i.test(navigator.appCodeName) && !!window.WebGLRenderingContext && !/iPhone|iPad|iPod/i.test(navigator.userAgent));
    },

    getSurfacePosition: function getSurfacePosition(surface) {

        var currTarget = surface._currTarget;
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
    },

    isAndroid: function () {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    },

    hasLocalStorage: function () {
        return !!window.localStorage;
    },

    timeSince : function(time){
        var now = Date.now();
        var difference = now - time;
        var minute = 60000;
        var hour = 60 * minute;
        var day = 24 * hour;

        if (difference < minute) {
            return "Just Now"
        } else if (difference < hour) {
            var minutes = ~~(difference/minute);
            return minutes + "m";
        } else if (difference < day) {
            var hours = ~~(difference/hour);
            return hours + "h";
        } else {
            var days = ~~(difference/day);
            return days + "d";
        }
    }

};

module.exports = Utils;
