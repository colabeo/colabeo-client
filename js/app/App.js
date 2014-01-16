define(function(require, exports, module) {
    var View = require('famous/View');
    var EventHandler = require('famous/EventHandler');
    var OptionsManager = require('famous/OptionsManager');
    var RenderNode = require('famous/RenderNode');
    var Utility = require('famous/Utility');
    var Matrix = require('famous/Matrix');

    var HeaderFooterLayout = require('famous-views/HeaderFooterLayout');
    var EdgeSwapper = require('famous-views/EdgeSwapper');
    
    var NavigationBar = require('famous-widgets/NavigationBar');
    var TitleBar = require('famous-widgets/TitleBar');

    function App(options) {
        // extend from view
        View.apply(this, arguments);

        // create the layout
        this.layout = new HeaderFooterLayout();

        // create the header
        this.header = new TitleBar(this.options.header);

        // create the navigation bar
        this.navigation = new NavigationBar(this.options.navigation);

        // create the content area
        this.contentArea = new EdgeSwapper(this.options.content);

        // link endpoints of layout to widgets
        this.layout.id['header'].link(this.header);
        this.layout.id['footer'].link(Utility.transformInFront).link(this.navigation);
        this.layout.id['content'].link(Utility.transformBehind).link(this.contentArea);
        
        // assign received events to content area
        this.eventInput.pipe(this.contentArea);

        // navigation events are app events
        EventHandler.setOutputHandler(this, this.navigation);

        // declare the render nodes
        this._currentSection = undefined;
        this._sections = {};
        this._sectionTitles = {};

        // Initialize sections if they were passed at instantiation time
        this.options.sections && this.initSections(this.options.sections);

        // respond to the the selection of a different section
        this.navigation.on('select', function(data) {
            $('body').removeClass('editing');
            this._currentSection = data.id;
            this.header.show(this._sectionTitles[data.id]);
            this.contentArea.show(this._sections[data.id].get());
        }.bind(this));

        // assign the layout to this view
        this._link(this.layout);
    }
    App.prototype = Object.create(View.prototype);
    App.prototype.constructor = App;

    App.DEFAULT_OPTIONS = {
        header: {
            size: [undefined, 50],
            inTransition: true,
            outTransition: true,
            look: {
                size: [undefined, 50],
                classes: ['header']
            }
        },
        navigation: {
            size: [undefined, 50],
            direction: Utility.Direction.X,
            buttons: {
                onClasses: ['navigation', 'on'],
                offClasses: ['navigation', 'off'],
                inTransition: true,
                outTransition: true
            }
        },
        content: {
            inTransition: true,
            outTransition: true,
            overlap: true
        },
        inTransform: Matrix.identity,
        outTransform: Matrix.identity,
        inOpacity: 0,
        outOpacity: 0,
        inTransition:{duration: 500},
        outTransition:{duration: 200}
    };

    App.prototype.getState = function() {
        return this._currentSection;
    };

    App.prototype.section = function(id) {
        // create the section if it doesn't exist
        if(!(id in this._sections)) {
            this._sections[id] = new RenderNode();

            // make it possible to set the section's properties
            this._sections[id].setOptions = (function(options) {
                this._sectionTitles[id] = options.title;
                this.navigation.defineSection(id, {
                   content: '<span class="icon">' + options.navigation.icon + '</span><br />' + options.navigation.caption
                });
            }).bind(this);
        }
        return this._sections[id];
    };

    App.prototype.select = function(id) {
        this._currentSection = id;
        if(!(id in this._sections)) return false;
        this.navigation.select(id);
        return true;
    };

    // Initialize the sections that were passed in
    App.prototype.initSections = function(sections) {
        _.each(sections, function(item) {
            var id = item.title;
            this.section(id).setOptions({
                title: item.title,
                navigation: item.navigation
            });
            this.section(id).link(item);

            if(item.pipe) {
                item.pipe(this.eventInput);
            }
        }.bind(this));
    };

    module.exports = App;
});
