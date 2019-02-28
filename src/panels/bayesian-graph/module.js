import {BayesianTab} from "./bayesian_tab";
import {GraphCtrl} from "../graph/module";

class BayesianGraphCtrl extends GraphCtrl{
    /** @ngInject*/
    constructor($scope, $injector, annotationsSrv) {
        super($scope, $injector, annotationsSrv);
        this.events.on('init-edit-mode', this.onInitBayesianPanelEditMode.bind(this));
        $scope.ctrl.panel.title = "Bayesian Graph Panel";
    }
    
    onInitBayesianPanelEditMode() {
        this.addEditorTab('Bayesian Network', BayesianTab);
    }
}

BayesianGraphCtrl.templateUrl = 'public/plugins/dreamcorp-app/panels/bayesian-graph/module.html';
export {
    BayesianGraphCtrl as PanelCtrl
};

