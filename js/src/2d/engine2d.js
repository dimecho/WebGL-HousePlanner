var engine2D = window.engine2D || {};

engine2D.open = function (zip){

    var i = 0;

    $.each(JSON.parse(zip.file("scene2DFloorContainer.json").asText()), function(index)
    {
        //var objects2DWalls = JSON.parse(this);
        //console.log(this);
       
		$.each(this, function(index)
		{
			if(this.door !== undefined)
			{
				scene2DDoorGroup[i].addChild(engine2D.makeDoor(this.length,{x:this.x,y:this.y},this.z,this.type,this.open,this.direction,this.door));
			}
			else if(this.window !== undefined)
			{
				//scene2DWindowGroup[i] = engine2D.makeWindow(this['x'],this['y'],this['z'],this['open'],this['direction'],this.window);
			}
			else if(this.wall !== undefined)
			{
				scene2DWallGroup[i].addChild(engine2D.makeWall({x:this.x1,y:this.y1},{x:this.x2,y:this.y2},{x:this.cx,y:this.cy}));
			}
			else if(this.label !== undefined)
			{
				scene2DLabelGroup[i].addChild(engine2D.makeLabel(this.label,this.size,this.x,this.y));
			}
		});
		//scene2DWallGroup[i].activate();
		scene2DWallGroup[i].bringToFront();
		//scene2DLabelGroup[i].bringToFront()
        
        i++;
    });
};

//*The problem is that bind adds an event listener, and not replace it.*
engine2D.show = function (){

    console.log("engine2d.show()");

    animateStop();
    engine3D.freeMemory();
    engine2D.freeMemory();

    engine3D.hide();
    $('#engine2D').show();

    SCENE = '2d';

    //engineGUI.initMenu("menuRight2D","FloorPlan/index.json");

    //scene3DSetBackground(null);

    //Create Grid
    //============================
	canvas2D = new paper.Group();
	var circle = new paper.Path.Circle(new paper.Point(0, 0), 450);
	circle.fillColor = '#CCCCCC';
	circle.opacity = 0.2;
	circle.position.x = paper.view.center.x + 40;
	circle.position.y = paper.view.center.y + 80;

	var rec = new paper.Path.Rectangle(new paper.Point(0, 0), paper.view.viewSize); //TODO: raster image
	rec.fillColor = '#ffffff';

	canvas2D.addChild(rec);
	canvas2D.addChild(circle);
	/*
	canvas2D.attach('mousedrag', function(event, delta) {
		var deltaX = (paper.view.center.x/2 - event.point.x/2);
		var deltaY = (paper.view.center.y/2 - event.point.y/2);

		//console.log(1/paper.view.zoom)
		view.center = panAndZoom.changeCenter(paper.view.center, -deltaX, deltaY, (1/paper.view.zoom)/2.5);
		return event.preventDefault();
	});
	*/
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
        
        engine2D.calculateWallCorners();

        engine2D.attachDoorsToWalls();

        engine2D.makeFloor();

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

        engineGUI.menuSelect(6, 'menuTopItem', '#ff3700');
        correctMenuHeight();

        //Auto close right menu
        //document.getElementById('menuRight').setAttribute("class", "hide-right");
        //delay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);
    }

    //scene2DArrayToLineWalls();

    //scene2DCalculateWallLength();
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
    try{
        $('#menu2DTools').tooltipster('hide');
    }catch(e){}

    $('#engine2D').hide();
    $('#menuLeft2D').hide();
    $('#menuRight2D').hide();
    //$('#zoom2DLevel').hide();
};

engine2D.makeGrid = function (grid, color) {

	for (var x = 0; x <= paper.view.size.width; x += grid)
	{
		var a = new paper.Path.Line(new paper.Point(x, 0), new paper.Point(x, paper.view.size.width));
		var b = new paper.Path.Line(new paper.Point(0, x), new paper.Point(paper.view.size.width, x));
		a.strokeColor = b.strokeColor = color;
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
};

engine2D.splitWallEdgeCircle = function(id) {

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
};

engine2D.joinWallEdgeCircle = function(id) {

    var result = scene2D.getObjects().filter(function(e) { return e.id === id; });

    //if (result.length >= 1) {
        //A bit more tricky ..nned to get "closes" edgeCircle and pick parameters from.
    //}
    return false; //href="#" fix
};


engine2D.joinWall = function(){

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
