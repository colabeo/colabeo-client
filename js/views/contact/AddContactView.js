define(function(require, exports, module) {
    // Import core Famous dependencies
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');
    var Easing = require('famous-animation/Easing');
    var UpDownTransform = require('app/custom/UpDownTransform');
    var ImportContactView = require('views/contact/ImportContactView');
    var ContactCollection = require('app/models/ContactCollection');
    var View = require('famous/View');
    var EdgeSwapper = require('famous-views/EdgeSwapper');
    var Templates    = require('app/custom/Templates');
    // import models
    var SocialContactCollection = require('app/models/SocialContactCollection');
    var Contact = require("app/models/Contact");
    var Call = require("app/models/Call");

    function AddContactView(options) {
        View.call(this);
        window.addContactView = this;
        this.formObject = {};
        this.social = {};
        this.headerFooterLayout = new HeaderFooterLayout({
            headerSize: 50,
            footerSize: 0
        });
        var upDownTransform = new UpDownTransform;

        if(options.inTransform === undefined) this.options.inTransform = upDownTransform.options.inTransform;
        if(options.outTransform === undefined) this.options.outTransform = upDownTransform.options.outTransform;
        if(options.inTransition === undefined) this.options.inTransition = upDownTransform.options.inTransition;
        if(options.outTransition === undefined) this.options.outTransition = upDownTransform.options.outTransition;
        if(options.inOpacity === undefined) this.options.inOpacity = upDownTransform.options.inOpacity;
        if(options.outOpacity === undefined) this.options.outOpacity = upDownTransform.options.outOpacity;
        this.options.showOrigin = [0,0];
        this.options.inOrigin = [0,0];
        this.options.outOrigin = [0,0];

        this.model = options.model;

        // Set up event handlers
        this.eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this.eventInput);
        this.eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this.eventOutput);

        this.header = new Surface({
            classes: ['header'],
            size: [undefined, 50],
            properties: {
            }
        });
        this.content = new Surface({
            classes: ['add-contact-view'],
            size: [undefined, undefined],
            properties: {
                'padding': '20px',
                backgroundColor: 'transparent'
            }
        });

        this.headerFooterLayout.id.header.link(this.header);
        this.headerFooterLayout.id.content.link(this.content);

        var edgeSwapper = new EdgeSwapper();

        this._link (edgeSwapper);
        edgeSwapper.show(this.headerFooterLayout);

        this.content.pipe(this.eventOutput);
        this.header.pipe(this.eventOutput);

        this.renderContact();

        this.header.on('click', function(e) {
            var target = $(e.target);
            if (target.hasClass("done-contact")) {
                this.submitForm();
                $('body').removeClass('editing');
                this.eventOutput.emit('triggerBackToNoneEditing');
                this.eventOutput.emit('showApp');
            } else if (target.hasClass("close-button")){
                this.eventOutput.emit('showApp');
            }
        }.bind(this));

        this.collection = options.collection;

        this.content.on('click', function(e){
            var target = $(e.target);
            if (target.hasClass('import-contact')){
                var source = target[0].id;
                if (!this.social[source]) {
                    this.social[source] = new SocialContactCollection();
                    this.social[source].url = '/contact/'+source;
                    this.social[source].fetch({
                        success : onDataHandler.bind(this),
                        error: onErrorHandler.bind(this)
                    });
                } else {
                    onDataHandler.bind(this)();
                }
                function onDataHandler() {
                    if (_.isArray(this.social[source].models)) {
                        //TODO: pull collections from server
                        var newSocialView = new ImportContactView({
                            title: _(source).capitalize(),
                            collection: this.social[source]});
                        newSocialView.pipe(this.eventOutput);
                        edgeSwapper.show(newSocialView, true);
                    }
                }
                function onErrorHandler() {
                    this.eventOutput.emit('onSocialLink', source);
                    delete this.social[source];
//                    alert("Go to Settings and link before adding " + _(source).capitalize() + " contact.");
                }

            } else if (target.hasClass('remove-button')){
                var source = target[0].id;
                if (source)
                    delete this.formObject[source];
                this.renderContact();
            }
        }.bind(this));

//        this.eventOutput.on('importSource', onImportSource);
        this.eventOutput.on('goBack', onGoBack);

        function onImportSource(eventData){
            if (!eventData || !eventData.attributes) return;
            this.getFormObject();
            if (eventData.attributes.provider) {
                this.formObject[eventData.attributes.provider] = eventData.attributes;
            } else {
                this.formObject = _.extend(this.formObject, eventData.attributes);
            }
            this.formObject.firstname = this.formObject.firstname?this.formObject.firstname:eventData.attributes.firstname;
            this.formObject.lastname = this.formObject.lastname?this.formObject.lastname:eventData.attributes.lastname;
            this.formObject.email = this.formObject.email?this.formObject.email:eventData.attributes.email;
            this.renderContact();
        }

        function onGoBack(eventData){
            edgeSwapper.show(this.headerFooterLayout, true, function() {
                onImportSource.bind(this)(eventData);
            }.bind(this));
        }
    }

    AddContactView.prototype = Object.create(View.prototype);
    AddContactView.prototype.constructor = AddContactView;

    AddContactView.prototype.renderContact = function() {
        var html = '<div class="initial">' + this.initial + '</div>';
        html += '<form role="form">';
        html += '<div class="form-group small">';
        html += '<input type="text" class="form-control" id="input-first-name" placeholder="First" name="firstname"';
        if (this.formObject.firstname)
            html += ' value="' + this.formObject.firstname + '"';
        html += '></div>';
        html += '<div class="form-group small">';
        html += '<input type="text" class="form-control" id="input-last-name" placeholder="Last" name="lastname"';
        if (this.formObject.lastname)
            html += ' value="' + this.formObject.lastname + '"';
        html += '></div>';
        html += '<div class="form-group small">';
        html += '<input type="email" class="form-control" id="input-email" placeholder="Email" name="email"';
        if (this.formObject.email)
            html += ' value="' + this.formObject.email + '"';
        html += '></div>';

        //TODO: this is a hack. we used the same class "import-contact" and id for a target.
        html += '<div class="box">';
        html += '<div class="info import-contact" id="google"><i class="fa fa-google-plus-square fa-lg import-contact" id="google"></i>';
        if (this.formObject.google) {
            var obj = this.formObject.google;
            html += '<span class="import-contact" id="google">  ' + obj.firstname + ' ' + obj.lastname +'</span>';
            html += Templates.removeButton('google') + '</div>';
        } else {
            html += '<span class="import-contact" id="google">  New Google Contact</span>';
            html += Templates.nextButton('google') + '</div>';
        }

        html += '<div class="info import-contact" id="facebook"><i class="fa fa-facebook-square fa-lg import-contact" id="facebook"></i>';
        if (this.formObject.facebook) {
            var obj = this.formObject.facebook;
            html += '<span class="import-contact" id="facebook">  ' + obj.firstname + ' ' + obj.lastname +'</span>';
            html += Templates.removeButton('facebook') + '</div>';
        } else {
            html += '<span class="import-contact" id="facebook">  New Facebook Contact</span>';
            html += Templates.nextButton('facebook') + '</div>';
        }

        html += '</form>';

        this.content.setContent(html);

        var html = '<button class="left close-button cancel-contact" id="close-button">Cancel</button><div>'
                    + this.title + '</div><button class="right close-button done-contact">Done</button>';
        this.header.setContent(html);
    }

    AddContactView.prototype.getFormObject = function(){
        var formArr = $('.add-contact-view form').serializeArray();
        var formContact = {};
        for (var i in formArr) {
            if (formArr[i].name) formContact[formArr[i].name] = formArr[i].value;
        }
        this.formObject = _.extend(this.formObject, formContact);
        // remove undefined attributes
        for (var i in this.formObject) {
            if (this.formObject[i] === undefined) delete this.formObject[i];
        }
        return this.formObject;
    }

    AddContactView.prototype.submitForm = function(){
        var formContact = this.getFormObject();
        if (this.title == 'Edit Contact') {
            this.model.set(formContact);
        } else {
            this.collection.add(formContact);
        }
        // trigger contact list redraw
        this.collection.trigger('sync');
    };
    AddContactView.prototype.setContact = function (model){
        if (model && model instanceof Contact) {
            this.formObject = _.omit(model.attributes,'id');
            this.title = 'Edit Contact';
            this.initial = '';
            if (this.formObject.firstname)
                this.initial = this.formObject.firstname[0];
            if (this.formObject.lastname)
                this.initial +=  this.formObject.lastname[0];
            this.model = model;
        } else {
            this.formObject = {};
            if (model) this.formObject = _.omit(model.attributes,'id');
            this.title = 'New Contact';
            this.initial = '<i class="fa fa-user fa-lg"></i>';
        }
    };

    module.exports = AddContactView;
});