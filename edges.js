var Edges = (function(Points){
    var module = {};
    var hashToEdge = {};
    var edges = []; // contains {start, end, triangles}
    
    function hash(a,b){
	return (a << 16) + b;
    }

    module.addEdge = function addEdge(start,end,triangle){
	var reverse = 1;
	// Edges always go from the lower point number to the higher point number
	if(start > end){
	    var tmp = start;
	    start = end;
	    end = tmp;
	    reverse = -1;
	}
	// Now we consult the hash to figure out if we've already seen this hash
	var hashed = hash(start,end);
	if(hashToEdge.hasOwnProperty(hashed)){
	    var entries = hashToEdge[hashed];
	    for(var i = 0; i < entries.length; i++){
		var entry = entries[i];
		var edge = edges[entry];
		if(edge.start == start && edge.end == end){
		    // We've found it, so make sure we're in the triangles list and return the correct index
		    if(triangle != edge.triangles[0]){
			edge.triangles.push(triangle);
		    }
		    return reverse * (entry + 1);
		}
	    }
	    // Otherwise, we aren't in the hash but have a collision
	    var edge = {start: start, end: end, triangles: [triangle]};
	    var index = edges.push(edge);
	    entries.push(index - 1);
	    return reverse * index;
	}
	// The hash is definitely new!
	var edge = {start: start, end: end, triangles: [triangle]};
	var index = edges.push(edge);
	hashToEdge[hashed] = [index - 1];
	return reverse * index;
    };

    module.getEdge = function getEdge(index){
	return edges[Math.abs(index) - 1];
    };

    module.neighbors = function(x){
	return edges[Math.abs(x) - 1].triangles.length;
    };
    // Returns the index of the other triangle on this edge - iff it exists
    module.otherNeighbor = function(triangle,edge){
	var edge = Math.abs(edge) - 1;
	var tris = edges[edge].triangles;
	for(var i = 0; i < tris.length; i++){
	    var t = tris[i];
	    if(t != triangle) return t;
	} 
	return null;
    };

    module.drawEdges = function drawEdges(){
	edges.map(function(edge){
	    var path = new paper.Path(Points.getCoords(edge.start), Points.getCoords(edge.end));
	    path.strokeColor = "#cb4b16";
	});
    };

    module.drawBoundary = function drawBoundary(){
	edges.map(function(edge){
	    if(edge.triangles.length > 1) return;
	    var path = new paper.Path(Points.getCoords(edge.start), Points.getCoords(edge.end));
	    path.strokeColor = "#cb4b16";
	});
	
    };

    return module;
}(Points));
