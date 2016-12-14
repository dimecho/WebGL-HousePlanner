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

    engine2D.loadDraftPlan();
	
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

    if(engine2D.floor[i] !== undefined)
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
        engine2D.floor[i].visible = false;
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
        engine2D.draftPlan = undefined;
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

engine2D.loadDraftPlan = function(file) {

    var x, y, w, h = 0;

    $.each(json.plan[engineGUI.floor], function() {
        if(this.draft !== undefined) {
            if(!file) {
                //file = "../" + this.draft; //DEBUG
                file = this.draft;
                x = this.x;
                y = this.y;
                w = this.w;
                h = this.h;
            }else{
                this.draft = file;
                this.x = paper.view.center.x;
                this.y = paper.view.center.y;
                this.w = paper.view.bounds.width/1.25;
                this.h = paper.view.bounds.height/1.25;
            }
            return true;
        }
    });

    if(file)
    {
        //console.log("Load draft plan: " + file + " " + x + ":" + y + " - " + w + ":" + h);

        var rectangle = new paper.Rectangle(new paper.Point(0,0), new paper.Point(w,h));

        var area = new paper.Path.Rectangle(rectangle);
        area.strokeColor = '#ffffff';
        area.opacity = 0.1;
        area.strokeWidth = 64;
        //area.visible = false;

        //============================
        var triangle = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 10);
        triangle.fillColor = '#00e600';
        triangle.visible = false;

        var triangle_width_left = triangle.clone();
        triangle_width_left.position = new paper.Point(-15, h/2);
        triangle_width_left.rotate(90);

        var triangle_width_right = triangle.clone();
        triangle_width_right.position = new paper.Point(w + 15, h/2);
        triangle_width_right.rotate(-90);

        var triangle_height_top = triangle.clone();
        triangle_height_top.position = new paper.Point(w/2, -15);
        triangle_height_top.rotate(180);

        var triangle_height_bottom = triangle.clone();
        triangle_height_bottom.position = new paper.Point(w/2, h + 15);
        //============================

        var path = new paper.Path.Rectangle(rectangle);
        path.strokeColor = '#00e600';
        path.strokeWidth = 2;
        path.visible = false;

        var raster = new paper.Raster({ source:file, position: new paper.Point(0,0)});
        raster.fitBounds(path.bounds, true);
        raster.opacity = 0.7;

        raster.attach('mousedrag', function(event) {
            //engine2D.draftPlan.position = new paper.Point(event.point.x-engine2D.draftPlan.position.x,event.point.y-engine2D.draftPlan.position.y); 
            engine2D.draftPlan.position = event.point;
        });

        area.attach('mouseenter', function() {
            path.visible = true;
            triangle_width_left.visible = true;
            triangle_width_right.visible = true;
            triangle_height_top.visible = true;
            triangle_height_bottom.visible = true;
        });
        area.attach('mouseleave', function() {
            path.visible = false;
            triangle_width_left.visible = false;
            triangle_width_right.visible = false;
            triangle_height_top.visible = false;
            triangle_height_bottom.visible = false;
        });

        /*
        area.attach('mousedrag', function(event) {
            //onPathDrag(this.parent,event);
            console.log(event);
        });
        */

        engine2D.draftPlan  = new paper.Group([raster, triangle_width_left, triangle_width_right, triangle_height_top, triangle_height_bottom, area, path]);
        engine2D.draftPlan.position = new paper.Point(x, y); //paper.view.center;

        //TODO: dynamically adjust image size for current zoom
        //engine2D.draftPlan.opacity = 0.7;
        //engine2D.draftPlan.scale(0.5);

        //engine2D.draftPlan[engineGUI.floor].rotate(5);
        //engine2D.draftPlan[engineGUI.floor].fitBounds(path.bounds, true);
    }
};

engine2D.loadCADPlan = function(file) {

    //DXF File Processing
    
    $.ajax(file,{
        contentType: "application/text",
        beforeSend: function (req) {
          req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
        },
        success: function(data){

            //console.log(data);

            if ((typeof DXFParser == 'undefined' ? 'undefined' : _typeof(DXFParser)) === undefined) {
            
                $.getScript("js/dynamic/dxfparser.js").done(function (script, textStatus){
                    $.getScript("js/dynamic/dxfnode.js").done(function (script, textStatus){

                        var parser = new DXFParser(data);
                        console.log(parser);

                    }).fail(function (jqxhr, settings, exception) {
                        alertify.alert("Failed to load dxfnode.js").show();
                    });
                }).fail(function (jqxhr, settings, exception) {
                    alertify.alert("Failed to load dxfparser.js").show();
                });
            }
        },
        error: function(xhr, textStatus, errorThrown){
            alertify.alert("DXF (" + file + ") Loading Error").show();
        }
    });
};

/*
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
*/

engine2D.freeMemory = function ()
{
    var children = paper.project.activeLayer.children;

    for (var i = 0; i < children.length-1; i++) {
        children[i].remove();
    }
    
    //engine2D.canvas = null;
};