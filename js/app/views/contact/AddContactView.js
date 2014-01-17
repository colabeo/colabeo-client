define(function(require, exports, module) {
    // Import core Famous dependencies
    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var Surface      = require('famous/Surface');
    var EventHandler = require('famous/EventHandler');
    var Matrix = require('famous/Matrix');
    var Easing = require('famous-animation/Easing');
    var UpDownTransform = require('app/custom/UpDownTransform');
    var ImportContactView = require('app/views/contact/ImportContactView');
    var ContactCollection = require('app/models/ContactCollection');
    var View = require('famous/View');
    var EdgeSwapper = require('famous-views/EdgeSwapper');

    function AddContactView(options) {
        View.call(this);

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
            }
            this.eventOutput.emit('showApp');
        }.bind(this));

        this.collection = options.collection;

        this.content.on('click', function(e){
            var target = $(e.target);
            if (target.hasClass('import-contact')){
                var source = target[0].id;
                //TODO: pull collections from server
                var newSocialView = new ImportContactView({
                    title: source,
                    collection: colabeo.social[source]});
                newSocialView.pipe(this.eventOutput);
                edgeSwapper.show(newSocialView, true);
            }
        }.bind(this));

        this.eventOutput.on('importSource', onImportSource);
        this.eventOutput.on('goBack', onGoBack);

        function onImportSource(eventData){
            console.log(eventData);
            console.log('The first name is: ' + eventData.attributes.firstname);
            console.log('The last name is: ' + eventData.attributes.lastname);
            console.log('The email is: ' + eventData.attributes.email);
        }

        function onGoBack(){
            edgeSwapper.show(this.headerFooterLayout, true);
        }
    }

    AddContactView.prototype = Object.create(View.prototype);
    AddContactView.prototype.constructor = AddContactView;

    AddContactView.prototype.renderContact = function() {
        var title = 'New Contact';
        var initial = '<i class="fa fa-user fa-lg"></i>';
        if (this.model) {
            title = 'Edit Contact';
            initial = this.model.get('firstname')[0]+this.model.get('lastname')[0];
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

        html += '<div class="box">';
        html += '<div class="info import-contact" id="Google"><i class="fa fa-google-plus-square fa-lg"></i>';
        if (this.model && this.model.get('google'))
            html += '<span><input type="text" readonly>'+ this.model.get('google') +'</input></span>';
        else
            html += "  New Google Contact";
        html += '<i class="arrow fa fa-angle-right fa-lg"></i></div>';

        html += '<div class="info import-contact" id="Facebook"><i class="fa fa-facebook-square fa-lg"></i>';
        if (this.model && this.model.get('facebook'))
            html += '<span><input type="text" readonly>'+ this.model.get('facebook') +'</input></span>';
        else
            html += "  New Facebook Contact";
        html += '<i class="arrow fa fa-angle-right fa-lg"></i></div>';

        html += '</form>';

        this.content.setContent(html);

        var html = '<button class="left close-button cancel-contact" id="close-button">Cancel</button><div>'+title+'</div><button class="right close-button done-contact">Done</button>'
        this.header.setContent(html);
    }

    AddContactView.prototype.fillFrom = function() {
        if (this.model) {
            $('[name=firstname]').val(this.model.attributes.firstname);
            $('[name=lastname]').val(this.model.attributes.lastname);
            $('[name=email]').val(this.model.attributes.email);
        }
    };

    AddContactView.prototype.submitForm = function(){
        var formArr = $('.add-contact-view form').serializeArray();
        var form = {};
        for (var i in formArr) {
            form[formArr[i].name] = formArr[i].value;
        }
        if (form.firstname && form.lastname && form.email) {
            console.log(this.collection);
            window.a=this.collection;
            if (this.model) {
                this.model.set(form);
                // TODO: this is a hack; need scrollview append
                this.model.trigger('sync');
            } else if (this.collection) {
                this.collection.add(form);
                // TODO: this is a hack; need scrollview append
                this.collection.trigger('sync');
            }
        }

        $('.add-contact-view form')[0].reset();
    };
    AddContactView.prototype.setContact = function (model){
        this.model = model;
    };

    module.exports = AddContactView;
});