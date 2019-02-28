export function getJsonAsText(context, my_url) {
    console.info("getJsonAsText()");
    $.ajax({
        'async': true,
        'global': false,
        'url': my_url,
        'dataType': "text",
        'success': function (data) { //callback a cui appoggiarsi, codice che esegue dentro questo corpo è sicuro di eseguire dopo l'effettivo caricamento del file
            //console.info("success");
            context.createBN(data); //lancio la funzione di creazione della rete logica solo dopo la completa lettura del file
            var json = JSON.parse(data);
        }
    });
}

export function path(){
    return '/public/plugins/dreamcorp-app';
}