function scene2DInitializeRenderer()
{
    /*
    scene2D = new THREE.Scene();
    scene2D = new Kinetic.Stage({
        container: 'HTMLCanvas',
        width: window.innerWidth,
        height: window.innerHeight,
        listening: true
    });
    */
    scene2D = new fabric.Canvas('fabricjs', {
        isDrawingMode: false,
        isTouchSupported: true,
        selection: false,
        //preserveObjectStacking: true,
        width: window.innerWidth,
        height: window.innerHeight
    });
    
    if (scene2D.freeDrawingBrush) {
        scene2D.freeDrawingBrush.name = "freedraw";
        scene2D.freeDrawingBrush.color = "#000";
        scene2D.freeDrawingBrush.width = 8; //parseInt(drawingLineWidthEl.value, 10) || 1;
        scene2D.freeDrawingBrush.shadowBlur = 0;
        //scene2D.freeDrawingCursor='url(http://ani.cursors-4u.net/movie/mov-2/mov130.cur),default';
    }
    
    //$('#canvas_container').css('overflow-x', 'scroll');
    //$('#canvas_container').css('overflow-y', 'scroll'); //'hidden');

    //scene2D.renderAll();
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    fabric.Object.prototype.transparentCorners = false;

}