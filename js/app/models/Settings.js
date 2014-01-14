define(function(require, exports, module) {
    // Generic Backbone Model
    module.exports = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage("colabeo-settings"),
        defaults: {
            cid: "sMu7eW1QYY",
            email: "jeff@colabeo.com",
            linkAccounts: {
                facebook: false,
                gmail: false,
                linkedin: false,
                github: false,
                yammer: false
            },
            firstname: "Jeff",
            lastname: "Lin",
            camera: true,
            video: true,
            audio: true,
            blur: undefined,
            userDatabaseUrl: "https://koalalab-berry.firebaseio.com/users/",
            callDatabaseUrl: "https://de-berry.firebaseio-demo.com/calls/"
        }
    });
});