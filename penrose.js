function drawTriangles(list){
    list.map(function(tri){
	var path = new paper.Path();
	path.fillColor = tri.rule ? '#268bd2' : '#2aa198';
	tri.verts.map(function(x){path.add(x)});
    });
}

function initialTriangles(radius){
    var center = paper.view.center;
    var triangles = [];
    var dtheta = 0.2 * Math.PI;
    
    var old = new paper.Point(radius, 0);
    for(var i = 0; i < 10; i++){
	var theta = (i+1) * dtheta;
	var newer = new paper.Point(radius * Math.cos(theta) , radius * Math.sin(theta));
	if(i % 2)
	    triangles.push({verts: [center, center.add(old), center.add(newer)], rule: 0});
	else
	    triangles.push({verts: [center, center.add(newer), center.add(old)], rule: 0});
	old = newer;
    }
    return triangles;
}

var phi = 0.5 * (1 + Math.sqrt(5));

function goldenSection(a,b){
    return a.multiply(1/phi).add(b.multiply((phi - 1) / phi));
}

function subdivide(triangles){
    var len = triangles.length;
    for(var i = 0; i < len; i++){
	var tri = triangles[i];
	if(tri.rule){
	    var a = tri.verts[0];
	    var b = tri.verts[1];
	    var c = tri.verts[2];

	    var q = goldenSection(a,b);
	    var r = goldenSection(c,b);

	    triangles.push({verts: [r,q,a] , rule: 0});
	    triangles.push({verts: [q,r,b] , rule: 1});
	    tri.verts = [r,c,a];
	}else{
	    var newPoint = goldenSection(tri.verts[1], tri.verts[0]);
	    triangles.push({verts: [tri.verts[2], newPoint, tri.verts[1]], rule: 0});
	    tri.verts = [newPoint, tri.verts[2], tri.verts[0]];
	    tri.rule = 1;
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
    drawTriangles(triangles);
    // Draw the view now:
    paper.view.draw();
};
