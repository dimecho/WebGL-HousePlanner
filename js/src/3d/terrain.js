var plots_x = 20;
var plots_y = 20;
var plot_vertices = 2;

var map_left = plots_x /  -2;
var map_top = plots_y / -2;

var terrain3DMouse = {
    x: 0,
    y: 0,
    //state: 0, // 0 - up, 1 - down, 2 - dragging,
    //plot: {x: null, y: null},
    vertex: {x: null, y: null}
};

//VERTEX POINTS
var verticeIndex = function(vertice) {
    return vertice.x + vertice.y * ((plots_x * plot_vertices) + 1);
};

var findLattices = (function() {
    function distance(x, y) {
        return Math.pow(x, 2) + Math.pow(y, 2);
    }
    function generate_n2(radius) {

        var ymax = [0];
        var d = 0;
        var points = [];
        var batch, x, y;
        
        while (d <= radius) {
            yieldable = [];
            
            while (true) {
                batch = [];
                for (x = 0; x < d+1; x++) {
                    y = ymax[x];
                    if (distance(x, y) <= Math.pow(d, 2)) {
                        batch.push({x: x, y: y});
                        ymax[x] += 1;
                    }
                }
                if (batch.length === 0) {
                    break;
                }
                points = points.concat(batch);
            }
            
            d += 1;
            ymax.push(0);
        }
        return points;
    }
    
    return function findLattices(radius, origin) {
        var all_points = [];
        
        var i, point, points = generate_n2(radius);
        for (i = 0; i < points.length; i++) {
            point = points[i];
            
            all_points.push(point);
            if (point.x !== 0) {
                all_points.push({x: -point.x, y: point.y});
            }
            if (point.y !== 0) {
                all_points.push({x: point.x, y: -point.y});
            }
            if (point.x && point.y) {
                all_points.push({x: -point.x, y: -point.y});
            }
        }
        
        for (i = 0; i < all_points.length; i++) {
            all_points[i].x += origin.x;
            all_points[i].y += origin.y;
        }
        
        return all_points;
    };
})();

var landscape = new function() {
    var landscape_tool = null;
    
    this.select = function(tool) {
        landscape_tool = tool;
    };
    this.onmousemove = function() {

        if (!controls3D.enabled) { // The user has clicked and drug their mouse
            
            // Get all of the vertices in a 5-unit radius
            var vertices = findLattices(3 * plot_vertices, terrain3DMouse.vertex);
            
            // Call the landscaping tool to do its job
            this.tools[landscape_tool](3 * plot_vertices, vertices);
            
            // Ensure all of the vertices are within the elevation bounds
            var vertice_index;
            var vertice_data = [];
            //console.log("# of vertices " + vertices.length);

            for (var i = 0; i < vertices.length; i++) {

                vertice_index = verticeIndex(vertices[i]);

                if (terrain3D.displacement.array[vertice_index] > 6) {
                    terrain3D.displacement.array[vertice_index] = 6;
                }
                
                if (terrain3D.displacement.array[vertice_index] < -5) {
                    terrain3D.displacement.array[vertice_index] = -5;
                }
                
                terrain3D.water.displacement.array[vertice_index] = terrain3D.displacement.array[vertice_index];
            }

            terrain3D.water.displacement.needsUpdate = true;
        }
    };
    
    this.tools = {
        hill: function(radius, vertices) {
            
            var i, vertice, vertice_index, distance;
            
            for (i = 0; i < vertices.length; i++) {
                
                vertice = vertices[i];
                
                if (vertice.x < 0 || vertice.y < 0) {
                    continue;
                }
                if (vertice.x >= plots_x * plot_vertices + 1 || vertice.y >= plots_y * plot_vertices + 1) {
                    continue;
                }
                
                vertice_index = verticeIndex(vertice);
                distance = Math.sqrt(Math.pow(terrain3DMouse.vertex.x - vertice.x, 2) + Math.pow(terrain3DMouse.vertex.y - vertice.y, 2));
                
                terrain3D.displacement.array[vertice_index] += Math.pow(radius - distance, 0.5) * 0.03;
                terrain3D.displacement.needsUpdate = true;
            }
        },
        
        valley: function(radius, vertices) {
            
            var i, vertice, vertice_index, distance;
            
            for (i = 0; i < vertices.length; i++) {
                
                vertice = vertices[i];
                
                if (vertice.x < 0 || vertice.y < 0) {
                    continue;
                }
                if (vertice.x >= plots_x * plot_vertices + 1 || vertice.y >= plots_y * plot_vertices + 1) {
                    continue;
                }
                
                vertice_index = verticeIndex(vertice);
                distance = Math.sqrt(Math.pow(terrain3DMouse.vertex.x - vertice.x, 2) + Math.pow(terrain3DMouse.vertex.y - vertice.y, 2));
                
                terrain3D.displacement.array[vertice_index] -= Math.pow(radius - distance, 0.5) * 0.03;
                terrain3D.displacement.needsUpdate = true;
            }
        }
    };
}

function scene3DLandscapeGetHeightData(img,scale) //return array with height data from img
{
    if (scale === undefined) 
        scale=1;
  
    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );
 
    var size = img.width * img.height;
    var data = new Float32Array( size );
 
    context.drawImage(img,0,0);
 
    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0;
    }
 
    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
 
    var j=0;
    for (var i = 0; i<pix.length; i +=4) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/(12*scale);
    }
     
    return data;
}