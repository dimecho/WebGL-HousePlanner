var engine3D = window.engine3D || {};

engine3D.initialize = function () {
    if (!Detector.webgl) {
        //Detector.addGetWebGLMessage();
        var html = "<br/><br/><br/><div><center><img src='images/webgl.gif' /><h1>Looks like you broke the Internet!</h1><br/><h2>...your WebGL not enabled?</h2>";

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            $('body').append(html + "<br/><br/>You are running Internet Explorer, the browser does not support WebGL, please install one of these popular browsers<br/><br/><a href='http://www.mozilla.org/en-US/firefox'><img src='images/firefox.png'/></a> <a href='http://www.google.ca/chrome'><img src='images/chrome.png'/></a></center></div>");
        } else if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
            $('body').append(html + "<img src='images/firefox-webgl.png'/></center></div>");
            //}else  if (/Version\/[\d\.]+.*Safari/.test(navigator.userAgent)){
            //$('body').append(html + "<img src='images/safari-webgl.png'/></center></div>");
        }

        document.getElementsByTagName("body")[0].style.overflow = "auto";
        document.getElementsByTagName("html")[0].style.overflow = "auto";
        return;
    }

    $("#menuTop").show();
    $("#menuBottomHouse").show();

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
    engine3D.scene = new THREE.Scene();
    projector = new THREE.Projector();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    touch = new THREE.Vector2();
    target = new THREE.Vector3();

    engine3D.jsonLoader = new THREE.LoadingManager();
    engine3D.fontLoader = new THREE.FontLoader();
    engine3D.textureLoader = new THREE.TextureLoader();

    engine3D.groundFloor = new THREE.Object3D();
    engine3D.pivot = new THREE.Object3D();
    //scene3DAxisHelper = new THREE.AxisHelper(2);

    var geometry = new THREE.BoxGeometry(15, 15, 3); //new THREE.PlaneGeometry(15, 15,3);
    geometry.computeBoundingBox();
    material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
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
    var tween = new TWEEN.Tween(engine3D.camera.position).to({x:Math.cos(0.1) * 200, z:Math.sin(0.1) * 200},20000).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(function() {
            //engine3D.camera.updateProjectionMatrix();
            engine3D.camera.lookAt(engine3D.scene.position);
    }).start();
    */

    //engine3D.camera.lookAt(new THREE.Vector3(0, 0, 0));
    //camera2D = new THREE.PerspectiveCamera(1, window.innerWidth / window.innerHeight, 1, 5000);
    //camera2D.lookAt(new THREE.Vector3(0, 0, 0));
    //camera2D.position.z = 5000; // the camera starts at 0,0,0 so pull it back

    /*
    engine3D.cameraMirror = new THREE.CubeCamera(0.1, 10, 30);
    //engine3D.cameraMirror.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    engine3D.cameraMirror.renderTarget.width = engine3D.cameraMirror.renderTarget.height = 3;
    //engine3D.cameraMirror.position.y = -20;
    */

    //================================

    /*
    scene3DWallInteriorTextureDefault = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/C0001.jpg');
    scene3DWallInteriorTextureDefault.minFilter = THREE.LinearFilter;
    scene3DWallInteriorTextureDefault.wrapS = THREE.RepeatWrapping;
    scene3DWallInteriorTextureDefault.wrapT = THREE.RepeatWrapping;
    */

    /*
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

    if (engine3D.showCube === true) {
        var cubeMaterials = [new THREE.MeshBasicMaterial({
            color: 0x33AA55,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }), new THREE.MeshBasicMaterial({
            color: 0x55CC00,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }), new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }), new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }), new THREE.MeshBasicMaterial({
            color: 0x0000FF,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        }), new THREE.MeshBasicMaterial({
            color: 0x5555AA,
            transparent: true,
            opacity: 0.9,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
        })];
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

    engine3D.initPhysics();

    engine3D.initTerrainGround();

    engine3D.initTerrainWater();

    engine2D.initialize();

    engine3D.new();

    engine3D.showHouse();

    //automatically resize renderer THREE.WindowResize(renderer, camera); toggle full-screen on given key press THREE.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    $(window).bind('resize', onWindowResize);
    $(window).bind('beforeunload', function () {
        return 'Are you sure you want to leave?';
    });
};

engine3D.initRenderer = function () {
    /*
    https://www.udacity.com/course/viewer#!/c-cs291/l-158750187/m-169414761
    */
    //VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    engine3D.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 80);

    var dpr = window.devicePixelRatio | 1;

    //engine3D.renderer = new THREE.WebGL2Renderer(); //r.83dev

    engine3D.renderer = new THREE.WebGLRenderer({
        devicePixelRatio: dpr,
        antialias: false
    });

    //engine3D.renderer.autoClear = false; //REQUIRED: for split screen

    engine3D.renderer.shadowMap.enabled = true; //shadowMapEnabled = true;
    engine3D.renderer.shadowMapSoft = true;
    engine3D.renderer.shadowMapAutoUpdate = true;

    //engine3D.renderer.shadowMap.debug = true; //shadowMapDebug = true;
    //engine3D.renderer.shadowMapType = THREE.PCFShadowMap; //THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

    //engine3D.renderer.gammaInput = true;
    //engine3D.renderer.gammaOutput = true;

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
    engine3D.renderer.setSize(window.innerWidth, window.innerHeight);
    //engine3D.renderer.sortObjects = false; //http://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
    //engine3D.renderer.physicallyBasedShading = true;
    //engine3D.renderer.sortObjects = true; //when scene is opening this make sure clouds stay on top
    //engine3D.renderer.setClearColor(0xffffff, 1);

    document.getElementById('WebGLCanvas').appendChild(engine3D.renderer.domElement);

    if (json.settings.showcube) {
        engine3D.sceneCube = new THREE.Scene();
        engine3D.cameraCube = new THREE.PerspectiveCamera(60, 1, 1, 50);
        engine3D.cameraCube.up = engine3D.camera.up;
        engine3D.sceneCube.add(scene3DCubeMesh);

        engine3D.rendererCube = new THREE.WebGLRenderer({
            devicePixelRatio: dpr,
            antialias: false,
            alpha: true
        });
        engine3D.rendererCube.setSize(100, 100);
        //$(rendererCube.domElement).bind('mousemove', onCubeMouseMove);
        document.getElementById('WebGLCubeCanvas').appendChild(engine3D.rendererCube.domElement);
    }
};

engine3D.initRendererQuad = function () {

    $('div.split-pane').splitPane();

    for (var i = 0; i < 4; i++) {

        engine3D.rendererQuad[i] = new THREE.WebGLRenderer({
            devicePixelRatio: window.devicePixelRatio | 1,
            antialias: false
        });
        engine3D.rendererQuad[i].setClearColor(0xffffff);
        $('#WebGLSplitCanvas-' + i).append(engine3D.rendererQuad[i].domElement);

        //var w = $("#WebGLSplitCanvas-" + i).parent().parent().width();
        //var h = $("#WebGLSplitCanvas-" + i).parent().parent().height();
        //engine3D.cameraQuad[i] = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -30, 30 );
    }

    //Top View Camera
    engine3D.cameraQuad[0] = new THREE.OrthographicCamera($("#WebGLSplitCanvas-0").parent().parent().width() / -60, $("#WebGLSplitCanvas-0").parent().parent().width() / 60, $("#WebGLSplitCanvas-0").parent().parent().height() / 10, $("#WebGLSplitCanvas-0").parent().parent().height() / -10, -30, 30);
    engine3D.cameraQuad[0].up = new THREE.Vector3(0, 0, -1);
    engine3D.cameraQuad[0].lookAt(new THREE.Vector3(0, -1, 0));

    //Front View Camera
    engine3D.cameraQuad[1] = new THREE.OrthographicCamera($("#WebGLSplitCanvas-1").parent().parent().width() / -60, $("#WebGLSplitCanvas-1").parent().parent().width() / 60, $("#WebGLSplitCanvas-1").parent().parent().height() / 10, $("#WebGLSplitCanvas-1").parent().parent().height() / -10, -30, 30);
    //engine3D.cameraQuad[1].lookAt(new THREE.Vector3(0, 0, -1));
    //engine3D.cameraQuad[1].position.set(0, 0, 0);
    engine3D.cameraQuad[1].lookAt(new THREE.Vector3(1, 0, 0));
    engine3D.cameraQuad[1].position.set(0, 0, 0);

    //Side View Camera
    engine3D.cameraQuad[2] = new THREE.OrthographicCamera($("#WebGLSplitCanvas-2").parent().parent().width() / -60, $("#WebGLSplitCanvas-2").parent().parent().width() / 60, $("#WebGLSplitCanvas-2").parent().parent().height() / 10, $("#WebGLSplitCanvas-2").parent().parent().height() / -40, -30, 30);
    engine3D.cameraQuad[2].lookAt(new THREE.Vector3(1, 0, 0));
    engine3D.cameraQuad[2].position.set(0, 0, 0);

    //3D View Camera
    engine3D.cameraQuad[3] = new THREE.PerspectiveCamera(70, $("#WebGLSplitCanvas-3").parent().width() / $("#WebGLSplitCanvas-3").parent().height(), 1, 50);
    engine3D.cameraQuad[3].position.set(0, 14, 8);
    engine3D.cameraQuad[3].lookAt(new THREE.Vector3(0, 0, 0));

    engine3D.grid = new THREE.GridHelper(15, 1, new THREE.Color(0x000066), new THREE.Color(0x6dcff6));

    engine3D.initRendererQuadSize();

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

engine3D.initRendererQuadSize = function () {
    if (engine3D.cameraQuad[0] instanceof THREE.OrthographicCamera) {
        for (var i = 0; i < 4; i++) {
            var w = $("#WebGLSplitCanvas-" + i).parent().parent().width();
            var h = $("#WebGLSplitCanvas-" + i).parent().parent().height();
            //console.log(w+ ":" + h);

            engine3D.cameraQuad[i].aspect = w / h;
            engine3D.cameraQuad[i].updateProjectionMatrix();
            engine3D.rendererQuad[i].setSize(w, h);
        }
    }
};

engine3D.initPostprocessing = function () {
    var dpr = window.devicePixelRatio | 1;

    //if(!(engine3D.effectComposer instanceof THREE.EffectComposer)){
    console.log("init EffectComposer");
    engine3D.effectComposer = new THREE.EffectComposer(engine3D.renderer);
    engine3D.effectComposer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

    engine3D.renderPass = new THREE.RenderPass(engine3D.scene, engine3D.camera); // Setup render pass
    engine3D.effectComposer.addPass(engine3D.renderPass);
    //}

    if (engine3D.SSAOProcessing.enabled) // && !(SSAOPass instanceof THREE.ShaderPass))
        {
            console.log("init SSAOShader");
            // Setup depth pass
            engine3D.depthMaterial = new THREE.MeshDepthMaterial();
            engine3D.depthMaterial.depthPacking = THREE.RGBADepthPacking;
            engine3D.depthMaterial.blending = THREE.NoBlending;
            engine3D.depthRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
            //var depthScale = 1.0;

            // Setup SSAO pass
            engine3D.SSAOPass = new THREE.ShaderPass(THREE.SSAOShader);
            engine3D.SSAOPass.renderToScreen = true;
            //engine3D.ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
            engine3D.SSAOPass.uniforms["tDepth"].value = engine3D.depthRenderTarget;
            engine3D.SSAOPass.uniforms['size'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
            engine3D.SSAOPass.uniforms['cameraNear'].value = engine3D.camera.near;
            engine3D.SSAOPass.uniforms['cameraFar'].value = engine3D.camera.far;
            engine3D.SSAOPass.uniforms['onlyAO'].value = engine3D.SSAOProcessing.renderMode == 1;
            engine3D.SSAOPass.uniforms['aoClamp'].value = 0.3;
            engine3D.SSAOPass.uniforms['lumInfluence'].value = 0.5;

            engine3D.effectComposer.addPass(engine3D.SSAOPass); // Add pass to effect composer
        }
    /*
    if (engine3D.SSAOProcessing.renderMode == 0 ) { // framebuffer
        ssaoPass.uniforms[ 'onlyAO' ].value = false;
    } else if (engine3D.SSAOProcessing.renderMode == 1 ) {  // onlyAO
        ssaoPass.uniforms[ 'onlyAO' ].value = true;
    } else {
        console.error( "Not define renderModeChange type: " + engine3D.SSAOProcessing.renderMode);
    }
    */
    if (engine3D.FXAAProcessing.enabled) // && !(FXAAPass instanceof THREE.ShaderPass))
        {
            console.log("init FXAAShader");
            engine3D.FXAAPass = new THREE.ShaderPass(THREE.FXAAShader);
            engine3D.FXAAPass.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
            engine3D.FXAAPass.renderToScreen = true;

            engine3D.effectComposer.addPass(engine3D.FXAAPass); // Add pass to effect composer
        }
};

engine3D.initLights = function () {
    //engine3D.scene.add(new THREE.AmbientLight(0xFFFFFF));

    /*
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 100, 0);
    engine3D.scene.add(light);
    */

    //sky color ground color intensity
    /*
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 100, 0);
    engine3D.scene.add(hemiLight);
    */

    //add sunlight
    /*
    var light = new THREE.SpotLight();
    light.position.set(0, 100, 0);
    engine3D.scene.add(light);
    */

    //engine3D.scene.fog = new THREE.Fog(0xffffff, 0.015, 40); //white fog (0xffffff). The last two properties can be used to tune how the mist will appear. The 0.015 value sets the near property and the 100 value sets the far property 

    /*
    engine3D.lightHemisphere = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
    engine3D.lightHemisphere.color.setHSL(0.6, 0.75, 0.5);
    engine3D.lightHemisphere.groundColor.setHSL(0.095, 0.5, 0.5);
    engine3D.lightHemisphere.position.set(0, 20, 0);
    //engine3D.lightHemisphere.shadowCameraVisible = true;
    */
    //engine3D.scene.add(hemiLight);

    // sky color ground color intensity 
    //engine3D.lightHemisphere = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.6 ); 

    //engine3D.lightAmbient = new THREE.AmbientLight(0x444444); // 0xcccccc
    //scene.add(engine3D.lightAmbient);

    /*
    sceneParticleLight = new THREE.Mesh(new THREE.SphereGeometry(0, 10, 0), new THREE.MeshBasicMaterial({
        color: 0xffffff
    }));
    engine3D.scene.add(sceneParticleLight);
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
    light.shadowCameraFar = engine3D.camera.far;
    light.shadowCameraFov = 10;
    light.shadowBias = -0.00022;
    light.shadowDarkness = 0.5;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;
    engine3D.scene.add(light);
    */
    /*
    engine3D.lightDirectional = new THREE.DirectionalLight(0xFFBBBB, 0.5);
    engine3D.lightDirectional.position.set(2, 10, 6);
    engine3D.lightDirectional.target.position.set(0, 0, 0);
    engine3D.lightDirectional.castShadow = true;
    engine3D.lightDirectional.shadowCameraNear = 0;
    engine3D.lightDirectional.shadowCameraFar = 27;
    engine3D.lightDirectional.shadowCameraRight = 15;
    engine3D.lightDirectional.shadowCameraLeft = -15;
    engine3D.lightDirectional.shadowCameraTop = 15;
    engine3D.lightDirectional.shadowCameraBottom = -15;
    engine3D.lightDirectional.shadowCameraVisible = true;
    engine3D.lightDirectional.shadowBias = 0.005;
    engine3D.lightDirectional.shadowDarkness = 0.4;
    engine3D.lightDirectional.shadowMapWidth = 1024;
    engine3D.lightDirectional.shadowMapHeight = 1024;
    */

    engine3D.lightDirectional = new THREE.DirectionalLight();
    engine3D.lightDirectional.color.setHSL(0.1, 1, 0.95);
    engine3D.lightDirectional.position.set(1, 1.8, 0.8).normalize();
    engine3D.lightDirectional.target.position.set(0, 0, 0);
    engine3D.lightDirectional.position.multiplyScalar(50);
    //engine3D.lightDirectional.position.set(-1, 0, 0).normalize();
    engine3D.lightDirectional.castShadow = true;
    engine3D.lightDirectional.shadow.mapSize.width = 2048; //shadowMapWidth = 2048;
    engine3D.lightDirectional.shadow.mapSize.height = 2048; //shadowMapHeight = 2048;
    var d = 15;
    engine3D.lightDirectional.shadow.camera.left = -d; //shadowCameraLeft = -d;
    engine3D.lightDirectional.shadow.camera.left = d; //shadowCameraRight = d;
    engine3D.lightDirectional.shadow.camera.top = d; //shadowCameraTop = d;
    engine3D.lightDirectional.shadow.camera.bottom = -d; //shadowCameraBottom = -d;
    engine3D.lightDirectional.shadow.camera.far = 2000; //shadowCameraFar = 2000;
    engine3D.lightDirectional.shadow.bias = -0.0001; //shadowBias = -0.0001;
    //engine3D.lightDirectional.shadowDarkness = 1;
    //engine3D.lightDirectional.shadow.camera.visible = true; //shadowCameraVisible = true;
    //engine3D.scene.add(engine3D.lightDirectional);

    engine3D.lightSpot = new THREE.SpotLight();
    engine3D.lightSpot.shadow.camera.near = 1; //shadowCameraNear = 1; // keep near and far planes as tight as possible
    engine3D.lightSpot.shadow.camera.far = 38; //shadowCameraFar = 38; // shadows not cast past the far plane
    //engine3D.lightSpot.shadowCameraVisible = true;
    engine3D.lightSpot.castShadow = true;
    engine3D.lightSpot.intensity = 0.8;
    engine3D.lightSpot.position.set(-4, 35, 4);
    //engine3D.scene.add(engine3D.lightSpot);

    /*
    var frontLight  = new THREE.DirectionalLight('white', 1)
    frontLight.position.set(0.5, 0.5, 2).multiplyScalar(2)
    scene.add( frontLight )
     var backLight   = new THREE.DirectionalLight('white', 0.75)
    backLight.position.set(-0.5, -0.5, -2)
    scene.add( backLight )
    */
};

engine3D.initPhysics = function () {
    //http://javascriptjamie.weebly.com/blog/part-1-the-physics
    
    engine3D.physics = new CANNON.World();
    engine3D.physics.gravity.set(0, -9.82, 0);
    var physicsMaterial = new CANNON.Material("ground");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
        friction: 0.4,
        restitution: 0.3,
        contactEquationStiffness: 1e8,
        contactEquationRegularizationTime: 3,
        frictionEquationStiffness: 1e8,
        frictionEquationRegularizationTime: 3,
    });
    engine3D.physics.addContactMaterial(physicsContactMaterial);
    //var boxShape = new CANNON.Box(new CANNON.Vec3(1,1,1));
};

engine3D.initCube = function (size) {

    var h = size * 0.5;
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-h, -h, -h), new THREE.Vector3(-h, h, -h), new THREE.Vector3(-h, h, -h), new THREE.Vector3(h, h, -h), new THREE.Vector3(h, h, -h), new THREE.Vector3(h, -h, -h), new THREE.Vector3(h, -h, -h), new THREE.Vector3(-h, -h, -h), new THREE.Vector3(-h, -h, h), new THREE.Vector3(-h, h, h), new THREE.Vector3(-h, h, h), new THREE.Vector3(h, h, h), new THREE.Vector3(h, h, h), new THREE.Vector3(h, -h, h), new THREE.Vector3(h, -h, h), new THREE.Vector3(-h, -h, h), new THREE.Vector3(-h, -h, -h), new THREE.Vector3(-h, -h, h), new THREE.Vector3(-h, h, -h), new THREE.Vector3(-h, h, h), new THREE.Vector3(h, h, -h), new THREE.Vector3(h, h, h), new THREE.Vector3(h, -h, -h), new THREE.Vector3(h, -h, h));
    return geometry;
};

engine3D.newFloor = function (i) {
    scene3DFloorFurnitureContainer[i] = new THREE.Object3D();
    //scene3DFloorOtherContainer[i] = new THREE.Object3D();
    scene3DFloorMeasurementsContainer[i] = new THREE.Object3D();
    engine3D.walls[i] = new THREE.Object3D();
    scene3DFloorShapeContainer[i] = new THREE.Object3D();
    scene3DCeilingShapeContainer[i] = new THREE.Object3D();
    scene3DWallInteriorTextures[i] = [];
    scene3DWallExteriorTextures[i] = [];
};

engine3D.new = function (i) {
    //engine3D.animateStop();
    //scene3DFreeMemory();
    //hideElements();

    engine3D.roof = new THREE.Object3D();
    engine3D.house = new THREE.Object3D();
    engine3D._groundHouse = new THREE.Geometry(); //THREE.Scene();
    engine3D.groundHouse = new THREE.Object3D();
    //engine3D.groundFloor = new THREE.Object3D();
    scene3DLevelGroundContainer = new THREE.Object3D();
    scene3DLevelWallContainer = new THREE.Object3D();
    //engine3D.pivot = new THREE.Object3D();

    engine3D.skyHouse = new THREE.Object3D();
    engine3D.skyFX = new THREE.Object3D();
    engine3D.skyFloor = new THREE.Object3D();

    engine3D.enableOrbitControls(engine3D.camera, engine3D.renderer.domElement);

    engine3D.initPostprocessing();

    //engine3D.scene3DSky();

    engine3D.initLights();

    //$('#menuWeatherText').html("Sunny");
    //$('#menuDayNightText').html("Day");

    //animateHouse();

    engine3D.open3DModel("objects/Platform/floor.jsz", engine3D.groundFloor, 0, 0, 0, 0, 0, 1, false, null);
    engine3D.open3DModel("objects/Landscape/round.jsz", engine3D.groundHouse, 0, 0, 0, 0, 0, 1, true, null);
    engine3D.open3DModel("objects/Platform/pivotpoint.jsz", engine3D.pivot, 0, 0, 0.1, 0, 0, 1, false, null);
};

engine3D.open = function () {
    //landscape.select('hill');
    //landscape.select('valley');

    //engine3D.new();
    engine3D.groundHouse = new THREE.Object3D(); //Important to reset

    $.each(json.terrain, function () {
        //console.log(this);
        engine3D.open3DModel(this.file, engine3D.groundHouse, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });

    $.each(json.roof, function () {
        //console.log(this);
        engine3D.open3DModel(this.file, engine3D.roof, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });

    $.each(json.house, function () {
        //console.log(this);
        engine3D.open3DModel(this.file, engine3D.house, this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, null);
    });

    for (var i = 0; i < json.furniture.length; i++) {
        engine3D.newFloor(i);

        $.each(json.furniture[i], function () {
            var note = null;
            if (this.note !== undefined) note = this.note;
            if (this.file !== undefined) engine3D.open3DModel(this.file, scene3DFloorFurnitureContainer[i], this['position.x'], this['position.y'], this['position.z'], this['rotation.x'], this['rotation.y'], 1, true, note);
        });
    }
};