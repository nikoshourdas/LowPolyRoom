//Array holding the implicated spatial relations
var implicatedRelations = [];

self.addEventListener('message', function(e) {
	var relationsArray = JSON.parse(e.data);
	
	for (var i = 0; i < relationsArray.length; i++) {
		//Pairwise and identical objects are skipped and are not calculated, by setting 'j = i+1' for each consecutive loop
		for (var j = i+1; j < relationsArray.length; j++) {
			/*
			if (implicatedRelations.length >= 5000) {
				self.postMessage(JSON.stringify(implicatedRelations));
				implicatedRelations = [];
			}
			*/
			//An indexed object is 'disjoint' to another indexed object (type of 'touch' relation is also included into this category)
			if ((relationsArray[i].xMax <= relationsArray[j].xMin || relationsArray[i].xMin >= relationsArray[j].xMax) || 
				(relationsArray[i].yMax <= relationsArray[j].yMin || relationsArray[i].yMin >= relationsArray[j].yMax) || 
				(relationsArray[i].zMax <= relationsArray[j].zMin || relationsArray[i].zMin >= relationsArray[j].zMax)) {
					implicatedRelations.push(relationsArray[i].id + " and " + relationsArray[j].id + " are disjoint!" + "\n");
					//An indexed object is on the 'left' side of another indexed object
					if (relationsArray[i].xMax <= relationsArray[j].xMin) {
						implicatedRelations.push(relationsArray[i].id + " is on the left side of " + relationsArray[j].id + "\n");
						implicatedRelations.push(relationsArray[j].id + " is on the right side of " + relationsArray[i].id + "\n");
					}
					//An indexed object is on the 'right' side of another indexed object
					else if (relationsArray[i].xMin >= relationsArray[j].xMax) {
						implicatedRelations.push(relationsArray[i].id + " is on the right side of " + relationsArray[j].id + "\n");
						implicatedRelations.push(relationsArray[j].id + " is on the left side of " + relationsArray[i].id + "\n");
					}
					//An indexed object is in 'front' of another indexed object
					if (relationsArray[i].zMin >= relationsArray[j].zMax) {
						implicatedRelations.push(relationsArray[i].id + " is in front of " + relationsArray[j].id + "\n");
						implicatedRelations.push(relationsArray[j].id + " is behind " + relationsArray[i].id + "\n");
					}
					//An indexed object is 'behind' of another indexed object
					else if (relationsArray[i].zMax <= relationsArray[j].zMin) {
						implicatedRelations.push(relationsArray[i].id + " is behind " + relationsArray[j].id + "\n");
						implicatedRelations.push(relationsArray[j].id + " is in front of " + relationsArray[i].id + "\n");
					}
					//An indexed object is 'below' another indexed object
					if (relationsArray[i].yMax < relationsArray[j].yMin) {
						implicatedRelations.push(relationsArray[i].id + " is below " + relationsArray[j].id + "\n");
						implicatedRelations.push(relationsArray[j].id + " is above " + relationsArray[i].id + "\n");
					}
					//An indexed is 'above' another indexed object
					else if (relationsArray[i].yMin > relationsArray[j].yMax) {
						implicatedRelations.push(relationsArray[i].id + " is above " + relationsArray[j].id + "\n");
						implicatedRelations.push(relationsArray[j].id + " is below " + relationsArray[i].id + "\n");
					}
					//An indexed object is 'over' another indexed object
					if (relationsArray[i].yMin == relationsArray[j].yMax) {
						if ((!((relationsArray[i].xMax <= relationsArray[j].xMin) || (relationsArray[i].xMin >= relationsArray[j].xMax))) && 
							(!((relationsArray[i].zMax <= relationsArray[j].zMin) || (relationsArray[i].zMin >= relationsArray[j].zMax)))) {
								implicatedRelations.push(relationsArray[i].id + " is over " + relationsArray[j].id + "\n");
								implicatedRelations.push(relationsArray[j].id + " is below " + relationsArray[i].id + "\n");
						}
						else {
							implicatedRelations.push(relationsArray[i].id + " is above " + relationsArray[j].id + "\n");
							implicatedRelations.push(relationsArray[j].id + " is below " + relationsArray[i].id + "\n");
						}
					}
					//An indexed object is 'over' another indexed object (contradictory MBRs)
					else if (relationsArray[i].yMax == relationsArray[j].yMin) {
						if ((!((relationsArray[i].xMax <= relationsArray[j].xMin) || (relationsArray[i].xMin >= relationsArray[j].xMax))) && 
							(!((relationsArray[i].zMax <= relationsArray[j].zMin) || (relationsArray[i].zMin >= relationsArray[j].zMax)))) {
								implicatedRelations.push(relationsArray[i].id + " is below " + relationsArray[j].id + "\n");
								implicatedRelations.push(relationsArray[j].id + " is over " + relationsArray[i].id + "\n");
						}
						else {
							implicatedRelations.push(relationsArray[i].id + " is below " + relationsArray[j].id + "\n");
							implicatedRelations.push(relationsArray[j].id + " is above " + relationsArray[i].id + "\n");
						}
					}
			}
			//An indexed object is 'equal' to another indexed object (evenly arranged)
			else if ((relationsArray[i].xMin == relationsArray[j].xMin && relationsArray[i].xMax == relationsArray[j].xMax) && (relationsArray[i].yMin == relationsArray[j].yMin && relationsArray[i].yMax == relationsArray[j].yMax) && (relationsArray[i].zMin == relationsArray[j].zMin && relationsArray[i].zMax == relationsArray[j].zMax)) {
				implicatedRelations.push(relationsArray[i].id + " and " + relationsArray[j].id + " are equal!" + "\n");
				}
			//An indexed object is 'within' another indexed object
			else if ((relationsArray[i].xMin >= relationsArray[j].xMin && relationsArray[i].xMax <= relationsArray[j].xMax) && (relationsArray[i].yMin >= relationsArray[j].yMin && relationsArray[i].yMax <= relationsArray[j].yMax) && (relationsArray[i].zMin >= relationsArray[j].zMin && relationsArray[i].zMax <= relationsArray[j].zMax)) {
				implicatedRelations.push(relationsArray[i].id + " is within " + relationsArray[j].id + "!" + "\n");
				implicatedRelations.push(relationsArray[j].id + " contains " + relationsArray[i].id + "!" + "\n");
			}
			//An indexed object 'contains' another indexed object
			else if ((relationsArray[i].xMin <= relationsArray[j].xMin && relationsArray[i].xMax >= relationsArray[j].xMax) && (relationsArray[i].yMin <= relationsArray[j].yMin && relationsArray[i].yMax >= relationsArray[j].yMax) && (relationsArray[i].zMin <= relationsArray[j].zMin && relationsArray[i].zMax >= relationsArray[j].zMax)) {
				implicatedRelations.push(relationsArray[i].id + " contains " + relationsArray[j].id + "!" + "\n");
				implicatedRelations.push(relationsArray[j].id + " is within " + relationsArray[i].id + "!" + "\n");
			}
			//An indexed object 'overlaps' another indexed object
			else if ((relationsArray[i].xMin < relationsArray[j].xMax && relationsArray[i].xMax > relationsArray[j].xMin) && 
					(relationsArray[i].yMin < relationsArray[j].yMax && relationsArray[i].yMax > relationsArray[j].yMin) &&
					(relationsArray[i].zMin < relationsArray[j].zMax && relationsArray[i].zMax > relationsArray[j].zMin)) {
						implicatedRelations.push(relationsArray[i].id + " and " + relationsArray[j].id + " overlap each other!" + "\n");
			}
		}
	}
	
	self.postMessage(JSON.stringify(implicatedRelations));
}, false);





