define(function(require, exports, module) {

    /** @constructor */
    function Constraint(){};

    Constraint.prototype.setOpts = function(opts){
        for (var key in opts) this.opts[key] = opts[key];
    };

    Constraint.prototype.applyConstraint = function(){};

    Constraint.prototype.setupSlider = function(slider, property){
        property = property || slider.opts.name;
        slider.setOpts({value : this.opts[property]});
        if (slider.init) slider.init();
        slider.on('change', function(data){
            this.opts[property] = data.value;
        }.bind(this));
    };

    module.exports = Constraint;
});