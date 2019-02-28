const jsbayes = require('jsbayes');
//classe per poter parsare efficacemente una rete bayesiana
export class NetParser{
    constructor(jsonNet){
        console.info("NetParser()");
        this.jsonNet = jsonNet;
        this.logicNet = null;
        this.g = null;
        this.hasErrors = false;
        console.info(jsonNet);
        this.parse(jsonNet);
    }
    
    //find a parent index for a node
    static getParentIndex(parentName, nodes){
        let indexParent = -1;
        for(let k=0;k<nodes.length;k++){
            if(parentName === nodes[k].name)
                indexParent = k;
        }
        return indexParent;
    }
    
    //check for logic order in the thresholds: ascending order is the only admitted, possible reordering
    static ascendingOrder(thresholds){
        for (let i=0;i<thresholds.length-1;i++){
            if(thresholds[i]>thresholds[i+1]){
                console.info("Not ascending order in the thresholds given: ");
                console.info("threshold " + i + " > " + " threshold "+ (i+1));
                console.info(thresholds[i] + " > " + thresholds[i+1]);
                console.info("If you want automatic reordering please go to import bayesian network page and check the options"); //optional
                return false;
            }
        }
        return true;
    }
    
    //return the result of the check: true, the values are the exact number
    static isOk(node){
        return ((node.stati.length === node.soglie.length) && NetParser.ascendingOrder(node.soglie));
        //numero di stati e soglie uguale e poi che le soglie siano in ordine crescente
    }


    controlNameNodes(jsonNet){
        for(let i = 0; i < jsonNet.nodi.length; i++){
            for(let j = 0; j < jsonNet.nodi.length; j++){
                if(j!=i && jsonNet.nodi[i].id===jsonNet.nodi[j].id){
                    console.info("Duplicate id between node n°" + i + " and node n°" + j + " with id="+jsonNet.nodi[j].id);
                    return true;
                }
            }
        }
        return false;
    }


    //adding nodes and relative parents
    parse(jsonNet) {


        
        //new Bayesian Net
        this.g = jsbayes.newGraph();
        
        //init vars
        let i, j;
        let nodes = []; //array di nodi ritornati dalla creazione di nodi con jsbayes, serve per collegare ai padri successivamente
        this.hasErrors = this.controlNameNodes(jsonNet);; //check for future
        
        //to be done: check for structure pattern
        
        //addNode
        for (i = 0; i < jsonNet.nodi.length; i++) {
            if(NetParser.isOk(jsonNet.nodi[i])){
                nodes.push(this.g.addNode(jsonNet.nodi[i].id, jsonNet.nodi[i].stati)); //aggiungo un nuovo nodo logico della rete bayesiana al graph
                //nodes[i].setCpt(jsonNet.nodi[i].cpt); //setting the cpt *********************** STILL MISSING VALUES
            }
            else this.hasErrors = true; //stop for the future, but not the cycle
            
        }
        
        //future operations check
        if(!this.hasErrors){
            //init vars
            let indexParent; //index for the parent search
    
            //addParent
            for (let node in jsonNet.nodi) {
                if (node.parents !== null) {
                    for (j = 0; j < node.parents.length; j++) {
                        indexParent = NetParser.getParentIndex(node.parents[j], nodes);
                        if (indexParent !== -1)  //check for mistake
                            node.addParent(nodes[indexParent]);
                        else {
                            console.info("Missing parent n°" + j + " for node: " + node.name);
                            this.hasErrors = true;
                        }
                    }
                }
            }
    
            //set random cpt
            if (!this.hasErrors)
                return this.setRandomCpt()
                    .catch((err)=> console.info(err));
        }
    }
    
    //set random conditional probability tables
    setRandomCpt(){
        return this.g.reinit()
            .then(()=>this.g.sample(10000)
                .then(()=> {
                    return this.g
                })
            ) //sampling to fix probabilities in the nodes
            .catch((err)=> console.info(err)); //catch for the errors
    }
    
    //returns the net if there are no errors, returns null instead
    getLogicNet(){
        if(this.logicNet) return this.logicNet; //if already exists, return it
        if(this.jsonNet !== null){ //not empty json
            return this.parse(this.jsonNet)
                .then(()=>{
                    if(!this.hasErrors)
                        return this.g;
                    else{
                        console.info("hasErrors => returning null");
                        return null;
                    }
                })
                .catch((err)=>console.info(err));
        }
        else return null;
    }
}

//test//
