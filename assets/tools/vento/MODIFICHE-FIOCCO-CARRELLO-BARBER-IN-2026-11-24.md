# VENTO — Revisione del carrello e della scotta della vela di prua

Data: 24 novembre 2026. Questa revisione **sostituisce** le regole operative di carrello/barber contenute nel documento precedente `MODIFICHE-CARRELLO-FIOCCO-2026-11-24.md`.

## Riferimenti tecnici

- **LA BARCA VELOCE**, capitolo 1 (regolazione del genoa, «Il carrello»): un rinvio arretrato tende la base e apre la balumina; avanzandolo la tensione agisce maggiormente sulla balumina. Le indicazioni sul corretto carrello dipendono dal taglio e dai segnavento.
- **La fisica in barca a vela: comprendere le forze in gioco e migliorare le prestazioni**, capitoli sulle forze aerodinamiche e la forma delle vele: la forza va scomposta secondo la sua direzione effettiva; la forma e la distribuzione del grasso alterano l'azione del vento.

I testi **non prescrivono** un binario lungo 3 volte la base, la soglia di barber in al 105% o coefficienti esatti del sistema: queste sono scelte e richieste del simulatore, da non confondere con specifiche ORC, hardware reale o validazione in mare.

## Modifiche

1. **Solo barber in:** eliminata la direzione esterna. Il barber agisce esclusivamente **verso l'albero** e soltanto con **LP/J ≤ 105%** (calcolato dalle misure attuali, non dal semplice nome «fiocco»). A 0% non devia la scotta; a 100% applica il massimo inhaul interno. Oltre il 105%, il controllo non è mostrato, AUTO non lo ottimizza, il rinvio 3D non è selezionabile e il contributo fisico è forzato a zero. Il barber dello spinnaker è indipendente e invariato.
2. **Binario proporzionale:** il riferimento è la **bugna geometrica nominale** del taglio corrente, e la «base» è la distanza geometrica dalla mura alla bugna. Fine corsa di poppa = bugna − **2 × base**, fine corsa di prua = bugna + **1 × base**. Escursione totale = **3 × base**. Il binario 3D e la lettura in metri seguono i cambi di vela, le misure modificate e la barca; il riferimento geometrico *non* cambia quando si manovra, varia il vento o si deforma lo strallo.
3. **Scotta e risposta aerodinamica:** con scotta al **0%** la forza di scotta è esattamente **0 N** e, a vento identico, la posizione libera della bugna è indipendente dal carrello. A carrello arretrato, cazzare fino al 100% distende la base nei casi geometricamente compatibili; resta la cazzata supplementare fino al 120%. L'effetto dipende dal vettore bugna→rinvio, non da un premio numerico. Avanzare il carrello aumenta la componente di tiro verso il basso; se il rinvio arriva troppo avanti, la scotta non deve più far **aprire** la vela quando viene cazzata. L'ulteriore corsa avanti rimane comunque disponibile per l'esplorazione manuale; AUTO limita automaticamente le posizioni non idonee.
4. **Sessioni precedenti:** il vecchio barber bidirezionale usava 50 = centro, 0 = interno massimo e 100 = esterno massimo. Alla lettura delle sessioni precedenti viene convertito nel nuovo barber unidirezionale (50→0; 0→100; valori esterni→0). Il nuovo formato ha un marcatore di versione per non applicare due volte la conversione.
5. **Rappresentazione grafica:** binari, carrelli e arresti vengono aggiornati insieme alle misure; il barber e il relativo rinvio si mostrano soltanto quando previsti e in tensione. La visualizzazione non crea un barber out nascosto.

**Avvertenza geometrica:** la corsa 2×/1×, richiesta come vincolo didattico, può superare la lunghezza reale del ponte su alcune combinazioni di barca/vela. Non rappresenta quindi una configurazione costruttiva realizzabile e non sostituisce i veri fine corsa, il controllo delle crocette e delle sartie o un piano attrezzatura reale.

## Test eseguiti

- `tests/jib-rail-inhaul-release.mjs`: 840 combinazioni dimensioni 80–185%, vento 6/14 kn, entrambe le mure, 5 posizioni carrello e 6 cazzate; verificato lo 0 N e la bugna libera indipendente dal carrello; 56 controlli di base completamente distesa con carrello arretrato; modifiche alle misure, soglia overlap, conversione sessioni.
- `tests/jib-sheet-balance.mjs`: 1.008 prove del bilancio scotta/carrello/vento, corretta forza lungo la cima, lunghezza scotta, pressioni e forma.
- `tests/jib-car-force-distribution.mjs`: 120 configurazioni e verifica della componente base/balumina, del twist e delle sartie basse.
- `tests/headsail-rig-contact.mjs`: **26.676** controlli campionati fra triangoli di vela, sartie e crocette, su entrambe le mura e fino al 120% di scotta; nessuna intersezione nei casi testati.
- Altri test mirati superati: `jib-dynamics`, `static-twist-auto-vang`, `main-outhaul-boom`, `wind-twist-spinnaker-barber`, `session-store`.

I test meccanici e geometrici sono controlli numerici del simulatore, non misure in mare. Il browser Chromium headless di questo ambiente non ha completato l'apertura della pagina locale: **il collaudo visivo interattivo non è verificato**. Alcuni test di ottimizzazione generale richiedono tempi superiori ai controlli eseguiti e non sono stati dichiarati superati.
