
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
    Points.reverseIndex(triangles);
    drawTriangles(triangles);
    Points.plotSpecialPoints();
    // Draw the view now:
    paper.view.draw();
};
