define(function(require, exports, module) {
    var Color = require('./Color');

    /**
     * @class Stores color objects as a group and provides helper methods for accessing
     *        colors and comparing their values.
     * @description
     * @name Color
     * @constructor
     */
    function ColorPalette(colors)
    {
        this.colors = colors;
    }

    ColorPalette.prototype.getColor = function(index)
    {
        return this.colors[index%this.colors.length];
    };

    ColorPalette.prototype.getCSS = function ( index ) {
        return this.getColor( index ).getCSSColor();
    };

    
    ColorPalette.prototype.getLighestColor = function()
    {
        var lightestValue = 0,
            lightestRef;

        for (var i = 0; i < this.colors.length; i++) {
            var light = this.colors[i].getLightness();
            if(light > lightestValue) { 
                lightestRef = this.colors[i];
                lightestValue = light;
            }
        };

        return lightestRef;
    };

    ColorPalette.prototype.getDarkestColor = function()
    {
        var darkestValue = 100,
            darkestRef;

        for (var i = 0; i < this.colors.length; i++) {
            var dark = this.colors[i].getLightness();
            if( dark < darkestValue ) { 
                darkestRef = this.colors[i];
                darkestValue = dark;
            }
        };

        return darkestRef;
    };

    ColorPalette.prototype.getCount = function()
    {
        return this.colors.length; 
    };

    module.exports = ColorPalette;
});
