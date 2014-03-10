module.exports = Backbone.Model.extend({
    defaults: {
        firstname: "John",
        lastname: "Doe",
        email: "",
        pictureUrl: "",
        cid: "testcid"
    },
    isMissed: function () {
        return !this.get('success') && this.get('type')=='incoming';
    }
});