define(function(require, exports, module) {
    // Import app specific dependencies
    var Contact = require('app/models/Contact');

    module.exports = Backbone.Firebase.Collection.extend({

      model: Contact,

      favorites: function() {
        return this.filter(function(item){ return item.get('favorite'); });
      },

//      search: function(keyword) {
//        return this.filter(function(item){
//            return item.get('firstname').has(keyword) || item.get('lastname').has(keyword);
//        });
//      },

      comparator: function(model) {
          var l = model.get('lastname');
          var f = model.get('firstname');
          if (!/^[a-zA-Z]+$/.test(l[0]))
            l = "zzzz" + l;
          return l + " " + f;
      }
    });
});