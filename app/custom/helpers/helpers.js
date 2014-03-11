module.exports = {
    timeAgo: function(time){
        var now = Date.now();
        var difference = now - time;
        var minute = 60000;
        var hour = 60 * minute;
        var day = 24 * hour;

        if (difference < minute) {
            return "Just Now"
        } else if (difference < hour) {
            var minutes = ~~(difference/minute);
            return minutes + "m ago";
        } else if (difference < day) {
            var hours = ~~(difference/hour);
            return hours + "h ago";
        } else {
            var days = ~~(difference/day);
            return days + "d ago";
        }
    },
    timeSince: function(time){
        var now = Date.now();
        var difference = now - time;
        var minute = 60000;
        var hour = 60 * minute;
        var day = 24 * hour;

        if (difference < minute) {
            return "Just Now"
        } else if (difference < hour) {
            var minutes = ~~(difference/minute);
            return minutes + "m ago";
        } else if (difference < day) {
            var hours = ~~(difference/hour);
            return hours + "h ago";
        } else {
            var days = ~~(difference/day);
            return days + "d ago";
        }
    },
    capitalize: function(string) {
        return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
    },
    // functions that generate constant results
    isDev: _.memoize(function(){
        return window.location.host.indexOf('localhost:3')==0;
    }),
    isMobile: _.memoize(function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    })
};