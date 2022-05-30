function pointBaseline() {
	if (!document.getElementById('createRtree').disabled && document.getElementById('drawRtree').disabled) {
		alert("Initiate an R-tree structure and set your coordinates from 'POINT Query' button above.");
	}
	else if (document.getElementById("pointX").innerHTML == 'N/A' || document.getElementById("pointY").innerHTML == 'N/A' || document.getElementById("pointZ").innerHTML == 'N/A') {
		alert("You must first place a query point from 'POINT Query' button above.");
	}
	else {
		var indexingStart = performance.now();
		if (document.getElementById("pointQueryResultsDefault").value != '') {
			document.getElementById("pointQueryResultsDefault").value = document.getElementById("pointQueryResults").defaultValue;
		}
		var x = document.getElementById("pointXX").innerHTML;
		var y = document.getElementById("pointYY").innerHTML;
		var z = document.getElementById("pointZZ").innerHTML;
		//Retrieve all 3D objects
		for (var i=1; i<x3dom.canvases[0].x3dElem.children[0].children.length; i++) {
			if ((x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode) && (!(x3dom.canvases[0].x3dElem.children[0].children[i].hidden == false))) {
				if (x3dom.canvases[0].x3dElem.children[0].children[i].nodeName == "Transform") {
					var bboxNode = new bboxCoords(x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode);
					//Check if an intersection occurs between the retrieved object and the chosen point coordinates
					if ((x >= bboxNode.xMin && x <= bboxNode.xMax) && (y >= bboxNode.yMin && y <= bboxNode.yMax) && (z >= bboxNode.zMin && z <= bboxNode.zMax)) {
						var nodeName = x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode._DEF;
						document.getElementById("pointQueryResultsDefault").value += nodeName + "\n";
					}
				}
			}
		}
		var indexingEnd = performance.now();
		alert("Point search took about " + (indexingEnd - indexingStart) + " msec!");
	}
}

function rangeBaseline() {
	if (!document.getElementById('createRtree').disabled && document.getElementById('drawRtree').disabled) {
		alert("Initiate an R-tree structure and create your area from 'REGION/WINDOW Query' button above.");
	}
	else if (document.getElementById("createSearchArea").disabled == false) {
		alert("You must first create a search area from 'REGION/WINDOW Query' button above.");
	}
	else {
		var indexingStart = performance.now();
		if (x3dom.canvases[0].x3dElem.children[0].children['searchRect']) {
			var bboxVolume = new bboxCoords(x3dom.canvases[0].x3dElem.children[0].children['searchRect']._x3domNode);
			if (document.getElementById("rangeQueryResultsDefault").value != '') {
				document.getElementById("rangeQueryResultsDefault").value = document.getElementById("rangeQueryResults").defaultValue;
			}
			//Retrieve all 3D objects
			for (var i=1; i<x3dom.canvases[0].x3dElem.children[0].children.length; i++) {
				if ((x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode) && (!(x3dom.canvases[0].x3dElem.children[0].children[i].hidden == false))) {
					if (x3dom.canvases[0].x3dElem.children[0].children[i].nodeName == "Transform") {
						var bboxNode = new bboxCoords(x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode);
						//Check if an overlap occurs between the retrieved object and the chosen search area
						if ((bboxVolume.xMin < bboxNode.xMax && bboxVolume.xMax > bboxNode.xMin) && (bboxVolume.yMin < bboxNode.yMax && bboxVolume.yMax > bboxNode.yMin) && (bboxVolume.zMin < bboxNode.zMax && bboxVolume.zMax > bboxNode.zMin)) {
							var nodeName = x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode._DEF;
							document.getElementById("rangeQueryResultsDefault").value += nodeName + "\n";
						}
					}
				}
			}
		}
		var indexingEnd = performance.now();
		alert("Range search took about " + (indexingEnd - indexingStart) + " msec!");
	}
}

function kNNBaseline() {
	if (!document.getElementById('createRtree').disabled && document.getElementById('drawRtree').disabled) {
		alert("Initiate an R-tree structure and set your coordinates/sample from 'k-NN Query' buttons above.");
	}
	else if (document.getElementById("NNpointX").innerHTML == 'N/A' || document.getElementById("NNpointY").innerHTML == 'N/A' || document.getElementById("NNpointZ").innerHTML == 'N/A') {
		alert("You must first set your coordinates and sample from 'k-NN Query' buttons above.");
	}
	else {
		var indexingStart = performance.now();
		if (document.getElementById("kNNResultsDefault").value != '') {
			document.getElementById("kNNResultsDefault").value = document.getElementById("kNNResults").defaultValue;
		}
		var distList = [];
		//Retrieve all 3D objects
		for (var i=1; i<x3dom.canvases[0].x3dElem.children[0].children.length; i++) {
			if ((x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode) && (!(x3dom.canvases[0].x3dElem.children[0].children[i].hidden == false))) {
				if (x3dom.canvases[0].x3dElem.children[0].children[i].nodeName == "Transform") {
					var bboxNode = new bboxCoords(x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode);
					//Calculate the Euclidean distance of each object to the Cone point set by the user
					var dx = Math.max(bboxNode.xMin - document.getElementById("NNpointXX").innerHTML, document.getElementById("NNpointXX").innerHTML - bboxNode.xMax);
					var dy = Math.max(bboxNode.yMin - document.getElementById("NNpointYY").innerHTML, document.getElementById("NNpointYY").innerHTML - bboxNode.yMax);
					var dz = Math.max(bboxNode.zMin - document.getElementById("NNpointZZ").innerHTML, document.getElementById("NNpointZZ").innerHTML - bboxNode.zMax);
					var euclideanDist = Math.sqrt(dx*dx + dy*dy + dz*dz);
					var nodeName = x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode._DEF;
					distList.push({dist:euclideanDist, object:nodeName});
				}
			}
		}
		distList.sort(function (a, b){return parseFloat(a.dist) - parseFloat(b.dist)});
		/*
		for (var i = 0; i < distList.length; i++) {
			console.log(i + ": " + distList[i].object + " - " + distList[i].dist);
		}
		*/
		var NN_Sample = document.getElementById("kNN").value;
		for (var i = 1; i <= NN_Sample; i++) {
			document.getElementById("kNNResultsDefault").value += i + "-NN: " + distList[i-1].object + "\n";
		}
		var indexingEnd = performance.now();
		alert("kNN procedure took about " + (indexingEnd - indexingStart) + " msec!");
	}
}

function relationsBaseline() {
	if (!document.getElementById('createRtree').disabled && document.getElementById('drawRtree').disabled) {
		alert("Initiate an R-tree structure for comparison purposes.");
	}
	else {
		var indexingStart = performance.now();
		if (document.getElementById("spatialResultsDefault").value != '') {
			document.getElementById("spatialResultsDefault").value = document.getElementById("spatialResults").defaultValue;
		}
		var relationsArray = [];
		//Retrieve all 3D objects
		for (var i=1; i<x3dom.canvases[0].x3dElem.children[0].children.length; i++) {
			if ((x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode) && (!(x3dom.canvases[0].x3dElem.children[0].children[i].hidden == false))) {
				if (x3dom.canvases[0].x3dElem.children[0].children[i].nodeName == "Transform") {
					var bboxNode = new bboxCoords(x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode);
					//Pairwise and identical objects are skipped and are not calculated, by setting 'j = i+1' for each consecutive loop
					for (var j=i+1; j<x3dom.canvases[0].x3dElem.children[0].children.length; j++) {
						if ((x3dom.canvases[0].x3dElem.children[0].children[j]._x3domNode) && (!(x3dom.canvases[0].x3dElem.children[0].children[j].hidden == false))) {
							if (x3dom.canvases[0].x3dElem.children[0].children[j].nodeName == "Transform") {
								var bboxNode2 = new bboxCoords(x3dom.canvases[0].x3dElem.children[0].children[j]._x3domNode);
								//An indexed object is 'disjoint' to another indexed object (type of 'touch' relation is also included into this category)
								if ((bboxNode.xMax <= bboxNode2.xMin || bboxNode.xMin >= bboxNode2.xMax) || 
									(bboxNode.yMax <= bboxNode2.yMin || bboxNode.yMin >= bboxNode2.yMax) || 
									(bboxNode.zMax <= bboxNode2.zMin || bboxNode.zMin >= bboxNode2.zMax)) {
										relationsArray.push(bboxNode.bboxCoords._DEF + " and " + bboxNode2.bboxCoords._DEF + " are disjoint!" + "\n");
										//An indexed object is on the 'left' side of another indexed object
										if (bboxNode.xMax <= bboxNode2.xMin) {
											relationsArray.push(bboxNode.bboxCoords._DEF + " is on the left side of " + bboxNode2.bboxCoords._DEF + "\n");
											relationsArray.push(bboxNode2.bboxCoords._DEF + " is on the right side of " + bboxNode.bboxCoords._DEF + "\n");
										}
										//An indexed object is on the 'right' side of another indexed object
										else if (bboxNode.xMin >= bboxNode2.xMax) {
											relationsArray.push(bboxNode.bboxCoords._DEF + " is on the right side of " + bboxNode2.bboxCoords._DEF + "\n");
											relationsArray.push(bboxNode2.bboxCoords._DEF + " is on the left side of " + bboxNode.bboxCoords._DEF + "\n");
										}
										//An indexed object is in 'front' of another indexed object
										if (bboxNode.zMin >= bboxNode2.zMax) {
											relationsArray.push(bboxNode.bboxCoords._DEF + " is in front of " + bboxNode2.bboxCoords._DEF + "\n");
											relationsArray.push(bboxNode2.bboxCoords._DEF + " is behind " + bboxNode.bboxCoords._DEF + "\n");
										}
										//An indexed object is 'behind' of another indexed object
										else if (bboxNode.zMax <= bboxNode2.zMin) {
											relationsArray.push(bboxNode.bboxCoords._DEF + " is behind " + bboxNode2.bboxCoords._DEF + "\n");
											relationsArray.push(bboxNode2.bboxCoords._DEF + " is in front of " + bboxNode.bboxCoords._DEF + "\n");
										}
										//An indexed object is 'below' another indexed object
										if (bboxNode.yMax < bboxNode2.yMin) {
											relationsArray.push(bboxNode.bboxCoords._DEF + " is below " + bboxNode2.bboxCoords._DEF + "\n");
											relationsArray.push(bboxNode2.bboxCoords._DEF + " is above " + bboxNode.bboxCoords._DEF + "\n");
										}
										//An indexed is 'above' another indexed object
										else if (bboxNode.yMin > bboxNode2.yMax) {
											relationsArray.push(bboxNode.bboxCoords._DEF + " is above " + bboxNode2.bboxCoords._DEF + "\n");
											relationsArray.push(bboxNode2.bboxCoords._DEF + " is below " + bboxNode.bboxCoords._DEF + "\n");
										}
										//An indexed object is 'over' another indexed object
										if (bboxNode.yMin == bboxNode2.yMax) {
											if ((!((bboxNode.xMax <= bboxNode2.xMin) || (bboxNode.xMin >= bboxNode2.xMax))) && 
												(!((bboxNode.zMax <= bboxNode2.zMin) || (bboxNode.zMin >= bboxNode2.zMax)))) {
													relationsArray.push(bboxNode.bboxCoords._DEF + " is over " + bboxNode2.bboxCoords._DEF + "\n");
													relationsArray.push(bboxNode2.bboxCoords._DEF + " is below " + bboxNode.bboxCoords._DEF + "\n");
											}
											else {
												relationsArray.push(bboxNode.bboxCoords._DEF + " is above " + bboxNode2.bboxCoords._DEF + "\n");
												relationsArray.push(bboxNode2.bboxCoords._DEF + " is below " + bboxNode.bboxCoords._DEF + "\n");
											}
										}
										//An indexed object is 'over' another indexed object (contradictory MBRs)
										else if (bboxNode.yMax == bboxNode2.yMin) {
											if ((!((bboxNode.xMax <= bboxNode2.xMin) || (bboxNode.xMin >= bboxNode2.xMax))) && 
												(!((bboxNode.zMax <= bboxNode2.zMin) || (bboxNode.zMin >= bboxNode2.zMax)))) {
													relationsArray.push(bboxNode.bboxCoords._DEF + " is below " + bboxNode2.bboxCoords._DEF + "\n");
													relationsArray.push(bboxNode2.bboxCoords._DEF + " is over " + bboxNode.bboxCoords._DEF + "\n");
											}
											else {
												relationsArray.push(bboxNode.bboxCoords._DEF + " is below " + bboxNode2.bboxCoords._DEF + "\n");
												relationsArray.push(bboxNode2.bboxCoords._DEF + " is above " + bboxNode.bboxCoords._DEF + "\n");
											}
										}
								}
								//An indexed object is 'equal' to another indexed object (evenly arranged)
								else if ((bboxNode.xMin == bboxNode2.xMin && bboxNode.xMax == bboxNode2.xMax) && (bboxNode.yMin == bboxNode2.yMin && bboxNode.yMax == bboxNode2.yMax) && (bboxNode.zMin == bboxNode2.zMin && bboxNode.zMax == bboxNode2.zMax)) {
									relationsArray.push(bboxNode.bboxCoords._DEF + " and " + bboxNode2.bboxCoords._DEF + " are equal!" + "\n");
								}
								//An indexed object is 'within' another indexed object
								else if ((bboxNode.xMin >= bboxNode2.xMin && bboxNode.xMax <= bboxNode2.xMax) && (bboxNode.yMin >= bboxNode2.yMin && bboxNode.yMax <= bboxNode2.yMax) && (bboxNode.zMin >= bboxNode2.zMin && bboxNode.zMax <= bboxNode2.zMax)) {
									relationsArray.push(bboxNode.bboxCoords._DEF + " is within " + bboxNode2.bboxCoords._DEF + "!" + "\n");
									relationsArray.push(bboxNode2.bboxCoords._DEF + " contains " + bboxNode.bboxCoords._DEF + "!" + "\n");
								}
								//An indexed object 'contains' another indexed object
								else if ((bboxNode.xMin <= bboxNode2.xMin && bboxNode.xMax >= bboxNode2.xMax) && (bboxNode.yMin <= bboxNode2.yMin && bboxNode.yMax >= bboxNode2.yMax) && (bboxNode.zMin <= bboxNode2.zMin && bboxNode.zMax >= bboxNode2.zMax)) {
									relationsArray.push(bboxNode.bboxCoords._DEF + " contains " + bboxNode2.bboxCoords._DEF + "!" + "\n");
									relationsArray.push(bboxNode2.bboxCoords._DEF + " is within " + bboxNode.bboxCoords._DEF + "!" + "\n");
								}
								//An indexed object 'overlaps' another indexed object
								else if ((bboxNode.xMin < bboxNode2.xMax && bboxNode.xMax > bboxNode2.xMin) && 
										(bboxNode.yMin < bboxNode2.yMax && bboxNode.yMax > bboxNode2.yMin) &&
										(bboxNode.zMin < bboxNode2.zMax && bboxNode.zMax > bboxNode2.zMin)) {
											relationsArray.push(bboxNode.bboxCoords._DEF + " and " + bboxNode2.bboxCoords._DEF + " overlap each other!" + "\n");
								}
							}
						}
					}
				}
			}
		}
		document.getElementById("spatialResultsDefault").value = "Implicated relations were drawn in a data table below due to excessive number.";
		document.getElementById("relationsSetDefault").value = relationsArray.length;
		var indexingEnd = performance.now();
		alert("Spatial relations implication took about " + (indexingEnd - indexingStart) + " msec!");
		drawDataTableBaseline(relationsArray);
		relationsArray = [];
	}
}

//Retrieve and store the bounding box vertices of the chosen 3D object
function bboxCoords(X3DOMNode) {
	this.bboxCoords = X3DOMNode;
	var bboxVolume = this.bboxCoords.getVolume();
	var minCoords = new x3dom.fields.SFVec3f();
	var maxCoords = new x3dom.fields.SFVec3f();
	bboxVolume.getBounds(minCoords, maxCoords);
	this.xMax = maxCoords.x;
	this.yMax = maxCoords.y;
	this.zMax = maxCoords.z;
	this.xMin = minCoords.x;
	this.yMin = minCoords.y;
	this.zMin = minCoords.z;
}

function drawDataTableBaseline(relationsArray) {
	for (var i=0; i<relationsArray.length; i++ ) {
		var temp = relationsArray[i];
		relationsArray[i] = new Array();
		relationsArray[i].push(temp);
	}
	$(document).ready(function() {
		$('#defaultSample').DataTable({
			data: relationsArray,
			columns: [{ title: "Baseline Spatial Relations" }]
		}); 
	} );
}


