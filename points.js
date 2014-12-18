// Maintains a proper set of points in the tiling - for a small tiling and the specific geometry of the problem.
// Structured around supporting the one important operation - creating a Golden-ratio interpolation between two
// points already in the set.
var Points = (function(){
    var module = {};
    // This module's state, because I'm too lazy to do anything properly....
    var hashToKey = {};
    var points = [];

    // This is criminally bad, of course - but works really well until we get to 2^16 triangles.
    // Of course, our fabrication methods become unhappy before then anyways...
    function hash(a,b){
	return a<<16 | b;
    }
    
    var phi = 0.5 * (1 + Math.sqrt(5));

    function newEntry(a,b){
	return {from: a, 
		to: b, 
		point: points[a].point.multiply(1/phi).add(points[b].point.multiply((phi - 1) / phi)),
		triangles: [],
		uniform: true // Is this bordered only by blue?
	       };
    }
    
    module.interpolate = function interpolate(a,b){
	var key = hash(a,b);
	// Check if there already is a hash recorded for this pair
	if(hashToKey.hasOwnProperty(key)){
	    var entries = hashToKey[key];
	    // Probe along the entries
	    for(var i = 0; i < entries.length; i++){
		var index = entries[i];
		var value = points[index];
		if(value.from == a && value.to == b)
		    return index;
	    }
	    // Otherwise it's new and a collision - chain it
	    var index = points.push(newEntry(a,b)) - 1;
	    entries.push(index);
	    return index;
	}
	// add a new entry to the hash key
	var index = points.push(newEntry(a,b)) - 1;
	hashToKey[key] = [index];
	return index;
    };
    
    module.addPoint = function addPoint(p){
	return points.push({point: p, triangles: [], uniform: true}) - 1;
    };
   
    module.getCoords = function getCoords(i){
	return points[i].point;
    };

    // Once we're done generating the tiling, we want to start extracting more complex shapes from it.
    module.reverseIndex = function reverse(triangles){
	for(var tri in triangles){
	    if(!triangles.hasOwnProperty(tri)) continue;
	    var triangle = triangles[tri];
	    var rule = triangle.green;
	    triangle.verts.map(function(i){
		var point = points[i];
		point.triangles.push(tri);
		if(!rule) point.uniform = false;
	    });
	}
    };
    // Visual debug - are we correctly ID'ing interesting points - center of stars, points on the outside, etc
    module.plotSpecialPoints = function plotUniform(){
	points.map(function(point){
	    var color = null;
	    if(point.uniform){
		color =  "#6c71c4"; // violet
	    }
	    if(point.triangles.length <= 4){
		color = color ? "#dc322f" : "#d33682";
	    }
	    if(color){	    
		var dot = new paper.Shape.Circle(point.point, 4);
		dot.fillColor = color;
	    }
	});
    };
    
    return module;
}());
