# VENTO — Sloop laboratorio e risposta temporale

## Dati certificati e interfaccia

Lo **Sloop laboratorio da 10 m** non possiede una polare ORC. Per questa imbarcazione sono nascosti i target, la percentuale e la barra di efficienza sia nel pannello **Dati** sia nella telemetria superiore, oltre al grafico e alle note sulle polari ORC. Le etichette, i testi AUTO, la guida e il pannello Modello non attribuiscono risultati certificati allo sloop. Quando viene scelta una barca con una vera polare ORC, le informazioni ricompaiono; tornando allo sloop scompaiono di nuovo.

La velocità dello sloop resta **una stima didattica interna** e non diventa una polare ORC né un risultato validato. I dati ORC originali e le prestazioni delle barche certificate non sono alterati.

## Slider della risposta

Lo slider di **Visuale & audio** offre da −20 a +20, con 0 iniziale e salvato per sessione:

- −20: **0,05×** del tempo simulato per unità di tempo reale (venti volte più lento).
- 0: **1×** (risposta normale).
- +20: **20×** (venti volte più veloce).

L'etichetta mostra esclusivamente il moltiplicatore, senza riportare anche il valore grezzo dello slider. Gli estremi e il centro sotto al cursore riportano solo i moltiplicatori. La dinamica del fiocco integra il passo simulato anche a 20×. La modifica non aumenta le prestazioni di equilibrio dell'imbarcazione né cambia i coefficienti aerodinamici.

## Verifiche

Aggiornati i test sulla risposta 0,05×/1×/20×, la persistenza del valore e la presenza selettiva degli indicatori. Verificati con Node i moduli modificati e i test mirati su certificati e dinamica del fiocco. Il browser Chromium disponibile in questo ambiente impedisce la navigazione alle pagine locali per policy di amministrazione; non si dichiara quindi concluso un collaudo interattivo completo nel browser.
