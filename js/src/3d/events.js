var engine3D = window.engine3D || {};

function onWindowResize()
{
    var dpr = window.devicePixelRatio | 1;

    engine3D.camera.aspect = window.innerWidth / window.innerHeight;
    engine3D.camera.updateProjectionMatrix();

    //Shader Post Processing
    //========================
    if(engine3D.SSAOPass !== undefined)
        engine3D.SSAOPass.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
    if(engine3D.FXAAPass !== undefined)
        engine3D.FXAAPass.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
    engine3D.effectComposer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
    //========================
    
    engine3D.renderer.setSize(window.innerWidth, window.innerHeight);

    engine3D.initRendererQuadSize();

    engineGUI.menuCorrectHeight();
};

function onCubeMouseMove(event)
{
    //event.preventDefault();

    //scene3DCubeMesh.face.color = new THREE.Color(0xddaa00);
    //scene3DCubeMesh.geometry.colorsNeedUpdate = true;
    /*
    x = (event.clientX / $(engine3D.rendererCube.domElement).width) * 2 - 1;
    y = -(event.clientY / $(engine3D.rendererCube.domElement).height) * 2 + 1;

    vector = new THREE.Vector3(x, y, 0.5);
    projector.unprojectVector(vector, engine3D.cameraCube);

    var ray = new THREE.Raycaster(engine3D.cameraCube.position, vector.sub(engine3D.cameraCube.position).normalize());
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
};

function onDocumentDoubleClick(event)
{
    //event.preventDefault();

    if (engine3D.controls instanceof THREE.OrbitControls && SelectedObject === null)
    {
        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;

        //console.log('doubleclick 2D ' + x + ":" + y);

        //TODO: zoom out far, reset pivot-point to 0,0,0
        //if (new Date().getTime() - 150 < clickTime) { //Set pivot-point to clicked coordinates

        vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(engine3D.camera);
        var raycaster = new THREE.Raycaster(engine3D.camera.position, vector.sub(engine3D.camera.position).normalize());
        var intersects = raycaster.intersectObjects(scene3DHouseGroundContainer.children,true);

        if (intersects.length > 0) {
            //console.log('doubleclick 3D');

            clearTimeout(doubleClickTime);

            engine3D.pivot.position.set(intersects[0].point.x, 0, intersects[0].point.z);
            
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
            engine3D.scene.add(engine3D.pivot);
            engine3D.scene.add(particlePivot.mesh);
            particlePivotEmitter.enable();
            */

            var tween = new TWEEN.Tween(engine3D.controls.target).to({x:intersects[0].point.x, y:0, z:intersects[0].point.z},800).easing(TWEEN.Easing.Quadratic.InOut).start();

            //engine3D.controls.target = new THREE.Vector3(intersects[0].point.x, 0, intersects[0].point.z); //having THREE.TrackballControls or THREE.OrbitControls seems to override the camera.lookAt function

            doubleClickTime = setTimeout(function() {
                engine3D.scene.remove(engine3D.pivot);
                //particlePivotEmitter.disable();
                //engine3D.scene.remove(particlePivot.mesh);
                //particlePivot = new SPE.Group({});

            }, 4000);
        }
    }
};

function on3DLandscapeMouseMove(event)
{
    //event.preventDefault();
    //event.stopPropagation();
    
    //if (TOOL3DLANDSCAPE == "rotate") {
    //    return;
    //}

    //engine3D.controls.enabled = false;
    
    if (TOOL3DLANDSCAPE === "angle") 
    {
        if (!engineGUI.mouseleft)
        return;

        if (event.clientX > window.innerWidth / 2) {
            //scene3DHouseGroundContainer.children[0].rotation.z = scene3DHouseGroundContainer.children[0].rotation.z + 0.02;
            engine3D.terrain.rotation.y = engine3D.terrain.rotation.y + 0.015;
        } else {
            //scene3DHouseGroundContainer.children[0].rotation.z = scene3DHouseGroundContainer.children[0].rotation.z - 0.02;
            engine3D.terrain.rotation.y = engine3D.terrain.rotation.y - 0.015;
        }
    }
    else
    {
        //if (terrain3DMouse.state == 1) {
        //    terrain3DMouse.state = 2;
        //}

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;
        //console.log("mouse move" + x + ":" + x);

        var vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(engine3D.camera);
        var ray = new THREE.Raycaster(engine3D.camera.position, vector.sub(engine3D.camera.position).normalize());
        var intersection = ray.intersectObjects(engine3D.terrain.children);

        if (intersection.length > 0) {
            
            //terrain3DMouse.plot.x = Math.floor(intersection[0].point.x - map_left);
            //terrain3DMouse.plot.y = Math.floor(intersection[0].point.z - map_top);
            
            terrain3DMouse.vertex.x = Math.floor((intersection[0].point.x * plot_vertices) - (map_left * plot_vertices));
            terrain3DMouse.vertex.y = Math.floor((intersection[0].point.z * plot_vertices) - (map_top * plot_vertices));

            engine3D.terrain.material.uniforms.ring_center.value.x = intersection[0].point.x;
            engine3D.terrain.material.uniforms.ring_center.value.y = -intersection[0].point.z;
        }
        if (engineGUI.mouseleft)
            landscape.onmousemove();
    }
};

function on3DLandscapeMouseDown(event)
{
    //event.preventDefault();
    //event.stopPropagation();
    if (event.which === 1) 
        engineGUI.mouseleft = true;

    engine3D.controls.enabled = false;

    //console.log(TOOL3DLANDSCAPE);

    if (TOOL3DLANDSCAPE === "rotate")
    {
        engine3D.controls.enabled = true;
    }
    else if (TOOL3DLANDSCAPE === "hill" || TOOL3DLANDSCAPE === "valley")
    {
        //event.stopPropagation();
        //event.cancelBubble = true;
        terrain3DMouse.x = event.clientX;
        terrain3DMouse.y = event.clientY;
    }
};

function on3DLandscapeMouseUp(event)
{

    //event.preventDefault();
    //event.stopPropagation();
    engineGUI.mouseleft = false;
    engine3D.controls.enabled = false;

    if (TOOL3DLANDSCAPE === "hill" || TOOL3DLANDSCAPE === "valley")
    {
        terrain3DMouse.x = event.clientX;
        terrain3DMouse.y = event.clientY;
    }
};

$(document).on('keyup', function(event){

    event.preventDefault();
    //console.log(event)

    if(engineGUI.scene === "house")
    {
        if (event.which === 27) //esc
        {
            camera3DPositionCache = new THREE.Vector3(0, 6, 20);
            camera3DPivotCache = new THREE.Vector3(0, 0, 0);
            engine3D.cameraAnimateResetView();
        }
    /*
    }
    else if(engineGUI.scene === "2d")
    {
        if (event.which === 37) //left arrow
        {

        }
        else if (event.which === 38) //up arrow
        {

        }
        else if (event.which === 39) //right arrow
        {

        }
        else if (event.which === 40) //down arrow
        {

        }
    */
    }
});

function on3DRoofVDividerMouseUp(event) {
    engine3D.initRendererQuadSize();
};

function on3DRoofSplit0MouseMove(event) {

};

function on3DRoofSplit1MouseMove(event) {

};

function on3DRoofSplit2MouseMove(event) {

};

function on3DRoofSplit3MouseMove(event) {

};

function on3DHouseMouseUp(event)
{
    on3DMouseUp(event);
};

function on3DHouseMouseDown(event)
{
    on3DMouseDown(event);

    if (!scene3DObjectSelect(mouse.x, mouse.y, engine3D.camera, scene3DHouseContainer)){
        engine3D.scene.add(engine3D.pivot);

    //}
    //else if (scene3DObjectSelect(mouse.x, mouse.y, engine3D.camera, scene3DHouseGroundContainer))
    //{
        //if (SelectedObject != null)
        //{
            //var max = Math.max(SelectedObject.posision.x + SelectedObject.geometry.boundingBox.max.x, SelectedObject.posision.y + SelectedObject.geometry.boundingBox.max.y, SelectedObject.posision.z + SelectedObject.geometry.boundingBox.max.z);
            //if (SelectedObject != null && (mouse.x > max || mouse.y > max))
            //{
                //engine3D.controls.detach(SelectedObject);
                //scene3DenableOrbitControls(engine3D.camera);
                //camera3DAnimateResetView();
                //return;
            //}
        //}
    }
    
    //engine3D.enableTransformControls('translate');
};

function on3DHouseMouseMove(event)
{
    //return; //DEBUG

    if(!engineGUI.mousedrag)
        return;

    //if(TWEEN.getAll().length !== 0) //do not interfere with existing animations (performance)
    //    return;
    
    if(SelectedObject !== null)
        on3DObjectMove(scene3DHouseGroundContainer,event);
    else
        on3DCubeMove();
};

function on3DFloorMouseDown(event)
{
    on3DMouseDown(event);

    if (!scene3DObjectSelect(mouse.x, mouse.y, engine3D.camera, scene3DFloorFurnitureContainer[FLOOR]))
    {
        //if (!scene3DObjectSelect(mouse.x, mouse.y, engine3D.camera, scene3DFloorWallContainer[FLOOR]))
        //{
            engine3D.scene.add(engine3D.pivot);
        //}
    }
};

function on3DFloorMouseUp(event)
{
    on3DMouseUp(event);

    var o = 0.1;
    if(SelectedObject === null)
    {
       o = 0.5;
    }
    //TODO: exception for collision wall
    for (var i = 0; i < scene3DFloorWallContainer[FLOOR].children.length; i++)
        tween = new TWEEN.Tween(scene3DFloorWallContainer[FLOOR].children[i].material).to({opacity:o}, 500).start();
};

function on3DCubeMove()
{
    if(json.settings.showcube === false)
        return;

    /*
    if (engine3D.controls instanceof THREE.TransformControls || engine3D.controls instanceof THREE.FirstPersonControls) {
        return;
    }
    */
    //console.log("cube move");
    //clearTimeout(clickMenuTime);
    //console.log("cube move");

    engine3D.cameraCube.position.copy(engine3D.camera.position);
    engine3D.cameraCube.position.sub(engine3D.controls.center);
    engine3D.cameraCube.position.setLength(18);
    engine3D.cameraCube.lookAt(scene3DCube.position);
    engine3D.cameraCube.updateMatrixWorld();
    //engine3D.cameraCube.needsUpdate = true;
};

function on3DObjectMove(container,event)
{
    //if(SelectedObject.name === "") //Fix: avoid entire scene selection
    //   return;

    var collision = false;

    //if(engineGUI.mouseright){
    //    $('#WebGLSelectMenu').tooltipster('hide');
    //    SelectedObject.rotation.y += 2; //intersects[0].point.x;
    //}else{

        var x = (event.clientX / window.innerWidth) * 2 - 1;
        var y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        var vector = new THREE.Vector3(x, y, -2.0);
        vector.unproject(engine3D.camera);
        var raycaster = new THREE.Raycaster(engine3D.camera.position, vector.sub(engine3D.camera.position).normalize());
        var intersects = raycaster.intersectObjects(container.children,true);
        if (intersects.length > 0) { //No need to check - ground will always be there (faster)
            if (!collision){
                //engine3D.controls.enabled = false;

                var menu = $('#WebGLSelectMenu');
                if(engineGUI.mouseleft)
                {
                    menu.tooltipster('close');
                    //console.log('intersect: ' + intersects[0].point.x.toFixed(2) + ', ' + intersects[0].point.y.toFixed(2) + ', ' + intersects[0].point.z.toFixed(2) + ')');
                    SelectedObject.position.x = intersects[0].point.x;
                    SelectedObject.position.z = intersects[0].point.z;
                }else if(engineGUI.mouseright){
                    menu.tooltipster('close');
                    SelectedObject.rotation.y = intersects[0].point.x;
                }
            }
        }
    //}
};

function on3DFloorMouseMove(event) {

    //event.preventDefault();

    //if (!engineGUI.mouseleft)
    //    return;

    if(TWEEN.getAll().length !== 0) //do not interfere with existing animations (performance)
        return;

    if(SelectedObject !== null)
    {
        on3DObjectMove(scene3DFloorGroundContainer,event);
    }else{
        var tween;
        var v = new THREE.Vector3( 0, 0, 8 ); //TODO: make this dynamic
        v.applyQuaternion(engine3D.camera.quaternion);
        scene3DCutawayPlaneMesh.position.copy(v);
        scene3DCutawayPlaneMesh.lookAt(engine3D.camera.position);

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
        
        on3DCubeMove();
    }
};

function on3DMouseMove(event)
{
    //event.preventDefault();

    if (!engineGUI.mouseleft || !engineGUI.mouseright ||engine3D.controls instanceof THREE.TransformControls || engine3D.controls instanceof THREE.FirstPersonControls) {
        return;
    }

    //if(TWEEN.getAll().length == 0) { //do not interfere with existing animations
        clearTimeout(clickMenuTime);
        //console.log("mouse:" + event.clientX + " window:" + window.innerWidth);
     
            engine3D.cameraCube.position.copy(engine3D.camera.position);
            engine3D.cameraCube.position.sub(engine3D.controls.center);
            engine3D.cameraCube.position.setLength(18);
            engine3D.cameraCube.lookAt(scene3DCube.position);
        

        /*
        if (event.clientX > window.innerWidth - 50)
        {
            scene3DAnimateRotate = true; 
            engineGUI.mouseleft = false; //TODO: fix this if mouse is outside screen mouseup never triggered
            animate();
        }
        */
    //}

    /*
    if (SelectedObject != null) {

        $('#WebGLInteractiveMenu').hide();
        $('#WebGLTextureSelect').hide();

        //if (TOOL3DINTERACTIVE == 'moveXY') {

            vector = new THREE.Vector3(x, y, 0.1);
            //projector.unprojectVector(vector, engine3D.camera);
            vector.unproject(engine3D.camera);
            var raycaster = new THREE.Raycaster(engine3D.camera.position, vector.sub(engine3D.camera.position).normalize());
            var intersects = raycaster.intersectObjects(scene3DHouseGroundContainer.children);
            //var ray = new THREE.Ray(engine3D.camera.position, vector.sub(engine3D.camera.position).normalize());
            //var intersects = ray.intersectObject(scene3DHouseGroundContainer.children[0]);
            if (intersects.length > 0) {

            var collisionContainer;

            if (engineGUI.scene == 'house')
            {
                collisionContainer = scene3DHouseContainer; //.clone();
            }
            else if (engineGUI.scene == 'floor')
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
        projector.unprojectVector(vector, engine3D.camera);

        var raycaster = new THREE.Raycaster(engine3D.camera.position, vector.sub(engine3D.camera.position).normalize());

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
};

function on3DMouseDown(event)
{
    //event.preventDefault();

    if (event.which === 1)
        engineGUI.mouseleft = true; // Left mouse button was pressed, set flag

    if (event.which === 3)
        engineGUI.mouseright = true; // Right mouse button was pressed, set flag

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    scene3DObjectUnselect();
    /*
    if (SelectedObject != null)
    {
        console.log("on3DMouseDown unselect objet");
        clickMenuTime = setTimeout(function(){
            //scene3DObjectUnselect();
            if (engine3D.controls instanceof THREE.TransformControls && !TransformConstrolsHighlighted)
            {
                //console.log(TransformConstrolsHighlighted);
                engine3D.controls.detach(SelectedObject);
                scene3DenableOrbitControls(engine3D.camera);

                scene3DObjectSelectMenu(mouse.x, mouse.y, '#WebGLInteractiveMenu');
                //$(engine3D.renderer.domElement).unbind('mousemove', on3DMouseMove);
            }
        }, 500);
    }
    */
    //$(engine3D.renderer.domElement).bind('mousemove', on3DMouseMove);
    /*
    if (engine3D.controls instanceof THREE.TransformControls || engine3D.controls instanceof THREE.FirstPersonControls || SelectedObject !== null) {
        return;
    }
    */
    //clickTime = new Date().getTime();
    
    scene3DAnimateRotate = false;

    clearTimeout(clickTime);
    clickTime = setTimeout(function()
    {
        engineGUI.mousedrag = true;
        if (document.getElementById('arrow-right').src.indexOf("images/arrowright.png") >= 0) {
            engineGUI.toggleSideMenus(false);
        }
    }, 500);
};

function on3DMouseUp(event)
{
    //event.preventDefault();

    clearTimeout(clickTime);

    engineGUI.mousedrag = false;

    if (event.which == 1)
        engineGUI.mouseleft = false; // Left mouse button was released, clear flag

    if (event.which == 3)
        engineGUI.mouseright = false;

    if (engine3D.controls instanceof THREE.TransformControls || engine3D.controls instanceof THREE.FirstPersonControls)
        return;

    engine3D.scene.remove(engine3D.pivot);

    if(SelectedObject !== null)
    {
        /*
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        var tween = new TWEEN.Tween(engine3D.camera.position).to({x:SelectedObject.position.x, y:SelectedObject.position.y+4, z:SelectedObject.position.z + 5},1000).easing(TWEEN.Easing.Quadratic.InOut).onComplete(function() {
            var v = scene3DObjectSelectMenuPosition(mouse.x,mouse.y);
            $('#WebGLSelectMenu').css({ position: 'absolute', left: v.x, top: v.y-50 });
            $('#WebGLSelectMenu').tooltipster('show');
        }).start();
        */
    }else{

        //engine3D.scene.updateMatrixWorld();

        clickTime = setTimeout(function() {
            if (document.getElementById('arrow-right').src.indexOf("images/arrowleft.png") >= 0)
                engineGUI.toggleSideMenus(true);
        }, 1000);
    }
    //container.style.cursor = 'auto';
};