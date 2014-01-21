define(function(require, exports, module) {
    var Contact = require('app/models/Contact');

    module.exports = Backbone.Collection.extend({
        model: Contact,
        parse: function(response){
            var n = response.map(function(item){
                if (!item.firstname) {
                    var names = item.name.split(' ');
                    item.lastname = names.pop();
                    item.firstname = names.join(' ');
                }
                return item;
            });
            return n;
        }
    });
});