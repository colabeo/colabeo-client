define(function(require, exports, module) {
    // Import core Famous dependencies
    var View             = require('famous/View');
    var Util             = require('famous/Utility');
    var Surface          = require('famous/Surface');
    var Scrollview       = require('famous-views/Scrollview');
    var Templates        = require('app/custom/Templates');
    var MainController   = require('app/MainController');

    function SettingsSectionView(options) {
        View.call(this);
        this.appSettings = options.model;
        window.appSettings = this.appSettings;
        var mainController = new MainController();

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

        mainController.setCamera();

        $( 'body' ).on( "change", ".box #video", function(event, ui) {
            localStorage.setItem('colabeo-settings-video', JSON.stringify($("#video").attr('checked')));
            mainController.setCamera();
//            var action;
//            if ($("#video").attr('checked')) {
//                action = "onVideo";
//                $(".camera").show();
//            } else {
//                action = "offVideo";
//                $(".camera").hide();
//            }
//            if ($(".camera")[0])
//                $(".camera")[0].contentWindow.postMessage(JSON.stringify({type:"command",action:action}),"*");

        }.bind(this));

        $('body').on('click', 'button.call-button', function(e){
            this.eventOutput.emit('outgoingCall');
        }.bind(this));

        $('body').on('click', 'button.incoming-button', function(e){
            this.eventOutput.emit('incomingCall');
        }.bind(this));
    }

    SettingsSectionView.prototype = Object.create(View.prototype);
    SettingsSectionView.prototype.constructor = SettingsSectionView;
    SettingsSectionView.prototype.template = function() {
        var html = '<div class="box">';
        html += '<div class="info">' + this.appSettings.get('firstname') + " " + this.appSettings.get('lastname');
        html += '<button class="logout-button">Log Out</button></div>';

        html += '<div class="desc"></div>';
        html += '<div class="info">ID: ' + this.appSettings.get('accountId') + "</div>";

        html += '<div class="desc"></div>';
        html += '<div class="info">Camera ';
        html += Templates.toggleSwitch("video", this.appSettings.get('video')) + '</div>';

        html += '<div class="desc">YOU CAN BE REACHED AT</div>';
        html += '<div class="info">Facebook ';
        html += Templates.toggleSwitch("facebook", this.appSettings.get('linkAccounts').facebook) + '</div>';
        html += '<div class="info">Gmail ';
        html += Templates.toggleSwitch("gmail", this.appSettings.get('linkAccounts').gmail) + '</div>';
        html += '<div class="info">Linkedin ';
        html += Templates.toggleSwitch("linkedin", this.appSettings.get('linkAccounts').linkedin) + '</div>';
        html += '<div class="info">Github ';
        html += Templates.toggleSwitch("github", this.appSettings.get('linkAccounts').github) + '</div>';
        html += '<div class="info">Yammer ';
        html += Templates.toggleSwitch("yammer", this.appSettings.get('linkAccounts').yammer) + '</div>';

        html += '<div class="desc">Testing</div>';
        html += '<div class="info"><button class="call-button">Call</button><button class="incoming-button">Incoming</button></div>';
        html += '</div>';
//        html += Templates.toggleButton({
//            classes: ["test"],
//            checked: true,
//            onContent: '<i class="fa fa-microphone fa-lg"></i>',
//            offContent: '<i class="fa fa-microphone-slash fa-lg"></i>',
//            onBackgroundColor: '#c23635',
//            offBackgroundColor: '#dadbd9',
//            size: [160,60]
//        });
//        html += Templates.toggleButton({
//            classes: ["test"],
//            checked: false,
//            onContent: 'On',
//            offContent: 'Off'
//        });
        this.surface.setContent(html);
    };

    module.exports = SettingsSectionView;
});
