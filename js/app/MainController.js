define(function(require, exports, module) {
    var Utils       = require('famous-utils/Utils');
    var Settings    = require("app/models/Settings");
    var Call = require("app/models/Call");

    var defaultIceConfig = {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' }
    ]};

    function MainController(options) {
        this.eventInput = options.eventInput;
        this.eventOutput = options.eventOutput;
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
            console.log("loadConnected", data);
            if (!data || !data.length) return;
            var linkAccounts = {};
            data.map(function(item){
                console.log("loadConnected", item.provider);
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
    };

    MainController.prototype.setupSettingsListener = function() {
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
            }.bind(this),
            function(){
                alert("Please allow camera access for Colabeo");
            }.bind(this)
        );
    }

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
    }

    MainController.prototype.startRoom = function(caller, callee, roomId)  {
        if (roomId) roomId = "A"+roomId+"Z";
        // PeerJS object
        this.peer = new Peer(roomId, {
//            debug: 0,
            host: 'dashboard.colabeo.com',
            port: 9000,
            secure: true,
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
//            key: '7bihidp9q86c4n29',
//            debug: 0,
            host: 'dashboard.colabeo.com',
            port: 9000,
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
        if (this.localStream) {
            var videoTracks = this.localStream.getVideoTracks();
            for (var i = 0, l = videoTracks.length; i < l; i++) {
                videoTracks[i].enabled = video;
            }
            if (video)
                $('.local-video video').show();
            else
                $('.local-video video').hide();
        }
    };

    MainController.prototype.callByContact = function(data) {
        var query = [];
        // TODO: add more providers here in the future
        ['email', 'facebook', 'google', 'linkedin', 'github', 'yammer'].map(function(provider){
            if (data.get(provider)) {
                query.push({provider: provider, eid: data.get(provider).id || data.get(provider)});
            }
        });
        query = JSON.stringify(query);
//        console.log(query);
        multipleLookup(query, function(result) {
            if (result.length) {
                var callee = result[0];
                var cid;
                if (callee.user && callee.user.objectId) cid = callee.user.objectId;
                else if (callee.objectId) cid = callee.objectId;
                this.callById(cid, callee.provider);
            }
            else {
                console.log('The user you are calling is not an colabeo user, I don\'t know what to do.');
                console.log(result);
            }
        }.bind(this));
    };

    MainController.prototype.callByContactSingle = function(data) {
        console.log("callByContact", data);
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
                console.log(result);
            }
        }.bind(this));
    };

    MainController.prototype.callById = function(id, provider) {
        if (!id) return;
        console.log(id);
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

    MainController.prototype.onSyncButton = function() {
        sendMessage("event", {data: {action:"sync"}});
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
        console.log("onExtensionMessage: ", e.detail);
        if (e.detail.action == "updateUrl") {
            if (e.detail.source== "remote")
                this.remoteUrl = e.detail.url;
            else
                this.localUrl = e.detail.url;
            console.log("updateUrl: ", e.detail.source);
            updateSync.bind(this)();
        }
//        if (this.disableNow) return;
        if (e.detail.action == "incoming")	{
            console.log("incoming", e.detail);
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
        if (Utils.isMobile() && evt.data && evt.data.url && evt.data.action == "urlChange") {
            window.open(evt.data.url);
        }
        sendMessage("event", evt);
    }

    // underscore util functions
    _.mixin({
        capitalize: function(string) {
            return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
        }
    });

    module.exports = MainController;
});