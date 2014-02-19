define(function(require, exports, module) {
    var Surface = require('famous/Surface');
    var View = require('famous/View');
    var TimeAgo = require('famous-utils/TimeAgo');

    function ContactItemWidget(options) {
        View.apply(this, arguments);

        this.surface = new Surface({
            size: this.options.size,
            classes: this.options.classes
        });
        if(options) this.setOptions(options);

        this.surface.pipe(this.eventInput);

        this.optionsManager.on('change', function(data) {
            if(data.id == 'content') this.setContent(data.value);
            else {
                var options = {};
                options[data.id] = data.value;
                this.surface.setOptions(options);
            }
        }.bind(this));

        this.node.link(this.surface);
    };
    ContactItemWidget.prototype = Object.create(View.prototype);
    ContactItemWidget.prototype.constructor = ContactItemWidget;

    ContactItemWidget.DEFAULT_OPTIONS = {
        classes: ['feedItem'],
        size: [undefined, 80],
        content: {
            icon: undefined,
            source: undefined,
            time: undefined,
            text: ''
        }
    };

    ContactItemWidget.prototype.setContent = function(content) {
        this.options.content = content;
        var iconEdgeSize = this.options.size[1] * 0.6;
        var iconPart = '<img src="' + content.icon + '" class="icon" width="' + iconEdgeSize + '" height="' + iconEdgeSize + '" />';
        var sourcePart = '<p class="source">' + content.source + '</p>';
        var timePart = '<p class="time">' + TimeAgo.parse(content.time) + '</p>';
        var textPart = '<p class="text">' + content.text + '</p>';
        this.surface.setContent(iconPart + timePart + sourcePart + textPart);
    };

    module.exports = ContactItemWidget;
});