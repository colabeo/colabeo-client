define(function(require, exports, module) {
    var Utils = require('famous-utils/Utils');

    /**
     * @class Allows you to make the shown renderables behave like an accordion through 
     * the open and close methods.
     * @description
     * @name Color
     * @constructor
     * @example
     * 
     * define(function(require, exports, module) {
     *     var Engine = require('famous/Engine');
     *     var Surface = require('famous/Surface');
     *     var Color = require('famous-color/Color');
     *     var Context = Engine.createContext();
     *     
     *     var color = new Color(80, 255, 255);
     *     var hex = color.getHex();
     *     var surface    = new Surface({
     *         size: [300, 300],
     *         properties: {
     *             backgroundColor: hex
     *         }
     *     });
     *     Context.link(surface);
     *
     *     var toggle = true;
     *     surface.on('click', function(){
     *         if (toggle) {
     *             hex = color.setFromRGBA(255,0,0).getHex();
     *         } else {
     *             hex = color.setHue(60).getHex();
     *         }
     *         surface.setProperties({
     *             backgroundColor: hex
     *         })
     *         toggle = !toggle;
     *     });
     * });
     */
    function Color(r, g, b, a)
    {
        if(r instanceof Color)
        {
            this.r = r.r;
            this.g = r.g;
            this.b = r.b;
            this.a = r.a;
            this.hex = r.getHex();
        }
        else
        {
            this.r = (typeof r === 'undefined') ? 255 : r;
            this.g = (typeof g === 'undefined') ? 255 : g;
            this.b = (typeof b === 'undefined') ? 255 : b;
            this.a = (typeof a === 'undefined') ? 1.0 : a;
            this.hex = this.getHex();
        }
    }

    /**
     * Return the object's hue, calculated from its rgb value
     * 
     * @name Color#getHue
     * @function
     */
    Color.prototype.getHue = function()
    {
        var r = this.r/255.0;
        var g = this.g/255.0;
        var b = this.b/255.0;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        
        var h = 0.0;

        var d = max - min;

        switch(max)
        {
            case r:
            {
                h = (g - b) / d + (g < b ? 6 : 0);
            }
            break;

            case g:
            {
                h = (b - r) / d + 2;
            }
            break;
            
            case b:
            {
                h = (r - g) / d + 4;
            }
            break;
        }
        h *= 60;

        if(isNaN(h)) {
            h = 0;
        }
        return h;
    };

    /**
     * Return the object's saturation, calculated from its rgb value
     * 
     * @name Color#getSaturation
     * @function
     */
    Color.prototype.getSaturation = function()
    {
        var r = this.r/255.0;
        var g = this.g/255.0;
        var b = this.b/255.0;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        
        var s, l = (max + min) / 2;

        if(max == min)
        {
            h = s = 0;
        }
        else
        {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return s*100;
    };
    
    /**
     * Return the object's brightness, calculated from its rgb value
     * 
     * @name Color#getBrightness
     * @function
     */
    Color.prototype.getBrightness = function()
    {
        var r = this.r/255.0;
        var g = this.g/255.0;
        var b = this.b/255.0;

        return Math.max(r, g, b) * 100.0;
    };

    /**
     * Return the object's lightness, calculated from its rgb value
     * 
     * @name Color#getBrightness
     * @function
     */
    Color.prototype.getLightness = function()
    {
        var r = this.r/255.0;
        var g = this.g/255.0;
        var b = this.b/255.0;
        return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2.0)*100.0;
    };

    /**
     * Return the object's hexidecimal color value, calculated from its rgb value
     * 
     * @name Color#getHex
     * @function
     */
    Color.prototype.getHex = function()
    {
        function toHex(num) {
            var hex = num.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }

        return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
    };

    /**
     * Return the object's hue, saturation, and lightness , calculated from its 
     *     rgb value
     * 
     * @name Color#getHSL
     * @function
     */
    Color.prototype.getHSL = function()
    {
        var r = this.r/255.0;
        var g = this.g/255.0;
        var b = this.b/255.0;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        
        var h, s, l = (max + min) / 2;

        if(max == min)
        {
            h = s = 0;
        }
        else
        {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return [h, s*100, l*100];
    };

    function hue2rgb(p, q, t)
    {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }

    /**
     * Set the object's rgb and hex value, calculated from its values for hue, 
     *     saturation, and lightness
     * 
     * @name Color#setFromHSL
     * @function
     */
    Color.prototype.setFromHSL = function hslToRgb(h, s, l)
    {
        h /=360.0;
        s /=100.0;
        l /=100.0;
        
        var r, g, b;

        if(s === 0)
        {
            r = g = b = l; // achromatic
        }
        else
        {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        this.r = Math.round(r * 255);
        this.g = Math.round(g * 255);
        this.b = Math.round(b * 255);
        this.hex = this.getHex();
        return this;
    };

    /**
     * Set the object's rgb and hex value, calculated from its hexidecimal color value
     * 
     * @name Color#setFromHex
     * @function
     */
    Color.prototype.setFromHex = function(hex)
    {
        hex = (hex.charAt(0) === '#') ? hex.substring(1, hex.length) : hex;

        if(hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        this.hex = '#' + hex;
        this.r = parseInt(hex.substring(0, 2), 16);
        this.g = parseInt(hex.substring(2, 4), 16);
        this.b = parseInt(hex.substring(4, 6), 16);

        return this;
    };
    
    /**
     * Resets the object's rgb value, its hex value, and optionally its alpha 
     *     value from passed in values
     * 
     * @name Color#setFromRGBA
     * @function
     */
    Color.prototype.setFromRGBA = function(r, g, b, a)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        if(a) this.a = a;
        this.hex = this.getHex();
        return this;
    };
    
    /**
     * Resets the object's hue from passed in value
     * 
     * @name Color#setHue
     * @function
     */
    Color.prototype.setHue = function(h)
    {
        var hsl = this.getHSL();
        return this.setFromHSL(h, hsl[1], hsl[2]);
    };

    /**
     * Resets the object's saturation from passed in value
     * 
     * @name Color#setSaturation
     * @function
     */
    Color.prototype.setSaturation = function(s)
    {
        var hsl = this.getHSL();
        return this.setFromHSL(hsl[0], s, hsl[2]);
    };

    /**
     * Resets the object's lightness from passed in value
     * 
     * @name Color#setLightness
     * @function
     */
    Color.prototype.setLightness = function(l)
    {
        var hsl = this.getHSL();
        return this.setFromHSL(hsl[0], hsl[1], l);
    };

    /**
     * Gets CSS background color value by delegating to Utils method
     * 
     * @name Color#getCSSBackgroundColor
     * @function
     */
    Color.prototype.getCSSBackgroundColor = function()
    {
        return Utils.backgroundColor(this.r, this.b, this.g, this.a);
    };

    /**
     * Gets CSS color value by delegating to Utils method
     * 
     * @name Color#getCSSColor
     * @function
     */
    Color.prototype.getCSSColor = function()
    {
        return Utils.color(this.r, this.g, this.b, this.a);
    };

    /**
     * Duplicates the current object with identical rgb and hex values
     * 
     * @name Color#clone
     * @function
     */
    Color.prototype.clone = function()
    {
        return new Color(this.r, this.g, this.b, this.a);
    };

    /**
     * Returns normalized red, green, blue, and alpha values as an array
     * 
     * @name Color#toNormalizeColorArray
     * @function
     */
    Color.prototype.toNormalizeColorArray = function()
    {
        return [this.r/255.0, this.g/255.0, this.b/255.0, this.a];
    };

    /**
     * Returns new color object with hue, saturation, and lightness set based on
     *     a normalized scale between the current object's hsl and a second
     *     object's hsl. The value passed in determines the amount of
     *     hsl change, on a scale from 0 to 1.
     * 
     * @name Color#lerp
     * @function
     */
    Color.prototype.lerp = function(other, value)
    {
        var hsl1 = this.getHSL();
        var hsl2 = other.getHSL();

        var hue = hsl1[0]+(hsl2[0]-hsl1[0])*value;
        var sat = hsl1[1]+(hsl2[1]-hsl1[1])*value;
        var lgt = hsl1[2]+(hsl2[2]-hsl1[2])*value;

        var color = new Color();
        color.setFromHSL(hue, sat, lgt);
        return color;
    };

    module.exports = Color;
});
