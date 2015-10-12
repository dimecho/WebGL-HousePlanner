
var engine2D = window.engine2D || {};

engine2D.open = function (zip){
    var i = 0;
    $.each(JSON.parse(zip.file("scene2DFloorContainer.json").asText()), function(index)
    {
        var w = 0;
        var l = 0;
        var d = 0;
        //var objects2DWalls = JSON.parse(this);
        //console.log(this);

        scene2DWallMesh[i] = [];
        scene2DDoorMesh[i] = [];
        
        $.each(this, function(index)
        {
            if(this.door !== undefined)
            {
                //scene2DDoorMesh[i][d] = scene2DMakeDoor({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['position.z'],this['open'],this['direction'],this['id']);
                //scene2DDoorMesh[i][d].file = this.door;
                d++;
            }
            else if(this.window !== undefined)
            {
                //scene2DWindowMesh[i][w] = scene2DMakeWindow({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['position.z'],this['open'],this['direction'],this['id']);
                //scene2DWindowMesh[i][w].file = this.window;
                w++;
            }
            else if(this.wall !== undefined)
            {
                scene2DWallMesh[i][l] = engine2D.makeWall({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['id'],i);
                l++;
            }
        });
        
        i++;
    });
}

engine2D.show = function (){

    //animateStop();

    //scene3DFreeMemory();
    //scene2DFreeMemory();
    //hideElements();
    SCENE = '2d';

    //initMenu("menuRight2D","FloorPlan/index.json");

    //scene3DSetBackground(null);

    //Create Grid
    //============================
    var ground = scene2D.makeCircle(scene2D.width * 0.33, scene2D.height * 0.66, scene2D.height / 2);
    ground.translation.x = scene2D.width / 2;
    ground.translation.y = scene2D.height / 2 + 80;
    ground.noStroke();
    ground.linewidth = 2;
    ground.fill = '#CCCCCC';
    ground.opacity = 0.2;
    canvas2D.add(ground);
    engine2D.makeGrid(40,'#6dcff6');
    engine2D.makeGrid(20,'#E0E0E0');
    //============================

    //engine2D.floorGenerate();

    /*
    scene2DFloorShapeGenerate();

    for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++) {
        scene2D.add(scene2DWallMesh[FLOOR][i]);
    }

    for (var i = 0; i < scene2DInteriorMesh[FLOOR].length; i++) {
        scene2D.add(scene2DInteriorMesh[FLOOR][i]);
    }

    for (var i = 0; i < scene2DExteriorMesh[FLOOR].length; i++) {
        scene2D.add(scene2DExteriorMesh[FLOOR][i]);
    }
    */
    //TODO: doubleclick resets Quardatic Curve
    //http://stackoverflow.com/questions/21511383/fabricjs-detect-mouse-over-object-path -> http://fabricjs.com/per-pixel-drag-drop/
    
    /*
    scene2D.on('mouse:down', function(event) {

        var target = event.target;

        //clearTimeout(clickTime);
        //$('#menu2DTools').tooltipster('hide');
        if(target)
        {
            if (target.name == 'ground') 
            {
                target.set({stroke:'black'});
                $('#menu2DTools').tooltipster('hide');
                scene2D.renderAll();
                return;
            }else{
                for (var i = 0; i < scene2DWallMesh[FLOOR].length; i++)
                    scene2DWallMesh[FLOOR][i].item(1).set({opacity:0}); //unhighlight attached wall
            }
        }
        on2DMouseDown(event.e);
    });

    /
    scene2D.on('mouse:move', function(event) {
        on2DMouseMove(event.e);
    });
    /

    scene2D.on('mouse:up', function(event) {

        var target = event.target;

        if(target.name == 'window')
        {
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
              left: 500,
              top: 250,
              fill: '#ffffff',
              stroke: 'black',
              width: 300,
              height: 250,
            });
            scene2DAdvanced.add(scene2DDrawLine);
            //============================
        }
        else if(target.name == 'edge' || target.name == 'pivot')
        {
            //target.moving = false; //reset movement
            target.setCoords(); //important

            //A quick fix for offset pivots
            //https://github.com/kangax/fabric.js/wiki/Fabric-gotchas
            
            for (var i = 0; i < target.line.length; i++)
            {
                //Calculate new coordinates for highlighted wall
                var x1 = target.line[i].item(0).path[0][1];
                var y1 = target.line[i].item(0).path[0][2];
                var cx = target.line[i].item(0).path[1][1];
                var cy = target.line[i].item(0).path[1][2];
                var x2 = target.line[i].item(0).path[1][3];
                var y2 = target.line[i].item(0).path[1][4];

                target.line[i].item(1).path[0][1] = x1;
                target.line[i].item(1).path[0][2] = y1;
                target.line[i].item(1).path[1][1] = cx;
                target.line[i].item(1).path[1][2] = cy;
                target.line[i].item(1).path[1][3] = x2;
                target.line[i].item(1).path[1][4] = y2;
                target.line[i].setCoords();

                var point = scene2DGetCenterPivot({x:x1,y:y1},{x:x2,y:y2});
                //target.line[i].selector.x2 = x2 - x1;
                //target.line[i].selector.y2 = y2 - y1;
                target.line[i].selector.set({ 'x2': x2 - x1, 'y2': y2 - y1 });
                target.line[i].selector.left = point.x;
                target.line[i].selector.top = point.y;
                target.line[i].selector.setCoords();

                //if(target.line[i].pivot)
                    target.line[i].pivot.setCoords();

                target.line[i].reversed = false;
            }

            //TODO: find more efficient way of updating
            for (var i = 0; i < scene2DDoorMesh[FLOOR].length; i++)
                scene2DDoorMesh[FLOOR][i].setCoords();
            for (var i = 0; i < scene2DWindowMesh[FLOOR].length; i++)
                scene2DWindowMesh[FLOOR][i].setCoords();
            
            scene2DFloorShapeGenerate();

            scene2D.renderAll();
        //}
        //else
        //{
            //on2DMouseUp(event.e);
            //scene2D.renderAll();
        }
        else if (target.name == 'ground') 
        {
            target.set({stroke:null});
            scene2D.renderAll();
        }
    });

    //'object:modified'
    scene2D.on('mouse:over', function(event) {

        var target = event.target;

        if(target.name == 'edge')
        {
            target.item(1).set({stroke:'#ff6600'});
            //var angle = scene2DMakeWallEdgeAngle({x:target.line[0].item(0).path[0][1],y:target.line[0].item(0).path[0][2]},{x:target.line[1].item(0).path[0][1],y:target.line[1].item(0).path[0][2]},{x:target.line[1].item(0).path[1][3],y:target.line[1].item(0).path[1][4]});
                   
            for (var i = 0; i < target.line.length; i++) //multi-angle
            {
                var angle = 0 ;//scene2DMakeWallEdgeAngle({x:target.line[0].item(0).path[0][1],y:target.line[0].item(0).path[0][2]},{x:target.line[1].item(0).path[0][1],y:target.line[1].item(0).path[0][2]},{x:target.line[1].item(0).path[1][3],y:target.line[1].item(0).path[1][4]});
           
                target.line[i].item(1).set({opacity:1}); //highlight attached wall

                if(target.bend[i] && target.line[0] && target.line[1]){
                    
                    //TODO: adjust opposite angles
                    //TODO: improve performance by adjusting "changed angle" only
                    angle.set({opacity:0});
                    scene2D.remove(target.bend[i]);
                    target.bend[i] = angle;
                    scene2D.add(angle); //.sendBackwards(angle); //.sendBackwards(angle);
                    angle.animate('opacity', 1.0, {
                        duration: 500,
                        onChange: scene2D.renderAll.bind(scene2D),
                        //onComplete: function() {scene2D.bringToFront(target.pivot[1])},
                        easing: fabric.util.ease.easeInCubic
                    });
                }
            }
            //scene2D.bringToFront(target);

            scene2D.renderAll();
        }
        else if (target.name == 'wall') 
        {
            //target.set({opacity:1});
            //console.log(target);
            target.item(1).set({opacity:1}); //highlight attached wall
            target.item(2).set({opacity:1}); //highlight split circle
            //target.set({opacity:1}); //highlight attached wall
            //target.set({opacity:1}); //highlight split circle

            //scene2D.hoverCursor = 'pointer';
            scene2D.renderAll();
        }
        else if (target.name == 'wallselect') 
        {
            //setTimeout(function() {
                target.line.item(2).set({opacity:1}); //highlight split circle
            //}, 100); //a slight delay fixes greenline highlight
            //target.line.item(1).set({opacity:1}); //highlight attached wall
            /
            target.line.item(2).animate('opacity', 1.0, {
                duration: 250,
                onChange: scene2D.renderAll.bind(scene2D),
                easing: fabric.util.ease.easeInCubic
            });
            /
            //scene2D.hoverCursor = 'pointer';
            scene2D.renderAll();
        }
        else if (target.name == 'pivot') 
        {
            target.item(1).set({stroke:'#ff6600'});
            scene2D.renderAll();
        /
        }
        else if (target.name == 'adjustcircle') 
        {
            target.set({stroke:'#ff6600'});
            scene2D.renderAll();
        /
        }
        else if (target.name == 'door') 
        {
            target.item(1).set({stroke:'#ff6600'});
            target.item(6).set({opacity:1});
            //target.item(2).set({opacity:0});
            //target.adjustcircle.set({opacity:1, left:target.left, top:target.top+target.item(2).y2/2});
            //target.adjustcircle.setCoords();
 
            scene2D.renderAll();
        }
        else if (target.name == 'window') 
        {
            target.item(1).set({stroke:'#ff6600'});
            scene2D.renderAll();
        }
    });

    //http://fabricjs.com/opacity_mouse_move/
    //TODO: optimize this
    scene2D.on('mouse:move', function(event) {
        var target = event.target;
        mouse = scene2D.getPointer(event.e);

        if(target){
            if (target.name == 'wallselect') //Follow quadratic curve x,y
            {
                var pointer = scene2D.getPointer(event.e);
                var v1 = {x:target.line.item(0).path[0][1],y:target.line.item(0).path[0][2]};
                var v2 = {x:target.line.item(0).path[1][3],y:target.line.item(0).path[1][4]};

                //if(!scene2D.isTargetTransparent(e.target.line, pointer.x, pointer.y)){
                    var percent = (pointer.x  - v1.x) / (v2.x - v1.x); //0.20; //flip based on window height
                    //var percent = (pointer.x  - e.target.line.item(0).path[0][1]) / (e.target.line.item(0).path[1][3] - e.target.line.item(0).path[0][1]); //0.20; //flip based on window height
                    //console.log(e.target.line.item(0).path[0][1] + ":" + e.target.line.item(0).path[0][2] + " pivot (" + e.target.pivot.left + ":" + e.target.pivot.top +  ") " + pointer.x + ":" + pointer.y);
                    //var follow = scene2DgetLineXYatPercent(v1,v2,percent);
                    //console.log(x+ ":" + y + " " + percent);
                    target.line.item(1).set({opacity:1}); //highlight attached wall
                    target.line.item(2).set(scene2DgetQuadraticBezierXYatPercent(v1,target.pivot,v2,percent));
                    scene2D.renderAll();
                //}
            }
        }
    });
    
    scene2D.on('mouse:out', function(event) {
        var target = event.target;

        if(target.name == 'edge')
        {
            target.item(1).set({stroke:'#666'});

            for (var i = 0; i < target.line.length; i++) //multi-angle
            {
                target.line[i].item(1).set({opacity:0}); //unhighlight attached wall

                if(target.bend[i]){
                    target.bend[i].animate('opacity', 0.0, {
                        duration: 600,
                        onChange: scene2D.renderAll.bind(scene2D),
                        //onComplete: function() {},
                        easing: fabric.util.ease.easeInCubic
                    });
                }
            }
            scene2D.renderAll();
            //scene2D.bringForward(e.target);
        }
        else if (target.name == 'wallselect')
        {
            target.line.item(1).set({opacity:0}); //unhighlight attached wall
            target.line.item(2).set({opacity:0}); //unhighlight split circle
            //scene2D.cursor = 'crosshair';
            scene2D.renderAll();
        }
        else if (target.name == 'pivot') 
        {
            target.item(1).set({stroke:'#0066FF'});
            scene2D.renderAll();
        /
        }
        else if (target.name == 'adjustcircle') 
        {
            target.set({stroke:'#6B8E23'});
            scene2D.renderAll();
        /
        }
        else if (target.name == 'door') 
        {
            target.item(1).set({stroke:'#00000'});
            target.item(6).set({opacity:0});
            //e.target.item(2).set({opacity:1});
            //target.adjustcircle.set({opacity:0});
            scene2D.renderAll();
        }
        else if (target.name == 'window') 
        {
            target.item(1).set({stroke:'#00000'});
            scene2D.renderAll();
        }
    });
    */
    //var circle = new Array();

    //scene2DJoinLines();

    //scene2D.add(adjustcircle);
    /*
    for (var i = 0; i < scene2DDoorMesh[FLOOR].length; i++) {
        scene2D.add(scene2DDoorMesh[FLOOR][i]);
    }
    */
    /*
    for (var i = 0; i < scene2DWindowMesh[FLOOR].length; i++) {
        scene2D.add(scene2DWindowMesh[FLOOR][i]);
    }
    */
    //scene2DArrayToLineWalls();

    //scene2DCalculateWallLength();

    //scene2D.renderAll();

    //scene2DdrawRuler();
}

engine2D.makeGrid = function (grid, color) {
    for (var x = 0; x <= scene2D.width; x += grid) {
        var a = scene2D.makeLine(x, 0, x, scene2D.width);
        var b = scene2D.makeLine(0, x, scene2D.width, x);
        a.stroke = b.stroke = color;
        a.linewidth = b.linewidth = 1,
        canvas2D.add(a).add(b);
    }
    scene2D.update();

    /*
    var a = scene2D.makeLine(scene2D.width / 2, 0, scene2D.width / 2, scene2D.height);
    var b = scene2D.makeLine(0, scene2D.height / 2, scene2D.width, scene2D.height / 2);
    a.stroke = b.stroke = color;
    scene2D.update();

    _.defer(function() {
      $(document.body).css({
        background: 'url(' + scene2D.renderer.domElement.toDataURL('image/png') + ') 0 0 repeat',
        backgroundSize: size + 'px ' + grid + 'px'
      });
    });
    */
};


function scene2DZoom(SCALE_FACTOR) {

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

/*
Generate 2D SVG Floor Shape
*/
engine2D.floorGenerate = function (){

    if (scene2DFloorShape === undefined) // || scene2DFloorShape.count != scene2DWallMesh[FLOOR].length)
    {
        console.log("Floor Generate " + scene2DWallMesh[FLOOR].length);

        var path = "";
        var M ="";
        for(i = 0; i < scene2DWallMesh[FLOOR].length; i++)
        {
            var obj = scene2DWallMesh[FLOOR][i];
            var split = obj._collection[0].svg.split(" ");

            if(i == 0){
                M = split[0];
                path += M + " ";
            }
            if(i > 0){
                path += split[0].replace("M", "L") + " ";
            }

            //if(i == scene2DWallMesh[FLOOR].length-1){ //closing loop
                //path += split[4] + " ";
            //}else{
                path += split[2] + " " ; //+ split[4] + " ";
            //}

            console.log(obj._collection[0].svg);
        }
        //path += M.replace("M", "L") + " z";
        path += "z";
        console.log(path);

        var floor = scene2D.interpret(engine2D.SVG_makePath(path,"#707070"));

        engine2D.SVG_bringFront(floor._renderer.elem);

        //floor.center().translation.set(0,0);
        console.log(floor);

        /*
        /
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
        /
        */
    //}else{
        //scene2DFloorShapeFill(scene2DFloorShape);
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
