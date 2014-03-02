var Surface = require('famous/surface');
var Modifier = require('famous/modifier');
var Transform = require('famous/transform');
var Engine = require('famous/engine');

var Templates = require('templates');
var RowView = require('row-view');

function HeaderView(options){
    RowView.call(this);

    this.model = options.model;
    this.options = {
        collection: undefined,
        header: undefined,
        buttonSizeY: 20,
        classes: [],
        content: ''
    };

    this.setOptions(options);

    this.containElements = this.options.collection.lastnameInitial(this.options.header).length != 0;

    this.setItemSize();
    this.setupSurfaces();
    this.events();

    window.hh=this;

}

HeaderView.prototype = Object.create(RowView.prototype);
HeaderView.prototype.constructor = HeaderView;

HeaderView.prototype.setOptions = function(options){
    _.extend(this.options, options);
};

HeaderView.prototype.setupSurfaces = function(){
    this.headerMod = new Modifier();
    this.headerSurface = new Surface({
        classes: this.options.classes,
        size: this.options.size,
        properties:{
            backgroundColor: "black",
            color: "white"
        }
    });
    this.setContent();
    this.headerSurface.pipe(this.eventOutput);
    this.surfaces.link(this.headerMod).link(this.headerSurface);
};

HeaderView.prototype.setContent = function (){
    if (this.containElements) {
        this.headerSurface.setContent(this.options.content);
    }
};

HeaderView.prototype.setItemSize = function (){
    this.itemHeight = this.containElements? this.options.buttonSizeY : 1;
    this.options.size = [true, this.itemHeight];
    console.log(this.options.size);
};

HeaderView.prototype.resizeItem = function(){
    if (this.headerSurface._currTarget) this.headerSurface._currTarget.children[0].style.width = window.innerWidth + 'px';
};

HeaderView.prototype.events = function() {

    Engine.on('resize', this.resizeItem.bind(this));

    this.options.collection.on('all', function(e, model, collection, options) {
        this.containElements = this.options.collection.lastnameInitial(this.options.header).length != 0;
        if (this.containElements && this.options.collection.length == 0){
            this.containElements = false;
            this.collapse();
        }
        if (!!this.containElements && this.options.collection.length != 1){
            this.setContent();
            this.containElements = true;
            this.expand();
        }
    }.bind(this))
};

module.exports = HeaderView;

