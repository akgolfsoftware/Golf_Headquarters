# Design-kø — AgencyOS

> **Kilde:** `docs/redesign-2026-06/61-DEKNINGSMATRISE.md` — kun TRENGER-DESIGN-ruter (Design=– i MASTER og ikke i 17.juni-handoffen).
> RE-SKIN- og UTSATT-skjermer er IKKE med her.
> **Totalt:** 12 batcher · 64 skjermer · P1: 7 batcher (35 skjermer) · V2: 5 batcher (29 skjermer)

---

## Sammendrag

| | Batcher | Skjermer |
|---|---|---|
| **P1 — lanseringskritisk (før 1. juli)** | 7 | 35 |
| **V2 — etter lansering** | 5 | 29 |
| **Total** | **12** | **64** |

---

## Batch-liste

| # | Tittel | Prioritet | Skjermer | Ruter | Komponenter |
|---|---|---|---|---|---|
| AG-1 | Handlingssenter — godkjenning og oppfølging | P1 | 4 | `/admin/godkjenninger/[id]`, `/admin/workspace`, `/admin/workspace/oppgaver/[id]`, `/admin/workspace/prosjekter` | ActionList, DataTable Pro, DetailHero, KanbanBoard, GoalProgress |
| AG-2 | Stall — ny spiller, profil og plandetalj | P1 | 4 | `/admin/spillere/ny`, `/admin/spillere/[id]/profil`, `/admin/spillere/[id]/plan/[planId]`, `/admin/spillere/[id]/rediger` | PhotoHero, DataTable Pro, GoalProgress, KanbanBoard, PeriodTimeline |
| AG-3 | Gjennomføre — daglig drift og øktdetalj | P1 | 5 | `/admin/gjennomfore`, `/admin/gjennomfore/okter/[id]`, `/admin/bookinger/ny`, `/admin/anlegg/[id]`, `/admin/kapasitet` | EventTimeline, ActionList, DetailHero, KpiStrip, SessionScheduler, HeatmapCalendar |
| AG-4 | Planlegge — sekundærsider og drill-/turnerings-bibliotek | P1 | 8 | `/admin/plan-templates/[id]`, `/admin/plan-templates/[id]/rediger`, `/admin/drills/[id]`, `/admin/drills/[id]/rediger`, `/admin/tournaments/[id]`, `/admin/tournaments/ny`, `/admin/tournaments/dubletter`, `/admin/teknisk-plan` | GalleryView, DataTable Pro, ChallengeCard, TrendBand, EventTimeline |
| AG-5 | Innsikt — analytics-dashboard, tester og runder | P1 | 4 | `/admin/analytics`, `/admin/tester/foreslatte`, `/admin/runder`, `/admin/tilstander` | KpiStrip, KpiRing, Sparkline, TrendBand, StatTile, GhostNumber, DataTable Pro, TestMatrix |
| AG-5b | Stall-sekundær — stall-hub, grupper, okter, videoer, recording, caddie-aktivitet | P1 | 6 | `/admin/stall`, `/admin/grupper/[id]`, `/admin/okter`, `/admin/videoer`, `/admin/recording`, `/admin/agencyos/caddie/aktivitet` | DataTable Pro, GalleryView, EventTimeline, KpiStrip, InsightCard Pro |
| AG-5c | Audit-logg detalj + godkjenningsdetalj (fiks AG-5 mismatch) | P1 | 2 | `/admin/audit-log/[id]`, `/admin/godkjenninger/[id]` | DetailHero, EventTimeline, ActionList, Button |
| AG-6 | Organisasjon og innstillinger-hub | V2 | 6 | `/admin/organisasjon`, `/admin/klubb/innstillinger`, `/admin/settings/api`, `/admin/settings/calendar`, `/admin/settings/security`, `/admin/settings/tilgang` | HubCard, SectionHeader, SettingsList, DataTable Pro |
| AG-7 | Team og tilgangsstyring | V2 | 4 | `/admin/team`, `/admin/team/inviter`, `/admin/integrasjoner`, `/admin/audit-log` | DataTable Pro, Avatar, GalleryView, EventTimeline, Button |
| AG-8 | AI-agenter og Workspace-tillegg | V2 | 6 | `/admin/agents`, `/admin/agents/[agentId]`, `/admin/workspace/notion`, `/admin/workspace/tildelt-meg`, `/admin/caddie`, `/admin/reach` | DataTable Pro, EventTimeline, InsightCard Pro, DetailHero, DispersionMap |
| AG-9 | Coach-profil, brief og hjelpesider | V2 | 5 | `/admin/profile`, `/admin/brief`, `/admin/hjelp`, `/admin/oppfolging`, `/admin/workspace` | PhotoHero, HubCard, EventTimeline, ActionList |
| AG-10 | Godkjenn-portal (QA-flate) | V2 | 8 | `/admin/godkjenn-portal`, `/admin/godkjenn-portal/koblinger`, `/admin/godkjenn-portal/koblinger/[id]`, `/admin/godkjenn-portal/review`, `/admin/email-templates`, `/admin/email-templates/[id]/rediger`, `/admin/stats/overview`, `/admin/stats/moderering` | DataTable Pro, GalleryView, ActionList, KpiStrip, ViewSwitcher |

---

## Claude Design-prompter

### AG-1 — Handlingssenter: godkjenning og oppfølging

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DEL AV: Handlingssenter (faner: Innboks / Meldinger / Kø / Forespørsler / Godkjenninger).
DENNE BATCHEN: godkjenning-detalj + workspace (oppgaver og prosjekter).

SKJERMER (4):

1. `/admin/godkjenninger/[id]` — Godkjenningsdetalj
   Viser: ett element til godkjenning (f.eks. «Øyvind Rohjan ber om å endre treningsplan»). Detaljer om hva som skal godkjennes (type, dato, innhold, spiller). Kommentarfelt. Handlinger: «Godkjenn» (lime CTA) / «Avvis» (destructive). Status-historikk.
   Primær-flyt (≤2 trykk): Les → klikk «Godkjenn».
   Komponenter: ActionList, DataTable Pro, DetailHero, Button.

2. `/admin/workspace` — Workspace-hub
   Viser: snarveier til tildelt-meg, oppgaver, prosjekter, Notion-sync. KPI-strip øverst (åpne oppgaver, forfalt, gjort i dag). Kanban-preview (3 kolonner: Ikke startet / Pågår / Ferdig).
   Primær-flyt (≤2 trykk): Åpne workspace → klikk en oppgave.
   Komponenter: HubCard, KpiStrip, KanbanBoard.

3. `/admin/workspace/oppgaver/[id]` — Oppgavedetalj
   Viser: tittel, beskrivelse, tilknyttet spiller (Øyvind Rohjan), frist, status, prioritet, kommentarer, vedlegg. Handlinger: Endre status, tildel, legg til kommentar.
   Primær-flyt (≤2 trykk): Se oppgave → endre status.
   Komponenter: DetailHero, ActionList, GoalProgress (fremdrift i prosjekt), Button.

4. `/admin/workspace/prosjekter` — Prosjektliste
   Viser: alle aktive prosjekter (navn, spiller, antall oppgaver, % ferdig, frist). ViewSwitcher (tabell/galleri).
   Primær-flyt (≤2 trykk): Se liste → åpne et prosjekt.
   Komponenter: DataTable Pro, GalleryView, ViewSwitcher, GoalProgress.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`. Ikke oppfinn nye mønstre.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer. Aldri store lime-flater, aldri lime tekst på lime.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen, spiller = Øyvind Rohjan (HCP 4,2, initialer ØR). Norsk bokmål. Tall i JetBrains Mono.
AgencyOS er alltid mørkt (.dark). Ingen tema-toggle.
```

---

### AG-2 — Stall: ny spiller, profil og plandetalj

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DEL AV: Stall (`/admin/spillere`-treet — liste og 360-panel er NY-HYBRID/allerede designet).
DENNE BATCHEN: ny spiller + profil + plandetalj + rediger.

SKJERMER (4):

1. `/admin/spillere/ny` — Registrer ny spiller
   Viser: fler-stegs skjema (navn/kontakt → HCP/kategori → coaching-pakke → inviter). Steg-indikator øverst. Felter: fullt navn, e-post, HCP, coaching-pakke (GRATIS / PRO), tilknyttet gruppe.
   Primær-flyt (≤2 trykk): Fyll steg 1 → klikk «Neste».
   Komponenter: GoalProgress (steg-indikator), Input (shadcn-primitiv), Button.

2. `/admin/spillere/[id]/profil` — Spiller-profil (coach-visning)
   Viser: profilbilde (ØR-initialer), kontaktinfo, HCP-historikk (TrendBand liten), A–K-kategori, coaching-pakke (GRATIS/PRO), tilknyttede grupper, nøkkeltall (antall økter, siste aktiv, gjennomsnittsscore). Redigerknapp.
   Primær-flyt (≤2 trykk): Se profil → klikk «Rediger profil».
   Komponenter: PhotoHero, KpiStrip, TrendBand (HCP-mini), Badge, Button.

3. `/admin/spillere/[id]/plan/[planId]` — Plandetalj for spiller
   Viser: planens navn, periode, mål, status (pågår/fullført/utkast). Perioder som kanban-kolonner. Nøkkelmilepæler som GoalProgress. Tilknyttede drills og tester.
   Primær-flyt (≤2 trykk): Se plan → klikk en periode for detalj.
   Komponenter: KanbanBoard, PeriodTimeline, GoalProgress, DataTable Pro.

4. `/admin/spillere/[id]/rediger` — Rediger spiller
   Viser: samme skjema som «ny spiller» men forhåndsutfylt. Mulighet for å endre coaching-pakke, HCP, grupper. Slett-spiller-knapp (destructive, bak bekreftelse).
   Primær-flyt (≤2 trykk): Endre ett felt → klikk «Lagre».
   Komponenter: Input (shadcn), Button, Badge.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen, spiller = Øyvind Rohjan (HCP 4,2, initialer ØR).
Abonnement: GRATIS eller PRO (300 kr/mnd). Aldri «ELITE».
Norsk bokmål. Tall i JetBrains Mono. AgencyOS alltid mørkt.
```

---

### AG-3 — Gjennomføre: daglig drift og øktdetalj

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DEL AV: Gjennomføre (daglig drift — kalender og live-økt er NY-HYBRID/allerede designet).
DENNE BATCHEN: gjennomføre-hub + øktdetalj + ny booking + anlegg-detalj + kapasitet.

SKJERMER (5):

1. `/admin/gjennomfore` — Gjennomføre-hub
   Viser: dagens program (liste over planlagte økter, klokkeslett, spiller, fasilitet). KPI-strip (antall økter i dag, ledig kapasitet, uleste forespørsler). Hurtiglenker: «Start økt», «Book ny», «Se kalender».
   Primær-flyt (≤2 trykk): Se hub → klikk «Start økt» ved en planlagt økt.
   Komponenter: EventTimeline, KpiStrip, ActionList, Button.

2. `/admin/gjennomfore/okter/[id]` — Øktdetalj (post-økt)
   Viser: øktens navn, spiller (Øyvind Rohjan), dato/tid, fasilitet, varighet, notater fra coach, tilknyttede drills og resultater. Mulighet for å legge til notat/score. «Marker fullført»-knapp (lime CTA).
   Primær-flyt (≤2 trykk): Se detalj → klikk «Marker fullført».
   Komponenter: DetailHero, ActionList, DataTable Pro (drills), Button.

3. `/admin/bookinger/ny` — Manuell booking
   Viser: fler-stegs skjema: velg spiller (søk) → velg fasilitet → velg tidspunkt (SessionScheduler) → bekreft. Coach booker på vegne av spiller.
   Primær-flyt (≤2 trykk): Velg spiller → velg tid (SessionScheduler viser ledig/opptatt).
   Komponenter: SessionScheduler, Input (shadcn), Button, GoalProgress (steg-indikator).

4. `/admin/anlegg/[id]` — Anlegg/fasilitet-detalj
   Viser: navn, adresse, type (innendørs/utendørs), kapasitet, åpningstider, tilknyttede tjenester, kommende bookinger (neste 7 dager). Rediger-knapp.
   Primær-flyt (≤2 trykk): Se anlegg → klikk «Se bookinger» for å gå til bookingkalender filtrert på dette anlegget.
   Komponenter: DetailHero, DataTable Pro, EventTimeline, Badge, Button.

5. `/admin/kapasitet` — Kapasitets-heatmap
   Viser: uke-/måneds-heatmap over kapasitetsutnyttelse per fasilitet (GitHub-stil, mørk → lime ved høy utnyttelse). KPI-strip (snitt-utnyttelse, topp-dag, ledige slots i dag).
   Primær-flyt (≤2 trykk): Se heatmap → klikk en celle for å åpne den dagen i kalenderen.
   Komponenter: HeatmapCalendar, KpiStrip, WeekGrid, Button.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer. Aldri store lime-flater.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen, spiller = Øyvind Rohjan (HCP 4,2). Norsk bokmål. Tall i JetBrains Mono.
AgencyOS alltid mørkt. Ingen tema-toggle.
```

---

### AG-4 — Planlegge: plan-mal detalj, drills og turneringer

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DEL AV: Planlegge (plan-liste, coach-workbench og plan-mal-oversikten er NY-HYBRID/allerede designet).
DENNE BATCHEN: plan-mal detalj/rediger + drill-detalj/rediger + turneringer + teknisk plan-hub.

SKJERMER (8):

1. `/admin/plan-templates/[id]` — Plan-mal detalj
   Viser: malens navn, beskrivelse, periode, brukt av X spillere, gjennomsnittlig fullføring (TrendBand), perioder/faser (liste), tilknyttede drills. Knapper: «Bruk på spiller», «Rediger mal».
   Primær-flyt (≤2 trykk): Se mal → klikk «Bruk på spiller» (velg fra liste).
   Komponenter: DetailHero, TrendBand, DataTable Pro, PeriodTimeline, Button.

2. `/admin/plan-templates/[id]/rediger` — Rediger plan-mal
   Viser: samme skjema som «ny mal» (wizard-steg) men forhåndsutfylt. Redigér navn/periode/faser/drills. Lagre-knapp (lime CTA).
   Primær-flyt (≤2 trykk): Endre et felt → klikk «Lagre».
   Komponenter: KanbanBoard (faser), Input, GoalProgress (steg-indikator), Button.

3. `/admin/drills/[id]` — Drill-detalj
   Viser: navn, kategori, beskrivelse, instruksjoner (steg-liste), måleparametere, medier (video-thumbnail). KPI: antall ganger brukt, snitt-mestringsscore (MasteryRing liten). Knapper: «Tildel til spiller», «Rediger».
   Primær-flyt (≤2 trykk): Se drill → klikk «Tildel til spiller».
   Komponenter: DetailHero, ChallengeCard, MasteryRing, ActionList, Button.

4. `/admin/drills/[id]/rediger` — Rediger drill
   Viser: redigeringsskjema (navn, kategori, instruksjoner, mål-parameter, media-URL). Lagre-knapp.
   Primær-flyt (≤2 trykk): Endre felt → klikk «Lagre».
   Komponenter: Input, Button.

5. `/admin/tournaments/[id]` — Turneringsdetalj
   Viser: turneringens navn, dato, bane, påmeldte spillere (liste med HCP og siste runde), resultat-status. Fellesmelding-knapp til deltakere (lime CTA). EventTimeline (turneringsuke).
   Primær-flyt (≤2 trykk): Se turnering → klikk «Send fellesmelding».
   Komponenter: DetailHero, DataTable Pro (spillerliste), EventTimeline, Button.

6. `/admin/tournaments/ny` — Registrer turnering
   Viser: skjema: navn, dato, bane (søk), format, inviter spillere (multi-select). Lagre-knapp.
   Primær-flyt (≤2 trykk): Fyll navn/dato → klikk «Lagre».
   Komponenter: Input, Button.

7. `/admin/tournaments/dubletter` — Duplikat-rydding
   Viser: liste over mulige duplikater (par: turnering A ↔ turnering B, likhet-%, årsak). Handlinger per par: «Slå sammen», «Behold begge», «Slett A/B». Batch-handling.
   Primær-flyt (≤2 trykk): Se duplikat-par → klikk «Slå sammen».
   Komponenter: DataTable Pro, ActionList, Button, Badge.

8. `/admin/teknisk-plan` — Teknisk plan-hub (oversikt)
   Viser: oversikt over alle spilleres tekniske planer (spiller, antall aktive øvelser, sist oppdatert, status). ViewSwitcher (tabell/galleri). Knapp: «Ny teknisk plan for spiller».
   Primær-flyt (≤2 trykk): Se liste → klikk en spiller for å åpne teknisk plan.
   Komponenter: DataTable Pro, GalleryView, ViewSwitcher, Button.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen, spiller = Øyvind Rohjan (HCP 4,2). Norsk bokmål. Tall i JetBrains Mono.
AgencyOS alltid mørkt.
```

---

### AG-5 — Innsikt: analytics-dashboard, tester og runder

> **MISMATCH FIKSET (2026-06-17):** Tabellen over opprinnelig listet `/admin/godkjenninger/[id]` som rute 5 i AG-5 — dette er feil. `/admin/godkjenninger/[id]` er allerede dekket i AG-1 (Handlingssenter). AG-5 har nå 4 skjermer (ikke 5). `/admin/godkjenninger/[id]` + `/admin/audit-log/[id]` er samlet i AG-5c.

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DEL AV: Innsikt og analyse (Risiko/analyse/Tester-oversikten er NY-HYBRID/allerede designet).
DENNE BATCHEN: bento-analytics + tester-foreslatte + runder + tilstander.

SKJERMER (4):

1. `/admin/analytics` — Analytics bento-dashboard
   Viser: bento-rutenett av KPI-tiles og grafer: aktive spillere (KpiRing), øktaktivitet siste 30 dager (TrendBand), inntekt (TrendBand), snitt-HCP i stall (Sparkline), topp 3 aktive spillere (StatTile), bookinger denne uken (GhostNumber stor). Filterperiode (siste 7/30/90 dager).
   Primær-flyt (≤2 trykk): Se dashboard → klikk et bento-tile for å bore inn.
   Komponenter: KpiStrip, KpiRing, Sparkline, TrendBand, StatTile, GhostNumber.

2. `/admin/tester/foreslatte` — Foreslåtte tester
   Viser: AI-genererte testforslag per spiller (spiller, foreslått test, begrunnelse som InsightCard, anbefalt dato). Handlinger: «Tildel», «Avvis», «Utsett». Sortert etter hastegrad.
   Primær-flyt (≤2 trykk): Se forslag → klikk «Tildel» (velg dato).
   Komponenter: DataTable Pro, InsightCard Pro, ActionList, Badge, Button.

3. `/admin/runder` — Rundeliste (stall-oversikt)
   Viser: alle registrerte runder på tvers av stall (spiller, dato, bane, brutto, netto, SG-total). Filtrer per spiller/periode/bane. ViewSwitcher (tabell/tidslinje). Klikk → RoundScorecard detalj.
   Primær-flyt (≤2 trykk): Se liste → klikk en runde for scorecard.
   Komponenter: DataTable Pro, ViewSwitcher, RoundScorecard (detalj), SgBreakdown (detalj).

4. `/admin/tilstander` — Spillertilstander (form-monitor)
   Viser: stall-oversikt som RiskHeatmap (grønn/gul/rød per spiller basert på aktivitet og prestasjon siste 14 dager). Klikk celle → spiller-detalj. KPI: aktive/risiko/inaktive. Liste med siste hendelse per spiller.
   Primær-flyt (≤2 trykk): Se heatmap → klikk en spiller i rødt.
   Komponenter: RiskHeatmap, StableMatrix, KpiStrip, DataTable Pro, Badge.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen, spiller = Øyvind Rohjan (HCP 4,2). Norsk bokmål. Tall i JetBrains Mono.
AgencyOS alltid mørkt. Ingen tema-toggle.
```

---

### AG-5b — Stall-sekundær: stall-hub, grupper, okter, videoer, recording, caddie-aktivitet (P1)

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DEL AV: Stall + Planlegge + Innsikt (sekundærflater som mangler i eksisterende batcher).
DENNE BATCHEN: stall-hub + gruppe-detalj + okter-oversikt + videoer + recording + caddie-aktivitet.

SKJERMER (6):

1. `/admin/stall` — Stall-hub (overordnet oversikt for hele treningsgruppen)
   Viser: aggregert KPI-strip øverst (antall aktive spillere, pågående planer, siste 7 dager aktivitet), PlayerPipeline (alle spillere som board/kanban per status: Aktiv / Oppfølging nødvendig / Inaktiv), hurtiglenker til enkeltspiller og gruppe. ViewSwitcher (board/tabell/liste).
   Primær-flyt (≤2 trykk): Se stall → klikk en spiller for 360-panel.
   Komponenter: PlayerPipeline, KpiStrip, RiskHeatmap, ViewSwitcher, DataTable Pro.

2. `/admin/grupper/[id]` — Gruppe-detalj
   Viser: gruppenavn, spillerliste (DataTable Pro: navn, HCP, siste økt, status), aggregerte gruppe-KPI (snittscore, snitt-HCP, antall aktive), «Send fellesmelding»-knapp (lime CTA), «Legg til spiller»-knapp, EventTimeline (siste aktivitet i gruppen).
   Primær-flyt (≤2 trykk): Se gruppe → klikk spiller for profil.
   Komponenter: DataTable Pro, KpiStrip, EventTimeline, Button, Avatar.

3. `/admin/okter` — Økt-oversikt (alle planlagte og gjennomførte økter)
   Viser: DataTable Pro (spiller, økt-type, dato, status: planlagt/gjennomført/avlyst/avventer), filter per spiller/periode/status, «Ny økt»-knapp. ViewSwitcher (tabell/tidslinje).
   Primær-flyt (≤2 trykk): Se liste → klikk økt for detalj.
   Komponenter: DataTable Pro, ViewSwitcher, EventTimeline, Badge (status), Button.

4. `/admin/videoer` — Video-bibliotek (coach)
   Viser: GalleryView (video-kort med thumbnail, tittel, dato, tildelt spiller(e)), filter-chips (kategori: Sving / Putting / Mental / Strategi), søkefelt, «Last opp video»-knapp (lime CTA).
   Primær-flyt (≤2 trykk): Se liste → klikk video for preview/detalj.
   Tilstander: med videoer, tom («Last opp din første coaching-video»).
   Komponenter: GalleryView, DataTable Pro, ViewSwitcher, Badge, Button.

5. `/admin/recording` — Opptak og analyse (TrackMan/video-kobling)
   Viser: liste over innspilte coaching-sesjoner (spiller, dato, type, tilknyttet økt), knapp «Legg til opptak» (kobler video/TrackMan-data til økt), status per opptak (behandles/klar/feil). InsightCard Pro (AI-analyse av siste opptak, hvis tilgjengelig).
   Primær-flyt (≤2 trykk): Se opptaksliste → klikk «Legg til opptak» for en spiller.
   Komponenter: DataTable Pro, InsightCard Pro, Badge (status), Button.

6. `/admin/agencyos/caddie/aktivitet` — Caddie-aktivitetslogg
   Viser: hva AI-Caddie har gjort de siste 24 timene (EventTimeline med hendelser: «Analyserte 3 runder for Øyvind Rohjan», «Sendte ukerapport til 5 spillere», «Foreslo 2 tester»). KpiStrip (handlinger gjort / spillere berørt / ventende handlinger). Filtrer per spiller eller handlingstype.
   Primær-flyt (≤2 trykk): Se aktivitetsfeed → klikk en hendelse for detalj.
   Komponenter: EventTimeline, KpiStrip, InsightCard Pro, DataTable Pro, Badge.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer. Aldri store lime-flater.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen, spiller = Øyvind Rohjan (HCP 4,2, initialer ØR).
Norsk bokmål. Tall i JetBrains Mono. AgencyOS alltid mørkt.

SPØRSMÅL:
- Stall-hub vs spillerliste (/admin/spillere): er dette to forskjellige innganger til samme data, eller har stall-hub en bredere aggregert visning (grupper + enkeltspillere)?
- Videoer: er det støtte for å streame videoer direkte i appen, eller kun lenker til ekstern plattform (Vimeo/YouTube)?
- Recording: er dette live-opptak i appen, eller import av eksisterende opptaksfiler?
```

---

### AG-5c — Audit-logg detalj + godkjenningsdetalj (P1 — fiks mismatch)

> **Mismatch-notat:** `/admin/godkjenninger/[id]` var feilaktig listet i AG-5 (batch 5 i tabellen). Den er designet i AG-1-prompten. Denne batchen fanger opp to gjenværende skjermer som ingen eksisterende batch dekker.

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DENNE BATCHEN: audit-logg detalj + godkjennings-detalj (fiks av oversett mismatch mellom batch-tabell og prompts).

SKJERMER (2):

1. `/admin/audit-log/[id]` — Audit-logg hendelse-detalj
   Viser: én enkelt audit-hendelse: hvem (bruker/agent), hva (handlingstype), når (tidsstempel), fra hvilken IP/enhet, payload/datautdrag (JSON-akt, lesbart format). «Tilbake til logg»-lenke. Ingen redigering.
   Primær-flyt (≤2 trykk): Åpnet fra /admin/audit-log → les detalj.
   Komponenter: DetailHero (hendelse + metadata), EventTimeline (kontekst: hva skjedde rett før/etter), DataTable Pro (payload-felter), Badge (handlingstype), Button.

2. `/admin/godkjenninger/[id]` — Godkjenningsdetalj (sett opp som SUPPLEMENT til AG-1)
   NB: AG-1 designer godkjenning-detalj som ett av 4 skjermer. Denne batchen bekrefter at skjermen er fullstendig — spesielt detaljer rundt multi-steg godkjenning (f.eks. «Øyvind ber om planendring som krever coach-signoff og systemgodkjenning»).
   Viser (utover AG-1): historikk-tidslinje (alle godkjenningssteg utført), tilknyttede vedlegg (dokumenter / screenshots), «Delegér»-knapp (videresend til annen coach).
   Primær-flyt (≤2 trykk): Se historikk → klikk «Godkjenn».
   Komponenter: EventTimeline (historikk), ActionList, DetailHero, Button, Badge.

REGLER:
1. Bygg oppå komponentene i kit-et. Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper.
4. Alle tilstander.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen, spiller = Øyvind Rohjan. Norsk bokmål. Tall i JetBrains Mono.
AgencyOS alltid mørkt.

SPØRSMÅL:
- Audit-logg detalj: er JSON-payload alltid synlig, eller maskeres sensitiv data (tokens, passord-hashes)?
- Godkjenning multi-steg: er dette en faktisk fremtidig funksjon, eller er alle godkjenninger enkelt-steg i dag?
```

---

### AG-6 — Organisasjon og innstillinger-hub (V2)

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DISSE SKJERMENE ER V2 — etter lansering, men bør se konsistente ut med resten av AgencyOS.

SKJERMER (6):

1. `/admin/organisasjon` — Admin-hub (8 kort)
   Viser: navigasjon til alle admin-seksjoner (Team, Integrasjoner, Innstillinger, E-postmaler, Audit-logg, Fakturaer, API, Sikkerhet). 8 HubCard-tiles med ikon, navn og kort beskrivelse.
   Primær-flyt (≤2 trykk): Se hub → klikk ett kort.
   Komponenter: HubCard, SectionHeader.

2. `/admin/klubb/innstillinger` — Multi-klubb-innstillinger
   Viser: aktiv klubb/akademi (AK Golf Academy), logotype-opplasting, kontaktinfo, tilkoblede integrasjoner (GolfBox/Google Calendar), tidssone, valuta. SettingsList-rader med toggle/input per innstilling.
   Primær-flyt (≤2 trykk): Se innstilling → toggle eller klikk «Rediger».
   Komponenter: SettingsList, DataTable Pro (tilknyttede brukere), Button.

3. `/admin/settings/api` — API-innstillinger
   Viser: API-nøkler (maskert), lag ny nøkkel-knapp, tillatelser per nøkkel, siste brukt. Slett-nøkkel (destructive bak bekreftelse).
   Primær-flyt (≤2 trykk): Se nøkler → klikk «Lag ny API-nøkkel».
   Komponenter: DataTable Pro, Button, Badge (tillatelsesmerke).

4. `/admin/settings/calendar` — Kalender-innstillinger
   Viser: tilkoblet Google Calendar-konto (status: tilkoblet/feil), synk-innstillinger (hva som synkes, retning). Re-koble-knapp. Siste synk-tidspunkt.
   Primær-flyt (≤2 trykk): Se status → klikk «Re-koble Google Calendar».
   Komponenter: SettingsList, Badge (status), Button.

5. `/admin/settings/security` — Sikkerhets-innstillinger
   Viser: 2FA-status (på/av), aktive sesjoner (liste med IP/enhet/sist aktiv), passordbytteknapp. Logg ut alle sesjoner (destructive).
   Primær-flyt (≤2 trykk): Se innstillinger → klikk «Slå på 2FA».
   Komponenter: SettingsList, DataTable Pro (sesjoner), Button.

6. `/admin/settings/tilgang` — Tilgangsstyring
   Viser: roller og tilganger (coach, assistent, admin). Liste over team-medlemmer med rolle. Endre rolle per bruker (inline dropdown). Inviter ny bruker-knapp.
   Primær-flyt (≤2 trykk): Se liste → klikk rolle-dropdown og velg ny rolle.
   Komponenter: DataTable Pro, ViewSwitcher, Button, Badge (rolle).

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen. Norsk bokmål. Tall i JetBrains Mono.
AgencyOS alltid mørkt. Ingen tema-toggle.
```

---

### AG-7 — Team og tilgangsstyring (V2)

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DISSE SKJERMENE ER V2 — etter lansering.

SKJERMER (4):

1. `/admin/team` — Coach-team (oversikt)
   Viser: alle coacher/assistenter i akademiet (navn, rolle, status aktiv/inaktiv, antall aktive spillere, siste innlogging). Knapper: «Inviter ny» (lime CTA). Avatar per person.
   Primær-flyt (≤2 trykk): Se team → klikk «Inviter ny».
   Komponenter: DataTable Pro, Avatar, Button, Badge (rolle).

2. `/admin/team/inviter` — Inviter team-medlem
   Viser: e-postfelt + velg rolle (coach/assistent/admin). Send invitasjon-knapp (lime CTA). Status: «Venter på svar» for sent ut.
   Primær-flyt (≤2 trykk): Fyll e-post → klikk «Send invitasjon».
   Komponenter: Input, Button, Badge.

3. `/admin/integrasjoner` — Integrasjons-oversikt
   Viser: alle tilgjengelige integrasjoner som kort (Google Calendar, GolfBox, TrackMan, Stripe, Zapier). Status per integrasjon (tilkoblet/ikke tilkoblet). Klikk for å konfigurere.
   Primær-flyt (≤2 trykk): Se liste → klikk en integrasjon for å konfigurere.
   Komponenter: GalleryView, AthleticCard, Badge (status), Button.

4. `/admin/audit-log` — Audit-logg
   Viser: kronologisk liste over hendelser i systemet (hvem, hva, når, IP). Filtrer per bruker/handlingstype/periode. Klikk rad → detalj (modal eller ekspanderbar rad).
   Primær-flyt (≤2 trykk): Se logg → klikk en rad for detalj.
   Komponenter: DataTable Pro, EventTimeline, Badge.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Norsk bokmål. Tall i JetBrains Mono. AgencyOS alltid mørkt.
```

---

### AG-8 — AI-agenter og Workspace-tillegg (V2)

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DISSE SKJERMENE ER V2 — etter lansering.

SKJERMER (6):

1. `/admin/agents` — AI-agent-oversikt
   Viser: liste over aktive AI-agenter (navn, type, status pågår/ferdig/feil, siste kjøring, antall handlinger). EventTimeline for siste 24t aktivitet. Lime-puls på pågående agenter.
   Primær-flyt (≤2 trykk): Se liste → klikk en agent for detalj.
   Komponenter: DataTable Pro, EventTimeline, InsightCard Pro, PulseDot, Badge.

2. `/admin/agents/[agentId]` — Agent-detalj
   Viser: agentens navn, beskrivelse, konfigurasjon, siste 10 kjøringer (EventTimeline), resultater/output. Aktivér/deaktivér toggle.
   Primær-flyt (≤2 trykk): Se agent → klikk toggle for å aktivere.
   Komponenter: DetailHero, EventTimeline, InsightCard Pro, Button.

3. `/admin/workspace/notion` — Notion-synk
   Viser: tilkoblet Notion-workspace (status), siste synk, hvilke sider/databaser som synkes (tabell med status per side), «Tving synk»-knapp.
   Primær-flyt (≤2 trykk): Se status → klikk «Tving synk».
   Komponenter: DataTable Pro, Badge (status), Button.

4. `/admin/workspace/tildelt-meg` — Tildelt meg (coach-filter)
   Viser: oppgaver og forespørsler direkte tildelt innlogget coach (Anders Kristiansen). Sorter etter frist/prioritet. KpiStrip (forfalt, i dag, denne uken).
   Primær-flyt (≤2 trykk): Se liste → klikk en oppgave for detalj.
   Komponenter: DataTable Pro, KpiStrip, Badge, ActionList.

5. `/admin/caddie` — AI-Caddie co-agent
   Viser: AI-coachens aktivitets-feed (hva Caddie har gjort siste 24t: analyserte X runder, sendte Y varsler, oppdaterte Z planer). EventTimeline. InsightCard Pro med nøkkelfunn. Konfigurasjons-innstillinger (hvilke spillere Caddie overvåker).
   Primær-flyt (≤2 trykk): Se feed → klikk et funn for å lese InsightCard.
   Komponenter: EventTimeline, InsightCard Pro, ActionList, Button.

6. `/admin/reach` — Rekkevidde-analyse (coach)
   Viser: dispersjonskart / rekkevidde per spiller i stall (SG-basert). Aggregert stall-analyse: hvilke kategori-flater det coaches mest/minst på.
   Primær-flyt (≤2 trykk): Se kart → klikk en spiller for å gå til spillerprofil.
   Komponenter: DispersionMap, KpiStrip, DataTable Pro.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen. Norsk bokmål. Tall i JetBrains Mono. AgencyOS alltid mørkt.
```

---

### AG-9 — Coach-profil, brief og hjelpesider (V2)

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DISSE SKJERMENE ER V2 — etter lansering.

SKJERMER (5):

1. `/admin/profile` — Coach-profil (Anders Kristiansen)
   Viser: profilbilde (AK-initialer), navn, tittel («Head Coach · AK Golf Academy»), e-post, telefon, bio, sertifiseringer. Rediger-knapp. Offentlig profil-preview-lenke.
   Primær-flyt (≤2 trykk): Se profil → klikk «Rediger profil».
   Komponenter: PhotoHero, Button, Badge.

2. `/admin/brief` — Daglig brief (AI-generert)
   Viser: dagens AI-genererte sammendrag for coach: hvem trenger oppfølging, viktige hendelser i dag, sendte og ventende meldinger, en anbefalt handling (InsightCard Pro). EventTimeline for dagen.
   Primær-flyt (≤2 trykk): Se brief → klikk en anbefalt handling.
   Komponenter: EventTimeline, InsightCard Pro, ActionList, KpiStrip.

3. `/admin/hjelp` — Hjelpesenter (coach)
   Viser: søkefelt, kategorier (komme i gang, spilleradministrasjon, booking, økonomi, integrasjoner). Populære artikler som kortliste.
   Primær-flyt (≤2 trykk): Søk → klikk en artikkel.
   Komponenter: HubCard, Button, Input.

4. `/admin/oppfolging` — Oppfølgingskø
   Viser: spillere som trenger oppfølging (kanban: «Kontakt nå» / «Denne uken» / «Kommende»). Klikk spiller → åpne chat/melding. RiskHeatmap som supplement.
   Primær-flyt (≤2 trykk): Se kø → klikk spiller i «Kontakt nå»-kolonnen.
   Komponenter: KanbanBoard, RiskHeatmap, ActionList, Button.

5. `/admin/workspace` — Workspace (hub-detalj, allerede delvis i AG-1)
   Viser: forenklet hub med rask tilgang til Notion-sync-status, antall åpne oppgaver, og snarveier til tildelt-meg og prosjekter. (Denne skjermen kan delvis overlappe med AG-1 batch 2 — stil spørsmål om scope før du designer.)
   Primær-flyt (≤2 trykk): Se hub → klikk «Se alle oppgaver».
   Komponenter: HubCard, KpiStrip, Button.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Demo-navn: coach = Anders Kristiansen. Norsk bokmål. Tall i JetBrains Mono. AgencyOS alltid mørkt.
```

---

### AG-10 — Godkjenn-portal, e-postmaler og stats-admin (V2)

```
Du designer for AgencyOS — AK Golf-coachens mørke desktop-kontrollrom (terminal-cockpit, nær-svart forest-bakgrunn, lime #D1F843 som eneste signal, hairline-rutenett knapt synlig, mono-tall).

DISSE SKJERMENE ER V2 — etter lansering. Godkjenn-portal er intern QA-flate, ikke coach-produktflate.

SKJERMER (7):

1. `/admin/godkjenn-portal` — QA/godkjenningsportal (intern)
   Viser: oversikt over alle skjermer/komponenter som er sendt til intern godkjenning. KPI: ventende / godkjent / avvist. Liste over items.
   Primær-flyt (≤2 trykk): Se liste → klikk en item for review.
   Komponenter: DataTable Pro, KpiStrip, ActionList, Badge.

2. `/admin/godkjenn-portal/koblinger` — Portalkoblinger (liste)
   Viser: alle registrerte portalkoblinger (rute, tittel, status, sist oppdatert). Klikk for detalj.
   Komponenter: DataTable Pro, Badge, Button.

3. `/admin/godkjenn-portal/koblinger/[id]` — Kobling-detalj
   Viser: rutens metadata, screenshot (hvis tilgjengelig), godkjennings-historikk. Handlinger: «Godkjenn», «Avvis», «Legg til kommentar».
   Komponenter: DetailHero, ActionList, Button.

4. `/admin/godkjenn-portal/review` — Review-flate
   Viser: side-ved-side-sammenligning (design-spec vs implementert). Handlinger: «Bestått», «Feil funnet», kommentarfelt per avvik.
   Komponenter: DataTable Pro, ActionList, Button.

5. `/admin/email-templates` — E-postmal-liste
   Viser: alle e-postmaler (booking-bekreftelse, planforslag, ukerapport, invitasjon osv.). GalleryView eller DataTable. Klikk → redigeringsvisning.
   Primær-flyt (≤2 trykk): Se liste → klikk en mal for å redigere.
   Komponenter: GalleryView, DataTable Pro, ViewSwitcher, Badge (status: aktiv/utkast).

6. `/admin/email-templates/[id]/rediger` — Rediger e-postmal
   Viser: mal-navn, emne-linje, HTML-preview, variabler ({{spiller_navn}} osv.), lagre-knapp.
   Primær-flyt (≤2 trykk): Endre emne → klikk «Lagre».
   Komponenter: Input, Button, Badge.

7. `/admin/stats/overview` og `/admin/stats/moderering` — Stats-administrasjon
   Viser (overview): KPI for offentlig stats-plattform (sidevisninger, aktive brukere, topp-søk). TrendBand over tid.
   Viser (moderering): innsendte score/resultater som venter på moderering. DataTable med godkjenn/avvis per rad.
   Primær-flyt (≤2 trykk): Se oversikt → klikk «Til moderering».
   Komponenter: KpiStrip, TrendBand, DataTable Pro, ViewSwitcher, ActionList.

REGLER:
1. Bygg oppå komponentene i kit-et (`design-system/components/`). Bruk tokens fra `tokens.css`.
2. Lime #D1F843 er låst — kun for aktiv tilstand, CTA, positive deltaer.
3. Ingen døde knapper — hver knapp har destinasjon. Alle kjernehandlinger ≤ 2 trykk.
4. Alle tilstander per dataflate: innhold · tomt (EmptyState) · laster (Skeleton) · feil.
5. Still spørsmål ved tolkningstvil FØR du designer.

Norsk bokmål. Tall i JetBrains Mono. AgencyOS alltid mørkt.
```
