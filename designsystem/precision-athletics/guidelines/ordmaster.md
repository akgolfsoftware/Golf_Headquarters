# AK Golf HQ — ord-, språk- og formelmaster

Autoritativ fasit for språk, begreper, formelparametere, statuser og skrivemåter. Mottatt fra Anders 25.09.2026. Maskinlesbar versjon: `assets/ak-vocabulary.js` (`window.AK_VOCAB`).

## 1. Produktnavn, roller og tilganger
- **AK Golf HQ** — hele plattformen.
- **PlayerHQ** — spillerens portal (/portal).
- **AgencyOS** — trenerens og akademiets operativsystem (/admin). Forbudt i UI: «CoachHQ».
- **AgenticOS** — systemet for AI-arbeidsflyt og autonome agenter i AgencyOS.
- **Caddie** — den personlige AI-assistenten i appen.
- **Spiller** — aldri «elev», aldri «atlet».
- **Coach / Hovedcoach** — treneren.
- **Forelder** — foresatte for spillere under 16 år.
- **TALENT** — gratis spillerprofil med åpent testbatteri og analyse.
- **FULL** — 299 kr/mnd eller 2 690 kr/år.

### Navigasjon (Anders 28.09.2026)
- **PlayerHQ-faner:** I dag · Plan · Stats · Meg. Stats har Snittscore · Strokes Gained · Trening · Tester.
- **AgencyOS-meny:** Cockpit · Innboks · Stall · Kalender · Workbench · Mer. Cockpit er startskjerm. Kø og oppfølging ligger i Innboks. Caddie ligger under Mer og i hurtigknappen. Innsikt er fordelt til Stall, Spiller 360 og Stats.
- **Målsetning** — aldri «mål» om det spilleren sikter mot. «Mål» brukes fortsatt om måltall (TrackMan-mål, rep-mål).
- **Velg treningsplan** — fem standardplaner: Weekend Warrior · Klubbspilleren · Junior-aspirant · Konkurransespilleren · Practice like the pros. Tilpasset kategori A–K. Alder begrenser aldri plan eller mengde.

## 2. De 5 pyramide-aksene
FYS (Fysisk) · TEK (Teknisk) · SLAG (Golfslag) · SPILL (Banespill) · TURN (Turnering). Farger: se `tokens/colors.css`.

## 3. De 19 treningsområdene
- Fullsving: Utslag · Innspill ca. 200 m · Innspill ca. 150 m · Innspill ca. 100 m · Innspill ca. 50 m
- Nærspill: Chip · Pitch · Lob · Bunker
- Putting (fot): 0–3 · 3–5 · 5–10 · 10–25 · 25–40 · 40+ (seks bånd, rettet 27.09.2026 etter ak-formel-v2 og masterdokumentet for treningsplanlegging 21.09.2026)
- Fysisk: Styrke · Kondisjon · Bevegelighet
- Bane: Banespill

## 4. AK-formelen — PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
- **Motorikk** (kun fullsving): Uten ball · Lav hastighet · Automatikk («Lav fart» og «Automatisk» er dagligtale, aldri i UI)
- **Belastning** (miljø, ikke kilo): Innendørs · Treningsområde · Bane · Konkurranse
- **Press**: Alene · Observert · Konkurranse · Turnering
- **Teknisk dimensjon** (maks ett fokus):
  - Utslag: Sikte og oppstilling · Startretning · Kurve · Treffpunkt
  - Innspill: Startretning · Kurve · Høyde · Lengdekontroll · Spinn
  - Nærspill: Landingspunkt · Utrulling · Treffpunkt · Køllevalg · Bruk av bounce
  - Bunker: Sandinngang · Lengdekontroll · Høyde · Lie-variasjon (sandtrinn: Uten ball i sanden / Med ball)
  - Putting: Greenlesing · Ballstart · Sikte · Lengdekontroll
  - Banespill: Spilleformat · Strategioppgave
- **Turneringstyper** (kun TURN): Treningsturnering · Utviklingsturnering · Prestasjonsturnering
- **Mengde**: fullsving og nærspill = antall slag · putting = antall putter · banespill = antall hull · styrke = serier × repetisjoner @ vekt (4 × 6 @ 90 kg) + RIR 0–4 · kondisjon = intervallsegmenter med tid og pulssone S1–S5 · bevegelighet = minutter

## 5. P1.0–P10.0
Helposisjoner P1.0–P10.0 er standard. Eneste desimal er .5 (halvveis, f.eks. P3.5). Aldri .2/.8.
P1.0 Adresse / Oppstilling · P2.0 Kølle parallell i baksving · P3.0 Venstre arm parallell i baksving · P4.0 Toppen av baksvingen · P5.0 Venstre arm parallell i nedsving · P6.0 Kølle parallell i nedsving · P7.0 Treffpunktet · P8.0 Kølle parallell i gjennomføring · P9.0 Høyre arm parallell i oppfølging · P10.0 Fullføring og balanse

## 6. TrackMan (engelsk tittel, stor forbokstav)
Club Speed (mph) · Ball Speed (mph) · Smash Factor (1,49) · Attack Angle (−3,2°) · Club Path · Face Angle · Face to Path · Dynamic Loft · Launch Angle · Spin Rate (rpm) · Spin Axis · Carry (m) · Total (m) · Dispersion

## 7. Golfdata og formatering
- Score: alltid brutto — «71 slag (−1)». Aldri netto.
- Strokes Gained: eksplisitt fortegn og komma (+1,2 / −0,4). Kategorier OTT · APP · ARG · PUTT.
- Putting i fot (ft). De 6 puttebåndene (§3) er de samme i trening, statistikk og banekart. Slag og banelengder i meter (m).
- Kategorier A–K (A best, brutto snittscore, trinn [min, max) — snitt 74,2 = D): A World Elite < 68 · B National Elite 68–72 · C National U21 72–74 · D Regional Elite 74–76 · E Regional U18 76–78 · F Klubbspiller Senior 78–80 · G Klubbspiller Junior 80–85 · H Rekrutt Senior 85–90 · I Rekrutt Junior 90–95 · J Nybegynner Senior 95–100 · K Nybegynner Junior 100+. Kilde: ak-kategori.ts.
- Komma som desimalskille (72,4), mellomrom som tusenskille (1 200 t), mellomrom før prosent (84 %).

## 8. Statuser
- Treningsøkt: Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over
- Plan: Utkast · Venter på spiller · Venter på coach · Godtatt · Avvist · Aktiv · Arkivert («Venter på coach» = plan spilleren har sendt til coach. Godkjent av Anders 26.09.2026)
- Test: teller bare når alle slag i protokollen er registrert (Anders 26.09.2026)
- Publisering: Ikke publisert · Publiserer · Publisert · Trukket tilbake
- Dagsform: 1 Tung · 2 Slapp · 3 Ok · 4 God · 5 Topp

## 9. Forbudsliste
| Aldri | Bruk |
|---|---|
| Drill | Øvelse |
| Logge / føre | Registrere |
| Session / workout | Økt |
| Goal / Mål (om målsetning) | Målsetning (28.09.2026) |
| Stats | Statistikk / Snitt. Unntak: fanen i PlayerHQ heter **Stats** (28.09.2026) |
| Analyse (fane/meny) | Stats |
| Hjem (AgencyOS) | Cockpit |
| Schedule | Plan / Kalender |
| Subscription | Abonnement |
| Kortspill / rundt green | Nærspill |
| Ferdig (generell status) | Lagret · Publisert · Gjennomført |
| Pro / Premium / Plus | TALENT / FULL |
| CoachHQ | AgencyOS |
| Netto score | Brutto score |
| Emoji | Lucide-ikon eller tekst |
