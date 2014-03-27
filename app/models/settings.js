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
            twitter: false,
            linkedin: false,
            github: false,
            yammer: false
        },
        firstname: "John",
        lastname: "Colabeo",
        notification: false,
        camera: true,
        video: true,
        audio: true,
        blur: undefined,
        firebaseUrl: "https://colabeo.firebaseio.com/",
        pHost: "dashboard.colabeo.com",
        pPort: 9000,
        pSecure: true
    }
});
