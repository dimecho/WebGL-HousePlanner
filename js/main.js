/*
WebGL HousePlanner v 1.0
Preview: http://houseplanner.iroot.ca
Source Code: https://github.com/poofik/webgl-houseplanner

TODO:
- [difficulty: 10/10 progress: 5%]  Finish 2D floor plan gyometry drafting
- [difficulty: 3/10  progress: 80%] 2D floor plan select and overlay external draft image
- [difficulty: 8/10  progress: 5%]  Toolbar edit functions for 2D floor plans
- [difficulty: 9/10  progress: 10%] Make converter function to "extrude" 2D into 3D walls
- [difficulty: 6/10  progress: 0%]  Make front walls 80% transparent in 3D rotation
- [difficulty: 8/10  progress: 3%]  3D movable objects and collision detection
- [difficulty: 9/10  progress: 10%] 3D menu objects draggable with "pop-up" or star burst effect
- [difficulty: 2/10  progress: 90%] 3D objects sub-edit menu (textures/delete/duplicate)
- [difficulty: 2/10  progress: 40%] Categorize and populate 3D Menu items
- [difficulty: 8/10  progress: 10%] 3D Menu functions for draggable objects
- [difficulty: 5/10  progress: 50%] 3D Floor ground base glass reflective
- [difficulty: 6/10  progress: 0%]  3D Exterior View ability to select floors (+ flying-in animationeffect)
- [difficulty: 6/10  progress: 0%]  Keep history and implement Undo/Redo
- [difficulty: 4/10  progress: 1%]  Make a nice rainbow glow for 3D house exterior view - idea came after a 2 second glitch with video card :)
*/

//"use strict";

if (!Detector.webgl) Detector.addGetWebGLMessage();

// workaround for chrome bug: http://code.google.com/p/chromium/issues/detail?id=35980#c12
if (window.innerWidth === 0) {
    window.innerWidth = parent.innerWidth;
    window.innerHeight = parent.innerHeight;
}

var onRenderFcts = [];
var scene3D;
var scene3DCube;
var scene2D;

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
var scene2DFloorContainer = []; //Contains all 2D lines by floor
var scene2DFloorDraftPlan = []; //Image as texture for plan tracing for multiple floors
var scene3DPivotPoint; //Rotational pivot point - 1 object
var scene3DCubeMesh;

var sceneAmbientLight;
var sceneDirectionalLight;
var sceneSpotLight;
var sceneHemisphereLight;

//var sceneParticleLight;
//var scenePointLight;

var controls3D;
//var controls2D;

var camera3D;
var camera3DQuad = [3];
var camera3DQuadGrid;
var camera2D;
var camera3DCube;
var camera3DMirrorReflection;

var groundGrid;
var groundMesh;
var glowMesh;

var weatherSkyMesh;
var weatherSnowMesh;
var weatherRainMesh;

//var stats;

var RADIAN = Math.PI / 180;
var AUTOROTATE = true;
var SCENE = 'house';
var TOOL3D = 'view';
var TOOL3DINTERACTIVE = '';
var TOOL2D = 'freestyle';
var WEATHER = 'day-sunny';
var FLOOR = 1; //first floor selected default
var REALSIZERATIO = 1; //Real-life ratio (Metric/Imperial)
var SELECTED;

var leftButtonDown = false;
var clickTime;

//var keyboard = new THREE.KeyboardState();

var scene2DDrawLineGeometry; //Temporary holder for mouse click and drag drawings
var scene2DDrawLine;
var scene2DDrawLineMaterial; //Line thikness
var scene2DDrawLineDashedMaterial;
var scene2DDrawLineContainer; //Container of line geometries - need it as a collection for "quick hide"

var scene2DWallRegularMaterial;
var scene2DWallRegularMaterialSelect;
var scene2DWallBearingMaterial;
var scene2DWallBearingMaterialSelect;

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

var fileReader; //HTML5 local file reader
//var progress = document.querySelector('.percent');

init();

function init() {

    /*
	http://www.ianww.com/blog/2012/12/16/an-introduction-to-custom-shaders-with-three-dot-js/
	huge improvement in smoothness of the simulation by writing a custom shader for my particle system.
	This effectively moved all the complex position calculations for particles to the GPU, which went
	a long way toward ensuring the speed and reliability of the simulation. Custom shaders are written in GLSL,
	which is close enough to C that it’ s not too difficult to translate your math into.
	*/

    scene3D = new THREE.Scene();
    scene2D = new THREE.Scene();
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
    scene2DFloorContainer[0] = new THREE.Object3D();
    scene2DFloorContainer[1] = new THREE.Object3D();
    scene2DFloorContainer[2] = new THREE.Object3D();
    scene3DPivotPoint = new THREE.Object3D();

    //60 times more geometry
    //THREE.GeometryUtils.merge(geometry, otherGeometry);

    //VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera3D = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 60); //600 if doing a sky wrap-up
    camera3D.lookAt(new THREE.Vector3(0, 0, 0));

    camera2D = new THREE.PerspectiveCamera(1, window.innerWidth / window.innerHeight, 1, 5000);
    camera2D.lookAt(new THREE.Vector3(0, 0, 0));
    camera2D.position.z = 5000; // the camera starts at 0,0,0 so pull it back

    camera3DMirrorReflection = new THREE.CubeCamera(0.1, 10, 30);
    //camera3DMirrorReflection.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    camera3DMirrorReflection.renderTarget.width = camera3DMirrorReflection.renderTarget.height = 3;
    //camera3DMirrorReflection.position.y = -20;

    //================================
    //Top View Camera
    camera3DQuad[0] = new THREE.OrthographicCamera(
        window.innerWidth / -4, // Left
        window.innerWidth / 4, // Right
        window.innerHeight / 4, // Top
        window.innerHeight / -4, // Bottom
        0.1, // Near 
        100); // Far -- enough to see the skybox
    camera3DQuad[0].up = new THREE.Vector3(0, 0, -1);
    camera3DQuad[0].lookAt(new THREE.Vector3(0, -1, 0));


    //Front View Camera
    camera3DQuad[1] = new THREE.OrthographicCamera(
        window.innerWidth / -4, window.innerWidth / 4,
        window.innerHeight / 4, window.innerHeight / -4, 1, 50);
    camera3DQuad[1].lookAt(new THREE.Vector3(0, 0, -1));
    camera3DQuad[1].position.set(0, 0, 10);

    //Side View Camera
    camera3DQuad[2] = new THREE.OrthographicCamera(
        window.innerWidth / -4, window.innerWidth / 4,
        window.innerHeight / 4, window.innerHeight / -4, 0.1, 100);
    camera3DQuad[2].lookAt(new THREE.Vector3(1, 0, 0));
    camera3DQuad[2].position.x = 1;

    //3D View Camera
    camera3DQuad[3] = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 50);
    camera3DQuad[3].position.set(0, 14, 8);
    camera3DQuad[3].lookAt(new THREE.Vector3(0, 0, 0));

    camera3DQuadGrid = new THREE.GridHelper(25, 1);
    camera3DQuadGrid.setColors(new THREE.Color(0x000066), new THREE.Color(0x6dcff6));
    //================================

    var gridXY = new THREE.GridHelper(100, 2);
    gridXY.position.set(0, 0, 0);
    gridXY.rotation.x = Math.PI / 2;
    gridXY.setColors(new THREE.Color(0x000066), new THREE.Color(0x6dcff6));
    scene2D.add(gridXY);

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
    //scene2DDrawLineContainer.add(scene2DDrawLine);

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


    //$(renderer.domElement).bind('mousemove', onDocumentMouseMove);
    $(renderer.domElement).bind('mousedown', onDocumentMouseDown);
    $(renderer.domElement).bind('mouseup', onDocumentMouseUp);
    $(renderer.domElement).bind('dblclick', onDocumentDoubleClick);

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
    controls3D.minDistance = 4;
    controls3D.maxDistance = 30; //Infinity;
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

    scene3DSky();
    sceneNew();
    scene3DLight();
    show3DHouse();

    selectMeasurement();
    $('#menuWeatherText').html("Day - Sunny");

    animate();
}

function loadDAE(file, object, x, y, z, xaxis, yaxis, ratio) {
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    /*loader.addEventListener('load', function(event) {
        var object = event.content;
        scene3DHouseContainer.add(object);
        
    });*/
    loader.load('./objects/dae/' + file, function(collada) {
        var dae = collada.scene;
        //var skin = collada.skins[ 0 ];
        dae.scale.x = dae.scale.y = dae.scale.z = 1;
        //dae.scale.x = dae.scale.y = dae.scale.z = 50;
        dae.updateMatrix();

        /*
            var geometries = collada.dae.geometries;
            for(var propName in geometries){
                    if(geometries.hasOwnProperty(propName) && geometries[propName].mesh){
                    dae.geometry = geometries[propName].mesh.geometry3js;
                }
            }
        */

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

        /*
            if(xaxis > 0){
                 mesh.rotateOnAxis(new THREE.Vector3(0,1,0), xaxis * RADIAN);
            }
            if(yaxis > 0){
                 mesh.rotateOnAxis(new THREE.Vector3(1,0,0), yaxis * RADIAN);
            }
            */
        //scene3DHouseContainer.add(mesh);
        //object.add(mesh);
        object.add(dae);
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

function open3DModel(js, object, x, y, z, xaxis, yaxis, ratio) {

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

    var callback = function(geometry, materials) {
        /*
        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial({
            map: materials[0],
            envMap: camera3DMirrorReflection.renderTarget
        })); 
		*/

        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

        mesh.castShadow = true;
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

        //mesh.matrixAutoUpdate = true;
        //mesh.updateMatrix();
        object.add(mesh);

        //THREE.Collisions.colliders.push(THREE.CollisionUtils.MeshOBB(mesh));
    };

    if (js.split('.').pop() == 'jsz') //zipped json file
    {
        zip = new JSZip();
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

/*
function loadBabylon(js, object, x, y, z, xaxis, yaxis, ratio) {

    var loader = new THREE.BabylonLoader();

    loader.load("./objects/" + js, function(geometry, materials) {
        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        //mesh.overdraw = true;
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.doubleSided = false;
        //mesh.matrixAutoUpdate = false;
        //mesh.updateMatrix();
        object.add(mesh);
    }, "./objects/" + js.substring(0, js.lastIndexOf("/") + 1) + "Textures/");
}
*/

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

    show2DContainer(false);
    showWeather();

    //the camera defaults to position (0,0,0) so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
    camera3D.position.set(0, 6, 20);

    //TODO: Loop and show based in ID name

    sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene3D.add(sceneAmbientLight);
    sceneSpotLight.intensity = 0.5;
    sceneSpotLight.castShadow = true;
    scene3D.add(sceneSpotLight);


    scene3D.add(scene3DHouseGroundContainer);
    scene3D.add(scene3DHouseContainer);
    scene3D.add(scene3DRoofContainer);

    for (var i = 0; i < scene3DFloorContainer.length; i++) {
        scene3D.add(scene3DFloorContainer[i]);
    }
    scene3DCube.add(scene3DCubeMesh);

    toggleLeft('menuLeft3DHouse', true);

    $('#menuRight3DHouse').show();
    $('#menuRight').show();
    //toggleRight('menuRight', true);


    if (TOOL3DINTERACTIVE == 'moveXY') {
        menuSelect(0, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'moveZ') {
        menuSelect(1, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'rotate') {
        menuSelect(2, 'menuInteractiveItem', '#ff3700');
    }

    menuSelect(1, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    $('#menuWeather').show();
    //scene3DHouseContainer.traverse;

    //show3DHouseContainer(true)
    //show3DFloorContainer(false);

    //Auto close right menu
    //document.getElementById('menuRight').setAttribute("class", "hide-right");
    //delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

    //TODO: change menu content
    /*
    setTimeout(function() {
        //do what you need here
    }, 2000);
    */
    document.getElementById('menuRight').setAttribute("class", "show-right");
    delay(document.getElementById("arrow-right"), "images/arrowright.png", 400);
}

function show3DFloor() {

    SCENE = 'floor';

    show2DContainer(false);
    showWeather();

    camera3D.position.set(0, 4, 12);

    //TODO: Loop and show based in ID name / floor
    //scene3D.add(scene3DContainer);

    //TODO: remove other floors
    sceneAmbientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene3D.add(sceneAmbientLight);
    sceneSpotLight.intensity = 0.4;
    //sceneSpotLight.castShadow = false;
    scene3D.add(sceneSpotLight);

    scene3D.add(scene3DFloorGroundContainer);
    scene3D.add(camera3DMirrorReflection);

    scene3D.add(scene3DFloorContainer[FLOOR]);

    scene3DCube.add(scene3DCubeMesh);

    //scene3DFloorContainer[0].traverse;
    $('#menuFloorSelectorText').html(scene3DFloorContainer[FLOOR].name);
    $('#menuFloorSelector').show();

    $('#menuRight3DFloor').show();
    $('#menuRight').show();

    //scene3DFloorContainer[FLOOR].traverse;
    //show3DFloorContainer(true);
    //show3DHouseContainer(false)

    menuSelect(4, 'menuTopItem', '#ff3700');

    //Auto open right menu
    document.getElementById('menuRight').setAttribute("class", "show-right");
    delay(document.getElementById("arrow-right"), "images/arrowright.png", 400);
}

function show3DFloorLevel() {

    SCENE = 'floorlevel';

    show2DContainer(false);
    showWeather();

    camera3D.position.set(0, 4, 12);

    sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
    scene3D.add(sceneAmbientLight);
    sceneSpotLight.intensity = 0.4;
    sceneSpotLight.castShadow = false;
    scene3D.add(sceneSpotLight);
    //scene3D.add(sceneHemisphereLight);

    scene3D.add(scene3DFloorLevelGroundContainer);

    //TODO: show extruded stuff from scene2DFloorContainer[0]

    scene3DCube.add(scene3DCubeMesh);

    menuSelect(2, 'menuTopItem', '#ff3700');
    correctMenuHeight();
}

function show3DRoofDesign() {

    SCENE = 'roof';

    show2DContainer(false);
    showWeather();

    //camera3D.position.set(0, 4, 12);

    scene3D.add(camera3DQuad[0]);
    scene3D.add(camera3DQuad[1]);
    scene3D.add(camera3DQuad[2]);
    scene3D.add(camera3DQuad[3]);
    scene3D.add(camera3DQuadGrid);

    scene3D.add(scene3DRoofContainer);

    sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);
    scene3D.add(sceneAmbientLight);
    sceneSpotLight.intensity = 0.6;
    sceneSpotLight.castShadow = false;
    scene3D.add(sceneSpotLight);

    //scene3D.add(sceneHemisphereLight);

    //scene3D.add( new THREE.AxisHelper(100) );

    $('#menuRight3DRoof').show();
    $('#menuRight').show();
    //scene3D.add(scene3DFloorLevelGroundContainer);

    //TODO: show extruded stuff from scene2DFloorContainer[0]

    //scene3DCube.add(scene3DCubeMesh);

    menuSelect(3, 'menuTopItem', '#ff3700');
    correctMenuHeight();
}

function showWeather() {

    scene3D.remove(weatherSkyMesh);
    if (engine instanceof ParticleEngine) {
        engine.destroy();
        engine = null;
    }
    if (SCENE == 'house') {

        scene3DSkyBackground(WEATHER);

        if (WEATHER == "day-sunny") {

            scene3D.add(weatherSkyMesh);

            //TODO: maybe add sun glare effect shader?

        } else if (WEATHER == "day-snowy") {

            scene3D.add(weatherSkyMesh);
            engine = new ParticleEngine();
            engine.setValues(weatherSnowMesh);
            engine.initialize();

        } else if (WEATHER == "day-rainy") {

            scene3D.add(weatherSkyMesh);
            engine = new ParticleEngine();
            engine.setValues(weatherRainMesh);
            engine.initialize();

        } else if (WEATHER == "night") {

        }
    } else if (SCENE == 'roof') {
        scene3DSkyBackground('quad-split');
    } else {
        scene3DSkyBackground('day-sunny');
    }
}

function show2D() {

    SCENE = '2d';

    //camera2D.position.set(0, 8, 20);
    show2DContainer(true);
    scene3DSkyBackground(null);

    scene2D.add(scene2DFloorContainer[FLOOR]);

    if (TOOL2D == 'freestyle') {
        menuSelect(1, 'menuLeft2DItem', '#ff3700');
    } else if (TOOL2D == 'vector') {
        menuSelect(2, 'menuLeft2DItem', '#ff3700');
    } else if (TOOL2D == 'square') {

    } else if (TOOL2D == 'circle') {

    }
    toggleLeft('menuLeft2D', true);

    $('#menuRight2D').show();
    $('#menuRight').show();

    menuSelect(5, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //scene2DFloorContainer[FLOOR].traverse;

    //Auto close right menu
    document.getElementById('menuRight').setAttribute("class", "hide-right");
    delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);
}

function menuSelect(item, id, color) {
    if (item == null) //clear all
    {
        for (var i = 0; i <= 5; i++) {
            $("#" + id + i).css('color', 'black');
        }
    } else {
        menuSelect(null, id, color);
        $("#" + id + item).css('color', color); //#53C100
    }
}

function show2DContainer(b) {
    //console.log("show2DContainer " + b);

    scene3D.remove(sceneAmbientLight);
    //scene3D.remove(sceneDirectionalLight);
    //scene3D.remove(sceneHemisphereLight);
    scene3D.remove(sceneSpotLight);

    scene3D.remove(camera3DQuad[0]);
    scene3D.remove(camera3DQuad[1]);
    scene3D.remove(camera3DQuad[2]);
    scene3D.remove(camera3DQuad[3]);
    scene3D.remove(camera3DQuadGrid);

    scene3D.remove(scene3DHouseGroundContainer);
    scene3D.remove(scene3DRoofContainer);
    scene3D.remove(weatherSkyMesh);

    scene3D.remove(scene3DFloorGroundContainer);
    scene3D.remove(camera3DMirrorReflection);

    scene3D.remove(scene3DFloorLevelGroundContainer);

    scene3D.remove(scene3DHouseContainer);

    for (var i = 0; i < scene3DFloorContainer.length; i++) {
        scene3D.remove(scene3DFloorContainer[i]);
        scene2D.remove(scene2DFloorContainer[i]);
    }
    scene2D.remove(scene2DDrawLineContainer);

    scene3DCube.remove(scene3DCubeMesh);

    $('#menuLeft3DHouse').hide();
    $('#menuLeft3DFloor').hide();
    $('#menuLeft2D').hide();

    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRight2D').hide();
    $('#menuRightObjects').hide();
    $('#menuRight').hide();

    $('#menuFloorSelector').hide();
    $('#menuWeather').hide();

    scene3DObjectUnselect();

    if (engine instanceof ParticleEngine) {
        engine.destroy();
        engine = null;
    }
    scene3D.visible = !b;
    scene2D.visible = b;

    //document.getElementById('WebGLCubeCanvas').appendChild(rendererCube.domElement);

    //scene2DFloorContainer[0].visible = b;
    //scene2DFloorContainer[0].traverse;

    //controls2D.target = new THREE.Vector3(0, 0, 0);
    /*
    if (b) {
        $(window).bind('mousedown', function(e) {
            //mouse.set(e.clientX, e.clientY);
            line = null;
            $(window).bind('mousemove', drag2D).bind('mouseup', drag2DEnd);
        });

        $(window).bind('touchstart', function(e) {
            e.preventDefault();
            var touch = e.originalEvent.changedTouches[0];
            //mouse.set(touch.pageX, touch.pageY);
            line = null;
            $(window).bind('touchmove', touch2DDrag).bind('touchend', touch2DEnd);
            return false;
        });
    } else {
        $(window).unbind('mousedown'); //Desktop
        $(window).unbind('touchstart'); //Mobile
    }
    */
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

function selectWeather() {

    if (WEATHER == "day-sunny") {

        WEATHER = "day-snowy";
        $('#menuWeatherText').html("Day - Snowy");

    } else if (WEATHER == "day-snowy") {

        WEATHER = "day-rainy";
        $('#menuWeatherText').html("Day - Rainy");

    } else if (WEATHER == "day-rainy") {

        WEATHER = "night";
        $('#menuWeatherText').html("Night");

    } else if (WEATHER == "night") {

        WEATHER = "day-sunny";
        $('#menuWeatherText').html("Day - Sunny");
    }
    showWeather();
}

function onWindowResize() {
    if (scene3D.visible) {
        camera3D.aspect = window.innerWidth / window.innerHeight;
        camera3D.updateProjectionMatrix();
    } else if (scene2D.visible) {
        camera2D.aspect = window.innerWidth / window.innerHeight;
        camera2D.updateProjectionMatrix();
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

function onDocumentMouseMove(event) {

    event.preventDefault();

    var x = (event.clientX / window.innerWidth) * 2 - 1;
    var y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (scene2D.visible) {

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
        var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 0.5), 0);
        vector = new THREE.Vector3(x, y, 0.5);
        var raycaster = projector.pickingRay(vector, camera2D);
        var pos = raycaster.ray.intersectPlane(planeZ);
        //console.log("x: " + pos.x + ", y: " + pos.y);
        //===================================

        if (TOOL2D == '') { //Nothing selected, move grid X/Y

            //TODO: ability to unslect current tool

        } else if (TOOL2D == 'freestyle') {

            //TODO: Make eye-candy sketcher effects from mrdoob.com/projects/harmony/

            if (mouse.x != 0 && mouse.y != 0) {
                scene2DDrawLineGeometry = new THREE.Geometry();
                scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(mouse.x, mouse.y, 0.5));
                scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(pos.x, pos.y, 0.5));
                //scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(x, y, 0.5));

                scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineMaterial);
                scene2DDrawLineContainer.add(scene2DDrawLine);
                //scene2D.add(scene2DDrawLineContainer);
            }
            mouse.x = pos.x;
            mouse.y = pos.y;

        } else if (TOOL2D == 'vector') {

            //container.style.cursor = 'crosshair';

            //MouseMove = Selection
            scene2DDrawLineGeometry = new THREE.Geometry();
            scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(mouse.x, mouse.y, 0.5));
            scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(pos.x, pos.y, 0.5));
            scene2DDrawLineGeometry.computeLineDistances(); //what is this?

            scene2DDrawLineContainer.remove(scene2DDrawLine);
            scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineDashedMaterial, THREE.LineStrip);
            scene2DDrawLineContainer.add(scene2DDrawLine);

            /*
            var material = new THREE.SpriteMaterial({
                map: texture,
                color: 0xffffff,
                fog: true
            });
            //var width = material.map.image.width;
            //var height = material.map.image.height;
            sprite = new THREE.Sprite(material);
            //sprite.scale.set( width, height, 1 );
            //sprite.material.rotation += 0.1 * ( i / l );
            sprite.position.set(0, 0, 1);
            scene2D.add(sprite);
            */

        } else if (TOOL2D == 'square') {

        } else if (TOOL2D == 'circle') {

        }

    } else if (leftButtonDown) {

        if (SELECTED != null) {

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
}

function onDocumentMouseDown(event) {

    event.preventDefault();

    //clickTime = new Date().getTime();

    $(renderer.domElement).bind('mousemove', onDocumentMouseMove);

    if (event.which == 1) leftButtonDown = true; // Left mouse button was pressed, set flag

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    AUTOROTATE = false;
    //renderer.antialias = false;

    if (scene2D.visible) {
        //reset
        scene2DDrawLineContainer = new THREE.Object3D();
        mouse = new THREE.Vector2()
        scene2D.add(scene2DDrawLineContainer);
        //$(window).bind('mousemove', drag2D).bind('mouseup', drag2DEnd);

        if (TOOL2D == 'vector') {
            //container.style.cursor = 'crosshair';
        } else {
            //container.style.cursor = 'pointer';
        }

    } else {

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
                document.getElementById('menuRight').setAttribute("class", "hide-right");
                delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

                //Auto close left menu
                if (SCENE == 'house') {
                    document.getElementById('menuLeft3DHouse').setAttribute("class", "hide-left");
                    delay(document.getElementById("arrow-left"), "images/arrowright.png", 400);
                }
            }
        }, 1400);
    }
}

function onDocumentMouseUp(event) {

    event.preventDefault();

    $(renderer.domElement).unbind('mousemove', onDocumentMouseMove);

    if (event.which == 1) leftButtonDown = false; // Left mouse button was released, clear flag

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (scene2D.visible) {

        //container.style.cursor = 'pointer';

        if (TOOL2D == 'freestyle') {

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

                scene2DFloorContainer[0].add(mesh);
                //scene2DDrawLineContainer.add(rectShape);
                //scene2D.add(scene2DDrawLineContainer);
            }
        }

        //scene3D.updateMatrixWorld();

    } else {

        clearTimeout(clickTime); //prevents from hiding menus too fast

        if (SELECTED != null) { //Restore menu after MouseMove
            scene3DObjectSelectMenu(mouse.x, mouse.y);

            $('#WebGLInteractiveMenu').show();
        }

        scene3D.remove(scene3DPivotPoint);

        if (document.getElementById('arrow-right').src.indexOf("images/arrowleft.png") >= 0) {
            //Auto open right menu
            document.getElementById('menuRight').setAttribute("class", "show-right");
            delay(document.getElementById("arrow-right"), "images/arrowright.png", 400);

            //Auto open left menu
            if (SCENE == 'house') {
                document.getElementById('menuLeft3DHouse').setAttribute("class", "menuLeft3DHouse-show-left");
                delay(document.getElementById("arrow-left"), "images/arrowleft.png", 400);
            }
        }
        //container.style.cursor = 'auto';
    }
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

    if (SELECTED != null) {
        SELECTED.remove(glowMesh.object3d);
    }

    SELECTED = null;

    $('#WebGLInteractiveMenu').hide();
}

function exportOBJ() {
    var exporter = new THREE.OBJExporter();
    //.children[0].geometry
    //exporter.parse(scene3D);
    window.localStorage['WebGL-HousePlanner'] = exporter.parse(scene3D);
}

function exportJSON() {

    //var exporter = new THREE.SceneExporter().parse(scene);
    //var exporter = JSON.stringify(new THREE.ObjectExporter().parse(scene3D));

    zip = new JSZip();

    //zip.file("scene3D.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3D)));
    zip.file("scene3DHouseContainer.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DHouseContainer)));
    //zip.file("scene3DHouseGroundContainer.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DHouseGroundContainer)));

    for (var i = 0; i < scene3DFloorContainer.length; i++) {
        zip.file("scene3DFloorContainer." + i + ".js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DFloorContainer[i])));
    }
    //zip.file("scene3DFloorGroundContainer.js", JSON.stringify(new THREE.ObjectExporter().parse(scene3DFloorGroundContainer)));

    zip.file("house.jpg", imageBase64('imgHouse'), {
        base64: true
    });

    var textures = zip.folder("Textures");
    /*textures.file("house.jpg", imgData, {
        base64: true
    });
    */
    zip.file("ReadMe.txt", "Saved by WebGL HousePlanner\nFiles can be opened by THREE.js Framework");

    var content = zip.generate();
    /*
    var content = zip.generate({
        type: "blob"
    });
    var content = zip.generate({
        type: "string"
    });
    */
    //location.href="data:application/zip;base64," + zip.generate({type:"base64"});

    saveAs(content, "scene.zip");

    /*
    var exporter = new THREE.ObjectExporter;
    var obj = exporter.parse(scene3D);
    var json = JSON.stringify(obj);
    */

    /*
    var newwindow = window.open()
    var document = newwindow.document; //because you need to write in the document of the window 'newwindow'
    document.open();

    document.writeln(exporter);
    */
    //var store = localStorage['WebGL-HousePlanner', exporter];
    //log(json);
}

function importJSON(zipData) {

    //zip = new JSZip(readerEvent.target.result);
    //zip.load(zipData);

    //zip.folder("Textures").load(data);
    //var text = zip.file("hello.txt").asText();

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

function sceneNew() {
    /*
    for (var i = 0; i < scene3DHouseContainer.children.length; i++) {
        scene3D.remove(scene3DHouseContainer.children[i]);
    }
    */

    scene3D.remove(scene3DHouseContainer);

    for (var i = 0; i < scene3DFloorContainer.length; i++) {
        scene3D.remove(scene3DFloorContainer[i]);
    }

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

    //===============================================
    //TODO: Find more efficient way to repeat texture
    //===============================================
    new THREE.JSONLoader().load("./objects/Platform/ground-grass.js", function(geometry, materials) {
        var groundTexture = new THREE.ImageUtils.loadTexture('./objects/Platform/Textures/G36096.png');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(14, 14);
        groundTexture.anisotropy = renderer.getMaxAnisotropy(); //focus blur (16=unblured 1=blured)

        var groundMaterial = new THREE.MeshBasicMaterial({
            map: groundTexture
        });
        mesh = new THREE.Mesh(geometry, groundMaterial);
        mesh.receiveShadow = true;
        //mesh.matrixAutoUpdate = true;
        mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals();
        //mesh.updateMatrix();
        scene3DHouseGroundContainer.add(mesh)
    });

    new THREE.JSONLoader().load("./objects/Platform/ground-wood.js", function(geometry, materials) {
        var groundTexture = new THREE.ImageUtils.loadTexture('./objects/Platform/Textures/W36786.jpg');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(10, 10);
        groundTexture.anisotropy = renderer.getMaxAnisotropy(); //focus blur (16=unblured 1=blured)

        var groundMaterial = new THREE.MeshPhongMaterial({
            map: groundTexture,
            envMap: camera3DMirrorReflection.renderTarget,
            reflectivity: 0.5
        });
        mesh = new THREE.Mesh(geometry, groundMaterial);
        mesh.receiveShadow = true;
        //mesh.matrixAutoUpdate = true;
        mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals();
        //mesh.updateMatrix();
        scene3DFloorGroundContainer.add(mesh)
        //============================
        //camera3DMirrorReflection = new THREEx.CubeCamera(mesh);
        //mesh.add(camera3DMirrorReflection.object3d)
        //groundMaterial.envMap = camera3DMirrorReflection.textureCube;
        //============================
    });

    new THREE.JSONLoader().load("./objects/Platform/ground-wood.js", function(geometry, materials) {
        var groundTexture = new THREE.ImageUtils.loadTexture('./objects/Platform/Textures/F56734.jpg');
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
    //===============================================
    //open3DModel("Platform/ground-wood.js", scene3DFloorGroundContainer, 0, 0, 0, 0, 0, 1); //Interior ground (defferent from floor textures)

    //Temporary Objects for visualization
    //TODO: load from one JSON file

    open3DModel("Platform/pivotpoint.js", scene3DPivotPoint, 0, 0, 0, 0, 0, 1);


    //open3DModel("Exterior/Plants/bush.js", scene3DPivotPoint, 0, 0, 0, 0, 0, 1);
    //vector = new THREE.Vector3(-7, 0, 9);
    //scene3DPivotPoint.position.set(vector);
    //scene3D.add(scene3DPivotPoint);

    open3DModel("Platform/roof.jsz", scene3DRoofContainer, 0, 0.15, 0, 0, 0, 1);
    open3DModel("Platform/house.jsz", scene3DHouseContainer, 0, 0, 0, 0, 0, 1);

    open3DModel("Exterior/Trees/palm.jsz", scene3DHouseContainer, -6, 0, 8, 0, 0, 1);
    open3DModel("Exterior/Plants/bush.jsz", scene3DHouseContainer, 6, 0, 8, 0, 0, 1);
    open3DModel("Exterior/Fences/fence1.jsz", scene3DHouseContainer, -5, 0, 10, 0, 0, 1);
    open3DModel("Exterior/Fences/fence2.jsz", scene3DHouseContainer, 0, 0, 10, 0, 0, 1);
    open3DModel("Interior/Furniture/clear-sofa.jsz", scene3DFloorContainer[FLOOR], 0, 0, 0, 0, 0, 1);
    //open3DModel("Exterior/Cars/VWbeetle.js", scene3DHouseContainer, -2.5, 0, 8, 0, 0, 1);

    //scene3D.rotation.y += 10;
    //THREE.GeometryUtils.center();
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
function scene3DSkyBackground(weather) {

    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth; //32;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');

    if (weather == 'day-sunny' || weather == 'day-snowy' || weather == 'day-rainy') {

        var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1e4877");
        gradient.addColorStop(0.5, "#4584b4");

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        document.body.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
    } else if (weather == 'quad-split') {

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

function scene3DSky() {

    //var mesh = THREEx.createSkymap('mars')
    //scene.add( mesh )

    //TODO: Make realistic clouds from http://mrdoob.com/lab/javascript/webgl/clouds/

    //texture = THREE.ImageUtils.loadTexture('./objects/Platform/Textures/S0001.jpg');
    /*
    texture = THREE.ImageUtils.loadTexture('./images/cloud.png', null, animate);
    texture.magFilter = THREE.LinearMipMapLinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    geometry = new THREE.SphereGeometry(500, 60, 40);

    var uniforms = {
        texture: {
            type: 't',
            value: texture
        }
    };

    var fog = new THREE.Fog(0x4584b4, -100, 3000);
    var material = new THREE.ShaderMaterial({
        //uniforms: uniforms,
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
        vertexShader: document.getElementById('sky-vertex').textContent,
        fragmentShader: document.getElementById('sky-fragment').textContent,
        depthWrite: false,
        depthTest: false,
        transparent: true
    });
    weatherSkyMesh = new THREE.Mesh(geometry, material);
    weatherSkyMesh.scale.set(-1, 1, 1);
    //skyBox.eulerOrder = 'XZY';
    //skyBox.renderDepth = 1000.0;

    //scene3D.remove(weatherSkyMesh);
    scene3D.add(weatherSkyMesh);
    */

    //skyGrid = new THREE.Object3D();

    geometry = new THREE.Geometry();

    texture = THREE.ImageUtils.loadTexture('./images/cloud.png', null, animate);
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
    weatherSkyMesh = new THREE.Mesh(geometry, material);

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
    scene3D.remove(weatherSkyMesh);
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

function showRightObjectMenu(path) {
    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRight2D').hide();
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

    if (scene3D.visible) {

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

            weatherSkyMesh.rotation.y = camera3D.rotation.y; //spiral
            weatherSkyMesh.rotation.z = camera3D.rotation.z; //side-to-side
            weatherSkyMesh.rotation.x = camera3D.rotation.x; //top
            weatherSkyMesh.position.x = camera3D.position.x / 1.5;

            //weatherSkyMesh.position.z = camera3D.position.z;
            //weatherSkyMesh.rotation = camera3D.rotation;


            /*
                if (weatherSkyMesh.position.x < 10) {
                    weatherSkyMesh.position.x += 0.01;
                    //weatherSkyMesh.position.z += 0.01;
                } else {
                    weatherSkyMesh.position.x = weatherSkyMesh.position.x - 0.01;
                    //weatherSkyMesh.position.z -= 0.01;
                }
            */
            //weatherSkyMesh.position.y = (Math.random() - 0.5) * 0.2;
            //weatherSkyMesh.position.z = (Math.random() - 0.5) * 5.0;
            //weatherSkyMesh.rotation = Math.random() * Math.PI;
            //weatherSkyMesh.scale.multiplyScalar(1 / 30 * (Math.random() * 0.4 + 0.8))
            // object3d.color.setHex( 0xC0C0C0 + 0x010101*Math.floor(255*(Math.random()*0.1)) );

            //Orientation Cube
            camera3DCube.position.copy(camera3D.position);
            camera3DCube.position.sub(controls3D.center);
            camera3DCube.position.setLength(18);
            camera3DCube.lookAt(scene3DCube.position);
            rendererCube.render(scene3DCube, camera3DCube);

        } else if (SCENE == 'floor') {

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
            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            renderer.clear();


            // upper left corner
            renderer.setViewport(0, 0.5 * window.innerHeight, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
            renderer.render(scene3D, camera3DQuad[1]); //front 

            // upper right corner
            renderer.setViewport(0.5 * window.innerWidth, 0.5 * window.innerHeight, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
            renderer.render(scene3D, camera3DQuad[0]); //top

            // lower left corner
            renderer.setViewport(0, 0, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
            renderer.render(scene3D, camera3DQuad[2]); //side

            // lower right corner
            renderer.setViewport(0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, 0.5 * window.innerHeight);
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
            renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
            renderer.clear();
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

    } else if (scene2D.visible) {
        //controls2D.update();
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.clear();
        renderer.render(scene2D, camera2D);
    }
}

function drag2D(e) {

    //var point = calc2Dpoint(x, y, 0.5, camera2D);
    //var point = projector.projectVector(new THREE.Vector3(e.clientX, e.clientY, 0), camera2D);

    //console.log("draw W:" + renderer.domElement.width + " H:" + renderer.domElement.height);

    x = (e.clientX - (window.innerWidth / 2)) / 20;
    y = ((window.innerHeight / 2) - e.clientY) / 20;

    /*
    var PI2 = Math.PI * 2;
    var material = new THREE.SpriteCanvasMaterial({
        color: 0x000000,
        program: function(context) {
            context.beginPath();
            context.arc(0, 0, 0.5, 0, PI2, true);
            context.fill();
        }
    });
	*/
    /*
    var particle = new THREE.Sprite(material);
    particle.position.x = e.clientX; //Math.random() * 2 - 1;
    particle.position.y = e.clientY; //Math.random() * 2 - 1;
    particle.position.z = 0; //Math.random() * 2 - 1;
    particle.position.normalize();
    particle.position.multiplyScalar(Math.random() * 10 + 450);
    particle.scale.x = particle.scale.y = 10;
    scene2D.add(particle);
    geometry.vertices.push(particle.position);
	*/

    if (mouse2D.x != 0 && mouse2D.y != 0) {
        var scene2DDrawLineGeometry = new THREE.Geometry();
        //scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        scene2DDrawLineGeometry.vertices.push(mouse2D);
        scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(x, y, 0.5));
        //scene2DDrawLineGeometry.vertices.push(mouse2D);
        var scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineMaterial);
        scene2DDrawLineContainer.add(scene2DDrawLine);
        //scene2D.add(scene2DDrawLineContainer);
    }

    //geometry.vertices.push(mouse2D);
    //geometry.faces.push(new THREE.Face3(0, 1, 2));
    //geometry.computeFaceNormals();
    //var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
    //    color: 0x000000,
    //    linewidth: 3,
    //    opacity: 0.5
    //}));
    //scene2D.add(line);

    mouse2D = new THREE.Vector3(x, y, 0.5); //remmember for next time around

    //console.log("draw X:" + x + " Y:" + y);

    /*
    if (!line) {
        var v1 = makePoint(mouse);
        var v2 = makePoint(x, y);
        line = two.makeCurve([v1, v2], true);
        line.noFill().stroke = '#333';
        line.linewidth = 10;
        _.each(line.vertices, function(v) {
            v.addSelf(line.translation);
        });
        line.translation.clear();
    } else {
        var v1 = makePoint(x, y);
        line.vertices.push(v1);
    }
    mouse.set(x, y);
    */
}

function fileSelect(action) {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {

        $("#fileInput").click();

        if (action == '2ddraftplan') {

            $('#fileInput').bind('change', handleFile2DImageSelect);
            scene2D.remove(scene2DFloorDraftPlan[0]);

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

        var texture = new THREE.ImageUtils.loadTexture(e.target.result);
        var material = new THREE.MeshBasicMaterial({
            map: texture
        });

        var vFOV = camera2D.fov * Math.PI / 180; // convert vertical fov to radians
        var height = 2 * Math.tan(vFOV / 2) * camera2D.position.z; // visible height
        var aspect = innerWidth / window.innerHeight;
        var width = height * aspect; // visible width

        var geometry = new THREE.PlaneGeometry(width, height, 10, 10);
        scene2DFloorDraftPlan[0] = new THREE.Mesh(geometry, material);
        scene2DFloorDraftPlan[0].position.y = -0.5;
        scene2D.add(scene2DFloorDraftPlan[0]);
    }

    // Read image file as a binary string.
    fileReader.readAsDataURL(event.target.files[0]);
    //fileReader.readAsBinaryString(event.target.files[0]);
}

function touch2DDrag(e) {
    e.preventDefault();
    var touch = e.originalEvent.changedTouches[0];
    drag2D({
        clientX: touch.pageX,
        clientY: touch.pageY
    });
    return false;
}

function touch2DEnd(e) {
    e.preventDefault();
    $(window).unbind('touchmove', touch2DDrag).unbind('touchend', touch2DEnd);
    return false;
}