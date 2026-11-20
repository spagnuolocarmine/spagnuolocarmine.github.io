# VENTO — Sailing Lab

Laboratorio didattico HTML/JavaScript/Three.js per esplorare le forme delle vele, le manovre, il vento apparente e l’equilibrio di uno sloop. Interfaccia minimale chiara/blu, pannello laterale unico, controlli touch, italiano/inglese e dati originali ORC in sola lettura.

## Avvio locale e progetto scaricabile

Non richiede build o servizi esterni per i calcoli. Dalla cartella del progetto avviare un server statico, per esempio:

```sh
python -m http.server 8080 --directory dist
```

Aprire `http://localhost:8080`. L’apertura diretta con `file://` non supporta correttamente moduli, worker e JSON. Il pulsante nel Modello scarica `vento-sorgenti.zip`, con applicazione, dati, documentazione e test; non contiene credenziali o identità dell’hosting. Three.js e font sono locali. Configurazione, barca, vele/profili personalizzati, manovre fissate, preferenze, sezione del pannello e vista vengono salvate nel browser. Il tasto di reset elimina lo stato solo dopo una conferma; l’annullamento conserva la sessione. L’audio salvato riprende dopo un gesto dell’utente, secondo le regole del browser.

## Funzioni

- Scelta fra 1.401 record ORC, certificato completo, inventario e polare; armo ricostruito mediante P/E/I/J e dati di modelli corrispondenti o simili, segnalando le stime.
- Randa e fiocco/genoa, S2 e A2 selezionati dall’utente; sola randa, vele ammainate, due riduzioni della randa e farfalla alle andature molto poggiate. AUTO conserva la selezione.
- Ventiquattro manovre correnti e di setup, con controllo diretto cliccando cime/carrelli. I singoli comandi si aprono a destra dello schermo e restano trascinabili e richiudibili. I comandi disabilitati sono esclusi da AUTO. Le scotte fermate conservano una lunghezza di cima; gli altri comandi un valore di setup normalizzato.
- Editor delle misure e corde, senza vincoli arbitrari sui valori positivi. Il rosso segnala proporzioni insolite/incompatibili; le modifiche sono scenari separati dal certificato.
- Progettazione della vela in una modale con tab Dimensioni / Forme, misure e profili direttamente modificabili senza checkbox; indicatore di vela modificata e ripristino della vela originale: fino a 65 sezioni lungo l’inferitura, selezione continua della quota in passi dello 0,1%, grasso iniziale, posizione del grasso, angoli di entrata/uscita, svergolamento di taglio, ritorno di balumina, corde locali, giro d’inferitura/base, volume equivalente da broadseaming, deformabilità, peso e pannellatura indicativa. Modale ampia con controlli a sinistra, anteprima isolata ruotabile/zoomabile a destra (sopra i controlli su mobile) e profilo della sezione sotto carico. Le quote normalizzate seguono i cambi di lunghezza della vela.
- Pressioni, coefficienti, linee di forma e segnavento specifici per famiglia. Mappa del modulo o del segno di Δp, con scala automatica o fissa in Pa.
- “Mostra forze” nei Dati: risultanti e centri di pressione delle vele, lift/drag/spinta/forza laterale e verticale, campioni delle pressioni, reazioni di scafo/deriva/timone, gravità e Archimede, stime di scotte/armo e momenti. Apertura iniziale sui soli centri, etichette su hover o tocco, livelli aggiuntivi e valori espandibili. Frecce a lunghezza logaritmica, numeri in N o N·m; componenti e forze interne sono viste alternative, non ulteriori addendi alle risultanti.
- Telemetria sempre visibile in alto, con vento modificabile al clic/tocco e comando AUTO continuo con avanzamento per fasi reali: vento reale, direzione, velocità della barca, target e indicatore orizzontale dell’efficienza. Riduzione randa con tre scelte compatte e indicatore della superficie residua. Lingua e reset nella parte bassa della barra sinistra.
- I segnavento della randa sono singoli nastri rossi alla balumina, circa 42 cm sul modello da 10 m; reagiscono al flusso locale e pendono in calma. Sono aggiunti tre piccoli filetti di circa 14 cm su ogni faccia alle tre corde superiori, distribuiti lungo la larghezza. Le altre vele conservano gli indicatori sulle due facce. Il filetto alto di balumina può perdere brevemente aderenza vicino alla soglia locale di separazione: l’intermittenza non è un’animazione imposta da AUTO.
- Flussi raggruppati di particelle guidati attorno alle sezioni delle vele caricate, con fasci sulle due facce, uscita e dispersione legata alla separazione locale; scie qualitative, colori/dimensioni/densità configurabili, suoni sintetizzati, mare costante, CSV e archivio dei sorgenti.

Le schede dei singoli comandi mostrano solo 1–2 grandezze pertinenti e una descrizione breve. Dopo una modifica un worker confronta due velocità a regime con vento e altri comandi uguali; il display principale mostra centesimi di nodo, la differenza millesimi. I dettagli tecnici restano espandibili. Un fine corsa, una cima scarica o una vela assente possono rendere l’effetto minimo o nullo: non vengono assegnati bonus artificiali.

## Riferimenti

Laura Romanò, *La barca veloce. Tecniche di navigazione competitiva e di regolazione delle vele*, Hoepli, 2012, ISBN 978-88-203-5762-7; *La fisica in barca a vela. Comprendere le forze in gioco e migliorare le prestazioni*, Hoepli, ISBN 9788820358020. About cita entrambi; i libri non sono inclusi nel progetto o nell’archivio.

Il modello segue qualitativamente le distinzioni fra scotta/carrello/vang (V pp. 48–50), regolazione del fiocco e catenaria (V pp. 43–47), vento in altezza (V pp. 33–38), interazione fra vele (V pp. 39–42 e 92–94), spinnaker/scotta/tangone (V pp. 95–101), equilibrio di forze e momenti (V pp. 9–15; F cap. 1 e 7), flusso aderente e separazione (F pp. 25–29, 70–75) e polari (V pp. 113–123; F cap. 6). Pagine riferite alle edizioni allegate. I due volumi della stessa autrice sono fonti didattiche, non due validazioni sperimentali indipendenti.

Riferimenti aggiuntivi per la terminologia dei profili:

- [UK Sailmakers · AccuMeasure](https://www.uksailmakers.com/wp-content/uploads/2024/03/UKSailmakersAccuMeasure2011.pdf)
- [UK Sailmakers · Shape](https://www.uksailmakers.com/encyclopedia/glossary/shape/)
- [North Sails · J/105 tuning guide](https://www.northsails.com/en-us/blogs/north-sails-blog/j105-tuning-guide)

Dati dimensionali: [Kaggle · Sailing Boats](https://www.kaggle.com/datasets/opendatasource/sailing-boats). Certificati/polari: [ORC · RMS files](https://orc.org/race-managment/rms-files). Le misure delle vele rimangono quelle dei certificati; i riferimenti d’armo non le sostituiscono. Dati sorgente in sola lettura, non alterati o ripubblicati pubblicamente; uso didattico non commerciale, nessun certificato/rating/scorer nuovo. Le copie dei dati nel download sono destinate al titolare del laboratorio.

## Modello ridotto e limiti

L’obiettivo è un’esperienza realistica, leggibile e fluida, non riprodurre perfettamente ogni fenomeno o sostituire un VPP. L’applicazione è stata realizzata con approccio vibe coding, GPT-6.1 Sol e Codex; il codice e le operazioni principali sono stati parzialmente ottimizzati e verificati. Le verifiche numeriche non sono una validazione scientifica delle prestazioni.

Il vento reale impostato è riferito alla testa nominale dell’armo H, fissata dall’hardware. Il profilo marino assunto è U(z)=U(H)(z/H)^0,11, con quota minima 1,5 m. La vista opzionale “Vento → Gradiente del vento” mostra intensità reale/apparente e angolo alle diverse quote. Le tabelle ORC in sola lettura sono interpolate al vento equivalente a 10 m; le manovre e le misure personalizzate non spostano il riferimento atmosferico. Il vento apparente cambia per altezza e velocità della barca. Un primo calcolo 5×4 produce carichi e circolazione; un aggiornamento a vortici a ferro di cavallo regolarizzati modifica reciprocamente il flusso sull’altra vela. Il calcolo finale usa 16×12 celle per vela (8×6 nella ricerca grossolana). Le scie geometriche si applicano anche al genoa. Questa è un’approssimazione accoppiata, non CFD viscosa tridimensionale.

I carichi alimentano un aggiornamento rilassato dell’armo. Una correzione empirica di cedevolezza riduce il sostegno delle pressioni oltre lo 0,8% di flessione laterale relativa o il 2,5% di catenaria dello strallo; dipende dalla deformazione, non da una tensione ideale. Il predittore strutturale quasi statico è condiviso da AUTO e simulazione continua; la posa transitoria del fiocco agisce nel calcolo finale delle pressioni, evitando riferimenti diversi a regime. Il modello usa un armo con rigidezze/precarichi assunti e distinzione fra geometria frazionata e in testa. La flessione riduce anche l’altezza e una curvatura eccessiva può peggiorare il sostegno dello strallo. Le lande/crocette restano fisse cambiando vela. Scotta e vang controllano la quota del boma; la scotta S2 cazzata ingrassa il piede. Le stecche hanno un effetto di sostegno moderato senza un optimum universale crescente col vento. I profili personalizzati sono superfici esplorative: angoli/giri/corde estremi possono non rispettare contemporaneamente tutte le lunghezze nominali.

Le celle integrano Δp n A sulla superficie fisica. CL/CD usano q e area nominale di riferimento; non vengono assegnati bonus di pressione per rispettare una forma ideale. Profondità, posizione del grasso, ritorno d’uscita e Reynolds della corda modificano una soglia empirica di recupero/separazione condivisa da pressioni e filetti. L’attrito usa anche il fattore di forma del profilo caricato. Attrito e drag indotto restano modelli empirici, senza risolvere lo strato limite. Momenti, altezza del centro di spinta, scarroccio e drag di deriva/timone contribuiscono all’assetto e alla spinta utile. La rigidezza raddrizzante e i centri dello scafo sono assunti: mancano carene rilevate, curve GZ misurate e una soluzione idrodinamica completa.

Alle basse velocità la portanza disponibile di deriva e timone limita il carico usato per il drag indotto: evita l’estrapolazione 1/V² del carico completo, che creava un falso equilibrio di ripartenza e una discontinuità a 50 Pa di pressione dinamica dell’acqua. La velocità usa una resistenza didattica `R(V) = F_ref (V/V_polare)^3`; il tempo di assestamento scala con massa e forza di riferimento. Dopo i cambi di vento la decelerazione usa per pochi secondi una risposta più rapida, per mostrare il degrado dell’assetto senza cambiare le forze o la velocità obiettivo; l’accelerazione conserva il modello precedente. Il 100% è il rapporto fra velocità stimata e target originale, non una certificazione fisica.

AUTO resta attivo dopo le modifiche a vento, manovre, riduzioni, inventario e forma; riavvia il calcolo dopo una breve pausa negli input. L’avanzamento considera ricerca del riferimento, regolazioni, flusso e convergenza finale; non anticipa il 95% prima di queste fasi. AUTO calibra il riferimento sul taglio originale a piena vela della famiglia scelta quando questa è in una fascia d’impiego ragionevole; fuori fascia il confronto usa l’inventario originale disponibile. Le fasce sono didattiche, non crossover misurati. Un margine dell’1,5% sulla spinta permette un assetto equilibrato. La ricerca multistart ottimizza manovre abilitate con intervalli graduali e dipendenti dall’andatura, senza imporre tutto al massimo a 20/30 nodi. Fra assetti con la spinta target disponibile valuta aderenza in regime alare ed esposizione/stabilità in poppa, accettando separazione appropriata e piccola orecchia S2. Una preferenza morbida di setup distingue candidati quasi equivalenti senza cambiare pressioni o velocità. In poppa molto poggiata il braccio AUTO resta in una finestra ragionevole attorno alla quadratura sull’apparente. La tolleranza di raggiungimento è 0,5% in velocità; non è una prova dell’ottimo globale.

Vele inadatte, profili estremi, riduzioni e manovre bloccate possono impedire il 100%. Il risultato rimane quello calcolato, senza sovrascritture del display. AUTO singolo prende solo il valore dal piano ottimizzato complessivo, indipendentemente dagli altri settaggi attuali ma rispettando i vincoli fissati.

Non vengono risolti elasticità completa della membrana, transizione viscosa, ogni collasso/rigonfiamento, onde variabili, instabilità del rollio o procedure reali d’issata/strambata. Il limite barber interno oltre 105% LP/J è una convenzione prudenziale del laboratorio, non una legge universale. Le frecce delle reazioni dello scafo sono stime di equilibrio; i vettori dell’armo sono interni e non vanno sommati alle forze esterne. Le traiettorie guidate delle particelle non risolvono tutte le turbolenze e non alimentano il calcolo delle forze. I coefficienti restano calcolati ed esportabili in CSV; non sono più un controllo della UI. I dettagli in “Modello” e “About” sono bilingui.

## Moduli principali

`aero.js`, `pressure-solver.js`, `aero-inflow.js`, `sail-flow.js`: campi e forze. `standing-rig.js`, `main-balance.js`, `jib-balance.js`, `fixed-sheets.js`: armo e manovre. `sail-geometry.js`, `flying-surface.js`, `sail-measures.js`: superfici. `sail-profiles.js` e `sail-design-editor.js`: profili e anteprima SVG senza secondo contesto WebGL. `force-data.js`, `force-view.js`, `force-controls.js`: vettori e centri. `trim-optimizer.js` / `trim-worker.js`: AUTO. `scene.js`: scena 3D. `info-pages.js`: riferimenti e ipotesi. `session-store.js`: persistenza validata e cancellazione. `ui-windows.js` / `workspace-layout.js`: pannello unico e layout responsivo. `speed-response.js`: risposta temporale educativa alle variazioni di vento.

## Verifiche

Sono disponibili benchmark di pressione (lamina sottile, raffinamento della griglia, conservazione delle forze e definizione CL/CD), misure 3D dei portanti, contatti con lo strallo e le sartie, scotte/barber, dinamica del fiocco, selezione/certificati, controlli disabilitati e test touch/geometria/DOM. Le nuove verifiche controllano causalità delle risposte descritte nei libri, corde fermate, profili e vettori, oltre a sei casi AUTO su bolina, lasco e poppa. La verifica v21 esplora tutti i 24 comandi a 0/50/100%, ogni nodo da 1 a 35, sei andature (40/60/90/120/155/180°) e le due mure: 840 contesti, 12.390 confronti e 48.020 calcoli delle pressioni. Il fiocco copre tutte le andature; A2 90/120/155°, S2 120/155/180°. Il CSV in `dist/audit/` riporta spinta utile e indicatore cubico di variazione della velocità a flusso apparente fissato; non è la soluzione a regime né un secondo VPP. Il comando diretto usa invece due soluzioni a regime reali. `scripts/audit-controls.mjs` consente di ripetere lo sweep. Griglia generica e 3 valori di corsa non dimostrano il comportamento di ogni barca, angolo o punto continuo. Esempi:

```sh
node tests/pressure.mjs
node tests/book-reference.mjs
node tests/advanced-profiles.mjs
node tests/book-auto.mjs
node tests/auto-start.mjs
node tests/live-steady.mjs
node tests/wind-interaction.mjs
node tests/wind-contact.mjs
node tests/session-store.mjs
node tests/speed-response.mjs
node tests/main-leech.mjs
node tests/wind-profile.mjs
node tests/main-gradient-auto.mjs
node --no-warnings --experimental-loader ./tests/render-loader.mjs tests/scene-frame.mjs
node tests/flying-surface.mjs
node tests/jib-sheet-balance.mjs
node tests/control-locks.mjs
node tests/worker.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/force-vectors.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/force-labels.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/telltales-and-profiles.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/mobile-and-cockpit.mjs
```

Il test `scene-frame` costruisce la scena Three.js reale ed esegue l’intero fotogramma, sostituendo solo il backend GPU: controlla che vento e scie non interrompano la chiamata al renderer, su entrambe le mure e con tutte le famiglie di vele.

Le verifiche automatiche geometriche e DOM non sostituiscono un controllo visivo WebGL su dispositivi reali. La verifica visiva nel browser non è disponibile nell’ambiente di sviluppo corrente.

## Licenze

Three.js/OrbitControls sono MIT; DM Sans e Space Grotesk sono OFL. I relativi file di licenza sono inclusi in `dist/vendor/`. I libri e i contenuti dei siti citati non sono ripubblicati nel progetto.
