//Our R-tree instance
var myRTree;

//Root node of the generated R-tree
var rt;

//Initialize a R-tree data structure and insert the X3DOM spatial objects into it
function generateRtree() {
	myRTree = new R_Tree(3);
	//Retrieve all spatial objects from Transform and Group nodes
	for (var i=0; i<x3dom.canvases[0].x3dElem.children[0].children.length; i++) {
		if (x3dom.canvases[0].x3dElem.children[0].children[i]._x3domNode._DEF == "dad_spiti" && x3dom.canvases[0].x3dElem.children[0].children[i].nodeName == "Transform") {
			for (var j=0; j<x3dom.canvases[0].x3dElem.children[0].children[i].children.length; j++) {
				if (x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode._DEF == "Dining_Table") {
					if (x3dom.canvases[0].x3dElem.children[0].children[i].children[j].nodeName == "Transform") {
						var indexRecord = new SpatialObject(x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode);
						myRTree.InsertEntry(indexRecord.xMax, indexRecord.yMax, indexRecord.zMax, indexRecord.xMin, indexRecord.yMin, indexRecord.zMin, x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode._DEF);
					}
				}
				else if (x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode._DEF == "Colorful_Orb") {
					if (x3dom.canvases[0].x3dElem.children[0].children[i].children[j].nodeName == "Transform") {
						var indexRecord = new SpatialObject(x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode);
						myRTree.InsertEntry(indexRecord.xMax, indexRecord.yMax, indexRecord.zMax, indexRecord.xMin, indexRecord.yMin, indexRecord.zMin, x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode._DEF);
					}
				}
				else if (x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode._DEF == "Shelf") {
					if (x3dom.canvases[0].x3dElem.children[0].children[i].children[j].nodeName == "Transform") {
						var indexRecord = new SpatialObject(x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode);
						myRTree.InsertEntry(indexRecord.xMax, indexRecord.yMax, indexRecord.zMax, indexRecord.xMin, indexRecord.yMin, indexRecord.zMin, x3dom.canvases[0].x3dElem.children[0].children[i].children[j]._x3domNode._DEF);
					}
				}
			}
		}
	}
	rt = myRTree.getR_Tree();
	//Display the generated R-tree structure in the browser's console for debugging purposes
	console.log(rt);
	document.getElementById("createRtree").disabled = true;
	//Make available the rest of R-tree and queries options 
	document.getElementById("drawRtree").disabled = false;
}

//Make a basic integrity check before procced to spatial relations
function calculateSpatialRelations() {
	if (myRTree == undefined) {
		alert("No R-tree structure to query! - Initialize one by clicking on 'Create R-tree!' button.");
	}
	else if (myRTree != undefined) {
		if (document.getElementById("spatialResults").value != '') {
			document.getElementById("spatialResults").value = document.getElementById("spatialResults").defaultValue;
		}
		myRTree.SpatialReasoning();
	}
	else {
		alert("Unknown problem detected...");
	}
}

//R_Tree constructor and core functions
function R_Tree(MaxEntries) {
	//Maximum number on entries per node
	console.log("M:" + MaxEntries);
	
	//Minimum number of entries per node
	var minEntries = Math.floor(MaxEntries/2);
	console.log("m:" + minEntries);
	
	//Rectangular parallelepipeds' counter
	var counter = 1;
	var rectNumber = "R" + counter;
	
	//Initialization of R_Tree's root
	var T = new Node(0, 0, 0, 0, 0, 0, rectNumber);
	
	//Insert an index record to R-tree
	this.InsertEntry = function(xMax, yMax, zMax, xMin, yMin, zMin, id) {
		var N = T;
		var treeLevel = 1;
		//Initiate 'ChooseLeaf' to select a leaf node to place entry
		while (N.children.length != 0) {
			treeLevel = treeLevel + 1;
			var F = ChooseLeaf(xMax, yMax, zMax, xMin, yMin, zMin, id, N);
			N = F;
		}
		//Check if there is free space for the new entry
		if (N.entries.length < MaxEntries) {
			N.entries.push({xMax:xMax, yMax:yMax, zMax:zMax, xMin:xMin, yMin:yMin, zMin:zMin, id:id});
			calculateLeafNodeMBR(N);
			//Initiate 'AdjustTree' to propagate changes upward and recalculate MBR values of relative nodes
			AdjustTree(N);
		}
		//If not, initiate 'SplitNode' to create the necessary space based on a quadratic algorithm
		else {
			var splitLeaf = SplitNode(xMax, yMax, zMax, xMin, yMin, zMin, id, N);
			N = splitLeaf[0];
			NN = splitLeaf[1];
			//Initiate 'AdjustTree' to propagate changes upward and recalculate MBR values of relative nodes for both nodes 'N' and 'NN'
			AdjustTree(N, NN);
		}
	}

	//Initiate the necessary functions to get the spatial relations
	this.SpatialReasoning = function() {
		//An R-tree level-order traversal for spatial reasoning between the MBRs of each tree level
		//traverseForRelations(rt, 1);

		//Automatically infer all directional relations between R-tree's indexed objects
		spatialRelations();
	}
	
	//Return current R-tree's structure
	this.getR_Tree = function () {
		return T;
	}
	
	//Select the best possible leaf node to place the new entry
	function ChooseLeaf(xMax, yMax, zMax, xMin, yMin, zMin, id, N) {
		var enlargedRects = [];
		for (var i in N.children) {
			var xMBREnlargedRect = Math.max(N.children[i].xMax, xMax) - Math.min(N.children[i].xMin, xMin);
			var yMBREnlargedRect = Math.max(N.children[i].yMax, yMax) - Math.min(N.children[i].yMin, yMin);
			var zMBREnlargedRect = Math.max(N.children[i].zMax, zMax) - Math.min(N.children[i].zMin, zMin);
			var originalRectArea = ((((N.children[i].xMax - N.children[i].xMin) * (N.children[i].zMax - N.children[i].zMin)) * 2) + 
									(((N.children[i].yMax - N.children[i].yMin) * (N.children[i].zMax - N.children[i].zMin)) * 2) +
									(((N.children[i].xMax - N.children[i].xMin) * (N.children[i].yMax - N.children[i].yMin)) * 2));
			var enlargedRectArea = (((xMBREnlargedRect * zMBREnlargedRect) * 2) +
									((yMBREnlargedRect * zMBREnlargedRect) * 2) +
									((xMBREnlargedRect * yMBREnlargedRect) * 2));
			var enlargementDifference = enlargedRectArea - originalRectArea;
			enlargedRects.push(enlargementDifference);
			//It's working fine for any entry insertion, but not for the ones that are totally covered by an already existing rectangular parallelepiped 
			//enlargedRects.push({enlargedArea:enlargedRectArea, originalArea:originalRectArea});
		}
		/*
		var leastEnlargedRect = findMin(enlargedRects);
		console.log("The least enlarged rectangular parallelepiped is found on child:" + leastEnlargedRect);
		F = N.children[leastEnlargedRect];
		*/
		var m = Infinity;
		var childIndex;
		for (var i in enlargedRects) {
			if (enlargedRects[i] < m) {
				m = enlargedRects[i];
				childIndex = i;
			}
		}
		F = N.children[childIndex];
		return F;
	}
	
	//Split leaf node and distribute its already existing entries along with the new one, to two nodes 'L' and 'LL'
	function SplitNode(xMax, yMax, zMax, xMin, yMin, zMin, id, L) {
		var M = [];
		for (var i in L.entries) {
			M.push(L.entries[i]);
		}
		M.push({xMax:xMax, yMax:yMax, zMax:zMax, xMin:xMin, yMin:yMin, zMin:zMin, id:id});
		L.entries.length = 0;
		
		//Pick the two worst seeds to form the new groups
		var seedsArea = [];
		for (var i = 0; i < M.length; i++) {
			//Pairwise entries are skipped and are not re-calculated, by setting 'k = i' for each consecutive loop
			for (var k = i; k < M.length; k++) {
				var xMBREnlargedRect = Math.max(M[i].xMax, M[k].xMax) - Math.min(M[i].xMin, M[k].xMin);
				var yMBREnlargedRect = Math.max(M[i].yMax, M[k].yMax) - Math.min(M[i].yMin, M[k].yMin);
				var zMBREnlargedRect = Math.max(M[i].zMax, M[k].zMax) - Math.min(M[i].zMin, M[k].zMin);
				var E1Area = ((((M[i].xMax - M[i].xMin) * (M[i].zMax - M[i].zMin)) * 2) + 
							  (((M[i].yMax - M[i].yMin) * (M[i].zMax - M[i].zMin)) * 2) + 
							  (((M[i].xMax - M[i].xMin) * (M[i].yMax - M[i].yMin)) * 2));
				var E2Area = ((((M[k].xMax - M[k].xMin) * (M[k].zMax - M[k].zMin)) * 2) + 
							  (((M[k].yMax - M[k].yMin) * (M[k].zMax - M[k].zMin)) * 2) + 
							  (((M[k].xMax - M[k].xMin) * (M[k].yMax - M[k].yMin)) * 2));
				var JArea = (((xMBREnlargedRect * zMBREnlargedRect) * 2) + 
							 ((yMBREnlargedRect * zMBREnlargedRect) * 2) + 
							 ((xMBREnlargedRect * yMBREnlargedRect) * 2));
				//Inefficiency factor 'd' implies that the most wasteful pair will have the higher value
				d = JArea - (E1Area + E2Area);
				seedsArea.push({inefficiency:d, entryA:i, entryB:k});
			}
		}
		var m = -Infinity;
		var entryAIndex;
		var entryBIndex;
		for (var j in seedsArea) {
			if (seedsArea[j].inefficiency > m) {
				m = seedsArea[j].inefficiency;
				entryAIndex = seedsArea[j].entryA;
				entryBIndex = seedsArea[j].entryB;
			}
		}
		var groupA = [];
		var groupB = [];
		groupA.push(M[entryAIndex]);
		var variableAreaA = clone(groupA[0]);
		groupB.push(M[entryBIndex]);
		var variableAreaB = clone(groupB[0]);
		M.splice(entryAIndex, 1);
		M.splice(entryBIndex - 1, 1);
		while (M.length != 0) {
			if (groupA.length == (MaxEntries - minEntries + 1)) {
				for (var i in M) {
					groupB.push(M[i]);
					groupBArea = groupEnlargement(M[i], variableAreaB);
				}
				M.length = 0;
			}
			else if (groupB.length == (MaxEntries - minEntries + 1)) {
				for (var i in M) {
					groupA.push(M[i]);
					groupAArea = groupEnlargement(M[i], variableAreaA);
				}
				M.length = 0;
			}
			else {
				var d1, d2;
				var bestPreference = 0;
				var bestEntry, bestEntryIndex;
				//Pick the next entry and assign it based on the higher inefficiency factor among the two nodes
				for (var i in M) {
					var xMBREnlargedRect = Math.max(M[i].xMax, variableAreaA.xMax) - Math.min(M[i].xMin, variableAreaA.xMin);
					var yMBREnlargedRect = Math.max(M[i].yMax, variableAreaA.yMax) - Math.min(M[i].yMin, variableAreaA.yMin);
					var zMBREnlargedRect = Math.max(M[i].zMax, variableAreaA.zMax) - Math.min(M[i].zMin, variableAreaA.zMin);
					var EArea = ((((M[i].xMax - M[i].xMin) * (M[i].zMax - M[i].zMin)) * 2) + 
								 (((M[i].yMax - M[i].yMin) * (M[i].zMax - M[i].zMin)) * 2) + 
								 (((M[i].xMax - M[i].xMin) * (M[i].yMax - M[i].yMin)) * 2));
					var JArea = (((xMBREnlargedRect * zMBREnlargedRect) * 2) + 
								((yMBREnlargedRect * zMBREnlargedRect) * 2) + 
								((xMBREnlargedRect * yMBREnlargedRect) * 2));
					//Condition that is met in case of the entry's area is larger and overlaps the group's area
					if (JArea == EArea) {
						var groupAArea = ((((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
										  (((variableAreaA.yMax - variableAreaA.yMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
										  (((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.yMax - variableAreaA.yMin)) * 2));
						d1 = EArea - groupAArea;
					}
					else {
						d1 = JArea - EArea;
					}

					var xMBREnlargedRect = Math.max(M[i].xMax, variableAreaB.xMax) - Math.min(M[i].xMin, variableAreaB.xMin);
					var yMBREnlargedRect = Math.max(M[i].yMax, variableAreaB.yMax) - Math.min(M[i].yMin, variableAreaB.yMin);
					var zMBREnlargedRect = Math.max(M[i].zMax, variableAreaB.zMax) - Math.min(M[i].zMin, variableAreaB.zMin);
					var JArea = (((xMBREnlargedRect * zMBREnlargedRect) * 2) + ((yMBREnlargedRect * zMBREnlargedRect) * 2) + ((xMBREnlargedRect * yMBREnlargedRect) * 2));
					//Condition that is met in case of the entry's area is larger and overlaps the group's area
					if (JArea == EArea) {
						var groupBArea = ((((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
										  (((variableAreaB.yMax - variableAreaB.yMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
										  (((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.yMax - variableAreaB.yMin)) * 2));
						d2 = EArea - groupBArea;
					}
					else {
						d2 = JArea - EArea;
					}
					preferenceValue = Math.abs(d1 - d2);
					if (bestPreference < preferenceValue || preferenceValue == 0) {
						bestPreference = preferenceValue;
						bestEntry = M[i];
						bestEntryIndex = i;
					}
				}
				//Put the higher preferenced value entry to the rectangular parallelepiped which is least enlarged
				if (d1 < d2) {
					groupA.push(bestEntry);
					groupAArea = groupEnlargement(bestEntry, variableAreaA);
					M.splice(bestEntryIndex, 1);
					console.log(M.length);
				}
				else if (d1 > d2) {
					groupB.push(bestEntry);
					groupBArea = groupEnlargement(bestEntry, variableAreaB);
					M.splice(bestEntryIndex, 1);
				}
				//In case both groups have been equally enlarged, then add to the group with the smaller area
				else {
					
					var groupAArea = ((((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
									  (((variableAreaA.yMax - variableAreaA.yMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
									  (((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.yMax - variableAreaA.yMin)) * 2));

					var groupBArea = ((((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
									  (((variableAreaB.yMax - variableAreaB.yMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
									  (((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.yMax - variableAreaB.yMin)) * 2));
					if (groupAArea < groupBArea) {
						groupA.push(bestEntry);
						groupAArea = groupEnlargement(bestEntry, variableAreaA);
						M.splice(bestEntryIndex, 1);
					}
					else if (groupAArea > groupBArea) {
						groupB.push(bestEntry);
						groupBArea = groupEnlargement(bestEntry, variableAreaB);
						M.splice(bestEntryIndex, 1);
					}
					//In case both groups have been equally enlarged and both areas have the same size, then add to the group with the fewer entries
					else {
						if (groupA.length < groupB.length) {
							groupA.push(bestEntry);
							groupAArea = groupEnlargement(bestEntry, variableAreaA);
							M.splice(bestEntryIndex, 1);
						}
						else if (groupA.length > groupB.length) {
							groupB.push(bestEntry);
							groupBArea = groupEnlargement(bestEntry, variableAreaB);
							M.splice(bestEntryIndex, 1);
						}
						//In case both groups have been equally enlarged, their areas have the same size and their entries number is the same, then add new entry to either group
						else {
							if ((Math.floor(Math.random() * 2) + 1) == 1) {
								groupA.push(bestEntry);
								groupAArea = groupEnlargement(bestEntry, variableAreaA);
								M.splice(bestEntryIndex, 1);
							}
							else {
								groupB.push(bestEntry);
								groupBArea = groupEnlargement(bestEntry, variableAreaB);
								M.splice(bestEntryIndex, 1);
							}
						}
					}
				}
			}
		}
		for (var i in groupA) {
			L.entries.push(groupA[i]);
		}
		calculateLeafNodeMBR(L);
		var LL = new Node(variableAreaB.xMax, variableAreaB.yMax, variableAreaB.zMax, variableAreaB.xMin, variableAreaB.yMin, variableAreaB.zMin, rectNumber);
		for (var i in groupB) {
			LL.entries.push(groupB[i]);
		}
		calculateLeafNodeMBR(LL);
		return [L, LL];
	}
	
	//Split internal node and distribute its already existing children along with the new one, to two nodes 'P' and 'PP'
	function SplitInternalNode(P, LL) {
		var M = [];
		for (var i in P.children) {
			M.push(P.children[i]);
		}
		M.push(LL);
		P.children.length = 0;
		//Pick the two worst seeds to form the new groups
		var seedsArea = [];
		for (var i = 0; i < M.length; i++) {
			//Pairwise and identical children are skipped and are not calculated, by setting 'k = i+1' for each consecutive loop
			for (var k = i+1; k < M.length; k++) {
				var xMBREnlargedRect = Math.max(M[i].xMax, M[k].xMax) - Math.min(M[i].xMin, M[k].xMin);
				var yMBREnlargedRect = Math.max(M[i].yMax, M[k].yMax) - Math.min(M[i].yMin, M[k].yMin);
				var zMBREnlargedRect = Math.max(M[i].zMax, M[k].zMax) - Math.min(M[i].zMin, M[k].zMin);
				var E1Area = ((((M[i].xMax - M[i].xMin) * (M[i].zMax - M[i].zMin)) * 2) + 
							  (((M[i].yMax - M[i].yMin) * (M[i].zMax - M[i].zMin)) * 2) + 
							  (((M[i].xMax - M[i].xMin) * (M[i].yMax - M[i].yMin)) * 2));
				var E2Area = ((((M[k].xMax - M[k].xMin) * (M[k].zMax - M[k].zMin)) * 2) + 
							  (((M[k].yMax - M[k].yMin) * (M[k].zMax - M[k].zMin)) * 2) + 
							  (((M[k].xMax - M[k].xMin) * (M[k].yMax - M[k].yMin)) * 2));
				var JArea = (((xMBREnlargedRect * zMBREnlargedRect) * 2) + 
							((yMBREnlargedRect * zMBREnlargedRect) * 2) + 
							((xMBREnlargedRect * yMBREnlargedRect) * 2));
				//Inefficiency factor 'd' implies that the most wasteful pair will have the higher value 
				d = JArea - (E1Area + E2Area);
				seedsArea.push({inefficiency:d, entryA:i, entryB:k});
			}
		}
		var m = -Infinity;
		var entryAIndex;
		var entryBIndex;
		for (var j in seedsArea) {
			if (seedsArea[j].inefficiency > m) {
				m = seedsArea[j].inefficiency;
				entryAIndex = seedsArea[j].entryA;
				entryBIndex = seedsArea[j].entryB;
			}
		}
		var groupA = [];
		var groupB = [];
		groupA.push(M[entryAIndex]);
		var variableAreaA = clone(groupA[0]);
		groupB.push(M[entryBIndex]);
		var variableAreaB = clone(groupB[0]);
		M.splice(entryAIndex, 1);
		M.splice(entryBIndex - 1, 1);
		while (M.length != 0) {
			if (groupA.length == (MaxEntries - minEntries + 1)) {
				for (var i in M) {
					groupB.push(M[i]);
					groupBArea = groupEnlargement(M[i], variableAreaB);
				}
				M.length = 0;
			}
			else if (groupB.length == (MaxEntries - minEntries + 1)) {
				for (var i in M) {
					groupA.push(M[i]);
					groupAArea = groupEnlargement(M[i], variableAreaA);
				}
				M.length = 0;
			}
			else {
				var d1, d2;
				var bestPreference = 0;
				var bestEntry, bestEntryIndex;
				//Pick the next entry and assign it based on the higher inefficiency factor among the two nodes
				for (var i in M) {
					var xMBREnlargedRect = Math.max(M[i].xMax, variableAreaA.xMax) - Math.min(M[i].xMin, variableAreaA.xMin);
					var yMBREnlargedRect = Math.max(M[i].yMax, variableAreaA.yMax) - Math.min(M[i].yMin, variableAreaA.yMin);
					var zMBREnlargedRect = Math.max(M[i].zMax, variableAreaA.zMax) - Math.min(M[i].zMin, variableAreaA.zMin);
					var EArea = ((((M[i].xMax - M[i].xMin) * (M[i].zMax - M[i].zMin)) * 2) + 
								 (((M[i].yMax - M[i].yMin) * (M[i].zMax - M[i].zMin)) * 2) + 
							     (((M[i].xMax - M[i].xMin) * (M[i].yMax - M[i].yMin)) * 2));
					var JArea = (((xMBREnlargedRect * zMBREnlargedRect) * 2) + 
								((yMBREnlargedRect * zMBREnlargedRect) * 2) + 
								((xMBREnlargedRect * yMBREnlargedRect) * 2));
					//Condition that is met in case of the entry's area is larger and overlaps the group's area
					if (JArea == EArea) {
						var groupAArea = ((((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
										  (((variableAreaA.yMax - variableAreaA.yMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
										  (((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.yMax - variableAreaA.yMin)) * 2));
						d1 = EArea - groupAArea;
					}
					else {
						d1 = JArea - EArea;
					}
					
					var xMBREnlargedRect = Math.max(M[i].xMax, variableAreaB.xMax) - Math.min(M[i].xMin, variableAreaB.xMin);
					var yMBREnlargedRect = Math.max(M[i].yMax, variableAreaB.yMax) - Math.min(M[i].yMin, variableAreaB.yMin);
					var zMBREnlargedRect = Math.max(M[i].zMax, variableAreaB.zMax) - Math.min(M[i].zMin, variableAreaB.zMin);
					var JArea = (((xMBREnlargedRect * zMBREnlargedRect) * 2) + ((yMBREnlargedRect * zMBREnlargedRect) * 2) + ((xMBREnlargedRect * yMBREnlargedRect) * 2));
					//Condition that is met in case of the entry's area is larger and overlaps the group's area
					if (JArea == EArea) {
						var groupBArea = ((((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
										  (((variableAreaB.yMax - variableAreaB.yMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
										  (((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.yMax - variableAreaB.yMin)) * 2));
						d2 = EArea - groupBArea;
					}
					else {
						d2 = JArea - EArea;
					}
					preferenceValue = Math.abs(d1 - d2);
					if (bestPreference < preferenceValue || preferenceValue == 0) {
						bestPreference = preferenceValue;
						bestEntry = M[i];
						bestEntryIndex = i;
					}
				}
				//Put the higher preferenced value entry to the rectangular parallelepiped which is least enlarged
				if (d1 < d2) {
					groupA.push(bestEntry);
					groupAArea = groupEnlargement(bestEntry, variableAreaA);
					M.splice(bestEntryIndex, 1);
				}
				else if (d1 > d2) {
					groupB.push(bestEntry);
					groupBArea = groupEnlargement(bestEntry, variableAreaB);
					M.splice(bestEntryIndex, 1);
				}
				//In case both groups have been equally enlarged, then add to the group with the smaller area
				else {
					var groupAArea = ((((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
									  (((variableAreaA.yMax - variableAreaA.yMin) * (variableAreaA.zMax - variableAreaA.zMin)) * 2) + 
									  (((variableAreaA.xMax - variableAreaA.xMin) * (variableAreaA.yMax - variableAreaA.yMin)) * 2));
					var groupBArea = ((((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
									  (((variableAreaB.yMax - variableAreaB.yMin) * (variableAreaB.zMax - variableAreaB.zMin)) * 2) + 
									  (((variableAreaB.xMax - variableAreaB.xMin) * (variableAreaB.yMax - variableAreaB.yMin)) * 2));
					if (groupAArea < groupBArea) {
						groupA.push(bestEntry);
						groupAArea = groupEnlargement(bestEntry, variableAreaA);
						M.splice(bestEntryIndex, 1);
					}
					else if (groupAArea > groupBArea) {
						groupB.push(bestEntry);
						groupBArea = groupEnlargement(bestEntry, variableAreaB);
						M.splice(bestEntryIndex, 1);
					}
					//In case both groups have been equally enlarged and both areas have the same size, then add to the group with the fewer entries
					else {
						if (groupA.length < groupB.length) {
							groupA.push(bestEntry);
							groupAArea = groupEnlargement(bestEntry, variableAreaA);
							M.splice(bestEntryIndex, 1);
						}
						else if (groupA.length > groupB.length) {
							groupB.push(bestEntry);
							groupBArea = groupEnlargement(bestEntry, variableAreaB);
							M.splice(bestEntryIndex, 1);
						}
						//In case both groups have been equally enlarged, their areas have the same size and their entries number is the same, then add new entry to either group
						else {
							if ((Math.floor(Math.random() * 2) + 1) == 1) {
								groupA.push(bestEntry);
								groupAArea = groupEnlargement(bestEntry, variableAreaA);
								M.splice(bestEntryIndex, 1);
							}
							else {
								groupB.push(bestEntry);
								groupBArea = groupEnlargement(bestEntry, variableAreaB);
								M.splice(bestEntryIndex, 1);
							}
						}
					}
				}
			}
		}
		for (var i in groupA) {
			P.children.push(groupA[i]);
			groupA[i].setParentNode(P);
		}
		calculateNodeMBR(P);
		
		var PP = new Node(variableAreaB.xMax, variableAreaB.yMax, variableAreaB.zMax, variableAreaB.xMin, variableAreaB.yMin, variableAreaB.zMin, rectNumber);
		for (var i in groupB) {
			PP.children.push(groupB[i]);
			groupB[i].setParentNode(PP);
		}
		calculateNodeMBR(PP);
		return [P, PP];
	}
	
	//Adjust the nodes that have their MBR modified by the insertion of the new entry
	function AdjustTree(N, NN) {
		var countAdjustTimes = 0;
		while (N != T) {
			countAdjustTimes++
			var P = N.getParentNode();
			for (var i in P.children) {
				if (P.children[i] == N) {
					var EN = P.children[i];
					EN.xMax = N.xMax;
					EN.yMax = N.yMax;
					EN.zMax = N.zMax;
					EN.xMin = N.xMin;
					EN.yMin = N.yMin;
					EN.zMin = N.zMin;
					calculateNodeMBR(P);
				}
			}
			//In case node 'N' was previously split, then propagate changes for node 'NN' too
			if ((NN != undefined) && (NN.getParentNode() == null)) {
				if (P.children.length < MaxEntries) {
					P.children.push(NN);
					NN.setParentNode(P);	
					calculateNodeMBR(P);
				}
				else {
					//Initiate 'SplitInternalNode' to split parent node 'P' and create the necessary space for 'NN' node
					var splitParent = SplitInternalNode(P, NN);
					P = splitParent[0];
					PP = splitParent[1];
					NN = PP;
				}
			}
			else {
				console.log("No NN node found, or NN node has been successfully assigned to a parent node!");
				//calculateNodeMBR(P);
			}
			N = P;
		}
		//In case R-tree's root was split, then create a new root containing 'N' and 'NN'
		if ((N == T) && (NN != undefined) && (NN.getParentNode() == null)) {
			counter--;
			var oldRoot = new Node(N.xMax, N.yMax, N.zMax, N.xMin, N.yMin, N.zMin, N.nodeID);
			if (N.children.length != 0) {
				for (var i in N.children) {
					oldRoot.children.push(N.children[i]);
					N.children[i].setParentNode(oldRoot);
				}
			}
			else {
				for (var i in N.entries) {
					oldRoot.entries.push(N.entries[i]);
				}
			}
			T = new Node(0, 0, 0, 0, 0, 0, rectNumber);
			T.children.push(oldRoot);
			oldRoot.setParentNode(T);
			T.children.push(NN);
			NN.setParentNode(T);
			calculateNodeMBR(T);
		}
	}
	
	//The general structure of a R-tree's node
	function Node(xMax, yMax, zMax, xMin, yMin, zMin, nodeID) {
		counter++;
		rectNumber = "R" + counter;
		this.xMax = xMax;
		this.yMax = yMax;
		this.zMax = zMax;
		this.xMin = xMin;
		this.yMin = yMin;
		this.zMin = zMin;
		this.nodeID = nodeID;
		//An array of 'children' points to nodes, denoting that this node is an internal or root node
		this.children = [];
		//An array of 'entries' points to spatial objects, denoting that this node is a leaf node
		this.entries = [];
		this.parent = null;
		
		this.setParentNode = function(Node) {
			this.parent = Node;
		}
		
		this.getParentNode = function() {
			return this.parent;
		}
	}
	
}

//Retrieve and store the MBR coordinates of a spatial object through its bounding box information
function SpatialObject(X3DOMNode) {
	this.SpatialObject = X3DOMNode;
	var bboxVolume = this.SpatialObject.getVolume();
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

//Find the smallest object of an Array based on its properties values and return its index position
function findMin(anArray) {
	var m = Infinity;
	var cacheArea = 0;
	for (var i in anArray) {
		if (anArray[i].enlargedArea < m) {
			m = anArray[i].enlargedArea;
			cacheArea = anArray[i].originalArea;
		}
		else if (anArray[i].enlargedArea == m) {
			if (anArray[i].originalArea < cacheArea) {
				m = anArray[i].enlargedArea;
				cacheArea = anArray[i].originalArea;
			}
		}
	}
	//It emulates an 'indexOf' method for array objects using the 'map' function
	return anArray.map(function(e) { return e.enlargedArea; }).indexOf(m);
}

//Calculate the MBR of a node based on its children coordinates
function calculateNodeMBR(Node) {
	var childrenMBR = [];
	var xMaxTemp = -Infinity;
	var yMaxTemp = -Infinity;
	var zMaxTemp = -Infinity;
	var xMinTemp = Infinity;
	var yMinTemp = Infinity;
	var zMinTemp = Infinity;
	
	for (var i in Node.children) {
		xMax = Node.children[i].xMax;
		yMax = Node.children[i].yMax;
		zMax = Node.children[i].zMax;
		xMin = Node.children[i].xMin;
		yMin = Node.children[i].yMin;
		zMin = Node.children[i].zMin;
		childrenMBR.push({xMax:xMax, yMax:yMax, zMax:zMax, xMin:xMin, yMin:yMin, zMin:zMin});
	}
	
	for (var k in childrenMBR) {
		console.log(childrenMBR[k]);
		if (childrenMBR[k].xMax > xMaxTemp) {
			xMaxTemp = childrenMBR[k].xMax;
		}
		if (childrenMBR[k].yMax > yMaxTemp) {
			yMaxTemp = childrenMBR[k].yMax;
		}
		if (childrenMBR[k].zMax > zMaxTemp) {
			zMaxTemp = childrenMBR[k].zMax;
		}
		if (childrenMBR[k].xMin < xMinTemp) {
			xMinTemp = childrenMBR[k].xMin;
		}
		if (childrenMBR[k].yMin < yMinTemp) {
			yMinTemp = childrenMBR[k].yMin;
		}
		if (childrenMBR[k].zMin < zMinTemp) {
			zMinTemp = childrenMBR[k].zMin;
		}
	}
	Node.xMax = xMaxTemp;
	Node.yMax = yMaxTemp;
	Node.zMax = zMaxTemp;
	Node.xMin = xMinTemp;
	Node.yMin = yMinTemp;
	Node.zMin = zMinTemp;
}

//Calculate the MBR of a leaf node based on its entries coordinates
function calculateLeafNodeMBR(Node) {
	var entriesMBR = [];
	var xMaxTemp = -Infinity;
	var yMaxTemp = -Infinity;
	var zMaxTemp = -Infinity;
	var xMinTemp = Infinity;
	var yMinTemp = Infinity;
	var zMinTemp = Infinity;
	
	for (var i in Node.entries) {
		xMax = Node.entries[i].xMax;
		yMax = Node.entries[i].yMax;
		zMax = Node.entries[i].zMax;
		xMin = Node.entries[i].xMin;
		yMin = Node.entries[i].yMin;
		zMin = Node.entries[i].zMin;
		entriesMBR.push({xMax:xMax, yMax:yMax, zMax:zMax, xMin:xMin, yMin:yMin, zMin:zMin});
	}
	
	for (var k in entriesMBR) {
		if (entriesMBR[k].xMax > xMaxTemp) {
			xMaxTemp = entriesMBR[k].xMax;
		}
		if (entriesMBR[k].yMax > yMaxTemp) {
			yMaxTemp = entriesMBR[k].yMax;
		}
		if (entriesMBR[k].zMax > zMaxTemp) {
			zMaxTemp = entriesMBR[k].zMax;
		}
		if (entriesMBR[k].xMin < xMinTemp) {
			xMinTemp = entriesMBR[k].xMin;
		}
		if (entriesMBR[k].yMin < yMinTemp) {
			yMinTemp = entriesMBR[k].yMin;
		}
		if (entriesMBR[k].zMin < zMinTemp) {
			zMinTemp = entriesMBR[k].zMin;
		}
	}
	Node.xMax = xMaxTemp;
	Node.yMax = yMaxTemp;
	Node.zMax = zMaxTemp;
	Node.xMin = xMinTemp;
	Node.yMin = yMinTemp;
	Node.zMin = zMinTemp;
}

//Calculate the area enlargement between entry 'E' and group 'G'
function groupEnlargement(E, G) {
	G.xMax = Math.max(E.xMax, G.xMax);
	G.xMin = Math.min(E.xMin, G.xMin);
	G.xMBR = G.xMax - G.xMin;
	G.yMax = Math.max(E.yMax, G.yMax);
	G.yMin = Math.min(E.yMin, G.yMin);
	G.yMBR = G.yMax - G.yMin;
	G.zMax = Math.max(E.zMax, G.zMax);
	G.zMin = Math.min(E.zMin, G.zMin);
	G.zMBR = G.zMax - G.zMin;
	groupArea = (((G.xMBR * G.zMBR) * 2) + ((G.yMBR * G.zMBR) * 2) + ((G.xMBR * G.yMBR) * 2));
	return groupArea;
}

//Clone a JavaScript object
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
	if (obj instanceof Object) {
		//Avoid Object's constructor since it sometimes throws exception of 'Uncaught TypeError: Cannot set property ... of undefined'
		//var copy = obj.constructor();
		//Instead make use of the equivalent Object literal {}
		var copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}
}

//Display the generated R-tree in the form of X3D elements for presentation and debugging purposes
function displayRectParallelepipeds() {
	//Traverse R-tree using Depth-First Search recursion
	//drawMBR(rt.xMax, rt.yMax, rt.zMax, rt.xMin, rt.yMin, rt.zMin, rt.nodeID, 'black');
	iterate(rt, 0);
	function iterate(currentNode, treeDepth) {
		var childrenNodes = currentNode.children;
		var indexRecords = currentNode.entries;
		if (childrenNodes.length == 0) {
			for (var i in indexRecords) {
				drawMBR(indexRecords[i].xMax, indexRecords[i].yMax, indexRecords[i].zMax, indexRecords[i].xMin, indexRecords[i].yMin, indexRecords[i].zMin, indexRecords[i].id, 'green');
			}
		}
		else {
			for (var i in childrenNodes) {
				drawMBR(childrenNodes[i].xMax, childrenNodes[i].yMax, childrenNodes[i].zMax, childrenNodes[i].xMin, childrenNodes[i].yMin, childrenNodes[i].zMin, childrenNodes[i].nodeID, 'red');
				iterate(childrenNodes[i], treeDepth + 1);
			}
		}
	}
	//After entire tree is drawn, then take advantage of the X3DOM Runtime API to show all objects (same functionality as 'e.runtime.showAll('negZ')')
	var e = document.getElementsByTagName('X3D')[0];
	e.runtime.showAll();
	document.getElementById("drawRtree").disabled = true;
}

//Draw the MBR of a R-tree's node, represented as an IndexedLineSet element of the X3DOM scene
function drawMBR(xMax, yMax, zMax, xMin, yMin, zMin, nodeID, color) {
	var MBRTransform = document.createElement('Transform');
	var MBRShape = document.createElement('Shape');
	var MBROutline = document.createElement('IndexedLineSet');
	var MBRCoords = document.createElement('Coordinate');
	var MBRColor = document.createElement('Color');
	MBRTransform.setAttribute('DEF', nodeID);
	MBRTransform.appendChild(MBRShape);
	MBRShape.appendChild(MBROutline);
	MBROutline.setAttribute('coordIndex', '0 1 -1 1 2 -1 2 3 -1 3 0 -1 4 5 -1 5 6 -1 6 7 -1 7 4 -1 0 6 -1 1 7 -1 2 4 -1 3 5 -1');
	MBROutline.appendChild(MBRCoords);
	MBRCoords.setAttribute('point', xMin + " " + yMin + " " + zMax + " " + xMax + " " + yMin + " " + zMax + " " + xMax + " " + yMax + " " + zMax + 
							  " " + xMin + " " + yMax + " " + zMax + " " + xMax + " " + yMax + " " + zMin + " " + xMin + " " + yMax + " " + zMin + 
							  " " + xMin + " " + yMin + " " + zMin + " " + xMax + " " + yMin + " " + zMin);
	MBROutline.appendChild(MBRColor);
	//Green-colored lines for spatial objects' MBR
	if (color == 'green') {
		MBRColor.setAttribute('color', '0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0');
	}
	//Red-colored lines for internal or leaf nodes' MBR
	else if (color == 'red') {
		MBRColor.setAttribute('color', '1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0');
	}
	//Black-colored line for root node's MBR
	else if (color == 'black') {
		MBRColor.setAttribute('color', '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0');
	}
	//Blue-colored lines are clearly for debug purposes and they must NEVER be displayed into the scene
	else {
		MBRColor.setAttribute('color', '0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1 0 0 1');
	}
	//When the spatial object's MBR has the same coordinates with its parent-leaf node, red-colored MBRs are not being displayed
	//since they are overlapped by the green-colored ones, which are drawn last in the presented scene
	var X3DScene = document.getElementsByTagName('Scene')[0];
	X3DScene.appendChild(MBRTransform);
}

//Do NOT USE IT - A level by level traversal of the generated MBRs results to much higher complexity and computation power costs
//Traverse the R-tree instance and check for spatial relations between MBRs
/*
function traverseForRelations(treeRoot, treeLevel) {
	var M = [];
	var removedElem;
	M.push(treeRoot);
	while (M.length != 0) {
		treeLevel++;
		currLength = M.length;
		for (var i = 0; i < currLength; i++) {
			removedElem = M.shift();
			if (removedElem.children != 0) {
				for (var k = 0; k < removedElem.children.length; k++) {
					M.push(removedElem.children[k]);
				}
			}
		}
		for (var i = 0; i < M.length; i++) {
			for (var k = i; k < M.length; k++) {
				if (M[i].nodeID != M[k].nodeID) {
					//Obsolete!
					spatialRelations(M[i], M[k]);
				}
			}
		}
	}
}
*/

//Check which topological and directional relations are satisfied in a given R-tree instance
function spatialRelations() {
	//Arrays holding the spatially correlated objects
	var relationsArray = [];
	iterateChildren(rt, relationsArray);
	for (var i = 0; i < relationsArray.length; i++) {
		//Pairwise and identical objects are skipped and are not calculated, by setting 'j = i+1' for each consecutive loop
		for (var j = i+1; j < relationsArray.length; j++) {
			//An indexed object is 'disjoint' to another indexed object (type of 'touch' relation is also included into this category)
			if ((relationsArray[i].xMax <= relationsArray[j].xMin || relationsArray[i].xMin >= relationsArray[j].xMax) || 
				(relationsArray[i].yMax <= relationsArray[j].yMin || relationsArray[i].yMin >= relationsArray[j].yMax) || 
				(relationsArray[i].zMax <= relationsArray[j].zMin || relationsArray[i].zMin >= relationsArray[j].zMax)) {
					//console.log(relationsArray[i].id + " and " + relationsArray[j].id + " are disjoint!");
					document.getElementById("spatialResults").value += relationsArray[i].id + " and " + relationsArray[j].id + " are disjoint!" + "\n";
					//An indexed object is on the 'left' side of another indexed object
					if (relationsArray[i].xMax <= relationsArray[j].xMin) {
						//console.log(relationsArray[i].id + " is on the left side of " + relationsArray[j].id);
						//console.log(relationsArray[j].id + " is on the right side of " + relationsArray[i].id);
						document.getElementById("spatialResults").value += relationsArray[i].id + " is on the left side of " + relationsArray[j].id + "\n";
						document.getElementById("spatialResults").value += relationsArray[j].id + " is on the right side of " + relationsArray[i].id + "\n";
					
					}
					//An indexed object is on the 'right' side of another indexed object
					else if (relationsArray[i].xMin >= relationsArray[j].xMax) {
						//console.log(relationsArray[i].id + " is on the right side of " + relationsArray[j].id);
						//console.log(relationsArray[j].id + " is on the left side of " + relationsArray[i].id);
						document.getElementById("spatialResults").value += relationsArray[i].id + " is on the right side of " + relationsArray[j].id + "\n";
						document.getElementById("spatialResults").value += relationsArray[j].id + " is on the left side of " + relationsArray[i].id + "\n";
					}
					//An indexed object is in 'front' of another indexed object
					if (relationsArray[i].zMin >= relationsArray[j].zMax) {
						//console.log(relationsArray[i].id + " is in front of " + relationsArray[j].id);
						//console.log(relationsArray[j].id + " is behind " + relationsArray[i].id);
						document.getElementById("spatialResults").value += relationsArray[i].id + " is in front of " + relationsArray[j].id + "\n";
						document.getElementById("spatialResults").value += relationsArray[j].id + " is behind " + relationsArray[i].id + "\n";
					
					}
					//An indexed object is 'behind' of another indexed object
					else if (relationsArray[i].zMax <= relationsArray[j].zMin) {
						//console.log(relationsArray[i].id + " is behind " + relationsArray[j].id);
						//console.log(relationsArray[j].id + " is in front of " + relationsArray[i].id);
						document.getElementById("spatialResults").value += relationsArray[i].id + " is behind " + relationsArray[j].id + "\n";
						document.getElementById("spatialResults").value += relationsArray[j].id + " is in front of " + relationsArray[i].id + "\n";
					}
					//An indexed object is 'below' another indexed object
					if (relationsArray[i].yMax < relationsArray[j].yMin) {
						//console.log(relationsArray[i].id + " is below " + relationsArray[j].id);
						//console.log(relationsArray[j].id + " is above " + relationsArray[i].id);
						document.getElementById("spatialResults").value += relationsArray[i].id + " is below " + relationsArray[j].id + "\n";
						document.getElementById("spatialResults").value += relationsArray[j].id + " is above " + relationsArray[i].id + "\n";
					}
					//An indexed is 'above' another indexed object
					else if (relationsArray[i].yMin > relationsArray[j].yMax) {
						//console.log(relationsArray[i].id + " is above " + relationsArray[j].id);
						//console.log(relationsArray[j].id + " is below " + relationsArray[i].id);
						document.getElementById("spatialResults").value += relationsArray[i].id + " is above " + relationsArray[j].id + "\n";
						document.getElementById("spatialResults").value += relationsArray[j].id + " is below " + relationsArray[i].id + "\n";
					}
					//An indexed object is 'over' another indexed object
					if (relationsArray[i].yMin == relationsArray[j].yMax) {
						if ((!((relationsArray[i].xMax <= relationsArray[j].xMin) || (relationsArray[i].xMin >= relationsArray[j].xMax))) && 
							(!((relationsArray[i].zMax <= relationsArray[j].zMin) || (relationsArray[i].zMin >= relationsArray[j].zMax)))) {
								//console.log(relationsArray[i].id + " is over " + relationsArray[j].id);
								//console.log(relationsArray[j].id + " is below " + relationsArray[i].id);
								document.getElementById("spatialResults").value += relationsArray[i].id + " is over " + relationsArray[j].id + "\n";
								document.getElementById("spatialResults").value += relationsArray[j].id + " is below " + relationsArray[i].id + "\n";
						}
						else {
							//console.log(relationsArray[i].id + " is above " + relationsArray[j].id);
							//console.log(relationsArray[j].id + " is below " + relationsArray[i].id);
							document.getElementById("spatialResults").value += relationsArray[i].id + " is above " + relationsArray[j].id + "\n";
							document.getElementById("spatialResults").value += relationsArray[j].id + " is below " + relationsArray[i].id + "\n";
						}
					}
					//An indexed object is 'over' another indexed object (contradictory MBRs)
					else if (relationsArray[i].yMax == relationsArray[j].yMin) {
						if ((!((relationsArray[i].xMax <= relationsArray[j].xMin) || (relationsArray[i].xMin >= relationsArray[j].xMax))) && 
							(!((relationsArray[i].zMax <= relationsArray[j].zMin) || (relationsArray[i].zMin >= relationsArray[j].zMax)))) {
								//console.log(relationsArray[i].id + " is below " + relationsArray[j].id);
								//console.log(relationsArray[j].id + " is over " + relationsArray[i].id);
								document.getElementById("spatialResults").value += relationsArray[i].id + " is below " + relationsArray[j].id + "\n";
								document.getElementById("spatialResults").value += relationsArray[j].id + " is over " + relationsArray[i].id + "\n";
						}
						else {
							//console.log(relationsArray[i].id + " is below " + relationsArray[j].id);
							//console.log(relationsArray[j].id + " is above " + relationsArray[i].id);
							document.getElementById("spatialResults").value += relationsArray[i].id + " is below " + relationsArray[j].id + "\n";
							document.getElementById("spatialResults").value += relationsArray[j].id + " is above " + relationsArray[i].id + "\n";
						}
					}
			}
			//An indexed object is 'equal' to another indexed object (evenly arranged)
			else if ((relationsArray[i].xMin == relationsArray[j].xMin && relationsArray[i].xMax == relationsArray[j].xMax) && (relationsArray[i].yMin == relationsArray[j].yMin && relationsArray[i].yMax == relationsArray[j].yMax) && (relationsArray[i].zMin == relationsArray[j].zMin && relationsArray[i].zMax == relationsArray[j].zMax)) {
				//console.log(relationsArray[i].id + " and " + relationsArray[j].id + " are equal!");
				document.getElementById("spatialResults").value += relationsArray[i].id + " and " + relationsArray[j].id + " are equal!" + "\n";
			}
			//An indexed object is 'within' another indexed object
			else if ((relationsArray[i].xMin >= relationsArray[j].xMin && relationsArray[i].xMax <= relationsArray[j].xMax) && (relationsArray[i].yMin >= relationsArray[j].yMin && relationsArray[i].yMax <= relationsArray[j].yMax) && (relationsArray[i].zMin >= relationsArray[j].zMin && relationsArray[i].zMax <= relationsArray[j].zMax)) {
				//console.log(relationsArray[i].id + " is within " + relationsArray[j].id + "!");
				//console.log(relationsArray[j].id + " contains " + relationsArray[i].id + "!");
				document.getElementById("spatialResults").value += relationsArray[i].id + " is within " + relationsArray[j].id + "!" + "\n";
				document.getElementById("spatialResults").value += relationsArray[j].id + " contains " + relationsArray[i].id + "!" + "\n";
			
			}
			//An indexed object 'contains' another indexed object
			else if ((relationsArray[i].xMin <= relationsArray[j].xMin && relationsArray[i].xMax >= relationsArray[j].xMax) && (relationsArray[i].yMin <= relationsArray[j].yMin && relationsArray[i].yMax >= relationsArray[j].yMax) && (relationsArray[i].zMin <= relationsArray[j].zMin && relationsArray[i].zMax >= relationsArray[j].zMax)) {
				//console.log(relationsArray[i].id + " contains " + relationsArray[j].id + "!");
				//console.log(relationsArray[j].id + " is within " + relationsArray[i].id + "!");
				document.getElementById("spatialResults").value += relationsArray[i].id + " contains " + relationsArray[j].id + "!" + "\n";
				document.getElementById("spatialResults").value += relationsArray[j].id + " is within " + relationsArray[i].id + "!" + "\n";
			
			}
			//An indexed object 'overlaps' another indexed object
			else if ((relationsArray[i].xMin < relationsArray[j].xMax && relationsArray[i].xMax > relationsArray[j].xMin) && 
					(relationsArray[i].yMin < relationsArray[j].yMax && relationsArray[i].yMax > relationsArray[j].yMin) &&
					(relationsArray[i].zMin < relationsArray[j].zMax && relationsArray[i].zMax > relationsArray[j].zMin)) {
						//console.log(relationsArray[i].id + " and " + relationsArray[j].id + " overlap each other!");
						document.getElementById("spatialResults").value += relationsArray[i].id + " and " + relationsArray[j].id + " overlap each other!" + "\n";
			
			}
			else {
				console.log(relationsArray[i].id + " and " + relationsArray[j].id + " do not satisfy any topological relation!");
			}
		}
	}
}

//Iterate a node's MBR hierarchy top-down, in order to discover its encased spatial objects
function iterateChildren(Node, relationsArray) {
	if (Node.children.length != 0) {
		for (var i in Node.children) {
			iterateChildren(Node.children[i], relationsArray);
		}
	}
	else {
		for (var i in Node.entries) {
			relationsArray.push(Node.entries[i]);
		}
	}
}

