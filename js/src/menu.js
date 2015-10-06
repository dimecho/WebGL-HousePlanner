function toggleRight(id, open) {
    var el = document.getElementById(id);
    var img = document.getElementById("arrow-right");
    var box = el.getAttribute("class");

    if (img.src.indexOf("images/arrowleft.png") >= 0 || open) { //box == "hide-right"
        el.style.display = "block";
        el.setAttribute("class", "show-right");
        delay(img, "images/arrowright.png", 400);
    } else if (!open) {
        el.setAttribute("class", "hide-right");
        delay(img, "images/arrowleft.png", 400);
    }
}

function toggleLeft(id, open) {
    var el = document.getElementById(id);
    var img = document.getElementById("arrow-left");
    var box = el.getAttribute("class");

    if (img.src.indexOf("images/arrowright.png") >= 0 || open) { //box == "hide-left"
        el.style.display = "block";
        el.setAttribute("class", id + "-show-left");
        delay(img, "images/arrowleft.png", 400);
    } else if (!open) {
        el.setAttribute("class", "hide-left");
        delay(img, "images/arrowright.png", 400);
    }
}

function delay(elem, src, delayTime) {
    window.setTimeout(function() {
        elem.setAttribute("src", src);
    }, delayTime);
}

function menuItemClick(self) {
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

    //correctMenuHeight();
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
}

function getMenuItem(itemData, last) {
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
        a += " href=\"javascript:showRightObjectMenu('" + itemData.link + "');\"";
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
                subList.append(getMenuItem(this, true));
            } else {
                subList.append(getMenuItem(this, false));
            }
        });
        item.append(subList);
    }
    return item;
}

function getMenuObjectItem(menu,itemData) {
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
}

function correctMenuHeight() {

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
}

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
}
*/