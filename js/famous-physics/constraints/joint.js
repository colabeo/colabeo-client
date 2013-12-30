define(function(require, exports, module) {
    var Matrix = require('../math/matrix');
    var GaussSeidel = require('../math/GaussSeidel');
    var Vector = require('../math/Vector');

    /**
     * @constructor
     */
    function Joint(opts){
        this.opts = {
            length : 0
        };

        if (opts) this.setOpts(opts);

        var numIterations = 10;
        var tolerance = 1e-5;
        this.solver = new GaussSeidel(numIterations, tolerance);
    };

    Joint.prototype.getPosition = function(target, source, dt){

        // if (particle.id != 1) return;

        var numParticles = 2;
        var numConstraints = 1;

        var vs = [];
        var ps = [];
        var ws = [];
        var fs = [];
        var ms = [];

        var particle = target;
        vs[0] = particle.getVel();
        ps[0] = particle.p;
        ws[0] = particle.mInv;
        fs[0] = particle.f;
        ms[0] = particle.m;

        vs[1] = source.v;
        ps[1] = source.p;
        ws[1] = source.mInv;
        fs[1] = source.f;
        ms[1] = source.m;


        //construct Jacobian
        var Jvalues = [];
        for (var row = 0; row < numConstraints; row++){
            Jvalues[row] = [];
            for (var col = 0; col < numParticles; col++){

                var entry;
                if (col == row)
                    entry = ps[row].sub(ps[row+1]);
                else if(col == row + 1)
                    entry = ps[row+1].sub(ps[row]);

                Jvalues[row][3*col + 0] = entry.x;
                Jvalues[row][3*col + 1] = entry.y;
                Jvalues[row][3*col + 2] = entry.z;
            }
        }

        var J = new Matrix(numConstraints,3*numParticles);
        J.set(Jvalues);

        //construct deriv of jacobian
        var DJvalues = [];
        for (var row = 0; row < numConstraints; row++){
            DJvalues[row] = [];
            for (var col = 0; col < numParticles; col++){

                var entry;
                if (col == row)
                    entry = vs[row].sub(vs[row+1]);
                else if(col == row + 1)
                    entry = vs[row+1].sub(vs[row]);


                DJvalues[row][3*col + 0] = entry.x;
                DJvalues[row][3*col + 1] = entry.y;
                DJvalues[row][3*col + 2] = entry.z;
            }
        }

        var Wdiag = []; var v = [];
        for (var index = 0; index < numParticles; index++){
            Wdiag[3*index + 0] = ws[index];
            Wdiag[3*index + 1] = ws[index];
            Wdiag[3*index + 2] = ws[index];

            v[3*index + 0] = vs[index].x;
            v[3*index + 1] = vs[index].y;
            v[3*index + 2] = vs[index].z;
        };

        var W = new Matrix(3*numParticles,3*numParticles).diag(Wdiag);

        //construct M
        var M = new Matrix(numConstraints,numConstraints);
        J.rightMult(W).rightMult(J.transpose(), M);

        //Jv + k/dt * C
        var b1 = J.vMult(v);

        var k = 1;
        var C = [];
        for (var index = 0; index < numConstraints; index++){
            var L = this.length;
            var distSqu = ps[index+1].sub(ps[index]).normSquared();
            C[index]  = 0.5 * (distSqu - L*L);
        };

        var b = [];
        for (var i = 0; i < numConstraints; i++)
            b[i] = -b1[i] - k/dt * C[i];

        var lambda = this.solver.solve(M.values, b);

        //solve for new forces F = JTx
        var F = J.transpose().vMult(lambda);

        var newFs = []
        for (var index = 0; index < numParticles; index++){
            newFs[index] = new Vector(
                F[3*index + 0],
                F[3*index + 1],
                F[3*index + 2]
            );
        };

        //add impulses
        for (var index = 0; index < numParticles; index++){
            var v = vs[index];
            var m = ms[index];
            var f = newFs[index];

            if (index == 0 && particle.id == 0) continue;
            if (index == 1 && particle.id == 0)
                v.add(f.sub(newFs[0]).div(m), v)
            else
                v.add(f.div(m), v);
        };

    };

    Joint.prototype.getError = function(dt){

    }

    module.exports = Joint;
});