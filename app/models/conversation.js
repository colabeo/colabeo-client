module.exports = Backbone.Model.extend({
    defaults: {
        content: "",
        type: "text",
        time: "",
        source: "",
        from: ""
    },
    isLocal: function () {
        return this.get('source') == 'local' || this.get('from') == _cola_g.cid;
    }
});
