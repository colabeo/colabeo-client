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
    var Conversation = require('app/models/Conversation');
    var ConversationCollection = require('app/models/ConversationCollection');

    // import views
    var CameraView = require("app/views/CameraView");
    var AddContactView = require("app/views/contact/AddContactView");
    var OutgoingCallView = require("app/views/call/OutgoingCallView");
    var IncomingCallView = require("app/views/call/IncomingCallView");
    var ConnectedCallView = require('app/views/call/ConnectedCallView');
    var ConversationView = require('app/views/Conversation/ConversationView');
    var FavoritesSectionView = require('app/views/favorite/FavoritesSectionView');
    var RecentsSectionView = require('app/views/recent/RecentsSectionView');
    var ContactsSectionView = require('app/views/contact/ContactsSectionView');
    var SettingsSectionView = require('app/views/setting/SettingsSectionView');

    // import app
    var config = require('app/config');
    var App = require('app/App');
    var MainController = require('app/MainController');

    // Set up event handlers
    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    this.mainController = new MainController({
        eventInput: this.eventInput,
        eventOutput: this.eventOutput
    });
    this.mainController.loadUser(function(data) {
        // Set up models and collections
        this.appSettings = new Settings({
            id: data.objectId
        });
        this.appSettings.fetch();
        this.appSettings.save({
            cid: data.objectId,
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username
        });
        this.mainController.appSettings = this.appSettings;
        this.mainController.init();

        this.contactCollection = new ContactCollection([], {
            firebase: this.appSettings.get('userDatabaseUrl') + this.appSettings.get('cid')+'/contacts'
        });
        this.recentCalls = new CallCollection();
        this.conversations = new ConversationCollection();
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
        var myApp = new App(config);
        var myLightbox = new LightBox({overlap:true});
        var addContactView = new AddContactView({collection: this.contactCollection});
        var outgoingCallView = new OutgoingCallView({collection: this.recentCalls});
        var incomingCallView = new IncomingCallView({collection: this.recentCalls});
        var connectedCallView = new ConnectedCallView({collection: this.recentCalls});
        var conversationView = new ConversationView({collection: this.conversations});
        window.myLightbox = myLightbox;
        outgoingCallView.pipe(this.eventOutput);
        incomingCallView.pipe(this.eventOutput);
        connectedCallView.pipe(this.eventOutput);
        conversationView.pipe(this.eventOutput);
        var cameraView = new CameraView({});

        // create a display context and hook in the App
        var mainDisplay = FamousEngine.createContext();
        mainDisplay.add(cameraView);
        mainDisplay.add(myLightbox);
        myLightbox.show(myApp);
        FamousEngine.pipe(myApp);

        // start on the main section
        myApp.select(myApp.options.sections[2].title);
        // events handling
        this.eventOutput.on('callEnd', onCallEnd);
        this.eventOutput.on('incomingCall', onIncomingCall);
        this.eventOutput.on('outgoingCall', onOutgoingCall);
        this.eventOutput.on('connectedCall', onConnectedCall);
        this.eventOutput.on('outGoingCallAccept', onOutGoingCallAccept);
        this.eventOutput.on('conversations', onConversations);
        this.eventOutput.on('editContact', onEditContact);
        this.eventOutput.on('showApp', onShowApp);
        this.eventOutput.on('chatOn', onChatOn);
        this.eventOutput.on('chatOff', onChatOff);

        function onShowApp(eventData) {
            var callback;
            if (eventData instanceof Function) {
                callback = eventData;
            }
            $('.camera').addClass('blur');
            myLightbox.show(myApp, true, callback);
        }

        function onOutGoingCallAccept() {
            outgoingCallView.accept();
        }

        function onConnectedCall(eventData) {
            var callback;
            if (eventData instanceof Function) {
                callback = eventData;
            }
            connectedCallView.start(this.appSettings);
            myLightbox.show(connectedCallView, true, callback);
            this.eventOutput.emit('chatOn');
        }

        function onOutgoingCall(eventData) {
            outgoingCallView.start(eventData, this.appSettings);
            myLightbox.show(outgoingCallView, true);
        }

        function onIncomingCall(eventData) {
            incomingCallView.start(eventData);
            myLightbox.show(incomingCallView, true);
        }

        function onCallEnd() {
            this.eventOutput.emit('chatOff');
            // ligntbox shown object stop
            var curView = myLightbox.nodes[0].object;
            if (curView instanceof IncomingCallView || curView instanceof ConnectedCallView) {
                curView.stop();
            }
        }

        function onConversations() {
            conversationView.start();
            myLightbox.show(conversationView, true);
        }

        function onEditContact(eventData) {
            if (eventData instanceof Contact) {
                var contactView = new AddContactView({model: eventData});
                myLightbox.show(contactView, true);
            } else {
                myLightbox.show(addContactView, true);
            }
        }

        function onChatOn() {
            console.log("chatOn");
            cameraView.turnOn();
        }

        function onChatOff() {
            console.log("chatOff");
            cameraView.turnOff();
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

        // TODO: hack
        window.colabeo = this;
        colabeo.recentsSection = recentsSection;
        colabeo.contactsSection = contactsSection;
        colabeo.favoritesSection = favoritesSection;
        colabeo.cameraView = cameraView;
        colabeo.conversationView = conversationView;
        colabeo.addContactView = addContactView;
    }.bind(this));

});