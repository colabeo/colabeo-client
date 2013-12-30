define(function(require, exports, module) {
    var Body = require('./Body');

    /**
     * @class An elemental circle-shaped Particle in the physics engine.
     * 
     * @description This is a region defined by a radius.
     *    Its size is the dimension of the bounding square.
     *
     *
     * * Class/Namespace TODOs
     * 
     * * opts: 
     *    * r: radius
     *    * inherited opts from: {@link Particle}.
     * 
     * @name Circle
     * @extends Particle
     * @constructor
     * @example TODO
     */
     function Circle(opts){
        Body.call(this, opts);
        opts = opts || {};
        this.r = opts.r || 0;       //radius
        this.size = [2*this.r, 2*this.r];

        var r = this.r;
        var m = this.m;
        this.I = [
            [0.25 * m * r * r, 0, 0],
            [0, 0.25 * m * r * r, 0],
            [0, 0, 0.5 * m * r * r]
        ];

        this.Iinv = [
            [4 / (m * r * r), 0, 0],
            [0, 4 / (m * r * r), 0],
            [0, 0, 2 / (m * r * r)]
        ];
    };

    Circle.prototype = Object.create(Body.prototype);
    Circle.prototype.constructor = Circle;
    Circle.IMMUNITIES = Body.IMMUNITIES;

    module.exports = Circle;

});