define(function(require, exports, module) {
    /* WARNING: deprecated */

    /**
     * @name EnergyHelper
     * @constructor
     * To be deleted.
     */
    function FamousEnergyHelper(startX, startV, featureSize) {
        this.x = 0;
        this.v = 0;

        this.agents = [];

        this.featureSize = featureSize ? featureSize : 0.5;
        this.jitter = Math.min(0.0001, this.featureSize * 0.1);
        this.minStepTime = 1;

        this.lastUpdateTime = Date.now();
        this.atRest = false;

        this.set(startX, startV);
    };

    FamousEnergyHelper.drag = function(u) {
        return function(x, v, dT) {
            return -u * v * v * dT;
        };
    };

    FamousEnergyHelper.friction = function(u) {
        return function(x, v, dT) {
            return -u * Math.abs(v) * dT;
        };
    };

    FamousEnergyHelper.spring = function(pos, k, damp) {
        if(!k) k = 0;
        if(!damp) damp = 0;
        var dampCoefficient = 2 * damp * Math.sqrt(k);
        return function(x, v, dT) {
            var diffXStart = x - pos;
            var diffXEnd = diffXStart + (v * dT);

            var startPotential = 0.5 * k * diffXStart * diffXStart;
            var endPotential = 0.5 * k * diffXEnd * diffXEnd;

            var diffPotential = (diffXStart/diffXEnd < 0) ? startPotential : endPotential - startPotential;
            var dampLoss = dampCoefficient * v * v * dT;
            return -diffPotential - dampLoss;
        };
    };

    FamousEnergyHelper.springFENE = function(pos, k, damp, l) {
        if(!k) k = 0;
        if(!damp) damp = 0;
        if(!l) l = 0;
        var dampCoefficient = 2 * damp * Math.sqrt(k);
        var regularSpring = FamousEnergyHelper.spring(pos, k, damp);
        var triggered = false;
        return function(x, v, dT) {
            var diffXStart = x - pos;
            var diffXEnd = diffXStart + (v * dT);

            if(Math.abs(v) < 0.0001 && Math.abs(diffXEnd) < l) triggered = false;
            if(triggered || Math.abs(diffXStart) >= l || Math.abs(diffXEnd) >= l) {
                triggered = true;
                return regularSpring(x, v, dT);
            }

            var startPotential = -0.5*k*l*l*Math.log(l*l - diffXStart*diffXStart);
            var endPotential = -0.5*k*l*l*Math.log(l*l - diffXEnd*diffXEnd);

            var diffPotential = (diffXStart/diffXEnd < 0) ? -startPotential : endPotential - startPotential;
            var dampLoss = dampCoefficient * v * v * dT;
            return -diffPotential - dampLoss;
        };
    };

    FamousEnergyHelper.magnet = function(pos, k) {
        var minDist = 0.5;
        if(!k) k = 0;
        return function(x, v, dT) {
            var diffXStart = x - pos;
            var diffXEnd = diffXStart + (v * dT);

            if(Math.abs(diffXStart) < minDist && Math.abs(diffXEnd) < minDist) return -0.5 * v * v * dT;

            var startPotential = -k / Math.max(Math.abs(diffXStart), minDist);
            var endPotential = -k / Math.max(Math.abs(diffXEnd), minDist);
            var diffPotential = endPotential - startPotential;
            return -diffPotential;
        };
    };

    FamousEnergyHelper.prototype = {
        _updateReset: function() {
            this.lastUpdateTime = Date.now();
            this.atRest = false;
        },
        set: function(x, v) {
            if(typeof x == 'number') this.setPos(x);
            if(typeof v == 'number') this.setVelo(v);
        },
        setPos: function(x) {
            this.x = x;
            this._updateReset();
        },
        setVelo: function(v) {
            this.v = v;
            this._updateReset();
        },
        addAgent: function(agent) {
            if(!(agent instanceof Function)) console.error('Invalid agent');
            if(this.agents.indexOf(agent) < 0) {
                this.agents.push(agent);
                this.atRest = false;
            }
        },
        removeAgent: function(agent) {
            var i = this.agents.indexOf(agent);
            if(i >= 0) {
                this.agents.splice(i, 1);
                this.atRest = false;
            }
        },
        setAgents: function(agents) {
            this.agents = agents.slice(0);
            this.atRest = false;
        },
        getPos: function() {
            this.update();
            return this.x; 
        },
        getVelo: function() {
            this.update();
            return this.v;
        },
        update: function(time) {
            if(!time) time = Date.now();

            while(this.lastUpdateTime < time) {
                var stepTime = time - this.lastUpdateTime;
                if(this.v) stepTime = Math.min(stepTime, this.featureSize / Math.abs(this.v));
                stepTime = Math.max(stepTime, this.minStepTime);
                this._step(stepTime);
            }
        },
        _step: function(dT) {
            this.lastUpdateTime += dT;
            if(this.atRest) return;

            var self = this;
            function calcDiffE(x, v, dT) {
                var agents = self.agents;
                var diffE = 0;
                for(var i = 0; i < agents.length; i++) {
                    diffE += agents[i](x, v, dT);
                }
                return diffE;
            };

            var diffE = 0;
            var direction = 0;
            if(Math.abs(this.v) > this.jitter) {
                diffE = calcDiffE(this.x, this.v, dT);
                direction = (this.v > 0) ? 1 : -1;
            }
            else {
                var diffEPlus = calcDiffE(this.x, this.jitter, dT);
                var diffEMinus = calcDiffE(this.x, -this.jitter, dT);
                diffE = Math.max(diffEPlus, diffEMinus);
                direction = (diffEPlus > diffEMinus) ? 1 : -1;
                if(diffEPlus <= 0 && diffEMinus <= 0) this.atRest = true;
            }

            var prevV = this.v;
            var prevE = 0.5 * prevV * prevV;

            var nextE = prevE + diffE;
            if(nextE < 0) {
                this.x += this.v * dT * (nextE / diffE);
                this.v = 0;
            }
            else { 
                var nextV = direction * Math.sqrt(2 * Math.abs(nextE));

                this.x += this.v * dT;
                this.v = nextV;
            }

            // round to minimum detail at end
            if(this.atRest) {
                this.x = Math.round(this.x / this.featureSize) * this.featureSize;
                this.v = 0;
            }
        }
    };

    module.exports = FamousEnergyHelper;
});

