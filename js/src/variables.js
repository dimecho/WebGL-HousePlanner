/*
WebGL HousePlanner v1.0
Preview: http://houseplanner.iroot.ca
Source Code: https://github.com/poofik/webgl-houseplanner

TODO:
- [difficulty: 10/10 progress: 15%] 2D floor plan gyometry drafting
- [difficulty: 3/10  progress: 90%] 2D floor plan select and overlay external draft image
- [difficulty: 8/10  progress: 10%] Toolbar edit functions for 2D floor plans
- [difficulty: 9/10  progress: 25%] Make converter function to "extrude" 2D into 3D walls
- [difficulty: 6/10  progress: 90%] Make front walls 80% transparent in 3D rotation
- [difficulty: 8/10  progress: 50%] 3D movable objects and collision detection
- [difficulty: 9/10  progress: 10%] 3D menu objects draggable with "pop-up" or star burst effect
- [difficulty: 2/10  progress: 80%] 3D objects sub-edit menu (textures/delete/duplicate)
- [difficulty: 2/10  progress: 60%] Categorize and populate 3D Menu items
- [difficulty: 8/10  progress: 20%] 3D Menu functions for draggable objects
- [difficulty: 5/10  progress: 40%] 3D Floor ground base glass reflective
- [difficulty: 6/10  progress: 80%] 3D Exterior View ability to select floors (+ flying-in animationeffect)
- [difficulty: 6/10  progress: 0%]  Keep history and implement Undo/Redo
- [difficulty: 6/10  progress: 80%] Make House Ground editable - angle/terain/square
    http://cjcliffe.github.io/CubicVR.js/experiment/landscape_editor/landscape_edit_500m.html
    http://skeelogy.github.io/skarf.js/examples/skarf_trackThreejsScene.html
    http://danni-three.blogspot.ca/2013/09/threejs-heightmaps.html
    http://www.chandlerprall.com/webgl/terrain/
- [difficulty: 4/10  progress: 60%]  Ability to save scene 3D & 2D
- [difficulty: 5/10  progress: 50%]  Ability to open scene 3D & 2D
- [difficulty: 6/10  progress: 0%]   Keep history and implement Undo/Redo
- [difficulty: 6/10  progress: 98%]  3D Exterior View create night scene atmosphere with proper lights
- [difficulty: 8/10  progress: 100%] 3D Exterior View auto rotate-snap on ground angle
- [difficulty: 4/10  progress: 100%] Make a nice rainbow glow for 3D house exterior view - idea came after a 2 second glitch with video card :)
- [difficulty: 8/10  progress: 2%]   Implement room agmented reality  https://github.com/bhollis/aruco-marker
- [difficulty: 9/10  progress: 5%]   Implement Physics with collision detection
- [difficulty: 9/10  progress: 80%]  Replace clouds with Shaders and add sun rays! 
    http://jabtunes.com/labs/3d/clouds/clouds_godrays_controls.html
    http://www.lab4games.net/zz85/blog/2014/11/08/exploring-simple-noise-and-clouds-with-three-js/
*/

var scene3D; //Three.js Canvas
var scene3DCube; //Three.js Canvas
var scene3DPanorama; //Three.js Canvas
var scene2D; //Fabric.js Canvas
var scene2DAdvanced; //Fabric.js Canvas
var physics3D; //Cannon.js Engine (collisions and other cool stuff)

var dpr;
var renderer, rendererCube, rendererPanorama;

var rendererQuad = [4];
var camera3DQuad = [4];
var camera3DQuadGrid;

var scene3DHistory = [];

var scene3DRoofContainer; //Contains Roof Design
var scene3DHouseContainer; //Contains all Exterior 3D objects by floor (trees,fences)
var scene3DHouseGroundContainer; //Grass Ground - 1 object
var scene3DHouseFXContainer; //Visual Effects container (user not editable/animated) - fying bugs/birds/rainbows
var scene3DFloorGroundContainer; //Floor Ground - 1 object
var scene3DPanoramaContainer;
var scene3DCutawayPlaneMesh; //Virtual mesh used to detect collisions "cut-aways" for front walls
var scene3DLevelGroundContainer; //Floor Level arrengment Ground - 1 object
var scene3DLevelWallContainer; //Floor Level arrengment Ground - 1 object
var scene3DFloorFurnitureContainer = []; //Three.js contains all Floor 3D objects by floor (sofas,tables)
//var scene3DAxisHelper;
//var scene3DFloorOtherContainer = []; //Three.js contains all other objects, cameras, notes
var scene3DFloorMeasurementsContainer = []; //Three.js contains floor measurements: angles, wall size - lines & text (note: objects have their own measurement meshes)
var scene3DFloorWallContainer = []; //Three.js 3D Layer contains all walls by floor (Reason for multidymentional array -> unique wall coloring) - extracted from scene2DWallGeometry & scene2DWallDimentions
var scene3DFloorDoorContainer = [];
var scene3DFloorWindowContainer = [];
var scene3DFloorShapeContainer = []; //Three.js 3D Layer contains floor mesh+textures (multiple floors by floor)
var scene2DFloorShape;
var scene2DFloorDraftPlanImage = []; //2D Image for plan tracing for multiple floors

var scene3DPivotPoint; // 3D rotational pivot point - 1 object
//var scene3DNote; // Sticky note visual 3D effect - 1 object
var scene3DCubeMesh; // Orange cube for visual orientation

var sceneAmbientLight;
var sceneDirectionalLight;
var sceneSpotLight;
//var sceneHemisphereLight;
//var sceneParticleLight;
//var scenePointLight;

var controls3D; //Multi-Class three.js controls library objects - Orbit, FirstPerson and Transform
var camera3D;
var camera3DPositionCache;
var camera3DPivotCache;
var camera3DCube;
var camera3DPanorama;
//var camera3DMirrorReflection;

var groundGrid;
var groundMesh;
var skyMesh;
var skyFloorMesh;
var weatherSkyGeometry;
var weatherSkyMaterial;
var weatherSkyCloudsMesh;
var weatherSkyRainbowMesh;
//var weatherSkyDayMesh;
//var weatherSkyNightMesh;

var SESSION = '';
//var RUNMODE = 'local'; //database
//var VIEWMODE = 'designer'; //public
var RADIAN = (Math.PI / 180);
var SCENE = 'house';
var TOOL3D = 'view';
var TOOL3DINTERACTIVE = '';
var TOOL3DLANDSCAPE = 'rotate';
var TOOL3DFLOOR = 'measure';
var TOOL2D = 'vector';
var WEATHER = 'sunny';
var DAY = 'day';
var FLOOR = 1; //first floor selected default
var REALSIZERATIO = 1; //Real-life ratio (Metric/Imperial)
var SelectedObject = null;
var SelectedNote = null;
var SelectedPicture = null;
var SelectedWall = null;

var leftButtonDown = false;
var rightButtonDown = false;
var clickTime;
var clickMenuTime;
var doubleClickTime;

var zoom2Dimg, 
    zoom2Dheight = 80, 
    zoom2Dwidth = 241, 
    zoom2DCTX = null, 
    zoom2DSlider = null; //2D zoom control visuals
var zoom2D = 1; // Global remembering previous zoom factor

//var keys = { SP: 32, W: 87, A: 65, S: 83, D: 68, UP: 38, LT: 37, DN: 40, RT: 39 };
//var keysPressed = {};

var scene2DDrawLineGeometry = []; //Temporary holder for mouse click and drag drawings
var scene2DDrawLine; //2D Line form with color/border/points
//var scene2DDrawLineContainer = []; //Container of line geometries - need it as a collection for "quick hide"
var scene2DWallMesh = []; //Fabric.js line data
var scene2DFloorMesh = []; //Fabric.js line data - floor shape subdevide lines
var scene2DDoorMesh = []; //Fabric.js group line data (doors)
var scene2DWindowMesh = []; //Fabric.js group line data (windows)
var scene2DInteriorMesh = []; //Fabric.js svg data (furniture)
var scene2DExteriorMesh = []; //Fabric.js svg data (trees)
var scene2DDrawLine; //Fabric.Line - used by mousedown/mousemove/mouseup
var scene2DWallDimentions = []; //Multidymentional array, contains real-life (visual) dimentions for scene2DWallMesh [width,length,height,height-angle,angle]

var scene3DWallInteriorTextureDefault; //Wall Interior Default Texture
var scene3DWallExteriorTextureDefault; //Wall Exterior Default Texture
var scene3DWallInteriorTextures = []; //Wall Interior Array Textures
var scene3DWallExteriorTextures = []; //Wall Exterior Array Textures

var scene2DWallRegularMaterial;
var scene2DWallRegularMaterialSelect;
var scene2DWallBearingMaterial;
var scene2DWallBearingMaterialSelect;

var physics3DContainer; //Fake 3D objects (CANNON.Box) that get passed to Cannon Engine

var animation = [];
var scene3DAnimateRotate = false;
var requestAnimationID;
/*
var particlePivot;
var particlePivotEmitter;
var particleWeather;
*/

var settings = { sunlight : false, clouds: true, rainbow: true, panorama_day: "2056", panorama_night: "2057", autorotate: false };

//var particleClouds;
var mouse; //THREE.Vector2()
var touch; //THREE.Vector2()
var target; //THREE.Vector3();
var clock;
//var engine;
//var manager;
var projector;
var vector;
var geometry;
var material;
var texture;
var mesh;

var terrain3D;
var terrain3DMaterial;
//var terrainShader;

var fileReader; //HTML5 local file reader
//var progress = document.querySelector('.percent');

//var colliderSystem = [];
var getScreenshotData = false;

var FXAAPass;
var SSAOPass;
var effectComposer;
var depthMaterial, depthRenderTarget;
var depthScale = 1.0;
var FXAAProcessing = { enabled : true}; // renderMode: 0('framebuffer'), 1('onlyAO')
var SSAOProcessing = { enabled : false, renderMode: 0 }; // renderMode: 0('framebuffer'), 1('onlyAO')
