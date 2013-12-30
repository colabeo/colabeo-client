define(function(require, exports, module) {
    // import famous dependencies
    var FamousEngine = require('famous/Engine');
    var LightBox = require('app/custom/LightBox')
    var Surface = require('famous/Surface');
    var Easing = require('famous-animation/Easing');
    var EventHandler = require('famous/EventHandler');

    // import models
    var Contact = require("app/models/Contact");
    var Call = require("app/models/Call");
    var CallCollection = require("app/models/CallCollection");
    var Settings          = require("app/models/Settings");
    var ContactCollection = require('app/models/ContactCollection');

    // import views
    var CameraView = require("app/views/CameraView");
    var AddContactView = require("app/views/AddContactView");
    var OutgoingCallView = require("app/views/OutgoingCallView");
    var IncomingCallView = require("app/views/IncomingCallView");
    var FavoritesSectionView = require('app/views/FavoritesSectionView');
    var RecentsSectionView = require('app/views/RecentsSectionView');
    var ContactsSectionView = require('app/views/ContactsSectionView');
    var SettingsSectionView = require('app/views/SettingsSectionView');

    // import app
    var config = require('app/config');
    var App = require('app/App');
    var MainController = require('app/MainController');

    // Set up event handlers
    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    // Set up models and collections
    this.appSettings = new Settings();
    this.appSettings.fetch();
    this.contactCollection = new ContactCollection([], {
        firebase: 'https://koalalab-berry.firebaseio.com/users/'+this.appSettings.get('cid')+'/contacts'
    });
    this.recentCalls = new CallCollection();
    this.curCall = new Call();

    // Set up views
    var favoritesSection = new FavoritesSectionView({
        collection: this.contactCollection
    });
    var recentsSection = new RecentsSectionView({
        collection: this.recentCalls
    });
    var contactsSection = new ContactsSectionView({
        collection: this.contactCollection
    });
    var settingsSection = new SettingsSectionView({
        model: this.appSettings
    });
    favoritesSection.pipe(this.eventOutput);
    recentsSection.pipe(this.eventOutput);
    contactsSection.pipe(this.eventOutput);
    settingsSection.pipe(this.eventOutput);

    // Config and initialize app
    config.sections = [
        favoritesSection,
        recentsSection,
        contactsSection,
        settingsSection
    ];

    // create the App from the template
    var mainController = new MainController();
    var myApp = new App(config);
    var myLightbox = new LightBox({overlap:true});
    var addContactView = new AddContactView({collection: this.contactCollection});
    var outgoingCallView = new OutgoingCallView({collection: this.recentCalls});
    var incomingCallView = new IncomingCallView({collection: this.recentCalls});
    outgoingCallView.pipe(this.eventOutput);
    incomingCallView.pipe(this.eventOutput);
//    var cameraView = new CameraView({});

    // create a display context and hook in the App
    var mainDisplay = FamousEngine.createContext();
//    mainDisplay.add(cameraView);
    mainDisplay.add(myLightbox);
    myLightbox.show(myApp);
    FamousEngine.pipe(myApp);

    // start on the main section
    myApp.select(myApp.options.sections[2].title);

    // events handling
    this.eventOutput.on('incomingCall', onIncomingCall);
    this.eventOutput.on('outgoingCall', onOutgoingCall);
    this.eventOutput.on('editContact', onEditContact);
    this.eventOutput.on('showApp', onShowApp);

    function onShowApp(eventData) {
        var callback;
        if (eventData instanceof Function) {
            callback = eventData;
        }
        $('.camera').addClass('blur');
        myLightbox.show(myApp, true, callback);
    }

    function onOutgoingCall(eventData) {
        var data;
        if (eventData instanceof Contact || eventData instanceof Call) {
            data = eventData.attributes;
        } else {
            data = this.curCall.attributes;
        }
        mainController.makeCall(data);
        var newCall = {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            pictureUrl: false,
            type: 'outgoing',
            time: Date.now()
        };
        this.curCall = this.recentCalls.create(newCall);
        outgoingCallView.startCalltone();
        $('.camera').removeClass('blur');
        myLightbox.show(outgoingCallView, true);
    }

    function onIncomingCall(eventData) {
        var data;
        if (eventData instanceof Contact || eventData instanceof Call) {
            data = eventData.attributes;
        } else {
            data = this.curCall.attributes;
        }
        var newCall = {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            pictureUrl: false,
            type: 'incoming',
            time: Date.now()
        };
        this.curCall = this.recentCalls.create(newCall);
        incomingCallView.startCalltone();
        $('.camera').removeClass('blur');
        myLightbox.show(incomingCallView, true);
    }

    function onEditContact(eventData) {
        if (eventData instanceof Contact) {
            var contactView = new AddContactView({model: eventData});
            myLightbox.show(contactView, true);
        } else {
            myLightbox.show(addContactView, true);
        }
    }

    // header buttons events
    $('body').on('click', '.header button.edit-button', function(e){
        $('body').toggleClass('editing');
    });

    $('body').on('click', '.header button.add-contact', function(e){
        this.eventOutput.emit('editContact');
    }.bind(this));

    $('body').on('click', '.header button.close-button', function(e){
        this.eventOutput.emit('showApp');
    }.bind(this));
});
