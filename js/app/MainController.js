define(function(require, exports, module) {
    var Utils       = require('famous-utils/Utils');
    var Settings    = require("app/models/Settings");
    var Call = require("app/models/Call");

    function MainController(options) {
        this.eventInput = options.eventInput;
        this.eventOutput = options.eventOutput;
        this.appSettings = options.appSettings;
        this.collection = options.collection;
        this.cameraUrl = 'https://koalabearate.appspot.com/webcam';
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

        this.setupCallListener();
    }

    MainController.prototype.setupCallListener = function() {
        this.listenRef.on('child_added', onAdd.bind(this));
        this.listenRef.on('child_changed', onChanged.bind(this));
        this.listenRef.on('child_removed', onRemove.bind(this));
        this.eventOutput.on('incomingCallReject', onIncomingCallReject.bind(this));
        this.eventOutput.on('incomingCallAnswer', onIncomingCallAnswer.bind(this));
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
            this.eventOutput.emit('incomingCallEnd');
        }
        function onIncomingCallReject(call) {
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
    }

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
    }

    MainController.prototype.setCamera = function() {
        var on = JSON.parse(localStorage.getItem('colabeo-settings-video'));
        if (on)
            this.cameraOn();
        else
            this.cameraOff();
    }

    MainController.prototype.setBlur = function() {
        var on = JSON.parse(localStorage.getItem('colabeo-settings-blur'));
        if (on)
            $('.camera').removeClass('fakeblur');
        else
            $('.camera').addClass('fakeblur');
    }

    MainController.prototype.joinRoom = function(roomId) {
        if (roomId) {
            this.cameraUrl = 'https://koalabearate.appspot.com?r='+roomId;
        }
        else {
            this.cameraUrl = 'https://koalabearate.appspot.com/webcam';
        }
        this.cameraOn();
    }

    MainController.prototype.cameraOn = function() {
        $('.camera').attr('src', this.cameraUrl);
        $('.camera').show();
    }

    MainController.prototype.cameraOff = function() {
        $('.camera').attr('src', null);
        $('.camera').hide();
    }

    MainController.prototype.makeCall = function(data) {
        return;
        var externalId = data.email;
        userLookup(externalId, function(result) {
            var callee = result.callee;
            if (callee) {
                var curCallID = callee.objectId;
                call(callee);
            }
            else {
                console.log('The user you are calling is not an colabeo user, I don\'t know what to do.');
                console.log(result);
            }
        });
    }

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

    function call(callee) {
        console.log("call logic", callee);
    }

    module.exports = MainController;
});