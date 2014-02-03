define(function(require, exports, module) {
    // Import core Famous dependencies
    var View         = require('famous/View');
    var Surface      = require('app/custom/ConversationSurface');
    var EventHandler = require('famous/EventHandler');
    var Contact      = require('app/models/Contact');
    var Templates    = require('app/custom/Templates');
    var Mod              = require("famous/Modifier");

    // Import app specific dependencies

    function ConversationItemView(options){
        View.call(this);

        this.model = options.model;

        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.surface = new Surface({
            classes: ['conversation-item' ],
            size: [undefined, 50],
            properties:{
                backgroundColor: "rgba(193,19,280,0.5)",
                wordWrap: "break-word"
            }
        });

        this.template();

        this.surface.pipe(this.eventOutput);
        this.mod = new Mod({
            transform: undefined
        });
        this._link(this.mode);
        this._link(this.surface);
    }

    ConversationItemView.prototype = Object.create(View.prototype);
    ConversationItemView.prototype.constructor = ConversationItemView;

    ConversationItemView.prototype.template = function(){
        var content = this.model.get('content');
//        content = '<p class="triangle-border left">' + content + '</p>';
        this.surface.setContent(content);

    };

    module.exports = ConversationItemView;

});