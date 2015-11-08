
var engine2D = window.engine2D || {};

engine2D.open = function (zip){

    var i = 0;

    $.each(JSON.parse(zip.file("scene2DFloorContainer.json").asText()), function(index)
    {
        //var objects2DWalls = JSON.parse(this);
        //console.log(this);
        with (paper) {

            $.each(this, function(index)
            {
                if(this.door !== undefined)
                {
                    scene2DDoorGroup[i].addChild(engine2D.makeDoor(this['length'],{x:this['x'],y:this['y']},this['z'],this['type'],this['open'],this['direction'],this.door));
                }
                else if(this.window !== undefined)
                {
                    //scene2DWindowGroup[i] = engine2D.makeWindow(this['x'],this['y'],this['z'],this['open'],this['direction'],this.window);
                }
                else if(this.wall !== undefined)
                {
                    scene2DWallGroup[i].addChild(engine2D.makeWall({x:this['x1'],y:this['y1']},{x:this['x2'],y:this['y2']},{x:this['cx'],y:this['cy']}));
                }
                else if(this.label !== undefined)
                {
                    scene2DLabelGroup[i].addChild(engine2D.makeLabel(this['label'],this['size'],this['x'],this['y']));
                }
            });
            //scene2DWallGroup[i].activate();
            scene2DWallGroup[i].bringToFront()
            //scene2DLabelGroup[i].bringToFront()
        }
        
        i++;
    });
}

//*The problem is that bind adds an event listener, and not replace it.*
engine2D.show = function (){

    console.log("engine2d.show()");

    animateStop();
    scene3DFreeMemory();
    scene2DFreeMemory();

    engine3D.hide();
    $('#engine2D').show();

    SCENE = '2d';

    //initMenu("menuRight2D","FloorPlan/index.json");

    //scene3DSetBackground(null);

    //Create Grid
    //============================
    with (paper) {

        canvas2D = new Group();
        var circle = new Path.Circle(new Point(0, 0), 450);
        circle.fillColor = '#CCCCCC';
        circle.opacity = 0.2;
        circle.position.x = view.center.x + 40;
        circle.position.y = view.center.y + 80;

        var rec = new Path.Rectangle(new Point(0, 0), view.viewSize); //TODO: raster image
        rec.fillColor = '#ffffff';

        canvas2D.addChild(rec);
        canvas2D.addChild(circle);
        /*
        canvas2D.attach('mousedrag', function(event, delta) {
            var deltaX = (view.center.x/2 - event.point.x/2);
            var deltaY = (view.center.y/2 - event.point.y/2);

            //console.log(1/view.zoom)
            view.center = panAndZoom.changeCenter(view.center, -deltaX, deltaY, (1/view.zoom)/2.5);
            return event.preventDefault();
        });
        */
    }
    engine2D.makeGrid(40,'#6dcff6');
    engine2D.makeGrid(20,'#E0E0E0');
    //============================

    if(scene2DWallGroup[FLOOR])
    {
        toggleRight('menuRight', true);
        toggleLeft('menuLeft2D', true);

        //$('#menuFloorSelectorText').html(scene3DFloorFurnitureContainer[FLOOR].name);
        $('#menuFloorSelector').show();

        var menuBottom = [1,5,8,9,10];
        menuBottom.forEach(function(item) {
             $('#menuBottomItem' + item).show();
        });
        $('#menuBottom').show();

        //=========================
        engine2D.makeFloor();

        engine2D.calculateWallCorners();

        engine2D.attachDoorsToWalls();

        engine2D.drawWalls();
        //=========================

        /*
        https://github.com/rheh/HTML5-canvas-projects/tree/master/progress
        */
        var zoom2DCanvas = document.getElementById('zoom2DProgress');
        if (zoom2DCanvas) // Canvas supported?
        {
            zoom2Dimg = new Image(); // Create the image resource
            zoom2DCTX = zoom2DCanvas.getContext('2d');
            zoom2DSlider = document.getElementById('zoom2DSlider');
            zoom2Dimg.onload = drawImage; // Setup the onload event
            zoom2Dimg.src = 'images/progress-tiles.jpg'; // Load the image
        }
        $('#zoom2DLevel').show();

        //scene2DdrawRuler();

        menuSelect(6, 'menuTopItem', '#ff3700');
        correctMenuHeight();

        //Auto close right menu
        //document.getElementById('menuRight').setAttribute("class", "hide-right");
        //delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);
    }

    //scene2DArrayToLineWalls();

    //scene2DCalculateWallLength();
}

engine2D.hide = function() {
    /*
    while(scene2D._objects.length > 0)
    {
        for (var i = 0; i < scene2D._objects.length; i++) {
            scene2D.remove(scene2D.item(i));
        }
    }
    */
    try{
        $('#menu2DTools').tooltipster('hide');
    }catch(e){}

    $('#engine2D').hide();
    $('#menuLeft2D').hide();
    $('#menuRight2D').hide();
    //$('#zoom2DLevel').hide();
}

engine2D.makeGrid = function (grid, color) {

    with (paper) {
        for (var x = 0; x <= view.size.width; x += grid) {
            var a = new paper.Path.Line(new Point(x, 0), new Point(x, view.size.width));
            var b = new paper.Path.Line(new Point(0, x), new Point(view.size.width, x));
            a.strokeColor = b.strokeColor = color;
        }
    }
};
/*
SimplePanAndZoom.prototype.changeZoom = function(oldZoom, delta, centerPoint, offsetPoint, zoomFactor) {
    var newZoom = oldZoom;
    if (delta < 0) {
        newZoom = oldZoom * zoomFactor;
    }
    if (delta > 0) {
        newZoom = oldZoom / zoomFactor;
    }

    var a = null;
    if(!centerPoint.equals(offsetPoint)) {
        var scalingFactor = oldZoom / newZoom;
        var difference = offsetPoint.subtract(centerPoint);
        a = offsetPoint.subtract(difference.multiply(scalingFactor)).subtract(centerPoint);
    }

    return [newZoom, a];
};
*/

engine2D.lockObject = function(id) {

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


engine2D.joinWall = function(){

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
