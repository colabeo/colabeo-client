var Helpers        = require('helpers');

module.exports = {
    toggleSwitch: function(id, checked, disabled) {
        var html = [
            '<div class="onoffswitch">',
            '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="',
            id,
            '" '
        ];
        if (checked) html.push('checked ');
        if (disabled) html.push('disabled ');
        html.push('><label class="onoffswitch-label');
        if (disabled) html.push(' disabled');
        html = html.concat([
            '" for="',
            id,
            '">',
            '<div class="onoffswitch-inner"></div>',
            '<div class="onoffswitch-switch"></div>',
            '</label>',
            '</div>'
        ]);
        return html.join('');
    },

    toggleButton: function(options) {
        if (!options.id) options.id = "toggleButton" + Math.floor(100000*Math.random());
        if (!options.classes) options.classes = [];
        var html = [
            '<div class="onoffbutton ' + options.classes.join(" ") + '">',
            '<input type="checkbox" name="onoffbutton" class="onoffbutton-checkbox"'
        ];
        if (options.id) html.push(' id="'+options.id+'" ');
        if (options.checked) html.push('checked');
        html.push('><label class="onoffbutton-label" for="'+options.id+'"');
        if (options.size) {
            html = html.concat([
                'style="width:'+options.size[0]+'px;',
                'line-height:'+options.size[1]+'px;"'
            ]);
        }
        html.push('><div class="onoffbutton-on"');
        if (options.onBackgroundColor) {
            html.push('style="background-color:'+options.onBackgroundColor+';"');
        }
        html.push('>'+options.onContent+'</div>');
        html.push('<div class="onoffbutton-off"');
        if (options.offBackgroundColor) {
            html.push('style="background-color:'+options.offBackgroundColor+';"');
        }
        html = html.concat([
            '>'+options.offContent+'</div>',
            '</label>',
            '</div>'
        ]);
        return html.join('');
    },

    deleteButton: function() {
        return '<button class="delete-button fa fa-trash-o fa-lg"></button>';
    },

    addButton: function(id) {
        return '<i class="fa fa-plus add-button" id="' + id + '"></i>';
    },

    plusButton: function(id) {
        return [
            '<span class="fa-stack fa-lg delete-button2" id="',
            id ,
            '"><i class="fa fa-circle fa-stack"></i>',
            '<i class="fa fa-plus fa-stack"></i>',
            '</span>'
        ].join('');
    },

    phoneButton: function(id) {
        return [
            '<span class="fa-stack fa-lg phone-button" id="',
            id ,
            '"><i class="fa fa-square fa-stack-2x fa-background"></i>',
            '<i class="fa fa-phone fa-stack-1x fa-frontground"></i>',
            '</span>'
        ].join('');
    },
    removeButton: function (id) {
        return '<i class="fa fa-times remove-button" id="' + id + '"></i>';
    },

    crossButton: function(id) {
        return [
            '<span class="fa-stack delete-button2" id="',
            id ,
            '"><i class="fa fa-circle fa-stack-2x fa-background"></i>',
            '<i class="fa fa-times fa-stack-1x fa-frontground"></i>',
            '</span>'
        ].join('');
    },

    favoriteButton2: function(ative,id) {
        var html = [
            '<span class="fa-stack favorite-button2" id="',
            id ,
            '"><i class="fa fa-circle fa-stack-2x fa-background"></i>',
            '<i class="fa fa-star fa-stack-1x fa-frontground'];
            if (ative) html.push(' active');
            html.push('"></i></span>');
        return html.join('');
    },

    nextButton: function(id) {
        return '<i class="arrow fa fa-angle-right fa-lg import-contact" id="' + id + '"></i>';
    },

    favoriteButton: function(active) {
        var html = ['<i class="favorite-button fa fa-star fa-2x'];
        if (active) html.push(' active');
        html.push('"></i>');
        return html.join('');
    },

    button: function(options) {
        if (!options.id) options.id = "button" + Math.floor(100000*Math.random());
        if (!options.classes) options.classes = [];
        var html = ['<button class="button ' + options.classes.join(" ") + '" style="'];
        if (options.size) {
            html = html.concat([
                'width:'+options.size[0]+'px;',
                'height:'+options.size[1]+'px;',
                'line-height:'+options.size[1]+'px;'
            ]);
        }
        html.push('">'+options.content+'</button>');
        return html.join('');
    },

    itemFrame: function(marginLeft, marginRight){
        var realWidth = window.innerWidth - marginLeft - marginRight;

        return [
            '<div class="item-frame" style="width: ',
            realWidth,
            'px; margin-left: ',
            marginLeft,
            'px; margin-right: ',
            marginRight,
            'px"></div>'
        ].join('');
    },

    recentItemView: function(call) {
        var name;
        if (call.get('firstname') || call.get('lastname')) {
            name = call.get('firstname') + " <b>" + call.get('lastname') + "</b>";
        } else {
            name = call.get('email');
        }
        var icon = '';
        var missed = '';
        if (call.get('type') == 'outgoing')
            icon = '<i class="fa fa-sign-out"></i>';
        else {
            if (!call.get('success'))
                missed = "missed";
        }

        return [
            '<div style = " width: ',
            window.innerWidth,
            'px"><div class="source ',
            missed,
            '"><div class="call-type">',
            icon,
            '</div>',
            name,
            '<div class="call-time">',
            Helpers.timeSince(call.get('time')),
            '</div></div></div>'
        ].join('');
    },

    contactItemView: function(model) {
        var name;
        if (model.get('firstname') || model.get('lastname')) {
            name = [model.get('firstname'), ' <b>',  model.get('lastname') , '</b>'].join('');
        } else {
            name = model.get('email');
        }
        var contact = ['<div style = " width: ',
            window.innerWidth,
            'px"><div class="source">',
            name].join('');
        if (model.attributes.email) contact = [contact , '<i class="fa fa-envelope contact-icon"></i>'].join('');
        if (model.attributes.facebook) contact = [contact , '<i class="fa fa-facebook-square contact-icon"></i>'].join('');
        if (model.attributes.google) contact = [contact , '<i class="fa fa-google-plus-square contact-icon"></i>'].join('');
        contact = [contact, '</div></div>'].join('');
        return contact;
    },

    favoriteItemView: function(contact) {
        var name;
        var initial = "";
        if (contact.get('firstname') || contact.get('lastname')) {
            name = contact.get('firstname') + " <b>" + contact.get('lastname') + "</b>";
            if (contact.get('firstname')) initial = contact.get('firstname')[0];
            if (contact.get('lastname')) initial +=  contact.get('lastname')[0];
        } else {
            name = contact.get('email');
            if (name) initial = name[0];
        }

        return [
            '<div style = " width: ',
            window.innerWidth,
            'px"><div class="source"><div class="initial">',
            initial,
            '</div>',
            name,
            '</div></div>'
        ].join('');
    },

    headerItemView: function(isFirst,marginLeft,marginRight){
        var realWidth = window.innerWidth - marginLeft - marginRight;

        return [
            '<div class="header-view" style="width: ',
            realWidth,
            'px; margin-left: ',
            marginLeft,
            'px; margin-right: ',
            marginRight,
            'px">',
            isFirst,
            '</div>'
        ].join('');
    },


    editContactHeader: function(title) {
        return [
            '<button class="left close-button cancel-contact" id="close-button">Cancel</button><div>',
            title,
            '</div><button class="right close-button done-contact">Done</button>'
        ].join('');
    },

    recentsHeader: function() {
        return [
            '<button class="left clear-button" id="clear-button"></button>',
            '<div class="recent-toggle"><input type="radio" id="all" name="recents-toggle" value="all" checked>',
            '<label for="all" class="first" id="recent-toggle">all</label>',
            '<input type="radio" id="missed" name="recents-toggle" value="missed">',
            '<label for="missed" class="last" id="recent-toggle">missed</label></div>',
            '<button class="right edit-button" id="recent-edit-contact"></button>'
        ].join('');
    },

    favoriteHeader: function() {
        return '<button class="left edit-button" id="favorite-edit-contact"></button><div>Favorites</div>';
    },

    conversationInputBar: function() {
        return [
            '<div><button class="fa fa-comments-o menu-toggle-button fade"></button>',
            '<button class="fa fa-phone menu-end-button"></button>',
            '<textarea class="input-msg" name="message"></textarea>',
            '<button class="send-text-button">Send</button></div>'
        ].join('');
    }
};