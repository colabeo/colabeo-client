define(function(require, exports, module) {
    module.exports = Backbone.Model.extend({
        defaults: {
            firstname: "John",
            lastname: "Doe",
            email: "",
            pictureUrl: ""
        }
    });
});