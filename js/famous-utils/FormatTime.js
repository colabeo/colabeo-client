define(function(require, exports, module) {

    /**
     * @constructor
     */

    function FormatTime(iso_timestring, format_style) {
        var parts = iso_timestring.toString().match(/(\d+)/g);
        var js_date = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5], 0);
        var today = new Date();
        var seconds_since = (today.getTime()-js_date.getTime()) * 0.001;
        var minutes_since = parseInt(seconds_since/60, 10);
        var hours_ago = parseInt(minutes_since/60, 10);
        var days_since = parseInt(hours_ago/24, 10);
        var date_list = convert_date_to_human_readable(js_date);

        // Format styles:
        // 0 / undefined - full fuzzy time
        // 1 - only fuzy for the first hour, then return simple time

        // Provide a 1-10 context of how old something is. 1 is new, 10 is old
        var time_stack = 10;
        var timeago = '';

        if (minutes_since < 720) {
            // It's been less than 12 hours. Make it fuzzy
            if (minutes_since < 60) {
                // It's been less than an hour
                if (minutes_since < 2) {
                    timeago = "just now";
                    time_stack = 1;
                    return [timeago, time_stack];
                }

                if (minutes_since < 30) {
                    timeago = minutes_since + " minutes ago";
                    time_stack = 2;
                    return [timeago, time_stack];
                }

                if (minutes_since < 40) {
                    timeago = "about a half hour ago";
                    time_stack = 2;
                    return [timeago, time_stack];
                }

                if (minutes_since < 50) {
                    timeago = "about 45 minutes ago";
                    time_stack = 3;
                    return [timeago, time_stack];
                }

                timeago = "about an hour ago";
                time_stack = 4;
                return [timeago, time_stack];

            }
            else {
                // It was posted today, more than an hour ago
                if (format_style == 1) {
                    timeago = date_list[6] + ":" + date_list[7] + date_list[8];
                }
                else {
                    timeago = "earlier today at " + date_list[6] + ":" + date_list[7] + date_list[8];
                }

                time_stack = 5;
                return [timeago, time_stack];
            }
        }

        if (minutes_since < 1440) {
            // It's been more than 12 hours, but less than 24
            timeago = "yesterday at " + date_list[6] + ":" + date_list[7] + date_list[8];
            time_stack = 6;
            return [timeago, time_stack];
        }

        if (days_since >= 1 && days_since <= 2) {
            // This happened a day ago, yesterday
            timeago = "yesterday at " + date_list[6] + ":" + date_list[7] + date_list[8];
            time_stack = 7;
            return [timeago, time_stack];
        }

        if (days_since < 6) {
            // This happened within the past 5 days
            timeago = date_list[0] + " at " + date_list[6] + ":" + date_list[7] + date_list[8];
            time_stack = 8;
            return [timeago, time_stack];
        }

        if (days_since < 30) {
            // This happened within the past month

            if (format_style == 1) {
                timeago = date_list[3] + "/" + date_list[1] + " at " + date_list[6] + ":" + date_list[7] + date_list[8];
            }
            else {
                timeago = date_list[4] + " " + date_list[1] + date_list[2] + " around " + date_list[6] + date_list[8];
            }

            time_stack = 9;
            return [timeago, time_stack];
        }

        // It's been over a month, just give me a date that's useful
        timeago = format_long_time(date_list, today);
        time_stack = 10;
        return [timeago, time_stack];
    }

    function convert_date_to_human_readable(js_date) {
        var day = js_date.getDate();
        var day_str = js_date.getDay();
        var month = js_date.getMonth() + 1;
        var year = js_date.getFullYear();
        var hour = js_date.getHours();
        var min = js_date.getMinutes().toString();
        var ap = (hour < 12) ? 'am' : 'pm';

        if (min.length < 2) {
            min = "0" + min;
        }

        var day_list = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        var ith_map = {1: "st", 2: "nd", 3: "rd", 4: "th", 5: "th", 6: "th", 7: "th", 8: "th", 9: "th", 10: "th", 11: "th", 12: "th", 13: "th", 14: "th", 15: "th", 16: "th", 17: "th", 18: "th", 19: "th", 20: "th", 21: "st", 22: "nd", 23: "rd", 24: "th", 25: "th", 26: "th", 27: "th", 28: "th", 29: "th", 30: "th", 31: "st"};

        var month_map = {1: "Jan", 2: "Feb", 3: "Mar", 4: "April", 5: "May", 6: "June", 7: "July", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"};


        if (hour === 0) {
            hour = 12;
        }
        if (hour > 12) {
            hour = hour - 12;
        }

        return [day_list[day_str], day, ith_map[day], month, month_map[month], year, hour, min, ap];
    }

    function format_long_time(date_list, today) {
        // returns date as "Nov 1st 2012 at 5:33pm"
        // omit the year if it's the year we're currently in
        var now = today ? today : new Date();
        var timeago = (today.getFullYear() === date_list[5]) ?
            date_list[4] + " " + date_list[1] + date_list[2] :
            date_list[4] + " " + date_list[1] + date_list[2] + " " + date_list[5];

        return timeago;
    }

    module.exports = FormatTime;

});











