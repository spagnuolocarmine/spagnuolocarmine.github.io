# VENTO — Verifica e modifiche del 20 novembre 2026

## Fonti utilizzate in questa revisione

- **Laura Romanò, *La barca veloce***, cap. 3: vele portanti, differenze simmetrico/asimmetrico, regolazioni, profondità e flusso.
- **Laura Romanò, *La fisica in barca a vela***, cap. 1 e 3–4: leggi del moto, massa, accelerazione, equilibrio fra propulsione e resistenza, vento apparente, forma aerodinamica.

I volumi allegati sono stati consultati, ma non sono copiati né inclusi nel file ZIP. I coefficienti numerici non specificati nei testi sono approssimazioni del modello, non misure dei libri.

## Interventi

1. Superfici dello spinnaker S2 e del gennaker A2: mantenuto il volume delle spalle alte, con profili differenziati. Penna fisica singola, drizza collegata all'armo, conservazione delle misure dichiarate SLU/SLE/SFL/SHW. La drizza scende in funzione di tensione e vincoli reali di lunghezza, non per un semplice aggiustamento grafico.
2. Dynamica di velocità: risposta di base limitata a 1,2–6 s, aumento temporaneo della reattività alle variazioni di vento e manovre, senza salti istantanei della velocità. Aggiornamento della pressione più frequente; evoluzione del fiocco compatibile con il passo di simulazione accelerato.
3. Pannello «Visuale & audio»: slider aggiornato a −20…+20 con zero centrale. −20: 0,05× (20 volte più lento); zero: 1×; +20: 20× della dinamica simulata. La preferenza viene conservata nella sessione e torna a zero con il reset.
4. Potenza a vele ridotte: riferimento provvisorio basato sull'inventario velico ORIGINALE, non sulla sola vela attiva. Confronto in termini di spinta utile e resistenza cubica, nessuna penalità di velocità percentuale assegnata a mano. A2 più sfavorito dello S2 in poppa piena attraverso un fattore empirico sulle pressioni, continuo con l'angolo apparente; polari ORC originali intatte.
5. Test di regressione su misure delle vele, forme e contatti, simulazione temporale, barche ORC e caso «solo randa»; documentazione di limiti e ipotesi aggiornata.

## Avvertenza tecnica

Si tratta di una simulazione didattica con potenziale inviscido, correzioni empiriche, input ORC e assetto semplificato, **non** di una previsione di velocità certificata né di una validazione in mare. Una forma perfettamente coincidente con una vela reale richiede rilievi tridimensionali del velaio; due libri descrivono i principi ma non forniscono il modello numerico specifico di ogni imbarcazione.
