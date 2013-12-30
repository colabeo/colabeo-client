define(function(require, exports, module) {
    var Entity = require('famous/Entity');
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');
    var Utility = require('famous/Utility');
    var GenericSync = require('famous-sync/GenericSync');
    var PhysicsTransition = require('famous-physics/utils/PhysicsTransition');

    /**
     * @class Allows you to make the shown renderables behave like cards.
     * @description
     * @name CardsLayout
     * @constructor
     * @example 
     *   define(function(require, exports, module) {
     *       var Engine = require('famous/Engine');
     *       var CardsLayout  = require('famous-views/CardsLayout');
     *       var Surface = require('famous/Surface');
     *
     *       var Context = Engine.createContext();
     *       var cardslayout = new CardsLayout();
     *
     *       Context.link(cardslayout);
     *
     *       var cards = 0;
     *
     *       Engine.on('click', function() {
     *
     *           color = [
     *               'hsv(',
     *               String(cards << 5),
     *               '100, 100)'
     *           ].join('');
     *
     *           cardslayout.show(
     *               new Surface({
     *                   size: [200, undefined],
     *                   content: cards,
     *                   properties:{
     *                       backgroundColor: color
     *                   }
     *               })
     *           );
     *
     *           cards++;
     *       });
     *
     *   });
     */
    function CardsLayout(options) {
        this.options = Object.create(CardsLayout.DEFAULT_OPTIONS);

        this._entityId = Entity.register(this);
        this._size = [window.innerWidth, window.innerHeight];

        this._cards = [];
        this._cardStates = [];

        this._activeIndex = -1;
        this._incomingIndex = -1;

        this._removedCards = [];
        this._removedCardStates = [];

        this.sync = new GenericSync(_getCurrentCardPosition.bind(this), {
            direction: Utility.Direction.X,
            rails: true
        });

        this.eventInput = new EventHandler();
        this.eventInput.pipe(this.sync);
        EventHandler.setInputHandler(this, this.eventInput);

        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        if(options) this.setOptions(options);

        this.sync.on('start', function(data) {
            for(var i = 0; i < this._cardStates.length; i++) {
                this._cardStates[i].reset(this._cardStates[i].getPosition());
            }
        }.bind(this));

        this.sync.on('update', function(data) {
            if(this._activeIndex < 0) return;
            this._cardStates[this._activeIndex].reset(data.p);
            var currCardSize = _getCardSize.call(this, this._cards[this._activeIndex]);
            if(data.p > this.getSize()[0] && this.activeIndex > 0) {
                this._activeIndex--;
            }
            else if(data.p < this.getSize()[0] - currCardSize) {
                if(this._activeIndex < this._cards.length - 1) this._activeIndex++;
                else this.eventOutput.emit('edgepull', {direction: 1, v: data.v});
            }
            else if(!this._activeIndex && data.p > 0.5*currCardSize && data.v > 0) {
                this.eventOutput.emit('edgepull', {direction: -1, v: data.v});
            }
        }.bind(this));

        this.sync.on('end', function(data) {
            if(this._activeIndex < 0) return;
            if(data.v > this.options.feel.pageSwitchSpeed && this._activeIndex > 0) this._activeIndex--;
            else if(data.v < -this.options.feel.pageSwitchSpeed && this._activeIndex < this._cards.length - 1) this._activeIndex++;
            var i = this._activeIndex;
            var currentCard = this._cards[i];
            var finalPosition = this.getSize()[0] - _getCardSize.call(this, currentCard);
            this._cardStates[i].setAnchorPosition(finalPosition);
            this._cardStates[i].setVelocity(data.v);
        }.bind(this));
    }

    CardsLayout.DEFAULT_OPTIONS = {
        look: {
            size: [400, undefined]
        },
        feel: {
            dampingRatio: 0.8,
            period: 500,
            pageSwitchSpeed: 1
        },
        removalFudge: 10
    };

    function _getCurrentCardPosition() {
        if(this._activeIndex < 0) return 0;
        return this._cardStates[this._activeIndex].getPosition();
    }

    function _getCardSize(card) {
        if(!card || !card.getSize) {
            return this.options.look.size[0];
        }
        else {
            size = card.getSize();
            if(size && size[0]) return size[0];
            else return this.options.look.size[0];
        }
    }

    CardsLayout.prototype.getSize = function() {
        return this._size;
    };

    CardsLayout.prototype.show = function(card) {
        if(!card) return this.remove(0);

        // don't show duplicate cards
        if(this._cards.indexOf(card) >= 0) return false;

        // forward events to current target
        if(card && card.emit) {
            card.pipe(this.eventInput);
            this.eventOutput.pipe(card);
        }

        // show current target
        var cardState;
        var removedIndex = this._removedCards.indexOf(card);
        if(removedIndex < 0) {
            cardState = new PhysicsTransition({
                dampingRatio: this.options.feel.dampingRatio,
                period: this.options.feel.period
            });
            cardState.reset(this.getSize()[0]);
        }
        else {
            cardState = this._removedCardStates[removedIndex];
            this._removedCardStates.splice(removedIndex, 1);
            this._removedCards.splice(removedIndex, 1);
        }
        var finalPosition = this.getSize()[0] - _getCardSize.call(this, card);
        if(this._cardStates.length) {
            finalPosition = this._cardStates[this._cardStates.length - 1].getPosition() + _getCardSize(this, this._cards[this._cardStates.length - 1]);
        }
        finalPosition = Math.min(finalPosition, this.getSize()[0] - _getCardSize.call(this, card));
        cardState.setAnchorPosition(finalPosition);
        var i = this._cardStates.length;
        this._cards[i] = card;
        this._cardStates[i] = cardState;
        this._incomingIndex = i;

        return i;
    };

    CardsLayout.prototype.remove = function(position) {
        if(!position) position = 0;
        if(position >= this._cards.length) return;
        this._activeIndex = position - 1;
        for(var i = position; i < this._cards.length; i++) {
            this._cardStates[i].setAnchorPosition(this.getSize()[0] + this.options.removalFudge);
            this._removedCardStates.push(this._cardStates[i]);
            this._removedCards.push(this._cards[i]);
        }
        this._cards.splice(position);
        this._cardStates.splice(position);
        if(this._activeIndex >= 0 && this._activeIndex < position) {
            var finalPosition = this.getSize()[0] - _getCardSize.call(this, this._cards[this._activeIndex]);
            this._cardStates[this._activeIndex].setAnchorPosition(finalPosition);
        }
    };

    CardsLayout.prototype.setOptions = function(options) {
        if(options.look !== undefined) this.options.look = options.look;
        if(options.feel !== undefined) this.options.feel = options.feel;
        if(options.removalFudge !== undefined) this.options.removalFudge = options.removalFudge;
    };

    CardsLayout.prototype.render = function() {
        return this._entityId;
    };

    CardsLayout.prototype.commit = function(context, transform, opacity, origin, size) {
        this._size = size;
        return {
            transform: transform,
            opacity: opacity,
            origin: origin,
            size: size,
            target: _actualRender.call(this)
        };
    };

    function _actualRender() {
        var containerSize = this.getSize()[0];
        if(this._incomingIndex >= 0) {
            var incomingPos = this._cardStates[this._incomingIndex].getPosition();
            var targetPos = containerSize;
            if(this._activeIndex >= 0) {
                targetPos = Math.min(targetPos, this._cardStates[this._activeIndex].getPosition() + _getCardSize.call(this, this._cards[this._activeIndex]));
            }
            if(incomingPos <= targetPos) {
                this._activeIndex = this._incomingIndex;
                this._incomingIndex = -1;
            }
        }

        var result;
        if(this._cardStates.length) {
            result = new Array(this._cards.length);
            if(this._activeIndex >= 0) {
                var activePosition = this._cardStates[this._activeIndex].getPosition();
                var currentPosition = activePosition;
                for(var i = this._activeIndex - 1; i >= 0; i--) {
                    currentPosition -= _getCardSize.call(this, this._cards[i]);
                    this._cardStates[i].reset((currentPosition > 0) ? currentPosition : 0);
                };
                currentPosition = activePosition + _getCardSize.call(this, this._cards[this._activeIndex]);
                var cardStatesLength = this._cardStates.length;
                for(var i = this._activeIndex + 1; i < cardStatesLength; i++) {
                    if(i != this._incomingIndex) {
                        this._cardStates[i].reset(currentPosition);
                        currentPosition += _getCardSize.call(this, this._cards[i]);
                    }
                };
            }

            for(var i = 0; i < this._cards.length; i++) {
                var position = this._cardStates[i].getPosition();
                result[i] = {
                    transform: Matrix.translate((8*position | 0)*0.125, 0, 0.01*i),
                    size: [_getCardSize.call(this, this._cards[i]), undefined],
                    target: this._cards[i].render()
                };
            };
        }
        else result = [];

        var i = 0;
        while(i < this._removedCardStates.length) {
            var position = this._removedCardStates[i].getPosition();
            var velocity = this._removedCardStates[i].getVelocity();

            if(position >= containerSize && Math.abs(velocity) < 0.001) {
                this._removedCardStates.splice(i, 1);
                this._removedCards.splice(i, 1);
            }
            else {
                result.push({
                    transform: Matrix.translate(position, 0, 0.01*i),
                    size: [_getCardSize.call(this, this._removedCards[i]), undefined],
                    target: this._removedCards[i].render()
                });
                i++;
            }
        }

        return result;
    };

    module.exports = CardsLayout;
});
