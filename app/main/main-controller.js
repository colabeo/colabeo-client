// import famous dependencies
var FamousEngine = require('famous/engine');
var Surface      = require('famous/surface');
var Easing       = require('famous/transitions/easing');
var EventHandler = require('famous/event-handler');
var Utils        = require('famous/utilities/utils');

// import custom views
var LightBox = require('light-box');

// import models
var Models            = require("models");
var Contact           = Models.Contact;
var Call              = Models.Call;
var CallCollection    = Models.CallCollection;
var Settings          = Models.Settings;
var ContactCollection = Models.ContactCollection;

// import views
var Views                = require("views");
var AlertView            = Views.AlertView;
var CameraView           = Views.CameraView;
var AddContactView       = Views.AddContactView;

var OutgoingCallView     = Views.OutgoingCallView;
var IncomingCallView     = Views.IncomingCallView;
var ConnectedCallView    = Views.ConnectedCallView;

var FavoritesSectionView = Views.FavoritesSectionView;
var RecentsSectionView   = Views.RecentsSectionView;
var ContactsSectionView  = Views.ContactsSectionView;
var SettingsSectionView  = Views.SettingsSectionView;

// import app
var config = require('config');
var App = require('app');

// Todo: hack, need this for packaging
//    var Notify = require('notify');

var defaultIceConfig = {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' }
]};

function MainController() {
    // Set up event handlers
    this.eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this.eventInput);
    this.eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this.eventOutput);

    this.loadUser(function(data) {
        if (data.chatroom) {
            this.chatroom = data.chatroom;
            data.objectId = 'unknown';
            data.firstname = data.chatroom.calleeFirstName;
            data.lastname = data.chatroom.calleeLastName;
            data.username = data.chatroom.calleeName;
        }
        // Set up models and collections
        this.appSettings = new Settings({
            id: data.objectId
        });
        this.appSettings.fetch();
        this.appSettings.save({
            cid: data.objectId,
            email: data.email || "",
            firstname: data.firstname || data.username || "",
            lastname: data.lastname || "",
            username: data.username || ""
        });

        this.appSettings.me = data;
        this.appSettings = this.appSettings;

        this.contactCollection = new ContactCollection([], {
            firebase: this.appSettings.get('userDatabaseUrl') + this.appSettings.get('cid')+'/contacts'
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
        this.eventInput.pipe(favoritesSection);
        recentsSection.pipe(this.eventOutput);
        this.eventInput.pipe(recentsSection);
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
        var alertLightbox = new LightBox({overlap:true});
        var addContactView = new AddContactView({collection: this.contactCollection});

        myApp.pipe(this.eventOutput);
        addContactView.pipe(this.eventOutput);
        var cameraView = new CameraView({});

        // create a display context and hook in the App
        var mainDisplay = FamousEngine.createContext();
        mainDisplay.add(cameraView);
        mainDisplay.add(myLightbox);
        mainDisplay.add(alertLightbox);
        myLightbox.show(myApp);
        FamousEngine.pipe(myApp);

        // start on the main section
        myApp.select(myApp.options.sections[2].title);

        var outgoingCallView = new OutgoingCallView({collection: this.recentCalls});
        var incomingCallView = new IncomingCallView({collection: this.recentCalls});
        var connectedCallView = new ConnectedCallView({collection: this.recentCalls});
        outgoingCallView.pipe(this.eventOutput);
        incomingCallView.pipe(this.eventOutput);
        connectedCallView.pipe(this.eventOutput);
        this.pipe(connectedCallView.eventInput);

        // events handling
        this.eventOutput.on('callEnd', onCallEnd);
        this.eventOutput.on('incomingCall', onIncomingCall);
        this.eventOutput.on('outgoingCall', onOutgoingCall);
        this.eventOutput.on('connectedCall', onConnectedCall);
        this.eventOutput.on('outGoingCallAccept', onOutGoingCallAccept);
        this.eventOutput.on('editContact', onEditContact);
        this.eventOutput.on('showApp', onShowApp);
        this.eventOutput.on('chatOn', onChatOn);
        this.eventOutput.on('chatOff', onChatOff);
        this.eventOutput.on('loadRecent', onLoadRecent);
        this.eventOutput.on('clearRecent', onClearRecent);
        this.eventOutput.on('deleteRecent', onDeleteRecent);
        this.eventOutput.on('deleteFavorite', onDeleteFavorite);
        this.eventOutput.on('onEngineClick', onEngineClick);
        this.eventOutput.on('closeAlert', onCloseAlert);
        this.eventOutput.on('editContactDone', onEditContactDone);
        this.eventOutput.on('addContactDone', onAddContactDone);
        this.eventOutput.on('triggerBackToNoneEditing',onTriggerBackToNoneEditing.bind(this));

        function onDeleteFavorite (model) {
            model.toggleFavorite();
        }

        function onDeleteRecent (model) {
            model.destroy();
        }

        function onEditContactDone (formContact){
//            this.contactCollection.add(formContact);
//            this.contactCollection.trigger('sync');
        }

        function onAddContactDone (formContact){
//                this.contactCollection.add(formContact);
//                this.contactCollection.trigger('sync');
        }

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
            if (!this.localStream){
                alert("Please allow camera/microphone access for Beepe");
            }
        }

        function onOutgoingCall(eventData) {
            outgoingCallView.start(eventData, this.appSettings);
            myLightbox.show(outgoingCallView, true);
        }

        function onIncomingCall(eventData) {
            if (this.appSettings.get('notification')) {
                var myNotification = new Notify('Incoming Call From', {
                    icon: 'famous-time/content/ios_icon_x144.png',
                    body: eventData.get('firstname') + ' ' + eventData.get('lastname'),
                    notifyShow: onShowNotification.bind(this),
                    notifyClose: onCloseNotification.bind(this),
                    notifyClick: onClickNotification.bind(this)
                });
                function onShowNotification() {
                }
                function onCloseNotification() {
                    parent.focus();
                }
                function onClickNotification() {
                    parent.focus();
                }
                myNotification.show();
            }

            var curView = myLightbox.nodes[0].get();
            if (curView instanceof IncomingCallView || curView instanceof ConnectedCallView)
                return;
            if (curView instanceof OutgoingCallView) {
                outgoingCallView.accept();
                this.eventOutput.emit('incomingCallAnswer', eventData);
            }
            else {
                incomingCallView.start(eventData);
                myLightbox.show(incomingCallView, true);
            }
        }

        function onCallEnd(eventData) {

            this.eventOutput.emit('chatOff');
            // ligntbox shown object stop
            var curView = myLightbox.nodes[0].object;
            if (curView instanceof IncomingCallView || curView instanceof ConnectedCallView) {
                curView.stop();
            }
            if (this.chatroom) {
                var url = '/login?r=' + this.chatroom.objectId;
                if (this.chatroom.callerName) {
                    url += '&fn=' + this.chatroom.callerName;
                }
                window.location = url;
            }
        }

        function onEditContact(eventData) {
            if (eventData instanceof Contact || eventData instanceof Call) addContactView.setContact(eventData);
            else addContactView.setContact(undefined);
            addContactView.renderContact();
            myLightbox.show(addContactView, true);
        }

        function onChatOn() {
            cameraView.turnOn();
        }

        function onChatOff() {
            cameraView.turnOff();
        }

        FamousEngine.on('click', onEngineClick.bind(this));
        function onEngineClick(e) {
            switch (e.target.id)
            {
                case 'clear-button':
                    this.eventOutput.emit('clearRecent');
                    break;
                case 'add-contact':
                    this.eventOutput.emit('editContact');
                    break;
                case 'recent-edit-contact':
                    $('body').toggleClass('editing');
                    this.eventInput.emit('toggleAllRecent');
                    break;
                case 'favorite-edit-contact':
                    $('body').toggleClass('editing');
                    this.eventInput.emit('toggleAllFavorite');
                    break;
                case 'contact-edit-contact':
                    $('body').toggleClass('editing');
                    break;
                case 'recent-toggle':
                    this.eventOutput.emit('loadRecent', e);
                    break;
                case 'close-alert':
                    this.eventOutput.emit('closeAlert');
            }
        }

        function onTriggerBackToNoneEditing(e) {
            this.eventInput.emit('backToNoneEditing');
        }

        function onAlert(word, okHidden){
            var alertView = new AlertView(word, okHidden);
            alertLightbox.show(alertView,true);
        }

        function onCloseAlert(){
            alertLightbox.hide();
        }

        window.alert = onAlert;
        if (this.chatroom) alert('Please allow Beepe to use your camera/microphone for phone calls.', true);

        // fastclick hack
        $('body').on('click', 'input', function(e) {
            $(e.target).focus();
        });

        this.init();


        window.colabeo = this;
//            window.myLightbox = myLightbox;
//        colabeo.recentsSection = recentsSection;
//        colabeo.contactsSection = contactsSection;
        colabeo.favoritesSection = favoritesSection;
//        colabeo.cameraView = cameraView;
//            colabeo.addContactView = addContactView;
//            colabeo.connectedCallView = connectedCallView;
//        colabeo.app = myApp;
//        colabeo.engine = FamousEngine;
//        colabeo.social = {};


    }.bind(this));
}

MainController.prototype.init = function() {
    this.iceServerConfig = defaultIceConfig;
    // get Xirsys ice config
    this.getXirsys();
    this.disableNow = false;
    var userId = this.appSettings.get('cid');
    var userFullName = this.appSettings.get('firstname') + " " + this.appSettings.get('lastname');
    this.listenRef = new Firebase(this.appSettings.get('callDatabaseUrl') + userId);
    // remove zombie call after disconnect
    this.listenRef.onDisconnect().remove();

    if (Utils.isMobile()) {
        $('body').addClass('mobile');
        if (this.appSettings.get('blur') == undefined)
            this.appSettings.set('blur', false);
    } else {
        if (this.appSettings.get('blur') == undefined)
            this.appSettings.set('blur', true);
    }
    this.setupCallListener();
    this.setupVideo();
    this.setupSettingsListener();

    this.loadConnected(function(data){
        if (!data || !Array.isArray(data)) return;
        var linkAccounts = {};
        data.map(function(item){
            linkAccounts[item.provider] = true;
        });
        this.appSettings.save({
            linkAccounts: linkAccounts
        });
    }.bind(this));

    // TODO: hack for android chrome DATAconnection
    util.supports.sctp = false;
    sendMessage("event", {data: {action:"syncID", id: userId, name: userFullName}});

//        window.addEventListener("message", onMessage.bind(this), false);
    if (window.colabeoBody)
        window.colabeoBody.addEventListener("FromExtension", onExtensionMessage.bind(this));
//        setTimeout(function(){this.eventOutput.emit('incomingChat')}.bind(this),3000);
};

MainController.prototype.setupSettingsListener = function() {
    this.eventOutput.on('outgoingChat', function(evt) {
        this.sendChat(evt.content, evt.type);
    }.bind(this));
    this.eventOutput.on('setCamera', function() {
        this.setCamera();
    }.bind(this));
    this.eventOutput.on('setVideo', function() {
        this.setVideo();
    }.bind(this));
    this.eventOutput.on('setBlur', function() {
        this.setBlur();
    }.bind(this));
    this.eventOutput.on('setAudio', function() {
        this.setAudio();
    }.bind(this));
    this.eventOutput.on('onSocialLink', function(source) {
        var url;
        if (source == 'facebook') {
            url = "/connect/facebook/email";
        }
        else if (source == 'google') {
            url = "/connect/google/profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.login%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me";
        }

        if (url) {
//                if (Utils.isMobile()) {
//                    window.location = url;
//                } else {
            $.oauthpopup({
                path:url,
                callback: function(e) {
                    setTimeout(function() {
                        $('div.import-contact#'+source + ':not(.done)').click().addClass('done');
                    }.bind(this), 300);
                }
            });
//                }
        }

    })
    $('body').on('change', '#audio, #video', function(e){
        this.appSettings.set($(e.target)[0].id, $(e.target).prop('checked'));
    }.bind(this));
};

MainController.prototype.setupCallListener = function() {
    this.listenRef.on('child_added', onAdd.bind(this));
    this.listenRef.on('child_changed', onChanged.bind(this));
    this.listenRef.on('child_removed', onRemove.bind(this));
    this.eventOutput.on('outgoingCallEnd', onOutgoingCallEnd.bind(this));
    this.eventOutput.on('incomingCallEnd', onIncomingCallEnd.bind(this));
    this.eventOutput.on('incomingCallAnswer', onIncomingCallAnswer.bind(this));
    this.eventOutput.on('outgoingCall', onOutgoingCall.bind(this));
    this.eventOutput.on('sync', onSync.bind(this));
    function onAdd(snapshot) {
        var f = snapshot.val().firstname || snapshot.val().person.split(' ')[0];
        var l = snapshot.val().lastname || snapshot.val().person.split(' ')[1];
        var e = snapshot.val().email;
        var p = snapshot.val().pictureUrl || false;
        var c = snapshot.val()['name'];
        var r = snapshot.name();
        var call = new Call({
            firstname: f,
            lastname: l,
            email: e,
            pictureUrl: p,
            roomId: r,
            caller: c
        });
        this.eventOutput.emit('incomingCall', call);
    }
    function onChanged(snapshot){

    }
    function onRemove(snapshot){
        this.eventOutput.emit('callEnd', snapshot);
        this.exitRoom();
    }
    function onOutgoingCallEnd(call) {
        if (this.callRef) this.callRef.remove();
        this.exitRoom();
    }
    function onIncomingCallEnd(call) {
        if (this.listenRef) this.listenRef.remove();
        this.exitRoom();
    }
    function onIncomingCallAnswer(call) {
        if (call instanceof Call) {
            var caller = call.get('caller');
            var callee = this.appSettings.get('cid');
            var roomId = call.get('roomId');
            if (roomId) {
                this.listenRef.child(roomId).update({
                    state : "answered"
                });
                this.joinRoom(caller, callee, roomId);
            }
        }
    }
    function onOutgoingCall(call) {
        this.callByContact(call);
    }
    function onSync() {
        this.onSyncButton();
    }
};

/* start of peer call */
MainController.prototype.setupVideo = function() {
    // Compatibility shim
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//        this.startRoom();
    this.setCamera();
};

MainController.prototype.initLocalMedia = function(options) {
    var options = _.extend({audio: true, video: true},options);
    // Get audio/video stream
    navigator.getUserMedia(options,
        function(stream){
            // Set your video displays
            $('.local-video video').prop('src', URL.createObjectURL(stream));
            this.localStream = stream;
            this.cleanRoom();
            this.setBlur();
            this.setAudio();
            if (options.video) $('.camera').removeClass('off');
            else $('.camera').addClass('off');

            this.eventOutput.emit('closeAlert');

            if (this.chatroom) {
                var call = new Call({
                    firstname: this.chatroom.callerFirstName || this.chatroom.callerName || "",
                    lastname: this.chatroom.callerLastName || "",
                    email: this.chatroom.callerAccountId || "",
                    cid: this.chatroom.caller || "",
                    provider: this.chatroom.calleeAccountProvider || ""
                });
                this.eventOutput.emit('outgoingCall', call);
            }
        }.bind(this),
        function(){
//                alert("Please allow camera access for Beepe");
            $('.camera').addClass('off');
        }.bind(this)
    );
};

MainController.prototype.initRemoteMedia = function(call) {
    // Hang up on an existing call if present
    if (this.existingCall) {
        this.existingCall.close();
    }

    // Wait for stream on the call, then set peer video display
    call.on('stream', function(stream){
        $('.remote-video video').prop('src', URL.createObjectURL(stream));
    }.bind(this));

    // UI stuff
    this.existingCall = call;
    call.on('close', this.cleanRoom.bind(this));
};

MainController.prototype.startRoom = function(caller, callee, roomId)  {
    if (roomId) roomId = "A"+roomId+"Z";
    // PeerJS object
    this.peer = new Peer(roomId, {
//            debug: 0,
        host: this.appSettings.get('pHost'),
        port: this.appSettings.get('pPort'),
        secure: this.appSettings.get('pSecure'),
        config: this.iceServerConfig
    });
    this.peer.on('open', function(){
    }.bind(this));

    // Receiving a call
    this.peer.on('call', function(call){
        call.answer(this.localStream);
        this.initRemoteMedia(call);
        sendMessage("event", {data: {action:"setProperty", roomId: roomId}});
    }.bind(this));

    // Receiving data
    this.peer.on('connection', function(conn){
        this.setupPeerConn(conn);
    }.bind(this));

    this.peer.on('error', function(err){
    }.bind(this));
};

MainController.prototype.joinRoom = function(caller, callee, roomId) {
    if (roomId) roomId = "A"+roomId+"Z";
    // PeerJS object
    this.peer = new Peer({
        host: this.appSettings.get('pHost'),
        port: this.appSettings.get('pPort'),
        secure: this.appSettings.get('pSecure'),
        config: this.iceServerConfig
    });
    setTimeout(function(){
        // Initiate a call!
        var call = this.peer.call(roomId, this.localStream);
        this.initRemoteMedia(call);
        sendMessage("event", {data: {action:"setProperty", roomId: roomId}});

        var conn = this.peer.connect(roomId, {
            label: 'chat',
            reliable: false
        });
        this.setupPeerConn(conn);
    }.bind(this),1000);
};

MainController.prototype.getXirsys = function(callback) {
    $.post("https://api.xirsys.com/getIceServers",
        {
            domain: "dashboard.colabeo.com",
            room: "default",
            application: "default",
            ident: "chapman",
            secret: "02f0e22c-764e-4939-8042-4ea028e9b8e0",
            secure: 0
        }, function(data,status){
            if (data) {
                var xirsys = JSON.parse(data);
                var iceServerXIR = xirsys.d;
                if (iceServerXIR) {
                    this.iceServerConfig = {
                        'iceServers': defaultIceConfig.iceServers.concat(iceServerXIR.iceServers)
                    };
                }
            }
            if (callback) callback(iceServer);
        }.bind(this)
    );
};

MainController.prototype.setupPeerConn = function(conn) {
    this.conn = conn;
    this.conn.on('open', function() {
        // Receive messages
        this.conn.on('data', onMessage.bind(this));
    }.bind(this));
}

MainController.prototype.exitRoom = function() {
    if (this.existingCall) {
        this.existingCall.close();
    }
    sendMessage("event", {data: {action:"setProperty", roomId: null}});
    sendMessage("event", {data: {action:"endCall"}});
    this.cleanRoom();
};

MainController.prototype.cleanRoom = function() {
    if (this.peer) this.peer.destroy();
    if (this.conn) this.conn.close();
};

/* end of peer call */

MainController.prototype.setCamera = function() {
    this.initLocalMedia({video: this.appSettings.get('camera'), audio: true});
};

MainController.prototype.setBlur = function() {
    var on = this.appSettings.get('blur');
    if (on)
        $('.camera').removeClass('fakeblur');
    else
        $('.camera').addClass('fakeblur');
};

MainController.prototype.setAudio = function() {
    var audio = this.appSettings.get('audio');
    if (this.localStream) {
        var audioTracks = this.localStream.getAudioTracks();
        for (var i = 0, l = audioTracks.length; i < l; i++) {
            audioTracks[i].enabled = audio;
        }
    }
};

MainController.prototype.setVideo = function() {
    var video = this.appSettings.get('video');
    var camera = this.appSettings.get('camera');
    if (this.localStream && camera) {
        var videoTracks = this.localStream.getVideoTracks();
        for (var i = 0, l = videoTracks.length; i < l; i++) {
            videoTracks[i].enabled = video;
        }
        if (video)
            $('.camera').removeClass('off');
        else
            $('.camera').addClass('off');
    }
};

MainController.prototype.callByContact = function(data) {
    if (!this.localStream){
        alert("Please allow camera/microphone access for Beepe");
        return;
    }
    if (data.get('cid')) {
        this.callById(data.get('cid'), data.get('provider'));
    } else {
        var query = [];
        // TODO: add more providers here in the future
        ['email', 'facebook', 'google', 'linkedin', 'github', 'yammer'].map(function(provider){
            if (data.get(provider)) {
                query.push({provider: provider, eid: data.get(provider).id || data.get(provider)});
            }
        });
        if (query.length) {
            multipleLookup(query, function(result) {
                if (result.length) {
                    var callee = _.last(result);
                    var cid;
                    if (callee.user && callee.user.objectId) cid = callee.user.objectId;
                    else if (callee.objectId) cid = callee.objectId;
                    this.callById(cid, callee.provider);
                }
                else {
                    this.setupChatroom(data, query);
//                        alert('The user you are calling is not a beepe user. Invite him to beepe.me.');
                }
            }.bind(this));
        } else {
            alert('This contact is empty.');
        }

    }
};

MainController.prototype.callByContactSingle = function(data) {
    var externalId = data.get('email');
    var provider = "email";
    data.get('facebook');
    userLookup(externalId, provider, function(result) {
        var callee = result.callee;
        if (callee) {
            var curCallID = callee.objectId;
            this.callById(curCallID);
        }
        else {
            console.log('The user you are calling is not an colabeo user, I don\'t know what to do.');
        }
    }.bind(this));
};

MainController.prototype.callById = function(id, provider) {
    if (!id) return;
    this.callRef = new Firebase(this.appSettings.get('callDatabaseUrl') + id);
    // remove zombie call after disconnect
    this.callRef.onDisconnect().remove();

    var callerFullName = this.appSettings.get('firstname') + " " + this.appSettings.get('lastname');
    var callObj = {
        name : this.appSettings.get('cid'),
        person : callerFullName,
        firstname : this.appSettings.get('firstname'),
        lastname : this.appSettings.get('lastname'),
        state : "calling"
    };
    if (this.appSettings.get('email')) callObj.email = this.appSettings.get('email');
    if (this.appSettings.get('username')) callObj.username = this.appSettings.get('username');
    this.callRef.once("value", function(snapshot) {
        if(snapshot.val() == null) {
            this.callRef.push(callObj);
            this.callRef.once('child_changed', onChanged.bind(this));
            this.callRef.once('child_removed', onRemove.bind(this));
        } else {
            delete this.callRef;
        }
    }.bind(this));

    function onChanged(snapshot){
        var refCallState = snapshot.val()['state'];
        if (refCallState == "answered") {
            var caller = this.appSettings.get('cid');
            var callee = id;
            var roomId = snapshot.name();
            this.startRoom(caller, callee, roomId);
            this.eventOutput.emit('outGoingCallAccept', function(){

            });
        }
    }
    function onRemove(snapshot){
        this.eventOutput.emit('callEnd', snapshot);
        this.exitRoom();
    }
};

MainController.prototype.loadUser = function(done) {
    if (location.pathname == '/call') {
        var params = parseQueryString();
        if (params['r']) {
            var room = params['r'][0];
            $.ajax({
                url: '/chatroom?id='+room,
                type: 'get',
                dataType: 'json',
                success: function(data) {
                    if (done) done({chatroom: data});
                },
                error: function() {
                    console.log('error');
                    // TODO: temp dev user
                    if (done) done({});
                }
            });
        }
    } else {
        $.ajax({
            url: '/me',
            type: 'get',
            dataType: 'json',
            success: function(data) {
                if (done) done(data);
            },
            error: function() {
                console.log('error');
                // TODO: temp dev user
                if (done) done({});
            }
        });
    }
    function parseQueryString() {
        var query = (window.location.search || '?').substr(1),
            map   = {};
        query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
            (map[key] = map[key] || []).push(value);
        });
        return map;
    }
};

MainController.prototype.loadConnected = function(done) {
    $.ajax({
        url: '/connected',
        type: 'get',
        dataType: 'json',
        success: function(data) {
            if (done) done(data);
        },
        error: function() {
            console.log('error');
            // TODO: temp dev user
            if (done) done({});
        }
    });
};

MainController.prototype.loadContact = function(source, done) {
    $.ajax({
        url: '/contact/' + source,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            if (done) done(data);
        },
        error: function() {
            console.log('error');
            // TODO: temp dev user
            if (done) done({});
        }
    });
};

MainController.prototype.setupChatroom = function(contact, eids) {
    for (var i = 0; i < eids.length; i++) {
        var c = eids[i];
        if (c) {
            callee = {
                provider : c.provider ,
                eid : c.eid ,
                name: contact.get('firstname') + " " + contact.get('lastname'),
                firstname: contact.get('firstname'),
                lastname: contact.get('lastname'),
                email: contact.get('email')
            };
            $.ajax({
                url: '/chatroom',
                type: 'post',
                data: {
                    callee : JSON.stringify(callee),
                    // 0: do nothing 1: chatroom invite 2: beepe invite 3: debug
                    e: 3
                }
            });
        }
    }
};

MainController.prototype.onSyncButton = function() {
    sendMessage("event", {data: {action:"sync"}});
};

MainController.prototype.sendChat = function(message, type) {
    if (!type) type = "text";
    if (this.conn) this.conn.send({content:message, type: type, action:"chat"});
};

function userLookup(externalId, provider, done) {
    $.ajax({
        url: '/finduser',
        type: 'get',
        dataType: 'json',
        data: { provider: provider, externalId : externalId },
        success: function(data) {
            done(data);
        },
        error: function() {
            console.log('error');
            // TODO: show default call for now
            done(new Call());
        }
    });
}
function multipleLookup(query, done) {
    query = JSON.stringify(query);
    $.ajax({
        url: '/findusers',
        type: 'get',
        dataType: 'json',
        data: { query: query },
        success: function(data) {
            done(data);
        },
        error: function() {
            console.log('error');
            // TODO: show default call for now
            done(new Call());
        }
    });
}
function sendMessage(type, data) {
    if (Utils.isMobile()) return;
    if (!window.colabeoBody)
        return;
    var evt = new CustomEvent("FromKoala", {
        detail : {
            type : type,
            data : data
        }
    });
    window.colabeoBody.dispatchEvent(evt);
}
function updateSync() {
    if (this.remoteUrl==this.localUrl)
        $('.sync-button').removeClass('syncing').addClass('synced');
    else
        $('.sync-button').removeClass('synced syncing');
}
function onExtensionMessage(e) {
    if (e.detail.action == "updateUrl") {
        if (e.detail.source== "remote")
            this.remoteUrl = e.detail.url;
        else
            this.localUrl = e.detail.url;
        updateSync.bind(this)();
    }
    if (this.disableNow) return;
    if (e.detail.action == "incoming")	{
        var call = new Call({
            firstname: e.detail.firstname,
            lastname: e.detail.lastname,
            email: e.detail.email,
            pictureUrl: null,
            roomId: e.detail.room
        });
        this.eventOutput.emit('incomingCall', call);
    }
    else if (this.conn) {
        // peer message forward
        this.conn.send(e.detail);
    }
}
function onMessage(e) {
    this.disableNow = true;
    setTimeout(function(){
        this.disableNow = false;
    }.bind(this),1000);
    var evt = e;
    if (evt.action=="chat") {
        this.eventOutput.emit('incomingChat', evt);
    } else {
        if (Utils.isMobile() && evt.data && evt.data.url && evt.data.action == "urlChange") {
            window.open(evt.data.url);
        }
        sendMessage("event", evt);
    }
}

module.exports = MainController;

// underscore util functions
_.mixin({
    capitalize: function(string) {
        return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    }
});

Array.prototype.sum = function () {
    var total = 0;
    var i = this.length;

    while (i--) {
        total += this[i];
    }

    return total;
}