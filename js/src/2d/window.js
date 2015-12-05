var engine2D = window.engine2D || {};

engine2D.attachWindowsToWalls = function() {

    for (var d = 0; d < scene2DWindowGroup[FLOOR].children.length; d++) {

        var point = scene2DWindowGroup[FLOOR].children[d].children[1].segments; //inside a Group()
        var hitWallResult = scene2DWallGroup[FLOOR].hitTest(point[0].point); //TODO: make this midpoint check

        if (hitWallResult ) {
            hitWallResult.item.doors.push(scene2DDoorGroup[FLOOR].children[d]);
            hitWallResult.item.parent.parent.children[3].visible = false; //pivot point
            //console.log(hitWallResult.item);
        }
    }
};

engine2D.makeWindow = function(l,c,z,open,direction,file) {

	var group = new paper.Group();
	var path = new paper.Path();
	var guide = new paper.Path();
	var A = new paper.Group();
	var B = new paper.Group();
	var lineA = new paper.Path();
	var lineB = new paper.Path();

	path.moveTo(new paper.Point(0,0));
	path.lineTo(new paper.Point(l,0));

	guide.moveTo(new paper.Point(0,0));
	guide.lineTo(new paper.Point(l,0));
	guide.strokeColor = '#ffff';
	guide.strokeWidth = 22;
	//guide.opacity = 0;

	path.strokeColor = '#000000';
	path.strokeWidth = 10;

	lineA.moveTo(new paper.Point(10,-12));
	lineA.lineTo(new paper.Point(10,12));

	lineB.moveTo(new paper.Point(path.length-10,-12));
	lineB.lineTo(new paper.Point(path.length-10, 12));

	lineA.strokeColor = lineB.strokeColor = '#00CC33';
	lineA.strokeWidth = lineB.strokeWidth = 3;
	A.opacity = B.opacity = 0;

	var triA = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 12);
	var triB = new paper.Path.RegularPolygon(new paper.Point(path.length, 0), 3, 12);
	triA.rotate(30);
	triB.rotate(-30);
	triA.fillColor = triB.fillColor = '#00CC33';

	A.addChild(lineA);
	A.addChild(triA);
	B.addChild(lineB);
	B.addChild(triB);

	group.addChild(guide);
	group.addChild(path);
	group.addChild(A);
	group.addChild(B);
	path.group = group;

	group.position = new paper.Point(c.x,c.y); //TODO: Fix this
	paper.project.layers.push(group);
    
    return group;
};
