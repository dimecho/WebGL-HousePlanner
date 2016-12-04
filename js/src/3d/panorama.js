var engine3D = window.engine3D || {};

var rendererPanorama;
var scene3DPanorama;
var camera3DPanorama;
var controls3DPanorama;

engine3D.initPanorama = function(id, files, W,H)
{
    $(id).show();
    $(id).append(spinner);

    scene3DPanorama = new THREE.Scene();
    camera3DPanorama = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    rendererPanorama = new THREE.WebGLRenderer({
        //devicePixelRatio: window.devicePixelRatio || 1,
        antialias: false
    });
    rendererPanorama.setSize(window.innerWidth*W, window.innerHeight*H);

    $(id).append(rendererPanorama.domElement);

    controls3DPanorama = new THREE.OrbitControls(camera3DPanorama, rendererPanorama.domElement);
    
    controls3DPanorama.enableDamping = true;
    controls3DPanorama.dampingFactor = 0.25;
    controls3DPanorama.enableZoom = false;
    
    controls3DPanorama.movementSpeed = 5;
    controls3DPanorama.lookSpeed = 0.15;
    controls3DPanorama.noFly = true;
    controls3DPanorama.lookVertical = false;
    controls3DPanorama.activeLook = true; //enable later, otherwise view jumps
    controls3DPanorama.lon = -90;
    controls3DPanorama.lat = 0;
    controls3DPanorama.enabled = false;

    $(id).mousedown(function() {
        controls3DPanorama.enabled = true;
    });

    $(id).mouseup(function() {
        controls3DPanorama.enabled = false;
    });
    
    engine3D.buildPanorama(scene3DPanorama,files, 1024, 1024, 1024, "_", null);
    
    engine3D.animatePanorama();
    
    //window.addEventListener( 'resize', onPanoramaWindowResize, false );
};

engine3D.animatePanorama = function()
{
    if (rendererPanorama instanceof THREE.WebGLRenderer)
    {
        requestAnimationID = window.requestAnimationFrame(engine3D.animatePanorama);

        if(controls3DPanorama.enabled){
            controls3DPanorama.update();
        }else{
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
        }
        rendererPanorama.render(scene3DPanorama, camera3DPanorama);
    }
    else
    {
        engine3D.animate();
    }
};

engine3D.cubePanoramaImages = function(files,preloader)
{
    var img = [
        'panoramas/' + files + '/' + preloader + 'right.jpg',
        'panoramas/' + files + '/' + preloader + 'left.jpg',
        'panoramas/' + files + '/' + preloader + 'top.jpg',
        'panoramas/' + files + '/' + preloader + 'bottom.jpg',
        'panoramas/' + files + '/' + preloader + 'front.jpg',
        'panoramas/' + files + '/' + preloader + 'back.jpg'
    ];
    return img;
};

engine3D.buildPanorama = function(container,files,X,Y,Z,preloader,mesh)
{
    //if(container.children.length > 0)
    //    return;
    
    console.log("Build Panorama :" + files);
    
    //scene3D.remove(container);

    /*
    var cubemap = THREE.ImageUtils.loadTextureCube(sides);
    cubemap.minFilter = THREE.LinearFilter;
    //cubemap.format = THREE.RGBFormat;

    var shader = THREE.ShaderLib['cube'];
    var skyBoxMaterial = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        //uniforms: uniforms,
        uniforms: {
            "tCube": { type: "t", value: cubemap },
            "tFlip": { type: "f", value: -1 }
        },
        depthWrite: false,
        side: THREE.BackSide
    });
    var skybox = new THREE.Mesh(
        new THREE.CubeGeometry(X, Y, Z),
        skyBoxMaterial
    );

    if(!(mesh instanceof THREE.Mesh))
        container.remove(mesh);

    container.add(skybox);

    if(preloader === "_") //High Resolution
        engine3D.buildPanorama(container,files,X,Y,Z,"",skybox);
    */

    var img = engine3D.cubePanoramaImages(files,preloader);
    
    //Low Resolution
    var sides = [
        new THREE.MeshBasicMaterial({
            map: engine3D.textureLoader.load(img[0]),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: engine3D.textureLoader.load(img[1]),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: engine3D.textureLoader.load(img[2]),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: engine3D.textureLoader.load(img[3]),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: engine3D.textureLoader.load(img[4]),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: engine3D.textureLoader.load(img[5]),
            side: THREE.BackSide
        }),
    ];

    var geometry = new THREE.BoxGeometry(X,Y,Z);
    var mesh = new THREE.Mesh(geometry, new THREE.MultiMaterial(sides));

    if(preloader !== "")
    {
        spinner.remove();

        img = engine3D.cubePanoramaImages(files,"");

        engine3D.textureLoader.load(img[0], function (texture) { sides[0].map = texture; });
        engine3D.textureLoader.load(img[1], function (texture) { sides[1].map = texture; });
        engine3D.textureLoader.load(img[2], function (texture) { sides[2].map = texture; });
        engine3D.textureLoader.load(img[3], function (texture) { sides[3].map = texture; });
        engine3D.textureLoader.load(img[4], function (texture) { sides[4].map = texture; });
        engine3D.textureLoader.load(img[5], function (texture) { sides[5].map = texture; });
        //for (var i = 0; i <= 5; i++)
        //    engine3D.textureLoader.load(img[i], function (texture) { sides[i].map = texture; });
    }

    /*
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( 1, 1, 1 ) );
    var material = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( 'textures/2294472375_24a3b8ef46_o.jpg' )
    } );
    mesh = new THREE.Mesh( geometry, material );
    scene3DPanorama.add(mesh);
    */

    container.add(mesh);
};

/*
function onPanoramaMouseMove(event)
{   
    var movementX = event.movementX || event.mozMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || 0;

    mouse.x -= movementX * 0.1;
    mouse.y += movementY * 0.1;
};

function onPanoramaMouseWheel(event)
{
    if (event.wheelDeltaY)
    {
        camera3DPanorama.fov -= event.wheelDeltaY * 0.05;
    }
    else if (event.wheelDelta)  // Opera / Explorer 9
    {
        camera3DPanorama.fov -= event.wheelDelta * 0.05;
    }
    else if (event.detail) // Firefox
    {
        camera3DPanorama.fov += event.detail * 1.0;
    }

    camera3DPanorama.updateProjectionMatrix();
};

function onPanoramaTouchStart(event)
{
    //event.preventDefault();

    var touches = event.touches[0];

    touch.x = touches.screenX;
    touch.y = touches.screenY;
};

function onPanoramaTouchMove(event)
{
    //event.preventDefault();

    var touches = event.touches[ 0 ];

    mouse.x -= ( touches.screenX - touch.x ) * 0.1;
    mouse.y += ( touches.screenY - touch.y ) * 0.1;

    touch.x = touches.screenX;
    touch.y = touches.screenY;
};
*/

function onPanoramaWindowResize()
{
    camera3DPanorama.aspect = window.innerWidth / window.innerHeight;
    camera3DPanorama.updateProjectionMatrix();
    rendererPanorama.setSize( window.innerWidth, window.innerHeight );
};

engine3D.disposePanorama = function(id)
{
    $(id).hide();
    $(id).empty();

    rendererPanorama = null;
    //camera3DPanorama = null;
    scene3DPanorama = null;
    controls3DPanorama = null;
};