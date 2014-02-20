//Import app specific dependencies
var Conversation = require('conversation');
// Todo: hack, need this for packaging
//    require("lib/backboneLocalStorage");

module.exports = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage("colabeo-chat-colection"),
    model: Conversation,

    comparator: function(model){
        return 1*model.get('time');
    }

});