# Claude Design-bestilling — D6: Live slag-for-slag-føring (runde-logg)

> Skrevet 2026-07-07. Backend er FERDIG og testet (329/329) — datakontrakten under er eksakt
> og låst. Skjermene skal tegnes mot v13-kit-et (`public/design-handover/`). Leveranse i samme
> format som kit-et: skjerm-HTML + nye komponenter som triade (jsx + d.ts + prompt.md).
>
> **Til Anders:** lim hele denne filen inn i Claude Design-prosjektet som eier v13.

## Felles kontekst

Plattform: AK Golf HQ, PlayerHQ (spillerappen, ALLTID lys — mørk data-hero-innfelling tillatt
via `class="dark"`-scope). Design-system v13: forest #005840 / lime #D1F843, Familjen Grotesk
(display) + Inter (UI) + JetBrains Mono (tall), tokens fra tokens/colors.css, lime ALDRI på lys
flate. Gjenbruk kit-komponenter der de passer: Card, Tag, Button, KpiTile, DayStrip, Eyebrow,
Modal/Sheet. Norsk bokmål. Tall alltid med enhet og retning. Ingen emoji — Lucide-ikoner.

**Jobben:** Spilleren logger HVERT SLAG live på banen, mellom slagene, med én tommel, i sol.
SG (Strokes Gained) beregnes automatisk — spilleren skal ALDRI regne selv. Full detalj føres
(kølle, vind, mental), men obligatoriske trykk per slag skal være maks 3–4: avstand + underlag
(+ «i hull»). Resten er smarte forvalg.

**Rute:** `/portal/(fullscreen)/runde-logg` — fullskjerm, ingen bunn-nav. Mobil 390 px er
primærflaten; desktop er sekundært (samme komposisjon, sentrert maks-bredde).

## Datakontrakt (LÅST — backend finnes)

Modellen er et posisjonskjede: hullet starter på tee med hull-lengden som avstand; hvert slag
registrerer kun sitt RESULTAT. Startposisjonen for slag N er resultatet av slag N−1.

```
LoggetSlag = {
  resultat: { iHull: true } | { iHull: false; lie: HvileLie; avstandTilHull: number /* meter */ }
  kolle?: string          // fritekst fra spillerens bag ("Driver", "7-jern", "PW")
  vind?: "STILLE" | "MEDVIND" | "MOTVIND" | "VENSTRE" | "HOYRE"
  mental?: 1–5            // valgfri
  straffe?: boolean       // ballen gikk i vann/OOB PÅ dette slaget; resultat = posisjon etter drop
  notat?: string
}
HvileLie = FAIRWAY | SEMI_ROUGH | ROUGH | DEEP_ROUGH | BUNKER | GREEN | TREES
LoggetHull = { holeNumber: 1–18, par: 3–6, lengdeMeter: 40–700, slag: LoggetSlag[] (1–25) }
```

- Putting: lagres i meter, VISES i fot (`meterTilFot`). Avstander ellers i meter.
- SG-kategorier i klarspråk: OTT=«Tee-slag», APP=«Innspill», ARG=«Nærspill», PUTT=«Putting».
- Bane-oppsett hentes fra `hentBaneHull(courseId)` → `{holeNumber, par, lengdeMeter}[]`
  (kan være tom — da settes par manuelt per hull med lengde-forslag).
- Lagring: `lagreLoggetRunde({courseId, playedAt, hull, notes?})` → beregner SG server-side,
  returnerer `{roundId, sgTotal, score}`.

## Skjerm 1 — Oppstart

Velg bane (søkbar liste), dato (default i dag), 9 eller 18 hull, valgfritt notat (tee-farge o.l.).
Har banen hulldata: vis hull-oversikt (par-rekke) som bekreftelse. Mangler hulldata: kompakt
par-velger per hull (3/4/5-pills, forvalg par 4) — må kunne gjøres på under 30 sekunder.
Stor start-CTA. Gjenopptak-banner øverst hvis en uferdig runde ligger i kladd (localStorage):
«Fortsett hull 12» / «Forkast».

## Skjerm 2 — Slag-føring (kjernen — her vinnes eller tapes designet)

**Layout:** Hull-stripe øverst (DayStrip-anatomien: 18 celler, spilt=score-farge relativt par,
aktiv=markert). Under: løpende score vs. par + løpende SG-estimat (liten, sekundær). Nederst
2/3 av skjermen = tommel-sonen med selve føringen.

**Per slag (ett kort om gangen):**
1. Kontekst-linje (lesing, ikke trykk): «Slag 3 · 85 m fra hullet · Fairway» — startposisjonen
   er ALLTID kjent fra forrige slag, aldri et input.
2. **Resultat-input (obligatorisk):**
   - Stor avstands-stepper (±1/±5/±25 m-knapper + direkte talltrykk) — på green vises fot.
   - Underlag-pills: Fairway · Semi · Rough · Dyp rough · Bunker · Green · Trær.
   - Stor **«I HULL»**-knapp (alltid synlig, aldri bak scroll).
3. **Detalj-rad (valgfri, ett trykk å åpne eller alltid synlig kompakt):**
   - Kølle: hurtigvelger — husker sist brukte per avstandsbånd (forvalg vises, ett trykk å endre).
   - Vind: 5 retnings-pills — VEDVARER for hele hullet (endres sjelden).
   - Mental 1–5: fem prikker, valgfritt.
   - Straffe-knapp: «+ Straffe (vann/OOB)» — markerer slaget, resultatet føres som posisjonen
     etter drop. Tydelig, men ikke dominerende.
4. **Angre:** siste slag kan alltid angres (ett trykk + bekreft). Hull-stripen lar spilleren
   hoppe tilbake til et tidligere hull for å rette.

**Tilstander:** normal · på green (fot-visning, underlag låst til Green/I hull) · etter straffe
(kvittering «+1 slag») · hull ferdig (mikro-oppsummering: score, SG for hullet — 1,5 sek,
så neste hull) · kladd-lagret-indikator (diskret).

**Ergonomi-krav:** alle obligatoriske mål ≥44 px, i nedre halvdel. Én hånd. Høy kontrast i
sollys (test squint). Ingen tekst-input nødvendig i normalflyt.

## Skjerm 3 — Runde-oppsummering

Etter hull 18 (eller «Avslutt tidlig»): score vs. par, putts, fairways (x/y), GIR (x/y),
SG per kategori (klarspråk-navn, formatert +1,2 / −0,8, beste kategori fremhevet — én
accent-jobb), hull-for-hull-stripe. Notat-felt. Stor «Lagre runde»-CTA → suksess → runde-detalj.
Feiltilstand: lagring feilet → data er trygt i kladd, prøv igjen-knapp (aldri mist en runde).

## Skjerm 4 — Innganger + runde-detalj-utvidelse

- Runder-siden (`/portal/mal/runder`): «Ny runde» åpner valg: **«Før slagene live»** (primær)
  / «Hurtigregistrering» (dagens skjema, sekundær).
- Gjennomføre «I dag»: snarveiskort «Start runde-logg».
- Runde-detalj (`/portal/mal/runder/[id]`) når runden har slag-data: hull-for-hull-tabell
  (scorekort-anatomi) + SG-kortene merket «Beregnet fra slag» (vs. «Manuelt ført» på gamle).

## Leveransekrav

1. Mobil 390 px komplett for alle 4 skjermer; desktop-tilpasning for 2–4.
2. Alle tilstander per skjerm (tom, laster, feil, suksess, gjenopptak, angre-bekreft).
3. Kun tokens. Nye komponenter som triade. Putting i fot, ellers meter — alltid med enhet.
4. Terminologi: «Nærspill» (aldri «kortspill»), SG-klarspråk-navnene over.
5. Anbefalinger, aldri sperrer: «Avslutt tidlig» og «Forkast» skal alltid finnes.
