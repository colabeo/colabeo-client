define(function(require, exports, module) {

    /*
     *  EasingNameNorm: 
     *  @param {float} t: (time) expects a number between 0 and 1.
     *  @returns {float}: between 0 and 1, based on the curve.
     *  NOTE: Can only use Norm functions with FamousTransforms, passed in as a curve.
     *
     *  @example:
     *  var curve = { 
     *      curve: Easing.inOutBackNorm,
     *      duration: 500
     *  }
     *  yourTransform.setTransform(FM.identity, curve);
     *
     *  This would animate over 500 milliseconds back to [0, 0, 0]
     *
     *      
     *  EasingName: 
     *  @param {float} t: current normalized time: expects a number between 0 and 1.
     *
     *  @param {float} b: start value
     *
     *  @param {float} c: the total change of the easing function.
     * 
     *  @param {float} d: the duration of the tween, normally left at 1.
     *
     *  @returns {float}: number between b and b+c;
     *
     *  Most often used with the Animation engine:
     *  @example:
     *  animation.update = function() {
     *      someFunction.set(Easing.inOutCubic(this.getTime(), 0, 1000, 1.0)); 
     *  }
     *
     *  this would output numbers between 0 and 1000.
     *
     */ 

    var Easing = {
        linear: function(t, b, c, d)
        {
            return t*(c/d) + b;  
        }, 

        linearNorm: function(t)
        {
            return t; 
        },

        inQuad: function(t, b, c, d) 
        {
            return c*(t/=d)*t + b;
        },

        inQuadNorm: function(t)
        {
            return t*t; 
        },

        outQuad: function(t, b, c, d) 
        {
            return -c *(t/=d)*(t-2) + b;
        },

        outQuadNorm: function(t)
        {
            return -(t-=1)*t+1; 
        },

        inOutQuad: function(t, b, c, d) 
        {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },

        inOutQuadNorm: function(t)
        {
            if ((t/=.5) < 1) return .5*t*t; 
            return -.5*((--t)*(t-2) - 1); 
        },

        inCubic: function(t, b, c, d) 
        {
            return c*(t/=d)*t*t + b;
        },

        inCubicNorm: function(t)
        {
            return t*t*t; 
        },

        outCubic: function(t, b, c, d) 
        {
            return c*((t=t/d-1)*t*t + 1) + b;
        },

        outCubicNorm: function(t)
        {
            return ((--t)*t*t + 1); 
        },

        inOutCubic: function(t, b, c, d) 
        {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },

        inOutCubicNorm: function(t)
        {
            if ((t/=.5) < 1) return .5*t*t*t;
            return .5*((t-=2)*t*t + 2); 
        },

        inQuart: function(t, b, c, d) 
        {
            return c*(t/=d)*t*t*t + b;
        },
        
        inQuartNorm: function(t)
        {
            return t*t*t*t; 
        },
        
        outQuart: function(t, b, c, d) 
        {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        
        outQuartNorm: function(t)
        {
            return -((--t)*t*t*t - 1); 
        },
        
        inOutQuart: function(t, b, c, d) 
        {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },

        inOutQuartNorm: function(t) 
        {
            if ((t/=.5) < 1) return .5*t*t*t*t;
            return -.5 * ((t-=2)*t*t*t - 2);
        },
        
        inQuint: function(t, b, c, d) 
        {
            return c*(t/=d)*t*t*t*t + b;
        },

        inQuintNorm: function(t)
        {
            return t*t*t*t*t;
        },
        
        outQuint: function(t, b, c, d) 
        {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },

        outQuintNorm: function(t)
        {
            return ((--t)*t*t*t*t + 1); 
        },
        
        inOutQuint: function(t, b, c, d) 
        {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },

        inOutQuintNorm: function(t)
        {
            if ((t/=.5) < 1) return .5*t*t*t*t*t;
            return .5*((t-=2)*t*t*t*t + 2);
        },
        
        inSine: function(t, b, c, d) 
        {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },

        inSineNorm: function(t)
        {
            return -1.0*Math.cos(t * (Math.PI/2)) + 1.0; 
        },
        
        outSine: function(t, b, c, d) 
        {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },

        outSineNorm: function(t)
        {
            return Math.sin(t * (Math.PI/2)); 
        },
        
        inOutSine: function(t, b, c, d) 
        {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },

        inOutSineNorm: function(t)
        {
            return -.5*(Math.cos(Math.PI*t) - 1); 
        },
        
        inExpo: function(t, b, c, d) 
        {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },

        inExpoNorm: function(t)
        {
            return (t==0) ? 0.0 : Math.pow(2, 10 * (t - 1));
        },
        
        outExpo: function(t, b, c, d) 
        {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },

        outExpoNorm: function(t) 
        {
            return (t==1.0) ? 1.0 : (-Math.pow(2, -10 * t) + 1); 
        },
        
        inOutExpo: function (t, b, c, d) 
        {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },

        inOutExpoNorm: function(t) 
        {
            if (t==0) return 0.0;
            if (t==1.0) return 1.0; 
            if ((t/=.5) < 1) return .5 * Math.pow(2, 10 * (t - 1)); 
            return .5 * (-Math.pow(2, -10 * --t) + 2);
        },
        
        inCirc: function(t, b, c, d) 
        {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },

        inCircNorm: function(t)
        {
            return -(Math.sqrt(1 - t*t) - 1);
        },
        
        outCirc: function(t, b, c, d) 
        {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        
        outCircNorm: function(t)
        {
            return Math.sqrt(1 - (--t)*t); 
        },
        
        inOutCirc: function(t, b, c, d) 
        {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },

        inOutCircNorm: function(t)
        {
            // return Easing.inOutCirc(t, 0.0, 1.0, 1.0); 
            if ((t/=.5) < 1) return -.5 * (Math.sqrt(1 - t*t) - 1);
            return .5 * (Math.sqrt(1 - (t-=2)*t) + 1); 
        },
        
        inElastic: function(t, b, c, d) 
        {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },

        inElasticNorm: function (t)
        {
            var s=1.70158;var p=0;var a=1.0;
            if (t==0) return 0.0;  if (t==1) return 1.0;  if (!p) p=.3;         
            s = p/(2*Math.PI) * Math.asin (1.0/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/ p)); 
        },
        
        outElastic: function(t, b, c, d) 
        {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        
        outElasticNorm: function(t)
        {           
            var s=1.70158;var p=0;var a=1.0;
            if (t==0) return 0.0;  if (t==1) return 1.0;  if (!p) p=.3;
            s = p/(2*Math.PI) * Math.asin (1.0/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t-s)*(2*Math.PI)/p ) + 1.0; 
        },
        
        inOutElastic: function(t, b, c, d) 
        {
            var s=1.70158;var p=0;var a=c;
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        },

        inOutElasticNorm: function(t)
        {
            var s=1.70158;var p=0;var a=1.0;
            if (t==0) return 0.0;  if ((t/=.5)==2) return 1.0;  if (!p) p=(.3*1.5);         
            s = p/(2*Math.PI) * Math.asin (1.0/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p ));
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t-s)*(2*Math.PI)/p )*.5 + 1.0; 
        },
        
        inBack: function(t, b, c, d, s) 
        {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },

        inBackNorm: function(t, s) 
        {
            if (s == undefined) s = 1.70158;
            return t*t*((s+1)*t - s);
        },
        
        outBack: function (t, b, c, d, s) 
        {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },

        outBackNorm: function (t, s) 
        {
            if (s == undefined) s = 1.70158;
            return ((--t)*t*((s+1)*t + s) + 1);
        },
        
        inOutBack: function (t, b, c, d, s) 
        {
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },

        inOutBackNorm: function(t, s) 
        {
            if (s == undefined) s = 1.70158; 
            if ((t/=.5) < 1) return .5*(t*t*(((s*=(1.525))+1)*t - s)); 
            return .5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2); 
        },
        
        inBounce: function(t, b, c, d) 
        {
            return c - Easing.outBounce(d-t, 0, c, d) + b;
        },  

        inBounceNorm: function(t)
        {
            return 1.0 - Easing.outBounceNorm(1.0-t); 
        },              
    
        outBounce: function(t, b, c, d) 
        {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },

        outBounceNorm: function(t) 
        {
            if (t < (1/2.75)) {
                return (7.5625*t*t);
            } else if (t < (2/2.75)) {
                return (7.5625*(t-=(1.5/2.75))*t + .75); 
            } else if (t < (2.5/2.75)) {
                return (7.5625*(t-=(2.25/2.75))*t + .9375);
            } else {
                return (7.5625*(t-=(2.625/2.75))*t + .984375); 
            }
        },
        
        inOutBounce: function(t, b, c, d) 
        {
            if (t < d/2) return Easing.inBounce (t*2, 0, c, d) * .5 + b;
            return Easing.outBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
        },

        inOutBounceNorm: function(t)
        {
            if (t < .5) return Easing.inBounceNorm (t*2) * .5; 
            return Easing.outBounceNorm(t*2-1.0) * .5 + .5; 
        }
    }; 
    
    module.exports = Easing;
});
