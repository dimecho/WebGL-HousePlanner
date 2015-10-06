

function selectMeasurement() {

    if (REALSIZERATIO == 1.8311874) {
        //$('#menuMeasureText').html("Imperial");
        REALSIZERATIO = 1; //Imperial Ratio TODO: Get the right ratio
    } else {
        //$('#menuMeasureText').html("Metric");
        REALSIZERATIO = 1.8311874; //Metric Ratio
    }
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

function scene3DSplitViewTop()
{
    var w = window.innerWidth/1.4;
    var h = window.innerHeight*0.2;

    $("#left-component-1").css({ width: w });
    $("#right-component-1").css({ left: w });
    $("#vertical-divider-1").css({ left: w });

    $("#bottom-component").css({ height: h });
    $("#top-component").css({ bottom: h });
    $("#horizontal-divider").css({ bottom: h });

    scene3DInitializeRendererQuadSize();
}

function scene3DSplitViewFront()
{

    var w = window.innerWidth*0.3;
    var h = window.innerHeight*0.2;

    $("#left-component-1").css({ width: w });
    $("#right-component-1").css({ left: w });
    $("#vertical-divider-1").css({ left: w });

    $("#bottom-component").css({ height: h });
    $("#top-component").css({ bottom: h });
    $("#horizontal-divider").css({ bottom: h });

    scene3DInitializeRendererQuadSize();
}

function scene3DSplitViewSide()
{
    var w = window.innerWidth*0.15;
    var h = window.innerHeight/1.4;

    $("#left-component-1").css({ width: w });
    $("#right-component-1").css({ left: w });
    $("#vertical-divider-1").css({ left: w });

    $("#bottom-component").css({ height: h });
    $("#top-component").css({ bottom: h });
    $("#horizontal-divider").css({ bottom: h });

    scene3DInitializeRendererQuadSize();
}

function scene3DSplitView3D()
{
    
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
    if (SelectedNote.name !== "")
    {
        //camera3D.add(SelectedNote);

        var pLocal = new THREE.Vector3( 0, -0.5, -0.6 );
        var target = pLocal.applyMatrix4(camera3D.matrixWorld);

        var tween = new TWEEN.Tween(SelectedNote.position).to(target,2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
            $('#WebGLNote').show();
        }).start();
        tween = new TWEEN.Tween(SelectedNote.rotation).to({x:camera3D.rotation.x, y:camera3D.rotation.y, z:camera3D.rotation.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    }
}

function camera3DNoteExit()
{
    $('#WebGLNote').hide();
   
    //camera3D.remove(SelectedNote);
    var tween = new TWEEN.Tween(SelectedNote.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(SelectedNote.rotation).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
}

function camera3DAnimate(x,y,z,speed)
{
    if(!scene3DAnimateRotate){
	    //camera3D.position.set(0, 6, 20);
	    //controls3D.target = new THREE.Vector3(0, 50, 0);
        //camera3D.position.set(0, 20, 0);
        //camera3D.position.set(sx, sy, sz);
	    var tween = new TWEEN.Tween(camera3D.position).to({x:x, y:y, z:z},speed).easing(TWEEN.Easing.Quadratic.InOut).start();
        tween = new TWEEN.Tween(controls3D.target).to({x:0, y:0, z:0},speed).easing(TWEEN.Easing.Quadratic.InOut).start();
    }
}

function camera3DWalkViewToggle()
{
    if (controls3D instanceof THREE.FirstPersonControls)
    {
        camera3DPositionCache = new THREE.Vector3(0, 6, 20);
        camera3DPivotCache = new THREE.Vector3(0, 0, 0);
        camera3DAnimateResetView();
        scene3DenableOrbitControls(camera3D,renderer.domElement);
    }
    else if (controls3D instanceof THREE.OrbitControls)
    {
        alertify.confirm("", function (e) {
        if (e) {
            camera3DPositionCache = camera3D.position.clone();
            camera3DPivotCache = controls3D.target.clone();
            scene3DAnimateRotate = false;

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

function scene3DenableOrbitControls(camera, element)
{
    
    if (controls3D instanceof THREE.OrbitControls){
        //console.log("enable THREE.OrbitControls");
        controls3D.enabled = true;
    }else{
        
        //console.log("new THREE.OrbitControls");
        controls3D = new THREE.OrbitControls(camera, element);
        controls3D.minDistance = 3;
        controls3D.maxDistance = 25; //Infinity;
        //controls3D.minPolarAngle = 0; // radians
        //controls3D.maxPolarAngle = Math.PI; // radians
        controls3D.maxPolarAngle = Math.PI / 2; //Don't let to go below the ground
        //controls3D.target.set(THREE.Vector3(0, 0, 0)); //+ object.lookAT!
        controls3D.enabled = true;

        //camera3DAnimate(0,20,0, 500);
    }
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

        //var manager = new THREE.LoadingManager();
        /*          
        manager.onProgress = function ( item, loaded, total ) {
            //console.log( item, loaded, total );
        };
        */

        var callbackObject = function(object) {

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

            //var geometry = new THREE.BufferGeometry();
            //var meshArray = new THREE.Object3D();
            //var geometryMerge = new THREE.Geometry();
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
                        child.material.side = THREE.DoubleSide; //Normally this will slow things down > do "solidify" with Blender
                        //child.material.depthWrite = true; //Blender exports fix
                        //child.material.offset = 0; //v72
                        //child.material.repeat = 0; //v72
                        
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

                        //=============================
                        //Texture Quality Improvement
                        //=============================
                        if(child.material.map !== null){
                            if(child.material.map.image.complete){
                            //while(!child.material.map.image.complete)
                            //    setTimeout(function(){ foo },100);
                                var isImagePowerOfTwo = THREE.Math.isPowerOfTwo(child.material.map.image.width) && THREE.Math.isPowerOfTwo(child.material.map.image.height);
                                if(!isImagePowerOfTwo)
                                {
                                    var texture = new THREE.Texture(scene3DGenerateClampToEdgeTexture(child.material.map.image));
                                    if (texture) texture.needsUpdate = true;
                                    texture.minFilter = THREE.LinearFilter;
                                    child.material.map = texture;
                                    //child.material.map.image = scene3DGenerateClampToEdgeTexture(child.material.map.image);
                                    //child.material.map.image.needsUpdate = true;
                                }
                            }
                        }
                        
                        //============================
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

                //console.log(js + " > " + object.boundingBox.max.z + " " + object.boundingBox.max.x + " " + object.boundingBox.max.y)
               
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
                            //var manager = new THREE.LoadingManager();
                            var loader = new THREE.ObjectLoader(); //new THREE.ObjectLoader(manager);
                            loader.setTexturePath(textures);

                            //=======================================
                            //Blender Export v72 Fix
                            //=======================================
                            for (var i = 0; i < data.textures.length; i++) {

                                if(data.textures[i].mapping)
                                    data.textures[i].mapping = THREE[data.textures[i].mapping];

                                if(data.textures[i].minFilter)
                                    data.textures[i].minFilter = THREE[data.textures[i].minFilter];
                                
                                if(data.textures[i].magFilter)
                                    data.textures[i].magFilter = THREE[data.textures[i].magFilter];

                                if(data.textures[i].wrap)
                                {
                                    //data.textures[i].wrap = [THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping];
                                    data.textures[i].wrap = [THREE.RepeatWrapping,THREE.RepeatWrapping];
                                }
                            }
                            /*
                            for (var i = 0; i < data.images.length; i++) {
                                if(data.images[i].url)
                                    data.images[i].url = textures + data.images[i].url;
                            }
                            */
                            for (var i = 0; i < data.object.children.length; i++) {

                                //======================================================
                                //FIX for r72dev [openning same 3D models more than once]
                                //======================================================
                                data.object.children[i].uuid = THREE.Math.generateUUID();
                                //======================================================

                                var geometry_opacity = 1;
                                for (var g = 0; g < data.geometries.length; g++) {
                                    if (data.geometries[g].uuid == data.object.children[i].geometry){
                                        //data.geometries[g].uuid = THREE.Math.generateUUID();
                                        //data.object.children[i].geometry = data.geometries[g].uuid;
                                        geometry_opacity = data.geometries[g].materials[0].opacity;
                                        break;
                                    }
                                }
                                if(geometry_opacity == 0)
                                    geometry_opacity = 0.99;
                                //====================================
                                for (var m = 0; m < data.materials.length; m++) {
                                    //======================================================
                                    //FIX for r72dev [openning same 3D models textures - one texture per material]
                                    //======================================================
                                    for (var t = 0; t < data.textures.length; t++){
                                        if (data.textures[t].uuid == data.materials[m].map){
                                            data.textures[t].uuid = THREE.Math.generateUUID();
                                            data.materials[m].map = data.textures[t].uuid;
                                            break;
                                        }
                                    }
                                    //==================================
                                    if (data.materials[m].uuid == data.object.children[i].material){
                        
                                        data.materials[m].opacity = geometry_opacity;

                                        var material_uuid = THREE.Math.generateUUID();
                                        for (var ii = 0; ii < data.object.children.length; ii++) {
                                            if (data.object.children[ii].material == data.materials[m].uuid)
                                                data.object.children[ii].material = material_uuid;
                                        }
                                        data.materials[m].uuid = material_uuid;
                                        break;
                                    }
                                }
                            }
                            
                            //=======================================
                            loader.parse(data, callbackObject);
                            //=======================================
                        //}
                    //} catch (e) { //zip file was probably not found, load regular json
                        //console.log("Other 3D format " + e + " " + js.slice(0, -4) + "");
                       
                    //}
                },
                error: function(xhr, textStatus, errorThrown){
    				alertify.alert("3D Model (" + js + ") Loading Error");
    			}
            });

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

function scene3DGenerateClampToEdgeTexture(img) {
    // var texture = new THREE.Texture( scene3DGenerateClampToEdgeTexture( ) );
    //if (texture) texture.needsUpdate = true;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext( '2d' );
    //canvas.width = 128;
    //canvas.height = 128;

    //setTimeout(function() {
    //if(img.complete){
        var pattern = context.createPattern(img,"repeat");
        var size = img.width;
        if(img.height > img.width)
            size = img.height;
        canvas.width = size;
        canvas.height = size;
        //context.rect(0,0,size,size); 
        context.fillStyle = pattern;
        context.fillRect( 0, 0, size, size );
        
    //}else{
    //    context.fillStyle = "#FF0000";
    //    context.fillRect( 0, 0, size, size );
    //}
    context.fill();
    //},100);

    return canvas;
}

function show3DHouse() {

    scene3DFreeMemory();
    hideElements();
    SCENE = 'house';

    initMenu("menuRight3DHouse","Exterior/index.json");

    scene3DenableOrbitControls(camera3D,renderer.domElement);

    //SSAOProcessing.enabled = false;

    $(renderer.domElement).bind('mousedown', on3DHouseMouseDown);
    $(renderer.domElement).bind('mouseup', on3DHouseMouseUp);
    $(renderer.domElement).bind('mouseup', on3DHouseMouseMove);
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

    scene3DSetSky(DAY);
    //scene3DSetSky('0000');
    scene3D.add(skyMesh);

    if(settings.clouds)
        scene3D.add(weatherSkyCloudsMesh);
    if(settings.rainbow)
        scene3D.add(weatherSkyRainbowMesh);
    
    scene3DSetLight();

    scene3DFloorWallGenerate();

    //initObjectCollisions(scene3DHouseContainer);

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
    $('#engine3D').show();
    $('#WebGLCanvas').show();

    setTimeout(function() {
        camera3DAnimate(0,6,18, 1000);
    }, 1000);
    
    animate();
}


function Degrees2Radians(degrees) {
    return degrees * (Math.PI / 180);
}

function show3DLandscape() {

    scene3DAnimateRotate = false;
    scene3DFreeMemory();
    hideElements();
    //scene3D = new THREE.Scene();
    SCENE = 'landscape';

    scene3DSetSky('day');
    scene3DSetLight();

    scene3DenableOrbitControls(camera3D,renderer.domElement);

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
    $('#WebGLCanvas').show();

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

    scene3DAnimateRotate = false;
    scene3DFreeMemory();
    hideElements();
    SCENE = 'floor';

    initMenu("menuRight3DFloor","Interior/index.json");

    scene3DenableOrbitControls(camera3D,renderer.domElement);

    //SSAOProcessing.enabled = true;
    //FXAAProcessing.enabled = false;
    //scene3DInitializePostprocessing();

    //camera3D.position.set(0, 10, 12);
    
    //TODO: Loop and show based in ID name / floor
    //scene3D.add(scene3DContainer);

    buildPanorama(skyFloorMesh, '0000', 75, 75, 75,"",null);
    scene3D.add(skyFloorMesh);

    scene3DSetLight();

    scene3DFloorWallGenerate();
    
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
    scene3D.add(scene3DFloorGroundContainer);

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

    scene3DCube.add(scene3DCubeMesh);

    $('#engine3D').show();
    $('#WebGLCanvas').show();

    setTimeout(function() {
        camera3DAnimate(0,10,12, 1000);
    }, 500);

    animate();
}

function show3DFloorLevel() {
 
    scene3DAnimateRotate = false;
    scene3DFreeMemory();
    hideElements();
    //scene3D = new THREE.Scene();
    SCENE = 'floorlevel';

    //scene3DSetBackground('blue');
    scene3DSetSky('day');
    scene3DSetLight();

    scene3DenableOrbitControls(camera3D,renderer.domElement);

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
    $('#WebGLCanvas').show();

    animate();
}

function show3DRoofDesign() {
 
    scene3DAnimateRotate = false;
    scene3DFreeMemory();
    hideElements();
    SCENE = 'roof';

    initMenu("menuRight3DRoof","Roof/index.json");

    //scene3DSetBackground('split');
    scene3DSetLight();

    //camera3D.position.set(0, 4, 12);
    //var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
        
    scene3DInitializeRendererQuad();

    scene3D.add(camera3DQuadGrid);
    scene3D.add(scene3DRoofContainer);

    $("#WebGLSplitCanvas-0").bind('mousemove', on3DRoofSplit0MouseMove);
    $("#WebGLSplitCanvas").bind('mouseup', on3DRoofVDividerMouseUp);
    

    //scene3D.add(sceneHemisphereLight);
    //scene3D.add( new THREE.AxisHelper(100) );
    //scene3D.add(scene3DLevelGroundContainer);

    //TODO: show extruded stuff from scene2DFloorContainer[0]
    //scene3DCube.add(scene3DCubeMesh);

    toggleRight('menuRight', true);

    menuSelect(4, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //$('div.split-pane').splitPane();
    
    //$('#HTMLCanvas').hide();
    $('#engine3D').show();
    $('#WebGLSplitCanvas').show();

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
    if(settings.sunlight)
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

function hideElements() {
    //console.log("hideElements");
    if (renderer === undefined)
        return;

    //renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    //renderer.clear();
    
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
    $(renderer.domElement).unbind('mousemove', on3DHouseMouseMove);

    $(renderer.domElement).unbind('dblclick', onDocumentDoubleClick);

    $("#WebGLSplitCanvas-0").unbind('mousemove', on3DRoofSplit0MouseMove);
    $("#WebGLSplitCanvas").unbind('mouseup', on3DRoofVDividerMouseUp);

    $(renderer.domElement).unbind('mousedown', on3DFloorMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DFloorMouseUp);
    $(renderer.domElement).unbind('mousemove', on3DFloorMouseMove);

    $(renderer.domElement).unbind('mousedown', on3DLandscapeMouseDown);
    $(renderer.domElement).unbind('mouseup', on3DLandscapeMouseUp);
    $(renderer.domElement).unbind('mousemove', on3DLandscapeMouseMove);

    //$(renderer.domElement).unbind('mouseout', on3DLandscapeMouseUp);

    disposePanorama('WebGLPanorama');

    $('#engine2D').hide();
    $('#engine3D').hide();
    $('#WebGLCanvas').hide();
    $('#WebGLSplitCanvas').hide();

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
        if(settings.clouds)
        {
            texture = new THREE.ImageUtils.loadTexture('images/cloud.png');
            texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            weatherSkyMaterial.uniforms.map.value = texture;
            weatherSkyCloudsMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
            scene3D.add(weatherSkyCloudsMesh);
        }

        if(settings.rainbow)
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
        if(settings.clouds)
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

function scene3DObjectSelectRemove() {

    if (SCENE == 'house') {
        scene3DHouseContainer.remove(SelectedObject);
        //console.log(SelectedObject.uuid);
 
    } else if (SCENE == 'floor') {
        scene3DFloorFurnitureContainer[FLOOR].remove(SelectedObject);
    }
    
    scene3DObjectUnselect();
}

function scene3DObjectSelectMenuPosition(x, y) 
{
    //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    var vector = new THREE.Vector3(x, y, 0.1);

    var percX, percY;

    // projectVector will translate position to 2d
    //vector = projector.projectVector(vector.setFromMatrixPosition(SELECTED.matrixWorld), camera3D); //vector will give us position relative to the world
    if (SelectedObject !== null)
    {
        vector = vector.setFromMatrixPosition(SelectedObject.matrixWorld);
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
    return vector;
}

function scene3DObjectSelectMenu(x, y, menuID) {

    //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    var vector = scene3DObjectSelectMenuPosition(x,y);

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

    if (controls3D instanceof THREE.OrbitControls){

        var vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(object.children,true); //recursive! pickup objects within objects (example: notes)

        //console.log(object);

        if (intersects.length > 0)
        {
            //console.log(intersects[0].object);
            //if (intersects[0].object == scene3DHouseGroundContainer)
            //    return;
            //controls3D.enabled = false;

            if (SelectedObject !== intersects[0].object){

                scene3DObjectUnselect(); //avoid showing multiple selected objects
                controls3D.enabled = false;

                SelectedObject = scene3DObjectSelectedRoot(object,intersects[0].object.uuid);

                if (intersects[0].object.name.indexOf("Platform/note.jsz") >= 0)
                {
                    SelectedNote = intersects[0].object;
                    camera3DPositionCache = SelectedNote.position.clone();
                    camera3DPivotCache = SelectedNote.rotation.clone();
                    camera3DNoteEnter();
                }
                else if (SelectedObject.name.indexOf("Platform/camera.jsz") >= 0)
                {
                    //TODO: Hide on second click
                    /*
                    SelectedPicture = SelectedObject;
                    camera3DPositionCache = SelectedPicture.position.clone();
                    camera3DPivotCache = SelectedPicture.rotation.clone();
                    camera3DPictureEnter();
                    */
                }
                else if (SelectedObject.children === scene3DFloorWallContainer[FLOOR].children)
                {
                    SelectedWall = intersects[0].object;
                    scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLWallPaintMenu');

                } else {
                    
                    if (SelectedObject.name.indexOf("house") != -1) //Avoid selecting house TODO: Dynamic logic
                        return true;

                    //clearTimeout(clickMenuTime);
                    //SelectedObject = intersects[0].object;

                    var name = "{highlighteMesh}";
                    var highlighteMesh = SelectedObject.children[SelectedObject.children.length-1];
                    var c= 0x00ff00;
                    if(rightButtonDown)
                        c=0xFFFF00;
                    var highlightedMaterial = new THREE.MeshBasicMaterial( { color: c, side: THREE.BackSide, opacity: 0.5, transparent: true} );

                    if(highlighteMesh.name !== name) //speed things up
                    {
                        highlighteMesh = SelectedObject.clone();
                        highlighteMesh.name = name;
                        highlighteMesh.position.set(0,0,0);
                        highlighteMesh.rotation.set(0,0,0);
                        highlighteMesh.scale.multiplyScalar(1.06);
                        SelectedObject.add(highlighteMesh);
                    }else{
                        highlighteMesh.visible = true;
                    }

                    for (var i = 0; i < highlighteMesh.children.length; i++)
                    {
                        if(highlighteMesh.children[i].type === "Mesh")
                        {
                            //console.log(o.children[i]);
                            highlighteMesh.children[i].material = highlightedMaterial;
                            highlighteMesh.children[i].material.depthWrite = true;
                            highlighteMesh.children[i].material.depthTest = true;
                        }else{
                            highlighteMesh.remove(highlighteMesh.children[i]); //do not save lines to highlighted mesh
                        }
                    }

                    $('#WebGLSelectMenu').tooltipster('update', '<a href="#item" onclick="" class="lo-icon icon-info" style="color:#606060"></a><a href="#" onclick="" class="lo-icon icon-settings" style="color:#606060"></a>');
                    var v = scene3DObjectSelectMenuPosition(mouse.x,mouse.y);
                    $('#WebGLSelectMenu').css({ position: 'absolute', left: v.x, top: v.y-50, 'z-index': 0});

                    var bbX = 0;
                    //var bbY = 0;
                    if(SelectedObject.boundingBox)
                        bbX = SelectedObject.boundingBox.max.x;
                        //bbY = SelectedObject.boundingBox.max.y;
                   
                    if(intersects[0].distance > 8 && bbX < 4){
                        camera3DPositionCache = camera3D.position.clone();
                        camera3DPivotCache = controls3D.target.clone();

                    	var tween = new TWEEN.Tween(camera3D.position).to({x:SelectedObject.position.x, y:SelectedObject.position.y+4, z:SelectedObject.position.z + 5},1000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
                            $('#WebGLSelectMenu').tooltipster('show');
                        	//scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
            			}).start();

                        tween = new TWEEN.Tween(controls3D.target).to({x:SelectedObject.position.x, y:SelectedObject.position.y, z:SelectedObject.position.z},1000).easing(TWEEN.Easing.Quadratic.InOut).start();
                                    
        			}else{
                       $('#WebGLSelectMenu').tooltipster('show');
                        //scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
                    }

                    //SelectedObject.add(scene3DAxisHelper);
                    
                    toggleSideMenus(false);
                }
                return true;
            }
            
        } else {

            scene3DObjectUnselect();
        }
    }
    return false;
}


function scene3DObjectSelectedRoot(object,uuid)
{
    //BufferedGeometry Fix - Select root group including any attached objects (ex: notes, measurements)

    for (var a = 0; a < object.children.length; a++) {
        for (var b = 0; b < object.children[a].children.length; b ++) {
            if (object.children[a].children[b].uuid === uuid)
                return object.children[a];
        }
    }
    return object;
}
function scene3DObjectUnselect() {

    if (controls3D instanceof THREE.OrbitControls)
    {
        if(SelectedObject != null)
        {
            //SelectedObject.remove(scene3DAxisHelper);
            //console.log(SelectedObject);

            var highlighteMesh = SelectedObject.children[SelectedObject.children.length-1];

            //console.log(highlighteMesh);

            if(highlighteMesh.name === "{highlighteMesh}")    
                highlighteMesh.visible = false;
            //SelectedObject.remove(SelectedObject.children[SelectedObject.children.length-1]);

            //for (var i = 0; i < SelectedObject.children.length; i++) {
                /*
                SelectedObject.children[i].material.opacity = 1.0;
                SelectedObject.children[i].material.color.setHex( SelectedObject.currentHex );
                SelectedObject.children[i].material.transparent = false;
                SelectedObject.children[i].material.depthWrite  = true;
                SelectedObject.children[i].material.depthTest = true;
                */
            //}

            

            SelectedObject = null;
            SelectedWall = null;

            $('#WebGLSelectMenu').tooltipster('hide');
            $('#WebGLInteractiveMenu').hide();
            $('#WebGLWallPaintMenu').hide();
            $('#WebGLColorWheelSelect').hide();
            $('#WebGLTextureSelect').hide();

            //camera3DAnimateResetView();

        }
        else if(SelectedNote !== null)
        {
            SelectedNote = null;
            camera3DNoteExit();
            
        }
        else if(SelectedPicture !== null)
        {
            SelectedPicture = null;
            camera3DPictureExit();
        }

        controls3D.enabled = true;
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

function saveScene(online) {

    setTimeout(function(){

        var zip = new JSZip();

        //console.log(JSON.stringify(terrain3DRawData));

        zip.file("scene3DTerrain.json", JSON.stringify(scene3DCollectArrayFromContainer(scene3DHouseGroundContainer)));
        //zip.file("scene3DTerrainHill.json", JSON.stringify(terrain3DRawHillData));
        //zip.file("scene3DTerrainValley.json", JSON.stringify(terrain3DRawValleyData));

        var o= {};
        o.settings = settings;
        o.floors = [];
        for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
            o.floors.push(JSON.stringify('"name":"' + scene3DFloorFurnitureContainer[i].name + '"'));
        }
        zip.file("options.json", JSON.stringify(o));

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

    var zip = new JSZip(zipData);
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

    $.each(JSON.parse(zip.file("scene3DHouseContainer.json").asText()), function(index){
        //setTimeout(function() {
            open3DModel(this.file, scene3DHouseContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
        //}, 100);
    });
    
    $.each(JSON.parse(zip.file("scene3DRoofContainer.json").asText()), function(index){
        open3DModel(this.file, scene3DRoofContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });
    
    try{
        var o = JSON.parse(zip.file("options.json").asText());
        //console.log(o);
        settings = o.settings;
        for (var i = 0; i < o.floor.length; i++){
            //console.log(o.floor[i].name);
            scene3DFloorFurnitureContainer[i].name =  o.floor[i].name; 
        }
    }catch(ex){}
    //show2D(); //DEBUG 2D
    
    

    setTimeout(function() {
        document.getElementById('engine3D').removeChild(spinner);
        show3DHouse();
        setTimeout(function() {
            scene3DAnimateRotate = settings.autorotate;
        }, 4000);
    }, 1000);
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

    document.getElementById('engine3D').appendChild(spinner);
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
                        sceneNew();
                        openScene(data);
                        //document.getElementById('engine3D').removeChild(spinner);
                    }, 2000);
                } catch (e) {
                    alertify.alert("Failed to open Scene " + e);
                }
            }
        });
    //}, 1000);
}

function sceneNew() {
   
    animateStop();
    //scene3DFreeMemory();
    //hideElements();
    
    scene3D = new THREE.Scene();

    scene3DRoofContainer = new THREE.Object3D();
    scene3DHouseContainer = new THREE.Object3D();
    scene3DHouseGroundContainer = new THREE.Object3D();
    scene3DHouseFXContainer = new THREE.Object3D();
    //scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DLevelGroundContainer = new THREE.Object3D();
    scene3DLevelWallContainer = new THREE.Object3D();
    //scene3DPivotPoint = new THREE.Object3D();

    skyMesh = new THREE.Object3D();
    skyFloorMesh = new THREE.Object3D();

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
    /*
    manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };
    */
    //http://blog.andrewray.me/creating-a-3d-font-in-three-js/

    scene3DenableOrbitControls(camera3D,renderer.domElement);

    scene3DInitializePostprocessing();
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

            if (settings.sunlight) 
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
            files = settings.panorama_day;
        }else if(set == 'night'){
            files =  settings.panorama_night;
        }

        skyMesh = new THREE.Object3D();
        buildPanorama(skyMesh, files, 75, 75, 75,"",null);
        skyMesh.position.y = 5;
        //console.log("build Panorama: " + files);
        
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

    requestAnimationID = window.requestAnimationFrame(animateHouseRotate);

    if(!scene3DAnimateRotate)
    {
        animate();
        return;
    }

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

    //controls3D.update();
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
    //renderer.render( scene3D, camera3D );

    if(leftButtonDown){
        renderer.render( scene3D, camera3D );
    }else{
        //renderer.clear();
        if (SSAOProcessing.enabled)
        {
            // Render depth into depthRenderTarget
            scene3D.overrideMaterial = depthMaterial;
            renderer.render( scene3D, camera3D, depthRenderTarget, true );

            // Render renderPass and SSAO shaderPass
            scene3D.overrideMaterial = null;
        }

        effectComposer.render();
    }

    TWEEN.update();
}

function animateLandscape()
{
    requestAnimationID = window.requestAnimationFrame(animateLandscape);

    //var delta = clock.getDelta(); //have to call this before getElapsedTime()
    //var time = clock.getElapsedTime();

    //terrain3DMaterial.map = terrain3D.getSculptDisplayTexture();
    if(leftButtonDown && TOOL3DLANDSCAPE == "rotate")
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
    if ( settings.sunlight ) {

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

    requestAnimationID = window.requestAnimationFrame(animateHouse);

    if (scene3DAnimateRotate)
    {
        animate();
        return;
    }
    
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
    if(controls3D.enabled)
    {
        controls3D.update();

        rendererCube.render(scene3DCube, camera3DCube);
    }

    /*
    if(getScreenshotData == true){
        getScreenshotData = false;
        window.open(renderer.domElement.toDataURL('image/png'), 'Final');
    }
    */
    
    if(leftButtonDown){
        renderer.render( scene3D, camera3D );
    }else{
        //renderer.clear();
        if (SSAOProcessing.enabled)
        {
            // Render depth into depthRenderTarget
            scene3D.overrideMaterial = depthMaterial;
            renderer.render( scene3D, camera3D, depthRenderTarget, true );

            // Render renderPass and SSAO shaderPass
            scene3D.overrideMaterial = null;
        }

        effectComposer.render();
    }

    TWEEN.update();
    /*
    if(leftButtonDown){
        renderer.render( scene3D, camera3D );
    }else{
        composer.render();
    }
    */

    //renderSunlight(); 
    
   
   

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

    for(i = 0; i<4; i++){
        rendererQuad[i].render(scene3D, camera3DQuad[i]);
    }
}

function animateRoof0()
{
    requestAnimationID = window.requestAnimationFrame(animateRoof);

    rendererQuad[0].render(scene3D, camera3DQuad[0]);
}

function animateStop()
{
    //http://stackoverflow.com/questions/10735922/how-to-stop-a-requestanimationframe-recursion-loop
    if(requestAnimationID)
    {
        window.cancelAnimationFrame(requestAnimationID);
        requestId = undefined;
    }
    //TWEEN.removeAll(); //avoid any tween checks whilre rotating (faster)
}

function animate()
{
    //Look into Threading this with WebWorkers > http://www.html5rocks.com/en/tutorials/workers/basics/
    animateStop();

    if (SCENE == 'house')
    {
        if (scene3DAnimateRotate)
        {
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
