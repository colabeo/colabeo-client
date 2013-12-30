define(function(require, exports, module) {
    var Utility = require('famous/Utility');
    var Surface = require('famous/Surface');

    var IconBar = Utility.customizeComponent(Surface, {
        classes: ['iconBar'],
        icons: []
    });

    IconBar.prototype.setOptions = function(options) {
        Surface.prototype.setOptions.call(this, options);
        if(options.icons) this.options.icons = options.icons;
    };

    IconBar.prototype.setContent = function(content) {
        if(typeof content === 'string') {
            content += '<span class="icon">' + this.options.icons.join('') + '</span>';
        }
        return Surface.prototype.setContent.call(this, content);
    };

    module.exports = IconBar;
});
