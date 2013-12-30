define(function(require, exports, module) {
    // Import core Famous dependencies
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');
    var Easing = require('famous-animation/Easing');
    var UpDownTransform = require('app/custom/UpDownTransform');


    function AddContactView(options) {
        HeaderFooterLayout.call(this);

        var upDownTransform = new UpDownTransform;

        if(options.inTransform === undefined) this.options.inTransform = upDownTransform.options.inTransform;
        if(options.outTransform === undefined) this.options.outTransform = upDownTransform.options.outTransform;
        if(options.inTransition === undefined) this.options.inTransition = upDownTransform.options.inTransition;
        if(options.outTransition === undefined) this.options.outTransition = upDownTransform.options.outTransition;
        if(options.inOpacity === undefined) this.options.inOpacity = upDownTransform.options.inOpacity;
        if(options.outOpacity === undefined) this.options.outOpacity = upDownTransform.options.outOpacity;

        this.model = options.model;
        this.collection = options.collection;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        var title = 'New Contact';
        if (this.model) title = 'Edit Contact';
        this.header = new Surface({
            classes: ['header'],
            size: [undefined, 50],
            properties: {
            },
            content: '<button class="left close-button cancel-contact">Cancel</button><div>'+title+'</div><button class="right close-button done-contact">Done</button>'
        });
        this.content = new Surface({
            classes: ['add-contact-view'],
            size: [undefined, undefined],
            properties: {
                backgroundColor: 'transparent'
            }
        });

        this.id.header.link(this.header);
        this.id.content.link(this.content);

        this.header.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("done-contact")) {
                this.submitForm();
            }
        }.bind(this));

        this.template();

        this.content.pipe(this.eventOutput);

    }

    AddContactView.prototype = Object.create(HeaderFooterLayout.prototype);
    AddContactView.prototype.constructor = AddContactView;

    AddContactView.prototype.template = function() {
        var html = '<form role="form">';
        html += '<div class="form-group small">';
        html += '<input type="text" class="form-control" id="input-first-name" placeholder="First" name="firstname"';
        if (this.model)
            html += ' value="' + this.model.get('firstname') + '"';
        html += '></div>';
        html += '<div class="form-group small">';
        html += '<input type="text" class="form-control" id="input-last-name" placeholder="Last" name="lastname"';
        if (this.model)
            html += ' value="' + this.model.get('lastname') + '"';
        html += '></div>';
        html += '<div class="form-group">';
        html += '<input type="email" class="form-control" id="input-email" placeholder="Email" name="email"';
        if (this.model)
            html += ' value="' + this.model.get('email') + '"';
        html += '></div>';
        html += '</form>';
        this.content.setContent(html);
    };

    AddContactView.prototype.fillFrom = function() {
        if (this.model) {
            $('[name=firstname]').val(this.model.attributes.firstname);
            $('[name=lastname]').val(this.model.attributes.lastname);
            $('[name=email]').val(this.model.attributes.email);
        }
    }

    AddContactView.prototype.submitForm = function(){
        var formArr = $('.add-contact-view form').serializeArray();
        var form = {};
        for (var i in formArr) {
            form[formArr[i].name] = formArr[i].value;
        }
        if (form.firstname && form.lastname && form.email) {
            if (this.collection) {
                this.collection.add(form);
                // TODO: this is a hack; need scrollview append
                this.collection.trigger('sync');
            } else if (this.model) {
                this.model.set(form);
                // TODO: this is a hack; need scrollview append
                this.model.trigger('sync');
            }
        }
        $('.add-contact-view form')[0].reset();
    }

    module.exports = AddContactView;
});