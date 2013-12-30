define(function(require, exports, module) {
    // Import app specific dependencies
    var Contact = require('app/models/Contact');

    module.exports = Backbone.Firebase.Collection.extend({

      model: Contact,

      favorites: function() {
        return this.filter(function(item){ return item.get('favorite'); });
      },

      comparator: function(model) {
        return model.get('lastname');
      }
    });
});