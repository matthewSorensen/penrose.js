
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
    var centerIndex = Points.addPoint(center);
    var triangles = [];
    var dtheta = 0.2 * Math.PI;
    var first = Points.addPoint(new paper.Point(radius, 0).add(center));
    var old = first; //Points.addPoint(new paper.Point(radius, 0).add(center));
    for(var i = 0; i < 9; i++){
	var theta = (i+1) * dtheta;
	var newer = Points.addPoint(new paper.Point(radius * Math.cos(theta) , radius * Math.sin(theta)).add(center));
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

    
// Algorithm for computing connected components
// put all of the blue triangles into a hash
// iterate over points, separating them into violet and red sets
// for all of the violet points, remove all of their triangles from the hash
// for all of the red points, snake along the chain and remove blue triangles from the hash
// the rest are closed loops and you can pick an arbitrary blue and snake along it

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
	    var tri = triangles[blue];
	    // Otherwise, figure out if it's an edge triangle - if so, it'll have two incomplete verts.
	    // we could just build up a proper set of edges, which will also make the strip traversal very easy...
	    delete unmatched[blue];  
	});
    });

    return unmatched;
}


// Only executed our code once the DOM is ready.
window.onload = function() {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    var triangles = initialTriangles(400);
    for(var i = 0; i < 6; i++){
	subdivide(triangles);
    }


    for(var i = 0; i < triangles.length; i++){
	var verts = triangles[i].verts;
	Edges.addEdge(verts[0], verts[1], i);
	Edges.addEdge(verts[1], verts[2], i);
	Edges.addEdge(verts[2], verts[0], i);
    }

    Edges.drawBoundary();

//    Points.reverseIndex(triangles);
//    Points.plotSpecialPoints();
//    var un = connected(triangles);
//    var ntri = [];
//    for(var i = 0; i < triangles.length; i++){
//	if(!un[i])
//	    ntri.push(triangles[i]);
//    }
//    drawTriangles(ntri);
    // Draw the view now:
    paper.view.draw();
};
