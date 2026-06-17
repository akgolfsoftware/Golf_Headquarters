# 70 — Design-til-kode-plan: AK Golf HQ

> Autoritativ handlingsplan for å ta alle designede skjermer fra `public/design-handover/prosjektgjennomgang-2026-06-17/` til produksjonsklar kode, og dekke designgapet frem mot lansering.
> Skrevet: 17. juni 2026. Kilde: 60-HANDOFF-SKJERMKART, 61-DEKNINGSMATRISE, 40-PORTING-RUNBOOK, 30-PORTERINGSPLAN, audit/00-OPPSUMMERING, docs/MASTER-SKJERMPLAN.
> **Korrigert:** 17. juni 2026 (kritiker-gjennomgang — 7 rettelser).

> **TO AKSER — les dette FØR du tolker statusene:**
> `MASTER-SKJERMPLAN`s Design-hake (✓/~/–) = skjermen er **BYGD** i appen (gammel athletic-stil).
> Dekningsmatrisens `NY-HYBRID` = skjermen har et **HYBRID-design i 17.juni-handoffen** (ikke bygd ennå).
> Dette er TO separate akser som ikke skal sammenblandes. Der `MASTER=Design–` men matrisen=`NY-HYBRID`,
> er det forventet: MASTER-haken oppdateres til hybrid **UNDER porting** (per runbook, steg 7), og skjermen
> skal **portes fra handoffen**, IKKE sendes til Claude Design.
> Ved spørsmål om «har vi hybrid-design for denne skjermen»: **dekningsmatrisen vinner**.
> (Gjelder bl.a. `/portal/coach*`, `/auth/reset-password`, `/auth/check-email`,
> `/admin/agencyos/uka`, `/admin/coach-workbench`, `/admin/planlegge`.)

---

## 0 — Designstatus korrekt fordelt (RETTET)

Fra `61-DEKNINGSMATRISE.md` (5-status-taksonomi, korrigert):

| Status | Antall ruter | Hva |
|---|---|---|
| **NY-HYBRID** | ~77 | Designet i 17.juni-handoffen — klare til porting fra `.dc.html` |
| **RE-SKIN** | ~41 | Design=✓ i MASTER (gammel athletic-stil) — IKKE i handoffen. Re-skinnes med ny token-palett + komponent-galleri. **Sendes ALDRI til Claude Design.** |
| **TRENGER-DESIGN** | ~172 | Design=– og ikke i handoffen → Claude Design fra null |
| **UTSATT** | ~16 | Elite Fase 2 (Talent PlayerHQ + AgencyOS Talent) — ikke i scope nå |
| **EGET-SPOR** | ~50 | Stats-plattformen — separat prosjekt |

> **Det korrekte «trenger nytt design»-tallet er ~172, IKKE 282.** Differansen (~110 ruter) er RE-SKIN + UTSATT — disse har fungerende kode og skal ikke overskrives. Se `61-DEKNINGSMATRISE.md` for per-rute-klassifisering.

---

## 1 — Forutsetninger (Fase 0 + 2 fra porteringsplanen)

### 1a — Branch og worktree (Fase 0 — ½ dag)

Aldri rett på main. Alle porting-bølger jobber på en dedikert branch.

```
skill: akgolf-branch-workflow
branch: feat/hybrid-design-system   (pågående — bruk denne)
```

Sjekkliste før arbeid starter:
- [ ] `public/design-handover/prosjektgjennomgang-2026-06-17/` er på plass med alle `.dc.html`-filer
- [ ] `scripts/route-shot.mjs` og `scripts/redesign-shot.mjs` virker mot `localhost:3000`
- [ ] `npm run dev` starter uten feil på branchen

### 1b — Token-migrering FØRST (Fase 2a — gjøres som ett isolert commit)

Endrer **kun `.dark`-blokken** i `src/app/globals.css` til hybrid terminal-paletten fra `40-PORTING-RUNBOOK`. Lyst tema (`PlayerHQ`) er allerede riktig og røres ikke.

| Token | I dag | Terminal-hybrid | Hex |
|---|---|---|---|
| `--background` | 157 47% 11% | **153 39% 5%** | `#07100C` |
| `--foreground` | 157 47% 11% | **135 24% 93%** | `#EAF2EC` |
| `--card` / `--popover` / `--secondary` / `--muted` | 157 39% 14% | **152 33% 10%** | `#11221A` |
| `--muted-foreground` | 137 4% 63% | **142 11% 65%** | `#9DB0A4` |
| `--border` / `--input` | 158 30% 24% | **147 23% 18%** | `#243A2E` |
| `--destructive` | 2 80% 75% | **14 86% 59%** | `#F0683E` |
| `--success` | 157 49% 56% | **147 58% 56%** | `#4FD08A` |
| `--warning` | 34 80% 60% | **42 79% 57%** | `#E8B43C` |
| `--info` | 222 100% 76% | **208 83% 65%** | `#5AA9F0` |

`--primary`, `--accent`, `--ring` = lime `72 92% 62%` — låst, rør ikke.

Etter tokens: oppdater `src/lib/design-tokens.ts` (TS-speil for charts). Kjør `npx tsc --noEmit && npm run build` og ta et galleri-screenshot med `scripts/redesign-shot.mjs` for å verifisere lime-lås + ingen hardkodet hex.

**Skills:** `akgolf-design-system`, `ak-golf-hq-design`

### 1b-2 — Bygg 8 manglende komponenter (Fase 2b — BLOKKERER Bølge 1 og 2)

> **KRITISK rekkefølge:** 6 av de 8 komponentene MÅ bygges FØR Bølge 1 og Bølge 2 starter. `PercentileGauge` og `SkillRadarLive` blokkerer IKKE Bølge 1/2 — de trengs kun når Talent (Elite Fase 2, UTSATT) aktiveres og bygges da. Bølge 1 (PlayerHQ Hjem, Live-økt) og Bølge 2 (Handlingssenter, Cockpit) bruker de 6 resterende direkte.

Fra `20-KOMPONENT-SPEC.md` — finnes ikke i `src/components/athletic/` i dag:

| # | Komponent | Brukes i bølge | Blokkerer Bølge 1/2 |
|---|---|---|---|
| 1 | `HeatmapCalendar` | Bølge 1 (Hjem, Gjennomføre) | Ja |
| 2 | `LiveRepPulse` | Bølge 1 (Live-økt PlayerHQ) + Bølge 2 (Live-økt Coach) | Ja |
| 3 | `PercentileGauge` | Talent (UTSATT — aktiveres når Talent (Elite Fase 2) aktiveres) | **Nei** — trengs ikke i Bølge 1/2 |
| 4 | `SkillRadarLive` | Talent (UTSATT — aktiveres når Talent (Elite Fase 2) aktiveres) | **Nei** — trengs ikke i Bølge 1/2 |
| 5 | `ViewSwitcher` | Bølge 2 (Handlingssenter, Workbench) | Ja |
| 6 | `KanbanBoard` | Bølge 2 (Handlingssenter) | Ja |
| 7 | `DataTable Pro` | Bølge 2 (Handlingssenter, Stall, Tester, Økonomi) | Ja |
| 8 | `EventTimeline` | Bølge 2 (Cockpit, Planlegging) | Ja |

**Skills:** `akgolf-design-system`, `frontend-design`, `playerhq-arkitektur`

### 1c — Trygg sletting (Fase 2c — gjøres etter token-migrering + komponenter, FØR porting)

Fra `audit/00-OPPSUMMERING.md` (grep-verifisert):
- Slett `_archive/` (412 MB, allerede gitignored)
- Slett `content/blog/` + `src/lib/blog.ts` (ikke `content/blogg/*.mdx`)
- Slett `src/app/admin/facilities/` + `src/app/admin/locations/` (uoppnåelige — 301 til `/admin/anlegg`)
- Slett ~20 døde komponenter (athletic/pagination, queue-item, stub-modal, lphase-distribution, practice-type-distribution, skill-area-bands, compare-calendar, load-calendar; shared/overview-shell, overview-card, fullscreen-template; ui/empty-state dublett)
- Slett ~135 foreldreløse filer (se `audit/audit-struktur.md`)

**IKKE slett:** `portal/mal/*` (84 levende referanser), `design-system/` (ny systemkilde), `src/app/portal/` generelt.

---

## 2 — Porting-bølger (handoff-skjerm → ruter)

Totalt **~28 portbare NY-HYBRID-skjermer** i 6 produkt-bølger (Talent UTSATT), pluss Bølge 7 for RE-SKIN av eksisterende komponent-galleri. 8 nye komponenter bygges i Fase 2b FØR Bølge 1. Ekskl. 3 arkitektur-docs.

> Rekkefølge: PlayerHQ kjerne → AgencyOS kjerne → Workbench → Forelderportal → Auth → Marketing → Komponent-galleri.
> Stats er eget spor og inngår ikke.

---

### Bølge 1 — PlayerHQ kjerne (mobil-first, 430 px)

**Mål:** 9 kjerne-handoff-skjermer for spillerportalen. Talent er UTSATT (Elite Fase 2).

| Handoff-skjerm | Fil | Ruter dekket | Status |
|---|---|---|---|
| PlayerHQ Hjem | `PlayerHQ Hjem (hybrid).dc.html` | `/portal` | NY-HYBRID |
| PlayerHQ Varsler | `PlayerHQ Varsler (hybrid).dc.html` | `/portal/varsler` | NY-HYBRID |
| PlayerHQ Gjennomføre | `PlayerHQ Gjennomføre (hybrid).dc.html` | `/portal/gjennomfore`, `/portal/gjennomfore/[id]` | NY-HYBRID |
| PlayerHQ Live-økt | `PlayerHQ Live-økt (hybrid).dc.html` | `/portal/(fullscreen)/live/[sessionId]/brief`, `/active`, `/summary` | NY-HYBRID |
| PlayerHQ Analyse | `PlayerHQ Analyse (hybrid).dc.html` | `/portal/analysere`, `/portal/statistikk`, `/portal/trackman/[sessionId]`, `/portal/tren/tester` | NY-HYBRID |
| PlayerHQ Booking | `PlayerHQ Booking (hybrid).dc.html` | `/portal/booking`, `/portal/booking/ny` | NY-HYBRID |
| PlayerHQ Coach | `PlayerHQ Coach (hybrid).dc.html` | `/portal/coach`, `/portal/coach/melding`, `/portal/coach/melding/[id]` | NY-HYBRID |
| PlayerHQ Drills | `PlayerHQ Drills (hybrid).dc.html` | `/portal/drills` | NY-HYBRID |
| PlayerHQ Meg | `PlayerHQ Meg (hybrid).dc.html` | `/portal/meg`, `/portal/meg/profil`, `/portal/meg/abonnement`, `/portal/meg/innstillinger` | NY-HYBRID |
| ~~PlayerHQ Talent~~ | ~~`PlayerHQ Talent (hybrid).dc.html`~~ | ~~`/portal/talent/*`~~ | **UTSATT** — Elite Fase 2, per MASTER-SKJERMPLAN. Designet i handoffen, men portes ikke nå. Aktiveres når Anders gir grønt lys. |

**Skills:** `design-porting-gate`, `vercel:nextjs`, `frontend-design`

---

### Bølge 2 — AgencyOS kjerne (desktop, 1280 px)

**Mål:** 9 kjerne-handoff-skjermer for admin-portalen. AgencyOS Talent Coach er UTSATT (Elite Fase 2).

| Handoff-skjerm | Fil | Ruter dekket | Status |
|---|---|---|---|
| AgencyOS Cockpit | `AgencyOS Cockpit (hybrid).dc.html` | `/admin/agencyos`, `/admin/agencyos/uka` | NY-HYBRID |
| AgencyOS Handlingssenter | `AgencyOS Handlingssenter (hybrid).dc.html` | `/admin/innboks`, `/admin/kommunikasjon`, `/admin/queue`, `/admin/foresporsler`, `/admin/godkjenninger` | NY-HYBRID |
| AgencyOS Kalender | `AgencyOS Kalender (hybrid).dc.html` | `/admin/kalender`, `/admin/kalender/uke`, `/admin/kalender/maned` | NY-HYBRID |
| AgencyOS Live-økt Coach | `AgencyOS Live-økt Coach (hybrid).dc.html` | `/admin/live/[sessionId]/brief`, `/active`, `/summary` | NY-HYBRID |
| AgencyOS Planlegging | `AgencyOS Planlegging (hybrid).dc.html` | `/admin/planlegge`, `/admin/plans`, `/admin/plans/[planId]` | NY-HYBRID (/admin/planlegge har Design=– i MASTER — portes fra handoff) |
| AgencyOS Risiko | `AgencyOS Risiko (hybrid).dc.html` | `/admin/analyse`, `/admin/analysere`, `/admin/analysere/compliance` | NY-HYBRID |
| AgencyOS Stall | `AgencyOS Stall (hybrid).dc.html` | `/admin/spillere`, `/admin/spillere/[id]` | NY-HYBRID |
| AgencyOS Tester | `AgencyOS Tester (hybrid).dc.html` | `/admin/tester`, `/admin/tester/[id]`, `/admin/tester/benchmarks` | NY-HYBRID |
| AgencyOS Økonomi | `AgencyOS Økonomi (hybrid).dc.html` | `/admin/okonomi` | NY-HYBRID |
| ~~AgencyOS Talent Coach~~ | ~~`AgencyOS Talent Coach (hybrid).dc.html`~~ | ~~`/admin/talent/*`~~ | **UTSATT** — Elite Fase 2, per MASTER-SKJERMPLAN. Hele `/admin/talent/*`-treet er utsatt inntil Anders gir grønt lys. |

**Merk:** `AgencyOS Mørkhet - 3 alternativer.dc.html` er IKKE portbar — det er en tema-beslutningsfil. Anders velger terminal-nivå (anbefalt: A «Løftet terminal»), og det implementeres via tokens i Fase 2a.

**Skills:** `design-porting-gate`, `vercel:nextjs`, `frontend-design`, `coachhq-arkitektur`

---

### Bølge 3 — Workbench (delt kjerne)

**Mål:** De 4 portbare Workbench-skjermene. 2 av 6 handoff-filer er krav-specs (arkdokumenter) — disse LESES som krav, ikke portes direkte.

| Handoff-skjerm | Fil | Ruter dekket | Type |
|---|---|---|---|
| Workbench Dashboard | `Workbench Dashboard.dc.html` | `/portal/planlegge`, `/admin/coach-workbench`, `/admin/spillere/[id]/workbench` | PORT |
| Workbench Interaktiv | `Workbench Interaktiv.dc.html` (kilde: standalone-src) | `/portal/planlegge`, `/portal/planlegge/workbench`, `/portal/tren/aarsplan`, `/admin/planlegge`, `/admin/coach-workbench` | PORT |
| Workbench Trackman | `Workbench Trackman.dc.html` | `/portal/trackman/[sessionId]`, `/admin/teknisk-plan/[spillerId]` | PORT |
| Workbench Coach-Skill | `Workbench Coach-Skill.dc.html` | `/admin/plan-templates`, `/admin/plan-templates/ny`, `/admin/spillere/[id]/workbench` | PORT |
| Workbench Plan - Planlegging, Skills og Trackman | — | Krav-spec: leses som arkitektur, ikke portes | SPEC |
| Workbench Plan 3 til 10 | — | Krav-spec: TurneringsType-enum + LiveSession-kontrakt | SPEC |

**MASTER-SKJERMPLAN-status for Workbench-ruter:**
- `/admin/coach-workbench` — Design=– i MASTER (prototype-status), men DESIGNET i handoff → NY-HYBRID. Port fra handoff-filene.
- `/admin/spillere/[id]/workbench` — Design=✓ i MASTER → NY-HYBRID (handoffen re-designe overflaten).
- `/admin/planlegge` — Design=– i MASTER, men DESIGNET i handoff → NY-HYBRID. Port fra AgencyOS Planlegging + Workbench Interaktiv.

**Merk:** Workbench er Anders' design — koble til eksisterende kode, men redesign IKKE funksjonell logikk uten godkjenning.

**Skills:** `design-porting-gate`, `playerhq-arkitektur`, `coachhq-arkitektur`

---

### Bølge 4 — Forelderportal (mobil-first, 430 px)

**Mål:** 6 handoff-skjermer for forelderportalen.

| Handoff-skjerm | Fil | Ruter dekket |
|---|---|---|
| Forelderportal Hjem | `Forelderportal Hjem (hybrid).dc.html` | `/forelder` |
| Forelderportal Barn-profil | `Forelderportal Barn-profil (hybrid).dc.html` | `/forelder/barn`, `/forelder/barn/[childId]` |
| Forelderportal Bookinger | `Forelderportal Bookinger (hybrid).dc.html` | `/forelder/bookinger` |
| Forelderportal Fakturaer | `Forelderportal Fakturaer (hybrid).dc.html` | `/forelder/fakturaer`, `/forelder/okonomi` |
| Forelderportal Samtykke | `Forelderportal Samtykke (hybrid).dc.html` | `/forelder/samtykke` |
| Forelderportal Ukerapport | `Forelderportal Ukerapport (hybrid).dc.html` | `/forelder/ukerapport` |

**Skills:** `design-porting-gate`, `frontend-design`

---

### Bølge 5 — Auth + Onboarding

**Mål:** 2 portbare handoff-skjermer (NY-HYBRID). AuthCard er komponent-spec, ikke sideskjerm.

| Handoff-skjerm | Fil | Ruter dekket | Status |
|---|---|---|---|
| Auth Innlogging | `Auth Innlogging (hybrid).dc.html` | `/auth/login`, `/auth/signup`, `/auth/onboarding`, `/onboard/coach` | NY-HYBRID |
| Auth Reset Passord | `Auth Reset Passord (hybrid).dc.html` | `/auth/forgot-password`, `/auth/check-email`, `/auth/reset-password` | NY-HYBRID |

`AuthCard.dc.html` er komponent-spec for AuthCard-primitiven — bruk som kilde ved re-skin av `src/components/ui/auth-card.tsx`.

**RE-SKIN** (ikke i handoff, men Design=✓/~ i MASTER — re-skinnes via token-migrering, IKKE sendt til Claude Design):
- `/auth/bankid` — Design=✓ i MASTER, ikke i handoff. Re-skinn eksisterende stub.
- `/auth/logget-ut` — Design=~ i MASTER, ikke i handoff. Re-skinn.

**Skills:** `design-porting-gate`, `vercel:auth`, `frontend-design`

---

### Bølge 6 — Marketing

**Mål:** 4 portbare marketing-skjermer (desktop-first, 1280 px).

| Handoff-skjerm | Fil | Ruter dekket |
|---|---|---|
| Marketing Hjem | `Marketing Hjem (hybrid).dc.html` | `/(marketing)` (forside) |
| Marketing Cases | `Marketing Cases (hybrid).dc.html` | `/(marketing)/cases` (erstatter også `/suksess` redirect) |
| Marketing Coacher | `Marketing Coacher (hybrid).dc.html` | `/(marketing)/coacher`, `/(marketing)/coacher/[slug]` |
| Marketing Kontakt | `Marketing Kontakt (hybrid).dc.html` | `/(marketing)/kontakt` |

**Skills:** `design-porting-gate`, `ak-golf-hq-design`, `frontend-design`

---

### Bølge 7 — Komponent-galleri (RE-SKIN av eksisterende athletic/-komponenter)

**Mål:** Re-skinn alle eksisterende `src/components/athletic/`-komponenter til hybrid-settet med ny token-palett. Kildene er komponent-filene i handoffen. **NB: De 8 NYE komponentene (ViewSwitcher, KanbanBoard, DataTable Pro, EventTimeline, HeatmapCalendar, SkillRadarLive, LiveRepPulse, PercentileGauge) bygges i Fase 2b FØR Bølge 1 — ikke her.**

Bølge 7 re-skinner de EKSISTERENDE komponentene som allerede er i `src/components/athletic/`:

`AthleticCard`, `Avatar`, `Badge`, `BadgeShelf`, `ClubMetricGrid`, `DayCal`, `Delta`, `DetailHero`, `DispersionMap`, `EmptyState`, `Eyebrow`, `FeaturedCard`, `GhostNumber`, `GoalProgress`, `HoleStrip`, `HubCard`, `InboxList`, `InsightCard`, `JourneyMap`, `KpiCard`, `KpiRing`, `KpiStrip`, `LevelLadder`, `PlayerPipeline`, `PyramidProgress`, `RiskHeatmap`, `RoundScorecard`, `SettingsList`, `SgBar`, `SgBreakdown`, `ShareCard`, `Skeleton`, `Sparkline`, `StableMatrix`, `StatTile`, `StreakTracker`, `TestMatrix`, `TournamentCard`, `TrendBand`, `WeekGrid`, `WellnessCard`, `WizardShell`, `YearPlanGantt`

**Skills:** `akgolf-design-system`, `ak-golf-hq-design`, `frontend-design`

---

## 3 — Per-skjerm-prosessen (design-porting-gaten, 7 steg)

Hvert steg er obligatorisk for alle portbare skjermer. Halvferdig vises aldri. Én skjerm om gangen, på branch.

**Steg 1 — Hent kilden og lag element-liste**
- Åpne `.dc.html`-filen under `public/design-handover/prosjektgjennomgang-2026-06-17/`
- Les strukturen: topp til bunn, alle seksjoner, alle tall og tekster, rekkefølge
- Skriv ned element-listen (brukes i diffagenten i steg 4)

**Steg 2 — Bygg FRA kilden, ikke fra minne**
- Bruk komponenter fra `src/components/athletic/` + `src/components/ui/`
- Bruk tokens fra `src/app/globals.css` (aldri hardkoder hex)
- Bygg etter element-listen — ikke kopier eksisterende kode som utgangspunkt

**Steg 3 — Screenshot implementeringen**
```bash
node scripts/route-shot.mjs <rute> <bredde>
# PlayerHQ: 430px   AgencyOS: 1280px   Forelder: 430px   Marketing: 1440px
```
Krever `npm run dev` kjørende på `localhost:3000`.

**Steg 4 — Adversarial diff (kritiker-agent)**
Spawn en separat subagent med:
- A = kilde-PNG fra handoffen (`public/design-handover/.../screenshots/`)
- B = screenshot fra steg 3
- element-listen fra steg 1

Bruk prompt-malen fra `40-PORTING-RUNBOOK.md`. Agenten FINNER avvik — defaulter til at avvik finnes.
Godkjente unntak (fra `.claude/rules/design-porting-gate.md`): next/font ±1-2px breddeavvik, pill-knapp-idiom, delt shell-topbar, lime-disiplin.

**Steg 5 — Fiks til 0 avvik, loop**
Rett hvert avvik agenten finner. Re-screenshot. Kjør diff på nytt. Loop til BESTÅTT.

**Steg 6 — Koble ekte Prisma-data + fiks døde knapper**
- Erstatt alle mock-data med ekte Prisma-queries/server-actions
- Sjekk `docs/redesign-2026-06/50-SKJERM-KOMPONENT-KART.md` + `P0-status.md` mot flyt-inventaret
- Hver knapp MÅ ha en ekte destinasjon — ingen `href="#"` eller tomme onClick
- Aktiver booking: sett `BOOKING_ACTIVE=true` i Vercel (kobler til GCal-tilgjengelighet)
- GCal re-auth: coach MÅ re-autorisere i prod (utløpt token = tomme tider, ikke bug)

**Steg 7 — Oppdater MASTER-SKJERMPLAN + verifiser build**
- Finn skjermen i `docs/MASTER-SKJERMPLAN.md`
- Sett alle 6 haker som er grønne i DETTE committet (Design ✓, Mob/Desk/iPad ✓✓✓/✓✓–/osv., Adresse-ok ✓, Flyt ✓, Data ✓, Funker ✓)
- Kjør i samme commit:
```bash
npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build
```

---

## 4 — Design-gapet: TRENGER-DESIGN skjermer

Fra `61-DEKNINGSMATRISE.md` (5-status-taksonomi): **~172 TRENGER-DESIGN-ruter** (Design=– og ikke i handoff) sendes til Claude Design i prioritert rekkefølge. Dette er IKKE 282 — se seksjon 0 for korrekt fordeling. RE-SKIN (~41) og UTSATT (~16) er IKKE med her.

### Gap-prioritering (tilbake til Claude Design)

**Prioritet 1 — Kritiske underskjermer til ferdig-portede kjerneskjermer (trenger design før lansering)**

| Produkt | Ruter | Antall |
|---|---|---|
| PlayerHQ Analysere | SG-Hub undersider (11 sub-sider: kølle, benchmark, best-vs-now, utstyr, yardage, conditions, strategi, coach-visninger), Slag-for-slag, runde-detalj, metrikk-detalj | ~15 |
| PlayerHQ Gjennomføre | Økt-detalj, ny økt (handlingsvalg), ønsket økt + bekreftet, feiring, kalender | ~7 |
| PlayerHQ Booking | Ny booking bekreft, booking-detalj, bekreftet, coach-profil for booking | 5 |
| PlayerHQ Coach | Coach-profil, ny melding, vedlegg, coach-planer, øvelser, videoer, notater, spørsmål, AI | ~10 |
| PlayerHQ Drills | Drill-detalj `/portal/drills/[id]` | 1 |
| AgencyOS Stall | Spiller-profil, ny spiller, plan-detalj, tildel test, rediger | 6 |
| AgencyOS Planlegging | Plan-detalj, plan-mal detalj, drill-detalj, turnering-detalj, ny turnering | 5 |
| **Prioritet 1 sum** | | **~49 skjermer** |

**Prioritet 2 — PlayerHQ Meg underskjermer (post-lansering)**
Abonnement-flyt (oppgrader, avbestill, nytt kort), mine bookinger, helse-symptom, sikkerhet/2FA, innstillinger-underpunkter (8 stk), utstyrsbag-detalj, hjelp-artikler, feedback. (~23 skjermer)

**Prioritet 3 — AgencyOS sekundærskjermer (post-lansering)**
Organisasjon og innstillinger (23 ruter), Workspace, Gjennomføre/drift, Innsikt-sekundær. (~55 skjermer). Talent-seksjonen er UTSATT (Elite Fase 2) — aktiveres separat av Anders.

**Prioritet 4 — Marketing sekundærsider (post-lansering)**
`/om-oss`, `/coaching`, `/priser`, `/playerhq`, `/treningsfilosofi`, blogg, anlegg, booking-flyt, cookies, personvern, vilkår. (~21 skjermer)

**Prioritet 5 — Auth-gap (post-lansering)**
Reset-password (eksplisitt skjerm), onboarding forelder, guardian-consent, samtykke-venter. (~6 skjermer)

**Prioritet 6 — Stats-plattform (eget spor, separat prosjekt)**
Alle ~50 ruter under `/stats/*`. Ingen av disse designes i denne handoffen.

**Totalt TRENGER-DESIGN:** ~172 ruter (ekskl. redirects/legacy/RE-SKIN/UTSATT). Av disse er ~49 kritiske for lansering. Resten er post-lansering V2.

**Merk om `/portal/mal`-treet:** Dette er IKKE «alt ikke-designet». Riktig fordeling:
- **RE-SKIN** (Design=✓ i MASTER): `/portal/mal/sg-hub` (hub), `/portal/mal/runder`, `/portal/mal/runder/[id]`, `/portal/mal/runder/ny`, `/portal/mal/trackman`
- **TRENGER-DESIGN** (Design=– og ikke i handoff): sg-hub/undersider (9 ruter), runder/slag-for-slag, trackman/[id], mål-hub/bygger/detalj/milepæler/leaderboard, baner, statistikk-gml.
RE-SKIN-rutene i `/portal/mal/` skal ALDRI sendes til redesign — de re-skinnes via token-migrering.

### 8 manglende komponenter (bygges i Fase 2b FØR Bølge 1 — se seksjon 1b-2)

Fra `20-KOMPONENT-SPEC.md` — se Fase 2b (seksjon 1b-2) for full liste og blokkerings-matrise. Kort oppsummert:

1. `HeatmapCalendar`, `LiveRepPulse` — blokkerer Bølge 1 (PlayerHQ Hjem + Live-økt)
2. `ViewSwitcher`, `KanbanBoard`, `DataTable Pro`, `EventTimeline` — blokkerer Bølge 2 (AgencyOS Handlingssenter, Cockpit)
3. `PercentileGauge`, `SkillRadarLive` — **blokkerer ikke Bølge 1/2** (kun Talent, UTSATT — bygges når Elite Fase 2 aktiveres)

**Alle 8 bygges i Fase 2b FØR Bølge 1 starter** — ikke i Bølge 7 (komponent-galleri). Bølge 7 re-skinner eksisterende komponenter.

---

## 5 — Data + flyt

### 5a — Ekte Prisma-data per skjerm

Data-tilstanden per 17. juni er god (~124/126 modeller aktive). Redesign er primært et frontend-bytte. For hvert steg 6 i porting-prosessen gjelder:

- Les gjeldende server-action i `src/app/(route)/actions.ts` (eller nærmeste ekvivalent)
- Bruk samme Prisma-modell — ikke bygg ny dataflyt uten grunn
- FYS-testresultater: bruk plassholdertall til Anders låser formelen (besluttet 2026-06-04)
- A–K-kategorier: bruk nivå A–E inntil Anders oppgir de 11 snittscore-grensene

### 5b — Døde knapper (fra flyt-inventaret)

`docs/redesign-2026-06/P0-status.md` og `50-SKJERM-KOMPONENT-KART.md` inneholder flyt-inventaret. Per porting-steg 6:
- Sjekk hver knapp/lenke mot flyt-inventaret
- Ingen `href="#"`, ingen `onClick={() => {}}` uten faktisk handling
- Kuttede legacy-ruter (se slette-lista) MÅ ikke lenger lenkes til

### 5c — Booking-aktivering

`BOOKING_ACTIVE=false` i dag (Acuity midlertidig). Etter at Bølge 1 (PlayerHQ Booking) og Bølge 2 (AgencyOS Kalender) er portert og verifisert:
1. Sett `BOOKING_ACTIVE=true` i Vercel prod-miljø
2. Test GCal-tilgjengelighet: coachen MÅ re-autorisere (`/admin/settings/calendar`) — tomme tider = utløpt token, ikke bug (se `MEMORY/project_gcal_fail_closed.md`)

### 5d — Stripe-betaling

Stripe-integrasjon for 300 kr/mnd abonnement: klar for aktivering 1. juli 2026. Bølge 1 (PlayerHQ Meg / Abonnement) MÅ være portert og verifisert FØR aktivering.

---

## 6 — Skill-kart per fase

| Fase | Hva | Skills |
|---|---|---|
| **Fase 0** | Branch + design-kilde | `akgolf-branch-workflow` |
| **Fase 2a** | Token-migrering (`.dark`-blokk til terminal-palett) | `akgolf-design-system`, `ak-golf-hq-design` |
| **Fase 2b** | Bygg 8 manglende komponenter (BLOKKERER Bølge 1+2) | `akgolf-design-system`, `frontend-design`, `playerhq-arkitektur` |
| **Fase 2c** | Trygg sletting (audit-lista) | `gsd-cleanup` |
| **Fase 3 — Bølge 1** | PlayerHQ porting, 9 skjermer (430px) — Talent UTSATT | `design-porting-gate`, `vercel:nextjs`, `frontend-design` |
| **Fase 3 — Bølge 2** | AgencyOS porting, 9 skjermer (1280px) — Talent UTSATT | `design-porting-gate`, `vercel:nextjs`, `coachhq-arkitektur` |
| **Fase 3 — Bølge 3** | Workbench porting (delt kjerne) | `design-porting-gate`, `playerhq-arkitektur`, `coachhq-arkitektur` |
| **Fase 3 — Bølge 4** | Forelderportal (430px) | `design-porting-gate`, `frontend-design` |
| **Fase 3 — Bølge 5** | Auth + RE-SKIN av bankid/logget-ut | `design-porting-gate`, `vercel:auth`, `frontend-design` |
| **Fase 3 — Bølge 6** | Marketing (1440px) | `design-porting-gate`, `ak-golf-hq-design`, `frontend-design` |
| **Fase 3 — Bølge 7** | RE-SKIN komponent-galleri (eksisterende athletic/-komp med ny palett) | `akgolf-design-system`, `ak-golf-hq-design`, `frontend-design` |
| **Fase 4** | Data + døde knapper (flettet med Bølge 1–6) | `vercel:vercel-storage`, `vercel:nextjs` |
| **Fase 5** | QA på tvers | `code-review`, `simplify`, `accesslint`, `brand-enforcer`, `webapp-testing` |
| **Fase 6** | Lansering | `akgolf-branch-workflow`, `dev-deploy`, `vercel:deploy`, `lagre-sesjon` |

**Note:** `brand-enforcer` betyr at en agent kjøres med designsystem-reglene fra `.claude/rules/designsystem.md` for å verifisere lime-disiplin, Lucide-ikoner, 8pt-grid, ingen hardkodet hex.

---

## 7 — Milepæler til lansering + MASTER-SKJERMPLAN som ÉN sannhet

### Milepæl-oversikt

| # | Milepæl | Ferdig når | Anslått |
|---|---|---|---|
| M0 | Branch + design-kilde på plass | Sjekkliste 1a komplett | Dag 1 |
| M1a | Token-migrering (Fase 2a) | Build grønn, galleri-screenshot bestått, lime-lås verifisert | Dag 1–2 |
| M1b | 8 manglende komponenter bygget (Fase 2b) | Alle 8 eksisterer i athletic/, tsc grønt | Dag 2–3 |
| M1c | Trygg sletting fullført (Fase 2c) | _archive + dead code borte, build grønn | Dag 3 |
| M2 | Bølge 1 PlayerHQ kjerne portert | **9** skjermer 6/6 haker grønne (Talent UTSATT) | Dag 4–8 |
| M3 | Bølge 2 AgencyOS kjerne portert | **9** skjermer 6/6 haker grønne (Talent Coach UTSATT) | Dag 9–14 |
| M4 | Bølge 3 Workbench portert | 4 portbare skjermer 6/6 haker grønne | Dag 15–17 |
| M5 | Bølge 4+5+6 Forelder/Auth/Marketing portert | 12 skjermer 6/6 haker grønne | Dag 18–22 |
| M5b | Bølge 7 RE-SKIN komponent-galleri fullført | Alle athletic/-komp bruker ny token-palett | Dag 22–24 |
| M6 | Booking aktivert + GCal re-auth gjort | BOOKING_ACTIVE=true, test i prod | Dag 21 |
| M7 | QA-runde (code-review, accesslint, brand) | 0 åpne blokkere i alle tre agenter | Dag 25–27 |
| M8 | Full verifikasjon + legacy-sletting | `prisma validate && tsc && build && npm test` grønt | Dag 27 |
| M9 | Merge til main + `vercel deploy --prod` | Røyktest live: forside/portal/admin svarer | Dag 28 |
| M10 | Design-gap P1 til Claude Design (~49 kritiske skjermer av ~172 TRENGER-DESIGN) | Prompt-pakke sendt til Claude Design | Løpende post-lansering |

### MASTER-SKJERMPLAN som ÉN sannhet

`docs/MASTER-SKJERMPLAN.md` er kilden. Disse reglene gjelder for alle som rører en skjerm:

1. **Finn raden FØR du rører skjermen.** Jobb mot den. Ikke bygg noe som ikke har en rad.
2. **Oppdater hakene i SAMME commit** som du endrer kode. Aldri dekobler "ferdig i kode" fra "oppdatert i planen".
3. **Dashboard-tall oppdateres** etter hver bølge. Etter M2: oppdater totalt-tellingen i Status-seksjonen. Etter M3: oppdater AgencyOS-raden. Osv.
4. **Konsolider parallelle sett underveis.** Når du porter AgencyOS: bestem hvilken av `coachhq/` eller `admin/agencyos/` som vinner, migrer call-sites, slett taperen. Logg beslutningen i `docs/AAPNE-SPORSMAAL.md`.
5. **Ny skjerm = ny rad** i MASTER-SKJERMPLAN FØR du bygger. Ikke etter.
6. **Bevisste unntak** fra design-porting-gaten er allerede dokumentert i `.claude/rules/design-porting-gate.md`. Legg til nye unntak der (ikke i denne filen).

### Slik teller vi fremgang

Etter hver bølge:
- Oppdater status-boksen i `docs/MASTER-SKJERMPLAN.md` ("Status akkurat nå")
- Oppdater FULL/STUB/SHELL-tellingen
- Logg i `~/ak-brain/prosjekter/akgolf-hq.md` og kjør `/lagre-sesjon`

---

## Oppsummering

**~28 portbare NY-HYBRID-skjermer i 7 bølger** (9 PlayerHQ + 9 AgencyOS + 4 Workbench + 6 Forelder + 2 Auth + 4 Marketing + RE-SKIN galleri). Talent (PlayerHQ + AgencyOS) er UTSATT i Bølge 1+2.
**8 manglende komponenter** bygges i **Fase 2b BEFORE Bølge 1 starter** — ikke i Bølge 7.
**~41 RE-SKIN-ruter** (Design=✓ i MASTER, ikke i handoff) re-skinnes via token-migrering + komponent-galleri. Sendes ALDRI til Claude Design.
**~172 TRENGER-DESIGN** (ikke ~282) — av disse er ~49 kritiske for lansering, resten post-lansering V2.
Token-migrering (Fase 2a, `.dark`-blokken til terminal-paletten) er det eneste høyrisiko-steget — gjøres isolert FØR komponenter og porting.
`docs/MASTER-SKJERMPLAN.md` er ÉN sannhet — 6 haker per skjerm, oppdatert i SAMME commit, alltid.
