# Modifiche 2026-11-24 — Finestre tuga integrate nel modello

## Richiesta
Eliminare le finestre della tuga dal modello come oggetti separati, integrandole nella tuga.

## Intervento eseguito
- Rimosse dal file `dist/scene.js` le due mesh laterali in vetro della tuga.
- La tuga rimane ora rappresentata come superficie continua, senza elementi vetrati laterali sovrapposti come oggetti distinti.

## Note
- La modifica riguarda il modello 3D della barca.
- Non altera geometria velica, fisica, controlli o prestazioni.
- L'osteriggio trasparente superiore non è stato modificato, perché non rientrava esplicitamente nella richiesta sulle finestre laterali della tuga.

## File modificati
- `dist/scene.js`
