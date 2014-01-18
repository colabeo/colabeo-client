(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } 
    else if(typeof window === 'object') {
        var _loadCb;
        window.addEventListener('load', function() {
            root.Famous = factory();
            if(_loadCb) root.Famous(_loadCb);
        });
        root.Famous = function(cb) {
            _loadCb = cb;
        };
    }
    else {
        root.Famous = factory();
    }
}(this, function () {
