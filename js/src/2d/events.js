
function on2DMouseDown(event) {

    event.preventDefault();
    /*
    if (event.touches && event.touches.length > 0) leftButtonDown = true;
    switch (event.button) {
        case 0:
            leftButtonDown = true;
        case 1:
            //BUTTON_MIDDLE;
        case 2:
            //BUTTON_RIGHT
    }
    */
    //if (event.which == 1) leftButtonDown = true; // Left mouse button was pressed, set flag

    if (TOOL2D == 'line')
    {
        if(scene2DDrawLine instanceof fabric.Line) {
            //console.log(scene2DWallMesh[FLOOR].length-1);
            //scene2DWallMesh[FLOOR][scene2DWallMesh[FLOOR].length-1] = scene2DMakeWall({x:scene2DDrawLine.get('x1'),y:scene2DDrawLine.get('y1')},{x:scene2DDrawLine.get('x2'),y:scene2DDrawLine.get('y2')},{x:0,y:0});
            scene2DWallMesh[FLOOR].push(scene2DMakeWall({x:scene2DDrawLine.get('x1'),y:scene2DDrawLine.get('y1')},{x:scene2DDrawLine.get('x2'),y:scene2DDrawLine.get('y2')},{x:0,y:0}));
            scene2D.add(scene2DWallMesh[FLOOR][scene2DWallMesh[FLOOR].length-1]);

            scene2D.remove(scene2DDrawLine);
            //scene2D.renderAll();
            scene2DDrawLine = null;

        }else{

            //TODO: Check for intersect objects

            var pointer = scene2D.getPointer(event);

            scene2DDrawLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                fill: 'blue',
                stroke: 'black',
                strokeWidth: 10,
                strokeLineCap: 'round',
                hasControls: false,
                selectable: false
            });
            scene2D.add(scene2DDrawLine);
        }
    }

    $('#menu2DTools').tooltipster('hide');

    //$("#HTMLCanvas").bind('mousemove', on2DMouseMove);
    // fabric.util.addListener(fabric.document, 'dblclick', dblClickHandler);
    //fabric.util.removeListener(canvas.upperCanvasEl, 'dblclick', dblClickHandler); 

    //$("#menuWallInput").hide(); //TODO: analyze and store input

    //http://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
    //===================================
    /*
        vector = new THREE.Vector3(x, y, 0.5);
        projector = new THREE.Projector();
        projector.unprojectVector(vector, camera2D);
        var dir = vector.sub(camera2D.position).normalize();
        var distance = -camera2D.position.z / dir.z;
        var pos = camera2D.position.clone().add(dir.multiplyScalar(distance));
    */

    /*
    var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 0.5), 0);
    vector = new THREE.Vector3(x, y, 0.5);
    var raycaster = projector.pickingRay(vector, camera2D);
    var pos = raycaster.ray.intersectPlane(planeZ);
    //console.log("x: " + pos.x + ", y: " + pos.y);
    //===================================

    //TODO: Make eye-candy sketcher effects from mrdoob.com/projects/harmony/

    //scene2DDrawLineGeometry.length = 0; //reset

    //if (TOOL2D == 'freestyle') {

    //scene2DDrawLineGeometry.push(event.clientX, event.clientY);
    /*
        scene2DDrawLineGeometry.push({
            x: event.clientX,
            y: event.clientY
        });
    */

    /*
        scene2DDrawLine = new Kinetic.Line({
            points: scene2DDrawLineGeometry,
            stroke: "black",
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round'
        });
    */
    /*
        scene2DDrawLine = new fabric.Line(scene2DDrawLineGeometry, {
            stroke: "#000",
            strokeWidth: 5,
            selectable: false,
            //strokeDashArray: [5, 5]
        });
    */

    //scene2DFloorContainer[FLOOR].add(scene2DDrawLine); //layer add line

    //} else if (TOOL2D == 'vector') {
    //container.style.cursor = 'crosshair';
    //}else if (TOOL2D == 'freestyle') {
    //} else {
    //container.style.cursor = 'pointer';
    //}
}

function on2DMouseUp(event) {

    event.preventDefault();

    //if (event.which == 1) leftButtonDown = false; // Left mouse button was released, clear flag

    //$("#HTMLCanvas").unbind('mousemove', on2DMouseMove);

    if (TOOL2D == 'freestyle') {

        //console.log("objects to analyze: " + scene2D.freeDrawingBrush._points);

        scene2DDrawLineGeometry.length = 0; //reset

        for (var p = 0; p < scene2D.freeDrawingBrush._points.length; p += 2) { //Convert freeDraw points into Geometry points - TODO: Simplify
            scene2DDrawLineGeometry.push({
                x: scene2D.freeDrawingBrush._points[p],
                y: scene2D.freeDrawingBrush._points[p + 1]
            });
        }
        var objects = scene2D.getObjects();
        for (var i in objects) {
            var obj = objects[i];
            //if (obj.name == "freedraw") {
            if (obj.type == "path" && obj.path.length > 5) { //avoid picking arrows which are path also
                scene2D.remove(obj);
                break;
            }
        }
        //scene2D.remove(scene2D.getActiveObject().get('freedraw'));

        //scene2D.freeDrawingBrush._reset();
        //scene2D.freeDrawingBrush._render();
        //scene2D.remove(scene2D.freeDrawingBrush);

        //http://sett.ociweb.com/sett/settJun2014.html
        /*
        var objects = scene2D.getObjects();
        for (var i in objects) { //Find object points

            var obj = objects[i];

            if (obj.type == "path" && obj.path.length > 5) { //avoid picking arrows which are path also

                //console.log(obj.name + "-" + obj.type + ":" + obj.path);

                for (var p = 0; p < obj.path.length; p++) {

                    //console.log(obj.path[p]);

                    //http://jsfiddle.net/Miggl/f2RAG/
                    switch (obj.path[p][0]) { //Convert Path to points[]
                        case 'M':
                        case 'L':
                        case 'l':
                            scene2DDrawLineGeometry.push({
                                x: obj.left + obj.path[p][1],
                                y: obj.top + obj.path[p][2]
                            });
                        case 'Q':
                            scene2DDrawLineGeometry.push({
                                x: obj.left + obj.path[p][3],
                                y: obj.top + obj.path[p][4]
                            });
                            break;
                    }

                    //console.log("(" + obj.path.length + ")" + X + "-" + Y);
                }

                scene2D.remove(obj);
                break;
            }
        }
        */
        console.log("lines to analyze: " + scene2DDrawLineGeometry.length);

        /*
        var object = {
           id:   this.id,
           remaining properties in all.js
          }
         */

        //http://stackoverflow.com/questions/19854808/how-to-get-polygon-points-in-fabric-js
        /*
        var polygon = scene2D.getObjects()[0]; //scene2D.getActiveObject(); //.id = 1;
        var polygonCenter = polygon.getCenterPoint();
        if (polygon.type === "line") {
                currentShape.set({
                    x2: pos.x,
                    y2: pos.y
                });
                canvas.renderAll();
        } else if (polygon.type === "polygon") {

            var translatedPoints = polygon.get('points').map(function(p) {
                return {
                    x: polygonCenter.x + p.x,
                    y: polygonCenter.y + p.y
                };
            });
            translatedPoints.forEach(function(p) {
                scene2D.getContext().strokeRect(p.x - 5, p.y - 5, 10, 10);
            });

            var points = polygon.get("points");
            points[points.length - 1].x = pos.x - currentShape.get("left");
            points[points.length - 1].y = pos.y - currentShape.get("top");
            currentShape.set({
                points: points
            });
            canvas.renderAll();
        }
        */

        var scene2DDrawLineArray = [];
        var arrayCount = 0;
        var sensitivityRatio = 5;

        var magicX = [];
        var magicY = [];

        var c = 0;
        //Calculate 2D walls from mouse draw
        for (var i = 0; i < scene2DDrawLineGeometry.length; i++) {

            //console.log("(" + i + ")");

            var Y_U = 0;
            var Y_D = 0;
            var Y_S = 0;

            var X_L = 0;
            var X_R = 0;
            var X_S = 0;

            var n;

            //TODO: calculate geometric angle
            //TODO: Detect circular geometry

            for (var d = 1; d <= sensitivityRatio; d++) { //how many lines-segments to analyze before determining an angle or straight line

                n = i + d;

                if (n < scene2DDrawLineGeometry.length) {

                    if ((scene2DDrawLineGeometry[i].y - 8) > scene2DDrawLineGeometry[n].y) {
                        //console.log("Y line up " + n);
                        Y_U += 1;
                    } else if ((scene2DDrawLineGeometry[i].y + 8) < scene2DDrawLineGeometry[n].y) {
                        //console.log("Y line down " + n);
                        Y_D += 1;
                    } else {
                        //console.log("Y line straight " + n);
                        Y_S += 1;
                    }
                    if ((scene2DDrawLineGeometry[i].x - 8) > scene2DDrawLineGeometry[n].x) {
                        //console.log("X line left " + n);
                        X_L += 1;
                    } else if ((scene2DDrawLineGeometry[i].x + 8) < scene2DDrawLineGeometry[n].x) {
                        //console.log("X line right " + n);
                        X_R += 1;
                    } else {
                        //console.log("X line straight " + n);
                        X_S += 1;
                    }
                    //magicNumberX += scene2DDrawLineGeometry[n].x;
                    //magicNumberY += scene2DDrawLineGeometry[n].y;

                } else {
                    n = i + d - 1;
                    break;
                }
            }

            if (Y_U > Y_D && Y_U > Y_S) {
                //console.log("Y is moving up");
                magicY[c] = "up";

            } else if (Y_D > Y_U && Y_D > Y_S) {
                //console.log("Y is moving down");
                magicY[c] = "down";

            } else {
                //console.log("Y is straight");
                magicY[c] = "straight";
            }

            if (X_L > X_R && X_L > X_S) {
                //console.log("X is moving left")
                magicX[c] = "left";
            } else if (X_R > X_L && X_R > X_S) {
                //console.log("X is moving right")
                magicX[c] = "right";
            } else {
                //console.log("X is straight")
                magicX[c] = "straight";
            }

            var arrayWalls = [];
            var arrayPoints = [];

            if (magicY[c] == "straight") { // && (magicX[c] == "right" || magicX[c] == "left")) {

                //console.log("total converted lines: " + magicY.length);

                if (magicY[c - 1] == "straight") {

                    //console.log(scene2DWallGeometry[FLOOR][scene2DWallGeometry[FLOOR].length - 1]);
                    //add new wall points
                    //scene2DWallGeometry[FLOOR].push([scene2DDrawLineGeometry[n].x, scene2DDrawLineGeometry[i].y, scene2DDrawLineGeometry[n].x, scene2DDrawLineGeometry[i].y]);

                } else {

                    //Modify wall last point (extend)
                    //var l = scene2DWallGeometry[FLOOR].length - 1;
                    //scene2DWallGeometry[FLOOR][l][2] = scene2DDrawLineGeometry[i].x;
                    //scene2DWallGeometry[FLOOR][l][3] = scene2DDrawLineGeometry[i].y;
                }

            } else if ((magicY[c] == "up" || magicY[c] == "down")) {

                if (magicY[c - 1] == "up" || magicY[c - 1] == "down") {

                    //add new wall points
                    //scene2DWallGeometry[FLOOR].push([scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[n].y, scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[n].y]);
                    //} else {

                }
            }

            i += sensitivityRatio;
            c++;
        }

        /*
        var img = new Image();
        img.src = "objects/FloorPlan/Hatch Patterns/ansi31.gif"; //pattern.toDataURL();
        $("#menuWallInput").css('left', scene2DWallGeometry[FLOOR][i][p][0]);
        $("#menuWallInput").css('top', scene2DWallGeometry[FLOOR][i][p][1]);
        $("#menuWallInput").show();
        */
    }else{
        scene2DFloorShapeGenerate();
    }
}

function on2DMouseMove(event) {

    event.preventDefault();

    //if (!leftButtonDown) {
    //    return;
    //}
    /*
    if (TOOL2D == 'line' && scene2DDrawLine instanceof fabric.Line) {
        scene2DDrawLine.set({
            x2: event.clientX,
            y2: event.clientY
        });
        scene2D.renderAll();
    }
    */

    //scene3DHouseContainer.children[0].mesh.materials[0].opacity = 0.2;

    //TweenLite.to(mesh.material, 2, {opacity: 0.2}); //TweenLite.to(object, duration, properties);
    //console.log(scene2D.getPointerPosition())
    //if (TOOL2D == 'freestyle') {
    //var mouse = canvas.getPointer(e);
    //scene2DDrawLineGeometry.push(event.clientX, event.clientY);
    /*
        scene2DDrawLineGeometry.push({
            x: event.clientX,
            y: event.clientY
        });
        */
    /*
        for (var i = 1; i < scene2DDrawLineGeometry.length; i++) {
            var line = new fabric.Line(
                [scene2DDrawLineGeometry[i].x, scene2DDrawLineGeometry[i].y, scene2DDrawLineGeometry[i + 1].x, scene2DDrawLineGeometry[i + 1].x], {
                    fill: "#000000",
                    strokeWidth: 10,
                    selectable: false
                }
            );
            scene2D.add(line);
        }
    */
    //scene2D.renderAll();

    //scene2DDrawLineGeometry.push(scene2D.getPointerPosition());

    //scene2DDrawLine.setPoints(scene2DDrawLineGeometry);
    //scene2DFloorContainer[FLOOR].drawScene();
    //}
}