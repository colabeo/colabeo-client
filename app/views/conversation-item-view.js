// import famous modules
var View         = require('famous/view');
var RenderNode = require('famous/render-node');
var EventHandler = require('famous/event-handler');
var Modifier     = require("famous/modifier");
var Transform          = require('famous/transform');

// Import app specific dependencies
var ConversationSurface = require('conversation-surface');

var Helpers = require('helpers');

function ConversationItemView(options){
    View.apply(this, arguments);

    this.model = options.model;

    // this.eventInput = new EventHandler();
    // EventHandler.setInputHandler(this, this.eventInput);
    // this.eventOutput = new EventHandler();
    // EventHandler.setOutputHandler(this, this.eventOutput);

    this.surface = new ConversationSurface({
        properties:{
            maxWidth: 300,
            zIndex: 2
        }
    });
    this.surfaceMod = new Modifier();
    this.renderNode = new RenderNode();
    this.renderNodeMod = new Modifier({
        transform: Transform.rotateZ(Math.PI)
    });

    this.template();
    this.event();
    this.surface.pipe(this._eventOutput);
    this.renderNode.add(this.surfaceMod).add(this.surface);
    this._node.add(this.renderNodeMod).add(this.renderNode);
}

ConversationItemView.prototype = Object.create(View.prototype);
ConversationItemView.prototype.constructor = ConversationItemView;

ConversationItemView.prototype.event = function(){
    this.surface.on('click',function(e){
        if ($(e.target).hasClass('conversation-item')) return;
        this._eventOutput.emit('toggleMsg');
    }.bind(this));
};

ConversationItemView.prototype.template = function(){
    var content = this.getLink(this.model.get('content'));
    if (this.model.isLocal()) {
        content = '<div class="conversation-item triangle-border right">' + content + '</div>';
    }
    else
        content = '<div class="conversation-item triangle-border left">' + content + '</div>';
    this.surface.setContent(content);
};

ConversationItemView.prototype.getLink = function(message){
    return Helpers.linkify(message);
};

ConversationItemView.prototype.getSize = function(node){
//    console.log(this._node, this._node.getSize, this.options.size)
//    debugger
    Object.getPrototypeOf (ConversationItemView.prototype).getSize.apply(this, arguments);
};
module.exports = ConversationItemView;
