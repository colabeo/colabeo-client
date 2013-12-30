define(function(require, exports, module) {
    var Vector = require('famous-physics/math/Vector');

    /** @constructor */
    function Force(){
        this.force = new Vector();
    };

    Force.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    Force.prototype.applyConstraint = function(){};

    Force.prototype.setupSlider = function(slider, property){
        property = property || slider.opts.name;
        slider.setOpts({value : this.opts[property]});
        if (slider.init) slider.init();
        slider.on('change', function(data){
            this.opts[property] = data.value;
        }.bind(this));
    };

    Force.prototype.getEnergy = function(){return 0};

    module.exports = Force;
});
