// Import app specific dependencies
var Contact = require('contact');

module.exports = Backbone.Firebase.Collection.extend({

    model: Contact,

    favorites: function() {
        return this.filter(function(item){ return item.get('favorite'); });
    },

    searchContact: function(keyword) {
        return this.filter(function(item){
            if (item.get('firstname').toUpperCase().indexOf(keyword) != -1 || item.get('lastname').toUpperCase().indexOf(keyword) != -1)
            return item.get('firstname');
        });
    },

    searchContactByEmail: function(keyword) {
        return this.filter(function(item){
            if (item.get('email').toUpperCase().indexOf(keyword) != -1){
                return item.get('email');
            }
        })
    },

    lastnameInitial: function(keyword) {
        return this.filter(function(item){
            if (item.get('lastname')){
                return item.get('lastname').toUpperCase()[0] == keyword;
            } else if (item.get('firstname')){
                return item.get('firstname').toUpperCase()[0] == keyword;
            } else if (item.get('email')){
                return item.get('email').toUpperCase()[0] == keyword;
            }
        });
    },

    comparator: function(model) {
        var l = model.get('lastname');
        var f = model.get('firstname');
        if (!/^[a-zA-Z]+$/.test(l[0]))
            l = "zzzz" + l;
        return (l + " " + f).toUpperCase();
    }
});
