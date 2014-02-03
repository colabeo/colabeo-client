define(function(require, exports, module) {
    var Surface = require('./Surface');
    function ConversationSurface(opts) {
        Surface.apply(this, arguments);
    };


//    put model in deploy

    ConversationSurface.prototype = Object.create(Surface.prototype);
    ConversationSurface.prototype.surfaceEvents = Surface.prototype.surfaceEvents.concat(['load']);
    ConversationSurface.prototype.elementType = 'text';
    ConversationSurface.prototype.elementClass = 'surface';

//    ConversationSurface.prototype.deploy = function(target) {
//
//    };
//
//    ConversationSurface.prototype.setConversation = function(conversation) {
//
//    };

//    ConversationSurface.prototype.getSize = function() {
//        return this._size;
//    };

    module.exports = ConversationSurface;
});

