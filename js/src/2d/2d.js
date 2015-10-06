function scene2DZoom(SCALE_FACTOR) {

    /*
    http://jsfiddle.net/Q3TMA/
    http://jsfiddle.net/butch2k/kVukT/37/
    */
    //console.log(SCALE_FACTOR);
    
    scene2D.setHeight(scene2D.getHeight() * SCALE_FACTOR);
    scene2D.setWidth(scene2D.getWidth() * SCALE_FACTOR);
    scene2D.calcOffset();              
    
    var objects = scene2D.getObjects();
    for (var i in objects)
    {
        var obj = objects[i];
        obj.scaleX=obj.scaleX/zoom2D*SCALE_FACTOR;
        obj.scaleY=obj.scaleY/zoom2D*SCALE_FACTOR;
        obj.left=obj.left/zoom2D*SCALE_FACTOR;
        obj.top=obj.top/zoom2D*SCALE_FACTOR;
        //obj.setCoords();
    }
    scene2D.renderAll();
    
    zoom2D = SCALE_FACTOR;
}

/*
box.on("dragend", function(){
    snaptogrid(box);
  });
*/
function snaptogrid(object) {
    object.x = Math.floor(object.x / 100) * 100 + 50;
    object.y = Math.floor(object.y / 100) * 100 + 50;
}

function scene2DMakeGrid(canvas2D, grid,color) {

    /*
    for (var x = 0; x <= scene2D.getWidth(); x += 25) {
        scene2D.add(new fabric.Line([x, 0, x, scene2D.getWidth()], {
            stroke: "#6dcff6",
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
        }));
        scene2D.add(new fabric.Line([0, x, scene2D.getWidth(), x], {
            stroke: "#6dcff6",
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
        }));
    }
    */

    for (var i = 0; i < (canvas2D.getWidth() / grid); i++) {
        canvas2D.add(new fabric.Line([i * grid, 0, i * grid, canvas2D.getWidth()], {
            stroke: color,
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
            name: 'vline'
        }));
        canvas2D.add(new fabric.Line([0, i * grid, canvas2D.getWidth(), i * grid], {
            stroke: color,
            strokeWidth: 1,
            selectable: false,
            //strokeDashArray: [5, 5]
            name: 'hline'
        }));
    }
}

function scene2DMakeWall(v1,v2,c,id,i) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    if(i === null)
        i = FLOOR;

    if( v2.x-v1.x < 0 || v2.y-v1.y < 0) //top to bottom or left to right
    {
        //revese coordinate polarity
        var v = v1;
        v1=v2;
        v2=v;
        console.log("Reversed " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y + " (" + id + ")");
    }else{
        console.log("Normal " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y + " (" + id + ")");
    }

    //Find center point
    if(c.x === 0 && c.y === 0)
    {
        var p = scene2DGetWallParallelCoordinates({x: v1.x, y: v1.y},{x: v2.x, y: v2.y},0);
        c.x = p.x1 + (p.x2 - p.x1) / 2; //center
        c.y = p.y1 + (p.y2 - p.y1) / 2; //center
    }
    /*
    Quadratic Curve
    http://fabricjs.com/quadratic-curve/
    */
    var line = new fabric.Path('M 0 0 Q 0 0 0 0', { fill: null });
    line.path[0][1] = v1.x;
    line.path[0][2] = v1.y;
    line.path[1][1] = c.x; //curve left
    line.path[1][2] = c.y; //curve right
    line.path[1][3] = v2.x;
    line.path[1][4] = v2.y;

    //TODO: parallel quadratic curves as shape with pattern
    /*
    fabric.util.loadImage('objects/FloorPlan/Brick/americanbond.gif', function(img) {
      line.fill = new fabric.Pattern({
        source: img,
        repeat: repeat
      });
      scene2D.renderAll();
    });
    */

    /*
    Curved Walls
    http://www.svgbasics.com/paths.html
    */
    /*
    var line = new fabric.Path('M ' + coords[0] + ' ' + coords[1] + ' L ' + coords[2] + ' ' + coords[3], { fill: '', strokeWidth: 12, stroke: 'black' });
    for (var p = 0; p < line.path.length; p++)
    {
        switch (line.path[p][0]) { //Convert Path to points[]
            case 'M':
            case 'L':
            console.log(line.path[p][1] + ' ' + line.path[p][2]);
            //case 'Q':
            break;
        }
    }
    */
    
    var array = [];

    //item(0) + item(1) Quandratic Curve Vector Path
    //Fix for fabric.js 1.5.0 - Must have proper Array with type:"path"
    //this strangely happen only after clone()
    line.clone(function (clone) {
        clone.set({left: 0, top: 0});
        clone.set({stroke: 'black', strokeWidth: 12});
        //clone.set({selectable:true, hasControls: false, name:'wall'});
        //clone.perPixelTargetFind = true;
        //clone.targetFindTolerance = 4;
        array.push(clone);
    });
    line.clone(function (clone) {
        clone.set({left: 0, top: 0});
        clone.set({opacity: 0, stroke: '#00FF00', strokeWidth: 2});
        //console.log(line);
        //console.log(clone);
        array.push(clone);
    });

    //item(2) - Dynamic Split Visual Circle
    var c = new fabric.Circle({
        opacity: 0,
        left: 0,
        top: 0,
        strokeWidth: 2,
        radius: 8,
        fill: 'yellow',
        stroke: 'red'
    });
    array.push(c);

    //item(3) - Measurement Line
    var l = new fabric.Line([0, 0, 1, 0], {
        //opacity: 0,
        left: 0,
        top: 0,
        stroke: '#505050',
        strokeWidth: 2,
        angle: 0
    });
    array.push(l);
    /*
    var l_l = new fabric.Circle({
        //opacity: 0,
        left: 0,
        top: 0,
        radius: 3,
        fill: '#505050',
    });
    */
    var l_l = new fabric.Line([0, 0, 8, 0], {
        left: 0,
        top: 0,
        stroke: '#000000',
        strokeWidth: 2
    });
    var l_r = l_l.clone();
    array.push(l_l); //item(4) 
    array.push(l_r); //item(5) 

    //item(6) - Measurement Text Background
    var r = new fabric.Rect({
        //opacity: 0,
        left: 0,
        top: 0,
        fill: '#ffffff',
        width: 35,
        height: 20,
        angle: 0
    });
    array.push(r);

    //item(7) - Measurement Text
    var t = new fabric.Text("", {
        //opacity: 0,
        left: 0,
        top: 0,
        fontFamily: 'helvetiker',
        fontWeight: 'normal',
        textAlign: 'left', //required
        //fill: '#ffffff',
        fontSize: 15,
        angle: 0
    });
    array.push(t);
    
    /*
    for (var d = 0; d < scene2DDoorMesh[i].length; d++) { //each door

        if(id == scene2DDoorMesh[i][d].id) //attched to walls by matching id)
        {
            group.push(scene2DDoorMesh[i][d]);
        }
    }
    */
    var group = new fabric.Group(array, {selectable:false, hasBorders: false, hasControls: false, name:'wall', id:id, width: 2000});
    group.edge = [];
    //group.perPixelTargetFind = true;
    //group.targetFindTolerance = 4;

    return group;
}

function scene2DMakeWindow(v1,v2,c,z,open,direction,id) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    //v2.x = v2.x - v1.x;
    //v2.y = v2.y - v1.y;

    var group = [];

    var line1 = new fabric.Line([0, 0, v2.x, v2.y], {
        stroke: '#f5f5f5',
        strokeWidth: 18
    });

    var line2 = new fabric.Line([0, 0, v2.x, v2.y], {
        stroke: '#000000',
        strokeWidth: 4,
        name:'window-frame'
    });

    var group = new fabric.Group([line1,line2], {selectable:true, hasBorders:false, hasControls:false, name:'window', z:z, open:open, direction:direction, id:id});
    group.origin = v1;

    /*
    if(open == "bay")
    {
        if(direction == "in")
        {
        }else{
        }
    }
    */

    return group;
}

function scene2DMakeDoor(v1,v2,c,z,open,direction,id) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    //Debug adjust
    //v1 = {x:v1.x+40,y:v1.y};
    //v2 = {x:v1.x+100,y:v1.y};

    //v2.x = v2.x - v1.x;
    //v2.y = v2.y - v1.y;

    //TODO: lock/hide wall curve if door is present
    //var angle = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI;

    var swing = scene2DLineLength(0,0,v2.x,v2.y);
    
    var array = [];

    //var line1 = new fabric.Line([v1.x, v1.y, v2.x, v2.y], {
    var line1 = new fabric.Line([0, 2, v2.x, 2], {
        stroke: '#f5f5f5',
        strokeWidth: 20
    });

    var line2 = new fabric.Line([0, 4, v2.x, 4], {
        stroke: '#000000',
        strokeWidth: 4,
        name: "door-frame"
    });

    array.push(line1); //item(0)
    array.push(line2); //item(1)
    
    var hinge = [0,0,0,0];
    var startAngle = Math.PI/2;
    var endAngle = Math.PI;

    if(open == "double")
    {

    }
    else if(open == "right")
    {
        if(direction == "in")
        {
            hinge = [v2.x, v2.y, v2.x, v2.y+swing];
        }else{
            hinge = [v2.x, v2.y, v2.x, v2.y-swing];
            startAngle = 0-Math.PI;
            endAngle = 0-Math.PI/2;
        }
    }
    else if(open == "left")
    {
        if(direction == "in")
        {
            startAngle = 0;
            endAngle = Math.PI/2;
        }else{
            startAngle = 0-Math.PI/2;
            endAngle = 0;
        }
    }

    var line3 = new fabric.Line(hinge, {
        stroke: '#000000',
        strokeWidth: 2
    });
    array.push(line3); //item(2)

    var arc1 = new fabric.Circle({
        radius: swing-1,
        left: hinge[0],
        top: hinge[1],
        //angle: offsetAngle,
        hasBorders: false,
        startAngle: startAngle,
        endAngle: endAngle,
        stroke: '#000000',
        strokeDashArray: [5, 5],
        strokeWidth: 2,
        fill: '',
        name: "door-swing"
    });
    array.push(arc1); //item(3)

    //Interactive Adjusting lines TODO: add mobileFix
    var line4 = new fabric.Line([0, -6, 0, 15], {
        //stroke: '#00CC00', //green
        stroke: '#000000', //black
        strokeWidth: 6,
        //name: "door-adjust-left"
    });
    var line5 = new fabric.Line([v2.x, -6, v2.x, 15], {
        //stroke: '#00CC00', //green
        stroke: '#000000', //black
        strokeWidth: 6,
        //name: "door-adjust-right"
    });
    array.push(line4); //item(4)
    array.push(line5); //item(5)
    
    var c = new fabric.Circle({
        opacity: 0,
        left: hinge[2],
        top: hinge[3],
        strokeWidth: 2,
        radius: 8,
        fill: '#ADFF2F',
        stroke: '#6B8E23',
    });
    array.push(c); //item(6)
    
    var group = new fabric.Group(array, { selectable: true, hasBorders: false, hasControls: false, name:'door', z:z, open:open, direction:direction, id:id});
    group.origin = v1;
    group.moving = false;
    group.on("moving", function () {

        if(group.lockMovementX) //precaution
            return;

        if(!group.moving){
            group.moving = true;
            clearTimeout(clickTime);
            //console.log(group);
        }else{
            //TODO: Find closest line
            for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++)
            {
                if(!scene2D.isTargetTransparent(scene2DWallMesh[FLOOR][i].selector, group.left, group.top)){ //|| !scene2D.isTargetTransparent(scene2DWallMesh[FLOOR][i].selector, group.left-group.width/2, group.top)){
                    //console.log(scene2DWallMesh[FLOOR][i].id);
                    var v1 = {x:scene2DWallMesh[FLOOR][i].item(0).path[0][1],y:scene2DWallMesh[FLOOR][i].item(0).path[0][2]};
                    var v2 = {x:scene2DWallMesh[FLOOR][i].item(0).path[1][3],y:scene2DWallMesh[FLOOR][i].item(0).path[1][4]};
                    var a = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI; //TODO: ifficiency rememmber angle on 'edge' move
                    var percent = (group.left - v1.x) / (v2.x - v1.x); //0.20; //flip based on window height
                    //console.log(percent);
                    group.set(scene2DgetLineXYatPercent(v1,v2,percent));
                    group.set({angle:a});
                    break;
                }else{
                    group.set({angle:0});
                }
            }
        }
    });

    group.on("selected", function () {
        //group.adjustcircle.set({opacity:0});
        c.set({opacity:0});
        //console.log("");
        group.moving = false; //TODO: do this on mouseup

        //console.log(scene2D.activeObject);
        //console.log(scene2D.activeGroup);
        //var g = scene2D.getActiveGroup()
        //var obj = g.getObjects()
        //var pointer = canvas.getPointer(e.e);
        //var activeObj = scene2D.getActiveObject();
        //console.log(mouse.x + ":" + mouse.y + " " + activeObj.left + ":" + activeObj.top)
        //if (Math.abs(mouse.y - activeObj.top) > 80)
        //{
        //    console.log("green circle");
        //}else{

            clickTime = setTimeout(function() {
                window.location = "#open2DDoorWindowAdjust";
                //============================
                scene2DAdvanced = new fabric.Canvas('fabricjs2', {
                    isDrawingMode: false,
                    isTouchSupported: true,
                    width: window.innerWidth*0.8-40, //80%
                    height: window.innerHeight*0.75-20 //75%
                });
                scene2DMakeGrid(scene2DAdvanced, 20,'#6dcff6');
                //scene2DMakeGrid(scene2DAdvanced, 20,'#E0E0E0');
                //============================

                //...Sample front facing wall
                //============================
                scene2DDrawLine = new fabric.Line([200, 80, 850, 80], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);
                scene2DDrawLine = new fabric.Line([200, 80, 200, 500], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);
                scene2DDrawLine = new fabric.Line([850, 80, 850, 500], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);
                scene2DDrawLine = new fabric.Line([200, 500, 850, 500], {
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 10,
                    strokeLineCap: 'round',
                    hasControls: false,
                    selectable: false
                });
                scene2DAdvanced.add(scene2DDrawLine);

                scene2DDrawLine = new fabric.Rect({
                  left: 450,
                  top: 345,
                  fill: '#ffffff',
                  stroke: 'black',
                  width: 180,
                  height: 300,
                });
                scene2DAdvanced.add(scene2DDrawLine);
                //============================
            }, 500);
        //}
        scene2D.bringToFront(group);
        scene2D.setActiveObject(arc1); //fabric.js event fix - allow multiple clicks
    });
    
    return group;
}

function scene2DMakeWallSelect(v1,v2,line,pivot)
{
    //console.log(v1.x + ":" + v1.y + " " + v2.x + ":" + v2.y);

    //wall selectable"invisible" line
    var r = new fabric.Line([0, 0, v2.x-v1.x, v2.y-v1.y], {
        left: pivot.left,
        top: pivot.top,
        stroke: 'white',
        opacity: 0.1,
        //stroke: 'yellow',
        //opacity: 0.8,
        strokeWidth: 40,
        selectable: true, 
        hasBorders: false, //true,
        hasControls: false, 
        hoverCursor: 'pointer',
        name: 'wallselect'
    });
    r.perPixelTargetFind = true;
    r.targetFindTolerance = 4;

    r.line = line;
    r.pivot = pivot;

    r.on("selected", function () {
        //console.log(r.line.item(2).left + ":" + r.line.item(2).top);
        scene2D.setActiveObject(line); //fabric.js event fix - allow multiple clicks
    });

    return r;
}

function scene2DMakeWallEdgeAngle(v1,v2,v3) {

    //TODO: Include offsets for Qudratic Curve
    //TODO: Dependent on zoom

    //var a = find2DAngle(v1,v2,v3); console.log("Angle:" + (((a* 180 / Math.PI)*100)>>0)/100);
    var scale = 0;
    var w = 50;
    var n1 = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);
    var n2 = scene2DLineLength(v3.x,v3.y,v2.x,v2.y);
    /*
    if(n1 < w || n2 < w) //too small for display
    {
        return new fabric.Group([line], {selectable: false});
    }
    */

    scale = w / n1; //calculate ratio for constant line scale
    //============ LERP Formula ==============
    //start.x + (final.x - start.x) * progress;
    var L1x = v2.x + (v2.x - v1.x) * scale;
    var L1y = v2.y + (v2.y - v1.y) * scale;
    //========================================

    scale = w / n2; //calculate ratio for constant line scale
    //============ LERP Formula ==============
    //start.x + (final.x - start.x) * progress;
    var L2x = v2.x + (v2.x - v3.x) * scale;
    var L2y = v2.y + (v2.y - v3.y) * scale;
    //========================================

    /*
    http://stackoverflow.com/questions/4196749/draw-arc-with-2-points-and-center-of-the-circle
    */
    var startAngle = Math.atan2(L2y-v2.y, L2x-v2.x);
    var endAngle = Math.atan2(L1y-v2.y, L1x-v2.x);
   
    var t = startAngle + (endAngle - startAngle)/2;
    if(endAngle > startAngle) //always point towards center
        t = t + Math.PI;

    var offsetAngle = 180;

    //console.log(startAngle + ":" + endAngle);

    var arc = new fabric.Circle({
        radius: w - 1,
        left: v2.x,
        top: v2.y,
        //angle: offsetAngle,
        startAngle: startAngle, //Math.abs(startAngle),
        endAngle: endAngle, //Math.abs(endAngle),
        stroke: '#ff6600',
        strokeWidth: 2,
        fill: ''
    });

    var line1 = new fabric.Line([v2.x,v2.y,L1x,L1y], {
        stroke: '#ff6600',
        strokeWidth: 2
    });

    var line2 = new fabric.Line([v2.x, v2.y,L2x, L2y], {
        stroke: '#ff6600',
        strokeWidth: 2
    });

    //http://www.cufonfonts.com
    var text = new fabric.Text(Math.round(find2DAngle(v1,v2,v3) * 180 / Math.PI) + '°', {
        left: -30 * Math.cos(t) + v2.x,
        top: -30 * Math.sin(t) + v2.y,
        fontFamily: 'helvetiker',
        fontWeight: 'normal',
        textAlign: 'left', //required
        fontSize: 15,
        fill: '#505050',
        angle: offsetAngle
    });

    return new fabric.Group([line1, line2, arc, text], {selectable: false, angle:offsetAngle, name:'angle'});
}

function scene2DRemoveWallEdgeCircle(id) {
    console.log(id);

    //var objects = canvas.getObjects(canvas.getActiveGroup);

    var objects = scene2D.getObjects();
    for (var i in objects)
    {
        var obj = objects[i];
        if(obj.id == id)
        {
            scene2D.remove(obj);
            //TODO: History Record
            //TODO: remove walls coordinates

            break;
        }
    }

    return false; //href="#" fix
}

function scene2DResetPivot(id) {

    var objects = scene2D.getObjects();
    for (var i in objects)
    {
        var obj = objects[i];
        if(obj.id == id)
        {
            var pivot = scene2DGetCenterPivot({x:obj.wall.item(0).path[0][1],y:obj.wall.item(0).path[0][2]},{x:obj.wall.item(0).path[1][3],y:obj.wall.item(0).path[1][4]});
            $('#menu2DTools').tooltipster('hide');
            obj.wall.item(0).path[1][1] = pivot.x; obj.wall.item(0).path[1][2] = pivot.y;
            obj.left = pivot.x; obj.top = pivot.y;
            break;
        }
    }
    return false; //href="#" fix
}

function scene2DLockObject(id) {

    var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
        if(result[0].lockMovementX === true)
        {
            result[0].item(2).set({visible:false});
            result[0].set({lockMovementX:false,lockMovementY:false});
        }else{
            result[0].item(2).set({visible:true});
            result[0].set({lockMovementX:true,lockMovementY:true});
        }
    //}

    return false; //href="#" fix
}

function scene2DSplitWallEdgeCircle(id) {

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

    //}
    return false; //href="#" fix
}

function scene2DJoinWallEdgeCircle(id) {

    var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
        //A bit more tricky ..nned to get "closes" edgeCircle and pick parameters from.
    //}
    return false; //href="#" fix
}

function scene2DMakeWallEdgeCircle(left, top, lock) {

    var mobileFix = new fabric.Circle({
      left: 0,
      top: 0,
      radius: 40,
      fill: '',
    });

    var c = new fabric.Circle({
        left: 0,
        top: 0,
        strokeWidth: 5,
        radius: 12,
        fill: '#fff',
        stroke: '#666',
    });

    var img = new Image();
    img.src = 'images/lock.png';

    var i = new fabric.Image(img, {
        left: 0,
        top: 0,
        width: 10,
        height: 12,
        opacity: 0.6,
        visible: false,
    });

    var group = new fabric.Group([mobileFix, c, i], {left: left, top: top, selectable: true, hasBorders: false, hasControls: false, name: 'edge', id:Math.random().toString(36).substring(7), lockMovementX:lock, lockMovementY:lock});
    group.line = [];
    group.pivot = [];
    group.bend = [];
    group.doors = [];
    group.windows = [];
    group.moving = false;

    group.on("selected", function () {
        group.moving = false; //TODO: do this on mouseup
        clickTime = setTimeout(function() {
            $('#menu2DTools').tooltipster('update', '<a href="#" onclick="scene2DRemoveWallEdgeCircle(\'' + group.id + '\')" class="lo-icon icon-delete" style="color:#FF0000"></a><a href="#" onclick="scene2DLockObject(\'' + group.id + '\')" class="lo-icon icon-lock" style="color:#606060"></a><a href="#" onclick="scene2DSplitWallEdgeCircle(\'' + group.id + '\')" class="lo-icon icon-cut" style="color:#606060"></a><a href="#" onclick="scene2DJoinWallEdgeCircle(\'' + group.id + '\')" class="lo-icon icon-join" style="color:#606060"></a>');
            $('#menu2DTools').css({ left: group.left, top: group.top });
            $('#menu2DTools').tooltipster('show');
        }, 500);

        //group.setCoords();
        var v = {x:group.left,y:group.top};
        for (var i = 0; i < group.line.length; i++)
        {
            group.line[i].item(1).set({opacity:0}); //unhighlight attached wall
            //group.line[i].reversed = false;
            //if(group.bend[i]){
            //    scene2D.remove(group.bend[i]);
            //}
            var v1 = {x:group.line[i].item(0).path[0][1],y:group.line[i].item(0).path[0][2]};
            var v2 = {x:group.line[i].item(0).path[1][3],y:group.line[i].item(0).path[1][4]};

            if(Math.abs(v.x - v2.x) < Math.abs(v.x - v1.x) || Math.abs(v.y - v2.y) < Math.abs(v.y - v1.y) ){ //top to bottom or left to right
                group.line[i].reversed = true;
            }
        }
        scene2D.bringToFront(group);
        scene2D.setActiveObject(group.line[0]); //fabric.js event fix - allow multiple clicks
    });
    group.on("moving", function () {

        if(group.lockMovementX) //precaution
            return;
        
        if(!group.moving){
            clearTimeout(clickTime);
            group.moving = true;
        }else{

            for (var i = 0; i < group.line.length; i++)
            {
                //var pivot = scene2DGetCenterPivot(v1,v2); //Original
                //console.log("[" + i + "] " + group.line[i].id)
                
                if(group.line[i].reversed)
                {
                    group.line[i].item(0).path[1][3] = group.left;
                    group.line[i].item(0).path[1][4] = group.top;
                }else{
                    group.line[i].item(0).path[0][1] = group.left;
                    group.line[i].item(0).path[0][2] = group.top;
                }

                var v1 = {x:group.line[i].item(0).path[0][1],y:group.line[i].item(0).path[0][2]};
                var v2 = {x:group.line[i].item(0).path[1][3],y:group.line[i].item(0).path[1][4]};
                var v3 = {x:group.line[i].item(0).path[1][1],y:group.line[i].item(0).path[1][2]};

                
                var n = scene2DCalculateWallLength(v1,v2,v3,group.line[i]);
                scene2DGroupArrayDynamicPosition(v1,v2,n,[group.line[i].doors,group.line[i].windows]);

                //======= Pivot curvature ==========
                //if(p.line[i].item(0).path[1][1] == pivot.x && p.line[i].item(0).path[1][2] == pivot.y)
                //{
                    var pivot = scene2DGetCenterPivot(v1,v2); //New
                    group.line[i].item(0).path[1][1] = pivot.x;
                    group.line[i].item(0).path[1][2] = pivot.y;
                    if(group.line[i].pivot)
                    {
                        group.line[i].pivot.left = pivot.x;
                        group.line[i].pivot.top = pivot.y;
                    }
                    //p.pivot[i].setCoords();
                //}

                // ====== Very fast floor shapre correction ===
                if (scene2DFloorShape)
                {
                    var c = group.wallid + i;
                    if(!scene2DFloorShape.path[c])
                        c=0;

                    scene2DFloorShape.path[c][1] = pivot.x; //cx
                    scene2DFloorShape.path[c][2] = pivot.y; //cy
                    scene2DFloorShape.path[c][3] = v2.x; //x2 
                    scene2DFloorShape.path[c][4] = v2.y; //y2
                }
            }
        }
        //scene2D.renderAll();
    });
    return group;
}

function scene2DJoinLines()
{
        //Two Dimentional Search
    for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++) { //each floor wall
        
        //var intersects = new Array();
        
        var edgepoint = [[],[]];
        //edgepoint.push(new Array());
        //edgepoint.push(new Array());

        var x1 = scene2DWallMesh[FLOOR][i].item(0).path[0][1];
        var x2 = scene2DWallMesh[FLOOR][i].item(0).path[1][3];
        var cx = scene2DWallMesh[FLOOR][i].item(0).path[0][1];
        var cy = scene2DWallMesh[FLOOR][i].item(0).path[0][2];
        var y1 = scene2DWallMesh[FLOOR][i].item(0).path[0][2];
        var y2 = scene2DWallMesh[FLOOR][i].item(0).path[1][4];
        var v3 = {x: cx, y: cy};
        var v2 = {x: x2, y: y2};
        var v1 = {x: x1, y: y1};

        for (var x = 0; x < scene2DWallMesh[FLOOR].length; x++) { //each other floor wall
            //https://github.com/kangax/fabric.js/issues/601
            //if(scene2DWallMesh[FLOOR][i].id != scene2DWallMesh[FLOOR][x].id)
            //{
                var target = scene2DWallMesh[FLOOR][x].item(0);

                //TODO: find more efficient way of detecting collisions

                if(!scene2D.isTargetTransparent(target, x1-4, y1-4) || !scene2D.isTargetTransparent(target, x1-4, y1+4) || !scene2D.isTargetTransparent(target, x1+4, y1-4) || !scene2D.isTargetTransparent(target, x1+4, y1+4)){
                //if (scene2DWallMesh[FLOOR][i].item(0).intersectsWithObject(scene2DWallMesh[FLOOR][x].item(0).path)) {
                    //console.log(scene2DWallMesh[FLOOR][x].id + " intersects " + scene2DWallMesh[FLOOR][i].id  + " " + x1 + ":" + y1);
                    edgepoint[0].push(scene2DWallMesh[FLOOR][x]);
                }
                
                if(!scene2D.isTargetTransparent(target, x2-4, y2-4) || !scene2D.isTargetTransparent(target, x2-4, y2+4) || !scene2D.isTargetTransparent(target, x2+4, y2-4) || !scene2D.isTargetTransparent(target, x2+4, y2+4)){
                    edgepoint[1].push(scene2DWallMesh[FLOOR][x]);
                }
            //}
        }

        var edge = [];
        var edgeComplete = false;
        var angle;
        var pivot = scene2DMakeWallCurvedPivot(v1,v2,scene2DWallMesh[FLOOR][i],false);
        var selector = scene2DMakeWallSelect(v1,v2,scene2DWallMesh[FLOOR][i],pivot);
        var n = scene2DCalculateWallLength(v1,v2,v3,scene2DWallMesh[FLOOR][i]);
        pivot.wallid = i+1;

        for (var x = 0; x < scene2DWallMesh[FLOOR].length; x++) {
           
            var eA = scene2DWallMesh[FLOOR][x].edgeA;
            var eB = scene2DWallMesh[FLOOR][x].edgeB;
            if(eA && eB)
            {
                if((eA.left == x1 && eA.top == y1) || (eA.left == x2 && eA.top == y2) || (eB.left == x1 && eB.top == y1) || (eB.left == x2 && eB.top == y2)) // && scene2DWallMesh[FLOOR][x].edge[0])
                {
                    console.log(scene2DWallMesh[FLOOR][x].id + " [0] already complete");
                    edgeComplete = true;
                    break;
                }
            }
        }

        if(!edgeComplete) //Avoid duplicates
        {
            edge[0] = scene2DMakeWallEdgeCircle(x1, y1, false);
            edge[0].line = [];
            edge[0].bend = [];
            edge[0].wallid = i;
            scene2DWallMesh[FLOOR][i].edgeA = edge[0]; //cross refference
            for (var e = 0; e < edgepoint[0].length; e++) {
                //console.log("[0][" + i + "] " + scene2DWallMesh[FLOOR][i].id + " intersects " + edgepoint[0][e].id);
                edge[0].line.push(edgepoint[0][e]);
            }
            scene2D.add(edge[0]);

            edge[1] = scene2DMakeWallEdgeCircle(x2, y2, false);
            edge[1].line = [];
            edge[1].bend = [];
            edge[1].wallid = i+1;
            scene2DWallMesh[FLOOR][i].edgeB = edge[1]; //cross refference
            for (var e = 0; e < edgepoint[1].length; e++) {
                //console.log("[1][" + i + "] " + scene2DWallMesh[FLOOR][i].id + " intersects " + edgepoint[1][e].id);
                edge[1].line.push(edgepoint[1][e]);
            }
            scene2D.add(edge[1]);
        }
       
        scene2DWallMesh[FLOOR][i].selector = selector; //cross refference
        scene2DWallMesh[FLOOR][i].pivot = pivot; //cross refference
        
        scene2D.add(selector); //.sendBackwards(selector);
        scene2D.add(pivot);

        //=========================
        result = scene2DDoorMesh[FLOOR].filter(function(e) { return e.id === scene2DWallMesh[FLOOR][i].id; });
        if(result.length >= 1)
        {
            //console.log(result);
            scene2DWallMesh[FLOOR][i].doors = [];
            //if (i == 1)
            pivot.set({opacity:0,selectable:false});
            
            for (var d = 0; d < result.length; d++){
                scene2DWallMesh[FLOOR][i].doors.push(result[d]);
                result[d].line = scene2DWallMesh[FLOOR][i]; //cross-refference
                scene2D.add(result[d]);
                //result[d].adjustcircle = adjustcircle;
            }
        }
        //=========================
        result = scene2DWindowMesh[FLOOR].filter(function(e) { return e.id === scene2DWallMesh[FLOOR][i].id; });
        if(result.length >= 1)
        {
            //console.log(result);
            scene2DWallMesh[FLOOR][i].windows = [];
            //if (i == 1)
            pivot.set({opacity:0,selectable:false});
            
            for (var w = 0; w < result.length; w++){
                scene2DWallMesh[FLOOR][i].windows.push(result[w]);
                result[w].line = scene2DWallMesh[FLOOR][i]; //cross-refference
                scene2D.add(result[w]);
                //result[w].adjustcircle = adjustcircle;
            }
        }
        //=========================
        scene2DGroupArrayDynamicPosition(v1,v2,n,[scene2DWallMesh[FLOOR][i].doors,scene2DWallMesh[FLOOR][i].windows]);
        
        if(n < 50)
            pivot.set({opacity:0,selectable:false});
    }
}

function zoom2DdrawBase(ctx) {

    zoom2DCTX.drawImage(zoom2Dimg, 0, 0, zoom2Dwidth, zoom2Dheight, 0, 0, zoom2Dwidth,  zoom2Dheight);
}

function zoom2DdrawProgress(ctx) {

    var x1 = 65, // X position where the progress segment starts
        x2 = 220, // X position where the progress segment ends
        s = zoom2DSlider.value, 
        x3 = 0,
        x4 = 20,
        y1 = 35;
        
    x3 = (x1 + ((x2 - x1) / 100) * s);  // Calculated x position where the overalyed image should end

    zoom2DCTX.drawImage(zoom2Dimg, 0, zoom2Dheight, x3,  zoom2Dheight, 0, 0, x3,  zoom2Dheight);

    var scale = Math.round(s/10);
    zoom2DCTX.fillStyle = "grey";
    zoom2DCTX.font = "12pt Arial";
    zoom2DCTX.fillText(scale, x4, y1);

    scene2DZoom(scale);
}

function drawImage() {
    zoom2DdrawBase(zoom2DCTX); // Draw the base image - no progress
    zoom2DdrawProgress(zoom2DCTX); // Draw the progress segment level
}

function scene2DCollectArrayFromContainer(n) {

    var json = [];
    var JSONString = {};
    var container = scene2DWallMesh[n];

    for (var i in container)
    {
        var obj = container[i];
        if (obj.name == 'wall')
        {
            //try{
                JSONString = {};
                JSONString.wall = "standard"; //used with different colors/textures
                JSONString.interior = "";
                JSONString.exterior = "";
                JSONString.id = obj.id; //used for matching windows and doors
                JSONString.locked = obj.lockMovementX;
                JSONString.position.x1 = obj.item(0).path[0][1];
                JSONString.position.y1 = obj.item(0).path[0][2];
                JSONString.position.x2 = obj.item(0).path[1][3];
                JSONString.position.y2 = obj.item(0).path[1][4];
                JSONString.curve.x = obj.item(0).path[1][1];
                JSONString.curve.y = obj.item(0).path[1][2];
                json.push(JSONString);
            //}catch(e){console.log(e);}
        }
    }
    container = scene2DDoorMesh[n];
    for (var i in container)
    {
        var obj = container[i];
        if (obj.name == 'door')
        {
            //try{
                JSONString = {};
                JSONString.door = obj.name;
                JSONString.id = obj.id;
                JSONString.locked = obj.lockMovementX;
                JSONString.open = obj.open;
                JSONString.direction = obj.direction;
                JSONString.position.x1 = obj.get("x1"); //obj.path[0][1];
                JSONString.position.y1 = obj.get("y1"); //obj.path[0][2];
                JSONString.position.x2 = obj.get("x2"); //obj.path[1][3];
                JSONString.position.y2 = obj.get("y2"); //obj.path[1][4];
                JSONString.position.z = obj.z;
                JSONString.curve.x = 0; //obj.path[1][1];
                JSONString.curve.y = 0; //obj.path[1][2];
                json.push(JSONString);
            //}catch(e){console.log(e);}
        }
    }
    return json;
}

function scene2DFloorShapeFill(shape) {
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
}

function scene2DFloorShapeGenerate() {

    //var shape = scene2D.getItemByName("floorshape");
    if (scene2DFloorShape === undefined) // || scene2DFloorShape.count != scene2DWallMesh[FLOOR].length)
    {
        //Generate 2D Vector Floor Shape
        
        var path = " Q 0 0 0 0".repeat(scene2DWallMesh[FLOOR].length);
        path = "M 0 0" + path;  //console.log(path);
        var shape = new fabric.Path(path);
        scene2DFloorShapeFill(shape);

        //Fix for fabric.js 1.5.0 - Must have proper Array with type:"path"
        shape.clone(function (clone) {
            clone.set({left: 0, top: 0});
            clone.set({strokeWidth: 1, stroke: 'black', selectable:false, hasControls: false, name:'floorshape', opacity:0.6});
            fabric.util.loadImage('objects/FloorPlan/Default/7.png', function(img) {
                clone.fill = new fabric.Pattern({
                    source: img,
                    repeat: 'repeat'
                });
                //scene2D.renderAll();
            });

            scene2DFloorShape = clone;
            scene2D.add(scene2DFloorShape);
        });
        
        /*
        var p = new Array();
        for(i=0; i<scene2DWallMesh[FLOOR].length; i++)
        {
            var obj = scene2DWallMesh[FLOOR][i];
        
            if(obj.edgeB) {
                p.push({x:obj.edgeA.left,y:obj.edgeA.top});
                p.push({x:obj.edgeB.left,y:obj.edgeB.top});            
            }
        }
        scene2DFloorShape = new fabric.Polygon({p, stroke: "#000000", 
        strokeWidth: 5,
        fill: 'red', 
        opacity: 1.0});
        scene2D.add(scene2DFloorShape);
        */
        
    }else{
        scene2DFloorShapeFill(scene2DFloorShape);
    }
    
    //if (scene2DFloorShape == undefined)
    //{
        //scene2D.remove(scene2DFloorShape);
        //scene2D.add(scene2DFloorShape);
        //scene2D.bringToFront(scene2DFloorShape);
        //scene2D.sendBackwards(scene2DFloorShape);
    //}

    /*
    var p = new Array();
    for(i=0; i<count; i++)
    {
        p.push([shape.path[i][1],shape.path[i][2]]);
    }
    console.log("Surface Area: " + scene2DSurfaceArea(p));
    */
}


function scene2DMakeWallPivotCircle(left, top, lock) {

    //if(id == null)
        var id = Math.random().toString(36).substring(7);

    var mobileFix = new fabric.Circle({
      left: left,
      top: top,
      radius: 30,
      fill: '',
    });

    var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 2,
        radius: 8,
        fill: '#00BFFF',
        stroke: '#1E90FF'
    });

    var img = new Image();
    img.src = 'images/lock.png';

    var i = new fabric.Image(img, {
        left: left,
        top: top,
        width: 8,
        height: 10,
        opacity: 0.6,
        visible: false,
    });

    var group = new fabric.Group([mobileFix, c, i], {selectable: true, opacity: 0.9, hasBorders: false, hasControls: false, name: 'pivot', id:id, lockMovementX:lock, lockMovementY:lock});
    group.line = [];
    group.moving = false;

    group.on("selected", function () {
        group.moving = false;
        clickTime = setTimeout(function() {
            $('#menu2DTools').tooltipster('update', '<a href="#" onclick="scene2DResetPivot(\'' + group.id + '\')" class="lo-icon icon-linereset" style="color:#0066FF"></a><a href="#" onclick="scene2DLockObject(\'' + group.id + '\')" class="lo-icon icon-lock" style="color:#606060"></a>');
            $('#menu2DTools').css({ left: group.left, top: group.top });
            $('#menu2DTools').tooltipster('show');
        }, 500);
    });
    group.on("moving", function () {

        if(group.lockMovementX)
            return;
        
        //console.log(p.left + " " + p.top);
        //$('#menu2DTools').tooltipster('hide');
        clearTimeout(clickTime);
        group.line[0].item(0).path[1][1] = group.left;
        group.line[0].item(0).path[1][2] = group.top;

        // ====== Very fast floor shapre correction ===
        if (scene2DFloorShape)
        {
            scene2DFloorShape.path[group.wallid][1] = group.line[0].item(0).path[1][1]; //cx
            scene2DFloorShape.path[group.wallid][2] = group.line[0].item(0).path[1][2]; //cy
        }
        //group.line.item(0).setCoords();
        //scene2D.calcOffset();
    });
    /*
    group.on("out", function () {
        group.item(1).set({stroke:'#0066FF'});
        scene2D.renderAll();
    });
    */
    //pos = canvas.getPointer(e.e);
    //activeObj = canvas.getActiveObject();
    //canvas.activeGroup
    return group;
}
