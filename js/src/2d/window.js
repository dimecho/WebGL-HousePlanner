var engine2D = window.engine2D || {};

engine2D.drawWindow = function (floor)
{
    if(scene2DWindowGroup[floor].children === undefined)
        return;

    scene2DWindowGroup[floor].visible = true;
    paper.project.layers.push(scene2DWindowGroup[floor]);
}

engine2D.makeWindow = function(floor,l,p,z,open,direction,file) {

	var group = new paper.Group();
	var path = new paper.Path();
    var guide = new paper.Path();
    var A = new paper.Group();
    var B = new paper.Group();

	path.moveTo(new paper.Point(0,0));
	path.lineTo(new paper.Point(l,0));
	path.strokeColor = '#000000';
	path.strokeWidth = 10;

    guide.moveTo(new paper.Point(0,0));
    guide.lineTo(new paper.Point(l,0));
    guide.strokeColor = '#ffff';
    guide.strokeWidth = 22;
    //guide.opacity = 0;

    group.addChild(guide);
	group.addChild(path);
    path.group = group;
    
	group.position = new paper.Point(p.x,p.y); //TODO: Fix this

    group.attach('mousedrag', function(event) {
        if(A.drag == true || B.drag == true)
            return;

        group.position = event.point;
        A.opacity = 0;
        B.opacity = 0;

        engine2D.snapObjectToWall(this,event.point);
    });
    
    group.angle = 0; //custom attribute!

    //group.visible = false; //draw on demand
    
    return group;
};
