# Visuelt språk — destillert fra referansebildene (light + dark)

Fasiten for hvordan AK Golf HQ skal se ut. Destillert fra kuraterte premium-referanser (fitness/tracking/planlegging-apper og prosjektverktøy). Merkevarefargene er låst som hue — dette dokumentet definerer BRUKEN.

## 1. Dark mode — reglene

- **Base:** nesten svart (vår #0A1F18-avledning). Kort er lysere mørke lag — elevation gjennom lyshet, ALDRI borders.
- **Tallhierarki:** display-tall stort og semibold ("190 lbs", "3.200"), enhet mindre og dempet ved siden av, label liten og muted under/over. Tre tydelige nivåer.
- **Primær-CTA:** hvit/lys pill med mørk tekst ("Get Started", "Start workout"). Hvit pill = handling.
- **Accent (lime):** maks én jobb per skjerm — AI-tip-glød, valgt treningsblokk, aktiv pin. Aldri flatedekkende.
- **Valgt tilstand:** hvit pill rundt valgt element (dag i ukestripe, tab). Uvalgt = dempet tekst uten container.
- **Dataviz-språk:** dot-grid-heatmaps (aktivitet over måneder), progress-ringer med tall inni, tynne barer, sparklines. Punkter og ringer, ikke tunge flater.
- **AI-innsiktskort:** konverserende setning med fete inline-verdier ("Prøv 6-jern... forventet carry: 148 m ±5") — data i naturlig språk, aldri rå tabell i innsiktskort.
- **Glassmorfisme over foto:** KUN marketing/hero-flater. Aldri i app-UI (PlayerHQ/CoachHQ) — der gjelder solide surface-lag.

## 2. Light mode — reglene (besvarer de tre harde beslutningene)

- **Base:** varm off-white/lys grå, hvite kort. **Elevation gjennom myke skygger** (soft shadow, lav spredning) — ikke borders, ikke lag-lyshet.
- **Valgt/aktiv tilstand:** **sort/primærgrønn fylt pill med lys tekst** (aktiv tab, valgt side i paginering, avhuket checkbox). Uvalgt = lys grå flate. Dette er light modes svar på dark modes hvite pill.
- **Accent på lys flate:** lime brukes ALDRI som tekst eller tynn linje på lys bakgrunn (kontrastfeil). Lime lever kun på mørke elementer inne i light mode (f.eks. inni en sort pill) — ellers tar primærgrønn accent-rollen.
- **Kategorifarger:** pastell-bakgrunner med mørkere tekst i samme hue (kalenderhendelser, gantt-barer). I vår verden: pyramide-fargene (FYS/TEK/SLAG/SPILL/TURN) som pastellvarianter i light, mettede varianter i dark.
- **Hover:** hel-rad grå highlight + liten farget dot-markør på tidslinjer og lister.

## 3. Kryssmodus-prinsipper

- Samme semantiske tokenlag i begge moduser; kun verdisettene skifter. En komponent designes én gang.
- Elevation: dark = lysere surface, light = myk skygge. Samme hierarki-dybde.
- Valgt-tilstand: dark = hvit pill, light = sort/grønn pill. Samme form, invertert verdi.
- Begge moduser skal holde identisk premium-nivå — light er aldri en blek eksport av dark.

## 4. Komponentmønstre fra referansene (gjenbruk disse)

- **Ukestripe:** M–S horisontalt, valgt dag som pill, mikroindikator (dot/tall) under hver dag.
- **Segmented control:** Dag/Uke/Måned eller Ute/Simulator som pill-gruppe — standarden for visningsbytte, ikke dropdown.
- **Tidslinje med buffersoner:** klokkeslett venstre, økt-blokker i kategorifarge, dempede buffersoner mellom, progress-ring i header.
- **Vertikal aktivitetslogg:** tid venstre, farget sirkulær ikon-node per hendelsestype, forbindelseslinje, ekspanderbare kort med detaljer (sett/reps-mønsteret → våre slag/testdata).
- **Gantt/plan-rader:** rounded pill-barer i kategorifarge med avatar og %-fremdrift, hover-popover med oppgaveliste — mønsteret for CoachHQ-periodisering.
- **Banekart-visning (golf):** luftfoto/illustrasjon med avstandspins i meter, mållinje, hull-velger (Par/Hull/Hcp) som sirkulær kontroll, tabs under (Bane/Coach AI/Statistikk). Lime kun på aktiv pin og AI-elementet.
- **Gamification-kort:** nivå + XP-fremdrift som dotted bar, beskrivende tekst under — mønsteret for AK-stigen/kategoriprogresjon (A–K).
- **Onboarding:** ett spørsmål per skjerm, hvite pill-valg, tynn steg-indikator øverst, Skip tilgjengelig.
- **Landing-struktur:** nav → hero med app-mockup → logo-/tillitsstripe → feature-kort → hvorfor oss → anmeldelser → FAQ.

## 5. Avvis alltid

- Borders som elevation i dark mode.
- Lime som tekst/linje på lys flate.
- Mer enn én accent-jobb per skjerm.
- Dropdown der segmented control er mønsteret.
- Rå datatabell der AI-innsiktskort eller display-tall er riktig nivå.
- Glassmorfisme inne i app-flater.
