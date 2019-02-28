export class DreamCorpAppConfigCtrl {

  /** @ngInject */
  constructor($location){
    this.$location = $location;
    this.samples = 10000;
    this.time = 1000;
  }
  setSamples(value){
      if(value!==null) this.samples = value;
  }
  setTime(time){
    if(time!==null) this.time = time*1000;
  }
  redirect(){
    console.info("redirect to importNet");
    this.$location.url('plugins/dreamcorp-app/page/import-bayesian-network'); //redirecting to importNet
  }
}

DreamCorpAppConfigCtrl.templateUrl = 'components/config.html';
