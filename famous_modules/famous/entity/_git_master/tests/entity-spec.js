var Entity = require('../index.js');
var expect = require('chai').expect;

describe("entity api", function() {
    it("should return undefined for an index that has not yet been set", function() {
        expect(Entity.get(0)).to.be.undefined;
    });

    it("should return undefined for an index that has not yet been set", function() {
        Entity.set(0, 'HelloWorld')
        expect(Entity.get(0)).to.equal('HelloWorld');
    });

    it("should register the next value at the index of the current length of the entity array", function() {
        expect(Entity.get(1)).to.be.undefined;
        Entity.register('bananas');
        expect(Entity.get(1)).to.equal('bananas');
    });
});