define(function(require, exports, module) {
    var Utils       = require('famous-utils/Utils');
    var Settings    = require("app/models/Settings");
    var Call = require("app/models/Call");

    function MainController(options) {
        this.eventInput = options.eventInput;
        this.eventOutput = options.eventOutput;
    }

    MainController.prototype.init = function() {
        this.listenRef = new Firebase(this.appSettings.get('callDatabaseUrl') + this.appSettings.get('cid'));
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
        // TODO: hack
        window.appController = this;
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

            // TODO: hardcode call id for now; will use callByContact soon
//            var callId = "3FQb25z8Dz";
//            this.callById(callId);
        }
    };

    /* start of peer call */
    MainController.prototype.setupVideo = function() {
        // Compatibility shim
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        this.startRoom();
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
//            console.log("my ID:" + this.peer.id);
        }.bind(this));

        // Receiving a call
        this.peer.on('call', function(call){
            call.answer(this.localStream);
            this.initRemoteMedia(call);
        }.bind(this));
        this.peer.on('error', function(err){
//            alert(err.message);
        }.bind(this));
    };

    MainController.prototype.joinRoom = function(caller, callee, roomId) {
//        roomId = "A"+caller+callee+roomId+"Z";
        if (roomId) roomId = "A"+roomId+"Z";
//        console.log("my ID:" + this.peer.id);
        setTimeout(function(){
            // Initiate a call!
            var call = this.peer.call(roomId, this.localStream);
            this.initRemoteMedia(call);
        }.bind(this),1000);
    };

    MainController.prototype.exitRoom = function() {
        if (this.existingCall) {
            this.existingCall.close();
        }
        this.cleanRoom();
    };

    MainController.prototype.cleanRoom = function() {

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

    function userLookup(externalId, done) {
        $.ajax({
            url: '/finduser',
            type: 'get',
            dataType: 'json',
            data: { provider: "email", externalId : externalId },
            success: function(data) {
                console.log(JSON.stringify(data));
                done(data);
            },
            error: function() {
                console.log('error');
                // TODO: show default call for now
                done(new Call());
            }
        });
    }

    module.exports = MainController;
});