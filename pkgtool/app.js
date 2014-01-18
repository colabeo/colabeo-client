Famous(function(require, exports, module) 
{       
    var Engine = require('famous/Engine');        
    var RegisterEasing = require('famous-animation/RegisterEasing');      

    var mainCtx = Engine.createContext();
    mainCtx.setPerspective( 1000 );

    var uiCtx = Engine.createContext();
    uiCtx.setPerspective( 1000 );
    
    var GLScene = require('famous-scene/GLScene');
    var FM = require('famous/Matrix');
    var Modifier = require('famous/Modifier');
        
    var Utils = require('famous-utils/Utils'); 
    var Timer = require('famous-animation/Timer'); 
    
    var Easing = require('famous-animation/Easing'); 
    var ColorPalettes = require('famous-color/ColorPalettes');     
    var ColorPalette = require('famous-color/ColorPalette');     
    var Color = require('famous-color/Color');         

    var Vector = require('famous-math/Vector'); 

    var Camera = require('famous-gl/Camera');      
    var Scene = require('famous-gl/Scene'); 
    var Renderer = require('famous-gl/Renderer');    
    var Primitive = require('famous-gl/Primitive'); 
    var Material = require('famous-gl/Material');     
    var Texture = require('famous-gl/Texture');     
    var Light = require('famous-gl/Light'); 
    var Geometry = require('famous-gl/Geometry'); 
    var Mesh = require('famous-gl/Mesh'); 

    function ArtScene(options) 
    { 
        GLScene.apply(this, arguments);        

        this.autoUI = [
            {
                type: 'label',
                uiOptions: { 
                    content: 'Art Scene'
                }
            }
        ]; 
        
        var cam = new Camera();  
        cam.setDistance(-2000.0); 
        cam.setSensitivityZoom(20.0);
        cam.setDamping(0.99); 
        cam.setFlipY(true);     
        this.cam = cam; 

        this.palettes = ColorPalettes; 
        this.palette = this.palettes.getPalette(10); 
    }

    ArtScene.prototype = Object.create(GLScene.prototype);
    ArtScene.prototype.constructor = ArtScene;        
    ArtScene.DEFAULT_OPTIONS = {};     
    
    ArtScene.prototype.setup = function(gl)
    {                                
        this.renderer = new Renderer({                                  //Renders a scene with the proper camera, etc
            context: gl
        });

        this.renderer.enableAdditiveBlending(); 
        this.renderer.setDepthTesting(false); 
        this.renderer.setLineWidth(2); 
        this.renderer.setPointSize(2); 
        
        this.scene = new Scene();          
    };     


    ArtScene.prototype.draw = function(gl){                                        
        this.renderer.render({
            scene: this.scene, 
            camera: this.cam
        });             
    }; 
    
    var Interface = require('core/Interface');

    var ui = new Interface();    
    var artScene = new ArtScene();
    ui.setCurrentObject(artScene);

    var autoUI = ui.getAutoUI(); 
    artScene.setUIElementsMap ? artScene.setUIElementsMap(autoUI.getUIElementsMap()) : undefined;     
    // ui.hideAllUI(); 

    Engine.pipe( artScene ); 
    mainCtx.link( artScene );

    Engine.pipe( ui ); 
    uiCtx.link( ui );
});
