# PIXEL-PERFECT PLAN — hele produktet (Paper-fasit)

**Versjon:** 1.1 · **Dato:** 09.08.2026 kveld  
**Fasit-kilde:** `designsystem/paper/` = *AK Golf HQ — Claude Paper (3).zip* — verifisert 09.08.2026 kveld:
zip (3) er **byte-identisk** med zip (2)-speilet i repoet (diff = 0 filer). Ingen resync nødvendig; all
gap-analyse og checklist fra zip (2) gjelder uendret.  
**Natt-autonomi:** [`docs/port/OVERNIGHT-AUTONOMOUS-PLAN.md`](./OVERNIGHT-AUTONOMOUS-PLAN.md)  
**Status-kilde:** `docs/port/WAVE-STATUS-MASTER.md` · `docs/port/PAPER-ZIP-CHECKLIST.md` · `docs/port/PAPER-ZIP2-SYNC-2026-08-09.md`  
**Mål når planen er ferdig:** Hver **in-scope** skjerm er **pixel-perfekt** mot fasit (eller mal-fasit), signert av Anders, på `main`/prod.

---

## STATUS-SNAPSHOT (10.08.2026 formiddag — etter sign-off-galleriet)

| Fase | Status | Gjenstår |
|---|---|---|
| **PP-0 Foundation** | 0.1–0.6 **DONE** · 0.7 se merknad under | Prod-verify (mot `akgolf-hq.vercel.app`, se Acuity-merknad) |
| **PP-1 PlayerHQ kjerne** | 1.3 + 1.6 bygget (#387) · 1.1/1.2/1.4/1.5 bygget (#390) · 1.7 BLOCKED | Nytt galleri → sign-off |
| **PP-2 AgencyOS kjerne** | 2.1 Konsoll ombygget (#388) · 2.2 Innboks (#389) | **2.3 Spillere · 2.4 Kalender** + sign-off |
| **PP-3 Live/WB/Forelder** | Slugs + chrome PORT (Wave C/D/E) | Pixel-pass + sign-off |
| **PP-4 W1 / PP-5 W2** | Slugs lagt (batch C–E delvis) | Strukturell pixel + F2.6-primitiver + sign-off |
| **PP-6–PP-8 mal-fabrikk W3–W5** | Slug-stubber + VARIANTS-filer opprettet | Mal-pixel + variant-pass |
| **PP-9 W6 / PP-10 regression** | Ikke startet | Alt |
| **Checklist totalt** | **0 `[x]` · 52 `[~]` · 35 `[ ]`** (79 fasit + 8 templates = 87 rader) | 52 sign-off + 35 bygg |

Telleren sto tidligere på «2 `[x]` · 53 `[~]` · 36 `[ ]`». Det var feil på alle tre — talt på nytt
mot `PAPER-ZIP-CHECKLIST.md` 10.08: **ingen** rad har kryss.

**Kritisk vei til 100 %:** (1) **Preview-miljøet må virke** → (2) nytt sign-off-galleri →
(3) Anders signerer PP-1/PP-2 → (4) PP-2.3/2.4 + PP-3 → (5) de 35 `[ ]` → (6) mal-varianter W3–W5
→ (7) PP-10 regresjon + COMPLETE.

> ✅ **Preview-blokkeringen er løst 10.08 kl. 11:24.** Preview manglet `DIRECT_URL` fra 05.08
> (bygget døde i `npm install`) og `DATABASE_URL` (DB-sider svarte 500). Env-variablene er nå satt:
> samme kode som feilet kl. 10:41 bygde READY kl. 11:24, og `/stats/spillere` svarer 200.
>
> 🔑 **Det som gjenstår for sign-off er legitimasjon.** `scripts/signoff-gallery.mjs` logger inn som
> `screentest@akgolf.test` / `coachtest@akgolf.test` og krever `SCREENTEST_PASSWORD` (eller
> `SHOT_PASSWORD`). Passordets status er uavklart etter hendelsen 03.08. Uten det kan kun
> skjermer som ikke krever innlogging fotograferes (PP-1.6 Innlogging, PP-1.7 offentlig booking).

**Acuity-merknad (09.08.2026):** `akgolf.no` og `www.akgolf.no` videresender **midlertidig** til
Acuity-bookingen (PR #384) til plattformen er testet. All prod-verifisering i PP-0.7 og PP-10.5
gjøres derfor mot **`akgolf-hq.vercel.app`**. Før planen kan merkes COMPLETE må redirecten
fjernes fra `vercel.json` (egen liten PR) — lagt inn som PP-10.7 under.

---

## 0. Definisjon: «pixel-perfekt DONE»

En skjerm er **DONE** bare når **alle 12** er sanne. Ingen unntak for «nesten».

| # | Kriterium | Måling |
|---|---|---|
| D1 | Fasit åpnet side-om-side (HTML vs live rute) | Samme viewport |
| D2 | Layout-grid matcher (seksjoner, rekkefølge, hierarki) | ±0 seksjonsbytte |
| D3 | Spacing: 4px-stige (4/8/12/16/24/32/48) | Avvik ≤ 2px på nøkkelseksjoner |
| D4 | Type: Poppins/Lora/Plex Mono, sizes som fasit | Visuell match labels/titler/KPI |
| D5 | Farger kun Paper-tokens (`--p-*` / `T.*`) | Ingen hardkodet legacy-grønn/neon-CTA |
| D6 | **Én** solid primær-CTA = clay `#D97757` (`T.handling`) der fasit har «Én ting nå»; ellers ink CTA | Maks 1 solid handling per view |
| D7 | Logo: riktig surface (on-paper / on-ink / mono) fra `/logos/paper/` | Ingen feil logo-variant |
| D8 | Rail/topp/dokk = Paper chrome (mørk rail, cream flate) | Shell-komponent |
| D9 | Viewport: **m390** + **d1280** (og iPad 768 der fasit har egen) | Screenshots begge |
| D10 | Tom/laster/feil tilstander ærlig (ingen fake seed-data) | Manuell + empty props |
| D11 | QA-markører: `data-od-id` / `data-paper-slug` på root | DOM inspect |
| D12 | **Anders sign-off** + filer i `screenshots/paper/<slug>-m.png` + `-d.png` | PR-kommentar eller checklist `[x]` |

**Ikke DONE:** Wave «PORT chrome», «har V2», «ser bedre ut», «tokens OK».

**Pixel-toleranse:**  
- Struktur/CTA/logo/type: **0 toleranse for «feil system»**.  
- Sub-pixel font/antialiasing: tillatt.  
- Innhold (navn, tall): ekte data — layout skal tåle tom/lang tekst som fasit.

---

## 1. Omfang (in / out)

### 1.1 IN — må være pixel-perfekt når planen er ferdig

| Blokk | Antall fasit | Dekning i app | Metode |
|---|---:|---|---|
| **Fase 1** HTML | 33 | Kjerne PlayerHQ + AgencyOS + auth + live + workbench + forelder | 1:1 pixel mot HTML |
| **Fase 2 W1** PlayerHQ | 11 | Drill/plan/test/turnering/feiring/live-tapper | 1:1 pixel |
| **Fase 2 W2** Analysere-dybde | 12 | Hull, runder, gameplan, datagolf, trackman, putte, hjem-rest, filter | 1:1 eller mal |
| **Fase 2 W3** Meg/Booking/Talent/Coach | 7 | 17 reelle ruter via 6 maler | **Mal-pixel** + variant-pass |
| **Fase 2 W4** AgencyOS | 6 | Mange admin-ruter via 6 maler | **Mal-pixel** + variant-pass |
| **Fase 2 W5** Marketing/Auth/Forelder/System | 6 | ~63 ruter via 6 maler | **Mal-pixel** + variant-pass |
| **Fase 2 W6** WANG + GFGK | 4 | Microsites (egne tokens) | Pixel mot **egen** fasit (ikke Paper-shell) |
| **Templates** (strukturreferanse) | 8 | Ikke egne ruter — validerer shell | Brukes som shell-fasit, ikke egen DONE-rad |
| **SUM fasit-HTML** | **79** | | |

**Mal-pixel betyr:** Implementer den tegnede malen 100 % pixel; alle ruter som deler malen arver layout. Deretter 15-min variant-sjekk per rute (tittel, tom-state, primær handling).

### 1.2 OUT — eksplisitt utenfor «planen ferdig»

Disse er **ikke** blokkere for «alle in-scope pixel-perfekt»:

| Blokk | Hvorfor OUT | Når inn |
|---|---|---|
| `(marketing)/stats/*` (~45) | Eget produkt (PR-F) | Egen plan «W7-stats» |
| Drift/AgenticOS-dyp (~14) | Eget spor i W4-kart | Etter AgencyOS maler DONE |
| Redirect-stubber (<500–600 B) | Ikke skjermer | Slett/ignore |
| `(legacy)/*` som erstattes av v2 | Skal ut | Slett etter redirect-verifisering |
| Interne demos (`(internal)/`, design-system playground) | Ikke produksjon | Valgfritt |
| Claude Design templates utgått (`templates/_UTGÅTT.md`) | Historikk | Aldri |

### 1.3 «Alle skjermer» i denne planen = 

> Alle **reelle produksjonsruter** som har Paper-(2)-fasit eller dekkes av en Paper-(2)-mal, pluss W6 microsite-fasit.  
> Når checklist har `[x]` på alle IN-rader og mal-varianter er krysset, er planen **ferdig**.

---

## 2. Arkitektur før pixel (Foundation — obligatorisk)

Uten Foundation er pixel-port bortkastet (regresjon neste uke).

### F0 — Single source of design

| Leveranse | Eier-fil | DONE når |
|---|---|---|
| Paper tokens v3.1 speil | `src/styles/paper-tokens.css` | Allerede OK — re-verifiser ved token-endring i ny zip |
| v2-bridge | `src/app/globals.css` + `src/lib/v2/tokens.ts` | `T.handling` = clay, `T.lime`/`T.cta` = ink (dokumentert) |
| Logo canonical | `public/logos/paper/*` + `AkGolfLogo` + shell LogoAK | Kun paper-assets i produkt-UI |
| Designsystem speil | `designsystem/paper/` | Alltid = siste godkjente zip |

### F1 — Shell-monopoler (én implementasjon)

| Shell | Brukes av | Fasit |
|---|---|---|
| PlayerHQ shell (topp + bunn/rail) | Alle `/portal/*` | `playerhq-chat-*`, templates/playerhq-idag |
| AgencyOS shell (rail + hub-pills) | Alle `/admin/*` (ikke legacy) | `agencyos-konsoll-*`, templates/agencyos-* |
| Auth shell (midtkort, cream) | `/auth/*` | `innlogging.html` + `auth-flyt.html` |
| Live/fullscreen shell | live/runde | `playerhq-live-*` |
| Forelder shell | `/forelder/*` | `foreldreportal` + `forelder-barn` |
| Marketing shell | `(marketing)/*` unntatt stats | `marketing-side` / `marketing-katalog` |
| WANG shell | `/team-wang/*` | W6 fasit + wang-tokens |
| GFGK shell | `/gfgk-junior/*` | W6 fasit + gfgk-tokens |

**Regel:** Ingen side bygger egen header/nav. Avvik = bug.

### F2 — Primitiver (porter Paper-komponenter én gang)

Port fra `designsystem/paper/components/**` til React **før** skjerm-pixel der det mangler:

| Familie | Paper | App-mål | Prioritet |
|---|---|---|---|
| Actions | Button, Chip, FAB, OneThingNow | `core.tsx` Knapp/CTAPill + OneThingNow | **F2.1** |
| Shell/nav | rail, topp, dokk | `shell.tsx`, `PaperChrome`, `BunnNav` | **F2.2** |
| Data | KpiCard, KpiStripe, NowNext, AiTipCard | portal/admin KPI-blokker | **F2.3** |
| Calendar | DayStrip, UkeKalender, TimeGrid, AgendaRow | AgencyKalender + portal uke | **F2.4** |
| Forms | (forms/*) | innstillinger, auth, booking | **F2.5** |
| Trackman/golfdata/datavis | trackman/*, golfdata/*, datavis/* | PutteLab, TrackMan, Analyse | **F2.6** |
| Queue | queue/* | Godkjenninger/kø | **F2.7** |
| Overlays | sheets/modals | Fangst, filter, bekreft | **F2.8** |

**F2 DONE-kriterium:** Story/preview eller portal demo-rute viser primitiv = Paper card HTML; deretter skjermer bare komponerer.

### F3 — Automatiske vakter (hindrer regresjon)

| Vakt | Implementasjon | Blokkerer merge når |
|---|---|---|
| CTA-lint | ESLint/custom: solid fill ikke `T.lime` som handling; maks én `enTing`/`OneThingNow` per fil | brudd |
| No neon CTA | Forby `#D1F843` som button background i produkt-UI | brudd |
| Token-only colors | Flag hex utenfor tokens/theme-filer | warning→error i pixel-faser |
| Screenshot CI (valgfritt senere) | Playwright per slug m390/d1280 | diff > terskel |
| `data-paper-slug` required | På root av hver eier-komponent | checklist |

### F4 — Rute-sanering (før pixel på berørte flater)

| Problem | Handling | Før fase |
|---|---|---|
| TrackMan dobbelt: `/portal/trackman` + `/portal/mal/trackman` | Én canonical + redirect | PP-W2 |
| Workbench: ingen `/admin/workbench` | Canonical: spiller/gruppe workbench + portal planlegge/workbench; oppdater fasit-mapping | PP-F1-WB |
| Fangstsheet: kun modal | Behold modal som fasit-target *eller* legg rute — velg én | PP-F1 |
| Legacy redirects | Verifiser → slett fra inventar | Foundation |

---

## 3. Arbeidsmetode for HVER skjerm (fabrikk)

```text
1. Åpne fasit HTML (designsystem/paper/...) i nettleser m390
2. Åpne app-rute m390 side-om-side
3. Diff-liste (maks 15 punkter): seksjon / spacing / type / CTA / logo / empty
4. Implementer kun diff (minimal diff-prinsipp)
5. Gjenta d1280
6. Screenshots → screenshots/paper/<slug>-m.png + -d.png
7. Sett checklist [~] → klar for sign-off
8. Anders godkjenner → [x]
9. Neste skjerm
```

**Tidsboks per 1:1-fasit:** 2–6 t agent + 15–30 min Anders.  
**Tidsboks per mal:** 1–2 dager agent for malen + 20–40 min per variant-rute.

**Verktøy:** Playwright screenshots under `screenshots/paper/`; fasit kan screenshotes fra statisk HTML-server.

---

## 4. Faser til ferdig (sekvens — ikke hopp over)

Navnekonvensjon: **PP-** (Pixel Perfect) for å skille fra gamle Wave A–I (chrome-only).

### PP-0 · Foundation (1–2 dager)

> **PP-0 STATUS 2026-08-09:** kode-gates 0.1–0.6 DONE — se `docs/port/PP-0-STATUS.md`. 0.7 = Vercel verify.

| ID | Oppgave | Exit |
|---|---|---|
| PP-0.1 | Bekreft tokens = zip (2) | diff 0 på nøkkelverdier |
| PP-0.2 | Shell-monopoler: PlayerHQ + AgencyOS + Auth | 3 shells side-om-side mot fasit chrome |
| PP-0.3 | OneThingNow + Knapp defaults = clay/ink regler låst i `core.tsx` | lint + visuell spotcheck |
| PP-0.4 | LogoAK kun paper-assets overalt (grep gamle paths) | 0 treff feil path i UI |
| PP-0.5 | CTA-lint på | CI grønn |
| PP-0.6 | Rute-sanering TrackMan + Workbench mapping-doc | doc + redirects |
| PP-0.7 | Mac: alt på `main`, Vercel prod = samme commit | `akgolf.no` = HEAD |

**PP-0 DONE → ingen skjerm-pixel før dette er grønt.**

---

### PP-1 · PlayerHQ kjerne (fase1) — «zip-følelsen»

Dette er det som avgjør om appen *ser ut som* Paper.

| ID | Fasit | Rute | Eier | Prioritet |
|---|---|---|---|---|
| PP-1.1 | `playerhq-chat-mobil.html` + `desktop` | `/portal` | PortalChatHjem / samtale | P0 |
| PP-1.2 | `playerhq-plan.html` | `/portal/planlegge` | PlanV2 | P0 |
| PP-1.3 | `playerhq-analyse.html` | `/portal/analysere` | AnalysereV2 | P0 |
| PP-1.4 | `playerhq-meg.html` | `/portal/meg` | MegV2 | P0 |
| PP-1.5 | `playerhq-booking.html` | `/portal/booking` | BookingHubV2 | P0 |
| PP-1.6 | `innlogging.html` | `/auth/logg-inn` (+ login alias) | LoginV2 | P0 |
| PP-1.7 | `booking.html` | public booking | marketing booking | P0 |

**Exit PP-1:** Alle 7 har D1–D12 + Anders `[x]`.  
**Suksesskriterium for Anders:** «Dette ser ut som zip-en» på Hjem/Plan/Meg uten å miste funksjon.

---

### PP-2 · AgencyOS kjerne (fase1)

| ID | Fasit | Rute | Eier |
|---|---|---|---|
| PP-2.1 | `agencyos-konsoll-desktop.html` + mobil | `/admin/agencyos` | CockpitV2 |
| PP-2.2 | `agencyos-innboks.html` + mobil | `/admin/innboks` | TriageV2 |
| PP-2.3 | `agencyos-spillere.html` + mobil | `/admin/spillere` | StallV2 |
| PP-2.4 | `agencyos-kalender.html` + mobil | `/admin/kalender` | AgencyKalenderV2 |
| PP-2.5 | `agencyos-okonomi.html` | `/admin/agencyos/okonomi` | AdminOkonomiV2 |
| PP-2.6 | `agencyos-innstillinger.html` | `/admin/settings` | AdminSettingsV2 |
| PP-2.7 | `agencyos-ak-stigen.html` | `/admin/agencyos/ak-stigen` | (eier-komponent) |
| PP-2.8 | `agencyos-agenticos.html` | `/admin/agents` | (eier) |
| PP-2.9 | `spillerprofil.html` | `/admin/spillere/[id]` | Spiller360 / profil |

**Exit PP-2:** Alle radene `[x]`. Coach-farger/slot-hold skal **ikke** bryte pixel (visuelle aksenter innenfor fasit-ramme).

---

### PP-3 · Live · Runde · Fangst · Workbench (fase1)

| ID | Fasit | Rute/eier |
|---|---|---|
| PP-3.1 | `playerhq-live-brief.html` | LiveBrief + shell |
| PP-3.2 | `playerhq-live-okt.html` | LiveActive (cream, ikke mørk) |
| PP-3.3 | `playerhq-live-summary.html` | SessionSummary |
| PP-3.4 | `agencyos-live-session.html` | admin live |
| PP-3.5 | `playerhq-runde-live.html` | runde live |
| PP-3.6 | `playerhq-runde-logg.html` | runde logg |
| PP-3.7 | `playerhq-test-gjennomfor.html` | test gjennomfør |
| PP-3.8 | `fangstsheet.html` | FangstModal (eller ny rute) |
| PP-3.9 | `workbench-desktop.html` | spiller/gruppe workbench d |
| PP-3.10 | `workbench-mobil.html` | workbench m |
| PP-3.11 | `workbench-turnering.html` | turnering-variant |
| PP-3.12 | `foreldreportal.html` | `/forelder` hub |

**Exit PP-3:** Hele fase1 checklist = `[x]` (33/33).

---

### PP-4 · Fase2 W1 (økt/drill/test/turnering/feiring)

| ID | Fasit | Typisk rute |
|---|---|---|
| PP-4.1–4.11 | `playerhq-drills`, `drill-detalj`, `okt-detalj`, `fys-plan`, `teknisk-plan`, `tester-hub`, `test-detalj`, `turneringer`, `turnering-detalj`, `feiring`, `live-tapper` | portal tren/plan/mal |

**Exit PP-4:** W1 11/11 `[x]`.

---

### PP-5 · Fase2 W2 (data-dybde) + F2.6 primitiver

**Først:** Port datavis/trackman/golfdata-primitiver som fasiten bruker (F2.6).  
**Deretter skjermer:**

| ID | Fasit | Eier |
|---|---|---|
| PP-5.1 | `playerhq-putte-lab.html` | PutteLabV2 |
| PP-5.2 | `playerhq-trackman-liste.html` | portal trackman liste |
| PP-5.3 | `playerhq-trackman-detalj.html` | portal trackman detalj |
| PP-5.4 | `playerhq-analyse-hull.html` | AnalysereHullV2 |
| PP-5.5 | `playerhq-runder-liste.html` | RunderV2 |
| PP-5.6 | `playerhq-runde-detalj.html` | RundeDetaljV2 |
| PP-5.7 | `playerhq-gameplan-liste.html` | GameplanV2 |
| PP-5.8 | `playerhq-gameplan-banekart.html` | banekart |
| PP-5.9 | `playerhq-datagolf.html` | DataGolfV2 |
| PP-5.10 | `playerhq-historikk-filter-sheet.html` | filter sheet |
| PP-5.11 | `playerhq-hjem-varsler.html` | varsler |
| PP-5.12 | `playerhq-hjem-rest.html` | venner/utfordringer etc. |

**Exit PP-5:** W2 12/12 `[x]` + TrackMan kun én canonical rute.

---

### PP-6 · Mal-fabrikk W3 (Meg / Booking / Talent / Coach)

Implementer **6 maler** pixel-perfekt, deretter variant-pass:

| Mal-fasit | Dekker (fra W3-kart) | Variant-ruter (sjekkliste) |
|---|---|---|
| `playerhq-innstillinger.html` | 9 innstillinger-ruter | hub + 8 undersider |
| `playerhq-abonnement.html` | abonnement-familie | gratis/pro/feilet/tom |
| `playerhq-helse.html` | helse + symptom-ark | |
| `playerhq-booking-ny.html` | booking veiviser | steg 1–n, bekreft |
| `playerhq-booking-mine.html` | mine bookinger (+ detalj som §12) | |
| `playerhq-coach-hub.html` | coach v2-flater | |
| `playerhq-talent.html` | talent nivå + roadmap | FEATURES.TALENT |

*(7 HTML i zip; booking-mine kan ligge som egen — behandle som mal + §12 detalj.)*

**Exit PP-6:** Alle W3-ruter som ikke er redirect har variant-rad `[x]`.

---

### PP-7 · Mal-fabrikk W4 (AgencyOS rest)

| Mal-fasit | Dekker |
|---|---|
| `agencyos-godkjenninger.html` | kø-familien (5 ruter → 1 flate) |
| `agencyos-gruppe-detalj.html` | gruppe + faner |
| `agencyos-bookinger.html` | bookinger + kapasitet |
| `agencyos-planbibliotek.html` | plans + templates + teknisk-plan |
| `agencyos-turneringer.html` | tournaments + kart |
| `agencyos-oppsett.html` | settings-familien (~14) |

**Exit PP-7:** W4 maler `[x]` + variant-sjekk dokumentert i `docs/port/PP-W4-VARIANTS.md`.

---

### PP-8 · Mal-fabrikk W5 (Marketing / Auth / Forelder / System)

| Mal-fasit | Dekker |
|---|---|
| `marketing-side.html` | 14 marketing-sider |
| `marketing-katalog.html` | coacher/anlegg/blogg/cases/turneringer |
| `auth-flyt.html` | login-familie (ikke erstatte PP-1.6 pixel — utvid tilstander) |
| `auth-samtykke.html` | guardian/lyd/venter |
| `forelder-barn.html` | alle forelder-undersider |
| `system-tilstander.html` | offline/404/500/403/feature-off |

**Exit PP-8:** W5 `[x]` (stats fortsatt OUT).

---

### PP-9 · W6 Microsites

| ID | Fasit | Note |
|---|---|---|
| PP-9.1–9.4 | wang-*, gfgk-* | Egne tokens — pixel mot W6 HTML, ikke tving Paper-shell |

**Exit PP-9:** 4/4 `[x]`.

---

### PP-10 · Templates shell-validering + full regression

| ID | Oppgave |
|---|---|
| PP-10.1 | Sammenlign live shells mot `templates/agencyos-*` + `playerhq-idag` |
| PP-10.2 | Full runde: alle `[x]` i `PAPER-ZIP-CHECKLIST.md` |
| PP-10.3 | Playwright smoke: alle P0-ruter 200 + ingen console error |
| PP-10.4 | Visuell stikkprøve 10 tilfeldige variant-ruter |
| PP-10.5 | Prod deploy + hard refresh verifisering (mot `akgolf-hq.vercel.app` så lenge Acuity-redirecten står) |
| PP-10.6 | Merk planen **COMPLETE** i WAVE-STATUS-MASTER + dato |
| PP-10.7 | Fjern Acuity-redirecten fra `vercel.json` (PR #384 reverseres) + verifiser `akgolf.no` = plattformen | 

---

## 5. Master checklist (ferdig = alt grønt)

### 5.1 Fasit-HTML (79)

Speil alltid `docs/port/PAPER-ZIP-CHECKLIST.md`.  
**Plan COMPLETE krever:** 0× `[ ]`, 0× `[~]`, 79× `[x]` for IN-fasit  
(+ variant-rader for mal-dekning i egne filer).

### 5.2 Mal-varianter (må tracks)

Opprett og fyll:

- `docs/port/PP-W3-VARIANTS.md`
- `docs/port/PP-W4-VARIANTS.md`
- `docs/port/PP-W5-VARIANTS.md`

Hver variant-rute: slug · rute · mal · m390 · d1280 · sign-off.

### 5.3 Foundation gates

- [ ] PP-0.1 … PP-0.7  
- [ ] F2.1–F2.8 primitiver (minst de som brukes av PP-1…PP-5)

---

## 6. Tidsestimat (kalender, AI-assistert team)

> Estimater er for **ferdig med Anders sign-off**, ikke bare agent-kode.  
> Antar: 1 primær agent-strøm + Anders 30–90 min/dag review.

| Fase | Kalender (realistisk) | Avhengighet |
|---|---|---|
| PP-0 Foundation | 1–2 dager | Push til main |
| PP-1 PlayerHQ kjerne | 4–7 dager | PP-0 |
| PP-2 AgencyOS kjerne | 4–6 dager | PP-0 |
| PP-3 Live/WB/Forelder | 4–6 dager | PP-1/2 shells |
| PP-4 W1 | 3–5 dager | PP-1 |
| PP-5 W2 + data-primitiver | 5–8 dager | F2.6 |
| PP-6 W3 maler | 4–6 dager | PP-1 |
| PP-7 W4 maler | 4–6 dager | PP-2 |
| PP-8 W5 maler | 3–5 dager | PP-0 marketing shell |
| PP-9 W6 | 2–3 dager | egne tokens |
| PP-10 Regression | 2–3 dager | alt over |
| **SUM** | **~5–8 uker** kalender | Med parallell PP-1∥PP-2 etter PP-0: nærmere **5–6 uker** |

**Crash-path (2–3 uker):** Kun PP-0 + PP-1 + PP-2 + PP-3 + P0 fra PP-5 (putte/trackman/booking).  
**Ikke** «hele planen ferdig» — men app *føles* Paper.

---

## 7. Parallelisering (etter PP-0)

```text
        PP-0 Foundation
              |
        +-----+-----+
        |           |
      PP-1        PP-2
   PlayerHQ     AgencyOS
        |           |
      PP-3        PP-7
   Live/WB       W4 maler
        |
   +----+----+
   |         |
 PP-4      PP-5
  W1        W2
   |
 PP-6 W3
   |
 PP-8 W5
   |
 PP-9 W6
   |
 PP-10 COMPLETE
```

Agent-strømmer (maks 2 samtidige pixel-områder for å unngå shell-konflikt):

1. **Strøm α:** PlayerHQ (PP-1 → 3 → 4 → 5 → 6)  
2. **Strøm β:** AgencyOS (PP-2 → 7) + deretter W5/W6  

---

## 8. Roller og beslutninger

| Rolle | Ansvar |
|---|---|
| **Agent (Grok/Claude)** | Diff-liste, implementer, screenshots, checklist `[~]` |
| **Anders** | Sign-off D12, prioritering hvis konflikt fasit vs funksjon, mal-vedtak W3–W5 |
| **Prod** | Kun merge etter PP-fase exit + grønn build |

**Konfliktregel:** Fasit vinner på layout/CTA/logo.  
Funksjon/data som mangler i fasit: ærlig empty — **ikke** finn opp UI.  
Fasit feil mot vedtatt IA: stopp, 1-linjes beslutning, oppdater fasit eller rute.

---

## 9. Leveranseformat per PR

Hver pixel-PR:

```text
feat(paper-pixel): PP-1.2 PlanV2 = playerhq-plan.html

- Side-om-side diff lukket (liste i PR)
- screenshots/paper/playerhq-plan-m.png
- screenshots/paper/playerhq-plan-d.png
- data-paper-slug="playerhq-plan"
- Checklist → klar for sign-off
```

Maks 1–3 skjermer per PR (unngå umulig review).

---

## 10. Definition of COMPLETE (planen ferdig)

Alle må være sanne:

1. `PAPER-ZIP-CHECKLIST.md`: **79/79 `[x]`** (IN-fasit)  
2. W3/W4/W5 variant-filer: **100 % ruter `[x]`** (ikke redirects)  
3. PP-0 gates grønne  
4. Playwright smoke P0+P1 grønn  
5. `main` + prod på samme commit, **Acuity-redirecten fjernet** (PP-10.7) og `akgolf.no` viser plattformen  
6. Anders skriftlig: «Pixel-plan COMPLETE» (dato)  
7. OUT-lister (stats, drift) dokumentert som **ikke** del av complete  

Når 1–7 er sanne: **alle in-scope skjermer er pixel-perfekt slik de skal være.**

---

## 11. Neste 72 timer (oppdatert 09.08 kveld — Foundation og batch A er ferdig kode)

| Time | Handling |
|---|---|
| 0–4 | **Sign-off-runde PP-1:** agent produserer side-om-side-skjermbilder (app vs fasit, m390 + d1280) for alle 7 PP-1-skjermer og sender i samtalen; Anders krysser `[x]` eller gir diff-liste |
| 4–12 | Rett diffene fra runde 1; start pixel-pass PP-2.2–2.4 (Innboks/Spillere/Kalender) |
| 12–24 | Sign-off-runde PP-2 (samme format) |
| 24–48 | PP-3 pixel-pass (Live/Workbench/Forelder) + sign-off-runde |
| 48–72 | Start de 36 `[ ]`: PP-4 W1-skjermene først, deretter F2.6-primitiver for PP-5 |

---

## 12. Relaterte dokumenter

| Doc | Rolle |
|---|---|
| `designsystem/paper/` | Fasit |
| `designsystem/paper/github.md` | Screen map rute ↔ HTML |
| `docs/port/PAPER-ZIP-CHECKLIST.md` | Kryss `[x]` |
| `docs/port/PAPER-ZIP2-SYNC-2026-08-09.md` | Gap-bakgrunn |
| `docs/port/WAVE-STATUS-MASTER.md` | Gammel chrome-status (underordnes denne) |
| `docs/port/PAPER-PREFLIGHT-CONFLICTS-2026-08-09.md` | Token-semantikk |
| `kart/w3…w6-*.md` | Mal-konsolidering |

---

## 13. Én setning

**Fullfør Foundation, deretter pixel-port hver fasit og hver mal til D1–D12 med screenshots og din sign-off — da er alle in-scope skjermer pixel-perfekte, og stats/drift forblir bevisst utenfor til egne planer.**
