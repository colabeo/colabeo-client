define(function(require, exports, module) {
    var Utils       = require('famous-utils/Utils');
    var Settings    = require("app/models/Settings");
    var Call = require("app/models/Call");

    function MainController(options) {
        this.eventInput = options.eventInput;
        this.eventOutput = options.eventOutput;
    }

    MainController.prototype.init = function() {
        this.disableNow = false;
        var userId = this.appSettings.get('cid');
        var userFullName = this.appSettings.get('firstname') + " " + this.appSettings.get('lastname');
        this.listenRef = new Firebase(this.appSettings.get('callDatabaseUrl') + userId);
        if (!localStorage.getItem('colabeo-settings-video'))
            localStorage.setItem('colabeo-settings-video', 'true');
        if (!localStorage.getItem('colabeo-settings-audio'))
            localStorage.setItem('colabeo-settings-audio', 'true');
        if (Utils.isMobile()) {
            $('body').addClass('mobile');
        } else {
            if (!localStorage.getItem('colabeo-settings-blur'))
                localStorage.setItem('colabeo-settings-blur', 'true');
        }
        this.setupCallListener();
        this.setupVideo();
        this.setupSettingsListener();

        // TODO: hack for chrome DATAconnection
//        util.supports.sctp = false;
        sendMessage("event", {data: {action:"syncID", id: userId, name: userFullName}});

//        window.addEventListener("message", onMessage.bind(this), false);
        if (window.demoboBody)
            window.demoboBody.addEventListener("FromExtension", onExtensionMessage.bind(this));
    };

    MainController.prototype.setupSettingsListener = function() {
        this.eventOutput.on('setCamera', function() {
            this.setCamera();
        }.bind(this));
        this.eventOutput.on('setBlur', function() {
            this.setBlur();
        }.bind(this));
        this.eventOutput.on('setAudio', function() {
            this.setAudio();
        }.bind(this));
    };

    MainController.prototype.setupCallListener = function() {
        this.listenRef.on('child_added', onAdd.bind(this));
        this.listenRef.on('child_changed', onChanged.bind(this));
        this.listenRef.on('child_removed', onRemove.bind(this));
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
            this.eventOutput.emit('callEnd');
        }
        function onIncomingCallEnd(call) {
            this.listenRef.remove();
            this.exitRoom();
        }
        function onIncomingCallAnswer(call) {
            if (call instanceof Call) {
                var caller = call.get('caller');
                var callee = this.appSettings.get('cid');
                var roomId = call.get('roomId');
                if (roomId) {
                    this.listenRef.child(call.get('roomId')).update({
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
//        console.log("Their ID:" + call.peer);
        call.on('close', this.cleanRoom.bind(this));
    }

    MainController.prototype.startRoom = function(caller, callee, roomId)  {
//        roomId = "A"+caller+callee+roomId+"Z";
        if (roomId) roomId = "A"+roomId+"Z";
        // PeerJS object
        this.peer = new Peer(roomId, { key: '7bihidp9q86c4n29', debug: 0, config: {'iceServers': [
            { url: 'stun:stun.l.google.com:19302' }
        ]}});
        this.peer.on('open', function(){
            console.log("my ID:" + this.peer.id);
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
//            alert(err.message);
        }.bind(this));
    };

    MainController.prototype.joinRoom = function(caller, callee, roomId) {
//        roomId = "A"+caller+callee+roomId+"Z";
        if (roomId) roomId = "A"+roomId+"Z";
        // PeerJS object
        this.peer = new Peer({ key: '7bihidp9q86c4n29', debug: 0, config: {'iceServers': [
            { url: 'stun:stun.l.google.com:19302' }
        ]}});
//        console.log("my ID:" + this.peer.id);
        setTimeout(function(){
            // Initiate a call!
            var call = this.peer.call(roomId, this.localStream);
            this.initRemoteMedia(call);
            sendMessage("event", {data: {action:"setProperty", roomId: roomId}});

            var conn = this.peer.connect(roomId, {
                label: 'chat',
//                serialization: 'none',
                reliable: false
            });
            this.setupPeerConn(conn);

        }.bind(this),1000);
    };

    MainController.prototype.setupPeerConn = function(conn) {
        console.log("setup peer connection",conn);
        this.conn = conn;
        this.conn.on('open', function() {
            console.log("on connection open");
            // Receive messages
            this.conn.on('data', onMessage.bind(this));
        }.bind(this));
    }

    MainController.prototype.exitRoom = function() {
        console.log("exitRoom");
        if (this.existingCall) {
            this.existingCall.close();
        }
        sendMessage("event", {data: {action:"setProperty", roomId: null}});
        sendMessage("event", {data: {action:"endCall"}});
        this.cleanRoom();
    };

    MainController.prototype.cleanRoom = function() {
        if (this.peer) this.peer.destroy();
        delete this.peer;
        delete this.conn;
    };

    /* end of peer call */

    MainController.prototype.setCamera = function() {
        var video = JSON.parse(localStorage.getItem('colabeo-settings-video'));
        this.initLocalMedia({video: video, audio: true});
    };

    MainController.prototype.setBlur = function() {
        var on = JSON.parse(localStorage.getItem('colabeo-settings-blur'));
        if (on)
            $('.camera').removeClass('fakeblur');
        else
            $('.camera').addClass('fakeblur');
    };

    MainController.prototype.setAudio = function() {
        var audio = JSON.parse(localStorage.getItem('colabeo-settings-audio'));
        if (this.localStream) {
            var audioTracks = this.localStream.getAudioTracks();
            for (var i = 0, l = audioTracks.length; i < l; i++) {
                audioTracks[i].enabled = audio;
            }
        }
    };

    MainController.prototype.setVideo = function() {
        var video = JSON.parse(localStorage.getItem('colabeo-settings-video'));
        if (this.localStream) {
            var videoTracks = this.localStream.getVideoTracks();
            for (var i = 0, l = videoTracks.length; i < l; i++) {
                videoTracks[i].enabled = video;
            }
        }
    };

    MainController.prototype.callByContact = function(data) {
        var externalId = data.get('email');
        userLookup(externalId, function(result) {
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

    MainController.prototype.callById = function(id) {
        if (!id) return;
        callRef = new Firebase(this.appSettings.get('callDatabaseUrl') + id);
        var callerFullName = this.appSettings.get('firstname') + " " + this.appSettings.get('lastname');
        callRef.push({
            name : this.appSettings.get('cid'),
            person : callerFullName,
            firstname : this.appSettings.get('firstname'),
            lastname : this.appSettings.get('lastname'),
            email : this.appSettings.get('email'),
            state : "calling"
        });

        callRef.on('child_changed', onChanged.bind(this));
        callRef.on('child_removed', onRemove.bind(this));
        this.eventOutput.on('outgoingCallEnd', onOutgoingCallEnd.bind(this));
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
            this.eventOutput.emit('callEnd');
        }
        function onOutgoingCallEnd(call) {
            callRef.remove();
            this.exitRoom();
            this.eventOutput.unbind('outgoingCallEnd', onOutgoingCallEnd.bind(this));
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

    MainController.prototype.onSyncButton = function() {
        sendMessage("event", {data: {action:"sync"}});
    };

    function userLookup(externalId, done) {
        $.ajax({
            url: '/finduser',
            type: 'get',
            dataType: 'json',
            data: { provider: "email", externalId : externalId },
            success: function(data) {
//                console.log(JSON.stringify(data));
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
        if (!window.demoboBody)
            return;
        var evt = new CustomEvent("FromKoala", {
            detail : {
                type : type,
                data : data
            }
        });
        window.demoboBody.dispatchEvent(evt);
    }
    function onExtensionMessage(e) {
        if (this.disableNow) return;
        console.log("onExtensionMessage: ", e.detail);
        if (e.detail.type == "urlUpdate") {
            this.curUrl = e.detail.data.url;
        }
        else if (e.detail.action == "incoming")	{
            console.log("incoming", e.detail);
            var call = new Call({
                firstname: e.detail.firstname,
                lastname: e.detail.lastname,
                email: e.detail.email,
                pictureUrl: null,
                roomId: e.detail.room,
                caller: e.detail.caller
            });
            this.eventOutput.emit('incomingCall', call);
        }
        else if (this.conn) {
            // peer message forward
            this.conn.send(e.detail);
        }
    }
    function onMessage(e) {
        console.log('onMessage: 1 Peer Received', e);
        this.disableNow = true;
        setTimeout(function(){
            this.disableNow = false;
        }.bind(this),1000);

        var evt = e;
        if (Utils.isMobile() && evt.data.url && evt.data.action == "urlChange") {
            window.open(evt.data.url);
        }
        sendMessage("event", evt);
    }

    module.exports = MainController;
});