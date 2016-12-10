var engineGUI = window.engineGUI || {};

engineGUI.open = function(s)
{
    $("#start").remove();
    $("#scene").remove();

    engineGUI.spinner.appendTo("body");

    //var data = $.ajax({ url:"scenes/" + id + ".json", async:false, dataType: "json"}).responseText;
    //json = JSON.parse(data);

    //console.log(json);
    
    if (s === 1){
        setTimeout(function() {
            engine3D.cameraAnimate(0,20,0,1500);
        }, 500);
    }else if(s===2){

        //quick response
        engineGUI.scene = 'floor';
        engine3D.setLights();
        engine3D.buildPanorama(engine3D.skyFloor, '0000', 75, 75, 75,"",null);

        engine3D.scene.remove(engine3D.skyHouse);
        engine3D.scene.remove(weatherSkyCloudsMesh);
        engine3D.scene.remove(weatherSkyRainbowMesh);
        engine3D.scene.remove(engine3D.groundHouse);
        
        engine3D.scene.add(engine3D.skyFloor);
        engine3D.scene.add(engine3D.groundFloor);

        setTimeout(function() {
            engine3D.cameraAnimate(0,20,0,1500);
        }, 800);
        
    }else if(s === 3){
        engine2D.show();
    }

    engine2D.open();
    engine3D.open();
    
    setTimeout(function()
    {
        engineGUI.spinner.remove();
        
        $('#agentPicture').attr("src",json.info.agentPicture);
        $('#menuAgent').show();

        if(s == 1){
            engine3D.showHouse();
        }
        else if (s == 2)
        {
            engine3D.showFloor(1);
        }
        else if (s == 3)
        {
            engine2D.show();
        }

        setTimeout(function() {
            scene3DAnimateRotate = json.settings.autorotate;
        }, 4000);
      
    }, 2000);
};

engineGUI.save = function(online)
{
    setTimeout(function()
    {
        //console.log(JSON.stringify(terrain3DRawData));
        /*
        try{
            zip.file("house.jpg", imageBase64('imgHouse'), {
                base64: true
            });
        }catch(ex){}
        */

        if (online)
        {
            if(engineGUI.session !== '')
            {
                //saveAs(content, "scene.zip"); //Debug
                window.location = "#openLogin";
            }
            else
            {
                var data = new FormData();
                data.append('file', json);

                //saveAs(content, "scene.zip");
                $.ajax('php/objects.php?upload=scene', {
                    type: 'POST',
                    contentType: 'application/octet-stream',
                    //contentType: false,
                    //dataType: blob.type,
                    processData: false,
                    data: data,
                    success: function(data, status) {
                        if(data.status != 'error')
                        alert("ok");
                    },
                    error: function() {
                        alert("not so ok");
                    }
                });
                window.location = "#close";
            }
        }
        else
        {
            saveAs(json, "scene.json");
            window.location = "#close";
        }
    }, 4000);
};

function imageBase64(id)
{
    var img = document.getElementById(id);
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    var base64 = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    return base64;
};