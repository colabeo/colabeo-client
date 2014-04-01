var exec = require('child_process').exec;
var fs = require('fs');

exec('famous build',
    function (error, stdout, stderr) {
        console.log(stdout);
//        console.log(stderr);
        var filename = 'build/build.js';
        var text = fs.readFileSync(filename, "utf8");
        text = text.replace(/\"use strict\"/gi,'\/\/"use strict"');
        fs.writeFileSync(filename, text, 'utf8');
    }
);

