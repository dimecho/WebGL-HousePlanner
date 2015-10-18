var Math2D = window.Math2D || {};
/*
box.on("dragend", function(){
    snaptogrid(box);
  });
*/
Math2D.snapToGrid = function (object) {
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
Math2D.find2DAngle = function(A,B,C) {
    /*
    http://stackoverflow.com/questions/17763392/how-to-calculate-in-javascript-angle-between-3-points
    */
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
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
Math2D.segmentsIntersect = function(p1, p2, q1, q2){
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

Math2D.surfaceArea = function(p)
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

Math2D.lineIntersect2 = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
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

Math2D.lineLength = function(x, y, x0, y0){
    /*
    http://jsfromhell.com/math/line-length
    */
    return Math.sqrt((x -= x0) * x + (y -= y0) * y);
}

Math2D.lineLengthToPoint = function(x, y, x0, y0, x1, y1, o){
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

Math2D.lineParallelCoordinates = function(v1,v2,offsetPixels) {

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

Math2D.lineCenterPivot = function(v1,v2)
{
    var p = Math2D.lineParallelCoordinates(v1,v2,0);
    return ({x:p.x1 + (p.x2 - p.x1) / 2, y:p.y1 + (p.y2 - p.y1) / 2});
}

Math2D.lineXYatPercent = function(startPt,endPt,percent) {
    // line: percent is 0-1
    var dx = endPt.x-startPt.x;
    var dy = endPt.y-startPt.y;
    var x = startPt.x + dx*percent;
    var y = startPt.y + dy*percent;
    return( {x:x,y:y} );
}

Math2D.quadraticBezierXYatPercent = function(startPt,controlPt,endPt,percent) {
    // quadratic bezier: percent is 0-1
    var x = Math.pow(1-percent,2) * startPt.x + 2 * (1-percent) * percent * controlPt.left + Math.pow(percent,2) * endPt.x; 
    var y = Math.pow(1-percent,2) * startPt.y + 2 * (1-percent) * percent * controlPt.top + Math.pow(percent,2) * endPt.y; 
    return( {x:x,y:y} );
}