define(function(require, exports, module) {
    var FamousRenderNode = require('famous/RenderNode');
    var FM = require('famous/Matrix');
    var Modifier = require('famous/Modifier');
    var Utility = require('famous/Utility');

    /**
     * @name Shaper
     * @constructor
     * To be deleted.
     */
    function FamousShaper(panels) {
        this.nodes = [];
        this.transforms = [];
        this.defaultTransition = {duration: 1000, curve: 'easeInOut'};

        for(var id in panels) this.side(id).from(panels[id]);
    }

    FamousShaper.prototype.side = function(id) {
        if(!this.nodes[id]) {
            this.transforms[id] = new Modifier();
            this.transforms[id].setDefaultTransition(this.defaultTransition);
            this.nodes[id] = new FamousRenderNode(this.transforms[id]);
        }
        return this.nodes[id];
    };

    FamousShaper.prototype.halt = function(id) {
        this.transforms[id].halt();
    };

    FamousShaper.prototype.haltSet = function(idList) {
        for(var i = 0; i < idList.length; i++) {
            this.halt(i);
        }
    };

    FamousShaper.prototype.haltAll = function() {
        this.haltSet(this.all());
    };

    FamousShaper.prototype.set = function(id, transform, transition, callback) {
        if(!this.transforms[id]) {
            if(callback) callback();
            return;
        }
        this.transforms[id].setTransform(transform, transition, callback);
    };

    FamousShaper.prototype.setShape = function(idList, shape, transition, callback) {
        var shapeFn = (typeof shape == 'function') ? shape : function(i) { return shape[i]; };
        var onceCb = callback ? Utility.after(idList.length, callback) : undefined;
        for(var i = 0; i < idList.length; i++) {
            this.set(idList[i], shapeFn(i), transition, onceCb);
        }
    };

    FamousShaper.prototype.setShapeAll = function(shape, transition, callback) {
        this.setShape(this.all(), shape, transition, callback);
    };

    FamousShaper.prototype.modify = function(id, transform, transition, callback) {
        var finalTransform = FM.multiply(this.transforms[id].getFinalTransform(), transform);
        this.set(id, finalTransform, transition, callback);
    };

    FamousShaper.prototype.modifySet = function(idList, transform, transition, callback) {
        var onceCb = callback ? Utility.after(idList.length, callback) : undefined;
        for(var i = 0; i < idList.length; i++) {
            this.modify(idList[i], transform, transition, onceCb);
        }
    };

    FamousShaper.prototype.modifyAll = function(transform, transition, callback) {
        this.modify(this.all(), transform, transition, callback);
    };

    FamousShaper.prototype.setOpacity = function(id, opacity, transition, callback) {
        this.transforms[id].setOpacity(opacity, transition, callback);
    };

    FamousShaper.prototype.setOpacitySet = function(idList, opacity, transition, callback) {
        var onceCb = callback ? Utility.after(idList.length, callback) : undefined;
        for(var i = 0; i < idList.length; i++) {
            this.setOpacity(idList[i], opacity, transition, onceCb);
        }
    };

    FamousShaper.prototype.setOpacityAll = function(opacity, transition, callback) {
        this.setOpacitySet(this.all(), opacity, transition, callback);
    };

    FamousShaper.prototype.all = function() {
        var result = [];
        for(var i in this.nodes) result.push(i);
        return result;
    };

    FamousShaper.prototype.getTransform = function(id) {
        return this.transforms[id].getTransform();
    };

    FamousShaper.prototype.getOpacity = function(id) {
        return this.transforms[id].getOpacity();
    };

    FamousShaper.prototype.isMoving = function(id) {
        return this.transforms[id].isMoving();
    };

    FamousShaper.prototype.render = function() {
        var result = [];
        for(var i = 0; i < this.nodes.length; i++) {
            result[i] = this.nodes[i].execute();
        }
        return result;
    };

    module.exports = FamousShaper;
});
