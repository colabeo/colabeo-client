define(function(require, exports, module) {

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
        var html = '<button class="delete-button fa fa-minus"></button>';
        return html;
    }

    function favoriteButton(active) {
        var html = '<button class="favorite-button fa fa-star fa-lg';
        if (active) html += ' active';
        html += '"></button>';
        return html;
    }

    function recentsToggle() {
        var html = '<div class="recent-toggle"><input type="radio" id="all" name="recents-toggle" value="all" checked>';
        html += '<label for="all" class="first" id="recent-toggle">all</label>';
        html += '<input type="radio" id="missed" name="recents-toggle" value="missed">';
        html += '<label for="missed" class="last" id="recent-toggle">missed</label></div>';
        return html;
    }
    module.exports = {
        toggleSwitch: toggleSwitch,
        toggleButton: toggleButton,
        deleteButton: deleteButton,
        favoriteButton: favoriteButton,
        recentsToggle: recentsToggle,
        button: button
    }

});
