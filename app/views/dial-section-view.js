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
        size:[undefined,75],
        content:Templates.dialOutputView(),
        properties:{
            zIndex: "3",
            backgroundColor:"black",
            textAlign: "right"
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

    this.dialOutputView._add(this.outputSurface);
    this.dialOutputView._add(this.dialOutputViewButtonsLightBox);
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
            abc : this.ABC[i-1],
            tone: ['content/audio/numberTone', this.numbers[i]].join(''),
            float: 0.75 - (i % 3) / 4
        });
        num.pipe(this._eventOutput);
        this.numbersSurfaces.push(num);
    }

    this.numbersSurfaces.push('');

    this.callButton = new RenderNode();
    this.callSurface = new Surface({
        content: Templates.phoneButton('dial-call')
    });
    this.callSurface.pipe(this._eventOutput);
    this.callSurfaceMod = new Modifier();
    this.callButton.add(this.callSurfaceMod).add(this.callSurface);
    this.numbersSurfaces.push(this.callButton);

    this.numbersSurfaces.push('');

    this.contentLayout.sequenceFrom(this.numbersSurfaces);
    this.callSurfaceMod.setTransform(Transform.translate(0,10,0));
}

function _initLayout(){
    this.layout = new HeaderFooterLayout({
        headerSize: 25,
        footerSize: 0
    });
    this.layout.id.header.add(this.dialOutputViewMod).add(this.dialOutputView);
    this.layout.id.content.add(this.contentLayout);
//    this.layout.id.footer.add(this.callSurfaceMod).add(this.callSurface);
    this._add(this.layout);
}

function _initEvent(){
    this._eventOutput.on('pressNumber', this.onPressNumber.bind(this));
    this.callSurface.on('click', this.onSendCall.bind(this));
    this.dialOutputViewButtons.on('click', function(e){
        if ($(e.target).hasClass('add-button')) {
            this.onAddContact();
        } else if ($(e.target).hasClass('delete-num-button')) {
            this.onDeleteDial();
        }
    }.bind(this));
}

DialSection.prototype.onPressNumber = function(num){
    this.inputNumbers.push(num);
    this.showDialOutputViewButtons();
    this.showOutputNumbers();
};

DialSection.prototype.onDeleteDial = function(){
    this.inputNumbers.pop();
    this.showDialOutputViewButtons();
    this.showOutputNumbers();
};

DialSection.prototype.setTemplateCall = function(){
    this.templateCall = new Call({
        firstname:'',
        lastname:'',
        phone: this.inputNumbers.join('')
    });
    var index = _.chain(this.collection.models)
                 .map(function(i){return i.get('phone')})
                 .indexOf(this.templateCall.get('phone')).value();
    if (index >= 0) this.templateCall =  this.collection.models[index];
};

DialSection.prototype.onSendCall = function(){
    this.setTemplateCall();
    console.log('call ', this.inputNumbers.join(''));
    this._eventOutput.emit('callByPhone', this.templateCall);
};

DialSection.prototype.onAddContact = function(){
    this.setTemplateCall();
    this._eventOutput.emit('editContact', this.templateCall);
};

DialSection.prototype.showDialOutputViewButtons = function(){
    if (this.inputNumbers.length == 0) this.dialOutputViewButtonsLightBox.hide();
    else if (this.inputNumbers.length > 0 && this.dialOutputViewButtonsLightBox._showing == false){
        this.dialOutputViewButtonsLightBox.show(this.dialOutputViewButtons);
    }
};

DialSection.prototype.showOutputNumbers = function(){
    this.outputSurface.setContent(Templates.dialOutputView(this.inputNumbers.join('')));
};

module.exports = DialSection;
