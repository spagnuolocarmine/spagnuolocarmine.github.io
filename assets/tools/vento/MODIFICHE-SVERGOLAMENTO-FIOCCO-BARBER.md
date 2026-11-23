# VENTO — Aggiornamento svergolamento, scotta fiocco e barber spinnaker

## Modifiche

1. **Svergolamento diretto di randa e fiocco/genoa.** È mostrato come prima proprietà nel pannello «Misure e corde della vela» e rimosso dai comandi del pannello «Manovre». Rimangono predefiniti 10°, selezionabili fra 0° e 50° con progressione lineare lungo l'altezza. Il ripristino della vela riporta il twist a 10°; AUTO lascia invariata la proprietà.
2. **Scotta fiocco/genoa.** Fine corsa ampliato fino al 120%; fra 100% e 120% il modello introduce tensione di cazzata supplementare e appiattimento progressivo. L'ulteriore chiusura è subordinata al controllo geometrico delle collisioni con sartie e crocette; 100–120% non significa automaticamente un pari aumento di prestazioni. Lo stato esteso viene conservato nel salvataggio della sessione.
3. **Barber scotta e barber braccio dello spinnaker.** Entrambi utilizzano un anello che viene richiamato in modo continuo verso un punto di attacco distinto in coperta. A 0% l'anello coincide con il segmento rettilineo della propria cima e non costituisce un rinvio della scotta o del braccio; la cima del barber resta visibile, lasca. A 100% l'anello raggiunge circa 18 cm sopra il punto di fissaggio (nel riferimento geometrico del modello); a tensioni intermedie l'anello interpola dalla posizione libera a quella cazzata. I comandi non si sostituiscono a vicenda e continuano ad agire sulla forma aerodinamica tramite i coefficienti di pressione/twist già presenti.

## Riferimenti e limiti

Si mantengono i due riferimenti forniti dall'utente, *La barca veloce* (manovre di spinnaker, quadratura e barber-hauler) e *La fisica in barca a vela* (forze e vincoli delle scotte). La geometria di rinvio viene rappresentata come ideale con spostamento continuo; la posizione esatta dei punti di attacco e la deformazione delle cime richiederebbero misure dell'imbarcazione reale. La soglia 120% non è una misura ORC e non altera il certificato.

## Test effettuati

- `node tests/static-twist-overtrim-spinnaker-barbers.mjs`: 300 combinazioni con entrambe le mure, vari assetti di scotta e comando barber indipendente 0/25/50/75/100%, posizioni finali e assenza di rinvio forzato a 0%; verifiche statiche delle proprietà di twist e dell'estensione scotta.
- `node tests/wind-twist-spinnaker-barber.mjs`: continuità delle funzioni precedenti.
- `node tests/rigging-and-sails.mjs`: 4386 controlli di geometria e contatto.
- `node tests/flying-surface.mjs`: 144 sezioni tridimensionali e 6780 controlli di interferenza.
- `node tests/geometry.mjs` e `node tests/advanced-profiles.mjs`: regressioni di superficie e profili.
- `node tests/session-store.mjs`: persistenza del comando oltre 100% e limiti della sessione.

Nota: non è stata effettuata una prova interattiva completa con WebGL nel browser. Alcuni vecchi test che assumono corsa lineare *esatta* del fiocco anche con l'armo deformabile richiedono un riallineamento all'attuale modello fisico; non vengono conteggiati come superati.
