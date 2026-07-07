# Baneguide — design-spec (fase 4)

> STATUS: skrevet før designsystem-revisjonen juli 2026 — gjeldende kanon: `.claude/rules/design-system-regel.md` (v13/golfdata, Familjen Grotesk som display-font; Inter Tight og gamle athletic/-anbefalinger under er utdatert).

**Opprettet:** 2026-06-28 · **Status:** Forslag, venter på godkjenning · Binder IA til ekte ruter + datamodell (fase 1–3) for å hindre IA-drift.

> **Designsystem:** Følger ak-golf-hq-design. PlayerHQ **lyst**, AgencyOS **mørkt**. Inter / Inter Tight / JetBrains Mono. Lucide-ikoner. 8pt-grid. Lime kun som aksent. Gjenbruk athletic-komponenter (Hero, KpiStrip, Card, Eyebrow, Badge, ActionList). Kartfarger fra `course-map.tsx`-paletten (TODO: formaliser som tokens).

## Datakilder (alt finnes etter fase 1–3)
- `Bane` (+ `geojson`, lat/long) og `CourseHole` (tee/green-GPS, par, lengde) — fase 1.
- `Shot.startX/Y/endX/Y` (GPS via `saveShot`) — fase 2. TrackMan `side`/`carry` — finnes.
- `dispersion.ts`: σ, bias, konfidens-ellipse, `projectToAimFrame`, `shotsToPoints`, `trackmanToPoints` — fase 3.

---

## Skjerm 1 — Baneguide-bibliotek (PlayerHQ, lyst, mobil-først)
**Rute:** `/portal/baneguide`
- **Hero:** eyebrow `BANEGUIDE` (mono), tittel «Banene dine», lead «Spredningen din på hver bane du spiller.»
- **Bane-kort (Card, ett per Bane):** navn + klubb, badge «{n} hull kartlagt» (lime hvis geometri finnes, ellers neutral «Kommer»), sist spilt, din snittscore (mono). Tap → skjerm 2.
- **Tom tilstand:** «Ingen baner ennå — logg en runde for å komme i gang.»
- **Stater:** loading (skeleton-kort), tom, normal.

## Skjerm 2 — Banekart-oversikt (PlayerHQ, lyst)
**Rute:** `/portal/baneguide/[baneId]`
- **Hero:** eyebrow `ONSØY GOLFKLUBB`, tittel «Banekart», sub «{n} hull · par {sum}».
- **Kart (CourseMap):** hele banen på satellitt, alle hull-markører. Din samlede tendens som liten bias-pil per hull (avledet, ikke hardkodet).
- **Hull-liste (under kartet):** rad per `CourseHole` — nr, par, lengde (mono), din σ side (mono), mini bias-chip (venstre/høyre). Tap → skjerm 3.
- **Empty pr. hull:** «Ingen slag logget» (warn-nøytral) når hullet mangler data.

## Skjerm 3 — Hull-detalj (PlayerHQ, lyst) ★ signaturskjerm
**Rute:** `/portal/baneguide/[baneId]/hull/[nr]`
- **Hero:** eyebrow `BANEGUIDE · ONSØY`, tittel «Hull {nr}», sub «par {par} · {lengde} m».
- **Kart (CourseMap, zoomet til hullet):** satellitt + tee→green sikte-linje + **dispersion-ellipse** (din spredning) + landingspunkter. Segment-velger over kartet: **Utslag / Innspill / Putt** (filtrer slag på `shotType`).
- **KpiStrip (mono-tall):** σ side · σ lengde · bias · snitt-avstand til pin.
- **InsightCard:** generert fra bias, f.eks. «Du misser {x} m {side} i snitt — sikt {motsatt} halvdel.» (Kun når n ≥ terskel; ellers skjul.)
- **Strategi-notat (valgfri):** coach-notat hvis finnes.
- **Stater:** har-data / for-få-slag (vis kart + «Plott flere slag for spredning») / ingen-geometri.

## Skjerm 4 — Slag-plotting (PlayerHQ) — bygget i fase 2
**Rute:** utvider `/portal/mal/runder/[id]/slag` med kart-modus (`ShotPlotMap`). Design: toggle «Liste / Kart» i slag-wizarden; kart-modus viser hullet, trykk for å plassere landing. Knappe-idiom: rounded-full pill mono.

## Skjerm 5 — Spredningsplott per kølle (PlayerHQ) — design finnes
**Rute:** `/portal/mal/sg-hub/dispersion`. Port arkivert `DispersionTool` (`_arkiv-handover-2026-06-20/dispersion-*`). Mat med `trackmanToPoints` + `computeDispersion`.

## Skjerm 6 — Manuell inntasting (PlayerHQ)
**Rute:** modal/seksjon i runde-flyt. Skjema: hull, slagnr, kølle, lie, shot-type, valgfri «omtrentlig miss» (venstre/høyre + kort/lang som chips → mappes til offset). Enkelt; for når kart ikke er praktisk.

---

## Skjerm 7 — Coach baneguide per spiller (AgencyOS, mørkt, tett)
**Rute:** `/admin/spillere/[id]/baneguide`
- **Header-rad:** avatar + «Øyvind Rohjan», bane-velger (dropdown), periode-filter.
- **Kart (CourseMap, mørk chrome):** spillerens dispersion per valgt hull.
- **Hull-tabell (Bloomberg-tetthet, py-2.5):** hull · par · n slag · σ side · σ lengde · bias · trend. Sortbar. Rad → zoom kart til hull.

## Skjerm 8 — Coach dispersion-verktøy (AgencyOS, mørkt) ★ analyse
**Rute:** `/admin/spillere/[id]/dispersion`
- **Filter-rad (chips):** kølle · shot-type · periode · datakilde (bane / TrackMan).
- **Dispersion-graf:** motorens output (sikte-frame scatter + rotert 95%/1σ-ellipse + snitt + mål). Gjenbruk render-mønsteret fra fase 3.
- **KpiStrip:** σ side · σ lengde · bias · n.
- **Benchmark:** sammenlign σ mot referanse (SgBaseline / coach) — nøytrale chips (FYS-formel ikke låst, ingen påfunn-tall).
- **σ-trend:** liten linje over tid.

## Skjerm 9 — Banedata-admin + rette-editor (AgencyOS, mørkt)
**Rute:** `/admin/baner` (+ `/[id]`)
- **Tabell:** bane · klubb · hull kartlagt (9/18) · kilde (OSM/manual) · sist oppdatert · status-badge.
- **Handlinger:** «Importer fra OSM» (kjører import), «Rett hull» → editor.
- **Rette-editor (`/[id]`):** kart der coach tegner/justerer manglende hull-linjer + tee/green; lagrer til `CourseHole`/`Bane.geojson`, setter `geometrySource=manual`.

---

## Responsiv + tema
- **PlayerHQ:** mobil-først (430px), lyst. Kart full bredde, KpiStrip 2×2 på mobil → rad på desktop.
- **AgencyOS:** desktop-tett (~1280px), mørkt. Tabeller med kompakt spacing (py-2.5 unntak). Mobil: stables, 44px touch-mål.

## Gate (net-new skjermer)
Ingen fasit-PNG → **brand-vokter-review** (tokens/typografi/lucide/8pt/lime-disiplin/44px) i stedet for pikseldiff, jf. AgencyOS-mobil-presedens. Skjerm 5 har arkiv-fasit → vanlig porting-gate.
