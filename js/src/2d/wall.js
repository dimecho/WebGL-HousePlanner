var engine2D = window.engine2D || {};

engine2D.makeWall = function (v1,v2,c) {

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
        vectorItem = new Group(
            new Path(vectorStart, end),
            new Path(
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
            dashedItems.push(new Path.Circle(vectorStart, vector.length));
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
        var from = new Point(radius, 0);
        var through = from.rotate(vector.angle / 2);
        var to = from.rotate(vector.angle);
        var end = center + to;
        dashedItems.push(new Path.Line(center,
                center + new Point(radius + threshold, 0)));
        dashedItems.push(new Path.Arc(center + from, center + through, end));
        var arrowVector = to.normalize(7.5).rotate(vector.angle < 0 ? -90 : 90);
        dashedItems.push(new Path([
                end + arrowVector.rotate(135),
                end,
                end + arrowVector.rotate(-135)
        ]));
        if (label) {
            // Angle Label
            var text = new PointText(center
                    + through.normalize(radius + 10) + new Point(0, 3));
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
        var lengthVector = vector.normalize(
                vector.length / 2 - lengthSize * Math.sqrt(2));
        var line = new Path();
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
            var textAngle = Math.abs(vector.angle) > 90
                    ? textAngle = 180 + vector.angle : vector.angle;
            // Label needs to move away by different amounts based on the
            // vector's quadrant:
            var away = (sign >= 0 ? [1, 4] : [2, 3]).indexOf(vector.quadrant) != -1
                    ? 8 : 0;
            var text = new PointText(middle + awayVector.normalize(away + lengthSize));
            text.rotate(textAngle);
            text.justification = 'center';
            value = value || vector.length;
            text.content = (prefix || '') + Math.floor(value * 1000) / 1000;
            items.push(text);
        }
    }
    ////////////////////////////////////////////////////////////////////////////////

    /*
    if((v2.x-v1.x) < 0 || (v2.y-v1.y) < 0) //top to bottom or left to right
    {
        //revese coordinate polarity
        console.log("Reversed Before " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
        var v = v1;
        v1=v2;
        v2=v;
        console.log("Reversed " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
    }else{
        console.log("Normal " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
    }
    */

    //Find center point
    /*
    if(c.x === 0 && c.y === 0)
    {
        var p = scene2DGetWallParallelCoordinates({x: v1.x, y: v1.y},{x: v2.x, y: v2.y},0);
        c.x = p.x1 + (p.x2 - p.x1) / 2; //center
        c.y = p.y1 + (p.y2 - p.y1) / 2; //center
        //var p = o.getLocationAt(o.length/2)
    }
    */
    with (paper) {

        var group = new Group();
        var path = new Path(); //http://paperjs.org/reference/pathitem/#quadraticcurveto-handle-to
        path.doors = []; //Array holder for Doors
        path.windows = []; //Array holder for Windows

        var pivot = new Path.Circle(new Point(c.x, c.y), 10);
        pivot.fillColor = '#33CCFF';
        pivot.opacity = 0.5;

        var circle = new Path.Circle(new Point(0, 0), 8);
        circle.fillColor = '#FFCC00';
        circle.visible = false;

        path.moveTo(new Point(v1.x,v1.y));
        path.quadraticCurveTo(new Point(c.x,c.y), v2.x,v2.y);
        //path.smooth();

        var line = path.clone();
        line.strokeColor = '#00FF00';
        line.strokeWidth = 1;
        line.visible = false;

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

        if(path.length < 50)
        {
            pivot.visible = false;
            circle.visible = false;
        }
        //path.fullySelected = true;

        /*
        var circleA = new Path.Circle(new Point(v1.x,v1.y), 8);
        var circleB = new Path.Circle(new Point(v2.x,v2.y), 8);
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
        //var raster = new Raster(canvas,new Point(path.bounds.x,path.bounds.y));
        var raster = new Raster({source: '../objects/FloorPlan/Default/0.png', position: path.position});
        //raster.fitBounds(path.bounds, true);
        var wall2 = new Group([path.clone(),raster]);
        //var wall2 = new Group([raster,path.clone()]);
        wall2.clipped = true;
        */
        
        var wall = new Group([path]);

        group.addChild(wall);
        group.addChild(line);
        //group.addChild(circleA);
        //group.addChild(circleB);
        group.addChild(circle);
        group.addChild(pivot);
        //group.clipped = true;
        
        //group.id = id;
        //group.edge = [];
        /*
        insertAbove(item) //Inserts this item above the specified item.
        insertBelow(item) //Inserts this item below the specified item.
        sendToBack() //Sends this item to the back of all other items within the same parent.
        */
        project.layers.push(group);

        //====================================
        pivot.attach('mouseenter', function() {
            this.opacity = 1;
            //this.fillColor = '#909090';
            //line.visible = true;
            circle.visible = false;
        });
        pivot.attach('mouseleave', function() {
            this.opacity = 0.5;
            //this.fillColor = '#C0C0C0';
            //line.visible = false;
        });
        //pivot.attach('mousedrag', function(event) {
        //});

        pivot.attach('doubleclick', function(event) {
            var o = new Path();
            o.moveTo(path.segments[0].point);
            o.lineTo(path.segments[1].point);
            onPathDrag(this.parent,o.getLocationAt(o.length/2));
        });

        pivot.attach('mousedrag', function(event) {
            onPathDrag(this.parent,event);
        });
        //====================================
        var tick;
        path.attach('mouseenter', function() {
            //circle.opacity = 1;
            //line.opacity = 1;
            if(!this.dragging)
            {
                line.visible = true;
                circle.visible = true;
            }
        });

        path.attach('mousemove', function(event) {
            if(!this.dragging)
            {
                clearTimeout(tick);
                circle.position = this.getNearestPoint(event.point);
                tick = setTimeout(function() {
                    //line.opacity = 0;
                    line.visible = false;
                    circle.visible = false;
                }, 300);
            }
        });
        //====================================
        //path.on('mousedown', this.onMouseDown);
        //path.on('touchdown', this.onMouseDown);
        //path.on('mousedrag', this.onMouseDrag);

        //path.on('mouseenter', shiftPath);
        //path.on('mouseleave', shiftPath)''

        onPathDrag = function(parent, event) {
            //parent.dragging = true;
            parent.children[3].position = event.point;
            
            var path = parent.children[0].children[0];
            var line = parent.children[1];
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
        }

        onPathTouchDrag = function(event) {
            event.preventDefault();
            var touch = event.originalEvent.changedTouches[0];
            onPathDrag({
                clientX: touch.pageX,
                clientY: touch.pageY
            });
            return false;
        }
    }
    group.name = "wall";
    return group;
}

engine2D.calculateWallCorners = function () {

    console.log("Fix Wall Corner Geometry " + scene2DWallGroup[FLOOR].children.length);

    with (paper) {

        scene2DWallPointGroup[FLOOR] = new Group();
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
        
        var rad = (Math.PI / 180);
        var d = [45*rad,-45*rad,-135*rad,135*rad];
        var sin = Math.sin(d[0]);
        var cos = Math.cos(d[0]);

        for (var i = 0; i < scene2DWallGroup[FLOOR].children.length; i++) {

            var wall = scene2DWallGroup[FLOOR].children[i].children[0].children[0].segments; //inside a Group()
            //console.log(s);

            var b = wall.length;
            for (var h = 0; h < b; h++) {

                var hitEdgeResult = scene2DWallPointGroup[FLOOR].hitTest(wall[h].point);

                if (!hitEdgeResult) {

                    var size = new Path.Circle(wall[h].point, 35); //fake circle -> centers things in a group
                    //size.fillColor = 'red'; //DEBUG

                    var circleOuterMask = new Path.Circle(wall[h].point, 15);
                    var circleOuterEdge = new Path.Circle(wall[h].point, 17);
                    var circleInner = new Path.Circle(wall[h].point, 8);
                    var circleOuter = new CompoundPath(circleOuterMask,circleOuterEdge);
                    circleOuter.fillColor = circleInner.fillColor = '#00CC33';

                    var angleSharpFix = new Path();
                    var edge = new Group([size,angleSharpFix,circleInner,circleOuter]);
                    edge.attachments = [];
                    edge.children[2].opacity = 0;
                    edge.children[3].opacity = 0;

                    var tick;
                    edge.attach('mouseenter', function(event) {
                        //clearTimeout(tick);
                        //this.opacity = 1;
                        this.children[2].opacity = 1;
                        this.children[3].opacity = 1;
                    });
                    
                    edge.attach('mouseleave', function(event) {
                        
                        //tick = setTimeout(function() {
                            //this.opacity = 0;
                            this.children[2].opacity = 0;
                            this.children[3].opacity = 0;
                        //}, 300);
                    });

                    edge.attach('mouseup', function(event) {
                        
                        for (i = 0; i < this.attachments.length; i++)
                        {
                            this.attachments[i].dragging = false;
                            var line = this.attachments[i].parent.parent.children[1];
                            var p = this.attachments[i].getLocationAt(this.attachments[i].length/2).point; //calculate quadratic curve center
                            line.clear();
                            line.moveTo(this.attachments[i].segments[0].point);
                            line.quadraticCurveTo(p, this.attachments[i].segments[1].point);
                        }
                        //this.opacity = 0;
                        this.children[2].opacity = 0;
                        this.children[3].opacity = 0;
                    });

                    edge.attach('mousedrag', function(event) {

                        //console.log(this.attachments);

                        var l = this.attachments.length;
                        
                        for (i = 0; i < l; i++) {

                            //console.log(this.attachments[i].parent.parent);
                            //console.log(this.attachments[i]);

                            var wall = this.attachments[i];
                            wall.dragging = true;
                            //wall.visible = false; //DEBUG
                            var a = event.point;
                            var b = wall.segments[1].point;
                            var cx = wall.segments[0].point.x + wall.segments[1].point.x;
                            var cy = wall.segments[0].point.y + wall.segments[1].point.y;
                            var angle = wall.segments[0].point.subtract(wall.segments[1].point).angle;
                            var dl = wall.doors.length;

                            //Fix: left to right / right to left
                            //==================================
                            if(this.hitTest(b)){
                            //if(this.position.x == b.x ){ //quicker than hitTest?
                                //if(this.position.y == b.y){
                                    a = wall.segments[0].point;
                                    b = event.point;
                                //}
                            }
                            //==================================

                            //var line = wall.parent.parent.children[1];
                            //var circle = wall.parent.parent.children[2];
                            //circle.visible = false;

                            var p = new Point(cx/2, cy/2); //calculate quadratic curve center
                            //var p = wall.getLocationAt(wall.length/2).point; //calculate quadratic curve center


                            //line.clear();
                            //line.moveTo(a);
                            //line.quadraticCurveTo(p, b);
                            
                            if(dl > 0)
                            {
                                //==================================
                                //Move all Doors
                                var an = a.subtract(b).angle;

                                for (d = 0; d < dl; d++) {

                                    //console.log(wall.doors[d]);
                                    //wall.doors[d].applyMatrix = true;
                                    
                                    wall.doors[d].rotate(an-angle);
                                    wall.doors[d].position = p;
                                    //console.log("[" + i + "][" + d + "] " + angle + ">" + an);
                                }
                            }else{
                                //==================================
                                //Move Pivot point
                                wall.parent.parent.children[3].position = p; 
                            }

                            wall.clear();
                            wall.moveTo(a);
                            wall.quadraticCurveTo(p, b);
                            //wall.transformContent = false;

                            //console.log(angle);
                        }

                        this.position = event.point; //must be last - otherwise will interfere with above logic
                       /*
                        for (i = 0; i < l; i+=2) {
                            if(this.attachments[i+1] == undefined)
                                break;
                            var angle = engine2D.calculateWallAngle(this.attachments[i],this.attachments[i+1]);
                            this.children[6].content = Math.round(Math.abs(angle-90)) + '\xb0';
                        }
                        */
                    });

                    scene2DWallPointGroup[FLOOR].addChild(edge);

                }else{ //Remove 'gap' and snap the walls together

                    //cross-check every other wall
                    for (var x = 0; x < scene2DWallGroup[FLOOR].children.length; x++) {
                        var edge = hitEdgeResult.item.parent;
                        var path = scene2DWallGroup[FLOOR].children[x].children[0].children[0];
                        if(path.hitTest(edge.position))
                        {   
                            //if(edge.attachments)
                                edge.attachments.push(path);
                        }
                    }
                }
            }

            //if (path.contains(event.point)) {

            //console.log(scene2DWallMesh[FLOOR][i].children[0].children[0].segments[0].point);
            //console.log(scene2DWallMesh[FLOOR][i].children[0].children[0].segments[1].point);
               
            //var intersections = scene2DWallMesh[FLOOR][i].children[0].children[0].getIntersections(path1);
            //console.log(intersections[0].point);
            
            //console.log(scene2DWallMesh[FLOOR][i].children[0].children[0].segments);
            //var intersections = path1.getIntersections(path2);
        }

        
        for (var i = 0; i < scene2DWallPointGroup[FLOOR].children.length; i++) {

            var edge = scene2DWallPointGroup[FLOOR].children[i];

            for (a = 0; a < edge.attachments.length; a+=2) {

                if(edge.attachments[a+1] == undefined)
                    break;

                //console.log(edge.position);

                //Fix the cutoff corners
                //======================
                edge.children[1].add(new Point(edge.position.x - 10,edge.position.y-10));
                edge.children[1].add(new Point(edge.position.x - 10,edge.position.y+10));
                edge.children[1].add(new Point(edge.position.x + 10,edge.position.y+10));
                edge.children[1].closed = true;
                //edge.children[1].fillColor = 'red'; //DEBUG
                //======================
                /*
                var hitEdgeResult = scene2DWallPointGroup[FLOOR].hitTest(edge.position);
                if (!hitEdgeResult) {

                }else{

                }
                */

                var box = edge.bounds.width/2;
                var l1 = new Path()
                var l2 = new Path();
                var arc = new Path.Arc();
                var text = new PointText();

                if(edge.attachments[a].length > box && edge.attachments[a+1].length > box)
                {
                    //console.log(edge.bounds.topLeft);

                    var p1 = edge.bounds.center;
                    var p2 = edge.attachments[a].getLocationAt(box).point;
              
                    if(edge.position.subtract(p2).length > box) //deal with reversed lines
                        p2 = edge.attachments[a].getLocationAt(edge.attachments[a].length-box).point;

                    l1 = new Path.Line(p1, p2);
                    l2 = l1.clone(); //new Path.Line(p1, edge.attachments[a+1].getLocationAt(40).point);
                    
                    var x = edge.bounds.center.x - (25*sin);
                    var y = edge.bounds.center.y - (25*cos);

                    //DEBUG
                    //var l = new Path.Line(edge.attachments[a].segments[0].point, edge.attachments[a+1].segments[1].point);
                    //l.strokeColor = 'red';

                    //l1.rotate(angle1);
                    //l2.rotate(angle2);

                    arc = new Path.Arc(l1.segments[1].point, new Point(x,y), l2.segments[1].point);
             
                    l1.strokeColor = l2.strokeColor = arc.strokeColor = '#00CC33';
                    l1.strokeWidth = l2.strokeWidth = arc.strokeWidth = 1;

                    //l2.strokeColor ='red'; //DEBUG

                    //scene2DWallAngleGroup[FLOOR].addChild(new Group([l1,l2,arc]));

                    //edge.fillColor = '#00CC33';
                    //edge.center = edge.position;
         
                    var angle = engine2D.calculateWallAngle(edge.attachments[a],edge.attachments[a+1]);

                    l2.rotate(angle,l2.segments[0].point);

                    //TODO: do a hitTest to floor suface (internal angles only)
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

     
                    for (z = 0; z < d.length; z++) { //Go around the circle to find inside points

                        sin = Math.sin(d[z]);
                        cos = Math.cos(d[z]);
                        x = edge.bounds.center.x - (40*sin);
                        y = edge.bounds.center.y - (40*cos);
                        if (scene2DFloorShape.hitTest(new Point(x,y))) {
                            //var ci = new Path.Circle(new Point(x,y), 5); //DEBUG
                            //ci.fillColor = 'yellow'; //DEBUG
                            console.log("Wall" + i + " floor inside hit @ " + d[z] * 180 / Math.PI);
                            break;
                        }
                    }

                    text = new PointText(new Point(x,y));
                    //text.content = Math.abs(angle) + '\xb0';
                    text.justification = 'center';
                }

                edge.addChild(l1);
                edge.addChild(l2);
                edge.addChild(arc);
                edge.addChild(text);
            }
        }

        project.layers.push(scene2DWallPointGroup[FLOOR]);
        //scene2DWallPointGroup[FLOOR].bringToFront();
    }
}

engine2D.calculateWallAngle = function (l1,l2) {

    var angle1 = l1.segments[0].point.subtract(l1.segments[1].point).angle;
    var angle2 = l2.segments[0].point.subtract(l2.segments[1].point).angle;
    var angle = angle1-angle2;

    //TODO: do a hitTest to floor suface (internal angles only)
    //if(angle > 180)
    //    angle = 360 - angle;

    return angle;
}

engine2D.drawWalls = function () {

    with (paper) {

        var values = {
            radius: 0,
            tolerance: 5
        };

        var handle;
        
        var min = values.radius * 2;
        if (values.tolerance < min) values.tolerance = min;
            handle = values.radius * Numerical.KAPPA;
        
        var path;
        function onMouseDown(event) {
            path = new Path({
                segments: [event.point, event.point],
                strokeColor: 'black',
                strokeWidth: 5,
                strokeCap: 'round'
            });
            prevPoint = path.firstSegment.point;
            curPoint = path.lastSegment.point;
            curHandleSeg = null;
        }

        var curPoint, prevPoint, curHandleSeg;
        function onMouseDrag(event) {
            var point = event.point;
            var diff = (point - prevPoint).abs();
            if (diff.x < diff.y) {
                curPoint.x = prevPoint.x;
                curPoint.y = point.y;
            } else {
                curPoint.x = point.x;
                curPoint.y = prevPoint.y;
            }
            var normal = curPoint - prevPoint;
            normal.length = 1;
            if (curHandleSeg) {
                curHandleSeg.point = prevPoint + (normal * values.radius);
                curHandleSeg.handleIn = normal * -handle;
            }
            var minDiff = Math.min(diff.x, diff.y);
            if (minDiff > values.tolerance) {
                var point = curPoint - (normal * values.radius);
                var segment = new Segment(point, null, normal * handle);
                path.insert(path.segments.length - 1, segment);
                curHandleSeg = path.lastSegment;
                // clone as we want the unmodified one:
                prevPoint = curHandleSeg.point.clone();
                path.add(curHandleSeg);
                curPoint = path.lastSegment.point;
            }
        }
    }
}


