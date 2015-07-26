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

//"use strict";

var scene3D; //Three.js Canvas
var scene3DCube; //Three.js Canvas
var scene3DPanorama; //Three.js Canvas
var scene2D; //Fabric.js Canvas
var scene2DAdvanced; //Fabric.js Canvas
var physics3D; //Cannon.js Engine (collisions and other cool stuff)

var composer, dpr, effectFXAA;
var renderer, rendererCube, rendererPanorama;

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
var camera3DQuad = [3];
var camera3DQuadGrid;
var camera3DCube;
var camera3DPanorama;
//var camera3DMirrorReflection;

var groundGrid;
var groundMesh;
//var glowMesh;

var skyMesh;
//var weatherSkyDayMesh;
//var weatherSkyNightMesh;
var weatherSkyGeometry;
var weatherSkyMaterial;
var weatherSkyCloudsMesh;
var weatherSkyRainbowMesh;

var SESSION = '';
var RUNMODE = 'local'; //database
var VIEWMODE = 'designer'; //public
var RADIAN = (Math.PI / 180);
var SceneAnimate = false;
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
var ViewNoteText = "";

var leftButtonDown = false;
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
var requestAnimationID;
/*
var particlePivot;
var particlePivotEmitter;
var particleWeather;
*/

var options = { sunlight : false, clouds: true, rainbow: true };

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
var zip;

//var stats;

var terrain3D;
var terrain3DMaterial;
var terrain3DRawHillData = [];
var terrain3DRawValleyData = [];

var fileReader; //HTML5 local file reader
//var progress = document.querySelector('.percent');

//var colliderSystem = [];
var getScreenshotData = false;

function init(runmode,viewmode) {

    if (!Detector.webgl)
    {
        //Detector.addGetWebGLMessage();
        var html = "<br/><br/><br/><div><center><img src='images/webgl.gif' /><h1>Looks like you broke the Internet!</h1><br/><h2>...your WebGL not enabled?</h2>";

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
            $('body').append(html + "<br/><br/>You are running Internet Explorer, the browser does not support WebGL, please install one of these popular browsers<br/><br/><a href='http://www.mozilla.org/en-US/firefox'><img src='images/firefox.png'/></a> <a href='http://www.google.ca/chrome'><img src='images/chrome.png'/></a></center></div>");
        }else if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
            $('body').append(html + "<img src='images/firefox-webgl.png'/></center></div>");
        //}else  if (/Version\/[\d\.]+.*Safari/.test(navigator.userAgent)){
            //$('body').append(html + "<img src='images/safari-webgl.png'/></center></div>");
        }
        $("#menuTop").hide();
        $("#menuBottom").hide();

        document.getElementsByTagName("body")[0].style.overflow = "auto";
        document.getElementsByTagName("html")[0].style.overflow = "auto";
        return;
    }

    $('#pxs_container').parallaxSlider();
    
    if (getCookie("firstTimer") === null)
    {
        createCookie("firstTimer","1",15);
        window.location.href = "#start";
    }
    else
    {
        window.location.href = "#scene";
    }

	RUNMODE = runmode;
	VIEWMODE = viewmode;

    if(RUNMODE == "local")
    {
        $("#menuTopItem12").hide(); //Share
        $("#menuTopItem15").hide(); //Login
    }

    $("#menuTop").show();
    $("#menuBottom").show();

    // workaround for chrome bug: http://code.google.com/p/chromium/issues/detail?id=35980#c12
    if (window.innerWidth === 0) {
        window.innerWidth = parent.innerWidth;
        window.innerHeight = parent.innerHeight;
    }

    /*
	http://www.ianww.com/blog/2012/12/16/an-introduction-to-custom-shaders-with-three-dot-js/
	huge improvement in smoothness of the simulation by writing a custom shader for my particle system.
	This effectively moved all the complex position calculations for particles to the GPU, which went
	a long way toward ensuring the speed and reliability of the simulation. Custom shaders are written in GLSL,
	which is close enough to C that it’ s not too difficult to translate your math into.
	*/

    
    /*
    scene2D = new THREE.Scene();
    scene2D = new Kinetic.Stage({
        container: 'HTMLCanvas',
        width: window.innerWidth,
        height: window.innerHeight,
        listening: true
    });
    */
    scene2D = new fabric.Canvas('fabricjs', {
        isDrawingMode: false,
        isTouchSupported: true,
        selection: false,
        //preserveObjectStacking: true,
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    if (scene2D.freeDrawingBrush) {
        scene2D.freeDrawingBrush.name = "freedraw";
        scene2D.freeDrawingBrush.color = "#000";
        scene2D.freeDrawingBrush.width = 8; //parseInt(drawingLineWidthEl.value, 10) || 1;
        scene2D.freeDrawingBrush.shadowBlur = 0;
        //scene2D.freeDrawingCursor='url(http://ani.cursors-4u.net/movie/mov-2/mov130.cur),default';
    }

    //$('#canvas_container').css('overflow-x', 'scroll');
    //$('#canvas_container').css('overflow-y', 'scroll'); //'hidden');

    //scene2D.renderAll();
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    fabric.Object.prototype.transparentCorners = false;

    projector = new THREE.Projector();
    //zip = new JSZip();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    touch = new THREE.Vector2();
    target = new THREE.Vector3();

    sceneNew();

    scene3DPivotPoint = new THREE.Object3D();

    var geometry = new THREE.BoxGeometry( 15, 15, 3 ); //new THREE.PlaneGeometry(15, 15,3);
    geometry.computeBoundingBox();
    material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    scene3DCutawayPlaneMesh = new THREE.Mesh(geometry, material);

    /*
    particlePivot = new SPE.Group({});
    particleWeather = new SPE.Group({});
    //weatherRainParticle = new SPE.Group({});

    // Create particle emitter 0
    particlePivotEmitter = new SPE.Emitter( {
        type: 'cube',
        particleCount: 30, //particlesPerSecond
        position: new THREE.Vector3(0, 0, 0),
        positionSpread: new THREE.Vector3( 0, 0, 0 ),
        acceleration: new THREE.Vector3( 0, 0, 0 ),
        accelerationSpread: new THREE.Vector3( 0, 0, 0 ),
        velocity: new THREE.Vector3( 0, 3, 0 ),
        velocitySpread: new THREE.Vector3(3, 0, 3),
        sizeStart: 0,
        sizeStartSpread: 0.02,
        sizeMiddle: 1,
        sizeMiddleSpread: 0,
        sizeEnd: 1,
        sizeEndSpread: 0.4,
        angleStart: 0,
        angleStartSpread: 180,
        angleMiddle: 180,
        angleMiddleSpread: 0,
        angleEnd: 0,
        angleEndSpread: 360 * 4,
        angleAlignVelocity: false,
        colorStart: new THREE.Color( 0xffffff ),
        colorStartSpread: new THREE.Vector3(0, 0, 0),
        colorMiddle: new THREE.Color( 0xffffff ),
        colorMiddleSpread: new THREE.Vector3( 0, 0, 0 ),
        colorEnd: new THREE.Color( 0xffffff ),
        colorEndSpread: new THREE.Vector3(0, 0, 0),
        opacityStart: 1,
        opacityStartSpread: 0,
        opacityMiddle: 0.5,
        opacityMiddleSpread: 0,
        opacityEnd: 0,
        opacityEndSpread: 0,
        duration: null,
        alive: 0,
        isStatic: 0
    });
    */

    //This is a true coolness factor (difficult to code, but visually stands out!)
    //============================================
    /*
    terrain3DMaterial = new THREE.ShaderMaterial({
        uniforms: {
            texture_grass: { type: "t", value: THREE.ImageUtils.loadTexture( 'objects/Landscape/Textures/G36096.jpg' )},
            texture_bare: { type: "t", value: THREE.ImageUtils.loadTexture( 'objects/Landscape/Textures/F46734.jpg' )},
            show_ring: { type: 'i', value: true },
            ring_width: { type: 'f', value: 0.15 },
            ring_color: { type: 'v4', value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0) },
            ring_center: { type: 'v3', value: new THREE.Vector3() },
            ring_radius: { type: 'f', value: 1.6 }
            //repeatX : {type:"i", value: 1},
            //repeatY : {type:"i", value: 1}
        },
        attributes: new Array({ type: 'f', value: [] }), //v72
        //attributes: { displacement: { type: 'f', value: [] }}, //v71
        vertexShader: loadShader("shaders/ground.vertex.fx", 'vertex'),
        fragmentShader: loadShader("shaders/ground.fragment.fx", 'fragment'),
        shininess: 0
        //fog: false,
        //lights: true
    });
    
    var geometry = new THREE.PlaneGeometry( plots_x, plots_y, plots_x * plot_vertices, plots_y * plot_vertices);
    //geometry = scene3DHouseGroundContainer.children[0].children[0].geometry.clone();
    //geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    //geometry = new THREE.CircleGeometry( 15, 64 );
    //repeat_x = mesh.material.map.repeat.x;
    //repeat_y = mesh.material.map.repeat.y;

    terrain3D = new THREE.Mesh(geometry, terrain3DMaterial);
    terrain3D.materials = [ terrain3DMaterial ]; //For Future - Multiple Materials
    terrain3D.dynamic = true;
    terrain3D.displacement = terrain3D.materials[0].attributes.displacement;
    for (var i = 0; i < terrain3D.geometry.vertices.length; i++) {
        terrain3D.materials[0].attributes[0].value.push(0); //v72
        //terrain3D.materials[0].attributes.displacement.value.push(0); //v71
    }
    terrain3D.rotation.x = Degrees2Radians(-90);
    terrain3D.water = new THREE.Mesh(
        new THREE.PlaneGeometry( plots_x, plots_y, plots_x * plot_vertices, plots_y * plot_vertices ),
        new THREE.ShaderMaterial({
            uniforms: {
                water_level: { type: 'f', value: -1 },
                time: { type: 'f', value: 0 }
            },
            attributes: new Array({ type: 'f', value: [] }), //v72
            //attributes: { displacement: { type: 'f', value: [] }}, //v71
            vertexShader: loadShader("shaders/water.vertex.fx", 'vertex'),
            fragmentShader: loadShader("shaders/water.fragment.fx", 'fragment'),
            shininess: 0,
            transparent: true
        })
    );
    terrain3D.water.dynamic = true;
    terrain3D.water.displacement =  terrain3D.water.material.attributes.displacement;
    for (var i = 0; i <  terrain3D.water.geometry.vertices.length; i++) {
        terrain3D.water.material.attributes[0].value.push(0); //v72
        //terrain3D.water.material.attributes.displacement.value.push(0); //v71
    }
    terrain3D.water.position.z = -1;
    terrain3D.add(terrain3D.water);
    */
    //============================================

    //FIND TRUE MESH CENTER
    /*
    geometry.centroid = new THREE.Vector3();
    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
        geometry.centroid.addSelf( geometry.vertices[ i ].position );
    }
    geometry.centroid.divideScalar( geometry.vertices.length );
    */

    /*
    (function(watchedKeyCodes) {
        var handler = function(down) {
            return function(e) {
                var index = watchedKeyCodes.indexOf(e.keyCode);
                if (index >= 0) {
                    keysPressed[watchedKeyCodes[index]] = down; e.preventDefault();
                }
            };
        }
        $(document).keydown(handler(true));
        $(document).keyup(handler(false));
    })([
        keys.SP, keys.W, keys.A, keys.S, keys.D, keys.UP, keys.LT, keys.DN, keys.RT
    ]);
    */

    //60 times more geometry
    //THREE.GeometryUtils.merge(geometry, otherGeometry);

    /*
    https://www.udacity.com/course/viewer#!/c-cs291/l-158750187/m-169414761
    */
    //VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera3D = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 80);

    /*
    Cutaway View - width, height, fov, near, far, orthoNear, orthoFar
    https://github.com/mrdoob/three.js/issues/1909
    https://github.com/chandlerprall/ThreeCSG
    */
    //camera3D = new THREE.CombinedCamera( window.innerWidth, window.innerHeight, 60, 0.1, 80, 1.5, 10);
    /*
    var tween = new TWEEN.Tween(camera3D.position).to({x:Math.cos(0.1) * 200, z:Math.sin(0.1) * 200},20000).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
            //camera3D.updateProjectionMatrix();
            camera3D.lookAt(scene3D.position);
    }).start();
    */

    //camera3D.lookAt(new THREE.Vector3(0, 0, 0));
    //camera2D = new THREE.PerspectiveCamera(1, window.innerWidth / window.innerHeight, 1, 5000);
    //camera2D.lookAt(new THREE.Vector3(0, 0, 0));
    //camera2D.position.z = 5000; // the camera starts at 0,0,0 so pull it back

    /*
    camera3DMirrorReflection = new THREE.CubeCamera(0.1, 10, 30);
    //camera3DMirrorReflection.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    camera3DMirrorReflection.renderTarget.width = camera3DMirrorReflection.renderTarget.height = 3;
    //camera3DMirrorReflection.position.y = -20;
    */

    //================================
    //Top View Camera
    camera3DQuad[0] = new THREE.OrthographicCamera(
        window.innerWidth / -100, // Left
        window.innerWidth / 100, // Right
        window.innerHeight / 80, // Top
        window.innerHeight / -100, // Bottom
        -30, // Near 
        30); // Far -- enough to see the skybox
    camera3DQuad[0].up = new THREE.Vector3(0, 0, -1);
    camera3DQuad[0].lookAt(new THREE.Vector3(0, -1, 0));

    //Front View Camera
    camera3DQuad[1] = new THREE.OrthographicCamera(
        window.innerWidth / -150, window.innerWidth / 150,
        window.innerHeight / 80, window.innerHeight / -350, -30, 30);
    camera3DQuad[1].lookAt(new THREE.Vector3(0, 0, -1));
    camera3DQuad[1].position.set(0, 0, 10);

    //Side View Camera
    camera3DQuad[2] = new THREE.OrthographicCamera(window.innerWidth / -150, window.innerWidth / 150, window.innerHeight / 80, window.innerHeight / -350, -30, 30);
    camera3DQuad[2].lookAt(new THREE.Vector3(1, 0, 0));
    //camera3DQuad[2].position.set(0, 0, 0);

    //3D View Camera
    camera3DQuad[3] = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 50);
    camera3DQuad[3].position.set(0, 14, 8);
    camera3DQuad[3].lookAt(new THREE.Vector3(0, 0, 0));

    camera3DQuadGrid = new THREE.GridHelper(25, 1);
    camera3DQuadGrid.setColors(new THREE.Color(0x000066), new THREE.Color(0x6dcff6));

    /*
    scene3DWallInteriorTextureDefault = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/C0001.jpg');
    scene3DWallInteriorTextureDefault.wrapS = THREE.RepeatWrapping;
    scene3DWallInteriorTextureDefault.wrapT = THREE.RepeatWrapping;
    */

    /*
    scene2DDrawLineGeometry = new THREE.Geometry();
    scene2DDrawLineMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 5,
        linecap: "round",
        //linejoin: "round"
        //opacity: 0.5
    });
    scene2DDrawLineDashedMaterial = new THREE.LineDashedMaterial({
        color: 0x000000,
        dashSize: 1,
        gapSize: 0.5
    });

    scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineMaterial);
    scene2DDrawLineContainer.add(scene2DDrawLine);
    
    texture = new THREE.ImageUtils.loadTexture('objects/FloorPlan/P0001.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    scene2DWallRegularMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: 0x000066,
        linewidth: 2,
        //wireframe: true,
        //wireframeLinewidth: 4
    });

    texture = new THREE.ImageUtils.loadTexture('objects/FloorPlan/P0002.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    scene2DWallRegularMaterialSelect = new THREE.MeshBasicMaterial({
        map: texture
    });
	*/

    var cubeMaterials = [
        new THREE.MeshBasicMaterial({
            color: 0x33AA55,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors,
        }),
        new THREE.MeshBasicMaterial({
            color: 0x55CC00,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x0000FF,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
        new THREE.MeshBasicMaterial({
            color: 0x5555AA,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }),
    ];
    material = new THREE.MeshFaceMaterial(cubeMaterials);
    material.vertexColors = THREE.FaceColors;

    geometry = cube(8); //new THREE.BoxGeometry(10, 10, 10, 1, 1, 1)
    geometry.computeLineDistances();

    scene3DCubeMesh = new THREE.Line(geometry, new THREE.LineDashedMaterial({
        color: 0xff3700,
        dashSize: 3,
        gapSize: 1,
        linewidth: 2
    }), THREE.LineSegments); //v72
    //}), THREE.LinePieces); //v71

    //scene3DCubeMesh = new THREE.Mesh(cubeG, material);
    scene3DCubeMesh.geometry.dynamic = true; //Changing face.color only works with geometry.dynamic = true

   
    //THREE.GeometryUtils.merge(geometry, mesh);

    //scene2D.add(new THREE.GridHelper(100, 10));

    //A 1x1 Rectangle for Scale - Should Map to a 1x1 square of Three.js space
    //scene2D.fillStyle = "#FF0000";
    //scene2D.fillRect(0, 0, 1, 1);

    scene3DInitializeRenderer();

    scene3DInitializePhysics();

    scene3DInitializeClouds();

    scene3DCube = new THREE.Scene();
    camera3DCube = new THREE.PerspectiveCamera(60, 1, 1, 50);
    camera3DCube.up = camera3D.up;
    scene3DCube.add(camera3DCube);
    scene3DCube.add(scene3DCubeMesh);
    $(rendererCube.domElement).bind('mousemove', onCubeMouseMove);

    //automatically resize renderer THREE.WindowResize(renderer, camera); toggle full-screen on given key press THREE.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    $(window).bind('resize', onWindowResize);
    $(window).bind('beforeunload', function() {
        return 'Are you sure you want to leave?';
    });

    //$("#HTMLCanvas").bind('mousedown', on2DMouseDown);
    //$("#HTMLCanvas").bind('mouseup', on2DMouseUp);

    /*
    document.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, false);

    document.addEventListener('drop', function(event) {
        event.preventDefault();
        editor.loader.loadFile(event.dataTransfer.files[0]);
    }, false);
    */

    /*
    $(window).bind('mousedown', function(event) {
         switch (event.keyCode) {
            case 8: // prevent browser back 
                event.preventDefault();
                break;
            case 46: // delete
                //editor.removeObject(editor.selected);
                //editor.deselect();
                break;
        }
    });
    */
    
   	//enableOrbitControls();

    /*
    manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        //console.log( item, loaded, total );
        //var material = new THREE.MeshFaceMaterial(materials);
    };
    */
    //scene3DSky();
    scene3DInitializeLights();
    
    selectMeasurement();

    $('#menuWeatherText').html("Sunny");
    $('#menuDayNightText').html("Day");

    //animateHouse();


    show3DHouse();

    //For debugging purposes
    //========================
    //sceneOpen('scene2.zip');
    //========================

    open3DModel("objects/Platform/floor.jsz", scene3DFloorGroundContainer, 0, 0, 0, 0, 0, 1, false, null);
    open3DModel("objects/Landscape/round.jsz", scene3DHouseGroundContainer, 0, 0, 0, 0, 0, 1, true, null);
    open3DModel("objects/Platform/pivotpoint.jsz", scene3DPivotPoint, 0, 0, 0.1, 0, 0, 1, false, null);
}

/**
 * Loads a shader using AJAX
 * 
 * @param {String} URL
 * @param {String} The type of shader [vertex|fragment]
 */
function loadShader(shader, type)
{
    return $.ajax({
        url: shader,
        async: false,
        beforeSend: function (req) {
            req.overrideMimeType('text/plain; charset=x-shader/x-' + type); //important - set for binary!
        }
    }).responseText;
}

function scene3DFreeMemory()
{
    if (scene3D instanceof THREE.Scene) 
    {
        while (scene3D.children.length > 0)
        {
            var obj = scene3D.children[scene3D.children.length - 1];
            scene3D.remove(obj);
            /*
            if (obj.geometry) {                                                                                 
                obj.geometry.dispose();                                                                              
            } 
            if (obj.material) {                                                                                    
              if (obj.material instanceof THREE.MeshFaceMaterial) {                 
                $.each(obj.material.materials, function(idx, obj) {                 
                  obj.dispose();                                                                                   
                });                                                                                                
              } else {                                                                                             
                obj.material.dispose();                                                                            
              }                                                                                                    
            }  
            if (obj.dispose) {                                                                                     
                obj.dispose();                                                                                       
            }
            */
        }
        //scene3DObjectUnselect();
    }
    //skyMesh = new THREE.Object3D();
    //scene3D.remove(skyMesh);
    //scene3D = null;
    //scene3D = new THREE.Scene();
}

function scene2DFreeMemory()
{
    for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++) {
        scene2DWallMesh[FLOOR][i].edgeA = null;
        scene2DWallMesh[FLOOR][i].edgeB = null;
    }

    var objects = scene2D.getObjects();
    for (var object in objects)
    {
        scene2D.remove(object);
    }
}

function scene3DInitializeClouds()
{
    /* 
    =======================
    Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check http://xhr.spec.whatwg.org/.
    =======================
    */
    /*
    $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
        options.async = false;
    });
    */
    //=====================

    weatherSkyCloudsMesh =  new THREE.Mesh();
    weatherSkyRainbowMesh = new THREE.Mesh();

    $.ajax({
        url: "shaders/clouds.vertex.fx",
        //async: false,
        beforeSend: function (req) {
            req.overrideMimeType('text/plain; charset=x-shader/x-vertex'); //important - set for binary!
        },
        success: function(vertex_data){
            $.ajax({
                url: "shaders/clouds.fragment.fx",
                //async: false,
                beforeSend: function (req) {
                    req.overrideMimeType('text/plain; charset=x-shader/x-fragment'); //important - set for binary!
                },
                success: function(fragment_data){
                    var fog = new THREE.Fog(0x4584b4, -100, 1000);
                    weatherSkyMaterial = new THREE.ShaderMaterial({
                        uniforms: {
                            "map": {
                                type: "t",
                                //value: texture
                            },
                            "fogColor": {
                                type: "c",
                                value: fog.color
                            },
                            "fogNear": {
                                type: "f",
                                value: fog.near
                            },
                            "fogFar": {
                                type: "f",
                                value: fog.far
                            },
                        },
                        vertexShader: vertex_data,
                        fragmentShader: fragment_data,
                        depthWrite: false,
                        depthTest: false,
                        transparent: true
                    });
                    weatherSkyGeometry = new THREE.Geometry();
                    var plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4));
                    for (var i = 0; i < 20; i++) 
                    {
                        plane.position.x = getRandomInt(-20, 20);
                        plane.position.y = getRandomInt(5.5, 10);
                        plane.position.z = i;
                        plane.rotation.z = getRandomInt(5, 10);
                        plane.scale.x = plane.scale.y = getRandomInt(0.5, 1);
                        plane.updateMatrix();
                        weatherSkyGeometry.merge(plane.geometry, plane.matrix);
                    }
                    scene3DSetWeather();
                    scene3DSunlight(); //SUNLIGHT RAYS
                }
            }); 
        }
    });
}

function scene3DInitializePhysics()
{
    //http://javascriptjamie.weebly.com/blog/part-1-the-physics
    /*
    physics3D = new CANNON.World();
    physics3D.gravity.set(0, -9.82, 0);
    var physicsMaterial = new CANNON.Material("groundMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
        friction: 0.4,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRegularizationTime: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRegularizationTime: 3,
    });
    physics3D.addContactMaterial(physicsContactMaterial);
    //var boxShape = new CANNON.Box(new CANNON.Vec3(1,1,1));
    */
}

function scene3DInitializeRenderer()
{
    var dpr = 1;
    if (window.devicePixelRatio !== undefined) {
      dpr = window.devicePixelRatio;
    }

    renderer = new THREE.WebGLRenderer({
        devicePixelRatio: dpr,
        antialias: false,
        alpha: true,
        //alpha: false,
        //preserveDrawingBuffer: false
        //autoUpdateObjects: true
    });

    renderer.autoClear = false; //REQUIRED: for split screen
    renderer.shadowMap.enabled = true; //shadowMapEnabled = true;
    //renderer.shadowMap.debug = true; //shadowMapDebug = true;
    //renderer.shadowMapType = THREE.PCFShadowMap; //THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;
    renderer.shadowMapSoft = true;
    renderer.shadowMapAutoUpdate = true;
    //renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    
    /*
    renderer = new THREE.WebGLDeferredRenderer({
        width: window.innerWidth,
        height: window.innerHeight,
        scale: 1,
        antialias: true,
        tonemapping: THREE.UnchartedOperator,
        brightness: 2.5
    });
    */
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.sortObjects = false; //http://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
    //renderer.physicallyBasedShading = true;
    //renderer.sortObjects = true; //when scene is opening this make sure clouds stay on top
    //renderer.setClearColor(0xffffff, 1);

    rendererCube = new THREE.WebGLRenderer({
        devicePixelRatio: dpr,
        antialias: false,
        alpha: true,
        //transparent: true,
        //preserveDrawingBuffer: false
    });
    rendererCube.setSize(100, 100);
    /*
    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
    effectFXAA.renderToScreen = true;

    composer = new THREE.EffectComposer( renderer );
    composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    composer.addPass( new THREE.RenderPass( scene3D, camera3D ) );
    composer.addPass(effectFXAA);
    */
    document.getElementById('WebGLCanvas').appendChild(renderer.domElement);
    document.getElementById('WebGLCubeCanvas').appendChild(rendererCube.domElement);
}

function disposePanorama(id)
{
    if (rendererPanorama instanceof THREE.WebGLRenderer)
    {
        document.removeEventListener( 'mousedown', onPanoramaMouseDown, false );
        document.removeEventListener( 'mousewheel', onPanoramaMouseWheel, false );

        document.removeEventListener( 'touchstart', onPanoramaTouchStart, false );
        document.removeEventListener( 'touchmove', onPanoramaTouchMove, false );

        document.getElementById(id).removeChild(rendererPanorama.domElement);
    }
    $('#' + id).hide();

    rendererPanorama = null;
    camera3DPanorama = null;
    scene3DPanorama = null;
}

function makeScreenshot()
{
    getScreenshotData = true;
    
    /*
    renderer.preserveDrawingBuffer = true;
    window.open(renderer.domElement.toDataURL('image/png'), 'Final');

    setTimeout(function() {
        renderer.preserveDrawingBuffer = false;
    }, 1400);
    */
}

function buildPanorama(container,files,X,Y,Z,preloader,mesh)
{
    //Low Resolution
    var sides = [
        'panoramas/' + files + '/' + preloader + 'right.jpg',
        'panoramas/' + files + '/' + preloader + 'left.jpg',
        'panoramas/' + files + '/' + preloader + 'top.jpg',
        'panoramas/' + files + '/' + preloader + 'bottom.jpg',
        'panoramas/' + files + '/' + preloader + 'front.jpg',
        'panoramas/' + files + '/' + preloader + 'back.jpg'
    ];

    var cubemap = THREE.ImageUtils.loadTextureCube(sides);
    //cubemap.format = THREE.RGBFormat;

    var shader = THREE.ShaderLib['cube'];
    var skyBoxMaterial = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        //uniforms: uniforms,
        uniforms: {
            "tCube": { type: "t", value: cubemap },
            "tFlip": { type: "f", value: -1 }
        },
        depthWrite: false,
        side: THREE.BackSide
    });
    var skybox = new THREE.Mesh(
        new THREE.CubeGeometry(X, Y, Z),
        skyBoxMaterial
    );
    if(mesh)
        container.remove(mesh);
    container.add(skybox);

    if(preloader == "_") //High Resolution
        buildPanorama(container,files,X,Y,Z,"",skybox);

    /*
    //Low Resolution
    var sides = [
        new THREE.MeshBasicMaterial({
            map: new THREE.ImageUtils.loadTexture('panoramas/' + files + '/_right.jpg'),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.ImageUtils.loadTexture('panoramas/' + files + '/_left.jpg'),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: new THREE.ImageUtils.loadTexture('panoramas/' + files + '/_top.jpg'),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
          map: new THREE.ImageUtils.loadTexture('panoramas/' + files + '/_bottom.jpg'),
          side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
           map: new THREE.ImageUtils.loadTexture('panoramas/' + files + '/_front.jpg'),
           side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
           map: new THREE.ImageUtils.loadTexture('panoramas/' + files + '/_back.jpg'),
           side: THREE.BackSide
        }),
    ];
    var geometry = new THREE.BoxGeometry(X,Y,Z);
    //console.log(geometry);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(sides));

    container.add(mesh);

    //High Resolution
    var textureloader = new THREE.TextureLoader();
    textureloader.load('panoramas/' + files + '/right.jpg', function (texture) { sides[0].map=texture; });
    textureloader.load('panoramas/' + files + '/left.jpg', function (texture) { sides[1].map=texture; });
    textureloader.load('panoramas/' + files + '/top.jpg', function (texture) { sides[2].map=texture; });
    textureloader.load('panoramas/' + files + '/bottom.jpg', function (texture) { sides[3].map=texture; });
    textureloader.load('panoramas/' + files + '/front.jpg', function (texture) { sides[4].map=texture; });
    textureloader.load('panoramas/' + files + '/back.jpg', function (texture) {sides[5].map = texture;});
    */
    
    /*
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( 1, 1, 1 ) );
    var material = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( 'textures/2294472375_24a3b8ef46_o.jpg' )
    } );
    mesh = new THREE.Mesh( geometry, material );
    scene3DPanorama.add(mesh);
    */
}

function initPanorama(id, files, W,H)
{
    scene3DPanorama = new THREE.Scene();
    camera3DPanorama = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    rendererPanorama = new THREE.WebGLRenderer({
        devicePixelRatio: window.devicePixelRatio || 1,
        antialias: false
    });

    rendererPanorama.setSize(window.innerWidth*W, window.innerHeight*H);
    document.getElementById(id).appendChild(rendererPanorama.domElement);

    //controls3DPanorama = new THREE.OrbitControls(camera3DPanorama, rendererPanorama.domElement);
    //controls3DPanorama.target = new THREE.Vector3(0, 0, 0);
    //controls3DPanorama.enabled = true;
    
    document.addEventListener( 'mousedown', onPanoramaMouseDown, false );
    document.addEventListener( 'mousewheel', onPanoramaMouseWheel, false );
    document.addEventListener( 'touchstart', onPanoramaTouchStart, false );
    document.addEventListener( 'touchmove', onPanoramaTouchMove, false );

    var opts = {
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      className: 'spinner', // The CSS class to assign to the spinner
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };
    var spinner = new Spinner(opts).spin();
    document.getElementById(id).appendChild(spinner.el);

    //mouse = new THREE.Vector2();
    //touch = new THREE.Vector2();
    //var scene = new THREE.Object3D();
    //buildPanorama(scene,files, 512, 512);
    //scene3DPanorama.add(scene);

    buildPanorama(scene3DPanorama,files, 1024, 1024, 1024, "_");

    document.getElementById(id).removeChild(spinner.el);

    $('#' + id).show();
    animatePanorama();

    //TODO: update onWindowResize();
}

function onPanoramaMouseDown( event ) {

    event.preventDefault();

    document.addEventListener( 'mousemove', onPanoramaMouseMove, false );
    document.addEventListener( 'mouseup', onPanoramaMouseUp, false );
}

function onPanoramaMouseMove( event ) {

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    mouse.x -= movementX * 0.1;
    mouse.y += movementY * 0.1;
}

function onPanoramaMouseUp( event ) {

    document.removeEventListener( 'mousemove', onPanoramaMouseMove );
    document.removeEventListener( 'mouseup', onPanoramaMouseUp );
}

function onPanoramaMouseWheel( event ) {

    if (event.wheelDeltaY)
    {
        camera3DPanorama.fov -= event.wheelDeltaY * 0.05;
    }
    else if (event.wheelDelta)  // Opera / Explorer 9
    {
        camera3DPanorama.fov -= event.wheelDelta * 0.05;
    }
    else if (event.detail) // Firefox
    {
        camera3DPanorama.fov += event.detail * 1.0;
    }

    camera3DPanorama.updateProjectionMatrix();
}

function onPanoramaTouchStart( event ) {

    event.preventDefault();

    var touches = event.touches[0];

    touch.x = touches.screenX;
    touch.y = touches.screenY;
}

function onPanoramaTouchMove( event ) {

    event.preventDefault();

    var touches = event.touches[ 0 ];

    mouse.x -= ( touches.screenX - touch.x ) * 0.1;
    mouse.y += ( touches.screenY - touch.y ) * 0.1;

    touch.x = touches.screenX;
    touch.y = touches.screenY;
}

function scene2DMakeWall(v1,v2,c,id,i) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    if(i === null)
        i = FLOOR;

    if( v2.x-v1.x < 0 || v2.y-v1.y < 0) //top to bottom or left to right
    {
        //revese coordinate polarity
        var v = v1;
        v1=v2;
        v2=v;
        console.log("Reversed " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y + " (" + id + ")");
    }else{
        console.log("Normal " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y + " (" + id + ")");
    }

    //Find center point
    if(c.x === 0 && c.y === 0)
    {
        var p = scene2DGetWallParallelCoordinates({x: v1.x, y: v1.y},{x: v2.x, y: v2.y},0);
        c.x = p.x1 + (p.x2 - p.x1) / 2; //center
        c.y = p.y1 + (p.y2 - p.y1) / 2; //center
    }
    /*
    Quadratic Curve
    http://fabricjs.com/quadratic-curve/
    */
    var line = new fabric.Path('M 0 0 Q 0 0 0 0', { fill: null });
    line.path[0][1] = v1.x;
    line.path[0][2] = v1.y;
    line.path[1][1] = c.x; //curve left
    line.path[1][2] = c.y; //curve right
    line.path[1][3] = v2.x;
    line.path[1][4] = v2.y;

    //TODO: parallel quadratic curves as shape with pattern
    /*
    fabric.util.loadImage('objects/FloorPlan/Brick/americanbond.gif', function(img) {
      line.fill = new fabric.Pattern({
        source: img,
        repeat: repeat
      });
      scene2D.renderAll();
    });
    */

    /*
    Curved Walls
    http://www.svgbasics.com/paths.html
    */
    /*
    var line = new fabric.Path('M ' + coords[0] + ' ' + coords[1] + ' L ' + coords[2] + ' ' + coords[3], { fill: '', strokeWidth: 12, stroke: 'black' });
    for (var p = 0; p < line.path.length; p++)
    {
        switch (line.path[p][0]) { //Convert Path to points[]
            case 'M':
            case 'L':
            console.log(line.path[p][1] + ' ' + line.path[p][2]);
            //case 'Q':
            break;
        }
    }
    */
    
    var array = [];

    //item(0) + item(1) Quandratic Curve Vector Path
    //Fix for fabric.js 1.5.0 - Must have proper Array with type:"path"
    //this strangely happen only after clone()
    line.clone(function (clone) {
        clone.set({left: 0, top: 0});
        clone.set({stroke: 'black', strokeWidth: 12});
        //clone.set({selectable:true, hasControls: false, name:'wall'});
        //clone.perPixelTargetFind = true;
        //clone.targetFindTolerance = 4;
        array.push(clone);
    });
    line.clone(function (clone) {
        clone.set({left: 0, top: 0});
        clone.set({opacity: 0, stroke: '#00FF00', strokeWidth: 2});
        //console.log(line);
        //console.log(clone);
        array.push(clone);
    });

    //item(2) - Dynamic Split Visual Circle
    var c = new fabric.Circle({
        opacity: 0,
        left: 0,
        top: 0,
        strokeWidth: 2,
        radius: 8,
        fill: 'yellow',
        stroke: 'red'
    });
    array.push(c);

    //item(3) - Measurement Line
    var l = new fabric.Line([0, 0, 1, 0], {
        //opacity: 0,
        left: 0,
        top: 0,
        stroke: '#505050',
        strokeWidth: 2,
        angle: 0
    });
    array.push(l);
    /*
    var l_l = new fabric.Circle({
        //opacity: 0,
        left: 0,
        top: 0,
        radius: 3,
        fill: '#505050',
    });
    */
    var l_l = new fabric.Line([0, 0, 8, 0], {
        left: 0,
        top: 0,
        stroke: '#000000',
        strokeWidth: 2
    });
    var l_r = l_l.clone();
    array.push(l_l); //item(4) 
    array.push(l_r); //item(5) 

    //item(6) - Measurement Text Background
    var r = new fabric.Rect({
        //opacity: 0,
        left: 0,
        top: 0,
        fill: '#ffffff',
        width: 35,
        height: 20,
        angle: 0
    });
    array.push(r);

    //item(7) - Measurement Text
    var t = new fabric.Text("", {
        //opacity: 0,
        left: 0,
        top: 0,
        fontFamily: 'helvetiker',
        fontWeight: 'normal',
        textAlign: 'left', //required
        //fill: '#ffffff',
        fontSize: 15,
        angle: 0
    });
    array.push(t);
    
    /*
    for (var d = 0; d < scene2DDoorMesh[i].length; d++) { //each door

        if(id == scene2DDoorMesh[i][d].id) //attched to walls by matching id)
        {
            group.push(scene2DDoorMesh[i][d]);
        }
    }
    */
    var group = new fabric.Group(array, {selectable:false, hasBorders: false, hasControls: false, name:'wall', id:id, width: 2000});
    group.edge = [];
    //group.perPixelTargetFind = true;
    //group.targetFindTolerance = 4;

    return group;
}

function scene2DCheckLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    /*
    http://jsfiddle.net/justin_c_rounds/Gd2S2
    */
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator === 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
    // it is worth noting that this should be the same as:
    x = line2StartX + (b * (line2EndX - line2StartX));
    y = line2StartX + (b * (line2EndY - line2StartY));
    */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}

function scene2DLineLength(x, y, x0, y0){
    /*
    http://jsfromhell.com/math/line-length
    */
    return Math.sqrt((x -= x0) * x + (y -= y0) * y);
}

function scene2DPointToLineLength(x, y, x0, y0, x1, y1, o){
    /*
    http://jsfromhell.com/math/dot-line-length
    */
    if(o && !(o = function(x, y, x0, y0, x1, y1){
        if(!(x1 - x0)) return {x: x0, y: y};
        else if(!(y1 - y0)) return {x: x, y: y0};
        var left, tg = -1 / ((y1 - y0) / (x1 - x0));
        return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
    }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
        var l1 = scene2DLineLength(x, y, x0, y0), l2 = scene2DLineLength(x, y, x1, y1);
        return l1 > l2 ? l2 : l1;
    }
    else {
        var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
        return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
    }
}

function scene2DGetWallParallelCoordinates(v1,v2,offsetPixels) {

    /*
    Most advanced calculations of this project turn out to be wall lengths :)
    http://www.wenda.io/questions/165404/draw-a-parallel-line.html
    */

    var p = {x1: 0, y1: 0, x2: 0, y2: 0};

    var L = Math.sqrt((v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y));

    // This is the second line
    p.x1 = v1.x + offsetPixels * (v2.y-v1.y) / L;
    p.x2 = v2.x + offsetPixels * (v2.y-v1.y) / L;
    p.y1 = v1.y + offsetPixels * (v1.x-v2.x) / L;
    p.y2 = v2.y + offsetPixels * (v1.x-v2.x) / L;

    return p;
}

function scene2DGetCenterPivot(v1,v2)
{
    var p = scene2DGetWallParallelCoordinates(v1,v2,0);
    return ({x:p.x1 + (p.x2 - p.x1) / 2, y:p.y1 + (p.y2 - p.y1) / 2});
}

function scene2DMakeWallSelect(v1,v2,line,pivot)
{
    //console.log(v1.x + ":" + v1.y + " " + v2.x + ":" + v2.y);

    //wall selectable"invisible" line
    var r = new fabric.Line([0, 0, v2.x-v1.x, v2.y-v1.y], {
        left: pivot.left,
        top: pivot.top,
        stroke: 'white',
        opacity: 0.1,
        //stroke: 'yellow',
        //opacity: 0.8,
        strokeWidth: 40,
        selectable: true, 
        hasBorders: false, //true,
        hasControls: false, 
        hoverCursor: 'pointer',
        name: 'wallselect'
    });
    r.perPixelTargetFind = true;
    r.targetFindTolerance = 4;

    r.line = line;
    r.pivot = pivot;

    r.on("selected", function () {
        //console.log(r.line.item(2).left + ":" + r.line.item(2).top);
        scene2D.setActiveObject(line); //fabric.js event fix - allow multiple clicks
    });

    return r;
}

function scene2DMakeWallCurvedPivot(v1,v2,line,lock)
{
    var point = scene2DGetCenterPivot(v1,v2);
    var pivot = scene2DMakeWallPivotCircle(0, 0, false); //TOD: combine these two functions into scene2DMakeWallPivotPoint
    pivot.line = new Array(line);

    pivot.left = point.x;
    pivot.top = point.y;

    //adjust wall to proper curvature
    line.item(0).path[1][1] = point.x;
    line.item(0).path[1][2] = point.y;

    return pivot;
}

function scene2DCalculateWallLength(v1,v2,v3,line)
{
    var n = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);
    var p1 = scene2DGetWallParallelCoordinates(v1,v2,24);
    var p2 = scene2DGetWallParallelCoordinates(v1,v2,-20);
    //var n2 = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);
    var cx = p1.x1 + (p1.x2 - p1.x1) / 2; //center
    var cy = p1.y1 + (p1.y2 - p1.y1) / 2; //center

    line.item(3).set({left:cx,top:cy});
    line.item(3).set("x1",p1.x1);
    line.item(3).set("y1",p1.y1);
    line.item(3).set("x2",p1.x2);
    line.item(3).set("y2",p1.y2);

    /*
    var l0 = new fabric.Line([p1.x1, p1.y1, p1.x2, p1.y2], {
        left: cx, //v1.x + (v2.x - v1.x)/2,
        top: cy, //v1.y - 20,
        stroke: '#000000',
        strokeWidth: 1,
        //strokeDashArray: [5, 5]
    });
    */
    /*
    http://tiku.io/questions/4547740/draw-perpendicular-line-to-given-line-on-canvas-android
    */
    //var vXP = -(v2.y-v1.y);
    //var vYP = v2.x-v1.x;

    //var ap = Math.atan2(v1.y - v2.y, v1.x - v2.x); //console.log(a);
    //if(ap == 0)
    //    ap = 90
    
    if(Math.abs(v1.y - v2.y) > Math.abs(v1.x-v2.x)) //vertical lines
    {
        a = -90;
    }else{
        a = 0;
    }

    line.item(4).set({left:p1.x1,top:p1.y1,angle:a+90});

    line.item(5).set({left:p1.x2,top:p1.y2,angle:a+90});

    line.item(6).set({left:cx,top:cy,angle:a});

    line.item(7).set({left:cx,top:cy,angle:a,text:(n/50).toFixed(1) + ' m'});
    //line.item(7).set({left:cx,top:cy,angle:a,text:line.id});

    /*
    var r = new fabric.Rect({
      left: cx,
      top: cy,
      fill: '#ffffff',
      width: 35,
      height: 20,
      angle: a
    });

    var l1 = new fabric.Line([0, 0, 6, 0], {
        left: p1.x1,
        top: p1.y1,
        stroke: '#000000',
        strokeWidth: 1,
        angle: a + 90
    });

    var l2 = l1.clone();
    l2.left = p1.x2;
    l2.top = p1.y2;
    
    var t = new fabric.Text((n1/50).toFixed(1) + ' m', {
        left: cx, //v1.x + (v2.x - v1.x)/2,
        top: cy, //v1.y - 20,
        fontFamily: 'helvetiker',
        fontWeight: 'normal',
        textAlign: 'left', //required
        //fill: '#ffffff',
        fontSize: 15,
        angle: a //Math.atan2(v1.y - v2.y, v1.x - v2.x)
    });
    */
    /*
    if(Math.abs(p1.y2 - p1.y1) < 50) //adjust fit for small vertical places
    {
        r.left = cx - 10;
        t.left = cx - 10;
        r.top = p1.y2;
        t.top = p1.y2;
    }
    */
    //return new fabric.Group([l0, l1, l2, r, t], {selectable:false});
    return n;
}

function scene2DMakeWindow(v1,v2,c,z,open,direction,id) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    //v2.x = v2.x - v1.x;
    //v2.y = v2.y - v1.y;

    var group = [];

    var line1 = new fabric.Line([0, 0, v2.x, v2.y], {
        stroke: '#f5f5f5',
        strokeWidth: 18
    });

    var line2 = new fabric.Line([0, 0, v2.x, v2.y], {
        stroke: '#000000',
        strokeWidth: 4,
        name:'window-frame'
    });

    var group = new fabric.Group([line1,line2], {selectable:true, hasBorders:false, hasControls:false, name:'window', z:z, open:open, direction:direction, id:id});
    group.origin = v1;

    /*
    if(open == "bay")
    {
        if(direction == "in")
        {
        }else{
        }
    }
    */

    return group;
}

function scene2DMakeDoor(v1,v2,c,z,open,direction,id) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    //Debug adjust
    //v1 = {x:v1.x+40,y:v1.y};
    //v2 = {x:v1.x+100,y:v1.y};

    //v2.x = v2.x - v1.x;
    //v2.y = v2.y - v1.y;

    //TODO: lock/hide wall curve if door is present
    //var angle = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI;

    var swing = scene2DLineLength(0,0,v2.x,v2.y);
    
    var array = [];

    //var line1 = new fabric.Line([v1.x, v1.y, v2.x, v2.y], {
    var line1 = new fabric.Line([0, 2, v2.x, 2], {
        stroke: '#f5f5f5',
        strokeWidth: 20
    });

    var line2 = new fabric.Line([0, 4, v2.x, 4], {
        stroke: '#000000',
        strokeWidth: 4,
        name: "door-frame"
    });

    array.push(line1); //item(0)
    array.push(line2); //item(1)
    
    var hinge = [0,0,0,0];
    var startAngle = Math.PI/2;
    var endAngle = Math.PI;

    if(open == "double")
    {

    }
    else if(open == "right")
    {
        if(direction == "in")
        {
            hinge = [v2.x, v2.y, v2.x, v2.y+swing];
        }else{
            hinge = [v2.x, v2.y, v2.x, v2.y-swing];
            startAngle = 0-Math.PI;
            endAngle = 0-Math.PI/2;
        }
    }
    else if(open == "left")
    {
        if(direction == "in")
        {
            startAngle = 0;
            endAngle = Math.PI/2;
        }else{
            startAngle = 0-Math.PI/2;
            endAngle = 0;
        }
    }

    var line3 = new fabric.Line(hinge, {
        stroke: '#000000',
        strokeWidth: 2
    });
    array.push(line3); //item(2)

    var arc1 = new fabric.Circle({
        radius: swing-1,
        left: hinge[0],
        top: hinge[1],
        //angle: offsetAngle,
        hasBorders: false,
        startAngle: startAngle,
        endAngle: endAngle,
        stroke: '#000000',
        strokeDashArray: [5, 5],
        strokeWidth: 2,
        fill: '',
        name: "door-swing"
    });
    array.push(arc1); //item(3)

    //Interactive Adjusting lines TODO: add mobileFix
    var line4 = new fabric.Line([0, -6, 0, 15], {
        //stroke: '#00CC00', //green
        stroke: '#000000', //black
        strokeWidth: 6,
        //name: "door-adjust-left"
    });
    var line5 = new fabric.Line([v2.x, -6, v2.x, 15], {
        //stroke: '#00CC00', //green
        stroke: '#000000', //black
        strokeWidth: 6,
        //name: "door-adjust-right"
    });
    array.push(line4); //item(4)
    array.push(line5); //item(5)
    
    var c = new fabric.Circle({
        opacity: 0,
        left: hinge[2],
        top: hinge[3],
        strokeWidth: 2,
        radius: 8,
        fill: '#ADFF2F',
        stroke: '#6B8E23',
    });
    array.push(c); //item(6)
    
    var group = new fabric.Group(array, { selectable: true, hasBorders: false, hasControls: false, name:'door', z:z, open:open, direction:direction, id:id});
    group.origin = v1;
    group.moving = false;
    group.on("moving", function () {

        if(group.lockMovementX) //precaution
            return;

        if(!group.moving){
            group.moving = true;
            clearTimeout(clickTime);
            //console.log(group);
        }else{
            //TODO: Find closest line
            for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++)
            {
                if(!scene2D.isTargetTransparent(scene2DWallMesh[FLOOR][i].selector, group.left, group.top)){ //|| !scene2D.isTargetTransparent(scene2DWallMesh[FLOOR][i].selector, group.left-group.width/2, group.top)){
                    //console.log(scene2DWallMesh[FLOOR][i].id);
                    var v1 = {x:scene2DWallMesh[FLOOR][i].item(0).path[0][1],y:scene2DWallMesh[FLOOR][i].item(0).path[0][2]};
                    var v2 = {x:scene2DWallMesh[FLOOR][i].item(0).path[1][3],y:scene2DWallMesh[FLOOR][i].item(0).path[1][4]};
                    var a = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI; //TODO: ifficiency rememmber angle on 'edge' move
                    var percent = (group.left - v1.x) / (v2.x - v1.x); //0.20; //flip based on window height
                    //console.log(percent);
                    group.set(scene2DgetLineXYatPercent(v1,v2,percent));
                    group.set({angle:a});
                    break;
                }else{
                    group.set({angle:0});
                }
            }
        }
    });

    group.on("selected", function () {
        //group.adjustcircle.set({opacity:0});
        c.set({opacity:0});
        //console.log("");
        group.moving = false; //TODO: do this on mouseup

        //console.log(scene2D.activeObject);
        //console.log(scene2D.activeGroup);
        //var g = scene2D.getActiveGroup()
        //var obj = g.getObjects()
        //var pointer = canvas.getPointer(e.e);
        //var activeObj = scene2D.getActiveObject();
        //console.log(mouse.x + ":" + mouse.y + " " + activeObj.left + ":" + activeObj.top)
        //if (Math.abs(mouse.y - activeObj.top) > 80)
        //{
        //    console.log("green circle");
        //}else{

            clickTime = setTimeout(function() {
                window.location = "#open2DDoorWindowAdjust";
                //============================
                scene2DAdvanced = new fabric.Canvas('fabricjs2', {
                    isDrawingMode: false,
                    isTouchSupported: true,
                    width: window.innerWidth*0.8-40, //80%
                    height: window.innerHeight*0.75-20 //75%
                });
                scene2DMakeGrid(scene2DAdvanced, 20,'#6dcff6');
                //scene2DMakeGrid(scene2DAdvanced, 20,'#E0E0E0');
                //============================

                //...Sample front facing wall
                //============================
                scene2DDrawLine = new fabric.Line([200, 80, 850, 80], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);
                scene2DDrawLine = new fabric.Line([200, 80, 200, 500], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);
                scene2DDrawLine = new fabric.Line([850, 80, 850, 500], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);
                scene2DDrawLine = new fabric.Line([200, 500, 850, 500], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);

                scene2DDrawLine = new fabric.Rect({
                  left: 450,
                  top: 345,
                  fill: '#ffffff',
                  stroke: 'black',
                  width: 180,
                  height: 300,
                });
                scene2DAdvanced.add(scene2DDrawLine);
                //============================
            }, 500);
        //}
        scene2D.bringToFront(group);
        scene2D.setActiveObject(arc1); //fabric.js event fix - allow multiple clicks
    });
    
    return group;
}

function scene2DMakeWallEdgeAngle(v1,v2,v3) {

    //TODO: Include offsets for Qudratic Curve
    //TODO: Dependent on zoom

    //var a = find2DAngle(v1,v2,v3); console.log("Angle:" + (((a* 180 / Math.PI)*100)>>0)/100);
    var scale = 0;
    var w = 50;
    var n1 = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);
    var n2 = scene2DLineLength(v3.x,v3.y,v2.x,v2.y);
    /*
    if(n1 < w || n2 < w) //too small for display
    {
        return new fabric.Group([line], {selectable: false});
    }
    */

    scale = w / n1; //calculate ratio for constant line scale
    //============ LERP Formula ==============
    //start.x + (final.x - start.x) * progress;
    var L1x = v2.x + (v2.x - v1.x) * scale;
    var L1y = v2.y + (v2.y - v1.y) * scale;
    //========================================

    scale = w / n2; //calculate ratio for constant line scale
    //============ LERP Formula ==============
    //start.x + (final.x - start.x) * progress;
    var L2x = v2.x + (v2.x - v3.x) * scale;
    var L2y = v2.y + (v2.y - v3.y) * scale;
    //========================================

    /*
    http://stackoverflow.com/questions/4196749/draw-arc-with-2-points-and-center-of-the-circle
    */
    var startAngle = Math.atan2(L2y-v2.y, L2x-v2.x);
    var endAngle = Math.atan2(L1y-v2.y, L1x-v2.x);
   
    var t = startAngle + (endAngle - startAngle)/2;
    if(endAngle > startAngle) //always point towards center
        t = t + Math.PI;

    var offsetAngle = 180;

    //console.log(startAngle + ":" + endAngle);

    var arc = new fabric.Circle({
        radius: w - 1,
        left: v2.x,
        top: v2.y,
        //angle: offsetAngle,
        startAngle: startAngle, //Math.abs(startAngle),
        endAngle: endAngle, //Math.abs(endAngle),
        stroke: '#ff6600',
        strokeWidth: 2,
        fill: ''
    });

    var line1 = new fabric.Line([v2.x,v2.y,L1x,L1y], {
        stroke: '#ff6600',
        strokeWidth: 2
    });

    var line2 = new fabric.Line([v2.x, v2.y,L2x, L2y], {
        stroke: '#ff6600',
        strokeWidth: 2
    });

    //http://www.cufonfonts.com
    var text = new fabric.Text(Math.round(find2DAngle(v1,v2,v3) * 180 / Math.PI) + '°', {
        left: -30 * Math.cos(t) + v2.x,
        top: -30 * Math.sin(t) + v2.y,
        fontFamily: 'helvetiker',
        fontWeight: 'normal',
        textAlign: 'left', //required
        fontSize: 15,
        fill: '#505050',
        angle: offsetAngle
    });

    return new fabric.Group([line1, line2, arc, text], {selectable: false, angle:offsetAngle, name:'angle'});
}

function scene2DRemoveWallEdgeCircle(id) {
    console.log(id);

    //var objects = canvas.getObjects(canvas.getActiveGroup);

    var objects = scene2D.getObjects();
    for (var i in objects)
    {
        var obj = objects[i];
        if(obj.id == id)
        {
            scene2D.remove(obj);
            //TODO: History Record
            //TODO: remove walls coordinates

            break;
        }
    }

    return false; //href="#" fix
}

function scene2DResetPivot(id) {

    var objects = scene2D.getObjects();
    for (var i in objects)
    {
        var obj = objects[i];
        if(obj.id == id)
        {
            var pivot = scene2DGetCenterPivot({x:obj.wall.item(0).path[0][1],y:obj.wall.item(0).path[0][2]},{x:obj.wall.item(0).path[1][3],y:obj.wall.item(0).path[1][4]});
            $('#menu2DTools').tooltipster('hide');
            obj.wall.item(0).path[1][1] = pivot.x; obj.wall.item(0).path[1][2] = pivot.y;
            obj.left = pivot.x; obj.top = pivot.y;
            break;
        }
    }
    return false; //href="#" fix
}

function scene2DLockObject(id) {

    var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
        if(result[0].lockMovementX === true)
        {
            result[0].item(2).set({visible:false});
            result[0].set({lockMovementX:false,lockMovementY:false});
        }else{
            result[0].item(2).set({visible:true});
            result[0].set({lockMovementX:true,lockMovementY:true});
        }
    //}

    return false; //href="#" fix
}

function scene2DSplitWallEdgeCircle(id) {

    var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
    var circle = scene2DMakeWallEdgeCircle(result[0].left, result[0].top, false);
    
    for (var i = 1; i < 4; i++)
    {
        if(result[0].line[i])
        {
            circle.line[i] = result[0].line[i];
            result[0].line[i] = undefined;
            result[0].bend[i] = undefined;
        }
        if(result[0].pivot[i])
        {
            circle.pivot[i] = result[0].pivot[i];
            result[0].pivot[i] = undefined;
        }
    }
    scene2D.add(circle);

    //}
    return false; //href="#" fix
}

function scene2DJoinWallEdgeCircle(id) {

    var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
        //A bit more tricky ..nned to get "closes" edgeCircle and pick parameters from.
    //}
    return false; //href="#" fix
}

function scene2DMakeWallEdgeCircle(left, top, lock) {

    var mobileFix = new fabric.Circle({
      left: 0,
      top: 0,
      radius: 40,
      fill: '',
    });

    var c = new fabric.Circle({
        left: 0,
        top: 0,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666',
    });

    var img = new Image();
    img.src = 'images/lock.png';

    var i = new fabric.Image(img, {
        left: 0,
        top: 0,
        width: 10,
        height: 12,
        opacity: 0.6,
        visible: false,
    });

    var group = new fabric.Group([mobileFix, c, i], {left: left, top: top, selectable: true, hasBorders: false, hasControls: false, name: 'edge', id:Math.random().toString(36).substring(7), lockMovementX:lock, lockMovementY:lock});
    group.line = [];
    group.pivot = [];
    group.bend = [];
    group.doors = [];
    group.windows = [];
    group.moving = false;

    group.on("selected", function () {
        group.moving = false; //TODO: do this on mouseup
        clickTime = setTimeout(function() {
            $('#menu2DTools').tooltipster('update', '<a href="#" onclick="scene2DRemoveWallEdgeCircle(\'' + group.id + '\')" class="lo-icon icon-delete" style="color:#FF0000"></a><a href="#" onclick="scene2DLockObject(\'' + group.id + '\')" class="lo-icon icon-lock" style="color:#606060"></a><a href="#" onclick="scene2DSplitWallEdgeCircle(\'' + group.id + '\')" class="lo-icon icon-cut" style="color:#606060"></a><a href="#" onclick="scene2DJoinWallEdgeCircle(\'' + group.id + '\')" class="lo-icon icon-join" style="color:#606060"></a>');
            $('#menu2DTools').css({ left: group.left, top: group.top });
            $('#menu2DTools').tooltipster('show');
        }, 500);

        //group.setCoords();
        var v = {x:group.left,y:group.top};
        for (var i = 0; i < group.line.length; i++)
        {
            group.line[i].item(1).set({opacity:0}); //unhighlight attached wall
            //group.line[i].reversed = false;
            //if(group.bend[i]){
            //    scene2D.remove(group.bend[i]);
            //}
            var v1 = {x:group.line[i].item(0).path[0][1],y:group.line[i].item(0).path[0][2]};
            var v2 = {x:group.line[i].item(0).path[1][3],y:group.line[i].item(0).path[1][4]};

            if(Math.abs(v.x - v2.x) < Math.abs(v.x - v1.x) || Math.abs(v.y - v2.y) < Math.abs(v.y - v1.y) ){ //top to bottom or left to right
                group.line[i].reversed = true;
            }
        }
        scene2D.bringToFront(group);
        scene2D.setActiveObject(group.line[0]); //fabric.js event fix - allow multiple clicks
    });
    group.on("moving", function () {

        if(group.lockMovementX) //precaution
            return;
        
        if(!group.moving){
            clearTimeout(clickTime);
            group.moving = true;
        }else{

            for (var i = 0; i < group.line.length; i++)
            {
                //var pivot = scene2DGetCenterPivot(v1,v2); //Original
                //console.log("[" + i + "] " + group.line[i].id)
                
                if(group.line[i].reversed)
                {
                    group.line[i].item(0).path[1][3] = group.left;
                    group.line[i].item(0).path[1][4] = group.top;
                }else{
                    group.line[i].item(0).path[0][1] = group.left;
                    group.line[i].item(0).path[0][2] = group.top;
                }

                var v1 = {x:group.line[i].item(0).path[0][1],y:group.line[i].item(0).path[0][2]};
                var v2 = {x:group.line[i].item(0).path[1][3],y:group.line[i].item(0).path[1][4]};
                var v3 = {x:group.line[i].item(0).path[1][1],y:group.line[i].item(0).path[1][2]};

                
                var n = scene2DCalculateWallLength(v1,v2,v3,group.line[i]);
                scene2DGroupArrayDynamicPosition(v1,v2,n,[group.line[i].doors,group.line[i].windows]);

                //======= Pivot curvature ==========
                //if(p.line[i].item(0).path[1][1] == pivot.x && p.line[i].item(0).path[1][2] == pivot.y)
                //{
                    var pivot = scene2DGetCenterPivot(v1,v2); //New
                    group.line[i].item(0).path[1][1] = pivot.x;
                    group.line[i].item(0).path[1][2] = pivot.y;
                    if(group.line[i].pivot)
                    {
                        group.line[i].pivot.left = pivot.x;
                        group.line[i].pivot.top = pivot.y;
                    }
                    //p.pivot[i].setCoords();
                //}

                // ====== Very fast floor shapre correction ===
                if (scene2DFloorShape)
                {
                    var c = group.wallid + i;
                    if(!scene2DFloorShape.path[c])
                        c=0;

                    scene2DFloorShape.path[c][1] = pivot.x; //cx
                    scene2DFloorShape.path[c][2] = pivot.y; //cy
                    scene2DFloorShape.path[c][3] = v2.x; //x2 
                    scene2DFloorShape.path[c][4] = v2.y; //y2
                }
            }
        }
        //scene2D.renderAll();
    });
    return group;
}

/*
function rotateAroundWorldAxis(object,axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis, radians);
    object.matrix.multiplyMatrices(rotWorldMatrix,object.matrix); // r56
    rotWorldMatrix.extractRotation(object.matrix);
    object.rotation.setEulerFromRotationMatrix(rotWorldMatrix, object.eulerOrder ); 
    object.position.getPositionFromMatrix( object.matrix );
}

function rotateAroundWorldAxisX(radians) { 
    this._vector.set(1,0,0);
    rotateAroundWorldAxis(this._vector,radians);
}
function rotateAroundWorldAxisY(radians) { 
    this._vector.set(0,1,0);
    rotateAroundWorldAxis(this._vector,radians);
}
function rotateAroundWorldAxisZ(degrees){ 
    this._vector.set(0,0,1);
    rotateAroundWorldAxis(this._vector,degrees);
}

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    //rotWorldMatrix.multiplySelf(object.matrix);        // pre-multiply
    object.matrix = rotWorldMatrix;
    object.rotation.getRotationFromMatrix(object.matrix, object.scale);
}
*/

/*
function loadOBJ(obj,mtl,object,x,y,z) {
  var loader = new THREE.OBJMTLLoader();
  loader.addEventListener('load', function(event) {
    var material = new THREE.ShaderMaterial({
      uniforms: shader.uniforms,
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader
    });

    var model = event.content;
      model.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        child.material = material;
      }
    });
        
    model.position.x = x;
    model.position.y = y;
    model.position.z = z;
    object.add(model);
  });
    loader.load('./models/obj/' + obj, 'models/obj/' + mtl);
}
*/

/*
THREE.ImageUtils.prototype.loadTextureBinary = function(data, mapping, callback) {
    var image = new Image(),
        texture = new THREE.Texture(image, mapping);
    image.onload = function() {
        texture.needsUpdate = true;
        if (callback) callback(this);
    };
    image.crossOrigin = this.crossOrigin;
    image.src = "data:image/png;base64," + Base64.encode(data);
    return texture;
};
*/

/*
http://stackoverflow.com/questions/17083580/i-want-to-do-animation-of-an-object-along-a-particular-path
http://jsfiddle.net/m1erickson/LumMX/
*/

function scene2DGroupArrayDynamicPosition(v1,v2,n,group)
{
    if(!n) //speed things up
        n = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);

    for (var i = 0; i < group.length; i++)
    {
        if(group[i])
        {
            var scale = group[i][0].origin.x / n; //TODO: calculate the scale ration dynamically?
            //============ LERP Formula ==============
            //start.x + (final.x - start.x) * progress;
            var L1x = v2.x + (v1.x - v2.x) * scale;
            var L1y = v2.y + (v1.y - v2.y) * scale;
            //========================================
            //var startAngle = Math.atan2(L2y-v2.y, L2x-v2.x);
            //var endAngle = Math.atan2(L1y-v2.y, L1x-v2.x);
            var a = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI;
            //var a = Math.atan2(L1y-v2.y, L1x-v2.x) * 180 / Math.PI;

            group[i][0].left = L1x;
            group[i][0].top = L1y;
            group[i][0].angle = a;
            //console.log(a);
            //if(group[i][0].name == 'window')
                //group[i][0].angle =  0; //TODO: Fix this dynamically
            //group.doors[i][0].adjustcircle.set({opacity:0});
        }
    }
}

function scene2DgetLineXYatPercent(startPt,endPt,percent) {
    // line: percent is 0-1
    var dx = endPt.x-startPt.x;
    var dy = endPt.y-startPt.y;
    var x = startPt.x + dx*percent;
    var y = startPt.y + dy*percent;
    return( {left:x,top:y} );
}

function scene2DgetQuadraticBezierXYatPercent(startPt,controlPt,endPt,percent) {
    // quadratic bezier: percent is 0-1
    var x = Math.pow(1-percent,2) * startPt.x + 2 * (1-percent) * percent * controlPt.left + Math.pow(percent,2) * endPt.x; 
    var y = Math.pow(1-percent,2) * startPt.y + 2 * (1-percent) * percent * controlPt.top + Math.pow(percent,2) * endPt.y; 
    return( {left:x,top:y} );
}

function camera3DFloorFlyIn(floor)
{
	//TODO: Fly into a specific section of the room

	var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:10, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(controls3D.target).to({x:0, y:0, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
    	FLOOR = floor;
        show3DFloor();
    }).start();
}

function camera3DNoteAdd()
{
  //TODO: bring up 3d note up close and html form
}

function scene3DFloorInsertAR()
{
    if (typeof NyARRgbRaster_Canvas2D == 'undefined') $.getScript("js/dynamic/JSARToolKit.js", function(data, textStatus, jqxhr) {
        
    });
}

function scene3DFloorInsertPicture()
{
    camera3DPositionCache = camera3D.position.clone();
    camera3DPivotCache = controls3D.target.clone();

    camera3DInsertPictureEnter();
}

function camera3DInsertPictureEnter()
{
    var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:10, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DInsertPictureExit()
{
    var tween = new TWEEN.Tween(camera3D.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DPictureEnter()
{
    var pLocal = new THREE.Vector3( 0, -1.75, -0.4 );
    var target = pLocal.applyMatrix4(camera3D.matrixWorld);

    var tween = new TWEEN.Tween(SelectedPicture.position).to(target,2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
            initPanorama('WebGLPanorama','3428',0.70,0.64);
        }).start();

    tween = new TWEEN.Tween(SelectedPicture.rotation).to({x:camera3D.rotation.x, y:camera3D.rotation.y, z:camera3D.rotation.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DPictureExit()
{
    disposePanorama('WebGLPanorama');

    var tween = new TWEEN.Tween(SelectedPicture.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(SelectedPicture.rotation).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DNoteEnter()
{
    if (ViewNoteText === "")
        return;
    //camera3D.add(SelectedNote);

    var pLocal = new THREE.Vector3( 0, -0.5, -0.6 );
    var target = pLocal.applyMatrix4(camera3D.matrixWorld);

    var tween = new TWEEN.Tween(SelectedNote.position).to(target,2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
        $('#WebGLNote').show();
    }).start();
    tween = new TWEEN.Tween(SelectedNote.rotation).to({x:camera3D.rotation.x, y:camera3D.rotation.y, z:camera3D.rotation.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DNoteExit()
{
    ViewNoteText = "";
    $('#WebGLNote').hide();
   
    //camera3D.remove(SelectedNote);
    var tween = new TWEEN.Tween(SelectedNote.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(SelectedNote.rotation).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DAnimate(x,y,z,speed)
{
    //if(!SceneAnimate){
	    //camera3D.position.set(0, 6, 20);
	    //controls3D.target = new THREE.Vector3(0, 50, 0);
        //camera3D.position.set(0, 20, 0);
        //camera3D.position.set(sx, sy, sz);
	    var tween = new TWEEN.Tween(camera3D.position).to({x:x, y:y, z:z},speed).easing(TWEEN.Easing.Quadratic.InOut).start();
        tween = new TWEEN.Tween(controls3D.target).to({x:0, y:0, z:0},speed).easing(TWEEN.Easing.Quadratic.InOut).start();
    //}
}

function camera3DWalkViewToggle()
{
    if (controls3D instanceof THREE.FirstPersonControls)
    {
        camera3DPositionCache = new THREE.Vector3(0, 6, 20);
        camera3DPivotCache = new THREE.Vector3(0, 0, 0);
        camera3DAnimateResetView();
        enableOrbitControls();
    }
    else if (controls3D instanceof THREE.OrbitControls)
    {
        alertify.confirm("", function (e) {
        if (e) {
            camera3DPositionCache = camera3D.position.clone();
            camera3DPivotCache = controls3D.target.clone();
            SceneAnimate = false;

            //TODO: anmate left and right menu hide
            var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:1.5, z:18},2000).easing(TWEEN.Easing.Quadratic.InOut).start();  
            tween = new TWEEN.Tween(controls3D.target).to({x:0, y:1.5, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
                enableFirstPersonControls();
            }).start();
        }});
        $('.alertify-message').append($.parseHTML("<img src='images/help/wasd-keyboard.jpg' /><br/><br/>Use (W,A,S,D) or arrow keys to move."));
    }
    else
    {
        alertify.alert("Not Available in Edit Mode");
    }
}

function enableTransformControls(mode)
{
    //https://github.com/mrdoob/three.js/issues/4286

    controls3D = new THREE.TransformControls(camera3D, renderer.domElement);
    //controls3D.addEventListener('change', renderer.render);

    controls3D.attach(SelectedObject);
    controls3D.setMode(mode);
    //console.trace();

    //$(renderer.domElement).unbind('mousemove', on3DMouseMove);

    //scene3DObjectUnselect();
    $('#WebGLInteractiveMenu').hide();
    $('#WebGLTextureSelect').hide();

    //scene3D.add(controls3D);
}

function enableOrbitControls()
{
    if (controls3D instanceof THREE.OrbitControls)
    {
        controls3D.enabled = true;
        return;
    }
    
    controls3D = new THREE.OrbitControls(camera3D, renderer.domElement);
    controls3D.minDistance = 3;
    controls3D.maxDistance = 25; //Infinity;
    //controls3D.minPolarAngle = 0; // radians
    //controls3D.maxPolarAngle = Math.PI; // radians
    controls3D.maxPolarAngle = Math.PI / 2; //Don't let to go below the ground
    //controls3D.target.set(THREE.Vector3(0, 0, 0)); //+ object.lookAT!
    controls3D.enabled = true;

    //camera3DAnimate(0,20,0, 500);
}

function enableFirstPersonControls()
{
    controls3D.enabled = false;
    controls3D = new THREE.FirstPersonControls(camera3D,renderer.domElement);
    controls3D.movementSpeed = 5;
    controls3D.lookSpeed = 0.15;
    controls3D.noFly = true;
    controls3D.lookVertical = false; //true;
    controls3D.activeLook = true; //enable later, otherwise view jumps
    controls3D.lon = -90;
    controls3D.lat = 0;
    controls3D.enabled = true;

    //controls3D.target = new THREE.Vector3(0, 0, 0);
    //camera3D.lookAt(new THREE.Vector3(0, 0, 0));
}

function camera3DAnimateResetView()
{
	if (camera3DPositionCache !== null && controls3D instanceof THREE.OrbitControls)
	{
        /*
		var tween = new TWEEN.Tween(camera3D.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},1800).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
        }).start();
		tween = new TWEEN.Tween(controls3D.target).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},1800).easing(TWEEN.Easing.Quadratic.InOut).start();
        */
    }
}

function open3DModel(js, objectContainer, x, y, z, xaxis, yaxis, ratio, shadow, note) {

    //http://www.smashingmagazine.com/2013/09/17/introduction-to-polygonal-modeling-and-three-js/

    /*
    Using a lambert material will keep light from reflecting off of the surface and is generally regarded as non-shiny.
    Many prototypes are created in lambert materials in order to focus on the structure, rather than the aesthetics.
    Phong materials are the opposite, instead rendering shiny surfaces. These can show some really fantastic effects when combined with the correct use of light.
    */

    /*var phongShader = THREE.ShaderLib.phong;
    //var uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);
    var material = new THREE.ShaderMaterial( {

        uniforms: phongShader.uniforms, //uniforms,
        vertexShader: phongShader.vertexShader,
        fragmentShader: phongShader.fragmentShader,
        lights:true,
        fog: true

    } );
    */

    //TODO: catch .obj and .dae
    /*
    var manager = new THREE.LoadingManager();
    
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
        //var material = new THREE.MeshFaceMaterial(materials);
    };
    */
try{
    var data;
    var ext = js.split('.').pop();
    var textures = js.substring(0, js.lastIndexOf("/") + 1) + "Textures/";
    
    /*
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function ( xhr ) {
    };
    */

    var callbackObject = function(object, note) {

        /* 
        Texture Fix
        https://github.com/denzp/three.js
        https://github.com/denzp/three.js/commit/c069ec1b26014b55bc961846feaf7f7554fc2bb2
        */

        object.name = js;

        object.boundingBox = [];
        object.boundingBox.max = [];
        object.boundingBox.max.x = 0;
        object.boundingBox.max.y = 0;
        object.boundingBox.max.z = 0;


        var geometry = new THREE.BufferGeometry();
        var meshArray = new THREE.Object3D();
        var geometryMerge = new THREE.Geometry();
        var materials = [];
     
        //console.log(object);

        //console.log(json.object.children[m].matrix);

        //var colors = new Float32Array(2 * object.faces.length * 3 * 3);
        //var buffer = new THREE.Geometry().fromBufferGeometry(child.geometry);
        //object.geometry = buffer;

        object.traverse( function ( child ) {

            if (child instanceof THREE.Mesh )
            {
                //console.log(child.geometry);

                //https://jsperf.com/json-vs-base64
                //https://github.com/mrdoob/three.js/issues/3349
                //https://github.com/bhouston/three.js/tree/base64-arraybuffer/src/loaders
               
                //child.geometry.mergeVertices(); //speed things up ?
                //child.geometry.computeFaceNormals(); //already done by .load
                //child.geometry.computeBoundingSphere(); //already done by .load

                child.geometry.computeFaceNormals();
                //child.geometry.computeTangents();
                child.geometry.computeVertexNormals(); // requires correct face normals
                child.geometry.computeBoundingBox(); // otherwise geometry.boundingBox will be undefined

                if(object.boundingBox.max.x < child.geometry.boundingBox.max.x)
                    object.boundingBox.max.x = child.geometry.boundingBox.max.x;
                if(object.boundingBox.max.y < child.geometry.boundingBox.max.y)
                    object.boundingBox.max.y = child.geometry.boundingBox.max.y;
                if(object.boundingBox.max.z < child.geometry.boundingBox.max.z)
                    object.boundingBox.max.z = child.geometry.boundingBox.max.z;

                //child.geometry.dynamic = true;
                child.castShadow = true;
                if (shadow)
                    child.receiveShadow = true;
                /*
                if(child.material !== null)
                {
                    child.texture.wrapS = THREE.ClampToEdgeWrapping; //THREE.RepeatWrapping;
                    child.texture.wrapT = THREE.ClampToEdgeWrapping; //THREE.RepeatWrapping;
                }
                */
                    
                if(child.material !== null)
                {
                    //console.log(child.material)
                    //child.material.shading = THREE.SmoothShading;
                    //child.material.side = THREE.DoubleSide; //Normally this will slow things down > do "solidify" with Blender
                    //child.material.depthWrite = true; //Blender exports fix
                    //child.material.offset = 0; //v72
                    //child.material.repeat = 0; //v72
                    //if(child.material.shininess == 1) //TODO: Fix this with Blender Exporter
                    
                    if((child.material.shininess - 10) > 1)
                    {
                        child.material.shininess = child.material.shininess - 10; //Looks like Blender uses different # - offset to equalize same look
                    }else if(child.material.shininess == 0 ){
                        child.material.shininess = 0.1;
                    }

                    //child.material.vertexColors = true;
                    //child.material.ambient = 0x999999;
                    //child.material.color = 0xffffff;
                    //child.material.specular = 0xffffff;
                    //child.material.morphTargets = true;
                    //child.material.morphNormals = true;
                    /*
                    var material = new THREE.MeshBasicMaterial({
                        map: THREE.ImageUtils.loadTexture("diffuse.jpg"),
                        aoMap: THREE.ImageUtils.loadTexture("lightmap.jpg"), // your lightmap used as aoMap
                        aoMapIntensity: 0.5,
                        side: THREE.DoubleSide,
                    });
                    */
                    //console.log(js + " > opacity:" + child.material.opacity);

                    if(child.material.opacity < 1) //glass transparency fix
                    {
                        child.material.transparent = true;
                        //child.material.vertexColors = false;
                    }else{
                        child.material.transparent = false;
                    }
                }
                
            }else if (child instanceof THREE.PointLight) {
                console.log("light found!");

                //pointLight = new THREE.PointLight( 0xffaa00 );
                //pointLight.position.set( 0, 0, 0 );
                //scene3D.add( object );
            }
            /*
            if ( object.userData.rotating === true ) {

                rotatingObjects.push( object );
            }

            if ( object instanceof THREE.MorphAnimMesh ) {

                morphAnimatedObjects.push( object );
            }

            if ( object instanceof THREE.SkinnedMesh ) {

                if ( object.geometry.animation ) {

                    var animation = new THREE.Animation( object, object.geometry.animation );
                    animation.play();
                }
            }
            */
        });

        //geometry.groupsNeedUpdate = true; //v71

        //console.log(object);
        //object.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        object.position.x = x;
        object.position.y = y;
        object.position.z = z;

        object.rotation.x = xaxis;
        object.rotation.y = yaxis + Math.PI;
        //object.rotation.z = zaxis;

        console.log("ObjectLoader add model to scene " + object.name);
        objectContainer.add(object);

        /*
        After automatic translation to BufferedGeometry
        ===============================================
        */
         if(note)
        {
            var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
            var geometry = new THREE.TextGeometry(note, {
                font: 'helvetiker', // Must be lowercase!
                weight: 'normal',
                size: 0.05,
                height: 0.01
            });
            var textMesh = new THREE.Mesh(geometry, material);
            //textGeometry.computeBoundingBox();  // Do some optional calculations. This is only if you need to get the width of the generated text
            //textGeometry.textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            textMesh.position.x = 1.25;
            textMesh.position.y = 0.5;
            textMesh.position.z = 0.05;
            textMesh.rotation.y = 1.5;
            textMesh.name = note;

            open3DModel("objects/Platform/note.jsz", object, 1.25, 0.1, -0.3, 0, 1.5, 1, false, null);
            object.add(textMesh);
            
            console.log( js + " Add Note: '" + note + "'");
        }

        if(objectContainer == scene3DFloorFurnitureContainer[FLOOR])
        {
            var material = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 2
            });
            var geometry = new THREE.Geometry();

            var x1 = x - object.boundingBox.max.x*3;
            var z1 = z - object.boundingBox.max.z*3;
            var x2 = x + object.boundingBox.max.x*3;
            var z2 = z + object.boundingBox.max.z*3;

            console.log(js + " > " + object.boundingBox.max.z + " " + object.boundingBox.max.x + " " + object.boundingBox.max.y)
           
            //TODO: if y > 0
            //var arrow = new THREE.ArrowHelper(direction, firstVector, computeDistance(node1, node2) - 32, co);

            //horizontal
            geometry.vertices.push(new THREE.Vector3(x1, 0, z1));
            geometry.vertices.push(new THREE.Vector3(x2, 0, z1));

            //vertical
            geometry.vertices.push(new THREE.Vector3(x1, 0, z1));
            geometry.vertices.push(new THREE.Vector3(x1, 0, z2));

            //var offset = scene3DFloorFurnitureContainer[FLOOR].children[i].centroid.clone();
            //geometry.applyMatrix(new THREE.Matrix4().makeTranslation( -offset.x, 0, -offset.z ) );
            //objMesh.position.copy( objMesh.centroid );
 
            //var line = new THREE.Line(geometry, material);
            var line = new THREE.Line(geometry, material, THREE.LineSegments); //v72
            //var line = new THREE.Line(geometry, material, THREE.LinePieces); //v71
            line.position.y = 0.01;
            //line.dynamic = true;

            var realLifeDimentions = [];
            var geometryText = [];
            realLifeDimentions[0] = object.boundingBox.max.z * 400;
            realLifeDimentions[1] = object.boundingBox.max.x * 400;
            //realLifeDimentions[2]  = child.geometry.boundingBox.max.y * 200;
            
            for (var u = 0; u <= 1; u++)
            {
                var units = "";

                if (realLifeDimentions[u] > 100)
                {
                    units = (realLifeDimentions[u]/100).toFixed(2) + " m";
                }else{
                    units = Math.round(realLifeDimentions[u]) + " cm";
                }

                geometryText[u] = new THREE.TextGeometry(units, {
                    font: 'helvetiker', // Must be lowercase!
                    weight: 'normal',
                    size: 0.2,
                    height: 0.01
                });
                geometryText[u].computeBoundingBox();
            }
            
            var textMeshL = new THREE.Mesh(geometryText[0], material);
            textMeshL.position.x = x - geometryText[0].boundingBox.max.x/2;
            textMeshL.position.y = 0.01;
            textMeshL.position.z = z1 - 0.1;
            textMeshL.rotation.x = -1.5;

            var textMeshW = new THREE.Mesh(geometryText[1], material);
            textMeshW.position.x = x1 - 0.1;
            textMeshW.position.y = 0.01;
            textMeshW.position.z = z + geometryText[1].boundingBox.max.x/2;
            textMeshW.rotation.x = -1.55;
            textMeshW.rotation.z = 1.6;

            //line.rotation = scene3DFloorFurnitureContainer[FLOOR].children[i].geometry.rotation.clone();

            //object.add(textMeshL);
            //object.add(textMeshW);
            
            line.add(textMeshL);
            line.add(textMeshW);

            object.add(line);

            //textMeshL.visible = false;
            //textMeshW.visible = false;
            line.visible = false;

            //console.log("Calculating " + mesh.name + " measurements " + mesh.position.x + ":" + mesh.position.z + " " + mesh.geometry.boundingBox.max.x + ":" + mesh.geometry.boundingBox.max.z);
        }
        
        //var bufferMesh = new THREE.Mesh(geometry, object.children[0].material);
        //bufferMesh.scale.set(1,1,1);
        //objectContainer.add(bufferMesh);

        //geometry = new THREE.BufferGeometry().setFromObject(object);
        //console.log(geometry);
        //===========================
        //var bufferMesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ));
        //buffer_geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        //buffer_geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
        //buffer_geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        //buffer_geometry.computeBoundingSphere();

        /*
        meshArray.position.x = x;
        meshArray.position.y = y;
        meshArray.position.z = z;
        meshArray.rotation.x = xaxis;
        meshArray.rotation.y = yaxis;
        */

        //objectContainer.add(meshArray);
        //===========================
    };


    if (js.split('.').pop() == 'jsz') //zipped json file
    {
        var filename = js.split('/').pop().slice(0, -4) + ".json";

        /*
        var fullpath = window.location.pathname; // + window.location.search;
        var r = /[^\/]*$/;
        fullpath = fullpath.replace(r, '');
        console.log(fullpath + "objects/" + js + " > " + filename + " > " + ext);
        */
        /*
        switch (window.location.protocol) {
            case 'http:':
            case 'https:':

                $.get(url, function(data) {
                    zip.load(data);
                    data = zip.file(filename + ".js").asText();
                    console.log(data);
                });
				
                break;
            case 'file:':

				//Looks like jQuery method has a limit of 422315 ?
				
                $("#fileJQueryLoad").load(url, function(response, status, xhr) {
                    if (status == "error") {
                        console.log(xhr.status + " " + xhr.statusText);
                    } else {
                        //console.log(response);
                        zip.load(response);
        data = zip.file(filename + ".json").asText();
                        console.log(data);
                    }
                });
				
                url = "objects/" + js.slice(0, -4) + ".json";
                break;
            default:
        }
		*/

        $.ajax(js,{
            
            contentType: "application/zip",
            beforeSend: function (req) {
              req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
            },
            //async: true,
            //dataType: "binary",
            //processData: false,
            //responseType:'arraybuffer',
            success: function(data){
                //try {
                    var zip = new JSZip(data);
                    
                    //zip.load(binary.read('string'));
                    data = zip.file(filename).asText(); //console.log("unzip OK " + js);
                    data = $.parseJSON(data); //JSON.parse(data);

                    //if (data.metadata.formatVersion == 3.1){ //using export script io_mesh_threejs
                    //    console.log("using old format 3 " + js);
                    //    //loader = new THREE.JSONLoader();
                    //    var result = loader.parse(data, textures);
                    //    callback(result.geometry, result.materials);
                    //}else{ //using export script io_three
                        /*
                        https://github.com/mrdoob/three.js/wiki/JSON-Texture-format-4
                        */

                        //console.log("using new format 4 " + js);
                        /*
                        var manager = new THREE.LoadingManager();
                        manager.onProgress = function ( item, loaded, total ) {
                            //console.log( item, loaded, total );
                        };
                        */
                        var loader = new THREE.ObjectLoader(); //new THREE.ObjectLoader(manager);

                        //loader.setTexturePath(textures); //v71
                        //loader.parse(data,callbackObject); //v71

                        //=======================================
                        //Blender Export v72 Fix
                        //=======================================
                        
                        for (var i = 0; i < data.textures.length; i++) {
                            if(data.textures[i].mapping)
                                data.textures[i].mapping = THREE.UVMapping;

                            if(data.textures[i].minFilter)
                            {
                                //data.textures[i].minFilter = THREE.NearestFilter;
                                data.textures[i].minFilter = THREE.LinearFilter;
                            }
                            if(data.textures[i].magFilter)
                            {
                                //data.textures[i].magFilter = THREE.NearestFilter;
                                data.textures[i].magFilter = THREE.LinearFilter;
                            }

                            if(data.textures[i].wrap)
                            {
                                //data.textures[i].wrap = [THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping];
                                data.textures[i].wrap = [THREE.RepeatWrapping,THREE.RepeatWrapping];
                            }
                        }
                        
                        for (var i = 0; i < data.images.length; i++) {
                            if(data.images[i].url){
                                data.images[i].url = textures + data.images[i].url;
                                //console.log(js + ">" + data.images[i].url);
                            }
                        }
                        
                        for (var i = 0; i < data.object.children.length; i++) {
                            var material_uuid = data.object.children[i].material;
                            var geometry_uuid = data.object.children[i].geometry;
                            var geometry_matrix = data.object.children[i].matrix;
                            var geometry_opacity = 1;

                            //console.log("material " + material_uuid);
                            //console.log("geometry " + geometry_uuid);
                            for (var g = 0; g < data.geometries.length; g++) {

                                if (data.geometries[g].uuid == geometry_uuid){
                                    geometry_opacity = data.geometries[g].materials[0].opacity;
                                    //console.log(geometry_matrix);
                                    //data.geometries[g].matrix2 = geometry_matrix;
                                    //console.log("opacity " + geometry_opacity);
                                    break;
                                }
                            }
                            if(geometry_opacity == 0)
                                geometry_opacity = 0.99;

                            for (var m = 0; m < data.materials.length; m++) {
                                if (data.materials[m].uuid == material_uuid){
                                    data.materials[m].opacity = geometry_opacity;
                                    break;
                                }
                            }
                        }
                        
                        //=======================================
                        callbackObject(loader.parse(data), note); //v72
                        //=======================================
                    //}
                //} catch (e) { //zip file was probably not found, load regular json
                    //console.log("Other 3D format " + e + " " + js.slice(0, -4) + "");

                    //loader = new THREE.JSONLoader();
                    //loader.load(js.slice(0, -4) + ".json", callback, textures);
                //}
            },
            error: function(xhr, textStatus, errorThrown){
				alertify.alert("3D Model (" + js + ") Loading Error");
			}
        });
    /*
    } else if (js.split('.').pop() == 'sea') {
        loader = new THREE.SEA3D(true);
        //var basicMap = new THREE.MeshBasicMaterial( {color:0x000000} )
        loader.onComplete = function( e ) {
            var i = loader.meshes.length;
            while(i--){
                var m = loader.meshes[i];
                //m.name = js;
                /
                m.position.x = x;
                m.position.y = y;
                m.position.z = z;
                m.rotation.x = xaxis;
                m.rotation.y = yaxis;
                /
                objectContainer.add(m);
            }
            console.log("SEA3D add model to scene" + js.slice(0, -4));
            console.log(loader);
            //objectContainer.add(loader);
        }
        loader.parser = THREE.SEA3D.DEFAULT;
        //loader.parser = THREE.SEA3D.BUFFER;
        loader.load(js);
        /
        loader = new THREE.SEA3D.Pool();
        loader.load( [js], function()
        {
            console.log(loader.getList());
        });
        /
        */

    } else if (js.split('.').pop() == 'obj') {

        //loader = new THREE.OBJMTLLoader();
        loader = new THREE.OBJLoader();

        //loader.load(js, js.slice(0, -4) + '.mtl', function (object)
        loader.load(js, function (object)
        {
            object.name = js;
            object.position.x = x;
            object.position.y = y;
            object.position.z = z;
            object.rotation.x = xaxis;
            object.rotation.y = yaxis;

            console.log("OBJMTL add model to scene" + js.slice(0, -4));
            console.log(object);
            objectContainer.add(object);

        }, onProgress, onError);

        //loader.load(js, callback, textures);
    }
}catch(e){
    console.log("open3DModel Error " + e);
}
}

function cube(size) {

    var h = size * 0.5;

    geometry = new THREE.Geometry();

    geometry.vertices.push(
        new THREE.Vector3(-h, -h, -h),
        new THREE.Vector3(-h, h, -h),

        new THREE.Vector3(-h, h, -h),
        new THREE.Vector3(h, h, -h),

        new THREE.Vector3(h, h, -h),
        new THREE.Vector3(h, -h, -h),

        new THREE.Vector3(h, -h, -h),
        new THREE.Vector3(-h, -h, -h),


        new THREE.Vector3(-h, -h, h),
        new THREE.Vector3(-h, h, h),

        new THREE.Vector3(-h, h, h),
        new THREE.Vector3(h, h, h),

        new THREE.Vector3(h, h, h),
        new THREE.Vector3(h, -h, h),

        new THREE.Vector3(h, -h, h),
        new THREE.Vector3(-h, -h, h),

        new THREE.Vector3(-h, -h, -h),
        new THREE.Vector3(-h, -h, h),

        new THREE.Vector3(-h, h, -h),
        new THREE.Vector3(-h, h, h),

        new THREE.Vector3(h, h, -h),
        new THREE.Vector3(h, h, h),

        new THREE.Vector3(h, -h, -h),
        new THREE.Vector3(h, -h, h)
    );
    return geometry;
}

function show3DHouse() {

    enableOrbitControls();

    //Something interesting from the web (maybe someday) -> http://inear.se/urbanjungle
    //Math behind the scenes explained here http://www.inear.se/2014/03/urban-jungle-street-view/
    scene3DFreeMemory();
    hideElements();
    SCENE = 'house';

    initMenu("menuRight3DHouse","Exterior/index.json");

    $(renderer.domElement).bind('mousedown', on3DHouseMouseDown);
    $(renderer.domElement).bind('mouseup', on3DHouseMouseUp);
    $(renderer.domElement).bind('dblclick', onDocumentDoubleClick);

    if (TOOL3DINTERACTIVE == 'moveXY') {
        menuSelect(0, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'moveZ') {
        menuSelect(1, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'rotate') {
        menuSelect(2, 'menuInteractiveItem', '#ff3700');
    }

    var menuBottom = [2,3,4,5,6,7,8,9,10];
    menuBottom.forEach(function(item) {
         $('#menuBottomItem' + item).show();
    });
    $('#menuBottom').show();
    $('#engine3D').show();

    toggleRight('menuRight', true);
    toggleLeft('menuLeft3DHouse', true);

    menuSelect(1, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    scene3DSetSky(DAY);
    scene3D.add(skyMesh);

    if(options.clouds)
        scene3D.add(weatherSkyCloudsMesh);
    if(options.rainbow)
        scene3D.add(weatherSkyRainbowMesh);
    
    scene3DSetLight();

    scene3DFloorWallGenerate();

    //initObjectCollisions(scene3DHouseContainer);

    //$(renderer.domElement).bind('mousemove', on3DMouseMove);
    //$(renderer.domElement).bind('mousedown', on3DMouseDown);
    //$(renderer.domElement).bind('mouseup', on3DMouseUp);

    //scene3DHouseContainer.traverse;

    //TODO: Loop and show based in ID name

    scene3D.add(scene3DHouseGroundContainer);
    //scene3D.add(scene3DHouseFXContainer);
    scene3D.add(scene3DHouseContainer);
    scene3D.add(scene3DRoofContainer);

    //scene3D.add(scene3DFloorShapeContainer[FLOOR]);
    
    for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
        scene3D.add(scene3DFloorFurnitureContainer[i]);
    }
    scene3DCube.add(scene3DCubeMesh);

    //console.trace();

    setTimeout(function() {
        camera3DAnimate(0,6,20, 1000);
    }, 1500);
    
    animate();
}

//========================================
/** CONFIG **/
var plots_x = 20;
var plots_y = 20;
var plot_vertices = 2;

var map_left = plots_x /  -2;
var map_top = plots_y / -2;

/** MOUSE **/
var terrain3DMouse = {
    x: 0,
    y: 0,
    //state: 0, // 0 - up, 1 - down, 2 - dragging,
    //plot: {x: null, y: null},
    vertex: {x: null, y: null}
};

var updateMouse = function updateMouse(e) {
    e.preventDefault();
    //e.stopPropagation();
    //e.cancelBubble = true;
    
    terrain3DMouse.x = e.clientX; //layerX;
    terrain3DMouse.y = e.clientY; //layerY;
};

var updateMouseCoordinates = function() {

    var vector = new THREE.Vector3((terrain3DMouse.x / window.innerWidth) * 2 - 1, - (terrain3DMouse.y / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(camera3D);
    var ray = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());
    var intersection = ray.intersectObjects(terrain3D.children);

    if (intersection.length > 0) {
        
        //terrain3DMouse.plot.x = Math.floor(intersection[0].point.x - map_left);
        //terrain3DMouse.plot.y = Math.floor(intersection[0].point.z - map_top);
        
        terrain3DMouse.vertex.x = Math.floor((intersection[0].point.x * plot_vertices) - (map_left * plot_vertices));
        terrain3DMouse.vertex.y = Math.floor((intersection[0].point.z * plot_vertices) - (map_top * plot_vertices));

        terrain3D.materials[0].uniforms.ring_center.value.x = intersection[0].point.x;
        terrain3D.materials[0].uniforms.ring_center.value.y = -intersection[0].point.z;
    }
};

/** VERTEX POINTS **/
var verticeIndex = function(vertice) {
    return vertice.x + vertice.y * ((plots_x * plot_vertices) + 1);
};

var findLattices = (function() {
    function distance(x, y) {
        return Math.pow(x, 2) + Math.pow(y, 2);
    }
    function generate_n2(radius) {

        var ymax = [0];
        var d = 0;
        var points = [];
        var batch, x, y;
        
        while (d <= radius) {
            yieldable = [];
            
            while (true) {
                batch = [];
                for (x = 0; x < d+1; x++) {
                    y = ymax[x];
                    if (distance(x, y) <= Math.pow(d, 2)) {
                        batch.push({x: x, y: y});
                        ymax[x] += 1;
                    }
                }
                if (batch.length === 0) {
                    break;
                }
                points = points.concat(batch);
            }
            
            d += 1;
            ymax.push(0);
        }
        return points;
    }
    
    return function findLattices(radius, origin) {
        var all_points = [];
        
        var i, point, points = generate_n2(radius);
        for (i = 0; i < points.length; i++) {
            point = points[i];
            
            all_points.push(point);
            if (point.x !== 0) {
                all_points.push({x: -point.x, y: point.y});
            }
            if (point.y !== 0) {
                all_points.push({x: point.x, y: -point.y});
            }
            if (point.x && point.y) {
                all_points.push({x: -point.x, y: -point.y});
            }
        }
        
        for (i = 0; i < all_points.length; i++) {
            all_points[i].x += origin.x;
            all_points[i].y += origin.y;
        }
        
        return all_points;
    };
})();

/** LANDSCAPING **/
function lanscape() {
    var landscape_tool = null;
    
    this.select = function(tool) {
        landscape_tool = tool;
    };
    this.onmousemove = function() {

        if (!controls3D.enabled) { // The user has clicked and drug their mouse
            
            // Get all of the vertices in a 5-unit radius
            var vertices = findLattices(3 * plot_vertices, terrain3DMouse.vertex);
            
            // Call the landscaping tool to do its job
            this.tools[landscape_tool](3 * plot_vertices, vertices);
            
            // Ensure all of the vertices are within the elevation bounds
            var vertice_index;
            var vertice_data = [];
            //console.log("# of vertices " + vertices.length);
            for (var i = 0; i < vertices.length; i++) {

                vertice_index = verticeIndex(vertices[i]);

                if (terrain3D.displacement.value[vertice_index] > 6) {
                    terrain3D.displacement.value[vertice_index] = 6;
                }
                
                if (terrain3D.displacement.value[vertice_index] < -5) {
                    terrain3D.displacement.value[vertice_index] = -5;
                }
                
                terrain3D.water.displacement.value[vertice_index] = terrain3D.displacement.value[vertice_index];
            }

            //terrain3DRawData.push(terrain3DMouse);

            terrain3D.water.displacement.needsUpdate = true;
        }
    };
    
    this.tools = {
        hill: function(radius, vertices) {
            
            var i, vertice, vertice_index, distance;
            
            for (i = 0; i < vertices.length; i++) {
                
                vertice = vertices[i];
                
                if (vertice.x < 0 || vertice.y < 0) {
                    continue;
                }
                if (vertice.x >= plots_x * plot_vertices + 1 || vertice.y >= plots_y * plot_vertices + 1) {
                    continue;
                }
                
                vertice_index = verticeIndex(vertice);
                distance = Math.sqrt(Math.pow(terrain3DMouse.vertex.x - vertice.x, 2) + Math.pow(terrain3DMouse.vertex.y - vertice.y, 2));
                
                terrain3D.displacement.value[vertice_index] += Math.pow(radius - distance, 0.5) * 0.03;
                terrain3D.displacement.needsUpdate = true;
            }
            terrain3DRawHillData.push(terrain3DMouse);
        },
        
        valley: function(radius, vertices) {
            
            var i, vertice, vertice_index, distance;
            
            for (i = 0; i < vertices.length; i++) {
                
                vertice = vertices[i];
                
                if (vertice.x < 0 || vertice.y < 0) {
                    continue;
                }
                if (vertice.x >= plots_x * plot_vertices + 1 || vertice.y >= plots_y * plot_vertices + 1) {
                    continue;
                }
                
                vertice_index = verticeIndex(vertice);
                distance = Math.sqrt(Math.pow(terrain3DMouse.vertex.x - vertice.x, 2) + Math.pow(terrain3DMouse.vertex.y - vertice.y, 2));
                
                terrain3D.displacement.value[vertice_index] -= Math.pow(radius - distance, 0.5) * 0.03;
                terrain3D.displacement.needsUpdate = true;
            }
            terrain3DRawValleyData.push(terrain3DMouse);
        }
    };
}

function Degrees2Radians(degrees) {
    return degrees * (Math.PI / 180);
}

function getHeightData(img,scale) //return array with height data from img
{
    if (scale === undefined) 
        scale=1;
  
    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );
 
    var size = img.width * img.height;
    var data = new Float32Array( size );
 
    context.drawImage(img,0,0);
 
    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0;
    }
 
    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
 
    var j=0;
    for (var i = 0; i<pix.length; i +=4) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/(12*scale);
    }
     
    return data;
}

//========================================
function show3DLandscape() {

    SceneAnimate = false;
    scene3DFreeMemory();
    hideElements();
    //scene3D = new THREE.Scene();
    SCENE = 'landscape';

    scene3DSetSky('day');
    scene3DSetLight();

    enableOrbitControls();
    camera3D.position.set(10, 10, 15);
    camera3D.lookAt(scene3D.position);

    TOOL3DLANDSCAPE = 'rotate';
   
    //scene3D.add(scene3DHouseGroundContainer);
    scene3D.add(skyMesh);
    scene3D.add(terrain3D);

    $(renderer.domElement).bind('mousedown', on3DLandscapeMouseDown);
    $(renderer.domElement).bind('mouseup', on3DLandscapeMouseUp);
    $(renderer.domElement).bind('mousemove', on3DLandscapeMouseMove);
    //$(renderer.domElement).bind('mouseout', on3DLandscapeMouseUp);

    menuSelect(0, 'menuLeft3DLandscapeItem', '#ff3700');
    toggleLeft('menuLeft3DLandscape', true);

    menuSelect(2, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    $('#engine3D').show();

    //texture = THREE.ImageUtils.loadTexture( 'objects/Landscape/Textures/G3756.jpg' )
    //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //texture.repeat.set(10, 10);
    
    //scene3D.add(scene3DFloorShapeContainer[1][0]);

    /*
    //http://danni-three.blogspot.ca/2013/09/threejs-heightmaps.html
    var img = new Image();
    img.onload = function () {
      
        //get height data from img
        var data = getHeightData(img);
      
        // plane
        var geometry = new THREE.PlaneGeometry(10,10,9,9); //10x10 plane with 100 vertices. heightmap image is 10x10 px
        var texture = THREE.ImageUtils.loadTexture( 'images/heightmap2.png' );
        var material = new THREE.MeshLambertMaterial( { map: texture } );
        plane = new THREE.Mesh( geometry, material );
         
        //set height of vertices
        for ( var i = 0; i<plane.geometry.vertices.length; i++ ) {
             plane.geometry.vertices[i].z = data[i];
        }
        scene.add(plane);
    };
    img.src = "images/heightmap2.png";
    */

    animate();
}

function show3DFloor() {

    SceneAnimate = false;
    scene3DFreeMemory();
    hideElements();
    //scene3D = new THREE.Scene();
    SCENE = 'floor';

    initMenu("menuRight3DFloor","Interior/index.json");
    
    scene3DSetLight();

    enableOrbitControls();

    scene3DFloorWallGenerate();

    //camera3D.position.set(0, 10, 12);
    
    //TODO: Loop and show based in ID name / floor
    //scene3D.add(scene3DContainer);

    //scene3DSetSky('0000');
    scene3D.add(skyMesh);
    scene3D.add(scene3DFloorGroundContainer);
    
    /*
    scene3D.add(camera3DMirrorReflection);
    try {
        var floorMaterial = new THREE.MeshPhongMaterial({
            map: scene3DFloorGroundContainer.children[0].materials[0], //.map,
            envMap: camera3DMirrorReflection.renderTarget,
            reflectivity: 0.5
        });
        scene3DFloorGroundContainer.children[0].materials[0] = floorMaterial;
    }catch(e){}
    */
   
    //scene3D.add(scene3DCutawayPlaneMesh); //DEBUG

    scene3D.add(scene3DFloorFurnitureContainer[FLOOR]); //furnishings

    if(TOOL3DFLOOR == 'measure')
    {
        scene3DFloorMeasurementsGenerate();
        //scene3D.add(scene3DFloorMeasurementsContainer[FLOOR]);
        for (var i = 0; i < scene3DFloorFurnitureContainer[FLOOR].children.length; i++) {
            if(scene3DFloorFurnitureContainer[FLOOR].children[i].children[1])
                scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible = true;
        }
    }

    scene3D.add(scene3DFloorWallContainer[FLOOR]); //walls
    //scene3D.add(scene3DFloorShapeContainer[FLOOR]); //floor ground
    //scene3D.add(scene3DFloorOtherContainer[FLOOR]); //notes

    scene3DCube.add(scene3DCubeMesh);

    //$(renderer.domElement).bind('mousemove', on3DMouseMove);
    //$(renderer.domElement).bind('mousedown', on3DMouseDown);
    //$(renderer.domElement).bind('mouseup', on3DMouseUp);

    $(renderer.domElement).bind('mousedown', on3DFloorMouseDown);
    $(renderer.domElement).bind('mouseup', on3DFloorMouseUp);
    $(renderer.domElement).bind('mousemove', on3DFloorMouseMove);
    $(renderer.domElement).bind('dblclick', onDocumentDoubleClick);

    //scene3DFloorFurnitureContainer[0].traverse;
    $('#menuFloorSelectorText').html(scene3DFloorFurnitureContainer[FLOOR].name);
    $('#menuFloorSelector').show();

    var menuBottom = [8,9,10];
    menuBottom.forEach(function(item) {
         $('#menuBottomItem' + item).show();
    });
    $('#menuBottom').show();

    toggleRight('menuRight', true);
    toggleLeft('menuLeft3DFloor', true);

    menuSelect(5, 'menuTopItem', '#ff3700');
    menuSelect(0,'menuLeft3DFloorItem','#ff3700');
    correctMenuHeight();

    $('#engine3D').show();

    setTimeout(function() {
        camera3DAnimate(0,10,12, 1000);
    }, 500);

    animate();
}

function show3DFloorLevel() {
 
    SceneAnimate = false;
    scene3DFreeMemory();
    hideElements();
    //scene3D = new THREE.Scene();
    SCENE = 'floorlevel';

    //scene3DSetBackground('blue');
    scene3DSetSky('day');
    scene3DSetLight();

    enableOrbitControls();
    camera3D.position.set(10, 10, 15);
    camera3D.lookAt(scene3D.position);

    scene3DLevelWallGenerate();

    scene3D.add(skyMesh);
    //scene3D.add(scene3DLevelGroundContainer);
    scene3D.add(scene3DHouseGroundContainer);

    //scene3DCube.add(scene3DCubeMesh);

    menuSelect(3, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //$('#HTMLCanvas').hide();
    $('#engine3D').show();

    animate();
}

function show3DRoofDesign() {
 
    SceneAnimate = false;
    scene3DFreeMemory();
    hideElements();
    //scene3D = new THREE.Scene();
    SCENE = 'roof';

    initMenu("menuRight3DRoof","Roof/index.json");

    scene3DSetBackground('split');
    scene3DSetLight();

    //camera3D.position.set(0, 4, 12);

    scene3D.add(camera3DQuad[0]);
    scene3D.add(camera3DQuad[1]);
    scene3D.add(camera3DQuad[2]);
    scene3D.add(camera3DQuad[3]);
    scene3D.add(camera3DQuadGrid);

    scene3D.add(scene3DRoofContainer);

    //scene3D.add(sceneHemisphereLight);
    //scene3D.add( new THREE.AxisHelper(100) );
    //scene3D.add(scene3DLevelGroundContainer);

    //TODO: show extruded stuff from scene2DFloorContainer[0]
    //scene3DCube.add(scene3DCubeMesh);

    toggleRight('menuRight', true);

    menuSelect(4, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //$('#HTMLCanvas').hide();
    $('#engine3D').show();

    animate();
}

/*
function initObjectCollisions(container) {

	//colliderSystem = new THREEx.ColliderSystem();
	colliderSystem = new Array();

	console.log("init colliderSystem (" + container.children.length + ")");

	for (var i = 0; i < container.children.length; i++) {

		console.log("adding " + container.children[i].name + " to collision detection");

		colliderSystem.push(new Array(container.children[i].name, new THREE.Box3().setFromPoints(container.children[i].geometry.vertices)));

		//var collider = THREEx.Collider.createFromObject3d(container.children[i]);
		//colliderSystem.add(collider)
		//collider.update();

		//collider.addEventListener('contactEnter', function(otherCollider){
		//	console.log('contactEnter', collider.object3d.name, 'with', otherCollider.object3d.name)
		//});
    }
}
*/

function scene3DSunlight() {

    /*
    God Rays (Sunlight Effect)
    http://threejs.org/examples/webgl_sunlight_godrays.html
    */
    if(options.sunlight)
    {
        var sunPosition = new THREE.Vector3( 0, 10, -10 );
        var materialDepth = new THREE.MeshDepthMaterial();
        var screenSpacePosition = new THREE.Vector3();

        sunlight.scene = new THREE.Scene();

        sunlight.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
        sunlight.camera.position.z = 50;

        sunlight.scene.add( sunlight.camera );

        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
        sunlight.rtTextureColors = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

        // Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
        // investigate further for now.
        //pars.format = THREE.LuminanceFormat;

        // I would have this quarter size and use it as one of the ping-pong render
        // targets but the aliasing causes some temporal flickering

        sunlight.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

        // Aggressive downsize god-ray ping-pong render targets to minimize cost

        var w = window.innerWidth / 4.0;
        var h = window.innerHeight / 4.0;
        sunlight.rtTextureGodRays1 = new THREE.WebGLRenderTarget( w, h, pars );
        sunlight.rtTextureGodRays2 = new THREE.WebGLRenderTarget( w, h, pars );

        // god-ray shaders

        var godraysGenShader = THREE.ShaderGodRays.godrays_generate;
        sunlight.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
        sunlight.materialGodraysGenerate = new THREE.ShaderMaterial({
            uniforms: sunlight.godrayGenUniforms,
            vertexShader: godraysGenShader.vertexShader,
            fragmentShader: godraysGenShader.fragmentShader
        });
        
        var godraysCombineShader = THREE.ShaderGodRays.godrays_combine;
        sunlight.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
        sunlight.materialGodraysCombine = new THREE.ShaderMaterial( {

            uniforms: sunlight.godrayCombineUniforms,
            vertexShader: godraysCombineShader.vertexShader,
            fragmentShader: godraysCombineShader.fragmentShader

        } );
        
        var godraysFakeSunShader = THREE.ShaderGodRays.godrays_fake_sun;
        sunlight.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
        sunlight.materialGodraysFakeSun = new THREE.ShaderMaterial( {

            uniforms: sunlight.godraysFakeSunUniforms,
            vertexShader: godraysFakeSunShader.vertexShader,
            fragmentShader: godraysFakeSunShader.fragmentShader
        });

        sunlight.godraysFakeSunUniforms.bgColor.value.setHex( 0x000511);
        sunlight.godraysFakeSunUniforms.sunColor.value.setHex( 0xffee00 );

        sunlight.godrayCombineUniforms.fGodRayIntensity.value = 0.4; //0.75;

        sunlight.quad = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight ),
            sunlight.materialGodraysGenerate
        );
        sunlight.quad.position.z = -9900;
        sunlight.scene.add( sunlight.quad );
    }
}
function scene2DZoom(SCALE_FACTOR) {

    /*
    http://jsfiddle.net/Q3TMA/
    http://jsfiddle.net/butch2k/kVukT/37/
    */
    //console.log(SCALE_FACTOR);
    
    scene2D.setHeight(scene2D.getHeight() * SCALE_FACTOR);
    scene2D.setWidth(scene2D.getWidth() * SCALE_FACTOR);
    scene2D.calcOffset();              
    
    var objects = scene2D.getObjects();
    for (var i in objects)
    {
        var obj = objects[i];
        obj.scaleX=obj.scaleX/zoom2D*SCALE_FACTOR;
        obj.scaleY=obj.scaleY/zoom2D*SCALE_FACTOR;
        obj.left=obj.left/zoom2D*SCALE_FACTOR;
        obj.top=obj.top/zoom2D*SCALE_FACTOR;
        //obj.setCoords();
    }
    scene2D.renderAll();
    
    zoom2D = SCALE_FACTOR;
}

function show2D() {

    animateStop();

    scene3DFreeMemory();
    scene2DFreeMemory();
    hideElements();
    SCENE = '2d';

    //camera2D.position.set(0, 8, 20);

    initMenu("menuRight2D","FloorPlan/index.json");

    scene3DSetBackground(null);

    if (TOOL2D == 'freestyle') {
        menuSelect(2, 'menuLeft2DItem', '#ff3700');
        scene2D.isDrawingMode = true;
    }
    else
    {
        scene2D.isDrawingMode = false;
        if (TOOL2D == 'vector') {
            menuSelect(3, 'menuLeft2DItem', '#ff3700');
        } else if (TOOL2D == 'line') {
            menuSelect(4, 'menuLeft2DItem', '#ff3700');
        } else if (TOOL2D == 'square') {
            menuSelect(5, 'menuLeft2DItem', '#ff3700');
        } else if (TOOL2D == 'circle') {
            menuSelect(6, 'menuLeft2DItem', '#ff3700');
        }
    }

    toggleRight('menuRight', true);
    toggleLeft('menuLeft2D', true);

    $('#menuFloorSelectorText').html(scene3DFloorFurnitureContainer[FLOOR].name);
    $('#menuFloorSelector').show();

    var menuBottom = [1,5,8,9,10];
    menuBottom.forEach(function(item) {
         $('#menuBottomItem' + item).show();
    });
    $('#menuBottom').show();

    //Create Grid
    //============================
    var ground = new fabric.Circle({
        radius: 450,
        fill: '#CCCCCC',
        stroke: null,
        strokeWidth: 2,
        left: (window.innerWidth / 2),
        top: (window.innerHeight / 2) + 80,
        selectable: true,
        hasBorders: false,
        hasControls: false,
        opacity: 0.2,
        name: 'ground'
    });
    scene2D.add(ground);
    scene2DMakeGrid(scene2D, 40,'#6dcff6');
    scene2DMakeGrid(scene2D, 20,'#E0E0E0');
    //============================

    scene2DFloorShapeGenerate();

    for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++) {
        scene2D.add(scene2DWallMesh[FLOOR][i]);
    }

    for (var i = 0; i < scene2DInteriorMesh[FLOOR].length; i++) {
        scene2D.add(scene2DInteriorMesh[FLOOR][i]);
    }

    for (var i = 0; i < scene2DExteriorMesh[FLOOR].length; i++) {
        scene2D.add(scene2DExteriorMesh[FLOOR][i]);
    }

    //TODO: doubleclick resets Quardatic Curve
    //http://stackoverflow.com/questions/21511383/fabricjs-detect-mouse-over-object-path -> http://fabricjs.com/per-pixel-drag-drop/
    
    //scene2D.on('object:selected', function(e) {
    //});

    scene2D.on('mouse:down', function(event) {

        var target = event.target;

        //clearTimeout(clickTime);
        //$('#menu2DTools').tooltipster('hide');
        if(target)
        {
            if (target.name == 'ground') 
            {
                target.set({stroke:'black'});
                $('#menu2DTools').tooltipster('hide');
                scene2D.renderAll();
                return;
            }else{
                for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++)
                    scene2DWallMesh[FLOOR][i].item(1).set({opacity:0}); //unhighlight attached wall
            }
        }
        on2DMouseDown(event.e);
    });

    /*
    scene2D.on('mouse:move', function(event) {
        on2DMouseMove(event.e);
    });
    */

    scene2D.on('mouse:up', function(event) {

        var target = event.target;

        if(target.name == 'window')
        {
            window.location = "#open2DDoorWindowAdjust";
            //============================
            scene2DAdvanced = new fabric.Canvas('fabricjs2', {
                isDrawingMode: false,
                isTouchSupported: true,
                width: window.innerWidth*0.8-40, //80%
                height: window.innerHeight*0.75-20 //75%
            });
            scene2DMakeGrid(scene2DAdvanced, 20,'#6dcff6');
            //scene2DMakeGrid(scene2DAdvanced, 20,'#E0E0E0');
            //============================

             //...Sample front facing wall
            //============================
            scene2DDrawLine = new fabric.Line([200, 80, 850, 80], {
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 10,
                strokeLineCap: 'round',
                hasControls: false,
                selectable: false
            });
            scene2DAdvanced.add(scene2DDrawLine);
            scene2DDrawLine = new fabric.Line([200, 80, 200, 500], {
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 10,
                strokeLineCap: 'round',
                hasControls: false,
                selectable: false
            });
            scene2DAdvanced.add(scene2DDrawLine);
            scene2DDrawLine = new fabric.Line([850, 80, 850, 500], {
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 10,
                strokeLineCap: 'round',
                hasControls: false,
                selectable: false
            });
            scene2DAdvanced.add(scene2DDrawLine);
            scene2DDrawLine = new fabric.Line([200, 500, 850, 500], {
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 10,
                strokeLineCap: 'round',
                hasControls: false,
                selectable: false
            });
            scene2DAdvanced.add(scene2DDrawLine);

            scene2DDrawLine = new fabric.Rect({
              left: 500,
              top: 250,
              fill: '#ffffff',
              stroke: 'black',
              width: 300,
              height: 250,
            });
            scene2DAdvanced.add(scene2DDrawLine);
            //============================
        }
        else if(target.name == 'edge' || target.name == 'pivot')
        {
            //target.moving = false; //reset movement
            target.setCoords(); //important

            /*
            A quick fix for offset pivots
            https://github.com/kangax/fabric.js/wiki/Fabric-gotchas
            */
            for (var i = 0; i < target.line.length; i++)
            {
                //Calculate new coordinates for highlighted wall
                var x1 = target.line[i].item(0).path[0][1];
                var y1 = target.line[i].item(0).path[0][2];
                var cx = target.line[i].item(0).path[1][1];
                var cy = target.line[i].item(0).path[1][2];
                var x2 = target.line[i].item(0).path[1][3];
                var y2 = target.line[i].item(0).path[1][4];

                target.line[i].item(1).path[0][1] = x1;
                target.line[i].item(1).path[0][2] = y1;
                target.line[i].item(1).path[1][1] = cx;
                target.line[i].item(1).path[1][2] = cy;
                target.line[i].item(1).path[1][3] = x2;
                target.line[i].item(1).path[1][4] = y2;
                target.line[i].setCoords();

                var point = scene2DGetCenterPivot({x:x1,y:y1},{x:x2,y:y2});
                //target.line[i].selector.x2 = x2 - x1;
                //target.line[i].selector.y2 = y2 - y1;
                target.line[i].selector.set({ 'x2': x2 - x1, 'y2': y2 - y1 });
                target.line[i].selector.left = point.x;
                target.line[i].selector.top = point.y;
                target.line[i].selector.setCoords();

                //if(target.line[i].pivot)
                    target.line[i].pivot.setCoords();

                target.line[i].reversed = false;
            }

            //TODO: find more efficient way of updating
            for (var i = 0; i < scene2DDoorMesh[FLOOR].length; i++)
                scene2DDoorMesh[FLOOR][i].setCoords();
            for (var i = 0; i < scene2DWindowMesh[FLOOR].length; i++)
                scene2DWindowMesh[FLOOR][i].setCoords();
            
            scene2DFloorShapeGenerate();

            scene2D.renderAll();
        //}
        //else
        //{
            //on2DMouseUp(event.e);
            //scene2D.renderAll();
        }
        else if (target.name == 'ground') 
        {
            target.set({stroke:null});
            scene2D.renderAll();
        }
    });

    //'object:modified'
    scene2D.on('mouse:over', function(event) {

        var target = event.target;

        if(target.name == 'edge')
        {
            target.item(1).set({stroke:'#ff6600'});
            //var angle = scene2DMakeWallEdgeAngle({x:target.line[0].item(0).path[0][1],y:target.line[0].item(0).path[0][2]},{x:target.line[1].item(0).path[0][1],y:target.line[1].item(0).path[0][2]},{x:target.line[1].item(0).path[1][3],y:target.line[1].item(0).path[1][4]});
                   
            for (var i = 0; i < target.line.length; i++) //multi-angle
            {
                var angle = 0 ;//scene2DMakeWallEdgeAngle({x:target.line[0].item(0).path[0][1],y:target.line[0].item(0).path[0][2]},{x:target.line[1].item(0).path[0][1],y:target.line[1].item(0).path[0][2]},{x:target.line[1].item(0).path[1][3],y:target.line[1].item(0).path[1][4]});
           
                target.line[i].item(1).set({opacity:1}); //highlight attached wall

                if(target.bend[i] && target.line[0] && target.line[1]){
                    
                    //TODO: adjust opposite angles
                    //TODO: improve performance by adjusting "changed angle" only
                    angle.set({opacity:0});
                    scene2D.remove(target.bend[i]);
                    target.bend[i] = angle;
                    scene2D.add(angle); //.sendBackwards(angle); //.sendBackwards(angle);
                    angle.animate('opacity', 1.0, {
                        duration: 500,
                        onChange: scene2D.renderAll.bind(scene2D),
                        //onComplete: function() {scene2D.bringToFront(target.pivot[1])},
                        easing: fabric.util.ease.easeInCubic
                    });
                }
            }
            //scene2D.bringToFront(target);

            scene2D.renderAll();
        }
        else if (target.name == 'wall') 
        {
            //target.set({opacity:1});
            //console.log(target);
            target.item(1).set({opacity:1}); //highlight attached wall
            target.item(2).set({opacity:1}); //highlight split circle
            //target.set({opacity:1}); //highlight attached wall
            //target.set({opacity:1}); //highlight split circle

            //scene2D.hoverCursor = 'pointer';
            scene2D.renderAll();
        }
        else if (target.name == 'wallselect') 
        {
            //setTimeout(function() {
                target.line.item(2).set({opacity:1}); //highlight split circle
            //}, 100); //a slight delay fixes greenline highlight
            //target.line.item(1).set({opacity:1}); //highlight attached wall
            /*
            target.line.item(2).animate('opacity', 1.0, {
                duration: 250,
                onChange: scene2D.renderAll.bind(scene2D),
                easing: fabric.util.ease.easeInCubic
            });
            */
            //scene2D.hoverCursor = 'pointer';
            scene2D.renderAll();
        }
        else if (target.name == 'pivot') 
        {
            target.item(1).set({stroke:'#ff6600'});
            scene2D.renderAll();
        /*
        }
        else if (target.name == 'adjustcircle') 
        {
            target.set({stroke:'#ff6600'});
            scene2D.renderAll();
        */
        }
        else if (target.name == 'door') 
        {
            target.item(1).set({stroke:'#ff6600'});
            target.item(6).set({opacity:1});
            //target.item(2).set({opacity:0});
            //target.adjustcircle.set({opacity:1, left:target.left, top:target.top+target.item(2).y2/2});
            //target.adjustcircle.setCoords();
 
            scene2D.renderAll();
        }
        else if (target.name == 'window') 
        {
            target.item(1).set({stroke:'#ff6600'});
            scene2D.renderAll();
        }
    });

    //http://fabricjs.com/opacity_mouse_move/
    //TODO: optimize this
    scene2D.on('mouse:move', function(event) {
        var target = event.target;
        mouse = scene2D.getPointer(event.e);

        if(target){
            if (target.name == 'wallselect') //Follow quadratic curve x,y
            {
                var pointer = scene2D.getPointer(event.e);
                var v1 = {x:target.line.item(0).path[0][1],y:target.line.item(0).path[0][2]};
                var v2 = {x:target.line.item(0).path[1][3],y:target.line.item(0).path[1][4]};

                //if(!scene2D.isTargetTransparent(e.target.line, pointer.x, pointer.y)){
                    var percent = (pointer.x  - v1.x) / (v2.x - v1.x); //0.20; //flip based on window height
                    //var percent = (pointer.x  - e.target.line.item(0).path[0][1]) / (e.target.line.item(0).path[1][3] - e.target.line.item(0).path[0][1]); //0.20; //flip based on window height
                    //console.log(e.target.line.item(0).path[0][1] + ":" + e.target.line.item(0).path[0][2] + " pivot (" + e.target.pivot.left + ":" + e.target.pivot.top +  ") " + pointer.x + ":" + pointer.y);
                    //var follow = scene2DgetLineXYatPercent(v1,v2,percent);
                    //console.log(x+ ":" + y + " " + percent);
                    target.line.item(1).set({opacity:1}); //highlight attached wall
                    target.line.item(2).set(scene2DgetQuadraticBezierXYatPercent(v1,target.pivot,v2,percent));
                    scene2D.renderAll();
                //}
            }
        }
    });
    
    scene2D.on('mouse:out', function(event) {
        var target = event.target;

        if(target.name == 'edge')
        {
            target.item(1).set({stroke:'#666'});

            for (var i = 0; i < target.line.length; i++) //multi-angle
            {
                target.line[i].item(1).set({opacity:0}); //unhighlight attached wall

                if(target.bend[i]){
                    target.bend[i].animate('opacity', 0.0, {
                        duration: 600,
                        onChange: scene2D.renderAll.bind(scene2D),
                        //onComplete: function() {},
                        easing: fabric.util.ease.easeInCubic
                    });
                }
            }
            scene2D.renderAll();
            //scene2D.bringForward(e.target);
        }
        else if (target.name == 'wallselect')
        {
            target.line.item(1).set({opacity:0}); //unhighlight attached wall
            target.line.item(2).set({opacity:0}); //unhighlight split circle
            //scene2D.cursor = 'crosshair';
            scene2D.renderAll();
        }
        else if (target.name == 'pivot') 
        {
            target.item(1).set({stroke:'#0066FF'});
            scene2D.renderAll();
        /*
        }
        else if (target.name == 'adjustcircle') 
        {
            target.set({stroke:'#6B8E23'});
            scene2D.renderAll();
        */
        }
        else if (target.name == 'door') 
        {
            target.item(1).set({stroke:'#00000'});
            target.item(6).set({opacity:0});
            //e.target.item(2).set({opacity:1});
            //target.adjustcircle.set({opacity:0});
            scene2D.renderAll();
        }
        else if (target.name == 'window') 
        {
            target.item(1).set({stroke:'#00000'});
            scene2D.renderAll();
        }
    });

    //var circle = new Array();

    scene2DJoinLines();

    //scene2D.add(adjustcircle);
    /*
    for (var i = 0; i < scene2DDoorMesh[FLOOR].length; i++) {
        scene2D.add(scene2DDoorMesh[FLOOR][i]);
    }
    */
    /*
    for (var i = 0; i < scene2DWindowMesh[FLOOR].length; i++) {
        scene2D.add(scene2DWindowMesh[FLOOR][i]);
    }
    */
    //scene2DArrayToLineWalls();

    //scene2DCalculateWallLength();

    //scene2D.renderAll();

    //================
    /*
    https://github.com/rheh/HTML5-canvas-projects/tree/master/progress
    */
    var zoom2DCanvas = document.getElementById('zoom2DProgress');
    zoom2Dimg = new Image(); // Create the image resource
    if (zoom2DCanvas.getContext) // Canvas supported?
    {
        zoom2DCTX = zoom2DCanvas.getContext('2d');
        zoom2DSlider = document.getElementById('zoom2DSlider');
        zoom2Dimg.onload = drawImage; // Setup the onload event
        zoom2Dimg.src = 'images/progress-tiles.jpg'; // Load the image
    } else {
        alert("Canvas not supported!");
    }
    $('#zoom2DLevel').show();
    //================

    //scene2DdrawRuler();

    menuSelect(6, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //Auto close right menu
    document.getElementById('menuRight').setAttribute("class", "hide-right");
    delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

    $('#engine2D').show();
}

function scene2DJoinLines()
{
        //Two Dimentional Search
    for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++) { //each floor wall
        
        //var intersects = new Array();
        
        var edgepoint = [[],[]];
        //edgepoint.push(new Array());
        //edgepoint.push(new Array());

        var x1 = scene2DWallMesh[FLOOR][i].item(0).path[0][1];
        var x2 = scene2DWallMesh[FLOOR][i].item(0).path[1][3];
        var cx = scene2DWallMesh[FLOOR][i].item(0).path[0][1];
        var cy = scene2DWallMesh[FLOOR][i].item(0).path[0][2];
        var y1 = scene2DWallMesh[FLOOR][i].item(0).path[0][2];
        var y2 = scene2DWallMesh[FLOOR][i].item(0).path[1][4];
        var v3 = {x: cx, y: cy};
        var v2 = {x: x2, y: y2};
        var v1 = {x: x1, y: y1};

        for (var x = 0; x < scene2DWallMesh[FLOOR].length; x++) { //each other floor wall
            //https://github.com/kangax/fabric.js/issues/601
            //if(scene2DWallMesh[FLOOR][i].id != scene2DWallMesh[FLOOR][x].id)
            //{
                var target = scene2DWallMesh[FLOOR][x].item(0);

                //TODO: find more efficient way of detecting collisions

                if(!scene2D.isTargetTransparent(target, x1-4, y1-4) || !scene2D.isTargetTransparent(target, x1-4, y1+4) || !scene2D.isTargetTransparent(target, x1+4, y1-4) || !scene2D.isTargetTransparent(target, x1+4, y1+4)){
                //if (scene2DWallMesh[FLOOR][i].item(0).intersectsWithObject(scene2DWallMesh[FLOOR][x].item(0).path)) {
                    //console.log(scene2DWallMesh[FLOOR][x].id + " intersects " + scene2DWallMesh[FLOOR][i].id  + " " + x1 + ":" + y1);
                    edgepoint[0].push(scene2DWallMesh[FLOOR][x]);
                }
                
                if(!scene2D.isTargetTransparent(target, x2-4, y2-4) || !scene2D.isTargetTransparent(target, x2-4, y2+4) || !scene2D.isTargetTransparent(target, x2+4, y2-4) || !scene2D.isTargetTransparent(target, x2+4, y2+4)){
                    edgepoint[1].push(scene2DWallMesh[FLOOR][x]);
                }
            //}
        }

        var edge = [];
        var edgeComplete = false;
        var angle;
        var pivot = scene2DMakeWallCurvedPivot(v1,v2,scene2DWallMesh[FLOOR][i],false);
        var selector = scene2DMakeWallSelect(v1,v2,scene2DWallMesh[FLOOR][i],pivot);
        var n = scene2DCalculateWallLength(v1,v2,v3,scene2DWallMesh[FLOOR][i]);
        pivot.wallid = i+1;

        for (var x = 0; x < scene2DWallMesh[FLOOR].length; x++) {
           
            var eA = scene2DWallMesh[FLOOR][x].edgeA;
            var eB = scene2DWallMesh[FLOOR][x].edgeB;
            if(eA && eB)
            {
                if((eA.left == x1 && eA.top == y1) || (eA.left == x2 && eA.top == y2) || (eB.left == x1 && eB.top == y1) || (eB.left == x2 && eB.top == y2)) // && scene2DWallMesh[FLOOR][x].edge[0])
                {
                    console.log(scene2DWallMesh[FLOOR][x].id + " [0] already complete");
                    edgeComplete = true;
                    break;
                }
            }
        }

        if(!edgeComplete) //Avoid duplicates
        {
            edge[0] = scene2DMakeWallEdgeCircle(x1, y1, false);
            edge[0].line = [];
            edge[0].bend = [];
            edge[0].wallid = i;
            scene2DWallMesh[FLOOR][i].edgeA = edge[0]; //cross refference
            for (var e = 0; e < edgepoint[0].length; e++) {
                //console.log("[0][" + i + "] " + scene2DWallMesh[FLOOR][i].id + " intersects " + edgepoint[0][e].id);
                edge[0].line.push(edgepoint[0][e]);
            }
            scene2D.add(edge[0]);

            edge[1] = scene2DMakeWallEdgeCircle(x2, y2, false);
            edge[1].line = [];
            edge[1].bend = [];
            edge[1].wallid = i+1;
            scene2DWallMesh[FLOOR][i].edgeB = edge[1]; //cross refference
            for (var e = 0; e < edgepoint[1].length; e++) {
                //console.log("[1][" + i + "] " + scene2DWallMesh[FLOOR][i].id + " intersects " + edgepoint[1][e].id);
                edge[1].line.push(edgepoint[1][e]);
            }
            scene2D.add(edge[1]);
        }
       
        scene2DWallMesh[FLOOR][i].selector = selector; //cross refference
        scene2DWallMesh[FLOOR][i].pivot = pivot; //cross refference
        
        scene2D.add(selector); //.sendBackwards(selector);
        scene2D.add(pivot);

        //=========================
        result = scene2DDoorMesh[FLOOR].filter(function(e) { return e.id === scene2DWallMesh[FLOOR][i].id; });
        if(result.length >= 1)
        {
            //console.log(result);
            scene2DWallMesh[FLOOR][i].doors = [];
            //if (i == 1)
            pivot.set({opacity:0,selectable:false});
            
            for (var d = 0; d < result.length; d++){
                scene2DWallMesh[FLOOR][i].doors.push(result[d]);
                result[d].line = scene2DWallMesh[FLOOR][i]; //cross-refference
                scene2D.add(result[d]);
                //result[d].adjustcircle = adjustcircle;
            }
        }
        //=========================
        result = scene2DWindowMesh[FLOOR].filter(function(e) { return e.id === scene2DWallMesh[FLOOR][i].id; });
        if(result.length >= 1)
        {
            //console.log(result);
            scene2DWallMesh[FLOOR][i].windows = [];
            //if (i == 1)
            pivot.set({opacity:0,selectable:false});
            
            for (var w = 0; w < result.length; w++){
                scene2DWallMesh[FLOOR][i].windows.push(result[w]);
                result[w].line = scene2DWallMesh[FLOOR][i]; //cross-refference
                scene2D.add(result[w]);
                //result[w].adjustcircle = adjustcircle;
            }
        }
        //=========================
        scene2DGroupArrayDynamicPosition(v1,v2,n,[scene2DWallMesh[FLOOR][i].doors,scene2DWallMesh[FLOOR][i].windows]);
        
        if(n < 50)
            pivot.set({opacity:0,selectable:false});
    }
}
 /*
 * Calculates the angle ABC (in radians) 
 *
 * A first point
 * C second point
 * B center point
 */
function find2DAngle(A,B,C) {
    /*
    http://stackoverflow.com/questions/17763392/how-to-calculate-in-javascript-angle-between-3-points
    */
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

function zoom2DdrawBase(ctx) {

    zoom2DCTX.drawImage(zoom2Dimg, 0, 0, zoom2Dwidth, zoom2Dheight, 0, 0, zoom2Dwidth,  zoom2Dheight);
}

function zoom2DdrawProgress(ctx) {

    var x1 = 65, // X position where the progress segment starts
        x2 = 220, // X position where the progress segment ends
        s = zoom2DSlider.value, 
        x3 = 0,
        x4 = 20,
        y1 = 35;
        
    x3 = (x1 + ((x2 - x1) / 100) * s);  // Calculated x position where the overalyed image should end

    zoom2DCTX.drawImage(zoom2Dimg, 0, zoom2Dheight, x3,  zoom2Dheight, 0, 0, x3,  zoom2Dheight);

    var scale = Math.round(s/10);
    zoom2DCTX.fillStyle = "grey";
    zoom2DCTX.font = "12pt Arial";
    zoom2DCTX.fillText(scale, x4, y1);

    scene2DZoom(scale);
}

function drawImage() {
    zoom2DdrawBase(zoom2DCTX); // Draw the base image - no progress
    zoom2DdrawProgress(zoom2DCTX); // Draw the progress segment level
}

function hideElements() {
    //console.log("hideElements");
    if (renderer === undefined)
        return;

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    
    scene3DCube.remove(scene3DCubeMesh);
    
    //console.log(scene2D._objects.length);
 
    /*
    var objects = scene2D.getObjects();
    for (var i in objects)
    {
        var obj = objects[i];

        if (obj.name == "wall" || obj.name == "pivot" || obj.point_type == "edge") {
            scene2D.remove(obj);
        }
    }
    */

    //TODO: make this more efficient
    while(scene2D._objects.length > 0)
    {
        for (var i = 0; i < scene2D._objects.length; i++) {
            scene2D.remove(scene2D.item(i));
        }
    }
    try{
        $('#menu2DTools').tooltipster('hide');
    }catch(e){}
    //console.log(scene2DWallMesh[FLOOR].length);

    //$(renderer.domElement).unbind('mousedown', on3DMouseDown);
    //$(renderer.domElement).unbind('mouseup', on3DMouseUp);
    
    $(renderer.domElement).unbind('mousedown', on3DHouseMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DHouseMouseUp);
    $(renderer.domElement).unbind('dblclick', onDocumentDoubleClick);

    $(renderer.domElement).unbind('mousedown', on3DFloorMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DFloorMouseUp);
    
    $(renderer.domElement).unbind('mousemove', on3DFloorMouseMove);
    $(renderer.domElement).unbind('mousedown', on3DLandscapeMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DLandscapeMouseUp);

    //$(renderer.domElement).unbind('mouseout', on3DLandscapeMouseUp);

    disposePanorama('WebGLPanorama');

    $('#engine2D').hide();
    $('#engine3D').hide();

    $('#menuLeft3DHouse').hide();
    $('#menuLeft3DLandscape').hide();
    $('#menuLeft3DFloor').hide();
    $('#menuLeft2D').hide();

    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRight2D').hide();
    $('#menuRightObjects').hide();
    $('#menuRight').hide();

    $('#menuFloorSelector').hide();
    $("#menuWallInput").hide();

    for (var i = 1; i <= 10; i++) {
        $('#menuBottomItem' + i).hide();
    }
    $('#menuBottom').hide();
    
    $('#zoom2DLevel').hide();


    //scene3D.visible = !b;
    //scene2D.visible = b;

    //scene2DFloorContainer[0].traverse;
}

function scene2DSurfaceArea(p)
{
    /*
    area = 0;
    for( i = 0; i < N; i += 2 )
       area += x[i+1]*(y[i+2]-y[i]) + y[i+1]*(x[i]-x[i+2]);
    area /= 2;
    */

    //https://www.topcoder.com/community/data-science/data-science-tutorials/geometry-concepts-basic-concepts/#polygon_area
    var area = 0;
    var N = p.length;

    for(i = 1; i+1<N; i++){
        var x1 = p[i][0] - p[0][0];
        var y1 = p[i][1] - p[0][1];
        var x2 = p[i+1][0] - p[0][0];
        var y2 = p[i+1][1] - p[0][1];
        var cross = x1*y2 - x2*y1;
        area += cross;
    }
    return Math.abs(area/2.0);
}

function scene2DMakeGrid(canvas2D, grid,color) {

    /*
    for (var x = 0; x <= scene2D.getWidth(); x += 25) {
        scene2D.add(new fabric.Line([x, 0, x, scene2D.getWidth()], {
            stroke: "#6dcff6",
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
        }));
        scene2D.add(new fabric.Line([0, x, scene2D.getWidth(), x], {
            stroke: "#6dcff6",
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
        }));
    }
    */

    // create grid
    for (var i = 0; i < (canvas2D.getWidth() / grid); i++) {
        canvas2D.add(new fabric.Line([i * grid, 0, i * grid, canvas2D.getWidth()], {
            stroke: color,
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
            name: 'vline'
        }));
        canvas2D.add(new fabric.Line([0, i * grid, canvas2D.getWidth(), i * grid], {
            stroke: color,
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
            name: 'hline'
        }));
    }
}

function scene3DSetWeather()
{
    //particleWeather = new SPE.Group({});
    //scene3D.remove(particleWeather.mesh);

    if (WEATHER == "sunny") {

        //TODO: maybe add sun glare effect shader?

    } else if (WEATHER == "snowy") {

        //engine = new ParticleEngine();
        //engine.setValues(weatherSnowMesh);
        //engine.initialize();

        /*
        weatherSnowMesh = {
            positionStyle: Type.CUBE,
            positionBase: new THREE.Vector3(0, 20, 0),
            positionSpread: new THREE.Vector3(30, 0, 30),

            velocityStyle: Type.CUBE,
            velocityBase: new THREE.Vector3(0, 5, 0),
            velocitySpread: new THREE.Vector3(20, 20, 20),
            accelerationBase: new THREE.Vector3(0, -10, 0),

            angleBase: 0,
            angleSpread: 50,
            angleVelocityBase: 0,
            angleVelocitySpread: 5,

            particleTexture: THREE.ImageUtils.loadTexture('./images/snowflake.png'),

            sizeTween: new ParticleTween([0.5, 1], [1, 0.6]),
            colorBase: new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
            opacityTween: new ParticleTween([2, 3], [0.8, 0]),

            particlesPerSecond: 50,
            particleDeathAge: 3.0,
            emitterDeathAge: 180
        };
        */

        /*
        particleWeather = new SPE.Group({
            texture: THREE.ImageUtils.loadTexture("./images/snowflake.png"),
            maxAge: 180,
            hasPerspective: 1,
            colorize: 1,
            transparent: 1,
            alphaTest: 0.5,
            depthWrite: false,
            depthTest: true,
            blending: THREE.AdditiveBlending
        });

        var particleEmitter = new SPE.Emitter( {
            type: 'cube',
            particleCount: 50, //particlesPerSecond
            position: new THREE.Vector3(0, 20, 0),
            positionSpread: new THREE.Vector3(30, 0, 30),
            acceleration: new THREE.Vector3(0, -10, 0),
            accelerationSpread: new THREE.Vector3( 0, -10, 0 ),
            velocity: new THREE.Vector3( 0, 5, 0 ),
            velocitySpread: new THREE.Vector3(20, 20, 20),
            sizeStart: 0.5,
            sizeStartSpread: 1,
            sizeMiddle: 1,
            sizeMiddleSpread: 0.6,
            sizeEnd: 1,
            sizeEndSpread: 0.6,
            angleStart: 0,
            angleStartSpread: 50,
            angleMiddle: 0,
            angleMiddleSpread: 0,
            angleEnd: 0,
            angleEndSpread: 5,
            angleAlignVelocity: false,
            colorStart: new THREE.Color( 0xffffff ),
            colorStartSpread: new THREE.Vector3(0, 0, 0),
            colorMiddle: new THREE.Color( 0xffffff ),
            colorMiddleSpread: new THREE.Vector3( 0, 0, 0 ),
            colorEnd: new THREE.Color( 0xffffff ),
            colorEndSpread: new THREE.Vector3(0, 0, 0),
            opacityStart: 1,
            opacityStartSpread: 0,
            opacityMiddle: 1,
            opacityMiddleSpread: 0,
            opacityEnd: 1,
            opacityEndSpread: 0,
            duration: null,
            alive: 3.0,
            isStatic: 0
        });
        particleWeather.addEmitter(particleEmitter);
        scene3D.add(particleWeather.mesh);
        */

    } else if (WEATHER == "rainy") {

        //engine = new ParticleEngine();
        //engine.setValues(weatherRainMesh);
        //engine.initialize();
    }

    scene3D.remove(weatherSkyCloudsMesh);
    scene3D.remove(weatherSkyRainbowMesh);

    if (DAY == 'day') {

        //scene3D.add(weatherSkyDayMesh);
        if(options.clouds)
        {
            texture = new THREE.ImageUtils.loadTexture('images/cloud.png');
            texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            weatherSkyMaterial.uniforms.map.value = texture;
            weatherSkyCloudsMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
            scene3D.add(weatherSkyCloudsMesh);
        }

        if(options.rainbow)
        {
            texture = new THREE.ImageUtils.loadTexture('images/rainbow.png');
            texture.minFilter = THREE.LinearFilter;
            var materialRainbow = weatherSkyMaterial.clone();
            materialRainbow.uniforms.map.value = texture;

            geometry = new THREE.Geometry();
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(18, 18));
            plane.position.x = getRandomInt(1, 15);
            plane.position.y = getRandomInt(5, 8);
            plane.position.z = -2;
            plane.updateMatrix();
            geometry.merge(plane.geometry, plane.matrix);
            weatherSkyRainbowMesh = new THREE.Mesh(geometry, materialRainbow);

            scene3D.add(weatherSkyRainbowMesh);
        }
    }
    else if (DAY == 'night')
    {
        if(options.clouds)
        {
            texture = new THREE.ImageUtils.loadTexture('images/cloud2.png');
            texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            weatherSkyMaterial.uniforms.map.value = texture;
            weatherSkyCloudsMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
            scene3D.add(weatherSkyCloudsMesh);
        }
    }
}

function menuSelect(item, id, color) {
    if (item === null) //clear all
    {
        for (var i = 0; i <= 6; i++) {
            $("#" + id + i).css('color', 'black');
        }
    } else {
        menuSelect(null, id, color);
        $("#" + id + item).css('color', color); //#53C100
    }
}

function selectFloor(next) {

    var i = FLOOR + next;

    if (scene3DFloorFurnitureContainer[i] instanceof THREE.Object3D) {

        FLOOR = i;

        //TODO: would be awsome to have some kind of flip transition effect

        if (SCENE == 'floor') {
            show3DFloor();

        } else if (SCENE == '2d') {
            show2D();
        }
    }else{
    	
		alertify.confirm("Add New Floor?", function (e) {
		    if (e) {
                scene3DNewFloor();
		    //} else { // user clicked "cancel"
		    }
		});
    }
}

function scene3DNewFloor(name)
{
    var i = scene3DFloorFurnitureContainer.length;

    if(name === null)
    {
        name = "Floor " + i;
    }

    scene3DFloorFurnitureContainer[i] = new THREE.Object3D();
    scene3DFloorFurnitureContainer[i].name = name;
    scene3DFloorMeasurementsContainer[i] = new THREE.Object3D();
    scene3DFloorWallContainer[i] = new THREE.Object3D();
    scene3DFloorShapeContainer[i] = new THREE.Object3D();
    //scene3DFloorOtherContainer[i] = new THREE.Object3D();
    scene2DWallMesh[i] = [];
    scene2DWallDimentions[i] = [];
}

function selectMeasurement() {

    if (REALSIZERATIO == 1.8311874) {
        //$('#menuMeasureText').html("Imperial");
        REALSIZERATIO = 1; //Imperial Ratio TODO: Get the right ratio
    } else {
        //$('#menuMeasureText').html("Metric");
        REALSIZERATIO = 1.8311874; //Metric Ratio
    }
}

function selectDayNight() {

    if (DAY == "day") {

        DAY = "night";
        //$('#menuDayNightText').html("Night");
        $('#menuBottomItem6').attr("class", "hi-icon icon-night tooltip");

    } else if (DAY == "night") {

        DAY = "day";
        //$('#menuDayNightText').html("Day");
        $('#menuBottomItem6').attr("class", "hi-icon icon-day tooltip");
    }
    scene3D.remove(skyMesh);

    scene3DSetSky(DAY);
    scene3DSetLight();
    scene3DSetWeather();

    scene3D.add(skyMesh);
    //scene3D.add(weatherSkyCloudsMesh);
    //scene3D.add(weatherSkyRainbowMesh);
}

function selectWeather() {

    if (WEATHER == "sunny") {

        WEATHER = "snowy";
        //$('#menuWeatherText').html("Snowy");

    } else if (WEATHER == "snowy") {

        WEATHER = "rainy";
        //$('#menuWeatherText').html("Rainy");

    } else if (WEATHER == "rainy") {

        WEATHER = "sunny";
        //$('#menuWeatherText').html("Sunny");
    }
    scene3DSetWeather();
}

function onWindowResize() {
    //if (scene3D.visible) {
        camera3D.aspect = window.innerWidth / window.innerHeight;
        camera3D.updateProjectionMatrix();
        //} else if (scene2D.visible) {
        //camera2D.aspect = window.innerWidth / window.innerHeight;
        //camera2D.updateProjectionMatrix();
    //}

    //effectFXAA.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
    //composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);

    correctMenuHeight();
}

function correctMenuHeight() {

    var h = window.innerHeight - 250;
    var a;
    var b;

    if (SCENE == 'house') {
        a = $("#menuRight3DHouse .cssmenu").height();
        //b = $("#menuRight3DHouse .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (SCENE == 'floor') {
        a = $("#menuRight3DFloor .cssmenu").height();
        //b = $("#menuRight3DFloor .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (SCENE == 'roof') {
        a = $("#menuRight3DRoof .cssmenu").height();
        //b = $("#menuRight3DRoof .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (SCENE == '2d') {
        a = $("#menuRight2D .cssmenu").height();
        //b = $("#menuRight2D .scroll");
        b = $("#menuRight2D .cssmenu");
    } else {
        return;
    }

    $("#menuRightObjects .scroll").css('height', h);
    //$("#menuRightObjects .flip").css('height', h);

    if (b.height() < h) {
        //console.log("H:" + a);
        b.css('height', '100%');
    } else {
        b.css('height', h);
    }
}

function onCubeMouseMove(event) {

    event.preventDefault();

    //scene3DCubeMesh.face.color = new THREE.Color(0xddaa00);
    //scene3DCubeMesh.geometry.colorsNeedUpdate = true;
    /*
    x = (event.clientX / $(rendererCube.domElement).width) * 2 - 1;
    y = -(event.clientY / $(rendererCube.domElement).height) * 2 + 1;

    vector = new THREE.Vector3(x, y, 0.5);
    projector.unprojectVector(vector, camera3DCube);

    var ray = new THREE.Raycaster(camera3DCube.position, vector.sub(camera3DCube.position).normalize());
    var intersects = ray.intersectObjects(scene3DCube.children);

    if (intersects.length > 0) {

        intersects[0].face.color = new THREE.Color(0xddaa00);
        intersects[0].object.geometry.colorsNeedUpdate = true;

        face = intersects[0].face;
        var faceIndices = ['a', 'b', 'c', 'd'];
        var numberOfSides = (face instanceof THREE.Face3) ? 3 : 4;

        // assign color to each vertex of current face
        for (var j = 0; j < numberOfSides; j++) {

            var vertexIndex = face[faceIndices[j]];
            
            geometry.faces.filter(someFilter).forEach(function(face) {
			  face.color = someOtherColor;
			}
			
            // initialize color variable
            var color = new THREE.Color(0xffffff);
            color.setRGB(Math.random(), 0, 0);
            face.vertexColors[j] = color;
        } 
    }
    */
}

function onDocumentDoubleClick(event) {

    event.preventDefault();

    if (scene3D.visible && controls3D instanceof THREE.OrbitControls && SelectedObject === null) {

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;

        //TODO: zoom out far, reset pivot-point to 0,0,0

        //if (new Date().getTime() - 150 < clickTime) { //Set pivot-point to clicked coordinates

        vector = new THREE.Vector3(x, y, 0.1);
        //projector.unprojectVector(vector, camera3D);
        vector.unproject(camera3D);
        var raycaster = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());
        var intersects = raycaster.intersectObjects(scene3DHouseGroundContainer.children);

        if (intersects.length > 0) {
            console.log('doubleclick');

            clearTimeout(doubleClickTime);

            scene3DPivotPoint.position.set(intersects[0].point.x, 0, intersects[0].point.z);
            
            //http://stemkoski.github.io/Three.js/Particle-Engine-Fireworks.html

            //particlePivot.removeEmitter(particlePivotEmitter);

        /*
            engine = new ParticleEngine();
            fountain = {
                positionStyle: Type.CUBE,
                positionBase: new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z),
                positionSpread: new THREE.Vector3(0, 0, 0),

                velocityStyle: Type.CUBE,
                velocityBase: new THREE.Vector3(0, 3, 0),
                velocitySpread: new THREE.Vector3(3, 0, 3),

                accelerationBase: new THREE.Vector3(0, -2, 0),

                particleTexture: THREE.ImageUtils.loadTexture('./images/star.png'),

                angleBase: 0,
                angleSpread: 180,
                angleVelocityBase: 0,
                angleVelocitySpread: 360 * 4,

                sizeTween: new ParticleTween([0, 0.02], [1, 0.4]),
                opacityTween: new ParticleTween([2, 3], [1, 0]),
                colorTween: new ParticleTween([0.5, 2], [new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(0.8, 1, 0.5)]),

                particlesPerSecond: 30,
                particleDeathAge: 4.0,
                emitterDeathAge: 1.0
            };
            engine.setValues(fountain);
            engine.initialize();
            */

            //particlePivotEmitter.disable();
            //particlePivotEmitter.reset();
            //particlePivot.removeEmitter(particlePivotEmitter);

            //particlePivotEmitter.position = new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z);
            
            /*
            particlePivot = new SPE.Group({
                texture: THREE.ImageUtils.loadTexture("images/star.png"),
                maxAge: 4.0,
                hasPerspective: 1,
                colorize: 1,
                transparent: 1,
                alphaTest: 0.5,
                depthWrite: false,
                depthTest: true,
                blending: THREE.AdditiveBlending
            });
            particlePivotEmitter.disable();
            particlePivotEmitter.position = new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z),
            particlePivot.addEmitter(particlePivotEmitter);
            scene3D.add(scene3DPivotPoint);
            scene3D.add(particlePivot.mesh);
            particlePivotEmitter.enable();
            */

            var tween = new TWEEN.Tween(controls3D.target).to({x:intersects[0].point.x, y:0, z:intersects[0].point.z},800).easing(TWEEN.Easing.Quadratic.InOut).start();

            //controls3D.target = new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z); //having THREE.TrackballControls or THREE.OrbitControls seems to override the camera.lookAt function

            doubleClickTime = setTimeout(function() {
                scene3D.remove(scene3DPivotPoint);
                //particlePivotEmitter.disable();
                //scene3D.remove(particlePivot.mesh);
                //particlePivot = new SPE.Group({});

            }, 4000);
        }
    }
}

function on2DMouseDown(event) {

    event.preventDefault();
    /*
    if (event.touches && event.touches.length > 0) leftButtonDown = true;
    switch (event.button) {
        case 0:
            leftButtonDown = true;
        case 1:
            //BUTTON_MIDDLE;
        case 2:
            //BUTTON_RIGHT
    }
    */
    //if (event.which == 1) leftButtonDown = true; // Left mouse button was pressed, set flag

    if (TOOL2D == 'line')
    {
        if(scene2DDrawLine instanceof fabric.Line) {
            //console.log(scene2DWallMesh[FLOOR].length-1);
            //scene2DWallMesh[FLOOR][scene2DWallMesh[FLOOR].length-1] = scene2DMakeWall({x:scene2DDrawLine.get('x1'),y:scene2DDrawLine.get('y1')},{x:scene2DDrawLine.get('x2'),y:scene2DDrawLine.get('y2')},{x:0,y:0});
            scene2DWallMesh[FLOOR].push(scene2DMakeWall({x:scene2DDrawLine.get('x1'),y:scene2DDrawLine.get('y1')},{x:scene2DDrawLine.get('x2'),y:scene2DDrawLine.get('y2')},{x:0,y:0}));
            scene2D.add(scene2DWallMesh[FLOOR][scene2DWallMesh[FLOOR].length-1]);

            scene2D.remove(scene2DDrawLine);
            //scene2D.renderAll();
            scene2DDrawLine = null;

        }else{

            //TODO: Check for intersect objects

            var pointer = scene2D.getPointer(event);

            scene2DDrawLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 10,
                strokeLineCap: 'round',
                hasControls: false,
                selectable: false
            });
            scene2D.add(scene2DDrawLine);
        }
    }

    $('#menu2DTools').tooltipster('hide');

    //$("#HTMLCanvas").bind('mousemove', on2DMouseMove);
    // fabric.util.addListener(fabric.document, 'dblclick', dblClickHandler);
    //fabric.util.removeListener(canvas.upperCanvasEl, 'dblclick', dblClickHandler); 

    //$("#menuWallInput").hide(); //TODO: analyze and store input

    //http://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
    //===================================
    /*
        vector = new THREE.Vector3(x, y, 0.5);
        projector = new THREE.Projector();
        projector.unprojectVector(vector, camera2D);
        var dir = vector.sub(camera2D.position).normalize();
        var distance = -camera2D.position.z / dir.z;
        var pos = camera2D.position.clone().add(dir.multiplyScalar(distance));
    */

    /*
    var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 0.5), 0);
    vector = new THREE.Vector3(x, y, 0.5);
    var raycaster = projector.pickingRay(vector, camera2D);
    var pos = raycaster.ray.intersectPlane(planeZ);
    //console.log("x: " + pos.x + ", y: " + pos.y);
    //===================================

    //TODO: Make eye-candy sketcher effects from mrdoob.com/projects/harmony/

    //scene2DDrawLineGeometry.length = 0; //reset

    //if (TOOL2D == 'freestyle') {

    //scene2DDrawLineGeometry.push(event.clientX, event.clientY);
    /*
        scene2DDrawLineGeometry.push({
            x: event.clientX,
            y: event.clientY
        });
	*/

    /*
        scene2DDrawLine = new Kinetic.Line({
            points: scene2DDrawLineGeometry,
            stroke: "black",
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round'
        });
    */
    /*
        scene2DDrawLine = new fabric.Line(scene2DDrawLineGeometry, {
            stroke: "#000",
            strokeWidth: 5,
            selectable: false,
            //strokeDashArray: [5, 5]
        });
	*/

    //scene2DFloorContainer[FLOOR].add(scene2DDrawLine); //layer add line

    //} else if (TOOL2D == 'vector') {
    //container.style.cursor = 'crosshair';
    //}else if (TOOL2D == 'freestyle') {
    //} else {
    //container.style.cursor = 'pointer';
    //}
}

function on2DMouseUp(event) {

    event.preventDefault();

    //if (event.which == 1) leftButtonDown = false; // Left mouse button was released, clear flag

    //$("#HTMLCanvas").unbind('mousemove', on2DMouseMove);

    if (TOOL2D == 'freestyle') {

        //console.log("objects to analyze: " + scene2D.freeDrawingBrush._points);

        scene2DDrawLineGeometry.length = 0; //reset

        for (var p = 0; p < scene2D.freeDrawingBrush._points.length; p += 2) { //Convert freeDraw points into Geometry points - TODO: Simplify
            scene2DDrawLineGeometry.push({
                x: scene2D.freeDrawingBrush._points[p],
                y: scene2D.freeDrawingBrush._points[p + 1]
            });
        }
        var objects = scene2D.getObjects();
        for (var i in objects) {
            var obj = objects[i];
            //if (obj.name == "freedraw") {
            if (obj.type == "path" && obj.path.length > 5) { //avoid picking arrows which are path also
                scene2D.remove(obj);
                break;
            }
        }
        //scene2D.remove(scene2D.getActiveObject().get('freedraw'));

        //scene2D.freeDrawingBrush._reset();
        //scene2D.freeDrawingBrush._render();
        //scene2D.remove(scene2D.freeDrawingBrush);

        //http://sett.ociweb.com/sett/settJun2014.html
        /*
        var objects = scene2D.getObjects();
        for (var i in objects) { //Find object points

            var obj = objects[i];

            if (obj.type == "path" && obj.path.length > 5) { //avoid picking arrows which are path also

                //console.log(obj.name + "-" + obj.type + ":" + obj.path);

                for (var p = 0; p < obj.path.length; p++) {

                    //console.log(obj.path[p]);

                    //http://jsfiddle.net/Miggl/f2RAG/
                    switch (obj.path[p][0]) { //Convert Path to points[]
                        case 'M':
                        case 'L':
                        case 'l':
                            scene2DDrawLineGeometry.push({
                                x: obj.left + obj.path[p][1],
                                y: obj.top + obj.path[p][2]
                            });
                        case 'Q':
                            scene2DDrawLineGeometry.push({
                                x: obj.left + obj.path[p][3],
                                y: obj.top + obj.path[p][4]
                            });
                            break;
                    }

                    //console.log("(" + obj.path.length + ")" + X + "-" + Y);
                }

                scene2D.remove(obj);
                break;
            }
        }
		*/
        console.log("lines to analyze: " + scene2DDrawLineGeometry.length);

        /*
        var object = {
		   id:   this.id,
		   remaining properties in all.js
		  }
		 */

        //http://stackoverflow.com/questions/19854808/how-to-get-polygon-points-in-fabric-js
        /*
        var polygon = scene2D.getObjects()[0]; //scene2D.getActiveObject(); //.id = 1;
        var polygonCenter = polygon.getCenterPoint();
        if (polygon.type === "line") {
                currentShape.set({
                    x2: pos.x,
                    y2: pos.y
                });
                canvas.renderAll();
        } else if (polygon.type === "polygon") {

            var translatedPoints = polygon.get('points').map(function(p) {
                return {
                    x: polygonCenter.x + p.x,
                    y: polygonCenter.y + p.y
                };
            });
            translatedPoints.forEach(function(p) {
                scene2D.getContext().strokeRect(p.x - 5, p.y - 5, 10, 10);
            });

            var points = polygon.get("points");
            points[points.length - 1].x = pos.x - currentShape.get("left");
            points[points.length - 1].y = pos.y - currentShape.get("top");
            currentShape.set({
                points: points
            });
            canvas.renderAll();
        }
        */

        var scene2DDrawLineArray = [];
        var arrayCount = 0;
        var sensitivityRatio = 5;

        var magicX = [];
        var magicY = [];

        var c = 0;
        //Calculate 2D walls from mouse draw
        for (var i = 0; i < scene2DDrawLineGeometry.length; i++) {

            //console.log("(" + i + ")");

            var Y_U = 0;
            var Y_D = 0;
            var Y_S = 0;

            var X_L = 0;
            var X_R = 0;
            var X_S = 0;

            var n;

            //TODO: calculate geometric angle
            //TODO: Detect circular geometry

            for (var d = 1; d <= sensitivityRatio; d++) { //how many lines-segments to analyze before determining an angle or straight line

                n = i + d;

                if (n < scene2DDrawLineGeometry.length) {

                    if ((scene2DDrawLineGeometry[i].y - 8) > scene2DDrawLineGeometry[n].y) {
                        //console.log("Y line up " + n);
                        Y_U += 1;
                    } else if ((scene2DDrawLineGeometry[i].y + 8) < scene2DDrawLineGeometry[n].y) {
                        //console.log("Y line down " + n);
                        Y_D += 1;
                    } else {
                        //console.log("Y line straight " + n);
                        Y_S += 1;
                    }
                    if ((scene2DDrawLineGeometry[i].x - 8) > scene2DDrawLineGeometry[n].x) {
                        //console.log("X line left " + n);
                        X_L += 1;
                    } else if ((scene2DDrawLineGeometry[i].x + 8) < scene2DDrawLineGeometry[n].x) {
                        //console.log("X line right " + n);
                        X_R += 1;
                    } else {
                        //console.log("X line straight " + n);
                        X_S += 1;
                    }
                    //magicNumberX += scene2DDrawLineGeometry[n].x;
                    //magicNumberY += scene2DDrawLineGeometry[n].y;

                } else {
                    n = i + d - 1;
                    break;
                }
            }

            if (Y_U > Y_D && Y_U > Y_S) {
                //console.log("Y is moving up");
                magicY[c] = "up";

            } else if (Y_D > Y_U && Y_D > Y_S) {
                //console.log("Y is moving down");
                magicY[c] = "down";

            } else {
                //console.log("Y is straight");
                magicY[c] = "straight";
            }

            if (X_L > X_R && X_L > X_S) {
                //console.log("X is moving left")
                magicX[c] = "left";
            } else if (X_R > X_L && X_R > X_S) {
                //console.log("X is moving right")
                magicX[c] = "right";
            } else {
                //console.log("X is straight")
                magicX[c] = "straight";
            }

            var arrayWalls = [];
            var arrayPoints = [];

            if (magicY[c] == "straight") { // && (magicX[c] == "right" || magicX[c] == "left")) {

                //console.log("total converted lines: " + magicY.length);

                if (magicY[c - 1] == "straight") {

                    //console.log(scene2DWallGeometry[FLOOR][scene2DWallGeometry[FLOOR].length - 1]);
                    //add new wall points
                    //scene2DWallGeometry[FLOOR].push([scene2DDrawLineGeometry[n].x, scene2DDrawLineGeometry[i].y, scene2DDrawLineGeometry[n].x, scene2DDrawLineGeometry[i].y]);

                } else {

                    //Modify wall last point (extend)
                    //var l = scene2DWallGeometry[FLOOR].length - 1;
                    //scene2DWallGeometry[FLOOR][l][2] = scene2DDrawLineGeometry[i].x;
                    //scene2DWallGeometry[FLOOR][l][3] = scene2DDrawLineGeometry[i].y;
                }

            } else if ((magicY[c] == "up" || magicY[c] == "down")) {

                if (magicY[c - 1] == "up" || magicY[c - 1] == "down") {

                    //add new wall points
                    //scene2DWallGeometry[FLOOR].push([scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[n].y, scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[n].y]);
                    //} else {

                }
            }

            i += sensitivityRatio;
            c++;
        }

        /*
        var img = new Image();
        img.src = "objects/FloorPlan/Hatch Patterns/ansi31.gif"; //pattern.toDataURL();
        $("#menuWallInput").css('left', scene2DWallGeometry[FLOOR][i][p][0]);
        $("#menuWallInput").css('top', scene2DWallGeometry[FLOOR][i][p][1]);
        $("#menuWallInput").show();
        */
    }else{
        scene2DFloorShapeGenerate();
    }
}

function on2DMouseMove(event) {

    event.preventDefault();

    //if (!leftButtonDown) {
    //    return;
    //}
    /*
    if (TOOL2D == 'line' && scene2DDrawLine instanceof fabric.Line) {
        scene2DDrawLine.set({
            x2: event.clientX,
            y2: event.clientY
        });
        scene2D.renderAll();
    }
    */

    //scene3DHouseContainer.children[0].mesh.materials[0].opacity = 0.2;

    //TweenLite.to(mesh.material, 2, {opacity: 0.2}); //TweenLite.to(object, duration, properties);
    //console.log(scene2D.getPointerPosition())
    //if (TOOL2D == 'freestyle') {
    //var mouse = canvas.getPointer(e);
    //scene2DDrawLineGeometry.push(event.clientX, event.clientY);
    /*
        scene2DDrawLineGeometry.push({
            x: event.clientX,
            y: event.clientY
        });
		*/
    /*
        for (var i = 1; i < scene2DDrawLineGeometry.length; i++) {
            var line = new fabric.Line(
                [scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[i].y, scene2DDrawLineGeometry[i + 1].x, scene2DDrawLineGeometry[i + 1].x], {
                    fill: "#000000",
                    strokeWidth: 10,
                    selectable: false
                }
            );
            scene2D.add(line);
        }
    */
    //scene2D.renderAll();

    //scene2DDrawLineGeometry.push(scene2D.getPointerPosition());

    //scene2DDrawLine.setPoints(scene2DDrawLineGeometry);
    //scene2DFloorContainer[FLOOR].drawScene();
    //}
}

function on3DLandscapeMouseMove(event) {

    event.preventDefault();
    //event.stopPropagation();
    
    //if (TOOL3DLANDSCAPE == "rotate") {
    //    return;
    //}

    //controls3D.enabled = false;
    

    if (TOOL3DLANDSCAPE == "angle") 
    {
       if (!leftButtonDown)
        return;

        if (event.clientX > window.innerWidth / 2) {
            //scene3DHouseGroundContainer.children[0].rotation.z = scene3DHouseGroundContainer.children[0].rotation.z + 0.02;
            terrain3D.rotation.y = terrain3D.rotation.y + 0.015;
        } else {
            //scene3DHouseGroundContainer.children[0].rotation.z = scene3DHouseGroundContainer.children[0].rotation.z - 0.02;
            terrain3D.rotation.y = terrain3D.rotation.y - 0.015;
        }
    }
    else
    {
        //if (terrain3DMouse.state == 1) {
        //    terrain3DMouse.state = 2;
        //}
        updateMouse(event);
        updateMouseCoordinates();

        if (leftButtonDown)
            landscape.onmousemove();
    }
}

function on3DLandscapeMouseDown(event) {

    event.preventDefault();
    //event.stopPropagation();
    if (event.which == 1) leftButtonDown = true;

    controls3D.enabled = false;

    //console.log(TOOL3DLANDSCAPE);

    if (TOOL3DLANDSCAPE == "rotate")
    {
        controls3D.enabled = true;
    }
    else if (TOOL3DLANDSCAPE == "hill" || TOOL3DLANDSCAPE == "valley")
    {
        //terrain3DMouse.state = 1;
        updateMouse(event);
    }
}

function on3DLandscapeMouseUp(event) {

    //event.preventDefault();
    //event.stopPropagation();
    leftButtonDown = false;
    controls3D.enabled = false;

    if (TOOL3DLANDSCAPE == "hill" || TOOL3DLANDSCAPE == "valley")
    {
        //terrain3DMouse.state = 0;
        updateMouse(event);
    }
}

$(document).on('keyup', function(event){

	event.preventDefault();
	//console.log(event)

	if(SCENE == "house")
	{
	    if (event.which == 27) //esc
	    {
	   		camera3DPositionCache = new THREE.Vector3(0, 6, 20);
            camera3DPivotCache = new THREE.Vector3(0, 0, 0);
            camera3DAnimateResetView();
	    }
	}
	else if(SCENE == "2d")
	{
		if (event.which == 37) //left arrow
	    {

	    }
	    else if (event.which == 38) //up arrow
	    {

	   	}
	    else if (event.which == 39) //right arrow
	    {

	    }
	    else if (event.which == 40) //down arrow
	    {

	    }
	}
});

function on3DHouseMouseDown(event) {
	on3DMouseDown(event);

    if (!scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DHouseContainer))
    {
        scene3D.add(scene3DPivotPoint);
    //}
    //else if (scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DHouseGroundContainer))
    //{
        //if (SelectedObject != null)
        //{
            //var max = Math.max(SelectedObject.posision.x + SelectedObject.geometry.boundingBox.max.x, SelectedObject.posision.y + SelectedObject.geometry.boundingBox.max.y, SelectedObject.posision.z + SelectedObject.geometry.boundingBox.max.z);
            //if (SelectedObject != null && (mouse.x > max || mouse.y > max))
            //{
                //controls3D.detach(SelectedObject);
                //enableOrbitControls();
                //camera3DAnimateResetView();
                //return;
            //}
        //}
    }
}

function on3DHouseMouseUp(event) {

	on3DMouseUp(event);
}

function on3DFloorMouseDown(event) {
	on3DMouseDown(event);

    if (!scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DFloorFurnitureContainer[FLOOR]))
    {
        //if (!scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DFloorWallContainer[FLOOR]))
        //{
            scene3D.add(scene3DPivotPoint);
        //}
    }
}

function on3DFloorMouseMove(event) {

	event.preventDefault();

    if (!leftButtonDown) {
        return;
    }

    var tween;
    var v = new THREE.Vector3( 0, 0, 8 ); //TODO: make this dynamic
    v.applyQuaternion(camera3D.quaternion);
    scene3DCutawayPlaneMesh.position.copy(v);
    scene3DCutawayPlaneMesh.lookAt(camera3D.position);

    if(TWEEN.getAll().length === 0) //do not interfere with existing animations (performance)
    {
        var collection = [];
        var originPoint = scene3DCutawayPlaneMesh.position.clone();
      
        for (var vertexIndex = 0; vertexIndex < scene3DCutawayPlaneMesh.geometry.vertices.length; vertexIndex++)
        {
            var localVertex = scene3DCutawayPlaneMesh.geometry.vertices[vertexIndex].clone();
            var globalVertex = localVertex.applyMatrix4(scene3DCutawayPlaneMesh.matrix);
            var directionVector = globalVertex.sub(scene3DCutawayPlaneMesh.position);
            
            var ray = new THREE.Raycaster(originPoint,directionVector.clone().normalize());
            var collisionResults = ray.intersectObjects(scene3DFloorWallContainer[FLOOR].children);

            if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
            {
                //console.log("Intersects " + collisionResults.length);
                //if(collisionResults[0].object.material.opacity > 0.1)
                    tween = new TWEEN.Tween(collisionResults[0].object.material).to({opacity:0.1}, 800).start();

                collection.push(collisionResults[0].object.id);
                //break;
            }
        }

        for (var i = 0; i < scene3DFloorWallContainer[FLOOR].children.length; i++)
        {
            if (collection.indexOf(scene3DFloorWallContainer[FLOOR].children[i].id) == -1)
                tween = new TWEEN.Tween(scene3DFloorWallContainer[FLOOR].children[i].material).to({opacity:0.5}, 500).start();
            //console.log(scene3DFloorWallContainer[FLOOR].children[i].id);
        }
    }
}

function on3DFloorMouseUp(event) {
	on3DMouseUp(event);
}

function on3DMouseMove(event) {

    event.preventDefault();

    if (!leftButtonDown) {
        return;
    }
    
    clearTimeout(clickMenuTime);
    //clickMenuTime = null;

    if (controls3D instanceof THREE.TransformControls || controls3D instanceof THREE.FirstPersonControls) {
        return;
    }

    //if(TWEEN.getAll().length == 0) { //do not interfere with existing animations (performance)

        //console.log("mouse:" + event.clientX + " window:" + window.innerWidth);

        camera3DCube.position.copy(camera3D.position);
        camera3DCube.position.sub(controls3D.center);
        camera3DCube.position.setLength(18);
        camera3DCube.lookAt(scene3DCube.position);

        if (event.clientX > window.innerWidth - 50)
        {
        	//console.log("set SceneAnimate");
        	SceneAnimate = true; 
        	leftButtonDown = false; //TODO: fix this if mouse is outside screen mouseup never triggered
            //animate();
    	}
    //}
    /*
    if (SelectedObject != null) {

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;

        $('#WebGLInteractiveMenu').hide();
        $('#WebGLTextureSelect').hide();

        //if (TOOL3DINTERACTIVE == 'moveXY') {

            vector = new THREE.Vector3(x, y, 0.1);
            //projector.unprojectVector(vector, camera3D);
            vector.unproject(camera3D);
            var raycaster = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());
            var intersects = raycaster.intersectObjects(scene3DHouseGroundContainer.children);
            //var ray = new THREE.Ray(camera3D.position, vector.sub(camera3D.position).normalize());
    		//var intersects = ray.intersectObject(scene3DHouseGroundContainer.children[0]);
            if (intersects.length > 0) {

        	var collisionContainer;

            if (SCENE == 'house')
            {
                collisionContainer = scene3DHouseContainer; //.clone();
            }
            else if (SCENE == 'floor')
            {
                collisionContainer = scene3DFloorFurnitureContainer[FLOOR]; //.clone();
            }
			
            //collisionContainer.remove(SELECTED); //avoid detecting itself

            // ===== SIMPLE COLLISION DETECTION ======
        	//http://stackoverflow.com/questions/11418762/how-to-detect-collisions-between-a-cube-and-sphere-in-three-js
        	var futurePosition = new THREE.Vector3(intersects[0].point.x,SelectedObject.position.y,intersects[0].point.z);
        	var collision = false;
        	for (var i = 0,len = collisionContainer.children.length; i < len; i++) {

        		var distance = futurePosition.distanceToSquared(collisionContainer.children[i].position);

        		if (collisionContainer.children[i].name != SelectedObject.name && distance < 1)
        		{
        			//console.log(collisionContainer.children[i].name);
        			collision = true;
        			break;
        		}
        		//console.log(SelectedObject.position.distanceToSquared(collisionContainer.children[i].position));
    		}
    		collisionContainer = null;
    		// =======================================
    		if (!collision)
    		{
            	//console.log('intersect: ' + intersects[0].point.x.toFixed(2) + ', ' + intersects[0].point.y.toFixed(2) + ', ' + intersects[0].point.z.toFixed(2) + ')');
            	SelectedObject.position.x = intersects[0].point.x;
            	SelectedObject.position.z = intersects[0].point.z;
        	}
        }

        *
        var box3 = new THREE.Box3().setFromPoints(SELECTED.geometry.vertices); // compute shape from mesh.geometry.vertices
        var boundingBox = SELECTED.geometry.boundingBox.clone();
		
        for (var i = 0,len = colliderSystem.length; i < len; i++) {
        	console.log(SELECTED.position.distanceToSquared(yourSphere.position));
        	if (box3.isIntersectionBox(colliderSystem[i][1]))
        	{
        		console.log("collision with  " + colliderSystem[i][0]);
        	}
        	//console.log("analysis of " + colliderSystem[i]);
    	}
		*

        // ====== COLLISION DETECTION with RAYS ======
        // http://webmaestro.fr/collisions-detection-three-js-raycasting/
        // ===========================================
    }
    */

    /*
        mouse.x = x;
        mouse.y = y;

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        projector.unprojectVector(vector, camera3D);

        var raycaster = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());

        if (SELECTED) {
            var intersects = raycaster.intersectObject(plane);
            SELECTED.position.copy(intersects[0].point.sub(offset));
            return;
        }

        var intersects = raycaster.intersectObjects(scene3DHouseContainer);

        if (intersects.length > 0) {

            if (INTERSECTED != intersects[0].object) {

                if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

                plane.position.copy(INTERSECTED.position);
                plane.lookAt(camera.position);
            }

            //container.style.cursor = 'pointer';

        } else {

            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            INTERSECTED = null;
            //container.style.cursor = 'auto';
        }
    */
}

function on3DMouseDown(event) {

    event.preventDefault();

    if (event.which == 1) leftButtonDown = true; // Left mouse button was pressed, set flag

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (SelectedObject !== null)
    {
        //console.log("on3DMouseDown unselect objet");
        clickMenuTime = setTimeout(function(){
            scene3DObjectUnselect();
            if (controls3D instanceof THREE.TransformControls && !TransformConstrolsHighlighted)
            {
                //console.log(TransformConstrolsHighlighted);
                controls3D.detach(SelectedObject);
                
                enableOrbitControls();

                scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
                //$(renderer.domElement).unbind('mousemove', on3DMouseMove);
            }
        }, 500);
    }

    $(renderer.domElement).bind('mousemove', on3DMouseMove);
    /*
    if (controls3D instanceof THREE.TransformControls || controls3D instanceof THREE.FirstPersonControls || SelectedObject !== null) {
        return;
    }
    */
    //clickTime = new Date().getTime();
    
    SceneAnimate = false;

    //renderer.antialias = false;

    clickTime = setTimeout(function() {
        if (document.getElementById('arrow-right').src.indexOf("images/arrowright.png") >= 0) {
            toggleSideMenus(false);
        }
    }, 1400);
}

function toggleSideMenus(open) {

    //Auto close right menu
    toggleRight('menuRight', open);

    //document.getElementById('menuRight').setAttribute("class", "hide-right");
    //delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

    //Auto close left menu
    if (SCENE == 'house') {
        toggleLeft('menuLeft3DHouse', open);

    } else if (SCENE == 'floor') {
        toggleLeft('menuLeft3DFloor', open);
    }
}

function on3DMouseUp(event) {

    event.preventDefault();

    if (event.which == 1) leftButtonDown = false; // Left mouse button was released, clear flag

    $(renderer.domElement).unbind('mousemove', on3DMouseMove);

    if (controls3D instanceof THREE.TransformControls || controls3D instanceof THREE.FirstPersonControls || SelectedObject !== null) {
        return;
    }

    //mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    //mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    

    //if (SCENE == '2d') {

    //container.style.cursor = 'pointer';

    //if (TOOL2D == 'freestyle') {
    /*
            scene2D.remove(scene2DDrawLineContainer);

            //console.log("lines to analyze: " + scene2DDrawLineContainer.children.length);
            //scene.getObjectByName( "objectName", true );
            //scene.getObjectByName( "objectName" ).id

            var scene2DDrawLineArray = [];
            var arrayCount = 0;
            var sensitivityRatio = 5;

            //Calculate 2D walls from mouse draw
            for (var i = 0; i < scene2DDrawLineContainer.children.length; i++) {

                //console.log("object is :" + scene2DDrawLineContainer.children[i].id);

                var magicNumberX = 0;
                var magicNumberY = 0;

                //TODO: calculate geometric angle

                for (var d = 0; d < sensitivityRatio; d++) { //how many lines-segments to analyze before determining an angle or straight line
                    var n = i + d;
                    //var object = scene2D.getObjectById(scene2DDrawLineContainer.children[n].id, true);
                    //console.log("[" + n + "] " + scene2DDrawLineContainer.children[n].geometry.vertices[0].y);

                    magicNumberX += scene2DDrawLineContainer.children[n].geometry.vertices[0].x;
                    magicNumberY += scene2DDrawLineContainer.children[n].geometry.vertices[0].y;
                }

                //========= Vertical Analisys ============
                var vertical = (magicNumberX / scene2DDrawLineContainer.children[i].geometry.vertices[0].x * sensitivityRatio);

                //========= Horizontal Analisys ============
                var horizontal = (magicNumberY / (scene2DDrawLineContainer.children[i].geometry.vertices[0].y * sensitivityRatio)).toFixed(2);

                //console.log("(" + i + ") " + magicNumberY + ":" + scene2DDrawLineContainer.children[i].geometry.vertices[0].y * 8 + " > " + horizontal);

                var shape = new THREE.Shape();

                if (horizontal <= 0.8) { //Horizontal line jump up

                    console.log("line up");

                } else if (horizontal >= 1.15) { //Horizontal line jump down

                    console.log("line down");

                } else { //Horizontal straight line (around 1.0)
                    console.log("straight line (" + arrayCount + ") from " + scene2DDrawLineContainer.children[i].geometry.vertices[0].x + ":" + scene2DDrawLineContainer.children[i].geometry.vertices[0].y + " to " + scene2DDrawLineContainer.children[i + sensitivityRatio].geometry.vertices[0].x + ":" + scene2DDrawLineContainer.children[i].geometry.vertices[0].y);

                    scene2DDrawLineArray[arrayCount] = new THREE.Vector2(scene2DDrawLineContainer.children[i].geometry.vertices[0].x, scene2DDrawLineContainer.children[i].geometry.vertices[0].y);
                    scene2DDrawLineArray[arrayCount + 1] = new THREE.Vector2(scene2DDrawLineContainer.children[i + sensitivityRatio].geometry.vertices[0].x, scene2DDrawLineContainer.children[i + sensitivityRatio].geometry.vertices[0].y);
                    arrayCount += 2;
                }

                i += sensitivityRatio;
            }

            //TODO: Optimize (remove extra points of refference in scene2DDrawLineArray (ex: straight line))

            //TODO: http://stemkoski.github.io/Three.js/Extrusion.html

            for (var i = 0; i < scene2DDrawLineArray.length; i++) {

                var shape = new THREE.Shape();
                shape.moveTo(scene2DDrawLineArray[i].x, scene2DDrawLineArray[i].y);
                shape.lineTo(scene2DDrawLineArray[i].x, scene2DDrawLineArray[i].y + 2);
                shape.lineTo(scene2DDrawLineArray[i + 1].x, scene2DDrawLineArray[i + 1].y + 2);
                shape.lineTo(scene2DDrawLineArray[i + 1].x, scene2DDrawLineArray[i + 1].y);
                shape.lineTo(scene2DDrawLineArray[i].x, scene2DDrawLineArray[i].y); // close the loop
                geometry = shape.makeGeometry();

                mesh = new THREE.Mesh(geometry, scene2DWallRegularMaterial);
                //mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, scene2DWallRegularMaterial);

                mesh.position.z = 1;

                //scene2DFloorContainer[0].add(mesh);

                //scene2DDrawLineContainer.add(rectShape);
                //scene2D.add(scene2DDrawLineContainer);
            }
            */
    //}
    //scene3D.updateMatrixWorld();

    //} else {

     
    scene3D.remove(scene3DPivotPoint);
    //scene3DPivotPoint.traverse( function ( object ) { object.visible = false; } );

    //scene3D.needsUpdate = true;

    clearTimeout(clickTime); //prevents from hiding menus too fast

    if (document.getElementById('arrow-right').src.indexOf("images/arrowleft.png") >= 0) {
        toggleSideMenus(true);
    }
    //container.style.cursor = 'auto';
}

function scene3DObjectSelectRemove() {

    if (SCENE == 'house') {
        scene3DHouseContainer.remove(SelectedObject);
        //console.log(SelectedObject.uuid);
 
    } else if (SCENE == 'floor') {
        scene3DFloorFurnitureContainer[FLOOR].remove(SelectedObject);
    }
    
    scene3DObjectUnselect();
}

function scene3DObjectSelectMenu(x, y, menuID) {

    //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    vector = new THREE.Vector3(x, y, 0.1);

    var percX, percY;

    // projectVector will translate position to 2d
    //vector = projector.projectVector(vector.setFromMatrixPosition(SELECTED.matrixWorld), camera3D); //vector will give us position relative to the world
    if (SelectedObject !== null)
    {
    	vector = vector.setFromMatrixPosition(SelectedObject.children[0].matrixWorld);
	}
	else if (SelectedWall !== null)
	{
		vector = vector.setFromMatrixPosition(SelectedWall.matrixWorld);
	}
    vector.project(camera3D); //vector will give us position relative to the world
    
    // translate our vector so that percX=0 represents the left edge, percX=1 is the right edge, percY=0 is the top edge, and percY=1 is the bottom edge.
    percX = (vector.x + 1) / 2;
    percY = (-vector.y + 1) / 2;

    // scale these values to our viewport size
    vector.x = percX * window.innerWidth; // - $(menuID).width(); // * 2;
    vector.y = percY * window.innerHeight; //- $(menuID).height() / 2;

    $(menuID).css('top', vector.y - 60).css('left', vector.x);
    $(menuID).show();

    if (SelectedObject !== null)
    {
        //$('#WebGLTextureSelect').css('top', vector.y + $(menuID).height()-64).css('left', vector.x - $('#WebGLTextureSelect').width() / 2);
        //$('#WebGLTextureSelect').show();

        //$('#WebGLInteractiveMenu').bind('mousemove', on3DMouseMove);
        //$('#WebGLInteractiveMenu').bind('mousedown', on3DMouseDown);
        //$('#WebGLInteractiveMenu').bind('mouseup', on3DMouseUp);
    }
    else if (SelectedWall !== null)
    {
        $('#WebGLTextureSelect').css('top', vector.y + $(menuID).height()).css('left', vector.x - $('#WebGLTextureSelect').width() / 2);
        $('#WebGLColorWheelSelect').css('top', vector.y - $('#WebGLColorWheelSelect').height()-32).css('left', vector.x - $('#WebGLColorWheelSelect').width() / 2);
        //$('#WebGLTextureSelect').show();
    }

    //$('#WebGLWalPaintMenu').css('top', vector.y).css('left', vector.x);
    //$('#WebGLWallPaintMenu').show();

    /*
	var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
	new THREE.MeshLambertMaterial( { color: 0xffffff} ),
	new THREE.MeshBasicMaterial( { color: 0x222222, wireframe: true} )
	]);
	*/

    /*
	INTERSECTED = intersects[0].object.material; //new THREE.MeshFaceMaterial(intersects[0].object.material);
	intersects[0].object.material = new THREE.MeshBasicMaterial({
	color: 0x222222,
	wireframe: true
	});
	*/

    //Calculate object real dimentions TODO: find some smart code
    /*
	intersects[0].object.geometry.computeBoundingBox();
	var position = new THREE.Vector3();
	position.subVectors(intersects[0].object.geometry.boundingBox.max, intersects[0].object.geometry.boundingBox.min);
	//position.multiplyScalar(0.5);
	//position.addSelf(intersects[0].object.geometry.boundingBox.min);
	intersects[0].object.matrixWorld.multiplyVector3(position);
	var point1 = camera3D.matrixWorld.getPosition().clone();
	var point2 = position;
	var distance = point1.distanceTo(point2);
	*/

    /*
	var vFOV = camera3D.fov * Math.PI / 180;      // convert vertical fov to radians
	var height = 2 * Math.tan( vFOV / 2 ) * distance; // visible height
	var aspect = window.width / window.height;
	var width = height * aspect;                  // visible width
	*/

    //$('#WebGLInteractiveMenuText').html("Dimentions: " + (SELECTED.geometry.boundingBox.max.x * REALSIZERATIO).toFixed(1) + "x" + (SELECTED.geometry.boundingBox.max.y * REALSIZERATIO).toFixed(1) + "x" + (SELECTED.geometry.boundingBox.max.z * REALSIZERATIO).toFixed(1) + " Meters");
    //$('#WebGLInteractiveMenu').show();
}

function scene3DObjectSelect(x, y, camera, object) {

    //TODO: > http://stemkoski.github.io/Three.js/Outline.html
    /*
    if(SelectedObject != null)
        return true;
    */

    //if (controls3D instanceof THREE.OrbitControls){
        vector = new THREE.Vector3(x, y, 0.5);
        //var projector = new THREE.Projector();
        //projector.unprojectVector(vector, camera);
        vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(object.children,true); //recursive! pickup objects within objects (example: notes)

        //var raycaster = projector.pickingRay(vector.clone(), camera3D);
        //if (scene3DHouseContainer instanceof THREE.Object3D) {

        //TODO: Find better way of detection - avoiding variable store
        /*
        if (SCENE == 'house') {
            intersects = raycaster.intersectObjects(scene3DHouseContainer.children);
        } else if (SCENE == 'floor') {
            intersects = raycaster.intersectObjects(scene3DFloorFurnitureContainer[FLOOR].children);
        } else {
            return;
        }
    	*/


        // INTERSECTED = the object in the scene currently closest to the camera 
        // and intersected by the Ray projected from the mouse position

        if (intersects.length > 0) { // case if mouse is not currently over an object

            //console.log(intersects[0].object);
            
            //if (SelectedObject != intersects[0].object){

                //controls3D.enabled = false;

                if (intersects[0].object.name.indexOf("Platform/note.jsz") >= 0)
                {
                    SelectedNote = intersects[0].object;
                    camera3DPositionCache = SelectedNote.position.clone();
                    camera3DPivotCache = SelectedNote.rotation.clone();
                    
                    ViewNoteText = "test"; //TODO: get object text maybe .name will be a slit array | ???
                    camera3DNoteEnter();
                    
                    return true;
                }
                else if (intersects[0].object.name.indexOf("Platform/camera.jsz") >= 0)
                {
                    SelectedPicture = intersects[0].object;
                    camera3DPositionCache = SelectedPicture.position.clone();
                    camera3DPivotCache = SelectedPicture.rotation.clone();
                    
                    camera3DPictureEnter();
                    
                    return true;
                }

                if (object == scene3DHouseContainer || object == scene3DFloorFurnitureContainer[FLOOR]) { //avoid selecting ground
                	
                    clearTimeout(clickMenuTime);
                   
                    //scene3DObjectUnselect(); //avoid showing multiple selected objects

                	//SelectedObject = intersects[0].object;

                    //Select root group including any attached objects (ex: notes, measurements)
                    for (var i = 0; i < object.children.length; i++) {
                        if (object.children[i].children[0].uuid == intersects[0].object.uuid)
                        {
                            SelectedObject = object.children[i];
                            break;
                        }
                    }
                    
                    //https://github.com/mrdoob/three.js/issues/1689

                    /*
                    var destinationQuaternion = new THREE.Quaternion(SELECTED.position.x, SELECTED.position.y, SELECTED.position.z, 1);
                    var newQuaternion = new THREE.Quaternion();
                    THREE.Quaternion.slerp(camera3D.quaternion, destinationQuaternion, newQuaternion, 0.07);
                    camera3D.quaternion = newQuaternion;
                    camera3D.quaternion.normalize();
                    scene3D.updateMatrixWorld();
                    */

                    //Focus on 3D object
                	//camera3D.fov = currentFov.fov;
                	//camera3D.lookAt(intersects[0].object.position);
                	//camera3D.updateProjectionMatrix();

                    if(intersects[0].distance > 6){

                        camera3DPositionCache = camera3D.position.clone();
                        camera3DPivotCache = controls3D.target.clone();

                    	var tween = new TWEEN.Tween(camera3D.position).to({x:SelectedObject.children[0].position.x, y:SelectedObject.children[0].position.y+4, z:SelectedObject.children[0].position.z + 6},1500).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
                        	
                            //http://jeromeetienne.github.io/threex.geometricglow/examples/geometricglowmesh.html

                        	//glowMesh = new THREEx.GeometricGlowMesh(SelectedObject);
                    		//SelectedObject.add(glowMesh.object3d);

                        	scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
            			}).start();
        				tween = new TWEEN.Tween(controls3D.target).to({x:SelectedObject.children[0].position.x, y:SelectedObject.children[0].position.y, z:SelectedObject.children[0].position.z},1500).easing(TWEEN.Easing.Quadratic.InOut).start();
                        //var tween = new TWEEN.Tween(camera3D.lookAt).to({x:SelectedObject.position.x, y:SelectedObject.position.y, z:SelectedObject.position.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
                        
                    }else{
                        scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
                    }

                    toggleSideMenus(false);
                }
                else if (children == scene3DFloorWallContainer[FLOOR].children)
                {
                	SelectedWall = intersects[0].object;
                    scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLWallPaintMenu');
                }

                // example of customization of the default glowMesh
                //var insideUniforms = glowMesh.insideMesh.material.uniforms;
                //insideUniforms.glowColor.value.set('hotpink');
                //var outsideUniforms = glowMesh.outsideMesh.material.uniforms;
                //outsideUniforms.glowColor.value.set('hotpink');
            //}
            return true;
        } else {
            /*
            console.log("unselect");
            clickTime = setTimeout(function(){
                scene3DObjectUnselect();
            }, 1000);
            */
            //controls3D.enabled = true;
            return false;
        }
    //}
}

function scene3DObjectUnselect() {

    if (controls3D instanceof THREE.OrbitControls)
    {
        /*
    	if (glowMesh instanceof THREEx.GeometricGlowMesh)
    	{
        	SelectedObject.remove(glowMesh.object3d);
    	}
        */

        if(SelectedNote !== null)
        {
            camera3DNoteExit();
            SelectedNote = null;
        }
        else if(SelectedPicture !== null)
        {
            camera3DPictureExit();
            SelectedPicture = null;
        }
        else if(SelectedObject !== null)
        {
            $('#WebGLInteractiveMenu').hide();
            $('#WebGLWallPaintMenu').hide();
            $('#WebGLColorWheelSelect').hide();
            $('#WebGLTextureSelect').hide();

            camera3DAnimateResetView();

            SelectedObject = null;
            SelectedWall = null;
        }

	    camera3DPositionCache = null;
		camera3DPivotCache = null;

		//$('#WebGLInteractiveMenu').unbind('mousemove', on3DMouseMove);
		//$('#WebGLInteractiveMenu').unbind('mousedown', on3DMouseDown);
		//$('#WebGLInteractiveMenu').unbind('mouseup', on3DMouseUp);
	}
}
/*
jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}
*/
function exportPDF() {
	
    if (!fabric.Canvas.supports('toDataURL')) {
        alert('Sorry, your browser is not supported.');
    } else {

        if (typeof jsPDF == 'undefined') $.getScript("js/dynamic/jspdf.js", function(data, textStatus, jqxhr) {
        //if (typeof jsPDF == 'undefined') $.loadScript("js/jspdf.js", function(){
            /*
            console.log(data); //data returned
            console.log(textStatus); //success
            console.log(jqxhr.status); //200
            console.log('Load was performed.');
            */

            var doc = new jsPDF('l', 'in', [8.5, 11]);

            doc.setFontSize(40);
            doc.text(4.5, 1, scene3DFloorFurnitureContainer[FLOOR].name);

            var image = scene2D.toDataURL("image/jpeg"); //.replace("data:image/png;base64,", "");
            doc.addImage(image, 'JPEG', 0, 1.5, 11, 7);

            //var image = scene2D.toSVG();
            //doc.addImage(image, 'PNG', 15, 40, 180, 180);

            doc.output('dataurl');
            /*
            window.open(
                doc.output('dataurl'),
                '_blank'
            );
            */

            //saveAs(doc.output('dataurl'), scene3DFloorFurnitureContainer[FLOOR].name + ".pdf");
            //doc.save(scene3DFloorFurnitureContainer[FLOOR].name + ".pdf");
            //saveAs(doc.output('blob'), scene3DFloorFurnitureContainer[FLOOR].name + ".pdf");
        });
    }
}

function scene3DCollectArrayFromContainer(container) {

	var json = [];

	for (var i = 0; i < container.children.length; i++) {
        //var obj = new Object();
        var JSONString = {};
        JSONString.file = container.children[i].children[0].name;
        try{ JSONString.note = container.children[i].children[2].name; }catch(e){}
        JSONString.textures = "Textures";
        JSONString.position.x = container.children[i].children[0].position.x;
        JSONString.position.y = container.children[i].children[0].position.y;
        JSONString.position.z = container.children[i].children[0].position.z;
        JSONString.rotation.x = container.children[i].children[0].rotation.x;
        JSONString.rotation.y = container.children[i].children[0].rotation.y;
        JSONString.rotation.z = container.children[i].children[0].rotation.z;
    	//TODO: pickup scale and alternative texture location
        json.push(JSONString);
    }
    return json;
}

function scene2DCollectArrayFromContainer(n) {

    var json = [];
    var JSONString = {};
    var container = scene2DWallMesh[n];

    for (var i in container)
    {
        var obj = container[i];
        if (obj.name == 'wall')
        {
            //try{
                JSONString = {};
                JSONString.wall = "standard"; //used with different colors/textures
                JSONString.interior = "";
                JSONString.exterior = "";
                JSONString.id = obj.id; //used for matching windows and doors
                JSONString.locked = obj.lockMovementX;
                JSONString.position.x1 = obj.item(0).path[0][1];
                JSONString.position.y1 = obj.item(0).path[0][2];
                JSONString.position.x2 = obj.item(0).path[1][3];
                JSONString.position.y2 = obj.item(0).path[1][4];
                JSONString.curve.x = obj.item(0).path[1][1];
                JSONString.curve.y = obj.item(0).path[1][2];
                json.push(JSONString);
            //}catch(e){console.log(e);}
        }
    }
    container = scene2DDoorMesh[n];
    for (var i in container)
    {
        var obj = container[i];
        if (obj.name == 'door')
        {
            //try{
                JSONString = {};
                JSONString.door = obj.name;
                JSONString.id = obj.id;
                JSONString.locked = obj.lockMovementX;
                JSONString.open = obj.open;
                JSONString.direction = obj.direction;
                JSONString.position.x1 = obj.get("x1"); //obj.path[0][1];
                JSONString.position.y1 = obj.get("y1"); //obj.path[0][2];
                JSONString.position.x2 = obj.get("x2"); //obj.path[1][3];
                JSONString.position.y2 = obj.get("y2"); //obj.path[1][4];
                JSONString.position.z = obj.z;
                JSONString.curve.x = 0; //obj.path[1][1];
                JSONString.curve.y = 0; //obj.path[1][2];
                json.push(JSONString);
            //}catch(e){console.log(e);}
        }
    }
    return json;
}

function saveScene(online) {

    setTimeout(function(){

        var zip = new JSZip();

        //console.log(JSON.stringify(terrain3DRawData));

        zip.file("scene3DTerrain.json", JSON.stringify(scene3DCollectArrayFromContainer(scene3DHouseGroundContainer)));
        zip.file("scene3DTerrainHill.json", JSON.stringify(terrain3DRawHillData));
        zip.file("scene3DTerrainValley.json", JSON.stringify(terrain3DRawValleyData));

        var options= {};
        options.settings = {};
        options.floors = [];
        options.settings.clouds = true;
        options.settings.rainbow = true;
        for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
            options.floors.push(JSON.stringify('"name":"' + scene3DFloorFurnitureContainer[i].name + '"'));
        }
        zip.file("options.json", JSON.stringify(options));

        zip.file("scene3DRoofContainer.json", JSON.stringify(scene3DCollectArrayFromContainer(scene3DRoofContainer)));
        zip.file("scene3DHouseContainer.json", JSON.stringify(scene3DCollectArrayFromContainer(scene3DHouseContainer)));

        var json3d = [];
        var json2d = [];
        
        for (var i = 0; i < scene2DWallMesh.length; i++)
        {
            json3d.push(scene3DCollectArrayFromContainer(scene3DFloorFurnitureContainer[i]));
            json2d.push(scene2DCollectArrayFromContainer(i));
        }
        zip.file("scene3DFloorContainer.json", JSON.stringify(json3d));
        zip.file("scene2DFloorContainer.json", JSON.stringify(json2d));

        try{
            zip.file("house.jpg", imageBase64('imgHouse'), {
                base64: true
            });
        }catch(ex){}

        if (!online)
        {
            zip.file("readme.txt", "Saved by WebGL HousePlanner.");

            var ob = zip.folder("obj");
            var tx = zip.folder("obj/Textures");

            //var result= new THREE.OBJExporter().parse(scene3D.geometry); //MaterialExporter.js
            //var result = JSON.stringify(new THREE.ObjectExporter().parse(scene3D)); 
            //ob.file("THREE.Scene.json", result);

            /*
            tx.file("house.jpg", imgData, {
                base64: true
            });
            */
        }

        var content = zip.generate({
            type: "blob"
        });

        /*
	    var content = zip.generate({
	        type: "string"
	    });
	    */
        //location.href="data:application/zip;base64," + zip.generate({type:"base64"});

        if (online)
        {
        	if(SESSION == '')
		    {
                //saveAs(content, "scene.zip"); //Debug
		        window.location = "#openLogin";
		    }
		    else
		    {
	        	var data = new FormData();
	          	data.append('file', content);

	            //saveAs(content, "scene.zip");
	    		$.ajax('php/objects.php?upload=scene', {
	    		   	type: 'POST',
	    		   	contentType: 'application/octet-stream',
	    		   	//contentType: false,
	    		   	//dataType: blob.type,
	          		processData: false,
	    		   	data: data,
	    		   	success: function(data, status) {
	              		if(data.status != 'error')
	                	alert("ok");
	            	},
	            	error: function() {
	              		alert("not so ok");
	            	}
	    		});
	    		window.location = "#close";
		    }
        }
        else
        {
        	saveAs(content, "scene.zip");
            window.location = "#close";
        }
    }, 4000);
}

function openScene(zipData) {

    zip = new JSZip(zipData);
    //zip.folder("Textures").load(data);
    /*
    try{
        terrain3DRawHillData = JSON.parse(zip.file("scene3DTerrainHill.json").asText());
        landscape.select('hill');
        $.each(terrain3DRawHillData, function(index)
        {
            terrain3DMouse = this;
            landscape.onmousemove();
            //console.log(this);
        });
    }catch(ex){}

    try{
        terrain3DRawValleyData = JSON.parse(zip.file("scene3DTerrainValley.json").asText());
        landscape.select('valley');
        $.each(terrain3DRawValleyData, function(index)
        {
            terrain3DMouse = this;
            landscape.onmousemove();
            //console.log(this);
        });
    }catch(ex){}
    */
    var i = 0;
    $.each(JSON.parse(zip.file("scene2DFloorContainer.json").asText()), function(index)
    {
        var w = 0;
        var l = 0;
        var d = 0;
        //var objects2DWalls = JSON.parse(this);
        //console.log(this);

        scene2DWallMesh[i] = [];
        scene2DDoorMesh[i] = [];
        
        $.each(this, function(index)
        {
            if(this.door !== undefined)
            {
                scene2DDoorMesh[i][d] = scene2DMakeDoor({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['position.z'],this['open'],this['direction'],this['id']);
                scene2DDoorMesh[i][d].file = this.door;
                d++;
            }
            else if(this.window !== undefined)
            {
                scene2DWindowMesh[i][w] = scene2DMakeWindow({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['position.z'],this['open'],this['direction'],this['id']);
                scene2DWindowMesh[i][w].file = this.window;
                w++;
            }
            else if(this.wall !== undefined)
            {
                scene2DWallMesh[i][l] = scene2DMakeWall({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['id'],i);
                l++;
            }
        });
        i++;
    });

    i = 0;
    $.each(JSON.parse(zip.file("scene3DFloorContainer.json").asText()), function(index)
    {
        //var objects3DFurniture = JSON.parse(this);
        $.each(this, function(index){
            var note = null;
            if(this.note !== null)
                note = this.note;
            console.log(this.file);
            open3DModel(this.file, scene3DFloorFurnitureContainer[i], this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, note);
        });
        i++;
    });
    
    $.each(JSON.parse(zip.file("scene3DTerrain.json").asText()), function(index){
        open3DModel(this.file, scene3DHouseGroundContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });

    var result = JSON.parse(zip.file("scene3DHouseContainer.json").asText())
    for (var k in result) {
        //console.log(k, result[k]);
        var item = result[k];
        //console.log(item);
        //setTimeout(function() {
            open3DModel(item.file, scene3DRoofContainer, item['position.x'], item['position.y'], item['position.z'], item['rotation.x'], item['rotation.y'], 1, true, null);
        //}, 100);
        //open3DModel(item.file, scene3DHouseContainer, item.position.x, item.position.y, item.position.z, item.rotation.x, item.rotation.y, 1, true, null);
    }
    /*
    $.each(JSON.parse(zip.file("scene3DHouseContainer.json").asText()), function(index){
        //setTimeout(function() {
            open3DModel(this.file, scene3DHouseContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
        //}, 100);
    });
    */
    
    $.each(JSON.parse(zip.file("scene3DRoofContainer.json").asText()), function(index){
        open3DModel(this.file, scene3DRoofContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });
    
    try{
        var options = JSON.parse(zip.file("options.json").asText());
        //console.log(options);

        if(options.settings.clouds === false)
            options.clouds = false;
        
        if(options.settings.rainbow === false)
            options.rainbow = false;

        for (var i = 0; i < options.floor.length; i++){
            //console.log(options.floor[i].name);
            scene3DFloorFurnitureContainer[i].name =  options.floor[i].name; 
        }
    }catch(ex){}
    //show2D(); //DEBUG 2D
    
    setTimeout(function() {
        SceneAnimate = false; //true;
        show3DHouse();
    }, 2000);

}

function imageBase64(id) {

    var img = document.getElementById(id);
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    var base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return base64;
}

/**
 * Item name is unique
 */
fabric.Canvas.prototype.getItemByName = function(name) {
    var object = null,
        objects = this.getObjects();

    for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i].name && objects[i].name === name) {
            object = objects[i];
            break;
        }
    }

    return object;
};

function scene3DFloorMeasurementsGenerate()
{
    material = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 2
    });

    //for (var i = 0; i < scene3DFloorWallContainer[FLOOR].children.length; i++) {
    //}
}

function scene3DFloorMeasurementShow() {
    var show = true;
    for (var i = 0; i < scene3DFloorFurnitureContainer[FLOOR].children.length; i++) {
        
        if(scene3DFloorFurnitureContainer[FLOOR].children[i].position.y < 0.8)
            scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible = !scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible;
        
        show = scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible;
    }
    if (show)
    {
        menuSelect(0,'menuLeft3DFloorItem','#ff3700');
        TOOL3DFLOOR = 'measure';
    }else{
        menuSelect(0,'menuLeft3DFloorItem','black');
        TOOL3DFLOOR = '';
    }
}

function scene3DFloorObjectWallMeasurementAjust() {

}

function scene2DFloorShapeFill(shape) {
    //shape.quickCorner = new Array();
    var count = 1;
    
    //var obj = scene2DWallMesh[FLOOR][0];
    //shape.path[0][1] = obj.item(0).path[0][1]; //x1
    //shape.path[0][2] = obj.item(0).path[0][2]; //y1
    //shape.count = scene2DWallMesh[FLOOR].length;


    var corner = {x:0,y:0};

    for(i=0; i<scene2DWallMesh[FLOOR].length; i++)
    {
        var obj = scene2DWallMesh[FLOOR][i];
        //shape.quickCorner.push(obj.id);
        
        //if(obj.edgeB) {
            //console.log("filling shape [" + i + "]" + obj.edgeA.left + ":" + obj.edgeA.top + " " + obj.edgeB.left + ":" + obj.edgeB.top);
            var v1 = {x:obj.item(0).path[0][1],y:obj.item(0).path[0][2]};
            var v2 = {x:obj.item(0).path[1][3],y:obj.item(0).path[1][4]};

            if(count == 1)
            {
                shape.path[0][1] = v1.x ; //obj.edgeA.left; //x1
                shape.path[0][2] = v1.y ; //obj.edgeA.top; //y1
            }

            shape.path[count][1] = obj.item(0).path[1][1]; //cx
            shape.path[count][2] = obj.item(0).path[1][2]; //cy

            //console.log(v1.x + ":" + v1.y + " " + v2.x + ":" + v2.y);
            if(v2.x == corner.x && v2.y == corner.y){
                //console.log("[" + count + "] reversed " + obj.id)
                v2=v1;
            }
            shape.path[count][3] = v2.x ; //obj.edgeB.left; //x2 
            shape.path[count][4] = v2.y ; //obj.edgeB.top; //y2
            corner = v2;
            count ++;
        //}
    }
}

function scene2DFloorShapeGenerate() {

    //var shape = scene2D.getItemByName("floorshape");
    if (scene2DFloorShape === undefined) // || scene2DFloorShape.count != scene2DWallMesh[FLOOR].length)
    {
        //Generate 2D Vector Floor Shape
        
        var path = " Q 0 0 0 0".repeat(scene2DWallMesh[FLOOR].length);
        path = "M 0 0" + path;  //console.log(path);
        var shape = new fabric.Path(path);
        scene2DFloorShapeFill(shape);

        //Fix for fabric.js 1.5.0 - Must have proper Array with type:"path"
        shape.clone(function (clone) {
            clone.set({left: 0, top: 0});
            clone.set({strokeWidth: 1, stroke: 'black', selectable:false, hasControls: false, name:'floorshape', opacity:0.6});
            fabric.util.loadImage('objects/FloorPlan/Default/7.png', function(img) {
                clone.fill = new fabric.Pattern({
                    source: img,
                    repeat: 'repeat'
                });
                //scene2D.renderAll();
            });

            scene2DFloorShape = clone;
            scene2D.add(scene2DFloorShape);
        });
        
        /*
        var p = new Array();
        for(i=0; i<scene2DWallMesh[FLOOR].length; i++)
        {
            var obj = scene2DWallMesh[FLOOR][i];
        
            if(obj.edgeB) {
                p.push({x:obj.edgeA.left,y:obj.edgeA.top});
                p.push({x:obj.edgeB.left,y:obj.edgeB.top});            
            }
        }
        scene2DFloorShape = new fabric.Polygon({p, stroke: "#000000", 
        strokeWidth: 5,
        fill: 'red', 
        opacity: 1.0});
        scene2D.add(scene2DFloorShape);
        */
        
    }else{
        scene2DFloorShapeFill(scene2DFloorShape);
    }
    
    //if (scene2DFloorShape == undefined)
    //{
        //scene2D.remove(scene2DFloorShape);
        //scene2D.add(scene2DFloorShape);
        //scene2D.bringToFront(scene2DFloorShape);
        //scene2D.sendBackwards(scene2DFloorShape);
    //}

    /*
    var p = new Array();
    for(i=0; i<count; i++)
    {
        p.push([shape.path[i][1],shape.path[i][2]]);
    }
    console.log("Surface Area: " + scene2DSurfaceArea(p));
    */
}

function scene3DLevelWallGenerate() {

    scene3DLevelWallContainer = new THREE.Object3D();

    //Temporary Sample Data
    var geometry = new THREE.BoxGeometry(15, 4, 13);
    var material = new THREE.MeshBasicMaterial({
        color: 0xE0E0E0,
    });
    var mesh = new THREE.Mesh(geometry,material);
    mesh.position.y = 2;
    scene3DLevelWallContainer.add(mesh);


    geometry = new THREE.BoxGeometry(10, 4, 9);
    material = new THREE.MeshBasicMaterial({
        color: 0xB0B0B0,
    });
    mesh = new THREE.Mesh(geometry,material);
    mesh.position.x = 2.5;
    mesh.position.z = -2;
    mesh.position.y = 6;
    scene3DLevelWallContainer.add(mesh);

    scene3D.add(scene3DLevelWallContainer);
}

function scene3DFloorWallGenerate() {

    //scene3D.remove(scene3DFloorShapeContainer[FLOOR]);

    //PERFORMANCE: May not need array for this
    scene3DFloorWallContainer[FLOOR] = new THREE.Object3D(); //reset
    scene3DFloorShapeContainer[FLOOR] = new THREE.Object3D();

    scene3DFloorDoorContainer = new THREE.Object3D();
    scene3DFloorWindowContainer = new THREE.Object3D();

    if(scene2DWallMesh[FLOOR].length == 0)
        return;
    
    var floorShape = null //new THREE.Shape(); //new THREE.Geometry();
    var corner = {x:0,y:0};
    var c = 0;
    /*
    scene2DFloorShapeGenerate();
    for(i=0;i<scene2DFloorShape.path.length;i++)
    {
        if(i==0)
            floorShape.moveTo(scene2DFloorShape.path[0][1], scene2DFloorShape.path[0][2]);

        floorShape.quadraticCurveTo(scene2DFloorShape.path[1][c+1], scene2DFloorShape.path[1][c+2], scene2DFloorShape.path[1][c+3], scene2DFloorShape.path[1][c+4]);
        c+=4;
    }
    */
    for (var w in scene2DWallMesh[FLOOR])
    {
        var wall = scene2DWallMesh[FLOOR][w];

        if (wall.name == "wall") { //avoid picking arrows which are path also
            //console.log(wall);
            //console.log(wall.type + " x1:" + wall._objects[0].path[0][1] + " y1:" + wall._objects[0].path[0][2] + " x2:" + wall._objects[0].path[1][3] + " y2:" + wall._objects[0].path[1][4] + " cx:" + wall._objects[0].path[1][1] + " cy:" + wall._objects[0].path[1][2]);

            //SVG
            var x1 = (wall.item(0).path[0][1]/100) * 2 - 1;
            var y1 = -(wall.item(0).path[0][2]/100) * 2 + 1;
            var cx = (wall.item(0).path[1][1]/100) * 2 - 1;
            var cy = -(wall.item(0).path[1][2]/100) * 2 + 1;
            var x2 = (wall.item(0).path[1][3]/100) * 2 - 1;
            var y2 = -(wall.item(0).path[1][4]/100) * 2 + 1;
            var a = Math.atan2(y1-y2, x1-x2) * 180 / Math.PI - 180;

            //3D Adjustments
            x1 = x1-13;
            y1 = y1+7;
            cx = cx-13;
            cy = cy+7;
            x2 = x2-13;
            y2 = y2+7;

            //console.log("x1:" + x1 + " y1:" + y1 + " x2:" + x2 + " y2:" + y2 + " cx:" + cx + " cy:" + cy)

            //var p = scene2DGetWallParallelCoordinates({x:x1,y:y1},{x:x2,y:y2},20);
            var wallShape = new THREE.Shape();
            wallShape.moveTo(x1, y1);
            wallShape.quadraticCurveTo(cx, cy, x2,y2);
            wallShape.moveTo(x2, y2); //requires to close the looped shape
            wallShape.quadraticCurveTo(cx, cy, x1,y1);
            //wallShape.moveTo(x1, y1);
            //wallShape.moveTo(p.x1, p.y1);
            //wallShape.quadraticCurveTo(cx, cy, p.x2,p.y2);

            /*
            https://www.mixeelabs.com/creator/tutorial:-advanced-geometries/edit
            */
            
            if (floorShape === null)
            {
                //Generate 3D Floor Shape
                floorShape = new THREE.Shape();
                floorShape.moveTo(x1, y1);
                floorShape.quadraticCurveTo(cx, cy, x2, y2);
            }else{
                if(x2 == corner.x && y2 == corner.y){
                    floorShape.quadraticCurveTo(cx, cy, x1,y1);
                    corner = {x:x1,y:y1};
                }else{
                    floorShape.quadraticCurveTo(cx, cy, x2,y2);
                    corner = {x:x2,y:y2};
                }
            }
            
            /*
            var curve = new THREE.SplineCurve([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -100),
                new THREE.Vector3(100, 0, -100)
            ]);
            */
            //var curve = new THREE.QuadraticBezierCurve(new THREE.Vector2(x1,y1),new THREE.Vector2(cx,cy),new THREE.Vector2(x2,y2));

            var extrudeSettings = {
                amount: 4,
                //steps: 64,
                bevelEnabled: false,
                //bevelThickness: 5,
                //bevelSize: 0,
                //extrudePath: curve
            }; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5

            var geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
            //THREE.ExtrudeGeometry.WorldUVGenerator

            //scene3DWallInteriorTextureDefault.repeat.set(12, 12);
            //scene3DWallInteriorTextureDefault.anisotropy = 2;
            /*
            var scene3DWallMaterial = new THREE.MeshBasicMaterial({
                map: scene3DWallInteriorTextureDefault,
                //wireframe: true
            });
            */

            geometry.computeBoundingBox();

            var scene3DWallMaterial = new THREE.MeshLambertMaterial({
                map: scene3DWallInteriorTextureDefault,
                transparent: true,
                opacity: 0.6,
                //side: THREE.DoubleSide,
                //wireframe: true
            });

            var mesh = new THREE.Mesh(geometry, scene3DWallMaterial);
            mesh.rotation.x = -(90 * RADIAN); //extrusion happens in Z direction, we need the wall pointing UP
            mesh.position.y = 0;
  
            /*
            geometry.centroid = new THREE.Vector3();
            geometry.centroid.addVectors( geometry.boundingBox.min, geometry.boundingBox.max );
            geometry.centroid.multiplyScalar( - 0.5 );
            geometry.centroid.applyMatrix4(mesh.matrixWorld);
            */

            /*
            http://stackoverflow.com/questions/7364150/find-object-by-id-in-array-of-javascript-objects
            */
            var result = scene2DDoorMesh[FLOOR].filter(function(e) { return e.id === wall.id; });
            //var result = $.grep(scene2DDoorMesh[FLOOR], function(e){ return e.id === wall.id; });
            if (result.length >= 1) {
                /*
                var x = (result[0].left/100) * 2 - 1;
                var y = 0;
                var z = -(result[0].top/100) * 2 + 1;
                */
                
                var x = (result[0].item(0).x1/100) * 2 - 1;
                var y = 0;
                var z = -(result[0].item(0).y1/100) * 2 + 1;
                
                x = x-1.5;
                z = z-5.3;

                //console.log("ARRAY SEARCH " + result[0].file + " " + x + ":" + y + ":" + z + " " + a * 180 / Math.PI);

                open3DModel(result[0].file, scene3DFloorDoorContainer, x, y, z, 0, a, 1.0, false, null);

                /*
                while (scene3DFloorDoorContainer.children.length == 0) {
                    setTimeout(function(){}, 800);
                }
                */
                /*
                try //Cut a whole in scene3DFloorWallContainer Mesh
                {
                    var o = scene3DFloorDoorContainer.children.length; //TODO: Have some error catch

                    var cube_geometry = new THREE.CubeGeometry(scene3DFloorDoorContainer.children[o].geometry.boundingBox.max.x, scene3DFloorDoorContainer.children[o].geometry.boundingBox.max.y, scene3DFloorDoorContainer.children[o].geometry.boundingBox.max.z);
                    //var cube_geometry = new THREE.CubeGeometry(scene3DFloorDoorContainer.boundingBox.max.x, scene3DFloorDoorContainer.boundingBox.max.y, scene3DFloorDoorContainer.boundingBox.max.z);
                    
                    var cube_mesh = new THREE.Mesh(cube_geometry);
                    cube_mesh.position.x = x;
                    cube_mesh.position.y = 0; //y;
                    cube_mesh.position.z = z;
                    
                    var DoorBSP = new ThreeBSP(cube_mesh);
                    //var DoorBSP = new ThreeBSP(scene3DFloorDoorContainer);
                    var WallBSP = new ThreeBSP(mesh);
                    var WallCutBSP = WallBSP.subtract(DoorBSP);

                    var result = WallCutBSP.toMesh(new THREE.MeshLambertMaterial({shading: THREE.SmoothShading}));
                    //result.geometry.computeVertexNormals();
                    mesh.geometry = result.geometry;
                    
                }catch(e){
                    console.log("Cannot cut mesh (" + o + ") "  + result[0].file  + " " + e);
                }
                */
            }

            scene3DFloorWallContainer[FLOOR].add(mesh);
            //scene3DFloorWallContainer.2d = obj;

            /*
            http://stackoverflow.com/questions/26272564/how-to-increase-the-thickness-of-the-extrude-geometry-along-x-and-z-axis-three
            */
            
            var mesh_arr = [];
            for(var i = 0.2; i < 1; i++)
            {
                //cloned mesh,add position to the cloning mesh
                mesh_arr[i] = mesh.clone();
                mesh_arr[i].position.set(i,i,i);
                mesh_arr[i].updateMatrix();
                scene3DFloorWallContainer[FLOOR].add(mesh_arr[i]);
            }
        }
    }

    scene3D.add(scene3DFloorDoorContainer);

    //floorShape.faces.push(new THREE.Face3(0, 1, 2));
    //floorShape.computeFaceNormals();
    //floorShape.computeCentroids();

    /*
    var image = new Image();
    image.onload = function () { texture.needsUpdate = true; };
    image.src = 'objects/Platform/Textures/W23674.jpg';
    var texture  = new THREE.Texture(image, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter );
    texture.repeat.x = 10;
    texture.repeat.y = 10;
    */

    /*
    http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
    */

    //if (floorShape != null)
    //{
        /*
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        texture = new THREE.Texture(canvas);
        */
        texture = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/W23643.jpg');
        //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        //texture.minFilter = THREE.NearestFilter;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
        //texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        //texture.repeat.set(4, 4);
        texture.repeat.set(0.4, 0.4);
        texture.offset.set(0.4, 0.4);
        /*
        var img = new Image();
        img.src = 'objects/Platform/Textures/W23643.jpg';
        img.style.width = '50%'
        img.style.height = 'auto'
        img.onload = function() {
            //context.drawImage(img,0,0);
            //context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width/6, img.height/6);
            texture.needsUpdate = true;
        }
        */
        var uvGenerator = THREE.ExtrudeGeometry.WorldUVGenerator;
        //uvGenerator.uRepeat = 4;
        geometry = floorShape.extrude({amount: 0.1, 
            bevelEnabled: false,
            uvGenerator: uvGenerator
        });

        /*
        var uvs = [];
        uvs.push( new THREE.Vector2( 0.0, 0.0 ) );
        uvs.push( new THREE.Vector2( 1.0, 0.0 ) );
        uvs.push( new THREE.Vector2( 1.0, 1.0 ) );
        uvs.push( new THREE.Vector2( 0.0, 1.0 ) );
        geometry.faceVertexUvs[0].push([ uvs[0], uvs[1], uvs[2]] );
        */

        material = new THREE.MeshBasicMaterial({ map: texture});

        //material = new THREE.MeshLambertMaterial( { map: texture } );
        //material = new THREE.MeshPhongMaterial({ map: texture, shininess: 4});
        //var materials = [material1, material2, material3, material4, material5, material6];
        //var meshFaceMaterial = new THREE.MeshFaceMaterial( materials );
        //material = new THREE.MeshBasicMaterial({color: 0xccac7b});

        //geometry = floorShape.makeGeometry();
        //geometry.computeCentroids();

        geometry.computeVertexNormals();
        geometry.computeFaceNormals();

        mesh = new THREE.Mesh(geometry, material);
        /*
        mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true,
        })]);
        */
        mesh.rotation.x = -(90 * RADIAN); //Horizontal Flip
        mesh.position.y = 0;
        //mesh.overdraw = true;
        mesh.receiveShadow = true;
        //mesh.scale.set(4, 4, 1 );

        scene3DFloorShapeContainer[FLOOR].add(mesh);
        //scene3DFloorShapeContainer[FLOOR].children[0] = mesh;
    //}

    scene3D.add(scene3DFloorShapeContainer[FLOOR]);
}

function sceneOpen(file) {

    var opts = {
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      color: '#505050', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      className: 'spinner', // The CSS class to assign to the spinner
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };
    var spinner = new Spinner(opts).spin();
    document.getElementById('engine3D').appendChild(spinner.el);
    document.getElementById("start").getElementsByClassName("close")[0].setAttribute('href', "#close");

    //setTimeout(function(){
        $.ajax("scenes/" + file,{
            contentType: "application/zip",
            beforeSend: function (req) {
                  req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
            },
            success: function(data){
                try {
                    camera3DAnimate(0,20,0,1500);
                    setTimeout(function() {
                        //sceneNew();
                        scene3DHouseGroundContainer = new THREE.Object3D();
                        openScene(data);
                    }, 2000);
                } catch (e) {
                    alertify.alert("Failed to open Scene " + e);
                }
                
                setTimeout(function()
                {
                    document.getElementById('engine3D').removeChild(spinner.el);
                }, 1800);
            }
        });
    //}, 1000);
}

function sceneNew() {
   
    //scene3DFreeMemory();
    //hideElements();
    scene3D = new THREE.Scene();

    scene3DRoofContainer = new THREE.Object3D();
    scene3DHouseContainer = new THREE.Object3D();
    scene3DHouseGroundContainer = new THREE.Object3D();
    scene3DHouseFXContainer = new THREE.Object3D();
    scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DLevelGroundContainer = new THREE.Object3D();
    scene3DLevelWallContainer = new THREE.Object3D();

    skyMesh = new THREE.Object3D();

    //This allows for 3 floors -> MAKE THIS DYNAMIC! Array()?
    //==============================================
    for(var i=0; i<=2; i++)
    {
        scene3DFloorFurnitureContainer[i] = new THREE.Object3D();
        //scene3DFloorOtherContainer[i] = new THREE.Object3D();
        scene3DFloorMeasurementsContainer[i] = new THREE.Object3D();
        scene3DFloorWallContainer[i] = new THREE.Object3D();
        scene3DFloorShapeContainer[i] = new THREE.Object3D();

        scene2DWallMesh[i] = new Array();
        scene2DWallDimentions[i] = new Array();
        scene2DDoorMesh[i] = new Array();
        scene2DWindowMesh[i] = new Array();
        scene2DInteriorMesh[i] = new Array();
        scene2DExteriorMesh[i] = new Array();

        scene3DWallInteriorTextures[i] = new Array();
        scene3DWallExteriorTextures[i] = new Array();
    }
    //==============================================

    //http://blog.andrewray.me/creating-a-3d-font-in-three-js/
}

function scene2DMakeWallPivotCircle(left, top, lock) {

    //if(id == null)
        var id = Math.random().toString(36).substring(7);

    var mobileFix = new fabric.Circle({
      left: left,
      top: top,
      radius: 30,
      fill: '',
    });

    var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 2,
        radius: 8,
        fill: '#00BFFF',
        stroke: '#1E90FF'
    });

    var img = new Image();
    img.src = 'images/lock.png';

    var i = new fabric.Image(img, {
        left: left,
        top: top,
        width: 8,
        height: 10,
        opacity: 0.6,
        visible: false,
    });

    var group = new fabric.Group([mobileFix, c, i], {selectable: true, opacity: 0.9, hasBorders: false, hasControls: false, name: 'pivot', id:id, lockMovementX:lock, lockMovementY:lock});
    group.line = [];
    group.moving = false;

    group.on("selected", function () {
        group.moving = false;
        clickTime = setTimeout(function() {
            $('#menu2DTools').tooltipster('update', '<a href="#" onclick="scene2DResetPivot(\'' + group.id + '\')" class="lo-icon icon-linereset" style="color:#0066FF"></a><a href="#" onclick="scene2DLockObject(\'' + group.id + '\')" class="lo-icon icon-lock" style="color:#606060"></a>');
            $('#menu2DTools').css({ left: group.left, top: group.top });
            $('#menu2DTools').tooltipster('show');
        }, 500);
    });
    group.on("moving", function () {

        if(group.lockMovementX)
            return;
        
        //console.log(p.left + " " + p.top);
        //$('#menu2DTools').tooltipster('hide');
        clearTimeout(clickTime);
        group.line[0].item(0).path[1][1] = group.left;
        group.line[0].item(0).path[1][2] = group.top;

        // ====== Very fast floor shapre correction ===
        if (scene2DFloorShape)
        {
            scene2DFloorShape.path[group.wallid][1] = group.line[0].item(0).path[1][1]; //cx
            scene2DFloorShape.path[group.wallid][2] = group.line[0].item(0).path[1][2]; //cy
        }
        //group.line.item(0).setCoords();
        //scene2D.calcOffset();
    });
    /*
    group.on("out", function () {
        group.item(1).set({stroke:'#0066FF'});
        scene2D.renderAll();
    });
    */
    //pos = canvas.getPointer(e.e);
    //activeObj = canvas.getActiveObject();
    //canvas.activeGroup
    return group;
}

/*
function scene3DGround(_texture, _grid) {

    //var geometry = new THREE.SphereGeometry(20, 4, 2);
    //var material = new THREE.MeshBasicMaterial({ color: 0xff0000});

    scene3D.remove(groundGrid);

    if (_grid) {
        groundGrid = new THREE.GridHelper(20, 2);
        scene3D.add(groundGrid);
    }

    var groundTexture = new THREE.ImageUtils.loadTexture(_texture);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);

    // DoubleSide: render texture on both sides of mesh
    var floorMaterial = new THREE.MeshBasicMaterial({
        map: groundTexture,
        //side: THREE.DoubleSide,
        transparent: false
    });
    var floorGeometry = new THREE.PlaneGeometry(15, 15, 1, 1);

    groundMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    //groundMesh.position.y = -0.5;

    groundMesh.receiveShadow = true;
    //groundMesh.geometry.needsUpdate = false;

    groundMesh.rotation.x = Math.PI / 2;

    groundMesh.doubleSided = true;
    //scene3D.remove(groundMesh);
    scene3D.add(groundMesh);
}
*/

// reproduction of a demo of @mrdoob by http://mrdoob.com/lab/javascript/webgl/clouds/

function scene3DSetBackground(set) {

    //var canvas = document.getElementById('WebGLCanvas');
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth; //32;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');

    if (set == 'blue') {

        var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1e4877");
        gradient.addColorStop(0.5, "#4584b4");

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        //document.body.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
        document.getElementById('engine3D').style.background = 'url(' + canvas.toDataURL('image/png') + ')';

    } else if (set == 'split') {

        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(0.5 * window.innerWidth, 0);
        context.lineTo(0.5 * window.innerWidth, window.innerHeight);
        context.stroke();

        context.beginPath();
        context.moveTo(0, 0.5 * window.innerHeight);
        context.lineTo(window.innerWidth, 0.5 * window.innerHeight);
        context.stroke();

        //document.body.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
        document.getElementById('engine3D').style.background = 'url(' + canvas.toDataURL('image/png') + ')';
        //renderer.setClearColor(0x000000, 1);

    } else {
        document.body.style.background = "#fff";
    }
}

function scene3DSetLight() {

    scene3D.remove(sceneAmbientLight);
    scene3D.remove(sceneDirectionalLight);
    //scene3D.remove(sceneHemisphereLight);
    scene3D.remove(sceneSpotLight);

    if (SCENE == 'house') {
        if (DAY == 'day') {

            if (options.sunlight) 
            {
                //SUNLIGHT RAYS
                sceneAmbientLight = new THREE.AmbientLight(0x555555, 0.1); //SUNLIGHT RAYS
                scene3D.add(sceneAmbientLight);
                sceneDirectionalLight.intensity = 0.5; //SUNLIGHT RAYS
                scene3D.add(sceneDirectionalLight);
                sceneSpotLight.intensity = 1;
                sceneSpotLight.castShadow = false;
                scene3D.add(sceneSpotLight);
                
            }else{
                //REGULAR LIGHT
                sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
                scene3D.add(sceneAmbientLight);
                scene3D.add(sceneDirectionalLight);
            }

            
            //scene3D.add(sceneHemisphereLight);
        } else {
            sceneSpotLight.intensity = 0.8;
            sceneSpotLight.castShadow = false;
            scene3D.add(sceneSpotLight);
        }
    } else if (SCENE == 'landscape') {
        sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        scene3D.add(sceneAmbientLight);

        //sceneSpotLight.intensity = 0.6;
        //sceneSpotLight.castShadow = true;
        //scene3D.add(sceneSpotLight);
        scene3D.add(sceneDirectionalLight);

    } else if (SCENE == 'roof') {

        sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        scene3D.add(sceneAmbientLight);

        sceneSpotLight.intensity = 0.6;
        sceneSpotLight.castShadow = false;
        scene3D.add(sceneSpotLight);

    } else if (SCENE == 'floorlevel') {
        sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        scene3D.add(sceneAmbientLight);
        /*
        sceneSpotLight.intensity = 0.4;
        sceneSpotLight.castShadow = false;
        scene3D.add(sceneSpotLight);
        */
        scene3D.add(sceneDirectionalLight);
        //scene3D.add(sceneHemisphereLight);
    } else if (SCENE == 'floor') {

        sceneAmbientLight = new THREE.AmbientLight(0xffffff, 0.1);
        scene3D.add(sceneAmbientLight);
        //sceneSpotLight.intensity = 0.8;
        //sceneSpotLight.castShadow = false;
        //scene3D.add(sceneSpotLight);
        scene3D.add(sceneDirectionalLight);
    }
}


function scene3DSetSky(set) {

    if(skyMesh.name != set)
    {
        var files = '0000';

        if(set == 'day'){
            files = "2056";
        }else if(set == 'night'){
            files =  "2057";
        }
        //console.log("build Panorama: " + files);

        skyMesh = new THREE.Object3D();
        buildPanorama(skyMesh, files, 75, 75, 75,"");
        skyMesh.position.y = 5;
        
        /*
        var files = 'panoramas/';
        if(set == 'day')
        {
            files = files + "2056/";
        }else if(set == 'night'){
            files = files + "2057/";
        }else{
            files = files + "0000/";
        }

        if (set != 'day') {
            
            skyMesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), material);
            skyMesh.position.y = 5;
        }else{
            skyMesh = new THREE.Mesh(new THREE.BoxGeometry(60, 60, 60), material);
            skyMesh.position.y = 25;
        }
        */

        //skyMaterial.needsUpdate = true;
        //scene3D.add(skyMesh);

        skyMesh.name = set;
    }
}

function scene3DSky() {

    //http://mrdoob.com/lab/javascript/webgl/clouds/
    //http://gonchar.me/panorama/
    //scene3DSetSky("day");

    //=====================
    /*
    geometry = new THREE.SphereGeometry(40, 0, 0);
    var uniforms = {
        texture: {
            type: 't',
            value: THREE.ImageUtils.loadTexture('./images/sky/night/milkiway.jpg')
        }
    };
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('sky-vertex').textContent,
        fragmentShader: document.getElementById('sky-fragment').textContent
    });

    skyNightMesh = new THREE.Mesh(geometry, material);
    skyNightMesh.scale.set(-1, 1, 1);

    //skyNightMesh.eulerOrder = 'XZY';
    //skyNightMesh.renderDepth = 50.0;
    scene3D.add(skyNightMesh);
    */
    //=============



    /*
    weatherRainMesh = {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 20, 0),
        positionSpread: new THREE.Vector3(30, 0, 30),

        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, 5, 0),
        velocitySpread: new THREE.Vector3(10, 20, 10),
        accelerationBase: new THREE.Vector3(0, -10, 0),

        particleTexture: THREE.ImageUtils.loadTexture('./images/raindrop2flip.png'),

        sizeBase: 1.0,
        sizeSpread: 2.0,
        colorBase: new THREE.Vector3(0.66, 1.0, 0.7), // H,S,L
        colorSpread: new THREE.Vector3(0.00, 0.0, 0.2),
        opacityBase: 0.6,

        particlesPerSecond: 80,
        particleDeathAge: 2.5,
        emitterDeathAge: 60
    };
    */
}

/*
function scene3DFloorSky() {
    scene3D.remove(weatherSkyDayMesh);
}
*/

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scene3DInitializeLights() {

    //scene3D.add(new THREE.AmbientLight(0xFFFFFF));

    /*
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 100, 0);
    scene3D.add(light);
    */

    //sky color ground color intensity
    /*
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 100, 0);
    scene3D.add(hemiLight);
    */

    //add sunlight
    /*
    var light = new THREE.SpotLight();
    light.position.set(0, 100, 0);
    scene3D.add(light);
    */

    //scene3D.fog = new THREE.Fog(0xffffff, 0.015, 40); //white fog (0xffffff). The last two properties can be used to tune how the mist will appear. The 0.015 value sets the near property and the 100 value sets the far property 

    /*
    sceneHemisphereLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    sceneHemisphereLight.color.setHSL(0.6, 0.75, 0.5);
    sceneHemisphereLight.groundColor.setHSL(0.095, 0.5, 0.5);
    sceneHemisphereLight.position.set(0, 20, 0);
    //sceneHemisphereLight.shadowCameraVisible = true;
    */
    //scene3D.add(hemiLight);

    // sky color ground color intensity 
    //sceneHemisphereLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.6 ); 

    //var ambientLight = new THREE.AmbientLight(0x444444); // 0xcccccc
    //scene.add(ambientLight);

    /*
    sceneParticleLight = new THREE.Mesh(new THREE.SphereGeometry(0, 10, 0), new THREE.MeshBasicMaterial({
        color: 0xffffff
    }));
    scene3D.add(sceneParticleLight);
    */

    /*
    light1 = new THREE.PointLight( 0xFFFFFF );
    light1.position.set( 100, 70, 40 );
    scene.add( light1 );
    light1 = new THREE.PointLight( 0xFFFFAA );
    light1.position.set( -100, -70, -40 );
    scene.add( light1 );
    */


    /*
    var light = new THREE.SpotLight(0xffffff, 0.5);
    light.position.set(0, 20, 20);
    light.castShadow = true;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = camera3D.far;
    light.shadowCameraFov = 10;
    light.shadowBias = -0.00022;
    light.shadowDarkness = 0.5;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
    scene3D.add(light);
    */
    /*
    sceneDirectionalLight = new THREE.DirectionalLight(0xFFBBBB, 0.5);
    sceneDirectionalLight.position.set(2, 10, 6);
    sceneDirectionalLight.target.position.set(0, 0, 0);
    sceneDirectionalLight.castShadow = true;
    sceneDirectionalLight.shadowCameraNear = 0;
    sceneDirectionalLight.shadowCameraFar = 27;
    sceneDirectionalLight.shadowCameraRight = 15;
    sceneDirectionalLight.shadowCameraLeft = -15;
    sceneDirectionalLight.shadowCameraTop = 15;
    sceneDirectionalLight.shadowCameraBottom = -15;
    sceneDirectionalLight.shadowCameraVisible = true;
    sceneDirectionalLight.shadowBias = 0.005;
    sceneDirectionalLight.shadowDarkness = 0.4;
    sceneDirectionalLight.shadowMapWidth = 1024;
    sceneDirectionalLight.shadowMapHeight = 1024;
    */

    
    sceneDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sceneDirectionalLight.color.setHSL(0.1, 1, 0.95);
    sceneDirectionalLight.position.set(1, 1.8, 0.8); //.normalize();
    sceneDirectionalLight.target.position.set(0, 0, 0);
    sceneDirectionalLight.position.multiplyScalar(50);
    //sceneDirectionalLight.position.set(-1, 0, 0).normalize();
    sceneDirectionalLight.castShadow = true;
    sceneDirectionalLight.shadowMapWidth = 2048;
    sceneDirectionalLight.shadowMapHeight = 2048;
    var d = 15;
    sceneDirectionalLight.shadowCameraLeft = -d;
    sceneDirectionalLight.shadowCameraRight = d;
    sceneDirectionalLight.shadowCameraTop = d;
    sceneDirectionalLight.shadowCameraBottom = -d;
    sceneDirectionalLight.shadowCameraFar = 2000;
    sceneDirectionalLight.shadowBias = -0.0001;
    sceneDirectionalLight.shadowDarkness = 0.4;
    
    //sceneDirectionalLight.shadowCameraVisible = true;
    
    //scene3D.add(sceneDirectionalLight);
    

    sceneSpotLight = new THREE.SpotLight();
    sceneSpotLight.shadowCameraNear = 1; // keep near and far planes as tight as possible
    sceneSpotLight.shadowCameraFar = 38; // shadows not cast past the far plane
    //sceneSpotLight.shadowCameraVisible = true;
    sceneSpotLight.castShadow = true;
    sceneSpotLight.intensity = 1;
    sceneSpotLight.position.set(-4, 35, 4)
    //scene3D.add(sceneSpotLight);

    /*
    var frontLight  = new THREE.DirectionalLight('white', 1)
    frontLight.position.set(0.5, 0.5, 2).multiplyScalar(2)
    scene.add( frontLight )

    var backLight   = new THREE.DirectionalLight('white', 0.75)
    backLight.position.set(-0.5, -0.5, -2)
    scene.add( backLight )
    */

}

function initMenu(id,item) {

    if(RUNMODE == "database")
    {
        item = "php/objects.php?menu=" + item.split('/').shift();
    }else{
        item = "objects/" + item;
    }

    $.ajax(item,{
        //contentType: "json",
        //async: false,
        dataType: 'json',
        success: function(json){
            //var json = JSON.parse(data);
            var menu = $("#" + id + " .scroll");
            //var menu = $("#" + id + " .cssmenu > ul");
            menu.empty();
            $.each(json.menu, function() {
                menu.append(getMenuItem(this));
            });
            /*
            $("#" + id + " .scroll .cssmenu > ul > li > a").click(function(event) {
                menuItemClick(this);
            });
            */
            $("#" + id + " .cssmenu > ul > li > a").click(function(event) {
                menuItemClick(this);
            });
        },
        error: function(xhr, textStatus, errorThrown){
			alertify.alert("Menu (" + item + ") Loading Error");
		}
    });
    
    correctMenuHeight();

    $("#" + id).show();
    //toggleRight('menuRight', true);
}

function insertSceneObject(path) {

    if(RUNMODE == "database")
    {
        //console.log("resolve id (" + path + ") -> url");

        /*
        $.get("/php/objects.php?id=" + path, function(data) {
        	console.log(data);
           	path = data;
        });
        */

        path = "php/objects.php?id=" + path;

        $.ajax({
        	type: 'GET',
            dataType : 'json',
          	url: path,
            async: false, //important
            success: function (data) {
                //console.log(data.file);
                path = data.file;
            },
            error: function(xhr, textStatus, errorThrown){
				alertify.alert("Database Error - 3D Object Not Found");
			}
        });
    }

    var x = 0;
    var z = 0;
    var o = 0;

    //TODO: feed through undo/redo function first
    if(SCENE == 'house')
    {
    	o = scene3DHouseContainer.children.length-1;
        x = 0;
        z = 0;
        try{
            x = scene3DHouseContainer.children[o].position.x + scene3DHouseContainer.children[o].geometry.boundingBox.max.x;
            z = scene3DHouseContainer.children[o].position.z + scene3DHouseContainer.children[o].geometry.boundingBox.max.z;
        }catch(e){}
        //console.log(path + " x:" + x + " z:" + z);
        open3DModel(path, scene3DHouseContainer, x, 0, z, 0, 0, 1, true, null);
    }
    else  if(SCENE == 'floor')
    {
    	o = scene3DFloorFurnitureContainer[FLOOR].children.length-1;
    	x = scene3DFloorFurnitureContainer[FLOOR].children[o].position.x + scene3DFloorFurnitureContainer[FLOOR].children[o].geometry.boundingBox.max.x;
        z = scene3DFloorFurnitureContainer[FLOOR].children[o].position.z + scene3DFloorFurnitureContainer[FLOOR].children[o].geometry.boundingBox.max.z;
        open3DModel(path, scene3DFloorFurnitureContainer[FLOOR], x, 0, z, 0, 0, 1, true, null);
    }
}

function showRightObjectMenu(path) {

    //console.log("Get from " + path + "/index.json");
  
    if(RUNMODE == "database")
    {
        path = "php/objects.php?objects=" + path; //item.split('/').shift();
    }else{
        path = "objects/" + path + '/index.json';
    }

    var menu = $("#menuRightObjects .scroll");
    //var menu = $("#menuRightObjects .cssmenu > ul");
    //menu.append("<div id='menuLoading' style='position:relative;left:0;top:0;width:100%;height:100%;background-color:grey;opacity:0.5'>loading...</div>");

    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRight2D').hide();
    $('#menuRightObjects').show();

     $.ajax(path,{
        dataType: 'json',
        success: function(json){
            var empty = "<li><span style='margin-let:auto;text-align:center;padding:20px'>No Objects In This Category</span></li>";
            menu.empty();
            try
            {
                //var json = JSON.parse(binary.read('string'));
                $.each(json.menu, function() {
                    if(Object.keys(json.menu).length > 0)
                    {

                        //menu.append(getMenuObjectItem(this));
                        getMenuObjectItem(menu,this);
                    }
                    else
                    {
                        menu.append(empty); //database empty
                    }
                });
            }
            catch(e)
            {
                menu.append(empty); //local no json
            }

            //$('.bttrlazyloading').trigger('bttrlazyloading.load');

            //$("#menuRight3DHouse .scroll .cssmenu > ul > li > a").click(function(event) {
            //    menuItemClick(this);
            //});
        }
    });

    //$('#menuLoading').remove();

    //correctMenuHeight();
}

function CalculateCutawayGeometry() {
  
    alertify.confirm("This feature is experimental and may not work properly. Continue?", function (e) {
        if (e) {

            var geometry = new THREE.BoxGeometry(20, 16, 1);
            var mesh = new THREE.Mesh(geometry);
            
            /*
            mesh.position.z = scene3DRoofContainer.children[0].position.z + scene3DRoofContainer.children[0].geometry.boundingBox.max.z / 2 ;

            var SliceBSP = new ThreeBSP(mesh);
            var RoofBSP = new ThreeBSP(scene3DRoofContainer.children[0].geometry);
            var HouseBSP = new ThreeBSP(scene3DHouseContainer.children[0].geometry);

            var CutawayBSP = RoofBSP.subtract(SliceBSP);
            var result = CutawayBSP.toMesh(new THREE.MeshLambertMaterial({shading: THREE.SmoothShading}));
            //result.geometry.computeVertexNormals();
            scene3DRoofContainer.children[0].geometry = result.geometry;
            
            CutawayBSP = HouseBSP.subtract(SliceBSP);
            result = CutawayBSP.toMesh(new THREE.MeshLambertMaterial({shading: THREE.SmoothShading}));
            //result.geometry.computeVertexNormals();
            scene3DHouseContainer.children[0].geometry = result.geometry;
            */
        //} else { // user clicked "cancel"
        }
    });
}

function showRightCatalogMenu() {

    if (SCENE == 'house') {
        $('#menuRight3DHouse').show();
    } else if (SCENE == 'floor') {
        $('#menuRight3DFloor').show();
    }

    $('#menuRightObjects').hide();
    $("#menuRightObjects .scroll").empty(); //empty ahead of time (faster)

    //correctMenuHeight();
}

function scene2DWallMeasurementExternal() {

}

function scene2DWallMeasurementInternal() {

}

function animatePanorama() {

    if (rendererPanorama instanceof THREE.WebGLRenderer)
    {
        requestAnimationID = window.requestAnimationFrame(animatePanorama);

        var delta = clock.getDelta();

        mouse.x +=  0.1;
        mouse.y = Math.max( - 85, Math.min(85, mouse.y));
        var phi = THREE.Math.degToRad(90 - mouse.y);
        var theta = THREE.Math.degToRad( mouse.x );

        target.x = Math.sin( phi ) * Math.cos( theta );
        target.y = Math.cos( phi );
        target.z = Math.sin( phi ) * Math.sin( theta );

        camera3DPanorama.lookAt(target);
        //camera3DPanorama.position.copy(camera3DPanorama.target).negate(); // distortion
        
        rendererPanorama.render(scene3DPanorama, camera3DPanorama);
    }
    else
    {
        animate();
    }
}

function animateHouseRotate() {

    if(!SceneAnimate)
    {
        animate();
        return;
    }

    requestAnimationID = window.requestAnimationFrame(animateHouseRotate);

    var delta = clock.getDelta();

    var rotateSpeed = delta * 0.19; //.005; //Date.now() * 0.0001; //.01;
    //var rotateSpeed = .005;
    //if (keyboard.pressed("left")){ 
    
    var x = camera3D.position.x,
        z = camera3D.position.z;

    var cosratio = Math.cos(rotateSpeed),
        sinratio = Math.sin(rotateSpeed);

    camera3D.position.x = x * cosratio + z * sinratio;
    camera3D.position.z = z * cosratio - x * sinratio;

    //} else if (keyboard.pressed("right")){
    //camera3D.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
    //camera3D.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
    //}

    //camera3D.position.x = Math.cos(rotateSpeed) * 100;
    //camera3D.position.z = Math.sin(rotateSpeed) * 100;
    //camera3D.position.y = 60;

    camera3D.lookAt(scene3D.position);

    animateClouds();

    //controls3D.update(delta);
    renderer.render(scene3D, camera3D);

    //TWEEN.update();
}

function animateFloor()
{
    requestAnimationID = window.requestAnimationFrame(animateFloor);
    //var delta = clock.getDelta();
    /*
    move the CubeCamera to the position of the object that has a reflective surface,
    "take a picture" in each direction and apply it to the surface.
    need to hide surface before and after so that it does not "get in the way" of the camera
    */
    //camera3DMirrorReflection.visible = false;
    //camera3DMirrorReflection.updateCubeMap(renderer, scene3D);
    //camera3DMirrorReflection.visible = true;
    //controls3DFloor.update();

    sceneSpotLight.visible = false; //Do not reflect light
    //scene3DFloorGroundContainer.children[0].visible = false; //because refrection camera is below the floor
    //scene3D.remove(scene3DFloorGroundContainer); //because refrection camera is below the floor

    //camera3DMirrorReflection.updateCubeMap(renderer, scene3D); //capture the reflection

    //sceneSpotLight.visible = true;
    //cene3D.add(scene3DFloorGroundContainer);
    //scene3DFloorGroundContainer.children[0].visible = true;

    //particlePivot.tick(delta);
    controls3D.update();

    //renderer.clear();
    renderer.render( scene3D, camera3D );
    /*
    if(leftButtonDown){

        renderer.render( scene3D, camera3D );
    }else{
        composer.render(delta);
    }
    */
    TWEEN.update();
}

function animateLandscape()
{
    requestAnimationID = window.requestAnimationFrame(animateLandscape);

    //var delta = clock.getDelta(); //have to call this before getElapsedTime()
    //var time = clock.getElapsedTime();

    //terrain3DMaterial.map = terrain3D.getSculptDisplayTexture();
    if(controls3D.enabled && leftButtonDown && TOOL3DLANDSCAPE == "rotate")
        controls3D.update();

    //renderer.autoClear = false;
    //renderer.clear();
    //terrain3D.update(delta);
    terrain3D.water.material.uniforms.time.value = new Date().getTime() % 10000;

    renderer.render(scene3D, camera3D);
    //TWEEN.update();
}

function renderSunlight()
{
    if ( options.sunlight ) {

        var sunPosition = new THREE.Vector3( 0, 10, -10 );
        var materialDepth = new THREE.MeshDepthMaterial();
        var screenSpacePosition = new THREE.Vector3();

        // Find the screenspace position of the sun

        screenSpacePosition.copy(sunPosition).project(camera3D);

        screenSpacePosition.x = ( screenSpacePosition.x + 1 );// / 2;
        screenSpacePosition.y = ( screenSpacePosition.y + 1 );// / 2;

        // Give it to the god-ray and sun shaders

        sunlight.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
        sunlight.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

        sunlight.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
        sunlight.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

        // -- Draw sky and sun --

        // Clear colors and depths, will clear to sky color

        renderer.clearTarget( sunlight.rtTextureColors, true, true, false );

        // Sun render. Runs a shader that gives a brightness based on the screen
        // space distance to the sun. Not very efficient, so i make a scissor
        // rectangle around the suns position to avoid rendering surrounding pixels.

        var sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
        var sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

        screenSpacePosition.x *= window.innerWidth;
        screenSpacePosition.y *= window.innerHeight;

        renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
        renderer.enableScissorTest( true );

        sunlight.godraysFakeSunUniforms[ "fAspect" ].value = window.innerWidth / window.innerHeight;

        sunlight.scene.overrideMaterial = sunlight.materialGodraysFakeSun;
        renderer.render( sunlight.scene, sunlight.camera, sunlight.rtTextureColors );

        renderer.enableScissorTest( false );

        // -- Draw scene objects --

        // Colors
        scene3D.overrideMaterial = null;
        renderer.render( scene3D, camera3D, sunlight.rtTextureColors );

        // Depth
        scene3D.overrideMaterial = materialDepth;
        renderer.render( scene3D, camera3D, sunlight.rtTextureDepth, true );

        // -- Render god-rays --

        // Maximum length of god-rays (in texture space [0,1]X[0,1])
        var filterLen = 1.0;

        // Samples taken by filter
        var TAPS_PER_PASS = 6.0;

        // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
        // would start with a small filter support and grow to large. however
        // the large-to-small order produces less objectionable aliasing artifacts that
        // appear as a glimmer along the length of the beams

        // pass 1 - render into first ping-pong target

        var pass = 1.0;
        var stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        sunlight.godrayGenUniforms[ "fStepSize" ].value = stepLen;
        sunlight.godrayGenUniforms[ "tInput" ].value = sunlight.rtTextureDepth;

        sunlight.scene.overrideMaterial = sunlight.materialGodraysGenerate;

        renderer.render( sunlight.scene, sunlight.camera, sunlight.rtTextureGodRays2 );

        // pass 2 - render into second ping-pong target

        pass = 2.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        sunlight.godrayGenUniforms[ "fStepSize" ].value = stepLen;
        sunlight.godrayGenUniforms[ "tInput" ].value = sunlight.rtTextureGodRays2;

        renderer.render( sunlight.scene, sunlight.camera, sunlight.rtTextureGodRays1  );

        // pass 3 - 1st RT

        pass = 3.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        sunlight.godrayGenUniforms[ "fStepSize" ].value = stepLen;
        sunlight.godrayGenUniforms[ "tInput" ].value = sunlight.rtTextureGodRays1;

        renderer.render( sunlight.scene, sunlight.camera , sunlight.rtTextureGodRays2  );

        // final pass - composite god-rays onto colors

        sunlight.godrayCombineUniforms["tColors"].value = sunlight.rtTextureColors;
        sunlight.godrayCombineUniforms["tGodRays"].value = sunlight.rtTextureGodRays2;

        sunlight.scene.overrideMaterial = sunlight.materialGodraysCombine;

        renderer.render( sunlight.scene, sunlight.camera );
        sunlight.scene.overrideMaterial = null;

    } else {
        //renderer.clear();
        renderer.render( scene3D, camera3D );
        /*
        if(leftButtonDown){
            renderer.render( scene3D, camera3D );
        }else{
            composer.render();
        }
        */
    }
}

function animateClouds()
{
    /*
    if (DAY == 'day') {
        weatherSkyDayMesh.rotation.y = camera3D.rotation.y; //spiral
        weatherSkyDayMesh.rotation.z = camera3D.rotation.z; //side-to-side
        weatherSkyDayMesh.rotation.x = camera3D.rotation.x; //top
        weatherSkyDayMesh.position.x = camera3D.position.x / 1.5;
    } else if (DAY == 'night') {
        weatherSkyNightMesh.rotation.y = camera3D.rotation.y; //spiral
        weatherSkyNightMesh.rotation.z = camera3D.rotation.z; //side-to-side
        weatherSkyNightMesh.rotation.x = camera3D.rotation.x; //top
        weatherSkyNightMesh.position.x = camera3D.position.x / 1.5;
    }
    */

    //if(weatherSkyCloudsMesh){
        weatherSkyCloudsMesh.rotation.y = camera3D.rotation.y; //spiral
        weatherSkyCloudsMesh.rotation.z = camera3D.rotation.z; //side-to-side
        weatherSkyCloudsMesh.rotation.x = camera3D.rotation.x; //top
        weatherSkyCloudsMesh.position.x = camera3D.position.x / 1.5;
    //}

    //weatherSkyDayMesh.position.z = camera3D.position.z;
    //weatherSkyDayMesh.rotation = camera3D.rotation;

    //weatherSkyDayMesh.position.y = (Math.random() - 0.5) * 0.2;
    //weatherSkyDayMesh.position.z = (Math.random() - 0.5) * 5.0;
    //weatherSkyDayMesh.rotation = Math.random() * Math.PI;
    //weatherSkyDayMesh.scale.multiplyScalar(1 / 30 * (Math.random() * 0.4 + 0.8))
    // object3d.color.setHex( 0xC0C0C0 + 0x010101*Math.floor(255*(Math.random()*0.1)) );
}

function animateHouse()
{
    /*
    if (SceneAnimate){
        animate();
        return;
    }
    */
    requestAnimationID = window.requestAnimationFrame(animateHouse);

    //var delta = clock.getDelta();
    
    //if (controls3D instanceof THREE.OrbitControls){
        //particlePivot.tick(delta);
        //particleWeather.tick(delta);

    animateClouds();

        /*
        for (var a in animation) {
            a.update(delta * 0.8);
        }
        */
    //}
    
    controls3D.update();

    //renderSunlight(); //renderer.render(scene3D, camera3D);
    /*
    if(getScreenshotData == true){
        getScreenshotData = false;
        window.open(renderer.domElement.toDataURL('image/png'), 'Final');
    }
    */
    
    //renderer.clear();
    renderer.render( scene3D, camera3D );
    rendererCube.render(scene3DCube, camera3DCube);

    TWEEN.update();

    /*
    var timer = Date.now() * 0.0005;
    camera.position.x = Math.cos( timer ) * 10;
    camera.position.y = 2;
    camera.position.z = Math.sin( timer ) * 10;
    camera.lookAt( scene.position );
    particleLight.position.x = Math.sin( timer * 4 ) * 3009;
    particleLight.position.y = Math.cos( timer * 5 ) * 4000;
    particleLight.position.z = Math.cos( timer * 4 ) * 3009;
    */

    //} else if (scene2D.visible) {
    //controls2D.update();
    //renderer.render(scene2D, camera2D);
}

function animateRoof()
{
    requestAnimationID = window.requestAnimationFrame(animateRoof);
    // setViewport parameters:
    //  lower_left_x, lower_left_y, viewport_width, viewport_height

    //renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    //renderer.clear();

    // upper left corner
    renderer.setViewport(0, 0.5 * window.innerHeight, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
    renderer.render(scene3D, camera3DQuad[0]); //top

    // upper right corner
    renderer.setViewport(0.5 * window.innerWidth, 0.5 * window.innerHeight, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
    renderer.render(scene3D, camera3DQuad[1]); //front 

    // lower left corner
    renderer.setViewport(0, 0, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
    //camera3DQuad[2].updateProjectionMatrix();
    renderer.render(scene3D, camera3DQuad[2]); //side

    // lower right corner
    renderer.setViewport(0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
    //renderer.setScissor(0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
    //renderer.enableScissorTest(true);
    //camera3DQuad[3].updateProjectionMatrix();

    renderer.render(scene3D, camera3DQuad[3]); //perspective
}

function animateStop()
{
    //http://stackoverflow.com/questions/10735922/how-to-stop-a-requestanimationframe-recursion-loop
    if(requestAnimationID)
    {
        window.cancelAnimationFrame(requestAnimationID);
        requestId = undefined;
        SceneAnimate = false;
    }
}

function animate()
{
    //Look into Threading this with WebWorkers > http://www.html5rocks.com/en/tutorials/workers/basics/
    console.log("animate");

    animateStop();

    if (SCENE == 'house')
    {
        if (SceneAnimate)
        {
            TWEEN.removeAll(); //avoid any tween checks whilre rotating (faster)
            //camera3D.position.set(0, 6, 20);
            animateHouseRotate();
        }else{
            animateHouse();
        }
    }
    else if (SCENE == 'floor')
    {
        animateFloor();
    }
    else if (SCENE == 'landscape' || SCENE == 'floorlevel')
    {
        animateLandscape();
    }
    else if (SCENE == 'roof')
    {
        animateRoof();
    }
}

function webAddNewFloor() {
    
    if($("#webAddNewFloor").val())
    {
        scene3DNewFloor($("#webAddNewFloor").val());

        var a = "<a href='#' onclick='camera3DFloorFlyIn(" + scene3DFloorFurnitureContainer.length + ")'><span>" + $("#webAddNewFloor").val() + "</span></a>";
        var item = $("<li>").append(a);
        $("#menuLeft3DHouseFloorList").append(item);
    }
}

function webItemListGenerate() {

    var list = $("#webItemListGenerate");
    list.empty();

    for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
        
        console.log(scene3DFloorFurnitureContainer[i].name)

        for (var c = 0; c < scene3DFloorFurnitureContainer[i].children.length; c++) {

            console.log(scene3DFloorFurnitureContainer[i].children[c].children[0].name);
        }
    }

    for (var i = 0; i < scene3DHouseContainer.children.length; i++) {

        console.log(scene3DHouseContainer.children[i].children[0].name);
    }
}

function fileSelect(action) {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {

        $("#fileInput").click();

        if (action == '2ddraftplan') {

            $('#fileInput').bind('change', handleFile2DImageSelect);

        }else if (action == '2dautocad') {

            $('#fileInput').bind('change', handleFile2DAutoCADConvert);

        } else if (action == '3dobject') {

            //Determine if local or submit through webserver
            $('#fileInput').bind('change', handleFile3DObjectSelect); //If local makesure it is located in ./objects folder and images in Textures)
        }
        //document.getElementById('fileselect').addEventListener('change', handleFileSelect, false);
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

function errorHandler(event) {
    switch (event.target.error.code) {
        case event.target.error.NOT_FOUND_ERR:
            alert('File Not Found!');
            break;
        case event.target.error.NOT_READABLE_ERR:
            alert('File is not readable');
            break;
        case event.target.error.ABORT_ERR:
            break; // noop
        default:
            alert('An error occurred reading this file.');
    };
    //fileReader.abort();
}

/*
function updateProgress(event) {
    // evt is an ProgressEvent.
    if (event.lengthComputable) {
        var percentLoaded = Math.round((event.loaded / event.total) * 100);
        // Increase the progress bar length.
        if (percentLoaded < 100) {
            //progress.style.width = percentLoaded + '%';
            //progress.textContent = percentLoaded + '%';
        }
    }
}
*/

function ajaxBeforeSubmit() {
    var fsize = $('#fileInput')[0].files[0].size; //get file size
    var ftype = $('#fileInput')[0].files[0].type; // get file type

    //allow file types
    switch (ftype) {
        case 'application/zip':
        case 'application/octet-stream':
            break;
        default:
            alert(ftype + " is unsupported file type!");
            return false
    }

    //Allowed file size is less than 10 MB (1048576 = 1 mb)
    if (fsize > 10485760) {
        alert("<b>" + fsize + "</b> Too big file! <br />File is too big, it should be less than 5 MB.");
        return false
    }
}

/*
function ajaxAfterSuccess()
{
	$('#submit-btn').show(); //hide submit button
	$('#loading-img').hide(); //hide submit button

}
function ajaxProgress(event, position, total, percentComplete)
{
    //Progress bar
    $('#progressbox').show();
    $('#progressbar').width(percentComplete + '%') //update progressbar percent complete
    $('#statustxt').html(percentComplete + '%'); //update status text
    if(percentComplete>50)
    {
        $('#statustxt').css('color','#000'); //change status text to white after 50%
    }
}
*/

//TODO: optimize there two functions into one
function handleFile3DObjectSelect(event) {
    //console.log("catch file");
    switch (event.target.files[0].type) {
        case 'application/zip': //Zip root folder structure should contain .js and textures in '/Textures' folder (assuming have proper texture paths)
        case 'application/octet-stream':
            var options = {
                //target: '#output', // target element(s) to be updated with server response 
                beforeSubmit: ajaxBeforeSubmit, // pre-submit callback
                //uploadProgress: ajaxProgress,
                //success:       ajaxAfterSuccess,  // post-submit callback 
                resetForm: true // reset the form after successful submit 
            };

            $('#uploadForm').submit(function() {
                $(this).ajaxSubmit(options);
                return false; // return false to prevent standard browser submit and page navigation 
            });
            break;
        case 'application/x-javascript': //Security Reason local load can only load string file (JSON,DAE,OBJ) content but no Textures or Binary extentions
            fileReader = new FileReader();
            fileReader.onerror = errorHandler;
            //fileReader.onprogress = updateProgress;

            fileReader.onloadstart = function(e) {
                //TODO: show indicator, some 3D objects take time to load
            };

            fileReader.onload = function(e) {
                console.log("Load File: " + $('#fileInput').value + ":" + event.target.files[0].name)
                openScene(e.target.result);
            }

            //fileReader.readAsDataURL(event.target.files[0]);
            //fileReader.readAsBinaryString(event.target.files[0]);
            fileReader.readAsText(file);
            break;
        default:
            alert("file type should be .js, .json or .zip");
            return false;
    }
}

function handleFile2DAutoCADConvert(event) {

    fileReader = new FileReader();
    fileReader.onerror = errorHandler;
   
    fileReader.onload = function(e) {
        var parser = new DXFParser(e.target.result);
        console.log(parser);
    }
    fileReader.readAsText(event.target.files[0]);
    //fileReader.readAsDataURL(event.target.files[0]);

    $('#fileInput').unbind('change', handleFile2DAutoCADConvert);
}

function handleFile2DImageSelect(event) {

    if (!event.target.files[0].type.match('image.*')) {
        alert('Currently only photos are supported');
        return;
    }

    fileReader = new FileReader();
    fileReader.onerror = errorHandler;
    //fileReader.onprogress = updateProgress;

    fileReader.onabort = function(e) {
        alert('File read cancelled');
    };

    /*
	fileReader.onloadstart = function(e) {
	};
	*/

    fileReader.onload = function(e) {

        var img = new Image();
        img.src = e.target.result;

        scene2DFloorDraftPlanImage[FLOOR] = new fabric.Image(img, {
            top: 1,
            left: 1,
            width: window.innerWidth,
            height: window.innerHeight,
            opacity: 0.6,
            selectable: false
        });

        scene2D.add(scene2DFloorDraftPlanImage[FLOOR]);
        scene2D.sendToBack(scene2DFloorDraftPlanImage[FLOOR]);
        scene2D.renderAll();
    }

    // Read image file as a binary string.
    fileReader.readAsDataURL(event.target.files[0]);
    //fileReader.readAsBinaryString(event.target.files[0]);

    $('#fileInput').unbind('change', handleFile2DImageSelect);
}
/*
box.on("dragend", function(){
    snaptogrid(box);
  });
*/
function snaptogrid(object) {
    object.x = Math.floor(object.x / 100) * 100 + 50;
    object.y = Math.floor(object.y / 100) * 100 + 50;
}

function toggleTextureSelect() {

    if ($('#WebGLTextureSelect').is(':visible'))
    {
        $('#WebGLTextureSelect').hide();
        $('#WebGLColorWheelSelect').hide();
    }
    else
    {
    	$('#WebGLTextureSelect').empty();

    	if (SelectedWall != null)
	    {
	    	var scroll =  $("<div>", {class:"scroll","data-ui":"jscroll-default",style:"width:100%;height:80px"});
    		var list =  $("<div>", {class:"objectItem",style:"width:100px;height:64px"});

    		var item = $("<a>", {href:"#"}).append($("<img>", {id:"test", src:"objects/Wall/Textures/W2367.jpg"}));
    		list.append(item);

            item = $("<a>", {href:"#"}).append($("<img>", {id:"test", src:"objects/Wall/Textures/W3465.jpg"}));
    		list.append(item);

    		$('#WebGLTextureSelect').append(scroll.append(list));
	    }

        $('#WebGLTextureSelect').show();

        if (SelectedWall != null)
        {
            $('#WebGLColorWheelSelect').show();
        }
    }
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

$(document).ready(function() {

    /*
     $.ajax("objects/Platform/floorplan1.dxf",{
            contentType: "application/text",
            beforeSend: function (req) {
              req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
            },
            success: function(data){
                console.log(data);
                var parser = new DXFParser(data);
                console.log(parser);
            },
            error: function(xhr, textStatus, errorThrown){
                alertify.alert("DXF (" + js + ") Loading Error");
            }
        });
    */
  
    //wireframe = new Wireframe();
    //wireframe.build(parser);

    /* https://dribbble.com/shots/872582-Circular-Menu */
    var numberOfIcons = 8;
    var offsetAngleDegress = 360/numberOfIcons;
    var offsetAngle = offsetAngleDegress * Math.PI / 180;
    var circleOffset = $("#WebGLInteractiveMenu").width()/2;
    var tooltips = ["Move Horizontaly", "Info", "Duplicate", "Resize", "Textures", "Rotate", "Remove", "Object Notes"];
    var actions = ["enableTransformControls('translate')", "", "", "enableTransformControls('scale')", "toggleTextureSelect()", "enableTransformControls('rotate')", "scene3DObjectSelectRemove()", "camera3DNoteAdd()"];

    var $d = $("<div class='rect'></div>").hide().appendTo("body");
    var iconOffset = $(".rect").width()/2;
    $d.remove();

    for(var i=0; i<numberOfIcons; i++)
    {
        var index = i+1;
      
        $("#WebGLInteractiveMenu").append('<div class="rect tooltip-top" title="' + tooltips[i] + '" id="icn'+ index +'" onclick="' + actions[i] + '"></div>');
       
        var x = Math.cos((offsetAngle * i) - (Math.PI/2));
        var y = Math.sin((-offsetAngle * i)+ (Math.PI/2));
        //console.log(offsetAngle *i * 180/Math.PI,x, y);

        var dX = (circleOffset * x) + circleOffset - iconOffset;
        var dY = (circleOffset * y) + circleOffset - iconOffset;

        //console.log(circleOffset+iconOffset);
        
        $("#icn" + index).css({"background-image": 'url("images/hicn' + index + '.png")', "-webkit-animation-delay": "2s", "animation-delay": "2s"});
        $("#icn" + index).animate({"left":dX,"bottom":dY}, "slow");

        //console.log('url("icn' + index + '.png")');
    }

    $("#icn1").addClass("active");

    // add click handler to all circles
    $('.rect').click(function(event)
    {
        event.preventDefault();
        $('.active').removeClass("active");
        $(this).addClass("active");

        var a = (Number($(this).attr("id").substr(3))-1)*offsetAngleDegress;
        /* $('#rotateSelector').css({"transform":"rotate(" + a + "deg)", "-webkit-transform":"rotate(" + a + "deg)"}); */
        /* $('#rotateSelector').css({"transform":"rotate3d(0, 0, 1, " + a + "deg)", "-webkit-transform":"rotate3d(0, 0, 1, " + a + "deg)", "-o-transform":"rotate(" + a + "deg)", "-moz-transform":"rotate3d(0, 0, 1, " + a + "deg)"}); */
        
        //console.log(a); 
    });
    //=====================================

    $('.tooltip-share-menu').tooltipster({
        interactive:true,
        content: $('<a href="#" onclick="" class="hi-icon icon-html tooltip" title="Embed 3D Scene in Your Website" style="color:white"></a><br/><a href="#" class="hi-icon icon-print" style="color:white"></a><br/><a href="#" class="hi-icon icon-email" style="color:white"></a>')
    });

    $('.tooltip-save-menu').tooltipster({
                interactive:true,
          content: $('<a href="#openLogin" onclick="saveScene(true);" class="hi-icon icon-earth" style="color:white"></a><br/><a href="#openSaving" onclick="saveScene(false);" class="hi-icon icon-usb" style="color:white"></a>')
    });

    $('.tooltip-open-menu').tooltipster({
                interactive:true,
          content: $('<a href="#openLogin" onclick="saveScene(true);" class="hi-icon icon-earth" style="color:white"></a><br/><a href="#openSaving" onclick="fileSelect(\'opendesign\')" class="hi-icon icon-usb" style="color:white"></a>')
    });

    $('.tooltip-tools-menu').tooltipster({
                interactive:true,
          content: $('<a href="#" onclick="makeScreenshot()" class="hi-icon icon-screenshot" style="color:white"></a><br/><a href="#" onclick="screenfull.request(document.documentElement)" class="hi-icon icon-expand" style="color:white"></a>')
    });

    $('.tooltip').tooltipster({
        animation: 'fade',
        delay: 200,
        theme: 'tooltipster-default',
        touchDevices: false,
        trigger: 'hover',
        position: 'bottom',
        contentAsHTML: true
    });

    $('#menu2DTools').tooltipster({
        theme: 'tooltipster-light',
        trigger: 'custom',
        touchDevices: true,
        //delay: 200,
        interactive:true,
        contentAsHTML: true,
        content: ''
    });

    //$('#dragElement').drags();

    $('.tooltip-right').tooltipster({
        animation: 'fade',
        delay: 200,
        theme: 'tooltipster-default',
        touchDevices: false,
        trigger: 'hover',
        position: 'right'
    });
    $('.tooltip-top').tooltipster({
        animation: 'fade',
        delay: 200,
        theme: 'tooltipster-default',
        touchDevices: false,
        trigger: 'hover',
        position: 'top',
        contentAsHTML: true
    });

    $('.cssmenu ul ul li:odd').addClass('odd');
    $('.cssmenu ul ul li:even').addClass('even');
    $('.cssmenu > ul > li > a').click(function(event) {
        menuItemClick(this);
    });

    //$(".mouseover").editable("php/echo.php", { indicator: "<img src='img/indicator.gif'>", tooltip: "Move mouseover to edit...", event: "mouseover", style  : "inherit" });      
    $("#menuTop p").click(function() {
        $(this).hide().after('<input type="text" class="editP" value="' + $(this).html() + '" size="10" />');
        $('.editP').focus();
    });
    $('.editP').bind('blur', function() {
        $(this).hide().prev('#menuTop p').html($(this).val()).show();
    });
    stroll.bind('.cssmenu ul');
});