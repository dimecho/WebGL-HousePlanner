var engine3D = window.engine3D || {};

engine3D.makeWalls = function () {
    
    //return;

    //https://www.mixeelabs.com/creator/tutorial:-advanced-geometries/edit

    //if(scene2DWallMesh[FLOOR].length == 0)
    //    return;

    scene3DFloorWallContainer[FLOOR]    = new THREE.Object3D();
    //scene3DFloorDoorContainer[FLOOR]    = new THREE.Object3D();
    //scene3DFloorWindowContainer[FLOOR]  = new THREE.Object3D();
    
    for (var i = 0; i < scene2DWallGroup[FLOOR].children.length; i++)
    {
        var wall = scene2DWallGroup[FLOOR].children[i].children[0].children[0];

        console.log(wall);
        
        var x1 = (wall.segments[0].point.x/100) * 2 - 1;
        var y1 = -(wall.segments[0].point.y/100) * 2 + 1;
        var cx = ((wall.segments[0].point.x + wall.segments[1].point.x)/2)/100 * 2 - 1;
        var cy = -((wall.segments[0].point.y + wall.segments[1].point.y)/2)/100 * 2 + 1;
        var x2 = (wall.segments[1].point.x/100) * 2 - 1;
        var y2 = -(wall.segments[1].point.y/100) * 2 + 1;
        //var a = Math.atan2(y1-y2, x1-x2) * 180 / Math.PI - 180;

        //3D Adjustments
        x1 = Math.round(x1-13);
        y1 = Math.round(y1+7);
        cx = Math.round(cx-13);
        cy = Math.round(cy+7);
        x2 = Math.round(x2-13);
        y2 = Math.round(y2+7);

        console.log("x1:" + x1 + " y1:" + y1 + " x2:" + x2 + " y2:" + y2 + " cx:" + cx + " cy:" + cy)
        
        var wallShape = new THREE.Shape();
        wallShape.moveTo(x1, y1);
        wallShape.quadraticCurveTo(cx, cy, x2, y2);
        wallShape.moveTo(x2, y2);
        wallShape.quadraticCurveTo(cx, cy, x1, y1);

        var extrudeSettings = {
            amount: 4,
            //steps: 64,
            bevelEnabled: false,
            //bevelThickness: 5,
            //bevelSize: 0,
            //extrudePath: curve
        }; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5

        var geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
        geometry.computeBoundingBox();
        

        //scene3DWallInteriorTextureDefault.repeat.set(12, 12);
        //scene3DWallInteriorTextureDefault.anisotropy = 2;
        /*
        var scene3DWallMaterial = new THREE.MeshBasicMaterial({
            map: scene3DWallInteriorTextureDefault,
            //wireframe: true
        });
        */

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

        scene3DFloorWallContainer[FLOOR].add(mesh);

        //http://stackoverflow.com/questions/26272564/how-to-increase-the-thickness-of-the-extrude-geometry-along-x-and-z-axis-three
        /*
        var mesh_arr = [];
        for(var i = 0.2; i < 1; i++)
        {
            //cloned mesh,add position to the cloning mesh
            mesh_arr[i] = mesh.clone();
            mesh_arr[i].position.set(i,i,i);
            mesh_arr[i].updateMatrix();
            scene3DFloorWallContainer[FLOOR].add(mesh_arr[i]);
        }
        */
    }

    for (var d = 0; d < scene2DDoorGroup[FLOOR].children.length; d++) {

        var door = scene2DDoorGroup[FLOOR].children[d].children[1];
        /*
            var x = (result[0].item(0).x1/100) * 2 - 1;
            var y = 0;
            var z = -(result[0].item(0).y1/100) * 2 + 1;
            
            x = x-1.5;
            z = z-5.3;
           
            open3DModel(result[0].file, scene3DFloorDoorContainer, x, y, z, 0, a, 1.0, false, null);
        */

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

    //scene3D.add(scene3DFloorDoorContainer);

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

    /*
    //if (floorShape != null)
    //{
        /
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        texture = new THREE.Texture(canvas);
        /
        texture = new THREE.ImageUtils.loadTexture('objects/Platform/Textures/W23643.jpg');
        //texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        //texture.minFilter = THREE.NearestFilter;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
        //texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        //texture.repeat.set(4, 4);
        texture.repeat.set(0.4, 0.4);
        texture.offset.set(0.4, 0.4);
        /
        var img = new Image();
        img.src = 'objects/Platform/Textures/W23643.jpg';
        img.style.width = '50%'
        img.style.height = 'auto'
        img.onload = function() {
            //context.drawImage(img,0,0);
            //context.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width/6, img.height/6);
            texture.needsUpdate = true;
        }
        /
        var uvGenerator = THREE.ExtrudeGeometry.WorldUVGenerator;
        //uvGenerator.uRepeat = 4;
        geometry = floorShape.extrude({amount: 0.1, 
            bevelEnabled: false,
            uvGenerator: uvGenerator
        });

        /
        var uvs = [];
        uvs.push( new THREE.Vector2( 0.0, 0.0 ) );
        uvs.push( new THREE.Vector2( 1.0, 0.0 ) );
        uvs.push( new THREE.Vector2( 1.0, 1.0 ) );
        uvs.push( new THREE.Vector2( 0.0, 1.0 ) );
        geometry.faceVertexUvs[0].push([ uvs[0], uvs[1], uvs[2]] );
        /

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
        /
        mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true,
        })]);
        /
        mesh.rotation.x = -(90 * RADIAN); //Horizontal Flip
        mesh.position.y = 0;
        //mesh.overdraw = true;
        mesh.receiveShadow = true;
        //mesh.scale.set(4, 4, 1 );

        scene3DFloorShapeContainer[FLOOR].add(mesh);
        //scene3DFloorShapeContainer[FLOOR].children[0] = mesh;
    //}

    scene3D.add(scene3DFloorShapeContainer[FLOOR]);
    */
}