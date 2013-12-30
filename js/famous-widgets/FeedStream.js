define(function(require, exports, module) {
    var EventHandler = require('famous/EventHandler');
    var Scrollview = require('famous-views/Scrollview');
    var FeedItem = require('./FeedItem');
    
    function FeedStream(options) {
        this.options = Object.create(FeedStream.DEFAULT_OPTIONS);

        this.scrollview = new Scrollview({direction: 'y', margin: 0});
        if(options) this.setOptions(options);

        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventInput.pipe(this.scrollview);
    };

    FeedStream.DEFAULT_OPTIONS = {
        widget: FeedItem,
        content: []
    };

    FeedStream.prototype.setContent = function(content) {
        this.options.content = content;
        var widget = this.options.widget;
        this.scrollview.sequenceFrom(content.map(function(itemDef) {
            return new widget({content: itemDef});
        }));
    };

    FeedStream.prototype.getSize = function() {
        return this.scrollview.getSize();
    };

    FeedStream.prototype.setSize = function(size) {
        this.scrollview.setOptions({
            clipSize: size[1]
        });
    };

    FeedStream.prototype.setOptions = function(options) {
        if(options.widget) this.options.widget = options.widget;
        if(options.content) this.setContent(options.content);
    };

    FeedStream.prototype.render = function() {
        return this.scrollview.render();
    };

    module.exports = FeedStream;
});
