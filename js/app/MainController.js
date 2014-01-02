define(function(require, exports, module) {
    var Utils       = require('famous-utils/Utils');
    var Settings    = require("app/models/Settings");
    var Call = require("app/models/Call");

    function MainController(options) {
        this.eventInput = options.eventInput;
        this.eventOutput = options.eventOutput;
        this.appSettings = options.appSettings;
        this.collection = options.collection;
        this.cameraUrl = this.appSettings.get('webcamUrl');
    }

    MainController.prototype.init = function() {
        this.listenRef = new Firebase(this.appSettings.get('callDatabaseUrl') + this.appSettings.get('cid'));
        if (!localStorage.getItem('colabeo-settings-video'))
            localStorage.setItem('colabeo-settings-video', 'true');
        if (Utils.isMobile()) {
            $('body').addClass('mobile');
        } else {
            if (!localStorage.getItem('colabeo-settings-blur'))
                localStorage.setItem('colabeo-settings-blur', 'true');
        }
        this.setupSettingsListener();
        this.setupCallListener();
    };

    MainController.prototype.setupSettingsListener = function() {
        this.eventOutput.on('setCamera', function() {
            this.setCamera();
        }.bind(this));
        this.eventOutput.on('setBlur', function() {
            this.setBlur();
        }.bind(this));
        this.setCamera();
        this.setBlur();
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
            var r = snapshot.name();
            var call = new Call({
                firstname: f,
                lastname: l,
                email: e,
                pictureUrl: p,
                roomId: r
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
        }
        function onIncomingCallAnswer(call) {
            if (call instanceof Call) {
                var roomId = call.get('roomId');
                if (roomId) {
                    this.listenRef.child(call.get('roomId')).update({
                        state : "answered"
                    });
                    this.joinRoom(roomId);
                }
            }
        }
        function onOutgoingCall(call) {
            // TODO: hardcode call id for now; will use callByContact soon
            var callId = "3FQb25z8Dz";
            this.callById(callId);
        }
    };

    MainController.prototype.initVideo = function() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        console.log("initVideo");
        var constraints = {audio: false, video: true};
        var video = document.getElementById("webcam");

        function successCallback(stream) {
            window.stream = stream; // stream available to console
            if (window.URL) {
                video.src = window.URL.createObjectURL(stream);
            } else {
                video.src = stream;
            }
            video.play();
        }

        function errorCallback(error){
            console.log("navigator.getUserMedia error: ", error);
        }

        navigator.getUserMedia(constraints, successCallback, errorCallback);
    };

    MainController.prototype.setCamera = function() {
        var on = JSON.parse(localStorage.getItem('colabeo-settings-video'));
        if (on)
            this.cameraOn();
        else
            this.cameraOff();
    };

    MainController.prototype.setBlur = function() {
        var on = JSON.parse(localStorage.getItem('colabeo-settings-blur'));
        if (on)
            $('.camera').removeClass('fakeblur');
        else
            $('.camera').addClass('fakeblur');
    };

    MainController.prototype.joinRoom = function(roomId) {
        if (roomId) {
            this.cameraUrl = this.appSettings.get('webchatUrl') + '?r='+roomId;
        }
        else {
            this.cameraUrl = this.appSettings.get('webcamUrl');
        }
        this.cameraOn();
    };

    MainController.prototype.cameraOn = function() {
        $('.camera').attr('src', this.cameraUrl);
        $('.camera').show();
    };

    MainController.prototype.cameraOff = function() {
        $('.camera').attr('src', null);
        $('.camera').hide();
    };

    MainController.prototype.callByContact = function(data) {
        return;
        var externalId = data.email;
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
        });
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

//        callRef.on('child_added', onAdd.bind(this));
        callRef.on('child_changed', onChanged.bind(this));
        callRef.on('child_removed', onRemove.bind(this));
        this.eventOutput.on('outgoingCallEnd', onOutgoingCallEnd.bind(this));
//        function onAdd(snapshot) {
//            var f = snapshot.val().firstname || snapshot.val().person.split(' ')[0];
//            var l = snapshot.val().lastname || snapshot.val().person.split(' ')[1];
//            var e = snapshot.val().email;
//            var p = snapshot.val().pictureUrl || false;
//            var r = snapshot.name();
//            var call = new Call({
//                firstname: f,
//                lastname: l,
//                email: e,
//                pictureUrl: p,
//                roomId: r
//            });
//            this.eventOutput.emit('outgoingCall', call);
//        }
        function onChanged(snapshot){
            var refCallState = snapshot.val()['state'];
            if (refCallState == "answered") {
                var roomId = snapshot.name();
                this.joinRoom(roomId);
                this.eventOutput.emit('outGoingCallAccept', function(){

                });
            }
        }
        function onRemove(snapshot){
            this.eventOutput.emit('callEnd');
        }
        function onOutgoingCallEnd(call) {
            callRef.remove();
        }
    };

    function userLookup(externalId, done) {
        $.ajax({
            url: '/user/lookup',
            type: 'post',
            dataType: 'json',
            data: { externalId : externalId },
            success: function(data) {
                console.log(JSON.stringify(data));
                done(data);
            },
            error: function() {
                console.log('error');
                var data = {"callee":{"lastname":"Lin","firstname":"Jay","username":"jeff@demobo.com","email":"jeff@demobo.com","emailVerified":true,"socialNetwork":{"__type":"Relation","className":"SocialNetworkAdaptor"},"profile":{"__type":"Relation","className":"Profile"},"contacts":{"__type":"Relation","className":"Contact"},"objectId":"3FQb25z8Dz","createdAt":"2013-12-12T19:53:24.792Z","updatedAt":"2013-12-15T09:44:21.854Z"}};
                done(data);
            }
        });
    }

    module.exports = MainController;
});