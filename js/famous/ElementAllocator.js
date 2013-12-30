define(function(require, exports, module) {
    function ElementAllocator(container) {
        if(!container) container = document.createDocumentFragment();
        this.container = container;
        this.detachedNodes = {};
        this.nodeCount = 0;
    };

    ElementAllocator.prototype.migrate = function(container) {
        var oldContainer = this.container;
        if(container === oldContainer) return;

        if(oldContainer instanceof DocumentFragment) {
            container.appendChild(oldContainer);
        }
        else {
            while(oldContainer.hasChildNodes()) {
                container.appendChild(oldContainer.removeChild(oldContainer.firstChild));
            }
        }

        this.container = container;
    };

    ElementAllocator.prototype.allocate = function(type) {
        type = type.toLowerCase();
        if(!(type in this.detachedNodes)) this.detachedNodes[type] = [];
        var nodeStore = this.detachedNodes[type];
        var result;
        if(nodeStore.length > 0) {
            result = nodeStore.pop();
        }
        else {
            result = document.createElement(type);
            this.container.appendChild(result);
        }
        this.nodeCount++;
        return result;
    };

    ElementAllocator.prototype.deallocate = function(element) {
        var nodeType = element.nodeName.toLowerCase();
        var nodeStore = this.detachedNodes[nodeType];
        nodeStore.push(element);
        this.nodeCount--;
    };

    ElementAllocator.prototype.getNodeCount = function() {
        return this.nodeCount;
    };

    module.exports = ElementAllocator;
});
