define(function(require, exports, module) {
    require("lib/backboneLocalStorage");

    // Generic Backbone Model
    module.exports = Backbone.Model.extend({
        // if url changed, need new name for the localstorage
        localStorage: new Backbone.LocalStorage("colabeo-settings-1"),
        defaults: {
            cid: "default",
            email: "default@colabeo.com",
            linkAccounts: {
                facebook: false,
                google: false,
                linkedin: false,
                github: false,
                yammer: false
            },
            firstname: "John",
            lastname: "Colabeo",
            camera: true,
            video: true,
            audio: true,
            blur: undefined,
            userDatabaseUrl: "https://colabeo.firebaseio.com/users/",
            callDatabaseUrl: "https://colabeo.firebaseio.com/calls/"
        }
    });
});