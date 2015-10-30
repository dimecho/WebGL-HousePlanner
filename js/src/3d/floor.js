var engine3D = window.engine3D || {};

engine3D.makeFloor = function () {
    
    if(scene2DWallGroup[FLOOR] != undefined){

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
}