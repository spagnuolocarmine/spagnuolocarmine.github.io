# VENTO — Dimensionamento carrello fiocco/genoa secondo guida (24 novembre 2026)

## Fonte principale

*Headsail Track Travel & Sheeting Geometry Guide*, PDF fornito dall'utente, pagine 1–5. Questa revisione sostituisce **esclusivamente** il dimensionamento del carrello precedentemente impostato a 2× la lunghezza della base verso poppa e 1× verso prua. La misura E della randa, le polari e le proprietà statiche di twist non sono state modificate.

## Modello implementato

- Il punto di riferimento del tiro è la proiezione sulla quota di coperta della linea che parte dalla bugna e passa per il **45–55% dell'inferitura**; il neutro centrale usa il 50% (guida pag. 1). Le coordinate di bugna, mura e penna si ricavano dalle dimensioni della vela attualmente selezionata, dell'armo e dall'overlap LP/J. Il calcolo usa le dimensioni nominali, senza far muovere il binario con carichi, vento o scotta.
- La guida (pag. 2) richiede la distanza tra il punto neutro della vela minore e quello della maggiore, più i margini **0,30–0,50 m** a prua e a poppa, la dimensione del carrello **0,085–0,160 m**, e i fine corsa **0,03–0,06 m per lato**. Il modello ora aggiunge tali contributi nelle unità fisiche e li converte nelle unità scalate dell'app.
- Per un fiocco che non dispone di un inventario esplicito, il punto neutro viene calcolato dalla vela scelta; la variazione geometrica tra 45% e 55% fornisce la variazione base. Per un genoa potenzialmente avvolgibile, si aggiunge **un'ipotesi di riduzione fino a circa 95% LP/J**, senza pretendere che la simulazione disponga di un avvolgifiocco realmente misurato. È un'assunzione esplicita del software e non una misura di certificato.
- Come controllo di plausibilità si applicano gli intervalli di corsa della tabella di pag. 3: **0,6–1,0 m** per fiocco 75–85%, **0,9–1,5 m** per fiocco 95–105%, **1,8–3,0 m** per genoa avvolgibile 130–150%. Tra le classi si interpola; per overlap estremi >150% il limite viene esteso leggermente, poiché la tabella non copre quelle vele. In caso di conflitto, la corsa rappresentata privilegia il supporto geometrico della coperta e la fascia plausibile: non si garantisce la piena regolazione del genoa ridotto virtualmente all'estremo.
- L'angolo di tiro trasversale si basa sui valori della tabella di pag. 3 (circa 8° per fiocchi piccoli, 8,5° per #3 e 10,5–11,2° per genoa). Per non far apparire un binario fuori bordo, **la larghezza utile del ponte rappresentato prevale** sull'angolo teorico. Con barche eccezionali può risultare un angolo effettivo inferiore a quello consigliato, distinto nel modello dall'angolo desiderato.
- Il binario è limitato longitudinalmente alla coperta del modello. Il carrello, il cursore e il binario tridimensionale condividono esattamente gli stessi estremi. Carrello arretrato => maggiore effetto sulla base; carrello avanzato => maggiore effetto sulla balumina. Rimangono validi barber in consentito fino a overlap 105% e scotta completamente lasca allo 0%.

## Esempi (sloop laboratorio di 10 m; valori approssimati)

| Dimensione selettore | LP/J effettivo | Lunghezza binario | Posizione neutra longitudinale | Angolo di tiro preferito |
|---|---:|---:|---:|---:|
| 80% | ~75% | ~0,82 m | ~1,27 m | 8° |
| 105% | ~99% | ~1,05 m | ~0,11 m | 8,5° |
| 130% | ~122% | ~2,52 m | ~−1,05 m | 10,5° |
| 145% | ~136% | ~3,00 m | ~−1,75 m | 11,2° |

I riferimenti longitudinali sono le coordinate interne della scena, non misure del certificato.

## Verifiche eseguite

- Nuovo test `tests/headsail-track-guide.mjs`: **720 stati** scotta/carrello (di cui 180 senza tensione), verifica degli intervalli di guida, posizioni del rinvio, stabilità al vento, adattamento al taglio e abilitazione del barber in.
- **1.401 barche del catalogo**: estremi longitudinali sulla coperta e calcoli finiti con le misure disponibili.
- `tests/jib-car-force-distribution.mjs`: **120** stati verificati con carrello, angoli di tiro, forma/twist e sicurezza delle sartie.
- `tests/jib-sheet-balance.mjs`: **1.008** stati meccanici superati.
- `tests/jib-dynamics.mjs` e `tests/session-restore-startup.mjs` superati.
- `tests/headsail-rig-contact.mjs`: **26.676** controlli geometrici sulle sartie e sulle crocette superati (prima del ritocco conclusivo dei limiti di larghezza, che può soltanto avvicinare il rinvio al centro).
- `tests/scene-frame.mjs` non avviabile nella shell Node isolata per assenza della dipendenza esterna `three`: non equivale a una verifica visiva browser. Un test storico lungo su tutte le combinazioni non è stato portato a termine.

## Limiti tecnici da rispettare

La guida è una sintesi tecnica per scegliere l'hardware e richiede un **rilievo reale della coperta** e del percorso della scotta (pag. 5). I dati ORC da soli non forniscono le vere coordinate del binario, la posizione della rotaia, le interferenze con il tamburo dell'avvolgifiocco o la distribuzione effettiva delle sartie. L'app implementa un dimensionamento geometrico **stimato** per un laboratorio 3D, non una specifica meccanica pronta per un'installazione.
