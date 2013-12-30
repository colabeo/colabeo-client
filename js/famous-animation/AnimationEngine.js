define(function(require, exports, module) {
    var FamousEngine = require('famous/Engine'); 
    var Timer = require('./Timer');
    var Animation = require('./Animation'); 

    function AnimationEngine()
    {
        this.animations = []; 
        this.timer = new Timer(); 
        FamousEngine.on('prerender', this.update.bind(this));         
    }

    AnimationEngine.prototype.update = function() 
    {
        for (var i = 0; i < this.animations.length; i++) 
        {
            this.animations[i].tick();
        }
    };

    AnimationEngine.prototype.render = function() 
    {
        var results = []; 
    
        for (var i = 0; i < this.animations.length; i++) 
        {
            if(this.animations[i].normalizedTime > 0.0)
            {
                results.push(this.animations[i].render());
            }
            if(this.animations[i].isDead())
            {
                this.animations.splice(this.animations.indexOf(this.animations[i]), 1);
            }
        }
        return results; 
    };

    AnimationEngine.prototype.emit = function(type, event)
    {
        if(type == 'prerender')		
        {
            this.update();                         
            this.render(); 
        }
    };

    AnimationEngine.prototype.addAnimation = function(animation)
    {
        if(this.animations.indexOf(animation) == -1)
        {
            this.animations.push(animation);
        }
    };

    AnimationEngine.prototype.removeAnimation = function(animation)
    {
        animation.setDead(true);
    };

    AnimationEngine.prototype.getTime = function()
    {
        return this.timer.getTime();
    };

    module.exports = AnimationEngine;
});