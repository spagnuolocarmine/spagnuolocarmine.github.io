# VENTO — svergolamento statico e vang (23 novembre 2026)

## Svergolamento diretto: proprietà riservata all’utente

- Lo svergolamento diretto rimane la **prima proprietà** della sezione **Misure e corde** per **randa** e **fiocco/genoa**, con 10° iniziali e intervallo 0–50°. Non è una manovra.
- AUTO non può selezionare, fissare, regolare, azzerare o sovrascrivere questa proprietà. Essa è esclusa da assi di ricerca, limiti delle tensioni e calcolo dei target delle singole manovre.
- Nel calcolo della polare di **riferimento originale** viene usato il twist originale di 10°, non il valore personalizzato della barca. Il twist scelto dall’utente rimane invece nella **geometria reale** e quindi nelle forze fisiche simulate quando AUTO ottimizza **altre** manovre. Non è possibile ignorare il profilo fisico della vela nel calcolo della sua aerodinamica: «non considerarlo» significa qui *non ottimizzarlo né cambiarlo*.
- I percorsi di ricerca veloce, ottimizzazione completa e target per singola manovra mantengono i valori utente. La cache dei target delle manovre viene invalidata se l’utente cambia il twist. L’interfaccia protegge esplicitamente lo svergolamento dall’applicazione dei risultati di AUTO.
- Le sessioni vecchie che contenevano un blocco `main.twist` o `genoa.twist` recuperano il valore salvato nelle misure e ignorano quel blocco obsoleto.

## Vang: risposta più evidente e progressiva

- Ricalibrata la componente **empirica** del vincolo verticale sul boma e della tensione di balumina nella geometria caricata (`main-balance.js`).
- Cazzando il vang la bugna del boma si abbassa progressivamente, mentre si riduce l’apertura della balumina e il twist effettivo indotto dal carico. Il risultato cambia le normali e i carichi aerodinamici della vela, non solo un’indicazione grafica.
- La scotta conserva il suo ruolo dominante alle andature strette quando è molto cazzata. L’effetto del vang è maggiore quando si lascia scotta, tipicamente sulle andature larghe; la modifica non introduce «bonus» artificiali alla velocità.
- I limiti di 0–50° riguardano **il twist diretto statico** impostato dall’utente: il twist caricato può variare in modo fisico in funzione del vang e delle altre manovre, senza cambiare quel valore statico salvato.

**Riferimenti nei libri allegati:** *La barca veloce*, cap. 1, sezioni sullo svergolamento e «Il vang», e cap. 3, regolazioni in traverso, lasco e poppa. *La fisica in barca a vela: comprendere le forze in gioco e migliorare le prestazioni*, parte sui controlli di randa e sulla forma della sezione. Le relazioni quantitative (coefficienti del sollevamento e del twist) sono parametri didattici del simulatore, **non** valori sperimentali ricavati dai libri o dalle misure di una barca reale.

## Verifiche

- Nuovo test `tests/static-twist-auto-vang.mjs`: compatibilità delle sessioni precedenti; valori statici invariati in AUTO e risultati di riferimento; esclusione dalla ricerca; cache target; vincolo utente nell’interfaccia; andamento monotono del vang e variazione aerodinamica.
- Superati i test mirati su geometria, balumina, riferimenti librari, vele portanti, risposta del vento, svergolamento, barber e sessione.
- La prova nel browser headless è **bloccata dalla configurazione dell’ambiente** (navigazione HTTP locale impedita dal browser), quindi il collaudo visuale manuale rimane consigliato.
- Le ottimizzazioni multi-start più lunghe non sono state completate in un test integrale qui: i percorsi principali sono stati protetti direttamente e i test rapidi verificano le proprietà invarianti.
