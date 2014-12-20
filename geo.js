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
	    var normed = Math.abs(edge) - 1;
	    for(var j = 0; j < 3; j++){
		if(normed == Math.abs(b[j]) - 1) return edge;
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
	var edge = shared(start.edges,triangles[triangles.length - 1].edges);
	// There are two contours, but we don't know which one is the inside yet
	var common = Edges.getEdge(edge);
	var one = [common.start];
	var two = [common.end];
	
	for(var i = 0; i < triangles.length ; i++){
	    var next = triangles[i];
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

    module.paintContour = function paintContour(contour){
	// First, paint a nice little circle to show the point on the contour.
	var dot = new paper.Shape.Circle(contour.point, 4);
	dot.fillColor =  "#dc322f";

	var outer = new paper.Path();
	outer.strokeColor = "#d33682";
	outer.closed = true;
	contour.outer.map(function(point){
	    outer.add(Points.getCoords(point));
	});

	var inner = new paper.Path();
	inner.strokeColor = "#6c71c4";
	inner.closed = true;
	contour.inner.map(function(point){
	    inner.add(Points.getCoords(point));
	});

    };
    return module;
}());
