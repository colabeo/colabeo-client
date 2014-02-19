// Generic Backbone Model
module.exports = Backbone.Model.extend({
    toggleFavorite: function () {
        this.set({
            favorite: !this.get("favorite")
        });
    }
});
