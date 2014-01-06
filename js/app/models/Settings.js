define(function(require, exports, module) {
    // Generic Backbone Model
    module.exports = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage("colabeo-settings"),
        defaults: {
//            cid: "tZNo7HwWLl",
            cid: "sMu7eW1QYY",
//            cid: "3FQb25z8Dz",
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
            video: JSON.parse(localStorage.getItem('colabeo-settings-video')),
            blur: JSON.parse(localStorage.getItem('colabeo-settings-blur')),
            userDatabaseUrl: "https://koalalab-berry.firebaseio.com/users/",
            callDatabaseUrl: "https://de-berry.firebaseio-demo.com/calls/"
        }
    });
});