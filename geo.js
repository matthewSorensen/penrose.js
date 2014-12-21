var Geo = (function(){
    var module = {};
    
    function isLeft(a,b,c){
	return ( (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) );
    }
    
    module.pointInPolygon = function pointInPolygon(point,polygon){
	var winding = 0;
	var thisPoint = Points.getCoords(polygon[0]);
	for(var i = 0; i < polygon.length; i++){
	    var nextPoint = Points.getCoords(polygon[(i+1) % polygon.length]);
	    if (thisPoint.y <= point.y) {
		if (nextPoint.y  > point.y){
                    if (isLeft(thisPoint,nextPoint, point) > 0)	winding++;
		}
            }
            else {
		if (nextPoint.y  <= point.y){
                    if (isLeft(thisPoint, nextPoint, point) < 0) winding--;
		}
            }	    
	    thisPoint = nextPoint;
	}
	return winding;
    };

    // Reaaaly naive, but we have tiny problems
    function shared(a,b){
	for(var i = 0; i < 2; i++){
	    var edge = a[i];
	    var normed = Math.abs(edge);
	    for(var j = 0; j < 3; j++){
		if(normed == Math.abs(b[j])) return edge;
	    }
	}
	return a[2];
    }


    module.closedContour = function closedContour(triangles){
	var start = triangles[0];
	var point = Points.getCoords(start.verts[0])
	    .add(Points.getCoords(start.verts[1])).
	    add(Points.getCoords(start.verts[2])).multiply(1/3);
	// Find the edge shared between the first and last triangle
	var edge = shared(start.edges,triangles[1].edges);
	// There are two contours, but we don't know which one is the inside yet
	var common = Edges.getEdge(edge);
	var one = [common.start];
	var two = [common.end];
	
	for(var i = 0; i < triangles.length - 1 ; i++){
	    var next = triangles[(i+1) % triangles.length];
	    var nshared = Edges.getEdge(shared(start.edges, next.edges));
	    if(nshared.start == one[0]){
		two.unshift(nshared.end);
	    }else if(nshared.end == one[0]){
		two.unshift(nshared.start);
	    }else if(nshared.start == two[0]){
		one.unshift(nshared.end);
	    }else{
		one.unshift(nshared.start);
	    }
	    start = next;
	}

	if(module.pointInPolygon(point,one)){
	    return {outer: one, inner: two, point: point};
	}else{
	    return {outer: two, inner: one, point: point};
	}
    };

    function addTo(hier, contour){
	var children = [];
	var siblings = [];
	for(var i = 0; i < hier.length; i++){
	    if(module.pointInPolygon(hier[i].point, contour.outer)){
		children.push(hier[i]);
	    }else{
		siblings.push(hier[i]);
	    }
	}
	contour.children = children;
	siblings.push(contour);
	return siblings;
    }


    module.hierarchy = function hierarchy(contours){
	contours.sort(function(a,b){return a.outer.length - b.outer.length;});
	var hier = [];
	for(var i = 0; i < contours.length; i++){
	    hier = addTo(hier, contours[i]);
	}
	console.log(hier);
	return hier;
    };

    function drawOutline(points,color){
	var line = new paper.Path();
	line.strokeColor = color;
	line.closed = true;
	points.map(function(point){ line.add(Points.getCoords(point)); });
	return line;
    }

    module.paintContour = function paintContour(contour){
	// First, paint a nice little circle to show the point on the contour.
	var dot = new paper.Shape.Circle(contour.point, 4);
	dot.fillColor =  "#dc322f";
	// Then draw both of the outlines - outer in magenta, inner in violet
	drawOutline(contour.outer,"#d33682");
	drawOutline(contour.inner,"#6c71c4");
    };


    return module;
}());
