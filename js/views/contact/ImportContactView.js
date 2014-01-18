define(function(require, exports, module) {
    // Import core Famous dependencies
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');
    var Easing = require('famous-animation/Easing');
    var UpDownTransform = require('app/custom/UpDownTransform');
    var SocialView = require('views/contact/SocialView');

    function ImportContactView(options){
        HeaderFooterLayout.call(this);
        this.collection = options.collection;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.header = new Surface({
            content: '<button class="left back-button">Back</button><div>' + options.title + ' Contacts</div>',
            classes: ['header'],
            size: [undefined, 50],
            properties: {
            }
        });
        this.content = new SocialView({
            collection: this.collection
        });

        this.id.header.link(this.header);
        this.id.content.link(this.content);

        this.header.pipe(this.eventOutput);
        this.content.pipe(this.eventOutput);

        this.header.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass(".edit-button")) {
                this.submitForm();
            }
        }.bind(this));

        this.header.on('click', function(e){
            this.eventOutput.emit('goBack');
        }.bind(this));

        this.header.pipe(this.eventOutput);

    }
    ImportContactView.prototype = Object.create(HeaderFooterLayout.prototype);
    ImportContactView.prototype.constructor = ImportContactView;

    module.exports = ImportContactView;
});