var engine2D = window.engine2D || {};

engine2D.makeFloor = function () {

    if(scene2DWallGroup[FLOOR] !== undefined)
    {
        if(scene2DWallGroup[FLOOR].children.length > 0)
        {
    		console.log("2D Floor Generate " + scene2DWallGroup[FLOOR].children.length);

    		var shape = new paper.Path();
    		shape.fillColor = 'green';
    		shape.closed = true;
    		//shape.opacity = 0.5;

    		/*
    		var pointFrom;
    		var pointTo;
    		var l = scene2DWallPointGroup[FLOOR].children.length;
    		for(i = 0; i < l; i++){
    			pointFrom = scene2DWallPointGroup[FLOOR].children[i].children[2];
    			//console.log(pointFrom.segments[0].point);
    			if(i == 0)
    				shape.moveTo(pointFrom.segments[0].point);
    			if((i + 1) < l) //make sure next point exists
    				pointTo = scene2DWallPointGroup[FLOOR].children[i+1].children[2];
    			shape.quadraticCurveTo(pointFrom.segments[0].point, pointTo.segments[0].point);
    		}
    		*/

    		var path = scene2DWallGroup[FLOOR].children[0].children[0].children[0];
    		var lastPoint = path.segments[0].point;
    		shape.moveTo(lastPoint);

    		for(i = 0; i < scene2DWallGroup[FLOOR].children.length; i++)
    		{
    			path = scene2DWallGroup[FLOOR].children[i].children[4].children[0];
    			//path.visible = false;
    			//console.log("==>" + path.id);
    			//console.log(path);

    			for(x = 0; x < scene2DWallGroup[FLOOR].children.length; x++)
    			{
    				var path2 = scene2DWallGroup[FLOOR].children[x].children[4].children[0];
    				
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
    		
    		//if(canvas2D != undefined) {

    			var canvas = document.createElement('canvas');
    			canvas.width = shape.bounds.width;
    			canvas.height = shape.bounds.height;
    			var context = canvas.getContext('2d');
    			var img = new Image();
    			img.src = '../objects/FloorPlan/Default/4.png';
    			img.onload = function() {
    				context.fillStyle = context.createPattern(this,"repeat");
    				context.fillRect(0, 0, shape.bounds.width, shape.bounds.height);
    				context.fill();
    			};
    			var raster = new paper.Raster(canvas, new paper.Point(shape.bounds.x,shape.bounds.y));
    			raster.fitBounds(shape.bounds, true);
    			scene2DFloorShape = new paper.Group([shape, raster]);
    			scene2DFloorShape.clipped = true;
    			canvas2D.addChild(scene2DFloorShape);
    		//}

    		engine2D.calculateWallMeasureColor();
        }
    }
};

engine2D.makeLabel = function (label,size,x,y) {

	var text = new paper.PointText();
	text.content = label + '\n' + size;
	text.justification = 'center';
	text.fontSize = 28;
	text.position = new paper.Point(x,y);

	paper.project.layers.push(text);
    
    return text;
};

engine2D.fillFloor = function(shape) {
    //shape.quickCorner = new Array();
    var count = 1;
    
    //var obj = scene2DWallMesh[FLOOR][0];
    //shape.path[0][1] = obj.item(0).path[0][1]; //x1
    //shape.path[0][2] = obj.item(0).path[0][2]; //y1
    //shape.count = scene2DWallMesh[FLOOR].length;

    var corner = {x:0,y:0};

    for(i=0; i<scene2DWallMesh[FLOOR].length; i++)
    {
        var obj = scene2DWallMesh[FLOOR][i];
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