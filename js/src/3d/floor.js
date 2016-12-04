var engine3D = window.engine3D || {};

engine3D.makeFloor = function () {

    for(var i = 0; i < scene2DFloorShape.length; i++)
    {
        if(scene2DFloorShape[i].children[0] !== undefined)
        {
            console.log("3D Floor Generate [" + i + "] " + scene2DWallGroup[i].children.length);

            scene3DFloorShapeContainer[i] = new THREE.Object3D();
            scene3DCeilingShapeContainer[i] = new THREE.Object3D();

            var h = scene2DWallGroup[i].children[0].h;
            var shape = new THREE.Shape();

            for(a = 0; a < scene2DFloorShape[i].children[0].segments.length; a++)
            {
                var p = scene2DFloorShape[i].children[0].segments[a].point;
                var x = (p.x/100) * 2 - 1;
                var y = -(p.y/100) * 2 + 1;
                //var cx = ((p.x + p.x)/2)/100 * 2 - 1;
                //var cy = -((p.y + p.y)/2)/100 * 2 + 1;
                x -= 13;
                y += 7;

                if (a === 0)
                {
                    shape.moveTo(x, y);
                }else{
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
            mesh.rotation.x = -(90 * RADIAN);
            //mesh.position.y = 0.1 + (offset[i] * h);
            scene3DFloorShapeContainer[i].add(mesh);

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

            if(i == 0) //if(i == 1)
            {

                var geometry = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {amount: -2, bevelEnabled: false}));
                geometry.rotation.x = -(90 * RADIAN);
                //geometry.position.y = 0.5;
                var floorBSP = new ThreeBSP(geometry);

                scene3DFloorShapeContainer[i].add(geometry); //DEBUG

                _scene3DHouseGroundContainer.traverse (function (mesh)
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
                scene3DHouseGroundContainer.visible= false;
                //scene3D.remove(scene3DHouseGroundContainer); //DEBUG
                _scene3DHouseGroundContainer.position.z = -10; //DEBUG
                scene3D.add(_scene3DHouseGroundContainer);

                
            }
        }
    }
};
