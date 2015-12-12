var engine3D = window.engine3D || {};

engine3D.makeFloor = function () {
    
    //if(scene2DWallGroup[FLOOR] !== undefined)
    if(scene2DWallGroup[FLOOR].children.length > 0)
    {
        console.log("3D Floor Generate " + scene2DWallGroup[FLOOR].children.length);

        /*
        var points = [];
        for(i = 0; i < scene2DFloorShape[FLOOR].children[0].segments.length; i++)
        {
            var p = scene2DFloorShape[FLOOR].children[0].segments[i].point;
            points.push(new THREE.Vector2(p.x,p.y));
        }
        console.log(points);
        var geometry = engine3D.triangulateUsingP2T(points);
        console.log(geometry);
        */

        scene3DFloorShapeContainer[FLOOR] = new THREE.Object3D();
        //scene3DCeilingShapeContainer[FLOOR] = new THREE.Object3D();

        var shape = new THREE.Shape();
        for(i = 0; i < scene2DFloorShape[FLOOR].children[0].segments.length; i++)
        {
            var p = scene2DFloorShape[FLOOR].children[0].segments[i].point;
            var x = (p.x/100) * 2 - 1;
            var y = -(p.y/100) * 2 + 1;
            //var cx = ((p.x + p.x)/2)/100 * 2 - 1;
            //var cy = -((p.y + p.y)/2)/100 * 2 + 1;
            x -= 13;
            y += 7;

            if (i === 0)
            {
                shape.moveTo(x, y);
            }else{
                //shape.quadraticCurveTo(cx, cy, p.x,p.y);
                shape.lineTo(x, y);
            }
        }

        var geometry = new THREE.ShapeGeometry(shape);
        var material = new THREE.MeshBasicMaterial();
        var texture = THREE.ImageUtils.loadTexture("objects/Platform/Textures/W23643.jpg");
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;          
        material.map = texture;
        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -(90 * RADIAN);
        mesh.position.y = 0.2;
        scene3DFloorShapeContainer[FLOOR].add(mesh);

        //scene3DCeilingShapeContainer[FLOOR].add(mesh);
    }
};

/*
engine3D.triangulateUsingP2T = function (pts, holes) {
    
    var pts = [
        new THREE.Vector2(100, 100),
        new THREE.Vector2(100, 300),
        new THREE.Vector2(300, 300),
        new THREE.Vector2(300, 100)
    ];
    
    var allpts = pts.slice(0);
    var shape = [];
    var geom = new THREE.Geometry();
    var lastPoint = pts[pts.length - 1];
    var threshold = 1e-3;
    for (var p = 0, pl = pts.length; p < pl; p++) {
        if (lastPoint.distanceTo(pts[p]) > threshold)
            shape.push(new poly2tri.Point(pts[p].x, pts[p].y));
        lastPoint = pts[p];
    }
    if (shape.length < 3) return;
    var swctx = new poly2tri.SweepContext(shape);
    for (var h in holes) {
        var aHole = holes[h];
        var newHole = [];
        for (var i in aHole) {
            newHole.push(new poly2tri.Point(aHole[i].x, aHole[i].y));
            allpts.push(aHole[i]);
        }
        swctx.AddHole(newHole);
    }
    var find;
    var findIndexForPt = function (pt) {
        find = new THREE.Vector2(pt.x, pt.y);
        var p;
        for (p = 0, pl = allpts.length; p < pl; p++)
            if (find.distanceToSquared(allpts[p]) === 0) return p;
        return -1;
    };
    poly2tri.sweep.Triangulate(swctx);
    var triangles = swctx.GetTriangles();
    var tr;
    var facesPts = [];
    for (var t in triangles) {
        tr = triangles[t];
        geom.faces.push(new THREE.Face3(findIndexForPt(tr.GetPoint(2)), findIndexForPt(tr.GetPoint(1)), findIndexForPt(tr.GetPoint(0))));
        geom.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)]);
    }
    geom.vertices = allpts;
    return geom;
};
*/