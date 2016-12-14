var engine2D = window.engine2D || {};

engine2D.drawFloor = function(floor)
{
    if(engine2D.floor[floor].children[0] === undefined)
        return;
    
    engine2D.floor[floor].visible = true;
    scene2DLabelGroup[floor].visible = true;
    
    paper.project.layers.push(engine2D.floor[floor]);
    paper.project.layers.push(scene2DLabelGroup[floor]);

    engine2D.floor[floor].on('mousedown', engine2D.drawWall_onMouseDown);
    
    engine2D.calculateWallMeasureColor(floor);
};

engine2D.makeFloor = function(floor)
{
    if(scene2DWallGroup[floor].children[0] === undefined)
        return;
    
	console.log("2D Floor Generate [" + floor + "] " + scene2DWallGroup[floor].children.length);
    
    var shape = new paper.Path();
    shape.closed = true;

    //if(engine2D.floor[floor].children[0] !== undefined)
	//   shape = engine2D.floor[floor].children[0];
    
	var path = scene2DWallGroup[floor].children[0].children[0].children[0];
	var lastPoint = path.segments[0].point;
	shape.moveTo(lastPoint);

	for(var a = 0; a < scene2DWallGroup[floor].children.length; a++)
	{
		path = scene2DWallGroup[floor].children[a].children[4].children[0];
		//path.visible = false;
		//console.log("==>" + path.id);
		//console.log(path);

		for(var b = 0; b < scene2DWallGroup[floor].children.length; b++)
		{
			var path2 = scene2DWallGroup[floor].children[b].children[4].children[0];
			
			if(path.id != path2.id)
			{
				if(path.hitTest(path2.segments[0].point))
				{
					//console.log(lastPoint + "-" + path2.segments[1].point);
					shape.quadraticCurveTo(lastPoint, path2.segments[1].point);
					lastPoint = path2.segments[1].point;
					break;
				}
				/*
				else if(path.hitTest(path2.segments[1].point))
				{
					//console.log(lastPoint.point + "-" + path2.segments[0].point);
					shape.quadraticCurveTo(lastPoint, path2.segments[0].point);
					lastPoint = path2.segments[0].point;
					break;
				}
				*/
			}
		}
	}
   
	shape.fillColor = '#D8D8D8';

    engine2D.floor[floor].remove(); //clean previous view
	engine2D.floor[floor] = new paper.Group([shape]);
	
    //Texture the shape
    var canvas = document.createElement('canvas');
    canvas.width = shape.bounds.width;
    canvas.height = shape.bounds.height;
    var context = canvas.getContext('2d');
    var img = new Image();
    img.src = 'objects/FloorPlan/Default/4.png';
    img.onload = function() {
        context.fillStyle = context.createPattern(this,"repeat");
        context.fillRect(0, 0, shape.bounds.width, shape.bounds.height);
        context.fill();
		
		var raster = new paper.Raster(canvas, new paper.Point(shape.bounds.x,shape.bounds.y));
		raster.fitBounds(shape.bounds, true);
        raster.remove();
		
		engine2D.floor[floor] = new paper.Group([shape, raster]);
		engine2D.floor[floor].clipped = true;

        if(engine2D.draftPlan !== undefined)
            engine2D.floor[floor].opacity = 0.6;
    };

    shape.remove(); //clean from view
	//engine2D.floor[floor].visible = false; //draw on demand
    
};

engine2D.makeLabel = function (floor,label,size,x,y) {

	var text = new paper.PointText();
	text.content = label + '\n' + size;
	text.justification = 'center';
	text.fontSize = 28;
	text.position = new paper.Point(x,y);
    //text.visible = false; //draw on demand
    
    return text;
};
/*
engine2D.fillFloor = function(floor,shape) {
    //shape.quickCorner = new Array();
    var count = 1;
    
    //var obj = scene2DWallMesh[floor][0];
    //shape.path[0][1] = obj.item(0).path[0][1]; //x1
    //shape.path[0][2] = obj.item(0).path[0][2]; //y1
    //shape.count = scene2DWallMesh[floor].length;

    var corner = {x:0,y:0};

    for(var i=0; i < scene2DWallMesh[floor].length; i++)
    {
        var obj = scene2DWallMesh[floor][i];
        //shape.quickCorner.push(obj.id);
        
        //if(obj.edgeB) {
            //console.log("filling shape [" + i + "]" + obj.edgeA.left + ":" + obj.edgeA.top + " " + obj.edgeB.left + ":" + obj.edgeB.top);
            var v1 = {x:obj.item(0).path[0][1],y:obj.item(0).path[0][2]};
            var v2 = {x:obj.item(0).path[1][3],y:obj.item(0).path[1][4]};

            if(count == 1)
            {
                shape.path[0][1] = v1.x ; //obj.edgeA.left; //x1
                shape.path[0][2] = v1.y ; //obj.edgeA.top; //y1
            }

            shape.path[count][1] = obj.item(0).path[1][1]; //cx
            shape.path[count][2] = obj.item(0).path[1][2]; //cy

            //console.log(v1.x + ":" + v1.y + " " + v2.x + ":" + v2.y);
            if(v2.x == corner.x && v2.y == corner.y){
                //console.log("[" + count + "] reversed " + obj.id)
                v2=v1;
            }
            shape.path[count][3] = v2.x ; //obj.edgeB.left; //x2 
            shape.path[count][4] = v2.y ; //obj.edgeB.top; //y2
            corner = v2;
            count ++;
        //}
    }
};
*/