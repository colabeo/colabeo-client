define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');

    /**
     * @name ControlSet
     * @constructor
     * To be deleted.
     */
    function ControlSet() {
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.controls = [];
    }

    ControlSet.prototype.include = function(id, control) {
        control.on('change', function(data) {
            this.eventOutput.emit(id, {value: data.value});
        }.bind(this));
        this.controls.push(control);
    };

    ControlSet.prototype.render = function() {
        var result = [];
        var offset = 0;
        var axisSize = 0;
        for(var i = 0; i < this.controls.length; i++) {
            var control = this.controls[i];
            var size = control.getSize();

            result.push({
                transform: Matrix.translate(0, offset),
                target: control.render()
            });

            offset += size[1];
            axisSize = Math.max(axisSize, size[0]);
        }

        return {
            size: [axisSize, offset],
            target: result
        };
    };

    module.exports = ControlSet;
});
