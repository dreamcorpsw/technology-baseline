//import {path, getJsonAsText} from '../../utils/utils';
import appCtrl from '../../utils/appCtrl';
import locationUtil from "../../utils/location_util";
import {NetParser} from "../../utils/net-parser";

const jsbayes = require('jsbayes');

class BayesianTabCtrl{
    /** @ngInject */
    constructor($scope, backendSrv, $location){
        $scope.editor = this; //nome del controller nell'html
        this.panelCtrl = $scope.ctrl;
        this.panel = this.panelCtrl.panel; //variabile per modellare variabili presenti nell'html
        this.backendSrv = backendSrv; //variabile per le chiamate backend di Grafana
        this.$location = $location;
        
        this.onInitData();
    
        
        /*
        //chiamate asincrone innestate per l'import della struttura della rete
        this.searchNets()
            .then(()=>this.importNets()
                .then(()=>this.createBN())
            );
        */
        
        
        this.searchNets()
            .then(()=>this.importNets()
                .then(()=>console.info("done importing nets"))
            );
    }
    
    onInitData(){
        this.networks=[];
        this.dashboards=[];
        this.uids = []; //per gli identificativi delle dashboard
        //console.info("onInitData()");
        //utilizzo degli array contenenti varie informazioni sulla rete che andrò a sfruttare durante l'esecuzione del programma
        this.nodi = [];
        
        //variabili per i valori di presentazione a schermo dell'informazione
        //this.nets = []; //nomi delle reti
        //this.id_nodes = []; //id dei nodi
        //this.nodes = []; //insieme dei nomi dei nodi di una rete
        //this.states_nodes = []; //stati dei nodi
        //this.threshold_nodes = []; //soglie dei nodi
        this.samples = 10000; //numero di sampling da fare, il default, utilizzato anche da jsbayes, è 10k
        
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
        
        //ricorda se è già stato associato un nodo oppure no
        this.associated = false;  //true: associato / false: non associato
    }
    
    searchNets(){
        //console.info("searchNets()");
        return this.backendSrv.get('/api/search?tag=bayesian-network')
            .then(res =>{
                this.uids = res;
                console.info(this.uids);
            })
            .catch(err=>console.log(err));
    }
    
    //una rete alla volta, in modo asincrono
    async importSingleNet(uid) {
        return await this.backendSrv
            .getDashboardByUid(uid)
            .then(res => {
                this.dashboards.push(res.dashboard);
                this.networks.push(res.dashboard.network);
            })
            .catch(err => {
                err.isHandled = true;
            });
    }
    
    save(index) {
        //need for check integrity of the net
        //
        return this.backendSrv
            .post('api/dashboards/import', {
                dashboard: this.dashboards[index],
                overwrite: true,
                folderId: 0,
            })
            .then(()=>console.info("saved"))
            .catch((err)=>console.info(err));
    }
    
    importNets() {
        this.dashboards = []; //reset
        this.networks = []; //reset
        const promises = this.uids.map(uid_container => this.importSingleNet(uid_container.uid));
        return Promise.all(promises);
    }
    
    /*
    setUpGraphics(){
        let logic_nets = []; //contiene tutte le reti logiche
        let graphic_nets = []; //contiene tutte le reti logiche
        
        let net_parsed;
        
        for(let network in this.networks){
            net_parsed = new NetParser(network); //parsed
            logic_nets.push(net_parsed.getLogicNet()); //logic structure: static
            //graphic_nets.push(net_parsed.getGraphicNet()); //graphic structure: variable, repetitive requests
        }
    }
    */
    
    //crea la struttura logica della rete prendendo in input un file di testo
    /*
    createBN() {
        
        console.info("createBN()");
        
        this.g = jsbayes.newGraph();
        
        //invece di scegliere la prima, devo fare un ulteriore ciclo per distinguere le diverse reti
        let rete = this.networks[0];
        
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
                        if(parent_name === this.nodi[k].name) {
                            index = k;
                        }
                    }
                    //devo passare la variabile stessa non la stringa
                    this.nodi[i].addParent(this.nodi[index]);
                }
            }
        }

        //random cpt
        this.g.reinit()
            .then(()=>{
            })
            .catch((err)=> console.info(err)); //catch for the errors
        
    }
    */

    /*
    * methods for settings values
    * */

    setNet(net){
        //console.info("setNet()");
        if(net !== null) { //controllo che esista una rete
            this.netPos = this.networks.indexOf(net); //ricerco la posizione della rete
            this.nodePos = null;
            this.statePos = null;
            this.thresholdPos = null;
            console.info("done");
        }
        else{
            this.netPos = null;
            console.error("Impossible to set net");
        }
    }
    
    //bayesian_tab.js
    setNode(node){
        console.info("setNode()");
        if(this.netPos !== null && node !== null) {
            this.nodePos = this.networks[this.netPos].nodi.indexOf(node);
            //console.info("done");
        }
        else{
            this.nodePos = null;
            console.error("Impossible to set node");
        }
    }
    setState(state){
        console.info("setState()");
        if(this.nodePos !== null && state !== null){
            this.statePos = this.networks[this.netPos].nodi[this.nodePos].stati.indexOf(state);
            //console.info("done");
            this.thresholdPos = this.statePos;
            this.threshold = this.networks[this.netPos].nodi[this.nodePos].soglie[this.thresholdPos];
            this.setThreshold(this.threshold, this.thresholdPos); //fake chiamata
        }
        else{
            this.statePos = null;
            this.thresholdPos = null;
            console.error("Impossible to set state");
        }
    }
    setThreshold(threshold, index){
        //qui modifico le soglie anche nel JSON originale
        console.info("setThreshold() of index "+index);
        if(this.nodePos !== null && threshold !== null){
            this.networks[this.netPos].nodi[this.nodePos].soglie[index] = threshold; //effective changes
            console.info("threshold set to: "+threshold);
            //console.info("done");
        }
        else {
            console.error("Impossible to set threshold");
        }
    }
    setSamples(number){
        //console.info("setSamples()");
        if(number !== null){
            this.samples = number;
            console.info("done");
        }
        else {
            this.samples = 10000; //default
            console.info("Impossible to set samples");
        }
    }
    
    /*startLoop(){
        //test loop
        var i = 0;
        const context = this;
        const myVar = setInterval(function(){
            console.info(i);
            appCtrl.emit('associate', context.nodeId, context.panel.id, context.backendSrv);
            i++;
            if(i===5)
                setTimeout(function (){
                    clearInterval(myVar)
                },0); //istantaneo CREDO
        }, 1000);
        
        
    }
    */

    associate(NodeId){
        appCtrl.emit('associate', NodeId, this.nodePos, this.panel.id, this.backendSrv);
        this.associated = true;
        //modifico il valore del panel associato con l'id di questo panel
        this.networks[this.netPos].nodi[this.nodePos].panel = this.panel.id;
        //lancio la save
        this.save(this.netPos);
    }
    dissociate(NodeId){
        appCtrl.emit('dissociate', NodeId, this.nodePos);
        this.associated = false;
        //modifico il valore del panel associato a null
        this.networks[this.netPos].nodi[this.nodePos].panel = null;
        //lancio la save
        this.save(this.netPos);
    }
    
    /*
    getAlertingStuff(){
        //questa funzione è da sistemare di brutto, funziona a colpi di fortuna per ora
        console.info("getAlertingStuff()");
        const payload = {
            dashboard: "bayesian graph panel",
            panelId: 0,
        };
        return this.backendSrv.get('/api/alerts/', payload).then(res => {
            let alert_value = null;
            console.info(res);
            if(res === null) console.error("no result, bad request");
            else{
                if(res[0].evalData !== null){
                    if(res[0].evalData.evalMatches !== null){
                        alert_value = res[0].evalData.evalMatches[0].value;
                        console.info("Valore Alert:" + alert_value);
                        this.ThresholdToState(alert_value); //mi cambia lo stato a quello che conta dettato dal valore dell'alert
                    }
                    else console.error("evalMatches null");
                }
                else console.error("evalData null");

            }
        });
    }

    ThresholdToState(value){
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

        //la funzione sotto serve per dire alla rete che il nodo scelto è monitorabile allo stato scelto
        //per esempio se un valore è in questo momento 60 questo corrisponde allo stato "basso" del nodo "n3"
        //per dire alla rete "g" che sto "osservando" effettivamente questa cosa dico g.observe("n3","basso")
        //questo rimuove l'incertezza probabilistica sul nodo e inserisce la certezza data dall'osservazione diretta
        //(esattamente quello che ci viene richiesto con l'asssociazione di un nodo).
        this.g.observe(this.nodi[this.nodePos].name,this.states_nodes[this.nodePos][this.statePos]);
        //la chiama g.sample(#numero) serve per lanciare il "ricalcolo" e quindi avviene effettivamente l'inferenza bayesiana
        //Vengono effettuati un numero di testo pari al valore passato per paramentro e dopodichè si ottiene il valore
        //della probabilità modificata dalla presenza delle "certezze" definite come la riga precedente.
        this.g.sample(this.samples);
        //funzione che fa un output dei valori di probabilità di ogni nodo e per ogni suo stato
        this.showProb();

    }
    */
}

//funzione di export per sfruttare l'import di questa classe
export function BayesianTab() {
    return {
        templateUrl: 'public/plugins/bayesian-graph/partials/bayesian_network.html', //struttura html a cui si appoggia
        controller: BayesianTabCtrl //associo la classe appena creata come controller che mi serve per lavorare con angular
    };
}