var engine3D = window.engine3D || {};

engine3D.makeFloor = function () {
    
    if(scene2DWallGroup[FLOOR] !== undefined){

        console.log("3D Floor Generate " + scene2DWallGroup[FLOOR].children.length);

        scene3DFloorShapeContainer[FLOOR] = new THREE.Object3D();

        for(i = 0; i < scene2DWallGroup[FLOOR].children.length; i++)
        {
            var wall = scene2DWallGroup[FLOOR].children[i].children[0].children[0].segments; //inside a Group()
            console.log(wall);
            //if(i == 0)
            /*
            if (floorShape === null)
            {
                //Generate 3D Floor Shape
                floorShape = new THREE.Shape();
                floorShape.moveTo(x1, y1);
                floorShape.quadraticCurveTo(cx, cy, x2, y2);
            }else{
                if(x2 == corner.x && y2 == corner.y){
                    floorShape.quadraticCurveTo(cx, cy, x1,y1);
                    corner = {x:x1,y:y1};
                }else{
                    floorShape.quadraticCurveTo(cx, cy, x2,y2);
                    corner = {x:x2,y:y2};
                }
            }
            */

            /*
            var curve = new THREE.SplineCurve([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -100),
                new THREE.Vector3(100, 0, -100)
            ]);
            */
            //var curve = new THREE.QuadraticBezierCurve(new THREE.Vector2(x1,y1),new THREE.Vector2(cx,cy),new THREE.Vector2(x2,y2));
        }
    }
};

engine3D.triangulateUsingP2T = function (pts, holes) {
    
    var allpts = pts.slice(0);
    var shape = [];
    var geom = new THREE.Geometry();
    var lastPoint = pts[pts.length - 1];
    var threshold = 1e-3;
    for (var p = 0, pl = pts.length; p < pl; p++) {
        if (lastPoint.distanceTo(pts[p]) > threshold) shape.push(new poly2tri.Point(pts[p].x, pts[p].y));
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