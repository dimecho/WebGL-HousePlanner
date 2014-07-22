$(document).ready(function() {
    $('.cssmenu ul ul li:odd').addClass('odd');
    $('.cssmenu ul ul li:even').addClass('even');
    $('.cssmenu > ul > li > a').click(function(event) {
        $('.cssmenu li').removeClass('active');
        $(this).closest('li').addClass('active');
        var checkElement = $(this).next();
        if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
            $(this).closest('li').removeClass('active');
            checkElement.slideUp('normal');
        }
        if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
            $('.cssmenu ul ul:visible').slideUp('normal');
            checkElement.slideDown('normal');
        }
        /*
        if (!checkElement.is('ul')) {
            var menuName = getParents(this);
            console.log("element click " + menuName);
        }
        */
        if ($(this).closest('li').find('ul').children().length == 0) {
            return true;
        } else {
            return false;
        }
    });
    /*
    $('.cssmenu > ul > li > ul > li > a').click(function(event) {
        var menuName = getParents(this);
        console.log("element click " + menuName);
    });
*/
});
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