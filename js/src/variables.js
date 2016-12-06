var engine3D = window.engine3D || {};
var engine2D = window.engine2D || {};
var engineGUI = window.engineGUI || {};

var json = { info:{}, settings:{}, weather:{}, terrain:[], roof:[], floor:[], ceiling:[], furniture:[], house:[], plan:[] };
var jsonindex = { id:'', name:'', plan:[1,2,3] };

var rendererQuad = [4];
var camera3DQuad = [4];
var camera3DQuadGrid;

var scene3DRoofContainer; //Contains Roof Design
var scene3DHouseContainer; //Contains all Exterior 3D objects by floor (trees,fences)
var _scene3DHouseGroundContainer; //THREE.Scene  - used for Geometry() refference with ThreeBSP
var scene3DHouseGroundContainer; //THREE.Object3D - automatically converted to  BufferGeometry()
var scene3DHouseFXContainer; //Visual Effects container (user not editable/animated) - fying bugs/birds/rainbows
var scene3DFloorGroundContainer; //Floor Ground - 1 object
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
var scene3DCeilingShapeContainer = [];
var scene2DFloorShape = [];
var scene2DFloorDraftPlanImage = []; //2D Image for plan tracing for multiple floors

//var scene3DNote; // Sticky note visual 3D effect - 1 object
var scene3DCubeMesh; // Orange cube for visual orientation

var sceneAmbientLight;
var sceneDirectionalLight;
var sceneSpotLight;
var sceneHemisphereLight;
//var sceneParticleLight;
//var scenePointLight;

var camera3DPositionCache;
var camera3DPivotCache;
//var camera3DMirrorReflection;

var skyMesh;
var skyFloorMesh;

var weatherSkyGeometry;
var weatherSkyMaterial;
//var weatherRainbowMaterial;
var weatherSkyCloudsMesh;
var weatherSkyRainbowMesh;
//var weatherSkyDayMesh;
//var weatherSkyNightMesh;

var TOOL3DINTERACTIVE = '';
var TOOL3DLANDSCAPE = 'rotate';
var TOOL3DFLOOR = 'measure';
var TOOL2D = 'vector';
var FLOOR = 1; //first floor selected default
var REALSIZERATIO = 1; //Real-life ratio (Metric/Imperial)
var SelectedObject = null;
var SelectedNote = null;
var SelectedPicture = null;
var SelectedWall = null;

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

var scene2DWallGroup = [];
var scene2DWallPointGroup = [];
var scene2DWindowGroup = [];
var scene2DDoorGroup = [];
var scene2DLabelGroup = [];

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
var mouse;          //THREE.Vector2()
var touch;          //THREE.Vector2()
var target;         //THREE.Vector3();
var clock;          //THREE.Clock();
var projector;
var vector;
var geometry;
var material;
var texture;
var mesh;

engineGUI.session = '';
engineGUI.scene = 'house';
engineGUI.floor = 1;
engineGUI.mousedrag = false;
engineGUI.mouseleft = false;
engineGUI.mouseright = false;
engineGUI.spinner = $("<div>");

engine2D.scene;             //paper.Group();
engine2D.canvas;            //getElementById("engine2D");
engine2D.history = [];      //Array();

engine3D.id = '';
engine3D.renderer;          //THREE.WebGLRenderer();
engine3D.rendererCube;      //THREE.WebGLRenderer();
engine3D.scene;             //THREE.Scene();
engine3D.sceneCube;         //THREE.Scene();
engine3D.camera;            //THREE.PerspectiveCamera();
engine3D.cameraCube;        //THREE.PerspectiveCamera();
engine3D.controls;          //THREE.OrbitControls();
engine3D.grid;              //THREE.GridHelper();
engine3D.pivot;             //THREE.Object3D();
engine3D.jsonLoader;        //THREE.LoadingManager();
engine3D.fontLoader;        //THREE.FontLoader();
engine3D.textureLoader;     //THREE.TextureLoader();
//engine3D.physics;         //CANNON.World();
//engine3D.collide = [];    //Array()
engine3D.terrain;           //THREE.Mesh();
engine3D.terrainMaterial;   //THREE.ShaderMaterial();
engine3D.renderPass;        //THREE.RenderPass();
engine3D.FXAAPass;          //THREE.ShaderPass();
engine3D.SSAOPass;          //THREE.ShaderPass();
engine3D.effectComposer;    //THREE.EffectComposer();
engine3D.depthMaterial;     //THREE.MeshDepthMaterial();
engine3D.depthRenderTarget; //THREE.WebGLRenderTarget()
engine3D.FXAAProcessing = { enabled : true };
engine3D.SSAOProcessing = { enabled : false, renderMode: 0 }; // renderMode: 0('framebuffer'), 1('onlyAO')
engine3D.history = [];      //Array();
