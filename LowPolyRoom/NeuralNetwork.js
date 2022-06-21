
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
function neuralnet(){
//coords----------------------------------------------------
    let iop2=0;
    for (var iop = 0; iop <3; iop++){
        if (iop==5){
            continue
        }
        else if (iop>3){
            iop2=iop2;
        }
        else{
            iop2=iop;
        }
        let list01 = document.getElementsByTagName("Coordinate")[iop2].attributes.point;
        let list02=list01.value.split(" ")
        let list0=[]
        for (var i = 0; i < list02.length; i += 1){
            list0.push(parseFloat(list02[i]))
        }
        //-----------------------------------------------
        if (iop==2){
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
        //data to 2048----------------------------------------------------------------
        let list2=[]
        if (list0.length>6144){
            while (list0.length>6144){
                let a = Math.floor(Math.random() * (list0.length));
                list0.splice(a,1);
            }
            list2=list0;
        }
        else if (list0.length<6144){//s-----------------------------------------
            list2=list0;
            let numb2=list0.length;
            while (list2.length<6144){
                let a = Math.floor(Math.random() * (list0.length-1));
                let y2=[list0[a][0]+0.09 , list0[a][1]+0.9, list0[a][2]+0.9];
                list2[numb2]=y2;
                numb2=numb2+1;
            }
            if (list2.length>6144){
                while (list2.length>6144){
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
                console.log("armchair");
                x3dom.canvases[0].x3dElem.children[0].children[3]._x3domNode._DEF = "armchair_NN";
            }
            else if (pr == 1){
                console.log('cup');
                x3dom.canvases[0].x3dElem.children[0].children[6]._x3domNode._DEF = "cup_NN";
                x3dom.canvases[0].x3dElem.children[0].children[7]._x3domNode._DEF = "cup1_NN";
                x3dom.canvases[0].x3dElem.children[0].children[9]._x3domNode._DEF = "cup2_NN";
                x3dom.canvases[0].x3dElem.children[0].children[10]._x3domNode._DEF = "cup3_NN";
                x3dom.canvases[0].x3dElem.children[0].children[11]._x3domNode._DEF = "cup4_NN";
                x3dom.canvases[0].x3dElem.children[0].children[12]._x3domNode._DEF = "cup5_NN";
            }
            else if (pr == 2){
                console.log('sofa');
                x3dom.canvases[0].x3dElem.children[0].children[4]._x3domNode._DEF = "sofa_NN";


            }
            else{
                console.log('table');
                x3dom.canvases[0].x3dElem.children[0].children[5]._x3domNode._DEF = "table_NN";

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

