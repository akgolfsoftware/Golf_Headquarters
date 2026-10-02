# IUP 2027 — kontroll av originalens struktur

Kontrollert lokalt uten å endre originalfilen 02.10.2026. Kildens SHA-256 er `6786d70f166dc4d5602f792a165eef8372743597ac44904a9fa0a3dd2892f222`, samme verdi som appens to spørsmålsregistre. Originalen og det detaljerte strukturregisteret oppbevares privat under Documents/Claude; ingen elevsvar, navn, rå formler eller mellomlagrede diagramverdier er kopiert til dette dokumentet.

| Struktur | Faktisk antall |
|---|---:|
| Ark | 18 |
| Celler med formel | 1692 |
| Diagrammer | 25 |
| Pivottabeller | 1 |
| Excel-tabeller | 3 |
| Navngitte områder | 1 |
| Standardvalideringer i regnearkenes hovednavnerom | 0 |
| Standardbetingede formateringer i hovednavnerommet | 0 |
| Eksterne lenkedeler / makrodeler | 0 / 0 |
| Celler med mellomlagret feilverdi | 26 |

Alle **162 utviklingsspørsmål og 13 sesongspørsmål** i appens kilderegistre ble sammenlignet med sine oppgitte originalceller, etter normalisering av Unicode og mellomrom: **175 av 175 samsvarer**, ingen avvik. Dette kontrollerer spørsmålsinnhold og cellehenvisning; det er ikke bevis på alle trenerreiser.

Formelfunksjonene IF, WEEKNUM, SUM, AVERAGE, MEDIAN, OR, SQRT, MAX, MIN og TEXT forekommer i originale formeluttrykk. Delte formler ble ikke utvidet eller beregnet på nytt. De 26 mellomlagrede feilene kan derfor ikke brukes som bevis på feil i appen eller feil ved fullstendig utfylt arbeidsbok.

Metoden var lokal, lesende gjennomgang av arbeidsbokens OOXML-struktur og kilderegistrene. Det private registeret bruker nøytrale ark-ID-er og celle-/objektreferanser, uten å bevare persondata eller rå formler. Kontroll av alternative utvidelsesnavnerom, skjulte inputkontrakter og alle objekters appkobling er ikke fullført av denne opptellingen.

Neste nødvendige kontroll er én sporbar kobling per input, beregning, diagram/pivot og handling til lagring, PlayerHQ, WANG, Team Norway og meningsfull test. R01.1 i [arbeidslisten](../planer/workbench-fullforing-2026-10-02.json) er derfor **delvis utført**. Excel kan ikke avvikles på grunnlag av denne strukturkontrollen alene.
