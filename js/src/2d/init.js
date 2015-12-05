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
};

engine2D.new = function (){
  
	for(var i=0; i<=2; i++) //TODO: make this dynamic increase
	{
		scene2DWallMesh[i] = [];
		scene2DWallDimentions[i] = [];
		scene2DDoorGroup[i] = new paper.Group();
		scene2DWallGroup[i] = new paper.Group();
		scene2DWallPointGroup[i] = new paper.Group();
		scene2DLabelGroup[i] = new paper.Group();
		scene2DInteriorMesh[i] = [];
		scene2DExteriorMesh[i] = [];
	}
};
