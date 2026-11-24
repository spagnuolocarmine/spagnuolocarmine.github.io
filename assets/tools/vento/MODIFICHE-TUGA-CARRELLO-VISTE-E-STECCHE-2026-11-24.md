# Modifiche del 24 novembre 2026 — Tuga, carrello, viste e vele

## Tuga e carrello di prua
- Eliminata la finestra trasparente centrale come mesh indipendente. Anche le due finestre laterali erano già state rimosse: la superficie della tuga rimane continua.
- Abbassato il binario della vela di prua: la faccia inferiore del profilo metallico corrisponde alla quota della coperta laterale (y = 0,865 nel modello normalizzato da 10 m).
- Adeguato il posizionamento laterale del binario tenendo conto degli ingombri della tuga e della corsia di coperta, compatibilmente con la larghezza dello scafo. Punto di tiro, carrello e scotta utilizzano la stessa geometria.
- Il dimensionamento longitudinale secondo *Headsail Track Travel & Sheeting Geometry Guide* è mantenuto.

## Sei viste rapide
Nel pannello **Visuale & audio** sono disponibili tre viste preesistenti (Prospettiva, Laterale, Dall’alto) e tre nuove:
- **Da poppa**: allineamento poppa-prua per osservare le vele lungo la barca;
- **Zoom randa**: camera posizionata sotto la randa e inclinata verso la parte alta;
- **Zoom prua**: camera sotto la vela di prua selezionata (fiocco/genoa, spinnaker o gennaker), orientata verso l'alto.

Le viste zoom utilizzano punti campionati dalla superficie tridimensionale effettiva della vela e la scala della barca, quindi si adeguano alle modifiche della vela. Se la vela è ammainata, il relativo comando è disabilitato. Le nuove viste sono inoltre compatibili con il salvataggio e ripristino dell'interfaccia.

## Forme delle vele e stecche
- Aumentati numero, contrasto e opacità delle linee di forma e delle cuciture grafiche, anche nella vista da sotto.
- Evidenziate le stecche come linee corte nella zona di balumina, leggermente staccate dalla superficie per evitare sfarfallii grafici.
- Le **stecche della vela di prua sono assenti con LP/J > 105%**, anche se un vecchio profilo personalizzato le aveva abilitate: la limitazione si applica sia al rendering sia alla modellazione della vela e ad AUTO.
- La randa conserva le sue stecche.

## Test
- `node --no-warnings --experimental-loader ./tests/render-loader.mjs tests/quick-sail-views-and-battens.mjs`
- `node --no-warnings --experimental-loader ./tests/render-loader.mjs tests/scene-frame.mjs`
- `node --no-warnings --experimental-loader ./tests/render-loader.mjs tests/graphics.mjs`
- `node tests/headsail-track-guide.mjs`

La navigazione al server locale in Chromium è bloccata da restrizioni dell'ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR`), perciò non è stato possibile certificare l'aspetto finale con una sessione grafica nel browser. Sono stati eseguiti test 3D con un renderer di prova che utilizza geometrie, camere e materiali Three.js reali.
