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
    
    return module;
}());
