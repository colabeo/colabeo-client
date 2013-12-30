define(function(require, exports, module) {
    var Utils       = require('famous-utils/Utils');

    function MainController(options) {
        if (Utils.isMobile()) {
            $('body').addClass('mobile');
        }
    }

    MainController.prototype.setCamera = function() {
        var on = JSON.parse(localStorage.getItem('colabeo-settings-video'));
        if (on)
            this.cameraOn();
        else
            this.cameraOff();
    }

    MainController.prototype.cameraOn = function() {
        $('.camera').attr('src', 'https://koalabearate.appspot.com');
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