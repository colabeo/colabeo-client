define(function(require, exports, module) {
    // Import app specific dependencies
    var Contact = require('app/models/Contact');

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

      comparator: function(model) {
          var l = model.get('lastname');
          var f = model.get('firstname');
          if (!/^[a-zA-Z]+$/.test(l[0]))
            l = "zzzz" + l;
          return (l + " " + f).toUpperCase();
      }
    });
});