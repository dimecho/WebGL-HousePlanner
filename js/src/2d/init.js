var engine2D = window.engine2D || {};

var panAndZoom;

engine2D.initialize = function (){

    //http://paperjs.org/tutorials/getting-started/using-javascript-directly/

	var canvas = document.getElementById("engine2D");
	paper.setup(canvas);
	paper.view.setViewSize(window.innerWidth, window.innerHeight);
	//settings.applyMatrix = false; 
	//window.dispatchEvent(new Event('resize'));

	panAndZoom = new SimplePanAndZoom();
	//panAndZoom = new StableZoom();
	
	$("#engine2D").bind("mousewheel", function(event) {
	  //var mousePosition, newZoom, offset, ref, viewPosition;
	  if (event.shiftKey) {
		//console.log(view.center + " " + event.deltaX + ":" + event.deltaY + "-" + event.deltaFactor);
		paper.view.center = panAndZoom.changeCenter(paper.view.center, event.deltaX, event.deltaY, event.deltaFactor);
		return event.preventDefault();

	  } else { //if (event.altKey) {

		var zoom = panAndZoom.changeZoom(paper.view.zoom, -event.deltaY);
		if (zoom <= 5 && zoom >= 1)
			paper.view.zoom = zoom;
		return event.preventDefault();
		
		/*
		mousePosition = new Point(event.offsetX, event.offsetY);
		viewPosition = paper.view.viewToProject(mousePosition);
		ref = panAndZoom.changeZoom(paper.view.zoom, event.deltaY, paper.view.center, viewPosition), newZoom = ref[0], offset = ref[1];
		paper.view.zoom = newZoom;
		paper.view.center = view.center.add(offset);
		event.preventDefault();
		return view.draw();
		*/
	  }
	});
 
	//https://github.com/threedubmedia/jquery.threedubmedia
	/*
	$('#engine2D').bind('drag',function(event, delta){
		paper.view.center = panAndZoom.changeCenter(paper.view.center, delta.deltaX, -delta.deltaY, 0.1);
		return event.preventDefault();
	});
	*/
	engine2D.new(0);
	engine2D.new(1);
};

engine2D.new = function (i)
{
	scene2DWallMesh[i] = [];
	scene2DWallDimentions[i] = [];
	scene2DInteriorMesh[i] = [];
	scene2DExteriorMesh[i] = [];

	scene2DFloorShape[i] = new paper.Group();
	scene2DDoorGroup[i] = new paper.Group();
	scene2DWindowGroup[i] = new paper.Group();
	scene2DWallGroup[i] = new paper.Group();
	scene2DWallPointGroup[i] = new paper.Group();
	scene2DLabelGroup[i] = new paper.Group();
};

engine2D.open = function (zip){

    var i = 0; //FLOOR

	zip.file("scene2DFloorContainer.json").async("string").then(function (content) {
		//console.log(content);
	    $.each(JSON.parse(content), function(index)
	    {
	        //var objects2DWalls = JSON.parse(this);
	       	//if(this.length > 0){
	       		console.log(this);

	       		engine2D.new(i);

				$.each(this, function(index)
				{
					if(this.door !== undefined)
					{
						scene2DDoorGroup[i].addChild(engine2D.makeDoor(i,this.length,{x:this.x,y:this.y},this.z,this.type,this.open,this.direction,this.door));
					}

					if(this.window !== undefined)
					{
						scene2DWindowGroup[i].addChild(engine2D.makeWindow(i,this.length,{x:this.x,y:this.y},this.z,this.open,this.direction,this.window));
					}

					if(this.wall !== undefined)
					{
						scene2DWallGroup[i].addChild(engine2D.makeWall(i,{x:this.x1,y:this.y1},{x:this.x2,y:this.y2},{x:this.cx,y:this.cy},this.h));
					}

					if(this.label !== undefined)
					{
						scene2DLabelGroup[i].addChild(engine2D.makeLabel(i,this.label,this.size,this.x,this.y));
					}
				});

				engine2D.makeFloor(i); //needed for 3D reference
				//scene2DWallGroup[i].activate();
				//scene2DWallGroup[i].bringToFront();

				

				//scene2DLabelGroup[i].bringToFront()

				//canvas2D.addChild(scene2DFloorShape[i]);
				//canvas2D.addChild(scene2DWallGroup[i]);
				//canvas2D.addChild(scene2DDoorGroup[i]);
				//canvas2D.addChild(scene2DWindowGroup[i]);
		        
		        i++;
	    	//}
	    });
	});
};
