/*
|------------------------------------------|
| MelonHTML5 - Royal Preloader             |
|------------------------------------------|
| @author:  Lee Le (lee@melonhtml5.com)    |
| @version: 1.07 (22 Feb 2014)             |
| @website: www.melonhtml5.com             |
|------------------------------------------|
*/

// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

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

    // 'text', 'number', 'fill'
    _mode: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._mode !== 'undefined' ? Royal_Preloader._mode : 'number';
    }(),

    _text: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._text !== 'undefined' ? Royal_Preloader._text : 'loading...';
    }(),

    _opacity: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._opacity !== 'undefined' ? Royal_Preloader._opacity : 1;
    }(),

    _images: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._images !== 'undefined' ? Royal_Preloader._images : {};
    }(),

    _show_info: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._show_info !== 'undefined' ? Royal_Preloader._show_info : true;
    }(),

    _show_percentage: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._show_percentage !== 'undefined' ? Royal_Preloader._show_percentage : true;
    }(),

    _background: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._background !== 'undefined' ? Royal_Preloader._background : ['#000000'];
    }(),

    _logo: function() {
        return typeof Royal_Preloader !== 'undefined' && typeof Royal_Preloader._logo !== 'undefined' ? Royal_Preloader._logo : 'none';
    }(),

    _timeout: 10, // 10 seconds

    // use CSS animation or jQuery?
    _use_css_animation: true,

    _css3SupportDetect: function() {
        var style = document.body.style;

        if (typeof style['transition'] == 'string') {
            Royal_Preloader._use_css_animation = true;
            return true;
        }

        // Tests for vendor specific prop
        var prefix = ['Webkit', 'Moz', 'Khtml', 'O', 'ms'];
        for (var i = 0; i < prefix.length; i++) {
            if (typeof(style[prefix[i] + 'Transition']) == 'string') {
                Royal_Preloader._use_css_animation = true;
                return true;
            }
        }

        Royal_Preloader._use_css_animation = false;
        return false;
    },

    // main
    _init: function() {
        Royal_Preloader._css3SupportDetect();

        Royal_Preloader._total = 0;
        $.each(Royal_Preloader._images, function() {
            Royal_Preloader._total++
        });

        Royal_Preloader._build();
        Royal_Preloader._load();
    },

    // build loader DOM
    _build: function() {
        this._overlay = $('<div>').attr('id', 'preloader').addClass(this._mode);
        this._overlay_bg = $('<div>').addClass('background').appendTo(this._overlay).css('background-color', this._background[0]).css('background-image', 'url(./images/bg.jpg)').css('background-repeat', 'no-repeat');

        if (this._mode === 'number') {
            this._percentage = $('<div>').addClass('percentage').appendTo(this._overlay);
        } else if (this._mode === 'text') {
            this._text_loader = $('<div>').addClass('loader').text(this._text).appendTo(this._overlay);
            this._text_loader_overlay = $('<div>').css('background-color', this._background[0]).appendTo(this._text_loader);
        } else {
            this._logo_loader = $('<div>').css('background-image', 'url("' + this._logo + '")').addClass('loader').appendTo(this._overlay);
            this._logo_loader_meter = $('<div>').css('background-color', this._background[0]).appendTo(this._logo_loader);
            this._percentage = $('<div>').css('background-color', this._background[0]).addClass('percentage').appendTo(this._overlay);

            if (!this._show_percentage) {
                this._percentage.hide();
            }
        }

        if (this._opacity !== 1) {
            this._overlay_bg.css('opacity', this._opacity);
            $(document.body).css('visibility', 'visible');
        }

        this._overlay.appendTo($(document.body));

        $("<div>").addClass("logo-element").appendTo(this._overlay);

        if ($(window).width() < 600) {
            $(".logo-element").css("width", 128).css("height", 128)
        } else {
            $(".logo-element").css("width", 256).css("height", 256)
        }

        $(".logo-element").css("top", parseInt($(window).height() / 2 - $(".logo-element").height() / 2));
        $(".logo-element").css("left", parseInt($(window).width() / 2 - $(".logo-element").width() / 2));

        /*
        if (this._mode === 'text') {
            this._text_loader.css('margin-left', this._text_loader.width() / 2 * -1);
        }
        */
        this._text_loader.css("top", parseInt($(".logo-element").position().top) + parseInt($(".logo-element").width()) + 60);
        this._text_loader.css("left", parseInt($(".logo-element").position().left) - (this._text_loader.width() - $(".logo-element").width()) / 2);
    },

    // start loading
    _load: function() {
        if (this._mode === 'number' || this._mode === 'logo') {
            this._percentage.data('num', 0);

            if (this._show_percentage) {
                this._percentage.text('0%');
            }
        }

        $.each(this._images, function(name, image_src) {
            var _loadFinish = function() {
                Royal_Preloader._imageOnLoad(name, image_src);
            }

            var image = new Image();
            image.onload = _loadFinish;
            image.onerror = _loadFinish;
            image.src = image_src;
        });

        // timeout
        setTimeout(function() {
            if (Royal_Preloader._overlay) {
                Royal_Preloader._animatePercentage(Royal_Preloader._percentage_loaded, 100);
            }
        }, this._timeout * 1000);
    },

    // animate text change
    _animatePercentage: function(from, to) {
        Royal_Preloader._percentage_loaded = from;

        if (from < to) {
            from++;
            setTimeout(function() {
                if (Royal_Preloader._mode === 'number') {
                    if (Royal_Preloader._show_percentage) {
                        Royal_Preloader._percentage.text(from + '%');
                    }
                } else if (Royal_Preloader._mode === 'text') {
                    Royal_Preloader._text_loader_overlay.css('left', from + '%');
                } else {
                    if (Royal_Preloader._show_percentage) {
                        Royal_Preloader._percentage.text(from + '%');
                    }
                    Royal_Preloader._logo_loader_meter.css('bottom', from + '%');
                }

                Royal_Preloader._animatePercentage(from, to);
            }, 5);

            if (from === 100) {
                Royal_Preloader._loadFinish();
            }
        }
    },

    // animate name change
    _animateName: function(name, callback) {
        if (this._mode === 'number') {
            this._name = $('<div>').addClass('name').text(name).appendTo(this._overlay);

            var ele = this._name;
            requestAnimFrame(function() {
                ele.css('transform', 'rotateZ(' + parseInt(Math.random() * 60 - 30) + 'deg)');
            });

            if (!this._use_css_animation) {
                this._name.css({
                    opacity: 1,
                    top: '50%'
                });
                this._name.animate({
                    top: '20%',
                    opacity: 0
                }, 300);
                this._overlay_bg.animate({
                    'backgroundColor': this._background[this._loaded % this._background.length]
                }, 300, 'linear');
            } else {
                this._overlay_bg.css('background-color', this._background[this._loaded % this._background.length]);
            }
        }

        setTimeout(function() {
            callback();
        }, 300);
    },

    // image onload event
    _imageOnLoad: function(name, image_src) {
        this._image_queue.push({
            name: name,
            image_src: image_src
        });

        if (this._image_queue.length && this._image_queue[0].image_src === image_src) {
            this._processQueue();
        }
    },

    _reQueue: function() {
        // animate finish, remove item from the queue
        Royal_Preloader._image_queue.splice(0, 1);
        // process queue
        Royal_Preloader._processQueue();
    },

    _processQueue: function() {
        if (this._image_queue.length === 0) {
            return;
        }

        this._loaded++;

        Royal_Preloader._animatePercentage(Royal_Preloader._percentage_loaded, parseInt(100 * (this._loaded / this._total), 10));

        // image names
        if (this._show_info) {
            this._animateName(this._image_queue[0].name, this._reQueue);
        } else {
            this._reQueue();
        }
    },

    // load finish
    _loadFinish: function() {
        if (this._use_css_animation) {
            this._overlay.addClass('complete');
            $(document.body).removeClass('preloader');
        } else {
            setTimeout(function() {
                Royal_Preloader._overlay.addClass('complete');
                $(document.body).removeClass('preloader');
            }, 500);
        }

        if (this._on_complete) {
            this._on_complete();
        }

        setTimeout(function() {
            Royal_Preloader._overlay.remove();
            Royal_Preloader._overlay = null;
        }, 1000);
    },

    // API
    config: function(opts) {
        if (typeof opts.mode !== 'undefined') {
            this._mode = opts.mode;
        }

        if (typeof opts.text !== 'undefined') {
            this._text = opts.text;
        }

        if (typeof opts.timeout !== 'undefined') {
            this._timeout = parseInt(opts.timeout);
        }

        if (typeof opts.showPercentage !== 'undefined') {
            this._show_percentage = opts.showPercentage ? true : false;
        }

        if (typeof opts.showInfo !== 'undefined') {
            this._show_info = opts.showInfo ? true : false;
        }

        if (typeof opts.background !== 'undefined') {
            this._background = opts.background;
        }

        if (typeof opts.logo !== 'undefined') {
            this._logo = opts.logo;
        }

        if (typeof opts.opacity !== 'undefined') {
            this._opacity = opts.opacity;
        }

        if (typeof opts.onComplete !== 'undefined') {
            this._on_complete = opts.onComplete;
        }

        if (typeof opts.images !== 'undefined') {
            this._images = opts.images;

            Royal_Preloader._total = 0;
            $.each(this._images, function(name, image_src) {
                Royal_Preloader._total++;
            });
        }
    }
};

$(document).ready(Royal_Preloader._init);