var engine3D = window.engine3D || {};
var engine2D = window.engine2D || {};
var engineGUI = window.engineGUI || {};

var json = { info:{}, settings:{}, weather:{}, terrain:[], roof:[], floor:[], ceiling:[], furniture:[], house:[], plan:[] };
var jsonindex = { id:'', name:'', plan:[1,2,3] };

var scene3DCutawayPlaneMesh; //Virtual mesh used to detect collisions "cut-aways" for front walls
var scene3DLevelGroundContainer; //Floor Level arrengment Ground - 1 object
var scene3DLevelWallContainer; //Floor Level arrengment Ground - 1 object
var scene3DFloorFurnitureContainer = []; //Three.js contains all Floor 3D objects by floor (sofas,tables)
//var scene3DAxisHelper;
//var scene3DFloorOtherContainer = []; //Three.js contains all other objects, cameras, notes
var scene3DFloorMeasurementsContainer = []; //Three.js contains floor measurements: angles, wall size - lines & text (note: objects have their own measurement meshes)
var scene3DFloorDoorContainer = [];
var scene3DFloorWindowContainer = [];
var scene3DFloorShapeContainer = []; //Three.js 3D Layer contains floor mesh+textures (multiple floors by floor)
var scene3DCeilingShapeContainer = [];

//var scene3DNote; // Sticky note visual 3D effect - 1 object
var scene3DCubeMesh; // Orange cube for visual orientation

var camera3DPositionCache;
var camera3DPivotCache;

var SelectedObject = null;
var SelectedNote = null;
var SelectedPicture = null;
var SelectedWall = null;

var zoom2Dimg,
    zoom2Dheight = 80,
    zoom2Dwidth = 241,
    zoom2DCTX = null,
    zoom2DSlider = null; //2D zoom control visuals
var zoom2D = 1; // Global remembering previous zoom factor

//var keys = { SP: 32, W: 87, A: 65, S: 83, D: 68, UP: 38, LT: 37, DN: 40, RT: 39 };
//var keysPressed = {};

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

var scene3DWallInteriorTextureDefault; //Wall Interior Default Texture
var scene3DWallExteriorTextureDefault; //Wall Exterior Default Texture
var scene3DWallInteriorTextures = []; //Wall Interior Array Textures
var scene3DWallExteriorTextures = []; //Wall Exterior Array Textures

var scene2DWallRegularMaterial;
var scene2DWallRegularMaterialSelect;
var scene2DWallBearingMaterial;
var scene2DWallBearingMaterialSelect;

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
engineGUI.clickTime;            //setTimeout();
engineGUI.clickMenuTime;        //setTimeout();
engineGUI.doubleClickTime;      //setTimeout();

engine2D.scene;                 //paper.Group();
engine2D.canvas;                //getElementById("engine2D");
engine2D.floor = [];            //paper.Group();
engine2D.draftPlan = [];        //paper.Raster();
engine2D.history = [];          //Array();
engine2D.tool = 'vector';

engine3D.id = '';
engine3D.renderer;              //THREE.WebGLRenderer();
engine3D.rendererCube;          //THREE.WebGLRenderer();
engine3D.rendererQuad = [4];    //THREE.WebGLRenderer();
engine3D.scene;                 //THREE.Scene();
engine3D.sceneCube;             //THREE.Scene();
engine3D.camera;                //THREE.PerspectiveCamera();
engine3D.cameraCube;            //THREE.PerspectiveCamera();
engine3D.cameraQuad = [4];      //THREE.OrthographicCamera();
//engine3D.cameraMirror;        //THREE.CubeCamera();
engine3D.controls;              //THREE.OrbitControls();
engine3D.grid;                  //THREE.GridHelper();
engine3D.pivot;                 //THREE.Object3D();
engine3D.jsonLoader;            //THREE.LoadingManager();
engine3D.fontLoader;            //THREE.FontLoader();
engine3D.textureLoader;         //THREE.TextureLoader();
//engine3D.physics;             //CANNON.World();
//engine3D.physicsObject;       //Fake 3D objects (CANNON.Box) that get passed to Cannon Engine
//engine3D.collide = [];        //Array();
engine3D.terrain;               //THREE.Mesh();
engine3D.terrainMaterial;       //THREE.ShaderMaterial();
engine3D.renderPass;            //THREE.RenderPass();
engine3D.FXAAPass;              //THREE.ShaderPass();
engine3D.SSAOPass;              //THREE.ShaderPass();
engine3D.effectComposer;        //THREE.EffectComposer();
engine3D.depthMaterial;         //THREE.MeshDepthMaterial();
engine3D.depthRenderTarget;     //THREE.WebGLRenderTarget();
engine3D.FXAAProcessing = { enabled : true };
engine3D.SSAOProcessing = { enabled : false, renderMode: 0 }; // renderMode: 0('framebuffer'), 1('onlyAO')
engine3D.measurements = 1;      //Ratio (Metric/Imperial)
engine3D.history = [];          //Array();
engine3D.skyHouse;              //THREE.Object3D();
engine3D.skyFX;                 //THREE.Object3D();
engine3D.skyFloor;              //THREE.Object3D();
engine3D.roof;                  //THREE.Object3D();
engine3D.house;                 //THREE.Object3D();
engine3D._groundHouse;          //THREE.Geometry(); - ThreeBSP Geometry
engine3D.groundHouse;           //THREE.Object3D();
engine3D.groundFloor;           //THREE.Object3D();
engine3D.lightAmbient;          //THREE.AmbientLight();
engine3D.lightDirectional;      //THREE.DirectionalLight();
engine3D.lightSpot;             //THREE.SpotLight();
engine3D.lightHemisphere;       //THREE.HemisphereLight();
//engine3D.lightParticle;
//engine3D.lightPoint;
engine3D.floor = [];            //THREE.Object3D();
engine3D.walls = [];            //THREE.Object3D();
engine3D.tool = '';             
