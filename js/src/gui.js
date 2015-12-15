var engineGUI = window.engineGUI || {};

engineGUI.makeScreenshot = function()
{
    getScreenshotData = true;
    
    /*
    renderer.preserveDrawingBuffer = true;
    window.open(renderer.domElement.toDataURL('image/png'), 'Final');

    setTimeout(function() {
        renderer.preserveDrawingBuffer = false;
    }, 1400);
    */
};

engineGUI.addNewFloor = function() {
    
    if($("#addNewFloor").val())
    {
        engine3D.newFloor($("#addNewFloor").val());

        var a = "<a href='#' onclick='camera3DFloorFlyIn(" + scene3DFloorFurnitureContainer.length + ")'><span>" + $("#addNewFloor").val() + "</span></a>";
        var item = $("<li>").append(a);
        $("#menuLeft3DHouseFloorList").append(item);
    }
};

engineGUI.generateItemList =function() {

    var list = $("#generateItemList");
    list.empty();

    for (var i = 0; i < scene3DFloorFurnitureContainer.length; i++) {
        
        console.log(scene3DFloorFurnitureContainer[i].name);

        for (var c = 0; c < scene3DFloorFurnitureContainer[i].children.length; c++) {

            console.log(scene3DFloorFurnitureContainer[i].children[c].children[0].name);
        }
    }

    for (var i = 0; i < scene3DHouseContainer.children.length; i++) {

        console.log(scene3DHouseContainer.children[i].children[0].name);
    }
};

engineGUI.exportPDF = function() {
    
    //alert('Sorry, your browser is not supported.');

    if(SCENE === '2d')
    {
        if (typeof jsPDF === undefined)
        {
            $.getScript("js/dynamic/jspdf.js", function(data, textStatus, jqxhr) {
                //if (typeof jsPDF == 'undefined') $.loadScript("js/jspdf.js", function(){
                /*
                console.log(data); //data returned
                console.log(textStatus); //success
                console.log(jqxhr.status); //200
                console.log('Load was performed.');
                */

                var doc = new jsPDF('l', 'in', [8.5, 11]);

                doc.setFontSize(40);
                doc.text(4.5, 1, scene3DFloorFurnitureContainer[FLOOR].name);

                var image = scene2D.toDataURL("image/jpeg"); //.replace("data:image/png;base64,", "");
                doc.addImage(image, 'JPEG', 0, 1.5, 11, 7);

                //var image = scene2D.toSVG();
                //doc.addImage(image, 'PNG', 15, 40, 180, 180);

                doc.output('dataurl');
                /*
                window.open(
                    doc.output('dataurl'),
                    '_blank'
                );
                */

                //saveAs(doc.output('dataurl'), scene3DFloorFurnitureContainer[FLOOR].name + ".pdf");
                //doc.save(scene3DFloorFurnitureContainer[FLOOR].name + ".pdf");
                //saveAs(doc.output('blob'), scene3DFloorFurnitureContainer[FLOOR].name + ".pdf");
            });
        }
    }
};