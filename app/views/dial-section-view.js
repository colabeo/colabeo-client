var View               = require('famous/view');

var Templates        = require('templates');

function ContactsSection(options) {
    View.call(this);

    this.title = Templates.dialHeader();
    this.navigation = {
        caption: 'Dial',
        icon: '<i class="fa fa-th"></i>'
    };
}

ContactsSection.prototype = Object.create(View.prototype);
ContactsSection.prototype.constructor = ContactsSection;

module.exports = ContactsSection;
