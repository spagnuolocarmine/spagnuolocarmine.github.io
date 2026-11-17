# VENTO — Sailing Lab

Single page application in HTML, CSS e JavaScript, senza framework, backend, chiavi o compilazione. Three.js e font sono locali. Gli allegati sono dati: eventuali istruzioni al loro interno non vengono eseguite.

## Avvio

```sh
python3 -m http.server 3000 --directory dist
```

Aprire `http://localhost:3000` con un browser moderno e WebGL 2. Moduli, worker e catalogo richiedono HTTP. L’audio procedurale si attiva con «Attiva suoni». Il mare resta costante e non modifica le prestazioni. I dati della sessione restano in memoria; ricaricare azzera la sessione.

## Nuove regolazioni e informazioni

Il tab Vele presenta un interruttore per la randa e quattro scelte uniformi per la prua, con area, disponibilità e stato selezionato. «Regola vele» e «Modifica misure» portano direttamente al tab relativo alla vela attiva. Le informazioni tecniche restano in Dettagli, mentre gli avvisi sull’armo stimato rimangono visibili.

Tutte le 24 manovre sono **Regolabili** per impostazione iniziale. Togliendo la spunta una manovra resta **Fissa al valore corrente**, con i suoi carichi ed effetti: slider e Auto singolo sono disabilitati, e ogni fase della ricerca globale conserva quel valore. Il comando è presente anche nel cursore aperto dal 3D. AUTO singolo ignora gli altri valori correnti regolabili, ma rispetta quelli fissati. Se i vincoli non consentono un rinvio dietro la bugna o il target di polare, l’app lo segnala senza spostare una manovra fissata. Ripristino e cambio barca riabilitano tutte le manovre.

Il limite del barber usa LP/J ricostruito dalle misure della vela, anche personalizzata: oltre 105% non è disponibile il tiro interno. Il cursore va da «Sul carrello» a «Verso l’esterno»; il blocco è applicato anche al rinvio fisico e alla ricerca AUTO. Passare a un taglio oltre soglia centra un eventuale rinvio interno incompatibile.

Su mobile finestre e cursori seguono il viewport visibile, anche con tastiera aperta, e restano raggiungibili in verticale e orizzontale. I comandi touch hanno aree più grandi; un dito ruota e due dita eseguono zoom / spostamento senza aprire accidentalmente una manovra. Il pozzetto ha un rivestimento continuo che chiude i vuoti sotto pagliolo e paramare mantenendo l’apertura di accesso sopra la soglia di poppa. I test usano geometria Three.js e un ambiente DOM con limiti simulati; non sostituiscono una prova visiva WebGL su un dispositivo reale.

L’avvio e il ripristino usano vento a 45° dalla prua e 12 kn. Il pannello Regolazioni ha quattro tab: Vele, Manovre, Armo e Misure; tutti i dati del profilo e dell’armo restano disponibili. Spinnaker e gennaker hanno una drizza selezionabile anche in 3D: cambia l’altezza della testa, la profondità, lo svergolamento e il sostegno della pressione. AUTO include entrambe le drizze con domanda progressiva del vento.

Ogni manovra ha un tasto Auto nel pannello e nel comando 3D. Calcola l’assetto ideale completo per vento, piano e misure selezionati, con avvii canonici indipendenti dalle regolazioni correnti. Applica soltanto il valore richiesto; gli altri comandi restano invariati. Le note rendono esplicita questa distinzione. Una cache dipende da barca, vento, piano e misure, non dai settaggi correnti.

About, dopo Modello e con un’icona distinta, cita [Kaggle Sailing Boats](https://www.kaggle.com/datasets/opendatasource/sailing-boats) per le specifiche e [ORC RMS files](https://orc.org/race-managment/rms-files) per i certificati. Indica finalità didattica non commerciale, accesso ai dati sorgente in sola lettura, nessuna alterazione o ripubblicazione pubblica dei dati e nessun nuovo scorer o VPP. Download e ZIP restituiscono copie dei dati al titolare del laboratorio privato. Le modifiche alle vele sono scenari separati dai dati originali. Riporta sviluppo con GPT-6.1 Sol e Codex, ottimizzazione parziale e verifiche principali dello sviluppatore. Le approssimazioni tecniche complete restano nella modale Modello; la Guida è una panoramica breve delle funzioni.

## Barca, certificato e armo

«Barca» nella pulsantiera sinistra apre un select nativo con tutte le **1.401 barche** di `ITA_ORC.json`, ricerca per nome/modello/numero e pulsante esplicito «Usa questa barca». «Visualizza certificato» nella scelta barca mostra Panoramica, Vele, Polare, Rating e Tutti i dati, con filtro e download JSON originale. L’archivio completo conserva tutti i 423.527 campi foglia senza alterazioni; il laboratorio non modifica il certificato.

Le **superfici iniziali vengono dal certificato ORC**. Le modifiche esplorative hanno invece area libera, calcolata dalle misure inserite, senza cambiare certificato o polare. La percentuale della vela di prua resta nascosta sulle barche del catalogo; LP/J e sovrapposizione derivano dalle dimensioni effettive e da J. Cliccare la vela di prua attiva o «Nessuna vela di prua» la ammaina e permette la sola randa. Una tipologia assente dal certificato può essere creata modificando le sue misure, con marcatura esplorativa; ripristinarla rimuove questa disponibilità aggiunta.

`sailing_database.json` è la fonte prioritaria per le dimensioni e il tipo d’armo: 1.597 modelli con misure anche in stringhe miste imperiali/metriche, convertite usando la parte in metri. P/E limitano la randa, I/J definiscono attacchi dello strallo e LP/J. Il tipo d’armo e, dove presente, l’altezza dell’albero da DWL aiutano a distinguere un frazionato da un armo in testa. Il file non fornisce Isp, SPL e TPS come campi dedicati: sono stime contrassegnate. Isp deriva dall’altezza da DWL meno una quota di coperta assunta pari al 10% della lunghezza, oppure dal rapporto del frazionamento; SPL è assunto pari a J, TPS a J più un bompresso stimato al 10% della lunghezza se è disponibile un asimmetrico ORC. Le quote vengono tenute compatibili con P e I.

`gold-boat.json` completa i modelli mancanti con P/E/I/J. Aree e prestazioni di entrambe le banche dati sono ignorate: rimangono quelle del certificato ORC. Il collegamento usa 1.023 riferimenti dal nuovo database e 378 da gold: 670 corrispondenze di modello, 154 compatibili e 577 ricostruzioni da barca simile. Queste ultime vengono selezionate per lunghezza, baglio e compatibilità delle dimensioni con le aree ORC, poi scalate alla lunghezza della barca. Modello, variante, fonte, scala e quote stimate sono indicati nel pannello Armo. Un avviso sempre visibile sulla scheda della barca segnala i riferimenti compatibili o simili. Tutti i campi originali e le polari ORC restano invariati.

Per rigenerare le associazioni:

```sh
node scripts/build-rig-catalog.mjs
```

Scafo, coperta e hardware sono parametrici, adattati a lunghezza e baglio reali; non riproducono la carena rilevata di ciascuna barca. Le coordinate interne sono normalizzate su 10 m, le posizioni mostrate sono metri reali. Lo sloop laboratorio conserva dimensioni e percentuali libere come esperimento distinto dai certificati.

## Corde e portanti S2

Il tab «Misure» modifica indipendentemente P/E/MQW/MHW/MTW/MUW/MHB, HLU/HLP/HQW/HHW/HTW/HUW/HHB oppure SLU/SLE/SFL/SHW. Nessuna corda compensa le altre e anche SLU/SLE del simmetrico restano indipendenti. I valori positivi e finiti vengono accettati senza un massimo dimensionale imposto. I campi rossi e le note segnalano rapporti insoliti, superamento di boma/strallo/armo e combinazioni geometricamente incompatibili. Per queste ultime una superficie approssimata mantiene visibile l’esperimento e alimenta lo stesso solutore. Le aree modificate entrano nel carico dell’armo, nelle forze e nelle stime; la polare originale resta il riferimento. «Ripristina questa vela» recupera la ricostruzione iniziale.

Le aree seguono le formule ORC 2026, articoli 109, 111, 113 e 114. Per i portanti:

`A = ASL × (SFL + 4 SHW) / 6`, dove ASL = (SLU + SLE)/2; sul simmetrico SLU = SLE. SHW/SFL deve essere almeno 0,75.

I portanti iniziali seguono le formule di riferimento richieste. Sullo spinnaker S2, SLU ≈ 0,95 √(I²+J²), SLE = SLU, base nominale 1,80 SPL e SHW/SFL fra 1,00 e 1,05. Sul gennaker A2, SLU ≈ 1,03–1,08 √(Isp²+TPS²), SLE fra 0,88 e 0,92 SLU, base nominale 1,65–1,85 TPS e SHW/SFL fra 0,92 e 1,00. Le basi effettive sono risolte dall’area ORC: le formule dimensionali sono approssimazioni e non possono prevalere sui m² certificati. Due tagli del catalogo richiedono un’inferitura fuori dall’intervallo guida per ammettere una superficie regolare; la selezione di quei portanti mostra un avviso. Il taglio conserva archi e corda media. Senza le corde originali non è possibile identificare un’unica vela reale. Nell’editor libero SHW/SFL = 0,75 è solo una soglia diagnostica, non un vincolo bloccante; la famiglia iniziale non seleziona automaticamente Code 0/A0.


Le corde di randa e fiocco sono ricostruite a frazioni della balumina; la randa iniziale mantiene il roach fuori dalla congiungente testa–bugna. Le forme gonfie, le rigidezze e il grasso sono ipotesi didattiche. Modificare le corde cambia geometria e pressioni, lasciando invariata la polare originale.

Riferimenti: [misure vele ORC](https://orc.org/measurements/sails), [misure armo](https://orc.org/measurements/rig), [ORC Rating Systems 2026](https://orc.org/uploads/files/Rules-Regulations/2026/ORC-Rating-Systems-2026.pdf).

## Ricostruzione tridimensionale dei portanti

Le formule di area sono quelle di [ORC Rating Systems 2026, §§113–114](https://orc.org/uploads/files/Rules-Regulations/2026/ORC-Rating-Systems-2026.pdf): `A_sym = SLU × (SFL + 4 SHW) / 6` e `A_asym = (SLU + SLE) × (SFL + 4 SHW) / 12`. I m² originali sono il riferimento iniziale; nelle vele modificate l’area nominale segue le misure indipendenti. Per un simmetrico con ralinghe diverse si usa la loro media e si segnala la perdita di simmetria. Le misure ORC non identificano un'unica superficie in volo.

La nuova superficie sostituisce la trasformazione obliqua del taglio piano. Le ralinghe sono archi quadratici tridimensionali `Q(t) = (1−t)A + tB + 2t(1−t)bN`, con `N` unitario e perpendicolare a `B−A`. Si risolve `b` dalla lunghezza analitica dell'arco e si parametrizza la ralinga per frazione della sua lunghezza. Le sezioni trasversali sono due archi circolari tangenti al massimo grasso: con semibase `a` e profondità `h`, `R = (a²+h²)/(2h)`, `θ = 2 atan(h/a)` e lunghezza `Rθ`. La loro somma conserva SFL alla base e SHW fra i punti a metà delle ralinghe. Il punto di massimo grasso dell'asimmetrico può stare a prua della metà della corda. Test indipendenti rimisurano le quattro lunghezze sulla mesh 3D.

La base gonfia verso prua. La corsa di scotta si arresta prima che il tessuto attraversi lo strallo, con tutta la scala del cursore ridistribuita sull'arco disponibile. Una testa parzialmente issata resta sulla drizza esterna davanti allo strallo. Le bugne seguono gli attacchi reali: con tangone quadrato la bugna sopravvento può stare al traverso dell'albero, mentre il corpo resta libero a prua. Per l'assetto del tangone si fa riferimento alle [indicazioni Seldén](https://support.seldenmast.com/files/595-560-E.pdf), che raccomandano bugne circa alla stessa quota e tangone perpendicolare al vento apparente. Lo squilibrio di quota entra in un recupero di pressione empirico continuo `1 / (1 + (atan(Δh / corda_base) / 0,30)²)`, applicato alle celle Cp che generano mappa, lift e drag. La scala angolare è un'ipotesi didattica, non una prescrizione ORC o una validazione FSI. L'area di riferimento delle forze è quella del certificato per vele originali e quella nominale delle misure per vele personalizzate; l'area geometrica in volo è riportata separatamente.

## Comandi, grafica e navigazione

Le 24 manovre modificano la geometria condivisa con il solutore. Il clic su cima/cavo/carrello apre uno slider spostabile e richiudibile con ×, Esc o sfondo. Le cime sono tubi colorati, senza linea visibile sovrapposta; una tolleranza invisibile facilita il clic. Una breve luce tenue evidenzia le regioni interessate dalla regolazione.

- La randa ha drizza, Cunningham, base, carrello, scotta, stecche e vang. Il carrello copre tutta la larghezza del pozzetto; le direzioni «Sopravento» e «Sottovento» seguono le mure. La randa e il boma si arrestano prima di attraversare la sartia sottovento.
- Il fiocco/genoa ha carrello, un barber bidirezionale fino al 105% LP/J e solo esterno oltre soglia, scotta e drizza, più stecche sul fiocco. La scotta tira tridimensionalmente la bugna verso il rinvio. Lascando il vento apre la vela verso l’esterno e può sollevare la bugna; cazzando la vela si chiude. La bugna si muove con inferitura e lunghezze inferite vincolate: non si estende artificialmente per raggiungere il carrello. L’allineamento verticale dipende dal taglio e dalla posizione del rinvio, quindi non è un fine corsa universale. Il tiro passa dal centro della puleggia. Dal winch il percorso è **carrello → rinvio barber → bugna**. Barber a zero centrato sul carrello, negativo verso albero se LP/J ≤105%, positivo verso esterno; colore rosa distinto dalla scotta azzurra.
- Lo spinnaker ha scotta, braccio, barber su entrambi e un solo comando **Caricalto / caricabasso**. Il cursore indica la quota della varea in metri e coordina le due cime. Sul laboratorio da 10 m il piede del tangone è a circa 2,42 m e la varea iniziale a 3,02 m, regolabile da 1,77 a 4,27 m. La lunghezza resta SPL durante alzata e rotazione; l’attacco segue l’albero caricato. Il braccio va dall’avanzato al quadrato, fermandosi prima di portare il tangone dietro l’albero. I barber agiscono sui rinvii e restano indipendenti dall’altezza della varea. Il tangone e le due cime aprono lo stesso slider dal clic 3D; AUTO ricerca anche questa regolazione.
- Il gennaker ha mura e scotta. Tutte le scotte di prua arrivano a completamente mollato, con cime lasche e scarico della pressione portante. Il fiocco in bandiera mantiene la resistenza residua d’attrito; non diventa privo di ogni forza aerodinamica. Il passaggio è graduale.
- Paterazzo, strallo e sartie modificano flessione, rake, prebend e catenaria. Tensioni e rigidezze sono assunte, adattate per scala; non sono verifiche strutturali della barca reale.

Sul laboratorio da 10 m il carrello randa copre 2,70 m e il genoa 4,90 m, dal pozzetto fino a 1,25 m a prua delle sartie. Sulle barche certificate gli attacchi e il fine corsa di prua seguono anche J e la posizione dell’albero. I comandi di posizione accettano passi di 1 mm. Scafo filante, poppa aperta raccordata, carrelli arrotondati e vele con linee di forma e telltales su entrambi i lati.

Il vento ambientale parte da **264 particelle raggruppate in 12 flussi**, con distanza trasversale molto ridotta fra particelle dello stesso flusso, punti più piccoli e luminosità ridotta, senza nastri ambientali o linee sovrapposte. La direzione indica la provenienza e le particelle avanzano verso sottovento; la velocità di trasporto varia senza salti di fase al cambiare dell’intensità. Le sole scie aerodinamiche usano nastri visibili, secondo vento apparente e separazione locale. Subito sotto «Flussi del vento», quando il comando è attivo, si possono regolare quantità di flussi e particelle (50–400%, da 6 flussi / 96 particelle a 48 flussi / 2.112 particelle), dimensione delle particelle (50–250%) e colore mediante selettore. Queste preferenze vengono salvate nel browser e conservate al cambio barca e al ripristino; cambiano solo la rappresentazione grafica, non vento, pressioni o prestazioni. I flussi ambientali sono blu scuro per impostazione iniziale; le scie sfumano dal rosso vicino alla vela al giallo in coda, con opacità crescente al crescere della separazione. Le scie sono qualitative, non turbolenza 3D risolta.

Rotella, pinch e +/− per zoom; destro, Shift + trascinamento, due dita o modalità Sposta per pan libero. Le viste predefinite ricentrano. Tutte le modali e lo slider contestuale si trascinano dalla propria barra, supportano frecce/Home/doppio clic e rimangono nel viewport. La barra superiore mostra il nome della barca selezionata e il selettore Italiano / English; la scena non ha didascalie fisse o indicatore live. La lingua si applica a pannelli, manovre, messaggi, guida, modello e intestazioni dei certificati, senza cambiare nomi delle barche, codici ORC o dati originali scaricati. Le intestazioni tradotte dei certificati restano ricercabili. La preferenza di lingua viene salvata nel browser. Le finestre Vento, Regolazioni, Dati e Visuale si aprono e si chiudono esclusivamente dalla pulsantiera sinistra. Compaiono a sinistra, possono restare aperte insieme e si spostano liberamente con mouse, touch o tastiera; Esc chiude quella in primo piano. Barra, intestazioni e chiusure rimangono raggiungibili al cambio di viewport. Barca, Guida e Modello seguono lo stesso comportamento e non bloccano la pulsantiera. Il certificato si apre dalla scelta della barca. La scena usa tutta la superficie disponibile senza strumenti fissi in basso. Dati & polare comprende vento reale, direzione, target, rendimento ed eventuali CL/CD. Visuale raccoglie viste, zoom, spostamento, ricentratura, suoni e pausa. Palette bianca, azzurra e blu per interfaccia e mare, con i colori distintivi delle manovre e della pressione preservati.

## Scotte, contatto con l’armo e profili

Gli slider delle quattro scotte misurano **corsa utile**, non una percentuale della forza del winch. Tutta la scala 0–100% è distribuita sull’arco geometrico: 0 è il più libero allineamento al vento consentito dall’armo, 100 il massimo avvicinamento al rinvio senza deformare le dimensioni della vela o attraversare l’armo. Il fiocco mantiene HLP e base/balumina inferite; i portanti mantengono la base e gli attacchi. La randa usa tutta l’apertura disponibile prima delle sartie, senza un tratto iniziale già saturato dal contatto. La tensione è una stima conseguente al carico e alla leva, distinta dalla percentuale dello slider.

`sail-flow.js` calcola il vento apparente da intensità, direzione e velocità corrente della barca. Il fiocco usa un vincolo di corsa smorzato, con carichi di vento, peso, tiro e reazione del vincolo geometrico. Il massimo di tiro stimato è limitato a 18 kN sul riferimento da 10 m; al limite geometrico il modello comprende una reazione di battuta, senza rappresentare una tensione infinita o certificare carichi reali. Il comando manuale 0/100 non viene ritagliato da AUTO; la posizione corrente si assesta con inerzia e smorzamento lineare e quadratico. Le pressioni seguono la superficie corrente durante il movimento.

Oltre il 105% LP/J le lande sono interne e le crocette coerentemente più corte; fino al 105% le lande restano in falchetta con crocette arretrate. La geometria è inferita perché i file non forniscono gli attacchi reali. Vele, sartie e crocette condividono le coordinate. Un limite di contatto dipendente dalle sezioni della vela impedisce che la scotta la trascini attraverso l’armo, mantenendo il margine locale. La zona comune dell’attacco di testa è esclusa dal test di intersezione. Il controllo usa profondità, grasso e svergolamento del profilo caricato, condivisi con la geometria disegnata; scarta le proiezioni fuori dai bordi e sotto la base inclinata. Non usa più una vela piatta che limitava eccessivamente la cazzata. Il fine corsa è il più vicino *ammissibile*, e può essere limitato dal contatto prima dell’allineamento col carrello.

La base randa modifica profondità e proiezione della base: cazzando la bugna arretra sul boma; lascando aumenta la freccia del piede e si riduce la corda proiettata. Il boma e l’attacco della scotta conservano la propria lunghezza. Le stecche modificano precompressione, sostegno della balumina, svergolamento e recupero di pressione delle stesse celle usate da CL/CD. La tensione ottimale assunta cresce con il carico; compressione eccessiva in aria leggera o sostegno insufficiente in aria forte riducono il rendimento. AUTO ricerca esplicitamente anche le stecche della randa e del fiocco steccato.

Il pannello laterale privilegia la vela attiva e i comandi. Misure ORC e geometria dell’armo restano richiudibili. Rettangoli decorativi, quattro winch decorativi e vecchio comando delle sole etichette sono rimossi. «Dati del profilo» abilita separatamente una scheda su ogni vela attiva; la stessa diagnostica compare nel comando singolo con differenze rispetto all’inizio della regolazione. Profondità e posizione del grasso sono misurate sulla superficie 3D al 40% dell’altezza; lo svergolamento è misurato fra 10% e 90%. Non sono solo copie dei parametri nominali.

Ombre e contrasto delle linee di forma sono aumentati. Il riflesso locale azzurro resta visibile durante il trascinamento e decade dopo il rilascio; con l’analisi pressioni il colore della mappa viene preservato maggiormente e si illuminano le linee di forma coinvolte.

I segnavento seguono la tangente locale del profilo e gli indicatori interpolati dei pannelli. Distinguono lato sopravento in fileggiamento e lato sottovento in separazione, reagiscono alla velocità locale stimata e pendono in aria calma. Ogni punto del nastro viene costruito sulla propria faccia, con distacco positivo dal tessuto; non è una linea nel vento globale che può attraversare la vela. Sono disegnati leggibili su entrambi i lati, senza oscurare i controlli. Flusso superficiale e flutter restano ricostruzioni qualitative da un modello a pannelli, non una soluzione di turbolenza tridimensionale.

## Vento, tensioni e prestazioni

La domanda di regolazione usa una curva monotona con derivata continua fra 4 e 30 nodi reali. Le forme più piatte, il recupero del grasso e lo svergolamento diventano utili già a 8 nodi.

| Vento | Domanda della drizza | Tensione minima nella ricerca AUTO di drizze/armo |
| --- | --- | --- |
| 8 kn | 25% | 19% |
| 12 kn | 50% | 46% |
| 20 kn | 93% | 92,44% |
| 30 kn | 100% | 100% |

Gli intervalli AUTO delle manovre abilitate sono ipotesi operative del modello; il controllo manuale conserva l’intera corsa 0–100%. Il resto delle regolazioni resta libero nella ricerca. Paterazzo, strallo e sartie insufficientemente tesi riducono il sostegno della pressione con una funzione continua del deficit rispetto al carico. Questa correzione empirica moltiplica gli stessi Cp usati per mappa e forze; non è una penalità applicata alla percentuale visualizzata. I carichi dell’armo usano la vela di prua effettivamente issata, non un genoa ammainato.

Sul benchmark generico in bolina a 52°/20 kn, lasciare completamente una sola manovra fissa degrada la velocità di circa 22 punti percentuali per il paterazzo, 12 per lo strallo e 48 per le sartie rispetto al riferimento. Sono sensibilità illustrative del modello, non previsioni certificate; i valori dipendono dal piano velico e dagli altri comandi. Sono verificati anche i passaggi dell’1% per evitare salti di forma o velocità.

## Pressioni, polare e AUTO

Il solutore a vortici discreti risolve la non penetrazione su 16 fasce × 12 pannelli di corda. Scena e pressione condividono `sailPoint`; le forze integrano `Σ Δp n A`, normalizzando l’area ai m² ORC. Lift, drag, mappa e coefficienti sono coerenti con le stesse celle, con correzioni esplicite di suzione, attrito, resistenza indotta, separazione, forma e sostegno dell’armo.

È flusso potenziale a sezioni con correzioni empiriche, **non CFD RANS/LES validata**. Non risolve interazione completa fra vele, viscosità, turbolenza 3D, deriva o elasticità completa. Residuo e raffinamento della griglia verificano la soluzione numerica, non una validazione sperimentale.

Le righe ORC R52…R150 sono secondi per miglio: V = 3600/tempo. Beat e Run sono VMG; si divide anche per |cos(angolo ottimo)|. Si interpolano velocità, senza riscalare a 10 m. Fuori dalla tabella e oltre l’ultimo angolo di poppa la velocità è una stima dichiarata. DW/CR/WL aggregati non sono velocità puntuali.

**AUTO conserva la scelta dell’utente:** vela di prua, randa issata/ammainata, misure e dimensioni. Non seleziona mai autonomamente spinnaker o gennaker. Cambiare vela con AUTO attivo mantiene la modalità e avvia la ricerca sulle manovre della nuova vela. I portanti originali seguono il certificato; una nuova vela esplorativa diventa disponibile dopo la modifica delle sue misure. In AUTO il carrello del fiocco/genoa resta sempre a poppa della verticale della bugna, con un piccolo margine. Il vincolo entra nella ricerca, nel riferimento e nella regolazione ai carichi di polare; viene inoltre applicato a ogni fotogramma durante gli assestamenti. La corsa manuale del binario resta completa. Modificare manualmente una manovra disattiva AUTO.

La ricerca confronta tre assetti iniziali, quattro alle portanti con un seme specifico tangone quadrato / scotta A2 lasca, poi ottimizza le manovre abilitate con passi fino a 0,25 punti in un worker. Il riferimento originale usa una partenza neutra e rimane indipendente da manovre fissate e modifiche dell’utente. Il riferimento di polare può confrontare internamente l’inventario originale completo, ma quel piano non viene mai applicato al posto di quello dell’utente. La spinta utile include carico eccessivo, separazione e stabilità. La resistenza equivalente è `R(V) = Fref × (V/Vpolare)^3`; il rendimento mostrato è `100 × V/Vpolare`. Se la vela scelta è poco adatta, il risultato può restare sotto il 100%. Una vela virtuale più grande può raggiungere il riferimento con una regolazione meno caricata: il display non viene forzato. Si tratta di ottimizzazione nel modello calibrato, non di un nuovo VPP certificato né garanzia di ottimo globale.

AUTO effettua poi una ricerca sul flusso locale, usando lo stesso indicatore dei nastri visibili a quattro altezze su entrambi i lati (otto per vela). Fra configurazioni con almeno il 99,5% della spinta target preferisce tutti i nastri aderenti, poi il minore deficit locale e maggiore superficie esposta del portante. Il raccordo numerico al target mantiene i vincoli fissati e la qualità del flusso; lo stato «target raggiunto» ammette una tolleranza dello 0,5% sulla velocità stimata. Dati & polare mostra il conteggio complessivo e per vela. Il flusso inverso dalla balumina all’inferitura non viene classificato aderente; il simmetrico può scambiare le sue due ralinghe. «A segno» significa flusso aderente secondo l’indicatore empirico di fileggiamento / separazione, non una transizione laminare misurata. In alcune andature di poppa il flusso separato non può essere eliminato insieme al target: il risultato resta dichiarato, senza forzare né velocità né nastri.

Alle portanti una scia geometrica stimata dalla proiezione della randa riduce la pressione sulle zone coperte del portante: deficit massimo 0,78 pesato per angolo / orientamento, decadimento esponenziale su 12 scale di barca, espansione laterale `0,18 × distanza` e raccordo ai bordi. È un’approssimazione di ombreggiamento, senza risoluzione della turbolenza o deviazione del vento. La pressione S2 include il sostegno del tangone perpendicolare al vento apparente con fattore `0,12 + 0,88 (1 − a²)²`, dove `a` è il prodotto scalare fra asse orizzontale del tangone e flusso unitario. Si aggiunge il fattore già descritto per lo squilibrio delle bugne. La spalla A2 può ruotare gradualmente sopravvento lascando scotta e mura, conservando le lunghezze delle ralinghe e la corda media. In separazione il coefficiente di pressione normale assume 0,65 per l’A2 invece di 1,8, per approssimare la perdita di sostegno della forma senza trasformare un A2 troppo cazzato in un paracadute altrettanto stabile del simmetrico. Questi parametri sono assunzioni didattiche dichiarate; entrano nelle medesime celle Cp usate da colori, lift, drag e velocità e non sono dati ORC.

## Verifiche

Node.js 22 o successivo:

```sh
node tests/exploration.mjs
node tests/single-control-auto.mjs
node tests/control-locks.mjs
node tests/auto-flow.mjs
node tests/model.mjs
node tests/geometry.mjs
node tests/pressure.mjs
node tests/jib-sheet-balance.mjs
node tests/jib-dynamics.mjs
node tests/jib-auto-trim.mjs
node tests/sheet-travel.mjs
node tests/headsail-rig-contact.mjs
node tests/telltales-and-profiles.mjs
node tests/travelers.mjs
node tests/rigging-and-sails.mjs
node tests/catalog-and-measures.mjs
node tests/certificate-rig-s2.mjs
node tests/rig-database.mjs
node tests/flying-surface.mjs
node tests/flying-auto.mjs
node tests/certificates.mjs
node tests/rig-progression.mjs
node tests/automatic-plan.mjs
node tests/auto-polar.mjs
node tests/catalog-auto.mjs
node tests/worker.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/wind-and-controls.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/picking.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/catalog-scene.mjs
node --no-warnings --experimental-loader ./tests/three-loader.mjs tests/mobile-and-cockpit.mjs
```

Le verifiche comprendono i 24 blocchi di manovra, il limite reale LP/J del barber, l’uguaglianza degli indicatori usati da AUTO e nastri, la quadratura S2 e l’apertura A2 alle portanti, oltre a 861 raggi sul pagliolo e chiusure laterali/frontali del pozzetto. I controlli verificano 100.872 punti polari originali, 4.326 tagli, aree originali e modifiche indipendenti, associazioni P/E/I/J e attacchi frazionati, irrilevanza delle aree gold, 1.524 portanti S2/A2 validi e 22.860 loro vertici. Comprendono tutte le 24 manovre, oltre 4.000 contatti randa/sartie, scotte/barber, 2.904 punti della vela di prua finiti durante apertura e tiro tridimensionale, raycasting reale, cambio barca, particelle nelle sette provenienze, pressioni/forze/CL/CD, progressione delle tensioni e degrado prestazionale, worker reale e conservazione dei piani scelti. I 18 benchmark AUTO controllano l’equilibrio entro la tolleranza di flusso quando l’utente sceglie esplicitamente il piano di riferimento; gli altri casi verificano il rendimento effettivamente ottenibile senza cambiare vela. Le nuove verifiche includono 1.008 assetti vento/scotta/carrello, 4.040 posizioni misurate lungo la corsa delle scotte, 22.710 intersezioni geometriche con l’armo anche ai due estremi del binario, 108 assetti carrello/bugna e 2.160 fotogrammi con il vincolo della verticale, 144 tagli 3D rimisurati e oltre 6.800 verifiche con lo strallo per i portanti, 384 segnavento e 4.224 verifiche fra nastri e tessuto, momento residuo, lunghezze di base/balumina conservate, direzione del tiro, risposta all’intensità, 192 celle di pressione sulla stessa geometria, otto transitori smorzati sulle due mure, convergenza fra frame rate e pressioni durante il movimento.

Le verifiche DOM con worker reale coprono selezione e certificato completo, finestre spostabili, IT/EN, quattro tab e tastiera, densità e preferenze del vento, piano con sola randa o senza vele, misure indipendenti con diagnostica rossa, ripristino e nuove vele esplorative. Verificano inoltre che Auto per manovra modifichi soltanto il comando richiesto e restituisca lo stesso valore ideale quando cambiano gli altri settaggi correnti. About ha fonti distinte, disclaimer e collegamento al Modello; Guida e About sono bilingui. La verifica visiva WebGL nel browser non è disponibile in questo ambiente.

## File e licenze

`dist/` contiene l’applicazione, moduli, dati, font e Three.js 0.170.0/OrbitControls (MIT). DM Sans e Space Grotesk sono OFL; le licenze sono in `vendor/`. `tests/` contiene i controlli numerici e di geometria; `scripts/` ricostruisce il catalogo. `vento-sorgenti.zip` include applicazione, dati, documentazione e controlli, senza credenziali o identità dell’hosting.
