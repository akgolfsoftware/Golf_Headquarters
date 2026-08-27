# Workbench og kalendere — analyse og forslag til optimal løsning

**Laget:** 18.08.2026. **Status:** FORSLAG — analyse av alt som finnes i dag (fasiter + kode,
verifisert i repoet samme dag), etterfulgt av et konkret målbilde. Ingenting er vedtatt.
Søsterdokumentene (`parameterbok-planlegging-2026-08-18.md`, `forslag-parameterbok-fasit-
2026-08-18.md`) er slettet i opprydding 27.08.2026 — historisk detalj erstattet av
`docs/vokabular-planlegging-2026-08-18.md` og `docs/FASIT-AK-GOLF-HQ.md`.

---

# Del 1 — Analyse: hva finnes i dag

## 1.1 De seks Workbench-fasitene (designsystem/paper/)

Fasitene er gjennomtenkte og deler én motor — dette er den sterkeste delen av dagens tilstand:

| Fasit | Jobb | Soner/idé |
|---|---|---|
| workbench-desktop | Spillerens ukeplanlegging | Fullskjerm («åpnes fra tråden, eier vinduet»): KPI-stripe · bibliotek 232px · tidsrutenett 05–23 (36 luker à 30 min) · inspektør 340px. Composer lager ghost-blokker fra naturlig språk («3 putteøkter à 45 min før søndag»). «Søndagsforslaget» kl. 18: neste ukes utkast fra periode+mal+etterlevelse — legges aldri inn selv. |
| workbench-mobil | Samme jobb, telefon | Egne komponenter, ikke krympet desktop: dagpiller, én-dags vertikal akse, ark (sheets) for all redigering, 48px treffmål. Har Testbatteriet-arket. AK-formelens 5 slots dokumentert her. |
| workbench-stall | Coachens planlegging | Samme motor + fire moduser: stall (én dag, personer som kolonner) · min · gruppe · spiller (dager som kolonner). «Kolonnene er personer eller dager — det er hele forskjellen, motoren under er den samme.» |
| workbench-stall-mobil | Coach på telefon | Stallrad: én spiller/én dag som tidsstripe — «ikke en kalender du redigerer i, en tetthetsvisning som svarer 'når er hun ledig?' på et blikk». |
| workbench-turnering | Turneringsplanlegging | Ikke rutenett — kort: «Én ting nå» (nærmeste turnering med noe uavklart) · tidslinje oppå periodiseringen (rødt ved kollisjon) · påmeldinger · «Det som mangler». |
| AgencyosWorkbench (template) | Komponent-demo | Tre soner via state: Editor / Innboks (godkjenninger) / Caddie (utkast). Bruker 21 Paper-komponenter. |

I tillegg har designsystemet **ett samlet kalenderkomponentsett** —
`designsystem/paper/components/calendar/` med 11 komponenter (TimeGrid, UkeKalender,
MaanedKalender, DayStrip, AgendaRow, Tidslinje, Periodeplan, YearTimeline, VisningsVelger,
BudgetBar, SessionCard) designet for gjenbruk på tvers.

## 1.2 Produksjonskoden — fragmenteringen

**Minst 12 separate kalender/tidslinje-implementasjoner** lever side om side i `src/`:

| # | Flate | Fil | Oppløsning |
|---|---|---|---|
| 1 | Spiller-kalender | `portal/v2/KalenderV2.tsx` (472 linjer) | Dag/uke/måned/år |
| 2 | Spiller-workbench | `portal/v2/WorkbenchV2.tsx` (3 325 linjer) | Uke |
| 3 | Spiller-årsplan | `WorkbenchAarsplan.tsx` (597 linjer) | År |
| 4 | Coach-workbench | `admin/coach-workbench/` (866 linjer) | Uke — **07–21-raster** |
| 5 | Admin ukekalender | `admin/kalender/week-calendar.tsx` | Uke |
| 6 | Admin månedskalender | `AdminKalenderManedV2.tsx` | Måned |
| 7 | Agency-kalender | `AgencyKalenderV2.tsx` | Uke (bookinger+serier) |
| 8 | Availability-grid | `AdminAvailabilityWeekGridV2.tsx` | Uke |
| 9 | Booking | `BookingV2.tsx` + `AdminBookingerV2.tsx` | Dag/uke |
| 10 | Delt kalendersett | `shared/calendar/` (Day/Week/Month/Aarsplan + Shell) | Alle |
| 11 | Gruppe-kalender | `gruppe-kalender/` (4 filer) | Gruppe |
| 12 | WANG-årsplan | `team-wang/coach/coach-arsplan.tsx` + `year-plan-gantt.tsx` | År (Gantt) |

**Tre ulike tidsrastere i drift:** 05–23 (fasit/WorkbenchV2) · 07–21 (coach-workbench) ·
egne varianter i booking/availability.

## 1.3 De alvorligste avvikene fasit ↔ kode

1. **Coach-workbenchen bygger på en avviklet fasit.** `coach-workbench.tsx` sitt eget filhode
   sier at den porter en fasit som ble fjernet 03.07.2026. Den mangler ALT av dagens
   coach-fasit: ingen Innboks, ingen Caddie, ingen PlanAction-diff, ingen ghost-blokker,
   ingen stall-moduser (0 treff på samtlige). Feil raster (07–21).
2. **Turnering er ikke integrert** i WorkbenchV2, tross vedtak 04.08 — og porteringsplanen
   markerer den feilaktig som «Portet #329 + #342».
3. **Testbatteriet-arket mangler** i spiller-WorkbenchV2 (fasiten har det; portplan PR-E åpen).
4. **Årsplanen er ikke koblet til reglene:** `WorkbenchAarsplan.tsx` har null referanser til
   `periode-constraints.ts` — årsplanen kan altså tegnes i strid med periodereglene uten varsel.
5. **Legacy-ruter** (`/admin/kalender/uke`, `/admin/stall`) er fortsatt eneste leverandør av
   URLer som levende navigasjon peker på — gamle flater kan ikke slettes uten ruteflytting.

## 1.4 Kjernediagnosen

Designsystemet har allerede løst dette riktig: **én motor, elleve komponenter, moduser i
stedet for kopier.** Produksjonen har i stedet vokst tolv uavhengige implementasjoner fordi
hver flate ble portet/bygget hver for seg. Problemet er ikke design — det er at koden aldri
har konsolidert mot designets arkitektur.

---

# Del 2 — Forslag: optimal målarkitektur

## 2.1 Prinsippet: én motor, fire lag

```
LAG 4  Flater      Spiller-WB · Coach-WB · Kalender · Booking · Årsplan · Gruppe · WANG
LAG 3  Moduser     spiller | stall | min | gruppe  (kolonner = dager ELLER personer)
LAG 2  Motor       TidsGrid (05–23, SLOT 30, ⇧5, nå-linje) · DagStripe · ÅrsTidslinje
LAG 1  Data/regler PERIODE_CONSTRAINTS · invarianter · PlanAction · blokk-typer · ghost
```

Alle flater i lag 4 er tynne komposisjoner av lag 2-komponenter — ingen flate eier sin egen
tidsberegning, raster eller blokk-tegning. Det er nøyaktig det `components/calendar/`-settet
i designsystemet allerede tegner; forslaget er å håndheve det i kode.

## 2.2 De tre motor-komponentene (lag 2)

**TidsGrid** — det redigerbare rutenettet. Én implementasjon med props:
`kolonner: "dager" | "personer"`, `raster: 05:00–23:00` (aldri overstyrbar — booking og
availability bruker samme raster og viser bare åpningstid som skravert sone), `zoom`,
`låsteLag` (skole/booking — varsel ved konflikt, aldri blokkering), `ghostBlokker`,
`nåLinje`. Brukes av: spiller-WB, coach-WB (alle moduser), admin-uke, availability, booking.

**DagStripe** — mobilens tetthetsvisning (fra stall-mobil-fasiten): én person/én dag som
ikke-redigerbar stripe. Redigering skjer alltid i ark. Brukes av: alle mobilflater + stallrad.

**ÅrsTidslinje** — år/periode-visningen (Periodeplan + YearTimeline fra komponentsettet):
perioder som bånd, turneringer/tester/samlinger som markører oppå, **koblet til
PERIODE_CONSTRAINTS** slik at et periodebånd som bryter volum/pyramide-reglene får varselmerke
direkte i årsvisningen. Brukes av: spiller-årsplan, WANG-årsplan (Gantt-varianten
konvergeres hit), gruppe-årsplan, GFGK.

## 2.3 Workbench-målbildet per rolle

**Spilleren (PlayerHQ):** dagens WorkbenchV2 er nærmest målet. Gjenstår: (a) Testbatteri-arket
(fasit finnes, PR-E), (b) turneringssonen inn som fane (kort-layouten fra
workbench-turnering.html — spillerens variant viser egne påmeldinger), (c) årsplan-fanen
koblet til constraints (§2.2). Composer + ghost + søndagsforslag beholdes som de er designet.

**Coachen (AgencyOS) — den store jobben:** dagens coach-workbench **skrotes og bygges på nytt**
på samme motor som spillerens (ikke repareres — den porter en død fasit og deler ingen kode
med WorkbenchV2 i dag). Målbildet er workbench-stall-fasiten:
- Fire moduser på samme motor: **stall** (én dag, personer som kolonner, coach-kolonne
  inkludert) · **min** (coachens egen uke) · **gruppe** · **spiller** (dager som kolonner —
  identisk med spillerens visning, coachen ser det spilleren ser).
- **Tre soner** (fra template-fasiten): Editor · Innboks (PlanChangeRequest + PlanAction
  PENDING, med diff og Godkjenn/Avvis + «Hvorfor?») · Caddie (utkast, aldri auto-send).
- Turneringsplanlegging som egen fane (kort-layout, hele stallen på tvers).
- Alt agentskrevet gjennom PlanAction — ingen egne køer.

**Gruppe/kurs:** gruppemodusen i coach-WB overtar for den frittstående gruppe-kalenderen.
Utrulling (coachRullUtGruppeAarsplan) får diff-forhåndsvisning i samme mønster som PlanAction:
«dette legges inn hos 8 spillere — se konflikter per spiller før du ruller ut». Kurs (når/hvis
modellen bygges, jf. forslags-dokumentets punkt 26) er en gruppe med påmelding — arver
gruppemodusen gratis.

**WANG/GFGK:** egne flater beholdes (egne paletter, egne domener), men tegnes med
ÅrsTidslinje + TidsGrid fra motoren. SchoolScheduleEntry blir låst lag i TidsGrid (skole
dimmet+låst — som fasiten krever). GFGK uten klokkeslett-skoletid: ingen skoleblokk tegnes
(«vi gjetter ikke skoletid» — regelen fra stall-fasiten beholdes).

## 2.4 Kalender vs. Workbench — rolledeling

I dag er skillet uklart (KalenderV2 og WorkbenchV2 overlapper). Forslag til knivskarpt skille:

| | Kalender | Workbench |
|---|---|---|
| Spørsmål den svarer på | «Hva skjer?» | «Hva skal jeg endre?» |
| Redigering | Ingen (kun åpne/flytte-forespørsel) | All |
| Visninger | Dag/uke/måned/år, lesevennlig | Uke (grid) + år (tidslinje) + ark |
| Innhold | ALT (økter, booking, skole, turnering, test) | Samme + ghost/utkast/budsjett/brudd |

Kalenderen blir en ren lese-flate på samme motor (TidsGrid i lesemodus) — ett trykk på en
blokk åpner den i Workbench. Da forsvinner behovet for redigeringslogikk i KalenderV2, og
«tre konkurrerende CTA-er til Workbench»-problemet (portplan) løses strukturelt: kalenderen
ER veien inn.

## 2.5 Booking og availability på samme motor

BookingV2/AdminBookinger/AvailabilityGrid beholder sine egne flater og forretningsregler
(credits, dobbelbooking-sperre, lokasjon), men bytter tegning til TidsGrid: åpningstid som
tilgjengelig sone, resten skravert, bookinger som låste blokker. Gevinst: booking-blokker
vises automatisk riktig i Workbench og kalender (samme blokk-komponent), og
coach-tilgjengelighet redigeres i samme grid som alt annet.

## 2.6 Konsolideringsgevinsten i tall

| I dag | Målbildet |
|---|---|
| 12 kalender-implementasjoner | 3 motor-komponenter + tynne flater |
| 3 tidsrastere (05–23, 07–21, egne) | 1 raster (05–23) |
| 2 workbench-kodebaser (spiller/coach, null delt) | 1 motor, moduser |
| Årsplan uten regelkobling | ÅrsTidslinje validerer mot PERIODE_CONSTRAINTS |
| Agentforslag uten felles kø hos coach | Alt via PlanAction PENDING |

## 2.7 Foreslått rekkefølge (hver etappe verdifull alene)

1. **Motor ut av WorkbenchV2** — trekk TidsGrid/DagStripe ut av dagens spiller-WB (3 325
   linjer) til `src/components/shared/tidsmotor/`. Ingen synlig endring, ren refaktor med
   visuelle regresjonstester (paper-visual-specene finnes allerede).
2. **Coach-WB bygges ny** på motoren, mot stall-fasiten: modusene + tre soner + PlanAction-
   innboks. Skjermbilde-gaten per CLAUDE.md gjelder. Gamle coach-workbench + legacy-ruter
   avvikles med redirects (jf. feillogg-læringen om `(legacy)`-URLer).
3. **Turnering inn i Workbench** (spiller- og coach-fanen) — lukker 04.08-vedtaket.
4. **Testbatteri-arket** i spiller-WB (PR-E) + TestResult→TalentHQ-sync.
5. **ÅrsTidslinje + constraints-kobling** — spiller-årsplan, WANG, gruppe konvergerer.
6. **Kalender som leseflate** på motoren; KalenderV2s redigeringsrester fjernes.
7. **Booking/availability** over på TidsGrid — siste etappe, minst kritisk.

Etappe 1–2 er fundamentet og bør gå først; 3–7 kan omprioriteres fritt etter behov.

---

*Analyse verifisert mot repoet 18.08.2026 (fasiter i designsystem/paper/, produksjonskode i
src/, docs/feillogg.md). Forslagene i del 2 er
til diskusjon — ingen kode endres før rekkefølgen og omfanget er godkjent.*
