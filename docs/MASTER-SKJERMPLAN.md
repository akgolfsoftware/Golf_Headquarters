# Master-skjermplan — AK Golf HQ

> Autoritativ oversikt over alle skjermer i plattformen. Én plass å se alt. **Sist oppdatert: 17. juli 2026.**

> **OPPDATERT KANON (2026-07-08):** Design-kanon er nå UTELUKKENDE det levende Claude Design-
> prosjektet (`claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`), hentet direkte via
> DesignSync — se `.claude/rules/design-system-regel.md`. Ingen "andre lag"-unntak for
> driftsskjermer lenger; alt bygges mot dette til slutt. «Design=✓» måler mot faktisk 1:1-
> komposisjon fra `src/components/athletic/golfdata/` (portet fra prosjektets `components/`).
>
> **2026-07-08 update:** Alle /admin og /portal skjermer har nå .golfdata-scope via AdminShell + PortalShell (v13 tokens aktivert). Komposisjon med golfdata-komponenter (Button, Card, Eyebrow, SpillerTilstandKort, OektKort, KpiTile, kalendere, SG-kort osv) + ingen hex. Design=✓ satt for alle produksjonsskjermer som bruker kanon-komponentene (batch). Se PORTING.md + design-system-regel.md. Drop-off reduseres fortløpende.
> `plans/design-bolgeplan.md` (D0–D5) er slettet — se aktiv plan-fil for gjeldende bølge-rekkefølge
> (E-serien). Bekreftet på kanon i dag: PlayerHQ Hjem/Planlegge/Gjennomføre/Analysere/Meg +
> AgencyOS Spillere/Spiller-analyse. Resten gjenstår.

> **Optimalisering juli 2026:** Navigasjon strammet for færre klikk og skjermer. 
> PlayerHQ: 5 faste seksjoner (Hjem–Plan–Gjør–Analyse–Meg) + Workbench som ett trykkpunkt for alt planlegging, Analysere som samlet analyseflate. 
> Direkte hurtighandlinger fra Hjem. 
> AgencyOS: Flate primær-punkter for Planlegge og Kalender&Bookinger, sterk cockpit med "Ett klikk"-bar. Duplikate adresser og dype grupper redusert. Logisk sted å trykke = alltid hovedseksjonene eller synlige hurtigknapper. Se også .claude/rules/arkitektur.md.

**Booking:** Acuity (`akgolfgroup.as.me`) er midlertidig booking frem til HQ-bookingen lanseres. Sett `BOOKING_ACTIVE=true` i Vercel for å aktivere den innebygde flyten.

---

## Slik bruker vi denne (regel)

Før noen rører en skjerm: finn raden her, jobb mot den, oppdater hakene i samme commit. En skjerm er ikke ferdig før alle seks haker er grønne (✓). Alt Claude Design har tegnet skal kobles — sjekk «drop-off»-lista.

**De seks hakene:**
1. **Design** — ser ut som den skal (riktig utseende, riktig oppsett)
2. **Mob/Desk/iPad** — fungerer fint på tre størrelser. Tre tegn, f.eks. `✓✓–` = mobil og desktop OK, iPad ikke sjekket
3. **Adresse-ok** — riktig nettadresse, ikke bare forhåndsvisning
4. **Flyt** — knappene tar deg dit de skal
5. **Data** — viser ekte tall fra databasen
6. **Funker** — testet, knekker ikke

Tegnforklaring: ✓ = ferdig · ~ = delvis / i arbeid · – = ikke startet

† = bygd + koblet til ekte data + tsc/build grønt — men ikke nettleser-testet ende-til-ende ennå

★ = kjerneskjerm (høy prioritet for design og data)

---

## Status akkurat nå — 16. juli 2026 (reconciliation)

> Denne seksjonen erstatter en stale «17. juni»/«6. juli»-versjon (arkivert i git-historikken om
> nødvendig) som fortsatt beskrev sub-sider, Coach-seksjonen og AgencyOS-sekundærskjermer som
> «Design=– på samtlige» — det stemte ikke lenger. Claude Design-prosjektets DEKNINGSKART.md
> rapporterte 16. juli **0 gjenstående design-gap** (139 ✅ · 235 ◆ · 27 🛠 · 23 ↪︎ · 2 🟡), og en
> full kode-reconciliation samme dag bekreftet at det store flertallet av denne tabellens
> «Design: –»-rader var nettopp den typen stale hake dokumentets egen endringslogg advarte om —
> skjermen var alt v2- eller golfdata-komponert, bare uten at haken ble flippet.

**Hva reconciliation fant, i grove trekk:**
- **Design-kanon har gått videre fra golfdata til v2** (`src/components/v2/` + per-domene
  `*V2.tsx`) per `.claude/rules/design-system-regel.md` — golfdata er nå «overgangs-lag».
  De fleste rettede hakene under er til v2, ikke golfdata.
- **Forelder-seksjonen** (11 skjermer) var systematisk stale — 10 av 11 er allerede v2-komponert.
- **Marketing-seksjonen** var nesten helt stale — alt unntatt hele Booking-underflyten (4 ruter)
  er allerede v2-komponert.
- **AgencyOS** hadde en stor bølge stale haker (Innboks, Planlegge-hub, Plans, Plan-maler,
  Teknisk plan, Økter, Tester-hub, Analyse, Rapporter, Agenter, E-postmaler, Talent/Radar,
  Grupper, Spiller-fremgang/-tester, Caddie, Økonomi, m.fl.) — men også et helt annet funn:
  **12 rader var feilaktig scoret som levende skjermer når de faktisk kun er redirects**
  (`/admin`, `/admin/board`, `/admin/kommunikasjon`, `/admin/workspace/oppgaver`, `/admin/stall`,
  `/admin/talent`-hub, `/admin/plans/new`, `/admin/kapasitet`, `/admin/analysere`,
  `/admin/tilstander`, `/admin/okonomi`, `/admin/coach-workbench`).
- **Ekte, bekreftede gap finnes fortsatt** — bl.a. hele Live-økt-familien (brief/aktiv/summary,
  begge sider av coach/spiller), booking-underflyten (marketing OG portal), en bespoke lokal
  komponent-familie i AgencyOS (`AgPage`/`AgPageHead`, ikke kanon), og et par ruter som ikke
  finnes i koden i det hele tatt (`/portal/mal/baner(+[id])`, `/portal/statistikk/sammenlign`).
- **Noen rader er AMBIGUOUS** (delt komposisjon, kun header-komponent, eller en pixel-perfect
  hand-port av en godkjent fasit uten kanon-imports) — disse er merket som sådan i tabellene
  under, ikke tvunget inn i enten ✓ eller –.

**Konklusjon:** den tidligere «Prioritet 1–5»-listen under (nå fjernet) beskrev nesten
utelukkende arbeid som allerede er gjort. Se de enkelte skjerm-radene lenger ned for nåværende,
verifisert status — ikke gjenoppliv denne listen uten en fersk kode-sjekk.

---

## Skjermene — PlayerHQ

PlayerHQ er spillerens eget verktøy: «hva skal JEG gjøre i dag?» Adressene begynner med `/portal`.

### Hjem

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Hjem (Workbench-hjem) ★ | `/portal` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Complete v13 (golfdata scope + components)
| Varsler ★ | `/portal/varsler` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | v13 golfdata-scope + Eyebrow/Card primitives (full composition)

### Planlegge

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Planlegge (= Workbench mobil) ★ | `/portal/planlegge` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Complete v13 (golfdata scope + OektKort etc)
| **Workbench (planlegging)** ★ | `/portal/planlegge/workbench` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-14 dok-verifisering: samme delte `WorkbenchV2`-komponent som coach-siden — Del 8c (periodetype-grunnmur, årsplan-canvas, periodestrip, Cmd+D-duplisering, universell økt-popup, full økt-komponist, Driller-fane) + WB1–WB5 (belastningsstripe, publiser-diff, øktas driller i inspektøren) er alle levert og koblet til ekte server actions (`lib/workbench/*`). Design rettet – → ✓ for å matche faktisk kode |
| · Plan-bygger (v2 wizard) | `/portal/planlegge/bygger` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2 2026-07-10: 5-stegs wizard per godkjent mockup (phq-plan-bygger); deler kjerner med legacy mal/bygger via lib/plan-builder
| Årsplan | `/portal/tren/aarsplan` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `Aarsplan`-komponenten importerer golfdata `Button/Card/Eyebrow`. |
| · Rediger periode | `/portal/tren/aarsplan/periode/[id]/rediger` | ~ | --- | ✓ | ✓ | ✓ | ~ |
| · Ny periode | `/portal/tren/aarsplan/periode/ny` | ~ | --- | ✓ | ✓ | ✓ | ~ |
| Teknisk plan (liste) | `/portal/tren/teknisk-plan` | UTGÅTT | --- | → | ✓ | – | ✓ | <!-- redirect til Workbench (next.config) — død listeside slettet 2026-07-11 -->
| · Teknisk plan detalj | `/portal/tren/teknisk-plan/[planId]` | – | --- | ✓ | ✓ | ✓ | ✓ | 2026-07-14: automatisk repslogging fra live-økt, bilde/video på oppgaver, kategori
| Fys-plan (liste) | `/portal/tren/fys-plan` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Fys-plan detalj/bygger | `/portal/tren/fys-plan/[planId]` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `KPICard` (ui/) + `fys-plan`-modulen bruker `Input`/`ProgressBar` fra ui/. |
| Drills (bibliotek) | `/portal/drills` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `OvelsesbankV2` i `V2Shell`. |
| · Drill-detalj | `/portal/drills/[id]` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | v2-port 17. jul (Team D1): `DrillDetaljV2` (V2Shell/Kort/TomTilstand/CTAPill), ruten flyttet ut av (legacy) — gammel v10 pixel-port slettet. `loadDrillDetalj`-loaderen, auth-guard (PLAYER+PARENT) og ærlige tomtilstander («Media kommer», aldri fabrikerte tall) uendret. Design – → ✓. |
| Mål-hub | `/portal/mal` | ✓ | --- | ✓ | ~ | ~ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — `MalHubV2` inni `V2Shell` (@/components/portal/v2/MalHubV2).
| · Mål-bygger (wizard) | `/portal/mal/bygger` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D1): `MalByggerV2` — ruten flyttet ut av (legacy), ny tynn page (`V2Shell aktiv="meg"` + `TilbakeLenke`) + presentasjonskomponent på v2-primitiver; all wizard-/lagringslogikk (anbefalMal → generer m/ valgtTemplateId → lagre/sendTilGodkjenning, GRATIS-gating) uendret via `actions.ts` flyttet byte-identisk. Disciplin-farger nå T.ax-aksefarger (var rå hex), HjelpTips på SG-svakhet/L-fase/SG-Total. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Mål-detalj | `/portal/mal/goal/[id]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D1): `MalDetaljV2` (Kort/StatusPill/ProgresjonsBar/NivaStige + tre v2-modaler for endre/oppnådd/avbryt) erstatter hybrid-designet (page + goal-client), ruten flyttet ut av (legacy). Eierskaps-sjekk, fremdrifts-/ETA-utregning, A–K-stigen og `goals-actions` (endreGoal/markeerGoalSomOppnaadd/avbrytGoal) uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Milepæler | `/portal/mal/milepaeler` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header importerer golfdata `Eyebrow`.
| · Leaderboard | `/portal/mal/leaderboard` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D1): `LeaderboardV2` (V2Shell/Kort/AvatarInit) erstatter wireframe-designet, ruten flyttet ut av (legacy). Feature-gate (FEATURES.LEADERBOARD), Prisma-queries og rangeringslogikken (snitt-SG per felt siste 30 dager, topp 25) uendret. Delta-rang/badges fortsatt ikke bygget (TODO i original) — vises ikke i stedet for plassholdere. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Turneringer (mine) ★ | `/portal/tren/turneringer` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: v2-forhåndsvisning (retning C) allerede portert, hake aldri oppdatert |
| · Turnering-detalj | `/portal/tren/turneringer/[id]` | ✓ | ✓✓– | ✓ | ~ | – | ~ | v2-port 17. jul (Team D1): `TurneringDetaljV2` (V2Shell/Kort/StatusPill/TomTilstand) erstatter hybrid-designet, ruten flyttet ut av (legacy). `loadTurneringDetalj`-loaderen og server actions (`meldDegPa`/`meldDegAv` fra (legacy)/tren/turneringer/actions.ts — beholdt der, deles med lista) uendret. Not-found beholdt med ærlig tomtilstand. Design – → ✓, Adresse ~ → ✓. |
| · Ny turnering | `/portal/tren/turneringer/ny` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header (golfdata `Eyebrow`).
| Utfordringer | `/portal/utfordringer` | ✓ | --- | ✓ | ~ | ~ | ~ | Fase 2 spot-check 17. jul: FLIPPET ~ → ✓. Verifisert i kode: både lista (`UtfordringerV2`) og detalj (`UtfordringDetaljV2`) rendres i `V2Shell` — fullt v2-komponert, «~» var stale. |
| · Ny utfordring (wizard) | `/portal/utfordringer/ny` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header (golfdata `Eyebrow`).
| · Utfordring-detalj | `/portal/utfordringer/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| AI: mål-bygger | `/portal/ai/mal-bygger` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D1): `AiMalByggerV2` (Kort/Knapp/ValgKort/Inndata) erstatter mal-bygger-wizard (v10), ruten flyttet ut av (legacy) — `actions.ts` (lagreMalForslag) flyttet uendret med. 3-stegs SMART-wizard-logikken uendret; ingen oppdiktede tall. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| AI: foreslå drill | `/portal/ai/foresla-drill` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D1): `ForeslaDrillV2` (Kort/AkseChip/CTAPill/InnsiktChip/TomTilstand) erstatter foresla-drill-screen (v10), ruten flyttet ut av (legacy). Svakhets-signaler (`loadWeaknessSignals`) og den ærlige match-scoren (akse-overlapp, aldri oppdiktede tall) uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| AI: foreslå turnering | `/portal/ai/foresla-turnering` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D1): `ForeslaTurneringV2` (Kort/CTAPill/StatusPill/InnsiktChip/TomTilstand) erstatter foresla-turnering-screen (v10), ruten flyttet ut av (legacy). Rangeringslogikken (påmeldinger + katalog, ingen oppdiktede sannsynligheter) uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |

### Gjennomføre (inkl. live-økt)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Gjennomføre (I dag/Kalender/Booking) ★ | `/portal/gjennomfore` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Økt-detalj (V2-økt fra coach) | `/portal/gjennomfore/[id]` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `OktV2`. |
| Kalender | `/portal/kalender` | ✓ | --- | ✓ | ~ | ~ | ✓ | v13 composed (golfdata calendars + scope)
| Kalender (alt. → redirect) | `/portal/tren/kalender` | ✓ | --- | ✓ | ✓ | – | ✓ | Reconciliation 16. jul: redirect-only via `workbenchRedirectForTrenPath` (`src/proxy.ts`) → `/portal/planlegge/workbench?tab=uke`. `(legacy)/tren/kalender/page.tsx` er utilgjengelig dødkode, ikke en ekte gjenstående design-skjerm.
| Ny økt (handlingsvalg) | `/portal/ny-okt` | ✓ | --- | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header (golfdata `Eyebrow`).
| Logg treningsøkt (volum per SG) † | `/portal/trening/logg` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ | v2-port 17. jul (Team D2): `TreningLoggV2` + tynn server-page, ruten flyttet ut av (legacy). Samme POST `/api/portal/trening/logg` + redirect `/portal/gjennomfore`; `sgOmrade`-HjelpTips på Område. Design – → ✓. |
| **Putte-laboratoriet** (3 verktøy) | `/portal/trening/putte-laboratoriet` | ✓ | ✓✓– | ✓ | ✓ | – | ✓ | v2-port 17. jul (Team D2): `PutteLabV2` — all putt-fysikk uendret fra `@/lib/putt-core`; legacy-filens 25 rå hex erstattet med T-tokens/color-mix (0 hex i ny kode). HjelpTips på stimp/make-%/prosess-score. Design – → ✓. |
| **Break-tabell** (3 varianter) | `/portal/trening/break-tabell` | ✓ | ✓✓– | ✓ | ✓ | – | ✓ | v2-port 17. jul (Team D2): `BreakTabellV2` — samme referansetabell/putt-core-matte, varmekart via color-mix over T.forest, tre varianter beholdt. HjelpTips på stimp/break; footprints/ruler-ikoner lagt i felles MAP. Design – → ✓. |
| Ønsket økt (be coach) | `/portal/onskeligokt` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `OnskeligOktV2`. |
| · Ønsket økt bekreftet | `/portal/onskeligokt/bekreftet` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D2): `OnskeligOktBekreftetV2` — siste SessionRequest, reason-parsing og status-drevet tidslinje uendret; ærlig tomtilstand uten request. Delte `actions.ts`/`form.tsx` urørt (brukes av OnskeligOktV2). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Live-økt: brief † | `/portal/(fullscreen)/live/[sessionId]/brief` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: lagt til akse-farget chip (`--axis-*`-tokens, matcher phq-live.jsx sin PyrChips) + `HjelpTips` (pyramideAkse/lFase). Rettet samtidig en pre-eksisterende feil: `L_PHASE_LABEL` viste GRUNN/SPESIAL/TURNERING (feil enum, LPhase) for `drill.lFase` (som faktisk er LFase — L-Kropp/Arm/Kølle/Ball/Auto); nå hentet fra `L_FASER` i `@/lib/taxonomy`. Egen `LiveSessionShell` beholdt (fullskjerm mørk, samme visuelle intensjon som mockupen).
| Live-økt: aktiv † | `/portal/(fullscreen)/live/[sessionId]/active` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `DrillLogger` grener nå til ny `FysDrillLogger` for FYS-drills (SettRepsLogger/PulsSoneVelger/Stegteller, m/ `MicButton`-notat) i stedet for golf-only RepCounter-grid; golf-flyten uendret. Lagt til "Neste opp"-hint (matcher phq-live.jsx) + fikset FYS-progressbar (falt tilbake til repSett når plannedReps=0). Egenbygd fargepalett (18 hex, egen godkjent baseline) beholdt — dette er merkevarens forest/lime-primitiver, ikke tema-avhengige aliaser, og AI-Caddie-chat (LiveCoachPanel) dekker mockupens "AI-tip"-idé allerede reelt.
| Live-økt: oppsummering † | `/portal/(fullscreen)/live/[sessionId]/summary` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: lagt til `Verdict`-banner (plan-etterlevelse ≥70 % = "På plan"/lime, <70 % = "Avvik"/koral, aldri sperre) + `HjelpTips` (planEtterlevelse), matcher phq-live.jsx sin Summary. Mockupens kvalitet(1–5)+følelse-tagger+"Send til Anders" er IKKE bygget — ingen spiller-side vurderings-action finnes i dag (kun coach-siden har `lagreCoachVurdering`); flagget som eget spørsmål, ikke bygget spekulativt.
| Live-økt: drill-logger | `/portal/(fullscreen)/live/[sessionId]/logger` | ✓ | ✓✓– | ✓ | ~ | ~ | ✓ | Ren redirect-alias til /active (uendret) — arver v2-porten derfra.
| Live-økt: score-tapper | `/portal/(fullscreen)/live/[sessionId]/tapper` | ✓ | ✓✓– | ✓ | ~ | ~ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — `TapperShell` komponerer `LiveCoachPanel` som importerer fra @/components/v2.
| Tren (fullskjerm) | `/portal/(fullscreen)/tren` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `redirect("/portal/planlegge/workbench")` — ikke en egen skjerm.
| Økt-detalj | `/portal/tren/[sessionId]` | ✓ | --- | ✓ | ~ | ~ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header (golfdata `Eyebrow`).
| · Planlagt økt | `/portal/tren/[sessionId]/planlagt` | ✓ | ✓✓– | ✓ | ~ | ~ | ✓ | v2-port 17. jul (Team D2): `OktPlanlagtV2` — auth/tilgang/timing/inviter-kandidat-logikk uendret; deltakerliste restylet til AvatarInit+StatusPill. InviteFriendTrigger/-Modal restylet til v2 17. jul (Team F3, in place: ModalSkall-idiom, PillTabs, AvatarInit — invitasjons-logikk uendret). Design – → ✓. |
| Feiring (etter plan ferdig) | `/portal/tren/feiring/[planId]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D2): `FeiringV2` — fullført-guard, computeEffectiveness best-effort og rekord-sammenligning uendret; RingMaaler for gjennomføringsgrad, ærlig tomtilstand uten SG-data, HjelpTips på SG-kortene. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |

### Analysere

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Analysere = «Min golf» (6 faner: SG · Fokus · Runder · Baggen · Putting · Nivå — v13 golfdata, bølge 1 2026-07-04) ★ | `/portal/analysere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Hull-analyse | `/portal/analysere/hull` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | v2-port 17. jul (Team F2): hele skjermen (begge faner) rekomponert til v2 — `AnalysereHullV2` (PillTabs/SgKategorier/Scorekort/MiniSpark); queries og fane-logikk uendret; SG per hull vises ærlig som «—» (ikke beregnet i datagrunnlaget). Meldt gap: illustrativt top-down-banekart m/ trykkbare soner finnes ikke i v2-kanon — må designes i ui_kits/v2 om Anders vil ha det tilbake. |
| Statistikk (oversikt) | `/portal/statistikk` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | Fase 2 spot-check 17. jul: FLIPPET ~ → ✓. `StatistikkHub` (via statistikk-hybrid) er fullt golfdata-komponert — overgangs-laget teller som kanon per design-system-regelen. Rekomponeres til v2 når hub-bølgen tas; underruten `[metric]` er alt v2 (Team D3). |
| · Metrikk-detalj | `/portal/statistikk/[metric]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D3): `StatistikkMetrikkV2` — metric-oppslag (5 pyramide + 4 SG + aliaser), queries og trend-buckets uendret. Falsk (disabled) periode-velger erstattet med ærlig «Siste 90 d»-badge; fortegn mot kategori-snitt vises nå korrekt; HjelpTips på SG/pyramide/kategori-snitt. A1-benchmark fortsatt statisk proxy, merket «(referanse)». Design – → ✓. |
| ~~· Sammenlign~~ | `/portal/statistikk/sammenlign` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 2026-07-14) — raden var ønske/plan, aldri bygget. Fjern eller bygg bevisst. |
| · Del runde | `/portal/statistikk/runder/[runId]/del` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D3): `DelRundeV2` — delekortet på `T.wrapped`-gradientene (0 hex), format/synlighet/kopier-lenke uendret; SG-piller med ordboksnavn (Tee-slag/Innspill/Nærspill/Putting). «Last ned» fortsatt simulert som i baseline. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| **SG-Hub (Strokes Gained)** ★ | `/portal/mal/sg-hub` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: hub-komponenten importerer golfdata `Button/Card/Eyebrow/KpiTile` + `golfdata-scope`. |
| · Kølle-detalj | `/portal/mal/sg-hub/[club]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Benchmark | `/portal/mal/sg-hub/benchmark` | ✓ | --- | ✓ | ~ | ✓ | ✓ |
| · Best vs nå | `/portal/mal/sg-hub/best-vs-now` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Utstyr | `/portal/mal/sg-hub/equipment` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Avstander (yardage) | `/portal/mal/sg-hub/yardage` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Forhold (vær/bane) | `/portal/mal/sg-hub/conditions` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Strategi | `/portal/mal/sg-hub/strategy` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Coach ser spiller-SG | `/portal/mal/sg-hub/coach/[spillerId]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D3): `CoachSgHubSpillerV2` (coach-modus-banner, KpiFliser, kølle-grid) — `requireCoachForPlayer`, TrackMan-query og CLUB_ORDER-sortering uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Coach: kølle | `/portal/mal/sg-hub/coach/[spillerId]/[club]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D3): `CoachSgHubKolleV2` — analysekjeden (computeDPlane/StrikePattern/SmashCurve) og de token-styrte grafene gjenbrukt; Enkel/Avansert-veksleren gjenskapt mot samme `setSgHubMode`-action; slag-tabell nå med enheter (°, mph); HjelpTips på D-Plane/smash factor. Design – → ✓. |
| · Coach: utstyr | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | – | --- | ✓ | ~ | ~ | ~ | 17. jul (Team F3): wrapper-ruten flyttet ut av (legacy) (samme URL, samme auth som naboruten, nå V2Shell-chrome); rendrer fortsatt legacy `EquipmentView` — v2-port av selve visningen gjenstår (deles med spillerens equipment-side, tas samlet). |
| Runder (liste) | `/portal/mal/runder` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `RunderV2`. |
| · Runde-detalj ★ | `/portal/mal/runder/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Slag-for-slag (visning) | `/portal/mal/runder/[id]/shot-by-shot` | ↪︎ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `redirect` til `/portal/mal/runder/${id}/slag` — foreldet rute, ingen lenke peker hit lenger.
| · Avansert slag-redigering (legacy wizard + UpGame-import) | `/portal/mal/runder/[id]/slag` | ✓ | ✓-- | ✓ | ✓ | ✓ | † |
| · Fullfør kjeden (import/hurtig → slag-kjede per hull) ★ | `/portal/mal/runder/[id]/fullfor` | ✓ | --- | ✓ | ✓ | ✓ | ~ | Reconciliation 16. jul: gammel kommentar («fra main, v13/golfdata — gjenstår v2-port») var selv stale — `FullforKjedeKlient` er allerede v2-komponert (`T/fmtSg/Caps/Kort/Icon` fra `components/v2`). Design rettet ~ → ✓.
| · Logg ny runde (hurtig score) ★ | `/portal/mal/runder/ny` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Live slag-for-slag-føring ★ | `/portal/runde/live` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Etterregistrering slag for slag ★ | `/portal/runde/logg` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| TrackMan (liste) | `/portal/mal/trackman` | ✓ | ✓✓– | ✓ | ~ | ✓ | † |
| · TrackMan-sesjon | `/portal/mal/trackman/[id]` | ✓ | ✓✓– | ✓ | ~ | ~ | † |
| · TrackMan (alt. adresse) | `/portal/trackman/[sessionId]` | ↪︎ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `redirect` til `/portal/mal/trackman/${sessionId}` — konsolidert 2026-06-25.
| Gameplan (baneliste, omdøpt fra Baneguide 16. jul) | `/portal/gameplan` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Banekart-oversikt | `/portal/gameplan/[baneId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Hull-detalj (dispersion + Planlegg-fane) | `/portal/gameplan/[baneId]/hull/[nr]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Tester (oversikt) ★ | `/portal/tren/tester` | ✓ | ✓✓~ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + v2-primitiver. |
| · Test-detalj ★ | `/portal/tren/tester/[testId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | UAT 17. jul (lokal dev, Playwright): detaljsiden lastet og «Gjennomfør»-CTA klikket → scorekortet åpnet, 390px + desktop, 0 konsollfeil. Funker † → ✓. |
| · Test-gjennomføring (scorekort) ★ | `/portal/tren/tester/[testId]/gjennomfor` | ✓ | ✓✓~ | ✓ | ✓ | ✓ | ✓ | v2-port 17. jul (Team D2): flyttet fra egen `(fullscreen-test)`-gruppe til `(fullscreen)` (live-familiens chrome-løse konvensjon), restylet til T-tokens; felles score-motor, tilgangsregel og lagre-action byte-identisk. FYS-plassholder-noten beholdt ordrett. Design – → ✓. |
| · Test-katalog (NGF) | `/portal/tren/tester/katalog` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header (golfdata `Eyebrow`).
| · Ny test | `/portal/tren/tester/ny` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D2): `NyTestV2` — 4-stegs wizard m/ identisk katalog/fuzzy-match/localStorage-draft/validering; `logTest` flyttet byte-identisk; stegindikator via ProgresjonsBar. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Ny egen test | `/portal/tren/tester/ny/egen` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team F3): `NyTestEgenV2` (5-stegs wizard, samme kanGåVidere/payload/«foreslå til coach»-vei) + tynn page; `actions.ts` flyttet byte-identisk; hele `(legacy)/tren/tester/ny/` slettet. HjelpTips på kategori + NGF-nivå. |
| · Test live (fullskjerm) | `/portal/(fullscreen)/test/[testId]/live` | – | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): RUTE FINNES IKKE i koden — ingen `(fullscreen)/test`-mappe, ingen redirect dit heller. Samme kategori som tidligere flaggede død-rute-funn (statistikk/sammenlign, mal/baner) — bør flagges til Anders, ikke bare flippes.
| · Test oppsummering | `/portal/(fullscreen)/test/[testId]/summary` | – | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): RUTE FINNES IKKE i koden — se samme rad over (live).
| ~~Bane-bibliotek~~ | `/portal/mal/baner` | — | — | — | — | — | — | RUTE FINNES IKKE i koden (verifisert 16. jul, samme kategori som `/portal/statistikk/sammenlign` under). Fjern fra planen eller bygg bevisst — ikke bare en hake-fiks. |
| ~~· Bane-detalj~~ | `/portal/mal/baner/[id]` | — | — | — | — | — | — | Samme — rute finnes ikke. |
| Statistikk-side (gml.) | `/portal/mal/statistikk` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header (golfdata `Eyebrow`).

### Coach (spillerens kontakt med coach)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Coach-hub | `/portal/coach` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/portal/coach/[coachId]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Coach SG-sammenligning | `/portal/coach/sg-hub` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | Rad lagt til 17. jul (manglet i planen). v2-port 17. jul (Team D3): `CoachSgHubV2` — COACH_SG-referanseverdier, BrukerSgInput-query og størst-gap-logikk uendret; H2H som opp/ned-bar fra nullstrek, statiske coach-referanser merket. Legacy-sidens 8 rå hex → 0. |
| Meldinger (innboks) | `/portal/coach/melding` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Ny melding | `/portal/coach/melding/ny` | ✓ | --- | ✓ | ✓ | ✓ | ✓† |
| · Meldingstråd | `/portal/coach/melding/[id]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Vedlegg | `/portal/coach/melding/[id]/vedlegg` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Coach-planer | `/portal/coach/plans` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Plan-detalj | `/portal/coach/plans/[planId]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Ny økt i plan | `/portal/coach/plans/[planId]/ny-okt` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Perioder | `/portal/coach/plans/perioder` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Coach-øvelser | `/portal/coach/ovelser` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Ny øvelse | `/portal/coach/ovelser/ny` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `PlayerHero`-header (golfdata Eyebrow); selve `DrillEditor` har ingen golfdata/v2-import.
| · Rediger øvelse | `/portal/coach/ovelser/[id]/rediger` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Coach-videoer | `/portal/coach/videoer` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Coach-notater | `/portal/coach/notes` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Notat-detalj | `/portal/coach/notes/[noteId]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Spørsmål til coach (liste løftet D3; [id]-tråd ikke løftet) | `/portal/coach/sporsmal/[id]` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Nytt spørsmål | `/portal/coach/sporsmal/ny` | ✓ | --- | ✓ | ✓ | ✓ | ✓† |
| Coach-AI | `/portal/coach/ai` | ✓ | --- | ✓ | ~ | ~ | ~ |

### Meg (profil og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Meg (profil) ★ | `/portal/meg` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Rediger profil ★ | `/portal/meg/profil` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `MinProfilV2` (v2 retning C), portert 10. juli, hake aldri oppdatert |
| Abonnement ★ | `/portal/meg/abonnement` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `MegAbonnementV2` (v2 retning C), hake aldri oppdatert |
| · Oppgrader | `/portal/meg/abonnement/oppgrader` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `redirect("/portal/meg/abonnement/oppgrader/flyt")` — ikke en egen skjerm.
| · Oppgrader-flyt | `/portal/meg/abonnement/oppgrader/flyt` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `oppgrader-flyt-wizard.tsx` bruker `Knapp` fra @/components/v2 som primær-CTA i alle steg.
| · Avbestill | `/portal/meg/abonnement/avbestill` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4a): `MegAvbestillV2` + tynn page; `cancelPro`/Stripe-før-DB-flyten 100 % uendret (samme confirm-vakt). Død «Pause →»-knapp erstattet med ærlig support-tekst. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Nytt kort | `/portal/meg/abonnement/kort/ny` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `aapne-stripe-portal.tsx` bruker `Knapp` fra @/components/v2.
| · Faktura-detalj | `/portal/meg/abonnement/faktura/[id]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4a): `MegFakturaV2` + restylet faktura-actions (samme `sendFakturaPaaEpost` og pdf-lenke); PDF-genereringen (document/actions/pdf-rute, godkjent hex-baseline) bevisst urørt. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Mine bookinger | `/portal/meg/bookinger` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `PlayerHero`-header (golfdata Eyebrow); kroppen (`BookingerTabs`) er hand-bygget.
| · Endre tid | `/portal/meg/bookinger/reschedule/[bookingId]` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `PlayerHero`-header; dato/slot-velger hand-bygget.
| Helse ★ | `/portal/meg/helse` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `MegHelseV2` (v2 retning C), hake aldri oppdatert |
| · Nytt symptom | `/portal/meg/helse/symptom/ny` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4a): `MegSymptomNyV2` erstatter wizard.tsx — 3-stegs flyt m/ kroppskart-SVG, VAS-Glider (m/ `vas`-HjelpTips), FilterChips-triggere; `logSymptom`-actionen uendret (fortsatt auth-validert stub). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Innstillinger ★ | `/portal/meg/innstillinger` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `InnstillingerV2` (v2 retning C), hake aldri oppdatert |
| · Varsler | `/portal/meg/innstillinger/varsler` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4b): NotifToggles+PushToggle → `InnstillingerVarslerV2` (Bryter-rader); browser-push-logikken uendret i `push-toggle.tsx` (kun UI-delen flyttet), samme `oppdaterPreferences`-flyt. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Personvern | `/portal/meg/innstillinger/personvern` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET — `PlayerHero`-header + `personvern-actions.tsx` bruker `Knapp` fra @/components/v2.
| · Sikkerhet | `/portal/meg/innstillinger/sikkerhet` | ✓ | ✓✓– | ✓ | ✓ | ~ | ✓ | **KANONISK sikkerhet-skjerm (D7-konsolidering 17. jul, Anders' ja):** score-hero + passord-/e-post-skjema (flyttet fra /meg/sikkerhet, Supabase-auth + ReauthModal 1:1) + glemt-passord- og 2FA-lenker + ekte lastLoginAt (nå Oslo-korrekt). `MegSikkerhetV2` slettet. |
| · Språk | `/portal/meg/innstillinger/sprak` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4b): SpraakToggle → `InnstillingerSprakV2` (ValgKort nb/en, engelsk fortsatt sperret «Kommer Q3 2026», samme `oppdaterPreferences`). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Anlegg | `/portal/meg/innstillinger/anlegg` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4b): FasilitetProfilForm → `InnstillingerAnleggV2` (avkryssings-rader per gruppe, Velg alle); GRUPPER-katalog og `lagreFasilitetProfil`-action uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Integrasjoner | `/portal/meg/innstillinger/integrasjoner` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4b): `InnstillingerIntegrasjonerV2` — brand-SVG-ene (14 rå hex) erstattet med token-emblemer (0 hex); ekte status kun for TrackMan/GCal, «Be om tilgang» går fortsatt ærlig til support. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Eksport | `/portal/meg/innstillinger/eksport` | ↪︎ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `redirect("/portal/meg/innstillinger/personvern")` — ikke en egen skjerm.
| · Økter | `/portal/meg/innstillinger/okter` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4b): `InnstillingerOkterV2` — info-kort + ærlig TomTilstand, StatusPill «Kommer Q3 2026» (fortsatt funksjonell placeholder som før). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Sikkerhet | `/portal/meg/sikkerhet` | ↪︎ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Redirect → `/portal/meg/innstillinger/sikkerhet` (D7-konsolidering 17. jul). Undersiden `/2fa` beholdes som fungerende TOTP-flate (tilbakelenke peker nå til kanonisk side; fortsatt athletic-lag — egen v2-port senere). |
| · To-faktor (2FA) | `/portal/meg/sikkerhet/2fa` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET — `twofa-client.tsx` bruker `Knapp` fra @/components/v2 i alle tre steg (ikke bare tynn header-berøring).
| Utstyrsbag ★ | `/portal/meg/utstyrsbag` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `MegUtstyrsbagV2` (v2 retning C), hake aldri oppdatert |
| Dokumenter ★ | `/portal/meg/dokumenter` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `MegDokumenterV2` (v2 retning C), hake aldri oppdatert |
| Foreldre (foresatt-info) | `/portal/meg/foreldre` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `MegForeldreV2`. |
| Feedback | `/portal/meg/feedback` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `MegFeedbackV2`. |
| Hjelpesenter ★ | `/portal/meg/help` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `MegHelpV2` (v2 retning C), hake aldri oppdatert |
| · Hjelp-artikkel | `/portal/meg/help/artikkel/[slug]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4a): `MegHelpArtikkelV2` — 10 rå hex fjernet (T.ax-pyramide + AkseBar); del/feedback som thumbs-knapper; fabrikkerte feedback-tall («143/8») fjernet, eksempeltall i figurer merket «(eksempel)». ARTIKLER-oppslag/fallback uendret. Design – → ✓. |
| · Hjelp-kategori | `/portal/meg/help/kategori/[slug]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D4a): `MegHelpKategoriV2` — sort-parametre (`?sort=`) og kategori-innhold uendret; ikon-bakgrunner normalisert til nøytralt v2-emblem (samme idiom som hjelp-huben). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Kontakt | `/portal/meg/help/kontakt` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `PlayerHero`-header; skjemaet selv hand-bygget.

### Booking

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Booking-hub | `/portal/booking` | ✓ | ✓✓– | ~ | ~ | ✓ | ✓ | 2026-07-14 dok-verifisering: `BookingV2` fullt token-komponert (stepper, tjenestekort, ekte slot-vindu fra availability-engine). Design rettet – → ✓. Merk: kun HUB-en er v2 — alle undersider (ny/[bookingId]/coach/anlegg/bekreftet) er fortsatt `(legacy)`-ruter, «Booking-flyt komplett i v2» stemmer IKKE ennå, se endringslogg |
| · Ny booking (wizard) | `/portal/booking/ny` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 17. jul (Team G-A, Anders' go samme dag): `BookingNyV2` — samme `?service=&dato=`-stegmodell, `getAvailableSlots`/credits-guards/lokasjonsoppløsning uendret i server-pagen, `CreditMeter` gjenbrukt, BruktOpp-tilstand beholdt; `credits`-HjelpTips på «1 credit». Rute ut av (legacy). Design – → ✓. UAT 17. jul (lokal dev, Playwright, testbruker): tjeneste → dag → slot klikket ende-til-ende, 390px + desktop; «brukt opp»-tilstanden verifisert m/ saldo 0 (viser drop-in-CTA). Flyt ~ → ✓. |
| · Ny booking bekreft | `/portal/booking/ny/bekreft` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 17. jul (Team G-A): `BookingNyBekreftV2` — `createCreditBooking`-kallet (atomisk credit-dekrement, RØRT ALDRI), `?service=&start=&coach=`-kontrakten og redirect til `bekreftet?bookingId=` uendret; `isSlotStillAvailable`-sjekken beholdt. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. UAT 17. jul (lokal dev, Playwright, testbruker): «Bekreft booking» klikket i begge viewports — booking opprettet CONFIRMED m/ priceOre=0, credit-saldo dekrementert 1:1 (DB-verifisert), redirect til /bekreftet. Testdata ryddet + saldo tilbakeført. Flyt/Data/Funker ~ → ✓. |
| · Booking-detalj | `/portal/booking/[bookingId]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team G-B): `BookingDetaljV2` — fabrikkerte TIMELINE/MÅL/UTSTYR-plassholdere SLETTET (ærlig data, viser kun ekte booking-felter); `booking.css`-avhengigheten (1051 l) + inline-hex borte; dato/tid nå Oslo-korrekt (gotcha-regel). Design – → ✓. |
| · Coach-profil (booking) | `/portal/booking/coach/[coachId]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team G-B): `BookingCoachV2` — `resolveCoach()` cuid/slug-fallback beholdt EKSAKT, ekte øktteller + tjenester, CTA-er → `/portal/booking/ny` med samme query-params. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Anlegg-detalj (booking) | `/portal/booking/anlegg/[anleggId]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team G-B): `BookingAnleggV2` — bevisste utelatelser beholdt (ingen hull/par/rating, intet faux time-grid), FASILITET_TYPE_LABEL uendret, CTA → ekte booking-flyt. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Bekreftet | `/portal/booking/bekreftet` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 17. jul (Team G-B): `BookingBekreftetV2` — eierskaps-sjekk + `googleKalenderUrl()` uendret, Oslo-korrekt tid; COPY-FIKS: «Forespørsel sendt!» → «Booking bekreftet» (bookingen opprettes CONFIRMED). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. UAT 17. jul (lokal dev, Playwright, testbruker): landet her etter ekte bekreftelse — riktig tjeneste/coach/tid (Oslo) vist + «Legg i kalender»/«Se alle bookinger», 390px + desktop. Flyt/Data/Funker ~ → ✓. |

### Talent (elite-spor — egen del av PlayerHQ)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Talent-hub | `/portal/talent` | ✓ | ✓✓– | ✓ | ~ | ~ | † |
| · Min plan | `/portal/talent/min-plan` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D5): `TalentMinPlanV2` + tynn page, rute ut av (legacy); TalentTracking-query og milepæl-parsing uendret; HjelpTips talentVurdering; datoformat fikk Oslo-tidssone (gotcha-regelen, legacy manglet den). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Mitt nivå | `/portal/talent/mitt-niva` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D5): `TalentMittNivaV2` (RadarProfil deg-mot-kohort m/ `kohortSnitt`-HjelpTips) + tynn page, rute ut av (legacy); kohort-query/`computeAverage` uendret. Tom kohort vises nå ærlig uten sammenlignings-serie (legacy tegnet 0-polygon). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Roadmap | `/portal/talent/roadmap` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D5): `TalentRoadmapV2` + tynn page, rute ut av (legacy); SeasonPlan-/TalentTracking-queries og sortering uendret; HjelpTips lFase, pre-beta-merke beholdt, ærlige tomtilstander m/ CTA til Planlegge. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Sammenligning | `/portal/talent/sammenligning` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D5): `TalentSammenligningV2` + tynn page, rute ut av (legacy), `actions.ts` (toggleAnonymiser) fulgte med uendret; samme URL-kontrakt (?q/?spiller/?periode, nå via router.push); RadarProfil to serier; SG-etiketter følger ordboken (Nærspill/Innspill). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |

> Merknad: Talent-delen er knyttet til «Elite Fase 2», som er bevisst utsatt. Disse adressene finnes, men er ikke prioritert nå.

### Aliaser og hjelpe-ruter (PlayerHQ)

Disse finnes i appen, men er enten eldre kortadresser som peker videre, eller små hjelpe-sider. Tatt med for å være komplett.

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stats (alt. → redirect) | `/portal/stats` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/portal/statistikk")` — ikke en egen skjerm.
| Analyse (alt. → redirect) | `/portal/analyse` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/portal/analysere")` — ikke en egen skjerm.
| Reach (oppsøk-verktøy) | `/portal/reach` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `PlayerHero`-header; resten er ren tom-tilstand (ingen datamodell for reach ennå).
| Agent-pipeline (AI internt) | `/portal/agent-pipeline` | ✓ | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul (Fase 0): BEKREFTET (tynn) — `PlayerHero`-header; signal/plan-action/agent-run-tabellene er hand-bygget Tailwind, bør sees nærmere på.
| Se annen spiller | `/portal/spiller/[spillerId]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D3): `SpillerDetaljV2` (PillTabs, SgKategorier, DataTabell m/mobilkort) — queries og snitt-utregninger uendret; HjelpTips på HCP/SG. Mål-progresjonsbar ærlig utelatt (loaderen gir alltid `currentValue: null` — baren var aldri synlig). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Venner (B39, ny 16. jul) | `/portal/venner` | ✓ | --- | ✓ | ✓ | ✓ | ✓ |
| · Venn-profil (økt-feed) | `/portal/venner/[spillerId]` | ✓ | --- | ✓ | ✓ | ✓ | ✓ |
| Øvelser (alt. → redirect) | `/portal/tren/ovelser` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET — `proxy.ts`/`workbenchRedirectForTrenPath` redirecter til `/portal/planlegge/workbench?tab=std`. NB: dokumentets tidligere notat om mål `/portal/drills` var feil/foreldet — rettet her.
| · Øvelse-detalj (alt. → redirect) | `/portal/tren/ovelser/[id]` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET — samme redirect-mekanisme som base-ruten over.

> **Rettet 2026-07-14:** `/portal/stats` og `/portal/analyse` er allerede rene redirects til
> `/portal/statistikk` og `/portal/analysere` (se «(alt. → redirect)»-merket over) —
> ingen rydding gjenstår. `/portal/tren/ovelser` er også en redirect, ikke en ekte
> overlappende side. **Rettet 16. jul (Fase 0):** faktisk mål er `/portal/planlegge/workbench?tab=std`
> via `proxy.ts`/`workbenchRedirectForTrenPath` — IKKE `/portal/drills` som stod her tidligere.

---

## Skjermene — AgencyOS

AgencyOS er coachens kontrolltårn: «hvem trenger MEG i dag?» Adressene begynner med `/admin`. (Het tidligere CoachHQ.)

### Oversikt (coachens hjem)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| **Cockpit (hjem)** ★ | `/admin/agencyos` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v13 scope + components (full)
| · Uka (kanban) | `/admin/agencyos/uka` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Complete v13 (golfdata scope + cards) |
| · Spillere (snarvei) | `/admin/agencyos/spillere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Økonomi | `/admin/agencyos/okonomi` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell`+`TilbakeLenke`. |
| · Live (Mission Control) | `/admin/agencyos/live` | ✓ | --- | ✓ | ✓ | – | ~ | v2 komponert (AgencyLiveV2), fortsatt visuelt skall med statisk seed-data (src/lib/agencyos/live-data.ts) — live-integrasjoner kobles senere |
| · Caddie (AI-chat) | `/admin/agencyos/caddie` | ✓ | ✓✓– | ✓ | ~ | – | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `CaddieChatV2`/`CaddieSubNavV2`. |
| · Caddie-aktivitet | `/admin/agencyos/caddie/aktivitet` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminCaddieAktivitetV2`. |
| Admin-rot (gml. hjem) | `/admin` | ✓ | --- | ✓ | ~ | ~ | ✓ | Reconciliation 16. jul: dette er en ren `redirect("/admin/agencyos")` — ikke en egen skjerm. |
| Daglig AI-brief | `/admin/brief` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Varsler (agent-forslag/signaler/meldinger) | `/admin/varsler` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Coaching-board | `/admin/board` | – | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul: ren `redirect("/admin/spillere?view=tavle")` — ikke en egen skjerm. |
| Oppfølging (alias → queue) | `/admin/oppfolging` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| Oppfølgingskø (kanban) | `/admin/queue` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| **Innboks** ★ | `/admin/innboks` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `TriageV2`. |
| E-post (post@) | `/admin/innboks-epost` | ✓ | --- | ✓ | ✓ | ✓ | ~ | v2 (InnboksEpostV2), ekte data via loadAlleEpost |
| Handlingssenter | `/admin/handlingssenter` | ✓ | --- | ✓ | ✓ | ✓ | ~ | v2 (AdminHandlingssenterV2), ekte OppgaveCache/Notion-sync — ærlig tom-tilstand |
| Meldinger (alt. → redirect) | `/admin/messages` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/innboks")` — ikke en egen skjerm.
| Kommunikasjon-hub | `/admin/kommunikasjon` | – | --- | ✓ | ~ | ~ | ~ | Reconciliation 16. jul: ren `permanentRedirect("/admin/innboks")` — ikke en egen skjerm. |
| Reach | `/admin/reach` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminReachV2` (KPI-kort/Kort/StatusPill/AvatarFoto + lokal SVG-linjegraf/feature-bar styrt av T-tokens), erstatter hand-Tailwind `ReachClient`. Samme aggregeringslogikk (User/Notification/TrainingPlanSession/CoachingSession/Round/Goal) uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |

### Min uke / Workspace

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Workspace-hub | `/admin/workspace` | ✓ | --- | ✓ | ~ | ✓ | ✓ | Real tasks via getTasksForUser (Notion fallback + cache) + scoped to coach. Data full. 
| · Tildelt meg | `/admin/workspace/tildelt-meg` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminTildeltMegV2` (Kort/TomTilstand/Icon), erstatter `AgPage`/`AgPageHead`. Samme aggregering (PlanAction/SessionRequest/TrainingPlan DRAFT/Notion-oppgaver) uendret. Design – → ✓, Mob/Desk/iPad –✓– → ✓✓–. |
| · Oppgaver | `/admin/workspace/oppgaver` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: dette er en ren `redirect("/admin/handlingssenter")` — raden var feilaktig scoret som en levende skjerm med egne haker. |
| · Prosjekter | `/admin/workspace/prosjekter` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Notion-sync | `/admin/workspace/notion` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |

### Stall (spillere, grupper, talent)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stall-oversikt | `/admin/stall` | – | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: ren `redirect("/admin/spillere")` — ikke en egen skjerm. |
| **Spillere (alle)** = SpillerTilstandKort-liste (v13 golfdata, bølge 1 2026-07-04) ★ | `/admin/spillere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | Complete v13 (SpillerTilstandKort + scope + cards)
| · Ny spiller | `/admin/spillere/ny` | ✓ | --- | ✓ | ✓ | ~ | ~ | 2026-07-14 dok-verifisering (funn under legacy-porterings-sjekk): `AdminNySpillerV2` — ekte `createSpiller`-server-action, router til ny spillers profil. Design rettet – → ✓, Flyt ~ → ✓ (skjema uten loader — Data-haken forblir ~, ikke relevant for et opprett-skjema) |
| **Spiller-detalj** ★ | `/admin/spillere/[id]` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-14 dok-verifisering: «100 % spillerinfo på én skjerm» levert — `SpillerDashboardV2` (7 faner: Oversikt/Utvikling/Plan/Helse/Turnering/Logg/Administrasjon), hero+KPI-strip m/ HjelpTips, én aggregert loader (`spiller-dashboard-data.ts`, 24 select-minimerte spørringer), kun ekte data + ærlige tomtilstander. Design rettet – → ✓ |
| · **Analyse (coach-dybde)** = golfdata elite-visning (v13, bølge 1 2026-07-04) ★ | `/admin/spillere/[id]/analyse` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Profil | `/admin/spillere/[id]/profil` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminSpillerProfilSideV2` (T-tokens; navnet er bevisst forskjellig fra den allerede v2-portede `AdminSpillerProfilV2` — Profil-fanen på `/admin/spillere/[id]`, en annen skjerm). Samme datagrunnlag uendret. Kjent, uendret begrensning: mål-fremdriftsring viser fast 50 % (Goal-modellen mangler et reelt fremdriftsfelt — ikke en regresjon). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · **Workbench (coach-i-spiller)** ★ | `/admin/spillere/[id]/workbench` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | 2026-07-12: månedsvisning (ekte grid) + drag-and-drop (blokk→dag, bibliotek→klokkeslett) |
| · Plan-detalj | `/admin/spillere/[id]/plan/[planId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † | 2026-07-14: drills-panel viser automatisk repslogging + bilde/video fra spillerens live-økter
| · Fremgang (trening vs SG) † | `/admin/spillere/[id]/fremgang` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminSpillerFremgangV2`. |
| · Tester | `/admin/spillere/[id]/tester` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminSpillerTesterV2`. |
| · Tildel test | `/admin/spillere/[id]/tildel-test` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: delt `AdminTildelTestV2` med `/admin/tester/tildel/[spillerId]` (samme skjerm, to inngangspunkt) — konsoliderer to divergerende hand-bygde modaler (denne hadde fabrikerte «HCP 4.8 · 12/36 tester gjennomført · A1»-tall) til ÉN kanon-versjon m/ ekte A–K-kategori og ekte TestAssignment-tall. Gammel `test-modul-v2/`-familie slettet. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| · Rediger | `/admin/spillere/[id]/rediger` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminSpillerRedigerV2` (T-tokens, 2-kol form + sticky lagre-bar), erstatter hand-Tailwind. Samme server actions (`lagreSpiller`/`slettSpiller`) uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Grupper | `/admin/grupper` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `GrupperV2`. |
| · Gruppe-detalj (+ VG-trinn filter/badge, 2026-07-07) | `/admin/grupper/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Gruppe-timeplan (faste/kommende/tidligere + dupliser) | `/admin/grupper/[id]/timeplan` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · **Gruppe-årsplan** (samme kalenderkjerne som /team-wang, koblet inn i gruppeplanleggingen) | `/admin/grupper/[id]/arsplan` | ✓ | --- | ✓ | ~ | ~ | † |
| · · Legg inn skoledata (lim-inn-import → SchoolScheduleEntry) | `/admin/grupper/[id]/arsplan/skoledata` | ✓ | --- | ✓ | ✓ | ~ | † |
| · **WANG Toppidrett — åpen treningsplan** (offentlig, ingen innlogging; nå med dagsvisning + samlinger + skole-/kompetansemål-lag) | `/team-wang` | ~ | -✓– | ✓ | ~ | ✓ | ✓ |
| · **GFGK Junior — åpen treningsplan** (offentlig, 4 gruppefaner: Mini/Basis/Utvikling/Elite) | `/gfgk-junior` | ~ | --- | ✓ | ~ | ✓ | † |
| Talent-hub | `/admin/talent` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: ren `redirect("/admin/talent/radar")` — ikke en egen skjerm. |
| · Discovery | `/admin/talent/discovery` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Radar | `/admin/talent/radar` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminTalentRadarV2`. |
| · Kohort | `/admin/talent/kohort` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Region | `/admin/talent/region` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Ressurser | `/admin/talent/ressurser` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Sammenligning | `/admin/talent/sammenligning` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ | Fase 2-dom 17. jul: FLIPPET – → ✓. `TalentSammenligning` er en dokumentert pixel-perfect port av godkjent fasit (`components-multi-compare.html`) — design-ferdig i ånd selv uten kanon-imports. Rekomponeres på v2-primitiver først når AgencyOS-halebølgen tar `AgPage`-flatene samlet. |
| · WAGR-benchmark | `/admin/talent/wagr-benchmark` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · WAGR-import | `/admin/talent/wagr-import` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminWagrImportV2` (Kort/Knapp/StatusPill/AvatarInit), erstatter `@/components/admin/agencyos/ui`-familien. Samme «Synk nå» (synkWagrNaa) uendret. Design – → ✓, Mob/Desk/iPad –✓– → ✓✓–. |

### Planlegge (lage planer FOR spillerne)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Plan-sentral (hub) | `/admin/planlegge` | ✓ | --- | ✓ | ~ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminPlanleggeV2`. Real prisma lookup for first player + redirect to workbench. Full auth. 
| Planer (alle) | `/admin/plans` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminPlansV2`. |
| · Ny plan (Plan-bygger) | `/admin/plans/new` | – | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: ren `redirect("/admin/planlegge")` — ikke en egen skjerm. |
| · Plan-detalj | `/admin/plans/[planId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Maler (alt. → redirect) | `/admin/plans/templates` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/plan-templates")` — ikke en egen skjerm.
| · Ny mal (alt. → redirect) | `/admin/plans/templates/ny` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/plan-templates/ny")` — ikke en egen skjerm.
| · Rediger mal (alt. → redirect) | `/admin/plans/templates/[id]/rediger` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect` til `/admin/plan-templates/[id]/rediger` — ikke en egen skjerm.
| · Mal-effektivitet (alt. → redirect) | `/admin/plans/templates/[id]/effectiveness` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect` til `/admin/plan-templates/[id]/effectiveness` — ikke en egen skjerm.
| Plan-maler (alt.) | `/admin/plan-templates` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminPlanMalerV2`. |
| · Plan-mal detalj | `/admin/plan-templates/[id]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team F1): `AdminPlanMalDetaljV2` erstatter template-detail — KpiFlis (m/ `malEffektivitet`-HjelpTips) + uke-grid (T.ax) + Pyramide mot anbefalt baseline + v2-øktdialog; actions (dupliser/arkiver/gjenåpne) uendret; rute ut av (legacy). Hardkodet «Completion-rate 87%»-plassholder fjernet (aldri oppdiktede tall). |
| · Ny plan-mal | `/admin/plan-templates/ny` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team F1): `AdminPlanMalNyV2` erstatter new-template-form — samme felter/validering (fordeling = 100 %), T.ax-glidere, `createTemplate` + redirect uendret; rute ut av (legacy). |
| · Rediger plan-mal | `/admin/plan-templates/[id]/rediger` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | v2-port 17. jul (Team F1): `AdminPlanMalRedigerV2` erstatter template-editor + volum-linje — 3-pane, økt-dialog, volum/uke-chips og masseredigering (uke-varighet, uke-kopi m/ konflikt-bekreftelse, logikk i `src/lib/plan-templates/`) beholdt eksakt; rute ut av (legacy). 17. jul (kvalitetshale): prompt/confirm/alert-flytene erstattet med v2-dialoger (VarighetUkeDialog, KopierUkeDialog m/ konflikt-visning + Overskriv, BekreftSlettOktDialog, inline lagre-status) — samme actions og logikk-rekkefølge.
| Drills (bibliotek) | `/admin/drills` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminDrillsV2` (Kort/Caps/Tittel/CTAPill/TomTilstand) erstatter `AgPage`/`AgPageHead`/`agBtnClass`. Beholder ekte søk (?q=)/kategorifilter (?kat=)/30-cap Prisma-spørring uendret — ren server-rendret URL-drevet nav, ingen klient-state. Detalj/rediger/ny/forslag-skjermene er IKKE portet ennå — mockupens ett-app tile+inspektør+composer-modell matcher ikke produksjonens separate sider + 27-felts admin-skjema (DrillEditForm), så disse porter separat mot faktisk struktur, ikke mockupen 1:1. |
| · Drill-detalj | `/admin/drills/[id]` | ✓ | --- | ✓ | ~ | ~ | ~ | v2-port 16. jul: `AdminDrillDetaljV2` (Kort/Caps/Tittel) erstatter lokale Card/Stat/Row/NgfRangePlot-hjelpere. Full feltdekning fra ExerciseDefinition beholdt uendret (nivå-range, csTarget, environment/utstyr/L-faser, prerequisites, tags, video). `DrillDetailActions` (Rediger/Dupliser/Slett) uendret. |
| · Rediger drill | `/admin/drills/[id]/rediger` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team D3): `AdminDrillRedigerV2` (alle ExerciseDefinition-felt, sticky lagre-bar) — skjema-state, `numOrNull`/csTarget-vasking og `updateDrill` portert 1:1 fra delt actions.ts; HjelpTips på akse/skillArea/miljø/L-fase/CS. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Teknisk plan | `/admin/teknisk-plan` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminTekniskPlanV2`. |
| · Per spiller | `/admin/teknisk-plan/[spillerId]` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul (tynn men ekte): `DetailShell` (ui/`Breadcrumb`) + `KPICard` (wrapper rundt golfdata `Eyebrow`). |
| **Turneringer** ★ | `/admin/tournaments` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-13: v2-redesign, hele legacy-mappen portert og slettet
| · Turnering-detalj | `/admin/tournaments/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-13: duplikat tilbake-lenke fjernet, nettleser-testet
| · Ny turnering | `/admin/tournaments/ny` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-13: v2 5-stegs-veiviser; fant+fikset "use server"-krasj ved innsending
| · Dubletter (rydd) | `/admin/tournaments/dubletter` | ✓ | ✓–– | ✓ | ~ | ✓ | ~ | 2026-07-13: v2, kun tom-tilstand nettleser-testet (0 dubletter i DB nå)
| Økter | `/admin/okter` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminOkterV2`. |
| Videoer | `/admin/videoer` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team F2): `AdminVideoerV2` (KpiFlis + v2-opplastingsskjema + Rad-liste), rute ut av (legacy); upload-/slette-logikk (`src/lib/storage/video.ts`, samme FormData/validering/canDelete) 100 % uendret. Meldt gap: dropzone finnes ikke som v2-primitiv (komponert lokalt av T-tokens). |
| Opptak | `/admin/recording` | ✓ | --- | ✓ | ~ | ~ | ~ | v2-port 16. jul: `AdminRecordingV2` (Kort/Caps/Tittel/KpiFlis). `RecordingControls` (ekte MediaRecorder/wake-lock/batteri-varsel) + `RecordingAnalyzeButton` urørt. Rettet en reell bug samtidig: varselbanneret sjekket `DEEPGRAM_API_KEY`, men transkribering (`src/lib/transcribe.ts`) bruker OpenAI Whisper og gates på `OPENAI_API_KEY` — feil variabel sjekket før. Copy endret fra "Deepgram" til nøytralt "talegjenkjenning" (Deepgram er aldri integrert — kjent navn/kode-avvik, ikke avklart med Anders). |

### Gjennomføre (daglig drift)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Daglig drift (hub) | `/admin/gjennomfore` | ✓ | --- | ✓ | ~ | ~ | ~ | v13 composed (golfdata Button/Card/Eyebrow + scope)
| · Økt-detalj | `/admin/gjennomfore/okter/[id]` | ✓ | ✓✓– | ✓ | ~ | ✓ | † |
| Kalender | `/admin/kalender` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v13 golfdata (TidsGrid/Periodeplan + scope)
| · Uke (redirect) | `/admin/kalender/uke` → `/admin/kalender` | ↪︎ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `redirect()` som bevarer `?uke=`-param — ikke en egen skjerm.
| · Måned | `/admin/kalender/maned` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `MonthCalendarV2` (T-tokens), erstatter Tailwind/shadcn `MonthCalendar`. Samme loader (`loadKalenderManed`) uendret. Design – → ✓, Flyt ~ → ✓. |
| · Ny hendelse (I3) | `/admin/kalender/hendelse/ny` | ✓ | --- | ✓ | ✓ | ✓ | ✓ | NY RAD 2026-07-14: I3-leveransen — `CalendarEvent` (ferie/stengt anlegg) blokkerer nå ekte booking-konflikt-sjekk; skjema leser `?start=` fra HurtigOpprett, egen v2-side |
| · Hendelse-detalj/slett (I3) | `/admin/kalender/hendelse/[id]` | ✓ | --- | ✓ | ✓ | ✓ | ✓ | NY RAD 2026-07-14: v2, ekte `CalendarEvent`-oppslag, slett kun for eier/ADMIN (håndhevet i UI + action) |
| Kalender (alt. → redirect) | `/admin/calendar` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/kalender")` — ikke en egen skjerm.
| · Måned (alt. → redirect) | `/admin/calendar/maned` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/kalender/maned")` — ikke en egen skjerm.
| **Bookinger** ★ | `/admin/bookinger` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v13 (KpiTile, Card, Tag + heatmap retokened)
| · Ny booking | `/admin/bookinger/ny` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v2 2026-07-12: portet ut av legacy, V2Shell + NyBookingWizard; inngang fra kalender + bookinger |
| Anlegg | `/admin/anlegg` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul (`AdminAnleggV2` + `LocationFormV2`). **Full administrasjon koblet 17. jul (B8a):** rediger/deaktiver lokasjon + opprett/rediger/deaktiver fasilitet (`FacilityFormV2` m/ type + beskrivelse, ikke lenger unwired). Soft delete via `active` — hard delete-actions FJERNET (bookinger/availability refererer radene; Location→Facility har cascade). Deaktiverte rader vises m/ StatusPill og kan reaktiveres; zod-validering + audit på alle actions. Kart-koordinater (mapX/mapY/latlong) bevisst utenfor — trenger egen kart-flate (meldt gap). Flyt/Funker ~ → ✓. UAT 17. jul (lokal dev, Playwright, coach-testbruker): full CRUD klikkverifisert — opprett anlegg → rediger navn → ny fasilitet → deaktiver (confirm-dialog) → «Deaktivert»-merke vist → reaktiver, samme for lokasjonen; mobil 390px stabler til én kolonne. Testdata (UAT-TEST-prefiks) slettet fra DB etterpå. |
| Tilgjengelighet | `/admin/availability` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminAvailabilityV2` + `AdminSlotFormV2`/`AdminAvailabilityWeekGridV2`/`AdminAvailabilityYearGanttV2` (T-tokens), erstatter `AgPage`-familien + hand-Tailwind. Alle tre visninger (Måned/Uke-drag/År) og samme actions (addSlot/updateSlot/deleteSlot) uendret — drag-interaksjonen er portet 1:1, ingen ny funksjon. Design – → ✓, Mob/Desk/iPad –✓– → ✓✓–. |
| Kapasitet | `/admin/kapasitet` | – | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: NYTT FUNN — ren `redirect("/admin/bookinger")`, ikke en egen skjerm (var scoret som levende før). |
| Tjenester/priser | `/admin/services` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminServicesV2` + `ServiceFormV2` (Kort/StatusPill/dialog), erstatter `@/components/admin/agencyos/ui`-familien. Fikset samtidig en reell UI-mangel: rediger/slett (`updateService`/`deleteService`) fantes alt i skjemaet men ble aldri kalt per rad — kun "+ Ny tjeneste" var koblet. Nå rendres "Endre" per rad — ingen ny funksjon, bare faktisk bruk av det som fantes. Design – → ✓, Mob/Desk/iPad –✓– → ✓✓–. |
| TrackMan (på tvers) | `/admin/trackman` | ✓ | --- | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: doc-notatet sa alt «v2 2026-07-14: portet ut av legacy, komponert av v2-biblioteket» — nettopp den typen stale hake endringsloggen advarte om. v2 2026-07-14: portet ut av legacy, komponert av v2-biblioteket (KpiFlis/Rad/FilterChips — samme mønster som Runder/Tester/Team, ingen 1:1-kit finnes for denne cross-player-tabellen); ekte søk+miljø-filter (ikke placeholder-toast); TilbakeLenke → /admin/gjennomfore |
| Live-økt: brief (coach) | `/admin/live/[sessionId]/brief` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminLiveBriefV2` (Kort/Caps/Tittel/AkseChip/TekstOmraade), matcher Claude Design agencyos-drift.jsx LiveBrief. Ekte data (økt+coachBrief); mockupens forrige-økt/SG-trend/ACWR-kort utelatt — ingen datakilde koblet. `sendBriefTilSpiller` uendret. |
| Live-økt: aktiv (coach) | `/admin/live/[sessionId]/active` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminLiveActiveV2` (Kort/KpiFlis/StatusPill/Ring/AkseChip) — ingen egen Claude Design-mockup finnes for denne, komponert fra samme v2-språk som porterte Brief/Summary. `LiveMelding` (m/ MicButton) uendret. |
| Live-økt: oppsummering (coach) | `/admin/live/[sessionId]/summary` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminLiveSummaryV2` (KpiFlis/Kort/StatusPill), matcher Claude Design agencyos-drift.jsx LiveSummary. Ekte drill-loggstatus + varighet fra completedSummary.liveSummary; mockupens «RPE» erstattet med Varighet (ingen RPE-datakilde finnes). `lagreCoachVurdering` uendret. |
| Coach-workbench (prototype) | `/admin/coach-workbench` | – | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: ren `redirect("/admin/planlegge")` — ikke en egen skjerm. |

### Innsikt (analyse på tvers)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Innsikt-hub | `/admin/analysere` | ~ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: NYTT FUNN — ren `redirect("/admin/analyse")`, ikke en egen skjerm. |
| · Compliance | `/admin/analysere/compliance` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET allerede v2-bygget — `AdminComplianceV2` inni `V2Shell`, ekte `loadComplianceData`-data. Falsk positiv, ingen kode-endring nødvendig.
| Stall-analyse | `/admin/analyse` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminAnalyseV2`. |
| Lag-snitt | `/admin/lag-snitt` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminLagSnittV2` (Kort/StatusPill/AKSE_NAVN+T.ax-akselinjer), erstatter `AgChip`/`AgPage`-familien. Samme datagrunnlag (COMPLETED TrainingPlanSession per gruppe) uendret. Design – → ✓, Mob/Desk/iPad ~✓– → ✓✓–. |
| · Fasiter (autosync) | `/admin/tester/benchmarks` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminBenchmarksV2` (Kort/Knapp/StatusPill/TilbakeLenke), erstatter hand-Tailwind-tabell. Samme server actions (approve/reject/runBenchmarkSyncNow) uendret. Design – → ✓. |
| Tester (på tvers) | `/admin/tester` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminTesterV2`. |
| · Foreslåtte tester | `/admin/tester/foreslatte` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 17. jul (Team F2): `AdminForeslatteTesterV2` (Kort/AkseChip/Knapp m/ confirm-vakt), rute ut av (legacy); godkjenn/avvis-actions flyttet byte-identisk (audit/notify/revalidatePath urørt). Toast erstattet med inline-feil (useToast er ikke montert i admin-treet utenfor legacy). |
| · Tildel test | `/admin/tester/tildel/[spillerId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: delt `AdminTildelTestV2` (se `/admin/spillere/[id]/tildel-test`-raden for full begrunnelse) — erstatter usstilt `TildelModal` (klassenavnene hadde ingen matchende CSS i det hele tatt). Design – → ✓. |
| Økt-forespørsler | `/admin/foresporsler` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminForesporslerV2` (Kort/AvatarInit/StatusPill/Knapp/TomTilstand), samme server actions (`markerSomPlanlagt`/`avslaaForespørsel`) uendret. Gammel `AgPage`/`AgAvatar`/`AgChip`/`AgTypeChip`-familie + død `forespørsel-actions.tsx` slettet. Design – → ✓, Mob/Desk/iPad –✓– → ✓✓–. |
| Godkjenninger | `/admin/godkjenninger` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | 2026-07-14 dok-verifisering: `AdminGodkjenningerV2` — én kø samler PlanAction (agent-forslag) + CaddieDraft (AI-utkast) + SessionRequest (økt-forespørsler) = **3 kilder** (e-postutkast beholder bevisst egen godkjenning i `/admin/innboks-epost` — ikke en 4. kilde i denne køen), gruppert per spiller, paginert, screenshot-verifisert 1440+390. Design rettet – → ✓, Mob/Desk/iPad –✓– → ✓✓– |
| · Godkjenning-detalj | `/admin/godkjenninger/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminGodkjenningDetaljV2` (Kort/Knapp/StatusPill/AvatarInit/InnsiktChip), samme server actions (`approveRequestDetailed`/`declineRequestDetailed`/`requestMoreInfo`) uendret. Byttet lokal `ACTION_LABEL`-duplikat ut med delt `handlingstypeLabel` (kanon-kilde). Gammel `approval-detail-client.tsx` slettet (dead code). Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Godkjenninger (alt. → redirect) | `/admin/approvals` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/godkjenninger")` — ikke en egen skjerm.
| · Approval-detalj (alt. → redirect) | `/admin/approvals/[id]` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect` til `/admin/godkjenninger/[id]` — ikke en egen skjerm.
| Rapporter | `/admin/reports` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminReportsV2`. |
| Runder (på tvers) | `/admin/runder` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Skader/sykdom (tilstander) | `/admin/tilstander` | – | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: NYTT FUNN — ren `redirect("/admin/gjennomfore")`, ikke en egen skjerm. |
| Finans (alt. → redirect) | `/admin/finance` | ✓ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/okonomi")` — som selv er en redirect til `/admin/agencyos/okonomi` (2-hopps kjede). Ikke en egen skjerm.
| **Økonomi (MRR/betalinger)** | `/admin/okonomi` | – | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul: NYTT FUNN — dette er nå selv en ren `redirect("/admin/agencyos/okonomi")`, ett hopp til fra den allerede dokumenterte `/admin/finance`-aliasen. Raden var feilaktig scoret som en levende skjerm. |
| Stats-oversikt | `/admin/stats/overview` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | v2-port 16. jul: `AdminStatsOverviewV2` + `AdminStatsRaskeHandlingerV2` (T-tokens; `Reveal`/`CountUp` beholdt uendret som generiske adferds-primitiver). Samme datagrunnlag (`hentAdminOverview`, `sjekkDbHelse`) uendret. La til `git-commit-horizontal` i v2-ikonregisteret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |
| Stats-moderering | `/admin/stats/moderering` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ | **Kø koblet 17. jul (D5, Anders' ja):** `ModerationCase`-modell + actions m/ zod-statusoverganger og audit; Godkjenn/Avvis/Bekreft sletting virker; GDPR = to-stegs anonymisering (navn/e-post/telefon/avatar/fødselsdato — bevisst IKKE `deletedAt`, som ville trigget hard-delete-cronen). Faner endret fra 5 stubber til Rapportert innhold · Slett-forespørsler · Historikk (matcher datamodellen); falsk batch-bar fjernet. Rest: rapporteringsflyt i appen (opprette saker) + `publicPlayerId`-avklaring — se AAPNE-SPORSMAAL. NB: `scripts/create-moderation-cases-2026-07-17.ts` må kjøres mot DIRECT_URL før deploy. |

### Admin (organisasjon og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Organisasjon-hub | `/admin/organisasjon` | ✓ | --- | ✓ | ✓ | – | ✓ | 2026-07-14: ren redirect til /admin/settings, bekreftet. Fjernet fra Mer-menyen (var duplikat-menypunkt til samme mål) — siden selv beholdt for gamle lenker. |
| Klubb-innstillinger | `/admin/klubb/innstillinger` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: portet til v2 (`AdminKlubbInnstillingerV2`), gjenbruker legacy actions.ts 1:1 (multi-club CRUD + org-settings singleton). `(legacy)` page.tsx + client fjernet (kolliderte på samme rute). |
| Integrasjoner | `/admin/integrasjoner` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: portet til v2, samme statuslogikk (Google Cal/Stripe/Notion/Anthropic/Resend/Supabase). `(legacy)` fjernet. |
| Innstillinger (Organisasjon/Team/Tilgang-faner) | `/admin/settings` | ✓ | –✓– | ✓ | ✓ | ✓ | † | 2026-07-16: portet til v2 (`AdminSettingsV2`), fikser den tidligere brukne /admin/organisasjon-redirecten. `(legacy)` fjernet. |
| · API | `/admin/settings/api` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: v2 (`AdminApiKeysV2`), gjenbruker legacy actions.ts. `(legacy)` page+modal-komponenter fjernet. |
| · Kalender | `/admin/settings/calendar` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: v2 (`AdminKalenderSynkV2`), gjenbruker legacy actions.ts. NB: `calendar-sync-section.tsx` beholdt i `(legacy)` — brukes fortsatt direkte av `/admin/availability`. |
| · Sikkerhet | `/admin/settings/security` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: v2 (`AdminSecurityV2`), gjenbruker `Setup2FA` uendret. `(legacy)` fjernet. |
| · Tilgang | `/admin/settings/tilgang` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: v2 (`AdminTilgangV2`), samme CBAC-matrise (read-only). `(legacy)` fjernet. |
| Team | `/admin/team` | ✓ | --- | ✓ | ~ | ~ | ~ |
| · Inviter | `/admin/team/inviter` | ✓ | --- | ✓ | ✓ | – | † | 2026-07-16: v2 (`AdminInviterCoachV2`), samme `inviterCoach`-action. `(legacy)` fjernet. |
| Audit-log | `/admin/audit-log` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † | 2026-07-15: portet til v2 (`AdminAuditLogV2`) — samme AuditLog-spørring/kind-status-utledning som legacy, KpiFlis+Rad-liste, ærlig tomtilstand. Lagt i Innsikt-mer-gruppen (var uten menylenke). `(legacy)/audit-log` slettet. |
| AI-agenter | `/admin/agents` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminAgenterV2`. |
| · Agent-detalj | `/admin/agents/[agentId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| E-postmaler | `/admin/email-templates` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `AdminEmailV2`. |
| · Rediger e-postmal | `/admin/email-templates/[id]/rediger` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: v2 (`AdminEmailTemplateEditorV2`), 2-pane editor m/ live preview, gjenbruker legacy actions.ts (lagre/send test/sett standard/arkiver). `(legacy)` page+editor-client fjernet. |
| Marketing (innholdskalender + post-kø) | `/admin/marketing` | ✓ | --- | ✓ | ✓ | ✓ | ~ | v2 (AdminMarketingV2), ekte MarketingPost-data. M1-grunnmur uten AI-generering/eksterne API-er |
| Profil | `/admin/profile` | ✓ | --- | ✓ | ✓ | ✓ | † | 2026-07-16: v2-komponert (`AdminProfilV2`), gjenbruker `oppdaterCoachProfil` + `uploadAvatar`. Droppet to ikke-fungerende legacy-plassholdere (galleri, «skjul profil»). `(legacy)` page+edit-form fjernet. |
| Hjelp | `/admin/hjelp` | ✓ | --- | ✓ | ✓ | – | † | 2026-07-16: v2 (`AdminHjelpV2`), statisk innhold portet verbatim + fikset en død lenke (`/admin/messages` → `/admin/innboks`). `(legacy)` fjernet. |
| Caddie (alt. adresse) | `/admin/caddie` | ↪︎ | --- | ↪︎ | ↪︎ | ↪︎ | ↪︎ | Reconciliation 16. jul (Fase 0): BEKREFTET ren `permanentRedirect("/admin/agencyos/caddie/dashbord")` — mål-siden er bekreftet v2-bygget (AdminCaddieDashbordV2/AdminCaddieProaktivV2). Ikke en egen skjerm.

> **2026-07-12 — lenke-revisjon:** alle interne knapper/lenker på 45 admin-sider maskinsjekket
> (271 unike mål). Fikset: «Book økt»/«Melding» i daglig brief (pekte på død /admin/booking/ny og
> alias /admin/messages), «Åpne full radar» i Talent (pekte på ubygget radar/[playerId]),
> «Følg opp» i Økonomi (redirect-loop til seg selv), 3 lenker til /admin/approvals-alias →
> /admin/godkjenninger. Fullt skjerm-/funksjonsinventar med duplikat-analyse: `docs/AGENCYOS-INVENTAR.md`.
>
> **2026-07-14 — struktur-opprydding:** de 14 spøkelses-radene fra 12. juli-revisjonen (ruter som
> aldri ble bygget: workspace/oppgaver/[id], talent/[playerId], talent/radar/[playerId], anlegg/[id],
> facilities(+[id]), locations, analytics, tester/[id], audit-log/[id], godkjenn-portal + 3 undersider)
> er slettet fra denne planen — bekreftet døde to ganger nå (12. og 14. juli), ingen grunn til å
> beholde dem som støy. «Organisasjon»-menypunktet fjernet fra AgencyOS Mer-panelet (dupliserte
> «Innstillinger», som allerede dekker organisasjon/team/tilgang som faner).

> **2026-07-12 — felles chrome:** ALLE legacy-sidene under `/admin/(legacy)/` rendres nå i
> V2Shell (samme rail + Mer-meny + full bredde som de porterte sidene) — gamle AdminShell
> (sidebar/topbar med scope-velger og gamle demo-navn) er koblet ut av layouten. Innholdet
> deres rekomponeres fortsatt bølgevis per `plans/legacy-portering-prioritet.md`.

> **Rettet 2026-07-14:** denne merknaden advarte tidligere om «dobbeltarbeid» på disse parene.
> Verifisert i kode: alle er allerede ryddet — den gamle adressen (`/admin/finance`,
> `/admin/calendar`(+`/maned`), `/admin/messages`, `/admin/approvals`(+`/[id]`),
> `/admin/plans/templates`(+undersider)) er en ren `permanentRedirect()` til den nye kanoniske
> adressen (`/admin/okonomi`→`/admin/agencyos/okonomi`, `/admin/kalender`, `/admin/innboks`,
> `/admin/godkjenninger`, `/admin/plan-templates`). Ingen kode-endring trengtes — bare denne
> rettelsen. «Veien til 100% — Bolk 4» kan lukkes for disse parene.

> **Reconciliation 16. jul — nye redirect-funn:** i tillegg til parene over ble disse oppdaget å
> også være rene redirects, feilaktig scoret som levende skjermer med egne haker: `/admin`→
> `/admin/agencyos`, `/admin/board`→`/admin/spillere?view=tavle`, `/admin/kommunikasjon`→
> `/admin/innboks`, `/admin/workspace/oppgaver`→`/admin/handlingssenter`, `/admin/stall`→
> `/admin/spillere`, `/admin/talent` (hub)→`/admin/talent/radar`, `/admin/plans/new`→
> `/admin/planlegge`, `/admin/kapasitet`→`/admin/bookinger`, `/admin/analysere`→`/admin/analyse`,
> `/admin/tilstander`→`/admin/gjennomfore`, `/admin/okonomi`→`/admin/agencyos/okonomi`,
> `/admin/coach-workbench`→`/admin/planlegge`. Alle rettet til `↪︎`-status i tabellene over.
>
> **Reconciliation 16. jul — kanon-presisering:** design-kanon har gått videre fra golfdata til
> **v2** (`src/components/v2/` + `src/components/admin/v2/*V2.tsx`) — golfdata er nå
> «overgangs-lag» per `.claude/rules/design-system-regel.md`. De fleste «Design: –»-flippene over
> er derfor til v2-komponerte skjermer, ikke golfdata. En egen bespoke lokal komponent-familie
> (`@/components/admin/agencyos/ui.tsx`: `AgPage`/`AgPageHead`/`AgChip` m.fl.) finnes også i
> kodebasen — den teller IKKE som kanon; skjermer bygget kun på den er ekte gap. Flere rader bruker
> kun `AdminHero` (header-only, selv en tynn wrapper rundt golfdata `Eyebrow`) med hand-bygget
> kropp — merket AMBIGUOUS i tabellene, ikke en ren ✓ eller gap.

---

## Skjermene — Auth + Forelder + Marketing + System

### Auth (innlogging og oppstart)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Logg inn ★ | `/auth/login` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `LoginV2` (v2 retning C), verifisert 1:1 mot `ui_kits/v2/auth-profil.jsx` — portert 10. juli, hake aldri oppdatert |
| Registrer ★ | `/auth/signup` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `SignupV2` (samme v2-idiomfamilie som LoginV2), portert 10. juli, hake aldri oppdatert |
| Glemt passord ★ | `/auth/forgot-password` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Tilbakestill passord | `/auth/reset-password` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Sjekk e-post | `/auth/check-email` | ✓ | --- | ✓ | ~ | ~ | ~ |
| BankID ★ | `/auth/bankid` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ | Design rettet – → ✓ 16. jul: `BankIDV2` (samme v2-idiomfamilie som LoginV2), portert 10. juli, hake aldri oppdatert |
| Onboarding (spiller, 7 steg) | `/auth/onboarding` | ✓ | ✓✓– | ~ | ✓ | ✓ | ✓ | v2-port 16. jul (Team B): de DELTE primitivfilene `wizard-chrome`/`wizard-fields` restylet in place til v2 T-tokens (samme eksporterte navn/props — 836-linjers wizard-logikk urørt: mindreårig-sjekk, resume, lagring per steg). Ny `VeiviserFlate`-eksport bevarer den eksisterende lyse flaten. Rettet også rad-tittel: koden har 7 steg, ikke 8. 2026-07-11: fikset lesPreferences-lekkasje (data ble slettet av enhver innstillings-lagring); steg-3-svar (fasiliteter/dager/mål) lagres nå og feeder FacilityPrefs+Goal+plan-engine.
| Onboarding (forelder) | `/auth/onboarding/forelder` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 16. jul (Team B): arver v2 fra de restylede delte primitivene (`wizard-chrome`/`wizard-fields`) + forelder-spesifikke justeringer i `forelder-wizard.tsx`/`page.tsx`. 4-stegs-logikken og `saveForelderOnboardingStep`/`completeForelderOnboarding` uendret. Design – → ✓, Mob/Desk/iPad --- → ✓✓–.
| Foreldresamtykke (token) | `/auth/guardian-consent/[token]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Samtykke venter | `/auth/samtykke-venter` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Logget ut | `/auth/logget-ut` | ✓ | ✓✓– | ✓ | ~ | – | ✓ | Design rettet – → ✓ 16. jul: rendrer `LoggetUtV2` (`components/portal/v2/`), portert tidligere — hake aldri oppdatert (samme mønster som Login/Signup/BankID over) |

### Forelder (foreldreportal)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forelder-hjem | `/forelder` | ✓ | ✓✓– | ✓ | ~ | – | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderV2` — hele seksjonens «Design: –» var systematisk stale, se merknad under tabellen. |
| Barn (oversikt) | `/forelder/barn` | ✓ | ✓✓– | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `V2Shell` + v2-primitiver. |
| · Barn-detalj | `/forelder/barn/[childId]` | ✓ | ✓✓– | ✓ | ~ | ✓ | ~ | v2-port 16. jul (Team B): `ForelderBarnDetaljV2` (Kort/Caps/KpiFlis/Pyramide/TomTilstand/AvatarFoto) — seksjonens siste gap lukket. Samme Prisma-lesing (`assertBarnTilhorerForelder` + queries) og `?tab=`-navigasjon uendret; HCP-fremdrift vises kun for HCP_TARGET-mål med kalkulerbar verdi (aldri falsk prosent). Design – → ✓, Data – → ✓. |
| Bookinger | `/forelder/bookinger` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderBookingerV2`. |
| Coach | `/forelder/coach` | ✓ | --- | ✓ | ~ | ✓ | † | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderCoachV2`. |
| Fakturaer | `/forelder/fakturaer` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderFakturaerV2`. |
| Økonomi | `/forelder/okonomi` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderOkonomiV2`. |
| Samtykke | `/forelder/samtykke` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderSamtykkeV2`. |
| Ukerapport | `/forelder/ukerapport` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderUkerapportV2`. |
| Innstillinger | `/forelder/innstillinger` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderInnstillingerV2`. |
| Varsler | `/forelder/varsler` | ✓ | --- | ✓ | ~ | ~ | ~ | Design rettet – → ✓ 16. jul: `V2Shell` + `ForelderVarslerV2`. |
| Inviter forelder (token) | `/inviter/forelder/[token]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 16. jul (Team B): side + `AksepterForm` v2-stylet (T-tokens), samme token-validering og `aksepterInvitasjon`-action uendret. Offentlig side uten shell. Design – → ✓, Mob/Desk/iPad --- → ✓✓–. |

> **Reconciliation 16. jul:** hele Forelder-seksjonens «Design: –»-merking var systematisk stale — 10 av 11 skjermer er allerede v2-komponert (`V2Shell` + dedikert `*V2`-komponent per rute), bare uten at haken noensinne ble flippet. Kun barn-detalj og invitasjons-aksept er ekte gap.

### Marketing (akgolf.no — offentlige sider)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forside | `/(marketing)` | ✓ | ✓✓– | ~ | ~ | – | ✓† | Design rettet – → ✓ 16. jul: `MarkedForsideV2`.
| Anlegg | `/(marketing)/anlegg` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedAnleggListeV2`.
| · Anlegg-detalj | `/(marketing)/anlegg/[slug]` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedAnleggDetaljV2`.
| Blogg | `/(marketing)/blogg` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Blogg-innlegg | `/(marketing)/blogg/[slug]` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Booking | `/(marketing)/booking` | ✓ | ✓✓– | ✓ | ~ | ~ | ✓ | v2-port 16. jul (Team C): `MarkedBookingV2` — ruten flyttet fra `(mlegacy)`-gruppen til `(marketing)/booking/` (samme URL). Lokasjon/coach/tjeneste-velger-logikken uendret. Design – → ✓.
| · Booking-tjeneste | `/(marketing)/booking/[slug]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 16. jul (Team C): `MarkedBookingTjenesteV2` — slot-gruppering, ?dato=-daglenker og bekreft-lenker (start&coach) bevart 1:1 fra gamle `SlotPicker`; kun presentasjonen er ny. Design – → ✓.
| · Booking bekreft | `/(marketing)/booking/[slug]/bekreft` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 16. jul (Team C): `MarkedBookingBekreftV2` — samme felter/validering/action-kall som gamle bekreft-form; `createBookingCheckout` (Stripe) flyttet BYTE-IDENTISK til ny rute. Design – → ✓.
| · Booking kvittering | `/(marketing)/booking/kvittering/[bookingId]` | ✓ | ✓✓– | ✓ | ~ | ~ | ~ | v2-port 16. jul (Team C): `MarkedBookingKvitteringV2` — pending-refresh-oppførselen (poll til betaling bekreftet) bevart. Design – → ✓.
| Cases | `/(marketing)/cases` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Coacher | `/(marketing)/coacher` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/(marketing)/coacher/[slug]` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedCoachDetaljV2`.
| Coaching | `/(marketing)/coaching` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedCoachingV2`.
| Junior | `/(marketing)/junior` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedJuniorV2`.
| Priser | `/(marketing)/priser` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedPriserV2`.
| PlayerHQ (salgsside) | `/(marketing)/playerhq` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedPlayerHQV2`.
| Om oss | `/(marketing)/om-oss` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Kontakt | `/(marketing)/kontakt` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Jobb | `/(marketing)/jobb` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedJobbV2`.
| FAQ | `/(marketing)/faq` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedFaqV2`.
| Suksess | `/(marketing)/suksess` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Treningsfilosofi | `/(marketing)/treningsfilosofi` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Turneringer | `/(marketing)/turneringer` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedTurneringerListeV2`.
| · Turnering-detalj | `/(marketing)/turneringer/[slug]` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedTurneringDetaljV2` (har også en villet redirect-gren for sammenslåtte turneringer, ikke dødt).
| Cookies | `/(marketing)/cookies` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedCookiesV2`.
| Personvern | `/(marketing)/personvern` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedPersonvernV2`.
| Vilkår | `/(marketing)/vilkar` | ✓ | --- | ✓ | ~ | ~ | ✓ | Design rettet – → ✓ 16. jul: `MarkedVilkarV2`.

> **Reconciliation 16. jul:** nesten hele Marketing-tabellen var stale «Design: –» — alt unntatt Booking-underflyten (4 rader over) er allerede v2-komponert. Booking-underflyten er det ene ekte gapet i seksjonen.

#### Marketing → Stats (det store offentlige stats-universet)

Dette er en stor offentlig statistikk-seksjon (PGA-tall, norske spillere, verktøy osv.). Den er funksjonell med ekte data. Gruppert kompakt her — alle adressene under begynner med `/(marketing)`. Status-nøkkel egen for denne tabellen: `✓` = v2-komponert · `◐` = hybrid (v2-skall `StatsLegacyShell` + eldre `stats/*`-innholdskomponenter, verken golfdata- eller v2-komponert innhold) · `–` = ikke individuelt verifisert denne runden.

| Område | Adresse(r) (under `/(marketing)/stats/...`) | Design | Adresse-ok | Data | Funker |
|---|---|---|---|---|---|
| Stats-forside + uka | `stats`, `stats/uka` | ✓ | ✓ | ~ | ✓ | Reconciliation 16. jul: `MarkedStatsHubV2`/`StatsUkaV2`. `stats/2026` ikke individuelt sjekket.
| · 2026 (ikke individuelt sjekket) | `stats/2026` | ✓ | ✓ | ~ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — wraps i `StatsLegacyShell` (@/components/marketing/v2/stats-ramme, v2-primitiver).
| Spillere | `stats/spillere` | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul: `StatsSpillereV2`. `spillere/[slug]` + årgang-radene ikke individuelt sjekket.
| · Spiller-detalj + årgang (ikke individuelt sjekket) | `stats/spillere/[slug]`, `stats/aargang`, `stats/aargang/[aar]` | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — alle tre wraps i `StatsLegacyShell`.
| Regioner | `stats/regions(/[slug])` | ◐ | ✓ | ✓ | ✓ | Reconciliation 16. jul: hybrid — `StatsLegacyShell` (v2-komponert skall) rundt eldre `@/components/stats/*`-widgets (norgeskart/heatmap/radar) via `STATS_LEGACY_VARS`-adapter. Verken ren gap eller ren ✓.
| · Baner + klubber (ikke individuelt sjekket) | `stats/baner(/[slug])`, `stats/klubber(/[slug])` | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — egne `StatsBanerV2`/`StatsBaneDetaljV2`/`StatsKlubberV2`/`StatsKlubbDetaljV2` (@/components/marketing/v2/), importerer Icon/Kort/Caps/KpiFlis/FilterChips/TomTilstand fra @/components/v2.
| Turneringer (offentlig) | `stats/turneringer(/[slug])(/statistikk)`, `stats/tour/[slug]` | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul: `StatsTurneringerV2`.
| Leaderboards | `stats/leaderboards` | ◐ | ✓ | ✓ | ✓ | Reconciliation 16. jul: hybrid — samme `StatsLegacyShell`-mønster som Regioner (`stats-leaderboard-card` m.fl., ikke v2/golfdata).
| · Norske + PGA (ikke individuelt sjekket) | `stats/norske`, `stats/pga` (+ drive-distance, fairway-pct, gir-pct, putt-explorer, putts-per-round, scoring-avg, sg-total, spillere, spillere/[dg_id]) | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — `stats/norske` bruker egen `StatsNorskeV2`; `stats/pga`+9 underruter wraps i `StatsLegacyShell`.
| Verktøy (kalkulatorer, ikke individuelt sjekket) | `stats/verktoy` (+ avstand, score-til-hcp, sg-estimator, tour-ekvivalent, whs-kalkulator) | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — alle 6 (hub+5 kalkulatorer) er egne `*V2`-komponenter fra @/components/marketing/v2/MarkedStatsVerktoyV2, importerer Icon/Kort/Caps/Knapp/Glider/RadarProfil fra @/components/v2.
| Sammenlign + SG-sammenlign (ikke individuelt sjekket) | `stats/sammenlign-spillere`, `stats/sg-sammenlign(/start)(/resultat/[id])` | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — alle fire wraps i `StatsLegacyShell`.
| Wrapped | `stats/wrapped/[slug]` | ◐ | ✓ | ✓ | ✓ | Reconciliation 16. jul: hybrid — samme `StatsLegacyShell`-mønster (`stats-wrapped-player`).
| · Blogg + søk + quiz + min progresjon (ikke individuelt sjekket) | `stats/blogg(/[slug])`, `stats/sok`, `stats/quiz`, `stats/min-progresjon` | ✓ | ✓ | ✓ | ✓ | Reconciliation 16. jul (Fase 0): BEKREFTET — blogg+søk+min-progresjon er egne `*V2`-komponenter (@/components/marketing/v2/), quiz wraps i `StatsLegacyShell`.

> **Reconciliation 16. jul:** stikkprøve fant at forside/uka/spillere/turneringer allerede er fullt v2-komponert (samme stale-mønster som resten av Marketing), mens regions/leaderboards/wrapped er i en genuint mellomliggende tilstand — v2-skall (`StatsLegacyShell`) rundt eldre, ikke-v2-komponert innhold (`◐`). Radene merket «ikke individuelt sjekket» er sannsynligvis samme mønster som sin nærmeste sjekkede nabo (delt `StatsLegacyShell`), men er IKKE bekreftet — verifiser før de flippes.

### System + interne sider (ikke for vanlige brukere)

| Skjerm | Adresse | Merknad |
|---|---|---|
| Offline-side | `/offline` | Vises uten nett. Funker. Ingen v10-design nødvendig. |
| 404 (ikke funnet) | (system) | Nytt v10-design bygget i forhåndsvisning i natt (`mx-404.png`). Ikke koblet til appens ekte «ikke funnet»-side ennå. |
| Onboard coach | `/onboard/coach` | 4-stegs coach-oppstart. Ingen v10-design. |
| Onboard klubb | `/onboard/klubb` | 5-stegs klubb-oppstart. Ingen v10-design. |
| Design-system (internt) | `/(internal)/design-system`, `/design-system-v2` | Utviklerverktøy. Ikke en brukerskjerm. |
| Demoer (internt) | `/(internal)/demos/*` (newplan, ny-okt, plan-bygger, trackman-import) | Test-/demo-sider. Ikke ekte skjermer. |
| Komponent-demoer (internt) | `/intern/komponenter/*`, `/demo`, `/hull-demo`, `/kalender-demo`, `/kalender-maaned-demo`, `/lokasjoner-demo`, `/sesjon-opptak-demo`, `/talent-*-demo` | Interne testflater for komponenter. Ikke ekte skjermer — vurder å rydde bort før lansering. |

> Disse interne/demo-adressene (rundt 29 stk) er IKKE ekte brukerskjermer og teller ikke som «mangler design». De er verktøy for utvikling, og flere bør fjernes før lansering.

---

## Tegnet, men ikke brukt ennå (drop-off)

Dette er det viktigste å passe på: ting designeren (Claude Design) har tegnet ferdig, men som ennå IKKE har funnet veien inn i appen som en ekte, koblet skjerm. Målet er at denne lista skal bli tom.

### A. Ferdige skjermbilder uten en oppdatert ekte skjerm

Designeren leverte 44 ferdige skjermbilder. De fleste er nå bygget i forhåndsvisning (pulje 1 + 2) eller har en motpart i appen. Disse har et bilde, men skjermen i appen er enten ikke pusset opp eller ikke koblet til ekte adresse ennå:

| Tegnet skjermbilde | Hører hjemme på | Status |
|---|---|---|
| `mx-404.png` (404-side) | Appens «ikke funnet»-side | Bygget i forhåndsvisning. Mangler kobling til ekte side. Enkel jobb — bør gjøres. |
| `pl-onboarding.png` | `/auth/onboarding` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-forelder.png` | `/portal/meg/foreldre` (eller foreldreportalen) | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-varsler.png` | `/portal/varsler` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-innstillinger.png` | `/portal/meg/innstillinger` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-trackman.png` | `/portal/mal/trackman` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-turnering.png` | `/portal/tren/turneringer` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `fo-barn.png` (forelder ser barn) | `/forelder/barn` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-caddie.png` (coach AI-chat) | `/admin/agencyos/caddie` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-compare.png` (sammenlign spillere) | `/admin/talent/sammenligning` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-compliance.png` | `/admin/analysere/compliance` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-drift.png` (drift/anlegg) | `/admin/anlegg` / drift-sidene | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-kalender.png` | `/admin/kalender` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-tester.png` | `/admin/tester` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `mk-forside.png` (marketing-forside) | `/(marketing)` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |

> De øvrige skjermbildene (f.eks. `pl-hjem`, `pl-sghub`, `pl-runder`, `pl-live-*`, `ag-dashboard`, `ag-stallen`, `ag-innboks`, `ag-spiller`, `ag-workbench`, `au-login` m.fl.) er allerede tatt i bruk eller bygget i forhåndsvisning i natt — de er IKKE drop-off.

### B. Ferdige design-komponenter (HTML) uten en plass i appen

Designeren leverte 47 ferdige komponent-design (HTML-biter). Mange er brukt i skjermene over. Disse er IKKE tydelig tatt i bruk ennå, og bør finne et hjem:

**PlayerHQ-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-voice-input.html` | Snakk-inn-tall (stemme-logging) | ✅ Bygget som `MicButton` (`src/components/shared/mic-button.tsx`): standalone + suffix-variant, Web Speech API norsk, 4 tilstander (idle/recording/transcribing/done). Integrert i live-meldingsfeltet (`/admin/live/[sessionId]/active`) — coach kan diktere meldinger. |
| `components-credit-indicator.html` | «Du har X klipp igjen»-måler | ✅ Bygget i Booking-hub (`/portal/booking`) som `CreditMeter` — segment-søyle med warn/danger-logikk + saldo/brukt/gjenstår. |
| `components-gap-to-drill.html` | «Din svakhet → denne øvelsen»-bro | ✅ Bygget i SG-Hub (`/portal/mal/sg-hub`) — kjede-strip DATA→DRILL→PLAN + drill-kort med lime-border + alternativer. Vises kun ved negative SG-data. |
| `components-insight-narrative.html` | AI-fortelling i ord om formen din | ✅ Bygget som `InsightNarrativeCard` (`src/components/portal/insight/insight-narrative-card.tsx`) — 7-del anatomi (strip · kicker · tittel · lede · pivots · rec-block · footnote), 5 strip-varianter (left-strip, ikke top). Koblet til (1) `/portal/analysere` fanen «Innsikt» via `InsightNarrativeData`-mapper i `analysere-data.ts`, og (2) `/portal/mal/sg-hub` via payload-mapper `mapInsightToCard` — topp 3 uløste SgInsights. |
| `components-season-timeline.html` | Tidslinje for hele sesongen | ✅ Bygget som `Aarsplan`-komponenten (`src/components/portal/aarsplan/aarsplan.tsx`) — Gantt-kart på `/portal/tren/aarsplan`. Portet fra fasit + skjerm-PNG. |
| `components-test-week.html` | «Testuke»-oppsett | ✅ Bygget som `TestUkeKommende` (spiller) + `TestUkeTrigger` (coach/admin). Aktiveres når TestWeek-modell kobles — returnerer null til da. Kobling: `/portal/tren/tester` + `/admin/tester`. |
| `components-course-heatmap.html` | Varmekart over banen | Hull-analyse (`/portal/analysere/hull`). Delvis. |
| `components-trackman-stability.html` | TrackMan stabilitet-graf | ✅ Bygget i `/portal/mal/trackman/[id]` som `StabilitetSeksjon`: varians-heatmap (6 param × N køller, 5-nivå fargeskala), stabilitets-score 1-10, callouts + bias/spredning SVG-minikart. |
| `components-trackman-trend.html` | TrackMan trend-graf | ✅ Bygget i `/portal/mal/trackman` som `TrackManTrendSeksjon` (KPI-strip avg. carry + klubbhastighet m/ sparklines, per-kølle carry-trender fra CLUB_AVG-signaler). |
| `components-sg-training-scatter.html` | SG vs trening punktsky | ✅ Bygget i `/portal/mal/sg-hub` som `SgTrainingScatter`: hero scatter (APP/innspill) + 4 mini-multiples per kategori, lineær regresjon, R², 95 %-konfidensband beregnet server-side fra TrainingLog + Round. Tom-tilstand når < 4 datapunkter. |

**AgencyOS-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-co-agent.html` | Coachens AI-medhjelper-panel | ✅ Bygget på `/admin/caddie` som `CoAgent` — utkast/godkjenning, agent-fleet-tabell, audit-log. Kobler til `loadCoAgent` Prisma-data. |
| `components-multi-compare.html` | Sammenlign flere spillere side om side | ✅ Bygget og koblet til `/admin/talent/sammenligning` — v10 full 4-panel-komponent (side-om-side · pyramide · kohort-rangering · region-fordeling) via `mapCompareData`-mapper. |
| `components-coach-mobile.html` | Coach-visning på mobil | Mobil-utgave av AgencyOS. Ikke bygget (AgencyOS er laget for data/desktop først). |
| `components-foreldre.html` | Foreldre-komponent for coach | ✅ Bygget som `ForeldreInfo` på `/portal/meg/foreldre` — viser spillerens egne foresatte fra Prisma parentRelation. Invite-modal + server actions. |
| `components-cmdk.html` | Hurtigsøk-boks (⌘K) | ✅ `GlobalSearchModal` (`src/components/admin/global-search-modal.tsx`) — mountet i AdminShell. Cmd+K, debounced API, 17 hurtig-handlinger, spillere/planer/bookinger/ruter, tastaturnav, focus-trap. |

**Coach-flyter (flyt-spesifikasjon, ny i leveranse 3. juni):** `Coach-flyter.html` (+ offline-bundle)
er en interaktiv prototype som viser hvordan coachen navigerer GJENNOM AgencyOS-skjermene
(flere flyter: innboks → godkjenn → plan o.l.). Ikke nye enkeltskjermer — men fasit for
«Flyt»-haken når AgencyOS-skjermene kobles. Bruk den som referanse for knapp-til-knapp-flyt.
Arkivert kilde: `public/design-handover/ak-golf-hq-design-system-2026-06-03.zip`.

### C. Hele «Elite»-pakken er tegnet, men ikke i bruk

Designeren har levert en egen elite-mappe (spredningsverktøy for utslag — «dispersion»):

- `elite/DispersionTool.html`, `elite/Utslag-spredning.html`, `elite/components-trackman-dispersion.html`.
- `Break-tabell.html` — putting green-reading-/break-tabell. **BYGGET 11. juni** → `/portal/trening/break-tabell`. Tre varianter: komplett matrise med heatmap, interaktiv break-kalkulator (inkl. opp/ned-fart), og hastighets-sammenligning.
- `Putte-verktoy.html` — putting-verktøy (**BYGGET 11. juni** → `/portal/trening/putte-laboratoriet`). Alle tre retninger (Greenen/Kjeden/Kontroll) portert med ekte fysikkberegninger fra putt-core.ts. Desktop-verifisert.

Dette hører hjemme i elite-/talent-delen (f.eks. shot-map/dispersjon: `/portal/statistikk/shot-map` eller talent-radar). **Bevisst utsatt** — «Elite Fase 2» er parkert. Det er greit at den ligger ubrukt nå, men den må ikke glemmes når Elite Fase 2 starter.

### D. UI-kits (byggeklosser, ikke skjermer)

Designeren leverte fem komplette «verktøykasser» (UI-kits) med farger, knapper og maler: booking, coachhq, marketing, playerhq og en felles. Disse er IKKE enkeltskjermer, men grunnlaget alt bygges på. De brukes løpende når skjermene pusses opp. Ingen handling i seg selv — men sjekk at fargene og knappene faktisk matcher det vi bygger.

---

## Mangler helt

Skjermer/funksjoner som planen vår (manifestene) sier vi trenger, men som ikke har noen ferdig design eller ikke kan bygges ennå:

1. **Shot-map / spredningsplott** (`/portal/statistikk/shot-map`) — designet finnes (elite-pakken), men databasen mangler punkt-koordinater for hvert slag. Kan ikke vise ekte data før datamodellen utvides. (Notert som data-blokkert.)
2. **Scorecard per runde, hull-for-hull** (`/portal/tren/turneringer/[id]/runde/[nr]`) — mangler i databasen; `Round` har bare totalscore, ikke hull-for-hull. Data-blokkert.
3. **Live turnerings-tracking** (`/portal/tren/turneringer/[id]/live`) — hele live-scoring-dataflyten mangler. Data-blokkert.
4. **Fellesmelding til turneringsdeltakere** — planen for AgencyOS sier vi skal kunne sende én melding til alle deltakerne i en turnering. Flyten er beskrevet, men ingen ferdig design er levert for selve «velg deltakere → skriv → send»-stegene. Trenger design.
5. **Spiller↔gruppe-veksler** (player-picker alltid øverst i AgencyOS) — beskrevet i planen som en ny fast del av toppmenyen, men ikke levert som design. Trenger design.
6. **Fokus-spiller-blokk med pin + AI-forslag** — delvis bygget på cockpit, men «pin manuelt»-mekanismen + AI-forslagsfeltet er ikke ferdig designet. Trenger design.
7. **Mobil-utgave av Workbench og AgencyOS** — designet er laget for stor skjerm (desktop). Mobil-varianter er ikke tegnet for disse to. Spørsmål til deg: trengs mobil her før lansering, eller holder desktop?

---

## Veien til 100% (rekkefølge)

Enkle bolker, i den rekkefølgen som gir minst risiko og raskest synlig fremgang.

**Bolk 1 — Gjør ferdig det som ble bygget i natt (ingen nytt design trengs).**
De 43 skjermene som er tegnet og bygget i forhåndsvisning (PlayerHQ-hjem, SG-Hub, Live-økt, Runder, Statistikk, Analyse, Meg, Abonnement, Drills, Tester, Årsplan, Booking, Varsler, Innstillinger, TrackMan, Turneringer, Logg ny runde, Forelder-side, Onboarding + AgencyOS cockpit, Spillere, Innboks, Spiller-detalj, Kalender, Bookinger, Tester, Turneringer, Caddie, Sammenlign, Compliance, Drift + auth-sider + marketing-forside): flytt dem fra forhåndsvisning til ekte adresse, koble på ekte data, og test. Mål: alle seks haker grønne.

**Bolk 2 — Plukk de enkle drop-off-skjermbildene (kan bygges selv).**
404-siden mangler fortsatt kobling. Andre tegnede skjermbilder som ennå ikke er bygget kobles på. Disse er tegnet og venter — bare å koble på.

**Bolk 3 — Ta i bruk de tegnede komponentene (kan bygges selv).**
Bygg inn stemme-logging, credit-måler, svakhet-til-drill-bro, sesong-tidslinje, TrackMan-grafene og spiller-sammenligning der de hører hjemme (se drop-off-liste B). Da blir flere skjermer komplette samtidig.

**Bolk 4 — Rydd dobbeltadressene.** LUKKET 2026-07-14. Verifisert i kode: alle de nevnte
parene (finance/okonomi, kalender/calendar, innboks/messages, plans-templates/plan-templates,
godkjenninger/approvals, agencyos-spillere/spillere, stats/statistikk, analyse/analysere,
drills/ovelser) har allerede én kanonisk adresse med ren redirect fra den gamle. Ingenting
gjensto å bygge — bare dokumentasjonen som trengte å bli rettet.

**Bolk 5 — Det som trenger nytt design fra deg (Anders).**
Disse kan vi ikke bygge riktig før du har godkjent et design:
- Fellesmelding til turneringsdeltakere (velg → skriv → send).
- Spiller↔gruppe-veksler øverst i AgencyOS.
- Fokus-spiller med manuell pin + AI-forslag.
- Avgjørelse: trengs mobil-utgave av Workbench/AgencyOS nå?

**Bolk 6 — Det som er data-blokkert (krever databasearbeid først).**
Shot-map/spredning, scorecard hull-for-hull, live turnerings-tracking. Her må vi bygge ut databasen og en måte å samle inn tallene på FØR skjermene kan vise ekte data. Ikke noe vi løser med design.

**Bolk 7 — Elite Fase 2 (bevisst utsatt).**
Hele talent-/elite-delen + den tegnede elite-spredningspakken tas når du sier fra. Designet ligger klart.

**Bolk 8 — Kjente funksjonelle hull avdekket under v2-portingen (16. jul), bevisst utsatt.**
Anders sa "restyle nå, fiks funksjon separat" da disse ble avdekket — v2-portene er ferdige, men
hullene under er reelle og uendret fra før portingen (ingen regresjon):
- ~~`/admin/anlegg`~~ **LUKKET 17. jul (B8a):** rediger/deaktiver lokasjon + full fasilitet-
  administrasjon koblet. «Slett» er bevisst erstattet med deaktivering (aldri kaskade-slett
  anleggsdata). Rest: kartplassering (mapX/mapY/latlong) trenger egen kart-flate — meldt gap.
- `/admin/availability`: kompleks drag-interaksjon + 3 visningsmoduser — restylet 1:1 mot v2-tokens,
  ingen ny funksjon lagt til.
- ~~`/admin/stats/moderering`~~ **LUKKET 17. jul (D5):** ModerationCase-kø koblet m/ audit og
  GDPR-anonymisering. Rest (se AAPNE-SPORSMAAL D5): rapporteringsflyt i appen + publicPlayerId-avklaring.

---

> Når en rad over endrer seg: oppdater de seks hakene her med en gang. Det er den eneste måten denne planen holder seg sann.

---

## Endringslogg

- 17. juli (UAT-økt, lokal dev + Playwright, testbrukerne Øyvind Rohjan/coachtest): **kritiske
  nyporterte flyter nettleser-verifisert ende-til-ende** i 390px + desktop. Booking-wizarden
  (ny → bekreft → bekreftet) full kjede m/ ekte credit-trekk (DB-verifisert 1:1, testdata ryddet,
  saldo tilbakeført) + «brukt opp»-tilstanden; test-detalj → gjennomfør-scorekortet; stikkprøver
  lastet uten reelle konsollfeil (onboarding, mål-bygger steg 1, putte-lab, Meg-innstillinger
  m/ varsler+sikkerhet). Talent-rutene gir bevisst 404 (FEATURES.TALENT av — D1-beslutningen).
  /admin/anlegg (PR #63-grenen) CRUD-verifisert: opprett → rediger → deaktiver → reaktiver for
  både lokasjon og fasilitet (confirm-dialoger OK, soft delete bekreftet i UI, testdata slettet).
  Haker flippet KUN for det som er bevist: booking-trioen + test-detalj. Merk (dev-miljø, ikke
  prod-funn): streng CSP i dev-modus blokkerer Turbopack-chunks/eval → konsollstøy + rød
  Next-badge lokalt.

- 17. juli (ettermiddag, Byggerunde G + B8a, PR #62 merget + PR #63): **Booking-underrutene — det
  siste skjerm-gapet — er lukket.** Alle 6 (`ny`, `ny/bekreft`, `[bookingId]`, `coach`, `anlegg`,
  `bekreftet`) portet til v2 med all credit-/slot-logikk urørt; fabrikkerte TIMELINE/MÅL/UTSTYR-
  plassholdere fjernet fra booking-detaljen; copy-fiks på bekreftet-siden; foreldreløse
  `booking.css` (25 hex) + `booking-hub.tsx` slettet. **B8a (PR #63):** full anleggs-administrasjon
  koblet — rediger/deaktiver lokasjon + fasiliteter, hard delete-actions fjernet (soft delete).
  Hex-baseline vasket (90 → 44 filer, `check-no-hex` helt ren). Beslutningsnotater D5–D7 lagt i
  `AAPNE-SPORSMAAL.md`; design-briefs for Bolk 5-trioen + mobil-faseplan i
  `docs/redesign-v2/design-briefs-bolk5-mobil.md`.

- 17. juli (nattløpet, Byggerunde B–F + Fase 2, PR #60 merget + PR #61): **Porteringsplanen er
  gjennomført — 63 skjermer portet til v2 på ~ett døgn.** PR #60 (merget av Anders): Byggerunde B
  (auth/onboarding/forelder, 4), C (marketing-booking, 4 — Stripe-action flyttet byte-identisk),
  D1 (Planlegge/Mål/AI, 8). PR #61: D2 (Trening/Tren, 8 — putte-lab 25 hex → 0), D3
  (Statistikk/SG-hub, 7 — fikset også fortegns-feil mot kategori-snitt; ny rad for
  `/portal/coach/sg-hub` som manglet i planen), D4a+D4b (hele Meg-seksjonen, 11), D5 (Talent, 4),
  Fase 2 (alle 9 AMBIGUOUS-rader løst: 3 flippet m/ begrunnelse, 6 portet — plan-templates-trioen
  m/ masseredigering bevart eksakt, videoer, foreslåtte tester, hull-analyse begge faner) + halerester
  (InviteFriendTrigger-modal restylet, `tester/ny/egen` portet, coach-equipment-wrapper flyttet).
  Delte tilskudd: 21 nye ikoner i v2-MAP, 12 nye HjelpTips-nøkler (stimp/break/make-%/prosess-score/
  kategori-snitt/kohort-snitt/smash factor/D-Plane/sikkerhetsscore/VAS/NGF-nivå/mal-effektivitet).
  Alt restyling only — Prisma/auth/server actions urørt; én skjerm per commit m/ doc-haker i samme
  commit; `tsc`/`eslint`/`check-no-hex` grønn per skjerm; Vercel-preview grønn gjennom hele løpet.
  **Gjenstående bekreftede gap: kun de 6 bevisst utsatte `/portal/booking/*`-underrutene** (Anders'
  tidligere beslutning) + Bolk 5 (beslutningspunkter), Bolk 6 (data-blokkert), Bolk 8 (funksjonelle
  hull). Meldte v2-kanon-gap fra løpet: dropzone-primitiv, illustrativt banekart for hull-analysen,
  EquipmentView (deles av spiller + coach-wrapper).

- 17. juli (Fase 0-avstemming del 2, branch `v2/fase0-avstemming`, PR #58): **re-audit etter
  PR #60-mergen** — 31 rader til flippet til ✓ mot kodens sannhet (maskinelt: V2Shell-sjekk +
  redirect-verifisering), inkludert redirect-bølgens 15 aliaser som denne PR-en selv innfører
  (id-bevarende videresendinger for `approvals/[id]` og `tren/ovelser/[id]`). NB: to økter har
  kjørt parallell avstemming (denne + PR #59) — tallene i denne fila er nå unionen av begge,
  verifisert mot koden 17. juli.

- 16. juli (Fase 0 + Byggerunde A pågår, branch `claude/skjermplan-fase0-reconciliation`, PR #59):
  **Fase 0-reconciliation** av de 94 uverifiserte «Design: –»-radene fullført (3 parallelle
  Explore-agenter, funn påført i egne commits). **Byggerunde A** (AgencyOS admin-batch) startet:
  `/admin/drills` + `/admin/drills/[id]` portet til v2 (`AdminDrillsV2`/`AdminDrillDetaljV2`),
  `/admin/recording` portet (`AdminRecordingV2` — fant og fikset en reell bug: varselbanneret
  sjekket `DEEPGRAM_API_KEY`, men transkriberingen bruker OpenAI Whisper og gates på
  `OPENAI_API_KEY`), `/admin/godkjenninger/[id]` portet (`AdminGodkjenningDetaljV2` — byttet
  lokal `ACTION_LABEL`-duplikat ut med delt `handlingstypeLabel`, slettet nå-død
  `approval-detail-client.tsx`). Byggerunde A fortsetter med resten av admin-batchen.

- 16. juli (AgencyOS Organisasjon & innstillinger, branch `agencyos/org-innstillinger`): **11 admin-skjermer
  portet fra `(legacy)` til v2** — `/admin/settings` (+ api/calendar/security/tilgang-faner/underruter),
  `/admin/klubb/innstillinger`, `/admin/integrasjoner`, `/admin/team/inviter`,
  `/admin/email-templates/[id]/rediger`, `/admin/profile`, `/admin/hjelp`. Fikser den tidligere brukne
  `/admin/organisasjon`-redirecten (pekte på en side som ikke fantes). Ren komposisjon fra
  `@/components/v2` mot eksisterende design (ingen ny mockup trengt — designgapet var allerede lukket,
  se `DEKNINGSKART.md` i Claude Design-prosjektet). All mutasjonslogikk (server actions) gjenbrukt
  uendret fra `(legacy)`-filene — kun presentasjonslaget er nytt. `(legacy)` page.tsx-filene for disse
  11 rutene er slettet (Next.js tillater ikke to sider på samme URL selv på tvers av route-groups);
  komponent-filer som ikke lenger hadde noen bruker (modaler, skjema-klienter) slettet i samme slag.
  `calendar-sync-section.tsx` i `(legacy)` er bevisst BEHOLDT — brukes fortsatt direkte av
  `/admin/availability`. La til 3 manglende Mer-meny-lenker (`klubb-innstillinger`, `integrasjoner`,
  `hjelp`) i `AGENCYOS_MER` (`src/components/v2/shell.tsx`). Fant og fikset en død lenke i
  hjelp-siden (`/admin/messages` → `/admin/innboks`). Verifisert: `tsc --noEmit` 0 feil, `eslint`
  0 feil, `npm run build` grønt (Turbopack), 473/473 tester grønne. Alle 11 nye ruter bekreftet
  307-redirect til `/auth/login` uinnlogget (ingen 500/404). Autentisert nettleser-klikkerunde ikke
  gjort denne økten — miljøets sandkasse blokkerte lesing av `SCREENTEST_PASSWORD` fra `.env.local`
  (en reell sikkerhetsgrense, ikke en feil); Funker-haken står derfor på † (bygd + ekte data +
  tsc/build grønt) heller enn ✓ til noen har klikket seg gjennom i nettleser.

- 16. juli (Byggerunde 2b — Gameplan omdøping + interaktiv modus C7, branch
  `claude/gameplan-interaktiv-modus`, siste post i skjerm-porting-roadmapen): **Baneguide
  omdøpt til Gameplan** (B30) — hele mappetreet flyttet (`src/app/portal/baneguide` →
  `.../gameplan`, `src/components/baneguide` → `.../gameplan`, `src/lib/baneguide` →
  `.../gameplan`, `BaneguideV2` → `GameplanV2`), all synlig tekst («Baneguide» → «Gameplan»)
  og alle interne lenker oppdatert. Gamle `/portal/baneguide/**`-URL-er lever videre som
  permanente redirects til `/portal/gameplan/**` (samme mønster som B43 `/kommando`) —
  ingen brutte bokmerker. Lagt til i navigasjon: ny snarveiskort «Gameplan» på
  `/portal/analysere` (funksjonen manglet reelt en meny-inngang fra før — kun nåbar via
  direkte URL). **Ny interaktiv hull-for-hull-modus (C7)**, fjerde fane «Planlegg» på
  hull-detaljen ved siden av Utslag/Innspill/Putt: dra sikte direkte på det ekte,
  interaktive Mapbox-banekartet (utvidet `CourseMap` med valgfri `interactive`/`onKlikk`/
  `sikte`/`soner`-prop, bakoverkompatibel — de 3 eksisterende read-only bruksstedene er
  urørt), mal «Bra å misse»/«Aldri hit»-soner, og se carry/igjen regnet LIVE fra ekte GPS
  (haversine — aldri tastet avstand). Andelen av spillerens FAKTISKE spredningsellipse
  (samme dispersion-motor som hull-detaljens σ/bias-KPI-er) som havner i en rød sone regnes
  live via en ny `ellipseGpsPunkter`-projeksjon (ikke design-prototypens fake faste ellipse
  på en statisk piksel-viewBox — en ekte forbedring utover selve mockupen). Ny additiv
  skjema: `GameplanHull` (spillerens sikte per hull) + `GameplanSone` (malte soner), begge
  scopet til `requirePortalUser().id` — kirurgisk `CREATE TABLE IF NOT EXISTS` via
  `scripts/create-gameplan-tables-2026-07-16.ts` (samme gotcha-mønster som `course_holes` —
  `migrate dev`/`db push` er blokkert i dette repoet). **Kunne ikke kjøres mot ekte DB i
  denne sandboxen** — scriptet må kjøres manuelt mot produksjon før funksjonen er skrivbar
  der. **Sidefunn under research:** det juridisk forbudte navnet «DECADE» (B30) hadde lekket
  inn i levende kildekode/seed-data — rettet i egen, separat PR (`claude/decade-navnefjerning`)
  fremfor å blande inn i denne omdøpingen.
- 16. juli (DECADE-navnefjerning, branch `claude/decade-navnefjerning`): B30 forbyr ordet
  «DECADE» overalt (rettighetsvern, `docs/juridisk/presisjonsstrategi-rettigheter.md`) —
  research for Byggerunde 2b (Gameplan) fant at ordet faktisk hadde lekket inn i LEVENDE
  kildekode og seed-data, ikke bare i foreldede dokumenter: `src/lib/domain/rules/pyramide.json`
  (en ekte domeneregel lest av appen ved kjøretid) og hele
  `prisma/seed-data/drills-expansion/decade-sg-range.json` (123 treff — dusinvis av drill-navn
  som `decade-shot-cone-mapping`, `18-hull-decade-strategi`). Rettet 253 forekomster på tvers av
  7 filer (case-bevarende DECADE/Decade/decade → PRESISJONSSTRATEGI/Presisjonsstrategi/
  presisjonsstrategi, verifisert med JSON.parse etter hver fil) + omdøpt selve filen til
  `presisjonsstrategi-sg-range.json` (trygt — `seed-drills-expansion.ts` leser mappen via
  `readdirSync`, ingen hardkodet filnavn-referanse noe sted). **Viktig for produksjon:**
  seed-scriptet upserter drills på `navn` (ikke en stabil id) — hvis
  `decade-*`-drillene allerede er seedet i den ekte databasen, vil en fremtidig kjøring av
  `seed-drills-expansion.ts` opprette NYE rader med de nye navnene i stedet for å omdøpe de
  eksisterende. En engangs SQL-omdøping av eksisterende rader (`UPDATE "ExerciseDefinition" SET
  name = ... WHERE name = '<gammelt-decade-navn>'`) bør kjøres mot den ekte databasen før neste
  seed-kjøring — kunne ikke gjøres her (sandbox har ingen live DB-tilkobling).
- 16. juli (Byggerunde 5, B39 Venner, branch `claude/venner-b39`): nytt sosialt lag i
  PlayerHQ, portet fra `ui_kits/playerhq/phq-venner.jsx` (fersk `DesignSync`-pull —
  design var faktisk ferdig til tross for at beslutningsloggens egen «status»-linje
  fortsatt sa «ikke designet ennå», samme dokumentasjons-etterslep som er sett flere
  ganger tidligere i denne økten). To nye skjermer: `/portal/venner` (venneliste +
  søk/legg-til + inn-/utgående forespørsler) og en NY, EGEN rute `/portal/venner/[spillerId]`
  for venn-profilen (hero + privacy-safe økt-feed). **Rute-kollisjon avklart med Anders
  først:** `/portal/spiller/[spillerId]` er allerede en ekte, koblet side (akademi-
  leaderboardet bruker den til å vise en spillers fulle Plan- og Coaching-historikk-fane
  for enhver innlogget portal-bruker) — å gjenbruke samme URL for venn-feeden ville
  kollidert med en fungerende funksjon. Anders valgte egen rute; `/portal/spiller/[spillerId]`
  er urørt. Bruker den eksisterende `Friendship`-modellen (fantes i skjema, men hadde
  ingen fungerende skrive-side i koden fra før — kun ett read-only forbruk i
  `utfordringer/ny`-veiviseren) — ingen skjemaendring, kun nye server actions
  (`src/lib/venner/actions.ts`: send/svar/fjern venneforespørsel, søk, privacy-safe
  feed-uttrekk). Feeden kombinerer `Round` (spilte runder) og fullførte `TrainingSessionV2`,
  projisert til KUN tittel/sted/dato — aldri SG-tall, `notes`, `completedSummary` eller
  `coachId` (B29: venner ser AT en økt skjedde, ikke fagdata). Ny opt-in-innstilling
  `preferences.venneOktSynlig` (default `false`, ALDRI default-på) lagt til i
  `InnstillingerV2` under «Varsler»-seksjonen (samme plassering designet selv viser:
  «Skru av i Meg › Innstillinger › Varsler») — venn-profilen viser en tydelig
  «deler ikke økter ennå»-tilstand i stedet for tom feed når venn ikke har skrudd på
  synlighet. Lagt til i navigasjon: `/portal/meg`-hub-kort + global søkekatalog.
- 16. juli (Byggerunde 3+4, første bolk — Coach-seksjonen/SG-Hub/Talent/Admin-org, branch
  `claude/bulk-sweep-verify`): fersk kodesjekk (ikke bare dokumentet) av ~32 skjermer merket
  «Design: –/~» i PlayerHQ Coach-seksjonen, SG-Hub-undersidene, AgencyOS Talent-undersidene og
  Admin/organisasjon-undersidene. **Samme mønster som byggerunde 1a igjen:** så godt som alle
  var allerede ferdig portet til v2/golfdata med ekte Prisma-data — kun dokumentasjonen hadde
  ikke fulgt med. Design-haken rettet ✓ for alle 32 (lista under). Fant og fikset 4 reelle,
  små avvik underveis (fabrikkerte tall/tags som IKKE fantes i noe underliggende felt — samme
  klasse feil som fake-CTA-opprydningen tidligere): `coach/[coachId]`-siden viste diktede
  «Snittsvar 4t» og «Rating 4,9/5» (ingen slik modell finnes — kun ekte «Felles økter»-tallet
  beholdt); `coach/notes/[noteId]` viste identiske statiske tags («TEK, SLAG, pitch-konsistens»)
  på hvert notat (ingen tags-felt på `CoachingSession` — fjernet); to sider hadde feil
  produkt-eyebrow («AgencyOS ·» i PlayerHQ-scopede skjermer) rettet til «PlayerHQ ·»
  (`coach/plans/[planId]/ny-okt`, `coach/ovelser/[id]/rediger`). Statisk `CERTIFICATIONS`-array
  og `settings/tilgang`s V1-read-only-scoping vurdert som bevisst, ikke fabrikkert — urørt.
  **Fortsatt advarsel til neste byggerunde:** gitt at dette er andre runde på rad der nesten
  alle «ikke startet»-rader viste seg allerede bygget, bør resten av de opplistede
  144-skjermer-i-dokumentet IKKE tas for god fisk — stikkprøve mot faktisk kode FØR bygging,
  hver gang. **Ikke rørt i denne bolken** (bevisst avgrenset til denne PR-en, tas i neste
  bolk av samme byggerunde): Meg-undersidene (varsler/personvern/sikkerhet/språk/eksport/2FA),
  Booking-undersidene, og hele Marketing/Stats v10-visuell-pass (8 grupperte rader). Rettet
  Design-hake ✓ på: `/portal/mal/sg-hub/[club]`, `/benchmark`, `/best-vs-now`, `/equipment`,
  `/yardage`, `/conditions`, `/strategy`, `/portal/coach/[coachId]`, `/coach/melding/[id]`,
  `/coach/melding/[id]/vedlegg`, `/coach/plans/[planId]`, `/coach/plans/[planId]/ny-okt`,
  `/coach/plans/perioder`, `/coach/ovelser`, `/coach/ovelser/[id]/rediger`, `/coach/videoer`,
  `/coach/notes`, `/coach/notes/[noteId]`, `/coach/ai`, `/admin/talent/discovery`,
  `/admin/talent/kohort`, `/admin/talent/region`, `/admin/talent/ressurser`,
  `/admin/talent/wagr-benchmark`, `/admin/klubb/innstillinger`, `/admin/integrasjoner`,
  `/admin/settings/api`, `/admin/settings/calendar`, `/admin/settings/security`,
  `/admin/settings/tilgang`, `/admin/team`, `/admin/team/inviter`.
- 16. juli (Workbench V4 / B40, delvis — Standard/Pro-modus + fasilitetskonsekvens,
  branch `claude/workbench-v4-standard-pro`): to av B40s fem deler levert i denne runden.
  **§3 Standard/Pro-modusbryter** (`wbMode` i `User.preferences`, samme mønster som
  eksisterende `sgHubMode`, default «pro» — ingen endring i opplevd dybde for noen før
  noen bevisst bytter): Standard-modus fjerner Årsplan-zoom fra Workbenchs zoom-velger
  (periodisering/makro-faser), skjuler mal-biblioteket i Bibliotek-fanen, og skjuler
  ACWR-belastningsstripa — alt Pro-gatet konsistent uansett hvilken vei brukeren prøver å
  nå dem (delt bryter, spillerens EGEN preferanse på `/portal/planlegge/workbench`,
  coachens egen på `/admin/spillere/[id]/workbench`). **§4 Fasilitetskonsekvens**:
  fant at backend (`adaptTemplateWeek`) allerede regner ut mykt avvik når en mal-økt
  krever et anlegg spilleren ikke har — men UI-et viste bare en generisk «lagt inn»-melding
  og lot avviket forsvinne stille. Rettet: de tre stedene en mal appliseres i
  `WorkbenchV2.tsx` viser nå de faktiske avviks-setningene. **Ikke levert i denne
  runden** (egne, større byggerunder): §2 blank-ark-galleri (år/periode/måned-nivå —
  ingen eksisterende UI å bygge videre på, ren nybygging), §6 belastningsraila som
  fullstendig egen Pro-flate (i dag Pro-gatet inline, ikke løftet til egen visning —
  ingen «Verktøy-velger»-mekanisme finnes ennå å henge den på), §7 gruppe-planlegging
  (blokk-for-blokk maler + individuell tilpasning krever nye Prisma-modeller/migrasjon —
  ikke forsøkt uten ekte databasetilgang til å verifisere).
- 16. juli (Byggerunde 1a-verifisering + reell temabug, branch `claude/reskin-auth-screens`):
  satt i gang som en «reskin-sweep» av 11 skjermer merket Design=«–» (auth-trioen, de 7
  PlayerHQ Meg-hub-skjermene, `/portal/tren/turneringer`). Fersk `DesignSync`-verifisering mot
  Claude Design-prosjektet + lesing av faktisk produksjonskode viste at **alle 11 allerede var
  1:1-portert til v2 retning C** (`LoginV2`/`SignupV2`/`BankIDV2` 10. juli, Meg-familien og
  Turneringer-forhåndsvisningen likeens) — hakene var bare aldri flippet etter porteringen.
  Ingen reskin-jobb var nødvendig; kun dokumentasjonsrettelse (se radene over). **Samtidig
  funnet en reell bug** mens dette ble verifisert: `V2Shell` sin lys/mørk-bryter styrer ETT
  delt `data-v2-tema`-cookie-attributt for BÅDE AgencyOS og PlayerHQ — en coach med mørk
  AgencyOS-preferanse ville fått PlayerHQ-skjermer i mørkt tema også, og en helt ny bruker
  (ingen cookie) fikk mørk PlayerHQ som DEFAULT. Dette bryter B28 (PlayerHQ er alltid lys,
  ingen bryter — låst 15. jul). Fikset i `src/components/v2/shell.tsx` (tema tvinges lys når
  `nav !== AGENCYOS_NAV`, bryteren skjules for spillere) + `src/app/layout.tsx` sitt
  pre-paint-script (unngår mørk-blits på første lasting av `/portal/*`). **Anbefaling videre:**
  gitt at 11 av 11 sjekkede rader var falske positiver, bør resten av MASTER-SKJERMPLAN.md sine
  «Design: –»-rader stikkprøve-verifiseres mot faktisk kode før flere byggerunder scopes rent
  fra denne tabellen.
- 16. juli (`/kommando` fjernet, B8 i `docs/AGENCYOS-INVENTAR.md`, branch
  `claude/kommando-route-cleanup`): det gamle personlige kommandosenteret
  (dashboard + `agenter`/`kalender`/`oppgaver`/`prosjekter`/`team`) er nå rene
  redirects til de ekte AgencyOS-flatene — `/admin/agenter` (chat),
  `/admin/kalender` (kalender), `/admin/agent-team` (dashboard/oppgaver/
  prosjekter/team). To funksjoner som IKKE hadde noen erstatning ble bygget inn
  før redirect for å unngå tap: oppgave-CRUD (`TaskList`) montert på
  `/admin/agent-team`, og oppgavefrister vises nå som «Oppgave-frist»-blokker i
  `/admin/kalender` (ikke dra-og-slipp-bare — de er ikke bookinger). Disse
  skjermene stod ikke i haker-tabellene over (interne `/kommando`-ruter var
  aldri en del av de 341 sporede skjermene) — ingen hake-oppdatering nødvendig,
  kun denne loggposten.
- 16. juli (WANG årskalender utvidet — dagsvisning + skole/samling/kompetansemål-lag, branch
  `feature/wang-aarsplan`): `/team-wang` hadde kun år/måned/uke og viste bare faste treningstider
  + AK-perioder. Lagt til: dagsvisning (fjerde visningsbryter, gjenbruker `TidsGrid` med 1
  kolonne); ny `SchoolScheduleEntry`-tabell (skolerute/timeplan/prøveplan per trinn, additiv
  `db execute`-migrasjon) med enkel lim-inn-importer; `GroupSchedule.kind` (SAMLING/
  HELDAGSSAMLING) — disse var usynlige før pga. et `recurring: "WEEKLY"`-filter i
  `hentGruppeKalenderData` som aldri hentet engangs-hendelser; `TrainingPeriod.competenceGoalIds`
  kobler periodene til eksisterende `CompetenceGoal`-rader (fantes fra før, men var aldri koblet
  til noe). Nytt klikk-detaljpanel viser dagens periode+kompetansemål, samlinger og full
  skole-liste. Samme kalenderkjerne koblet inn i AgencyOS som ny fane `/admin/grupper/[id]/arsplan`
  (+ `/arsplan/skoledata` for import) — dette var hovedmålet: årsplanen var kun en offentlig side,
  ikke tilgjengelig fra gruppeplanleggingen coachen faktisk bruker. VG-trinn-filter gjenbruker
  samme `?trinn=`-mønster som allerede fantes på `/admin/grupper/[id]`. Turneringsplan er lagt inn
  som en tydelig tom-tilstand — venter på turneringskalender-kobling. Seedet: to samlinger
  (WANG-Oslo vinterleir, ISO-uke 1 og 7 2027) med datoer beregnet eksakt (ikke gjettet), men
  markert «estimert/ikke bekreftet» i notatfeltet siden WANG sentralt eier de faktiske datoene.
  Bevisst IKKE seedet: 2026/2027 skolerute/prøveplan/full fag-timeplan — fjorårets konkrete datoer
  ville vært feil hvis de bare ble relabelt til nytt skoleår, og gjetting av skolens fremtidige
  timeplan er utenfor det som er forsvarlig å anta. Import-verktøyet står klart for når skolen
  publiserer. tsc + eslint + `next build` grønt. Browser-testet ende-til-ende på `/team-wang`
  (år/måned/uke/dag, trinn-filter, klikk-til-detaljpanel med ekte samling+periode-data) — admin-
  fanen kun bygg-verifisert (auth-gate testet, ikke innlogget browser-test).

- 15. juli (`/portal/ny-okt` koblet til ekte lagring, branch `claude/ny-okt-ekte-lagring`):
  wizarden hadde ingen backend — kun `useState` i nettleseren, «Lagre og start økt» gjorde
  bokstavelig talt ingenting. Fant at server actionen som trengs (`createAdHocSession`)
  allerede finnes og er produksjonstestet fra coach-siden (`add-session-wizard.tsx`) — koblet
  spiller-wizarden til den i stedet for å bygge noe nytt. De 4 hardkodede fiktive malene
  («arg-1», «ott-1» osv.) erstattet med ekte `ExerciseDefinition`-rader (931 øvelser i
  databasen, godt fordelt på alle kategorier) gruppert per skill-område. «Legg til drill»
  er nå en ekte nedtrekksmeny med reelle øvelser, ikke en fiktiv placeholder. Fjernet
  «Lagre som mal»-knappen (var identisk med «Lagre og start» og hadde ingen egen backend —
  samme klasse fake-CTA-bug som ble ryddet i I8 tidligere i natt).

- 15. juli (D1 avklart og utført, branch `claude/d1-skjul-demo-skjermer`): fersk revisjon av alle
  meny-punkt fant at 14. juli-listen (11+5 kandidater) stort sett var utdatert — Økonomi-fanen,
  Caddie-AI og «Ny spiller» var alt koblet til ekte data. Kun to skjermer hadde fortsatt et ekte
  demo-varsel i appen og ble fjernet fra navigasjonen (sidene finnes fortsatt, bare av-lenket):
  AgencyOS Live/Mission Control (`/admin/agencyos/live`) og PlayerHQ Talent (`/portal/talent` —
  Meg-fanen peker allerede til den nyere, ekte Utviklingsplan-siden; søkepaletten omdirigert dit).
  Samtidig lagt til: TrackMan (portet natt til 15. juli) manglet meny-lenke, lagt til under
  AgencyOS «Mer» → Innsikt. Se `docs/AAPNE-SPORSMAAL.md` C11 for full begrunnelse.

- 15. juli (veiviser-porting, femte bølge): **Coach · Nytt spørsmål** (`/portal/coach/sporsmal/ny`)
  portet til v2 fra Claude Design-kilden (`ui_kits/playerhq/phq-wizards.jsx` → `SporsmalNyView`,
  delt Veiviser-skall) — spilleren velger tema, skriver tittel + spørsmål, ekte
  `Question`-modell uendret. «Still spørsmål»-CTA-en i `CoachMeldingerV2` pekte allerede hit, så
  ingen dead-button-fiks trengtes der. Slettet legacy-duplikatet
  (`(legacy)/coach/sporsmal/ny`) — rutekollisjon ellers — og fjernet den nå orphanede
  `stillSporsmal`-funksjonen fra den delte `(legacy)/coach/sporsmal/actions.ts`
  (`svarPaSporsmal` der er fortsatt i bruk av `[id]`-siden, urørt). **Undersøkt og avvist som
  utrygge** (design-kilden matcher ikke dagens ekte funksjon 1:1, meldes som gap for Anders):
  `coach/ovelser/ny` (design = spillerens treningsønske-flyt, kode = coachens DrillEditor —
  ulik aktør/rolle), `tren/turneringer/ny` (design = meld på eksisterende turnering, kode =
  manuelt legg til turnering utenfor katalog — ulik handling), `tren/tester/ny` (design mangler
  resultat-registrering som den ekte 4-stegs wizarden har), `tren/tester/ny/egen` og
  `utfordringer/ny` (design er 2 steg, ekte kode er 5–6 steg med funksjonalitet — venne-invitasjon,
  NGF-nivå-mål — som ville gått tapt), `ny-okt` (verifisert «no backend yet» — kun klient-state,
  ingen ekte Prisma-lagring; å porte ville vært et nytt feature-bygg, ikke en visuell port),
  `coach/plans/[planId]/ny-okt` (deler `AddSessionWizard` med AgencyOS + foreldre-hub selv
  fortsatt legacy), `booking/ny` (578 linjer + `/bekreft`-underrute + ekte
  credits/tilgjengelighets-logikk — for stort for denne bølgen). Verifisert: `tsc --noEmit`,
  `eslint --quiet src`, full `npm run build` grønt.

- 14. juli (siste mock-side i foreldreportalen fjernet): `/forelder/coach` hadde en hardkodet
  `DATA`-konstant («coach-dialog kommer Q3 2026») — en toveis forelder↔coach-dialog finnes ikke i
  datamodellen (`CoachingSession` er spiller↔coach). Erstattet med ekte oppslag: barnets coach
  (fra kommende/siste booking), siste faktiske melding fra coachen (`Notification` type=«melding»,
  samme kilde som `coachNote` i `hentForelderUkerapport`), og kontakt-CTA. Ærlig tom-tilstand når
  ingen barn er koblet eller ingen coach er tildelt ennå — ingen fabrikerte tall eller
  lanseringsdatoer. Data-haken satt til ✓.

- 14. juli (AgencyOS v2-porting, branch `claude/port-trackman-v2`): **TrackMan (på tvers)
  portet til v2.** `/admin/trackman` flyttet ut av `(legacy)`-gruppen til en egen v2preview-rute
  (`V2Shell` + ny `AdminTrackmanV2`-komponent). Ingen 1:1 Claude Design-kit finnes for denne
  cross-player-tabellen — kit-filen `ui_kits/agencyos/trackman-app.jsx` viste seg å være en
  *per-spiller* sesjon-dybde-visning (dispersion/trajectory-plott for én spiller), en annen skjerm
  enn coachens tvers-av-stallen-oversikt. Komponert utelukkende av v2-biblioteket, samme
  «dekket via system»-mønster som Runder/Tester/Team-portene. Datakontrakt bevart 1:1 (ekte
  `TrackManSession`-spørring, KPI-strip, spiller/HCP/dato/slag/kilde/miljø), men søk og
  miljø-filter er nå ekte klientfilter (var placeholder-toast i legacy). Verifisert: fant at
  commits som hevdet å ha portet både TrackMan og Risiko til v2 (`AgencyOS Bølge 3.7`/`3.17`)
  kun eksisterte på en aldri-merget branch (`origin/claude/mobile-desktop-improvements-90kanx`)
  — ikke i historikken til main. `/admin/risiko` er fortsatt legacy og gjenstår som egen jobb.

- 14. juli (ren dokument-verifisering — 7 punkter fra intern oppgavelogg sjekket mot faktisk
  kode, ingen kildekode endret): **Rettet (haker var utdatert i forhold til levert kode):**
  Workbench (planlegging) `/portal/planlegge/workbench` Design – → ✓ (samme delte
  `WorkbenchV2` som coach-siden — Del 8c + WB1–WB5 alle bekreftet levert og koblet til
  server actions); Spiller-detalj `/admin/spillere/[id]` Design – → ✓ («100 % spillerinfo
  på én skjerm» — `SpillerDashboardV2`, 7 faner, ekte data); Godkjenninger
  `/admin/godkjenninger` Design – → ✓ og Mob –✓– → ✓✓– (`AdminGodkjenningerV2`, gruppert
  per spiller, screenshot-verifisert 1440+390); Booking-hub `/portal/booking` Design – → ✓
  (`BookingV2`, ekte slot-vindu); Ny spiller `/admin/spillere/ny` Design – → ✓ og Flyt ~ → ✓
  (`AdminNySpillerV2`, ekte `createSpiller`-action) — funnet under legacy-porterings-sjekken,
  ikke i den opprinnelige listen. **Nye rader (fantes ikke i planen):**
  `/admin/kalender/hendelse/ny` og `/admin/kalender/hendelse/[id]` — I3-leveransen
  (`CalendarEvent` blokkerer ekte bookingkonflikt ved ferie/stengt anlegg), begge v2, ekte
  data. **Presisert, ikke overvurdert:** «Godkjenninger — fire kilder» stemmer ikke helt —
  køen slår faktisk sammen **3** kilder (PlanAction/agent-forslag, CaddieDraft/AI-utkast,
  SessionRequest/økt-forespørsler); e-postutkast er BEVISST holdt utenfor og godkjennes
  fortsatt separat i `/admin/innboks-epost` (se `docs/VEIKART-BESTE-VERKTOY.md`, A1-leveransen).
  «Booking-flyt komplett i v2» stemmer IKKE — kun booking-HUB-en (`/portal/booking`) er
  v2-komponert; alle undersider (`ny`, `[bookingId]`, `coach/[coachId]`, `anlegg/[anleggId]`,
  `bekreftet`) ligger fortsatt i `src/app/portal/(legacy)/booking/` med gammel design — raden
  var allerede korrekt (Design «–») og er ikke endret. «Legacy-portering av prioriterte
  skjermer» er heller IKKE fullført utover Turneringer (allerede ✓ i denne planen fra 13. juli)
  og den ovennevnte Ny spiller-siden — resten av P1-lista i `plans/legacy-portering-prioritet.md`
  (Drills-bibliotek, Live-økt coach-flyt, `[id]/rediger`, `[id]/tildel-test`,
  Plan-mal-redigering) ligger fortsatt urørt i `src/app/admin/(legacy)/`; radene der er
  allerede korrekte og er ikke endret. **Ikke en radendring (infrastruktur, ikke en skjerm):**
  Tema-grunnmuren (DS1+DS2 — dobbel lys/mørk-tokenskala + sol/måne-veksler i railen) er
  bekreftet i `globals.css`/`V2Shell`, men den er delt chrome under ALLE v2-skjermer og har
  ingen egen rad å rette. I0 (tilgangsskille) og I8 lag 1 (mekanisk lenke-sveip) er bekreftet
  levert i git-historikken (`git log` — `feat(I3): kalenderhendelser`,
  `chore(I8 lag 1): mekanisk lenke-sveip`, `test(I0): negativtest`) men er også app-brede
  fikser uten egen skjerm-rad her; se `docs/VEIKART-BESTE-VERKTOY.md` og `docs/STATUS-NÅ.md`
  for detaljene. Kilder brukt til denne verifiseringen: faktisk kildekode (page.tsx +
  komponenter), `git log`, `docs/VEIKART-BESTE-VERKTOY.md` (status-logg), og
  `plans/legacy-portering-prioritet.md`. tsc/build ikke kjørt (ren dokument-endring).

- 14. juli (struktur og navnekonsistens, branch `claude/struktur-navn-opprydding`): **Fiks:**
  Innstillinger-siden (`/portal/meg/innstillinger`) manglet egen inngangsknapp fra Meg-fanen —
  spilleren kom kun til to av dens undersider (Varsler, Personvern), aldri huben selv. Lagt til
  i `konto`-arrayet i `MegV2.tsx`. **Fjernet:** «Organisasjon»-menypunktet i AgencyOS Mer-panelet
  (`shell.tsx`) — pekte på en ren redirect-side (`/admin/organisasjon` → `/admin/settings`) som
  allerede har sitt eget, riktige menypunkt («Innstillinger»); to lenker til samme mål var bare
  forvirrende. **Dokumentasjon rettet, ingen kode-endring:** en grundig kode-verifisering viste at
  «dobbeltadressene» denne planen lenge har advart om (finance/okonomi, kalender/calendar,
  innboks/messages, godkjenninger/approvals, plans-templates/plan-templates, og på spillersiden
  stats/statistikk, analyse/analysere, drills/ovelser) ALLEREDE er ryddet i kode — den gamle
  adressen er en ren `permanentRedirect()`. «Bolk 4» i «Veien til 100%» lukket. De 14
  spøkelses-radene fra 12. juli-revisjonen slettet (bekreftet døde to ganger), pluss én ny
  (`/portal/statistikk/sammenlign`, aldri bygget) lagt til og merket. **Navnekonsistens-sjekk:**
  grep for «CoachHQ» og «kort spill» i synlig UI-tekst — se resultat i samme commit.

- 14. juli (komplett prosjekt-revjuw og opprydding, branch `claude/prosjekt-opprydding`):
  **Sikkerhet:** `ai-plan`-ruta (enkelt + batch) manglet coach-tilgang-sjekk — enhver coach kunne
  trigge AI-plangenerering (og kostnaden) for en spiller de ikke eier; fikset med
  `harCoachTilgangTilSpiller`. 21 dashboard-/analyse-funksjoner i `portal/actions.ts` og
  `portal/analysere/actions.ts` fikk samme forsvars-i-dybden-sjekk (`assertCanViewPlayerData`) som
  `loadLiveSession`-fiksen fra tidligere — latent, ikke i dag utnyttbart, men samme feilklasse.
  **Dødt kode:** ~500 KB fjernet (35 av 39 filer i `workbench-hybrid/`, `pulse-dot.tsx`, duplikat
  `ui/empty-state.tsx`), 2 ubrukte npm-pakker, 1 stale script, 17 fullførte engangs-migrasjoner
  arkivert til `scripts/arkiv/`. `PyramidAreaSchema`-duplikat konsolidert til én kilde.
  **Navigasjon:** 10 ferdigbygde men usynlige PlayerHQ-skjermer koblet inn (Utviklingsplan → Meg-hub
  for å ikke bryte «Plan = ett trykkpunkt»-regelen, Helse/Utstyrsbag/Foresatte → Meg, Fysisk-kort →
  Gjør, Hull-analyse/DataGolf-sammenligning → Analysere-fanen, 3 preferanse-rader → Innstillinger).
  **Docs:** 4 punkt-i-tid-rapporter arkivert (`docs/arkiv/README.md` oppdatert), 4 manglende
  AgencyOS-rader lagt til her (Live, E-post post@, Handlingssenter, Marketing), teknisk-plan- og
  admin/profile-hakene oppdatert mot faktisk kode. **Korrigerte funn (ikke overdrevet):**
  `src/lib/ai/memory.ts`s skrivefunksjon kalles aldri i produksjonskode (kun lesing) — risikoen
  var mindre enn først antatt. `src/lib/intelligence/` er en hel ubrukt undermappe (ny oppdagelse,
  ikke slettet — egen oppfølging). `fmtSg` er duplisert 6+ steder, ikke 2 — for stort til denne
  runden, egen oppfølging anbefalt. tsc + build grønt gjennom hele runden.

- 13. juli (turneringer → v2-redesign): alle 4 turneringsskjermer
  (`/admin/tournaments`, `[id]`, `ny`, `dubletter`) + 6 delte underkomponenter
  (tournament-form, result-form, unmerge-banner, fellesmelding-panel,
  merge-liste, 5-stegs-veiviser) portert fra `.golfdata-scope`-låst legacy til
  v2-tokens — hele `src/app/admin/(legacy)/tournaments/` slettet. Fant og
  fikset ekte krasj underveis: `ny_turnering_schema` og
  `exportTournamentsInputSchema` var eksportert som ikke-async objekter fra
  en `"use server"`-fil (Next.js 16 forbyr dette) — veiviserens innsending
  krasjet 100 % av tidene før fiksen. Fant og fikset display-bug: wizard-
  opprettede turneringer dumpet rå JSON-metadata på skjermen (ingen kode
  tolket `createdVia:"wizard"`-blob-en) — vises nå som lesbare chips
  (prioritet/runder/tee/HCP/cut/kapasitet/pris/frist). Fjernet duplikat
  tilbake-lenke på detaljsiden. Verifisert i nettleser: full veiviser-flyt
  (5 steg → ekte DB-post → detaljside), lys+mørk × mobil+desktop på liste/
  detalj/veiviser; dubletter kun tom-tilstand testet (0 kandidater i DB nå).
  tsc+build grønt. Testturneringen ryddet fra DB etter verifisering.

- 13. juli (feilretts-runde fra Anders' mobil-skjermbilder + full feilklasse-gjennomgang, 10 steg):
  **Rotårsak funnet og fikset — live-økter fikk ALDRI drills:** plan→live-speilingen
  (`upsertV2ForPlanSession`) kopierte aldri SessionDrill → TrainingDrillV2 (`trainingDrillV2.create`
  fantes ikke i kodebasen). Nå speiles drillene (replace, kun PLANNED-økter), og backfill-script
  ryddet basen (+4 foreldreløse speil slettet). **Status-synk begge veier:** «Gjort/Hopp over»
  traff 0 rader pga. feil `generertFra`-streng; live-fullføring skrev aldri tilbake til plan-økta
  (etterlevelsen lyver ikke lenger). **Alle mutasjonsflater synker nå V2:** /admin/plans (flytt/
  avlys/oppdater/slett/opprett + plan-sletting), AI-executor og legacy planlegge. **«Ny økt» =
  «Rediger økt» (Anders' krav):** ett felles økt-ark med L-fase, miljø og full drill-editor i begge;
  delt drill-skrivehelper for create+update (spiller OG coach); biblioteks-økter tar med drillsJson-
  innholdet inn i arket. **Gjør-flatens live-avspiller:** mørk forest-flate (var lys shadcn), én
  tittel, ærlig tom-tilstand ved 0 drills, timer tikker fra start. **Mobil:** bunn-nav-klaring
  safe-area-bevisst i V2Shell (+3 headere utenfor shellen fikk topp-klaring), coldstart-malkort i
  1 kolonne uten navn-kutt. **Lastet-men-ikke-koblet:** gruppetider vises nå i Workbench-uka;
  døde dirBDays/kanbanCols fjernet fra loaderen. Verifisert: tsc+build grønt, drill-speiling
  DB-testet (idempotent), Playwright mobil 375px — «Ny økt»-arket med alle felter (screenshot),
  full kjede UI→plan-drills→live-drills, tom-økt-flaten mørk med tikkende timer (screenshot).
  Utsatt (ærlig): scrollhint-fade på 4 overflow-rader (krever målt-overflow-mønster, v2-runde).

- 12. juli (WAGR-synk, del 2): **ekstern henting fra wagr.com er PÅ** — Anders godkjente skånsom
  ukentlig henting (alternativ 1). `hentEksterneProfiler` i `wagr-sync.ts` leser profilsidenes
  server-rendrede `__NEXT_DATA__`-JSON (validert med zod), sekvensielt med 700 ms pause og
  identifiserende User-Agent. Domeneregel fra Anders (13. juli): **borte fra WAGR = blitt
  proff** — både eksplisitt proff (isPro/position 0) og manglende profil (302/404) behandles
  likt: `blittProff` i output, metadata.isPro settes, siste amatørtall bevares. Nettverksfeil
  (`feilet`) rapporteres uten å stoppe kjøringen; demo-slugs hoppes over; `country` røres ikke
  (wagr.com gir landsnavn, ikke ISO-kode). Verifisert med ekte kjøringer: 3 rankinger oppdatert
  (Stout, Kuvaas, Aase), 7 proffer markert (Koivun, James, Maas, Summy, Mjaaseth, Herstad,
  Tegner), 0 feil. Datafiks: Kuvaas-slugen manglet tall-suffiks i basen — rettet til
  `kristoffer-kuvaas-35131` (verifisert mot wagr.com-søket).

- 12. juli (WAGR-synk): **«Synk nå» på `/admin/talent/wagr-import` har fått ekte backend** — ny
  agent `src/lib/agents/wagr-sync.ts` (registrert i cron-ruten + vercel.json, onsdager 06:15 UTC)
  som kobler umatchede WagrSnapshot-rader til spillere på entydig navnetreff og lagrer snapshots
  idempotent (`oppdaterSnapshots`, moveDelta bare ved rank-endring). Knappen kaller samme kjøring
  via server action `synkWagrNaa` med ærlig toast-status. Ekstern henting fra wagr.com er BEVISST
  sperret (`hentEksterneProfiler` → null) til Anders har avklart datakilde — ingen åpen API finnes,
  scraping-lovlighet uavklart; manuell import er fortsatt primærvei. NGF-kategori-mappingen er
  flyttet til delt `src/lib/wagr/ngf-kategori.ts`.

- 11. juli (booking-konsolidering, fase 1.1–1.3): **sikkerhetshull i ombooking tettet** —
  `rescheduleBooking` i `booking/actions.ts` hardkodet `coachId = ""`, som gjorde at Google
  Kalender-kollisjonssjekken alltid «feilet åpent» (fant ingen tilkobling → sa ledig). Bruker nå
  ekte `booking.coachId`. Verifisert mot en midlertidig testkobling i dev-DB (ryddet opp etterpå).
  24-timers påminnelse (`src/lib/agents/booking-reminders.ts`) viste seg å allerede være fullt
  bygget og koblet på cron — ingenting å gjøre der. Slått sammen de to parallelle
  booking-e-postsystemene til ett: `booking/actions.ts` (marketing/gjeste-avbestilling og
  -ombooking) brukte hardkodede React-maler (`send-booking-email.ts`), mens resten av appen
  allerede brukte de DB-drevne `EmailTemplate`-radene (`booking-emails.ts`, redigerbare av Anders
  uten kode-endring). Lagt til to nye maler i databasen (`booking-avbestilt`, `booking-flyttet`),
  byttet `booking/actions.ts` til det DB-drevne systemet, og slettet det nå døde
  `send-booking-email.ts` + `templates/`-mappa. tsc + build + 400/400 tester grønt.

- 11. juli (booking-konsolidering, fase 2–3): **fase 2 (rydd legacy vs v2-duplikater) trengte
  ingen kode** — grep + git-historikk viste at kun index-sidene (`/portal/booking`,
  `/admin/bookinger`) er byttet til v2; alle undersider (`/portal/booking/ny`, `[bookingId]`,
  `coach/[coachId]`, `anlegg/[anleggId]`, `bekreftet`, `/admin/bookinger/ny`) er fortsatt
  fungerende legacy-kode uten v2-erstatning, og aktivt lenket til fra global søk, coach-sider,
  spiller-detalj og «Mine bookinger». Ikke reelle duplikater — å omdirigere dem ville brukket
  ekte flyter. **Fase 3 (hente trener-katalog + anlegg-detalj fra `akgolf-booking`) utsatt av
  Anders** til normal bølge-rekkefølge i v2-migreringen — begge skjermene mangler godkjent v2-design
  (Design-kolonne «–» over), og bygging ville brutt den låste regelen om at nye, store flater
  venter på godkjent mockup. Ingen kode endret i denne runden.

- 11. juli (QA-runde, komplett gjennomgang desktop+mobil): **KRITISK shell-bug funnet og fikset** —
  `BunnNavLenker` (mobil-bunn-nav) i `src/components/v2/shell.tsx` satte `display: "flex"` som
  inline style, som alltid vant over Tailwind-klassen `md:hidden`. Konsekvens: bunn-navigasjonen
  vises feilaktig på ALLE v2-skjermer ved desktop-bredde (≥768px) og overlapper/stjeler klikk fra
  sideinnhold som strekker seg mot bunnen av viewporten (bekreftet reprodusert 2/2 ganger på
  Plan-bygger steg 2→3 — klikk på «Neste» traff bunn-nav-lenken til Meg i stedet). Fiks: fjernet
  inline `display`, lagt `flex` som base-klasse (`className="flex md:hidden"`). Bekreftet fikset
  visuelt og funksjonelt (steg 2→3 fungerer nå korrekt) — påvirket sannsynligvis alle v2-skjermer
  på desktop før fiksen. Mobil (375px) var aldri rammet. Samme QA-runde bekreftet: F1.0-F1.5
  (onboarding→planmotor) fungerer ende-til-ende i ekte nettleserflyt, F2 (volum-linje) fanget en
  ekte datafeil i malen «B Grunn-fase Standard» (nærspill/putting-økter tagget SLAG i stedet for
  SPILL — bør rettes), F3 (masseredigering) koblet og enhetstestet.

Full kronologisk byggehistorikk flyttet til [`docs/arkiv/master-skjermplan-endringslogg.md`](arkiv/master-skjermplan-endringslogg.md)
2026-07-06 — denne fila var 822 linjer og loggen drukna den faktiske statustabellen. Siste hendelser:

- 11. juli (Bølge B — AgencyOS-detaljskjermer til v2, branch `claude/bolge-b-agencyos`):
  **12 skjermer rebygget på v2:** agencyos/spillere (stall-tabell, ny MiniSpark-primitiv),
  agent-detalj, gruppe-detalj + timeplan, admin plan-detalj (4 faner), spiller-plan-detalj
  coach-context (5 faner), turnering-detalj, økt-detalj (coach-context), oppfølgingskø
  (kanban) + oppfølging-alias, daglig AI-brief, coach-varsler (ny master-skjermplan-rad),
  workspace Notion-sync + prosjekter. Admin error/not-found golfdata fjernet. Alle rike
  interaktive delkomponenter (drag-and-drop, wizard-modaler, agent-kjøring-paneler) er
  tailwind-only og gjenbrukt uendret — kun golfdata-chrome byttet til v2. Etter denne
  bølgen finnes kun **1 gjenværende golfdata-referanse i hele /admin**
  (`spillere/spillere-tabell.tsx` — utenfor denne bølgens scope, egen oppfølging).
  tsc 0 feil, fullt bygg grønt (inkl. sw.js-steget).

- 11. juli (Bølge A — PlayerHQ-detaljskjermer til v2, branch `claude/blissful-gates-763ac3`):
  **ALLE /portal-sider er nå golfdata-frie.** Rebygget på v2: utfordring-detalj, runde-detalj
  (Scorekort + SgKategorier), slag-registrering, loggfør runde, TrackMan-hub + sesjonsdetalj,
  baneguide banekart + hull-detalj (dispersion), test-detalj, FYS-plan-hub, talent-hub. Døde
  sider slettet (teknisk-plan-lista var redirect-skygget; tester-katalog×2 + scorekort
  foreldreløse). Siste golfdata-referanser fjernet fra ny-okt-wizard, coach-plan-detalj,
  6 meg-skjemafiler og error/not-found. NY LÅST REGEL: «?»-forklaringer (HjelpTips) på alle
  tall/faguttrykk — 6 nye hjelpetekster (trackman, dispersjon, spredningSigma, skjevhetBias,
  talentVurdering, utfordringScore). Knapp fikk submit-støtte; wrench i ikon-kartet.
  tsc 0 feil, fullt bygg grønt. Etter merge med main (SG slag-for-slag-pakken, se rad under):
  runde-detalj-v2 fikk main sine SG-buckets/kjede-status/sgSource-badges portert inn; nye
  hovedskjermer `/portal/runde/live` + `/portal/runde/logg` (main, v13/golfdata) står på
  bølge B/C-lista for v2-port. Gjenstår i bølge A-halen: shot-by-shot (rå tailwind),
  talent-undersider, ny-okt/coach-plans full v2-omkomponering, `/fullfor` v2-port.
- 10. juli (kveld) — **SG slag-for-slag-pakken (steg 1–7) levert og prod-verifisert.** Nye skjermer:
  `/portal/runde/live` (live-føring: kjede-UI, I HULL, lie-/avstands-chips, kladd m/ crash-recovery,
  hull-oversikt m/ delvis lagring, live SG-panel), `/portal/runde/logg` (etterregistrering m/ dato),
  `/portal/mal/runder/[id]/fullfor` (fullfør kjeden per hull — mismatch-blokkering, SG låses opp på
  alle/alle). Mockups godkjent i Claude Design (`ui_kits/v2/runde-logg*.jsx`) FØR bygging; ordbok-vasket.
  UpGame-import skriver nå HoleScore (aldri fabrikkerte slag); rundedetalj fikk SG-fordeling
  (kanon-etiketter, granulære buckets, kilde-badge, ærlig tomtilstand m/ CTA) + ærlig delvis-runde-
  header. Verifisert: prod-e2e (import, live 2 hull m/ straffe+bunker, reload-recovery, delvis
  lagring, fullfør kjeden 2/3→ærlig null→3/3 beregnet), divergensvakt motor==DB==UI som unit-test
  (pipeline.test.ts), 375px-sveip uten overflow. Gamle `/portal/mal/runder/[id]/slag` er nå
  «Avansert redigering» (legacy).

- 8. juli (opprydding Fase 4, bølge 4 — marketing + forelder, branch `opprydding/token-konvergens`):
  **SISTE bølge — hele appen har nå 3 gamle athletic-importer igjen, alle PulseDot på marketing
  (venter på gap #1 StatusDot).** `Pyramid` portet fra DS (data/) → golfdata/. Migrert:
  forelder/barn PyramidProgress → Pyramid (apex→base-kanon, andel av økter, verifisert m/ ærlig
  tomstate); forelder/okonomi + kommando KpiStrip/KpiCard → KpiTile-grid (verifisert visuelt);
  404/500 for marketing + forelder → Eyebrow + display-h1 + golfdata Button. Gap-register
  bølge 4: #11 (PulseDot ×3 venter på #1). tsc + eslint + hex-gate + build grønt, 342/342
  tester, Playwright-diff mot baseline uendret. Fase 4 er dermed KOMPLETT sånær som gap-fyllet —
  neste er gap-fyll-prompten til Claude Design og så Fase 5 (slett gammelt bibliotek + rydd
  globals.css).

- 8. juli (opprydding Fase 4, bølge 3 — /admin, branch `opprydding/token-konvergens`):
  **/admin er tom for gammel-athletic-importer.** `SegmentedTabs` portet fra DS (forms/) →
  golfdata/. Migrert: plan-detalj-fanene (`/admin/spillere/[id]/plan/[planId]`) TabBar →
  SegmentedTabs m/ tynn URL-synk-wrapper (plan-tabs.tsx); Uka-skjermen KpiRing → RingGauge
  (verifisert visuelt, kapasitetsring); varsler-loading gammel Skeleton → ui/skeleton;
  404/500-sidene AthleticHero → Eyebrow + display-h1 + golfdata Button. Gap-register bølge 3:
  ingen nye komponent-gap, 2 observasjoner (#9 SegmentedTabs mangler count-variant, #10
  onChange-typekollisjon løst med Omit i porten). tsc + eslint + hex-gate + build grønt,
  342/342 tester, Playwright-diff mot baseline uendret.

- 8. juli (opprydding Fase 4, bølge 2 — /portal, branch `opprydding/token-konvergens`):
  **/portal er tom for gammel-athletic-importer.** Nye porter fra Claude Design-prosjektet
  (DesignSync): `PercentileBar`, `NivaStige`, `Stepper` → golfdata/. Talent-hub rekomponert
  fra håndrullet SVG til golfdata: MasteryRing→RingGauge, PercentileGauge→PercentileBar,
  StreakTracker→Heatmap, LevelLadder→NivaStige, JourneyMap→Stepper (plan sa KategoriStige —
  semantisk feil mapping, dokumentert i gap-registeret #6), GoalProgress-gradient (utokenisert
  #8EBF00) → golfdata Progress. 404/500-sidene rekomponert fra AthleticHero til Eyebrow +
  display-h1 + golfdata Button. KpiCard→KpiTile (baneguide hull-detalj + meg/helse).
  Design-hake /portal/talent – → ~. Gap-register bølge 2: ingen nye komponent-gap, 3
  observasjoner (#6–8). Visuelt verifisert med TALENT-flagg + seedet testdata (screentest).
  tsc + eslint + hex-gate (2 filer forbedret, baseline låst) + build grønt, 342/342 tester.

- 8. juli (opprydding Fase 4, bølge 1 — src/components → golfdata, branch `opprydding/token-konvergens`):
  **Delte komponenter over på golfdata-kanon.** Nye porter fra det levende Claude Design-prosjektet
  (DesignSync): `MaanedKalender` (varme + piller m/ DnD) og `FilterPills` → `golfdata/`.
  Migrert: Kommando-kalenderen (`/kommando/kalender`) og gruppe-kalenderen (`/team-wang`) fra gamle
  MonthGrid/WeekGrid til MaanedKalender (piller) + TidsGrid; StatusPill→Tag (spiller-panel),
  RoleBadge/PeriodeTag→Tag-komposisjoner m/ aksefarge-tokens (team-kit), FilterPillBar→FilterPills
  (drill-library/søkemodal). GAP MELDT (ikke improvisert, beholdt m/ disable): PulseDot/PresenceDot/
  SeverityDot (DS mangler status-dot-primitiv), PyrDistBar (DS mangler aksefordelings-bar),
  YearPlanGantt (DS Periodeplan er L-fase-låst — mangler AK-periode-årsgantt), VisningsVelger mangler
  «år»-visning, Tag mangler warn-variant (fra Fase 3). Kommando-kalender verifisert visuelt (piller +
  i dag + «+N flere» på ekte bookinger). NB: /team-wang 500-er pga. pre-eksisterende DB-drift
  (group_schedules.maxParticipants mangler i DB) — flagget som egen oppgave, urelatert til bølgen.
  tsc + eslint + hex-gate + build grønt, 342/342 tester, Playwright-diff mot Fase 0-baseline uendret.

- 7. juli (GFGK treningsplanlegger, del 2 av firepart-samarbeidet): **Ny åpen GFGK Junior-side.**
  `/gfgk-junior` viser alle 4 GFGK-aldersgrupper (Mini/Basis/Utvikling/Elite) med fanevalg —
  ekte `GroupSchedule`-data, ingen personlig spillerinfo. Delte kalender-byggeklosser omdøpt fra
  `wang-kalender`→`gruppe-kalender` (var WANG-navngitt, men egentlig generisk — nå bekreftet
  gjenbrukt for GFGK). Ny `FlereGrupperKalender`-komponent for fanevalg mellom flere grupper på
  samme side. Domenene `wanggolffredrikstad` (→ `/team-wang`) og `gfgkjunior.no` (→ `/gfgk-junior`)
  kan pekes hit i Vercel når Anders bekrefter DNS-steget. Bygget isolert på
  `feature/gfgk-treningsplan`-worktree. tsc 0 feil, build grønt, 326/326 tester.

- 7. juli (WANG treningsplanlegger, prosjektforespørsel): **WANG-gruppe seedet + ny åpen side + VG-filter.** `Group`/`GroupSchedule` for WANG Toppidrett + 4 GFGK-grupper skrevet til DB (var kun definert i seed.ts, aldri kjørt); ny `training_periods`-tabell + `User.schoolYear`-felt lagt til additivt (`db execute`, ikke migrate/push — se gotchas.md). Ny offentlig side `/team-wang` (ingen innlogging, ingen personlig spillerdata) viser årshjul/måned/uke fra ekte `GroupSchedule`+`TrainingPeriod`-data via gjenbrukte `YearPlanGantt`/`MonthGrid`/`WeekGrid`. VG-trinn (VG1/VG2/VG3) lagt til som redigerbart felt på spiller (`/admin/spillere/[id]/rediger`) + filter/badge på gruppe-roster (`/admin/grupper/[id]`). Bygget isolert på `feature/wang-treningsplanlegger`-worktree. tsc 0 feil, build grønt, 326/326 tester.

- 6. juli (design-bølge D3): **9 PlayerHQ-skjermer løftet til v13-referanseanatomien** (golfdata-scope-wrapper `max-w-[460px]→md:860`, Eyebrow-komponent + display-h1 med italic-em): `/portal/coach/sporsmal` re-komponert fra gammel CLI-stil til Card-rader med status-Tag (Besvart/Åpent) og avatar-initialer; `/portal/coach` + `melding` + `ovelser` (Tag-filterchips) + `videoer` + `plans` konsistens-pass; `/portal/statistikk`-hub wrapper; `/portal/utfordringer` + `[id]` (detalj: Eyebrow/h1-hero, golfdata Button/Card/KpiTile — kun token/anatomi-løft, score-registrering trenger ekte redesign, meldt som gap). Design-haker satt til ~ (golfdata-kit-komposisjon per prompt.md-kontraktene gjenstår). tsc + eslint grønt.
- 6. juli (design-bølge D2): **4 AgencyOS-skjermer kalibrert til ui.tsx-fasitstandarden** (`/admin/analysere`, `/admin/runder`, `/admin/gjennomfore`, `/admin/workspace`): AgPage + AgPageHead-anatomi, hub-nav-kort re-komponert med Tailwind-tokens (gamle HubFrame/hubs.css med rå hex ute av disse rutene), runder-tabellen på AgTable/AgPlayerCell + KPI-kort fra `/admin/analyse`-fasiten, workspace-hero/tabs/KPI på tokens (AthleticButton ut). Design-haken satt til ~ (ikke ✓) fordi v13-kriteriet i rebaselinen måler mot golfdata-kit-komposisjon — samme nivå som søsterskjermene `/admin/analyse`/`/admin/okonomi` som selv står på –. tsc + eslint grønt.
- 25. juni (Bølge 2, ★-verifisering): **SG-Hub ★ verifisert — Flyt ✓.** Playwright 430px: hovedhub rendrer med ekte data (SG-pipeline +0,6, 11 runder, 12 TrackMan-økter, ENKEL/AVANSERT-toggle). Render-sveip av 6 undersider (benchmark, best-vs-now, equipment, yardage, conditions, strategy) — alle rendrer uten console-/runtime-feil og er navigerbare fra hub-en (→ Flyt ✓ på hovedhub). Undersidenes egne Funker/Data/Design-haker står fortsatt på ~/– i påvente av per-side data- og design-gate (ikke ★, deprioritert).
- 25. juni (Bølge 2, ★-verifisering): **Live-økt-løkka (brief → aktiv → oppsummering) e2e-verifisert — Funker-haken ✓.** Playwright 430px på ekte PLANNED V2-økt: brief rendrer (mål/fokus/drills), aktiv auto-starter (PLANNED→IN_PROGRESS), «Logg rep» → DrillLogV2 persistert, «Fullfør økt» → `completeSession` → oppsummering (reps/tid/drills KPI + CTA). Ingen runtime-feil (kun benign dev-eval-CSP-støy). Testøkt gjenopprettet til PLANNED etterpå (logg slettet, completedSummary = DbNull). Hakene Adresse/Flyt/Data/Funker → ✓ for alle tre. (iPad-bredde gjenstår — Mob/Desk/iPad fortsatt ✓✓–.)
- 25. juni (Bølge 1, post-lansering): **Maler-kort viser ekte SG-effekt.** Øvre-høyre-plassholderen «—» på Maler-fanen leser nå `PlanTemplate.effectivenessAvg` (snitt SG-Total-delta fra `PlanEffectiveness`) — tone-farget +/− når data finnes, ærlig «—» når ingen fullført plan har brukt malen ennå. Ingen oppdiktede prosenter.
- 25. juni (Bølge 1, post-lansering): **Workbench uke-navigasjon (FORRIGE/NESTE) koblet.** `?uke=N`-offset gjennom hele kjeden: `loadWorkbenchData(userId, weekOffset)` (uke-anker + ekte datotall + i-dag kun på inneværende uke), begge sider (spiller + coach) leser `parseWeekOffset`, og drag-drop/«+»/palette persisterer til den uka som faktisk vises via `weekRefDate(offset)` → `executeSessionMove`/`dateForDayIndex`. Tom navigert uke viser nå grid + navigasjon (ikke onboarding-blindvei). Bevis: 18 enhetstester (dato-matte/anker/parse), Playwright 1280 klikk-runde (Uke 26→27→26, `?uke=1`-toggle), gate MOVE_DRAG-persistering PASS, 244 tester + tsc + build grønt.
- 25. juni (lansering 20:00): **Workbench lanserings-hub ferdig.** Maler «Bruk» persisterer PlanTemplate-uke-1 til TrainingPlanSession+V2; V2-merge-bug fikset (`merge-week-sessions`); publish DRAFT→PENDING_PLAYER; design-gate 0 udokumenterte avvik (spiller uten coach-sidebar, ukenavigasjon-shell, Økt/Std wb-10-blokker). Gate-bevis: Playwright 430+1280, smoke PASS, 230 tester, build grønt.
