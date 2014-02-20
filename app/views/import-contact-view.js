// Import core Famous dependencies
var HeaderFooterLayout = require('famous/views/header-footer-layout');
var Surface            = require('famous/surface');
var EventHandler       = require('famous/event-handler');

var UpDownTransform = require('up-down-transform');

var SocialView = require('social-view');

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
        if ($(e.target).hasClass('back-button'))
            this.eventOutput.emit('goBack');
    }.bind(this));

    this.header.pipe(this.eventOutput);

}
ImportContactView.prototype = Object.create(HeaderFooterLayout.prototype);
ImportContactView.prototype.constructor = ImportContactView;

module.exports = ImportContactView;
