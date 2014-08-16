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

function getMenuObjectItem(itemData) {
    //console.log(itemData);
    var div = "<div class='objectItem' style='margin-let:auto;text-align:left;'>";

    var img = $("<img>", {
        id: itemData.name,
        src: itemData.image,
        href: "#",
        //width: "100%",
        height: "100%"
    });

    var a =  $("<a>", {href:"javascript:insertSceneObject('" + itemData.file + "')"}).append(img);
    
    var divInfo = "<div class='objectItemInfo'>";

    var item = $(div).append(a).append(divInfo);

    return item;
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