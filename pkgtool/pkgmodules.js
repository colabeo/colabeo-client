// renames famous packages

var fs = require('fs');
var path = require('path');
var util = require('util');

var skipPkg = ['lib', 'res', 'loader', 'plugin'];
var skipFiles = ['RenderArbiter.js', 'Fader.js', 'ImageFader.js', 'SatelliteMenu.js', 'SelectionBall.js', 'ArtScene.js', 'MediaReader.js', 'CardsLayout.js', 'EdgeSwapper.js', 'GridLayout.js', 'HeaderFooterLayout.js', 'PhysicsTracker.js', 'LeapEmitter.js'];
var shims = {
    'lib/functionPrototypeBind': {},
    'lib/classList': {},
    'lib/requestAnimationFrame': {},
    'lib/zepto.min': {},

    '../bower_components/underscore/underscore-min': {},
    '../bower_components/backbone/backbone-min': {},
    '../bower_components/handlebars/handlebars.runtime.min': {},
 
    'lib/backboneLocalStorage': {},
    'lib/firebase': {},
    'lib/backboneFirebase': {},
    'lib/peer.min': {},
    'lib/notify': {},
    'lib/oauthpopup': {}
};

var packages = _walkDir('../js');

function _walkDir(dirName, prefix, result) {
    if(!prefix) prefix = '';
    if(!result) result = [];
    var contents = fs.readdirSync(dirName);
    for(var i = 0; i < contents.length; i++) {
        if(skipPkg.indexOf(contents[i]) >= 0) continue;
        if(fs.statSync(dirName + '/' + contents[i]).isDirectory() && contents[i].charAt(0) != '.') {
            // more specific directories first to avoid conflicts later
            _walkDir(dirName + '/' + contents[i], prefix + contents[i] + '/', result);
            result.push(prefix + contents[i]);
        }
    }
    return result;
}

var modules = [];
for(var j = 0; j < packages.length; j++) {
    var pkgName = packages[j];
    var dirName = '../js/' + pkgName;
    var dirFiles = fs.readdirSync('../js/' + pkgName);
    for(var i = 0; i < dirFiles.length; i++) {
        if(skipFiles.indexOf(dirFiles[i]) >= 0) continue;
        if(dirFiles[i].charAt(0) != '.' && path.extname(dirFiles[i]) == '.js') {
            modules.push(packages[j] + '/' + path.basename(dirFiles[i], '.js'));
        }
    }
}

function camelCaseFromDash(str) {
    return str.replace( /-([a-z])/ig, function(match, letter) {
        return letter.toUpperCase();
    });
}

function startCap(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
};

function outputWrapper(filename) {
    var lines = [
        'define(function(require, exports, module) {',
        'var Famous = function(cb) { cb.call(this, require) };'
    ];
    var registeredPackages = [];
    for(var i = 0; i < modules.length; i++) {
        var modName = modules[i];
        var varName = startCap(modName.substring(modName.indexOf('/') + 1));
        varName = varName.replace('/', '_');
        var pkgName = startCap(camelCaseFromDash(modName.substring(0, modName.indexOf('/'))));
        if(registeredPackages.indexOf(pkgName) < 0) {
            lines.push('Famous.' + pkgName + ' = {};');
            registeredPackages.push(pkgName);
        }
        lines.push('Famous.' + pkgName + '.' + varName + ' = require(\'' + modName + '\');');

    };
    lines.push('module.exports = Famous; });');
    fs.writeFile(filename, lines.join('\n'));
}

outputWrapper('../js/main.js');

util.puts('({');
util.puts("baseUrl: '../js/',");
util.puts('name: \'lib/almond\',');
util.puts('include: ' + JSON.stringify(Object.keys(shims).concat('main')) + ',');
util.puts('insertRequire: ' + JSON.stringify(Object.keys(shims).concat('main')) + ',');
util.puts('shim: ' + JSON.stringify(shims) + ',');
util.puts('findNestedDependencies: true,');
util.puts('optimize: \'uglify2\',');
util.puts('wrap: {startFile: \'start.frag\', endFile: \'end.frag\'},');
util.puts('normalizeDirDefines: \'all\'');
util.puts('})');
