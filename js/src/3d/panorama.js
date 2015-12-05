var engine3D = window.engine3D || {};

engine3D.initPanorama = function(id, files, W,H)
{
    scene3DPanorama = new THREE.Scene();
    camera3DPanorama = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    rendererPanorama = new THREE.WebGLRenderer({
        devicePixelRatio: window.devicePixelRatio || 1,
        antialias: false
    });

    rendererPanorama.setSize(window.innerWidth*W, window.innerHeight*H);
    document.getElementById(id).appendChild(rendererPanorama.domElement);

    //controls3DPanorama = new THREE.OrbitControls(camera3DPanorama, rendererPanorama.domElement);
    //controls3DPanorama.target = new THREE.Vector3(0, 0, 0);
    //controls3DPanorama.enabled = true;
    
    document.addEventListener( 'mousedown', onPanoramaMouseDown, false );
    document.addEventListener( 'mousewheel', onPanoramaMouseWheel, false );
    document.addEventListener( 'touchstart', onPanoramaTouchStart, false );
    document.addEventListener( 'touchmove', onPanoramaTouchMove, false );

    document.getElementById(id).appendChild(spinner);

    //mouse = new THREE.Vector2();
    //touch = new THREE.Vector2();
    //var scene = new THREE.Object3D();
    //engine3D.buildPanorama(scene,files, 512, 512);
    //scene3DPanorama.add(scene);

    engine3D.buildPanorama(scene3DPanorama,files, 1024, 1024, 1024, "_",null);

    document.getElementById(id).removeChild(spinner);

    $('#' + id).show();
    animatePanorama();

    //TODO: update onWindowResize();
}

engine3D.buildPanorama = function(container,files,X,Y,Z,preloader,mesh)
{
    if(container.children.length > 0)
        return;

    var sides = [
        'panoramas/' + files + '/' + preloader + 'right.jpg',
        'panoramas/' + files + '/' + preloader + 'left.jpg',
        'panoramas/' + files + '/' + preloader + 'top.jpg',
        'panoramas/' + files + '/' + preloader + 'bottom.jpg',
        'panoramas/' + files + '/' + preloader + 'front.jpg',
        'panoramas/' + files + '/' + preloader + 'back.jpg'
    ];
    //console.log(files + " " + preloader);

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
    
    //Low Resolution
    var sides = [
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('panoramas/' + files + '/_right.jpg'),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('panoramas/' + files + '/_left.jpg'),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
            map: textureLoader.load('panoramas/' + files + '/_top.jpg'),
            side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
          map: textureLoader.load('panoramas/' + files + '/_bottom.jpg'),
          side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
           map: textureLoader.load('panoramas/' + files + '/_front.jpg'),
           side: THREE.BackSide
        }),
        new THREE.MeshBasicMaterial({
           map: textureLoader.load('panoramas/' + files + '/_back.jpg'),
           side: THREE.BackSide
        }),
    ];
    var geometry = new THREE.BoxGeometry(X,Y,Z);
    //console.log(geometry);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(sides));

    container.add(mesh);

    //High Resolution
    textureLoader.load('panoramas/' + files + '/right.jpg', function (texture) { sides[0].map=texture; });
    textureLoader.load('panoramas/' + files + '/left.jpg', function (texture) { sides[1].map=texture; });
    textureLoader.load('panoramas/' + files + '/top.jpg', function (texture) { sides[2].map=texture; });
    textureLoader.load('panoramas/' + files + '/bottom.jpg', function (texture) { sides[3].map=texture; });
    textureLoader.load('panoramas/' + files + '/front.jpg', function (texture) { sides[4].map=texture; });
    textureLoader.load('panoramas/' + files + '/back.jpg', function (texture) {sides[5].map = texture;});
    
    /*
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.applyMatrix( new THREE.Matrix4().makeScale( 1, 1, 1 ) );
    var material = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( 'textures/2294472375_24a3b8ef46_o.jpg' )
    } );
    mesh = new THREE.Mesh( geometry, material );
    scene3DPanorama.add(mesh);
    */
}

function onPanoramaMouseDown( event ) {

    event.preventDefault();

    document.addEventListener( 'mousemove', onPanoramaMouseMove, false );
    document.addEventListener( 'mouseup', onPanoramaMouseUp, false );
}

function onPanoramaMouseMove( event ) {

    var movementX = event.movementX || event.mozMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || 0;

    mouse.x -= movementX * 0.1;
    mouse.y += movementY * 0.1;
}

function onPanoramaMouseUp( event ) {

    document.removeEventListener( 'mousemove', onPanoramaMouseMove );
    document.removeEventListener( 'mouseup', onPanoramaMouseUp );
}

function onPanoramaMouseWheel( event ) {

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
}

function onPanoramaTouchStart( event ) {

    event.preventDefault();

    var touches = event.touches[0];

    touch.x = touches.screenX;
    touch.y = touches.screenY;
}

function onPanoramaTouchMove( event ) {

    event.preventDefault();

    var touches = event.touches[ 0 ];

    mouse.x -= ( touches.screenX - touch.x ) * 0.1;
    mouse.y += ( touches.screenY - touch.y ) * 0.1;

    touch.x = touches.screenX;
    touch.y = touches.screenY;
}

function disposePanorama(id)
{
    if (rendererPanorama instanceof THREE.WebGLRenderer)
    {
        document.removeEventListener( 'mousedown', onPanoramaMouseDown, false );
        document.removeEventListener( 'mousewheel', onPanoramaMouseWheel, false );

        document.removeEventListener( 'touchstart', onPanoramaTouchStart, false );
        document.removeEventListener( 'touchmove', onPanoramaTouchMove, false );

        document.getElementById(id).removeChild(rendererPanorama.domElement);
    }
    $('#' + id).hide();

    rendererPanorama = null;
    camera3DPanorama = null;
    scene3DPanorama = null;
}