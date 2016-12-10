var engine3D = window.engine3D || {};

var weatherSkyGeometry;
var weatherSkyMaterial;
//var weatherRainbowMaterial;
var weatherSkyCloudsMesh;
var weatherSkyRainbowMesh;
//var weatherSkyDayMesh;
//var weatherSkyNightMesh;

engine3D.initSunlight = function()
{
    /*
    God Rays (Sunlight Effect)
    http://threejs.org/examples/webgl_sunlight_godrays.html
    */
    if(json.weather.sunlight)
    {
        var sunPosition = new THREE.Vector3( 0, 10, -10 );
        var materialDepth = new THREE.MeshDepthMaterial();
        var screenSpacePosition = new THREE.Vector3();

        sunlight.scene = new THREE.Scene();

        sunlight.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
        sunlight.camera.position.z = 50;

        sunlight.scene.add(sunlight.camera);

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
        sunlight.godrayGenUniforms = Object.assign({},godraysGenShader.uniforms); //THREE.UniformsUtils.clone(godraysGenShader.uniforms);
        sunlight.materialGodraysGenerate = new THREE.ShaderMaterial({
            uniforms: sunlight.godrayGenUniforms,
            vertexShader: godraysGenShader.vertexShader,
            fragmentShader: godraysGenShader.fragmentShader
        });
        
        var godraysCombineShader = THREE.ShaderGodRays.godrays_combine;
        sunlight.godrayCombineUniforms = Object.assign({},godraysCombineShader.uniforms); //THREE.UniformsUtils.clone(godraysCombineShader.uniforms);
        sunlight.materialGodraysCombine = new THREE.ShaderMaterial( {

            uniforms: sunlight.godrayCombineUniforms,
            vertexShader: godraysCombineShader.vertexShader,
            fragmentShader: godraysCombineShader.fragmentShader

        } );
        
        var godraysFakeSunShader = THREE.ShaderGodRays.godrays_fake_sun;
        sunlight.godraysFakeSunUniforms = Object.assign({},godraysFakeSunShader.uniforms); //THREE.UniformsUtils.clone(godraysFakeSunShader.uniforms);
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
};

engine3D.selectWeather = function()
{
    if (json.weather.atmosphere === "sunny") {

        json.weather.atmosphere = "snowy";
        //$('#menuWeatherText').html("Snowy");

    } else if (json.weather.atmosphere === "snowy") {

        json.weather.atmosphere = "rainy";
        //$('#menuWeatherText').html("Rainy");

    } else if (json.weather.atmosphere === "rainy") {

        json.weather.atmosphere = "sunny";
        //$('#menuWeatherText').html("Sunny");
    }
    engine3D.setWeather();
};

engine3D.setWeather = function()
{
    //particleWeather = new SPE.Group({});
    //engine3D.scene.remove(particleWeather.mesh);

    engine3D.initWeatherClouds();
    
    if (json.weather.atmosphere === "sunny") {

        //TODO: maybe add sun glare effect shader?

    } else if (json.weather.atmosphere === "snowy") {

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
        engine3D.scene.add(particleWeather.mesh);
        */

    } else if (json.weather.atmosphere === "rainy") {

        //engine = new ParticleEngine();
        //engine.setValues(weatherRainMesh);
        //engine.initialize();
    }

    engine3D.scene.remove(weatherSkyCloudsMesh);
    engine3D.scene.remove(weatherSkyRainbowMesh);

    if (json.weather.day) {

        //engine3D.scene.add(weatherSkyDayMesh);

        if(json.weather.clouds)
        {
            texture = engine3D.textureLoader.load('images/cloud.png');
            //texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            //texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            weatherSkyMaterial.uniforms.map.value = texture;
            weatherSkyCloudsMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
            engine3D.scene.add(weatherSkyCloudsMesh);
        }

        if(json.weather.rainbow)
        {
            texture = engine3D.textureLoader.load('images/rainbow.png');
            /*
            var uniforms = Object.assign( {},  weatherSkyMaterial.uniforms ); // r.83dev
            var materialRainbow = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: weatherSkyMaterial.vertexShader,
                fragmentShader: weatherSkyMaterial.fragmentShader,
                depthWrite: false,
                depthTest: false,
                transparent: true
            });
            */
            var materialRainbow = weatherSkyMaterial.clone();
            //materialRainbow.uniforms = Object.assign({"map": {type: "t", value: texture}}, weatherSkyMaterial.uniforms); //r.82dev
            materialRainbow.uniforms = THREE.UniformsUtils.clone(weatherSkyMaterial.uniforms);
            materialRainbow.uniforms.map.value = texture;

            geometry = new THREE.Geometry();
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(18, 18));
            plane.position.x = getRandomInt(1, 15);
            plane.position.y = getRandomInt(5, 8);
            plane.position.z = -2;
            plane.updateMatrix();
            geometry.merge(plane.geometry, plane.matrix);
            weatherSkyRainbowMesh = new THREE.Mesh(geometry, materialRainbow);

            engine3D.scene.add(weatherSkyRainbowMesh);
        }
    }
    else
    {
        if(json.weather.clouds)
        {
            texture = engine3D.textureLoader.load('images/cloud2.png');
            texture.magFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            texture.minFilter = THREE.LinearFilter; //THREE.LinearMipMapLinearFilter;
            weatherSkyMaterial.uniforms.map.value = texture;
            weatherSkyCloudsMesh = new THREE.Mesh(weatherSkyGeometry, weatherSkyMaterial);
            engine3D.scene.add(weatherSkyCloudsMesh);
        }
    }
};

engine3D.initWeatherClouds = function()
{
    if(weatherSkyMaterial === undefined)
    {
        /* 
        =======================
        Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check http://xhr.spec.whatwg.org/.
        =======================
        */
        /*
        $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
            options.async = false;
        });
        */
        //=====================

        weatherSkyCloudsMesh =  new THREE.Mesh();
        weatherSkyRainbowMesh = new THREE.Mesh();

        var cloud_vertex_data = $.ajax({ url:"shaders/clouds.vertex.fx", async:false}).responseText;
        var cloud_fragment_data = $.ajax({ url:"shaders/clouds.fragment.fx", async:false}).responseText;

        // engine3D.ajaxFile("shaders/clouds.fragment.fx");

        var fog = new THREE.Fog(0x4584b4, -100, 1000);
        weatherSkyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "map": {
                    type: "t",
                    //value: texture
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
            vertexShader: cloud_vertex_data,
            fragmentShader: cloud_fragment_data,
            depthWrite: false,
            depthTest: false,
            transparent: true
        });

        weatherSkyGeometry = new THREE.Geometry();

        var plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4));
        for (var i = 0; i < 20; i++) 
        {
            plane.position.x = getRandomInt(-20, 20);
            plane.position.y = getRandomInt(5.5, 10);
            plane.position.z = i;
            plane.rotation.z = getRandomInt(5, 10);
            plane.scale.x = plane.scale.y = getRandomInt(0.5, 1);
            plane.updateMatrix();
            weatherSkyGeometry.merge(plane.geometry, plane.matrix);
        }
    }
};

engine3D.setDay = function(set)
{
    if(set !== undefined)
        json.weather.day = set;

    var files = '2056';
    
    if(json.weather.day === true){
        files = json.settings.panorama_day;
    }else if (json.weather.day === false){
        files = json.settings.panorama_night;
    }

    //console.log("Set Day " + json.weather.day + ":" + files);

    if(engine3D.skyHouse.name != files)
    {
        //console.log(settings);
        
        engine3D.buildPanorama(engine3D.skyHouse, files, 75, 75, 75,"",null);
        engine3D.skyHouse.position.y = 5;
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
            
            engine3D.skyHouse = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), material);
            engine3D.skyHouse.position.y = 5;
        }else{
            engine3D.skyHouse = new THREE.Mesh(new THREE.BoxGeometry(60, 60, 60), material);
            engine3D.skyHouse.position.y = 25;
        }
        */

        //skyMaterial.needsUpdate = true;
        //engine3D.scene.add(engine3D.skyHouse);

        engine3D.skyHouse.name = files;
    }
};

engine3D.setSkyEffects = function()
{
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
    engine3D.scene.add(skyNightMesh);
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
};