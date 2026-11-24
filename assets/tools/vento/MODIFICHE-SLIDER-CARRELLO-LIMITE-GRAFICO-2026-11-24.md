# Modifiche 2026-11-24 — Visualizzazione grafica del limite di avanzamento del carrello

## Richiesta
Aggiungere nello slider del carrello della vela di prua una visualizzazione grafica del limite massimo di avanzamento rispetto alla vela.

## Intervento eseguito
- Aggiunto sotto allo slider `genoa.car` un riquadro grafico dedicato.
- Il riquadro mostra sulla stessa scala:
  - la **mura** della vela;
  - la **bugna** nominale;
  - il **binario** del carrello;
  - il **punto neutro** del lead;
  - il **fine corsa massimo di prua** evidenziato.
- Inserita anche una breve didascalia numerica del tipo:
  - `Fine corsa prua a X,XX m davanti alla bugna nominale`
  - oppure `Fine corsa prua allineato con la bugna nominale`.

## Note tecniche
- La scala grafica usa la stessa geometria impiegata dal dimensionamento del carrello secondo la guida `Headsail Track Travel & Sheeting Geometry Guide`.
- La modifica è solo di interfaccia: non cambia il comportamento fisico di scotta, carrello o barber.
- Il riquadro viene mostrato soltanto per il controllo del **carrello della vela di prua**.

## File toccati
- `dist/app.js`
- `dist/style.css`
