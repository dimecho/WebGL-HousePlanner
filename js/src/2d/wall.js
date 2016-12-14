var engine2D = window.engine2D || {};
//var isDragging = false;

//=========================================
var drawWall = {
    radius: 4,
    tolerance: 20,
    handle: null,
    path: null,
    curPoint: null,
    prevPoint: null,
    curHandleSeg: null
};

engine2D.drawWall = function(floor)
{
    if(scene2DWallGroup[floor].children[0] === undefined)
        return;
    //var min = drawWall.radius * 2;
	//if (drawWall.tolerance < min) drawWall.tolerance = min;
	//	drawWall.handle = drawWall.radius * paper.Numerical.KAPPA;
    
    for(var i = 0; i < scene2DWallGroup[floor].children.length; i++)
    {
        scene2DWallGroup[floor].children[i].visible = true;
    }
    
    engine2D.calculateWallCorners(floor);

    paper.project.layers.push(scene2DWallGroup[floor]);
    paper.project.layers.push(scene2DWallPointGroup[floor]);

    //scene2DWallGroup[floor].on('mousedown', engine2D.drawWall_onMouseDown);
	engine2D.canvas.on('mousedown', engine2D.drawWall_onMouseDown);
};

engine2D.drawWall_onMouseDown = function(event)
{
    //event.preventDefault();

    this.on('mouseup', engine2D.drawWall_onMouseUp);
    this.on('mousedrag', engine2D.drawWall_onMouseDrag);

    drawWall.path = new paper.Path({
        segments: [event.point, event.point],
        strokeColor: '#ff5733',
        strokeWidth: 10,
        strokeCap: 'round'
    });
    drawWall.prevPoint = drawWall.path.firstSegment.point;
    drawWall.curPoint = drawWall.path.lastSegment.point;
    drawWall.curHandleSeg = null;
    drawWall.path.on('mouseup', engine2D.drawWall_onMouseUp);

    //isDragging = true;

    paper.project.layers.push(drawWall.path);
};

engine2D.drawWall_onMouseUp = function(event)
{
    //event.preventDefault();

    this.off('mouseup', engine2D.drawWall_onMouseUp);
    this.off('mousedrag', engine2D.drawWall_onMouseDrag);
    drawWall.path.off('mouseup', engine2D.drawWall_onMouseUp);
    
    for (var s = 0; s < drawWall.path.segments.length; s+=2)
    {
        var x = drawWall.path.segments[s].point;
        var y = drawWall.path.segments[s+1].point;

        console.log("Wall draw Segment " + x + ":" + y);
        
        var path = new paper.Path({segments:[x, y]});
		var wall;
		var hitResult;
		
        for (var i = 0; i < scene2DWallGroup[engineGUI.floor].children.length; i++)
        {
            wall = scene2DWallGroup[engineGUI.floor].children[i]; //inside a Group()
            hitResult = wall.children[4].children[0].getIntersections(path);
            if(hitResult.length > 0)
            {
                break; //TODO: do this for multiple walls
            }
        }
    
        if(hitResult.length > 0)
        {
			for (var h = 0; h < hitResult.length; h++)
			{
				console.log("Convert to wall Path + Attach " + hitResult[h].intersection.point);
				
				engine2D.splitWall(wall, hitResult[h]);
			}
			
        }else{
            console.log("Convert to wall Path");
        }
    }

    drawWall.path.visible = false;
    drawWall.path.remove();

    //isDragging = false;
};

engine2D.drawWall_onMouseDrag = function(event)
{
    //event.preventDefault();

    var point = event.point;

    //var diff = (point - prevPoint).abs();
    var x = point.x - drawWall.prevPoint.x;
    var y = point.y - drawWall.prevPoint.y;
    var diff = new paper.Point(x, y).abs();

    if (diff.x < diff.y) {
        drawWall.curPoint.x = drawWall.prevPoint.x;
        drawWall.curPoint.y = point.y;
    } else {
        drawWall.curPoint.x = point.x;
        drawWall.curPoint.y = drawWall.prevPoint.y;
    }
    //var normal = curPoint - prevPoint;
    x = drawWall.curPoint.x - drawWall.prevPoint.x;
    y = drawWall.curPoint.y - drawWall.prevPoint.y;
    var normal = new paper.Point(x, y);

    normal.length = 1;
    if (drawWall.curHandleSeg) {
        //curHandleSeg.point = prevPoint + (normal * drawWall.radius);
        x = drawWall.prevPoint.x + (normal.x * drawWall.radius);
        y = drawWall.prevPoint.y + (normal.y * drawWall.radius);
        drawWall.curHandleSeg.point = new paper.Point(x, y);

        //curHandleSeg.handleIn = normal * -drawWall.handle;
        x = normal.x * -drawWall.handle;
        y = normal.y * -drawWall.handle;
        drawWall.curHandleSeg.handleIn = new paper.Point(x, y);
    }
    var minDiff = Math.min(diff.x, diff.y);
    if (minDiff > drawWall.tolerance) {
        //var point = curPoint - (normal * drawWall.radius);
        x = drawWall.curPoint.x - (normal.x * drawWall.radius);
        y = drawWall.curPoint.y - (normal.y * drawWall.radius);
		
        var p = new paper.Point(x, y);
        var segment = new paper.Segment(p, null, normal * drawWall.handle);
        drawWall.path.insert(drawWall.path.segments.length - 1, segment);
        drawWall.curHandleSeg = drawWall.path.lastSegment;
        // clone as we want the unmodified one:
        drawWall.prevPoint = drawWall.curHandleSeg.point.clone();
        drawWall.path.add(drawWall.curHandleSeg);
        drawWall.curPoint = drawWall.path.lastSegment.point;
    }
};
//=========================================

engine2D.makeWall = function (floor,v1,v2,c,h) {

    /*
    var values = {
        fixLength: false,
        fixAngle: false,
        showCircle: false,
        showAngleLength: true,
        showCoordinates: false
    };
    var vectorStart, vector, vectorPrevious;
    var vectorItem, items, dashedItems;

    function processVector(event, drag) {
        vector = event.point - vectorStart;
        if (vectorPrevious) {
            if (values.fixLength && values.fixAngle) {
                vector = vectorPrevious;
            } else if (values.fixLength) {
                vector.length = vectorPrevious.length;
            } else if (values.fixAngle) {
                vector = vector.project(vectorPrevious);
            }
        }
        drawVector(drag);
    }

    function drawVector(drag) {
        if (items) {
            for (var i = 0, l = items.length; i < l; i++) {
                items[i].remove();
            }
        }
        if (vectorItem)
            vectorItem.remove();
        items = [];
        var arrowVector = vector.normalize(10);
        var end = vectorStart + vector;
        vectorItem = new paper.Group(
            new paper.Path(vectorStart, end),
            new paper.Path(
                end + arrowVector.rotate(135),
                end,
                end + arrowVector.rotate(-135)
            )
        );
        vectorItem.strokeWidth = 0.75;
        vectorItem.strokeColor = '#e4141b';
        // Display:
        dashedItems = [];
        // Draw Circle
        if (values.showCircle) {
            dashedItems.push(new paper.Path.Circle(vectorStart, vector.length));
        }
        // Draw Labels
        if (values.showAngleLength) {
            drawAngle(vectorStart, vector, !drag);
            if (!drag)
                drawLength(vectorStart, end, vector.angle < 0 ? -1 : 1, true);
        }
        var quadrant = vector.quadrant;
        if (values.showCoordinates && !drag) {
            drawLength(vectorStart, vectorStart + [vector.x, 0],
                    [1, 3].indexOf(quadrant) != -1 ? -1 : 1, true, vector.x, 'x: ');
            drawLength(vectorStart, vectorStart + [0, vector.y],
                    [1, 3].indexOf(quadrant) != -1 ? 1 : -1, true, vector.y, 'y: ');
        }
        for (var i = 0, l = dashedItems.length; i < l; i++) {
            var item = dashedItems[i];
            item.strokeColor = 'black';
            item.dashArray = [1, 2];
            items.push(item);
        }
        // Update palette
        values.x = vector.x;
        values.y = vector.y;
        values.length = vector.length;
        values.angle = vector.angle;
    }

    function drawAngle(center, vector, label) {
        var radius = 25, threshold = 10;
        if (vector.length < radius + threshold || Math.abs(vector.angle) < 15)
            return;
        var from = new paper.Point(radius, 0);
        var through = from.rotate(vector.angle / 2);
        var to = from.rotate(vector.angle);
        var end = center + to;
        dashedItems.push(new paper.Path.Line(center, center + new paper.Point(radius + threshold, 0)));
        dashedItems.push(new paper.Path.Arc(center + from, center + through, end));
        var arrowVector = to.normalize(7.5).rotate(vector.angle < 0 ? -90 : 90);
        dashedItems.push(new paper.Path([
                end + arrowVector.rotate(135),
                end,
                end + arrowVector.rotate(-135)
        ]));
        if (label) {
            // Angle Label
            var text = new paper.PointText(center + through.normalize(radius + 10) + new paper.Point(0, 3));
            text.content = Math.floor(vector.angle * 100) / 100 + '\xb0';
            items.push(text);
        }
    }

    function drawLength(from, to, sign, label, value, prefix) {
        var lengthSize = 5;
        if ((to - from).length < lengthSize * 4)
            return;
        var vector = to - from;
        var awayVector = vector.normalize(lengthSize).rotate(90 * sign);
        var upVector = vector.normalize(lengthSize).rotate(45 * sign);
        var downVector = upVector.rotate(-90 * sign);
        var lengthVector = vector.normalize(vector.length / 2 - lengthSize * Math.sqrt(2));
        var line = new paper.Path();
        line.add(from + awayVector);
        line.lineBy(upVector);
        line.lineBy(lengthVector);
        line.lineBy(upVector);
        var middle = line.lastSegment.point;
        line.lineBy(downVector);
        line.lineBy(lengthVector);
        line.lineBy(downVector);
        dashedItems.push(line);
        if (label) {
            // Length Label
            var textAngle = Math.abs(vector.angle) > 90 ? textAngle = 180 + vector.angle : vector.angle;
            // Label needs to move away by different amounts based on the
            // vector's quadrant:
            var away = (sign >= 0 ? [1, 4] : [2, 3]).indexOf(vector.quadrant) != -1 ? 8 : 0;
            var text = new paper.PointText(middle + awayVector.normalize(away + lengthSize));
            text.rotate(textAngle);
            text.justification = 'center';
            value = value || vector.length;
            text.content = (prefix || '') + Math.floor(value * 1000) / 1000;
            items.push(text);
        }
    }
    */
    ////////////////////////////////////////////////////////////////////////////////
    /*
    if((v2.x-v1.x) < 0 || (v1.y-v2.y) < 0) //top to bottom or left to right
    {
        //revese coordinate polarity
        //console.log("Reversed Before " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
        var v = v1;
        v1=v2;
        v2=v;
        console.log("Reversed " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
    }else{
        console.log("Normal " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
    }
    */
    console.log("Wall " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
    ////////////////////////////////////////////////////////////////////////////////

	var group = new paper.Group();
	var path = new paper.Path(); //http://paperjs.org/reference/pathitem/#quadraticcurveto-handle-to
	path.doors = []; //Array holder for Doors
	path.windows = []; //Array holder for Windows

	var pivot = new paper.Path.Circle(new paper.Point(c.x, c.y), 10);
	pivot.fillColor = '#33CCFF';
	pivot.opacity = 0.5;

	var circle = new paper.Path.Circle(new paper.Point(0, 0), 8);
	circle.fillColor = '#FFCC00';
	circle.visible = false;

	path.moveTo(new paper.Point(v1.x,v1.y));
	path.quadraticCurveTo(new paper.Point(c.x,c.y), v2.x,v2.y);
	//path.smooth();

	var line = path.clone();
	line.strokeColor = '#00FF00';
	line.strokeWidth = 1;
	line.visible = false;

	var measureOutside = new paper.Path();
	var measureInside = new paper.Path();

	var label = new paper.PointText();
	var rect = new paper.Path.Rectangle(new paper.Rectangle(0, 0, 50, 18));
	var labelOutside = new paper.Group();
	var labelInside = new paper.Group();
	//labelOutside.strokeColor = '#ffffff';
	//labelOutside.justification = labelOutside.justification = 'center';
	labelOutside.fontSize = labelInside.fontSize = 14;
	rect.fillColor = '#ffffff';
	//rect.fillColor = 'red'; //DEBUG

	var angle = path.segments[0].point.subtract(path.segments[1].point).angle;

	//=====================
	measureOutside = engine2D.pathOffset(path, -20, 1);
	measureInside = engine2D.pathOffset(path, 20, 1);
	//labelOutside.position = measureOutside.children[0].getLocationAt(measureOutside.children[0].length/2).point;
	//labelInside.position = measureInside.children[0].getLocationAt(measureInside.children[0].length/2).point;
	label.rotation = angle;
	rect.rotation = angle;

	label.content =  (measureOutside.children[0].length/100).toFixed(1) + 'm';
	rect.position = measureOutside.position;
	label.position = measureOutside.position;
	labelOutside.addChild(rect.clone());
	labelOutside.addChild(label.clone());
	//=================================
	label.content = (measureInside.children[0].length/100).toFixed(1) + 'm';
	rect.position = measureInside.position;
	label.position = measureInside.position;
	labelInside.addChild(rect);
	labelInside.addChild(label.clone());
	//=================================
    label.remove(); //temporary cleanup
	
	//measureOutside.strokeColor = measureInside.strokeColor  = '#000000';
	//measureOutside.strokeWidth = measureInside.strokeWidth = 1;

	/*
	line = new paper.Path.Line({
	  segments: [[0, y], [width, y]]
	});
	*/
	
	/*
	path.segments = [];
	path.add(view.bounds.bottomLeft);
	path.add(view.center);
	path.add(view.bounds.topRight);
	path.smooth();
	*/

	//path.fillColor = 'black';
	path.strokeColor = 'black';
	path.strokeWidth = 20;
	//path.name = "wall";

	if(path.length < 120)
	{
		pivot.visible = false;
		circle.visible = false;
	}

	if(path.length < 80)
	{
		measureOutside.visible = false;
		measureInside.visible = false;
		labelOutside.visible = false;
		labelInside.visible = false;
	}
	//path.fullySelected = true;

	/*
	var circleA = new paper.Path.Circle(new Point(v1.x,v1.y), 8);
	var circleB = new paper.Path.Circle(new Point(v2.x,v2.y), 8);
	circleA.fillColor = circleB.fillColor = '#00CC33';
	circleA.opacity = circleB.opacity = 0;
	*/

	/*
	var canvas = document.createElement('canvas');
	//canvas.width = path.bounds.x; //path.bounds.width;
	//canvas.height = path.bounds.y; //path.bounds.height;
	var context = canvas.getContext('2d');
	var img = new Image();
	img.src = '../objects/FloorPlan/Default/0.png';
	//console.log(path.bounds);
	img.onload = function() {
		context.fillStyle = context.createPattern(this,"repeat");
		context.fillRect(0, 0, path.length, path.length);
		context.fill();
	};
	//var raster = new paper.Raster(canvas,new Point(path.bounds.x,path.bounds.y));
	var raster = new paper.Raster({source: '../objects/FloorPlan/Default/0.png', position: path.position});
	//raster.fitBounds(path.bounds, true);
	var wall2 = new Group([path.clone(),raster]);
	//var wall2 = new Group([raster,path.clone()]);
	wall2.clipped = true;
	*/

	//path.fillColor = {pattern: {url: '../objects/FloorPlan/Default/0.png', repeat: 'repeat'}}

	var wall = new paper.Group([path]);

	group.addChild(measureOutside); //0
	group.addChild(measureInside);  //1
	group.addChild(labelOutside);   //2
	group.addChild(labelInside);    //3
	//group.addChild(circleA);
	//group.addChild(circleB);
	group.addChild(wall);           //4
	group.addChild(line);           //5
	group.addChild(circle);         //6
	group.addChild(pivot);          //7

    group.addChild(engine2D.calculatePathOffset(path, -10, 1, 1.5));   //8 - borderOutside
    group.addChild(engine2D.calculatePathOffset(path, 10, 1, 1.5));   //9 - borderInside

	//group.clipped = true;
	
	/*
	insertAbove(item) //Inserts this item above the specified item.
	insertBelow(item) //Inserts this item below the specified item.
	sendToBack() //Sends this item to the back of all other items within the same parent.
	*/
	paper.project.layers.push(group);

	//====================================
	pivot.attach('mouseenter', function() {
		this.opacity = 1;
		//this.fillColor = '#909090';
		//line.visible = true;
		//circle.visible = false;
        //this.parent.parent.children[6].visible = false;
        //console.log(this.parent.parent);
	});
	pivot.attach('mouseleave', function() {
		this.opacity = 0.5;
		//this.fillColor = '#C0C0C0';
		//line.visible = false;
	});

	//pivot.attach('mousedrag', function(event) {
	//});

	pivot.attach('doubleclick', function(event) {
		var o = new paper.Path();
		o.moveTo(path.segments[0].point);
		o.lineTo(path.segments[1].point);
		onPathDrag(this.parent,o.getLocationAt(o.length/2));
	});

	pivot.attach('mousedrag', function(event) {
		onPathDrag(this.parent,event);
	});
	//====================================

	wall.on('mouseenter', engine2D.wall_onMouseEnter);
    wall.on('mousemove', engine2D.wall_onMouseMove);
	wall.on('mouseleave', engine2D.wall_onMouseLeave);

	//====================================
	//path.on('mousedown', this.onMouseDown);
	//path.on('touchdown', this.onMouseDown);
	//path.on('mousedrag', this.onMouseDrag);

	//path.on('mouseenter', shiftPath);
	//path.on('mouseleave', shiftPath)''

	onPathDrag = function(parent, event) {
		//parent.dragging = true;
		parent.children[7].position = event.point;
		
		var path = parent.children[4].children[0];
		var line = parent.children[5];
		var p1 = path.segments[0].point;
		var p2 = path.segments[1].point;

		path.clear();
		path.moveTo(p1);
		path.quadraticCurveTo(event.point, p2);

		line.clear();
		line.moveTo(p1);
		line.quadraticCurveTo(event.point, p2);
		//line.visible = true;
		
		//for (var i = 0; i < this.segments.length; i++) {
		//    console.log(this.segments[i].point);
		//}
	};

	onPathTouchDrag = function(event) {
		//event.preventDefault();
		var touch = event.originalEvent.changedTouches[0];
		onPathDrag({
			clientX: touch.pageX,
			clientY: touch.pageY
		});
		return false;
	};
    
    //group.name = "wall";
    group.h = h;
    //group.doors = [];
    //group.visible = false; //draw on demand
    
    //console.log(group);
    
    return group;
};

//==========================================

engine2D.wall_onMouseEnter = function(event)
{
    //event.preventDefault();
    this.children[0].parent.parent.children[5].visible = true; //line
    this.children[0].parent.parent.children[6].visible = true; //circle

    //this.on('mousedown', engine2D.edge_onMouseDown);
    //this.on('mousemove', engine2D.wall_onMouseMove);
    //this.on('mouseleave', engine2D.wall_onMouseLeave);
};

engine2D.wall_onMouseLeave = function(event)
{
    this.children[0].parent.parent.children[5].visible = false; //line
    this.children[0].parent.parent.children[6].visible = false; //circle

    //this.off('mousemove', engine2D.wall_onMouseMove);
};

engine2D.wall_onMouseMove = function(event)
{
    this.children[0].parent.parent.children[6].position = this.children[0].getNearestPoint(event.point);
};

//==========================================

engine2D.edge_onMouseEnter = function(event)
{
    this.children[2].opacity = 1; //this.children[2].visible = true;
    this.children[3].opacity = 1; //this.children[3].visible = true;

    this.on('mousedown', engine2D.edge_onMouseDown);
    this.on('mouseleave', engine2D.edge_onMouseLeave);
};

engine2D.edge_onMouseLeave = function(event)
{
    this.children[2].opacity = 0; //this.children[2].visible = false;
    this.children[3].opacity = 0; //this.children[3].visible = false;
};

engine2D.wallRelativePoints = function(event,object,segments)
{
    var a = event.point;
    var b = segments[1].point;

    //Fix: left to right / right to left
    //==================================
    //console.log(Math.round(this.position) + " " + b);

    if(object.hitTest(b)){ //innerCircle
        //console.log('reverse [' + i + "]");
        a = segments[0].point;
        b = event.point;
    }
    //==================================

    return {start:a,end:b};
};

engine2D.edge_onMouseDrag = function(event)
{
    //event.preventDefault();

    //console.log(this.attachments);
    if(this.dragging === false)
    {
        this.dragging = true;
        this.off('mouseenter', engine2D.edge_onMouseEnter);
        this.off('mouseleave', engine2D.edge_onMouseLeave);
    }

    //isDragging = true;

    for (i = 0; i < this.attachments.length; i++) {

        //console.log(this.attachments[i].parent.parent);
        //console.log(this.attachments[i]);

        var wall = this.attachments[i];
        //wall.visible = false; //DEBUG

        if (wall.length > 120)
        {
            wall.parent.parent.children[7].visible = true;
        }else{
            wall.parent.parent.children[7].visible = false;
        }

        var r = engine2D.wallRelativePoints(event,this.children[2],wall.segments);
        /*
        var a = event.point;
        var b = wall.segments[1].point;

        //Fix: left to right / right to left
        //==================================
        //console.log(Math.round(this.position) + " " + b);

        if(this.children[2].hitTest(b)){ //innerCircle
            //console.log('reverse [' + i + "]");
            a = wall.segments[0].point;
            b = event.point;
        }
        //==================================
        */

        var cx = wall.segments[0].point.x + wall.segments[1].point.x;
        var cy = wall.segments[0].point.y + wall.segments[1].point.y;

        var angle1 = wall.segments[0].point.subtract(wall.segments[1].point).angle;
        var angle2 = r.start.subtract(r.end).angle;

        //var line = wall.parent.parent.children[1];
        //var circle = wall.parent.parent.children[2];
        //circle.visible = false;

        var p = new paper.Point(cx/2, cy/2); //calculate quadratic curve center
        //var p = wall.getLocationAt(wall.length/2).point; //calculate quadratic curve center
        
        var dl = wall.doors.length;
        var wl = wall.windows.length;

        if(dl > 0)
        {
            //==================================
            //Move all Doors
            for (d = 0; d < dl; d++) {

                //console.log(wall.doors[d]);
                //wall.doors[d].applyMatrix = true;

                //TODO: Reset to default before rotating

                //wall.doors[d].rotate(-wall.doors[d].angle); //reset
                //wall.doors[d].angle = angle2-angle1;
                wall.doors[d].rotate(angle2-angle1);
                
                wall.doors[d].position = p;
                //console.log("[" + i + "][" + d + "] " + angle + ">" + an);
            }
        }else{
            //==================================
            //Move Pivot point
            wall.parent.parent.children[7].position = p; 
        }

        //==================================
        //Wall
        wall.clear();
        wall.moveTo(r.start);
        wall.quadraticCurveTo(p, r.end);
        //==================================
        //Measuring Lines
        wall.parent.parent.children[0].clear();
        wall.parent.parent.children[1].clear();
        wall.parent.parent.children[0] = engine2D.pathOffset(wall, -20, 1, wall.parent.parent.children[0].strokeColor);
        wall.parent.parent.children[1] = engine2D.pathOffset(wall, 20, 1, wall.parent.parent.children[1].strokeColor);
        //==================================
        //Measuring Labels
        wall.parent.parent.children[2].position = wall.parent.parent.children[0].children[0].getLocationAt(wall.parent.parent.children[0].children[0].length/2).point;
        wall.parent.parent.children[3].position = wall.parent.parent.children[1].children[0].getLocationAt(wall.parent.parent.children[1].children[0].length/2).point;
        
        wall.parent.parent.children[2].children[0].rotation = (angle2-angle1);
        wall.parent.parent.children[3].children[0].rotation = (angle2-angle1);

        wall.parent.parent.children[2].children[1].rotation = angle1;
        wall.parent.parent.children[3].children[1].rotation = angle1;
        wall.parent.parent.children[2].children[1].content = (wall.parent.parent.children[0].children[0].length/100).toFixed(2) + 'm';
        wall.parent.parent.children[3].children[1].content = (wall.parent.parent.children[1].children[0].length/100).toFixed(2) + 'm';
        //==================================
        //Invisible line border lines for "smashCorner" calculation
        //DEBUG
        /*
        wall.parent.parent.children[8].clear();
        wall.parent.parent.children[9].clear();
        wall.parent.parent.children[8] = engine2D.pathOffset(wall, -10, 1, '#3399FF'); //Inside
        wall.parent.parent.children[9] = engine2D.pathOffset(wall, 10, 1, '#FF0000'); //Outside
        */
        wall.parent.parent.children[8] = engine2D.calculatePathOffset(wall, -10, 1, 1.5); //Inside
        wall.parent.parent.children[9] = engine2D.calculatePathOffset(wall, 10, 1, 1.5); //Outside
        //==================================

        /*
        clearTimeout(tick);
        tick = setTimeout(function() {
            engine2D.calculateWallMeasureWidth(this,wall.parent.parent.children[4]);
            engine2D.calculateWallMeasureWidth(this,wall.parent.parent.children[5]);
        }, 300);
        */
        //wall.moveTo(a);
        //wall.quadraticCurveTo(p, b);
        //wall.transformContent = false;

        //console.log(angle);
    }
    this.position = event.point; //must be last - otherwise will interfere with above logic

    engine2D.edgeSmashCorner(this);

};

engine2D.edgeSmashCorner = function(edge)
{
    if(edge.attachments.length >= 2) //make sure there more than one wall attached to the edge
    {
        for (var i = 0; i < edge.attachments.length; i+=2) {

            if(edge.attachments[i+1] !== undefined)
            {
                var angle = engine2D.calculateWallAngle(edge.attachments[i],edge.attachments[i+1]);
                angle = Math.abs(angle) + 180;
                angle = Math.abs(angle - 360);
                
                edge.children[4].children[3].content = Math.round(angle) + '\xb0';
                //==================================
                //Angle lines
                edge.children[4].children[0].clear();
                edge.children[4].children[1].clear();
                
                //Arc
                //edge.children[4].children[2].clear();
                //==================================

                //Smash Corner
                //==================================
                var cornerA = edge.attachments[i].parent.parent.children[9].getIntersections(edge.attachments[i+1].parent.parent.children[9]); //Outside
                var cornerB = edge.attachments[i].parent.parent.children[8].getIntersections(edge.attachments[i+1].parent.parent.children[8]); //Inside
                
                var crossA = edge.attachments[i].parent.parent.children[9].getIntersections(edge.attachments[i+1].parent.parent.children[8]);
                var crossB = edge.attachments[i].parent.parent.children[8].getIntersections(edge.attachments[i+1].parent.parent.children[9]);

                edge.children[1].clear();

                if(cornerA[0]){

                    edge.children[1].moveTo(cornerA[0].point);
                    //edge.children[1].position = cornerA[0].point; //DEBUG

                    if(crossA[0] && crossB[0]){
                        edge.children[1].lineTo(crossA[0].point);
                        edge.children[1].lineTo(crossB[0].point);
                        //edge.children[1].position = crossB[0].point; //DEBUG
                    }
                }

                if(cornerB[0]){

                    if(cornerA[0]){
                        edge.children[1].lineTo(cornerB[0].point);
                    }else{
                        edge.children[1].moveTo(cornerB[0].point);
                    }
                    //edge.children[1].position = cornerB[0].point; //DEBUG

                    if(crossA[0] && crossB[0]){

                        edge.children[1].lineTo(crossA[0].point);
                        edge.children[1].lineTo(crossB[0].point);
                        //edge.children[1].position = crossB[0].point; //DEBUG
                    }
                }
            }
            //==================================
        }
    }
};

engine2D.edge_onMouseDown = function(event)
{
    this.on('mouseup', engine2D.edge_onMouseUp);
    this.on('mousedrag', engine2D.edge_onMouseDrag);
};

engine2D.edge_onMouseUp = function(event)
{
    this.dragging = false;
    this.off('mousedrag', engine2D.edge_onMouseDrag);

    for (i = 0; i < this.attachments.length; i++)
    {
        var wall = this.attachments[i];
        //isDragging = false;
        
        var line = wall.parent.parent.children[5];
        var p = this.attachments[i].getLocationAt(this.attachments[i].length/2).point; //calculate quadratic curve center
        line.clear();
        line.moveTo(this.attachments[i].segments[0].point);
        line.quadraticCurveTo(p, this.attachments[i].segments[1].point);
        
        engine2D.calculateWallMeasureWidth(this,wall.parent.parent.children[0]);
        engine2D.calculateWallMeasureWidth(this,wall.parent.parent.children[1]);
    }

    //NOTE: .visible mouse events are NOT accurate
    //this.children[2].visible = false;
    //this.children[3].visible = false;

    this.children[2].opacity = 0;
    this.children[3].opacity = 0;

    this.off('mouseleave', engine2D.edge_onMouseLeave);
    this.off('mousedown', engine2D.edge_onMouseDown);
    this.on('mouseenter', engine2D.edge_onMouseEnter);

    engine2D.makeFloor(engineGUI.floor);
};

//=========================================

//http://stackoverflow.com/questions/16991895/paperjs-to-draw-line-with-arrow
paper.Shape.ArrowLine = function(sx, sy, ex, ey, isDouble)
{
    function calcArrow(px0, py0, px, py) {
        var points = [];
        var l = Math.sqrt(Math.pow((px - px0), 2) + Math.pow((py - py0), 2));
        points[0] = (px - ((px - px0) * Math.cos(0.5) - (py - py0) * Math.sin(0.5)) * 10 / l);
        points[1] = (py - ((py - py0) * Math.cos(0.5) + (px - px0) * Math.sin(0.5)) * 10 / l);
        points[2] = (px - ((px - px0) * Math.cos(0.5) + (py - py0) * Math.sin(0.5)) * 10 / l);
        points[3] = (py - ((py - py0) * Math.cos(0.5) - (px - px0) * Math.sin(0.5)) * 10 / l);
        return points;
    }

    var endPoints = calcArrow(sx, sy, ex, ey);
    var startPoints = calcArrow(ex, ey, sx, sy);

    var e0 = endPoints[0],
        e1 = endPoints[1],
        e2 = endPoints[2],
        e3 = endPoints[3],
        s0 = startPoints[0],
        s1 = startPoints[1],
        s2 = startPoints[2],
        s3 = startPoints[3];
    var line = new paper.Path({
        segments: [
            new paper.Point(sx, sy),
            new paper.Point(ex, ey)
        ],
        strokeWidth: 1
    });
    var arrow1 = new paper.Path({
        segments: [
            new paper.Point(e0, e1),
            new paper.Point(ex, ey),
            new paper.Point(e2, e3)
        ]
    });

    var compoundPath = new paper.CompoundPath([line, arrow1]);
    if (isDouble === true) {
        var arrow2 = new paper.Path({
            segments: [
                new paper.Point(s0, s1),
                new paper.Point(sx, sy),
                new paper.Point(s2, s3)
            ]
        });

        compoundPath.addChild(arrow2);
    }

    return compoundPath;
};

engine2D.calculatePathOffset = function(path, offset, precision, scale)
{
    /*
    path: path object to be offset
    offset: length of offset
    precision: the amount of precision (the higher the more precise)
    */

    var copy = new paper.Path();
    //copy.strokeColor = color;
    //copy.strokeWidth = 1;
    
    //recommended precision: Math.ceil(path.length)
    for (var i = 0; i < precision + 1; i++) {
        var pos = i / precision * path.length;
        var point = path.getPointAt(pos);
        var normal = path.getNormalAt(pos);
        normal.length = offset;
        copy.add(point.add(normal));
    }

    copy.scale(scale);
    copy.smooth();
    copy.remove();

    return copy;
};

engine2D.pathOffset = function(path, offset, precision, color)
{
	var copy = engine2D.calculatePathOffset(path, offset, precision, 1);
	var item = new paper.Shape.ArrowLine(copy.segments[0].point.x, copy.segments[0].point.y, copy.segments[1].point.x, copy.segments[1].point.y,true);
	item.strokeColor = color;
	item.strokeWidth = 1;

	//var group = new Group([rect,item]);
    //return group;

    return item;
};

engine2D.calculateWallMeasureWidth = function(edge,line)
{
    for(i = 0; i < edge.attachments.length; i++) //a little faster than doing hit on scene2DWallGroup[engineGUI.floor]
    {
        for(l = 0; l < 2; l++)
        {
            //console.log("[" + i + "] " + line.children[0].segments[i].point);
            //line.children[0].visible = false; //DEBUG
            //edge.attachments[l].visible = false;
            var hitResult = edge.attachments[i].hitTest(line.children[0].segments[l].point);
            if (hitResult) {
                //console.log("pathOffset " + hitResult.item.strokeWidth);
                line.scale(0.8); //TODO: calculate more accurate cut-offs
                break;
            }
        }
    }
};

engine2D.calculateWallMeasureColor = function(i,edge)
{
    //6 = outside
    //7 = inside

    for(a = 0; a < scene2DWallGroup[i].children.length; a++)
    //for(i = 0; i < edge.attachments.length; i++) //a little faster than doing hit on scene2DWallGroup[engineGUI.floor]
    {
        for(l = 0; l < 2; l++){

            //var line = edge.attachments[i].children[4+l];
            var line = scene2DWallGroup[i].children[a].children[l];

            var hitResult = engine2D.floor[i].hitTest(line.children[0].segments[0].point);
            if (hitResult) {
                line.strokeColor = '#606060'; //inside
                //line.parent.children[7].position = line.children[0].getLocationAt(line.children[0].length/2).point;
                //line.parent.children[7].visible = false; //DEBUG
                //break;
            }else{
                line.strokeColor = '#000000'; //outside
                //line.parent.children[6].position = line.children[0].getLocationAt(line.children[0].length/2).point;
                //line.parent.children[6].visible = false; //DEBUG
            }
        }
    }
};

engine2D.addWallCorner = function(floor,wall,point)
{

    var size = new paper.Path.Circle(point, 60); //fake circle -> centers things in a group
    var circleInner = new paper.Path.Circle(point, 8);
    var circleOuter = new paper.Path.Circle(point, 17);
    
    //circleOuter.fillColor = '#ffffff';
    circleOuter.strokeColor = circleInner.fillColor = '#00CC33';
    circleOuter.strokeWidth = 3;
    circleOuter.opacity = circleInner.opacity = 0;

    var cornerSmash = new paper.Path(); //new paper.Path.Circle(point, 2);
    cornerSmash.fillColor = '#000000'; //'#880000';

    var edge = new paper.Group([size, cornerSmash, circleInner, circleOuter]); //0
    edge.dragging = false;
    edge.attachments = [];

    edge.on('mouseenter', engine2D.edge_onMouseEnter);

    scene2DWallPointGroup[floor].addChild(edge);
};

engine2D.calculateWallCorners = function(floor)
{
    console.log("Fix Wall Corner Geometry " + scene2DWallGroup[floor].children.length);

	scene2DWallPointGroup[floor] = new paper.Group();
	/*
	var hitOptions = { 
		segments: true,
		fill: true,
		//stroke: true,
		visible: true,
		tolerance: 5,
		//center: true
	};
	*/
	
	//var sin = Math.sin(45);
	//var cos = Math.cos(45);
	var edge;
	
	for (var i = 0; i < scene2DWallGroup[floor].children.length; i++) {

		var wall = scene2DWallGroup[floor].children[i].children[4].children[0].segments; //inside a Group()
		//console.log(s);

		for (var h = 0; h < wall.length; h++) {

			var hitEdgeResult = scene2DWallPointGroup[floor].hitTest(wall[h].point);

			if (!hitEdgeResult) {

                engine2D.addWallCorner(floor,wall,wall[h].point);

			}else{ //Remove 'gap' and snap the walls together

				//cross-check every other wall
				for (var x = 0; x < scene2DWallGroup[floor].children.length; x++) {
					edge = hitEdgeResult.item.parent;
					var path = scene2DWallGroup[floor].children[x].children[4].children[0];
					if(path.hitTest(edge.position))
					{
						//if(edge.attachments)
							edge.attachments.push(path);
					}
				}
			}
		}

		//if (path.contains(event.point)) {

		//console.log(scene2DWallMesh[engineGUI.floor][i].children[0].children[0].segments[0].point);
		//console.log(scene2DWallMesh[engineGUI.floor][i].children[0].children[0].segments[1].point);
		   
		//var intersections = scene2DWallMesh[engineGUI.floor][i].children[0].children[0].getIntersections(path1);
		//console.log(intersections[0].point);
		
		//console.log(scene2DWallMesh[engineGUI.floor][i].children[0].children[0].segments);
		//var intersections = path1.getIntersections(path2);
	}

	for (var i = 0; i < scene2DWallPointGroup[floor].children.length; i++)
	{
		edge = scene2DWallPointGroup[floor].children[i];
		engine2D.calculateWallEdge(edge);
        engine2D.edgeSmashCorner(edge);
    }
    
	//edge.addChild(angleSharpFix); //2
	//edge.addChild(circleInner); //3
	//edge.addChild(circleOuter); //4

	//console.log(edge);

	//paper.project.layers.push(scene2DWallPointGroup[engineGUI.floor]);
	//scene2DWallPointGroup[engineGUI.floor].bringToFront();
};

engine2D.calculateWallEdge = function (edge) {

	for (var a = 0; a < edge.attachments.length; a+=2)
    {
		if(edge.attachments[a+1] === undefined)
			break;

		//console.log(edge.position);

		//Fix the cutoff corners
		//======================
		/*
		edge.children[1].add(new Point(edge.position.x - 10,edge.position.y-10));
		edge.children[1].add(new Point(edge.position.x - 10,edge.position.y+10));
		edge.children[1].add(new Point(edge.position.x + 10,edge.position.y+10));
		edge.children[1].closed = true;
		*/
		//edge.children[1].fillColor = 'red'; //DEBUG
		//======================
		/*
		var hitEdgeResult = scene2DWallPointGroup[engineGUI.floor].hitTest(edge.position);
		if (!hitEdgeResult) {

		}else{

		}
		*/

		var box = edge.bounds.width/2;
		var l1 = new paper.Path();
		var l2 = new paper.Path();
		var l3 = new paper.Path(); //DEBUG
		var arc = new paper.Path.Arc();
		var text = new paper.PointText();

		if(edge.attachments[a].length > box && edge.attachments[a+1].length > box)
		{
			//console.log(edge.bounds.topLeft);
			
			var p1 = new paper.Point(edge.bounds.center.x,edge.bounds.center.y);
			var p2 = edge.attachments[a].getLocationAt(box).point;
			var p3 = edge.attachments[a+1].getLocationAt(box).point;
			
			//console.log(Math.round(p1.subtract(p2).length));

            //========================
            //Deal with reversed lines
            //========================
			if(Math.round(p1.subtract(p2).length) > box) 
				p2 = edge.attachments[a].getLocationAt(edge.attachments[a].length-box).point;
			if(Math.round(p1.subtract(p3).length) > box)
				p3 = edge.attachments[a+1].getLocationAt(edge.attachments[a+1].length-box).point;
            //========================
			
			l1 = new paper.Path.Line(p1, p2);
			l2 = new paper.Path.Line(p1, p3); 
			l1.strokeColor = '#ffffff';
			l1.strokeWidth = 1;
			l2.style = l1.style;

			var angle = engine2D.calculateWallAngle(edge.attachments[a],edge.attachments[a+1]);
            //l2.rotation = angle;
            //l2.rotate(angle,l2.segments[0].point);

            //======================
			//TODO: do a hitTest to floor suface (internal angles only)
            //======================
          
            /*
            var t1 = engine2D.calculatePathOffset(edge.attachments[a], edge.attachments[a].strokeWidth/2, 1, 1.5);
            var t2 = engine2D.calculatePathOffset(edge.attachments[a+1], edge.attachments[a+1].strokeWidth/2, 1, 1.5);

            var intersections = t1.getIntersections(t2); //edge.attachments[a].getIntersections(edge.attachments[a+1]);
            edge.children[1].position = intersections[0].point;
            */

            //======================
            //DEBUG
            //======================
            /*
            console.log(edge.attachments[a].strokeWidth);
            engine2D.pathOffset(edge.attachments[a], -edge.attachments[a].strokeWidth/2, 1,'#FF0000');
            engine2D.pathOffset(edge.attachments[a], edge.attachments[a].strokeWidth/2, 1,'#FF0000');
            console.log(intersections[0].point);
            //edge.attachments[a].parent.parent.children[0].opacity = 0;
            */
            //======================


            //======================
            //TODO: smash the corner (edge.children[1])
            //======================


			//if(angle > 180)
			//    angle = 360 - angle;
			//console.log(angle);
			//console.log(edge.position);
			/*
			var radius = 25, threshold = 10;
			var from = new Point(radius, 0);
			var through = from.rotate(angle / 2);
			var text = new PointText(new Point(x,y) + through.normalize(radius + 10) + new Point(0, 3));
			*/

			//======================
			l3.add(l1.segments[1].point);
			l3.add(l2.segments[1].point);
			//l3.strokeColor  = 'red'; //DEBUG
			var mp = l3.getLocationAt(l3.length/2).point;
			text.position = mp;
			l3.clear();
			l3.add(mp);
			l3.add(p1);
			l3.scale(2);
			mp = l3.segments[0].point;
			l3.remove();
			//======================

			arc = new paper.Path.Arc(l1.segments[1].point, mp, l2.segments[1].point);
			arc.strokeColor = '#000000';
			arc.strokeWidth = 1;

			text.content = Math.abs(angle) + '\xb0';
			text.justification = 'center';
			text.fontSize = 14;
		}
		var group = new paper.Group([l1,l2,arc,text]);

		//if(edge.children[4])
		//	edge.children[4].remove();
		
		edge.addChild(group);
	}

    //engine2D.edgeSmashCorner(edge);
};

engine2D.calculateWallAngle = function (l1,l2) {

    var angle1 = l1.segments[0].point.subtract(l1.segments[1].point).angle;
    var angle2 = l2.segments[0].point.subtract(l2.segments[1].point).angle;
    var angle = angle1-angle2;

    //TODO: do a hitTest to floor suface (internal angles only)
    //if(angle > 180)
    //    angle = 360 - angle;

    return angle;
};

engine2D.joinWall = function(wall){

};

engine2D.splitWall = function(wall,hit) {
    
	console.log(wall);
	
	//wall.children[4].children[0].path.segments[0].point = hit.intersection.point;
	
	//scene2DWallGroup[engineGUI.floor].addChild(engine2D.makeWall({x:wall.intersection.point.x,y:wall.intersection.point.y},{x:wall.curve.path.segments[1].point.x,y:wall.curve.path.segments[1].point.y},{x:0,y:0},10));
	
	//wall.segment2.point = wall.intersection.point;
	//var wall1 = paper.Path();
	//wall.intersection.point
};

engine2D.joinWallEdgeCircle = function(id) {

    //var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
        //A bit more tricky ..need to get "closes" edgeCircle and pick parameters from.
    //}
    return false; //href="#" fix
};

engine2D.splitWallEdgeCircle = function(id) {

    /*
    var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
    var circle = scene2DMakeWallEdgeCircle(result[0].left, result[0].top, false);
    
    for (var i = 1; i < 4; i++)
    {
        if(result[0].line[i])
        {
            circle.line[i] = result[0].line[i];
            result[0].line[i] = undefined;
            result[0].bend[i] = undefined;
        }
        if(result[0].pivot[i])
        {
            circle.pivot[i] = result[0].pivot[i];
            result[0].pivot[i] = undefined;
        }
    }
    scene2D.add(circle);
    */
    //}
    return false; //href="#" fix
};

engine2D.angleObjectToWall = function(object,wall) {

    var vector = wall.segments[0].point.subtract(wall.segments[1].point);

    if(object.angle !== vector.angle)
    {
        //TODO: Reset to default before rotating
        object.rotate(-object.angle); //reset
        
        object.rotate(vector.angle);
        object.angle = vector.angle;
    }

    //TODO: position correction X,Y

    //var r = engine2D.wallRelativePoints(event,this.children[2],wall.segments);
};

engine2D.snapObjectToWall = function(object,point) {

    for (var w = 0; w < scene2DWallGroup[engineGUI.floor].children.length; w++)
    {
        var wall = scene2DWallGroup[engineGUI.floor].children[w];
        var hitWallResult = wall.children[4].children[0].hitTest(point);
        if(hitWallResult)
        {
            engine2D.angleObjectToWall(object,hitWallResult.item);
            break;
        }
    }
};

engine2D.attachObjectsToWalls = function(floor,group) {

    if(scene2DWallGroup[floor].children[0] === undefined)
        return;

    console.log("2D Attach Objects to Walls [" + floor + "] " + group[floor].children.length);
    console.log(group[floor].children);

    for (var d = 0; d < group[floor].children.length; d++) {

        var path = group[floor].children[d]; //inside a Group()

        for (var w = 0; w < scene2DWallGroup[floor].children.length; w++) {

            var wall = scene2DWallGroup[floor].children[w];

            var intersections = wall.children[4].children[0].getIntersections(path.children[1]);
            if(intersections[0]) {
                
                var hitWallResult = wall.children[4].children[0].hitTest(intersections[0].point);
                if(group === scene2DDoorGroup)
                {
                    hitWallResult.item.doors.push(group[floor].children[d]);
                }
                else if(group === scene2DWindowGroup)
                {
                    hitWallResult.item.windows.push(group[floor].children[d]);
                }

                engine2D.angleObjectToWall(path,hitWallResult.item);
                
                //console.log(intersections[0]);
                //console.log(hitWallResult);
                //console.log(wall);

                wall.children[7].visible = false; //pivot point

                break;
            }
        }
    }
};
