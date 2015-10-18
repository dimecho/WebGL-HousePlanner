var engine2D = window.engine2D || {};

engine2D.makeDoor = function(l,c,z,open,direction) {

    //TODO: lock/hide wall curve if door is present
    //var angle = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI;


    with (paper) {

        //direction = 'out';

        var group = new Group();
        var path = new Path();
        var guide = new Path();
        var A = new Group();
        var B = new Group();
        var lineA = new Path();
        var lineB = new Path();

        path.moveTo(new Point(0,0));
        path.lineTo(new Point(l,0));

        //guide.moveTo(new Point(-20,0));
        //guide.lineTo(new Point(path.length + 20,0));
        guide.moveTo(new Point(0,0));
        guide.lineTo(new Point(l,0));
        guide.strokeColor = '#ffff';
        guide.strokeWidth = 20;
        //guide.opacity = 0;

        path.strokeColor = '#000000';
        path.strokeWidth = 10;

        lineA.moveTo(new Point(10,-12));
        lineA.lineTo(new Point(10,12));

        lineB.moveTo(new Point(path.length-10,-12));
        lineB.lineTo(new Point(path.length-10, 12));

        lineA.strokeColor = lineB.strokeColor = '#00CC33';
        lineA.strokeWidth = lineB.strokeWidth = 3;
        A.opacity = B.opacity = 0;

        var triA = new Path.RegularPolygon(new Point(0, 0), 3, 12);
        var triB = new Path.RegularPolygon(new Point(path.length, 0), 3, 12);
        triA.rotate(30);
        triB.rotate(-30);
        triA.fillColor = triB.fillColor = '#00CC33';

        var pivot = new Path();
        pivot.strokeColor = '#000000';
        pivot.strokeWidth = 4;

        var circle = new Path.Circle(new Point(0, 0), 10);
        circle.fillColor = '#FFCC00';
        circle.opacity = 0;

        var p1;
        var p2;
        var pv;
        var x;
        var y;
        var angle = 45 * (Math.PI / 180);
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);

        if(open === "right"){
            p1 = new Point(0,0);
            pv = new Point(path.length,0);

        }else if(open === "left"){

            p1 = new Point(path.length,0);
            pv = new Point(0,0);
        }
        pivot.moveTo(pv);

        if(direction === "in")
        {
            pivot.lineTo(new Point(pv.x, pv.y + path.length));
            p2 = new Point(pv.x, pv.y + path.length);
            x = pv.x+(path.length*sin);
            y = pv.y+(path.length*cos);
        }else{
            pivot.lineTo(new Point(pv.x, pv.y - path.length));
            p2 = new Point(pv.x, pv.y - path.length);
            x = pv.x-(path.length*sin);
            y = pv.y-(path.length*cos);
        }

        var arc = new Path.Arc(p1, new Point(x,y), p2);
        arc.strokeColor = '#000000';
        arc.strokeWidth = 1;

        //Calculate guides
        //=========================
        p1 = new Point(path.length, 0 - path.length);
        p2 = new Point(path.length, 0 + path.length);
        mp = new Point(0, 0);
        var guide1 = new Path.Arc(p1, mp, p2);
        var round1 = new Path.Arc(p1, mp, p2);

        p1 = new Point(0, 0 - path.length);
        p2 = new Point(0, 0 + path.length);
        mp = new Point(0, path.length);
        var guide2 = new Path.Arc(p1, mp, p2);
        var round2 = new Path.Arc(p1, mp, p2);
       
        guide1.strokeColor = guide2.strokeColor = '#000000';
        guide1.strokeWidth = guide2.strokeWidth = 1;
        guide1.dashArray = guide2.dashArray = [10, 10];
        guide1.opacity = guide2.opacity = 0;

        round1.strokeColor = round2.strokeColor = '#000000';
        round1.strokeWidth = round2.strokeWidth = 20;
        round1.opacity = round2.opacity = 0;

        //=========================

        A.addChild(lineA);
        A.addChild(triA);
        B.addChild(lineB);
        B.addChild(triB);

        group.addChild(pivot);
        group.addChild(arc);
        group.addChild(round1);
        group.addChild(guide1);
        group.addChild(round2);
        group.addChild(guide2);
        group.addChild(circle);
        group.addChild(guide);
        group.addChild(path);
        group.addChild(A);
        group.addChild(B);
        path.group = group;

        //group.position = new Point(v1.x,v1.y);
        group.position = new Point(c.x,c.y); //TODO: Fix this

        project.layers.push(group);

        //====================================
        var enter = false;
        var tick;

        path.attach('mouseenter', function() {
            A.opacity = 1;
            B.opacity = 1;
            A.drag = false;
            B.drag = false;
            circle.opacity = 0;
            guide1.opacity = 0;
            guide2.opacity = 0;
        });

        path.attach('mousemove', function() {
            clearTimeout(tick);
            tick = setTimeout(function() {
                A.opacity = 0;
                B.opacity = 0;
            }, 400);
        });

        A.attach('mousedrag', function(event) {
            dragAB(this,event,0);
        });

        B.attach('mousedrag', function(event) {
            dragAB(this,event,1);
        });

        function dragAB(obj,event,i)
        {
            obj.drag = true;
            obj.position.x = event.point.x;
            obj.opacity = 1;
            B.opacity = 1;
            path.segments[i].point.x = event.point.x;
            guide.segments[i].point.x = event.point.x;

            if(direction === "in")
            {
                pivot.segments[1].point.y = pivot.segments[0].point.y + path.length;
            }else{
                pivot.segments[1].point.y = pivot.segments[0].point.y - path.length;
            }
            
            
            arc.clear();
            guide1.clear();
            guide2.clear();
            round1.clear();
            round2.clear();
            
            //group.clear();
            //group = engine2D.makeDoor({x:event.point.x,y:event.point.y},{x:path.segments[1].point.x,y:path.segments[1].point.y},c,z,open,direction);
        
            if(open === "right")
            {

                if(i == 0) //A
                {
                    arc = new Path.Arc(event.point, new Point(pivot.segments[0].point.x-(path.length*sin),pivot.segments[0].point.y-(path.length*cos)), new Point(pivot.segments[1].point.x, pivot.segments[1].point.y));
                
                }else{ //B

                    pivot.segments[0].point.x = event.point.x;
                    pivot.segments[1].point.x = event.point.x;
                    x = pivot.segments[0].point.x-(path.length*sin);
                    y = pivot.segments[0].point.y-(path.length*cos);
                    arc = new Path.Arc(new Point(path.segments[0].point.x, path.segments[0].point.y), new Point(x,y), new Point(pivot.segments[1].point.x, pivot.segments[1].point.y));
                }
                arc.strokeColor = '#000000';
                arc.strokeWidth = 1;

                guide1 = new Path.Arc(new Point(path.segments[1].point.x, path.segments[1].point.y - path.length), new Point(path.segments[0].point.x, path.segments[0].point.y), new Point(path.segments[1].point.x, path.segments[1].point.y + path.length));
                guide2 = new Path.Arc(new Point(path.segments[0].point.x, path.segments[0].point.y - path.length), new Point(path.segments[1].point.x, path.segments[1].point.y), new Point(path.segments[0].point.x, path.segments[0].point.y + path.length));
                round1 = guide1.clone();
                round2 = guide2.clone();

                guide1.strokeColor = guide2.strokeColor = '#000000';
                guide1.strokeWidth = guide2.strokeWidth = 1;
                guide1.dashArray = guide2.dashArray = [10, 10];
                guide1.opacity = guide2.opacity = 0;

                round1.strokeColor = round2.strokeColor = '#000000';
                round1.strokeWidth = round2.strokeWidth = 20;
                round1.opacity = round2.opacity = 0;

                group.appendBottom(arc);
                group.appendBottom(round1);
                group.appendBottom(guide1);
                group.appendBottom(round2);
                group.appendBottom(guide2);

                //round1.attach('mouseenter', function() {
                //    console.log("round1");
                //});

               
           }else{

           }
        }

        group.attach('mousedrag', function(event) {
            if(A.drag == true || B.drag == true)
                return;
            group.position = event.point;
            A.opacity = 0;
            B.opacity = 0;
            circle.opacity = 0;
            guide1.opacity = 0;
            guide2.opacity = 0;
        });

        round1.on('mouseenter', function() {
            A.opacity = 0;
            B.opacity = 0;
            circle.opacity = 1;
            guide1.opacity = 1;
            guide2.opacity = 0;
            arc.opacity = 0.1;
            pivot.opacity = 0.1;
        });
        round1.attach('mousemove', function(event) {
            clearTimeout(tick);
            //circle.position = this.getNearestPoint(event.point);
            circle.position = event.point;
            tick = setTimeout(function() {
                circle.opacity = 0;
                guide1.opacity = 0;
                arc.opacity = 1;
                pivot.opacity = 1;
                enter = false;
            }, 400);
        });
        round2.attach('mouseenter', function() {
            A.opacity = 0;
            B.opacity = 0;
            circle.opacity = 1;
            guide1.opacity = 0;
            guide2.opacity = 1;
            arc.opacity = 0.1;
            pivot.opacity = 0.1;
        });
        round2.attach('mousemove', function(event) {
            clearTimeout(tick);
            //circle.position = this.getNearestPoint(event.point);
            circle.position = event.point;
            tick = setTimeout(function() {
                circle.opacity = 0;
                guide2.opacity = 0;
                arc.opacity = 1;
                pivot.opacity = 1;
                enter = false;
            }, 400);
        });
    }
    
    return group;
}