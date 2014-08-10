/*
WebGL HousePlanner v 1.0
Preview: http://houseplanner.iroot.ca
Source Code: https://github.com/poofik/webgl-houseplanner

TODO:
- [difficulty: 10/10 progress: 10%] Finish 2D floor plan gyometry drafting
- [difficulty: 3/10  progress: 90%] 2D floor plan select and overlay external draft image
- [difficulty: 8/10  progress: 10%] Toolbar edit functions for 2D floor plans
- [difficulty: 9/10  progress: 25%] Make converter function to "extrude" 2D into 3D walls
- [difficulty: 6/10  progress: 0%]  Make front walls 80% transparent in 3D rotation
- [difficulty: 8/10  progress: 50%] 3D movable objects and collision detection
- [difficulty: 9/10  progress: 10%] 3D menu objects draggable with "pop-up" or star burst effect
- [difficulty: 2/10  progress: 90%] 3D objects sub-edit menu (textures/delete/duplicate)
- [difficulty: 2/10  progress: 40%] Categorize and populate 3D Menu items
- [difficulty: 8/10  progress: 20%] 3D Menu functions for draggable objects
- [difficulty: 5/10  progress: 50%] 3D Floor ground base glass reflective
- [difficulty: 6/10  progress: 0%]  3D Exterior View ability to select floors (+ flying-in animationeffect)
- [difficulty: 6/10  progress: 0%]  Keep history and implement Undo/Redo
- [difficulty: 6/10  progress: 10%]  Make House Ground editable - angle/terain/square ex: downhill house http://cjcliffe.github.io/CubicVR.js/experiment/landscape_editor/landscape_edit_500m.html
- [difficulty: 4/10  progress: 60%] Ability to save scene 3D & 2D
- [difficulty: 5/10  progress: 1%]  Ability to open scene 3D & 2D
- [difficulty: 6/10  progress: 0%]  Keep history and implement Undo/Redo
- [difficulty: 6/10  progress: 90%] 3D Exterior View create night scene atmosphere with proper lights
- [difficulty: 8/10  progress: 0%]  3D Exterior View auto rotate-snap on ground angle
- [difficulty: 4/10  progress: 1%]  Make a nice rainbow glow for 3D house exterior view - idea came after a 2 second glitch with video card :)
*/

//"use strict";

if (!Detector.webgl) Detector.addGetWebGLMessage();

// workaround for chrome bug: http://code.google.com/p/chromium/issues/detail?id=35980#c12
if (window.innerWidth === 0) {
    window.innerWidth = parent.innerWidth;
    window.innerHeight = parent.innerHeight;
}

var scene3D; //ThreeJS Canvas
var scene3DCube; //ThreeJS Canvas
var scene2D; //HTML Canvas

var renderer;
var rendererCube;
var rendererMenu;

var scene3DRoofContainer; //Contains Roof Design
var scene3DHouseContainer; //Contains all Exterior 3D objects by floor (trees,fences)
var scene3DHouseGroundContainer; //Grass Ground - 1 object
var scene3DHouseFXContainer; //Visual Effects container (user not editable/animated) - fying bugs/birds/rainbows
var scene3DFloorGroundContainer; //Floor Ground - 1 object
var scene3DFloorLevelGroundContainer; //Floor Level arrengment Ground - 1 object
var scene3DFloorContainer = []; //Contains all Floor 3D objects by floor (sofas,tables)
var scene3DFloorWallContainer = []; //3D Layer contains all walls by floor (Reason for multidymentional array -> unique wall coloring) - extracted from scene2DWallGeometry & scene2DWallDimentions
var scene2DFloorDraftPlanImage = []; //2D Image for plan tracing for multiple floors

var scene3DPivotPoint; //3D Layer rotational pivot point - 1 object
var scene3DCubeMesh;

var sceneAmbientLight;
var sceneDirectionalLight;
var sceneSpotLight;
var sceneHemisphereLight;
//var sceneParticleLight;
//var scenePointLight;

var controls3D;

var camera3D;
var camera3DQuad = [3];
var camera3DQuadGrid;
var camera3DCube;
var camera3DMirrorReflection;

var groundGrid;
var groundMesh;
var glowMesh;

var skyMesh;
var weatherSkyDayMesh;
var weatherSkyNightMesh;
var weatherSnowMesh;
var weatherRainMesh;

var RUNMODE = 'local'; //database
var VIEWMODE = 'designer' //public
var RADIAN = Math.PI / 180;
var AUTOROTATE = true;
var SCENE = 'house';
var TOOL3D = 'view';
var TOOL3DINTERACTIVE = '';
var TOOL3DLANDSCAPE = 'rotate';
var TOOL3DFLOOR = '';
var TOOL2D = 'vector';
var WEATHER = 'sunny';
var DAY = 'day';
var FLOOR = 1; //first floor selected default
var REALSIZERATIO = 1; //Real-life ratio (Metric/Imperial)
var SELECTED;

var leftButtonDown = false;
var clickTime;

//var keyboard = new THREE.KeyboardState();

var scene2DDrawLineGeometry = []; //Temporary holder for mouse click and drag drawings
var scene2DDrawLine; //2D Line form with color/border/points
//var scene2DDrawLineContainer = []; //Container of line geometries - need it as a collection for "quick hide"
var scene2DWallGeometry = []; //Multidymentional array, many floors have many walls and walls have many geomertry points
var scene2DWallDimentions = []; //Multidymentional array, contains real-life (visual) dimentions for scene2DWallGeometry [width,length,height,height-angle,angle]
var scene3DWallTexture; //Wall Default Texture

var scene2DWallRegularMaterial;
var scene2DWallRegularMaterialSelect;
var scene2DWallBearingMaterial;
var scene2DWallBearingMaterialSelect;

var animation = [];
var mouse;
var clock;
var engine;
var projector;
var vector;
var geometry;
var material;
var texture;
var mesh;
var zip;
//var stats;

var fileReader; //HTML5 local file reader
//var progress = document.querySelector('.percent');

function init(runmode,viewmode) {

	RUNMODE = runmode;
	VIEWMODE = viewmode;

    if(RUNMODE == "local")
    {
        $("#menuTopItem14").hide();
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
    //$('#canvas_container').css('overflow-x', 'scroll');
    //$('#canvas_container').css('overflow-y', 'scroll'); //'hidden');


    //scene2D.renderAll();
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    fabric.Object.prototype.transparentCorners = false;

    projector = new THREE.Projector();
    //zip = new JSZip();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();

    scene3DRoofContainer = new THREE.Object3D();
    scene3DHouseContainer = new THREE.Object3D();
    scene3DHouseGroundContainer = new THREE.Object3D();
    scene3DHouseFXContainer = new THREE.Object3D();
    scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DFloorLevelGroundContainer = new THREE.Object3D();

    scene3DFloorContainer[0] = new THREE.Object3D();
    scene3DFloorContainer[1] = new THREE.Object3D();
    scene3DFloorContainer[2] = new THREE.Object3D();

    scene3DFloorWallContainer[0] = new THREE.Object3D();
    scene3DFloorWallContainer[1] = new THREE.Object3D();
    scene3DFloorWallContainer[2] = new THREE.Object3D();

    scene2DWallGeometry[0] = new Array();
    scene2DWallGeometry[1] = new Array();
    scene2DWallGeometry[2] = new Array();

    scene2DWallDimentions[0] = new Array();
    scene2DWallDimentions[1] = new Array();
    scene2DWallDimentions[2] = new Array();

    scene3DPivotPoint = new THREE.Object3D();


    //60 times more geometry
    //THREE.GeometryUtils.merge(geometry, otherGeometry);

    //VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera3D = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 80);
    camera3D.lookAt(new THREE.Vector3(0, 0, 0));

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

    //================================
    scene2D.add(new fabric.Circle({
        radius: 450,
        fill: '#CCCCCC',
        left: (window.innerWidth / 2),
        top: (window.innerHeight / 2) + 80,
        selectable: false,
        opacity: 0.2
    }));

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
    //================================

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
    

    texture = new THREE.ImageUtils.loadTexture('./objects/FloorPlan/P0001.png');
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

    texture = new THREE.ImageUtils.loadTexture('./objects/FloorPlan/P0002.png');
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

    //THREE.GeometryUtils.merge(geometry, mesh);

    //scene2D.add(new THREE.GridHelper(100, 10));

    //A 1x1 Rectangle for Scale - Should Map to a 1x1 square of Three.js space
    //scene2D.fillStyle = "#FF0000";
    //scene2D.fillRect(0, 0, 1, 1);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        //clearColor: 0x34583e,
        clearAlpha: 0.5
        //preserveDrawingBuffer: false
    });
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
    renderer.shadowMapType = THREE.PCFSoftShadowMap; //THREE.PCFShadowMap; //THREE.BasicShadowMap;
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
    camera3DCube = new THREE.PerspectiveCamera(60, 1, 1, 1000);
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

    // move mouse and: left   click to rotate,  middle click to zoom, right  click to pan
    controls3D = new THREE.OrbitControls(camera3D, renderer.domElement);
    controls3D.minDistance = 3;
    controls3D.maxDistance = 25; //Infinity;
    //controls3D.minPolarAngle = 0; // radians
    //controls3D.maxPolarAngle = Math.PI; // radians
    controls3D.maxPolarAngle = Math.PI / 2; //Don't let to go below the ground


    //controls2D = new THREE.OrbitControls(camera2D, renderer.domElement);

    controls3D.target = new THREE.Vector3(0, 0, 0); //+ object.lookAT!
    //controls2D.target = new THREE.Vector3(0, 0, 0); //+ object.lookAT!

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
    scene3DSky();
    scene3DLight();
    show3DHouse();

    selectMeasurement();

    $('#menuWeatherText').html("Sunny");
    $('#menuDayNightText').html("Day");

    animate();
}

/*
function loadDAE(file, object, x, y, z, xaxis, yaxis, ratio) {

    loader.load('./objects/dae/' + file, function(collada) {
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

function scene2DdrawRuler() {
    line_length = window.innerWidth - 100;
    $("#ruler[data-items]").val(line_length);

    $("#ruler[data-items]").each(function() {
        var ruler = $(this).empty(),
            len = Number($("#ruler[data-items]").val()) / 38 || 0,
            item = $(document.createElement("li")),
            i;
        ruler.append(item.clone().text(1));

        for (i = 1; i < len; i++) {
            ruler.append(item.clone().text(i * 2));
        }
        ruler.append(item.clone().text(i * 2));
    });
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

function open3DModel(js, object, x, y, z, xaxis, yaxis, ratio, shadow) {

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
    var url = "./objects/" + js;
    var urlTextures = "./objects/" + js.substring(0, js.lastIndexOf("/") + 1) + "Textures/";
    var data;

    //console.log("Textures:" + urlTextures);

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

        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
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
        mesh.doubleSided = false;

        mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals(); // requires correct face normals
        mesh.geometry.computeBoundingBox(); // otherwise geometry.boundingBox will be undefined

        mesh.matrixAutoUpdate = true;
        mesh.updateMatrix();

        //if (object instanceof THREE.Object3D) {
        object.add(mesh);
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
        var zip = new JSZip();
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
				
                url = "./objects/" + js.slice(0, -4) + ".js";
                break;
            default:
        }
		*/

        //jBinary works for both online and offline

        jBinary.load(url, function(err, binary) {
            try {
                zip.load(binary.read('string'));
                data = zip.file(filename + ".js").asText();
                data = JSON.parse(data);
                //loader.loadJson(data, callback, urlTextures);
                var result = loader.parse(data, urlTextures);
                callback(result.geometry, result.materials);

            } catch (exception) { //zip file was probably not found, load regular json
                loader.load(url.slice(0, -1), callback, urlTextures);
            }
        });

    } else {

        loader.load(url, callback, urlTextures);
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

    SCENE = 'house';

    hideElements();
    initMenu("menuRight3DHouse","Exterior/index.json");
 
    scene3DSetSky(DAY);
    scene3DSetLight()
    scene3DSetWeather();

    //the camera defaults to position (0,0,0) so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
    camera3D.position.set(0, 6, 20);

    //TODO: Loop and show based in ID name

    scene3D.add(scene3DHouseGroundContainer);
    scene3D.add(scene3DHouseFXContainer);
    scene3D.add(scene3DHouseContainer);
    scene3D.add(scene3DRoofContainer);

    for (var i = 0; i < scene3DFloorContainer.length; i++) {
        scene3D.add(scene3DFloorContainer[i]);
    }
    scene3DCube.add(scene3DCubeMesh);

    //$(renderer.domElement).bind('mousemove', on3DMouseMove);
    $(renderer.domElement).bind('mousedown', on3DMouseDown);
    $(renderer.domElement).bind('mouseup', on3DMouseUp);
    $(renderer.domElement).bind('dblclick', onDocumentDoubleClick);

    if (TOOL3DINTERACTIVE == 'moveXY') {
        menuSelect(0, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'moveZ') {
        menuSelect(1, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'rotate') {
        menuSelect(2, 'menuInteractiveItem', '#ff3700');
    }
    $('#menuDayNight').show();
    $('#menuWeather').show();

    toggleRight('menuRight', true);
    toggleLeft('menuLeft3DHouse', true);

    menuSelect(1, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //scene3DHouseContainer.traverse;


    $('#WebGLCanvas').show();
}

function show3DLandscape() {

    SCENE = 'landscape';

    hideElements();

    //scene3DSetBackground('blue');
    scene3DSetSky('day');
    scene3DSetLight();

    camera3D.position.set(0, 3.5, 22);

    scene3D.add(scene3DHouseGroundContainer);

    $(renderer.domElement).bind('mousedown', on3DLandscapeMouseDown);
    $(renderer.domElement).bind('mouseup', on3DLandscapeMouseUp);

    TOOL3DLANDSCAPE = 'rotate';

    menuSelect(0, 'menuLeft3DLandscapeItem', '#ff3700');
    toggleLeft('menuLeft3DLandscape', true);

    menuSelect(2, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    $('#WebGLCanvas').show();
}

function show3DFloor() {

    SCENE = 'floor';

    hideElements();
    initMenu("menuRight3DFloor","Interior/index.json");

    scene3DSetBackground('blue');
    scene3DSetLight();

    camera3D.position.set(0, 10, 12);

    //TODO: Loop and show based in ID name / floor
    //scene3D.add(scene3DContainer);

    scene3D.add(scene3DFloorGroundContainer);
    scene3D.add(camera3DMirrorReflection);

    try {
        var floorMaterial = new THREE.MeshPhongMaterial({
            map: scene3DFloorGroundContainer.children[0].materials[0], //.map,
            envMap: camera3DMirrorReflection.renderTarget,
            reflectivity: 0.5
        });
        scene3DFloorGroundContainer.children[0].materials = floorMaterial;
    } catch (ex) {

    }

    scene3DFloorWallGenerate();
    scene3D.add(scene3DFloorContainer[FLOOR]); //furnishings
    scene3D.add(scene3DFloorWallContainer[FLOOR]); //walls

    scene3DCube.add(scene3DCubeMesh);

    //$(renderer.domElement).bind('mousemove', on3DMouseMove);
    $(renderer.domElement).bind('mousedown', on3DMouseDown);
    $(renderer.domElement).bind('mouseup', on3DMouseUp);
    $(renderer.domElement).bind('dblclick', onDocumentDoubleClick);

    //scene3DFloorContainer[0].traverse;
    $('#menuFloorSelectorText').html(scene3DFloorContainer[FLOOR].name);
    $('#menuFloorSelector').show();

    toggleRight('menuRight', true);
    toggleLeft('menuLeft3DFloor', true);

    menuSelect(5, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    $('#WebGLCanvas').show();
}

function show3DFloorLevel() {

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
}

function show3DRoofDesign() {

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
}

function show2D() {

    SCENE = '2d';

    //camera2D.position.set(0, 8, 20);
    hideElements();
    initMenu("menuRight2D","FloorPlan/index.json");

    scene3DSetBackground(null);

    if (TOOL2D == 'freestyle') {
        menuSelect(1, 'menuLeft2DItem', '#ff3700');
        scene2D.isDrawingMode = true;
    } else if (TOOL2D == 'vector') {
        menuSelect(2, 'menuLeft2DItem', '#ff3700');
        scene2D.isDrawingMode = false;
        //} else if (TOOL2D == 'square') {

        //} else if (TOOL2D == 'circle') {
    }

    toggleRight('menuRight', true);
    toggleLeft('menuLeft2D', true);

    $('#menuFloorSelectorText').html(scene3DFloorContainer[FLOOR].name);
    $('#menuFloorSelector').show();

    //scene2DdrawRuler();

    menuSelect(6, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //Auto close right menu
    document.getElementById('menuRight').setAttribute("class", "hide-right");
    delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

    $('#HTMLCanvas').show();
}

function hideElements() {
    //console.log("hideElements " + b);

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    scene3D.remove(camera3DQuad[0]);
    scene3D.remove(camera3DQuad[1]);
    scene3D.remove(camera3DQuad[2]);
    scene3D.remove(camera3DQuad[3]);
    scene3D.remove(camera3DQuadGrid);

    scene3D.remove(skyMesh); //TODO: think of better way avoiding double remove 1 here 1 in scene3DSetSky
    scene3D.remove(weatherSkyDayMesh);
    scene3D.remove(weatherSkyNightMesh);
    //=================================

    scene3D.remove(scene3DHouseGroundContainer);
    scene3D.remove(scene3DRoofContainer);

    scene3D.remove(scene3DFloorGroundContainer);
    scene3D.remove(camera3DMirrorReflection);

    scene3D.remove(scene3DFloorLevelGroundContainer);

    scene3D.remove(scene3DHouseContainer);
    scene3D.remove(scene3DHouseFXContainer);

    for (var i = 0; i < scene3DFloorContainer.length; i++) {
        scene3D.remove(scene3DFloorContainer[i]);
        scene3D.remove(scene3DFloorWallContainer[i]);
    }

    //scene2D.clear();

    scene3DCube.remove(scene3DCubeMesh);

    $(renderer.domElement).unbind('mousedown', on3DMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DMouseUp);
    $(renderer.domElement).unbind('dblclick', onDocumentDoubleClick);

    $(renderer.domElement).unbind('mousedown', on3DLandscapeMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DLandscapeMouseUp);


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
    $('#menuDayNight').hide();
    $('#menuWeather').hide();

    scene3DObjectUnselect();

    if (engine instanceof ParticleEngine) {
        engine.destroy();
        engine = null;
    }
    //scene3D.visible = !b;
    //scene2D.visible = b;

    //scene2DFloorContainer[0].traverse;
}

function scene3DSetWeather() {

    if (engine instanceof ParticleEngine) {
        engine.destroy();
        engine = null;
    }

    if (WEATHER == "sunny") {

        //TODO: maybe add sun glare effect shader?

    } else if (WEATHER == "snowy") {

        engine = new ParticleEngine();
        engine.setValues(weatherSnowMesh);
        engine.initialize();

    } else if (WEATHER == "rainy") {

        engine = new ParticleEngine();
        engine.setValues(weatherRainMesh);
        engine.initialize();
    }

    scene3D.remove(weatherSkyDayMesh);
    scene3D.remove(weatherSkyNightMesh);

    if (DAY == 'day') {
        scene3D.add(weatherSkyDayMesh);
    } else if (DAY == 'night') {
        scene3D.add(weatherSkyNightMesh);
    }
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
    if (scene3DFloorContainer[i] instanceof THREE.Object3D) {

        FLOOR = i;

        //TODO: would be awsome to have some kind of flip transition effect

        if (SCENE == 'floor') {
            show3DFloor();

        } else if (SCENE == '2d') {
            show2D();
        }
    }
}

function selectMeasurement() {

    if (REALSIZERATIO == 1.8311874) {
        $('#menuMeasureText').html("Imperial");
        REALSIZERATIO = 1; //Imperial Ratio TODO: Get the right ratio
    } else {
        $('#menuMeasureText').html("Metric");
        REALSIZERATIO = 1.8311874; //Metric Ratio
    }
}

function selectDayNight() {

    if (DAY == "day") {

        DAY = "night";
        $('#menuDayNightText').html("Night");
        $('#menuDayNightIcon').attr("class", "hi-icon icon-night tooltip");

    } else if (DAY == "night") {

        DAY = "day";
        $('#menuDayNightText').html("Day");
        $('#menuDayNightIcon').attr("class", "hi-icon icon-day tooltip");
    }
    scene3DSetSky(DAY);
    scene3DSetLight();
    scene3DSetWeather();
}

function selectWeather() {

    if (WEATHER == "sunny") {

        WEATHER = "snowy";
        $('#menuWeatherText').html("Snowy");

    } else if (WEATHER == "snowy") {

        WEATHER = "rainy";
        $('#menuWeatherText').html("Rainy");

    } else if (WEATHER == "rainy") {

        WEATHER = "sunny";
        $('#menuWeatherText').html("Sunny");
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

    if (scene3D.visible) {

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;

        //TODO: zoom out far, reset pivot-point to 0,0,0

        //if (new Date().getTime() - 150 < clickTime) { //Set pivot-point to clicked coordinates

        vector = new THREE.Vector3(x, y, 0.5);
        projector.unprojectVector(vector, camera3D);
        var raycaster = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());
        var intersects = raycaster.intersectObjects(scene3DHouseGroundContainer.children);

        if (intersects.length > 0) {

            scene3DPivotPoint.position.set(intersects[0].point.x, 0, intersects[0].point.z);
            scene3D.add(scene3DPivotPoint);

            //http://stemkoski.github.io/Three.js/Particle-Engine-Fireworks.html
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

                sizeTween: new Tween([0, 0.02], [1, 0.4]),
                opacityTween: new Tween([2, 3], [1, 0]),
                colorTween: new Tween([0.5, 2], [new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(0.8, 1, 0.5)]),

                particlesPerSecond: 30,
                particleDeathAge: 4.0,
                emitterDeathAge: 1.0
            };
            engine.setValues(fountain);
            engine.initialize();

            controls3D.target = new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z); //having THREE.TrackballControls or THREE.OrbitControls seems to override the camera.lookAt function

            setTimeout(function() {
                scene3D.remove(scene3DPivotPoint);
                engine.destroy();
                engine = null;
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
    if (event.which == 1) leftButtonDown = true; // Left mouse button was pressed, set flag

    //$("#HTMLCanvas").bind('mousemove', on2DMouseMove);
    // fabric.util.addListener(fabric.document, 'dblclick', dblClickHandler);
    //fabric.util.removeListener(canvas.upperCanvasEl, 'dblclick', dblClickHandler); 

    $("#menuWallInput").hide(); //TODO: analyze and store input


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

    if (event.which == 1) leftButtonDown = false; // Left mouse button was released, clear flag

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
        img.src = "./objects/FloorPlan/Hatch Patterns/ansi31.gif"; //pattern.toDataURL();
        $("#menuWallInput").css('left', scene2DWallGeometry[FLOOR][i][p][0]);
        $("#menuWallInput").css('top', scene2DWallGeometry[FLOOR][i][p][1]);
        $("#menuWallInput").show();
        */
    }
}

function on2DMouseMove(event) {

    event.preventDefault();

    if (!leftButtonDown) {
        return;
    }
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

    //if (!leftButtonDown)
    //    return;

    if (TOOL3DLANDSCAPE == "angle") {
        if (event.clientX > window.innerWidth / 2) {
            scene3DHouseGroundContainer.children[0].rotation.z = scene3DHouseGroundContainer.children[0].rotation.z + 0.02;
        } else {
            scene3DHouseGroundContainer.children[0].rotation.z = scene3DHouseGroundContainer.children[0].rotation.z - 0.02;
        }
    }
}

function on3DLandscapeMouseDown(event) {

    event.preventDefault();
    //if (event.which == 1) leftButtonDown = true;

    $(renderer.domElement).bind('mousemove', on3DLandscapeMouseMove);

    if (TOOL3DLANDSCAPE != "rotate") {

        controls3D.enabled = false;
    }
}

function on3DLandscapeMouseUp(event) {

    event.preventDefault();
    //if (event.which == 1) leftButtonDown = false;

    $(renderer.domElement).unbind('mousemove', on3DLandscapeMouseMove);

    controls3D.enabled = true;
}

function on3DMouseMove(event) {

    event.preventDefault();

    if (!leftButtonDown) {
        return;
    }

    //if (SCENE == '2d') {

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

            if (mouse.x != 0 && mouse.y != 0) {

                geometry = new THREE.Geometry();
                geometry.vertices.push(new THREE.Vector3(mouse.x, mouse.y, 0.5));
                geometry.vertices.push(new THREE.Vector3(pos.x, pos.y, 0.5));
                //scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(x, y, 0.5));
                //scene2DDrawLineGeometry.computeLineDistances(); //what is this?
                scene2DDrawLineGeometry.merge(geometry);

                scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineMaterial);
                //scene2DDrawLineContainer.add(scene2DDrawLine);
                scene2D.add(scene2DDrawLineContainer);
            }
            mouse.x = pos.x;
            mouse.y = pos.y;
        */
    //} else {

    if (SELECTED != null) {

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;

        $('#WebGLInteractiveMenu').hide();

        if (TOOL3DINTERACTIVE == 'moveXY') {


            vector = new THREE.Vector3(x, y, 0.5);
            projector.unprojectVector(vector, camera3D);
            var raycaster = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());
            var intersects = raycaster.intersectObjects(scene3DHouseGroundContainer.children);
            /*
                var c = THREE.Collisions.rayCastNearest(raycaster);
                if (c) {
                    console.log("Found @ distance " + c.distance.toFixed(2));
                }
                */

            if (intersects.length > 0) {
                //console.log('intersect: ' + intersects[0].point.x.toFixed(2) + ', ' + intersects[0].point.y.toFixed(2) + ', ' + intersects[0].point.z.toFixed(2) + ')');
                SELECTED.position.x = intersects[0].point.x;
                SELECTED.position.z = intersects[0].point.z;

                /*
                    var originPoint = intersects[0].object.position.clone();
                    for (var i = 0; i < intersects[0].object.geometry.vertices.length; i++) {

                        var globalVertex = intersects[0].object.geometry.vertices[i].applyMatrix4(intersects[0].object.matrix);
                        var directionVector = globalVertex.sub(intersects[0].object.position);
                        var ray = new THREE.Raycaster(originPoint, directionVector.normalize());
                        var collisionResults = ray.intersectObjects(scene3DHouseContainer.children);

                        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                            console.log("bump");
                            break;
                        }
                    }
                    */
            }

        } else if (TOOL3DINTERACTIVE == 'moveZ') {

            if (SELECTED.position.y >= 0) {

                if (mouse.y >= y && y > 0) {

                    SELECTED.position.y -= y;

                } else {

                    SELECTED.position.y += y;
                }

                //SELECTED.position.y = y;
            } else {
                SELECTED.position.y = 0;
            }

        } else if (TOOL3DINTERACTIVE == 'rotate') {

            //SELECTED.rotation.x += x * Math.PI / 180;
            //SELECTED.rotation.y += y * Math.PI / 180;
            //SELECTED.rotation.z += x; // * Math.PI / 180;

            if (mouse.x >= x && x > 0) {
                SELECTED.rotation.y += x / 4;
            } else {
                SELECTED.rotation.y -= x / 4;
            }
            //var axis = new THREE.Vector3(x, y, 0);
            //SELECTED.rotateOnAxis(axis, 0);
        }
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

    //clickTime = new Date().getTime();

    $(renderer.domElement).bind('mousemove', on3DMouseMove);

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    AUTOROTATE = false;
    //renderer.antialias = false;

    //console.log("Mouse Down " + mouse.x + ":" + mouse.x + " " + event.clientX + "|" + window.innerWidth + ":" + event.clientY + "|" + window.innerHeight + " -> " + camera3D.position.z);
    if (scene3DObjectSelect(mouse.x, mouse.y, camera3D)) {

        //Focus on 3D object

        //camera3D.fov = currentFov.fov;
        //camera3D.lookAt(intersects[0].object.position);
        //camera3D.updateProjectionMatrix();

        /*
                var destinationQuaternion = new THREE.Quaternion(SELECTED.position.x, SELECTED.position.y, SELECTED.position.z, 1);
                var newQuaternion = new THREE.Quaternion();
                THREE.Quaternion.slerp(camera3D.quaternion, destinationQuaternion, newQuaternion, 0.07);
                camera3D.quaternion = newQuaternion;
                camera3D.quaternion.normalize();
                scene3D.updateMatrixWorld();
                */

        //Reset camera?
        //var vector = new THREE.Vector3( 1, 0, 0 ); 
        //vector.applyQuaternion( quaternion );

        scene3DObjectSelectMenu(mouse.x, mouse.y);

        $('#WebGLInteractiveMenu').show();

    } else {
        $('#WebGLInteractiveMenu').hide();
        scene3D.add(scene3DPivotPoint);
    }

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

    if (SELECTED != null) { //Restore menu after MouseMove
        scene3DObjectSelectMenu(mouse.x, mouse.y);

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
        scene3DHouseContainer.remove(SELECTED);
    } else if (SCENE == 'floor') {
        scene3DFloorContainer[FLOOR].remove(SELECTED);
    }

    $('#WebGLInteractiveMenu').hide();
}

function scene3DObjectSelectMenu(x, y) {

    //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    vector = new THREE.Vector3(x, y, 0.5);

    var percX, percY

    // projectVector will translate position to 2d
    vector = projector.projectVector(vector.setFromMatrixPosition(SELECTED.matrixWorld), camera3D); //vector will give us position relative to the world

    // translate our vector so that percX=0 represents the left edge, percX=1 is the right edge, percY=0 is the top edge, and percY=1 is the bottom edge.
    percX = (vector.x + 1) / 2;
    percY = (-vector.y + 1) / 2;

    // scale these values to our viewport size
    vector.x = percX * window.innerWidth - $('#WebGLInteractiveMenu').width() * 2;
    vector.y = percY * window.innerHeight - $('#WebGLInteractiveMenu').height(); // / 2;

    $('#WebGLInteractiveMenu').css('top', vector.y).css('left', vector.x);

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

function scene3DObjectSelect(x, y, camera) {

    vector = new THREE.Vector3(x, y, 0.5);
    //var projector = new THREE.Projector();
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects;
    //var raycaster = projector.pickingRay(vector.clone(), camera3D);
    //if (scene3DHouseContainer instanceof THREE.Object3D) {

    //TODO: Find better way of detection - avoiding variable store
    if (SCENE == 'house') {
        intersects = raycaster.intersectObjects(scene3DHouseContainer.children);
    } else if (SCENE == 'floor') {
        intersects = raycaster.intersectObjects(scene3DFloorContainer[FLOOR].children);
    } else {
        return;
    }

    // INTERSECTED = the object in the scene currently closest to the camera 
    // and intersected by the Ray projected from the mouse position

    if (intersects.length > 0) { // case if mouse is not currently over an object
        //console.log("Intersects " + intersects.length + ":" + intersects[0].object.id);
        controls3D.enabled = false;

        if (SELECTED != intersects[0].object) {

            scene3DObjectUnselect(); //avoid showing multiple selected objects

            SELECTED = intersects[0].object;

            //http://jeromeetienne.github.io/threex.geometricglow/examples/geometricglowmesh.html
            glowMesh = new THREEx.GeometricGlowMesh(SELECTED);
            SELECTED.add(glowMesh.object3d);

            // example of customization of the default glowMesh
            //var insideUniforms = glowMesh.insideMesh.material.uniforms;
            //insideUniforms.glowColor.value.set('hotpink');
            //var outsideUniforms = glowMesh.outsideMesh.material.uniforms;
            //outsideUniforms.glowColor.value.set('hotpink');
        }
        return true;
    } else {
        scene3DObjectUnselect();
        controls3D.enabled = true;
        return false;
    }
}

function scene3DObjectUnselect() {

    if (SELECTED != null && glowMesh instanceof THREEx.GeometricGlowMesh) {
        SELECTED.remove(glowMesh.object3d);
    }

    SELECTED = null;

    $('#WebGLInteractiveMenu').hide();
}

function exportPDF() {
    if (!fabric.Canvas.supports('toDataURL')) {
        alert('Sorry, your browser is not supported.');
    } else {
        var doc = new jsPDF('l', 'in', [8.5, 11]);

        doc.setFontSize(40);
        doc.text(4.5, 1, scene3DFloorContainer[FLOOR].name);

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


        //saveAs(doc.output('dataurl'), scene3DFloorContainer[FLOOR].name + ".pdf");
        //doc.save(scene3DFloorContainer[FLOOR].name + ".pdf");
        //saveAs(doc.output('blob'), scene3DFloorContainer[FLOOR].name + ".pdf");
    }
}

function exportJSON() {

    //var exporter = new THREE.SceneExporter().parse(scene);
    //var exporter = JSON.stringify(new THREE.ObjectExporter().parse(scene3D));

    setTimeout(function() {

        zip = new JSZip();

        //zip.file("scene3D.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3D)));
        zip.file("scene3DHouseContainer.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DHouseContainer)));
        zip.file("scene3DHouseGroundContainer.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DHouseGroundContainer)));

        for (var i = 0; i < scene3DFloorContainer.length; i++) {
            zip.file("scene3DFloorContainer." + i + ".js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DFloorContainer[i])));
        }
        //zip.file("scene3DFloorGroundContainer.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DFloorGroundContainer)));

        /*
        for (var i = 0; i < scene2DFloorContainer.length; i++) {
            //scene2D.clear();
            //scene2D.add(scene2DFloorContainer[i])

            //zip.file("scene2DFloorContainer." + i + ".js", JSON.stringify(scene2DFloorContainer[i]));
            zip.file("scene2DFloorContainer." + i + ".svg", scene2DFloorContainer[i].toSVG());

            //zip.file("scene2DFloorContainer." + i + ".js", JSON.stringify(scene2DFloorContainer.toDatalessJSON()));
        }
        */

        zip.file("house.jpg", imageBase64('imgHouse'), {
            base64: true
        });

        var textures = zip.folder("Textures");
        /*textures.file("house.jpg", imgData, {
        base64: true
    });
    */
        zip.file("ReadMe.txt", "Saved by WebGL HousePlanner. Files can be opened by THREE.js Framework");

        var content = zip.generate({
            type: "blob"
        });
        /*
    var content = zip.generate({
        type: "string"
    });
    */
        //location.href="data:application/zip;base64," + zip.generate({type:"base64"});

        saveAs(content, "scene.zip");

        window.location = "#close";

    }, 1000);
}

function importJSON(zipData) {

    zip = new JSZip(zipData);

    //zip.folder("Textures").load(data);
    //var text = zip.file("hello.txt").asText();

    /*
    for (var i = 0; i < 4; i++) {

        scene2DFloorContainer[i].loadFromJSON(JSON.parse(zip.file("scene2DFloorContainer." + i + ".js").asText()));
    }
	*/

    /*
    var loader = new THREE.ObjectLoader();
    loader.load('scenes/scene1.js', function(object) {
        console.log('adding object to scene');
        scene3D.add(object);
    });
    */
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

function scene3DFloorWallGenerate() {

    scene3DFloorWallContainer[FLOOR] = new THREE.Object3D(); //reset all walls

    //TODO: Generate directly from SVG 2D points!
    var objects = scene2D.getObjects();

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

            var rectShape = new THREE.Shape();
            rectShape.moveTo(x1, y1);
            rectShape.lineTo(x2, y2);
            rectShape.lineTo(x2, y2 + rectWidth);
            rectShape.lineTo(x1, y1 + rectWidth);
            rectShape.lineTo(x1, y1);
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

            var geometry = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);
            //THREE.ExtrudeGeometry.WorldUVGenerator

            //scene3DWallTexture.repeat.set(12, 12);
            //scene3DWallTexture.anisotropy = 2;
            /*
            var scene3DWallMaterial = new THREE.MeshBasicMaterial({
                map: scene3DWallTexture,
                //wireframe: true
            });
            */

            var scene3DWallMaterial = new THREE.MeshLambertMaterial({
                map: scene3DWallTexture,
                transparent: true,
                opacity: 0.4
            });


            var mesh = new THREE.Mesh(geometry, scene3DWallMaterial);
            mesh.rotation.x = -(90 * RADIAN); //extrusion happens in Z direction, we need the wall pointing UP

            mesh.position.x = mesh.position.x - 2; //compensate for leftMenu
            mesh.position.y = 0;
            mesh.position.z = mesh.position.z + 4; //compensate for topMenu

            scene3DFloorWallContainer[FLOOR].add(mesh);
        }
    }
}

function sceneNew() {
    /*
    for (var i = 0; i < scene3DHouseContainer.children.length; i++) {
        scene3D.remove(scene3DHouseContainer.children[i]);
    }
    */

    //for (var i = 0; i < scene3DFloorContainer.length; i++) {
    //    scene3D.remove(scene3DFloorContainer[i]);
    //}

    scene3DHouseContainer.name = "12345|Alyson";

    scene3DFloorContainer[0].name = "Basement";
    scene3DFloorContainer[1].name = "Floor1";
    scene3DFloorContainer[2].name = "Floor2";

    //open3DModel("Platform/ground-grass.js", scene3DHouseGroundContainer, 0, 0, 0, 0, 0, 1); //Exterior ground
    /*
    var groundMaterial = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('objects/Platform/Textures/G36096.png'),
        overdraw: true
    })
    var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 0.1, 80, 1, false), groundMaterial);
    scene3DHouseGroundContainer.add(cylinder);
    */

    open3DModel("Platform/floor.jsz", scene3DFloorGroundContainer, 0, 0, 0, 0, 0, 1, false);
    open3DModel("Landscape/round.jsz", scene3DHouseGroundContainer, 0, 0, 0, 0, 0, 1, true);
    open3DModel("Landscape/round.jsz", scene3DFloorLevelGroundContainer, 0, 0, 0, 0, 0, 1, true);

    /*
    new THREE.JSONLoader().load("./objects/Landscape/round.js", function(geometry, materials) {
        var groundTexture = new THREE.ImageUtils.loadTexture('./objects/Landscape/Textures/F56734.jpg');
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

    open3DModel("Platform/pivotpoint.jsz", scene3DPivotPoint, 0, 0, 0, 0, 0, 1);
    open3DModel("Platform/roof.jsz", scene3DRoofContainer, 0, 0.15, 0, 0, 0, 1);
    open3DModel("Platform/house.jsz", scene3DHouseContainer, 0, 0, 0, 0, 0, 1);

    open3DModel("Exterior/Trees/palm.jsz", scene3DHouseContainer, -6, 0, 8, 0, 0, 1);
    open3DModel("Exterior/Plants/Bushes/bush.jsz", scene3DHouseContainer, 6, 0, 8, 0, 0, 1);
    open3DModel("Exterior/Fences/fence1.jsz", scene3DHouseContainer, -5, 0, 10, 0, 0, 1);
    open3DModel("Exterior/Fences/fence2.jsz", scene3DHouseContainer, 0, 0, 10, 0, 0, 1);
    open3DModel("Interior/Furniture/Sofas/clear-sofa.jsz", scene3DFloorContainer[FLOOR], 0, 0, 0, 0, 0, 1);
    //open3DModel("Interior/Furniture/Sofas/IKEA/three-seat-sofa.jsz", scene3DFloorContainer[FLOOR], -3.5, 0, 4, 0, 0, 1);
    //open3DModel("Exterior/Cars/VWbeetle.jsz", scene3DHouseContainer, -2.5, 0, 8, 0, 0, 1);
    //THREE.GeometryUtils.center();

    //============ SAMPLE DATA ================

    scene2DWallGeometry[FLOOR].push([400, 200, 1000, 200]); //x1,y1,x2,y2
    //scene2DWallDimentions[FLOOR].push([50, 200, 80, 0, 0]); //w,l,h,ha,a in pixels!

    scene2DWallGeometry[FLOOR].push([1000, 200, 1000, 600]);
    //scene2DWallDimentions[FLOOR].push([50, 200, 80, 0, 0]);

    scene2DWallGeometry[FLOOR].push([1000, 600, 400, 600]);
    //scene2DWallDimentions[FLOOR].push([50, 200, 80, 0, 0]);

    scene2DWallGeometry[FLOOR].push([400, 600, 400, 200]);
    //scene2DWallDimentions[FLOOR].push([50, 200, 80, 0, 0]);

    //Draw 2D Scene

    var wallMesh = []

    for (var i = 0; i < scene2DWallGeometry[FLOOR].length; i++) { //each floor wall

        //console.log(scene2DWallGeometry[FLOOR][i][0] + "," + scene2DWallGeometry[FLOOR][i][1] + "," + scene2DWallGeometry[FLOOR][i][2] + "," + scene2DWallGeometry[FLOOR][i][3]);
        wallMesh[i] = scene2DMakeWall([scene2DWallGeometry[FLOOR][i][0], scene2DWallGeometry[FLOOR][i][1], scene2DWallGeometry[FLOOR][i][2], scene2DWallGeometry[FLOOR][i][3]]);

        var xOffset = -10;
        var yOffset = -20;
        var angleOffset = -90;

        if (scene2DWallGeometry[FLOOR][i][1] != scene2DWallGeometry[FLOOR][i][3])
            angleOffset = -180;

        var line = new fabric.Line([scene2DWallGeometry[FLOOR][i][0] - 10, scene2DWallGeometry[FLOOR][i][1] - 20, scene2DWallGeometry[FLOOR][i][2] + 10, scene2DWallGeometry[FLOOR][i][3] - 20], {
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 1,
            hasControls: false,
            selectable: false
        });
        scene2D.add(line);

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

        scene2D.add(wallMesh[i]);

        //canvas.setActiveObject(line);
    }

    //var circle = scene2DMakeWallEdgeCircle(wallMesh[0].get('x1'), wallMesh[0].get('y1'), wallMesh[wallMesh.length - 1], wallMesh[0]);
    //scene2D.add(circle);

    for (var i = 0; i < wallMesh.length; i++) { //each floor wall
        try {
            var circle = scene2DMakeWallEdgeCircle(wallMesh[i].get('x1'), wallMesh[i].get('y1'), wallMesh[i - 1], wallMesh[i])
            circle.point_type = 'edge';
            scene2D.add(circle);
        } catch (e) {}
    }
    scene2D.renderAll();

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
    //scene3D.remove(sceneDirectionalLight);
    //scene3D.remove(sceneHemisphereLight);
    scene3D.remove(sceneSpotLight);

    if (SCENE == 'house') {
        if (DAY == 'day') {
            sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
            scene3D.add(sceneAmbientLight);

            sceneSpotLight.intensity = 0.8;
            sceneSpotLight.castShadow = true;
            scene3D.add(sceneSpotLight);
        } else {
            sceneSpotLight.intensity = 0.8;
            sceneSpotLight.castShadow = false;
            scene3D.add(sceneSpotLight);
        }
    } else if (SCENE == 'landscape') {
        sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
        scene3D.add(sceneAmbientLight);

        sceneSpotLight.intensity = 0.6;
        sceneSpotLight.castShadow = true;
        scene3D.add(sceneSpotLight);

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

        sceneAmbientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene3D.add(sceneAmbientLight);
        sceneSpotLight.intensity = 0.4;
        //sceneSpotLight.castShadow = false;
        scene3D.add(sceneSpotLight);
    }
}

function scene3DSetSky(set) {

    scene3D.remove(skyMesh);

    var path = './objects/Platform/sky/' + set + "/";
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


    geometry = new THREE.Geometry();
    texture = new THREE.ImageUtils.loadTexture('./images/cloud.png', null, animate);
    texture.magFilter = THREE.LinearMipMapLinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    /*
    texture = THREE.ImageUtils.loadTexture("./images/cloud.png");
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
	*/

    var fog = new THREE.Fog(0x4584b4, -100, 1000);
    material = new THREE.ShaderMaterial({
        uniforms: {
            "map": {
                type: "t",
                value: texture
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
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4));
    for (var i = 0; i < 20; i++) {

        plane.position.x = getRandomInt(-20, 20);
        plane.position.y = getRandomInt(5.5, 10);
        plane.position.z = i;
        plane.rotation.z = getRandomInt(5, 10);
        plane.scale.x = plane.scale.y = getRandomInt(0.5, 1);
        plane.updateMatrix();
        geometry.merge(plane.geometry, plane.matrix);
        //THREE.GeometryUtils.merge(geometry, plane);
    }
    weatherSkyDayMesh = new THREE.Mesh(geometry, material);

    texture = new THREE.ImageUtils.loadTexture('./images/cloud2.png', null, animate);
    materialNight = material.clone();
    materialNight.uniforms.map.value = texture;
    weatherSkyNightMesh = new THREE.Mesh(geometry, materialNight);

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

        sizeTween: new Tween([0.5, 1], [1, 0.6]),
        colorBase: new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
        opacityTween: new Tween([2, 3], [0.8, 0]),

        particlesPerSecond: 50,
        particleDeathAge: 3.0,
        emitterDeathAge: 180
    };

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


    //sceneHemisphereLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    //sceneHemisphereLight.color.setHSL(0.6, 0.75, 0.5);
    //sceneHemisphereLight.groundColor.setHSL(0.095, 0.5, 0.5);
    //sceneHemisphereLight.position.set(0, 50, 0);
    //sceneHemisphereLight.shadowCameraVisible = true;
    //scene3D.add(hemiLight);


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
    sceneDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sceneDirectionalLight.color.setHSL(0.1, 1, 0.95);
    sceneDirectionalLight.position.set(-1, 15, 5); //.normalize();
    sceneDirectionalLight.position.multiplyScalar(50);
    //sceneDirectionalLight.position.set(-1, 0, 0).normalize();
    sceneDirectionalLight.castShadow = true;
    sceneDirectionalLight.shadowMapWidth = 2048;
    sceneDirectionalLight.shadowMapHeight = 2048;
    var d = 10;
    sceneDirectionalLight.shadowCameraLeft = -d;
    sceneDirectionalLight.shadowCameraRight = d;
    sceneDirectionalLight.shadowCameraTop = d;
    sceneDirectionalLight.shadowCameraBottom = -d;
    sceneDirectionalLight.shadowCameraFar = 3000;
    sceneDirectionalLight.shadowBias = -0.0001;
    sceneDirectionalLight.shadowDarkness = 0.5;
    //sceneDirectionalLight.shadowCameraVisible = true;
    scene3D.add(sceneDirectionalLight);
    */

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

    var url = null;

    if(RUNMODE == "database")
    {
        url = "./php/objects.php?" + item;
    }else{
        url = "./objects/" + item;
    }

    jBinary.load(url, function(err, binary) {
        var json = JSON.parse(binary.read('string'));
        var menu = $("#" + id + " .scroll .cssmenu > ul");
        menu.empty();
        $.each(json.menu, function() {
            menu.append(getMenuItem(this));
        });
        $("#" + id + " .scroll .cssmenu > ul > li > a").click(function(event) {
            menuItemClick(this);
        });
    });

    $("#" + id).show();
    //toggleRight('menuRight', true);
}

function showRightObjectMenu(path) {
    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRight2D').hide();


    //console.log("Get from " + path + "/index.json");

    var menu = $("#menuRightObjects .scroll");
    menu.empty();

    jBinary.load("./objects/" + path + '/index.json', function(err, binary) {
        var json = JSON.parse(binary.read('string'));
        $.each(json.menu, function() {
            menu.append(getMenuObjectItem(this));
        });
        //$("#menuRight3DHouse .scroll .cssmenu > ul > li > a").click(function(event) {
        //    menuItemClick(this);
        //});
    });

    $('#menuRightObjects').show();
    //correctMenuHeight();
}

function showRightCatalogMenu() {

    if (SCENE == 'house') {
        $('#menuRight3DHouse').show();
    } else if (SCENE == 'floor') {
        $('#menuRight3DFloor').show();
    }

    $('#menuRightObjects').hide();
    //correctMenuHeight();
}



function scene2DWallMeasurementExternal() {

}

function scene2DWallMeasurementInternal() {

}

function camera3DAnimateObjectFocus() {
    /*
    if (keyboard.pressed("left")) {
        camera.position.x = camera3D.position.x * Math.cos(rotSpeed) + camera3D.position.z * Math.sin(.02);
        camera.position.z = camera3D.position.z * Math.cos(rotSpeed) - camera3D.position.x * Math.sin(.02);
    } else if (keyboard.pressed("right")) {
        camera.position.x = camera3D.position.x * Math.cos(rotSpeed) - camera3D.position.z * Math.sin(.02);
        camera.position.z = camera3D.position.z * Math.cos(rotSpeed) + camera3D.position.x * Math.sin(.02);
    }
	*/
    camera3D.lookAt(SELECTED.position);
}

function animate() {

    requestAnimationFrame(animate);
    //var delta = clock.getDelta(); // (time in milliseconds between each frame) in two other global variables:
    /*
    if ( t > 1 ) t = 0;
        if ( skin ) {

                // guess this can be done smarter...

                    // (Indeed, there are way more frames than needed and interpolation is not used at all
                    //  could be something like - one morph per each skinning pose keyframe, or even less,
                    //  animation could be resampled, morphing interpolation handles sparse keyframes quite well.
                    //  Simple animation cycles like this look ok with 10-15 frames instead of 100 ;)

                    for ( var i = 0; i < skin.morphTargetInfluences.length; i++ ) {

                        skin.morphTargetInfluences[ i ] = 0;

                    }

                    skin.morphTargetInfluences[ Math.floor( t * 30 ) ] = 1;

                    t += delta;
                }
	*/

    if (AUTOROTATE) {
        var x = camera3D.position.x,
            y = camera3D.position.y,
            z = camera3D.position.z;
        var rotSpeed = .01;
        //if (keyboard.pressed("left")){ 
        camera3D.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
        camera3D.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
        //} else if (keyboard.pressed("right")){
        //camera3D.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
        //camera3D.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
        //}

        camera3D.lookAt(scene3D.position);
        //} else {
        //controls3D.update();
    }

    if (engine instanceof ParticleEngine) {
        engine.update(clock.getDelta() * 0.8);
    }

    if (SCENE == 'house') {

        //if (controls3D.needsUpdate) {
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

        //weatherSkyDayMesh.position.z = camera3D.position.z;
        //weatherSkyDayMesh.rotation = camera3D.rotation;


        /*
                if (weatherSkyDayMesh.position.x < 10) {
                    weatherSkyDayMesh.position.x += 0.01;
                    //weatherSkyDayMesh.position.z += 0.01;
                } else {
                    weatherSkyDayMesh.position.x = weatherSkyDayMesh.position.x - 0.01;
                    //weatherSkyDayMesh.position.z -= 0.01;
                }
            */
        //weatherSkyDayMesh.position.y = (Math.random() - 0.5) * 0.2;
        //weatherSkyDayMesh.position.z = (Math.random() - 0.5) * 5.0;
        //weatherSkyDayMesh.rotation = Math.random() * Math.PI;
        //weatherSkyDayMesh.scale.multiplyScalar(1 / 30 * (Math.random() * 0.4 + 0.8))
        // object3d.color.setHex( 0xC0C0C0 + 0x010101*Math.floor(255*(Math.random()*0.1)) );

        //Orientation Cube
        camera3DCube.position.copy(camera3D.position);
        camera3DCube.position.sub(controls3D.center);
        camera3DCube.position.setLength(18);
        camera3DCube.lookAt(scene3DCube.position);
        rendererCube.render(scene3DCube, camera3DCube);

    } else if (SCENE == 'floor') {

        var z = 0; //Find closest wall to the camera
        for (var i = 0; i < scene3DHouseContainer.children.length; i++) {
            if (scene3DHouseContainer.children[i].position.z > scene3DHouseContainer.children[z].position.z) {
                z = i;
            }
        }
        //scene3DHouseContainer.children[0].mesh.materials[0].opacity = 0.2;
        //TweenLite.to(mesh.material, 2, {opacity: 0.2}); //TweenLite.to(object, duration, properties);

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
    }

    if (SCENE == 'roof') {
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

    } else {

        controls3D.update();
        /*
        if (SELECTED != null) {
            //camera3DAnimateObjectFocus();
            var destinationQuaternion = new THREE.Quaternion(SELECTED.position.x, SELECTED.position.y, SELECTED.position.z, 1);
            var newQuaternion = new THREE.Quaternion();
            THREE.Quaternion.slerp(camera3D.quaternion, destinationQuaternion, newQuaternion, 0.07);
            camera3D.quaternion = newQuaternion;
            camera3D.quaternion.normalize();
        }
        */
        //renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        //renderer.clear();

        for (var a in animation) {
            a.update(clock.getDelta() * 0.8);
        }

        renderer.render(scene3D, camera3D);
    }

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

function fileSelect(action) {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {

        $("#fileInput").click();

        if (action == '2ddraftplan') {

            $('#fileInput').bind('change', handleFile2DImageSelect);

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
                importJSON(e.target.result);
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

$(document).ready(function() {

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
        position: 'top'
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
});