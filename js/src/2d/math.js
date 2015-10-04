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