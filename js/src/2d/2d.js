
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