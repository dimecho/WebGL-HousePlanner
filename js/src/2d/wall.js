var engine2D = window.engine2D || {};

engine2D.makeWall = function (v1,v2,c) {

/*
    if((v2.x-v1.x) < 0 || (v2.y-v1.y) < 0) //top to bottom or left to right
    {
        //revese coordinate polarity
        var v = v1;
        v1=v2;
        v2=v;
        console.log("Reversed " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
    }else{
        console.log("Normal " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y);
    }
*/
    //Find center point
    if(c.x === 0 && c.y === 0)
    {
        var p = scene2DGetWallParallelCoordinates({x: v1.x, y: v1.y},{x: v2.x, y: v2.y},0);
        c.x = p.x1 + (p.x2 - p.x1) / 2; //center
        c.y = p.y1 + (p.y2 - p.y1) / 2; //center
    }

    with (paper) {

        var group = new Group();
        var path = new Path(); //http://paperjs.org/reference/pathitem/#quadraticcurveto-handle-to
        
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
        path.name = "wall";

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

        //var raster = new Raster('../objects/FloorPlan/Default/0.png',new Point(c.x,c.y));
        //raster.fitBounds(path.bounds, false);
        //var wall = new Group([path,raster]);
        //wall.clipped = true;

        var wall = new Group([path]);
        
        group.addChild(wall);
        group.addChild(line);
        //group.addChild(circleA);
        //group.addChild(circleB);
        group.addChild(circle);
        group.addChild(pivot);
        
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
            o.moveTo(new Point(v1.x,v1.y));
            o.quadraticCurveTo(path.segments[0].point, path.segments[1].point);

            onPathDrag(this.parent,o.getLocationAt(o.length/2));
        });

        pivot.attach('mousedrag', function(event) {
            onPathDrag(this.parent,event);
        });
        //====================================
        var tick;
        path.attach('mouseenter', function() {
            //this.line.opacity = 1;
            //this.circle.opacity = 1;
            //setTimeout(function() {
                //line.opacity = 1;
                if(!this.dragging)
                {
                    line.visible = true;
                    circle.visible = true;
                }
            //}, 100);
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
            stroke: true,
            visible: true,
            tolerance: 10,
            //center: false 
        };
        */

        for (var i = 0; i < scene2DWallGroup[FLOOR].children.length; i++) {

            var s = scene2DWallGroup[FLOOR].children[i].children[0].children[0].segments; //inside a Group()
            //console.log(s);

            var b = s.length;
            for (var h = 0; h < b; h++) {

                var hitEdgeResult = scene2DWallPointGroup[FLOOR].hitTest(s[h].point);

                if (!hitEdgeResult) {

                    var circleOuterMask = new Path.Circle(s[h].point, 15);
                    var circleOuterEdge = new Path.Circle(s[h].point, 17);
                    var circleInner = new Path.Circle(s[h].point, 8);
                    var circleOuter = new CompoundPath(circleOuterMask,circleOuterEdge);
                    circleOuter.fillColor = circleInner.fillColor = '#00CC33';

                    var edge = new Group([circleInner,circleOuter]);
                    edge.attachments = [];

                    var tick;
                    edge.attach('mouseleave', function(event) {
                        //clearTimeout(tick);
                        //tick = setTimeout(function() {
                            var l = this.attachments.length;
                            for (i = 0; i < l; i++) {
                                this.attachments[i].dragging = false;
                            }
                        //}, 300);
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

                            if(this.hitTest(b)) //Fix: left to right / right to left
                            {
                                a = wall.segments[0].point;
                                b = event.point;
                            }

                            var line = wall.parent.parent.children[1];
                            var circle = wall.parent.parent.children[2];
                            var p = wall.getLocationAt(wall.length/2).point; //calculate quaadratic curve center
                            
                            circle.visible = false;

                            wall.clear();
                            wall.moveTo(a);
                            wall.quadraticCurveTo(p, b);

                            line.clear();
                            line.moveTo(a);
                            line.quadraticCurveTo(p, b);

                            wall.parent.parent.children[3].position = p; //pivot point
                        }

                        this.position = event.point; //must be last - otherwise will interfere with above logic
                        
                    });

                    scene2DWallPointGroup[FLOOR].addChild(edge);

                    //Remove 'gap' and snap the walls together

                }else{

                    //cross-check every other wall
                    for (var x = 0; x < scene2DWallGroup[FLOOR].children.length; x++) {
                        var edge = hitEdgeResult.item.parent;
                        var path = scene2DWallGroup[FLOOR].children[x].children[0].children[0];
                        if(path.hitTest(edge.position))
                        {
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


        project.layers.push(scene2DWallPointGroup[FLOOR]);
        //scene2DWallPointGroup[FLOOR].bringToFront();
    }
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

engine2D.generateFloor = function () {

    if (scene2DFloorShape === undefined) // || scene2DFloorShape.count != scene2DWallMesh[FLOOR].length)
    {
        console.log("Floor Generate " + scene2DWallGroup[FLOOR].children.length);

        for(i = 0; i < scene2DWallGroup[FLOOR].children.length; i++)
        {
            var path = scene2DWallGroup[FLOOR].children[i].children[0].children[0];

        
        }
        
    }
}
