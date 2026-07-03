# TrackMan-analytikeren — 30 års tolkning av data og spillerutvikling

trackman-dispersion.md er fasiten (parametre, enheter, matematikk). Dette dokumentet er tolken: hvordan en analytiker med 30 års erfaring leser dataene, finner forbedringsområder og gjør dem visuelle. Regel én: et tall som ikke kan følges ned analytikerkjeden hører ikke hjemme på en skjerm.

## Analytikerkjeden (arkitekturen for enhver analyseflate)

**Resultat → Mønster → Årsak → Prioritet → Trening**

1. **Resultat:** hva koster slag (SG mot navngitt baseline)
2. **Mønster:** hvordan ser det ut (spredning, trend, bånd-fordeling)
3. **Årsak:** hvorfor, i TrackMan-parametre (face-to-path, strike, launch)
4. **Prioritet:** hva gir mest, kvantifisert («fiks dette = −1,2 slag/runde»)
5. **Trening:** AK-formel-aksen som trener det — dommen skal kunne planlegges direkte i workbench

Hver analyseskjerm er denne kjeden ovenfra og ned. Spillerdybde stopper ofte på nivå 4–5 i klarspråk; elite/coach kan gå hele veien ned.

## Diagnostiske lesninger (ekspertkunnskapen bak «Årsak»)

- **Kurvatur:** face angle dominerer startretning (~75–85 % for driver/jern); face-to-path bestemmer skru. Klarspråk-dom: «Ballen starter høyre og skrur mer høyre — bladet er åpent mot svingbanen.»
- **Strike og gear effect:** toe-treff → draw-skru + smash-tap; heel → fade + tap. Strike-mønster forklarer ofte «uforklarlig» kurvevariasjon FØR man rører sving.
- **Launch window:** launch + spin per kølle har en optimal sone (driver: høy launch/lav spin for CS-nivået). Utenfor sonen = gratis meter som ligger igjen.
- **Attack angle og spin loft:** driver slås oppover, jern nedover; stort spin loft spiser smash. Kobles alltid til CS-nivå — optimal sone er hastighetsavhengig.
- **Bias vs. spredning** (fra fasiten): bias fikses med sikte/face, spredning med treffkvalitet og volum. To ulike treningsresepter — aldri bland dem i én dom.

## Visualiseringsmønstre for forbedringsområder

- **SlagLekkasjeKart:** heatmap over avstandsbånd (TEE, INN200–INN50, PUTT-bånd) farget etter SG-tap mot baseline. Coachens og spillerens «hvor blør vi»-svar på ett blikk. Klikk på bånd → kjeden nedover.
- **DiagnoseKort:** tre linjer — Symptom («mister 0,8 slag på innspill 100–150 m») → Bevis (mini-viz: spredning/strike/launch) → Resept (AK-formel-akse + drillforslag). Aldri diagnose uten resept.
- **GevinstEstimat:** hver anbefaling kvantifisert: «Til kategorikrav på putting 2–3 m = −1,2 slag/runde.» En anbefaling uten tall er en mening, ikke en analyse.
- **Mål-korridor-trend:** parameter over tid med skravert målsone (f.eks. attack angle mot +2° til +5°) og markører for tester/periodeskifter — viser om intervensjonen virker.
- **Sone-visning:** faktisk verdi/scatter mot skravert optimal sone (launch window per kølle, smash mot CS-referanse). Sonen gjør tallet leselig uten fagkunnskap.
- **Strike-smash-kobling:** treffpunkt-heatmap på kølleblad side ved side med smash per sone — gear effect synlig uten ett ord teori.

## Analytikerens ufravikelige regler

- Aldri parameter uten kontekst: målsone, baseline eller egen historikk — et nakent tall er støy.
- Aldri diagnose fra én økt: minimum slagantall vises alltid («basert på 64 slag over 3 økter»). Tynt grunnlag = si det, ikke skjul det.
- M/PR-badge på alt — range-data og turneringsdata er ulike sannheter.
- Forbedringsområde uten treningskobling er forbudt: hver dom peker på AK-formel-aksen som trener den, så «Planlegg dette» er ett trykk unna.
- Progressiv dybde gjelder: nybegynner får dommen og resepten i klarspråk; elite får hele kjeden med rå parametre.
