# VENTO — Vento apparente, twist, quadratura e barber (23 novembre 2026)

Questa release parte dall'archivio «VENTO-aggiornato-sloop-laboratorio-slider-20x.zip». Non modifica le polari dei certificati ORC e conserva le modifiche precedenti.

## 1. Vento reale e apparente

L'angolo apparente (AWA) compare accanto all'angolo reale (TWA) nella barra superiore, nel pannello Vento (anche ridotto), nei controlli della direzione e nel pannello Dati. L'AWA è ricalcolato dalla velocità attuale della barca, dalla velocità del vento reale e dalla sua direzione a ogni aggiornamento della telemetria, anche durante l'accelerazione. La fisica di VENTO utilizzava già la stessa trasformazione vettoriale; i nuovi indicatori non introducono un secondo modello del vento.

## 2. Twist di randa e fiocco/genoa

Nel pannello delle manovre sono disponibili i comandi **Svergolamento diretto** per randa e fiocco/genoa. Valore iniziale 10°, escursione 0–50° a passi di 1°. La rotazione delle corde è distribuita linearmente secondo la quota h della vela: `angolo_sezione = twist * h` (base h=0, testa h=1). La geometria modificata alimenta sia il rendering sia il calcolo delle forze aerodinamiche e la ricerca delle interferenze con l'armo.

I vincoli di contatto con le sartie possono limitare l'orientamento effettivo di alcune sezioni; le regolazioni di scotta, vang, stecche e carrello conservano la propria influenza fisica. Il controllo è compatibile con il ripristino delle sessioni e con la ricerca AUTO, senza cancellare le regolazioni manuali.

## 3. Tangone spinnaker a 90°

Con il braccio al 100%, la quadratura geometrica del tangone è ora di **90° rispetto all'asse longitudinale** della barca (prima 88°). Il pannello della manovra riporta l'angolo effettivo, come anche il riepilogo dell'assetto dello spinnaker. Il tangone può assumere angoli intermedi fino al fine corsa, ma il valore migliore dipende dal vento apparente.

## 4. Barber di scotta spinnaker

A barber completamente lascato (0%), il percorso grafico e meccanico della scotta passa direttamente dalla bugna al rinvio di poppa, **senza anello deviante imposto**. Il barber stesso può avere catenaria libera. Aumentando la tensione, l'anello reintroduce gradualmente un rinvio e modifica l'altezza della bugna e la forma della vela.

## Fondamento tecnico e limiti

Sono stati consultati entrambi i libri forniti dall'utente:

- **La barca veloce**: cap. 1 (definizione dell'angolo di svergolamento rispetto alla corda della base); cap. 2 (influenza dello svergolamento e delle regolazioni); cap. 3 (ruolo del braccio, quadratura del tangone e barber-hauler per spostare il punto di scotta).
- **La fisica in barca a vela: Comprendere le forze in gioco e migliorare le prestazioni**: sezioni sul moto relativo e sul vento apparente; sezioni sulle regolazioni di scotta, carrello e vang e la risposta aerodinamica.

**Non sono valori certificati né derivati numericamente dai libri:** 10° iniziali, intervallo 0–50°, legge lineare del controllo, coefficienti del contributo delle altre manovre e massimi di corsa. Sono parametri didattici richiesti o scelte di implementazione. Nessun nuovo coefficiente costituisce validazione sperimentale o certificato ORC.

## Test eseguiti

`node tests/wind-twist-spinnaker-barber.mjs`: verifica valore iniziale, limiti di controllo, proporzionalità lungo la vela, variazione della geometria e della spinta, vento apparente, 90° del tangone, barber libero e presenza delle letture nella UI.

Regressioni passate: `tests/geometry.mjs`, `tests/flying-surface.mjs`, `tests/rigging-and-sails.mjs`, `tests/session-store.mjs`, `tests/advanced-profiles.mjs`, `tests/laboratory-polar-ui.mjs`, `tests/certificate-polar-and-sail-sizing.mjs`, `tests/book-reference.mjs`, `tests/picking.mjs`, `tests/wind-and-controls.mjs` (gli ultimi due con `--experimental-loader ./tests/three-loader.mjs`).

Il collaudo browser con WebGL e interazione completa non ha prodotto uno screenshot affidabile in quest'ambiente; i controlli numerici e statici indicati sopra sono stati eseguiti separatamente.
