/*
WebGL HousePlanner v 1.0
Preview: http://houseplanner.iroot.ca
Source Code: https://github.com/poofik/webgl-houseplanner

TODO:
- [difficulty: 10/10 progress: 10%] Finish 2D floor plan gyometry drafting
- [difficulty: 3/10  progress: 90%] 2D floor plan select and overlay external draft image
- [difficulty: 8/10  progress: 10%] Toolbar edit functions for 2D floor plans
- [difficulty: 9/10  progress: 25%] Make converter function to "extrude" 2D into 3D walls
- [difficulty: 6/10  progress: 10%] Make front walls 80% transparent in 3D rotation
- [difficulty: 8/10  progress: 50%] 3D movable objects and collision detection
- [difficulty: 9/10  progress: 10%] 3D menu objects draggable with "pop-up" or star burst effect
- [difficulty: 2/10  progress: 90%] 3D objects sub-edit menu (textures/delete/duplicate)
- [difficulty: 2/10  progress: 60%] Categorize and populate 3D Menu items
- [difficulty: 8/10  progress: 20%] 3D Menu functions for draggable objects
- [difficulty: 5/10  progress: 50%] 3D Floor ground base glass reflective
- [difficulty: 6/10  progress: 80%] 3D Exterior View ability to select floors (+ flying-in animationeffect)
- [difficulty: 6/10  progress: 0%]  Keep history and implement Undo/Redo
- [difficulty: 6/10  progress: 80%] Make House Ground editable - angle/terain/square
    http://cjcliffe.github.io/CubicVR.js/experiment/landscape_editor/landscape_edit_500m.html
    http://skeelogy.github.io/skarf.js/examples/skarf_trackThreejsScene.html
    http://danni-three.blogspot.ca/2013/09/threejs-heightmaps.html
    http://www.chandlerprall.com/webgl/terrain/
- [difficulty: 4/10  progress: 60%]  Ability to save scene 3D & 2D
- [difficulty: 5/10  progress: 1%]   Ability to open scene 3D & 2D
- [difficulty: 6/10  progress: 0%]   Keep history and implement Undo/Redo
- [difficulty: 6/10  progress: 98%]  3D Exterior View create night scene atmosphere with proper lights
- [difficulty: 8/10  progress: 100%] 3D Exterior View auto rotate-snap on ground angle
- [difficulty: 4/10  progress: 100%] Make a nice rainbow glow for 3D house exterior view - idea came after a 2 second glitch with video card :)
- [difficulty: 8/10  progress: 2%]   Implement room agmented reality  https://github.com/bhollis/aruco-marker
*/

//"use strict";

var scene3D; //ThreeJS Canvas
var scene3DCube; //ThreeJS Canvas
var scene3DPanorama; //ThreeJS Canvas
var scene2D; //FabricJS Canvas

var renderer;
var rendererCube;
var rendererPanorama;
var rendererMenu;

var scene3DRoofContainer; //Contains Roof Design
var scene3DHouseContainer; //Contains all Exterior 3D objects by floor (trees,fences)
var scene3DHouseGroundContainer; //Grass Ground - 1 object
var scene3DHouseFXContainer; //Visual Effects container (user not editable/animated) - fying bugs/birds/rainbows
var scene3DFloorGroundContainer; //Floor Ground - 1 object
var scene3DCutawayPlaneMesh; //Virtual mesh used to detect collisions "cut-aways" for front walls
var scene3DFloorLevelGroundContainer; //Floor Level arrengment Ground - 1 object
var scene3DFloorFurnitureContainer = []; //Three.js contains all Floor 3D objects by floor (sofas,tables)
var scene3DFloorOtherContainer = []; //Three.js contains all other objects, cameras, notes
var scene3DFloorMeasurementsContainer = []; //Three.js contains floor measurements: angles, wall size - lines & text (note: objects have their own measurement meshes)
var scene3DFloorWallContainer = []; //Three.js 3D Layer contains all walls by floor (Reason for multidymentional array -> unique wall coloring) - extracted from scene2DWallGeometry & scene2DWallDimentions
var scene3DFloorTileContainer = []; //Three.js 3D Layer contains floor mesh+textures (multiple floors by floor)
var scene2DFloorDraftPlanImage = []; //2D Image for plan tracing for multiple floors

var scene3DPivotPoint; // 3D rotational pivot point - 1 object
var scene3DNote; // Sticky note visual 3D effect - 1 object
var scene3DCubeMesh; // Orange cube for visual orientation

var sceneAmbientLight;
var sceneDirectionalLight;
var sceneSpotLight;
var sceneHemisphereLight;
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
var camera3DMirrorReflection;

var groundGrid;
var groundMesh;
//var glowMesh;

var skyMesh;
//var weatherSkyDayMesh;
//var weatherSkyNightMesh;
var weatherSkyGeometry;
var weatherSkyMaterial;
var weatherSkyMesh;
var weatherSkyRainbowMesh;

var SESSION = '';
var RUNMODE = 'local'; //database
var VIEWMODE = 'designer' //public
var RADIAN = Math.PI / 180;
var SceneAnimate = true;
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
var scene2DWallGeometry = []; //Multidymentional array, many floors have many walls and walls have many geomertry points
var scene2DWallMesh = []; //Fabric.js line data
var scene2DDrawLine; //Fabric.Line - used by mousedown/mousemove/mouseup
var scene2DWallDimentions = []; //Multidymentional array, contains real-life (visual) dimentions for scene2DWallGeometry [width,length,height,height-angle,angle]
var scene3DWallTexture; //Wall Default Texture

var scene2DWallRegularMaterial;
var scene2DWallRegularMaterialSelect;
var scene2DWallBearingMaterial;
var scene2DWallBearingMaterialSelect;

var animation = [];
var particlePivot;
var particlePivotEmitter;

var particleWeather;

//var particleClouds;
var mouse; //THREE.Vector2()
var touch; //THREE.Vector2()
var target; //THREE.Vector3();
var clock;
var _animate = 1; 
//var engine;
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

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent))
        {
            $('body').append(html + "<br/><br/>You are running Internet Explorer, the browser does not support WebGL, please install one of these popular browsers<br/><br/><a href='http://www.mozilla.org/en-US/firefox'><img src='images/firefox.png'/></a> <a href='http://www.google.ca/chrome'><img src='images/chrome.png'/></a></center></div>");
        }
        else if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent))
        {
            $('body').append(html + "<img src='images/firefox-webgl.png'/></center></div>");
        }
        else  if (/Version\/[\d\.]+.*Safari/.test(navigator.userAgent))
        {
            $('body').append(html + "<img src='images/safari-webgl.png'/></center></div>");
        }
        return;
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

    scene3D = new THREE.Scene();
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
        width: window.innerWidth,
        height: window.innerHeight
    });
    if (scene2D.freeDrawingBrush) {
        scene2D.freeDrawingBrush.name = "freedraw";
        scene2D.freeDrawingBrush.color = "#000";
        scene2D.freeDrawingBrush.width = 8; //parseInt(drawingLineWidthEl.value, 10) || 1;
        scene2D.freeDrawingBrush.shadowBlur = 0;
    }
    fabric.isTouchSupported = true;

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

    scene3DRoofContainer = new THREE.Object3D();
    scene3DHouseContainer = new THREE.Object3D();
    scene3DHouseGroundContainer = new THREE.Object3D();
    scene3DHouseFXContainer = new THREE.Object3D();
    scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DFloorLevelGroundContainer = new THREE.Object3D();

    //This allows for 3 floors -> MAKE THIS DYNAMIC! Array()?
    //==============================================
    for(var i=0; i<=2; i++)
    {
        scene3DFloorFurnitureContainer[i] = new THREE.Object3D();
        scene3DFloorOtherContainer[i] = new THREE.Object3D();
        scene3DFloorMeasurementsContainer[i] = new THREE.Object3D();
        scene3DFloorWallContainer[i] = new THREE.Object3D();
        scene3DFloorTileContainer[i] = new THREE.Object3D();

        scene2DWallGeometry[i] = new Array();
        scene2DWallDimentions[i] = new Array();
        scene2DWallMesh[i] = new Array();
    }
    //==============================================

    scene3DPivotPoint = new THREE.Object3D();

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

    geometry = new THREE.CubeGeometry( 15, 15, 3 ); //new THREE.PlaneGeometry(15, 15,3);
    geometry.computeBoundingBox();
    material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    scene3DCutawayPlaneMesh = new THREE.Mesh(geometry, material);
   
    //This is a true coolness factor (difficult to code, but visually stands out!)
    //============================================
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
        attributes: {
            displacement: { type: 'f', value: [] }
        },
        vertexShader: document.getElementById( 'groundVertexShader' ).textContent,
        fragmentShader: document.getElementById( 'groundFragmentShader' ).textContent,
        //fog: false,
        //lights: true
    });

    geometry = new THREE.PlaneGeometry( plots_x, plots_y, plots_x * plot_vertices, plots_y * plot_vertices)
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
        terrain3D.materials[0].attributes.displacement.value.push(0);
    }
    terrain3D.rotation.x = Degrees2Radians(-90);
    terrain3D.water = new THREE.Mesh(
        new THREE.PlaneGeometry( plots_x, plots_y, plots_x * plot_vertices, plots_y * plot_vertices ),
        new THREE.ShaderMaterial({
            uniforms: {
                water_level: { type: 'f', value: -1 },
                time: { type: 'f', value: 0 }
            },
            attributes: {
                displacement: { type: 'f', value: [] }
            },
            vertexShader: document.getElementById( 'waterVertexShader' ).textContent,
            fragmentShader: document.getElementById( 'waterFragmentShader' ).textContent,
            transparent: true
        })
    );
    terrain3D.water.dynamic = true;
    terrain3D.water.displacement =  terrain3D.water.material.attributes.displacement;
    for (var i = 0; i <  terrain3D.water.geometry.vertices.length; i++) {
        terrain3D.water.material.attributes.displacement.value.push(0);
    }
    terrain3D.water.position.z = -1;
    terrain3D.add(terrain3D.water);
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

    camera3DMirrorReflection = new THREE.CubeCamera(0.1, 10, 30);
    //camera3DMirrorReflection.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    camera3DMirrorReflection.renderTarget.width = camera3DMirrorReflection.renderTarget.height = 3;
    //camera3DMirrorReflection.position.y = -20;

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

    scene3DWallTexture = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/C0001.jpg');
    scene3DWallTexture.wrapS = THREE.RepeatWrapping;
    scene3DWallTexture.wrapT = THREE.RepeatWrapping;

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
    }), THREE.LinePieces);

    //scene3DCubeMesh = new THREE.Mesh(cubeG, material);
    scene3DCubeMesh.geometry.dynamic = true; //Changing face.color only works with geometry.dynamic = true


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
        vertexShader: document.getElementById('vs').textContent,
        fragmentShader: document.getElementById('fs').textContent,
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
    //THREE.GeometryUtils.merge(geometry, mesh);

    //scene2D.add(new THREE.GridHelper(100, 10));

    //A 1x1 Rectangle for Scale - Should Map to a 1x1 square of Three.js space
    //scene2D.fillStyle = "#FF0000";
    //scene2D.fillRect(0, 0, 1, 1);

    renderer = new THREE.WebGLRenderer({
        //devicePixelRatio: window.devicePixelRatio || 1,
        antialias: true,
        alpha: true,
        //clearColor: 0x34583e,
        //clearAlpha: 0.5
        //preserveDrawingBuffer: false
    });

    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;
    renderer.shadowMapSoft = true;
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

    rendererCube = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        //transparent: true,
        //preserveDrawingBuffer: false
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.setClearColor(0xffffff, 0);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapAutoUpdate = true;
    //renderer.shadowMapType = THREE.PCFSoftShadowMap; //THREE.PCFShadowMap; //THREE.BasicShadowMap;
    renderer.autoClear = false; //REQUIRED: for split screen
    renderer.sortObjects = false; //http://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
    //renderer.physicallyBasedShading = true;
    //renderer.sortObjects = false;
    document.getElementById('WebGLCanvas').appendChild(renderer.domElement);

    //Orientation Cube
    rendererCube.setSize(100, 100);
    //renderer.setClearColor(0xffffff, 1);

    document.getElementById('WebGLCubeCanvas').appendChild(rendererCube.domElement);

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
    /**
     * Provides requestAnimationFrame in a cross browser way.
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     */

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    window.cancelRequestAnimationFrame = (function() {
        return window.cancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout
    })();

    
    scene2D.on('mouse:down', function(event) {
        on2DMouseDown(event.e);
    });
    
    scene2D.on('mouse:move', function(event) {
        on2DMouseMove(event.e);
    });

    scene2D.on('mouse:up', function(event) {
        on2DMouseUp(event.e);
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
    
   	enableOrbitControls();

    //mycontrols.target = new THREE.Vector3(newx, newy, newz); //flyin effect?

    ///////////
    // STATS //
    ///////////

    // displays current and past frames per second attained by scene
    /*
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    containerWork.appendChild( stats.domElement );
    */

    //var wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ee00, wireframe: true, transparent: true } ); 

    /*
    var imagePrefix = "images/mountains-";
    var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );   
    
    var materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
            side: THREE.BackSide
        }));
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );
    */

    sceneNew();
    //scene3DSky();
    scene3DLight();
    
    selectMeasurement();

    $('#menuWeatherText').html("Sunny");
    $('#menuDayNightText').html("Day");

    show3DHouse();
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

function initPanorama(id,files,W,H)
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

    mouse = new THREE.Vector2();
    touch = new THREE.Vector2();

    var geometry = new THREE.BoxGeometry(512,512,512);
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
    var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(sides));
    scene3DPanorama.add(mesh);

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

    //High Resolution
    var textureloader = new THREE.TextureLoader();
    textureloader.load('panoramas/' + files + '/right.jpg', function (texture) { sides[0].map=texture });
    textureloader.load('panoramas/' + files + '/left.jpg', function (texture) { sides[1].map=texture });
    textureloader.load('panoramas/' + files + '/top.jpg', function (texture) { sides[2].map=texture });
    textureloader.load('panoramas/' + files + '/bottom.jpg', function (texture) { sides[3].map=texture });
    textureloader.load('panoramas/' + files + '/front.jpg', function (texture) { sides[4].map=texture });
    textureloader.load('panoramas/' + files + '/back.jpg', function (texture) {  sides[5].map = texture; document.getElementById(id).removeChild(spinner.el) });
    
    /*
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
    var material = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( 'textures/2294472375_24a3b8ef46_o.jpg' )
    } );
    mesh = new THREE.Mesh( geometry, material );
    scene3DPanorama.add(mesh);
    */

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

/*
function loadDAE(file, object, x, y, z, xaxis, yaxis, ratio) {

    loader.load('objects/dae/' + file, function(collada) {
        var dae = collada.scene;
        //var skin = collada.skins[ 0 ];
        dae.scale.x = dae.scale.y = dae.scale.z = 1;
        //dae.scale.x = dae.scale.y = dae.scale.z = 50;
        dae.updateMatrix();

        /
            var geometries = collada.dae.geometries;
            for(var propName in geometries){
                    if(geometries.hasOwnProperty(propName) && geometries[propName].mesh){
                    dae.geometry = geometries[propName].mesh.geometry3js;
                }
            }
        /

        var mesh = dae.children.filter(function(child) {
            return child instanceof THREE.Mesh;
        })[0];
        dae.geometry = mesh.geometry;

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.rotation.x = xaxis * Math.PI / 1000;
        mesh.rotation.y = yaxis * Math.PI / 1000;
        mesh.doubleSided = false;

        /
            if(xaxis > 0){
                 mesh.rotateOnAxis(new THREE.Vector3(0,1,0), xaxis * RADIAN);
            }
            if(yaxis > 0){
                 mesh.rotateOnAxis(new THREE.Vector3(1,0,0), yaxis * RADIAN);
            }
        /
        //scene3DHouseContainer.add(mesh);
        //object.add(mesh);
        object.add(dae);
    });
}
*/

function scene2DMakeWall(coords) {
    
    var line = new fabric.Line(coords, {
        fill: 'black',
        stroke: 'black',
        strokeWidth: 12,
        lockRotation: true,
        perPixelTargetFind: true,
        strokeLineCap: 'round',
        selectable: true
    });

    //Curved Walls !!! YEah!
    /*
    var line = new fabric.Path('M 0 0 Q 100, 100, 0, 0', { fill: '', strokeWidth: 12, stroke: 'black' });

    line.path[0][1] = 0;
    line.path[0][2] = 0;

    line.path[1][1] = 10; //curve left
    line.path[1][2] = 10; //curve right

    line.path[1][3] = coords[2]-coords[0];
    line.path[1][4] = coords[3]-coords[1];

    line.set({ left: coords[0], top: coords[1] });
    */
    
    //line.set({ fill: 'red', stroke: 'green', opacity: 0.5 });

   

    line.name = 'wall';

    /*
    line.toObject = function() {
        return {
            name: 'wall'
        };
    };
    */

    return line;
}

function scene2DMakeWallEdgeCircle(left, top, line1, line2, line3, line4) {

    var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666'
    });
    c.hasControls = c.hasBorders = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;
    c.line4 = line4;
    return c;
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
THREE.JSONLoader.prototype.loadJson = function(data, callback, texturePath) {
    var worker, scope = this;
    texturePath = texturePath ? texturePath : this.extractUrlBase(url);
    this.onLoadStart();
    var json = JSON.parse(data);
    //var json = jQuery.parseJSON(data);
    var result = this.parse(json, texturePath);
    callback(result.geometry, result.materials);
    this.onLoadComplete();
};
*/

function camera3DFloorFlyIn(floor)
{
	//TODO: Fly into a specific section of the room

	var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:10, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    var tween = new TWEEN.Tween(controls3D.target).to({x:0, y:0, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {

    	FLOOR = floor;
        show3DFloor();

    }).start();
}

function camera3DFloorEnter()
{
	camera3D.position.set(0, 10, 0);
	var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:10, z:12},1800).easing(TWEEN.Easing.Quadratic.InOut).start();
    var tween = new TWEEN.Tween(controls3D.target).to({x:0, y:0, z:0},1800).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DNoteAdd()
{
  //TODO: bring up 3d note up close and html form
}

function scene3DFloorInsertAR()
{
    if (typeof NyARRgbRaster_Canvas2D == 'undefined') $.getScript("js/JSARToolKit.js", function(data, textStatus, jqxhr) {
        
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

    var tween = new TWEEN.Tween(SelectedPicture.rotation).to({x:camera3D.rotation.x, y:camera3D.rotation.y, z:camera3D.rotation.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DPictureExit()
{
    disposePanorama('WebGLPanorama');

    var tween = new TWEEN.Tween(SelectedPicture.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    var tween = new TWEEN.Tween(SelectedPicture.rotation).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DNoteEnter()
{
    if (ViewNoteText == "")
        return;
    //camera3D.add(SelectedNote);

    var pLocal = new THREE.Vector3( 0, -0.5, -0.6 );
    var target = pLocal.applyMatrix4(camera3D.matrixWorld);

    var tween = new TWEEN.Tween(SelectedNote.position).to(target,2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
        $('#WebGLNote').show();
    }).start();
    var tween = new TWEEN.Tween(SelectedNote.rotation).to({x:camera3D.rotation.x, y:camera3D.rotation.y, z:camera3D.rotation.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DNoteExit()
{
    ViewNoteText = "";
    $('#WebGLNote').hide();
   
    //camera3D.remove(SelectedNote);
    var tween = new TWEEN.Tween(SelectedNote.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    var tween = new TWEEN.Tween(SelectedNote.rotation).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DHouseEnter()
{
	camera3D.position.set(0, 20, 0);
	//controls3D.target = new THREE.Vector3(0, 50, 0);
	var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:6, z:20},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    var tween = new TWEEN.Tween(controls3D.target).to({x:0, y:0, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
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
               var tween = new TWEEN.Tween(controls3D.target).to({x:0, y:1.5, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
               enableFirstPersonControls();
          }).start();
        }});
        $('.alertify-message').append($.parseHTML("<img src='images/wasd-keyboard.jpg' /><br/><br/>Use (W,A,S,D) or arrow keys to move."));
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

    scene3D.add(controls3D);
}

function enableOrbitControls()
{   
    /*
    if (controls3D instanceof THREE.OrbitControls) //do not cause error first-time
    {
        controls3D.enabled = false;
    }
    */
    controls3D = new THREE.OrbitControls(camera3D, renderer.domElement);
    controls3D.minDistance = 3;
    controls3D.maxDistance = 25; //Infinity;
    //controls3D.minPolarAngle = 0; // radians
    //controls3D.maxPolarAngle = Math.PI; // radians
    controls3D.maxPolarAngle = Math.PI / 2; //Don't let to go below the ground
    controls3D.target = new THREE.Vector3(0, 0, 0); //+ object.lookAT!
    controls3D.enabled = true;
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
	if (camera3DPositionCache != null && controls3D instanceof THREE.OrbitControls)
	{
		var tween = new TWEEN.Tween(camera3D.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
		//var tween = new TWEEN.Tween(controls3D.target).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
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

    var loader = new THREE.JSONLoader();

    var ext = js.split('.').pop();
    var textures = js.substring(0, js.lastIndexOf("/") + 1) + "Textures/";
    var data;

    //console.log("Textures:" + urlTextures);

    var callbackScene = function ( result ) {

        //scene3D = result.scene;

        result.scene.traverse(function (object) {

        if (object instanceof THREE.Mesh) { //object.material
            try
            {
                object.geometry.computeFaceNormals();
                object.geometry.computeVertexNormals();
                object.geometry.computeBoundingBox();
                //callback(object.geometry,object.material);
                    
                objectContainer.add(object);
            } catch (e) {
                //console.log("error catch");
            }
        }else if (object instanceof THREE.PointLight) {
            console.log("light found!");

            //pointLight = new THREE.PointLight( 0xffaa00 );
            //pointLight.position.set( 0, 0, 0 );
            scene3D.add( object );
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
    }

    var callback = function(geometry, materials) {
        /*
        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial({
            map: materials[0],
            envMap: camera3DMirrorReflection.renderTarget
        })); 
		*/
        //console.log(materials);

        //for (var i = 0; i < materials.length; i++) {

        //materials[i].map.wrapS = THREE.RepeatWrapping;
        //materials[i].map.wrapT = THREE.RepeatWrapping;
        //materials[i].map.repeat.set(14, 14);
        //console.log(materials[i].map);
        //}

        
        //geometry.mergeVertices(); //speed things up ?
        //geometry.computeFaceNormals();
        //geometry.computeVertexNormals(); // requires correct face normals
        //geometry.computeBoundingBox(); // otherwise geometry.boundingBox will be undefined
        

        //materials.side = THREE.DoubleSide;

        /*
        Create material and activate the 'doubleSided' attribute to force the
        rendering of both sides of each face (front and back). This prevents the so called
        'backface culling'. Usually, only the side is rendered, whose normal vector points
        towards the camera. The other side is not rendered (backface culling). But this
        performance optimization sometimes leads to wholes in the surface. When this happens
        in your surface, simply set 'doubleSided' to 'true'.
        */
        var material = new THREE.MeshFaceMaterial(materials);
        material.side = THREE.DoubleSide;

        /*var material = new THREE.MeshBasicMaterial({
            map: new THREE.MeshFaceMaterial(materials),
            side:THREE.DoubleSide
        });
        */

        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = js;
        
        //mesh.overdraw = true; //??? repeat textures?

        mesh.castShadow = true;

        if (shadow)
            mesh.receiveShadow = true;

        //mesh.morphTargets = true;
        //mesh.morphNormals = true;

        //mesh.vertexColors = THREE.FaceColors;
        //mesh.shading = THREE.FlatShading;

        //mesh.receiveShadow = true;
        //mesh.overdraw = true;

        /*
        if (ratio != 1) {
            geometry.computeBoundingBox();
            var box = geometry.boundingBox;
            ratio = ratio / box.max.y //calculate scale ratio or var box = new THREE.Box3().setFromObject( object );
            mesh.scale.x = mesh.scale.y = mesh.scale.z = ratio;
            //console.log("width " + box.max.x);
            mesh.castShadow = false;
            mesh.receiveShadow = false;
        }
        */

        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;

        mesh.rotation.x = xaxis;
        mesh.rotation.y = yaxis;
     
        //mesh.doubleSided = true;

        
        //mesh.geometry.mergeVertices(); //speed things up ?
        mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals(); // requires correct face normals
        mesh.geometry.computeBoundingBox(); // otherwise geometry.boundingBox will be undefined
        

        mesh.matrixAutoUpdate = true;
        mesh.updateMatrix();

        var object = new THREE.Object3D();

        object.add(mesh);
        
        if(objectContainer == scene3DFloorFurnitureContainer[FLOOR]) {
            material = new THREE.LineBasicMaterial({
                color: 0x000000,
                linewidth: 2
            });
            geometry = new THREE.Geometry();

            var x1 = mesh.position.x - mesh.geometry.boundingBox.max.z;
            var z1 = mesh.position.z - mesh.geometry.boundingBox.max.x;
            var x2 = mesh.position.x + mesh.geometry.boundingBox.max.z;
            var z2 = mesh.position.z + mesh.geometry.boundingBox.max.x;
           
            //TODO: if y > 0
            //var arrow = new THREE.ArrowHelper(direction, firstVector, computeDistance(node1, node2) - 32, co);

            //horizontal
            geometry.vertices.push(new THREE.Vector3(x1+0.2, 0.1, z1));
            geometry.vertices.push(new THREE.Vector3(x2-0.2, 0.1, z1));

            //vertical
            geometry.vertices.push(new THREE.Vector3(x1, 0.1, z1+0.2));
            geometry.vertices.push(new THREE.Vector3(x1, 0.1, z2-0.2));

            //var offset = scene3DFloorFurnitureContainer[FLOOR].children[i].centroid.clone();
            //geometry.applyMatrix(new THREE.Matrix4().makeTranslation( -offset.x, 0, -offset.z ) );
            //objMesh.position.copy( objMesh.centroid );
 
            //var line = new THREE.Line(geometry, material);

            var line = new THREE.Line(geometry, material, THREE.LinePieces);
            //line.dynamic = true;

            var realLifeDimentions = new Array();
            var geometryText = new Array();
            realLifeDimentions[0] = mesh.geometry.boundingBox.max.x * 200;
            realLifeDimentions[1] = mesh.geometry.boundingBox.max.z * 200;
            //realLifeDimentions[2]  = mesh.geometry.boundingBox.max.y * 200;
            
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
            textMeshL.position.x = mesh.position.x - geometryText[0].boundingBox.max.x/2;
            textMeshL.position.y = 0.1;
            textMeshL.position.z = z1 - 0.1;
            textMeshL.rotation.x = -1.5;

            var textMeshW = new THREE.Mesh(geometryText[1], material);
            textMeshW.position.x = x1 - 0.1;
            textMeshW.position.y = 0.1;
            textMeshW.position.z = mesh.position.z + geometryText[1].boundingBox.max.x/2;
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
        
        if(note != null)
        {
            //var object = new THREE.Object3D();

            material = new THREE.MeshBasicMaterial( { color: 0x000000  } );
            geometry = new THREE.TextGeometry(note, {
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
            //console.log( js + " Add Note: " + note);

            //objectContainer.add(object);
            //objectContainer.add(mesh);

        //}else{
            //if (object instanceof THREE.Object3D) {
            //objectContainer.add(mesh);
        }

        objectContainer.add(object);

        /*
        object.traverse( function( node ) {
            if( node.material ) {
                node.material.side = THREE.DoubleSide;
            }
        });

        pointLight = new THREE.PointLight( 0xffaa00 );
            pointLight.position.set( 0, 0, 0 );
            scene.add( pointLight );
        */

        //} else {
        //    console.log("settings mesh");
        //    object = mesh;
        //}

        //http://code.tutsplus.com/tutorials/webgl-with-threejs-models-and-animation--net-35993
        //animation[animation.length-1] = new THREE.MorphAnimation(mesh);
        //animation[animation.length-1].play();

        //THREE.Collisions.colliders.push(THREE.CollisionUtils.MeshOBB(mesh));
    };

    if (js.split('.').pop() == 'jsz') //zipped json file
    {
        var filename = js.split('/').pop().slice(0, -4);

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
        data = zip.file(filename + ".js").asText();
                        console.log(data);
                    }
                });
				
                url = "objects/" + js.slice(0, -4) + ".js";
                break;
            default:
        }
		*/

        $.ajax(js,{
            contentType: "application/zip",
            beforeSend: function (req) {
              req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
            },
            success: function(data){
                try {
                    var zip = new JSZip(data);
                    //zip.load(binary.read('string'));
                    data = zip.file(filename + ".js").asText();
                    data = JSON.parse(data);

                    if (data.metadata.type == "scene")
                    {
                        //console.log(data.metadata.type);
                        loader = new THREE.SceneLoader();
                        loader.parse(data, callbackScene, textures);
                    }
                    else
                    {
                        //loader.loadJson(data, callback, urlTextures);
                        var result = loader.parse(data, textures);
                        callback(result.geometry, result.materials);
                    }
                } catch (e) { //zip file was probably not found, load regular json
                    console.log("error catch");
                    loader.load(js.slice(0, -1), callback, textures);
                }
            },
            error: function(xhr, textStatus, errorThrown){
				alertify.alert("3D Model (" + js + ") Loading Error");
			}
        });

    } else {
        loader.load(js, callback, textures);
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

    //Something interesting from the web (maybe someday) -> http://inear.se/urbanjungle
    //Math behind the scenes explained here http://www.inear.se/2014/03/urban-jungle-street-view/
    
    _animate = -1;
    SCENE = 'house';

    hideElements();
    initMenu("menuRight3DHouse","Exterior/index.json");
 
    scene3DSetSky(DAY);
    scene3DSetLight()

    scene3DSetWeather();

    //the camera defaults to position (0,0,0) so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
    //camera3D.position.set(0, 6, 20);
    enableOrbitControls();

    //TODO: Loop and show based in ID name

    scene3D.add(scene3DHouseGroundContainer);
    scene3D.add(scene3DHouseFXContainer);
    scene3D.add(scene3DHouseContainer);
    scene3D.add(scene3DRoofContainer);

    scene3DFloorWallGenerate();
    scene3D.add(scene3DFloorTileContainer[FLOOR]);
    
    for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
        scene3D.add(scene3DFloorFurnitureContainer[i]);
    }
    scene3DCube.add(scene3DCubeMesh);

    //initObjectCollisions(scene3DHouseContainer);

    //$(renderer.domElement).bind('mousemove', on3DMouseMove);
    //$(renderer.domElement).bind('mousedown', on3DMouseDown);
    //$(renderer.domElement).bind('mouseup', on3DMouseUp);

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

    toggleRight('menuRight', true);
    toggleLeft('menuLeft3DHouse', true);

    menuSelect(1, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //scene3DHouseContainer.traverse;

    $('#WebGLCanvas').show();

    camera3DHouseEnter();
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
            yieldable = []
            
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
            
            d += 1
            ymax.push(0);
        }
        return points;
    };
    
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
        };
        
        return all_points;
    }
})();

/** LANDSCAPING **/
var landscape = new function() {
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
            var vertice_data = new Array();
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
                
                terrain3D.displacement.value[vertice_index] += Math.pow(radius - distance, .5) * .03;
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
                
                terrain3D.displacement.value[vertice_index] -= Math.pow(radius - distance, .5) * .03;
                terrain3D.displacement.needsUpdate = true;
            }
            terrain3DRawValleyData.push(terrain3DMouse);
        }
    };
}
function Degrees2Radians(degrees) {
    return degrees * (Math.PI / 180)
}
function getHeightData(img,scale) //return array with height data from img
{
 if (scale == undefined) scale=1;
  
    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );
 
    var size = img.width * img.height;
    var data = new Float32Array( size );
 
    context.drawImage(img,0,0);
 
    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
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

    _animate = -1;
    SCENE = 'landscape';

    hideElements();

    //scene3DSetBackground('blue');
    scene3DSetSky('day');
    scene3DSetLight();

    enableOrbitControls();
    camera3D.position.set(10, 10, 15);
    camera3D.lookAt(scene3D.position);

    TOOL3DLANDSCAPE = 'rotate';
   
    //scene3D.add(scene3DHouseGroundContainer);
    scene3D.add(terrain3D);

    $(renderer.domElement).bind('mousedown', on3DLandscapeMouseDown);
    $(renderer.domElement).bind('mouseup', on3DLandscapeMouseUp);
    $(renderer.domElement).bind('mousemove', on3DLandscapeMouseMove);
    //$(renderer.domElement).bind('mouseout', on3DLandscapeMouseUp);

    menuSelect(0, 'menuLeft3DLandscapeItem', '#ff3700');
    toggleLeft('menuLeft3DLandscape', true);

    menuSelect(2, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    $('#WebGLCanvas').show();

    //texture = THREE.ImageUtils.loadTexture( 'objects/Landscape/Textures/G3756.jpg' )
    //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    //texture.repeat.set(10, 10);
    
    //scene3D.add(scene3DFloorTileContainer[1][0]);

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

    _animate = -1;
    SCENE = 'floor';

    hideElements();
    initMenu("menuRight3DFloor","Interior/index.json");

    scene3DSetBackground('blue');
    scene3DSetLight();

    enableOrbitControls();

    //camera3D.position.set(0, 10, 12);
    
    //TODO: Loop and show based in ID name / floor
    //scene3D.add(scene3DContainer);

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
    scene3DFloorWallGenerate();

    //scene3D.add(scene3DCutawayPlaneMesh); //DEBUG

    scene3D.add(scene3DFloorFurnitureContainer[FLOOR]); //furnishings

    if(TOOL3DFLOOR == 'measure')
    {
        scene3DFloorMeasurementsGenerate();
        //scene3D.add(scene3DFloorMeasurementsContainer[FLOOR]);
        for (var i = 0; i < scene3DFloorFurnitureContainer[FLOOR].children.length; i++) {
            scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible = true;
        }
    }

    scene3D.add(scene3DFloorWallContainer[FLOOR]); //walls
    scene3D.add(scene3DFloorTileContainer[FLOOR]); //floor ground
    scene3D.add(scene3DFloorOtherContainer[FLOOR]); //notes

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

    $('#WebGLCanvas').show();

    animate();
    camera3DFloorEnter();
}

function show3DFloorLevel() {

     _animate = -1;
    SCENE = 'floorlevel';

    hideElements();

    scene3DSetBackground('blue');
    scene3DSetLight();

    camera3D.position.set(0, 4, 12);

    scene3D.add(scene3DFloorLevelGroundContainer);

    //TODO: show extruded stuff from scene2DFloorContainer[0]

    scene3DCube.add(scene3DCubeMesh);

    menuSelect(3, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //$('#HTMLCanvas').hide();
    $('#WebGLCanvas').show();
    animate();
}

function show3DRoofDesign() {

    _animate = -1;
    SCENE = 'roof';

    hideElements();
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
    //scene3D.add(scene3DFloorLevelGroundContainer);

    //TODO: show extruded stuff from scene2DFloorContainer[0]
    //scene3DCube.add(scene3DCubeMesh);

    toggleRight('menuRight', true);

    menuSelect(4, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //$('#HTMLCanvas').hide();
    $('#WebGLCanvas').show();
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

function scene2DZoom(SCALE_FACTOR) {

    /*
    http://jsfiddle.net/Q3TMA/
    http://jsfiddle.net/butch2k/kVukT/37/
    */
    console.log(SCALE_FACTOR);
    
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
        obj.setCoords();
    }
    scene2D.renderAll();
    
    zoom2D = SCALE_FACTOR;
}

function show2D() {

    SCENE = '2d';

    //camera2D.position.set(0, 8, 20);
    hideElements();
    initMenu("menuRight2D","FloorPlan/index.json");

    scene3DSetBackground(null);

    if (TOOL2D == 'freestyle') {
        menuSelect(2, 'menuLeft2DItem', '#ff3700');
        scene2D.isDrawingMode = true;
    } else if (TOOL2D == 'vector') {
        menuSelect(3, 'menuLeft2DItem', '#ff3700');
        scene2D.isDrawingMode = false;
        //} else if (TOOL2D == 'square') {

        //} else if (TOOL2D == 'circle') {
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

    scene2DMakeGrid();

    for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++) {
            scene2D.add(scene2DWallMesh[FLOOR][i]);
    }

    scene2D.on('object:moving', function(e) {
        var p = e.target;

        scene2D.remove(scene2DDrawLine); //quickfix

        if (p.point_type === 'edge') {

            p.line1 && p.line1.set({
                'x2': p.left,
                'y2': p.top
            });
            p.line2 && p.line2.set({
                'x1': p.left,
                'y1': p.top
            });
            p.line3 && p.line3.set({
                'x1': p.left,
                'y1': p.top
            });
            p.line4 && p.line4.set({
                'x1': p.left,
                'y1': p.top
            });
            scene2D.renderAll();
        }
        else if (p.name == "pivot")
        {
            if (p.line2)
            {
                p.line2.path[1][1] = p.left;
                p.line2.path[1][2] = p.top;
            }
        }
    });

    for (var i = 1; i <= scene2DWallMesh[FLOOR].length; i++) { //each floor wall

        var circle;
        var pivot;
        
        try
        {
            circle = scene2DMakeWallEdgeCircle(scene2DWallMesh[FLOOR][i].get('x1'), scene2DWallMesh[FLOOR][i].get('y1'), scene2DWallMesh[FLOOR][i - 1], scene2DWallMesh[FLOOR][i]);
            pivot = scene2DMakeWallPivotCircle(scene2DWallMesh[FLOOR][i].get('x2')-scene2DWallMesh[FLOOR][i].get('x1')/2, scene2DWallMesh[FLOOR][i].get('y1') - 10, null, scene2DWallMesh[FLOOR][i], null);
            
        }catch(e){

            circle = scene2DMakeWallEdgeCircle(scene2DWallMesh[FLOOR][0].get('x1'), scene2DWallMesh[FLOOR][0].get('y1'), scene2DWallMesh[FLOOR][i-1], scene2DWallMesh[FLOOR][0]);
        }

        circle.point_type = 'edge';
        pivot.name = "pivot";

        scene2D.add(circle);
        //scene2D.add(pivot);
    }
    //scene2DArrayToLineWalls();

    //scene2DCalculateWallLength();

    scene2D.renderAll();

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

    $('#HTMLCanvas').show();
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

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    scene3D.remove(camera3DQuad[0]);
    scene3D.remove(camera3DQuad[1]);
    scene3D.remove(camera3DQuad[2]);
    scene3D.remove(camera3DQuad[3]);
    scene3D.remove(camera3DQuadGrid);

    scene3D.remove(skyMesh); //TODO: think of better way avoiding double remove 1 here 1 in scene3DSetSky
    scene3D.remove(weatherSkyMesh);
    scene3D.remove(weatherSkyRainbowMesh);
    //=================================

    scene3D.remove(terrain3D);
    scene3D.remove(scene3DHouseGroundContainer);
    scene3D.remove(scene3DRoofContainer);
    //scene3D.remove(scene3DCutawayPlaneMesh); //DEBUG

    scene3D.remove(scene3DFloorGroundContainer);
    scene3D.remove(camera3DMirrorReflection);

    scene3D.remove(scene3DFloorLevelGroundContainer);

    scene3D.remove(scene3DHouseContainer);
    scene3D.remove(scene3DHouseFXContainer);

    for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
        scene3D.remove(scene3DFloorFurnitureContainer[i]);
        scene3D.remove(scene3DFloorMeasurementsContainer[i]);
        scene3D.remove(scene3DFloorWallContainer[i]);
        scene3D.remove(scene3DFloorTileContainer[i]);
        scene3D.remove(scene3DFloorOtherContainer[i]);
    }

    if (controls3D instanceof THREE.TransformControls)
    {
        scene3D.remove(controls3D);
    }

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
    
    //console.log(scene2DWallMesh[FLOOR].length);

    //$(renderer.domElement).unbind('mousedown', on3DMouseDown);
    //$(renderer.domElement).unbind('mouseup', on3DMouseUp);
    $(renderer.domElement).unbind('dblclick', onDocumentDoubleClick);

    $(renderer.domElement).unbind('mousedown', on3DHouseMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DHouseMouseUp);

    $(renderer.domElement).unbind('mousedown', on3DFloorMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DFloorMouseUp);
    
    $(renderer.domElement).unbind('mousemove', on3DFloorMouseMove);
    $(renderer.domElement).unbind('mousedown', on3DLandscapeMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DLandscapeMouseUp);
    //$(renderer.domElement).unbind('mouseout', on3DLandscapeMouseUp);

    disposePanorama('WebGLPanorama');

    $('#HTMLCanvas').hide();
    $('#WebGLCanvas').hide();

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

    scene3DObjectUnselect();

    /*
    if (engine instanceof ParticleEngine) {
        engine.destroy();
        engine = null;
    }
    */
    scene3D.remove(particlePivot.mesh);
    //particlePivot = new SPE.Group({});

    //scene3D.visible = !b;
    //scene2D.visible = b;

    //scene2DFloorContainer[0].traverse;
}

function scene2DMakeGrid() {

    scene2D.add(new fabric.Circle({
        radius: 450,
        fill: '#CCCCCC',
        left: (window.innerWidth / 2),
        top: (window.innerHeight / 2) + 80,
        selectable: false,
        opacity: 0.2
    }));

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
    var grid = 40;
    // create grid
    for (var i = 0; i < (scene2D.getWidth() / grid); i++) {
        scene2D.add(new fabric.Line([i * grid, 0, i * grid, scene2D.getWidth()], {
            stroke: "#6dcff6",
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
        }));
        scene2D.add(new fabric.Line([0, i * grid, scene2D.getWidth(), i * grid], {
            stroke: "#6dcff6",
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
        }));
    }
    //snap to grid
    
    scene2D.on('object:moving', function (options) {
        options.target.set({
            left: Math.round(options.target.left / grid) * grid,
            top: Math.round(options.target.top / grid) * grid
        });
    });
}

function scene3DSetWeather() {
    /*
    if (engine instanceof ParticleEngine) {
        engine.destroy();
        engine = null;
    }
    */
    particleWeather = new SPE.Group({});
    scene3D.remove(particleWeather.mesh);

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

    } else if (WEATHER == "rainy") {

        //engine = new ParticleEngine();
        //engine.setValues(weatherRainMesh);
        //engine.initialize();
    }

    scene3D.remove(weatherSkyMesh);
    scene3D.remove(weatherSkyRainbowMesh);

    if (DAY == 'day') {
        //scene3D.add(weatherSkyDayMesh);
        texture = new THREE.ImageUtils.loadTexture('images/cloud.png');
        texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
        texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
        weatherSkyMaterial.uniforms.map.value = texture;
        weatherSkyMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);

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
    else if (DAY == 'night')
    {
        texture = new THREE.ImageUtils.loadTexture('images/cloud2.png');
        texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
        texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
        weatherSkyMaterial.uniforms.map.value = texture;
        weatherSkyMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
    }

    scene3D.add(weatherSkyMesh);
}

function menuSelect(item, id, color) {
    if (item == null) //clear all
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
		        scene3DFloorFurnitureContainer[i] = new THREE.Object3D();
                scene3DFloorMeasurementsContainer[i] = new THREE.Object3D();
		        scene3DFloorWallContainer[i] = new THREE.Object3D();
                scene3DFloorTileContainer[i] = new THREE.Object3D();
                scene3DFloorOtherContainer[i] = new THREE.Object3D();
			    scene2DWallGeometry[i] = new Array();
			    scene2DWallDimentions[i] = new Array();
		    //} else { // user clicked "cancel"
		    }
		});
    }
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
    scene3DSetSky(DAY);
    scene3DSetLight();
    scene3DSetWeather();
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
    if (scene3D.visible) {
        camera3D.aspect = window.innerWidth / window.innerHeight;
        camera3D.updateProjectionMatrix();
        //} else if (scene2D.visible) {
        //camera2D.aspect = window.innerWidth / window.innerHeight;
        //camera2D.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    correctMenuHeight();
}

function correctMenuHeight() {

    var h = window.innerHeight - 250;
    var a;
    var b;

    if (SCENE == 'house') {
        a = $("#menuRight3DHouse .cssmenu").height();
        b = $("#menuRight3DHouse .scroll");
    } else if (SCENE == 'floor') {
        a = $("#menuRight3DFloor .cssmenu").height();
        b = $("#menuRight3DFloor .scroll");
    } else if (SCENE == 'roof') {
        a = $("#menuRight3DRoof .cssmenu").height();
        b = $("#menuRight3DRoof .scroll");
    } else if (SCENE == '2d') {
        a = $("#menuRight2D .cssmenu").height();
        b = $("#menuRight2D .scroll");
    } else {
        return;
    }

    $("#menuRightObjects .scroll").css('height', h);

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

    if (scene3D.visible && controls3D instanceof THREE.OrbitControls) {

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;

        //TODO: zoom out far, reset pivot-point to 0,0,0

        //if (new Date().getTime() - 150 < clickTime) { //Set pivot-point to clicked coordinates

        vector = new THREE.Vector3(x, y, 0.5);
        //projector.unprojectVector(vector, camera3D);
        vector.unproject(camera3D);
        var raycaster = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());
        var intersects = raycaster.intersectObjects(scene3DHouseGroundContainer.children);

        if (intersects.length > 0) {

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
            

            particlePivot = new SPE.Group({
                texture: THREE.ImageUtils.loadTexture("./images/star.png"),
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

            var tween = new TWEEN.Tween(controls3D.target).to({x:intersects[0].point.x, y:0, z:intersects[0].point.z},800).easing(TWEEN.Easing.Quadratic.InOut).start();

            //controls3D.target = new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z); //having THREE.TrackballControls or THREE.OrbitControls seems to override the camera.lookAt function

            doubleClickTime = setTimeout(function() {
                scene3D.remove(scene3DPivotPoint);
                //engine.destroy();
                //engine = null;
                particlePivotEmitter.disable();
                scene3D.remove(particlePivot.mesh);
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

            scene2DWallMesh[FLOOR][scene2DWallMesh[FLOOR].length] = scene2DMakeWall([scene2DDrawLine.get('x1'), scene2DDrawLine.get('y1'), scene2DDrawLine.get('x2'), scene2DDrawLine.get('y2')]);
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

    //$("#HTMLCanvas").bind('mousemove', on2DMouseMove);
    // fabric.util.addListener(fabric.document, 'dblclick', dblClickHandler);
    //fabric.util.removeListener(canvas.upperCanvasEl, 'dblclick', dblClickHandler); 

    $("#menuWallInput").hide(); //TODO: analyze and store input

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
                    scene2DWallGeometry[FLOOR].push([scene2DDrawLineGeometry[n].x, scene2DDrawLineGeometry[i].y, scene2DDrawLineGeometry[n].x, scene2DDrawLineGeometry[i].y]);

                } else {

                    //Modify wall last point (extend)
                    var l = scene2DWallGeometry[FLOOR].length - 1;
                    scene2DWallGeometry[FLOOR][l][2] = scene2DDrawLineGeometry[i].x;
                    scene2DWallGeometry[FLOOR][l][3] = scene2DDrawLineGeometry[i].y;
                }

            } else if ((magicY[c] == "up" || magicY[c] == "down")) {

                if (magicY[c - 1] == "up" || magicY[c - 1] == "down") {

                    //add new wall points
                    scene2DWallGeometry[FLOOR].push([scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[n].y, scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[n].y]);
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
    }
}

function on2DMouseMove(event) {

    event.preventDefault();

    //if (!leftButtonDown) {
    //    return;
    //}

    if (TOOL2D == 'line' && scene2DDrawLine instanceof fabric.Line) {
        scene2DDrawLine.set({
            x2: event.clientX,
            y2: event.clientY
        });
        scene2D.renderAll();
    }
    
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

        if (!scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DHouseContainer.children))
        {
            scene3D.add(scene3DPivotPoint);
            
        //}
        //else if (scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DHouseGroundContainer.children))
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

    if (!scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DFloorOtherContainer[FLOOR].children))
    {
        if (!scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DFloorFurnitureContainer[FLOOR].children))
        {
            if (!scene3DObjectSelect(mouse.x, mouse.y, camera3D, scene3DFloorWallContainer[FLOOR].children))
            {
                scene3D.add(scene3DPivotPoint);
            }
        }
    }
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function on3DFloorMouseMove(event) {

	event.preventDefault();

    if (event.which != 1) {
        return;
    }

    var v = new THREE.Vector3( 0, 0, 8 ); //TODO: make this dynamic
    v.applyQuaternion(camera3D.quaternion);
    scene3DCutawayPlaneMesh.position.copy(v);
    scene3DCutawayPlaneMesh.lookAt(camera3D.position);

    if( TWEEN.getAll().length == 0) //do not interfere with existing animations (performance)
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
                    var tween = new TWEEN.Tween(collisionResults[0].object.material).to({opacity:0.1}, 800).start();

                collection.push(collisionResults[0].object.id);
                //break;
            }
        }

        for (var i = 0; i < scene3DFloorWallContainer[FLOOR].children.length; i++)
        {
            if(!collection.contains(scene3DFloorWallContainer[FLOOR].children[i].id))
                var tween = new TWEEN.Tween(scene3DFloorWallContainer[FLOOR].children[i].material).to({opacity:0.5}, 500).start();
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

    if (controls3D instanceof THREE.TransformControls || controls3D instanceof THREE.FirstPersonControls) {
        return;
    }

    //console.log("mouse:" + event.clientX + " window:" + window.innerWidth);

    camera3DCube.position.copy(camera3D.position);
    camera3DCube.position.sub(controls3D.center);
    camera3DCube.position.setLength(18);
    camera3DCube.lookAt(scene3DCube.position);

    if (event.clientX > window.innerWidth - 50)
    {
    	//console.log("set SceneAnimate");
    	SceneAnimate = true; animate();
    	leftButtonDown = false; //TODO: fix this if mouse is outside screen mouseup never triggered
	}

    if (SelectedObject != null) {

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;

        $('#WebGLInteractiveMenu').hide();
        $('#WebGLTextureSelect').hide();

        //if (TOOL3DINTERACTIVE == 'moveXY') {

            vector = new THREE.Vector3(x, y, 0.5);
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

            /*
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
			*/

            // ====== COLLISION DETECTION with RAYS ======
            // http://webmaestro.fr/collisions-detection-three-js-raycasting/
			/*
            var rays = [
                new THREE.Vector3(0, 0, 1),
                //new THREE.Vector3(1, 0, 1),
                //new THREE.Vector3(1, 0.5, 0),
                //new THREE.Vector3(1, 0, -1),
                //new THREE.Vector3(0, 0.5, -1),
                //new THREE.Vector3(-1, 0, -1),
                //new THREE.Vector3(-1, 0.5, 0),
                //new THREE.Vector3(-1, 0, 1)
            ]; // Set the rays : one vector for every potential direction
            */
            /*
            var rays = [
            	new THREE.Vector3(SELECTED.position.x + SELECTED.geometry.boundingBox.max.x, SELECTED.position.y + SELECTED.geometry.boundingBox.max.y, SELECTED.position.z + SELECTED.geometry.boundingBox.max.z),
            	new THREE.Vector3(SELECTED.position.x - SELECTED.geometry.boundingBox.max.x, SELECTED.position.y + SELECTED.geometry.boundingBox.max.y, SELECTED.position.z - SELECTED.geometry.boundingBox.max.z)
            ]; // Set the rays : one vector for every potential direction

            var caster = new THREE.Raycaster(); // the "RayCaster", able to test for intersections
            var distance = 0.5; // Maximum distance from the origin before we consider collision
            //scene3D.updateMatrixWorld();
            for (var i = 0; i < rays.length; i += 1){ // For each ray

                //caster.set(SELECTED.position, rays[i]);  // We reset the raycaster to this direction
                caster.set(SELECTED.position, rays[i].sub(SELECTED.position).normalize());  // We reset the raycaster to this direction
                //scene3D.updateMatrixWorld(); // required, since you haven't rendered yet

                //var collisions = caster.intersectObject(scene3DHouseContainer.children); // Test if we intersect with any obstacle mesh
           
                var collisions = caster.intersectObjects(scene3DHouseContainer.children,true); // Test if we intersect with any obstacle mesh
           
                if (collisions.length > 0 && collisions[0].object.name != "") // && collisions[0].distance <= distance) // And disable that direction if we do
                {
                    console.log("collision detected '" + collisions[0].object.name + "'");
                }
            }
            */
            // ===========================================
    }
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

    if (controls3D instanceof THREE.TransformControls || controls3D instanceof THREE.FirstPersonControls) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //clickTime = new Date().getTime();
    
    $(renderer.domElement).bind('mousemove', on3DMouseMove);
    
    SceneAnimate = false;

    //renderer.antialias = false;

    clickTime = setTimeout(function() {
        if (document.getElementById('arrow-right').src.indexOf("images/arrowright.png") >= 0) {
            //Auto close right menu
            toggleRight('menuRight', false);
            //document.getElementById('menuRight').setAttribute("class", "hide-right");
            //delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

            //Auto close left menu
            if (SCENE == 'house') {
                toggleLeft('menuLeft3DHouse', false);

            } else if (SCENE == 'floor') {
                toggleLeft('menuLeft3DFloor', false);
            }
        }
    }, 1400);
}


function on3DMouseUp(event) {

    event.preventDefault();

    if (event.which == 1) leftButtonDown = false; // Left mouse button was released, clear flag

    if (controls3D instanceof THREE.TransformControls && !TransformConstrolsHighlighted)
    {
        //console.log(TransformConstrolsHighlighted);
        controls3D.detach(SelectedObject);
        
        enableOrbitControls();

        scene3DObjectUnselect();
        //$(renderer.domElement).unbind('mousemove', on3DMouseMove);
    }

    if (controls3D instanceof THREE.TransformControls || controls3D instanceof THREE.FirstPersonControls) {
        return;
    }

    $(renderer.domElement).unbind('mousemove', on3DMouseMove);

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


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

    clearTimeout(clickTime); //prevents from hiding menus too fast

    if (SelectedObject != null) { //Restore menu after MouseMove
        $('#WebGLInteractiveMenu').show();
    }

    scene3D.remove(scene3DPivotPoint);

    if (document.getElementById('arrow-right').src.indexOf("images/arrowleft.png") >= 0) {
        //Auto open right menu
        toggleRight('menuRight', true);
        //document.getElementById('menuRight').setAttribute("class", "show-right");
        //delay(document.getElementById("arrow-right"), "images/arrowright.png", 400);

        //Auto open left menu
        if (SCENE == 'house') {
            toggleLeft('menuLeft3DHouse', true);
        } else if (SCENE == 'floor') {
            toggleLeft('menuLeft3DFloor', true);
        }
    }
    //container.style.cursor = 'auto';
}

function scene3DObjectSelectRemove() {

    if (SCENE == 'house') {
        scene3DHouseContainer.remove(SelectedObject);
    } else if (SCENE == 'floor') {
        scene3DFloorFurnitureContainer[FLOOR].remove(SelectedObject);
    }
    
    scene3DObjectUnselect();
}

function scene3DObjectSelectMenu(x, y, menuID) {

    //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    vector = new THREE.Vector3(x, y, 0.5);

    var percX, percY

    // projectVector will translate position to 2d
    //vector = projector.projectVector(vector.setFromMatrixPosition(SELECTED.matrixWorld), camera3D); //vector will give us position relative to the world
    if (SelectedObject != null)
    {
    	vector = vector.setFromMatrixPosition(SelectedObject.matrixWorld);
	}
	else if (SelectedWall != null)
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

    $(menuID).css('top', vector.y).css('left', vector.x);
    $(menuID).show();

    if (SelectedObject != null)
    {
        $('#WebGLTextureSelect').css('top', vector.y + $(menuID).height()-64).css('left', vector.x - $('#WebGLTextureSelect').width() / 2);
        //$('#WebGLTextureSelect').show();

        //$('#WebGLInteractiveMenu').bind('mousemove', on3DMouseMove);
        //$('#WebGLInteractiveMenu').bind('mousedown', on3DMouseDown);
        //$('#WebGLInteractiveMenu').bind('mouseup', on3DMouseUp);
    }
    else if (SelectedWall != null)
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

function scene3DObjectSelect(x, y, camera, objectchildren) {

    //TODO: > http://stemkoski.github.io/Three.js/Outline.html

    //if (controls3D instanceof THREE.OrbitControls){
        vector = new THREE.Vector3(x, y, 0.5);
        //var projector = new THREE.Projector();
        //projector.unprojectVector(vector, camera);
        vector.unproject(camera);
        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(objectchildren,true); //recursive! pickup objects within objects (example: notes)

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
            //console.log("Intersects " + intersects.length + ":" + intersects[0].object.id);
            controls3D.enabled = false;

            //if (SelectedObject != intersects[0].object){
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

                if (objectchildren == scene3DHouseContainer.children || objectchildren == scene3DFloorFurnitureContainer[FLOOR].children)
                {
                	scene3DObjectUnselect(); //avoid showing multiple selected objects

                	SelectedObject = intersects[0].object;

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

                	camera3DPositionCache = camera3D.position.clone();
                	camera3DPivotCache = controls3D.target.clone();

                	var tween = new TWEEN.Tween(camera3D.position).to({x:SelectedObject.position.x, y:SelectedObject.position.y+4, z:SelectedObject.position.z + 5},1800).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
                    	
                        //http://jeromeetienne.github.io/threex.geometricglow/examples/geometricglowmesh.html

                    	//glowMesh = new THREEx.GeometricGlowMesh(SelectedObject);
                		//SelectedObject.add(glowMesh.object3d);

                    	scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');

        			}).start();
    				var tween = new TWEEN.Tween(controls3D.target).to({x:SelectedObject.position.x, y:SelectedObject.position.y, z:SelectedObject.position.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
                    //var tween = new TWEEN.Tween(camera3D.lookAt).to({x:SelectedObject.position.x, y:SelectedObject.position.y, z:SelectedObject.position.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
           
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
            scene3DObjectUnselect();
            controls3D.enabled = true;
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

        if(SelectedNote != null)
        {
            camera3DNoteExit();
            SelectedNote = null;
        }
        else if(SelectedPicture != null)
        {
            camera3DPictureExit();
            SelectedPicture = null;
        }
        else if(SelectedObject != null)
        {
            camera3DAnimateResetView();

            SelectedObject = null;
            SelectedWall = null;

            $('#WebGLInteractiveMenu').hide();
            $('#WebGLWallPaintMenu').hide();
            $('#WebGLColorWheelSelect').hide();
            $('#WebGLTextureSelect').hide();
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

        if (typeof jsPDF == 'undefined') $.getScript("js/jspdf.js", function(data, textStatus, jqxhr) {
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

function collectArrayFromContainer(container) {

	var json = new Array();

	for (var i = 0; i < container.children.length; i++) {
        //var obj = new Object();
        var JSONString = {};
        JSONString["file"] = container.children[i].children[0].name;
        try{ JSONString["note"] = container.children[i].children[2].name; }catch(e){}
        JSONString["position.x"] = container.children[i].children[0].position.x;
        JSONString["position.y"] = container.children[i].children[0].position.y;
        JSONString["position.z"] = container.children[i].children[0].position.z;
        JSONString["rotation.x"] = container.children[i].children[0].rotation.x;
        JSONString["rotation.y"] = container.children[i].children[0].rotation.y;
        JSONString["rotation.z"] = container.children[i].children[0].rotation.z;
    	//TODO: pickup scale and alternative texture location
        json.push(JSONString);
    }
    return json;
}

function saveScene(online) {

    setTimeout(function(){

        var zip = new JSZip();

        //console.log(JSON.stringify(terrain3DRawData));

        zip.file("terrain3DHill.json", JSON.stringify(terrain3DRawHillData));
        zip.file("terrain3DValley.json", JSON.stringify(terrain3DRawValleyData));

        var JSONString = {};
        JSONString["AgentInfo"] = scene3DHouseContainer.name;
        for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
            JSONString["Floor" + i] = scene3DFloorFurnitureContainer[i].name;
        }
        zip.file("scene3DSettings.json", JSON.stringify(JSONString));
        zip.file("scene3DRoofContainer.json", JSON.stringify(collectArrayFromContainer(scene3DRoofContainer)));
        zip.file("scene3DHouseContainer.json", JSON.stringify(collectArrayFromContainer(scene3DHouseContainer)));
        zip.file("scene3DHouseGroundContainer.json", JSON.stringify(collectArrayFromContainer(scene3DHouseGroundContainer)));

        for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++)
        {
            zip.file("scene3DFloorFurnitureContainer." + i + ".json", JSON.stringify(collectArrayFromContainer(scene3DFloorFurnitureContainer[i])));
        }

        for (var i = 0; i < scene2DWallMesh.length; i++)
        {
            scene2D.clear();
            for (var o = 0; o < scene2DWallMesh[i].length; o++)
            {
                scene2D.add(scene2DWallMesh[i][o]);
            }

            zip.file("scene2DFloorContainer." + i + ".json", JSON.stringify(scene2D.toDatalessJSON()));
        }

        try{
            zip.file("house.jpg", imageBase64('imgHouse'), {
                base64: true
            });
        }catch(ex){}

        if (!online)
        {
            zip.file("ReadMe.txt", "Saved by WebGL HousePlanner.");

            var ob = zip.folder("obj");
            var tx = zip.folder("obj/Textures");

            //var result= new THREE.OBJExporter().parse(scene3D.geometry); //MaterialExporter.js
            var result = JSON.stringify(new THREE.ObjectExporter().parse(scene3D)); 
            ob.file("THREE.Scene.json", result);

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

    }, 1500);
}

function openScene(zipData) {

    zip = new JSZip(zipData);
    //zip.folder("Textures").load(data);

    try{
        terrain3DRawHillData = JSON.parse(zip.file("terrain3DHill.json").asText());
        landscape.select('hill');
        $.each(terrain3DRawHillData, function(index)
        {
            terrain3DMouse = this;
            landscape.onmousemove();
            //console.log(this);
        });
    }catch(ex){}

    try{
        terrain3DRawValleyData = JSON.parse(zip.file("terrain3DValley.json").asText());
        landscape.select('valley');
        $.each(terrain3DRawValleyData, function(index)
        {
            terrain3DMouse = this;
            landscape.onmousemove();
            //console.log(this);
        });
    }catch(ex){}

    for (var i = 0; i < 4; i++){
        try{
            //var objects2DFloor = JSON.parse(zip.file("scene2DFloorContainer." + i + ".json").asText());

            var objects3DFurniture = JSON.parse(zip.file("scene3DFloorFurnitureContainer." + i + ".json").asText());
            $.each(objects3DFurniture, function(index){
                var note = null;
                if(this.note != null)
                    note = this['note'];
                //console.log(this['position.x']);
                open3DModel(this['file'], scene3DFloorFurnitureContainer[i], this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, note);
            });
        }catch(ex){}
    }
    try{
        var objects3DHouse = JSON.parse(zip.file("scene3DHouseContainer.json").asText());
        $.each(objects3DHouse, function(index){
            open3DModel(this['file'], scene3DHouseContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
        });
        var objects3DRoof = JSON.parse(zip.file("scene3DRoofContainer.json").asText());
        $.each(objects3DRoof, function(index){
            open3DModel(this['file'], scene3DRoofContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
        });
        var objects3DSettings = JSON.parse(zip.file("scene3DSettings.json").asText());
        scene3DHouseContainer.name = objects3DSettings['AgentInfo'];
        for (var i = 0; i < 4; i++){
            try{
                scene3DFloorFurnitureContainer[i].name = objects3DSettings['Floor' + i]; 
            }catch(ex){}
        }
    }catch(ex){}
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

    for (var i = 0; i < scene3DFloorWallContainer[FLOOR].children.length; i++) {

    }
}

function scene3DFloorMeasurementShow() {
    var show = true;
    for (var i = 0; i < scene3DFloorFurnitureContainer[FLOOR].children.length; i++) {
        scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible = !scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible;
        show = scene3DFloorFurnitureContainer[FLOOR].children[i].children[1].visible;
    }
    if (show)
    {
        menuSelect(0,'menuLeft3DFloorItem','#ff3700');
        TOOL3DFLOOR='measure';
    }else{
        menuSelect(0,'menuLeft3DFloorItem','black');
        TOOL3DFLOOR='';
    }
}

function scene3DFloorObjectWallMeasurementAjust() {

}


function scene3DFloorWallGenerate() {

    scene3DFloorWallContainer[FLOOR] = new THREE.Object3D(); //reset

    //TODO: Generate directly from SVG 2D points!
    var objects = scene2DWallMesh[FLOOR]; //scene2D.getObjects();
    //var floorShape = new THREE.Shape();
    var floorShape = null; //new THREE.Geometry();
    var leftMenuOffset = - 2;
    var topMenuOffset = 4;

    for (var i in objects) {
        var obj = objects[i];

        if (obj.name == "wall") { //avoid picking arrows which are path also

            console.log(obj.type + " x1:" + obj.get('x1') + " y1:" + obj.get('y1') + " x2:" + obj.get('x2') + " y2:" + obj.get('y2'));

            //Translate 2D points into 3D
            var x1 = (obj.get('x1') / 1200) * 2 - 1;
            var y1 = -(obj.get('y1') / 1200) * 2 + 1;
            var x2 = (obj.get('x2') / 1200) * 2 - 1;
            var y2 = -(obj.get('y2') / 1200) * 2 + 1;

            x1 *= 12;
            y1 *= 12;
            x2 *= 12;
            y2 *= 12;

            console.log("x1:" + x1 + " y1:" + y1 + " x2:" + x2 + " y2:" + y2)

            var rectLength = x2 - x1,
                rectWidth = 0.2;

            var wallShape = new THREE.Shape();
            wallShape.moveTo(x1, y1);
            wallShape.lineTo(x2, y2);
            wallShape.lineTo(x2, y2 + rectWidth);
            wallShape.lineTo(x1, y1 + rectWidth);
            wallShape.lineTo(x1, y1);

            if (floorShape == null)
            {
                floorShape = new THREE.Shape();
                floorShape.moveTo(x1, y1);
            }else{
                floorShape.lineTo(x1, y1);
            }
            /*
            rectShape.moveTo(0, 0);
            rectShape.lineTo(0, rectWidth);
            rectShape.lineTo(rectLength, rectWidth);
            rectShape.lineTo(rectLength, 0);
            rectShape.lineTo(0, 0);
            */
            //var geometry = rectShape.makeGeometry();

            /*
            shape.quadraticCurveTo(x+50, y, x+100, y+50);
            shape.quadraticCurveTo(x+50, y, x, y);  
            */
            /*
            var splineCurve = new THREE.SplineCurve([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -100),
                new THREE.Vector3(100, 0, -100)
            ]);
            */

            var extrudeSettings = {
                amount: 4
            }; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5
            //extrudeSettings.extrudePath = splineCurve;
            extrudeSettings.bevelEnabled = false;
            //extrudeSettings.steps = 1;
            //extrudeSettings.bevelSegments = 2;

            var geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
            //THREE.ExtrudeGeometry.WorldUVGenerator

            //scene3DWallTexture.repeat.set(12, 12);
            //scene3DWallTexture.anisotropy = 2;
            /*
            var scene3DWallMaterial = new THREE.MeshBasicMaterial({
                map: scene3DWallTexture,
                //wireframe: true
            });
            */

            geometry.computeBoundingBox();

            var scene3DWallMaterial = new THREE.MeshLambertMaterial({
                map: scene3DWallTexture,
                transparent: true,
                opacity:0.6,
                side: THREE.DoubleSide,
                //wireframe: true
            });

            var mesh = new THREE.Mesh(geometry, scene3DWallMaterial);
            mesh.rotation.x = -(90 * RADIAN); //extrusion happens in Z direction, we need the wall pointing UP

            mesh.position.x = mesh.position.x + leftMenuOffset; //compensate for leftMenu
            mesh.position.y = 0;
            mesh.position.z = mesh.position.z + topMenuOffset; //compensate for topMenu

            /*
            geometry.centroid = new THREE.Vector3();
            geometry.centroid.addVectors( geometry.boundingBox.min, geometry.boundingBox.max );
            geometry.centroid.multiplyScalar( - 0.5 );
            geometry.centroid.applyMatrix4(mesh.matrixWorld);
            */

            scene3DFloorWallContainer[FLOOR].add(mesh);
        }
    }

    //floorShape.faces.push(new THREE.Face3(0, 1, 2));
    //floorShape.computeFaceNormals();
    //floorShape.computeCentroids();

    try {
        texture = THREE.ImageUtils.loadTexture('objects/Platform/Textures/M23562.jpg');
        //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        //texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
        //texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        //texture.repeat.set(4, 4);

        /*
        var image = new Image();
        image.onload = function () { texture.needsUpdate = true; };
        image.src = 'objects/Platform/Textures/W23674.jpg';
        var texture  = new THREE.Texture(image, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.LinearMipMapLinearFilter );
        texture.repeat.x = 10;
        texture.repeat.y = 10;
        */

        //material = new THREE.MeshBasicMaterial({ map: texture});
        //material = new THREE.MeshLambertMaterial( { map: texture } );
        //material = new THREE.MeshPhongMaterial({ map: texture, shininess: 10});
        //var materials = [material1, material2, material3, material4, material5, material6];
        //var meshFaceMaterial = new THREE.MeshFaceMaterial( materials );
        material = new THREE.MeshBasicMaterial({color: 0xccac7b});
        mesh = new THREE.Mesh(floorShape.makeGeometry(), material);
        mesh.rotation.x = -(90 * RADIAN); //Horizontal Flip
        mesh.position.x = mesh.position.x + leftMenuOffset; //compensate for leftMenu
        mesh.position.y = 0.1;
        mesh.position.z = mesh.position.z + topMenuOffset; //compensate for topMenu
        //mesh.overdraw = true;
        mesh.receiveShadow = true;

        scene3DFloorTileContainer[FLOOR].add(mesh);
        //scene3DFloorTileContainer[FLOOR].children[0] = mesh;
    }catch(e){}
}

function sceneOpen(file) {

    $.ajax("scenes/" + file,{
        contentType: "application/zip",
        beforeSend: function (req) {
              req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
        },
        success: function(data){
            try {
                openScene(data);
            } catch (e) {
                console.log("failed to open scene " + e);
            }
        }
    });

    //============ SAMPLE DATA ================

    scene2DWallGeometry[FLOOR].push([480, 180, 660, 180, 0]); //x1,y1,x2,y2,curve
    scene2DWallGeometry[FLOOR].push([660, 180, 660, 140, 0]);
    scene2DWallGeometry[FLOOR].push([660, 140, 1040, 140, 0]);

    scene2DWallGeometry[FLOOR].push([1040, 150, 1040, 540, 0]);
    scene2DWallGeometry[FLOOR].push([1040, 540, 930, 540, 0]);
    scene2DWallGeometry[FLOOR].push([930, 540, 930, 650, 0]);

    scene2DWallGeometry[FLOOR].push([930, 650, 480, 650, 0]);

    scene2DWallGeometry[FLOOR].push([480, 650, 480, 180, 0]);
    //scene2DWallDimentions[FLOOR].push([50, 200, 80, 0, 0]);
    
    scene2DArrayToLineWalls();
}

function sceneNew() {
   
    open3DModel("objects/Platform/floor.jsz", scene3DFloorGroundContainer, 0, 0, 0, 0, 0, 1, false, null);
    open3DModel("objects/Landscape/round.jsz", scene3DHouseGroundContainer, 0, 0, 0, 0, 0, 1, true, null);
    open3DModel("objects/Landscape/round.jsz", scene3DFloorLevelGroundContainer, 0, 0, 0, 0, 0, 1, true, null);

    /*
    new THREE.JSONLoader().load("objects/Landscape/round.js", function(geometry, materials) {
        var groundTexture = new THREE.ImageUtils.loadTexture('objects/Landscape/Textures/F56734.jpg');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(12, 12);
        groundTexture.anisotropy = 2; //focus blur (16=unblured 1=blured)
        var groundMaterial = new THREE.MeshBasicMaterial({
            map: groundTexture
        });
        mesh = new THREE.Mesh(geometry, groundMaterial);
        //mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene3DFloorLevelGroundContainer.add(mesh);
    });
	*/

    //Temporary Objects for visualization
    //TODO: load from one JSON file
    //=========================================

    open3DModel("objects/Platform/pivotpoint.jsz", scene3DPivotPoint, 0, 0, 0, 0, 0, 1, false, null);
    
    //http://blog.andrewray.me/creating-a-3d-font-in-three-js/
    /*
    var material = new THREE.MeshBasicMaterial( { color: 0x000000  } );
    var textGeometry = new THREE.TextGeometry('cool notes, click to view', {
        font: 'helvetiker', // Must be lowercase!
        weight: 'normal',
        size: 0.05,
        height: 0.01
    });
    var textMesh = new THREE.Mesh(textGeometry, material);
    //textGeometry.computeBoundingBox();  // Do some optional calculations. This is only if you need to get the width of the generated text
    //textGeometry.textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.x = 1.8;
    textMesh.position.y = 1;
    textMesh.position.z = 0.55;
    textMesh.rotation.y = 1.5;
    
    scene3DFloorFurnitureContainer[FLOOR].add(textMesh);
    open3DModel("objects/Platform/note.jsz", scene3DFloorOtherContainer[FLOOR], 1.8, 0.6, 0.18, 0, 1.5, 1,"");
    */
    open3DModel("objects/Platform/camera.jsz", scene3DFloorOtherContainer[FLOOR], 5, 0, -3, 0, 2.5, 1, false, null);

    //open3DModel("objects/Interior/Furniture/Sofas/IKEA/three-seat-sofa.jsz", scene3DFloorFurnitureContainer[FLOOR], -3.5, 0, 4, 0, 0, 1);
    //open3DModel("objects/Exterior/Cars/VWbeetle.jsz", scene3DHouseContainer, -2.5, 0, 8, 0, 0, 1);
    //THREE.GeometryUtils.center();
    
    /*
    scene2D.add(
        scene2DMakeWallEdgeCircle(line.get('x1'), line.get('y1'), null, line),
        makeCircle(line.get('x2'), line.get('y2'), line, line2, line5, line6),
        makeCircle(line2.get('x2'), line2.get('y2'), line2, line3, line4),
        makeCircle(line3.get('x2'), line3.get('y2'), line3),
        makeCircle(line4.get('x2'), line4.get('y2'), line4),
        makeCircle(line5.get('x2'), line5.get('y2'), line5),
        makeCircle(line6.get('x2'), line6.get('y2'), line6)
    );
	*/
}

function scene2DArrayToLineWalls() {

    scene2DWallMesh[FLOOR] = [];

    for (var i = 0; i < scene2DWallGeometry[FLOOR].length; i++) { //each floor wall

        //console.log(scene2DWallGeometry[FLOOR][i][0] + "," + scene2DWallGeometry[FLOOR][i][1] + "," + scene2DWallGeometry[FLOOR][i][2] + "," + scene2DWallGeometry[FLOOR][i][3]);
        scene2DWallMesh[FLOOR][i] = scene2DMakeWall([scene2DWallGeometry[FLOOR][i][0], scene2DWallGeometry[FLOOR][i][1], scene2DWallGeometry[FLOOR][i][2], scene2DWallGeometry[FLOOR][i][3]]);
        scene2DWallMesh[FLOOR][i].hasControls = false;

        var xOffset = -10;
        var yOffset = -20;
        var angleOffset = -90;

        if (scene2DWallGeometry[FLOOR][i][1] != scene2DWallGeometry[FLOOR][i][3])
            angleOffset = -180;

        /*
        var line = new fabric.Line([scene2DWallGeometry[FLOOR][i][0] - 10, scene2DWallGeometry[FLOOR][i][1] - 20, scene2DWallGeometry[FLOOR][i][2] + 10, scene2DWallGeometry[FLOOR][i][3] - 20], {
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 1,
            hasControls: false,
            selectable: false
        });
        scene2D.add(line);
        */
      
        /*
        var text = new fabric.Text('10m x 15cm', {
            fontFamily: 'Arial',
            fontSize: 12,
            left: scene2DWallGeometry[FLOOR][i][0] + (scene2DWallGeometry[FLOOR][i][2] - scene2DWallGeometry[FLOOR][i][0]) / 2,
            top: scene2DWallGeometry[FLOOR][i][1] + yOffset,
            fill: 'black',
            hasControls: false,
            selectable: false
        });
        var dx = line.get('x2') - line.get('x1');
        var dy = line.get('x2') - line.get('x1');
        var PI2 = Math.PI * 2;
        var radianAngle = (Math.atan2(dy, dx) + PI2) % PI2;
        text.setAngle(radianAngle);
        scene2D.add(text);
        */

        /*
        var tip = [];
        for (var a = 0; a < 2; a++) {
            tip[a] = new fabric.Path('M 0 0 L -10 10 M 0 0 L 10 10 z', {
                strokeWidth: 1,
                stroke: 'black',
                hasControls: false,
                selectable: false,
            });

            if (a == 0) {
                tip[a].setAngle(angleOffset);
                tip[a].left = scene2DWallGeometry[FLOOR][i][0] + xOffset,
                tip[a].top = scene2DWallGeometry[FLOOR][i][1] + yOffset;
            } else if (a == 1) {
                tip[a].setAngle(angleOffset * -1);
                tip[a].left = scene2DWallGeometry[FLOOR][i][2] - xOffset,
                tip[a].top = scene2DWallGeometry[FLOOR][i][3] + yOffset;
            }

            tip[a].line = line;
            scene2D.add(tip[a]);
            tip[a].bringToFront();
        }
        scene2D.on('object:moving', function(e) {
        var p = e.target;

        if (p.point_type === 'arrow_start') {

            p.arrow.set('x1', p.left);
            p.arrow.set('y1', p.top);

            p.arrow._setWidthHeight();
            var x = p.arrow.get('x2') - p.arrow.get('x1');
            var y = p.arrow.get('y2') - p.arrow.get('y1');
            var angle;
            if (x == 0) {
                if (y == 0) {
                    angle = 0;
                } else if (y > 0) {
                    angle = Math.PI / 2;
                } else {
                    angle = Mathi.PI * 3 / 2;
                }
            } else if (y == 0) {
                if (x > 0) {
                    angle = 0;
                } else {
                    angle = Math.PI;
                }
            } else {
                if (x < 0) {
                    angle = Math.atan(y / x) + Math.PI;
                } else if (y < 0) {
                    angle = Math.atan(y / x) + (2 * Math.PI);
                } else {
                    angle = Math.atan(y / x);
                }
            }
            angle = angle * 180 / Math.PI;
            // var angle = -Math.atan((y)/(x))*180/Math.PI

            p.set('angle', angle - 90);
            scene2D.renderAll();

        } else if (p.point_type === 'arrow_end') {

            p.arrow.set('x2', p.left);
            p.arrow.set('y2', p.top);
            p.arrow._setWidthHeight();
            var x = p.arrow.get('x2') - p.arrow.get('x1');
            var y = p.arrow.get('y2') - p.arrow.get('y1');
            var angle;
            if (x == 0) {
                if (y == 0) {
                    angle = 0;
                } else if (y > 0) {
                    angle = Math.PI / 2;
                } else {
                    angle = Mathi.PI * 3 / 2;
                }
            } else if (y == 0) {
                if (x > 0) {
                    angle = 0;
                } else {
                    angle = Math.PI;
                }
            } else {
                if (x < 0) {
                    angle = Math.atan(y / x) + Math.PI;
                } else if (y < 0) {
                    angle = Math.atan(y / x) + (2 * Math.PI);
                } else {
                    angle = Math.atan(y / x);
                }
            }
            angle = angle * 180 / Math.PI;
            //var angle = -Math.atan((y)/(x))*180/Math.PI
            p.point_start.set('angle', angle - 90);
            scene2D.renderAll();

        } else if (p.point_type === 'edge') {

            p.line1 && p.line1.set({
                'x2': p.left,
                'y2': p.top
            });
            p.line2 && p.line2.set({
                'x1': p.left,
                'y1': p.top
            });
            p.line3 && p.line3.set({
                'x1': p.left,
                'y1': p.top
            });
            p.line4 && p.line4.set({
                'x1': p.left,
                'y1': p.top
            });
            scene2D.renderAll();
        }
    });
        */

        //wallMesh[i].tip = tip;

        /*
        // create arrow points
        var r1 = new fabric.Triangle({
            left: line.get('x1'),
            top: line.get('y1'),
            opacity: 1,
            width: 20,
            height: 20,
            fill: '#000'
        });
        r1.lockScalingX = r1.lockScalingY = r1.lockRotation = true;
        r1.lockRotation = true;
        r1.hasControls = false;
        r1.arrow = wallMesh[i];
        r1.setAngle('-45');
        r1.point_type = 'arrow_start';
        scene2D.add(r1);
        */

        //scene2D.add(scene2DWallMesh[FLOOR][i]);

        //canvas.setActiveObject(line);
    }



/*
    scene2D.on('object:selected', function(e) {
        var p = e.target;
    });

    scene2D.on('before:selection:cleared', function(e) {
        var p = e.target;
    });
*/
}

function scene2DMakeWallPivotCircle(left, top, line1, line2, line3) {
    var c = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: 2,
      radius: 5,
      fill: '#fff',
      stroke: '#666'
    });

    c.hasBorders = c.hasControls = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;

    return c;
}

function scene2DCalculateWallLength() {

    for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++)
    {
        var xOffset = -10;
        var yOffset = -20;

        var line = new fabric.Line([scene2DWallMesh[FLOOR][i].get('x1') + xOffset, scene2DWallMesh[FLOOR][i].get('y1') + yOffset, scene2DWallMesh[FLOOR][i].get('x2') + xOffset, scene2DWallMesh[FLOOR][i].get('y2') + yOffset], {
            fill: '',
            stroke: 'black',
            strokeWidth: 1,
            hasControls: false,
            selectable: false
        });
        scene2D.add(line);
    }
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

        document.body.style.background = 'url(' + canvas.toDataURL('image/png') + ')';

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

        document.body.style.background = 'url(' + canvas.toDataURL('image/png') + ')';

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
            sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 1);
            scene3D.add(sceneAmbientLight);

            //sceneSpotLight.intensity = 0.5;
            //sceneSpotLight.castShadow = true;
            //scene3D.add(sceneSpotLight);

            scene3D.add(sceneDirectionalLight);
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
        sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
        scene3D.add(sceneAmbientLight);
        sceneSpotLight.intensity = 0.4;
        sceneSpotLight.castShadow = false;
        scene3D.add(sceneSpotLight);
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

    scene3D.remove(skyMesh);

    var path = 'objects/Platform/Textures/sky/' + set + "/";
    var sides = [path + 'px.jpg', path + 'nx.jpg', path + 'py.jpg', path + 'ny.jpg', path + 'pz.jpg', path + 'nz.jpg'];

    var scCube = THREE.ImageUtils.loadTextureCube(sides);
    //scCube.format = THREE.RGBFormat;

    var shader = THREE.ShaderLib["cube"]; // prepare skybox material (shader)
    shader.uniforms["tCube"].value = scCube;

    material = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    skyMesh = new THREE.Mesh(new THREE.BoxGeometry(60, 60, 60), material);

    if (set == 'day') {
        skyMesh.position.y = 25;


    }

    //skyMaterial.needsUpdate = true;
    scene3D.add(skyMesh);
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

function scene3DLight() {

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
            var menu = $("#" + id + " .scroll .cssmenu > ul");
            menu.empty();
            $.each(json.menu, function() {
                menu.append(getMenuItem(this));
            });
            $("#" + id + " .scroll .cssmenu > ul > li > a").click(function(event) {
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
        x = scene3DHouseContainer.children[o].position.x + scene3DHouseContainer.children[o].geometry.boundingBox.max.x;
        z = scene3DHouseContainer.children[o].position.z + scene3DHouseContainer.children[o].geometry.boundingBox.max.z;

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
    menu.append("<div id='menuLoading' style='position:relative;left:0;top:0;width:100%;height:100%;background-color:grey;opacity:0.5'>loading...</div>");

    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRight2D').hide();
    $('#menuRightObjects').show();

     $.ajax(path,{
        dataType: 'json',
        success: function(json){
            var empty = "<div style='margin-let:auto;text-align:center;padding:20px'>No Objects In This Category</div>";
            menu.empty();
            try
            {
                //var json = JSON.parse(binary.read('string'));
                $.each(json.menu, function() {
                    if(Object.keys(json.menu).length > 0)
                    {
                        menu.append(getMenuObjectItem(this));
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
            //$("#menuRight3DHouse .scroll .cssmenu > ul > li > a").click(function(event) {
            //    menuItemClick(this);
            //});
        }
    });

    $('#menuLoading').remove();

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
        requestAnimationFrame(animatePanorama);
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

function animateRotate() {

    if (_animate != 0)
        return;

    if(!SceneAnimate)
        animate();

    requestAnimationFrame(animateRotate);
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
    if (_animate != 2)
        return;

    requestAnimationFrame(animateFloor);
    var delta = clock.getDelta();
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
    camera3DMirrorReflection.updateCubeMap(renderer, scene3D); //capture the reflection
    sceneSpotLight.visible = true;
    //cene3D.add(scene3DFloorGroundContainer);
    //scene3DFloorGroundContainer.children[0].visible = true;

    particlePivot.tick(delta);
    controls3D.update(delta);

    renderer.render(scene3D, camera3D);
    TWEEN.update();
}

function animateLandscape()
{
    if (_animate != 4)
        return;

    requestAnimationFrame(animateLandscape);

    var delta = clock.getDelta(); //have to call this before getElapsedTime()
    //var time = clock.getElapsedTime();

    //terrain3DMaterial.map = terrain3D.getSculptDisplayTexture();
    if(controls3D.enabled && leftButtonDown && TOOL3DLANDSCAPE == "rotate")
        controls3D.update(delta);

    //renderer.autoClear = false;
    //renderer.clear();
    //terrain3D.update(delta);
    terrain3D.water.material.uniforms.time.value = new Date().getTime() % 10000;

    renderer.render(scene3D, camera3D);
    //TWEEN.update();
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
    weatherSkyMesh.rotation.y = camera3D.rotation.y; //spiral
    weatherSkyMesh.rotation.z = camera3D.rotation.z; //side-to-side
    weatherSkyMesh.rotation.x = camera3D.rotation.x; //top
    weatherSkyMesh.position.x = camera3D.position.x / 1.5;

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
    if (_animate != 1)
        return;

    requestAnimationFrame(animateHouse);
    var delta = clock.getDelta();

    if (controls3D instanceof THREE.OrbitControls)
    {
        particlePivot.tick(delta);
        particleWeather.tick(delta);

        animateClouds();

        rendererCube.render(scene3DCube, camera3DCube);
        /*
        for (var a in animation) {
            a.update(delta * 0.8);
        }
        */
    }
    controls3D.update(delta);

    renderer.render(scene3D, camera3D);
    
    if(getScreenshotData == true){
        getScreenshotData = false;
        window.open(renderer.domElement.toDataURL('image/png'), 'Final');
    }

    TWEEN.update();

    //stats.update();
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
    if (_animate != 3)
        return;

    requestAnimationFrame(animateRoof);

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

function animate()
{
    //Look into Threading this with WebWorkers > http://www.html5rocks.com/en/tutorials/workers/basics/

    if (SCENE == 'house')
    {
        if (SceneAnimate)
        {
            _animate = 0;
            camera3D.position.set(0, 6, 20);
            TWEEN.removeAll(); //avoid any tween checks whilre rotating (faster)
            animateRotate();
        }else{
            _animate = 1;
            animateHouse();
            //camera3DHouseEnter();
        }
    }
    else if (SCENE == 'floor')
    {
        _animate = 2;
        animateFloor();
    }
    else if (SCENE == 'landscape' || SCENE == 'floorlevel')
    {
        _animate = 4;
        animateLandscape();
    }
    else if (SCENE == 'roof')
    {
        _animate = 3;
        animateRoof();
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
    /*
    var sprites = [
    { "size"        : 64},
    { "arraySize"   : 5 }, 
    { "path1"       : ""}, 
    { "firstName"   : "Peter" , "lastName" : "Jones" }, ];
    */

    var numberOfIcons = 8;
    var offsetAngleDegress = 360/numberOfIcons;
    var offsetAngle = offsetAngleDegress * Math.PI / 180;
    var circleOffset = $("#WebGLInteractiveMenu").width()/2;
    var tooltips = ["Move Horizontaly", "Info", "Duplicate", "Resize", "Textures", "Rotate", "Remove", "Object Notes"];
    var actions = ["enableTransformControls('translate')", "", "", "enableTransformControls('scale')", "toggleTextureSelect()", "enableTransformControls('rotate')", "scene3DObjectSelectRemove()", "camera3DNoteAdd()"];

    //We need to get size of the object, which is currently isn't on page.
    //So we gonna create a dummy, read everything we need and then delete it.

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

    $('.tooltip').tooltipster({
        animation: 'fade',
        delay: 200,
        theme: 'tooltipster-default',
        touchDevices: false,
        trigger: 'hover',
        position: 'bottom',
        contentAsHTML: true
    });

    $('.scroll').jscroll({
        loadingHtml: '',
        //padding: 20,
        //nextSelector: 'a.jscroll-next:last',
        //contentSelector: 'li'
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

    window.location.href = "#scene";
});