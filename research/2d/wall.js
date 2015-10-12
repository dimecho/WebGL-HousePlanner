
/*
Curved Walls
http://www.svgbasics.com/paths.html

http://phrogz.net/SVG/drag_under_transformation.xhtml
*/

engine2D.SVG_Wall = function (v1,v2,c,width) {

    width = 18;
    var h = width/2;

    var path_M   = "M" + v1.x + "," + v1.y;
    var path_C1  = "C" + (c.x - h) + "," + (c.y - h) + "," + (c.x - h) + "," + (c.y - h) + "," + (v2.x - h) + "," + (v2.y-h);
    var path_L1  = "L" + (v1.x - h) + "," + (v1.y - h);
    var path_C2  = "C" + (c.x + h) + "," + (c.y + h) + "," + (c.x + h) + "," + (c.y + h) + "," + (v1.x+ h) + "," + (v1.y + h);
    var path_L2  = "L" + (v2.x + h) + "," + (v2.y + h);
    var path_Z   = "z";
    var path = path_M + " " + path_L1 + " " + path_C1 + " " + path_L2 + " " + path_C2 + " " + path_Z;

    //var wall = scene2D.interpret(engine2D.makeSVGPath(path,"../objects/FloorPlan/Default/1.png"));
    var wall = scene2D.interpret(engine2D.SVG_makePath(path,null));
    wall.thickness = width;
    wall.svg = path;
    //wall.subdivide();

    //console.log(wall);
    
    return wall;
}

engine2D.SVG_makeTexture = function (texture) {

    var defs = document.createElement("defs");
    var pattern1 = document.createElement("pattern");
    var image1 = document.createElement("image");

    //image1.setAttribute('height', '210');
    //image1.setAttribute('width', '500');
    //pattern1.setAttribute("x","0");
    //pattern1.setAttribute("y","0");
    image1.setAttribute("xlink:href", texture);
    pattern1.setAttribute("id","svgTexture");
    pattern1.appendChild(image1);
    defs.appendChild(pattern1);

    //console.log(defs.childNodes[0].childNodes[0]);

    return defs;
}
engine2D.SVG_makePath = function (d,texture) {

    //$.get('../wall.svg', function(doc) {
        //var svg = $(doc).find('svg path')[0];
        //svg.center().translation.set(scene2D.width / 2, scene2D.height / 2);
    //});

    var svg = document.createElement("svg");
    svg.setAttribute("xmlns:svg", "http://www.w3.org/2000/svg");
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttribute("version", "1.1");

    var path = document.createElement("path");
    path.setAttribute("d",d);

    if(texture){
        if(texture.indexOf(".") > -1)
        {
            svg.appendChild(engine2D.SVG_makeTexture(texture));
            path.setAttribute("fill","url(#svgTexture)");
        }else{
            path.setAttribute("fill",texture);
        }
    }

    svg.appendChild(path);

    //console.log(svg);
    //console.log(svg.pathSegList[0]);
    //console.log(document.querySelectorAll('svg'));

    return svg;
}

engine2D.SVG_bringBack = function (el) {

}

engine2D.SVG_bringFront = function (el) {
    // move element "on top of" all others within the same grouping
    el.parentNode.appendChild(el); 

    // move element "underneath" all others within the same grouping
    el.parentNode.insertBefore(el,el.parentNode.firstChild);

    // move element "on top of" all others in the entire document
    el.ownerSVGElement.appendChild(el); 

    // move element "underneath" all others in the entire document
    el.ownerSVGElement.appendChild(el,el.ownerSVGElement.firstChild); 
}

engine2D.makeWall = function (v1,v2,c,id,i) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    if(i === null)
        i = FLOOR;

    if( v2.x-v1.x < 0 || v2.y-v1.y < 0) //top to bottom or left to right
    {
        //revese coordinate polarity
        var v = v1;
        v1=v2;
        v2=v;
        console.log("Reversed " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y + " (" + id + ")");
    }else{
        console.log("Normal " + v1.x + ":" + v1.y + "-" + v2.x + ":" + v2.y + " (" + id + ")");
    }

    //Find center point
    if(c.x === 0 && c.y === 0)
    {
        var p = scene2DGetWallParallelCoordinates({x: v1.x, y: v1.y},{x: v2.x, y: v2.y},0);
        c.x = p.x1 + (p.x2 - p.x1) / 2; //center
        c.y = p.y1 + (p.y2 - p.y1) / 2; //center
    }
    /*
    Quadratic Curve
    http://fabricjs.com/quadratic-curve/
    */
    /*
    var line = new fabric.Path('M 0 0 Q 0 0 0 0', { fill: null });
    line.path[0][1] = v1.x;
    line.path[0][2] = v1.y;
    line.path[1][1] = c.x; //curve left
    line.path[1][2] = c.y; //curve right
    line.path[1][3] = v2.x;
    line.path[1][4] = v2.y;
    */

    /*
    var line = scene2D.interpret(document.querySelector('.assets svg'));
    line.linewidth = radius;
    line.cap = line.join = 'round';
    line.noFill().stroke = '#333';
    */
    /*
    var points = [];
    points.push(v1.x);
    points.push(v1.y);
    points.push(c.x);
    points.push(c.y);
    points.push(v2.x);
    points.push(v2.y);
    points.push(true); // open poly
    //points.pop(); // remove true/false value
    var line = scene2D.makeCurve.apply(scene2D, points);
    line.stroke = "#00CC33";
    line.linewidth = 1;
    line.opacity = 0;
    */

    var group = scene2D.makeGroup();

    /*
    var points = [];
    points.push(new Two.Anchor(v1.x, v1.y, 0, 0, 0, 0, Two.Commands.move));
    points.push(new Two.Anchor(200, 100, -100, -100, 0, -100, Two.Commands.curve));
    points.push(new Two.Anchor(200, 200, 0, 0, 0, 0, Two.Commands.line));
    points.push(new Two.Anchor(v1.x, v1.y, 0, 0, 0, 0, Two.Commands.line));
    var wall = new Two.Polygon(points, true, true, true);
    */
    var wall = engine2D.SVG_Wall(v1,v2,c);
    //wall.fill = "url(#img_exterior)";
    wall.stroke = "#000000";
    wall.linewidth = 2;
    console.log(wall.svg);
    //wall.line = line;
    //wall.translation.set(scene2D.width / 2, scene2D.height / 2);
    group.add(wall);
    //group.add(line);

    //var background = scene2D.makeSprite('../objects/FloorPlan/Default/0.jpg');
    //group.mask = background;
    //background.mask = wall;

    /*
    var points = [
        new Two.Vector(v1.x, v1.y),
        new Two.Vector(c.x, c.y),
        new Two.Vector(v2.x, v2.y),
    ];
    var line = scene2D.makePath(points);
    line.fill = "#000000"; //noFill()
    line.stroke = "#66FF33";
    line.linewidth = 1;
    //line.visible = false;
    */

    /*
    points = [
        new Two.Vector(v1.x, v1.y),
        new Two.Vector(c.x, c.y),
        new Two.Vector(v2.x, v2.y),
        new Two.Vector(v2.x, v2.y+8),
        new Two.Vector(c.x, c.y+8),
        new Two.Vector(v1.x, v1.y+8),
        new Two.Vector(v1.x, v1.y) //close loop
        //new Two.Anchor(v1.x, v1.y),
        //new Two.Vector(c.x, c.y),
        //new Two.Anchor(v2.x, v2.y)
    ];
    //var line = new Two.Path([
    //    new Two.Anchor(v1.x, v1.y),
    //    new Two.Anchor(v2.x, v2.y)
    //]);
    //var line = new Two.Path(points);
    //var line = scene2D.makePath(points);
    */
    

    /*
    var line  = new Two.Polygon([
        new Two.Anchor(100, 100, 0, 0, 0, 0, Two.Commands.move),
        new Two.Anchor(200, 100, -100, -100, 0, -100, Two.Commands.curve),
        new Two.Anchor(200, 200, 0, 0, 0, 0, Two.Commands.line),
        new Two.Anchor(100, 200, 0, 0, 0, 0, Two.Commands.line)
    ], true, false, true);
    scene2D.add(line);
    */
    //var anchor = new Two.Anchor(c.x, c.y, c.x, c.y, v2.x, v2.y, Two.Commands.curve);
    //anchor.relative = false;
    //var line = new Two.Polygon(anchor, true, true);

    //group.add(line);

    /*
    var line = scene2D.makePolygon([
        new Two.Anchor(10, 10),
        new Two.Anchor(20, 10, 10, 0, 20, 0, Two.Commands.curve),
        new Two.Anchor(20, 20),
        new Two.Anchor(10, 20, 0, 0, 0, 0, Two.Commands.close),
        //new Two.Anchor(10, 20)
    ]);
    scene2D.add(line);
    */
    //for (var i = 0; i < line.vertices.length; i++) {
    //    var v = line.vertices[i];
    //    console.log(v);    
    //}
    
    //lineselect.visible = true;
    
    /*
    var points = [
        new Two.Vector(v1.x, v1.y),
        new Two.Vector(v2.x, v2.y),
    ];
    var line = two.makePolygon(points);
    console.log(points[0].x, points[0].y); // -25, -25
    */
    

    //line.cap = line.join = 'round';
    /*
    var resize = function() {
        var cx = two.width / 2;
        var cy = two.height / 2;
        var rect = line.getBoundingClientRect();
        line.translation.set(cx - rect.width / 2, cy - rect.height / 2);
    };
    scene2D.bind('resize', resize);
    */
    //var objects = [];
    var color = "#3399FF" ;
    var pivot = scene2D.makeCircle(c.x, c.y, 10);
    pivot.noStroke().fill = color
    pivot.opacity = 0.4;
    pivot.wall = wall;
    pivot.points = new Array();
    pivot.translation.bind(Two.Events.change, function() {
        //console.log(pivot.points);

        var h = pivot.wall.thickness/2;

        //TODO: spread Bazier Curve points
        pivot.points[1].translation.set(pivot.translation.x-h, pivot.translation.y-h);
        pivot.points[2].translation.set(pivot.translation.x-h, pivot.translation.y-h);

        //TODO: calculate paralel Bazier Curve
        pivot.points[5].translation.set(pivot.translation.x+h, pivot.translation.y+h);
        pivot.points[6].translation.set(pivot.translation.x+h, pivot.translation.y+h);

        //console.log(pivot.wall.line);
    });
    group.add(pivot);
    scene2D.update();
    scene2DPivotPointElementMove(pivot);

    //console.log(wall.children[0].vertices);
    //_.each(wall.children[0], function(polygon) {
        //console.log(polygon);
        _.each(wall.children[0].vertices, function(anchor) {
            console.log(anchor);
            /*
            var point = scene2D.makeCircle(c.x, c.y, radius / 4);
            point.noStroke().fill = "rgb(79, 128, 255)";
            point.wall = wall;
            group.add(point);
            scene2D.update();
            scene2DPivotPointElementMove(point);
            */
            
            var curve = true;
            //DEBUG
            /*
            if(anchor.command == "M")
            {
                color = "#B00000";
                curve = false;
            }
            if(anchor.command == "L")
            {
                color = "#FFCC00";
                //curve = false;
            }
            */

            if(anchor.command != "M")
            {
                var p = scene2D.makeCircle(0, 0, 10);
                p.translation.copy(anchor);
                p.noStroke().fill = color
                p.visible = false;
                p.translation.bind(Two.Events.change, function() {
                    anchor.copy(this);
                    l.translation.copy(anchor.controls.left).addSelf(this);
                    r.translation.copy(anchor.controls.right).addSelf(this);
                    ll.vertices[0].copy(this);
                    rl.vertices[0].copy(this);
                    ll.vertices[1].copy(l.translation);
                    rl.vertices[1].copy(r.translation);
                });
            
                if(curve == true)
                {
                    var l = scene2D.makeCircle(0, 0, 10);
                    var r = scene2D.makeCircle(0, 0, 10);
                    l.translation.copy(anchor.controls.left).addSelf(anchor);
                    r.translation.copy(anchor.controls.right).addSelf(anchor);
                    l.noStroke().fill = r.noStroke().fill = color;
                    l.opacity = r.opacity = 0.2;
                    l.visible = r.visible = false; //DEBUG
                    pivot.points.push(l);
                    pivot.points.push(r);
                    /*
                    var ll = new Two.Path([
                      new Two.Anchor().copy(p.translation),
                      new Two.Anchor().copy(l.translation)
                    ]);
                    var rl = new Two.Path([
                        new Two.Anchor().copy(p.translation),
                        new Two.Anchor().copy(r.translation)
                    ]);
                    rl.noFill().stroke = ll.noFill().stroke = color;
                    group.add(rl, ll, p, l, r);
                    */
                    group.add(p, l, r);

                    l.translation.bind(Two.Events.change, function() {
                        anchor.controls.left.copy(this).subSelf(anchor);
                        //ll.vertices[1].copy(this);
                    });
                    r.translation.bind(Two.Events.change, function() {
                        anchor.controls.right.copy(this).subSelf(anchor);
                        //rl.vertices[1].copy(this);
                    });
             
                    scene2D.update();
                    scene2DPivotPointElementMove(p);
                    scene2DPivotPointElementMove(l);
                    scene2DPivotPointElementMove(r);

                }else{
                    //group.add(p);
                    scene2D.update();
                    //scene2DPivotPointElementMove(p);
                }
            }
        });
    //});
    //pivot.points = objects;

    //console.log(p.id);
    var mouse = new Two.Vector();
    scene2D.renderer.domElement.addEventListener('mousemove', function(e) {
        var rect = this.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        //console.log(mouse.x + ":" + mouse.y)
    }, false);
    /*
    scene2D.renderer.domElement.addEventListener('mousedown', function(e) {
        console.log('mousedown')
    }, false);
    */
    /*
    scene2D.bind('update', function(frameCount) {
        for (var i = 0; i < group.length; i++) {
            var object = group[i];
        }
    });
    */
    
    //var domElement = document.querySelector(p.id);
    //var domElement = document.querySelector('#' + p.id);
    //var domElement = document.querySelectorAll( p.id);
    //console.log(domElement);

    //for (var i = 0; i < domElement.length; i++) {
    //    console.log(domElement[i]);
    //}

    //domElement.addEventListener('click', function(e) {
    //    console.log(e);
    //});
    //console.log(p._renderer);
    //p._renderer.elem.addEventListener('mousemove', function(e) {
    //    console.log(e.clientX+ ":" + e.clientY)
    //}, false);

/*
var polygons = [];
polygons.push(shape);
_.each(polygons, function(polygon){
    traverse(polygon, polygon);
    function traverse(node, p) {
                
        _.each(p.vertices, function(v) {
            var projection = node._matrix.multiply(v.x, v.y, 1);
            v.copy(projection);
            node.rotation = 0;
            node.scale = 1;
            node.translation.set(0, 0);
        });

        if (node.parent && node.id){
            traverse(node.parent, p);
        }      
    }            
});
*/
    //item(0) + item(1) Quandratic Curve Vector Path
    
    //item(2) - Dynamic Split Visual Circle

    //item(3) - Exterior Measurement Line

    //item(3) - Interior Measurement Line
 
    //item(6) - Measurement Text Background

    //item(7) - Measurement Text
    
    group.id = id;
    group.edge = [];

    //group.remove(wall,line,p); // Removes objects
    //group.remove(); // Removes the group itself
    //scene2D.remove(group);
    //scene2D.scene.clear();
    /*
    _.each(scene2D.scene.children, function(child) {
      child.remove();
    });
    */

    //var domElement = document.querySelector('[id*=\"canvas\"]');
    //var domElement = document.querySelector("canvas");
    //var domElement = document.querySelector("body");
    //console.log(domElement);
    //for (var i = 0; i < domElement.length; i++) {
    //    console.log(domElement[i]);
    //}
    //console.log(point._renderer);

    $(wall._renderer.elem)
      .bind('mouseover', function(e) {
        e.preventDefault();
        wall.stroke = "#E00000";
        wall.line.opacity = 1;
      })
      .bind('mouseout', function(e) {
        e.preventDefault();
        wall.stroke = "#000000";
        //wall.line.opacity = 0;
      })
      .bind('mouseover', function(e) {
        e.preventDefault();
        wall.stroke = "#E00000";
        //wall.line.opacity = 1;
    });

    var cursor = scene2D.makeCircle(0, 0, 8);
    cursor.fill = cursor.stroke = '#FFFF00';
    cursor.linewidth = 10;
    cursor.opacity = 0;
    cursor.cap = cursor.join = 'round';

    var pct = 0, projection = new Two.Vector();
    
    var scene2DWallMouseMove = function(e) {
        cursor.opacity = 1;
        /*
        pct = e.clientX / (scene2D.width + v1.x + v2.x);
        line.getPointAt(pct, cursor.translation);
        cursor.translation.addSelf(line.translation);
        */
        
    }

    var scene2DWallTouchMove = function(e) {
        e.preventDefault();
        var touch = e.originalEvent.changedTouches[0];
        scene2DWallMouseMove({
            clientX: touch.pageX,
            clientY: touch.pageY
        });
        return false;
    }

    $(wall._renderer.elem).bind('mousemove', scene2DWallMouseMove)
    $(wall._renderer.elem).bind('touchmove', scene2DWallTouchMove);

    return group;
}

function scene2DPivotPointElementMove(shape) {

    var offset = shape.parent.translation;

    var drag = function(e) {
      e.preventDefault();
      var x = e.clientX - offset.x;
      var y = e.clientY - offset.y;
      shape.translation.set(x, y);
    };
    var touchDrag = function(e) {
      e.preventDefault();
      var touch = e.originalEvent.changedTouches[0];
      drag({
        preventDefault: _.identity,
        clientX: touch.pageX,
        clientY: touch.pageY
      });
      return false;
    };
    var dragEnd = function(e) {
      e.preventDefault();
      $(window)
        .unbind('mousemove', drag)
        .unbind('mouseup', dragEnd);
    };
    var touchEnd = function(e) {
      e.preventDefault();
      $(window)
        .unbind('touchmove', touchDrag)
        .unbind('touchend', touchEnd);
      return false;
    };

    $(shape._renderer.elem)
      .css({
        cursor: 'pointer'
      })
      .bind('mousedown', function(e) {
        e.preventDefault();
        $(window)
          .bind('mousemove', drag)
          .bind('mouseup', dragEnd);
      })
      .bind('mouseover', function(e) {
        e.preventDefault();
        shape.opacity = 1;
        shape.wall.stroke = "#E00000";
      })
      .bind('mouseout', function(e) {
        e.preventDefault();
        shape.opacity = 0.3;
        shape.wall.stroke = "#000000";
      })
      .bind('touchstart', function(e) {
        e.preventDefault();
        $(window)
          .bind('touchmove', touchDrag)
          .bind('touchend', touchEnd);
        return false;
    });
    /*
    shape.translation.bind(Two.Events.change, function() {
        //console.log(point.translation.x + ":" + point.translation.y)
        //console.log(point.wall._collection[1]);
        console.log(shape.wall.id);

        //var domElement = document.querySelector('[id*=' + point.wall.id + ']');
        //var domElement = document.querySelector('#' + shape.wall.id);
        //console.log(domElement.attributes[1]);

        shape.wall.vertices[1].x = shape.translation.x;
        shape.wall.vertices[1].y = shape.translation.y;
        //point.wall.vertices[3].x = point.translation.x;
        //point.wall.vertices[3].y = point.translation.y;
        /
        _.each(point.wall.vertices, function(v) {
            console.log(v.command);
            if(v.command == "C")
            {
                v.x = point.translation.x;
                v.y = point.translation.y;
            }
        });
        /
        //point.wall._collection[0]._x = point.translation.x;
        //point.wall._collection[0]._y = point.translation.y;
        scene2D.update()
        //point.wall.visible = false;
                //anchor.copy(this);
                //l.translation.copy(anchor.controls.left).addSelf(this);
                //r.translation.copy(anchor.controls.right).addSelf(this);
        //ll.vertices[0].copy(this);
        //rl.vertices[0].copy(this);
        //ll.vertices[1].copy(l.translation);
        //rl.vertices[1].copy(r.translation);
    });
*/
}


/**
 * Checks if two line segments intersects.
 * @method segmentsIntersect
 * @param {Array} p1 The start vertex of the first line segment.
 * @param {Array} p2 The end vertex of the first line segment.
 * @param {Array} q1 The start vertex of the second line segment.
 * @param {Array} q2 The end vertex of the second line segment.
 * @return {Boolean} True if the two line segments intersect
 */
function segmentsIntersect(p1, p2, q1, q2){
   var dx = p2[0] - p1[0];
   var dy = p2[1] - p1[1];
   var da = q2[0] - q1[0];
   var db = q2[1] - q1[1];

   // segments are parallel
   if(da*dy - db*dx == 0)
      return false;

   var s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx)
   var t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy)

   return (s>=0 && s<=1 && t>=0 && t<=1);
};

/**
 * Compute the intersection between two lines.
 * @static
 * @method lineInt
 * @param  {Array}  l1          Line vector 1
 * @param  {Array}  l2          Line vector 2
 * @param  {Number} precision   Precision to use when checking if the lines are parallel
 * @return {Array}              The intersection point.
 */
function lineIntersect (l1,l2,precision){
    precision = precision || 0;
    var i = [0,0]; // point
    var a1, b1, c1, a2, b2, c2, det; // scalars
    a1 = l1[1][1] - l1[0][1];
    b1 = l1[0][0] - l1[1][0];
    c1 = a1 * l1[0][0] + b1 * l1[0][1];
    a2 = l2[1][1] - l2[0][1];
    b2 = l2[0][0] - l2[1][0];
    c2 = a2 * l2[0][0] + b2 * l2[0][1];
    det = a1 * b2 - a2*b1;
    if (!Scalar.eq(det, 0, precision)) { // lines are not parallel
        i[0] = (b2 * c1 - b1 * c2) / det;
        i[1] = (a1 * c2 - a2 * c1) / det;
    }
    return i;
};