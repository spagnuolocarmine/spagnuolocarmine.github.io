# VENTO — Tesabase randa e lunghezza del boma (24 novembre 2026)

## Richiesta
- Cazzare maggiormente la base della randa: la bugna deve raggiungere la misura **E** e il piede della vela deve distendersi sopra il boma al 100%.
- Rappresentare un boma **lievemente più lungo di E**, conservando le misure certificate.

## Modifiche implementate
1. **Boma fisico:** lunghezza del tubo pari a **1,045 × E** della *struttura originale* della barca, ovvero 4,5% oltre la quota di scotta della bugna. La E del certificato e il taglio della randa rimangono invariati; ridurre/ingrandire una vela personalizzata non cambia automaticamente la dimensione dell'hardware.
2. **Corsa del tesabase:** lo slider originario 0–100% ora rappresenta una corsa effettiva maggiore. Cazzando, la bugna si sposta progressivamente verso la distanza E dal punto di mura e il profilo del piede si appiattisce progressivamente. Al 100%, la distanza mura–bugna arriva a E.
3. **Piede lungo il boma:** la concavità residua viene eliminata al 100% **solo alla quota del piede**; il contributo si attenua progressivamente nei pannelli bassi della vela. Anche i profili personalizzati attenuano giro di base, angoli di entrata/uscita e ritorno di balumina nella sezione del piede quando viene tesata completamente la base. La superficie rimane la stessa usata dal rendering e dal calcolo aerodinamico.
4. **Posizione visuale:** con tesabase completamente cazzato il piede è appoggiato lungo l'asse del boma, con un piccolo scostamento verticale per essere visibile al di sopra della barra. Rinvii e punti d'attacco della scotta/vang si aggiornano secondo la lunghezza del boma.
5. **Corsa scotta randa:** il controllo di contatto rig e i limiti della scotta restano calcolati con la sagoma di riferimento; il tendibase non cambia artificialmente la corsa meccanica della scotta.
6. **UI:** aggiornata la descrizione della manovra *Base randa* nel pannello.

## Riferimenti bibliografici allegati
- **La barca veloce**, capitolo 1, paragrafi relativi a *tesabase* e forma delle vele: cazzando la base si distanziano le bugne, si aumenta la corda effettiva e si riduce la freccia della parte bassa.
- **La fisica in barca a vela: Comprendere le forze in gioco e migliorare le prestazioni**, capitolo 5 (discussione della concavità): con vento teso il tesabase permette una vela più piatta; la curvatura è descritta tramite corda, freccia e posizione del grasso.
- **Nota di modellazione:** nessuno dei due testi impone un margine universale del 4,5% di lunghezza del tubo oltre E né una legge precisa di deformazione da 0 a 100%. Il margine e la distribuzione in altezza implementati sono parametri didattici/empirici della simulazione, non valori certificati o misurazioni reali della barca.

## Verifiche
- Nuovo test `tests/main-outhaul-boom.mjs`: **216 campioni** su sloop di laboratorio e due esempi ORC, andature, tensioni di scotta e vang; aumento progressivo della corsa della bugna; contatto completo della base al 100%; lunghezza del boma 1,045 × E.
- Verifica di profili personalizzati, riduzione della randa, E di riferimento non alterata, boma indipendente dalla modifica del taglio della vela e risposta aerodinamica effettiva.
- Passano anche i test `tests/telltales-and-profiles.mjs`, `tests/main-leech.mjs`, `tests/book-reference.mjs`, `tests/static-twist-auto-vang.mjs`, `tests/geometry.mjs`, `tests/rigging-and-sails.mjs`.
- Restano due fallimenti **preesistenti**, confermati rieseguendo le stesse prove anche con i file originali dell'archivio di partenza: `tests/catalog-and-measures.mjs` (uno dei controlli di polare) e `tests/sheet-travel.mjs` (proporzionalità corsa genoa); non sono regressioni introdotte qui.
- Non è stato condotto un collaudo visivo interattivo nel browser. Il risultato visivo è basato sulle verifiche geometriche e il render condiviso dalla fisica.
