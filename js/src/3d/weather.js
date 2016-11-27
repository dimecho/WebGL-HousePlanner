var engine3D = window.engine3D || {};

engine3D.initSunlight = function() {

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

engine3D.setWeather = function ()
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
            texture = textureLoader.load('images/cloud.png');
            //texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            //texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            weatherSkyMaterial.uniforms.map.value = texture;
            weatherSkyCloudsMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
            scene3D.add(weatherSkyCloudsMesh);
        }

        if(settings.rainbow)
        {
            texture = textureLoader.load('images/rainbow.png');
            var materialRainbow = weatherSkyMaterial.clone();
            materialRainbow.uniforms = THREE.UniformsUtils.clone(weatherSkyMaterial.uniforms); //fix for three.js 82
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
            texture = textureLoader.load('images/cloud2.png');
            texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            weatherSkyMaterial.uniforms.map.value = texture;
            weatherSkyCloudsMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
            scene3D.add(weatherSkyCloudsMesh);
        }
    }
}

engine3D.setSky = function(set) {

    if(skyMesh.name != set)
    {
        var files = '0000';

        if(set == 'day'){
            files = settings.panorama_day;
        }else if(set == 'night'){
            files =  settings.panorama_night;
        }

        skyMesh = new THREE.Object3D();
        engine3D.buildPanorama(skyMesh, files, 75, 75, 75,"",null);
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

engine3D.setSkyEffects = function() {

    //http://mrdoob.com/lab/javascript/webgl/clouds/
    //http://gonchar.me/panorama/
    //engine3D.setSky("day");

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