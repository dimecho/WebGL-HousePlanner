var engine2D = window.engine2D || {};

engine2D.initialize = function (){
    
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

/**
 * Item name is unique
 */
fabric.Canvas.prototype.getItemByName = function(name) {
    var object = null,
        objects = this.getObjects();

    for (var i = 0, len = this.size(); i < len; i++) {
        if (objects[i].name && objects[i].name === name) {
            object = objects[i];
            break;
        }
    }

    return object;
};

engine2D.new = function (){
    for(var i=0; i<=2; i++)
    {
        scene2DWallMesh[i] = new Array();
        scene2DWallDimentions[i] = new Array();
        scene2DDoorMesh[i] = new Array();
        scene2DWindowMesh[i] = new Array();
        scene2DInteriorMesh[i] = new Array();
        scene2DExteriorMesh[i] = new Array();
    }
}

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
                scene2DDoorMesh[i][d] = scene2DMakeDoor({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['position.z'],this['open'],this['direction'],this['id']);
                scene2DDoorMesh[i][d].file = this.door;
                d++;
            }
            else if(this.window !== undefined)
            {
                scene2DWindowMesh[i][w] = scene2DMakeWindow({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['position.z'],this['open'],this['direction'],this['id']);
                scene2DWindowMesh[i][w].file = this.window;
                w++;
            }
            else if(this.wall !== undefined)
            {
                scene2DWallMesh[i][l] = scene2DMakeWall({x:this['position.x1'],y:this['position.y1']},{x:this['position.x2'],y:this['position.y2']},{x:this['curve.x'],y:this['curve.y']},this['id'],i);
                l++;
            }
        });
        i++;
    });
}
