var engineGUI = window.engineGUI || {};

engineGUI.initialize = function()
{
    window.location.href = "#list";

    $('#menuTop').hide();
    $('#menuAgent').hide();
    $('#menuBottomHouse').hide();
    $('#menuBottomFloor').hide();
    $('#menuBottomPlan').hide();
    $("#WebGLInteractiveMenu").hide();
    $('#WebGLSelectMenu').hide();

    $('#menuLeft3DHouse').hide();
    $('#menuLeft3DLandscape').hide();
    $('#menuLeft3DFloor').hide();
    $('#menuLeft2D').hide();
    $('#menuFloorSelector').hide();
    
    engineGUI.spinner = $("<div>", {class:"cssload-container", style:"position:absolute;top:32%;left:40%;"}).append($("<ul>", {class:"cssload-flex-container"}).append($("<li>").append($("<span>",{class:"cssload-loading"}))));
    
    engineGUI.initList();
};

engineGUI.initHousePlanner = function(id,item)
{
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

    //var lazyLoad = new LazyLoad();

    engine3D.initialize();
};

engineGUI.initMenuTop = function(plan)
{
    var menu = $(".menuTop").empty();
    var div = $("<div>", {class:"hi-icon-wrap hi-icon-effect-1 hi-icon-effect-1a"});

    if(plan[0] === 1)
    {
        div.append($("<a>", {href:"#", onclick:"engine3D.showHouse()", class:"hi-icon icon-house tooltip",title:"Home Exterior"}));
        div.append($("<a>", {href:"#", onclick:"engine3D.showLandscape()", class:"hi-icon icon-terrain tooltip",title:"Landscape Editor"}));
        div.append($("<a>", {href:"#", onclick:"engine3D.showFloorLevel()", class:"hi-icon icon-floors tooltip",title:"Floor Arrangements"}));
        div.append($("<a>", {href:"#", onclick:"engine3D.showRoofDesign()", class:"hi-icon icon-roof tooltip",title:"Roof Design"}));
    }
    if(plan[0] === 2 || plan[1] === 2)
        div.append($("<a>", {href:"#", onclick:"engine3D.showFloor(1)", class:"hi-icon icon-armchair tooltip",title:"Floor Furnishings"}));

    if(plan[1] === 3 || plan[2] === 3)
        div.append($("<a>", {href:"#", onclick:"engine2D.show()", class:"hi-icon icon-draftplan tooltip",title:"Floor Plans"}));

    div.append($("<div>", {style:"display:inline-block;width:1px;height:28px;background:black;"}));
    div.append($("<a>", {href:"#", onclick:"sceneNew()", class:"hi-icon icon-new tooltip",title:"New"}));
    div.append($("<a>", {href:"#", onclick:"fileSelect(\'opendesign\')", class:"hi-icon icon-open tooltip",title:"Open"}));
    div.append($("<a>", {href:"#", onclick:"engineGUI.save(false)", class:"hi-icon icon-save tooltip",title:"Save"}));
    div.append($("<div>", {style:"display: inline-block;width:1px;height:28px;background:black;"}));
    //div.append($("<a>", {href:"#", class:"hi-icon icon-share tooltip-share-menu",title:"Share"}));
    div.append($("<a>", {href:"#", onclick:"engineGUI.makeScreenshot()", class:"hi-icon icon-screenshot tooltip",title:"Screenshot"}));
    div.append($("<a>", {href:"#", onclick:"screenfull.request(document.documentElement)", class:"hi-icon icon-expand tooltip",title:"Full Screen"}));
    div.append($("<a>", {href:"#", class:"hi-icon icon-settings tooltip",title:"Settings"}));
    //div.append($("<a>", {href:"#", onclick:"document.getElementById('iframe').src = '/profile/login'", class:"hi-icon icon-login tooltip",title:"Login"}));

    menu.append(div);
    /*
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
    $('.tooltip-settings-menu').tooltipster({
        interactive:true,
        content: $('<a href="#" onclick="makeScreenshot()" class="hi-icon icon-screenshot" style="color:white"></a><br/><a href="#" onclick="screenfull.request(document.documentElement)" class="hi-icon icon-expand" style="color:white"></a>')
    });
    */
};

engineGUI.initList = function()
{
    $.ajax("scenes/index.json",{
        contentType: "application/json",
        dataType: 'json',
        success: function(data)
        {
            jsonindex = data;

            //console.log(jsonindex);

            var menu = $("#menuIndexList").empty();
            $.each(jsonindex.menu, function()
            {
                var div = $("<div>", { width:"300px",style: "padding:20px;display:inline-block;text-align:center;"});
                var img = $("<img>", {
                    width: "300px",
                    height: "150px",
                    class: "lazy indexImage",
                    id: this.name,
                    "data-original": "scenes/" + this.id + "/index.jpg",
                    //"data-src-retina": itemData.image.slice(0, -4) + "@2x." + itemData.image.split('.').pop(),
                    //style: "opacity: 0;transition: opacity .3s ease-in;height:100%"
                });
                
                var a =  $("<a>", {href:"javascript:engineGUI.initParallaxSlider('" + this.id + "')"}).append(img);
                var p =  $("<p>").append(this.name);
                var item = div.append(a).append(p);

                menu.append(item);
            });
            new LazyLoad();
        }//,error: function (request, status, error) {
            //alertify.alert(request.responseText).show();
        //}
    });
};

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
            alertify.alert("Menu (" + item + ") Loading Error").show();
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
    if (engineGUI.scene === 'house') {
        $('#menuRight3DHouse').show();
    } else if (engineGUI.scene === 'floor') {
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
    if (engineGUI.scene == 'house') {
        engineGUI.menuToggleLeft('menuLeft3DHouse', open);

    } else if (engineGUI.scene == 'floor') {
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

engineGUI.initParallaxSlider = function(id)
{
    if (getCookie("firstTimer"))
    {
        createCookie("firstTimer","1",15);
        
        window.location.href = "#start";
    }else{
        window.location.href = "#scene";
    }

    engineGUI.initHousePlanner();

    var pxs_slider = $('.pxs_slider').empty();
    var pxs_thumbnails = $('.pxs_thumbnails').empty();
    
    $.each(jsonindex.menu, function(index)
    {
        if(this.id === id)
        {
            for(var i = this.plan[0]; i <= this.plan[this.plan.length-1]; i++)
            {
                var img = $("<img>",{src: "scenes/" + id + "/" + i + ".jpg"});
                var li =  $("<li>").append($("<a>",{href:"javascript:engineGUI.open(" + i + ",'" + id + "')"}).append(img));
                pxs_slider.append(li);
            }
            for(var i = this.plan[0]; i <= this.plan[this.plan.length-1]; i++)
            {
                var img = $("<img>",{src: "scenes/" + id + "/_" + i + ".jpg"});
                var li =  $("<li>").append(img);
                pxs_thumbnails.append(li);
            }

            engineGUI.initMenuTop(this.plan);
            return true;
        }
    });

    $('#pxs_container').parallaxSlider();

    $(".pxs_bg1").css("background-image", "images/bg1.jpg");
};

function getMenuObjectItem(menu,itemData)
{
    //console.log(itemData);

    var li = "<li style='border:1px solid #aaa;text-align:center'>";
    var div = "<div style='background-color:#fff;height:120px'>"
    var img = $("<img>", {
        id: itemData.name,
        src: "images/loader.gif", //itemData.image,
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
    
    var a =  $("<a>", {href:"javascript:engine3D.insert3DModel('" + itemData.file + "')"}).append(img);
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

    if (engineGUI.scene == 'house') {
        a = $("#menuRight3DHouse .cssmenu").height();
        //b = $("#menuRight3DHouse .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (engineGUI.scene == 'floor') {
        a = $("#menuRight3DFloor .cssmenu").height();
        //b = $("#menuRight3DFloor .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (engineGUI.scene == 'roof') {
        a = $("#menuRight3DRoof .cssmenu").height();
        //b = $("#menuRight3DRoof .scroll");
        b = $("#menuRight2D .cssmenu");
    } else if (engineGUI.scene == '2d') {
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
    var i = engineGUI.floor + next;

    if (i < engineGUI.floor)
    {
        //TODO: would be awesome to have some kind of flip transition effect

        if (engineGUI.scene == 'floor') {
            engine3D.showFloor(i);
        } else if (engineGUI.scene == '2d') {
            engine2D.showFloor(i);
        }
    }else{

        alertify.confirm("Add New Floor?", function (e) {
            if (e) {
                if (engineGUI.scene == 'floor') {
                    engine3D.addFloor("New Floor");
                } else if (engineGUI.scene == '2d') {
                    engine2D.addFloor("New Floor");
                }
            //} else { // user clicked "cancel"
            }
        });
    }
};

function selectMeasurement()
{
    if (engine3D.measurements == 1.8311874) {
        //$('#menuMeasureText').html("Imperial");
        engine3D.measurements = 1; //Imperial Ratio TODO: Get the right ratio
    } else {
        //$('#menuMeasureText').html("Metric");
        engine3D.measurements = 1.8311874; //Metric Ratio
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
        engine3D.animateStop();

        $.getScript( "js/dynamic/mapbpx.js" )
              .done(function( script, textStatus ) {
                L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q';
                var mapBox = L.mapbox.map('map1', 'mapbox.streets').setView([48.43102300370144, -123.3489990234375], 14);
              })
              .fail(function( jqxhr, settings, exception ) {
                console.log('Failed to load mapbox.js');
        });
    }
};

engineGUI.makeScreenshot = function()
{
    window.open(engine3D.renderer.domElement.toDataURL('image/png'), 'Final');
    
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

    if(engineGUI.scene === '2d')
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
                doc.text(4.5, 1, scene3DFloorFurnitureContainer[engineGUI.floor].name);

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

                //saveAs(doc.output('dataurl'), scene3DFloorFurnitureContainer[engineGUI.floor].name + ".pdf");
                //doc.save(scene3DFloorFurnitureContainer[engineGUI.floor].name + ".pdf");
                //saveAs(doc.output('blob'), scene3DFloorFurnitureContainer[engineGUI.floor].name + ".pdf");
            });
        }
    }
};

function scene3DSplitViewTop()
{
    var w = window.innerWidth/1.4;
    var h = window.innerHeight*0.2;

    $("#left-component-1").css({ width: w });
    $("#right-component-1").css({ left: w });
    $("#vertical-divider-1").css({ left: w });

    $("#bottom-component").css({ height: h });
    $("#top-component").css({ bottom: h });
    $("#horizontal-divider").css({ bottom: h });

    engine3D.initRendererQuadSize();
};

function scene3DSplitViewFront()
{
    var w = window.innerWidth*0.3;
    var h = window.innerHeight*0.2;

    $("#left-component-1").css({ width: w });
    $("#right-component-1").css({ left: w });
    $("#vertical-divider-1").css({ left: w });

    $("#bottom-component").css({ height: h });
    $("#top-component").css({ bottom: h });
    $("#horizontal-divider").css({ bottom: h });

    engine3D.initRendererQuadSize();
};

function scene3DSplitViewSide()
{
    var w = window.innerWidth*0.15;
    var h = window.innerHeight/1.4;

    $("#left-component-1").css({ width: w });
    $("#right-component-1").css({ left: w });
    $("#vertical-divider-1").css({ left: w });

    $("#bottom-component").css({ height: h });
    $("#top-component").css({ bottom: h });
    $("#horizontal-divider").css({ bottom: h });

    engine3D.initRendererQuadSize();
};

function scene3DSplitView3D()
{
    
};

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) 
    return parts.pop().split(";").shift();
};

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
};