function drawTriangles(list){
    list.map(function(tri){
	var path = new paper.Path();
	path.fillColor = tri.blue ? '#268bd2' : '#2aa198';
	tri.verts.map(function(x){path.add(Points.getCoords(x))});
    });
}

function Triangle(verts,color){
    return {verts: verts, blue: color};
}

function initialTriangles(radius){
    var center = paper.view.center;
    var centerIndex = Points.addPoint(new paper.Point(0,0));
    var triangles = [];
    var dtheta = 0.2 * Math.PI;
    var first = Points.addPoint(new paper.Point(radius, 0));
    var old = first;
    for(var i = 0; i < 9; i++){
	var theta = (i+1) * dtheta;
	var newer = Points.addPoint(new paper.Point(radius * Math.cos(theta) , radius * Math.sin(theta)));
	triangles.push(Triangle(i % 2 ? [centerIndex, old,newer] : [centerIndex, newer, old],false));
	old = newer;
    }

    triangles.push(Triangle(i % 2 ? [centerIndex, old, first] : [centerIndex, first, old],false));

    return triangles;
}

function subdivide(triangles){
    var len = triangles.length;
    for(var i = 0; i < len; i++){
	var tri = triangles[i];
	if(tri.blue){
	    var a = tri.verts[0];
	    var b = tri.verts[1];
	    var c = tri.verts[2];

	    var q = Points.interpolate(a,b);
	    var r = Points.interpolate(c,b);

	    triangles.push(Triangle([r,q,a],false));
	    triangles.push(Triangle([q,r,b],true));
	    tri.verts = [r,c,a];
	}else{
	    var newPoint = Points.interpolate(tri.verts[1], tri.verts[0]);
	    triangles.push(Triangle([tri.verts[2], newPoint, tri.verts[1]], false));
	    tri.verts = [newPoint, tri.verts[2], tri.verts[0]];
	    tri.blue = true;
	}
    }
}

function nextTriangle(edgeIndex,triangleIndex,triangle, triangles){
    for(var i = 0; i < 3; i++){
	var otherEdgeIndex = triangle.edges[i];
	if(Math.abs(edgeIndex) == Math.abs(otherEdgeIndex)) 
	    continue;
	var neighbors = Edges.getEdge(otherEdgeIndex).triangles;
	if(neighbors.length == 1) 
	    return null;	
	var other = (triangleIndex == neighbors[0]) ? neighbors[1] : neighbors[0];
	var tri = triangles[other];
	if(tri.blue)
	    return {index: other, triangle: tri, edge: otherEdgeIndex};
    }
    return null;
}

function nonGreenEdge(index,triangles){
    var edges = triangles[index].edges;
    for(var i = 0; i < 3; i++){
	var result = Edges.otherNeighbor(index, edges[i]);
	if(result === null) continue;
	if(triangles[result].blue)
	    return {edge: edges[i], triangle: result};
    }
    return null;
}

function connected(triangles){
    // 5 point stars (and partial ones) consisting entirely of blue triangles
    var simple = []; 
    // Open strips of blue triangles
    var open = [];
    // First, put all of the blue triangles into a hash.
    var unmatched = {};
    for(var i = 0; i < triangles.length; i++)
	if(triangles[i].blue) 
	    unmatched[i] = true;
    // Compute the special points - centers of simple regions, and the start of broken chains
    var special = Points.specialPoints();
    // Remove the triangles in each of the simple regions
    special.centers.map(function(center){
	var tri = Points.getTriangles(center).blue;
	simple.push(tri);
	tri.map(function(t){delete unmatched[t]});
    });

    special.edges.map(function(edge){
	Points.getTriangles(edge).blue.map(function(blue){
	    // We've already covered this triangle, either in a chain or simple region.
	    if(!unmatched[blue]) return;
	    // Otherwise, check if we're on a boundary, and if so, extract it.
	    var tri = triangles[blue];
	    var startingEdge = null;
	    for(var i = 0; i < tri.edges.length; i++){
		var thisEdge = tri.edges[i];
		if(Edges.neighbors(thisEdge) == 1){
		    startingEdge = thisEdge;
		    break;
		}
	    }
	    if(startingEdge === null) return;
	    var string = [];
	    while(true){
		var next = nextTriangle(startingEdge, blue, tri, triangles);
		string.push(blue);
		delete unmatched[blue];
		if(next === null) break;
		startingEdge = next.edge;
		blue = next.index;
		tri = next.triangle;
	    }
	    open.push(string);
	});
    });
    
    var closed = [];
    while(true){
	// Get one element from unmatched, or break
	var start = null;
	for(var i in unmatched){
	    if(!unmatched.hasOwnProperty(i)) continue;
	    start = i;
	    break;
	}
	if(start === null) break;
	// Find an edge on the current triangle that doesn't border a green triangle.
	var next = nonGreenEdge(start,triangles);
	var strip = [i];
	delete unmatched[i];

	var edge = next.edge;
	var triIndex  = next.triangle;
	var tri = triangles[triIndex];
	
	while(true){
	    var next = nextTriangle(edge, triIndex, tri, triangles);
	    strip.push(triIndex);
	    delete unmatched[triIndex];
	    if(next === null) break;
	    if(!unmatched[next.index]) break; // We've looped around
	    edge = next.edge;
	    triIndex = next.index;
	    tri = next.triangle;
	}
	closed.push(strip);
    }

    return {simple: simple, open: open, closed: closed};
}


// Only executed our code once the DOM is ready.
window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    Points.setCenter(paper.view.center);


    var triangles = initialTriangles(400);
    for(var i = 0; i < 6; i++){
	subdivide(triangles);
    }

    for(var i = 0; i < triangles.length; i++){
	var verts = triangles[i].verts;
	var edges = [];
	edges.push(Edges.addEdge(verts[0], verts[1], i));
	edges.push(Edges.addEdge(verts[1], verts[2], i));
	edges.push(Edges.addEdge(verts[2], verts[0], i));
	triangles[i].edges = edges;
    }

    Points.reverseIndex(triangles);
    var regions = connected(triangles);

    var contours = [];
    for(var i = 0; i < regions.closed.length; i++){
	var region = regions.closed[i];
	var cont = Geo.contour(region.map(function(x){return triangles[x];}), true);
	Geo.paintContour(cont);
	contours.push(cont);
    }

    for(var i = 0; i < regions.open.length; i++){
	var region = regions.open[i];
	var cont = Geo.contour(region.map(function(x){return triangles[x];}), false);
	Geo.paintContour(cont);
	contours.push(cont);
    }
  
    Geo.hierarchy(contours);
    
/*    var ntri = [];
    for(var i = 0; i < regions.closed.length; i++){
	var closed = regions.closed[i];
	for(var j = 0; j < closed.length; j++){
	    ntri.push(triangles[closed[j]]);
	}
    } 
    drawTriangles(ntri); */
    // Draw the view now:
    paper.view.draw();
};
