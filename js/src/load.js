$(document).ready(function() {

    /*
     $.ajax("objects/Platform/floorplan1.dxf",{
            contentType: "application/text",
            beforeSend: function (req) {
              req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
            },
            success: function(data){
                console.log(data);
                var parser = new DXFParser(data);
                console.log(parser);
            },
            error: function(xhr, textStatus, errorThrown){
                alertify.alert("DXF (" + js + ") Loading Error");
            }
        });
    */
  
    //wireframe = new Wireframe();
    //wireframe.build(parser);

    /* https://dribbble.com/shots/872582-Circular-Menu */
    var numberOfIcons = 8;
    var offsetAngleDegress = 360/numberOfIcons;
    var offsetAngle = offsetAngleDegress * Math.PI / 180;
    var circleOffset = $("#WebGLInteractiveMenu").width()/2;
    var tooltips = ["Move Horizontaly", "Info", "Duplicate", "Resize", "Textures", "Rotate", "Remove", "Object Notes"];
    var actions = ["enableTransformControls('translate')", "", "", "enableTransformControls('scale')", "toggleTextureSelect()", "enableTransformControls('rotate')", "scene3DObjectSelectRemove()", "camera3DNoteAdd()"];

    var $d = $("<div class='rect'></div>").hide().appendTo("body");
    var iconOffset = $(".rect").width()/2;
    $d.remove();

    for(var i=0; i<numberOfIcons; i++)
    {
        var index = i+1;
      
        $("#WebGLInteractiveMenu").append('<div class="rect tooltip-top" title="' + tooltips[i] + '" id="icn'+ index +'" onclick="' + actions[i] + '"></div>');
       
        var x = Math.cos((offsetAngle * i) - (Math.PI/2));
        var y = Math.sin((-offsetAngle * i)+ (Math.PI/2));
        //console.log(offsetAngle *i * 180/Math.PI,x, y);

        var dX = (circleOffset * x) + circleOffset - iconOffset;
        var dY = (circleOffset * y) + circleOffset - iconOffset;

        //console.log(circleOffset+iconOffset);
        
        $("#icn" + index).css({"background-image": 'url("images/hicn' + index + '.png")', "-webkit-animation-delay": "2s", "animation-delay": "2s"});
        $("#icn" + index).animate({"left":dX,"bottom":dY}, "slow");

        //console.log('url("icn' + index + '.png")');
    }

    $("#icn1").addClass("active");

    // add click handler to all circles
    $('.rect').click(function(event)
    {
        event.preventDefault();
        $('.active').removeClass("active");
        $(this).addClass("active");

        var a = (Number($(this).attr("id").substr(3))-1)*offsetAngleDegress;
        /* $('#rotateSelector').css({"transform":"rotate(" + a + "deg)", "-webkit-transform":"rotate(" + a + "deg)"}); */
        /* $('#rotateSelector').css({"transform":"rotate3d(0, 0, 1, " + a + "deg)", "-webkit-transform":"rotate3d(0, 0, 1, " + a + "deg)", "-o-transform":"rotate(" + a + "deg)", "-moz-transform":"rotate3d(0, 0, 1, " + a + "deg)"}); */
        
        //console.log(a); 
    });
    //=====================================

    $('.tooltip-share-menu').tooltipster({
        interactive:true,
        content: $('<a href="#" onclick="" class="hi-icon icon-html tooltip" title="Embed 3D Scene in Your Website" style="color:white"></a><br/><a href="#" class="hi-icon icon-print" style="color:white"></a><br/><a href="#" class="hi-icon icon-email" style="color:white"></a>')
    });

    $('.tooltip-save-menu').tooltipster({
                interactive:true,
          content: $('<a href="#openLogin" onclick="saveScene(true);" class="hi-icon icon-earth" style="color:white"></a><br/><a href="#openSaving" onclick="saveScene(false);" class="hi-icon icon-usb" style="color:white"></a>')
    });

    $('.tooltip-open-menu').tooltipster({
                interactive:true,
          content: $('<a href="#openLogin" onclick="saveScene(true);" class="hi-icon icon-earth" style="color:white"></a><br/><a href="#openSaving" onclick="fileSelect(\'opendesign\')" class="hi-icon icon-usb" style="color:white"></a>')
    });

    $('.tooltip-tools-menu').tooltipster({
                interactive:true,
          content: $('<a href="#" onclick="makeScreenshot()" class="hi-icon icon-screenshot" style="color:white"></a><br/><a href="#" onclick="screenfull.request(document.documentElement)" class="hi-icon icon-expand" style="color:white"></a>')
    });

    $('.tooltip').tooltipster({
        animation: 'fade',
        delay: 200,
        theme: 'tooltipster-default',
        touchDevices: false,
        trigger: 'hover',
        position: 'bottom',
        contentAsHTML: true
    });

    $('#menu2DTools').tooltipster({
        theme: 'tooltipster-light',
        trigger: 'custom',
        touchDevices: true,
        //delay: 200,
        interactive:true,
        contentAsHTML: true,
        content: ''
    });

    $('#WebGLSelectMenu').tooltipster({
        theme: 'tooltipster-light',
        trigger: 'custom',
        touchDevices: true,
        delay: 0,
        interactive:true,
        position: 'top',
        contentAsHTML: true,
        content: '',
    });

    //$('#dragElement').drags();

    $('.tooltip-right').tooltipster({
        animation: 'fade',
        delay: 200,
        theme: 'tooltipster-default',
        touchDevices: false,
        trigger: 'hover',
        position: 'right'
    });
    $('.tooltip-top').tooltipster({
        animation: 'fade',
        delay: 200,
        theme: 'tooltipster-default',
        touchDevices: false,
        trigger: 'hover',
        position: 'top',
        contentAsHTML: true
    });

    $('.cssmenu ul ul li:odd').addClass('odd');
    $('.cssmenu ul ul li:even').addClass('even');
    $('.cssmenu > ul > li > a').click(function(event) {
        menuItemClick(this);
    });

    //$(".mouseover").editable("php/echo.php", { indicator: "<img src='img/indicator.gif'>", tooltip: "Move mouseover to edit...", event: "mouseover", style  : "inherit" });      
    $("#menuTop p").click(function() {
        $(this).hide().after('<input type="text" class="editP" value="' + $(this).html() + '" size="10" />');
        $('.editP').focus();
    });
    $('.editP').bind('blur', function() {
        $(this).hide().prev('#menuTop p').html($(this).val()).show();
    });
    stroll.bind('.cssmenu ul');

    $('#pxs_container').parallaxSlider();
    //init();
});

/**
 * Loads a shader using AJAX
 * 
 * @param {String} URL
 * @param {String} The type of shader [vertex|fragment]
 */
function loadShader(shader, type, async)
{
    return $.ajax({
        url: shader,
        async: async,
        beforeSend: function (req) {
            req.overrideMimeType('text/plain; charset=x-shader/x-' + type); //important - set for binary!
        }
    }).responseText;
}

function sceneMapBox() {

    if (typeof mapbox == undefined) 
    {
        $.getScript( "js/dynamic/mapbpx.js" )
              .done(function( script, textStatus ) {
                L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q';
                var mapBox = L.mapbox.map('map1', 'mapbox.streets').setView([48.43102300370144, -123.3489990234375], 14);animateStop()
              })
              .fail(function( jqxhr, settings, exception ) {
                console.log('Failed to load mapbox.js');
          });
    //}else{
        //var mapBox = L.mapbox.map('map1', 'mapbox.streets').setView([48.43102300370144, -123.3489990234375], 14);animateStop();
    }
}

function sceneOpen(s) {

    document.body.appendChild(spinner);
    document.getElementById("start").getElementsByClassName("close")[0].setAttribute('href', "#close");

    //setTimeout(function(){
        $.ajax("scenes/" + SCENEFILE,{
            contentType: "application/zip",
            beforeSend: function (req) {
                  req.overrideMimeType('text/plain; charset=x-user-defined'); //important - set for binary!
            },
            success: function(data){
                try {

                    if (s == 2)
                    {
                        //quick response
                        buildPanorama(skyFloorMesh, '0000', 75, 75, 75,"",null);

                        scene3D.remove(skyMesh);
                        scene3D.remove(weatherSkyCloudsMesh);
                        scene3D.remove(weatherSkyRainbowMesh);
                        scene3D.remove(scene3DHouseGroundContainer);

                        scene3D.add(skyFloorMesh);
                        scene3DSetLight();
                        scene3D.add(scene3DFloorGroundContainer);
                    }else if(s == 3){
                        engine2D.show();
                    }

                    setTimeout(function() {
                        camera3DAnimate(0,20,0,1500);
                    }, 500);

                    setTimeout(function() {
                        var zip = new JSZip(data);

                        engine3D.new();
                        engine2D.new();

                        try{
                            var o = JSON.parse(zip.file("options.json").asText());
                            //console.log(o);
                            settings = o.settings;
                            for (var i = 0; i < o.floor.length; i++){
                                //console.log(o.floor[i].name);
                                scene3DFloorFurnitureContainer[i].name =  o.floor[i].name; 
                            }
                        }catch(ex){}
                        //show2D(); //DEBUG 2D

                        engine3D.open(zip);
                        engine2D.open(zip);

                        setTimeout(function() {
                            document.body.removeChild(spinner);

                            if(s == 1){
                                engine3D.showHouse();
                            }else if (s == 2)
                            {
                                engine3D.showFloor();
                            }
                            else if (s == 3)
                            {
                                engine2D.show();
                            }

                            setTimeout(function() {
                                scene3DAnimateRotate = settings.autorotate;
                            }, 4000);
                        }, 1000);
                        //document.getElementById('engine3D').removeChild(spinner);
                    }, 2000);
                } catch (e) {
                    alertify.alert("Failed to open Scene " + e);
                }
            }
        });
    //}, 1000);
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) 
    return parts.pop().split(";").shift();
}

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}