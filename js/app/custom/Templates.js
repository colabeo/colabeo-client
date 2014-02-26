define(function(require, exports, module) {
    var TimeAgo        = require('famous-utils/TimeAgo');

    function toggleSwitch(id, checked, disabled) {
        var html = '<div class="onoffswitch">';
        html += '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="'+id+'" '
        if (checked) html += 'checked ';
        if (disabled) html += 'disabled ';
        html += '><label class="onoffswitch-label';
        if (disabled) html += ' disabled';
        html +='" for="'+id+'">';
        html += '<div class="onoffswitch-inner"></div>';
        html += '<div class="onoffswitch-switch"></div>';
        html += '</label>';
        html += '</div>';
        return html;
    }

    function toggleButton(options) {
        if (!options.id) options.id = "toggleButton" + Math.floor(100000*Math.random());
        if (!options.classes) options.classes = [];
        var html = '<div class="onoffbutton ' + options.classes.join(" ") + '">';
        html += '<input type="checkbox" name="onoffbutton" class="onoffbutton-checkbox"';
        if (options.id) html += ' id="'+options.id+'" ';
        if (options.checked) html += 'checked';
        html += '><label class="onoffbutton-label" for="'+options.id+'"';
        if (options.size) {
            html += 'style="width:'+options.size[0]+'px;';
            html += 'line-height:'+options.size[1]+'px;"';
        }
        html += '>';
        html += '<div class="onoffbutton-on"';
        if (options.onBackgroundColor) {
            html += 'style="background-color:'+options.onBackgroundColor+';"';
        }
        html += '>'+options.onContent+'</div>';
        html += '<div class="onoffbutton-off"';
        if (options.offBackgroundColor) {
            html += 'style="background-color:'+options.offBackgroundColor+';"';
        }
        html += '>'+options.offContent+'</div>';
        html += '</label>';
        html += '</div>';
        return html;
    }

    function button(options) {
        if (!options.id) options.id = "button" + Math.floor(100000*Math.random());
        if (!options.classes) options.classes = [];
        var html = '<button class="button ' + options.classes.join(" ") + '" style="';
        if (options.size) {
            html += 'width:'+options.size[0]+'px;';
            html += 'height:'+options.size[1]+'px;';
            html += 'line-height:'+options.size[1]+'px;';
        }
        html += '">'+options.content+'</button>';
        return html;
    }

    function deleteButton() {
        var html = '<button class="delete-button fa fa-trash-o fa-lg"></button>';
        return html;
    }

    function favoriteButton(active) {
        var html = '<button class="favorite-button fa fa-star fa-lg';
        if (active) html += ' active';
        html += '"></button>';
        return html;
    }
    function nextButton(id) {
        var html = '<i class="arrow fa fa-angle-right fa-lg import-contact" id="' + id + '"></i>';
        return html;
    }
    function addButton(id) {
        var html = '<i class="fa fa-plus add-button" id="' + id + '"></i>';
        return html;
    }
    function removeButton(id) {
        var html = '<i class="fa fa-times remove-button" id="' + id + '"></i>';
        return html;
    }
    function crossButton(id) {
        var html = ['<span class="fa-stack delete-button2" id="',
            id ,
            '"><i class="fa fa-circle fa-stack-2x fa-background"></i>',
            '<i class="fa fa-times fa-stack-1x fa-frontground"></i>',
            '</span>'].join('');
        return html;
    }
    function plusButton(id) {
        var html = ['<span class="fa-stack fa-lg delete-button2" id="',
            id ,
            '"><i class="fa fa-circle fa-stack"></i>',
            '<i class="fa fa-plus fa-stack"></i>',
            '</span>'].join('');
        return html;
    }
    function phoneButton(id) {
        var html = ['<span class="fa-stack fa-lg phone-button" id="',
            id ,
            '"><i class="fa fa-square fa-stack-2x fa-background"></i>',
            '<i class="fa fa-phone fa-stack-1x fa-frontground"></i>',
            '</span>'].join('');
        return html;
    }
    function recentsToggle() {
        var html = '<div class="recent-toggle"><input type="radio" id="all" name="recents-toggle" value="all" checked>';
        html += '<label for="all" class="first" id="recent-toggle">all</label>';
        html += '<input type="radio" id="missed" name="recents-toggle" value="missed">';
        html += '<label for="missed" class="last" id="recent-toggle">missed</label></div>';
        return html;
    }
    function itemFrame(marginLeft, marginRight){
        var realWidth = window.innerWidth - marginLeft - marginRight;
        var html = [
            '<div class="item-frame" style="width: ',
            realWidth,
            'px; margin-left: ',
            marginLeft,
            'px; margin-right: ',
            marginRight,
            '"></div>'
        ].join('');
        return html;
    }

    function recentItemView(call) {
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
        var html = [
            '<div style = " width: ',
            window.innerWidth,
            'px"><div class="source ',
            missed,
            '"><div class="call-type">',
            icon,
            '</div>',
            name,
            '<div class="call-time">',
            TimeAgo.parse(call.get('time')),
            ' ago</div></div></div>'
        ].join('');
        return html;
    }

    function favoriteItemView(contact) {
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
        var html = [
            '<div style = " width: ',
            window.innerWidth,
            'px"><div class="source"><div class="initial">',
            initial,
            '</div>',
            name,
            '</div></div>'
        ].join('');
        return html;
    };

    module.exports = {
        toggleSwitch: toggleSwitch,
        toggleButton: toggleButton,
        deleteButton: deleteButton,
        addButton: addButton,
        plusButton: plusButton,
        phoneButton: phoneButton,
        removeButton: removeButton,
        crossButton: crossButton,
        nextButton: nextButton,
        favoriteButton: favoriteButton,
        recentsToggle: recentsToggle,
        button: button,
        itemFrame: itemFrame,
        recentItemView: recentItemView,
        favoriteItemView: favoriteItemView
    }

});
