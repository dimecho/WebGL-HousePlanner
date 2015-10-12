
function scene2DMakeWindow(v1,v2,c,z,open,direction,id) {

    if(id === null)
        id = Math.random().toString(36).substring(7);

    //v2.x = v2.x - v1.x;
    //v2.y = v2.y - v1.y;

    var group = [];

    var line1 = new fabric.Line([0, 0, v2.x, v2.y], {
        stroke: '#f5f5f5',
        strokeWidth: 18
    });

    var line2 = new fabric.Line([0, 0, v2.x, v2.y], {
        stroke: '#000000',
        strokeWidth: 4,
        name:'window-frame'
    });

    var group = new fabric.Group([line1,line2], {selectable:true, hasBorders:false, hasControls:false, name:'window', z:z, open:open, direction:direction, id:id});
    group.origin = v1;

    /*
    if(open == "bay")
    {
        if(direction == "in")
        {
        }else{
        }
    }
    */

    return group;
}
