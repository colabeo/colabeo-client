module.exports = Backbone.Model.extend({
    defaults: {
        firstname: "John",
        lastname: "Doe",
        email: "",
        phone: "",
        pictureUrl: ""
    },
    isMissed: function () {
        return !this.get('success') && this.get('type')=='incoming';
    }
});