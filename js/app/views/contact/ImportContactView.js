define(function(require, exports, module) {
    // Import core Famous dependencies
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');
    var Easing = require('famous-animation/Easing');
    var UpDownTransform = require('app/custom/UpDownTransform');
    var ContactsSectionView = require('app/views/contact/ContactsSectionView');

    function ImportContactView(options){
        HeaderFooterLayout.call(this);

        var upDownTransform = new UpDownTransform;

        if(options.inTransform === undefined) this.options.inTransform = upDownTransform.options.inTransform;
        if(options.outTransform === undefined) this.options.outTransform = upDownTransform.options.outTransform;
        if(options.inTransition === undefined) this.options.inTransition = upDownTransform.options.inTransition;
        if(options.outTransition === undefined) this.options.outTransition = upDownTransform.options.outTransition;
        if(options.inOpacity === undefined) this.options.inOpacity = upDownTransform.options.inOpacity;
        if(options.outOpacity === undefined) this.options.outOpacity = upDownTransform.options.outOpacity;

        this.model = options.model;
        this.collection = options.collection;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.header = new Surface({
            classes: ['header'],
            size: [undefined, 50],
            properties: {
            }
        });
        this.content = new ContactsSectionView({
            collection: this.collection
        });

        this.template();

        this.id.header.link(this.header);
        this.id.content.link(this.content);

        this.content.pipe(this.eventOutput);

        this.header.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass(".edit-button")) {
                this.submitForm();
            }
        }.bind(this));

    }
    ImportContactView.prototype = Object.create(HeaderFooterLayout.prototype);
    ImportContactView.prototype.constructor = ImportContactView;

    ImportContactView.prototype.template = function() {
        var html = '<button class="left back-button">Back</button><div>Google+ Contacts</div>'
        this.header.setContent(html);
    };

    module.exports = ImportContactView;
});