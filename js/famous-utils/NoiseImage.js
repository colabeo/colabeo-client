define(function(require, exports, module) {
    var canvas = document.createElement('canvas');

    var ctx = canvas.getContext("2d");

    var hue = function(seed) {
        var random = (Math.random() * 361)>>0;
        var result = seed ? (360 * (seed*0.125)) - ((Math.random() * (46))>>0) : random;
        return result;
    };

    var saturation = function() {
        return 30 + (Math.random() * 71)>>0;
    };
    
    var light = function() {
        return 30 + (Math.random() * 71)>>0;
    };

    var color =  function(seed) {
       ctx.fillStyle = 'hsl(' + hue(seed) + ','+ saturation() +'%,' + light() +'%)';
    };

    function generateNoiseImage (size, fraction, seed) {
        if(!size) size = [128, 128];
        if(!fraction) fraction = 8;

        canvas.width = size[0];
        canvas.height = size[1];

        var halfFraction = fraction>>1;
        var pixelSize = canvas.width/fraction;
        var length = (fraction * fraction)>>1;
        var cachedHalfFraction = 1/halfFraction;

        color(seed);
        ctx.fillRect(0,0,size[0],size[1]);
        color(seed);

        var column,row;
        for (var i = 0; i < length; i++){
            if ((Math.random() + 0.5)>>0){
                row = (i * cachedHalfFraction)>>0;
                column = i - (halfFraction * row);
                ctx.fillRect(column * pixelSize, row * pixelSize, pixelSize, pixelSize);
                ctx.fillRect(((fraction-(column+1))) * pixelSize, row * pixelSize, pixelSize, pixelSize);
            }
        }

        var myImage = canvas.toDataURL("image/png");
        return myImage;
    }


    module.exports = {
       generate: generateNoiseImage
    };

});
