var engineGUI = window.engineGUI || {};

$(document).ready(function()
{
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
    var actions = ["engine3D.enableTransformControls('translate')", "", "", "engine3D.enableTransformControls('scale')", "toggleTextureSelect()", "engine3D.enableTransformControls('rotate')", "scene3DObjectSelectRemove()", "camera3DNoteAdd()"];
    
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
          content: $('<a href="#openLogin" onclick="engineGUI.save(true);" class="hi-icon icon-earth" style="color:white"></a><br/><a href="#openSaving" onclick="engineGUI.save(false);" class="hi-icon icon-usb" style="color:white"></a>')
    });

    $('.tooltip-open-menu').tooltipster({
                interactive:true,
          content: $('<a href="#openLogin" onclick="engineGUI.save(true);" class="hi-icon icon-earth" style="color:white"></a><br/><a href="#openSaving" onclick="fileSelect(\'opendesign\')" class="hi-icon icon-usb" style="color:white"></a>')
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
        engineGUI.menuItemClick(this);
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

engineGUI.initMenu = function(id,item)
{
    if(RUNMODE == "database")
    {
        item = "php/objects.php?menu=" + item.split('/').shift();
    }else{
        item = "objects/" + item;
    }

    $.ajax(item,{
        //contentType: "json",
        //async: false,
        dataType: 'json',
        success: function(json){
            //var json = JSON.parse(data);
            var menu = $("#" + id + " .scroll");
            //var menu = $("#" + id + " .cssmenu > ul");
            menu.empty();
            $.each(json.menu, function() {
                menu.append(engineGUI.menuGetItem(this));
            });
            /*
            $("#" + id + " .scroll .cssmenu > ul > li > a").click(function(event) {
                engineGUI.menuItemClick(this);
            });
            */
            $("#" + id + " .cssmenu > ul > li > a").click(function(event) {
                engineGUI.menuItemClick(this);
            });
        },
        error: function(xhr, textStatus, errorThrown){
            alertify.alert("Menu (" + item + ") Loading Error");
        }
    });
    
    engineGUI.menuCorrectHeight();

    $("#" + id).show();
    //engineGUI.menuToggleRight('menuRight', true);
};

engineGUI.menuSelect = function(item, id, color)
{
    if (item === null) //clear all
    {
        for (var i = 0; i <= 6; i++) {
            $("#" + id + i).css('color', 'black');
        }
    } else {
        engineGUI.menuSelect(null, id, color);
        $("#" + id + item).css('color', color); //#53C100
    }
};

engineGUI.showRightObjectMenu = function(path)
{
    //console.log("Get from " + path + "/index.json");
  
    if(RUNMODE == "database")
    {
        path = "php/objects.php?objects=" + path; //item.split('/').shift();
    }else{
        path = "objects/" + path + '/index.json';
    }

    var menu = $("#menuRightObjects .scroll");
    //var menu = $("#menuRightObjects .cssmenu > ul");
    //menu.append("<div id='menuLoading' style='position:relative;left:0;top:0;width:100%;height:100%;background-color:grey;opacity:0.5'>loading...</div>");

    $('#menuRight3DHouse').hide();
    $('#menuRight3DFloor').hide();
    $('#menuRight3DRoof').hide();
    $('#menuRight2D').hide();
    $('#menuRightObjects').show();

     $.ajax(path,{
        dataType: 'json',
        success: function(json){
            var empty = "<li><span style='margin-let:auto;text-align:center;padding:20px'>No Objects In This Category</span></li>";
            menu.empty();
            try
            {
                //var json = JSON.parse(binary.read('string'));
                $.each(json.menu, function() {
                    if(Object.keys(json.menu).length > 0)
                    {

                        //menu.append(getMenuObjectItem(this));
                        getMenuObjectItem(menu,this);
                    }
                    else
                    {
                        menu.append(empty); //database empty
                    }
                });
            }
            catch(e)
            {
                menu.append(empty); //local no json
            }

            //$('.bttrlazyloading').trigger('bttrlazyloading.load');

            //$("#menuRight3DHouse .scroll .cssmenu > ul > li > a").click(function(event) {
            //    engineGUI.menuItemClick(this);
            //});
        }
    });

    //$('#menuLoading').remove();

    //engineGUI.menuCorrectHeight();
};

engineGUI.showRightCatalogMenu = function()
{

    if (SCENE == 'house') {
        $('#menuRight3DHouse').show();
    } else if (SCENE == 'floor') {
        $('#menuRight3DFloor').show();
    }

    $('#menuRightObjects').hide();
    $("#menuRightObjects .scroll").empty(); //empty ahead of time (faster)

    //engineGUI.menuCorrectHeight();
};

engineGUI.toggleSideMenus = function(open)
{
    //Auto close right menu
    engineGUI.menuToggleRight('menuRight', open);

    //document.getElementById('menuRight').setAttribute("class", "hide-right");
    //engineGUI.menuDelay(document.getElementById("arrow-right"), "images/arrowleft.png", 400);

    //Auto close left menu
    if (SCENE == 'house') {
        engineGUI.menuToggleLeft('menuLeft3DHouse', open);

    } else if (SCENE == 'floor') {
        engineGUI.menuToggleLeft('menuLeft3DFloor', open);
    }
};

engineGUI.menuToggleRight = function(id, open)
{
    var el = document.getElementById(id);
    var img = document.getElementById("arrow-right");
    var box = el.getAttribute("class");

    if (img.src.indexOf("images/arrowleft.png") >= 0 || open) { //box == "hide-right"
        el.style.display = "block";
        el.setAttribute("class", "show-right");
        engineGUI.menuDelay(img, "images/arrowright.png", 400);
    } else if (!open) {
        el.setAttribute("class", "hide-right");
        engineGUI.menuDelay(img, "images/arrowleft.png", 400);
    }
};

engineGUI.menuToggleLeft = function(id, open)
{
    var el = document.getElementById(id);
    var img = document.getElementById("arrow-left");
    var box = el.getAttribute("class");

    if (img.src.indexOf("images/arrowright.png") >= 0 || open) { //box == "hide-left"
        el.style.display = "block";
        el.setAttribute("class", id + "-show-left");
        engineGUI.menuDelay(img, "images/arrowleft.png", 400);
    } else if (!open) {
        el.setAttribute("class", "hide-left");
        engineGUI.menuDelay(img, "images/arrowright.png", 400);
    }
};

engineGUI.menuDelay = function(elem, src, delayTime)
{
    window.setTimeout(function() {
        elem.setAttribute("src", src);
    }, delayTime);
};

engineGUI.menuItemClick = function(self)
{
    //console.log("click");

    $('.cssmenu > ul > li').removeClass('active');
    $(self).closest('li').addClass('active');

    var checkElement = $(self).next();

    if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        $(self).closest('li').removeClass('active');
        checkElement.slideUp('normal');
    }
    if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
        $('.cssmenu ul ul:visible').slideUp('normal');
        checkElement.slideDown('normal');
    }

    //engineGUI.menuCorrectHeight();
    /*
        if (!checkElement.is('ul')) {
            var menuName = getParents(this);
            console.log("element click " + menuName);
        }
        */

    if ($(self).closest('li').find('ul').children().length == 0) {
        return true;
    } else {
        return false;
    }
};

engineGUI.menuGetItem = function(itemData, last)
{
    //console.log(itemData);
    var li = "<li";
    if (itemData.sub) {
        li += " class='has-sub'";
    } else if (last) {
        li += " class='last-child'";
    }
    li += ">";

    //var a =  $("<a>", {html:itemData.name,href:itemData.link});
    var a = "<a";
    if (itemData.link != null) {
        a += " href=\"javascript:engineGUI.showRightObjectMenu('" + itemData.link + "');\"";
        //a+=" href=\"#\"";
    } else {
        a += " href=\"#\"";
    }
    a += ">" + itemData.name + "</a>";

    //console.log(a);
    var item = $(li).append(a);

    if (itemData.sub) {
        var subList = $("<ul>");
        $.each(itemData.sub, function(index) {
            //console.log(this);
            if (index == itemData.sub.length - 1) { // this is the last one
                subList.append(engineGUI.menuGetItem(this, true));
            } else {
                subList.append(engineGUI.menuGetItem(this, false));
            }
        });
        item.append(subList);
    }
    return item;
};

function getMenuObjectItem(menu,itemData)
{
    //console.log(itemData);

    var li = "<li style='border:1px solid #aaa;text-align:center'>";
    var div = "<div style='background-color:#fff;height:120px'>"
    var img = $("<img>", {
        id: itemData.name,
        src: "images/loader.gif", //itemData.image,
        href: "#",
        //width: "100%",
        //height: "100%",
        "data-src": itemData.image,
        "data-src-retina": itemData.image.slice(0, -4) + "@2x." + itemData.image.split('.').pop(),
        style: "opacity: 0;transition: opacity .3s ease-in;height:100%"
    });
    /*
    $(img).lazyload({
        threshold : 200
    });
    */
    
    var a =  $("<a>", {href:"javascript:insertSceneObject('" + itemData.file + "')"}).append(img);
    var divInfo = "<span class='objectItemInfo' style='height:40px'>";

    var item = $(li).append($(div).append(a).append(divInfo));

    menu.append(item);

    //$(img).unveil();
    $(img).unveil(200, function() {
      $(this).load(function() {
        this.style.opacity = 1;
      });
    });

    //console.log(item);

    //return item;
};

engineGUI.menuCorrectHeight = function()
{
    var h = window.innerHeight - 250;
    var a;
    var b;

    if (SCENE == 'house') {
        a = $("#menuRight3DHouse .cssmenu").height();
        //b = $("#menuRight3DHouse .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (SCENE == 'floor') {
        a = $("#menuRight3DFloor .cssmenu").height();
        //b = $("#menuRight3DFloor .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (SCENE == 'roof') {
        a = $("#menuRight3DRoof .cssmenu").height();
        //b = $("#menuRight3DRoof .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (SCENE == '2d') {
        a = $("#menuRight2D .cssmenu").height();
        //b = $("#menuRight2D .scroll");
        b = $("#menuRight2D .cssmenu");
    } else {
        return;
    }

    $("#menuRightObjects .scroll").css('height', h);
    //$("#menuRightObjects .flip").css('height', h);

    if (b.height() < h) {
        //console.log("H:" + a);
        b.css('height', '100%');
    } else {
        b.css('height', h);
    }
};

engineGUI.selectFloor = function(next)
{
    var i = FLOOR + next;

    if (i < FLOOR)
    {
        //TODO: would be awesome to have some kind of flip transition effect

        if (SCENE == 'floor') {
            engine3D.showFloor(i);
        } else if (SCENE == '2d') {
            engine2D.showFloor(i);
        }
    }else{

        alertify.confirm("Add New Floor?", function (e) {
            if (e) {
                if (SCENE == 'floor') {
                    engine3D.newFloor("New Floor");
                } else if (SCENE == '2d') {
                    engine2D.newFloor("New Floor");
                }
            //} else { // user clicked "cancel"
            }
        });
    }
};

function selectMeasurement()
{
    if (REALSIZERATIO == 1.8311874) {
        //$('#menuMeasureText').html("Imperial");
        REALSIZERATIO = 1; //Imperial Ratio TODO: Get the right ratio
    } else {
        //$('#menuMeasureText').html("Metric");
        REALSIZERATIO = 1.8311874; //Metric Ratio
    }
};

/*
function getParents(obj) {
    objparent = obj.parentNode;
    while (objparent) {
        obj = objparent;
        objparent = obj.parentNode;
        if (obj.id) {
            //alert(obj.id);
            return obj.id;
        }
    }
};
*/

engineGUI.sceneMapBox = function()
{

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
};

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