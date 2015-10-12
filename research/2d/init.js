var engine2D = window.engine2D || {};

engine2D.initialize = function (){

    //this.engine2D = new engine2D();
    //Two.Resolution = 64;
    //var type = /(canvas|webgl)/.test(url.type) ? url.type : 'svg';
    scene2D = new Two({
            type: Two.Types.svg, //Two.Types[type],
            //width: window.innerWidth,
            //height: window.innerHeight,
            fullscreen: true,
            autostart: true,
            antialias: true
    //}).appendTo(document.getElementById("engine2D"));
    }).appendTo(document.body);
    
    canvas2D = scene2D.makeGroup();

    //scene2D.bind('update', function(frameCount, timeDelta) {
        //rect.rotation = frameCount / 60;
    //});
}

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

