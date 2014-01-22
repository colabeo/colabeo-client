define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var Templates        = require('app/custom/Templates');

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
            direction: Util.Direction.Y,
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

//        $( 'body' ).on( "change", "#camera", function(event, ui) {
//            this.appSettings.save({camera : JSON.parse($("#camera").prop('checked'))});
//        }.bind(this));
//        $( 'body' ).on( "change", "#video", function(event, ui) {
//            this.appSettings.save({video : JSON.parse($("#video").prop('checked'))});
//        }.bind(this));
//        $( 'body' ).on( "change", "#audio", function(event, ui) {
//            this.appSettings.save({audio : JSON.parse($("#audio").prop('checked'))});
//        }.bind(this));
//        $( 'body' ).on( "change", "#blur", function(event, ui) {
//            this.appSettings.save({blur : JSON.parse($("#blur").prop('checked'))});
//            console.log('ddd');
//        }.bind(this));

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
                        window.location = "/connect/facebook";
                    break;
                case "google":
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

//        $('body').on('click', 'button.call-button', function(e){
//            this.eventOutput.emit('outgoingCall');
//        }.bind(this));
//
//        $('body').on('click', 'button.incoming-button', function(e){
//            this.eventOutput.emit('incomingCall');
//        }.bind(this));
//
//        $('body').on('click', 'button.connected-button', function(e){
//            this.eventOutput.emit('connectedCall');
//        }.bind(this));
//
//        $('body').on('click', 'button.conversations-button', function(e){
//            this.eventOutput.emit('conversations');
//        }.bind(this));
//        $('body').on('click', 'button.logout-button', function(e){
//            window.location = "/logout";
//        }.bind(this));

        this.appSettings.on({
            'change:camera': onCamera.bind(this),
            'change:audio': onAudio.bind(this),
            'change:video': onVideo.bind(this),
            'change:blur': onBlur.bind(this)
        });

        function onCamera() {
            console.log('camera change');
            $("#camera").prop('checked', this.appSettings.get('camera'));
            this.eventOutput.emit('setCamera');
        }

        function onAudio() {
            console.log('audio change');
            $("#audio").prop('checked', this.appSettings.get('audio'));
            this.eventOutput.emit('setAudio');
        }

        function onVideo() {
            console.log('video change');
            $("#video").prop('checked', this.appSettings.get('video'));
            this.eventOutput.emit('setVideo');
        }

        function onBlur() {
            console.log('blur change');
            $("#blur").prop('checked', this.appSettings.get('blur'));
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
        html += '<div class="info">ID: ' + this.appSettings.get('email') + "</div>";

        html += '<div class="desc"></div>';
        html += '<div class="info">Camera ';
        html += Templates.toggleSwitch("camera", this.appSettings.get('camera')) + '</div>';
        html += '<div class="info">Blur ';
        console.log(this.appSettings, this.appSettings.get('blur'));
        html += Templates.toggleSwitch("blur", this.appSettings.get('blur')) + '</div>';

        html += '<div class="desc">YOU CAN BE REACHED AT</div>';
        html += '<div class="info">Facebook ';
        html += Templates.toggleSwitch("facebook", this.appSettings.get('linkAccounts').facebook, this.appSettings.get('linkAccounts').facebook) + '</div>';
        html += '<div class="info">Google ';
        html += Templates.toggleSwitch("google", this.appSettings.get('linkAccounts').google, this.appSettings.get('linkAccounts').google) + '</div>';
        html += '<div class="info">Linkedin ';
        html += Templates.toggleSwitch("linkedin", this.appSettings.get('linkAccounts').linkedin, this.appSettings.get('linkAccounts').linkedin) + '</div>';
        html += '<div class="info">Github ';
        html += Templates.toggleSwitch("github", this.appSettings.get('linkAccounts').github, this.appSettings.get('linkAccounts').github) + '</div>';
        html += '<div class="info">Yammer ';
        html += Templates.toggleSwitch("yammer", this.appSettings.get('linkAccounts').yammer, this.appSettings.get('linkAccounts').yammer) + '</div>';

//        html += '<div class="desc">Testing</div>';
//        html += '<div class="info"><button class="call-button">Call</button><button class="incoming-button">Incoming</button><button class="connected-button">Connected</button><button class="conversations-button">Message</button></div>';
        html += '</div>';
        this.surface.setContent(html);
    };

    module.exports = SettingsSectionView;
});
