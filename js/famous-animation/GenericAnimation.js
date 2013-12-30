define(function(require, exports, module) {
    var FamousSurface = require('famous/Surface');     
    var FM = require('famous/Matrix');   
    var Vector = require('famous-math/Vector');
    var Quaternion = require('famous-math/Quaternion');

    var Animation = require('./Animation'); 
    var AnimationEngine = require('./AnimationEngine');     
    var Easing = require('./Easing'); 
    var Utils = require('famous-utils/Utils'); 

    var Color = require('famous-color/Color'); 

    function GenericAnimation(options)
    {
        Animation.call(this, options);             
        this.surface = options.surface;                                      
        this.renderSurface = options.renderSurface || false; 

        this.easing = options.easing || Easing.inOutCubicNorm; 

        //Color
        this.animateColor = false;         
        this.startColor = options.startColor || new Color(255, 255, 255, 1.0); 
        this.endColor = options.endColor || new Color(255, 255, 255, 1.0);         

        this.startColorHSL = new Vector(); 
        this.endColorHSL = new Vector(); 
        this.deltaColorHSL = new Vector(); 
        this.currentColorHSL = new Vector(); 
        
        //Opacity
        this.animateOpacity = false; 
        this.startOpacity = options.startOpacity || 0.0; 
        this.endOpacity = options.endOpacity || 0.0; 
        this.deltaOpacity = 0.0;         

        //Position
        this.animatePosition = false; 
        this.startPosition = options.startPosition || (new Vector(0,0,0)).fromArray(FM.getTranslate(this.surface.mtx)); 
        this.endPosition = options.endPosition || (new Vector(0,0,0)).fromArray(FM.getTranslate(this.surface.mtx));
        this.currentPosition = new Vector(0,0,0); 
        this.deltaPosition = new Vector(0,0,0);      

        //Orientation
        this.animateOrientation = false; 
        this.startOrientation = options.startOrientation || new Quaternion(); 
        this.endOrientation = options.endOrientation || new Quaternion(); 
        this.currentOrientation = options.currentOrientation || new Quaternion(); 

        //Corner Radius
        this.animateRadius = false; 
        this.startRadius = options.startRadius || 0.0; 
        this.endRadius = options.endRadius || 0.0; 
        this.deltaRadius = 0.0; 
        this.currentRadius = 0.0;                 
    }

    GenericAnimation.prototype = Object.create(Animation.prototype);
    GenericAnimation.prototype.constructor = GenericAnimation;

    GenericAnimation.prototype.activate = function()
    {            
        //Color
        var hsl1 = this.startColor.getHSL();         
        var hsl2 = this.endColor.getHSL();         

        this.startColorHSL.setXYZ(hsl1[0], hsl1[1], hsl1[2]); 
        this.endColorHSL.setXYZ(hsl2[0], hsl2[1], hsl2[2]); 
        this.endColorHSL.sub(this.startColorHSL, this.deltaColorHSL); 
        this.currentColorHSL.set(this.startColorHSL); 

        if(this.startColor.r == this.endColor.r && this.startColor.g == this.endColor.g && this.startColor.b == this.endColor.b && this.startColor.a == this.endColor.a)
        {            
            this.animateColor = false; 

        }
        else
        {
            this.animateColor = true; 
        }

        //Opacity
        this.deltaOpacity = this.endOpacity - this.startOpacity; 
        if(Math.abs(this.deltaOpacity) > 0.0)
        {
            this.animateOpacity = true;            
        }
        else
        {
            this.animateOpacity = false; 
        }

        //Position
        this.endPosition.sub(this.startPosition, this.deltaPosition);         
        this.currentPosition.set(this.startPosition); 
        if(this.deltaPosition.isZero())
        {
            this.animatePosition = false; 
        }
        else
        {
            this.animatePosition = true;             
        }

        //Orientation
        if(this.startOrientation.isEqual(this.endOrientation))
        {
            this.animateOrientation = false;            
        }
        else
        {
            this.animateOrientation = true;
        }

        //Radius
        this.deltaRadius = this.endRadius - this.startRadius; 
        this.currentRadius = this.startRadius; 
        if(this.deltaRadius === 0)
        {
            this.animateRadius = false; 
        }
        else
        {
            this.animateRadius = true;  
        }
    };

    GenericAnimation.prototype.tick = function()
    {
        if(this.playing && !this.halted)
        {
            this.currentTime = this.engine.getTime() - this.startTime;         
            this.normalizedTime = this.currentTime / this.duration;                         
            if(this.normalizedTime > 1.0)
            {                            
                this.normalizedTime = Utils.clamp(this.normalizedTime, 0.0, 1.0);                                   
                this._update(); 
                this.update(); 
                this.end();     
                return;         
            }
            if(this.normalizedTime > 0.000001)
            {                
                if(!this.activated)
                {
                    this.activate(); 
                    if(this.activateCallback !== undefined)
                    {
                        this.activateCallback(); 
                    }
                    this.activated = true; 
                }

                if(this.reverse)
                {
                    this.normalizedTime = 1.0 - this.normalizedTime; 
                }                
                this._update();                                
                this.update();              
            }                                                
        }
    };

    GenericAnimation.prototype._update = function() //Customize this
    {                     
        var value = this.easing(this.normalizedTime); 
        //Color
        if(this.animateColor)
        {
            this.deltaColorHSL.mult(value, this.currentColorHSL); 
            this.currentColorHSL.add(this.startColorHSL, this.currentColorHSL);         
            
            this.surface.setProperties(
                Utils.backgroundColorHSL(
                    this.currentColorHSL.x,
                    this.currentColorHSL.y, 
                    this.currentColorHSL.z,
                    1.0)
                );         
        }

        //Opacity
        if(this.animateOpacity)
        {
            this.surface.opacity = this.startOpacity + this.deltaOpacity*value; 
        }        

        //Position
        if(this.animatePosition || this.animateOrientation)
        {
            this.deltaPosition.mult(value, this.currentPosition);
            this.currentPosition.add(this.startPosition, this.currentPosition);         
            this.startOrientation.slerp(this.endOrientation, value, this.currentOrientation);                                            
            this.surface.mtx = FM.move(this.currentOrientation.getMatrix(), this.currentPosition.toArray());                 
        }


        //Radius
        if(this.animateRadius)
        {
            this.currentRadius = this.startRadius + this.deltaRadius*value; 
            this.surface.setProperties(Utils.borderRadius(this.currentRadius));     
            // var size = this.surface.getSize(); 
            // this.surface.setProperties(Utils.clipCircle(size[0]*.5, size[1]*.5, size[0]-this.currentRadius));            
        }
    };

    GenericAnimation.prototype.render = function() //Customize this
    {       
        if(this.renderSurface && !this.dead && this.normalizedTime > 0.0)
        {        
            return {            
                transform: this.surface.mtx, 
                opacity: this.surface.opacity,                         
                target: this.surface.render()
            }; 
        }        
    };

    GenericAnimation.prototype.setStartColor = function(c)
    {
        this.startColor = c;         
    };

    GenericAnimation.prototype.setEndColor = function(c)
    {
        this.endColor = c;       
    };

    GenericAnimation.prototype.getStartColor = function()
    {
        return this.startColor; 
    };

    GenericAnimation.prototype.getEndColor = function()
    {
        return this.endColor; 
    };

    GenericAnimation.prototype.setStartPosition = function(p)
    {
        this.startPosition = p;     
    };    

    GenericAnimation.prototype.setStartPositionX = function(x)
    {
        this.startPosition.x = x;     
    };    

    GenericAnimation.prototype.setStartPositionY = function(y)
    {
        this.startPosition.y = y;
    };    

    GenericAnimation.prototype.setStartPositionZ = function(z)
    {
        this.startPosition.z = z; 
    };    

    GenericAnimation.prototype.setEndPosition = function(p)
    {
        this.endPosition = p; 
    };

    GenericAnimation.prototype.setEndPositionX = function(x)
    {
        this.endPosition.setX(x); 
    };

    GenericAnimation.prototype.setEndPositionY = function(y)
    {
        this.endPosition.setY(y);         
    };

    GenericAnimation.prototype.setEndPositionZ = function(z)
    {
        this.endPosition.setZ(z);         
    };

    GenericAnimation.prototype.getEndPosition = function()
    {
        return this.endPosition; 
    };

    GenericAnimation.prototype.getStartPosition = function()
    {
        return this.startPosition; 
    };

    GenericAnimation.prototype.getCurrentPosition = function()
    {
        return this.currentPosition; 
    };

    GenericAnimation.prototype.setStartOpacity = function(o)
    {
        this.startOpacity = o; 
    };

    GenericAnimation.prototype.setEndOpacity = function(o)
    {
        this.endOpacity = o;
    };

    GenericAnimation.prototype.getStartOpacity = function()
    {
        return this.startOpacity;
    };

    GenericAnimation.prototype.getEndOpacity = function()
    {
        return this.endOpacity; 
    };

    GenericAnimation.prototype.setStartRadius = function(r)
    {        
        this.startRadius = r; 
    };

    GenericAnimation.prototype.setEndRadius = function(r)
    {
        this.endRadius = r; 
    };

    GenericAnimation.prototype.getCurrentRadius = function()
    {
        return this.currentRadius; 
    };

    GenericAnimation.prototype.getStartRadius = function(r)
    {
        return this.startRadius;
    };

    GenericAnimation.prototype.getEndRadius = function(r)
    {
        return this.endRadius; 
    };

    GenericAnimation.prototype.setStartOrientation = function(o)
    {
        this.startOrientation = o;     
    };

    GenericAnimation.prototype.setEndOrientation = function(o)
    {
        this.endOrientation = o; 
    };

    GenericAnimation.prototype.getEndOrientation = function()
    {
        return this.endOrientation; 
    };

    GenericAnimation.prototype.getStartOrientation = function()
    {
        return this.startOrientation; 
    };

    GenericAnimation.prototype.setEasing = function(easing)
    {
        this.easing = easing; 
    };

    GenericAnimation.prototype.setSurface = function(surface)
    {
        this.surface = surface; 
    };

    GenericAnimation.prototype.setEndValuesToStartValues = function()
    {
        this.startColor = this.endColor.clone(); 
        this.startOpacity = this.endOpacity;         
        this.startPosition.set(this.endPosition);         
        this.startOrientation.set(this.endOrientation); 
        this.startRadius = this.endRadius; 
    };

    module.exports = GenericAnimation;
});