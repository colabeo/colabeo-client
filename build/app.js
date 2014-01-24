//  CodePen Evaluation License
//  
//  Copyright (c) 2013 Famous Industries, Inc.
//  
//  Non-sublicensable permission is hereby granted, free of charge, to any person obtaining a 
//  copy of this software and associated documentation files directly from codepen.io (the 
//  "Software"), solely to internally make and internally use copies of the Software to test, 
//  explore, and evaluate the Software solely in such personâ€™s non-commercial, non-
//  production environments, provided that the above copyright notice and this permission 
//  notice shall be included in all copies or substantial portions of the Software. 
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
//  MERCHANTABILITY, FITNESS FOR A ARTICULAR PURPOSE AND 
//  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
//  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR 
//  IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
//  SOFTWARE.
//


Famous(function(require,exports,module){
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
    var CameraView = require("views/CameraView");
    var AddContactView = require("views/contact/AddContactView");
    var OutgoingCallView = require("views/call/OutgoingCallView");
    var IncomingCallView = require("views/call/IncomingCallView");
    var ConnectedCallView = require('views/call/ConnectedCallView');
    var ConversationView = require('views/Conversation/ConversationView');
    var FavoritesSectionView = require('views/favorite/FavoritesSectionView');
    var RecentsSectionView = require('views/recent/RecentsSectionView');
    var ContactsSectionView = require('views/contact/ContactsSectionView');
    var SettingsSectionView = require('views/setting/SettingsSectionView');

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
            username: data.username,
            linkAccounts: {
                facebook: (data.authData && data.authData.facebook)
            }
        });
        this.appSettings.me = data;
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
        myApp.pipe(this.eventOutput);
        outgoingCallView.pipe(this.eventOutput);
        incomingCallView.pipe(this.eventOutput);
        connectedCallView.pipe(this.eventOutput);
        conversationView.pipe(this.eventOutput);
        addContactView.pipe(this.eventOutput);
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
        this.eventOutput.on('loadRecent', onLoadRecent);
        this.eventOutput.on('clearRecent', onClearRecent);
        this.eventOutput.on('onEngineClick', onEngineClick);

        function onLoadRecent (e){
            recentsSection.setMissOnly(e.target.outerText);
            recentsSection.loadContacts();
        }

        function onClearRecent (e){
            recentsSection.clearContact();
            recentsSection.loadContacts();
        }

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
            var curView = myLightbox.nodes[0].get();
            if (curView instanceof OutgoingCallView || curView instanceof IncomingCallView || curView instanceof ConnectedCallView)
                return;
            incomingCallView.start(eventData);
            myLightbox.show(incomingCallView, true);
        }

        function onCallEnd(eventData) {

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
            if (eventData instanceof Contact) addContactView.setContact(eventData);
            else addContactView.setContact(undefined);
            addContactView.renderContact();
            myLightbox.show(addContactView, true);
        }

        function onChatOn() {
            console.log("chatOn");
            cameraView.turnOn();
        }

        function onChatOff() {
            console.log("chatOff");
            cameraView.turnOff();
        }

        FamousEngine.on('click', function(e){this.eventOutput.emit('onEngineClick', e)}.bind(this));

        function onEngineClick(e) {
            switch (e.target.id)
            {
                case 'clear-button':
                    this.eventOutput.emit('clearRecent');
                    break;
                case 'add-contact':
                    this.eventOutput.emit('editContact');
                    break;
                case 'edit-contact':
                    $('body').toggleClass('editing');
                    break;
                case 'recent-toggle':
                    this.eventOutput.emit('loadRecent', e);
                    break;
            }
        }

        // header buttons events
//        $('body').on('click', '.header button.edit-button', function(e){
//            $('body').toggleClass('editing');
//        });
//        $('body').on('click', '.header button.add-contact', function(e){
//            this.eventOutput.emit('editContact');
//        }.bind(this));
//
//        $('body').on('click', '.header button.close-button', function(e){
//            this.eventOutput.emit('showApp');
//        }.bind(this));

        // TODO: hack
        window.colabeo = this;
        window.myLightbox = myLightbox;
//        colabeo.recentsSection = recentsSection;
//        colabeo.contactsSection = contactsSection;
//        colabeo.favoritesSection = favoritesSection;
//        colabeo.cameraView = cameraView;
//        colabeo.conversationView = conversationView;
//        colabeo.addContactView = addContactView;
//        colabeo.app = myApp;
//        colabeo.engine = FamousEngine;
//        colabeo.social = {};
    }.bind(this));

});
