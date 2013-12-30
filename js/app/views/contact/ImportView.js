define(function(require, exports, module) {
    // Import core Famous dependencies
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');
    var Easing = require('famous-animation/Easing');
    var UpDownTransform = require('app/custom/UpDownTransform');

    function ImportView(options) {
        HeaderFooterLayout.call(this);

        var upDownTransform = new UpDownTransform;

        if(options.inTransform === undefined) this.options.inTransform = upDownTransform.options.inTransform;
        if(options.outTransform === undefined) this.options.outTransform = upDownTransform.options.outTransform;
        if(options.inTransition === undefined) this.options.inTransition = upDownTransform.options.inTransition;
        if(options.outTransition === undefined) this.options.outTransition = upDownTransform.options.outTransition;
        if(options.inOpacity === undefined) this.options.inOpacity = upDownTransform.options.inOpacity;
        if(options.outOpacity === undefined) this.options.outOpacity = upDownTransform.options.outOpacity;

        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.header = new Surface({
            classes: ['header'],
            size: [undefined, 50],
            properties: {
            },
            content: '<button class="left close-button cancel-import">Cancel</button><div>New Import</div><button class="right close-button done-import">Done</button>'
        });
        this.content = new Surface({
            classes: ['surface', 'add-import-view'],
            size: [undefined, undefined],
            properties: {
                backgroundColor: 'transparent'
            }
        });

        this.id.header.link(this.header);
        this.id.content.link(this.content);

        this.content.on('click', function() {

        }.bind(this));

        this.template();

        this.content.pipe(this.eventOutput);

    }

    ImportView.prototype = Object.create(HeaderFooterLayout.prototype);
    ImportView.prototype.constructor = ImportView;

    ImportView.prototype.template = function() {
        var html = '<form role="form">';
        html += '<div class="form-group small">';
        html += '<input type="text" class="form-control" id="input-facebook" placeholder="Facebook">';
        html += '</div>';
        html += '<div class="form-group small">';
        html += '<input type="text" class="form-control" id="input-gmail" placeholder="Gmail">';
        html += '</div>';
        html += '<div class="form-group small">';
        html += '<input type="email" class="form-control" id="input-wechat" placeholder="Wechat">';
        html += '</div>';
        html += '</form>';
        this.content.setContent(html);
    };

    module.exports = ImportView;
});