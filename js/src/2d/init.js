var engine2D = window.engine2D || {};

var panAndZoom;

engine2D.initialize = function (){

    //http://paperjs.org/tutorials/getting-started/using-javascript-directly/
    with (paper) {
        var canvas = document.getElementById("engine2D");
        setup(canvas);
        view.setViewSize(window.innerWidth, window.innerHeight);
        //window.dispatchEvent(new Event('resize'));

        panAndZoom = new SimplePanAndZoom();
        //panAndZoom = new StableZoom();

        $("#engine2D").bind('mousewheel', function(event) {
          //var mousePosition, newZoom, offset, ref, viewPosition;
          if (event.shiftKey) {
            view.center = panAndZoom.changeCenter(view.center, event.deltaX, event.deltaY, event.deltaFactor);
            return event.preventDefault();
          } else if (event.altKey) {
            view.zoom = panAndZoom.changeZoom(view.zoom, event.deltaY);
            return event.preventDefault();
            /*
            mousePosition = new paper.Point(event.offsetX, event.offsetY);
            viewPosition = view.viewToProject(mousePosition);
            ref = panAndZoom.changeZoom(view.zoom, event.deltaY, view.center, viewPosition), newZoom = ref[0], offset = ref[1];
            view.zoom = newZoom;
            view.center = view.center.add(offset);
            event.preventDefault();
            return view.draw();
            */
          }
        });
    }
}

engine2D.new = function (){

    for(var i=0; i<=2; i++) //TODO: make this dynamic increase
    {
        scene2DWallMesh[i] = new Array();
        scene2DWallDimentions[i] = new Array();
        scene2DDoorGroup[i] = new Array();
        scene2DWallGroup = new Array()
        scene2DWallPointGroup = new Array()
        scene2DInteriorMesh[i] = new Array();
        scene2DExteriorMesh[i] = new Array();
    }
}
