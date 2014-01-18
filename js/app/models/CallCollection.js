define(function(require, exports, module) {
    // Import app specific dependencies
    var Call = require('app/models/Call');
    require("lib/backboneLocalStorage");

    module.exports = Backbone.Collection.extend({

//      url: '/user/calls',
//      localStorage: true,
      localStorage: new Backbone.LocalStorage("colabeo-call-collection"),
      model: Call,

      missed: function() {
        return this.filter(function(item){ return !item.get('success') && item.get('type')=='incoming'; });
      },

      all: function() {
        return this.filter(function(item){ return true; });
      },

      comparator: function(model) {
        return -1*model.get('time');
      }
    });
});