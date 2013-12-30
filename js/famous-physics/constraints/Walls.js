define(function(require, exports, module) {
    var Constraint = require('famous-physics/constraints/Constraint');
    var Vector = require('famous-physics/math/Vector');
    var Wall = require('famous-physics/constraints/Wall');

    /** @constructor */
    function Walls(opts){
        this.opts = {
            sides   : Walls.TWO_DIMENSIONAL,
            size    : [window.innerWidth, window.innerHeight, 0],
            origin  : [.5,.5,.5],
            k       : 0,
            restitution : 0.5,
            onContact   : Walls.ON_CONTACT.REFLECT
        };

        this.setSize(this.opts.size, this.opts.origin);
        this.setOptsForEach({
            restitution : this.opts.restitution,
            k : this.opts.k
        });

        if (opts) this.setOpts(opts);
    };

    Walls.prototype = Object.create(Constraint.prototype);
    Walls.prototype.constructor = Constraint;

    Walls.SIDES = {
        LEFT    : new Wall({n : new Vector( 1, 0, 0)}),
        RIGHT   : new Wall({n : new Vector(-1, 0, 0)}),
        TOP     : new Wall({n : new Vector( 0, 1, 0)}),
        BOTTOM  : new Wall({n : new Vector( 0,-1, 0)}),
        FRONT   : new Wall({n : new Vector( 0, 0, 1)}),
        BACK    : new Wall({n : new Vector( 0, 0,-1)})
    };

    Walls.TWO_DIMENSIONAL   = [Walls.SIDES.LEFT, Walls.SIDES.RIGHT, Walls.SIDES.TOP, Walls.SIDES.BOTTOM];
    Walls.THREE_DIMENSIONAL = [Walls.SIDES.LEFT, Walls.SIDES.RIGHT, Walls.SIDES.TOP, Walls.SIDES.BOTTOM, Walls.SIDES.FRONT, Walls.SIDES.BACK];

    Walls.ON_CONTACT = Wall.ON_CONTACT;

    Walls.prototype.setOpts = function(opts){
        var resizeFlag = false;
        if (opts.restitution !== undefined) this.setOptsForEach({restitution : opts.restitution});
        if (opts.k !== undefined) this.setOptsForEach({k : opts.k});
        if (opts.size !== undefined) {this.opts.size = opts.size; resizeFlag = true};
        if (opts.sides !== undefined) this.opts.sides = opts.sides;
        if (opts.onContact !== undefined) {this.opts.onContact = opts.onContact; this.setOnContact(opts.onContact)}
        if (opts.origin !== undefined) {this.opts.origin = opts.origin; resizeFlag = true};
        if (resizeFlag) this.setSize(this.opts.size, this.opts.origin);
    };

    Walls.prototype.setSize = function(size, origin){
        origin = origin || this.opts.origin;
        if (origin.length < 3) origin[2] = 0.5;

        Walls.SIDES.LEFT.setOpts(  {d : size[0] * origin[0]} );
        Walls.SIDES.TOP.setOpts(   {d : size[1] * origin[1]} );
        Walls.SIDES.FRONT.setOpts( {d : size[2] * origin[2]} );
        Walls.SIDES.RIGHT.setOpts( {d : size[0] * (1 - origin[0])} );
        Walls.SIDES.BOTTOM.setOpts({d : size[1] * (1 - origin[1])} );
        Walls.SIDES.BACK.setOpts(  {d : size[2] * (1 - origin[2])} );

        this.opts.size   = size;
        this.opts.origin = origin;
    };

    Walls.prototype.setOptsForEach = function(opts){
        this.forEachWall(function(wall){
            wall.setOpts(opts)
        });
        for (var key in opts) this.opts[key] = opts[key];
    };

    Walls.prototype.setOnContact = function(onContact){
        this.forEachWall(function(wall){
            wall.setOpts({onContact : onContact});
        });

        switch (onContact){
            case Walls.ON_CONTACT.REFLECT:
                break;
            case Walls.ON_CONTACT.WRAP:
                this.forEachWall(function(wall){
                    wall.setOpts({onContact : onContact});
                    wall.on('wrap', function(data){
                        var particle = data.particle
                        var n = wall.opts.n;
                        var d = wall.opts.d;
                        switch (wall){
                            case Walls.SIDES.RIGHT:
                                var d2 = Walls.SIDES.LEFT.opts.d;
                                break;
                            case Walls.SIDES.LEFT:
                                var d2 = Walls.SIDES.TOP.opts.d;
                                break;
                            case Walls.SIDES.TOP:
                                var d2 = Walls.SIDES.BOTTOM.opts.d;
                                break;
                            case Walls.SIDES.BOTTOM:
                                var d2 = Walls.SIDES.TOP.opts.d;
                                break;
                        }
                        particle.p.add(n.mult(d + d2), particle.p);
                    });
                });
                break;
            case Walls.ON_CONTACT.ABSORB:
                break;
        };
    };

    Walls.prototype.applyConstraint = function(particles, source, dt){
        this.forEachWall(function(wall){
            wall.applyConstraint(particles, source, dt);
        });
    };

    Walls.prototype.forEachWall = function(fn){
        for (var index = 0; index < this.opts.sides.length; index++)
            fn(this.opts.sides[index]);
    };

    Walls.prototype.rotateZ = function(theta){
        this.forEachWall(function(wall){
            var n = wall.opts.n;
            n.rotateZ(theta).put(n);
        });
    };

    Walls.prototype.rotateX = function(theta){
        this.forEachWall(function(wall){
            var n = wall.opts.n;
            n.rotateX(theta).put(n);
        });
    };

    Walls.prototype.rotateY = function(theta){
        this.forEachWall(function(wall){
            var n = wall.opts.n;
            n.rotateY(theta).put(n);
        });
    };

    module.exports = Walls;

});