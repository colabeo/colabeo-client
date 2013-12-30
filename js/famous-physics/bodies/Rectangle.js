define(function(require, exports, module) {
    var Body = require('./Body');

    /*
     * @class An elemental rectangle-shaped Particle in the physics engine.
     * 
     * @description This is a region defined by a 2D box. 
     *
     * * Class/Namespace TODOs
     * 
     * * opts: 
     *   * size: ([height, width]) array
     *   * inherited opts from: {@link Particle}.
     *
     * @name Rectangle
     * @extends Particle
     * @example TODO
     * @constructor
     */
     function Rectangle(opts){
        Body.call(this, opts);
        opts = opts || {};
        this.size = opts.size || [0,0];

        var w = this.size[0];
        var h = this.size[1];

        this.I = [
            [h*h/12, 0, 0],
            [0, w*w/12, 0],
            [0, 0, (w*w + h*h)/12]
        ];

        this.Iinv = [
            [12 / (h*h), 0, 0],
            [0, 12 / (w*w), 0],
            [0, 0, 12 / ((w*w + h*h))]
        ];

    };

    Rectangle.prototype = Object.create(Body.prototype);
    Rectangle.prototype.constructor = Rectangle;

    Rectangle.IMMUNITIES = Body.IMMUNITIES;

    module.exports = Rectangle;

});