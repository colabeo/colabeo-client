define(function(require, exports, module) {
    var FamousSurface = require('famous/Surface');     
    var FM = require('famous/Matrix');    
    var Utils = require('famous-utils/Utils');
    var Easing = require('./Easing'); 

    function Animation(options)
    { 
        this.name = options.name || 'base'; 
        this.dead = false; 
        this.engine = options.engine || undefined;
        this.duration = options.duration || 500.0;                  
        this.delay = options.delay || 0.0;         
        this.nextAnimations = []; 
        if(options.next !== undefined)
        {
            if(options.next instanceof Array)
            {
                this.nextAnimations.concat(options.next); 
            }
            else
            {
                this.nextAnimations.push(options.next); 
            }
        }

        this.callback = options.callback || undefined;         

        this.startTime = 0.0; 
        this.endTime = 0.0; 
        this.currentTime = 0.0;       
        this.normalizedTime = 0.0;          
        this.timePassed = 0.0; 
        
        this.halted = false; 
        this.playing = false; 
        this.activated = false;         //indicated whether or not Activate has been called

        this.activateCallback = options.activateCallback || undefined; 
        this.deactivateCallback = options.deactivateCallback || undefined; 

        this.loop = options.loop || false; 
        this.reverse = options.reverse || false; 
        this.reverseUponLoop = options.reverseUponLoop || false; 
        return this; 
    }    

    Animation.prototype.setDead = function(dead)
    {
        this.dead = dead; 
        return this; 
    };

    Animation.prototype.isDead = function()
    {
        return this.dead; 
    };    

    Animation.prototype.setup = function() 
    {

    };

    Animation.prototype.update = function() 
    {

    }; 

    Animation.prototype.render = function()	//Customize this
    {
        
    };

    Animation.prototype.isPlaying = function()
    {
        return this.playing; 
    };

    Animation.prototype.setDuration = function(duration)
    {
        this.duration = duration; 
        return this; 
    };

    Animation.prototype.setDelay = function(delay)
    {
        this.delay = delay; 
        return this; 
    };

    Animation.prototype.setCallback = function(callback)
    {
        this.callback = callback || undefined; 
        return this; 
    };

    Animation.prototype.setReverse = function(reverse) 
    {
        this.reverse = reverse; 
        return this; 
    };

    Animation.prototype.toggleReverse = function()
    {
        this.reverse = !this.reverse;
        return this; 
    };
    
    Animation.prototype.setLoop = function(loop)
    {
        this.loop = loop; 
        return this; 
    };

    Animation.prototype.setReverseUponLoop = function(reverseUponLoop)
    {
        this.reverseUponLoop = reverseUponLoop; 
        return this; 
    };

    Animation.prototype.isHalted = function()
    {
        return this.halted; 
    };

    Animation.prototype.halt = function()
    {
        this.halted = true;             
        this.timePassed = this.engine.getTime() - this.startTime;                 
    };

    Animation.prototype.continueAnimation = function() 
    {    
        this.halted = false; 
        this.startTime = this.engine.getTime() - this.timePassed; 
        this.timePassed = 0.0; 
    };

    Animation.prototype.activate = function()
    {

    };

    Animation.prototype.deactivate = function()
    {

    };

    Animation.prototype.start = function()
    {
        this.engine.addAnimation(this); 
        this.setDead(false); 
        this.halted = false; 
        this.playing = true; 
        this.startTime = this.engine.getTime() + this.delay - this.timePassed; 
        this.endTime = this.startTime + this.duration; 
        this.normalizedTime = 0.0;
    };

    Animation.prototype.tick = function()
    {
        if(this.playing && !this.halted)
        {
            this.currentTime = this.engine.getTime() - this.startTime;         
            this.normalizedTime = this.currentTime / this.duration;
            if(this.normalizedTime > 1.0)
            {                            
                this.normalizedTime = Utils.clamp(this.normalizedTime, 0.0, 1.0);                                   
                if(this.reverse)
                {
                    this.normalizedTime = 1.0 - this.normalizedTime; 
                }                                                               
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
                this.update();
            }                                                
        }
    };

    Animation.prototype.getTime = function()
    {
        return this.normalizedTime; 
    };

    Animation.prototype.end = function()
    {
        this.activated = false; 
        this.playing = false;      
        this.deactivate(); 
        if(this.deactivateCallback !== undefined)
        {
            this.deactivateCallback(); 
        }
        this.engine.removeAnimation(this); 
        if(this.reverseUponLoop)
        {
            this.toggleReverse(); 
        }                   
        if(this.loop)
        {            
            this.start();
        }
        else
        {
            for(var i = 0; i < this.nextAnimations.length; i++)
            {                
                this.nextAnimations[i].start(); 
            }        
        }
        if(this.callback !== undefined)
        {
            this.callback(); 
        }
    };

    Animation.prototype.setNext = function(next) 
    {        
        if(next instanceof Array)
        {
            this.nextAnimations = this.nextAnimations.concat(this.nextAnimations, next); 
        }
        else
        {
            this.nextAnimations.push(next); 
        }
    };

    Animation.prototype.setName = function(name)
    {
        this.name = name; 
    };

    Animation.prototype.getName = function()
    {
        return this.name;
    };

    Animation.prototype.setActivateCallback = function(callback)
    {
        this.activateCallback = callback; 
    };

    Animation.prototype.setDeactivateCallback = function(callback) 
    {
        this.deactivateCallback = callback; 
    };

    module.exports = Animation;
});
