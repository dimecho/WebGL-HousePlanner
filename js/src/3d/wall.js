var engine3D = window.engine3D || {};

engine3D.makeWalls = function () {
    
    //return;

    //https://www.mixeelabs.com/creator/tutorial:-advanced-geometries/edit

    //if(scene2DWallMesh[FLOOR].length == 0)
    //    return;

    for(var i = 0; i < scene2DWallGroup.length; i++)
    {
        if(scene2DWallGroup[i].children[0] !== undefined)
        {
            scene3DFloorWallContainer[i]    = new THREE.Object3D();
            //scene3DFloorDoorContainer[FLOOR]    = new THREE.Object3D();
            //scene3DFloorWindowContainer[FLOOR]  = new THREE.Object3D();

            console.log("3D Wall Generate [" + i + "] " + scene2DWallGroup[i].children.length);

            for (var a = 0; a < scene2DWallGroup[FLOOR].children.length; a++)
            {
                var wall = scene2DWallGroup[FLOOR].children[a].children[0].children[0];

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

                var material = new THREE.MeshLambertMaterial({
                    map: scene3DWallInteriorTextureDefault,
                    transparent: true,
                    opacity: 0.6,
                    //side: THREE.DoubleSide,
                    //wireframe: true
                });

                var mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -(90 * RADIAN); //extrusion happens in Z direction, we need the wall pointing UP
                mesh.position.y = 0;

                scene3DFloorWallContainer[FLOOR].add(mesh);

                //http://stackoverflow.com/questions/26272564/how-to-increase-the-thickness-of-the-extrude-geometry-along-x-and-z-axis-three
                /*
                var mesh_arr = [];
                for(var b = 0.2; b < 1; b++)
                {
                    //cloned mesh,add position to the cloning mesh
                    mesh_arr[b] = mesh.clone();
                    mesh_arr[b].position.set(b,b,b);
                    mesh_arr[b].updateMatrix();
                    scene3DFloorWallContainer[FLOOR].add(mesh_arr[b]);
                }
                */
            }
        }
    }
    /*
    for (var d = 0; d < scene2DDoorGroup[FLOOR].children.length; d++) {

        var door = scene2DDoorGroup[FLOOR].children[d].children[1];
        /
            var x = (result[0].item(0).x1/100) * 2 - 1;
            var y = 0;
            var z = -(result[0].item(0).y1/100) * 2 + 1;
            
            x = x-1.5;
            z = z-5.3;
           
            open3DModel(result[0].file, scene3DFloorDoorContainer, x, y, z, 0, a, 1.0, false, null);
        /

        /
        while (scene3DFloorDoorContainer.children.length == 0) {
            setTimeout(function(){}, 800);
        }
        /

        /
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
        /
    }
    //scene3D.add(scene3DFloorDoorContainer);
    */
}