[![Build Status](https://travis-ci.org/dreamcorpsw/technology-baseline.svg?branch=master)](https://travis-ci.org/dreamcorpsw/technology-baseline)
[![Coverage Status](https://coveralls.io/repos/github/dreamcorpsw/technology-baseline/badge.svg)](https://coveralls.io/github/dreamcorpsw/technology-baseline)

# bayesian-grafana-plugin

Repository del gruppo DreamCorp per il progetto di Ingegneria del Software del corso di Informatica dell'Università di Padova A.A 2018/2019.

## Getting Started

Di seguito vengono riportare le istruzioni per la corretta installazione ed esecuzione del plugin.

### Prerequisiti

La prima cosa da fare è installare l'ambiente di Grafana, reperibile direttamente dal sito ufficiale a questo [link](https://grafana.com/get). Al momento la versione che Grafana propone per il download è la 6.0.0, però si consiglia l'utlizzo della versione precendete 5.4.3 in quanto lo sviluppo è stato basato su quest'ultima. Non sono garantite per ora tutte le funzionalità perchè deve essere ancora compiuto un lavoro di controllo della compatibilità.

### Installazione

Una volta scaricato Grafana in locale, per la corretta installazione e utilizzo del plugin seguire i successivi passi:

Scaricare il plugin presente in questo repository all'interno della cartella appropriata.
Le istruzioni su come trovare la cartella appropriata e la sua locazione possono variare in base al sistema operativo, si possono trovare le indicazioni [qui](http://docs.grafana.org/plugins/installation/#grafana-plugin-directory).

Far partire il server di grafana, dopo aver posizionato il plugin all'interno della cartella corretta. L'eseguibile su windows si può trovare nella cartella:

```
grafana/bin/grafana-server
```
Accedere tramite localhost con le credenziali "admin:admin" se è la prima volta, altrimenti con quelle personalizzate.

## Built With

* [Grafana 5.4.3](https://grafana.com/)


## Authors

* **Davide Ghiotto** - *Progettazione Struttura Plugin* - [Davide Ghiotto](https://github.com/davide97g)
* **Marco D'Avanzo** - *Setup Test* 
* **Matteo Bordin** - *Revisione Documenti* 
* **Davide Liu** - *Implementazione jsbayes*
* **Michele Clerici** - *Gestione input file json* 
* **Pietro Casotto** - *Implementazione Comunicazione InfluxDB*
* **Gianluca Pegoraro** - *Revisione Documenti*

