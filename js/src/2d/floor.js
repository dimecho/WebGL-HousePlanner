var engine2D = window.engine2D || {};

engine2D.makeFloor = function () {

    if(scene2DWallGroup[FLOOR] != undefined)
    {
        with (paper) {
            console.log("2D Floor Generate " + scene2DWallGroup[FLOOR].children.length);

            var shape = new Path();
            shape.fillColor = 'green';
            shape.closed = true;

            for(i = 0; i < scene2DWallGroup[FLOOR].children.length; i++)
            {
                var path = scene2DWallGroup[FLOOR].children[i].children[0].children[0];
                
                if(i == 0)
                    shape.moveTo(path.segments[0].point);

                shape.quadraticCurveTo(new Point(path.segments[1].point.x,path.segments[1].point.y), path.segments[1].point.x,path.segments[1].point.y);
            }
            //shape.opacity = 0.5;

            //if(canvas2D != undefined) {

                var canvas = document.createElement('canvas');
                canvas.width = shape.bounds.width;
                canvas.height = shape.bounds.height;
                var context = canvas.getContext('2d');
                var img = new Image();
                img.src = 'objects/FloorPlan/Default/4.png';
                img.onload = function() {
                    context.fillStyle = context.createPattern(this,"repeat");
                    context.fillRect(0, 0, shape.bounds.width, shape.bounds.height);
                    context.fill();
                };
                var raster = new Raster(canvas,new Point(shape.bounds.x,shape.bounds.y));
                raster.fitBounds(shape.bounds, true);
                var floor = new Group([shape,raster]);
                floor.clipped = true;
                canvas2D.addChild(floor);
            //}
        }
    }
}