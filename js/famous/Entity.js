define(function(require, exports, module) {
    var entities = [];

    function register(entity) {
        var id = entities.length;
        set(id, entity);
        return id;
    };

    function get(id) {
        return entities[id];
    };

    function set(id, entity) {
        entities[id] = entity;
    };

    module.exports = {
        register: register,
        get: get,
        set: set
    };
});
