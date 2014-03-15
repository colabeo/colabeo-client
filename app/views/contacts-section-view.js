var ContactsScrollView = require('contacts-scroll-view');

function ContactsSection(options) {
    ContactsScrollView.apply(this, arguments);

    this.title = '<button class="left edit-button touchable" id="contact-edit-contact"></button><div>All Contacts</div><button class="right add-contact touchable" id="add-contact"><i class="fa fa-plus" id="add-contact"></i></button>';
    this.navigation = {
        caption: 'Contacts',
        icon: '<i class="fa fa-users"></i>'
    };
}

ContactsSection.prototype = Object.create(ContactsScrollView.prototype);
ContactsSection.prototype.constructor = ContactsSection;

module.exports = ContactsSection;
