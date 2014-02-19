var Contact = require('Contact');

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
