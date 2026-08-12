> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Komplett prompt til Claude Design — les prosjekt + tegn resterende

**Bruk:** Claude Design / Sonnet med prosjekt **AK Golf HQ — Claude Paper**  
**Speil i kode:** `designsystem/paper/` (zip speilet 2026-08-09)  
**Kodebase:** Next.js App Router · PlayerHQ `/portal` · AgencyOS `/admin`

---

## Slik får Design «lese prosjektet»

Claude Design kan **ikke** klone GitHub. Gjør dette i Design-økten:

1. **Last inn** siste zip som prosjektbasis (eller åpne eksisterende Paper-prosjekt).  
2. **Lim inn denne hele prompten** som første melding.  
3. **Vedlegg (hvis Design støtter filer):**  
   - denne prompten  
   - `docs/port/monsterdokument-paper.md` (valgfritt)  
   - rute-liste nedenfor (allerede inkludert)  
4. Design skal **lese `fase1/`, `fase2/`, `tokens/`, `components/`** i zip før tegning.  
5. Output **kun nye filer under `fase2/`** — aldri overskriv `fase1/`.

---

## PROMPT — kopier alt under til Claude Design

```
# OPPDRAG: AK Golf HQ — Paper fase2 for alle manglende skjermer

Du er senior produkt-designer for **AK Golf HQ** (golf coaching-plattform, Norge).
Du jobber i Claude Design-prosjektet **Claude Paper** med tokens og fase1 allerede levert.

## PROSJEKTKONTEKST (må forstås)

### Produkt
- **PlayerHQ** (`/portal`): spiller — plan, trening, analyse, booking, meg.
- **AgencyOS** (`/admin`): coach/akademi — stall, kø, kalender, workbench, økonomi, multi-coach/anlegg.
- **Forelder**, **Auth**, **Marketing booking** finnes også.
- Brand promise: «Vi gjør golfutvikling deterministisk».
- Språk: **norsk bokmål** i all UI.
- Demo-navn: spiller **Øyvind Rohjan**, coach **Anders Kristiansen**.

### Design-system (LÅST — ikke finn på nytt)
Surfaces: --bg #faf9f5 · --surface #fff · --soft #f0eee6 · --border #e8e6dc  
Text: --fg #141413 · --muted #5e5d59  
Rail alltid mørk #141413 · logo-dot / handling clay #D97757  
**Én ting nå:** maks ÉN solid clay-CTA per tilstand.  
Lime/grønn Presis (#005840, #D1F843) er **forbudt** til logo/CTA/rail.  
Radius 12 · Poppins UI · Lora brød · IBM Plex Mono tall.  
Tom-tilstand: soft + dashed border · empty-actions = ghost/ink, ikke clay.  
Viewport: mobil 430 + desktop der relevant.  
`data-od-id` på alle interaktive elementer.  
Logo: **ink** på mørk flate, **paper** på lys flate (bruk uploads/ak-golf-logo-*).

### Produktlåser
- PlayerHQ nav: **I dag · Plan · Analyse · Meg** (ikke finn opp 5. tab).
- AgencyOS: 5 primærjobber + sekundære.
- Depth: Simple vs Deep — deep (TrackMan, Workbench power) ikke dumpet på nybegynner day-1.
- Drill bank kan være **tom** — empty state ærlig, **ingen oppspinnede drills**.
- AI-coaching: inkluder i PRO; unngå generisk «AI-app»-språk i UI (bruk «caddie», «plan», «coach-tips»).
- Coaching-timer (Performance/Pro) er **ikke** app-tier.

### Kode-arkitektur (for rute-navn)
- Next.js App Router
- PlayerHQ under `/portal/*`
- AgencyOS under `/admin/*` og `/admin/agencyos/*`
- Live fullscreen: `/portal/(fullscreen)/live/...`
- Booking: `/portal/booking/*` + `/portal/meg/bookinger` + marketing slug-booking
- Workbench: spiller `/portal/planlegge/workbench` · coach `/admin/spillere/[id]/workbench`

## IKKE GJØR
1. Ikke overskriv **fase1/** (låst fasit).
2. Ikke tegn gråboks-wireframes som leveranse — full Paper-komposisjon.
3. Ikke lag 40 nesten-like lister — **konsolider** til hub + sheet + detalj.
4. Ikke bruk engelsk UI-tekst.
5. Ikke fyll med fake TrackMan/SG utover ærlig demo.

## METODE (hver batch)
1. Les relevante fase1-filer + components/*.card.html
2. Konsolideringstabell: | Rute i app i dag | Forslag (hub/fane/sheet/redirect) | Mal |
3. Tegn HTML under fase2/<område>/
4. Manifest: | Fil | Rute | Mal | Tilstander | Én ting nå |
5. Stopp etter batch — vent ikke på Anders midt i batch hvis autonom.

## ALLEREDE TEGNET (ikke tegn på nytt)

### fase1 (33)
playerhq-chat-desktop/mobil, plan, analyse, meg, booking  
live-brief, live-okt, live-summary, runde-live, runde-logg, test-gjennomfor  
workbench-desktop/mobil/turnering  
agencyos-konsoll desktop/mobil, spillere, innboks, kalender, okonomi, innstillinger, live-session, ak-stigen, agenticos  
innlogging, foreldreportal, booking, fangstsheet, spillerprofil  

### fase2/playerhq (11 — W1)
okt-detalj, feiring, fys-plan, teknisk-plan, drills, drill-detalj, tester-hub, test-detalj, turneringer, turnering-detalj, live-tapper  

## TEGN NÅ — BØLGER

### W2 — Analysere-dybde + Hjem-rest (FØRST, høyest verdi)
Konsolider ~40 dybderuter → **≤12 flater**.

Tegn:
1. `fase2/playerhq/analysere-hull.html` — hull-analyse detalj/sheet
2. `fase2/playerhq/analysere-runder.html` — runder-liste
3. `fase2/playerhq/analysere-runde-detalj.html` — runde detalj (score/SG)
4. `fase2/playerhq/gameplan.html` — gameplan hub
5. `fase2/playerhq/trackman-liste.html` — TrackMan sessions (deep mode chrome)
6. `fase2/playerhq/trackman-detalj.html` — én session (bruk components/trackman/*)
7. `fase2/playerhq/datagolf.html` — hvis egen flate; ellers fane i analyse (noter valg)
8. `fase2/playerhq/historikk-filter-sheet.html` — filter sheet
9. `fase2/playerhq/hjem-varsler.html` eller sheet for system-meldinger/fangst-full
10. Putting-lab / putting-analyse flate (deep) — `fase2/playerhq/putte-lab.html`

Referanse: playerhq-analyse.html + components/golfdata/* + trackman/*

### W3 — Meg + Booking-flyt + Coach + Talent
Referanse: playerhq-meg, playerhq-booking
Tegn manglende:
- meg/innstillinger hub + personvern + varsler
- meg/abonnement (PRO gratis til 1.sep — vis ærlig)
- booking/ny steg (coach → tid → bekreft) hvis ikke dekket
- booking detalj + avbestill sheet (policy: 24t)
- coach-melding liste/tråd
- talent undersider (kun deep)

### W4 — AgencyOS multi-coach / multi-facility + rest
Referanse: agencyos-konsoll, kalender, spillere, workbench
Tegn:
- kalender med **coach-fargelegend** + filter multi-coach
- hurtig-book wizard (coach + anlegg/facility)
- stall grupper / spiller 360 dybde-faner
- godkjenninger kø detalj
- drills admin empty FASIT (tom bank ærlig)
- innsikt/okonomi dybde hvis ikke i fase1

### W5 — Auth-rest + Forelder-dybde + Marketing
Referanse: innlogging, foreldreportal, booking
Tegn: glemt passord, sjekk e-post, samtykke junior, forelder økonomi, marketing landing kun hvis nødvendig.

### W6 — WANG / GFGK
Først: list foreslått shell (del PlayerHQ vs eget).  
Tegn 2–4 nøkkel-skjermer, ikke hele treet.

## APP-RUTER SOM FINNES (utdrag — konsolider hardt)

PlayerHQ (utvalg): /portal, /portal/planlegge*, /portal/analysere, /portal/analysere/hull, /portal/gameplan, /portal/mal/runder, /portal/mal/trackman, /portal/datagolf, /portal/drills, /portal/booking, /portal/booking/ny, /portal/meg/*, /portal/coach/*, live fullscreen-stier, /portal/gjennomfore/[id]

AgencyOS (utvalg): /admin/agencyos, /admin/spillere, /admin/innboks, /admin/godkjenninger, /admin/kalender, /admin/bookinger/ny, /admin/finance, /admin/drills, legacy under /admin/(legacy)/* → foreslå redirect inn i hub

~167 portal-page.tsx + ~156 admin-page.tsx finnes i kode — **de fleste er legacy/redirect-kandidater**. Din jobb er å tegne **minste sett fasit**, ikke 300 unike.

## LEVERANSEFORMAT
For hver batch:
1. Nye HTML-filer i fase2/
2. Manifest-tabell
3. «Hva koden skal porte først» — topp 5 filer

Start med **W2 fil 1–6** nå. Full Paper. Norsk. Tokens låst.
```

---

## Etter Design-batch
1. Anders batch-ja  
2. Zip → speil `designsystem/paper/`  
3. Grok/Claude Code porterer 1:1 med skjermbilde-gate  

