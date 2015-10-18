//http://matthiasberth.com/articles/stable-zoom-and-pan-in-paperjs/

var SimplePanAndZoom, StableZoom;

/*
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }, hasProp = {}.hasOwnProperty;
StableZoom = (function(superClass) {
      extend(StableZoom, superClass);

      function StableZoom() {
        return StableZoom.__super__.constructor.apply(this, arguments);
      }

      StableZoom.prototype.changeZoom = function(oldZoom, delta, c, p) {
        var a, beta, newZoom, pc;
        newZoom = StableZoom.__super__.changeZoom.call(this, oldZoom, delta);
        beta = oldZoom / newZoom;
        pc = p.subtract(c);
        a = p.subtract(pc.multiply(beta)).subtract(c);
        return [newZoom, a];
      };

      return StableZoom;

})(SimplePanAndZoom);
*/

SimplePanAndZoom = (function() {
  function SimplePanAndZoom() {}

  SimplePanAndZoom.prototype.changeZoom = function(oldZoom, delta) {
    var factor;
    factor = 1.05;
    if (delta < 0) {
      return oldZoom * factor;
    }
    if (delta > 0) {
      return oldZoom / factor;
    }
    return oldZoom;
  };

  /*
  //http://stackoverflow.com/questions/33003119/raster-image-is-off-center-after-fit-to-page-zooming-in-paper-js
  SimplePanAndZoom.prototype.changeZoom = function(oldZoom, delta, centerPoint, offsetPoint, zoomFactor) {
    var newZoom = oldZoom;
    if (delta < 0) {
        newZoom = oldZoom * zoomFactor;
    }
    if (delta > 0) {
        newZoom = oldZoom / zoomFactor;
    }

    var a = null;
    if(!centerPoint.equals(offsetPoint)) {
        var scalingFactor = oldZoom / newZoom;
        var difference = offsetPoint.subtract(centerPoint);
        a = offsetPoint.subtract(difference.multiply(scalingFactor)).subtract(centerPoint);
    }
    return [newZoom, a];
  };
  */

  SimplePanAndZoom.prototype.changeCenter = function(oldCenter, deltaX, deltaY, factor) {
    var offset;
    offset = new paper.Point(deltaX, -deltaY);
    offset = offset.multiply(factor);
    return oldCenter.add(offset);
  };

  return SimplePanAndZoom;

})();

function zoom2DdrawBase(ctx) {

    zoom2DCTX.drawImage(zoom2Dimg, 0, 0, zoom2Dwidth, zoom2Dheight, 0, 0, zoom2Dwidth,  zoom2Dheight);
}

function zoom2DdrawProgress(ctx) {

    var x1 = 65, // X position where the progress segment starts
        x2 = 220, // X position where the progress segment ends
        s = zoom2DSlider.value, 
        x3 = 0,
        x4 = 20,
        y1 = 35;
        
    x3 = (x1 + ((x2 - x1) / 100) * s);  // Calculated x position where the overalyed image should end

    zoom2DCTX.drawImage(zoom2Dimg, 0, zoom2Dheight, x3,  zoom2Dheight, 0, 0, x3,  zoom2Dheight);

    var scale = Math.round(s/10);
    zoom2DCTX.fillStyle = "grey";
    zoom2DCTX.font = "12pt Arial";
    zoom2DCTX.fillText(scale, x4, y1);

    scene2DZoom(scale);
}

function drawImage() {
    zoom2DdrawBase(zoom2DCTX); // Draw the base image - no progress
    zoom2DdrawProgress(zoom2DCTX); // Draw the progress segment level
}
