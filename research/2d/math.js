/*
box.on("dragend", function(){
    snaptogrid(box);
  });
*/
function snaptogrid(object) {
    object.x = Math.floor(object.x / 100) * 100 + 50;
    object.y = Math.floor(object.y / 100) * 100 + 50;
}

/*
* Calculates the angle ABC (in radians) 
*
* A first point
* C second point
* B center point
*/
function find2DAngle(A,B,C) {
    /*
    http://stackoverflow.com/questions/17763392/how-to-calculate-in-javascript-angle-between-3-points
    */
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

function scene2DSurfaceArea(p)
{
    /*
    area = 0;
    for( i = 0; i < N; i += 2 )
       area += x[i+1]*(y[i+2]-y[i]) + y[i+1]*(x[i]-x[i+2]);
    area /= 2;
    */

    //https://www.topcoder.com/community/data-science/data-science-tutorials/geometry-concepts-basic-concepts/#polygon_area
    var area = 0;
    var N = p.length;

    for(i = 1; i+1<N; i++){
        var x1 = p[i][0] - p[0][0];
        var y1 = p[i][1] - p[0][1];
        var x2 = p[i+1][0] - p[0][0];
        var y2 = p[i+1][1] - p[0][1];
        var cross = x1*y2 - x2*y1;
        area += cross;
    }
    return Math.abs(area/2.0);
}

function scene2DWallMeasurementExternal() {

}

function scene2DWallMeasurementInternal() {

}

function scene2DCheckLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    /*
    http://jsfiddle.net/justin_c_rounds/Gd2S2
    */
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator === 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
    // it is worth noting that this should be the same as:
    x = line2StartX + (b * (line2EndX - line2StartX));
    y = line2StartX + (b * (line2EndY - line2StartY));
    */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}

function scene2DLineLength(x, y, x0, y0){
    /*
    http://jsfromhell.com/math/line-length
    */
    return Math.sqrt((x -= x0) * x + (y -= y0) * y);
}

function scene2DPointToLineLength(x, y, x0, y0, x1, y1, o){
    /*
    http://jsfromhell.com/math/dot-line-length
    */
    if(o && !(o = function(x, y, x0, y0, x1, y1){
        if(!(x1 - x0)) return {x: x0, y: y};
        else if(!(y1 - y0)) return {x: x, y: y0};
        var left, tg = -1 / ((y1 - y0) / (x1 - x0));
        return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
    }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
        var l1 = scene2DLineLength(x, y, x0, y0), l2 = scene2DLineLength(x, y, x1, y1);
        return l1 > l2 ? l2 : l1;
    }
    else {
        var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
        return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
    }
}

function scene2DGetWallParallelCoordinates(v1,v2,offsetPixels) {

    /*
    Most advanced calculations of this project turn out to be wall lengths :)
    http://www.wenda.io/questions/165404/draw-a-parallel-line.html
    */

    var p = {x1: 0, y1: 0, x2: 0, y2: 0};

    var L = Math.sqrt((v1.x-v2.x)*(v1.x-v2.x)+(v1.y-v2.y)*(v1.y-v2.y));

    // This is the second line
    p.x1 = v1.x + offsetPixels * (v2.y-v1.y) / L;
    p.x2 = v2.x + offsetPixels * (v2.y-v1.y) / L;
    p.y1 = v1.y + offsetPixels * (v1.x-v2.x) / L;
    p.y2 = v2.y + offsetPixels * (v1.x-v2.x) / L;

    return p;
}

function scene2DGetCenterPivot(v1,v2)
{
    var p = scene2DGetWallParallelCoordinates(v1,v2,0);
    return ({x:p.x1 + (p.x2 - p.x1) / 2, y:p.y1 + (p.y2 - p.y1) / 2});
}


function scene2DMakeWallCurvedPivot(v1,v2,line,lock)
{
    var point = scene2DGetCenterPivot(v1,v2);
    var pivot = scene2DMakeWallPivotCircle(0, 0, false); //TOD: combine these two functions into scene2DMakeWallPivotPoint
    pivot.line = new Array(line);

    pivot.left = point.x;
    pivot.top = point.y;

    //adjust wall to proper curvature
    line.item(0).path[1][1] = point.x;
    line.item(0).path[1][2] = point.y;

    return pivot;
}

function scene2DCalculateWallLength(v1,v2,v3,line)
{
    var n = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);
    var p1 = scene2DGetWallParallelCoordinates(v1,v2,24);
    var p2 = scene2DGetWallParallelCoordinates(v1,v2,-20);
    //var n2 = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);
    var cx = p1.x1 + (p1.x2 - p1.x1) / 2; //center
    var cy = p1.y1 + (p1.y2 - p1.y1) / 2; //center

    line.item(3).set({left:cx,top:cy});
    line.item(3).set("x1",p1.x1);
    line.item(3).set("y1",p1.y1);
    line.item(3).set("x2",p1.x2);
    line.item(3).set("y2",p1.y2);

    /*
    var l0 = new fabric.Line([p1.x1, p1.y1, p1.x2, p1.y2], {
        left: cx, //v1.x + (v2.x - v1.x)/2,
        top: cy, //v1.y - 20,
        stroke: '#000000',
        strokeWidth: 1,
        //strokeDashArray: [5, 5]
    });
    */
    /*
    http://tiku.io/questions/4547740/draw-perpendicular-line-to-given-line-on-canvas-android
    */
    //var vXP = -(v2.y-v1.y);
    //var vYP = v2.x-v1.x;

    //var ap = Math.atan2(v1.y - v2.y, v1.x - v2.x); //console.log(a);
    //if(ap == 0)
    //    ap = 90
    
    if(Math.abs(v1.y - v2.y) > Math.abs(v1.x-v2.x)) //vertical lines
    {
        a = -90;
    }else{
        a = 0;
    }

    line.item(4).set({left:p1.x1,top:p1.y1,angle:a+90});

    line.item(5).set({left:p1.x2,top:p1.y2,angle:a+90});

    line.item(6).set({left:cx,top:cy,angle:a});

    line.item(7).set({left:cx,top:cy,angle:a,text:(n/50).toFixed(1) + ' m'});
    //line.item(7).set({left:cx,top:cy,angle:a,text:line.id});

    /*
    var r = new fabric.Rect({
      left: cx,
      top: cy,
      fill: '#ffffff',
      width: 35,
      height: 20,
      angle: a
    });

    var l1 = new fabric.Line([0, 0, 6, 0], {
        left: p1.x1,
        top: p1.y1,
        stroke: '#000000',
        strokeWidth: 1,
        angle: a + 90
    });

    var l2 = l1.clone();
    l2.left = p1.x2;
    l2.top = p1.y2;
    
    var t = new fabric.Text((n1/50).toFixed(1) + ' m', {
        left: cx, //v1.x + (v2.x - v1.x)/2,
        top: cy, //v1.y - 20,
        fontFamily: 'helvetiker',
        fontWeight: 'normal',
        textAlign: 'left', //required
        //fill: '#ffffff',
        fontSize: 15,
        angle: a //Math.atan2(v1.y - v2.y, v1.x - v2.x)
    });
    */
    /*
    if(Math.abs(p1.y2 - p1.y1) < 50) //adjust fit for small vertical places
    {
        r.left = cx - 10;
        t.left = cx - 10;
        r.top = p1.y2;
        t.top = p1.y2;
    }
    */
    //return new fabric.Group([l0, l1, l2, r, t], {selectable:false});
    return n;
}

/*
http://stackoverflow.com/questions/17083580/i-want-to-do-animation-of-an-object-along-a-particular-path
http://jsfiddle.net/m1erickson/LumMX/
*/

function scene2DGroupArrayDynamicPosition(v1,v2,n,group)
{
    if(!n) //speed things up
        n = scene2DLineLength(v1.x,v1.y,v2.x,v2.y);

    for (var i = 0; i < group.length; i++)
    {
        if(group[i])
        {
            var scale = group[i][0].origin.x / n; //TODO: calculate the scale ration dynamically?
            //============ LERP Formula ==============
            //start.x + (final.x - start.x) * progress;
            var L1x = v2.x + (v1.x - v2.x) * scale;
            var L1y = v2.y + (v1.y - v2.y) * scale;
            //========================================
            //var startAngle = Math.atan2(L2y-v2.y, L2x-v2.x);
            //var endAngle = Math.atan2(L1y-v2.y, L1x-v2.x);
            var a = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI;
            //var a = Math.atan2(L1y-v2.y, L1x-v2.x) * 180 / Math.PI;

            group[i][0].left = L1x;
            group[i][0].top = L1y;
            group[i][0].angle = a;
            //console.log(a);
            //if(group[i][0].name == 'window')
                //group[i][0].angle =  0; //TODO: Fix this dynamically
            //group.doors[i][0].adjustcircle.set({opacity:0});
        }
    }
}

function scene2DgetLineXYatPercent(startPt,endPt,percent) {
    // line: percent is 0-1
    var dx = endPt.x-startPt.x;
    var dy = endPt.y-startPt.y;
    var x = startPt.x + dx*percent;
    var y = startPt.y + dy*percent;
    return( {left:x,top:y} );
}

function scene2DgetQuadraticBezierXYatPercent(startPt,controlPt,endPt,percent) {
    // quadratic bezier: percent is 0-1
    var x = Math.pow(1-percent,2) * startPt.x + 2 * (1-percent) * percent * controlPt.left + Math.pow(percent,2) * endPt.x; 
    var y = Math.pow(1-percent,2) * startPt.y + 2 * (1-percent) * percent * controlPt.top + Math.pow(percent,2) * endPt.y; 
    return( {left:x,top:y} );
}