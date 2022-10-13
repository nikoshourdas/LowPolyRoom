
//<![CDATA[
var X3DRoot, pointCoordinates, kNNx, kNNy, kNNz, kNNmean;
var rangeQuery = false;

var startTime = performance.now();

var label_armchair = "NUll";
var label_table = "NUll";
var label_sofa = "NUll";
var label_cup = "NUll";
var label_cup = "NUll";

//neuralNetwork------------------------------------------------------------------------------------------------------
function neuralnet2(){
//coords----------------------------------------------------
let iop2=0;
for (var iop = 0; iop <10; iop++){
    if (iop==4){
        iop2=iop;
    }
    else if(iop==9){
        iop2=iop;
    }
    else{
        continue
    }
    let list01 = document.getElementsByTagName("Coordinate")[iop2].attributes.point;
    let list02=list01.value.split(" ")
    let list0=[]
    for (var i = 0; i < list02.length; i += 1){
        list0.push(parseFloat(list02[i]))
    }
    //-----------------------------------------------
    if (iop2<3){
        function normalize_array(arr) {
        
            normalize = function(val, max, min) { 
                let re=(val - min) / (max - min);
                re=2*re-1;
                return re; 
            }
        
            max = Math.max.apply(null, arr);
            min = Math.min.apply(null, arr);  
        
            hold_normed_values=[]
            arr.forEach(function(this_num) {
                hold_normed_values.push(normalize(this_num, max, min));
            })
        
            return(hold_normed_values)
        
        }
        let v=normalize_array(list0)
        
        list0=v;
    }
    //preprocessing ---------------------------------------------------
    const nuevo = list0.map((i) => Number(i));
    // Create one dimensional array
    var list1 = new Array(3);
                                        
    // Loop to create 2D array using 1D array
    for (var i = 0; i < nuevo.length; i++) {
        list1[i] = [];
    }
            
    var h = 0;
    // Loop to initialize 2D array elements.
    for (var i = 0; i <  nuevo.length; i++) {
        for (var j = 0; j < 3; j++) {
            list1[i][j] = nuevo[h];
            h=h+1
        }
    }
    let list5=list1;
                    
        //------------------------------------------------------------------
        let numb0=list01.length/4;
        let maxx,maxy,maxz, minx,miny,minz,numb2=0;
        let llist=list0, numb3=list0.length;

        for (var i1 = 0; i1 < numb0; i1++) {
            maxx=Math.max(list3[list5[i1][0]][0], list3[list5[i1][1]][0], list3[list5[i1][2]][0])
            maxy=Math.max(list3[list5[i1][0]][1], list3[list5[i1][1]][1], list3[list5[i1][2]][1])
            maxz=Math.max(list3[list5[i1][0]][2], list3[list5[i1][1]][2], list3[list5[i1][2]][2])
            minx=Math.min(list3[list5[i1][0]][0], list3[list5[i1][1]][0], list3[list5[i1][2]][0])
            miny=Math.min(list3[list5[i1][0]][1], list3[list5[i1][1]][1], list3[list5[i1][2]][1])
            minz=Math.min(list3[list5[i1][0]][2], list3[list5[i1][1]][2], list3[list5[i1][2]][2])
            
            area1=(list3[list5[i1][0]][0]) 
            area2=(list3[list5[i1][1]][1]) - (list3[list5[i1][2]][1])
            area3=area1*area2;
            area1=(list3[list5[i1][1]][0]) 
            area2=(list3[list5[i1][2]][1]) - (list3[list5[i1][0]][1])
            area3=area3+(area1*area2);
            area1=(list3[list5[i1][2]][0]) 
            area2=(list3[list5[i1][0]][1]) - (list3[list5[i1][1]][1])
            area3=0.5*(area3+area1*area2);
            if(area3<0){
                numb2=10;
            }
            else{
                numb2=20;
            }

            for(var i2=0; i2 < numb2; i2++ ){
                llist[numb3]=(Math.random() * (maxx - minx) + minx);
                numb3=numb3+1;
                llist[numb3]=(Math.random() * (maxy - miny) + miny);
                numb3=numb3+1;
                llist[numb3]=(Math.random() * (maxz - minz) + minz );
                numb3=numb3+1;
            }
        }
        //-------------------------------------------------------------------------
        // Create one dimensional array
        var tlist = new Array(3);
                    
                    // Loop to create 2D array using 1D array
        for (var i = 0; i <  llist.length; i++) {
            tlist[i] = [];
        }

        h = 0;
                    // Loop to initialize 2D array elements.
        for (var i2 = 0; i2 <   llist.length; i2++) {
            for (var j2 = 0; j2 < 3; j2++) {
                tlist[i2][j2] =  llist[h];
                h=h+1;
            }
        }

        list0=tlist;
    //data to numofpoints----------------------------------------------------------------
    let numofpoints=12000;
    let list2=[]
    if (list0.length>numofpoints){
        while (list0.length>numofpoints){
            let a = Math.floor(Math.random() * (list0.length));
            list0.splice(a,1);
        }
        list2=list0;
    }
    else if (list0.length < numofpoints){//s-----------------------------------------
        list2=list0;
        let numb2=list0.length;
        while (list2.length < numofpoints){
            let a = Math.floor(Math.random() * (list0.length-1));
            let y2=[list0[a][0]+0.09 , list0[a][1]+0.9, list0[a][2]+0.9];
            list2[numb2]=y2;
            numb2=numb2+1;
        }
        if (list2.length > numofpoints){
            while (list2.length > numofpoints){
                let a = Math.floor(Math.random() * (list2.length));
                list2.splice(a,1);
            }
        }
    }
    else{
        list2=list0;

    }
    //model & pred------------------------------------------------------
    async function loadModel(){
        
        const model = await tf.loadLayersModel('model.json');
                                                
        let numb = tf.reshape(list2,[(list2.length/3),3])
        pr = await model.predict(numb.expandDims(0));
        pr = Array.from(pr.argMax(1).dataSync());

        console.log(pr)
        
        if (pr == 0){
            console.log("bed");
            x3dom.canvases[0].x3dElem.children[0].children[7]._x3domNode._DEF = "bed (predicted) " ;
        }
        else if (pr == 1){
            console.log('desk chair');
            x3dom.canvases[0].x3dElem.children[0].children[8]._x3domNode._DEF = "desk chair (predicted)";
        }
        else if (pr == 2){
            console.log('laptop');
            x3dom.canvases[0].x3dElem.children[0].children[9]._x3domNode._DEF = "laptop (predicted)";
        }
        else if (pr == 3){
            console.log('plant');
            x3dom.canvases[0].x3dElem.children[0].children[10]._x3domNode._DEF = "plant (predicted)";
        }
        else if (pr == 4){
            console.log('stand');
            x3dom.canvases[0].x3dElem.children[0].children[12]._x3domNode._DEF = "tv stand (predicted)";
        }
        else{
            console.log('table');
            x3dom.canvases[0].x3dElem.children[0].children[11]._x3domNode._DEF = "desk (predicted)" ;
        }
    }
    loadModel()
}

    var endTime = performance.now()                            ;
    var totaltime = endTime - startTime;
    console.log("Neural Network performance, Time in : "+totaltime + " miliseconds");
}
// neuralnet()
//----------------------s

