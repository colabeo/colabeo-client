define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var Surface = require('famous/Surface');

    function InfoBox(options) {
        this.options = Object.create(InfoBox.DEFAULT_OPTIONS);
        this.surface = new Surface(this.options.look);

        if(options) this.setOptions(options);

        EventHandler.setInputHandler(this, this.surface);
        EventHandler.setOutputHandler(this, this.surface, true);
    };

    InfoBox.DEFAULT_OPTIONS = {
        look: {
            classes: ['infoBox'],
            size: [undefined, true]
        },
        content: []
    };

    function _generateHTML(content) {
        var result = '<ul>';
        for(var i = 0; i < content.length; i++) {
            var entry = content[i];
            var key = Object.keys(entry)[0];
            result += '<li><span class="key">' + key + '</span> ' + entry[key] + '</li>';
        }
        result += '</ul>';
        return result;
    };

    InfoBox.prototype.setOptions = function(options) {
        if(options.content !== undefined) {
            this.options.content = options.content;
            this.surface.setContent(_generateHTML(this.options.content));
        }
        if(options.look !== undefined) {
            this.options.look = options.look;
            this.surface.setOptions(this.options.look);
        }
    };

    InfoBox.prototype.render = function() {
        return this.surface.render();
    };

    module.exports = InfoBox;
});
