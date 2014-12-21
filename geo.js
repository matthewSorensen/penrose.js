var Geo = (function(){
    var module = {};
    
    function isLeft(a,b,c){
	return ( (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) );
    }
    
    module.pointInPolygon = function pointInPolygon(point,polygon, closed){
	var winding = 0;
	var thisPoint = Points.getCoords(polygon[0]);
	var n = polygon.length;
	var m = n + (closed ? 0 : 2);
	for(var i = 0; i < m; i++){
	    var nextPoint = null;
	    if(closed){
		nextPoint = Points.getCoords(polygon[(i+1) % polygon.length]);
	    }else{
		switch(i - n){
		case -1:
		    nextPoint = Points.extendedCoords(polygon[n-1]);
		    break;
		case 0:
		    nextPoint = Points.extendedCoords(polygon[0]);
		    break;
		case 1:
		    nextPoint = Points.getCoords(polygon[0]);
		    break;
		default:
		    nextPoint = Points.getCoords(polygon[i]);
		}
	    }
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


    module.contour = function contour(triangles, closed){
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

	if(module.pointInPolygon(point,one,closed)){
	    return {outer: one, inner: two, point: point, closed: closed};
	}else{
	    return {outer: two, inner: one, point: point, closed: closed};
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