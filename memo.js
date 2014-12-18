var hashToKey = {};
var memo = [];

function hash(a,b){
    return a<<16 | b; // This is criminally bad, of course - but works really well until we get to 2^16...
}

var phi = 0.5 * (1 + Math.sqrt(5));

function newEntry(a,b){
    return {from: a, to: b, point: memo[a].point.multiply(1/phi).add(memo[b].point.multiply((phi - 1) / phi))};
}

function interpolate(a,b){
    var key = hash(a,b);
    // Check if there already is a hash recorded for this pair
    if(hashToKey.hasOwnProperty(key)){
	var entries = hashToKey[key];
	// Probe along the entries
	for(var i = 0; i < entries.length; i++){
	    var index = entries[i];
	    var value = memo[index];
	    if(value.from == a && value.to == b)
		return index;
	}
	// Otherwise it's new and a collision - chain it
	var index = memo.push(newEntry(a,b)) - 1;
	entries.push(index);
	return index;
    }
    // add a new entry to the hash key
    var index = memo.push(newEntry(a,b)) - 1;
    hashToKey[key] = [index];
    return index;
}

function addPoint(p){
    return memo.push({point: p}) - 1;
}
