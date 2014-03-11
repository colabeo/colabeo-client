var View = require('famous/view');
var Transform = require('famous/transform');
var Surface = require('famous/surface');
var EventHandler = require('famous/event-handler');

var Templates = require('templates');

var Call = require("models").Call;
var ConversationView = require('conversation-view');

var duration = 500;

function ConnectedCallView(options){

    View.call(this);
    this.collection = options.collection;

    this._eventOutput.on('menu-toggle-button', this.onMenuToggleButton);
    this._eventOutput.on('end-call', this.stop);
}

ConnectedCallView.prototype = Object.create(View.prototype);
ConnectedCallView.prototype.constructor = ConnectedCallView;

ConnectedCallView.prototype.start = function(appSetting, call) {

    this.conversationView = new ConversationView(appSetting, call);
    this.conversationView.pipe(this._eventOutput);
    this._eventInput.pipe(this.conversationView);

    this.model = this.collection.models[0] || new Call();
    this.appSettings = appSetting;
    $('.camera').removeClass('blur');
    this._add(this.conversationView);
};

ConnectedCallView.prototype.stop = function(evt) {
    if (evt.exit){
        this._eventOutput.emit('showApp');
    }
    this._eventOutput.emit('outgoingCallEnd', this.model);
    this._eventOutput.emit('incomingCallEnd', this.model);
    this.conversationView.stop();
};

module.exports = ConnectedCallView;
