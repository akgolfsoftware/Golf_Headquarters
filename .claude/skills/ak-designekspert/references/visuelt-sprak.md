# Visuelt språk — v2 (retning C «Presis», mørk-først) — light + dark

Fasiten for hvordan AK Golf HQ ser ut i **v2-generasjonen (retning C, valgt 2026-07-11)**. Dette
er destillert og deretter **oppdatert mot shipped v2**: den eksakte kilden til farger/verdier er
`src/lib/v2/tokens.ts` (`T`-objektet) + `--v2-*`-variablene i `src/app/globals.css` + det levende
Claude Design-prosjektet («AK Golf HQ Design System», `ui_kits/v2`). golfdata/v13 er overgangs-lag.
**Ved tvil om en eksakt verdi: les token-kilden, ikke dette dokumentet — hardkod aldri hex.**
Merkevarefargene er låst som hue; dette dokumentet definerer BRUKEN.

## 1. Dark mode — reglene

- **Base:** varm near-black (`--v2-bg`, i dag **#131513** «løftet» — ikke det gamle #0A1F18). Panel
  #1c1f1c. Kort er lysere mørke lag — elevation gjennom lyshet, ALDRI borders.
- **Tallhierarki:** display-tall stort og semibold ("190 lbs", "3.200"), enhet mindre og dempet ved siden av, label liten og muted under/over. Tre tydelige nivåer.
- **Primær-CTA + valgt/aktiv tilstand = LIME-pille** (`T.lime` #d1f843 med `T.onLime`-tekst) — «Logg
  inn», valgt dag/tab/pin. **Aldri lyse/hvite piller på mørk flate** (retning-C-regel, jf. core.tsx).
  Dette erstatter den gamle «hvit pill»-regelen fra utforskningsfasen.
- **Accent (lime):** maks én jobb per skjerm — primær-CTA/valgt, AI-tip-glød, aktiv pin. Aldri flatedekkende. Lime bærer altså både accent- OG valgt-rollen i mørk (disiplin: ikke tre steder samtidig).
- **Uvalgt tilstand:** dempet tekst uten container.
- **Dataviz-språk:** dot-grid-heatmaps (aktivitet over måneder), progress-ringer med tall inni, tynne barer, sparklines. Punkter og ringer, ikke tunge flater.
- **AI-innsiktskort:** konverserende setning med fete inline-verdier ("Prøv 6-jern... forventet carry: 148 m ±5") — data i naturlig språk, aldri rå tabell i innsiktskort.
- **Glassmorfisme over foto:** KUN marketing/hero-flater. Aldri i app-UI (PlayerHQ/AgencyOS) — der gjelder solide surface-lag.

## 2. Light mode — reglene (besvarer de tre harde beslutningene)

- **Base:** varm off-white/lys grå, hvite kort. **Elevation gjennom myke skygger** (soft shadow, lav spredning) — ikke borders, ikke lag-lyshet.
- **Valgt/aktiv tilstand:** **forest-fylt pill med lys tekst** (`T.lime` = #005840 i lys modus, `T.onLime` = #fff → aktiv tab, valgt side i paginering, avhuket checkbox). Uvalgt = lys grå flate. Dette er light modes svar på dark modes lime-pille (samme form, tema-invertert verdi).
- **Accent på lys flate:** lime brukes ALDRI som tekst eller tynn linje på lys bakgrunn (kontrastfeil). Lime lever kun på mørke elementer inne i light mode (f.eks. inni en sort pill) — ellers tar primærgrønn accent-rollen.
- **Kategorifarger:** pastell-bakgrunner med mørkere tekst i samme hue (kalenderhendelser, gantt-barer). I vår verden: pyramide-fargene (FYS/TEK/SLAG/SPILL/TURN) som pastellvarianter i light, mettede varianter i dark.
- **Hover:** hel-rad grå highlight + liten farget dot-markør på tidslinjer og lister.

## 3. Kryssmodus-prinsipper

- Samme semantiske tokenlag i begge moduser; kun verdisettene skifter. En komponent designes én gang.
- Elevation: dark = lysere surface, light = myk skygge. Samme hierarki-dybde.
- Valgt-tilstand: dark = lime-pille (T.lime + T.onLime), light = forest-pille. Samme form, tema-invertert verdi.
- Begge moduser skal holde identisk premium-nivå — light er aldri en blek eksport av dark.

## 4. Komponentmønstre fra referansene (gjenbruk disse)

- **Ukestripe:** M–S horisontalt, valgt dag som pill, mikroindikator (dot/tall) under hver dag.
- **Segmented control:** Dag/Uke/Måned eller Ute/Simulator som pill-gruppe — standarden for visningsbytte, ikke dropdown.
- **Tidslinje med buffersoner:** klokkeslett venstre, økt-blokker i kategorifarge, dempede buffersoner mellom, progress-ring i header.
- **Vertikal aktivitetslogg:** tid venstre, farget sirkulær ikon-node per hendelsestype, forbindelseslinje, ekspanderbare kort med detaljer (sett/reps-mønsteret → våre slag/testdata).
- **Gantt/plan-rader:** rounded pill-barer i kategorifarge med avatar og %-fremdrift, hover-popover med oppgaveliste — mønsteret for AgencyOS-periodisering.
- **Banekart-visning (golf):** luftfoto/illustrasjon med avstandspins i meter, mållinje, hull-velger (Par/Hull/Hcp) som sirkulær kontroll, tabs under (Bane/Coach AI/Statistikk). Lime kun på aktiv pin og AI-elementet.
- **Gamification-kort:** nivå + XP-fremdrift som dotted bar, beskrivende tekst under — mønsteret for AK-stigen/kategoriprogresjon (A–K).
- **Onboarding:** ett spørsmål per skjerm, pill-valg (uvalgt = dempet flate, valgt = lime-pille i mørk / forest-pille i lys), tynn steg-indikator øverst, Skip tilgjengelig.
- **Landing-struktur:** nav → hero med app-mockup → logo-/tillitsstripe → feature-kort → hvorfor oss → anmeldelser → FAQ.

## 5. Avvis alltid

- Borders som elevation i dark mode.
- Lime som tekst/linje på lys flate.
- Mer enn én accent-jobb per skjerm.
- Dropdown der segmented control er mønsteret.
- Rå datatabell der AI-innsiktskort eller display-tall er riktig nivå.
- Glassmorfisme inne i app-flater.
