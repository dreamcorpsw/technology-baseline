import {ImportNetCtrl} from "../components/importNet";

const EventEmitter = require('eventemitter3');
import {path, getJsonAsText} from './utils';
//classe di gestione dell'applicazione per eventi e dati condivisi
class AppCtrl extends EventEmitter{
    /** @ngInject */
    constructor($scope,backendSrv){
        super();
        this.backendSrv = backendSrv;
        this.i = 0;
        console.info("new AppCtrl");
        //console.info("backendSrv");
        //console.info(this.backendSrv);
        this.getNet();
    }
    
    test(){
        console.info(this.i++);
    }
    createBN(text) {
        console.info("createBN() - App");
        var rete = JSON.parse(text);
        this.net = rete;
        
        const jsbayes = require('jsbayes');
        this.g = jsbayes.newGraph();
        
        //function to set the variables
        this.onInitData();
        
        this.nets.push(rete.rete); //per ora un solo valore
        
        let i;
        //catturo le informazioni e creo i nodi
        for (i = 0; i<rete.nodi.length; i++){ //per tutti i nodi li creo e li metto i una lista
            this.id_nodes.push(rete.nodi[i].id); //mi salvo l'id del nodo
            this.states_nodes.push(rete.nodi[i].stati); //mi salvo gli stati
            this.threshold_nodes.push(rete.nodi[i].soglie); //mi salvo le soglie
            this.nodi.push(this.g.addNode(this.id_nodes[i],this.states_nodes[i])); //nuovo nodo logico della rete bayesiana
            //this.nodi[i].setCpt(rete.nodi[i].cpt); //inserisco le cpt dentro ai nodi e non più random
        }
        
        this.nodes.push(this.id_nodes); //inserisco un array dentro un altro per essere pronto a gestire più reti
        
        var index, parent_name;
        
        //creo le relazioni padre-figlio
        for (i = 0; i<rete.nodi.length; i++){ //per tutti i nodi aggiungo i genitori
            if(rete.nodi[i].parents !== null) { // se ha almeno un padre
                for (let j = 0; j < rete.nodi[i].parents.length; j++) {
                    
                    parent_name = rete.nodi[i].parents[j]; //mi salvo il nome del parent
                    
                    for(let k =0;k<rete.nodi.length;k++){ //per tutti i nodi cerco il parent con quel nome specifico
                        if(parent_name === this.nodi[k].name) index = k;
                    }
                    //devo passare la variabile stessa non la stringa
                    this.nodi[i].addParent(this.nodi[index]);
                }
            }
        }
        
        //random cpt
        this.g.reinit()
            .then(function() {
                //return this.g.sample(10000); //likelihood weight sampling aka the inference
                
            });
        
    }
    onInitData(){
        console.info("onInitData() - App");
        //utilizzo degli array contenenti varie informazioni sulla rete che andrò a sfruttare durante l'esecuzione del programma
        this.nodi = []; //array di variabili di nodi logici di jsbayes (qui dentro inserisco quello che ritorna la funzione g.addNode(nome, stati))
        
        //variabili per i valori di presentazione a schermo dell'informazione
        this.nets = []; //nomi delle reti
        this.id_nodes = []; //id dei nodi
        this.nodes = []; //insieme dei nomi dei nodi di una rete
        this.states_nodes = []; //stati dei nodi
        this.threshold_nodes = []; //soglie dei nodi
        this.samples = 10000; //numero di sampling da fare, il default, utilizzato anche da jsbayes, è 10k
        
        /*
        //variabili che memorizzano la posizione all'interno degli array precedenti che è stata scelta dall'utente a schermo
        this.netPos = null; //indice della rete scelta
        this.nodePos = null; //indice del nodo scelto
        this.statePos = null; //indice dello stato scelto
        this.thresholdPos = null; //indice della soglia scelta
        
        
        //variabili grafiche che memorizzano il valore scelto dall'utente a schermo
        this.panel.rete_id = null; //nome della rete scelta
        this.panel.node_id = null; //nome del nodo scelto
        this.panel.states_node_id = null; //nome dello stato scelto
        this.panel.threshold_node_id = null; //valore della soglia scelta
        this.panel.samples = 10000; //numero di sample scelto
        */
        //ricorda se è già stato associato un nodo oppure no
        //this.associated = false;  //true: associato / false: non associato
    }
    
    //funzione brutta che andrà eseguita ogni qual volta ci sia la necessità di controllare il valore di un nodo
    getAlertData(panel,backendSrv,nodePos){
        //http request with API aiming at a specific panel
        return backendSrv.get('/api/alerts/?panelId='+panel)
            .then(res => {
                let alert_value = null;
                //faccio una serie di test per assicurarmi di non andare ad esplorare dati undefined
                if(res === null) {
                    console.log("no result, bad request");
                }
                else {
                    if (res.length === 0) console.info("no value from this alert");
                    else {
                        if (res[0].evalData !== null) {
                            if (res[0].evalData.evalMatches !== null && res[0].evalData.evalMatches.length !== 0) {
                                alert_value = res[0].evalData.evalMatches[0].value;
                                if(alert_value !== null)
                                    this.ThresholdToState(alert_value, nodePos);
                            }
                            else console.log("evalMatches null");
                        }
                        else console.log("evalData null");
                    }
                }
            })
            .catch(err => console.log(err));
    }
    ThresholdToState(value,nodePos){
        this.nodePos = nodePos;
        console.info("ThresholdToState");
        let threshold=0;
        let index = 0;
        for(let i =0;i<this.threshold_nodes[this.nodePos].length-1;i++){ //per tutte le soglie del nodo considerato
            threshold = this.threshold_nodes[this.nodePos][i]; //soglia i-esima
            if(value>threshold){ //se la supero, sono almeno nello stato dopo
                console.info(value+">"+threshold);
                index++; //mi sposto sullo stato successivo
            }
            else break; //esco dal ciclo quando non accade
        }
        console.info("Stato identificato:" +(index+1));
        this.statePos = index; //modifico lo stato in base alla soglia
        this.associate();
    }
    showProb(){
        //output probabilità
        for (let x = 0;x<this.nodi.length;x++){
            console.info(this.nodi[x].probs());
        }
    }
    getProbs(){
        this.g.sample(10000);
        const probs = [];
        for (let x = 0;x<this.nodi.length;x++){
            probs.push(this.nodi[x].probs());
        }
        return probs;
    }
    associate(){
        this.g.observe(this.nodi[this.nodePos].name,this.states_nodes[this.nodePos][this.statePos]);
        this.g.sample(this.samples)
            .catch((err)=>console.info(err));
        this.showProb();
    }
    dissociate(nodePos){
        this.g.unobserve(this.nodi[nodePos].name);
        this.g.sample(this.samples);
        this.showProb();
    }
    getNet(){
        const my_url = path()+'/networks/rete.json';
        getJsonAsText(this,my_url); //lancia insieme anche createBN
        return this.net; //ritorno il valore assicurandomi che sia presente la rete
    }
    
}
//AppCtrl.templateUrl = 'appCtrl.html'; //maybe non serve per passare backendSrv

//istanza
const appCtrl = new AppCtrl();
//listen "on", serve per creare funzioni di cui poi potrò fare "emit"
appCtrl.on('associate', (nodeId,nodePos,panel,backendSrv) => {
    console.log("Associated with "+ nodeId +" at panel "+panel);
    appCtrl.getAlertData(panel,backendSrv,nodePos);
});

appCtrl.on('dissociate', (nodeId,nodePos) => {
    console.log("Dissociated with "+ nodeId);
    appCtrl.dissociate(nodePos);
});

appCtrl.on('net-request',function () {
        console.info("net-request");
    }
);

//export this instance
module.exports = appCtrl;