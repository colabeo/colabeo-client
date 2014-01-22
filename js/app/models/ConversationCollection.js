define(function(require, exports, module) {
    //Import app specific dependencies
    var Conversation = require('app/models/Conversation');
    // Todo: hack, need this for packaging
//    require("lib/backboneLocalStorage");

    module.exports = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("colabeo-chat-colection"),
        model: Conversation,

        comparator: function(model){
            return -1*model.get('time');
        }

    })
});