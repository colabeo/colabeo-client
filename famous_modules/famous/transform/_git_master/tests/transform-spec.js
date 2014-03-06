var Transform = require('../index.js');
var expect = require('chai').expect;

describe("transform constants", function() {
    it("should have a properly defined identity transform", function() {
        expect(Transform.identity).to.eql([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });

    it("should have a properly defined precision", function() {
        expect(Transform.precision).to.eql(1e-6);
    });
});

describe("transform equivalence", function() {
    it("should be able to tell if two transforms are equal component-wise", function() {
        expect(Transform.equals(Transform.identity, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])).to.be.true;
        expect(Transform.equals(Transform.identity, [])).to.be.false;
    });
});

describe("Transform multiplication", function() {
    it("should be the same when multiplying the identity transform with itself", function() {
        expect(Transform.multiply4x4(Transform.identity, Transform.identity)).to.eql(Transform.identity);
    });

    it("should return the same transform when it is multiplied with the identity transform", function() {
        var translateTransform = Transform.move(Transform.identity, [100, 100, 0]);
        expect(Transform.multiply4x4(translateTransform, Transform.identity)).to.eql(translateTransform);
    });

    it("should multiply transforms properly", function() {
        var translateTransform = Transform.move(Transform.identity, [100, 100, 0]);
        var scaledTransform = Transform.scale(10, 20, 30);
        expect(Transform.multiply4x4(translateTransform, scaledTransform)).to.eql([10, 0, 0, 0, 0, 20, 0, 0, 0, 0, 30, 0, 1000, 2000, 0, 1]);
    });

    it("should have different results based on the order of the multipcation", function() {
        var translateTransform = Transform.move(Transform.identity, [100, 100, 0]);
        var scaledTransform = Transform.scale(10, 20, 30);
        expect(Transform.equals(Transform.multiply4x4(translateTransform, scaledTransform), Transform.multiply4x4(scaledTransform, translateTransform))).to.be.false;
    });
});

describe("transform translation", function () {
    it("should return the correct translation transform", function() {
        expect(Transform.translate(1, 2, 3)).to.eql([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1])
    });

    it("should move transforms properly", function() {
        expect(Transform.move(Transform.rotateX(Math.PI/4), [1, 2, 3])).to.eql([1, 0, 0, 0, 0, 0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 1, 2, 3, 1]);
    });

    it("should assume the z-value is 0 when the translate vector is only 2-dimensional", function() {
        expect(Transform.move(Transform.rotateX(Math.PI/4), [1, 2])).to.eql([1, 0, 0, 0, 0, 0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 1, 2, 0, 1]);        
    })

    it("should return the correct transform when applying the translation transform prior to the other movement", function() {
        expect(Transform.moveThen([1, 2, 3], Transform.rotateX(Math.PI/4))).to.eql([1, 0, 0, 0, 0, 0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 1, -0.7071067811865472, 3.5355339059327378, 1])
    });

    it("should be able to pull the translation from a given transform", function() {
        var translationTransform = Transform.translate(1, 2, 3);
        expect(Transform.getTranslate(translationTransform)).to.eql([1, 2, 3]);
    });
});


describe("transform rotation", function () {

    it("should rotate around the x-axis properly", function() {
        expect(Transform.rotateX(Math.PI/4)).to.be.eql([1, 0, 0, 0, 0, 0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 0, 0, 0, 1])
    });

    it("should rotate around the y-axis properly", function() {
        expect(Transform.rotateY(Math.PI/4)).to.be.eql([0.7071067811865476, 0, -0.7071067811865475, 0, 0, 1, 0, 0, 0.7071067811865475, 0, 0.7071067811865476, 0, 0, 0, 0, 1])
    });

    it("should rotate around the z-axis properly", function() {
        expect(Transform.rotateZ(Math.PI/4)).to.be.eql([0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    });

    it("should rotate given angles around the x, y, and z axes", function() {
        expect(Transform.equals(Transform.rotate(Math.PI/4, Math.PI/4, Math.PI/4), [0.5000000000000001, 0.8535533905932737, 0.1464466094067261, 0, -0.5, 0.14644660940672644, 0.8535533905932737, 0, 0.7071067811865475, -0.5, 0.5000000000000001, 0, 0, 0, 0, 1])).to.be.true;
    });    

    it("should rotate around any given vector properly", function() {
        expect(Transform.rotateAxis([1, 0, 0], Math.PI/4)).to.be.eql([1, 0, 0, 0, 0, 0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 0, 0, 0, 1])
        expect(Transform.rotateAxis([0, 1, 0], Math.PI/4)).to.be.eql([0.7071067811865476, 0, -0.7071067811865475, 0, 0, 1, 0, 0, 0.7071067811865475, 0, 0.7071067811865476, 0, 0, 0, 0, 1])
        expect(Transform.rotateAxis([0, 0, 1], Math.PI/4)).to.be.eql([0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
        expect(Transform.rotateAxis([Math.sqrt(1/3), Math.sqrt(1/3), Math.sqrt(1/3)], Math.PI/4)).to.be.eql([ 0.804737854124365, 0.5058793634016805, -0.3106172175260455, 0, -0.3106172175260455, 0.804737854124365, 0.5058793634016805, 0, 0.5058793634016805, -0.3106172175260455, 0.804737854124365, 0, 0, 0, 0, 1 ])
    });
});


describe("transform scaling", function () {
    it("should return the correct scaling transform", function() {
        expect(Transform.scale(1, 2, 3)).to.eql([1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1])
    });
});


describe("transform skew", function () {
    it("should skew properly", function() {
        expect(Transform.skew(Math.PI, Math.PI, Math.PI)).to.eql([ 1, 0, 0, 0, -1.2246063538223773e-16, 1, 0, 0, -1.2246063538223773e-16, -1.2246063538223773e-16, 1, 0, 0, 0, 0, 1 ]);    
    });
});

describe("transform interpretation", function() {
    it("provide an object with translate, rotate, scale, and skew components", function() {
        var interpretation = Transform.interpret(Transform.identity);
        expect(typeof interpretation).to.eql("object");
        expect(interpretation).to.have.ownProperty("translate");
        expect(interpretation).to.have.ownProperty("rotate");
        expect(interpretation).to.have.ownProperty("scale");
        expect(interpretation).to.have.ownProperty("skew");
        expect(interpretation["translate"]).to.be.instanceOf(Array);
        expect(interpretation["rotate"]).to.be.instanceOf(Array);
        expect(interpretation["scale"]).to.be.instanceOf(Array);
        expect(interpretation["skew"]).to.be.instanceOf(Array);
        expect(interpretation["translate"].length).to.eql(3);
        expect(interpretation["rotate"].length).to.eql(3);
        expect(interpretation["scale"].length).to.eql(3);
        expect(interpretation["skew"].length).to.eql(3);
    });

    it("should provide defaults transforms when interpreting the identity transform", function() {
        var interpretation = Transform.interpret(Transform.identity);
        expect(Transform.equals(interpretation["translate"], [0, 0, 0])).to.be.true;
        expect(Transform.equals(interpretation["rotate"], [0, 0, 0])).to.be.true;
        expect(Transform.equals(interpretation["scale"], [1, 1, 1])).to.be.true;
        expect(Transform.equals(interpretation["skew"], [0, 0, 0])).to.be.true;
    });

    it("should pull out the correct transform when only one is applied", function() {
        var translate = Transform.translate(1, 2, 3);
        translate = Transform.interpret(translate)["translate"];
        expect(Transform.equals(translate, [1, 2, 3])).to.be.true

        var rotate = Transform.rotateX(Math.PI);
        rotate = Transform.interpret(rotate)["rotate"];
        expect(Transform.equals(rotate, [ 3.141592653589793, 0, 0 ])).to.be.true;
        
        var scale = Transform.scale(1, 2, 3);
        scale = Transform.interpret(scale)["scale"];
        expect(Transform.equals(scale, [1, 2, 3])).to.be.true;

        var skew = Transform.skew(Math.PI, Math.PI, Math.PI);
        skew = Transform.interpret(skew)["skew"];
        expect(Transform.equals(skew, [1.2246063538223773e-16, 1.2246063538223773e-16, -1.2246063538223773e-16])).to.be.true;
    });

    it("should pull out the correct transforms when many are applied", function() {
        var rotate = Transform.rotateX(Math.PI);
        var scale = Transform.scale(1, 2, 3);
        var skew = Transform.skew(Math.PI, Math.PI, Math.PI);

        var combo = Transform.interpret(Transform.multiply(rotate, scale, skew));

        rotate = combo["rotate"];
        expect(Transform.equals(rotate, [ 3.141592653589793, 0, 0 ])).to.be.true;
        
        scale = combo["scale"];
        expect(Transform.equals(scale, [1, 2, 3])).to.be.true;

        skew = combo["skew"];
        expect(Transform.equals(skew, [2.2451116486743583e-16, 1.2246063538223775e-16, -2.449212707644754e-16])).to.be.true;
    });
});

describe("transform usage", function () {
    it("should properly inverse a transform", function() {
        expect(Transform.equals(Transform.inverse(Transform.identity), Transform.identity)).to.be.true;
    });

    it("should apply transforms about a particular origin", function() {
        expect(Transform.aboutOrigin([100, 100, 0], Transform.identity)).to.eql(Transform.identity);
        expect(Transform.aboutOrigin([100, 100, 0], Transform.rotateX(Math.PI/4))).to.eql([1, 0, 0, 0, 0, 0.7071067811865476, 0.7071067811865475, 0, 0, -0.7071067811865475, 0.7071067811865476, 0, 0, 29.289321881345245, -70.71067811865474, 1]);
    });
});

describe("css construction", function() {
    it("should create the proper css value for the particular transform", function() {
        expect(Transform.formatCSS(Transform.identity)).to.eql('matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)');
    });
});





