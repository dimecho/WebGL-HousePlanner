engine3D.initialize = function()
{
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

        document.getElementsByTagName("body")[0].style.overflow = "auto";
        document.getElementsByTagName("html")[0].style.overflow = "auto";
        return;
    }

	//RUNMODE = runmode;
	//VIEWMODE = viewmode;

    if(RUNMODE === "local")
    {
        $("#menuTopItem12").hide(); //Share
        $("#menuTopItem15").hide(); //Login
    }

    $("#menuTop").show();
    $("#menuBottomHouse").show();

    // workaround for chrome bug: http://code.google.com/p/chromium/issues/detail?id=35980#c12
    if (window.innerWidth === 0) {
        window.innerWidth = parent.innerWidth;
        window.innerHeight = parent.innerHeight;
    }

    spinner = $("<div>", {class:"cssload-container", style:"position:absolute;top:32%;left:40%;"}).append($("<ul>", {class:"cssload-flex-container"}).append($("<li>").append($("<span>",{class:"cssload-loading"}))));

    /*
	http://www.ianww.com/blog/2012/12/16/an-introduction-to-custom-shaders-with-three-dot-js/
	huge improvement in smoothness of the simulation by writing a custom shader for my particle system.
	This effectively moved all the complex position calculations for particles to the GPU, which went
	a long way toward ensuring the speed and reliability of the simulation. Custom shaders are written in GLSL,
	which is close enough to C that it’ s not too difficult to translate your math into.
	*/
    scene3D = new THREE.Scene();
    projector = new THREE.Projector();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    touch = new THREE.Vector2();
    target = new THREE.Vector3();

    engine3D.jsonLoader = new THREE.LoadingManager();
    engine3D.fontLoader = new THREE.FontLoader();
    engine3D.textureLoader = new THREE.TextureLoader();

    scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DPivotPoint = new THREE.Object3D();
    //scene3DAxisHelper = new THREE.AxisHelper(2);

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

    /*
    scene3DWallInteriorTextureDefault = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/C0001.jpg');
    scene3DWallInteriorTextureDefault.minFilter = THREE.LinearFilter;
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

    if(engine3D.showCube === true)
    {
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
        material = new THREE.MultiMaterial(cubeMaterials);
        material.vertexColors = THREE.FaceColors;

        geometry = engine3D.initCube(8); //new THREE.BoxGeometry(10, 10, 10, 1, 1, 1)
        geometry.computeLineDistances();

        scene3DCubeMesh = new THREE.Line(geometry, new THREE.LineDashedMaterial({
            color: 0xff3700,
            dashSize: 3,
            gapSize: 1,
            linewidth: 2
        }), THREE.LineSegments);
        scene3DCubeMesh.geometry.dynamic = true; //Changing face.color only works with geometry.dynamic = true
    }

    engine3D.initRenderer();

    //engine3D.initPhysics();

    engine3D.initTerrainGround();

    engine3D.initTerrainWater();

    engine2D.initialize();
   
    engine3D.new();

    engine3D.showHouse();

    //automatically resize renderer THREE.WindowResize(renderer, camera); toggle full-screen on given key press THREE.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    $(window).bind('resize', onWindowResize);
    $(window).bind('beforeunload', function() {
        return 'Are you sure you want to leave?';
    });
};

engine3D.initRenderer = function()
{
    /*
    https://www.udacity.com/course/viewer#!/c-cs291/l-158750187/m-169414761
    */
    //VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera3D = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 80);

    dpr = 1;
    if (window.devicePixelRatio !== undefined) {
      dpr = window.devicePixelRatio;
    }

    //renderer = new THREE.WebGL2Renderer(); //r.83dev
    
    renderer = new THREE.WebGLRenderer({
        devicePixelRatio: dpr,
        antialias: false,
        //alpha: true,
        //alpha: false,
        //preserveDrawingBuffer: false
        //autoUpdateObjects: true
    });
    
    //renderer.autoClear = false; //REQUIRED: for split screen
    
    renderer.shadowMap.enabled = true; //shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMapAutoUpdate = true;
    
    //renderer.shadowMap.debug = true; //shadowMapDebug = true;
    //renderer.shadowMapType = THREE.PCFShadowMap; //THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

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

    document.getElementById('WebGLCanvas').appendChild(renderer.domElement);

    if(engine3D.showCube === true)
    {
        scene3DCube = new THREE.Scene();
        camera3DCube = new THREE.PerspectiveCamera(60, 1, 1, 50);
        camera3DCube.up = camera3D.up;
        scene3DCube.add(scene3DCubeMesh);

        rendererCube = new THREE.WebGLRenderer({
            devicePixelRatio: dpr,
            antialias: false,
            alpha: true,
            //transparent: true,
            //preserveDrawingBuffer: false
        });
        rendererCube.setSize(100, 100);
        //$(rendererCube.domElement).bind('mousemove', onCubeMouseMove);
        document.getElementById('WebGLCubeCanvas').appendChild(rendererCube.domElement);
    }
};

engine3D.initRendererQuad = function()
{
    $('div.split-pane').splitPane();

    for(i = 0; i<4; i++){

        rendererQuad[i] = new THREE.WebGLRenderer({
            devicePixelRatio: dpr,
            antialias: false,
            //alpha: true,
            //autoClear: false
        });
        rendererQuad[i].setClearColor( 0xffffff );
        $('#WebGLSplitCanvas-' + i).append(rendererQuad[i].domElement);

        //var w = $("#WebGLSplitCanvas-" + i).parent().parent().width();
        //var h = $("#WebGLSplitCanvas-" + i).parent().parent().height();
        //camera3DQuad[i] = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -30, 30 );
    }

    //Top View Camera
    camera3DQuad[0] = new THREE.OrthographicCamera( $("#WebGLSplitCanvas-0").parent().parent().width() / - 60, $("#WebGLSplitCanvas-0").parent().parent().width() / 60, $("#WebGLSplitCanvas-0").parent().parent().height() / 10, $("#WebGLSplitCanvas-0").parent().parent().height() / - 10, -30, 30 );
    camera3DQuad[0].up = new THREE.Vector3(0, 0, -1);
    camera3DQuad[0].lookAt(new THREE.Vector3(0, -1, 0));

    //Front View Camera
    camera3DQuad[1] = new THREE.OrthographicCamera( $("#WebGLSplitCanvas-1").parent().parent().width() / - 60, $("#WebGLSplitCanvas-1").parent().parent().width() / 60, $("#WebGLSplitCanvas-1").parent().parent().height() / 10, $("#WebGLSplitCanvas-1").parent().parent().height() / - 10, -30, 30 );
    //camera3DQuad[1].lookAt(new THREE.Vector3(0, 0, -1));
    //camera3DQuad[1].position.set(0, 0, 0);
    camera3DQuad[1].lookAt(new THREE.Vector3(1, 0, 0));
    camera3DQuad[1].position.set(0, 0, 0);

    //Side View Camera
    camera3DQuad[2] = new THREE.OrthographicCamera( $("#WebGLSplitCanvas-2").parent().parent().width() / - 60, $("#WebGLSplitCanvas-2").parent().parent().width() / 60, $("#WebGLSplitCanvas-2").parent().parent().height() / 10, $("#WebGLSplitCanvas-2").parent().parent().height() / - 40, -30, 30 );
    camera3DQuad[2].lookAt(new THREE.Vector3(1, 0, 0));
    camera3DQuad[2].position.set(0, 0, 0);

    //3D View Camera
    camera3DQuad[3] = new THREE.PerspectiveCamera(70, $("#WebGLSplitCanvas-3").parent().width() / $("#WebGLSplitCanvas-3").parent().height(), 1, 50);
    camera3DQuad[3].position.set(0, 14, 8);
    camera3DQuad[3].lookAt(new THREE.Vector3(0, 0, 0));

    camera3DQuadGrid = new THREE.GridHelper(15, 1, new THREE.Color(0x000066), new THREE.Color(0x6dcff6));

    engine3D.initRendererQuadSize();

    //controls3DDebug = new THREE.OrbitControls(camera3DQuad[0], rendererQuad[0].domElement);
    //controls3DDebug.enabled = true;

    /*
    var pane = $('div.split-pane').children('.split-pane-divider');

    function triggerSplitterDrop (vDrop) {
        var offset = pane.offset();
        var ev = {
            which: 1,
            pageX: offset.left,
            pageY: offset.top
        };
        var mdEvent = $.Event('mousedown', ev);

        ev.pageY = vDrop || offset.top;
        var mmEvent = $.Event('mousemove', ev);
        var muEvent = $.Event('mouseup', ev);

        pane.trigger(mdEvent);
        pane.trigger(mmEvent);
        pane.trigger(muEvent);
    }
    */
};

engine3D.initRendererQuadSize = function()
{
    if(camera3DQuad[0] instanceof THREE.OrthographicCamera)
    {
        for(i = 0; i<4; i++){
           
            var w = $("#WebGLSplitCanvas-" + i).parent().parent().width();
            var h = $("#WebGLSplitCanvas-" + i).parent().parent().height();
            //console.log(w+ ":" + h);

            camera3DQuad[i].aspect = w / h;
            camera3DQuad[i].updateProjectionMatrix();
            rendererQuad[i].setSize(w, h);
        }
    }
};

engine3D.initPostprocessing = function ()
{
    //if(!(effectComposer instanceof THREE.EffectComposer)){
        console.log("init EffectComposer");
        effectComposer = new THREE.EffectComposer( renderer );
        effectComposer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

        var renderPass = new THREE.RenderPass(scene3D, camera3D); // Setup render pass
        effectComposer.addPass(renderPass);
    //}

    if(SSAOProcessing.enabled) // && !(SSAOPass instanceof THREE.ShaderPass))
    {
        console.log("init SSAOShader");
        // Setup depth pass
        depthMaterial = new THREE.MeshDepthMaterial();
        depthMaterial.depthPacking = THREE.RGBADepthPacking;
        depthMaterial.blending = THREE.NoBlending;
        depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });

        // Setup SSAO pass
        SSAOPass = new THREE.ShaderPass(THREE.SSAOShader);
        SSAOPass.renderToScreen = true;
        //ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
        SSAOPass.uniforms[ "tDepth" ].value = depthRenderTarget;
        SSAOPass.uniforms[ 'size' ].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
        SSAOPass.uniforms[ 'cameraNear' ].value = camera3D.near;
        SSAOPass.uniforms[ 'cameraFar' ].value = camera3D.far;
        SSAOPass.uniforms[ 'onlyAO' ].value = ( SSAOProcessing.renderMode == 1 );
        SSAOPass.uniforms[ 'aoClamp' ].value = 0.3;
        SSAOPass.uniforms[ 'lumInfluence' ].value = 0.5;

        effectComposer.addPass(SSAOPass); // Add pass to effect composer
    }

    /*
    if ( value == 0 ) { // framebuffer
        ssaoPass.uniforms[ 'onlyAO' ].value = false;
    } else if ( value == 1 ) {  // onlyAO
        ssaoPass.uniforms[ 'onlyAO' ].value = true;
    } else {
        console.error( "Not define renderModeChange type: " + value );
    }
    */

    if(FXAAProcessing.enabled) // && !(FXAAPass instanceof THREE.ShaderPass))
    {
        console.log("init FXAAShader");
        FXAAPass = new THREE.ShaderPass(THREE.FXAAShader);
        FXAAPass.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
        FXAAPass.renderToScreen = true;

        effectComposer.addPass(FXAAPass); // Add pass to effect composer
    }
};

engine3D.initLights = function() {

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

    
    sceneDirectionalLight = new THREE.DirectionalLight();
    sceneDirectionalLight.color.setHSL(0.1, 1, 0.95);
    sceneDirectionalLight.position.set(1, 1.8, 0.8).normalize();
    sceneDirectionalLight.target.position.set(0, 0, 0);
    sceneDirectionalLight.position.multiplyScalar(50);
    //sceneDirectionalLight.position.set(-1, 0, 0).normalize();
    sceneDirectionalLight.castShadow = true;
    sceneDirectionalLight.shadow.mapSize.width = 2048; //shadowMapWidth = 2048;
    sceneDirectionalLight.shadow.mapSize.height = 2048; //shadowMapHeight = 2048;
    var d = 15;
    sceneDirectionalLight.shadow.camera.left = -d; //shadowCameraLeft = -d;
    sceneDirectionalLight.shadow.camera.left = d; //shadowCameraRight = d;
    sceneDirectionalLight.shadow.camera.top = d; //shadowCameraTop = d;
    sceneDirectionalLight.shadow.camera.bottom = -d; //shadowCameraBottom = -d;
    sceneDirectionalLight.shadow.camera.far = 2000; //shadowCameraFar = 2000;
    sceneDirectionalLight.shadow.bias = -0.0001; //shadowBias = -0.0001;
    //sceneDirectionalLight.shadowDarkness = 1;
    //sceneDirectionalLight.shadow.camera.visible = true; //shadowCameraVisible = true;
    //scene3D.add(sceneDirectionalLight);

    sceneSpotLight = new THREE.SpotLight();
    sceneSpotLight.shadow.camera.near = 1; //shadowCameraNear = 1; // keep near and far planes as tight as possible
    sceneSpotLight.shadow.camera.far = 38; //shadowCameraFar = 38; // shadows not cast past the far plane
    //sceneSpotLight.shadowCameraVisible = true;
    sceneSpotLight.castShadow = true;
    sceneSpotLight.intensity = 0.8;
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
};

engine3D.initPhysics = function ()
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
};

engine3D.initCube = function (size) {

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
};

engine3D.newFloor = function(i)
{
    scene3DFloorFurnitureContainer[i] = new THREE.Object3D();
    //scene3DFloorOtherContainer[i] = new THREE.Object3D();
    scene3DFloorMeasurementsContainer[i] = new THREE.Object3D();
    scene3DFloorWallContainer[i] = new THREE.Object3D();
    scene3DFloorShapeContainer[i] = new THREE.Object3D();
    scene3DCeilingShapeContainer[i] = new THREE.Object3D();
    scene3DWallInteriorTextures[i] = [];
    scene3DWallExteriorTextures[i] = [];
}

engine3D.new = function(i)
{
    //animateStop();
    //scene3DFreeMemory();
    //hideElements();

    scene3DRoofContainer = new THREE.Object3D();
    scene3DHouseContainer = new THREE.Object3D();
    //_scene3DHouseGroundContainer = new THREE.Geometry(); //THREE.Scene();
    scene3DHouseGroundContainer = new THREE.Object3D();
    scene3DHouseFXContainer = new THREE.Object3D();
    //scene3DFloorGroundContainer = new THREE.Object3D();
    scene3DLevelGroundContainer = new THREE.Object3D();
    scene3DLevelWallContainer = new THREE.Object3D();
    //scene3DPivotPoint = new THREE.Object3D();

    skyMesh = new THREE.Object3D();
    skyFloorMesh = new THREE.Object3D();

    engine3D.enableOrbitControls(camera3D,renderer.domElement);

    engine3D.initPostprocessing();

    //engine3D.scene3DSky();

    engine3D.initLights();

    //$('#menuWeatherText').html("Sunny");
    //$('#menuDayNightText').html("Day");

    //animateHouse();

    engine3D.open3DModel("objects/Platform/floor.jsz", scene3DFloorGroundContainer, 0, 0, 0, 0, 0, 1, false, null);
    engine3D.open3DModel("objects/Landscape/round.jsz", scene3DHouseGroundContainer, 0, 0, 0, 0, 0, 1, true, null);
    engine3D.open3DModel("objects/Platform/pivotpoint.jsz", scene3DPivotPoint, 0, 0, 0.1, 0, 0, 1, false, null);
};

engine3D.open = function()
{
    //landscape.select('hill');
    //landscape.select('valley');
    
    //engine3D.new();
    scene3DHouseGroundContainer = new THREE.Object3D(); //Important to reset

    $.each(json.terrain, function()
    {
        //console.log(this);
        engine3D.open3DModel(this.file, scene3DHouseGroundContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });

    $.each(json.roof, function()
    {
        //console.log(this);
        engine3D.open3DModel(this.file, scene3DRoofContainer, this['position.x'], this['position.y'],this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });

    $.each(json.house, function()
    {
        //console.log(this);
        engine3D.open3DModel(this.file, scene3DHouseContainer, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });

    for (var i = 0; i < json.furniture.length; i++)
    {
        engine3D.newFloor(i);

        $.each(json.furniture[i], function()
        {
            var note = null;
            if(this.note !== undefined)
                note = this.note;
            if(this.file !== undefined)
                engine3D.open3DModel(this.file, scene3DFloorFurnitureContainer[i], this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, note);
        });
    }
};
