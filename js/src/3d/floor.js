var engine3D = window.engine3D || {};

engine3D.makeFloor = function () {

    var radians = Math.PI / 180;

    for (var i = 0; i < engine2D.floor.length; i++) {
        if (engine2D.floor[i].children[0] !== undefined) {
            console.log("3D Floor Generate [" + i + "] " + scene2DWallGroup[i].children.length);

            scene3DFloorShapeContainer[i] = new THREE.Object3D();
            scene3DCeilingShapeContainer[i] = new THREE.Object3D();

            var h = scene2DWallGroup[i].children[0].h;
            var shape = new THREE.Shape();

            for (a = 0; a < engine2D.floor[i].children[0].segments.length; a++) {
                var p = engine2D.floor[i].children[0].segments[a].point;
                var x = p.x / 100 * 2 - 1;
                var y = -(p.y / 100) * 2 + 1;
                //var cx = ((p.x + p.x)/2)/100 * 2 - 1;
                //var cy = -((p.y + p.y)/2)/100 * 2 + 1;
                x -= 13;
                y += 7;

                if (a === 0) {
                    shape.moveTo(x, y);
                } else {
                    //shape.quadraticCurveTo(cx, cy, p.x,p.y);
                    shape.lineTo(x, y);
                }
            }

            //Floor
            var geometry = new THREE.ShapeGeometry(shape);
            var material = new THREE.MeshBasicMaterial();
            var texture = engine3D.textureLoader.load(json.floor[i].texture);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            material.map = texture;
            //material.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -(90 * radians);
            //mesh.position.y = 0.1 + (offset[i] * h);
            scene3DFloorShapeContainer[i].add(mesh);
            //scene3DFloorShapeContainer[i].position.y = 0.1;

            //Ceiling
            var texture2 = engine3D.textureLoader.load(json.ceiling[i].texture);
            texture2.wrapS = THREE.RepeatWrapping;
            texture2.wrapT = THREE.RepeatWrapping;
            var material2 = new THREE.MeshBasicMaterial();
            material2.map = texture2;
            material2.side = THREE.BackSide;
            var mesh2 = mesh.clone();
            mesh2.material = material2;
            //mesh2.position.y = h; //TODO: Dynamic height
            scene3DCeilingShapeContainer[i].add(mesh2);

            //===================================================
            //Subtracting Geometry from groundfor Basement stairs
            //===================================================
            /*
            if(i == 0) //if(i == 1)
            {
                var geometry = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {amount: -2, bevelEnabled: false}));
                geometry.rotation.x = -(90 * radians);
                //geometry.position.y = 0.5;
                var floorBSP = new ThreeBSP(geometry);
                 scene3DFloorShapeContainer[i].add(geometry); //DEBUG
                 engine3D._groundHouse.traverse (function (mesh)
                {
                    if (mesh instanceof THREE.Mesh)
                    {
                        //console.log(mesh);
                        var groundBSP = new ThreeBSP(mesh); //new ThreeBSP(mesh, {timeout: 3000});
                        //var subtractBSP = groundBSP.subtract(floorBSP);
                        var subtractBSP = floorBSP.subtract(groundBSP);
                        var result = subtractBSP.toMesh();
                        result.geometry.computeVertexNormals();
                        mesh.geometry = result.geometry;
                        //mesh.geometry.computeBoundingBox();
                        //console.log(result.geometry);
                    }
                });
                engine3D.groundHouse.visible = false;
                //engine3D.scene.remove(engine3D.groundHouse); //DEBUG
                engine3D._groundHouse.position.z = -10; //DEBUG
                engine3D.scene.add(engine3D._groundHouse);
            }
            */
        }
    }
};