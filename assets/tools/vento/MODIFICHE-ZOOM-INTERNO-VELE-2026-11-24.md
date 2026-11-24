# Modifiche 2026-11-24 — Zoom randa e vela di prua dal lato interno

## Richiesta
Correggere le viste rapide **Zoom randa** e **Zoom vela di prua** affinché siano dal **lato interno della vela**, con inquadratura dal basso verso l'alto.

## Intervento eseguito
- Modificati i preset di camera in `dist/scene.js`.
- **Zoom randa**:
  - camera mantenuta bassa;
  - lato invertito per osservare la vela dal **lato interno**;
  - inquadratura mantenuta dal basso verso la penna.
- **Zoom vela di prua**:
  - camera mantenuta bassa;
  - lato invertito per osservare la vela dal **lato interno**;
  - posizione spostata sul lato **interno/poppiero** della vela, così la vista non arriva più da prua ma dal lato del pozzetto/slot.

## Effetto
Le due viste ravvicinate mostrano ora più chiaramente la concavità, le linee di forma e la distribuzione del twist dal lato interno della vela.

## File modificati
- `dist/scene.js`
