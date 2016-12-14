var engine3D = window.engine3D || {};

function camera3DFloorFlyIn(floor) {
    //TODO: Fly into a specific section of the room

    var tween = new TWEEN.Tween(engine3D.camera.position).to({ x: 0, y: 10, z: 0 }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(engine3D.controls.target).to({ x: 0, y: 0, z: 0 }, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
        engine3D.showFloor(floor);
    }).start();
};

function camera3DNoteAdd() {
    //TODO: bring up 3d note up close and html form
};

engine3D.scene3DFloorInsertAR = function () {
    if ((typeof NyARRgbRaster_Canvas2D === "undefined" ? "undefined" : _typeof(NyARRgbRaster_Canvas2D)) === undefined) $.getScript("js/dynamic/JSARToolKit.js", function (data, textStatus, jqxhr) {});
};

engine3D.scene3DFloorInsertPicture = function () {
    camera3DPositionCache = engine3D.camera.position.clone();
    camera3DPivotCache = engine3D.controls.target.clone();

    camera3DInsertPictureEnter();
};

function camera3DInsertPictureEnter() {
    var tween = new TWEEN.Tween(engine3D.camera.position).to({ x: 0, y: 10, z: 0 }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

function camera3DInsertPictureExit() {
    var tween = new TWEEN.Tween(engine3D.camera.position).to({ x: camera3DPositionCache.x, y: camera3DPositionCache.y, z: camera3DPositionCache.z }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

function camera3DPictureEnter() {
    var pLocal = new THREE.Vector3(0, -1.75, -0.4);
    var target = pLocal.applyMatrix4(engine3D.camera.matrixWorld);

    var tween = new TWEEN.Tween(SelectedPicture.position).to(target, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
        engine3D.initPanorama("#WebGLPanorama", "3428", 0.70, 0.64);
    }).start();

    tween = new TWEEN.Tween(SelectedPicture.rotation).to({ x: engine3D.camera.rotation.x, y: engine3D.camera.rotation.y, z: engine3D.camera.rotation.z }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

function camera3DPictureExit() {
    //engine3D.disposePanorama("#WebGLPanorama");

    var tween = new TWEEN.Tween(SelectedPicture.position).to({ x: camera3DPositionCache.x, y: camera3DPositionCache.y, z: camera3DPositionCache.z }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(SelectedPicture.rotation).to({ x: camera3DPivotCache.x, y: camera3DPivotCache.y, z: camera3DPivotCache.z }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

function camera3DNoteEnter() {
    if (SelectedNote.name !== "") {
        //engine3D.camera.add(SelectedNote);

        var pLocal = new THREE.Vector3(0, -0.5, -0.6);
        var target = pLocal.applyMatrix4(engine3D.camera.matrixWorld);

        var tween = new TWEEN.Tween(SelectedNote.position).to(target, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
            $('#WebGLNote').show();
        }).start();
        tween = new TWEEN.Tween(SelectedNote.rotation).to({ x: engine3D.camera.rotation.x, y: engine3D.camera.rotation.y, z: engine3D.camera.rotation.z }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    }
};

function camera3DNoteExit() {
    $('#WebGLNote').hide();

    //engine3D.camera.remove(SelectedNote);
    var tween = new TWEEN.Tween(SelectedNote.position).to({ x: camera3DPositionCache.x, y: camera3DPositionCache.y, z: camera3DPositionCache.z }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
    tween = new TWEEN.Tween(SelectedNote.rotation).to({ x: camera3DPivotCache.x, y: camera3DPivotCache.y, z: camera3DPivotCache.z }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
};

engine3D.cameraAnimate = function (x, y, z, speed) {
    if (!scene3DAnimateRotate) {
        //engine3D.camera.position.set(0, 6, 20);
        //engine3D.controls.target = new THREE.Vector3(0, 50, 0);
        //engine3D.camera.position.set(0, 20, 0);
        //engine3D.camera.position.set(sx, sy, sz);
        var tween = new TWEEN.Tween(engine3D.camera.position).to({ x: x, y: y, z: z }, speed).easing(TWEEN.Easing.Quadratic.InOut).start();
        tween = new TWEEN.Tween(engine3D.controls.target).to({ x: 0, y: 0, z: 0 }, speed).easing(TWEEN.Easing.Quadratic.InOut).start();
    }
};

engine3D.cameraWalkViewToggle = function () {
    if (engine3D.controls instanceof THREE.FirstPersonControls) {
        camera3DPositionCache = new THREE.Vector3(0, 6, 20);
        camera3DPivotCache = new THREE.Vector3(0, 0, 0);
        engine3D.cameraAnimateResetView();
        engine3D.enableOrbitControls(engine3D.camera, engine3D.renderer.domElement);
    } else if (engine3D.controls instanceof THREE.OrbitControls) {
        var confirm = alertify.confirm("");
        confirm.ok = function () {
            camera3DPositionCache = engine3D.camera.position.clone();
            camera3DPivotCache = engine3D.controls.target.clone();
            scene3DAnimateRotate = false;

            //TODO: anmate left and right menu hide
            var tween = new TWEEN.Tween(engine3D.camera.position).to({ x: 0, y: 1.5, z: 18 }, 2000).easing(TWEEN.Easing.Quadratic.InOut).start();
            tween = new TWEEN.Tween(engine3D.controls.target).to({ x: 0, y: 1.5, z: 0 }, 2000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {
                engine3D.enableFirstPersonControls();
            }).start();
        };
        confirm.show();
        $('.alertify-title').append($.parseHTML("<img src='images/help/wasd-keyboard.jpg' /><br/><br/>Use (W,A,S,D) or arrow keys to move."));
    } else {
        alertify.alert("Not Available in Edit Mode").show();
    }
};

engine3D.cameraAnimateResetView = function () {
    if (camera3DPositionCache !== null && engine3D.controls instanceof THREE.OrbitControls) {
        /*
        var tween = new TWEEN.Tween(engine3D.camera.position).to({x:camera3DPositionCache.x, y:camera3DPositionCache.y, z:camera3DPositionCache.z},1800).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
        }).start();
        tween = new TWEEN.Tween(engine3D.controls.target).to({x:camera3DPivotCache.x, y:camera3DPivotCache.y, z:camera3DPivotCache.z},1800).easing(TWEEN.Easing.Quadratic.InOut).start();
        */
    }
};

engine3D.enableTransformControls = function (mode) {
    //https://github.com/mrdoob/three.js/issues/4286

    engine3D.controls = new THREE.TransformControls(engine3D.camera, engine3D.renderer.domElement);
    //engine3D.controls.addEventListener('change', engine3D.renderer.render);

    engine3D.controls.attach(SelectedObject);
    engine3D.controls.setMode(mode);
    //console.trace();

    //$(engine3D.renderer.domElement).unbind('mousemove', on3DMouseMove);

    //scene3DObjectUnselect();
    $('#WebGLInteractiveMenu').hide();
    $('#WebGLTextureSelect').hide();

    //engine3D.scene.add(engine3D.controls);
};

engine3D.enableOrbitControls = function (camera, element) {

    if (engine3D.controls instanceof THREE.OrbitControls) {
        //console.log("enable THREE.OrbitControls");
        engine3D.controls.enabled = true;
    } else {

        //console.log("new THREE.OrbitControls");
        engine3D.controls = new THREE.OrbitControls(camera, element);
        engine3D.controls.minDistance = 3;
        engine3D.controls.maxDistance = 25; //Infinity;
        //engine3D.controls.minPolarAngle = 0; // radians
        //engine3D.controls.maxPolarAngle = Math.PI; // radians
        engine3D.controls.maxPolarAngle = Math.PI / 2; //Don't let to go below the ground
        //engine3D.controls.target.set(THREE.Vector3(0, 0, 0)); //+ object.lookAT!
        engine3D.controls.enabled = true;

        //engine3D.cameraAnimate(0,20,0, 500);
    }
};

engine3D.enableFirstPersonControls = function () {
    engine3D.controls.enabled = false;
    engine3D.controls = new THREE.FirstPersonControls(engine3D.camera, engine3D.renderer.domElement);
    engine3D.controls.movementSpeed = 5;
    engine3D.controls.lookSpeed = 0.15;
    engine3D.controls.noFly = true;
    engine3D.controls.lookVertical = false; //true;
    engine3D.controls.activeLook = true; //enable later, otherwise view jumps
    engine3D.controls.lon = -90;
    engine3D.controls.lat = 0;
    engine3D.controls.enabled = true;

    //engine3D.controls.target = new THREE.Vector3(0, 0, 0);
    //engine3D.camera.lookAt(new THREE.Vector3(0, 0, 0));
};

engine3D.open3DModel = function (js, objectContainer, x, y, z, xaxis, yaxis, ratio, shadow, note) {
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

    try {
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

        var callbackObject = function callbackObject(object) {

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

            object.traverse(function (child) {

                if (child instanceof THREE.Mesh) {
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

                    if (object.boundingBox.max.x < child.geometry.boundingBox.max.x) object.boundingBox.max.x = child.geometry.boundingBox.max.x;
                    if (object.boundingBox.max.y < child.geometry.boundingBox.max.y) object.boundingBox.max.y = child.geometry.boundingBox.max.y;
                    if (object.boundingBox.max.z < child.geometry.boundingBox.max.z) object.boundingBox.max.z = child.geometry.boundingBox.max.z;

                    //child.geometry.dynamic = true;
                    child.castShadow = true;
                    if (shadow) child.receiveShadow = true;
                    /*
                    if(child.material !== null)
                    {
                        child.texture.wrapS = THREE.ClampToEdgeWrapping; //THREE.RepeatWrapping;
                        child.texture.wrapT = THREE.ClampToEdgeWrapping; //THREE.RepeatWrapping;
                    }
                    */

                    if (child.material !== null) {
                        //console.log(child.material)
                        //child.material.shading = THREE.SmoothShading;
                        child.material.side = THREE.DoubleSide; //Normally this will slow things down > do "solidify" with Blender
                        //child.material.depthWrite = true; //Blender exports fix
                        //child.material.offset = 0; //v72
                        //child.material.repeat = 0; //v72

                        if (child.material.shininess - 10 > 1) {
                            child.material.shininess = child.material.shininess - 10; //Looks like Blender uses different # - offset to equalize same look
                        } else if (child.material.shininess === 0) {
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

                        if (child.material.opacity < 1) //glass transparency fix
                            {
                                child.material.transparent = true;
                                //child.material.vertexColors = false;
                            } else {
                            child.material.transparent = false;
                        }

                        //=============================
                        //Texture Quality Improvement
                        //=============================
                        /*
                        if(child.material.map !== null){
                            if(child.material.map.image.complete){
                            //while(!child.material.map.image.complete)
                            //    setTimeout(function(){ foo },100);
                                console.log("...Texture size: " + child.material.map.image.width + ":" + child.material.map.image.height);
                                var isImagePowerOfTwo = THREE.Math.isPowerOfTwo(child.material.map.image.width) && THREE.Math.isPowerOfTwo(child.material.map.image.height);
                                if(!isImagePowerOfTwo)
                                {
                                    console.log("...Correcting Texture (PowerOfTwo)");
                                    var texture = new THREE.Texture(engine3D.generateClampToEdgeTexture(child.material.map.image));
                                    //if (texture) texture.needsUpdate = true;
                                    //texture.minFilter = THREE.LinearFilter;
                                    child.material.map = texture;
                                    
                                    //child.material.map.image = engine3D.generateClampToEdgeTexture(child.material.map.image);
                                    //child.material.map.image.needsUpdate = true;
                                }
                            }
                        }
                        */
                        //============================
                    }
                } else if (child instanceof THREE.PointLight) {
                    console.log("light found!");

                    //pointLight = new THREE.PointLight( 0xffaa00 );
                    //pointLight.position.set( 0, 0, 0 );
                    //engine3D.scene.add( object );
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
            //console.log(typeof(objectContainer));
            /*
            if(objectContainer === engine3D.groundHouse)
            {
                //console.log(object);
                engine3D._groundHouse = object; //for threeBSP Geometry
            }
            */
            objectContainer.add(object);

            /*
            Add 3D Note
            ===============================================
            */
            var material;
            var geometry;
            if (note) {
                material = new THREE.MeshBasicMaterial({ color: 0x000000 });
                engine3D.fontLoader.load('fonts/helvetiker_regular.typeface.json', function (font) {
                    geometry = new THREE.TextGeometry(note, {
                        font: font,
                        weight: 'normal',
                        size: 0.05,
                        height: 0.01
                    });
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

                console.log(js + " Add Note: '" + note + "'");
            }
            //===============================================

            if (objectContainer == scene3DFloorFurnitureContainer[engineGUI.floor]) {
                material = new THREE.LineBasicMaterial({
                    color: 0x000000,
                    linewidth: 2
                });
                geometry = new THREE.Geometry();

                var x1 = x - object.boundingBox.max.x * 3;
                var z1 = z - object.boundingBox.max.z * 3;
                var x2 = x + object.boundingBox.max.x * 3;
                var z2 = z + object.boundingBox.max.z * 3;

                //console.log(js + " > " + object.boundingBox.max.z + " " + object.boundingBox.max.x + " " + object.boundingBox.max.y)

                //TODO: if y > 0
                //var arrow = new THREE.ArrowHelper(direction, firstVector, computeDistance(node1, node2) - 32, co);

                //horizontal
                geometry.vertices.push(new THREE.Vector3(x1, 0, z1));
                geometry.vertices.push(new THREE.Vector3(x2, 0, z1));

                //vertical
                geometry.vertices.push(new THREE.Vector3(x1, 0, z1));
                geometry.vertices.push(new THREE.Vector3(x1, 0, z2));

                //var offset = scene3DFloorFurnitureContainer[engineGUI.floor].children[i].centroid.clone();
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

                engine3D.fontLoader.load('font/helvetiker_regular.typeface.json', function (font) {
                    for (var u = 0; u <= 1; u++) {
                        var units = "";

                        if (realLifeDimentions[u] > 100) {
                            units = (realLifeDimentions[u] / 100).toFixed(2) + " m";
                        } else {
                            units = Math.round(realLifeDimentions[u]) + " cm";
                        }

                        geometryText[u] = new THREE.TextGeometry(units, {
                            font: font, // Must be lowercase!
                            weight: 'normal',
                            size: 0.2,
                            height: 0.01
                        });
                        geometryText[u].computeBoundingBox();
                    }

                    var textMeshL = new THREE.Mesh(geometryText[0], material);
                    textMeshL.position.x = x - geometryText[0].boundingBox.max.x / 2;
                    textMeshL.position.y = 0.01;
                    textMeshL.position.z = z1 - 0.1;
                    textMeshL.rotation.x = -1.5;

                    var textMeshW = new THREE.Mesh(geometryText[1], material);
                    textMeshW.position.x = x1 - 0.1;
                    textMeshW.position.y = 0.01;
                    textMeshW.position.z = z + geometryText[1].boundingBox.max.x / 2;
                    textMeshW.rotation.x = -1.55;
                    textMeshW.rotation.z = 1.6;

                    line.add(textMeshL);
                    line.add(textMeshW);
                });

                //line.rotation = scene3DFloorFurnitureContainer[engineGUI.floor].children[i].geometry.rotation.clone();

                //object.add(textMeshL);
                //object.add(textMeshW);

                object.add(line);

                //textMeshL.visible = false;
                //textMeshW.visible = false;
                line.visible = false;

                //console.log("Calculating " + mesh.name + " measurements " + mesh.position.x + ":" + mesh.position.z + " " + mesh.geometry.boundingBox.max.x + ":" + mesh.geometry.boundingBox.max.z);
            }

            //===========================
            //var buffer_geometry = new THREE.BufferGeometry().setFromObject(object);
            //console.log(buffer_geometry);
            //var alphaArray = [0.5];
            //buffer_geometry.addAttribute('alphaValue', new THREE.BufferAttribute(new Float32Array(alphaArray), 1));
            //===========================
            //var bufferMesh = new THREE.Mesh(geometry, materials[0]);
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

        if (js.split('.').pop() === 'jsz') //zipped json file
            {
                var filename = js.split('/').pop().slice(0, -4) + ".json";

                $.ajax(js, {

                    contentType: "application/zip",
                    beforeSend: function beforeSend(req) {
                        req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
                    },
                    //async: true,
                    //dataType: "binary",
                    //processData: false,
                    //responseType:'arraybuffer',
                    success: function success(data) {
                        //try {
                        var zip = new JSZip();
                        zip.loadAsync(data).then(function (zip) {
                            //console.log(data);
                            zip.file(filename).async("string").then(function (data) {
                                //console.log(data);
                                data = JSON.parse(data);

                                var loader = new THREE.ObjectLoader(engine3D.jsonLoader);
                                loader.setTexturePath(textures);

                                if (data.geometries[0].type === "BufferGeometry") {
                                    //console.log(data);
                                    loader.parse(data, callbackObject, { useWorker: true, useBuffers: true });
                                } else {
                                    //    console.log("using old format 3 " + js);
                                    //    //loader = new THREE.JSONLoader();
                                    //    var result = loader.parse(data, textures);
                                    //    callback(result.geometry, result.materials);
                                    //}else{ //using export script io_three
                                    /*
                                    https://github.com/mrdoob/three.js/wiki/JSON-Texture-format-4
                                    */

                                    //console.log("using new format 4 " + js);

                                    //=======================================
                                    //Blender Export v72 Fix
                                    //=======================================

                                    for (var i = 0; i < data.textures.length; i++) {

                                        if (data.textures[i].mapping) data.textures[i].mapping = THREE[data.textures[i].mapping];

                                        if (data.textures[i].minFilter) {
                                            data.textures[i].minFilter = THREE[data.textures[i].minFilter];
                                            //console.log(">" + THREE[data.textures[i].minFilter]);
                                        }

                                        if (data.textures[i].magFilter) data.textures[i].magFilter = THREE[data.textures[i].magFilter];

                                        if (data.textures[i].wrap) {
                                            //data.textures[i].wrap = [THREE.ClampToEdgeWrapping,THREE.ClampToEdgeWrapping];
                                            data.textures[i].wrap = [THREE.RepeatWrapping, THREE.RepeatWrapping];
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
                                        //data.object.children[i].uuid = THREE.Math.generateUUID();
                                        //======================================================

                                        var geometry_opacity = 1;
                                        for (var g = 0; g < data.geometries.length; g++) {
                                            if (data.geometries[g].uuid == data.object.children[i].geometry) {
                                                //data.geometries[g].uuid = THREE.Math.generateUUID();
                                                //data.object.children[i].geometry = data.geometries[g].uuid;
                                                geometry_opacity = data.geometries[g].materials[0].opacity;
                                                break;
                                            }
                                        }
                                        if (geometry_opacity === 0) geometry_opacity = 0.99;
                                        //====================================
                                        for (var m = 0; m < data.materials.length; m++) {
                                            //======================================================
                                            //FIX for r72dev [openning same 3D models textures - one texture per material]
                                            //======================================================
                                            for (var t = 0; t < data.textures.length; t++) {
                                                if (data.textures[t].uuid == data.materials[m].map) {
                                                    data.textures[t].uuid = THREE.Math.generateUUID();
                                                    data.materials[m].map = data.textures[t].uuid;
                                                    break;
                                                }
                                            }
                                            //==================================
                                            if (data.materials[m].uuid == data.object.children[i].material) {

                                                data.materials[m].opacity = geometry_opacity;

                                                var material_uuid = THREE.Math.generateUUID();
                                                for (var ii = 0; ii < data.object.children.length; ii++) {
                                                    if (data.object.children[ii].material == data.materials[m].uuid) data.object.children[ii].material = material_uuid;
                                                }
                                                data.materials[m].uuid = material_uuid;

                                                break;
                                            }
                                        }
                                    }
                                    loader.parse(data, callbackObject);
                                }
                            });
                        });

                        //}
                        //} catch (e) { //zip file was probably not found, load regular json
                        //console.log("Other 3D format " + e + " " + js.slice(0, -4) + "");

                        //}
                    },
                    error: function error(xhr, textStatus, errorThrown) {
                        alertify.alert("3D Model (" + js + ") Loading Error").show();
                    }
                });
            } else if (js.split('.').pop() == 'obj') {

            //loader = new THREE.OBJMTLLoader();
            loader = new THREE.OBJLoader();

            //loader.load(js, js.slice(0, -4) + '.mtl', function (object)
            loader.load(js, function (object) {
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
    } catch (e) {
        console.log("open3DModel Error " + e);
    }
};
/*
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
*/
engine3D.showHouse = function () {

    console.log("showHouse()");

    engine3D.freeMemory();
    engine3D.hide();
    engine2D.hide();

    engineGUI.scene = 'house';

    engineGUI.initMenu("menuRight3DHouse", "Exterior/index.json");
    engineGUI.initPanoramaPreview("#panoramaHouse",json.house);
    engineGUI.initMenuFloorList();

    engine3D.enableOrbitControls(engine3D.camera, engine3D.renderer.domElement);

    engine3D.SSAOProcessing.enabled = false;
    engine3D.FXAAProcessing.enabled = false;

    $(engine3D.renderer.domElement).bind('mousedown', on3DHouseMouseDown);
    $(engine3D.renderer.domElement).bind('mouseup', on3DHouseMouseUp);
    $(engine3D.renderer.domElement).bind('mousemove', on3DHouseMouseMove);
    $(engine3D.renderer.domElement).bind('dblclick', onDocumentDoubleClick);

    if (engine3D.tool === 'moveXY') {
        engineGUI.menuSelect(0, 'menuInteractiveItem', '#ff3700');
    } else if (engine3D.tool === 'moveZ') {
        engineGUI.menuSelect(1, 'menuInteractiveItem', '#ff3700');
    } else if (engine3D.tool === 'rotate') {
        engineGUI.menuSelect(2, 'menuInteractiveItem', '#ff3700');
    }

    $('#menuBottomHouse').show();

    engineGUI.menuToggleRight('menuRight', true);
    engineGUI.menuToggleLeft('menuLeft3DHouse', true);
    engineGUI.menuSelect(1, 'menuTopItem', '#ff3700');
    engineGUI.menuCorrectHeight();

    engine3D.setDay();
    engine3D.setLights();
    engine3D.setWeather();
    engine3D.makeFloor();
    //engine3D.makeWalls();

    engine3D.scene.add(engine3D.skyHouse);
    engine3D.scene.add(engine3D.skyFX);

    //initObjectCollisions(engine3D.house);

    engine3D.scene.add(engine3D.groundHouse);
    engine3D.scene.add(engine3D.house);
    engine3D.scene.add(engine3D.roof);

    //if(scene2DWallGroup[engineGUI.floor].children[0] != undefined)

    if (scene2DWallGroup[engineGUI.floor] != undefined) {
        var offset = [-1, 0, 1, 2, 3, 4];
        for (var i = 0; i < engine2D.floor.length; i++) {
            var y = 0.1 + offset[i] * scene2DWallGroup[engineGUI.floor].children[0].h;
            scene3DFloorShapeContainer[i].position.y = y;
            scene3DCeilingShapeContainer[i].position.y = y + scene2DWallGroup[engineGUI.floor].children[0].h;

            engine3D.scene.add(scene3DFloorShapeContainer[i]);
            engine3D.scene.add(scene3DCeilingShapeContainer[i]);
        }
        for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
            engine3D.scene.add(scene3DFloorFurnitureContainer[i]);
        }
    }

    if (json.settings.showcube) engine3D.sceneCube.add(scene3DCubeMesh);

    //console.trace();
    $('#engine3D').show();
    $('#WebGLCanvas').show();

    setTimeout(function () {
        engine3D.cameraAnimate(0, 6, 18, 1000);
    }, 1000);

    engine3D.animate();
};

engine3D.showLandscape = function () {
    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();
    engine2D.hide();

    engineGUI.scene = 'landscape';

    engine3D.setDay(true);
    engine3D.setLights();

    engine3D.enableOrbitControls(engine3D.camera, engine3D.renderer.domElement);

    engine3D.camera.position.set(10, 10, 15);
    engine3D.camera.lookAt(engine3D.scene.position);

    engine3D.tool = 'rotate';

    //engine3D.scene.add(engine3D.groundHouse);
    engine3D.scene.add(engine3D.skyHouse);
    engine3D.scene.add(engine3D.terrain);

    $(engine3D.renderer.domElement).bind('mousedown', on3DLandscapeMouseDown);
    $(engine3D.renderer.domElement).bind('mouseup', on3DLandscapeMouseUp);
    $(engine3D.renderer.domElement).bind('mousemove', on3DLandscapeMouseMove);
    //$(engine3D.renderer.domElement).bind('mouseout', on3DLandscapeMouseUp);

    engineGUI.menuToggleLeft('menuLeft3DLandscape', true);
    engineGUI.menuSelect(0, 'menuLeft3DLandscapeItem', '#ff3700');
    engineGUI.menuSelect(2, 'menuTopItem', '#ff3700');
    engineGUI.menuCorrectHeight();

    $('#engine3D').show();
    $('#WebGLCanvas').show();

    /*
    //http://danni-three.blogspot.ca/2013/09/threejs-heightmaps.html
    var img = new Image();
    img.onload = function () {
        var data = getHeightData(img); //get height data from img
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

engine3D.showFloor = function (i) {
    console.log("showFloor()");

    engineGUI.floor = i;

    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();
    engine2D.hide();

    engineGUI.scene = 'floor';

    engineGUI.initMenu("menuRight3DFloor", "Interior/index.json");

    engineGUI.initPanoramaPreview("#panoramaFloor",json.furniture[i]);

    engine3D.enableOrbitControls(engine3D.camera, engine3D.renderer.domElement);

    engine3D.SSAOProcessing.enabled = true;
    engine3D.FXAAProcessing.enabled = false;
    //engine3D.initPostprocessing();

    //engine3D.camera.position.set(0, 10, 12);

    //TODO: Loop and show based in ID name / floor
    //engine3D.scene.add(scene3DContainer);

    engine3D.buildPanorama(engine3D.skyFloor, '0000', 75, 75, 75, "", null);

    engine3D.scene.add(engine3D.skyFloor);

    engine3D.setLights();

    engine3D.makeFloor();

    engine3D.makeWalls();

    /*
    engine3D.scene.add(engine3D.cameraMirror);
    try {
        var floorMaterial = new THREE.MeshPhongMaterial({
            map: engine3D.groundFloor.children[0].materials[0], //.map,
            envMap: engine3D.cameraMirror.renderTarget,
            reflectivity: 0.5
        });
        engine3D.groundFloor.children[0].materials[0] = floorMaterial;
    }catch(e){}
    */

    //engine3D.scene.add(scene3DCutawayPlaneMesh); //DEBUG

    engine3D.scene.add(scene3DFloorFurnitureContainer[engineGUI.floor]); //furnishings
    engine3D.scene.add(scene3DFloorShapeContainer[engineGUI.floor]);
    engine3D.scene.add(engine3D.groundFloor);
    scene3DFloorShapeContainer[engineGUI.floor].position.y = 0.1; //reset from each floor

    engine3D.tool = 'measure';

    if (engine3D.tool === 'measure') {
        scene3DFloorMeasurementsGenerate();
        //engine3D.scene.add(scene3DFloorMeasurementsContainer[engineGUI.floor]);
        for (var i = 0; i < scene3DFloorFurnitureContainer[engineGUI.floor].children.length; i++) {
            if (scene3DFloorFurnitureContainer[engineGUI.floor].children[i].children[1]) scene3DFloorFurnitureContainer[engineGUI.floor].children[i].children[1].visible = true;
        }
    }

    engine3D.scene.add(engine3D.walls[engineGUI.floor]); //walls
    engine3D.scene.add(scene3DFloorShapeContainer[engineGUI.floor]); //floor ground
    //engine3D.scene.add(scene3DFloorOtherContainer[engineGUI.floor]); //notes

    //$(engine3D.renderer.domElement).bind('mousemove', on3DMouseMove);
    //$(engine3D.renderer.domElement).bind('mousedown', on3DMouseDown);
    //$(engine3D.renderer.domElement).bind('mouseup', on3DMouseUp);

    $(engine3D.renderer.domElement).bind('mousedown', on3DFloorMouseDown);
    $(engine3D.renderer.domElement).bind('mouseup', on3DFloorMouseUp);
    $(engine3D.renderer.domElement).bind('mousemove', on3DFloorMouseMove);
    $(engine3D.renderer.domElement).bind('dblclick', onDocumentDoubleClick);

    //scene3DFloorFurnitureContainer[0].traverse;
    $('#menuFloorSelectorText').html(scene3DFloorFurnitureContainer[engineGUI.floor].name);
    $('#menuFloorSelector').show();
    $('#menuBottomFloor').show();

    engineGUI.menuToggleRight('menuRight', true);
    engineGUI.menuToggleLeft('menuLeft3DFloor', true);
    engineGUI.menuSelect(5, 'menuTopItem', '#ff3700');
    engineGUI.menuSelect(0, 'menuLeft3DFloorItem', '#ff3700');
    engineGUI.menuCorrectHeight();

    if (json.settings.showCube) engine3D.sceneCube.add(scene3DCubeMesh);

    $('#engine3D').show();
    $('#WebGLCanvas').show();

    setTimeout(function () {
        engine3D.cameraAnimate(0, 10, 12, 1000);
    }, 500);

    engine3D.animate();
};

engine3D.showFloorLevel = function () {
    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();
    engine2D.hide();

    engineGUI.scene = 'floorlevel';

    //engine3D.setBackground('blue');
    engine3D.setDay(true);
    engine3D.setLights();

    engine3D.enableOrbitControls(engine3D.camera, engine3D.renderer.domElement);

    engine3D.camera.position.set(10, 10, 15);
    engine3D.camera.lookAt(engine3D.scene.position);

    engine3D.generateLevelWalls();

    engine3D.scene.add(engine3D.skyHouse);
    //engine3D.scene.add(scene3DLevelGroundContainer);

    engine3D.scene.add(engine3D.groundHouse);

    engineGUI.menuSelect(3, 'menuTopItem', '#ff3700');
    engineGUI.menuCorrectHeight();

    if (json.settings.showCube) engine3D.sceneCube.add(scene3DCubeMesh);

    //$('#HTMLCanvas').hide();
    $('#engine3D').show();
    $('#WebGLCanvas').show();

    engine3D.animate();
};

engine3D.showRoofDesign = function () {
    scene3DAnimateRotate = false;
    engine3D.freeMemory();
    engine3D.hide();
    engine2D.hide();

    engineGUI.scene = 'roof';

    engineGUI.initMenu("menuRight3DRoof", "Roof/index.json");

    //engine3D.setBackground('split');
    engine3D.setLights();

    //engine3D.camera.position.set(0, 4, 12);
    //var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );

    engine3D.initRendererQuad();

    engine3D.scene.add(engine3D.grid);
    engine3D.scene.add(engine3D.roof);

    $("#WebGLSplitCanvas-0").bind('mousemove', on3DRoofSplit0MouseMove);
    $("#WebGLSplitCanvas").bind('mouseup', on3DRoofVDividerMouseUp);

    //engine3D.scene.add(engine3D.lightHemisphere);
    //engine3D.scene.add( new THREE.AxisHelper(100) );
    //engine3D.scene.add(scene3DLevelGroundContainer);

    //TODO: show extruded stuff from scene2DFloorContainer[0]

    engineGUI.menuToggleRight('menuRight', true);
    engineGUI.menuSelect(4, 'menuTopItem', '#ff3700');
    engineGUI.menuCorrectHeight();

    //$('div.split-pane').splitPane();

    if (json.settings.showCube) engine3D.sceneCube.add(scene3DCubeMesh);

    //$('#HTMLCanvas').hide();
    $('#engine3D').show();
    $('#WebGLSplitCanvas').show();

    engine3D.animate();
};

engine3D.hide = function () {

    $('#engine3D').hide();
    $("#menuFloorList").hide();

    engineGUI.mousedrag = false;
    engineGUI.mouseleft = false;
    engineGUI.mouseright = false;

    if (engine3D.renderer === undefined) return;

    //engine3D.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    //engine3D.renderer.clear();

    if (json.settings.showCube) engine3D.sceneCube.remove(scene3DCubeMesh);

    for (var i = 0; i < engine2D.floor.length; i++) {
        engine3D.scene.remove(scene3DFloorShapeContainer[i]);
        engine3D.scene.remove(scene3DCeilingShapeContainer[i]);
    }

    engine3D.scene.remove(engine3D.grid);

    //$(engine3D.renderer.domElement).unbind('mousedown', on3DMouseDown);
    //$(engine3D.renderer.domElement).unbind('mouseup', on3DMouseUp);

    $(engine3D.renderer.domElement).unbind('mousedown', on3DHouseMouseDown);
    $(engine3D.renderer.domElement).unbind('mouseup', on3DHouseMouseUp);
    $(engine3D.renderer.domElement).unbind('mousemove', on3DHouseMouseMove);

    $(engine3D.renderer.domElement).unbind('dblclick', onDocumentDoubleClick);

    $("#WebGLSplitCanvas-0").unbind('mousemove', on3DRoofSplit0MouseMove);
    $("#WebGLSplitCanvas").unbind('mouseup', on3DRoofVDividerMouseUp);

    $(engine3D.renderer.domElement).unbind('mousedown', on3DFloorMouseDown);
    $(engine3D.renderer.domElement).unbind('mouseup', on3DFloorMouseUp);
    $(engine3D.renderer.domElement).unbind('mousemove', on3DFloorMouseMove);

    $(engine3D.renderer.domElement).unbind('mousedown', on3DLandscapeMouseDown);
    $(engine3D.renderer.domElement).unbind('mouseup', on3DLandscapeMouseUp);
    $(engine3D.renderer.domElement).unbind('mousemove', on3DLandscapeMouseMove);

    //$(engine3D.renderer.domElement).unbind('mouseout', on3DLandscapeMouseUp);

    engine3D.disposePanorama("#WebGLPanorama");

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

    $('#menuBottomHouse').hide();
    $('#menuBottomFloor').hide();

    $("#panoramaHouse").empty();
    $("#panoramaFloor").empty();
    $("#menuFloorList").empty();

    //scene2DFloorContainer[0].traverse;
};

engine3D.addFloor = function (name) {
    var i = scene3DFloorFurnitureContainer.length;

    if (name === null) {
        name = "Floor " + i;
    }

    scene3DFloorFurnitureContainer[i] = new THREE.Object3D();
    scene3DFloorFurnitureContainer[i].name = name;
    scene3DFloorMeasurementsContainer[i] = new THREE.Object3D();
    engine3D.walls[i] = new THREE.Object3D();
    scene3DFloorShapeContainer[i] = new THREE.Object3D();
    scene3DCeilingShapeContainer[i] = new THREE.Object3D();
    //scene3DFloorOtherContainer[i] = new THREE.Object3D();
};

function selectDayNight() {
    engine3D.scene.remove(engine3D.skyHouse);

    if (json.weather.day === true) {
        engine3D.setDay(false);
        //$('#menuDayNightText').html("Night");
        //$('#menuBottomItem6').attr("class", "hi-icon icon-night tooltip");
    } else if (json.weather.day === false) {

        engine3D.setDay(true);

        //$('#menuDayNightText').html("Day");
        //$('#menuBottomItem6').attr("class", "hi-icon icon-day tooltip");
    }

    engine3D.setLights();
    engine3D.setWeather();

    engine3D.scene.add(engine3D.skyHouse);
    //engine3D.scene.add(weatherSkyCloudsMesh);
    //engine3D.scene.add(weatherSkyRainbowMesh);
};

function scene3DObjectSelectRemove() {
    if (engineGUI.scene === 'house') {
        engine3D.house.remove(SelectedObject);
        //console.log(SelectedObject.uuid);
    } else if (engineGUI.scene === 'floor') {
        scene3DFloorFurnitureContainer[engineGUI.floor].remove(SelectedObject);
    }

    scene3DObjectUnselect();
};

function scene3DObjectSelectMenuPosition(x, y) {
    //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    var vector = new THREE.Vector3(x, y, 0.1);

    var percX, percY;

    // projectVector will translate position to 2d
    //vector = projector.projectVector(vector.setFromMatrixPosition(SELECTED.matrixWorld), engine3D.camera); //vector will give us position relative to the world
    if (SelectedObject !== null) {
        vector = vector.setFromMatrixPosition(SelectedObject.matrixWorld);
    } else if (SelectedWall !== null) {
        vector = vector.setFromMatrixPosition(SelectedWall.matrixWorld);
    }
    vector.project(engine3D.camera); //vector will give us position relative to the world

    // translate our vector so that percX=0 represents the left edge, percX=1 is the right edge, percY=0 is the top edge, and percY=1 is the bottom edge.
    percX = (vector.x + 1) / 2;
    percY = (-vector.y + 1) / 2;

    // scale these values to our viewport size
    vector.x = percX * window.innerWidth; // - $(menuID).width(); // * 2;
    vector.y = percY * window.innerHeight; //- $(menuID).height() / 2;
    return vector;
};

function scene3DObjectSelectMenu(x, y, menuID) {
    //http://zachberry.com/blog/tracking-3d-objects-in-2d-with-three-js/
    var vector = scene3DObjectSelectMenuPosition(x, y);

    $(menuID).css('top', vector.y - 60).css('left', vector.x);
    $(menuID).show();

    if (SelectedObject !== null) {
        //$('#WebGLTextureSelect').css('top', vector.y + $(menuID).height()-64).css('left', vector.x - $('#WebGLTextureSelect').width() / 2);
        //$('#WebGLTextureSelect').show();

        //$('#WebGLInteractiveMenu').bind('mousemove', on3DMouseMove);
        //$('#WebGLInteractiveMenu').bind('mousedown', on3DMouseDown);
        //$('#WebGLInteractiveMenu').bind('mouseup', on3DMouseUp);
    } else if (SelectedWall !== null) {
        $('#WebGLTextureSelect').css('top', vector.y + $(menuID).height()).css('left', vector.x - $('#WebGLTextureSelect').width() / 2);
        $('#WebGLColorWheelSelect').css('top', vector.y - $('#WebGLColorWheelSelect').height() - 32).css('left', vector.x - $('#WebGLColorWheelSelect').width() / 2);
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
    var point1 = engine3D.camera.matrixWorld.getPosition().clone();
    var point2 = position;
    var distance = point1.distanceTo(point2);
    */

    /*
    var vFOV = engine3D.camera.fov * Math.PI / 180;      // convert vertical fov to radians
    var height = 2 * Math.tan( vFOV / 2 ) * distance; // visible height
    var aspect = window.width / window.height;
    var width = height * aspect;                  // visible width
    */

    //$('#WebGLInteractiveMenuText').html("Dimentions: " + (SELECTED.geometry.boundingBox.max.x * engine3D.measurements).toFixed(1) + "x" + (SELECTED.geometry.boundingBox.max.y * engine3D.measurements).toFixed(1) + "x" + (SELECTED.geometry.boundingBox.max.z * engine3D.measurements).toFixed(1) + " Meters");
    //$('#WebGLInteractiveMenu').show();
};

function scene3DObjectSelect(x, y, camera, object) {
    //TODO: > http://stemkoski.github.io/Three.js/Outline.html
    /*
    if(SelectedObject != null)
        return true;
    */

    if (engine3D.controls instanceof THREE.OrbitControls) {

        var vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(camera);

        var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(object.children, true); //recursive! pickup objects within objects (example: notes)

        //console.log(object);

        if (intersects.length > 0) {
            //console.log(intersects[0].object);
            //if (intersects[0].object == engine3D.groundHouse)
            //    return;
            //engine3D.controls.enabled = false;

            if (SelectedObject !== intersects[0].object) {

                scene3DObjectUnselect(); //avoid showing multiple selected objects
                engine3D.controls.enabled = false;

                SelectedObject = scene3DObjectSelectedRoot(object, intersects[0].object.uuid);

                if (intersects[0].object.name.indexOf("Platform/note.jsz") >= 0) {
                    SelectedNote = intersects[0].object;
                    camera3DPositionCache = SelectedNote.position.clone();
                    camera3DPivotCache = SelectedNote.rotation.clone();
                    camera3DNoteEnter();
                } else if (SelectedObject.name.indexOf("Platform/camera.jsz") >= 0) {
                    //TODO: Hide on second click
                    /*
                    SelectedPicture = SelectedObject;
                    camera3DPositionCache = SelectedPicture.position.clone();
                    camera3DPivotCache = SelectedPicture.rotation.clone();
                    camera3DPictureEnter();
                    */
                } else if (SelectedObject.children === engine3D.walls[engineGUI.floor].children) {
                    SelectedWall = intersects[0].object;
                    scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLWallPaintMenu');
                } else {
                    //console.log(SelectedObject.name);

                    if (SelectedObject.name.indexOf("house") != -1) {
                        //Avoid selecting house TODO: Dynamic logic
                        scene3DObjectUnselect();
                        return false;
                    }

                    //clearTimeout(engineGUI.clickMenuTime);
                    //SelectedObject = intersects[0].object;

                    var name = "{highlighteMesh}";
                    var highlighteMesh = SelectedObject.children[SelectedObject.children.length - 1];
                    var c = 0x00ff00;
                    if (engineGUI.mouseright) c = 0xFFFF00;
                    var highlightedMaterial = new THREE.MeshBasicMaterial({ color: c, side: THREE.BackSide, opacity: 0.5, transparent: true });

                    if (highlighteMesh.name !== name) //speed things up
                        {
                            highlighteMesh = SelectedObject.clone();
                            highlighteMesh.name = name;
                            highlighteMesh.position.set(0, 0, 0);
                            highlighteMesh.rotation.set(0, 0, 0);
                            highlighteMesh.scale.multiplyScalar(1.06);
                            SelectedObject.add(highlighteMesh);
                        } else {
                        highlighteMesh.visible = true;
                    }

                    for (var i = 0; i < highlighteMesh.children.length; i++) {
                        if (highlighteMesh.children[i].type === "Mesh") {
                            //console.log(o.children[i]);
                            highlighteMesh.children[i].material = highlightedMaterial;
                            highlighteMesh.children[i].material.depthWrite = true;
                            highlighteMesh.children[i].material.depthTest = true;
                        } else {
                            highlighteMesh.remove(highlighteMesh.children[i]); //do not save lines to highlighted mesh
                        }
                    }

                    if (SCENE !== 'house') {
                        var menu = $('#WebGLSelectMenu');
                        /*
                         menu.tooltipster({
                             plugins: ['test'],
                             content: '<a href="#item" onclick="" class="lo-icon icon-info" style="color:#606060"></a><a href="#" onclick="" class="lo-icon icon-settings" style="color:#606060"></a>',
                             interactive: true
                         });
                         */
                        menu.tooltipster('content', '<a href="#item" onclick="" class="lo-icon icon-info" style="color:#606060"></a><a href="#" onclick="" class="lo-icon icon-settings" style="color:#606060"></a>');
                    }

                    //var bbY = 0;
                    if (SelectedObject.boundingBox)
                        //bbY = SelectedObject.boundingBox.max.y;

                        if (intersects[0].distance > 8 && SelectedObject.boundingBox.max.x < 4) {
                            camera3DPositionCache = engine3D.camera.position.clone();
                            camera3DPivotCache = engine3D.controls.target.clone();

                            var tween = new TWEEN.Tween(engine3D.camera.position).to({ x: SelectedObject.position.x, y: SelectedObject.position.y + 4, z: SelectedObject.position.z + 5 }, 1000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function () {

                                //scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
                            }).start();

                            tween = new TWEEN.Tween(engine3D.controls.target).to({ x: SelectedObject.position.x, y: SelectedObject.position.y, z: SelectedObject.position.z }, 1000).easing(TWEEN.Easing.Quadratic.InOut).start();

                            //}else{
                            //scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
                        }

                    if (menu !== undefined) {
                        console.log(engineGUI.scene);
                        var v = scene3DObjectSelectMenuPosition(mouse.x, mouse.y);
                        menu.css({ position: 'absolute', left: v.x, top: v.y - 50, 'z-index': 0 });
                        menu.tooltipster('open');
                    }

                    //SelectedObject.add(scene3DAxisHelper);

                    engineGUI.toggleSideMenus(false);
                }
                return true;
            }
        } else {

            scene3DObjectUnselect();
        }
    }
    return false;
};

function scene3DObjectSelectedRoot(object, uuid) {
    //BufferedGeometry Fix - Select root group including any attached objects (ex: notes, measurements)

    for (var a = 0; a < object.children.length; a++) {
        for (var b = 0; b < object.children[a].children.length; b++) {
            if (object.children[a].children[b].uuid === uuid) return object.children[a];
        }
    }
    return object;
};

function scene3DObjectUnselect() {
    if (engine3D.controls instanceof THREE.OrbitControls) {
        if (SelectedObject !== null) {
            //SelectedObject.remove(scene3DAxisHelper);
            //console.log(SelectedObject);

            var highlighteMesh = SelectedObject.children[SelectedObject.children.length - 1];

            //console.log(highlighteMesh);

            if (highlighteMesh.name === "{highlighteMesh}") highlighteMesh.visible = false;
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

            //engine3D.cameraAnimateResetView();
        } else if (SelectedNote !== null) {
            SelectedNote = null;
            camera3DNoteExit();
        } else if (SelectedPicture !== null) {
            SelectedPicture = null;
            camera3DPictureExit();
        }

        engine3D.controls.enabled = true;
        camera3DPositionCache = null;
        camera3DPivotCache = null;

        //$('#WebGLInteractiveMenu').unbind('mousemove', on3DMouseMove);
        //$('#WebGLInteractiveMenu').unbind('mousedown', on3DMouseDown);
        //$('#WebGLInteractiveMenu').unbind('mouseup', on3DMouseUp);
    }
};

engine3D.collectArrayFromContainer = function (container) {
    var json = [];

    for (var i = 0; i < container.children.length; i++) {
        //var obj = new Object();
        var JSONString = {};
        JSONString.file = container.children[i].children[0].name;
        try {
            JSONString.note = container.children[i].children[2].name;
        } catch (e) {}
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

function scene3DFloorMeasurementsGenerate() {
    material = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 2
    });

    //for (var i = 0; i < engine3D.walls[FLOOR].children.length; i++) {
    //}
};

function scene3DFloorMeasurementShow() {
    var show = true;
    for (var i = 0; i < scene3DFloorFurnitureContainer[engineGUI.floor].children.length; i++) {

        if (scene3DFloorFurnitureContainer[engineGUI.floor].children[i].position.y < 0.8) scene3DFloorFurnitureContainer[engineGUI.floor].children[i].children[1].visible = !scene3DFloorFurnitureContainer[engineGUI.floor].children[i].children[1].visible;

        show = scene3DFloorFurnitureContainer[engineGUI.floor].children[i].children[1].visible;
    }
    if (show) {
        engineGUI.menuSelect(0, 'menuLeft3DFloorItem', '#ff3700');
        engine3D.tool = 'measure';
    } else {
        engineGUI.menuSelect(0, 'menuLeft3DFloorItem', 'black');
        engine3D.tool = '';
    }
};

//http://mrdoob.com/lab/javascript/webgl/clouds/
engine3D.setBackground = function (set) {
    //var canvas = document.getElementById('WebGLCanvas');
    var canvas = document.createElement('canvas');
    canvas.width = window.innerWidth; //32;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');

    if (set === 'blue') {

        var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1e4877");
        gradient.addColorStop(0.5, "#4584b4");

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        //document.body.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
        document.getElementById('engine3D').style.background = 'url(' + canvas.toDataURL('image/png') + ')';
    } else if (set === 'split') {

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
        //engine3D.renderer.setClearColor(0x000000, 1);
    } else {
        document.body.style.background = "#fff";
    }
};

engine3D.setLights = function () {
    engine3D.scene.remove(engine3D.lightAmbient);
    engine3D.scene.remove(engine3D.lightDirectional);
    //engine3D.scene.remove(engine3D.lightHemisphere);
    engine3D.scene.remove(engine3D.lightSpot);

    if (engineGUI.scene === 'house') {
        if (json.weather.day === false) {
            engine3D.lightSpot.intensity = 0.8;
            engine3D.lightSpot.castShadow = false;
            engine3D.scene.add(engine3D.lightSpot);
        } else {

            if (json.weather.sunlight) {
                //SUNLIGHT RAYS
                engine3D.lightAmbient = new THREE.AmbientLight(); //SUNLIGHT RAYS
                engine3D.scene.add(engine3D.lightAmbient);
                //engine3D.lightDirectional.intensity = 1; //SUNLIGHT RAYS
                engine3D.scene.add(engine3D.lightDirectional);
                engine3D.lightSpot.intensity = 1;
                engine3D.lightSpot.castShadow = false;
                engine3D.scene.add(engine3D.lightSpot);
            } else {

                //REGULAR LIGHT
                engine3D.lightAmbient = new THREE.AmbientLight(0xFFFFFF, 0.7);
                engine3D.scene.add(engine3D.lightAmbient);
                engine3D.scene.add(engine3D.lightDirectional);
            }
            //engine3D.scene.add(engine3D.lightHemisphere);
        }
    } else if (engineGUI.scene === 'landscape') {

        engine3D.lightAmbient = new THREE.AmbientLight(0xFFFFFF, 0.5);
        engine3D.scene.add(engine3D.lightAmbient);

        //engine3D.lightSpot.intensity = 0.6;
        //engine3D.lightSpot.castShadow = true;
        //engine3D.scene.add(engine3D.lightSpot);
        engine3D.scene.add(engine3D.lightDirectional);
    } else if (engineGUI.scene === 'roof') {

        engine3D.lightAmbient = new THREE.AmbientLight(0xFFFFFF, 0.1);
        engine3D.scene.add(engine3D.lightAmbient);

        engine3D.lightSpot.intensity = 0.6;
        engine3D.lightSpot.castShadow = false;
        engine3D.scene.add(engine3D.lightSpot);
    } else if (engineGUI.scene === 'floorlevel') {
        engine3D.lightAmbient = new THREE.AmbientLight(0xFFFFFF, 0.5);
        engine3D.scene.add(engine3D.lightAmbient);
        /*
        engine3D.lightSpot.intensity = 0.4;
        engine3D.lightSpot.castShadow = false;
        engine3D.scene.add(engine3D.lightSpot);
        */
        engine3D.scene.add(engine3D.lightDirectional);
        //engine3D.scene.add(engine3D.lightHemisphere);
    } else if (engineGUI.scene === 'floor') {

        engine3D.lightAmbient = new THREE.AmbientLight();
        engine3D.scene.add(engine3D.lightAmbient);
        engine3D.lightDirectional.intensity = 0.6;
        //engine3D.lightSpot.intensity = 0.8;
        //engine3D.lightSpot.castShadow = false;
        //engine3D.scene.add(engine3D.lightSpot);
        engine3D.scene.add(engine3D.lightDirectional);
    }
};

engine3D.insert3DModel = function (path) {
    if (json.settings.mode === "database") {
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
            dataType: 'json',
            url: path,
            async: false, //important
            success: function success(data) {
                //console.log(data.file);
                path = data.file;
            },
            error: function error(xhr, textStatus, errorThrown) {
                alertify.alert("Database Error - 3D Object Not Found").show();
            }
        });
    }

    var x = 0;
    var z = 0;
    var o = 0;

    //TODO: feed through undo/redo function first
    if (engineGUI.scene === 'house') {
        o = engine3D.house.children.length - 1;
        x = 0;
        z = 0;
        try {
            x = engine3D.house.children[o].position.x + engine3D.house.children[o].geometry.boundingBox.max.x;
            z = engine3D.house.children[o].position.z + engine3D.house.children[o].geometry.boundingBox.max.z;
        } catch (e) {}
        //console.log(path + " x:" + x + " z:" + z);
        engine3D.open3DModel(path, engine3D.house, x, 0, z, 0, 0, 1, true, null);
    } else if (engineGUI.scene === 'floor') {
        o = scene3DFloorFurnitureContainer[engineGUI.floor].children.length - 1;
        x = scene3DFloorFurnitureContainer[engineGUI.floor].children[o].position.x + scene3DFloorFurnitureContainer[engineGUI.floor].children[o].geometry.boundingBox.max.x;
        z = scene3DFloorFurnitureContainer[engineGUI.floor].children[o].position.z + scene3DFloorFurnitureContainer[engineGUI.floor].children[o].geometry.boundingBox.max.z;
        engine3D.open3DModel(path, scene3DFloorFurnitureContainer[engineGUI.floor], x, 0, z, 0, 0, 1, true, null);
    }
};

engine3D.calculateCutawayGeometry = function () {
    var confirm = alertify.confirm("This feature is experimental and may not work properly. Continue?");

    confirm.ok = function () {
        var geometry = new THREE.BoxGeometry(20, 16, 6);
        var mesh = new THREE.Mesh(geometry);
        //var cube = new THREE.CubeGeometry(20, 16, 6);

        //console.log(engine3D.roof);
        //console.log(engine3D.house);

        mesh.position.z = engine3D.roof.children[0].position.z + engine3D.roof.children[0].boundingBox.max.z / 2;

        //var SliceBSP = new ThreeBSP.Node(cube);
        var SliceBSP = new ThreeBSP(mesh);

        for (var a = 0; a < engine3D.roof.children.length; a++) {
            /*
            var HouseBSP = new ThreeBSP(engine3D.house.children[a].geometry);
            CutawayBSP = HouseBSP.subtract(SliceBSP);
            result = CutawayBSP.toMesh(new THREE.MeshLambertMaterial()); //{shading: THREE.SmoothShading}));
            //result.geometry.computeVertexNormals();
            engine3D.house.children[a].geometry = result.geometry;
            */
            for (var b = 0; b < engine3D.roof.children[a].children.length; b++) {
                var RoofBSP = new ThreeBSP(engine3D.roof.children[a].children[b].geometry);
                /*
                var union = RoofBSP.subtract(SliceBSP);
                var result = union.toMesh(new THREE.MeshLambertMaterial({shading: THREE.SmoothShading}));
                */
                var union = RoofBSP.subtract(SliceBSP);
                var result = new THREE.Mesh(union.toGeometry(), new THREE.MeshNormalMaterial({ shading: THREE.SmoothShading }));
                result.geometry.computeVertexNormals();
                result.geometry.computeFaceNormals(); // highly recommended...
                engine3D.roof.children[a].children[b].geometry = result.geometry;
            }
        }
    };
    /*
    confirm.cancel = function () { 
    };
    */
    confirm.show();
};

function animateHouseRotate() {
    requestAnimationID = window.requestAnimationFrame(animateHouseRotate);

    if (!scene3DAnimateRotate) {
        engine3D.animate();
        return;
    }

    var delta = clock.getDelta();

    var rotateSpeed = delta * 0.19; //.005; //Date.now() * 0.0001; //.01;
    //var rotateSpeed = .005;
    //if (keyboard.pressed("left")){ 

    var x = engine3D.camera.position.x,
        z = engine3D.camera.position.z;

    var cosratio = Math.cos(rotateSpeed),
        sinratio = Math.sin(rotateSpeed);

    engine3D.camera.position.x = x * cosratio + z * sinratio;
    engine3D.camera.position.z = z * cosratio - x * sinratio;

    //} else if (keyboard.pressed("right")){
    //engine3D.camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
    //engine3D.camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
    //}

    //engine3D.camera.position.x = Math.cos(rotateSpeed) * 100;
    //engine3D.camera.position.z = Math.sin(rotateSpeed) * 100;
    //engine3D.camera.position.y = 60;

    engine3D.camera.lookAt(engine3D.scene.position);

    animateClouds();

    //engine3D.controls.update();
    engine3D.renderer.render(engine3D.scene, engine3D.camera);

    //TWEEN.update();
};

function animateFloor() {
    requestAnimationID = window.requestAnimationFrame(animateFloor);
    //var delta = clock.getDelta();
    /*
    move the CubeCamera to the position of the object that has a reflective surface,
    "take a picture" in each direction and apply it to the surface.
    need to hide surface before and after so that it does not "get in the way" of the camera
    */
    //engine3D.cameraMirror.visible = false;
    //engine3D.cameraMirror.updateCubeMap(renderer, scene3D);
    //engine3D.cameraMirror.visible = true;
    //engine3D.controlsFloor.update();

    engine3D.lightSpot.visible = false; //Do not reflect light
    //engine3D.groundFloor.children[0].visible = false; //because refrection camera is below the floor
    //engine3D.scene.remove(engine3D.groundFloor); //because refrection camera is below the floor

    //engine3D.cameraMirror.updateCubeMap(renderer, scene3D); //capture the reflection

    //engine3D.lightSpot.visible = true;
    //cene3D.add(engine3D.groundFloor);
    //engine3D.groundFloor.children[0].visible = true;

    //particlePivot.tick(delta);

    //engine3D.renderer.clear();
    //engine3D.renderer.render(scene3D, engine3D.camera);

    engine3D.controls.update();

    if (engineGUI.mouseleft) {
        engine3D.renderer.render(engine3D.scene, engine3D.camera);
    } else {
        //engine3D.renderer.clear();
        if (engine3D.SSAOProcessing.enabled) {
            // Render depth into depthRenderTarget
            engine3D.scene.overrideMaterial = engine3D.depthMaterial;
            engine3D.renderer.render(engine3D.scene, engine3D.camera, engine3D.depthRenderTarget, true);

            // Render renderPass and SSAO shaderPass
            engine3D.scene.overrideMaterial = null;
        }

        engine3D.effectComposer.render();
    }

    TWEEN.update();
};

function animateLandscape() {
    requestAnimationID = window.requestAnimationFrame(animateLandscape);

    //var delta = clock.getDelta(); //have to call this before getElapsedTime()
    //var time = clock.getElapsedTime();

    //engine3D.terrainMaterial.map = engine3D.terrain.getSculptDisplayTexture();
    if (engineGUI.mouseleft && engine3D.tool === "rotate") engine3D.controls.update();

    //engine3D.renderer.autoClear = false;
    //engine3D.renderer.clear();
    //engine3D.terrain.update(delta);

    engine3D.terrain.water.material.uniforms.time.value = new Date().getTime() % 10000;

    engine3D.renderer.render(engine3D.scene, engine3D.camera);
    //TWEEN.update();
};

function renderSunlight() {
    if (json.weather.sunlight) {
        var sunPosition = new THREE.Vector3(0, 10, -10);
        var materialDepth = new THREE.MeshDepthMaterial();
        //engine3D.depthMaterial = new THREE.MeshDepthMaterial();
        var screenSpacePosition = new THREE.Vector3();

        // Find the screenspace position of the sun

        screenSpacePosition.copy(sunPosition).project(engine3D.camera);

        screenSpacePosition.x = screenSpacePosition.x + 1; // / 2;
        screenSpacePosition.y = screenSpacePosition.y + 1; // / 2;

        // Give it to the god-ray and sun shaders

        sunlight.godrayGenUniforms.vSunPositionScreenSpace.value.x = screenSpacePosition.x;
        sunlight.godrayGenUniforms.vSunPositionScreenSpace.value.y = screenSpacePosition.y;

        sunlight.godraysFakeSunUniforms.vSunPositionScreenSpace.value.x = screenSpacePosition.x;
        sunlight.godraysFakeSunUniforms.vSunPositionScreenSpace.value.y = screenSpacePosition.y;

        // -- Draw sky and sun --

        // Clear colors and depths, will clear to sky color

        engine3D.renderer.clearTarget(sunlight.rtTextureColors, true, true, false);

        // Sun render. Runs a shader that gives a brightness based on the screen
        // space distance to the sun. Not very efficient, so i make a scissor
        // rectangle around the suns position to avoid rendering surrounding pixels.

        var sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
        var sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

        screenSpacePosition.x *= window.innerWidth;
        screenSpacePosition.y *= window.innerHeight;

        engine3D.renderer.setScissor(screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH);
        engine3D.renderer.enableScissorTest(true);

        sunlight.godraysFakeSunUniforms.fAspect.value = window.innerWidth / window.innerHeight;

        sunlight.scene.overrideMaterial = sunlight.materialGodraysFakeSun;
        engine3D.renderer.render(sunlight.scene, sunlight.camera, sunlight.rtTextureColors);

        engine3D.renderer.enableScissorTest(false);

        // -- Draw scene objects --

        // Colors
        engine3D.scene.overrideMaterial = null;
        engine3D.renderer.render(scene3D, engine3D.camera, sunlight.rtTextureColors);

        // Depth
        engine3D.scene.overrideMaterial = materialDepth;
        engine3D.renderer.render(scene3D, engine3D.camera, sunlight.rtTextureDepth, true);

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
        var stepLen = filterLen * Math.pow(TAPS_PER_PASS, -pass);

        sunlight.godrayGenUniforms.fStepSize.value = stepLen;
        sunlight.godrayGenUniforms.tInput.value = sunlight.rtTextureDepth;

        sunlight.scene.overrideMaterial = sunlight.materialGodraysGenerate;

        engine3D.renderer.render(sunlight.scene, sunlight.camera, sunlight.rtTextureGodRays2);

        // pass 2 - render into second ping-pong target

        pass = 2.0;
        stepLen = filterLen * Math.pow(TAPS_PER_PASS, -pass);

        sunlight.godrayGenUniforms.fStepSize.value = stepLen;
        sunlight.godrayGenUniforms.tInput.value = sunlight.rtTextureGodRays2;

        engine3D.renderer.render(sunlight.scene, sunlight.camera, sunlight.rtTextureGodRays1);

        // pass 3 - 1st RT

        pass = 3.0;
        stepLen = filterLen * Math.pow(TAPS_PER_PASS, -pass);

        sunlight.godrayGenUniforms.fStepSize.value = stepLen;
        sunlight.godrayGenUniforms.tInput.value = sunlight.rtTextureGodRays1;

        engine3D.renderer.render(sunlight.scene, sunlight.camera, sunlight.rtTextureGodRays2);

        // final pass - composite god-rays onto colors

        sunlight.godrayCombineUniforms.tColors.value = sunlight.rtTextureColors;
        sunlight.godrayCombineUniforms.tGodRays.value = sunlight.rtTextureGodRays2;

        sunlight.scene.overrideMaterial = sunlight.materialGodraysCombine;

        engine3D.renderer.render(sunlight.scene, sunlight.camera);
        sunlight.scene.overrideMaterial = null;
    } else {
        //engine3D.renderer.clear();
        engine3D.renderer.render(scene3D, engine3D.camera);
        /*
        if(engineGUI.mouseleft){
            engine3D.renderer.render(scene3D, engine3D.camera);
        }else{
            composer.render();
        }
        */
    }
};

function animateClouds() {
    /*
    if (json.weather.day) {
        weatherSkyDayMesh.rotation.y = engine3D.camera.rotation.y; //spiral
        weatherSkyDayMesh.rotation.z = engine3D.camera.rotation.z; //side-to-side
        weatherSkyDayMesh.rotation.x = engine3D.camera.rotation.x; //top
        weatherSkyDayMesh.position.x = engine3D.camera.position.x / 1.5;
    } else {
        weatherSkyNightMesh.rotation.y = engine3D.camera.rotation.y; //spiral
        weatherSkyNightMesh.rotation.z = engine3D.camera.rotation.z; //side-to-side
        weatherSkyNightMesh.rotation.x = engine3D.camera.rotation.x; //top
        weatherSkyNightMesh.position.x = engine3D.camera.position.x / 1.5;
    }
    */

    //if(weatherSkyCloudsMesh){
    weatherSkyCloudsMesh.rotation.y = engine3D.camera.rotation.y; //spiral
    weatherSkyCloudsMesh.rotation.z = engine3D.camera.rotation.z; //side-to-side
    weatherSkyCloudsMesh.rotation.x = engine3D.camera.rotation.x; //top
    weatherSkyCloudsMesh.position.x = engine3D.camera.position.x / 1.5;
    //}

    //weatherSkyDayMesh.position.z = engine3D.camera.position.z;
    //weatherSkyDayMesh.rotation = engine3D.camera.rotation;

    //weatherSkyDayMesh.position.y = (Math.random() - 0.5) * 0.2;
    //weatherSkyDayMesh.position.z = (Math.random() - 0.5) * 5.0;
    //weatherSkyDayMesh.rotation = Math.random() * Math.PI;
    //weatherSkyDayMesh.scale.multiplyScalar(1 / 30 * (Math.random() * 0.4 + 0.8))
    // object3d.color.setHex( 0xC0C0C0 + 0x010101*Math.floor(255*(Math.random()*0.1)) );
};

function animateHouse() {
    requestAnimationID = window.requestAnimationFrame(animateHouse);

    if (scene3DAnimateRotate) {
        engine3D.animate();
        return;
    }

    //var delta = clock.getDelta();

    //if (engine3D.controls instanceof THREE.OrbitControls){
    //particlePivot.tick(delta);
    //particleWeather.tick(delta);

    animateClouds();

    /*
    for (var a in animation) {
        a.update(delta * 0.8);
    }
    */
    //}

    if (engine3D.controls.enabled) {
        engine3D.controls.update();

        if (json.settings.showCube) engine3D.rendererCube.render(engine3D.sceneCube, engine3D.cameraCube);
    }

    if (engineGUI.mouseleft) {
        engine3D.renderer.render(engine3D.scene, engine3D.camera);
    } else {
        //engine3D.renderer.clear();
        if (engine3D.SSAOProcessing.enabled) {
            // Render depth into depthRenderTarget
            engine3D.scene.overrideMaterial = engine3D.depthMaterial;
            engine3D.renderer.render(engine3D.scene, engine3D.camera, engine3D.depthRenderTarget, true);

            // Render renderPass and SSAO shaderPass
            engine3D.scene.overrideMaterial = null;
        }
        engine3D.effectComposer.render();
    }

    TWEEN.update();
    /*
    if(engineGUI.mouseleft){
        engine3D.renderer.render(scene3D, engine3D.camera);
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
    //engine3D.renderer.render(scene2D, camera2D);
};

function animateRoof() {
    requestAnimationID = window.requestAnimationFrame(animateRoof);

    for (i = 0; i < 4; i++) {
        engine3D.rendererQuad[i].render(engine3D.scene, engine3D.cameraQuad[i]);
    }
};

function animateRoof0() {
    requestAnimationID = window.requestAnimationFrame(animateRoof);

    engine3D.rendererQuad[0].render(engine3D.scene, engine3D.cameraQuad[0]);
};

engine3D.animateStop = function () {
    //http://stackoverflow.com/questions/10735922/how-to-stop-a-requestanimationframe-recursion-loop
    if (requestAnimationID) {
        window.cancelAnimationFrame(requestAnimationID);
        requestId = undefined;
    }
    //TWEEN.removeAll(); //avoid any tween checks whilre rotating (faster)
};

engine3D.animate = function () {
    //Look into Threading this with WebWorkers > http://www.html5rocks.com/en/tutorials/workers/basics/
    engine3D.animateStop();

    if (engineGUI.scene == 'house') {
        if (scene3DAnimateRotate) {
            //engine3D.camera.position.set(0, 6, 20);
            animateHouseRotate();
        } else {
            animateHouse();
        }
    } else if (engineGUI.scene == 'floor') {
        animateFloor();
    } else if (engineGUI.scene == 'landscape' || engineGUI.scene == 'floorlevel') {
        animateLandscape();
    } else if (engineGUI.scene == 'roof') {
        animateRoof();
    }
};

engine3D.freeMemory = function () {
    if (engine3D.scene !== undefined) {
        while (engine3D.scene.children.length > 0) {
            var obj = engine3D.scene.children[engine3D.scene.children.length - 1];
            //obj.mesh.geometry.dispose();
            //obj.mesh.material.map.dispose();
            //obj.mesh.material.dispose();

            if (obj.geometry) obj.geometry.dispose();

            if (obj.material) {
                /*                                                                                 
                    if (obj.material instanceof THREE.MeshFaceMaterial) {                 
                    $.each(obj.material.materials, function(idx, obj) {                 
                        obj.dispose();                                                                                   
                    });                                                                                                
                } else {
                */
                if (obj.material.map) obj.material.map.dispose();

                obj.material.dispose();
                //}                                                                                          
            }

            engine3D.scene.remove(obj);
        }
        scene3DObjectUnselect();
    }

    if (engine3D.cameraQuad[0] instanceof THREE.OrthographicCamera) {
        for (i = 0; i < 4; i++) {
            engine3D.cameraQuad[i] = null;
            engine3D.rendererQuad[i] = null;
        }
    }
    //engine3D.skyHouse = new THREE.Object3D();
    //engine3D.scene.remove(engine3D.skyHouse);
    //scene3D = null;
    //scene3D = new THREE.Scene();
};

/*
function scene3DGround(_texture, _grid) {

    //var geometry = new THREE.SphereGeometry(20, 4, 2);
    //var material = new THREE.MeshBasicMaterial({ color: 0xff0000});

    engine3D.scene.remove(engine3D.grid);
    
    if (_grid) {
        engine3D.grid = new THREE.GridHelper(20, 2);
        engine3D.scene.add(engine3D.grid);
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
    //engine3D.scene.remove(groundMesh);
    engine3D.scene.add(groundMesh);
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