define(function(require, exports, module) {
    var RenderNode = require('./RenderNode');
    var Modifier = require('./Modifier');
    var SceneCompiler = require('./SceneCompiler');

    var RN_link = RenderNode.prototype.link;
    var RN_add = RenderNode.prototype.add;

    /**
     * @class Scene definition loader
     * @description Builds and renders a scene graph based on a canonical scene definition
     *
     * @name Scene
     * @constructor
     */
    function Scene(def) {
        this.id = {};
        this.transforms = [];

        this.node = new RenderNode();
        this._def = undefined;
        if(def) this.load(def);
    };

    Scene.prototype.create = function() {
        return new Scene(this._def);
    };

    Scene.prototype.load = function(def) {
        if(def instanceof Scene) def = def._def;
        else if(!(def instanceof Function)) def = SceneCompiler.compile(def);
        this.node = def(Modifier, RenderNode, RN_link, RN_add, this.id, this.transforms);
        this._def = def;
    };

    Scene.prototype.getTransforms = function() {
        return this.transforms;
    };

    Scene.prototype.add = function() { return this.node.add.apply(this.node, arguments); };
    Scene.prototype.mod = function() { return this.node.mod.apply(this.node, arguments); };
    Scene.prototype.link = function() { return this.node.link.apply(this.node, arguments); };
    Scene.prototype.render = function() { return this.node.render.apply(this.node, arguments); };

    module.exports = Scene;
});
