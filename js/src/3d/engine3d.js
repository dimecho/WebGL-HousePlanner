var engine3D = window.engine3D || {};

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

    engine3D.initRendererQuadSize();
};

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

    engine3D.initRendererQuadSize();
};

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

    engine3D.initRendererQuadSize();
};

function scene3DSplitView3D()
{
    
};

function camera3DFloorFlyIn(floor)
{
	//TODO: Fly into a specific section of the room

	var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:10, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(controls3D.target).to({x:0, y:0, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
    	FLOOR = floor;
        engine3D.showFloor();
    }).start();
};

function camera3DNoteAdd()
{
  //TODO: bring up 3d note up close and html form
};

function scene3DFloorInsertAR()
{
    if (typeof NyARRgbRaster_Canvas2D == 'undefined') $.getScript("js/dynamic/JSARToolKit.js", function(data, textStatus, jqxhr) {
        
    });
};

function scene3DFloorInsertPicture()
{
    camera3DPositionCache = camera3D.position.clone();
    camera3DPivotCache = controls3D.target.clone();

    camera3DInsertPictureEnter();
};

function camera3DInsertPictureEnter()
{
    var tween = new TWEEN.Tween(camera3D.position).to({x:0, y:10, z:0},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

function camera3DInsertPictureExit()
{
    var tween = new TWEEN.Tween(camera3D.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

function camera3DPictureEnter()
{
    var pLocal = new THREE.Vector3( 0, -1.75, -0.4 );
    var target = pLocal.applyMatrix4(camera3D.matrixWorld);

    var tween = new TWEEN.Tween(SelectedPicture.position).to(target,2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
            engine3D.initPanorama('WebGLPanorama','3428',0.70,0.64);
        }).start();

    tween = new TWEEN.Tween(SelectedPicture.rotation).to({x:camera3D.rotation.x, y:camera3D.rotation.y, z:camera3D.rotation.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

function camera3DPictureExit()
{
    disposePanorama('WebGLPanorama');

    var tween = new TWEEN.Tween(SelectedPicture.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(SelectedPicture.rotation).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

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
};

function camera3DNoteExit()
{
    $('#WebGLNote').hide();
   
    //camera3D.remove(SelectedNote);
    var tween = new TWEEN.Tween(SelectedNote.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(SelectedNote.rotation).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

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
};

function camera3DWalkViewToggle()
{
    if (controls3D instanceof THREE.FirstPersonControls)
    {
        camera3DPositionCache = new THREE.Vector3(0, 6, 20);
        camera3DPivotCache = new THREE.Vector3(0, 0, 0);
        camera3DAnimateResetView();
        engine3D.enableOrbitControls(camera3D,renderer.domElement);
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
                engine3D.enableFirstPersonControls();
            }).start();
        }});
        $('.alertify-message').append($.parseHTML("<img src='images/help/wasd-keyboard.jpg' /><br/><br/>Use (W,A,S,D) or arrow keys to move."));
    }
    else
    {
        alertify.alert("Not Available in Edit Mode");
    }
};

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
};

engine3D.enableTransformControls = function (mode)
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
};

engine3D.enableOrbitControls = function (camera, element)
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
};

engine3D.enableFirstPersonControls = function()
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
};

engine3D.open3DModel = function(js, objectContainer, x, y, z, xaxis, yaxis, ratio, shadow, note) {

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
                        }else if(child.material.shininess === 0 ){
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
                                    var texture = new THREE.Texture(engine3D.generateClampToEdgeTexture(child.material.map.image));
                                    if (texture) texture.needsUpdate = true;
                                    texture.minFilter = THREE.LinearFilter;
                                    child.material.map = texture;
                                    //child.material.map.image = engine3D.generateClampToEdgeTexture(child.material.map.image);
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
			var material;
			var geometry;
            if(note)
            {
                material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
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

                engine3D.open3DModel("objects/Platform/note.jsz", object, 1.25, 0.1, -0.3, 0, 1.5, 1, false, null);
                object.add(textMesh);
                
                console.log( js + " Add Note: '" + note + "'");
            }
            
            if(objectContainer == scene3DFloorFurnitureContainer[FLOOR])
            {
                material = new THREE.LineBasicMaterial({
                    color: 0x000000,
                    linewidth: 2
                });
                geometry = new THREE.Geometry();

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
                                if(geometry_opacity === 0)
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
};

engine3D.generateClampToEdgeTexture = function(img) {

    var canvas = document.createElement('canvas');
    var context = canvas.getContext( '2d' );

    var pattern = context.createPattern(img,"repeat");
    var size = img.width;
    if(img.height > img.width)
        size = img.height;
    canvas.width = size;
    canvas.height = size;
    //context.rect(0,0,size,size); 
    context.fillStyle = pattern;
    context.fillRect( 0, 0, size, size );
    context.fill();

    return canvas;
};

engine3D.showHouse = function() {

    console.log("showHouse()");

    engine3D.freeMemory();
    engine3D.hide();
    engine2D.hide();
    
    SCENE = 'house';

    engineGUI.initMenu("menuRight3DHouse","Exterior/index.json");

    engine3D.enableOrbitControls(camera3D,renderer.domElement);

    SSAOProcessing.enabled = false;

    $(renderer.domElement).bind('mousedown', on3DHouseMouseDown);
    $(renderer.domElement).bind('mouseup', on3DHouseMouseUp);
    $(renderer.domElement).bind('mouseup', on3DHouseMouseMove);
    $(renderer.domElement).bind('dblclick', onDocumentDoubleClick);

    if (TOOL3DINTERACTIVE == 'moveXY') {
        engineGUI.menuSelect(0, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'moveZ') {
        engineGUI.menuSelect(1, 'menuInteractiveItem', '#ff3700');
    } else if (TOOL3DINTERACTIVE == 'rotate') {
        engineGUI.menuSelect(2, 'menuInteractiveItem', '#ff3700');
    }

    var menuBottom = [2,3,4,5,6,7,8,9,10];
    menuBottom.forEach(function(item) {
         $('#menuBottomItem' + item).show();
    });
    $('#menuBottom').show();

    toggleRight('menuRight', true);
    toggleLeft('menuLeft3DHouse', true);

    engineGUI.menuSelect(1, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    engine3D.setSky(DAY);
    //engine3D.setSky('0000');
    scene3D.add(skyMesh);

    if(settings.clouds)
        scene3D.add(weatherSkyCloudsMesh);
    if(settings.rainbow)
        scene3D.add(weatherSkyRainbowMesh);
    
    engine3D.setLights();

    engine3D.makeFloor();

    //engine3D.makeWalls();

    //initObjectCollisions(scene3DHouseContainer);

    //scene3DHouseContainer.traverse;

    //TODO: Loop and show based in ID name

    scene3D.add(scene3DHouseGroundContainer);
    //scene3D.add(scene3DHouseFXContainer);
    scene3D.add(scene3DHouseContainer);
    scene3D.add(scene3DRoofContainer);

    if(scene2DWallGroup[FLOOR].children[0] != undefined)
    {
        var offset = [-1,0,1,2,3];
        for(i = 0; i < scene2DFloorShape.length; i++)
        {
            scene3D.add(scene3DFloorShapeContainer[i]);
            scene3DFloorShapeContainer[i].position.y = 0.1 + (offset[i] * scene2DWallGroup[FLOOR].children[0].h);
            scene3D.add(scene3DCeilingShapeContainer[i]);
        }
    
        for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
            scene3D.add(scene3DFloorFurnitureContainer[i]);
        }
    }
    if(scene3DCube)
    {
        scene3DCube.add(scene3DCubeMesh);
    }

    //console.trace();
    $('#engine3D').show();
    $('#WebGLCanvas').show();

    setTimeout(function() {
        camera3DAnimate(0,6,18, 1000);
    }, 1000);
    
    engine3D.animate();
};

engine3D.showLandscape = function() {

    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();

    SCENE = 'landscape';

    engine3D.setSky('day');
    engine3D.setLights();

    engine3D.enableOrbitControls(camera3D,renderer.domElement);

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

    engineGUI.menuSelect(0, 'menuLeft3DLandscapeItem', '#ff3700');
    toggleLeft('menuLeft3DLandscape', true);

    engineGUI.menuSelect(2, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    $('#engine3D').show();
    $('#WebGLCanvas').show();

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

    engine3D.animate();
};

engine3D.showFloor = function () {

    console.log("showFloor()");

    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();

    SCENE = 'floor';

    engineGUI.initMenu("menuRight3DFloor","Interior/index.json");

    engine3D.enableOrbitControls(camera3D,renderer.domElement);

    //SSAOProcessing.enabled = true;
    //FXAAProcessing.enabled = false;
    //engine3D.initPostprocessing();

    //camera3D.position.set(0, 10, 12);
    
    //TODO: Loop and show based in ID name / floor
    //scene3D.add(scene3DContainer);

    engine3D.buildPanorama(skyFloorMesh, '0000', 75, 75, 75,"",null);
    scene3D.add(skyFloorMesh);

    engine3D.setLights();

    engine3D.makeFloor();

    engine3D.makeWalls();
    
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
    scene3D.add(scene3DFloorShapeContainer[FLOOR]);
    scene3D.add(scene3DFloorGroundContainer);

    scene3DFloorShapeContainer[FLOOR].position.y = 0.1; //reset from each floor

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
    scene3D.add(scene3DFloorShapeContainer[FLOOR]); //floor ground
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

    engineGUI.menuSelect(5, 'menuTopItem', '#ff3700');
    engineGUI.menuSelect(0,'menuLeft3DFloorItem','#ff3700');
    correctMenuHeight();

    if(scene3DCube)
    {
        scene3DCube.add(scene3DCubeMesh);
    }

    $('#engine3D').show();
    $('#WebGLCanvas').show();

    setTimeout(function() {
        camera3DAnimate(0,10,12, 1000);
    }, 500);

    engine3D.animate();
};

engine3D.showFloorLevel = function() {
 
    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();

    SCENE = 'floorlevel';

    //engine3D.setBackground('blue');
    engine3D.setSky('day');
    engine3D.setLights();

    engine3D.enableOrbitControls(camera3D,renderer.domElement);

    camera3D.position.set(10, 10, 15);
    camera3D.lookAt(scene3D.position);

    engine3D.generateLevelWalls();

    scene3D.add(skyMesh);
    //scene3D.add(scene3DLevelGroundContainer);

    scene3D.add(scene3DHouseGroundContainer);

    //scene3DCube.add(scene3DCubeMesh);

    engineGUI.menuSelect(3, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //$('#HTMLCanvas').hide();
    $('#engine3D').show();
    $('#WebGLCanvas').show();

    engine3D.animate();
};

engine3D.showRoofDesign = function() {
 
    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();

    SCENE = 'roof';

    engineGUI.initMenu("menuRight3DRoof","Roof/index.json");

    //engine3D.setBackground('split');
    engine3D.setLights();

    //camera3D.position.set(0, 4, 12);
    //var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
        
    engine3D.initRendererQuad();

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

    engineGUI.menuSelect(4, 'menuTopItem', '#ff3700');
    correctMenuHeight();

    //$('div.split-pane').splitPane();
    
    //$('#HTMLCanvas').hide();
    $('#engine3D').show();
    $('#WebGLSplitCanvas').show();

    engine3D.animate();
};

engine3D.hide = function() {

    $('#engine3D').hide();

    if (renderer === undefined)
        return;

    //renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    //renderer.clear();
    
    if(scene3DCube)
    {
        scene3DCube.remove(scene3DCubeMesh);
    }

    for(i = 0; i < scene2DFloorShape.length; i++)
    {
        scene3D.remove(scene3DFloorShapeContainer[i]);
        scene3D.remove(scene3DCeilingShapeContainer[i]);
    }
    
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

    $('#WebGLCanvas').hide();
    $('#WebGLSplitCanvas').hide();

    $('#menuLeft3DHouse').hide();
    $('#menuLeft3DLandscape').hide();
    $('#menuLeft3DFloor').hide();


    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRightObjects').hide();
    $('#menuRight').hide();

    $('#menuFloorSelector').hide();
    $("#menuWallInput").hide();

    for (var i = 1; i <= 10; i++) {
        $('#menuBottomItem' + i).hide();
    }
    $('#menuBottom').hide();
    
    //scene3D.visible = !b;
    //scene2D.visible = b;

    //scene2DFloorContainer[0].traverse;
};

function selectFloor(next) {

    var i = FLOOR + next;

    if (scene3DFloorFurnitureContainer[i] instanceof THREE.Object3D) {

        FLOOR = i;

        //TODO: would be awsome to have some kind of flip transition effect

        if (SCENE == 'floor') {
            engine3D.showFloor();

        } else if (SCENE == '2d') {
            engine2D.show();
        }
    }else{
    	
		alertify.confirm("Add New Floor?", function (e) {
		    if (e) {
                engine3D.newFloor();
		    //} else { // user clicked "cancel"
		    }
		});
    }
}

engine3D.newFloor = function(name)
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
    scene3DFloorShapeTextures[i] = [];
    scene3DCeilingShapeContainer[i] = new THREE.Object3D();
    scene3DCeilingShapeTextures[i] = [];
    //scene3DFloorOtherContainer[i] = new THREE.Object3D();
    scene2DWallMesh[i] = [];
    scene2DWallDimentions[i] = [];
};

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

    engine3D.setSky(DAY);
    engine3D.setLights();
    engine.setWeather();

    scene3D.add(skyMesh);
    //scene3D.add(weatherSkyCloudsMesh);
    //scene3D.add(weatherSkyRainbowMesh);
}

engine3D.selectWeather = function() {

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
    engine.setWeather();
};

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
};

function scene3DObjectUnselect() {

    if (controls3D instanceof THREE.OrbitControls)
    {
        if(SelectedObject !== null)
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

engine3D.collectArrayFromContainer = function(container) {

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
};

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
        engineGUI.menuSelect(0,'menuLeft3DFloorItem','#ff3700');
        TOOL3DFLOOR = 'measure';
    }else{
        engineGUI.menuSelect(0,'menuLeft3DFloorItem','black');
        TOOL3DFLOOR = '';
    }
}

function scene3DFloorObjectWallMeasurementAjust() {

}

engine3D.generateLevelWalls = function() {

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

// reproduction of a demo of @mrdoob by http://mrdoob.com/lab/javascript/webgl/clouds/
engine3D.setBackground = function(set) {

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
};

engine3D.setLights = function() {

    scene3D.remove(sceneAmbientLight);
    scene3D.remove(sceneDirectionalLight);
    //scene3D.remove(sceneHemisphereLight);
    scene3D.remove(sceneSpotLight);

    if (SCENE == 'house') {
        if (DAY == 'day') {

            if (settings.sunlight) 
            {
                //SUNLIGHT RAYS
                sceneAmbientLight = new THREE.AmbientLight(); //SUNLIGHT RAYS
                scene3D.add(sceneAmbientLight);
                //sceneDirectionalLight.intensity = 1; //SUNLIGHT RAYS
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

        sceneAmbientLight = new THREE.AmbientLight();
        scene3D.add(sceneAmbientLight);
        sceneDirectionalLight.intensity = 0.6;
        //sceneSpotLight.intensity = 0.8;
        //sceneSpotLight.castShadow = false;
        //scene3D.add(sceneSpotLight);
        scene3D.add(sceneDirectionalLight);
    }
};

/*
function scene3DFloorSky() {
    scene3D.remove(weatherSkyDayMesh);
}
*/

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
        engine3D.open3DModel(path, scene3DHouseContainer, x, 0, z, 0, 0, 1, true, null);
    }
    else  if(SCENE == 'floor')
    {
    	o = scene3DFloorFurnitureContainer[FLOOR].children.length-1;
    	x = scene3DFloorFurnitureContainer[FLOOR].children[o].position.x + scene3DFloorFurnitureContainer[FLOOR].children[o].geometry.boundingBox.max.x;
        z = scene3DFloorFurnitureContainer[FLOOR].children[o].position.z + scene3DFloorFurnitureContainer[FLOOR].children[o].geometry.boundingBox.max.z;
        engine3D.open3DModel(path, scene3DFloorFurnitureContainer[FLOOR], x, 0, z, 0, 0, 1, true, null);
    }
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
        engine3D.animate();
    }
}

function animateHouseRotate() {

    requestAnimationID = window.requestAnimationFrame(animateHouseRotate);

    if(!scene3DAnimateRotate)
    {
        engine3D.animate();
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

        sunlight.godrayGenUniforms.vSunPositionScreenSpace.value.x = screenSpacePosition.x;
        sunlight.godrayGenUniforms.vSunPositionScreenSpace.value.y = screenSpacePosition.y;

        sunlight.godraysFakeSunUniforms.vSunPositionScreenSpace.value.x = screenSpacePosition.x;
        sunlight.godraysFakeSunUniforms.vSunPositionScreenSpace.value.y = screenSpacePosition.y;

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

        sunlight.godraysFakeSunUniforms.fAspect.value = window.innerWidth / window.innerHeight;

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

        sunlight.godrayGenUniforms.fStepSize.value = stepLen;
        sunlight.godrayGenUniforms.tInput.value = sunlight.rtTextureDepth;

        sunlight.scene.overrideMaterial = sunlight.materialGodraysGenerate;

        renderer.render( sunlight.scene, sunlight.camera, sunlight.rtTextureGodRays2 );

        // pass 2 - render into second ping-pong target

        pass = 2.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        sunlight.godrayGenUniforms.fStepSize.value = stepLen;
        sunlight.godrayGenUniforms.tInput.value = sunlight.rtTextureGodRays2;

        renderer.render( sunlight.scene, sunlight.camera, sunlight.rtTextureGodRays1  );

        // pass 3 - 1st RT

        pass = 3.0;
        stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

        sunlight.godrayGenUniforms.fStepSize.value = stepLen;
        sunlight.godrayGenUniforms.tInput.value = sunlight.rtTextureGodRays1;

        renderer.render( sunlight.scene, sunlight.camera , sunlight.rtTextureGodRays2  );

        // final pass - composite god-rays onto colors

        sunlight.godrayCombineUniforms.tColors.value = sunlight.rtTextureColors;
        sunlight.godrayCombineUniforms.tGodRays.value = sunlight.rtTextureGodRays2;

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
        engine3D.animate();
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

        if(rendererCube)
        {
           rendererCube.render(scene3DCube, camera3DCube);
        }
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

engine3D.animate = function()
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
};

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
            return false;
    }

    //Allowed file size is less than 10 MB (1048576 = 1 mb)
    if (fsize > 10485760) {
        alert("<b>" + fsize + "</b> Too big file! <br />File is too big, it should be less than 5 MB.");
        return false;
    }
}

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
                console.log("Load File: " + $('#fileInput').value + ":" + event.target.files[0].name);
                engine3D.open(e.target.result);
                engine2D.open(e.target.result);
            };

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
    };
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
    };

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

    	if (SelectedWall !== null)
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

        if (SelectedWall !== null)
        {
            $('#WebGLColorWheelSelect').show();
        }
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
        //  console.log('contactEnter', collider.object3d.name, 'with', otherCollider.object3d.name)
        //});
    }
}
*/

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

/*
engine3D.loadShader = function(shader, type, async)
{
    return $.ajax({
        url: shader,
        async: async,
        beforeSend: function (req) {
            req.overrideMimeType('text/plain; charset=x-shader/x-' + type); //important - set for binary!
        }
    }).responseText;
};
*/

/*
function rotateAroundWorldAxis(object,axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis, radians);
    object.matrix.multiplyMatrices(rotWorldMatrix,object.matrix); // r56
    rotWorldMatrix.extractRotation(object.matrix);
    object.rotation.setEulerFromRotationMatrix(rotWorldMatrix, object.eulerOrder ); 
    object.position.getPositionFromMatrix( object.matrix );
};

function rotateAroundWorldAxisX(radians) { 
    this._vector.set(1,0,0);
    rotateAroundWorldAxis(this._vector,radians);
};
function rotateAroundWorldAxisY(radians) { 
    this._vector.set(0,1,0);
    rotateAroundWorldAxis(this._vector,radians);
};
function rotateAroundWorldAxisZ(degrees){ 
    this._vector.set(0,0,1);
    rotateAroundWorldAxis(this._vector,degrees);
};

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    //rotWorldMatrix.multiplySelf(object.matrix);        // pre-multiply
    object.matrix = rotWorldMatrix;
    object.rotation.getRotationFromMatrix(object.matrix, object.scale);
};
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
};
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