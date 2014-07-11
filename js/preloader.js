window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
        window.setTimeout(a, 1000 / 60)
    }
}();
var Royal_Preloader = {
    _overlay: null,
    _overlay_bg: null,
    _loader: null,
    _name: null,
    _percentage: null,
    _on_complete: null,
    _text_loader: null,
    _text_loader_overlay: null,
    _logo_loader: null,
    _logo_loader_meter: null,
    _total: 0,
    _loaded: 0,
    _image_queue: [],
    _percentage_loaded: 0,
    _mode: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._mode ? Royal_Preloader._mode : "number"
    }(),
    _text: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._text ? Royal_Preloader._text : "loading..."
    }(),
    _opacity: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._opacity ? Royal_Preloader._opacity : 1
    }(),
    _images: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._images ? Royal_Preloader._images : {}
    }(),
    _show_info: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._show_info ? Royal_Preloader._show_info : !0
    }(),
    _show_percentage: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._show_percentage ? Royal_Preloader._show_percentage : !0
    }(),
    _background: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._background ? Royal_Preloader._background : ["#000000"]
    }(),
    _logo: function() {
        return "undefined" !== typeof Royal_Preloader && "undefined" !== typeof Royal_Preloader._logo ? Royal_Preloader._logo : "none"
    }(),
    _timeout: 10,
    _use_css_animation: !0,
    _css3SupportDetect: function() {
        var a = document.body.style;
        if ("string" == typeof a.transition) {
            return Royal_Preloader._use_css_animation = !0
        }
        for (var b = ["Webkit", "Moz", "Khtml", "O", "ms"], c = 0; c < b.length; c++) {
            if ("string" == typeof a[b[c] + "Transition"]) {
                return Royal_Preloader._use_css_animation = !0
            }
        }
        return Royal_Preloader._use_css_animation = !1
    },
    _init: function() {
        Royal_Preloader._css3SupportDetect();
        Royal_Preloader._total = 0;
        $.each(Royal_Preloader._images, function() {
            Royal_Preloader._total++
        });
        Royal_Preloader._build();
        Royal_Preloader._load()
    },
    _build: function() {
        this._overlay = $("<div>").attr("id", "preloader").addClass(this._mode);
        "number" === this._mode ? this._percentage = $("<div>").addClass("percentage").appendTo(this._overlay) : "text" === this._mode ? (this._text_loader = $("<div>").addClass("loader").text(this._text).appendTo(this._overlay), this._text_loader_overlay = $("<div>").css("background-color", this._background[0]).appendTo(this._text_loader)) : (this._logo_loader = $("<div>").css("background-image", 'url("' + this._logo + '")').addClass("loader").appendTo(this._overlay), this._logo_loader_meter = $("<div>").css("background-color", this._background[0]).appendTo(this._logo_loader), this._percentage = $("<div>").css("background-color", this._background[0]).addClass("percentage").appendTo(this._overlay), this._show_percentage || this._percentage.hide());
        1 !== this._opacity && (this._overlay_bg.css("opacity", this._opacity), $(document.body).css("visibility", "visible"));
        this._overlay.appendTo($(document.body));

        $("<div>").addClass("logo-element").appendTo(this._overlay);

        if ($(window).width() < 600) {
            $(".logo-element").css("width", 128).css("height", 128)
        } else {
            $(".logo-element").css("width", 256).css("height", 256)
        }

        $(".logo-element").css("top", parseInt($(window).height() / 2 - $(".logo-element").height() / 2));
        $(".logo-element").css("left", parseInt($(window).width() / 2 - $(".logo-element").width() / 2));

        this._text_loader.css("top", parseInt($(".logo-element").position().top) + parseInt($(".logo-element").width()) + 60);
        this._text_loader.css("left", parseInt($(".logo-element").position().left) - (this._text_loader.width() - $(".logo-element").width()) / 2);
        $(".logo-element").slideDown("slow")
    },
    _load: function() {
        if ("number" === this._mode || "logo" === this._mode) {
            this._percentage.data("num", 0), this._show_percentage && this._percentage.text("0%")
        }
        $.each(this._images, function(a, b) {
            var c = function() {
                    Royal_Preloader._imageOnLoad(a, b)
                },
                d = new Image;
            d.onload = c;
            d.onerror = c;
            d.src = b
        });
        setTimeout(function() {
            Royal_Preloader._overlay && Royal_Preloader._animatePercentage(Royal_Preloader._percentage_loaded, 100)
        }, 1000 * this._timeout)
    },
    _animatePercentage: function(a, b) {
        Royal_Preloader._percentage_loaded = a;
        a < b && (a++, setTimeout(function() {
            "number" === Royal_Preloader._mode ? Royal_Preloader._show_percentage && Royal_Preloader._percentage.text(a + "%") : "text" === Royal_Preloader._mode ? Royal_Preloader._text_loader_overlay.css("left", a + "%") : (Royal_Preloader._show_percentage && Royal_Preloader._percentage.text(a + "%"), Royal_Preloader._logo_loader_meter.css("bottom", a + "%"));
            Royal_Preloader._animatePercentage(a, b)
        }, 5), 100 === a && Royal_Preloader._loadFinish())
    },
    _animateName: function(a, b) {
        if ("number" === this._mode) {
            var c = this._name = $("<div>").addClass("name").text(a).appendTo(this._overlay);
            requestAnimFrame(function() {
                c.css("transform", "rotateZ(" + parseInt(60 * Math.random() - 30) + "deg)")
            });
            this._use_css_animation ? this._overlay_bg.css("background-color", this._background[this._loaded % this._background.length]) : (this._name.css({
                opacity: 1,
                top: "50%"
            }), this._name.animate({
                top: "20%",
                opacity: 0
            }, 300), this._overlay_bg.animate({
                backgroundColor: this._background[this._loaded % this._background.length]
            }, 300, "linear"))
        }
        setTimeout(function() {
            b()
        }, 300)
    },
    _imageOnLoad: function(a, b) {
        this._image_queue.push({
            name: a,
            image_src: b
        });
        this._image_queue.length && this._image_queue[0].image_src === b && this._processQueue()
    },
    _reQueue: function() {
        Royal_Preloader._image_queue.splice(0, 1);
        Royal_Preloader._processQueue()
    },
    _processQueue: function() {
        0 !== this._image_queue.length && (this._loaded++, Royal_Preloader._animatePercentage(Royal_Preloader._percentage_loaded, parseInt(this._loaded / this._total * 100, 10)), this._show_info ? this._animateName(this._image_queue[0].name, this._reQueue) : this._reQueue())
    },
    _loadFinish: function() {
        this._use_css_animation ? (this._overlay.addClass("complete"), $(document.body).removeClass("preloader")) : setTimeout(function() {
            Royal_Preloader._overlay.addClass("complete");
            $(document.body).removeClass("preloader")
        }, 500);
        this._on_complete && this._on_complete();
        setTimeout(function() {
            Royal_Preloader._overlay.remove();
            Royal_Preloader._overlay = null
        }, 1000)
    },
    config: function(a) {
        "undefined" !== typeof a.mode && (this._mode = a.mode);
        "undefined" !== typeof a.text && (this._text = a.text);
        "undefined" !== typeof a.timeout && (this._timeout = parseInt(a.timeout));
        "undefined" !== typeof a.showPercentage && (this._show_percentage = a.showPercentage ? !0 : !1);
        "undefined" !== typeof a.showInfo && (this._show_info = a.showInfo ? !0 : !1);
        "undefined" !== typeof a.background && (this._background = a.background);
        "undefined" !== typeof a.logo && (this._logo = a.logo);
        "undefined" !== typeof a.opacity && (this._opacity = a.opacity);
        "undefined" !== typeof a.onComplete && (this._on_complete = a.onComplete);
        "undefined" !== typeof a.images && (this._images = a.images, Royal_Preloader._total = 0, $.each(this._images, function(a, c) {
            Royal_Preloader._total++
        }))
    }
};
$(document).ready(Royal_Preloader._init);