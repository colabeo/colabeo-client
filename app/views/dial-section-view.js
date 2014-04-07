var View = require('famous/view');
var GridLayout = require("famous/views/grid-layout");
var HeaderFooterLayout = require('famous/views/header-footer-layout');
var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var LightBox     = require('famous/views/light-box');
var RenderNode = require('famous/render-node');

var Models            = require("models");
var Call              = Models.Call;

var DialItemView = require('dial-item-view');
var Templates = require('templates');

var HeaderSize = 75;
var ButtonSize = 75;

function DialSection(options) {

    View.call(this);

    this.title = Templates.dialHeader();
    this.navigation = {
        caption: 'Dial',
        icon: '<i class="fa fa-th"></i>'
    };
    this.collection = options.collection;

    _initDialOutputView.call(this);
    _initNumbers.call(this);
    _initLayout.call(this);
    _initEvent.call(this);

}

DialSection.prototype = Object.create(View.prototype);
DialSection.prototype.constructor = DialSection;

function _initDialOutputView(){

    this.dialOutputView = new View();
    this.dialOutputViewMod = new Modifier({
        transform: Transform.translate(0,-50,3)
    });

    this.outputSurface = new Surface({
        size:[undefined, HeaderSize],
        classes:['dial-output-view-surface'],
        content:Templates.dialOutputView(),
        properties:{
            zIndex: "3",
            fontSize: "50px",
            backgroundColor:"transparent"
        }
    });

    this.dialOutputViewButtons = new Surface({
        content: Templates.dialOutputViewButton(),
        size:[undefined,40],
        properties:{
            zIndex:"4"
        }
    });

    this.dialOutputViewButtonsLightBox = new LightBox({
        inTransform: Transform.translate(0,35,0),
        inTransition: {duration: 200},
        outTransform: Transform.translate(0,35,0),
        outTransition: {duration: 300},
        showTransform: Transform.translate(0,35,0),
        showOrigin: [0.9,0.5]
    });

    this.matchContact = new Surface({
        size:[undefined,20],
        properties:{
        }
    });
    this.matchContactLightBox = new LightBox({
        inTransform: Transform.translate(0,HeaderSize-15,0),
        inTransition: {duration: 200},
        outTransform: Transform.translate(0,HeaderSize-15,0),
        outTransition: {duration: 300},
        showTransform: Transform.translate(0,HeaderSize-15,0)
    });

    this.dialOutputView._add(this.outputSurface);
    this.dialOutputView._add(this.dialOutputViewButtonsLightBox);
    this.dialOutputView._add(this.matchContactLightBox);
}

function _initNumbers(){
    this.inputNumbers=[];
    this.contentLayout = new GridLayout({
        dimensions: [3, 5]
    });
    this.numbers=['1','2','3','4','5','6','7','8','9','*','0','#'];
    this.ABC = ['ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'];
    this.numbersSurfaces = [];
    for (var i = 0; i < this.numbers.length; i++){

        if (this.numbers[i] == ' ') {this.numbersSurfaces.push(''); continue;}
        var num = new DialItemView({
            name: this.numbers[i],
            buttonSize: ButtonSize,
            abc : this.ABC[i-1],
            tone: ['content/audio/numberTone', this.numbers[i]].join(''),
            float: 0.75 - (i % 3) / 4
        });
        num.pipe(this._eventOutput);
        this.numbersSurfaces.push(num);
    }

    this.numbersSurfaces.push('');

    this.callButton = new View();
    this.callSurface = new Surface({
        size:[ButtonSize, ButtonSize],
        content: Templates.phoneButton('dial-call')
    });
    this.callSurface.pipe(this._eventOutput);
    this.callSurfaceMod = new Modifier({
        origin:[0.5,0.5]
    });
    this.callButton._add(this.callSurfaceMod).add(this.callSurface);
    this.numbersSurfaces.push(this.callButton);

    this.numbersSurfaces.push('');

    this.contentLayout.sequenceFrom(this.numbersSurfaces);
}

function _initLayout(){
    this.layout = new HeaderFooterLayout({
        headerSize: HeaderSize - 50,
        footerSize: 0
    });
    this.layout.id.header.add(this.dialOutputViewMod).add(this.dialOutputView);
    this.layout.id.content.add(this.contentLayout);
    this._add(this.layout);
}

function _initEvent(){
    this._eventOutput.on('pressNumber', this.onPressNumber.bind(this));
    this.callSurface.on('click', this.onSendCall.bind(this));

    this.timeout;
    this.startDelete = 800;

    this.repeat = function () {
        this.onDeleteDial();
        this.timeout = setTimeout(this.repeat, this.startDelete);
        if (this.inputNumbers.length == 0) clearTimeout(this.timeout);
        this.startDelete = 50;
    }.bind(this);

    this.dialOutputViewButtons.on('mousedown',function(e) {
        if ($(e.target).hasClass('delete-num-button')) this.repeat();
    }.bind(this));
    this.dialOutputViewButtons.on('mouseup',function(e) {
        if ($(e.target).hasClass('delete-num-button')) {
            clearTimeout(this.timeout);
            this.startDelete = 800;
        }
    }.bind(this));
    this.dialOutputViewButtons.on('mouseleave',function(e) {
        if ($(e.target).hasClass('delete-num-button')) {
            clearTimeout(this.timeout);
            this.startDelete = 800;
        }
    }.bind(this));

    this.dialOutputViewButtons.on('click', function(e){
        if ($(e.target).hasClass('add-button')) {
            this.onAddContact();
        }
    }.bind(this));
}

DialSection.prototype.onPressNumber = function(num){
    this.inputNumbers.unshift(num);
    this.showDialOutputViewButtons();
    this.showOutputNumbers();
    this.setTemplateCall();
};

DialSection.prototype.onDeleteDial = function(){
    this.inputNumbers.shift();
    this.showDialOutputViewButtons();
    this.showOutputNumbers();
    this.setTemplateCall();
};

DialSection.prototype.onClearDial = function(){
    this.inputNumbers=[];
    this.showDialOutputViewButtons();
    this.showOutputNumbers();
    this.setTemplateCall();
    this.matchContactLightBox.hide();
};

DialSection.prototype.setTemplateCall = function(){
    if (this.inputNumbers.length == 0) return
    this.templateCall = new Call({
        firstname:'',
        lastname:'',
        phone: _.clone(this.inputNumbers).reverse().join('')
    });
    var index = _.chain(this.collection.models)
                 .map(function(i){return i.get('phone')})
                 .indexOf(this.templateCall.get('phone')).value();
    if (index >= 0) {
        this.templateCall =  this.collection.models[index];
        this.showMatchContact();
        this.matchContactLightBox.show(this.matchContact);
    } else {this.matchContactLightBox.hide();}
};

DialSection.prototype.onSendCall = function(){
    this._eventOutput.emit('outgoingCall', this.templateCall);
    this.onClearDial();
};

DialSection.prototype.onAddContact = function(){
    this._eventOutput.emit('editContact', this.templateCall);
};

DialSection.prototype.showDialOutputViewButtons = function(){
    if (this.inputNumbers.length == 0) {
        this.dialOutputViewButtonsLightBox.hide();
    }
    else if (this.inputNumbers.length > 0 && this.dialOutputViewButtonsLightBox._showing == false){
        this.dialOutputViewButtonsLightBox.show(this.dialOutputViewButtons);
    }
};

DialSection.prototype.showOutputNumbers = function(){
    this.outputSurface.setContent(Templates.dialOutputView(this.inputNumbers.join('')));
    this.setOutputViewFontSize(this.inputNumbers.length);
};

DialSection.prototype.showMatchContact = function(){
//    this.matchContact.setContent(Templates.dialOutputViewMatchContact('shana'));
    this.matchContact.setContent(Templates.dialOutputViewMatchContact(this.templateCall));
};

DialSection.prototype.setOutputViewFontSize = function(msgLength){
    var totalWidth = this.outputSurface.getSize(true)[0];
    var max = 50;
    var min = 30;
    var fontSize = totalWidth / msgLength;  // this an estimate the font size, but accurate enough.
    if (fontSize > max) fontSize = max;
    if (fontSize < min) fontSize = min;

    this.outputSurface.setProperties({fontSize:fontSize+"px"});
};

module.exports = DialSection;