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
    var SocialContactCollection = require('app/models/SocialContactCollection');
    var Contact = require('app/models/Contact');
    // import models
    var Contact = require("app/models/Contact");
    var Call = require("app/models/Call");

    function AddContactView(options) {
        View.call(this);
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
                    this.social[source].url = 'contact/'+source;
                    this.social[source].fetch({
                        success : onDataHandler.bind(this),
                        error: onErrorHandler.bind(this)
                    });
                } else {
                    onDataHandler.bind(this)();
                }
                function onDataHandler() {
                    if (this.social[source].models.length) {
                        //TODO: pull collections from server
                        var newSocialView = new ImportContactView({
                            title: _(source).capitalize(),
                            collection: this.social[source]});
                        newSocialView.pipe(this.eventOutput);
                        edgeSwapper.show(newSocialView, true);
                    } else {
                        alert("Go to Settings and link before adding " + _(source).capitalize() + " contact.");
                    }
                }
                function onErrorHandler() {
                    alert("Go to Settings and link before adding " + _(source).capitalize() + " contact.");
                }

            }
        }.bind(this));

        this.eventOutput.on('importSource', onImportSource);
        this.eventOutput.on('goBack', onGoBack);

        function onImportSource(eventData){
            if (!eventData || !eventData.attributes) return;
            if (!this.model) {
                var newContact = {
                    firstname: eventData.attributes.firstname,
                    lastname: eventData.attributes.lastname,
                    email: eventData.attributes.email
                };
                if (eventData.attributes.provider)
                    newContact[eventData.attributes.provider] = eventData.attributes;
                this.fillFrom(new Contact(newContact));
            } else {
                if (eventData.attributes.provider)
                    this.model.attributes[eventData.attributes.provider] = eventData.attributes;
                this.fillFrom(this.model);
            }
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
        this.newContact = {};
        var title = 'New Contact';
        var initial = '<i class="fa fa-user fa-lg"></i>';
        if (this.model instanceof Contact) {
            title = 'Edit Contact';
            initial = '';
            if (this.model.get('firstname')) initial = this.model.get('firstname')[0];
            if (this.model.get('lastname')) initial +=  this.model.get('lastname')[0];
        }
        var html = '<div class="initial">'+initial+'</div>';
        html += '<form role="form">';
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
        html += '<div class="form-group small">';
        html += '<input type="email" class="form-control" id="input-email" placeholder="Email" name="email"';
        if (this.model)
            html += ' value="' + this.model.get('email') + '"';
        html += '></div>';
        //TODO: this is a hack. we used the same class "import-contact" and id for a target.
        html += '<div class="box">';
        html += '<div class="info import-contact" id="google"><i class="fa fa-google-plus-square fa-lg import-contact" id="google"></i>';
        if (this.model && this.model.get('google')) {
            var obj = this.model.get('google');
            html += '<span class="import-contact" id="google">  ' + obj.firstname + ' ' + obj.lastname +'</span>';
        } else
            html += '<span class="import-contact" id="google">  New Google Contact</span>';
        html += '<i class="arrow fa fa-angle-right fa-lg import-contact" id="google"></i></div>';

        html += '<div class="info import-contact" id="facebook"><i class="fa fa-facebook-square fa-lg import-contact" id="facebook"></i>';
        if (this.model && this.model.get('facebook')) {
            var obj = this.model.get('facebook');
            html += '<span class="import-contact" id="facebook">  ' + obj.firstname + ' ' + obj.lastname +'</span>';
        } else
            html += '<span class="import-contact" id="facebook">  New Facebook Contact</span>';
        html += '<i class="arrow fa fa-angle-right fa-lg import-contact" id="facebook"></i></div>';

        html += '</form>';

        this.content.setContent(html);

        var html = '<button class="left close-button cancel-contact" id="close-button">Cancel</button><div>'+title+'</div><button class="right close-button done-contact">Done</button>'
        this.header.setContent(html);
    }

    AddContactView.prototype.fillFrom = function(contact) {
        this.newContact = _.extend(this.newContact, contact.attributes);
        if (this.newContact) {
            if (!$('[name=firstname]').val()) $('[name=firstname]').val(this.newContact.firstname);
            if (!$('[name=lastname]').val()) $('[name=lastname]').val(this.newContact.lastname);
            $('[name=email]').val(this.newContact.email);
            if (this.newContact.facebook)
                $('#facebook span').text(this.newContact.facebook.firstname + " " + this.newContact.facebook.lastname);
            if (this.newContact.google)
                $('#google span').text(this.newContact.google.firstname + " " + this.newContact.google.lastname);
        }
    };

    AddContactView.prototype.getFormContact = function(){
        var formArr = $('.add-contact-view form').serializeArray();
        var newContact = {};
        for (var i in formArr) {
            newContact[formArr[i].name] = formArr[i].value;
        }
        this.newContact = _.extend(this.newContact, newContact);
        return this.newContact;
    }

    AddContactView.prototype.submitForm = function(){
        var newContact = this.getFormContact();
        if ((newContact.firstname || newContact.lastname)) {
            if (this.model instanceof Contact) {
                this.model.set(newContact);
                // TODO: this is a hack; need scrollview append
                this.model.trigger('sync');
            } else if (this.collection || this.model instanceof Call) {
                this.collection.add(newContact);
                // TODO: this is a hack; need scrollview append
                this.collection.trigger('sync');
            }
        }
        // reset everything
        $('.add-contact-view form')[0].reset();
        this.newContact = {};
    };
    AddContactView.prototype.setContact = function (model){
        this.model = model;
    };

    module.exports = AddContactView;
});