/*
WebGL HousePlanner v 1.0
Preview: http://houseplanner.iroot.ca
Source Code: https://github.com/poofik/webgl-houseplanner

TODO:
- [difficulty: 10/10 progress: 5%] Finish 2D floor plan gyometry drafting
- [difficulty: 8/10  progress: 0%] Toolbar edit functions for 2D floor plans
- [difficulty: 9/10  progress: 0%] Make converter function to "extrude" 2D into 3D walls
- [difficulty: 6/10  progress: 0%] Make front walls 80% transparent in 3D rotation
- [difficulty: 8/10  progress: 0%] 3D movable objects and collision detection
- [difficulty: 2/10  progress: 0%] 3D objects sub-edit menu (textures/delete/duplicate)
- [difficulty: 2/10  progress: 2%] Categorize and populate 3D Menu items
- [difficulty: 8/10  progress: 5%] Make 3D Menu draggable objects
- [difficulty: 5/10  progress: 5%] Make 3D Floor ground base glass reflective
- [difficulty: 6/10  progress: 0%] 3D Exterior View ability to select floors (+ flying-in animationeffect)
- [difficulty: 6/10  progress: 0%] Keep history and implement Undo/Redo
- [difficulty: 4/10  progress: 0%] Make a nice rainbow glow for 3D house exterior view - idea came after a 2 second glitch with video card :)
*/

if (!Detector.webgl) Detector.addGetWebGLMessage();

var scene3D;
var scene3DCube;
var scene3DMenu;
var scene2D;

var renderer;
var rendererCube;
var rendererMenu;

var scene3DHouseContainer; //Contains all Exterior 3D objects by floor (trees,fences)
var scene3DHouseGroundContainer; //Grass Ground - 1 object
var scene3DFloorGroundContainer; //Floor Ground - 1 object
var scene3DMenuHouseContainer; //Contains rotatable 3D objects for Exterior (trees,fences)
var scene3DMenuFloorContainer; //Contains rotatable 3D objects for Exterior (sofas,tables)
var scene3DFloorContainer = []; //Contains all Floor 3D objects by floor (sofas,tables)
var scene2DFloorContainer = []; //Contains all 2D lines by floor
var scene3DPivotPoint; //Rotational pivot point - 1 object
var scene3DCudeMesh;
var sceneAmbientLight;
var sceneDirectionalLight;
//var sceneParticleLight;
//var scenePointLight;

var controls3D;
//var controls2D;

var camera3D;
var camera2D;
var camera3DCube;
var camera3DMenu;
var camera3DMirrorReflection;

var groundGrid;
var groundMesh;

var skyGrid;
var skyMesh;


var containerMenu;
//var stats, objects;

var RADIAN = Math.PI / 180;
var AUTOROTATE = true;
var TOOL = 'view';
var FLOOR = 1; //first floor selected default

//var keyboard = new THREE.KeyboardState();
//var clock = new THREE.Clock();

var scene2DDrawLineGeometry; //Temporary holder for mouse click and drag drawings
var scene2DDrawLine;
var scene2DDrawLineMaterial; //Line thikness
var scene2DDrawLineContainer; //Container of line geometries - need it as a collection for "quick hide"
var scene2DWallGeometry = [
    [],
    []
]; //Multidimensional Array to hold multiple floors with each having multiple walls - they also hold a 3D geometry
var scene2DWallRegularMaterial;
var scene2DWallRegularMaterialSelect;
var scene2DWallBearingMaterial;
var scene2DWallBearingMaterialSelect;


var collision = [];
var hold = {};

var mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    INTERSECTED, SELECTED;

var projector;
var geometry;
var spinObject;
var menuSpinHelper;

/*
var menuOffset = {
left: 0,
top: 0,
};
*/
/*
var clickInfo = {
x: 0,
y: 0,
userHasClicked: false
};
*/

init();

function initMenu() {

    scene3DMenu = new THREE.Scene();
    projector = new THREE.Projector();

    scene3DMenuHouseContainer = new THREE.Object3D();
    scene3DMenuFloorContainer = new THREE.Object3D();
    //scene3DMenuHouseContainer.position.set(0, 0, 0);
    //scene3DMenuFloorContainer.position.set(0, 0, 0);

    containerMenu = document.getElementById('WebGLCanvasMenu');
    //containerWidth = window.innerWidth; //debug
    //containerHeight = window.innerHeight; //debug
    containerWidth = containerMenu.clientWidth;
    containerHeight = window.innerHeight; //TODO: list height

    //console.log("container W:" + containerWidth + " container H:" + containerHeight)
    //console.log("container X:" + containerMenu.offsetLeft + " container Y:" + containerMenu.offsetTop)

    if (Detector.webgl) {
        rendererMenu = new THREE.WebGLRenderer({
            antialias: false,
            //preserveDrawingBuffer: false
        });
    } else {
        rendererMenu = new THREE.CanvasRenderer();
    }
    //rendererMenu.setSize(window.innerWidth, window.innerHeight - 300);
    rendererMenu.setSize(containerWidth, containerHeight);
    rendererMenu.setClearColor(0xeeeedd, 1.0);

    containerMenu.appendChild(rendererMenu.domElement);
    //var menuOffset = containerMenu.getBoundingClientRect();
    //menuOffset.x = offsets.left;
    //menuOffset.y = offsets.top;   


    //camera3DMenu = new THREE.PerspectiveCamera(60, window.innerWidth  / (window.innerHeight - 300), 1, 400);
    camera3DMenu = new THREE.PerspectiveCamera(4, containerWidth / containerHeight, 1, 500);
    camera3DMenu.position.set(0, 0, 440);
    camera3DMenu.lookAt(new THREE.Vector3(0, 0, 0));
    //scene3DMenu.add(camera3DMenu);

    //mouseVector = new THREE.Vector3();

    window.addEventListener('resize', function() {
        //containerWidth = window.innerWidth; //debug
        //containerHeight = window.innerHeight; //debug
        containerWidth = containerMenu.clientWidth;
        containerHeight = window.innerHeight; //TODO: list height
        rendererMenu.setSize(containerWidth, containerHeight);
        camera3DMenu.aspect = containerWidth / containerHeight;
        camera3DMenu.updateProjectionMatrix();
    }, false);

    /*
     containerMenu.addEventListener('click', function (evt) {
        // The user has clicked; let's note this event and the click's coordinates so that we can react to it in the render loop
        clickInfo.userHasClicked = true;
        clickInfo.x = evt.clientX;
        clickInfo.y = evt.clientY;
    }, false);
   
    document.addEventListener( 'drag', function ( event ) {
                    event.preventDefault();
                    containerMenu.removeEventListener('mousedown', mouseDownMenu);
                    containerMenu.removeEventListener('mousemove', mouseMoveMenu);
                    //event.dataTransfer.dropEffect = 'copy';
    }, false );
    */

    containerMenu.addEventListener('mousedown', mouseDownMenu);
    //containerMenu.bind('mousedown', mouseDownMenu); //Using bind() means no worry which browser is running.

    /*
    document.addEventListener('mouseup', function(event) {
        event.preventDefault();
        //containerMenu.removeEventListener('mousemove', mouseMoveMenu);
        //containerMenu.addEventListener('mousedown', mouseDownMenu);

        //spinObject.applyMatrix(scene3DMenuHouseContainer.matrixWorld );
        //scene3DMenuHouseContainer.rotation.x = 0;
        //scene3DMenuHouseContainer.rotation.y = 0;
        //menuSpinHelper = true;
    }, false);
    */

    //var menugrid = new THREE.GridHelper( 200, 200 );
    //scene3DMenu.add(menugrid);

    var menuItem = ["Interior/Furniture/burlap-sofa.js", "Interior/Furniture/burlap-sofa.js", "Interior/Furniture/burlap-sofa.js", "Interior/Furniture/burlap-sofa.js"];
    var menuItemDescription = ["Model T45", "Model T5", "Model T34", "Model T70"];
    var menuItemPrices = [200, 399, 600, 1999];

    var topMenu3DPosition = 11;
    var topMenuItemPosition = 50;

    for (var i = 0; i < 3; i++) {
        loadJSON(menuItem[i], scene3DMenuHouseContainer, -3, topMenu3DPosition, 0, 0, 0, 2.5);

        // create a canvas element
        var canvasItem = document.createElement('div');
        canvasItem.id = "item" + i;
        canvasItem.style.cssText = "color:#000;font-size:16px;line-height:25px";
        canvasItem.style.position = 'absolute';
        canvasItem.style.width = 98 + '%';
        canvasItem.style.height = 20 + 'px';
        //canvas1.style.display = 'block';
        //canvas1.style.backgroundColor = "blue";
        canvasItem.style.top = topMenuItemPosition + 'px';
        canvasItem.style.left = 50 + '%';
        canvasItem.style.zIndex = 100;
        canvasItem.innerHTML = menuItemDescription[i] + "<br/><div>";
        containerMenu.appendChild(canvasItem);

        var canvasPrice = document.createElement('div');
        canvasPrice.id = "price" + i;
        canvasPrice.style.cssText = "color:#000;font-size:16px;background-image:url('images/pricetag.png')";
        canvasPrice.style.position = 'absolute';
        canvasPrice.style.width = 84 + 'px';
        canvasPrice.style.height = 35 + 'px';
        //canvas1.style.display = 'block';
        //canvas1.style.backgroundColor = "blue";
        canvasPrice.style.top = topMenuItemPosition + 22 + 'px';
        canvasPrice.style.left = 50 + '%';
        canvasPrice.style.zIndex = 100;
        canvasPrice.innerHTML = "<strong style='margin-left: 40px; padding: 5px;'>$" + menuItemPrices[i] + " </strong>";
        containerMenu.appendChild(canvasPrice);

        topMenu3DPosition -= 4.5;
        topMenuItemPosition += 110;
    }

    //scene3DMenuHouseContainer.children.forEach(function( cube ) {
    //console.log("object" + cube.name);
    //scene3DMenuHouseContainer.children[0].rotateOnAxis(new THREE.Vector3(1,0,0), 30 * RADIAN);
    //cube.visible = false;
    //cube.rotateX(5);
    //cube.rotateOnAxis(new THREE.Vector3(1,0,0), 30 * RADIAN);
    //cube.material.color.setRGB( cube.grayness, cube.grayness, cube.grayness );
    //positions.push(cube.position);
    //});

    scene3DMenu.add(scene3DMenuHouseContainer);
    scene3DMenuLight();
    animateMenu();
    //rendererMenu.render(scene3DMenu, camera3DMenu);
}


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

    /*
    scene3DContainer must contain all scene objects (save/open) scene2DFloorContainer generates own objects based on idName from scene3DContainer.
    This way Exterior objects can be hidden from Interior objects

    Object id: random-ext/int-floor-history/undo/redo (ex: sofa345-int-0-5)
    Floors:
        0 = Basement
        1 = First Floors
        2 = Second Floor
    */

    scene3DHouseContainer = new THREE.Object3D();
    scene3DHouseGroundContainer = new THREE.Object3D();
    scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DFloorContainer[0] = new THREE.Object3D();
    scene2DFloorContainer[0] = new THREE.Object3D();
    scene3DPivotPoint = new THREE.Object3D();

    //60 times more geometry
    //THREE.GeometryUtils.merge(geometry, otherGeometry);


    //VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera3D = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 600);
    camera2D = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 600);

    camera2D.position.z = 200; // the camera starts at 0,0,0 so pull it back

    var gridXY = new THREE.GridHelper(100, 2);
    gridXY.position.set(0, 0, 0);
    gridXY.rotation.x = Math.PI / 2;
    gridXY.setColors(new THREE.Color(0x000066), new THREE.Color(0x6dcff6));
    scene2D.add(gridXY);

    scene2DDrawLineGeometry = new THREE.Geometry();
    scene2DDrawLineMaterial = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 5,
        //linecap: "round",
        linejoin: "round"
        //opacity: 0.5
    });
    scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineMaterial);
    //scene2DDrawLineContainer.add(scene2DDrawLine);

    scene2DWallRegularMaterial = new THREE.ImageUtils.loadTexture('objects/FloorPlan/P0001.png');
    scene2DWallRegularMaterialSelect = new THREE.ImageUtils.loadTexture('objects/FloorPlan/P0002.png');

    var cubeMaterials = [
        new THREE.MeshBasicMaterial({
            color: 0x33AA55,
            transparent: true,
            opacity: 0.9
        }),
        new THREE.MeshBasicMaterial({
            color: 0x55CC00,
            transparent: true,
            opacity: 0.9
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9
        }),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9
        }),
        new THREE.MeshBasicMaterial({
            color: 0x0000FF,
            transparent: true,
            opacity: 0.9
        }),
        new THREE.MeshBasicMaterial({
            color: 0x5555AA,
            transparent: true,
            opacity: 0.9
        }),
    ];
    var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
    scene3DCubeMesh = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), cubeMaterial);
    //THREE.GeometryUtils.merge(geometry, mesh);

    //camera3D.lookAt(scene3D.position);

    //Quaternion slerp is your friend for smooth rotations to target location. You need to use quaternion 
    camera3D.useQuaternion = true;
    /*
    var newQuaternion = new THREE.Quaternion();
	THREE.Quaternion.slerp(camera.quaternion, destinationQuaternion, newQuaternion, 0.07);
	camera.quaternion = newQuaternion;
	*/

    //scene2D.add(new THREE.GridHelper(100, 10));

    //A 1x1 Rectangle for Scale - Should Map to a 1x1 square of Three.js space
    //scene2D.fillStyle = "#FF0000";
    //scene2D.fillRect(0, 0, 1, 1);

    //scene3D.add(camera3D);
    //scene2D.add(camera2D);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: false
    });
    rendererCube = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        //transparent: true,
        preserveDrawingBuffer: false
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;
    //renderer.physicallyBasedShading = true;
    renderer.sortObjects = false;
    document.getElementById('WebGLCanvas').appendChild(renderer.domElement);

    //Orientation Cube
    rendererCube.setSize(100, 100);
    renderer.setClearColor(0xffffff, 1);
    document.getElementById('WebGLCubeCanvas').appendChild(rendererCube.domElement);
    scene3DCube = new THREE.Scene();
    camera3DCube = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera3DCube.up = camera3D.up;
    scene3DCube.add(camera3D);
    scene3DCube.add(scene3DCubeMesh);

    //automatically resize renderer THREE.WindowResize(renderer, camera); toggle full-screen on given key press THREE.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    //window.addEventListener('resize', onWindowResize, false);
    $(window).addEventListener('resize', onWindowResize, false);

    //http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    //shim layer with setTimeout fallback
    /*
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
        };
    })();
    */

    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);

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
    initMenu();
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

function loadJSON(js, object, x, y, z, xaxis, yaxis, ratio) {
    /*
    new THREE.JSONLoader().load('js/your_js_file_path_.js', function(geometry){
      var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial());
      scene.add( mesh );
    }, 'images');
    */

    var loader = new THREE.JSONLoader();

    loader.load("./objects/" + js, function(geometry, materials) {
        /*
        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial({
            map: materials[0],
            envMap: camera3DMirrorReflection.renderTarget
        }));
        */

        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.overdraw = true;

        if (ratio != 1) {
            geometry.computeBoundingBox();
            var box = geometry.boundingBox;
            ratio = ratio / box.max.y //calculate scale ratio or var box = new THREE.Box3().setFromObject( object );
            mesh.scale.x = mesh.scale.y = mesh.scale.z = ratio;
            //console.log("width " + box.max.x);
            mesh.castShadow = false;
            mesh.receiveShadow = false;
        }
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.doubleSided = false;
        //mesh.matrixAutoUpdate = false;
        //mesh.updateMatrix();
        object.add(mesh);
    }, "./objects/" + js.substring(0, js.lastIndexOf("/") + 1) + "Textures/");
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


function loadBIN(js, object, x, y, z, xaxis, yaxis, ratio) {
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

    //IMPORTANT: be sure to use ./ or it may not load the .bin correctly 
    var loader = new THREE.BinaryLoader();
    //loader.options.convertUpAxis = true;
    loader.load("./objects/" + js, function(geometry, materials) {
        //var geometry = new THREE.PlaneGeometry(5, 5);
        geometry.dynamic = false;
        geometry.verticesNeedUpdate = false;
        geometry.normalsNeedUpdate = false;
        geometry.needsUpdate = false;

        /*
        Smooth shading is the default one (material.shading = THREE.SmoothShading).
        Problem is more likely normals - smooth shading depends on having proper vertex normals - either you need to have them already
        present in the JSON file from the export / conversion or you need to compute them manually after loading the file:
        geometry.computeVertexNormals();
        */

        //geometry.computeVertexNormals(); //smooth operator
        /*var binMaterial = new THREE.MeshBasicMaterial({
        map: groundTexture,
        side: THREE.DoubleSide
    	});
       */

        //var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(materials)); //basic
        /*
		    var groundTexture = new THREE.ImageUtils.loadTexture(_texture);
		    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		    groundTexture.repeat.set(10, 10);

		    // DoubleSide: render texture on both sides of mesh
		    var floorMaterial = new THREE.MeshBasicMaterial({
		        map: groundTexture,
		        side: THREE.DoubleSide
		    });

		    texture.wrapT = THREE.RepeatWrapping;
			texture.wrapS = THREE.ClampToEdgeWrapping;
		*/

        /*
        var texture = new THREE.Texture(materials);
        texture.needsUpdate = true;

        var material = new THREE.MeshPhongMaterial({
            map: texture
        });
        var mesh = new THREE.Mesh(geometry, material);
        */

        //var orange    = new THREE.MeshLambertMaterial( { color: 0x995500, opacity: 1.0, transparent: false } ); 
        //var material = new THREE.MeshFaceMaterial(materials);

        /*
        for (var i = 0; i < materials.length; i++) {
            //materials[i].map.image;
            console.log('found image texture');
        }
        */

        var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials)); //flat
        //var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial(materials)); //???
        //var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(materials)); //shiny

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.overdraw = true;

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
        //mesh.scale.x = mesh.scale.y = mesh.scale.z = ratio;

        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.doubleSided = false;

        // set the geometry to dynamic so that it allow updates
        //mesh.geometry.dynamic = false;

        // changes to the vertices
        //mesh.geometry.verticesNeedUpdate = false;

        // changes to the normals
        //mesh.geometry.normalsNeedUpdate = false;

        //mesh.geometry.needsUpdate = false;

        //THREE.GeometryUtils.center(geometry);

        //offset pivot
        //mesh.geometry.applyMatrix( new THREE.Matrix4().setTranslation( 0, 10, 0 ) );
        //mesh.rotation.x = xaxis * Math.PI / 1000;
        //mesh.rotation.y = yaxis * Math.PI / 1000;

        //All objects by default automatically update their matrices.
        //However, if you know object will be static, you can disable this and update transform matrix manually just when needed.
        //object.matrixAutoUpdate = false;
        //object.updateMatrix();

        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();

        object.add(mesh);
    });
}

function show3DHouse() {

    show2DContainer(false);

    //the camera defaults to position (0,0,0) so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
    camera3D.position.set(0, 6, 20);

    //TODO: Loop and show based in ID name
    scene3D.add(sceneDirectionalLight);
    scene3D.add(scene3DHouseGroundContainer);
    scene3D.add(scene3DHouseContainer);
    scene3D.add(scene3DFloorContainer[0]);
    scene3D.add(scene3DPivotPoint);

    scene3DCube.add(scene3DCubeMesh);

    //scene3DHouseContainer.traverse;

    //show3DHouseContainer(true)
    //show3DFloorContainer(false);

    //Auto close right menu
    document.getElementById('box-right').setAttribute("class", "hide-right");
    delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

    //TODO: change menu content
    /*
    setTimeout(function() {
        //do what you need here
    }, 2000);
    */
    //document.getElementById('box-right').setAttribute("class", "show-right");
    //delay(document.getElementById("arrow-right"), "images/arrowright.png", 400);
}

function show3DFloor() {

    show2DContainer(false);

    camera3D.position.set(0, 6, 15);

    //TODO: Loop and show based in ID name / floor
    //scene3D.add(scene3DContainer);

    //TODO: remove other floors
    scene3D.add(scene3DFloorGroundContainer);
    scene3D.add(scene3DFloorContainer[0]);
    scene3D.add(scene3DPivotPoint);

    scene3DCube.add(scene3DCubeMesh);

    //scene3DFloorContainer[0].traverse;
    //show3DFloorContainer(true);
    //show3DHouseContainer(false)


    //Auto open right menu
    document.getElementById('box-right').setAttribute("class", "show-right");
    delay(document.getElementById("arrow-right"), "images/arrowright.png", 400);
}

function show2D() {
    //camera2D.position.set(0, 8, 20);
    show2DContainer(true);

    scene2D.add(scene2DFloorContainer[0]);

    //scene2DFloorContainer[0].traverse;

    //Auto close right menu
    document.getElementById('box-right').setAttribute("class", "hide-right");
    delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);
}

function show2DContainer(b) {
    //console.log("show2DContainer " + b);

    scene3D.remove(sceneDirectionalLight);
    scene3D.remove(scene3DHouseGroundContainer);
    scene3D.remove(scene3DHouseContainer);
    scene3D.remove(scene3DFloorContainer[0]);
    scene3D.remove(scene3DPivotPoint);
    scene2D.remove(scene2DDrawLineContainer);

    scene3DCube.remove(scene3DCubeMesh);

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

function onWindowResize() {
    if (scene3D.visible) {
        camera3D.aspect = window.innerWidth / window.innerHeight;
        camera3D.updateProjectionMatrix();
    }
    /*
    if(scene3DHouse.visible)
    {
            camera3DHouse.aspect = window.innerWidth / window.innerHeight;
            camera3DHouse.updateProjectionMatrix();
        }else if(scene3DFloor.visible){
            camera3DFloor.aspect = window.innerWidth / window.innerHeight;
            camera3DFloor.updateProjectionMatrix();
    }
    */
    else if (scene2D.visible) {
        camera2D.aspect = window.innerWidth / window.innerHeight;
        camera2D.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {

    event.preventDefault();

    x = (event.clientX / window.innerWidth) * 2 - 1;
    y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (scene2D.visible) {
        //x = (event.clientX - (window.innerWidth / 2)) / 20;
        //y = ((window.innerHeight / 2) - event.clientY) / 20;
        x = x * 20;
        y = y * 20;

        if (mouse.x != 0 && mouse.y != 0) {
            var scene2DDrawLineGeometry = new THREE.Geometry();
            scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(mouse.x, mouse.y, 0.5));
            scene2DDrawLineGeometry.vertices.push(new THREE.Vector3(x, y, 0.5));
            var scene2DDrawLine = new THREE.Line(scene2DDrawLineGeometry, scene2DDrawLineMaterial);
            scene2DDrawLineContainer.add(scene2DDrawLine);
            //scene2D.add(scene2DDrawLineContainer);
        }
        mouse.x = x;
        mouse.y = y;
    } else {
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
    }
}

function onDocumentMouseDown(event) {

    event.preventDefault();

    AUTOROTATE = false;
    //renderer.antialias = false;

    if (scene2D.visible) {
        //reset
        scene2DDrawLineContainer = new THREE.Object3D();
        mouse = new THREE.Vector2()
        scene2D.add(scene2DDrawLineContainer);
        //$(window).bind('mousemove', drag2D).bind('mouseup', drag2DEnd);
    } else {

        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        projector.unprojectVector(vector, camera3D);

        var raycaster = new THREE.Raycaster(camera3D.position, vector.sub(camera3D.position).normalize());
        var intersects = raycaster.intersectObjects(scene3DHouseContainer);

        if (intersects.length > 0) {
            console.log("Intersects " + intersects.length + ":" + intersects[0].object.id);

            controls3D.enabled = false;
            SELECTED = intersects[0].object;

            //var intersects = raycaster.intersectObject(plane);
            //offset.copy(intersects[0].point).sub(plane.position);

            //container.style.cursor = 'move';
        }
    }
}

function onDocumentMouseUp(event) {

    event.preventDefault();

    if (scene2D.visible) {
        scene2D.remove(scene2DDrawLineContainer);
    } else {
        controls3D.enabled = true;

        if (INTERSECTED) {
            plane.position.copy(INTERSECTED.position);
            SELECTED = null;
        }
        //container.style.cursor = 'auto';
    }
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
    var exporter = new THREE.ObjectExporter;
    var obj = exporter.parse(scene3D);
    var json = JSON.stringify(obj);

    newwindow = window.open()
    var document = newwindow.document; //because you need to write in the document of the window 'newwindow'
    document.open();

    document.writeln(json);

    //var store = localStorage['WebGL-HousePlanner', json];
    //log(json);
}

function sceneNew() {

    for (var i = 0; i < scene3DHouseContainer.children.length; i++) {
        scene3D.remove(scene3DHouseContainer.children[i]);
    }

    for (var i = 0; i < scene3DFloorContainer[0].children.length; i++) {
        scene3D.remove(scene3DFloorContainer[0].children[i]);
    }

    //loadJSON("Platform/ground-grass.js", scene3DHouseGroundContainer, 0, 0, 0, 0, 0, 1); //Exterior ground
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
    new THREE.JSONLoader().load("objects/Platform/ground-grass.js", function(geometry, materials) {
        var groundTexture = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/G36096.png');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(5, 5);
        groundTexture.anisotropy = 1.5; //focus blur (16=unblured 1=blured)

        var groundMaterial = new THREE.MeshBasicMaterial({
            map: groundTexture
        });
        var mesh = new THREE.Mesh(geometry, groundMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene3DHouseGroundContainer.add(mesh);
    });

    new THREE.JSONLoader().load("objects/Platform/ground-wood.js", function(geometry, materials) {
        var groundTexture = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/W36786.jpg');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(10, 10);
        groundTexture.anisotropy = 1.5; //focus blur (16=unblured 1=blured)

        var groundMaterial = new THREE.MeshBasicMaterial({
            map: groundTexture
        });
        var mesh = new THREE.Mesh(geometry, groundMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene3DFloorGroundContainer.add(mesh);
    });
    //===============================================
    //loadJSON("Platform/ground-wood.js", scene3DFloorGroundContainer, 0, 0, 0, 0, 0, 1); //Interior ground (defferent from floor textures)
    camera3DMirrorReflection = new THREE.CubeCamera(0.1, 5000, 512); //Glassy looking showfloor surface

    //Temporary Objects for visualization
    //TODO: load from one JSON file
    loadJSON("Platform/house3.js", scene3DHouseContainer, 0, 0, 0, 0, 0, 1);
    loadJSON("Exterior/Trees/palm.js", scene3DHouseContainer, -6, 0, 8, 0, 0, 1);
    loadJSON("Exterior/Plants/bush.js", scene3DHouseContainer, 6, 0, 8, 0, 0, 1);
    loadJSON("Exterior/Fence/fence1.js", scene3DHouseContainer, -5, 0, 10, 0, 0, 1);
    loadJSON("Exterior/Fence/fence2.js", scene3DHouseContainer, 0, 0, 10, 0, 0, 1);
    //loadJSON("Exterior/Cars/VWbeetle.js", scene3DHouseContainer, -2.5, 0, 8, 0, 0, 1);


    //loadJSON("Platform/elaine.js", scene3DPivotPoint, 0, 0, 0, 0, 0, 1);

    //loadJSON("Interior/Furniture/burlap-sofa.js", scene3DFloorContainer[0], 0, 0, 0, 0, 0, 1);

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

function scene3DSky() {

    //scene3D.remove(skyGrid);

    var geometry = new THREE.SphereGeometry(500, 60, 40);
    var uniforms = {
        texture: {
            type: 't',
            value: THREE.ImageUtils.loadTexture('objects/Platform/Textures/S0001.jpg')
        }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('sky-vertex').textContent,
        fragmentShader: document.getElementById('sky-fragment').textContent
    });
    skyMesh = new THREE.Mesh(geometry, material);
    skyMesh.scale.set(-1, 1, 1);
    //skyBox.eulerOrder = 'XZY';
    //skyBox.renderDepth = 1000.0;

    //scene3D.remove(skyMesh);
    scene3D.add(skyMesh);
}

/*
function scene3DFloorSky() {
    scene3D.remove(skyMesh);
}
*/

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

    /*
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 0.75, 0.5);
    hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
    hemiLight.position.set(0, 100, 0);
    scene3D.add(hemiLight);
    */
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

    sceneAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    scene3D.add(sceneAmbientLight);
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

}

function scene3DMenuLight() {
    var ambientLight = new THREE.AmbientLight(0x444444); // 0xcccccc
    scene3DMenu.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    //directionalLight.color.setHSL( 0.1, 1, 0.95 );
    directionalLight.position.set(-1, 1.75, 1);
    //directionalLight.position.multiplyScalar( 50 );
    //directionalLight.position.set( -1, 0, 0 ).normalize();

    scene3DMenu.add(directionalLight);

    //var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 ); 
    //directionalLight.position.set( 20, 10, 20 ).normalize();
    //scene3DMenu.add(directionalLight);

    //var ambientLight = new THREE.AmbientLight(0xFFFFFF);
    //scene3DMenu.add(ambientLight);
    //scene3DMenu.matrixAutoUpdate = false;

    // recommend either a skybox or fog effect (can't use both at the same time) 
    // without one of these, the scene's background color is determined by webpage background

    // make sure the camera's "far" value is large enough so that it will render the skyBox!
    //var skyBoxGeometry = new THREE.CubeGeometry( 20, 20, 20 );
    // BackSide: render faces from inside of the cube, instead of from outside (default).
    //var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
    //var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    //scene3DMenu.add(skyBox);
}
/*
function scene3DFloorLight() {
    scene3DHouseLight();
}
*/
function mouseDownMenu(event) {
    //event.preventDefault();
    //spinObject.rotation.y = 0; //reset previewous object
    var menuOffset = containerMenu.getBoundingClientRect();
    // Now we set our direction vector to those initial values
    hold.x = event.clientX - menuOffset.left;
    hold.y = event.clientY - menuOffset.top;
    //console.log("mouse X:" + x + " mouse Y:" + y);

    // The following will translate the mouse coordinates into a number ranging from -1 to 1, where
    // x == -1 && y == -1 means top-left, and
    // x == 1 && y == 1 means bottom right
    var directionVector = new THREE.Vector3((hold.x / containerWidth) * 2 - 1, -(hold.y / containerHeight) * 2 + 1, 0.5);
    //directionVector.set(x, y, 0.5);

    projector.unprojectVector(directionVector, camera3DMenu);
    directionVector.sub(camera3DMenu.position); // Substract the vector representing the camera position
    directionVector.normalize(); //Normalize the vector, to avoid large numbers from the projection and substraction

    var ray = new THREE.Raycaster(camera3DMenu.position, directionVector); // Now our direction vector holds the right numbers!

    //ray.ray.direction.set(0, 0, -1); // Z- DIRECTION

    var intersects = ray.intersectObjects(scene3DMenuHouseContainer.children);

    if (intersects.length > 0) {
        //console.log("Intersects " + intersects.length + ":" + intersects[0].object.id);
        // intersections are, by default, ordered by distance, so we only care for the first one. The intersection
        // object holds the intersection point, the face that's been "hit" by the ray, and the object to which that
        // face belongs. We only care for the object itself.
        spinObject = intersects[0].object;
        //console.log("Object Y-Axis " + spinObject.rotation.y);
        //containerMenu.addEventListener('mousemove', mouseMoveMenu);
    }
}

function mouseMoveMenu(event) {
    event.preventDefault();
    var menuOffset = containerMenu.getBoundingClientRect();
    var diffX = event.clientX - menuOffset.left - hold.x;
    var diffY = event.clientY - menuOffset.top - hold.y;

    //console.log("DiffX" + diffX + " DiffY " + diffY)

    //spinObject.rotation.x = (diffY * 0.25) * RADIAN;
    spinObject.rotation.y = (diffX * 0.25) * RADIAN;
}

function animateMenu() {

    //TODO: render only when menu is visible
    requestAnimationFrame(animateMenu);

    if (spinObject != null) { // && menuSpinHelper) {
        if (spinObject.rotation.y > 6) {
            //menuSpinHelper = false;
            spinObject.rotation.y = 0;
            spinObject = null;
        } else {
            //var rotation_matrix = new THREE.Matrix4().setRotationX(.01); // Animated rotation will be in .01 radians along object's X axis
            //spinObject.matrix.multiplySelf(rotation_matrix);

            //console.log("rotated " + spinObject.rotation.y);
            //spinObject.rotateOnAxis(new THREE.Vector3(0,1,0), -10 * RADIAN);
            spinObject.rotation.y += 10 * RADIAN;

            //spinObject.rotation.y = (spinObject.rotation.y *0.25) * RADIAN ;
            //spinObject.position.set(0,spinObject.position.x+10,0);
            //spinObject.matrix.setRotationFromEuler(spinObject.rotation);
        }
        //rendererMenu.render(scene3DMenu, camera3DMenu);
    }
    rendererMenu.render(scene3DMenu, camera3DMenu);
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

        if (scene3DFloorContainer.visible) {

            /*
            move the CubeCamera to the position of the object that has a reflective surface,
            "take a picture" in each direction and apply it to the surface.
            need to hide surface before and after so that it does not "get in the way" of the camera
            */
            camera3DMirrorReflection.visible = false;
            camera3DMirrorReflection.updateCubeMap(renderer, scene3D);
            camera3DMirrorReflection.visible = true;
            //controls3DFloor.update();
        }

        controls3D.update();
        renderer.render(scene3D, camera3D);

        //Orientation Cube
        camera3DCube.position.copy(camera3D.position);
        camera3DCube.position.sub(controls3D.center);
        camera3DCube.position.setLength(18);
        camera3DCube.lookAt(scene3DCube.position);
        rendererCube.render(scene3DCube, camera3DCube);

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

        /*
                if(scene3DHouse.visible){
          renderer.render(scene3DHouse, camera3D);
                    //renderer.render(scene3DHouse, camera3DHouse);
                }
        else if(scene3DFloor.visible){
          renderer.render(scene3DFloor, camera3D);
                    //renderer.render(scene3DFloor, camera3DFloor);
  		*/
    } else if (scene2D.visible) {
        //controls2D.update();
        renderer.render(scene2D, camera2D);
    }
    /*
    if (spinObject != null) { //} && menuSpinHelper){
        if (spinObject.rotation.y > 6) {
            //menuSpinHelper = false;
            spinObject.rotation.y = 0;
            spinObject = null;
        } else {
            //var rotation_matrix = new THREE.Matrix4().setRotationX(.01); // Animated rotation will be in .01 radians along object's X axis
            //spinObject.matrix.multiplySelf(rotation_matrix);

            //console.log("rotated " + spinObject.rotation.y);
            //spinObject.rotateOnAxis(new THREE.Vector3(0,1,0), -10 * RADIAN);
            spinObject.rotation.y += 10 * RADIAN;

            //spinObject.rotation.y = (spinObject.rotation.y *0.25) * RADIAN ;
            //spinObject.position.set(0,spinObject.position.x+10,0);
            //spinObject.matrix.setRotationFromEuler(spinObject.rotation);
        }
        //rendererMenu.render(scene3DMenu, camera3DMenu);
    }
    rendererMenu.render(scene3DMenu, camera3DMenu);
	*/
    //renderer.render( scene, camera );
}

/* COORDINATE ARROWS */
function makeCoordinateArrows() {
    var coordinateArrows = new THREE.Object3D();
    var org = new THREE.Vector3(0, 0, 0);

    var dir = new THREE.Vector3(0, 0, 1);
    coordinateArrows.add(new THREE.ArrowHelper(dir, org, 8, 0x0000FF)); // Blue = z
    dir = new THREE.Vector3(0, 1, 0);
    coordinateArrows.add(new THREE.ArrowHelper(dir, org, 8, 0x00FF00)); // Green = y
    dir = new THREE.Vector3(1, 0, 0);
    coordinateArrows.add(new THREE.ArrowHelper(dir, org, 8, 0xFF0000)); // Red = x

    return coordinateArrows;
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

function drag2DEnd(e) {
    $(window).unbind('mousemove', drag2D).unbind('mouseup', drag2DEnd);
    scene2D.remove(scene2DDrawLineContainer);
    //TODO: Analyse and create solid wall lines
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