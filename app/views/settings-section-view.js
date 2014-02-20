// Import core Famous dependencies
var View             = require('famous/view');
var Utility          = require('famous/utility');
var Surface          = require('famous/surface');
var Scrollview       = require('famous/views/scrollview');
var Utils            = require('famous/utilities/utils');

var Templates        = require('templates');

// Todo: hack, need this for packaging
//    var Notify           = require('notify');

function SettingsSectionView(options) {
    View.call(this);
    this.appSettings = options.model;

    // Set up navigation and title bar information
    this.title = '<div>Settings</div>';
    this.navigation = {
        caption: 'Settings',
        icon: '<i class="fa fa-gear"></i>'
    };
    this.scrollview = new Scrollview({
        direction: Utility.Direction.Y,
        margin: 10000
    });
    this.pipe(this.scrollview);
    this.surface = new Surface({
        properties: { 'padding': '20px' },
        size: [undefined, 700]
    });
    this.template();
    this.surface.pipe(this.eventOutput);
    this.scrollview.sequenceFrom([this.surface]);
    this._link(this.scrollview);

    function onPermissionGranted () {
        myNotification.show();
    }

    function onPermissionDenied () {
        if (this.appSettings.get('notification')) {
            alert('Unblock notification for beepe.me:443 in chrome://settings/contentExceptions#notifications');
            this.appSettings.set('notification', false);
            $('#notification').prop('checked',false);
        }
    }

    var myNotification = new Notify('Settings', {
        body: 'Notification is on.',
        tag: 'notificationSettings',
        permissionGranted: onPermissionGranted.bind(this),
        permissionDenied: onPermissionDenied.bind(this)
    });

    $(document).on('click', '#notification', function(){
        this.appSettings.save({notification : JSON.parse($("#notification").prop('checked'))});
        if (!this.appSettings.get('notification')) return;
        if (myNotification.needsPermission()) {
            myNotification.requestPermission();
        } else {
            myNotification.show();
        }
    }.bind(this));
    this.surface.on('click', function(e){
        //TODO: dont know why the surface is call twice: first time for the surface and the second time for the toggle button.
//            console.log(e);
        switch (e.target.id)
        {
            case "camera":
                this.appSettings.save({camera : JSON.parse($("#camera").prop('checked'))});
                break;
            case "video":
                this.appSettings.save({video : JSON.parse($("#video").prop('checked'))});
                break;
            case "audio":
                this.appSettings.save({audio : JSON.parse($("#audio").prop('checked'))});
                break;
            case "blur":
                this.appSettings.save({blur : JSON.parse($("#blur").prop('checked'))});
                break;
            case "facebook":
                if (JSON.parse($("#facebook").prop('checked')))
                    this.eventOutput.emit('onSocialLink', e.target.id);
                else
                    window.location = "/disconnect/facebook";
                break;
            case "google":
                if (JSON.parse($("#google").prop('checked')))
                    this.eventOutput.emit('onSocialLink', e.target.id);
                else
                    window.location = "/disconnect/google";
                break;
            case "linkedin":
            case "github":
            case "yammer":
                alert("Coming Soon.");
                break;
        }
    }.bind(this));

    this.surface.on('click', function(e){
        switch (e.target.className)
        {
//                case "call-button":
//                    this.eventOutput.emit('outgoingCall');
//                    break;
//                case "incoming-button":
//                    this.eventOutput.emit('imcomingCall');
//                    break;
            case "connected-button":
                this.eventOutput.emit('connectedCall');
                break;
            case "conversations-button":
                this.eventOutput.emit('conversations');
                break;
            case "logout-button":
                window.location = "/logout";
                break;
        }
    }.bind(this));

    this.appSettings.on({
        'change:camera': onCamera.bind(this),
        'change:audio': onAudio.bind(this),
        'change:video': onVideo.bind(this),
        'change:blur': onBlur.bind(this),
        'change': onChange.bind(this)
    });

    function onChange() {
        this.template();
    }

    function onCamera() {
        console.log('camera change');
//            $("#camera").prop('checked', this.appSettings.get('camera'));
        this.eventOutput.emit('setCamera');
    }

    function onAudio() {
        console.log('audio change');
//            $("#audio").prop('checked', this.appSettings.get('audio'));
        this.eventOutput.emit('setAudio');
    }

    function onVideo() {
        console.log('video change');
//            $("#video").prop('checked', this.appSettings.get('video'));
        this.eventOutput.emit('setVideo');
    }

    function onBlur() {
        console.log('blur change');
//            $("#blur").prop('checked', this.appSettings.get('blur'));
        this.eventOutput.emit('setBlur');
    }
}

SettingsSectionView.prototype = Object.create(View.prototype);
SettingsSectionView.prototype.constructor = SettingsSectionView;
SettingsSectionView.prototype.template = function() {
    var html = '<div class="box">';
    html += '<div class="info">' + this.appSettings.get('firstname') + " " + this.appSettings.get('lastname');
    html += '<button class="logout-button">Log Out</button></div>';

    html += '<div class="desc"></div>';
    html += '<div class="info">ID: ' + this.appSettings.get('username') + "</div>";

    html += '<div class="desc"></div>';
    html += '<div class="info">Camera ';
    html += Templates.toggleSwitch("camera", this.appSettings.get('camera')) + '</div>';
    html += '<div class="info">Blur ';
    html += Templates.toggleSwitch("blur", this.appSettings.get('blur')) + '</div>';
    if (!Utils.isMobile()) {
        html += '<div class="info">Notification ';
        html += Templates.toggleSwitch("notification", this.appSettings.get('notification')) + '</div>';
    }

    html += '<div class="desc">YOU CAN BE REACHED AT</div>';
    html += '<div class="info">Facebook ';
    html += Templates.toggleSwitch("facebook", this.appSettings.get('linkAccounts').facebook) + '</div>';
    html += '<div class="info">Google ';
    html += Templates.toggleSwitch("google", this.appSettings.get('linkAccounts').google) + '</div>';
    html += '<div class="info">Linkedin ';
    html += Templates.toggleSwitch("linkedin", this.appSettings.get('linkAccounts').linkedin) + '</div>';
    html += '<div class="info">Github ';
    html += Templates.toggleSwitch("github", this.appSettings.get('linkAccounts').github) + '</div>';
    html += '<div class="info">Yammer ';
    html += Templates.toggleSwitch("yammer", this.appSettings.get('linkAccounts').yammer) + '</div>';

//        html += '<div class="desc">Testing</div>';
//        html += '<div class="info"><button class="call-button">Call</button><button class="incoming-button">Incoming</button><button class="connected-button">Connected</button><button class="conversations-button">Message</button></div>';
    html += '</div>';
    this.surface.setContent(html);
};

module.exports = SettingsSectionView;
