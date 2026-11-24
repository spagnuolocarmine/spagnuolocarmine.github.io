# VENTO — Carrello del fiocco/genoa, scotta e sartie basse

Data: 24 novembre 2026. Base: versione «base randa e boma» con tutte le modifiche precedenti conservate.

## Principi fisici usati

**Fonti allegate dall'utente**: *La barca veloce*, capitolo 1, sezione «Il carrello»; *La fisica in barca a vela: comprendere le forze in gioco e migliorare le prestazioni* (forze e risposta delle vele). I testi distinguono gli effetti della posizione del punto di scotta: arretrandolo aumenta il tiro sulla base, la bugna tende a salire e la balumina si apre; avanzandolo aumenta il tiro sulla balumina, con minore svergolamento. Non prescrivono una distanza universale dalla sartia né la percentuale di tiro applicabile a ogni scafo e a ogni vela.

## Correzioni implementate

1. **Tiro tridimensionale**: la forza della scotta è determinata dalla direzione vera bugna→rinvio, con componenti risolte sulla direzione di base (verso poppa) e sulla verticale discendente (balumina). Non viene imposto un fattore artificiale di prestazione in base al numero dello slider. La quota del tiro varia con la posizione del carrello, la dimensione della vela e la deformazione dell'armo.
2. **Svergolamento carrello**: è corretto il segno della risposta: carrello arretrato → più twist effettivo e balumina aperta; avanzato → meno twist e più tensione sulla balumina. Il **twist diretto della vela rimane statico**, inizialmente 10°, modificabile soltanto dall'utente nell'intervallo 0–50°; AUTO non lo usa come manovra.
3. **Distensione della base**: il profilo tridimensionale in basso viene progressivamente appiattito dal carico longitudinale della scotta, in particolare a carrello arretrato e scotta cazzata. La regolazione fino al 120% resta disponibile e agisce sulla forma reale usata dal modello aerodinamico.
4. **Fine corsa anteriore per vela**: l'hardware del binario non cambia e non si sposta cambiando la misura della vela; il punto *utile* più avanzato è limitato in funzione di HLP, del profilo e dell'armo, usando un angolo chiuso cautelativo. Il rinvio non deve andare davanti alla bugna e invertire il verso utile del tiro. La posizione percentuale e la distanza in metri dell'editor corrispondono alla corsa utile.
5. **Contatto con sartie e crocette**: il limite usa la **superficie curva effettivamente caricata** e la distanza geometrica dalle sartie; include sezioni ravvicinate alla base e controlli sulle crocette. Rimossa una precedente condizione di semipiano che bloccava la vela a distanza non fisica. Il controllo opera anche con scotta extra-cazzata al 120%. Non viene consentito di attraversare l'armo per simulare un contatto più marcato.
6. **Scotta completamente mollata**: è previsto un margine di apertura rispetto alla battuta caricata, proporzionale al vento apparente: ciò evita che un fiocco senza tensione resti «incollato» al limite delle sartie. L'ampiezza di 18° è una calibrazione didattica del programma, **non** un valore prescritto dai libri.

## Verifiche numeriche effettuate

- **120** posizioni carrello × combinazioni di vele 80–185%, intensità del vento e mura: controllata la progressione della componente balumina/base, la posizione del rinvio dietro la bugna, il twist effettivo e l'immutabilità del twist statico.
- **26.676** intersezioni raggio/mesh 3D con sartie e crocette, sulle due mura, con veli 105–160%, cinque posizioni di scotta più l'estremo supplementare al **120%**: nessuna intersezione nel campione testato.
- **1.008** combinazioni carrello/scotta/vento per il bilancio meccanico del genoa, più verifiche dinamiche e sul binario: test superati.
- Nel caso didattico di genoa 160%, carrello arretrato, scotta completamente cazzata, vento reale 8 e angolo ±52°, la griglia di campionamento trova una distanza minima approssimata di circa **8 cm** dalle sartie basse. Non è un contatto forte: il blocco dipende dalla forma e dalle interferenze delle sezioni alte e delle crocette. Un fiocco non sovrapposto dell'80% rimane molto più lontano, come richiesto dalla sua geometria.

## Limitazioni e questioni non risolte

Il modello di barca e armo è didattico, con geometria ricostruita e coefficienti strutturali approssimati. **Non si può garantire un contatto completo o una compressione della tela sulle sartie basse per ogni genoa** senza un modello elastico 3D calibrato sulla singola vela/armo. In presenza di una collisione delle sezioni superiori, il sistema si ferma prima: non inventa la compenetrazione richiesta da un vincolo puramente visivo. Neppure i due libri forniscono dati sufficienti a calibrare quel contatto specifico.

Rimangono due anomalie di regressione già note nella versione di partenza: l'asserzione molto stretta di proporzionalità esatta della corsa in `tests/sheet-travel.mjs` non tiene pienamente conto dell'armo che si deforma durante il carico; `tests/catalog-and-measures.mjs` incontra una discrepanza di una polare del catalogo prima di raggiungere i test geometrici. Il collaudo interattivo WebGL su browser non è stato possibile nell'ambiente corrente. La nuova verifica non sostituisce prove di navigazione su una barca reale.
