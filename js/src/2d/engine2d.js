var engine2D = window.engine2D || {};

//*The problem is that bind adds an event listener, and not replace it.*
engine2D.show = function (){

    console.log("engine2d.show()");
	
    engineGUI.scene= '2d';

    //engine3D.animateStop();
    engine3D.freeMemory();
    engine2D.freeMemory();
    engine3D.hide();
	
    engine2D.makeGrid();
	
    //engineGUI.initMenu("menuRight2D","FloorPlan/index.json");
	
    //scene3DSetBackground(null);
	
    $('#engine2D').show();
	
    /*
    engine2D.canvas.attach('mousedrag', function(event, delta) {
        var deltaX = (paper.view.center.x/2 - event.point.x/2);
        var deltaY = (paper.view.center.y/2 - event.point.y/2);

        //console.log(1/paper.view.zoom)
        view.center = panAndZoom.changeCenter(paper.view.center, -deltaX, deltaY, (1/paper.view.zoom)/2.5);
        return event.preventDefault();
    });
    */
	
    engineGUI.menuToggleRight('menuRight', true);
    engineGUI.menuToggleLeft('menuLeft2D', true);
	
    //$('#menuFloorSelectorText').html(scene3DFloorFurnitureContainer[engineGUI.floor].name);
    $('#menuFloorSelector').show();
    $('#menuBottomPlan').show();
	
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

    engineGUI.menuSelect(6, 'menuTopItem', '#ff3700');
    
    engineGUI.menuCorrectHeight();

    //Auto close right menu
    //document.getElementById('menuRight').setAttribute("class", "hide-right");
    //delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);
    
    //scene2DArrayToLineWalls();

    //scene2DCalculateWallLength();
	
	engine2D.showFloor(engineGUI.floor);
};

engine2D.showFloor = function(i)
{
    engineGUI.floor = i;

    if(scene2DFloorShape[i] !== undefined)
	{
    	//engine2D.makeFloor();
    	engine2D.clear();
    	engine2D.drawFloor(engineGUI.floor);
    	engine2D.drawWall(engineGUI.floor);
    	engine2D.drawDoor(engineGUI.floor);
    	engine2D.drawWindow(engineGUI.floor);
    	engine2D.attachObjectsToWalls(engineGUI.floor,scene2DDoorGroup);
    	engine2D.attachObjectsToWalls(engineGUI.floor,scene2DWindowGroup);
    }
};

engine2D.addFloor = function(name)
{

};

engine2D.clear = function()
{
    //Each Floor contains multiple floors, walls, doors and windows
    
    for(var i = 0; i < scene2DWallGroup.length; i++)
    {
        for (var w = 0; w < scene2DWallGroup[i].children.length; w++) //Walls are not grouped - individual
        {
            scene2DWallGroup[i].children[w].visible = false;
        }
        scene2DFloorShape[i].visible = false;
        scene2DLabelGroup[i].visible = false;
        scene2DDoorGroup[i].visible = false;
        scene2DWindowGroup[i].visible = false;
    }
};

engine2D.hide = function() {
    /*
    while(scene2D._objects.length > 0)
    {
        for (var i = 0; i < scene2D._objects.length; i++) {
            scene2D.remove(scene2D.item(i));
        }
    }
    */

    $('#engine2D').hide();

    engineGUI.mousedrag = false;
    
    if(engine2D.canvas !== undefined)
    {
        for(var i = 0; i < scene2DWallGroup.length; i++)
        {
            engine2D.clear(i,false);
        }
        /*
        engine2D.canvas.off('mouseenter');
        engine2D.canvas.off('mouseleave');
        engine2D.canvas.off('mousedown');
        engine2D.canvas.off('mouseup');
        engine2D.canvas.off('mousedrag');
        engine2D.canvas.off('mousemove');
        engine2D.canvas.off('doubleclick');
        */
    }
    try{
        $('#menu2DTools').tooltipster('hide');
    }catch(e){}

    $('#menuLeft2D').hide();
    $('#menuRight2D').hide();
    //$('#zoom2DLevel').hide();
    $('#menuBottomPlan').hide();
};

engine2D.drawGrid = function (grid, color) {

	for (var x = 0; x <= paper.view.size.width; x += grid)
	{
		var a = new paper.Path.Line(new paper.Point(x, 0), new paper.Point(x, paper.view.size.width));
		var b = new paper.Path.Line(new paper.Point(0, x), new paper.Point(paper.view.size.width, x));
		a.strokeColor = b.strokeColor = color;
        engine2D.canvas.addChild(a);
        engine2D.canvas.addChild(b);
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

engine2D.makeGrid = function (){
    //Create Grid
    //============================
    engine2D.canvas = new paper.Group();
    var circle = new paper.Path.Circle(new paper.Point(0, 0), 450);
    circle.fillColor = '#CCCCCC';
    circle.opacity = 0.2;
    circle.position.x = paper.view.center.x + 40;
    circle.position.y = paper.view.center.y + 80;
    var rec = new paper.Path.Rectangle(new paper.Point(0, 0), paper.view.viewSize); //TODO: raster image
    rec.fillColor = '#ffffff';
    engine2D.canvas.addChild(rec);
    engine2D.canvas.addChild(circle);
    engine2D.drawGrid(40,'#6dcff6');
    engine2D.drawGrid(20,'#E0E0E0');
    //============================
};

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
};

engine2D.collectArrayFromContainer = function(n) {

    var json = [];
    var JSONString = {};

    for (var obj in scene2DWallMesh[n])
    {
        if (obj.name === 'wall')
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

    for (var obj in scene2DDoorMesh[n])
    {
        if (obj.name === 'door')
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
};

engine2D.freeMemory = function ()
{
    var children = paper.project.activeLayer.children;

    for (var i = 0; i < children.length-1; i++) {
        children[i].remove();
    }
    
    //engine2D.canvas = null;
};