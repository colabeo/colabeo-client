define(function(require, exports, module) {
    var FM = require('famous/Matrix');

    /**
     * @constructor
     */
    function Quaternion(w,x,y,z){
        this.w = (w !== undefined) ? w : 1.0;  //Angle
        this.x = x || 0.0;  //Axis.x
        this.y = y || 0.0;  //Axis.y
        this.z = z || 0.0;  //Axis.z        
        return this;
    };

    Quaternion.prototype.makeFromAngleAndAxis = function(angle, v)
    {        
        v.normalize(); 
        var ha = angle*0.5; 
        var s = Math.sin(ha);         
        this.x = s*v.x; 
        this.y = s*v.y; 
        this.z = s*v.z; 
        this.w = Math.cos(ha);         
        return this; 
    };     

    Quaternion.prototype.clone = function()
    {
        return new Quaternion(this.w, this.x, this.y, this.z); 
    }; 

    Quaternion.prototype.setWXYZ = function(w, x, y, z)
    {
        this.w = w; 
        this.x = x; 
        this.y = y; 
        this.z = z;         
        return this; 
    };

    Quaternion.prototype.set = function(q) 
    {
        this.w = q.w;    
        this.x = q.x; 
        this.y = q.y; 
        this.z = q.z;         
        return this; 
    };

    Quaternion.prototype.clear = function() 
    {
        this.w = 1.0; 
        this.x = 0.0; 
        this.y = 0.0; 
        this.z = 0.0; 
        return this;         
    };

    Quaternion.prototype.normalize = function()
    {
        var norme = Math.sqrt(this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z); 
        if (norme == 0.0)
        {
            this.w = 1.0; 
            this.x = this.y = this.z = 0.0; 
        }
        else
        {
            var recip = 1.0 / norme; 
            this.w *= recip; 
            this.x *= recip; 
            this.y *= recip; 
            this.z *= recip;             
        }
        return this; 
    }; 

    Quaternion.prototype.getMatrix = function()
    {
        this.normalize(); 
        return [ 
            1.0 - 2.0*this.y*this.y - 2.0*this.z*this.z, 
            2.0*this.x*this.y - 2.0*this.z*this.w, 
            2.0*this.x*this.z + 2.0*this.y*this.w, 
            0.0,
            2.0*this.x*this.y + 2.0*this.z*this.w, 
            1.0 - 2.0*this.x*this.x - 2.0*this.z*this.z, 
            2.0*this.y*this.z - 2.0*this.x*this.w, 
            0.0,
            2.0*this.x*this.z - 2.0*this.y*this.w, 
            2.0*this.y*this.z + 2.0*this.x*this.w, 
            1.0 - 2.0*this.x*this.x - 2.0*this.y*this.y, 
            0.0,
            0.0, 
            0.0, 
            0.0, 
            1.0 ]; 
    };  

    Quaternion.prototype.multiply = function(q, out) 
    {
        out = out || this.register;
        out.w = this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z; 
        out.x = this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y;
        out.y = this.w*q.y - this.x*q.z + this.y*q.w + this.z*q.x;
        out.z = this.w*q.z + this.x*q.y - this.y*q.x + this.z*q.w ;
        return out; 
    };

    Quaternion.prototype.isEqual = function(q) 
    {
        if(q.w == this.w && q.x == this.x && q.y == this.y && q.z == this.z)
        {
            return true; 
        }
        return false; 
    }; 

    Quaternion.prototype.dot = function(q)
    {
        return (this.w*q.w + this.x*q.x + this.y*q.y + this.z*q.z); 
    };    

    Quaternion.prototype.add = function(q, out)
    {
        out = out || this.register;
        out.w = this.w + q.w; 
        out.x = this.x + q.x; 
        out.y = this.y + q.y; 
        out.z = this.z + q.z; 
        return out; 
    }; 

    Quaternion.prototype.sub = function(q, out)
    {
        out = out || this.register;
        out.w = this.w - q.w; 
        out.x = this.x - q.x; 
        out.y = this.y - q.y; 
        out.z = this.z - q.z; 
        return out; 
    }; 

    Quaternion.prototype.normSquared = function()
    {
        return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w; 
    };

    Quaternion.prototype.norm = function()
    {
        return Math.sqrt(this.normSquared());
    };


    Quaternion.prototype.conj = function(out)
    {
        out = out || this.register;
        out.w = this.w; 
        out.x = -this.x; 
        out.y = -this.y; 
        out.z = -this.z; 
        return out; 
    }; 
    
    Quaternion.prototype.inverse = function(out)
    {
        out = out || this.register;
        this.conj(out);
        out.scalarDivide(this.normSquared(), out);
        return out;  
    }; 

    Quaternion.prototype.scalarDivide = function(s, out)
    {
        out = out || this.register;        
        s = 1.0 / s;
        out.w = this.w*s; 
        out.x = this.x*s; 
        out.y = this.y*s; 
        out.z = this.z*s; 
        return out; 
    };

    Quaternion.prototype.scalarMult = function(s, out)
    {
        out = out || this.register;                
        out.w = this.w*s; 
        out.x = this.x*s; 
        out.y = this.y*s; 
        out.z = this.z*s; 
        return out;   
    }

    Quaternion.prototype.isZero = function()
    {
        if(this.x == 0 && this.y == 0 && this.z == 0 && this.w == 1.0)
        {
            return true; 
        }
        return false;         
    }; 

    Quaternion.prototype.negate = function()
    {
        this.w = -this.w; 
        this.x = -this.x; 
        this.y = -this.y; 
        this.z = -this.z; 
        return this; 
    }

    Quaternion.prototype.zeroRotation = function()
    {
        this.x = 0; this.y = 0; this.z = 0; this.w = 1.0; 
        return this; 
    }; 

    Quaternion.prototype.slerp = function(q, t, out)
    {
        out = out || this.register;                
        var omega, cosomega, sinomega, scaleFrom, scaleTo; 

        this.to.set(q);
        this.from.set(this); 

        cosomega = this.dot(q); 

        if(cosomega < 0.0)
        {
            cosomega = -cosomega; 
            this.to.negate();             
        }

        if( (1.0 - cosomega) > this.epsilon )
        {
            omega = Math.acos(cosomega); 
            sinomega = Math.sin(omega);
            scaleFrom = Math.sin( (1.0 - t) * omega ) / sinomega; 
            scaleTo = Math.sin( t * omega ) / sinomega;             
        }
        else
        {
            scaleFrom = 1.0 - t; 
            scaleTo = t; 
        }


        this.from.scalarMult(scaleFrom, this.from);        
        this.to.scalarMult(scaleTo, this.to);        
        this.from.add(this.to, out);         
        return out; 
    }

    Quaternion.prototype.epsilon    = 0.00001; 
    Quaternion.prototype.from       = new Quaternion(0,0,0,0);
    Quaternion.prototype.to         = new Quaternion(0,0,0,0);
    Quaternion.prototype.register   = new Quaternion(0,0,0,0);
    Quaternion.prototype.zero       = new Quaternion(0,0,0,0);
    Quaternion.prototype.one        = new Quaternion(1,1,1,1);

    module.exports = Quaternion;
});