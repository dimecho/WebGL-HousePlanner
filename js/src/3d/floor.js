var engine3D = window.engine3D || {};

engine3D.makeFloor = function () {
    
    if(scene2DWallGroup[FLOOR] != undefined)
    {
        console.log("3D Floor Generate " + scene2DWallGroup[FLOOR].children.length);

        scene3DFloorShapeContainer[FLOOR] = new THREE.Object3D();
        scene3DFloorDoorContainer = new THREE.Object3D();
        scene3DFloorWindowContainer = new THREE.Object3D();

        for(i = 0; i < scene2DWallGroup[FLOOR].children.length; i++)
        {
            var wall = scene2DWallGroup[FLOOR].children[i].children[0].children[0].segments; //inside a Group()
            console.log(wall);
            //if(i == 0)
        }
    }
}