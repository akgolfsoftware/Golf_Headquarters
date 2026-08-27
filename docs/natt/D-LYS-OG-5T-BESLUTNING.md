# D-LYS-OG-5T-BESLUTNING — 2026-08-26

Beslutningsunderlag for Anders' beslutningskø punkt 1 og 2 (LAUNCH-PLAN-FULL §0.2).
Skrevet av plan-session (read-only) 26.08. Alle tall er målt mot `designsystem/train-lock/`
(177 `.dc.html`-filer), `src/styles/train-lock-tokens.css` og §5T i LAUNCH-PLAN-FULL.

## Oppsummering (1 minutt)

1. **Lys-varianter:** Player-siden er fullt dekket av tegnet lys (B3/B4). Agency-siden har
   tegnet lys for bare **9 av de 39 T-skjermene med fasit** — 8 av 13 T-økter (T1, T6,
   T8–T13) har **null** tegnet lys. MEN: tokensettet bærer allerede fasitens egen komplette
   lys-palett (§05 i TRAIN LOCK), og en TL-portet skjerm leser KUN `--tl-*` — lys kommer
   da automatisk via eksisterende temamekanisme, uten gjetting på layout.
   **Anbefaling: godkjenn alternativ (a) — mekanisk avledet lys.** Alternativ (b) stopper
   over halve T-bølgen på bestilling av 30+ nye tegninger.
2. **§5T-listene:** samletabellen nederst har alle **14 pensjoneringskandidater** og
   **38 klasse B-sider** med forslag per rad — kryss av JA/NEI/annet i én omgang.
   I tillegg trengs ett prinsipp-JA for de **24 klasse A-sidene** (detaljsider som portes
   etter hub-mønster, ingen egen fasit per skjerm).

**Tre kryss fra deg låser opp nesten hele T-bølgen:**
- [x] Lys: alternativ (a) godkjent — **Anders 26.08.2026:** «Alle skjermer i PlayerHQ, AgencyOS og foreldre-skjermene skal ha mørk og lys modus.» Utvidet samtidig til å gjelde forelder-appen i sin helhet, ikke bare AgencyOS — se `.claude/rules/beslutninger.md`.
- [x] Klasse A: prinsipp-OK for port etter hub-mønster (24 sider) — **Anders 27.08.2026: JA.**
- [x] Samletabellen under: kryss per rad (14 + 38) — **Anders 27.08.2026: JA til alle forslag**,
  se § 0 «AVGJORT 27.08.2026» under for de rekke enkeltbeslutningene som lå utenfor bulk-svaret.

## 0. AVGJORT 27.08.2026 (Anders, i økt — dokumentert i `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` § 8)

Hele beslutningskøen i dette dokumentet er nå lukket. Sammendrag av svarene, i tillegg til
de to bulk-kryssene over:

1. **Klasse A (24 sider) og bulk-tabellen (14 pensjonering + ~13 klasse B «M»-rader):
   JA til begge.** «Ditt svar»-kolonnen i § 2.4 leses derfor som JA på alle rader merket
   Pensjonering eller M, med unntak av radene under som fikk et annet/mer presist svar.
2. **`queue` (T2, rad 16):** viste seg allerede løst i koden — «Kø» i railen (T1, `V2Shell`)
   peker på `/admin/queue`, en ekte spiller-oppfølgingskø (risiko/watch/sjekk inn/løst),
   adskilt fra AgenticOS' godkjenningskø. Ingen ny beslutning trengtes.
3. **`tournaments/ny` (T10, rad 35):** allerede avgjort 04.08.2026 (se `.claude/rules/
   beslutninger.md`) — turneringsplanlegging bygges i Workbench, ikke som ombygging av
   `/admin/tournaments`. Rad 35 er dermed løst, ikke lenger «egen sak».
4. **`talent/radar`, `talent/discovery`, `talent/sammenligning`, `talent/wagr-import`**
   (T11, rader 41–44): allerede avgjort 26.08.2026 — TalentHQ slås sammen inn i PlayerHQ,
   egen bølge ETTER T-bølgen (se auto-memory `talenthq-samles-i-playerhq`). Radene er
   dermed IKKE en del av T11-omfanget — utsett til TalentHQ-konsolideringsbølgen.
5. **Caddie-trioen `agencyos/caddie` + `aktivitet` + `dashbord` (T12, rader 45–47):**
   **Caddie som chat-konsept legges ned.** Jarvis-fasitens godkjenningskø (JV-01–03)
   overtar jobben. Ingen egen chat-flate bygges videre på siden av Jarvis.
6. **PII-tunge flater — `innboks-epost` (T3, rad 17), `ak-stigen` (T8, rad 31),
   `recording` (T9, rad 33):** **planlegges portet nå**, med riktig PII-håndtering bygget inn
   underveis (kunde-e-post, junior-PII, lydopptak — hver flate får egen vurdering i sin
   T-økt, ikke en felles mal). Bygger-økten stopper og spør Anders ved reell tvil om omfang.
7. **`reports` (T11, rad 38):** flettes inn i økonomiflaten (EC-01/C10) — ikke egen side.
8. **T13-restsidene `marketing`, `videoer`, `workspace`, `workspace/notion`,
   `workspace/prosjekter` (rader 48–52):** portes NÅ etter Oppsett-hub-mønsteret, sammen
   med de 24 klasse A-sidene — ikke utsatt bak Meg.
9. **`turnering-kobling` (T4, rad 19):** lav risiko, ingen produktbeslutning nødvendig —
   portes som minimal TL-verktøyside etter samme mønster som andre datavask-verktøy.

---

## Oppgave 1 — Lys-varianter (T-S5)

### 1.1 Målt dekning

`designsystem/train-lock/`: 177 skjermfiler (`.dc.html`), hvorav **15 lys-filer**:
`A-16`/`A-17` (Workbench uke/økt lys) · `AG-01 Cockpit lys` · `B3 Lys nøkkelskjermer` +
`B3 Lys resterende skjermer` (PH-01–20, hele PlayerHQ) · `B4 Lys iPad Mac` (PH-01/04/05/10/17) ·
`B5 Lys Agency` (AG-02/03/04/16) · `KA-01L` · `LO-01L` · `P-09` (P-uke lys) · `RU-01L` ·
`S3-01L` · `TE-00L`/`TE-01L`/`TE-04L`.

| Flate | Tegnet lys? |
|---|---|
| PlayerHQ (PH-01–20, B8-scope) | **JA, komplett** (B3 ×2 + B4) — B8 er ikke blokkert |
| Tester/Runde/Gate player-side | Delvis (TE-00L/01L/04L, RU-01L, LO-01L) |
| AgencyOS T-skjermer med fasit (39 stk) | **Kun 9**: AG-01, AG-02, AG-03, AG-04, AG-16, A-01 (=A-16), A-02 (=A-17), KA-01, S3-01 |
| AgencyOS øvrig (AG-05–15/18, AO-*, A-03–A-15/18, WB-01–10, TM, TU, JV, FY, EC, DG, AX-01, GAP, KA-02–05) | **Kun mørk** |

**Per T-økt:** T2/T3/T4/T5/T7 har delvis lys-fasit; **T1, T6, T8, T9, T10, T11, T12, T13
har null.** Alle 62 «uten fasit»-ruter (klasse A+B) mangler selvsagt begge varianter.
Skjermbilde-gaten krever lys+mørk per skjerm — uten en beslutning her stopper 8 av 13 T-økter.

### 1.2 Kan lys avledes mekanisk? (vurdert mot token-filen, ikke i det abstrakte)

**Ja — og det er allerede bygget slik.** `src/styles/train-lock-tokens.css`:

- **Lys er `:root`-defaulten i filen**, hentet fra fasitens eget lys-pass (TRAIN LOCK §05
  «inverterte flater, samme geometri»): scene `#FFFFFF`, elev `#F2F2F2`, dock `#E9E9EB`,
  text `#111111`, fill = sort pille, draft-kant `#0000003D`, egen lys-grabber, egen
  `color-scheme`. Dette er ikke en naiv inversjon Claude finner på — fasiten har selv
  definert lys-paletten på token-nivå.
- **Geometri, type, motion og opasitets-tilstander er felles** og ligger kun i `:root` —
  ingenting layout-messig endres mellom variantene. Det er nettopp derfor mekanisk
  avledning ikke krever gjetting på hierarki: en skjerm som er korrekt portet til `--tl-*`
  i mørk får lys gratis via `html[data-v2-tema="dark"]`-mekanismen (samme som Paper).
- **Identitets- og signalfarger er eksplisitt uendret i begge varianter** (warm `#B85C3D`,
  avatar, warn, viz-farger) — ingen tvil om hva som skal snus og ikke.
- **To kjente hull, allerede flagget i token-filen** (D2-TOKENS-DONE §Åpne spørsmål):
  1σ-ellipsen og hullkart-flatene er kun tegnet i mørk. Token-filen håndterer det i dag
  ved speilet alfa (ellipse) og ved å la kart-artefakten stå mørk i begge varianter.
  Gjelder TM-skjermene (B7/T9) — et avgrenset, dokumentert unntak, ikke et argument mot
  hele prinsippet.

Restrisikoen ved mekanisk lys er altså ikke «feil layout», men enkelttilfeller der en
skjerm bruker en hardkodet hex i stedet for token (fanges av skjermbilde-gaten) eller der
lys-kontrast på en spesifikk flate ser rar ut (fanges av at du SER begge varianter uansett).

### 1.3 De to alternativene

| | (a) Mekanisk avledet lys godkjennes som midlertidig fasit | (b) Vent på tegnet lys-fasit per skjerm |
|---|---|---|
| Hva skjer | Skjermer uten tegnet lys måles mot mørk fasit + token-lys. Anders ser begge i gaten som før; ser han feil, rettes den skjermen (ev. bestilles tegning for akkurat den) | Ingen T-økt merges før tilhørende lys-skjerm er tegnet i Claude Design |
| Tempo | **T1–T13 ruller uavbrutt** etter §0.2-rekkefølgen | **8 av 13 T-økter blokkert nå**; 30+ skjermer (pluss klasse A/B) må tegnes og leveres som ny zip — realistisk flere dager–uker designarbeid før Agency-porten kan fullføres |
| Risiko | En lys-skjerm kan avvike fra hva en fremtidig tegning ville vist; rettes per skjerm i etterkant (ren tokenjobb, ikke ombygging) | Null design-risiko, men lanseringen skyves; mørk (defaulten på /portal og /admin siden 25.08) er uansett den brukerne møter |
| Verifisering | 9 tegnede Agency-lys-skjermer + hele Player-settet fungerer som stikkprøve på at token-lys treffer fasitens lys-uttrykk | Full pixel-fasit begge varianter |

**Anbefaling: (a).** Fasiten har selv definert lys på token-nivå, mekanismen finnes i kode
og er den samme som Paper brukte, mørk er produktets default, og skjermbilde-gaten består
uendret som sikkerhetsnett. (b) kjøper marginal sikkerhet for hovedvarianten ingen ser
først, til prisen av å stanse over halve T-bølgen. Presisering til (a): TM-hullene
(ellipse/hullkart i lys) står som dokumentert unntak til et eget lys-pass ev. tegnes.

---

## Oppgave 2 — §5T-listene

### 2.1 Pensjoneringskandidater (14 ruter, §5T.2)

IA-en gir jobben til en annen flate. Én rad = én beslutning; «Erstattes av» er der jobben
lever videre.

| # | Side | Hvorfor kandidat | Erstattes av | T-økt |
|---|---|---|---|---|
| 1 | `agencyos/uka` | Booking-uke eies av Kalender; duplikat (og rå `getDay()`-gotcha) | KA-01-kalenderen | T7 |
| 2 | `(legacy)/foresporsler` | Booking-saker dekkes av innboks/kalender | Innboks (AG-03) / Kalender | T3 |
| 3 | `spillere/[id]/plan` | Planlegging eies av Workbench; TechnicalPlan uten TL-fasit | Workbench | T4→T6 |
| 4 | `spillere/[id]/plan/[planId]` | Samme som #3 | Workbench | T4→T6 |
| 5 | `(legacy)/spillere/[id]/tildel-test` | Duplikat av tester/tildel; test-planlegging eies av Workbench | Workbench TEST-blokker | T4→T6 |
| 6 | `plans/[planId]` | 494 linjer på gammel plan-modell | Workbench | T6 |
| 7 | `okter` | Ukeoversikt på tvers dekkes av Workbench | A-01 uke / A-10 stall dag | T6 |
| 8 | `gjennomfore` | Gjennomføring eies av Kalender | AG-11 / KA-03 | T6/T7 |
| 9 | `(legacy)/drills/forslag` | AI-forslag samles i AgenticOS-køen (beslutning 04.08) | AO-01-køen | T6→T12 |
| 10 | `bookinger` (listeflaten) | Kalender eier booking-laget | KA-lag i kalenderen | T7 |
| 11 | `(legacy)/live/[sessionId]/active` | Duplikat av agencyos/live; utgåtte M0–M5-labels | AG-09 Live-tavle | T9 |
| 12 | `(legacy)/live/[sessionId]/brief` | Økt-forberedelse eies av Workbench | A-14 økt-ark | T9 |
| 13 | `(legacy)/workspace/tildelt-meg` | Godkjennings-kø samles | Kø/cockpit «Én ting nå» | T12 |
| 14 | `spillere/[id]/workbench` | Gammel datamodell; måned/år kommer på ny modell i C1 | Ny Workbench (etter C1) | T5 |

### 2.2 Klasse A — 24 detaljsider under hub med fasit (ett prinsipp-JA, ikke 24 svar)

Portes etter mønsteret fra egen hub («kjedelig er riktig»-oppsettet AG-13/AG-18,
KA-underark, stall-mønsteret): settings/api·calendar·periode-navn·security·tilgang,
klubb/innstillinger, `(legacy)/anlegg` (konsolideres mot klubb), team/ekstern·inviter,
integrasjoner, email-templates (+rediger), gdpr, audit-log, feillogg, hjelp,
`(legacy)/services` (alle T13) · kalender/hendelse/[id]·ny, bookinger/[id]·ny,
`(legacy)/availability` (T7, som ark i kalenderen) · spillere/ny,
`(legacy)/spillere/[id]/rediger` (T4, stall-mønsteret).

### 2.3 Klasse B — 38 ekte hull, gruppert per T-økt (§5T.3)

Forslagskoder: **P** = pensjoner · **M** = port etter mønster fra samme T-rad ·
**E** = behold som egen sak (egen fasit/beslutning senere).

| T-økt | Side | Forslag | Begrunnelse |
|---|---|---|---|
| T2 | `brief` | M | Flettes inn i AG-01-cockpiten (cockpit-mønsteret) |
| T2 | `queue` | E | Eierskap til «Kø»-jobben avhenger av T-S2 (rail-tabben Kø vs. AO-køen) |
| T3 | `innboks-epost` | E | AG-03 er saksinnboks, ikke e-postklient; kunde-PII — egen fasit trengs |
| T4 | `spillere/[id]/tester` | M | Tester-resultat flettes i S3-360 (S3-01-mønsteret) |
| T4 | `spillere/[id]/turnering-kobling` | E | Datavask-verktøy — behold uportert eller minimal TL |
| T6 | `teknisk-plan` | P | Avklares mot AG-06/Loop 2S-drill-editor; overlapper Workbench |
| T6 | `drills/ny` | P | Overlapper Loop 2S-drill-editoren |
| T6 | `drills/[id]/rediger` | P | Overlapper Loop 2S-drill-editoren |
| T6 | `tester` (tvers av spillere) | M | Tildeling → Workbench TEST-blokker (A-01-mønsteret) |
| T6 | `tester/foreslatte` | M | Samme som over |
| T11 | `(legacy)/tester/benchmarks` | M | Resultat/benchmarks → Innsikt (AG-07/AG-12-mønsteret) |
| T6 | `(legacy)/tester/tildel/[spillerId]` | P | Duplikat av tildeling i Workbench |
| T8 | `grupper` | M | Portes etter stall/gruppe-mønsteret (WB-09), IA bekreftes |
| T8 | `grupper/[id]` (medlemsadmin) | M | Samme mønster |
| T8 | `grupper/[id]/timeplan` | M | Samme mønster |
| T8 | `grupper/[id]/arsplan/skoledata` | M | A-06/WB-06-mønsteret |
| T8 | `agencyos/ak-stigen` | E | PII-nær (juniorer) — omfang avklares før port |
| T9 | `(legacy)/live/[sessionId]/summary` | P | Følger legacy-live-utfasingen (som active/brief) |
| T9 | `recording` | E | PII-tung (lydopptak) — beslutning før noe portes |
| T10 | `tournaments/dubletter` | M | Verktøy — minimal TL etter TU-01-mønsteret |
| T10 | `tournaments/ny` | E | Berører beslutningen 04.08: turneringsplanlegging → Workbench |
| T10 | `turnering-kart` | M | Verktøy — minimal TL |
| T11 | `analysere/compliance` | M | Push-rad under AG-07 (innsikt-hub-mønsteret) |
| T11 | `reports` | E | Overlapper EC-01 (C10) — avklar før port |
| T11 | `runder` | M | Push-rad under AG-07 |
| T11 | `(legacy)/stats/moderering` | M | Push-rad under AG-07, ev. minimal TL |
| T11 | `talent/radar` | E | Ingen TL-fasit for talent-admin — omfang avklares samlet |
| T11 | `talent/discovery` | E | Som over + PII-lett (navn/HCP til klient) |
| T11 | `talent/sammenligning` | E | Som over |
| T11 | `talent/wagr-import` | E | Som over |
| T12 | `agencyos/caddie` | E | JV-fasiten er merge-kø, ikke chat — henger på T-S2 |
| T12 | `agencyos/caddie/aktivitet` | E | Som over |
| T12 | `agencyos/caddie/dashbord` | E | Som over |
| T13 | `marketing` | E | Utenfor coach-kjernen — TL etter mønster ELLER lever uportert bak Meg |
| T13 | `videoer` | E | Som over |
| T13 | `workspace` | E | Som over |
| T13 | `workspace/notion` | E | Som over |
| T13 | `workspace/prosjekter` | E | Som over |

(`agencyos/okonomi` er dekket av C10/EC-01 — ingen egen T-rad, ikke i tabellen.)

### 2.4 Samlet avkrysningstabell (52 rader → kryss i én omgang)

Kolonnen «Forslag» er anbefalingen over; skriv JA (følg forslaget), NEI (behold som i dag)
eller eget svar i siste kolonne.

| # | Side | Kategori | Forslag | T-økt | Ditt svar |
|---|---|---|---|---|---|
| 1 | `agencyos/uka` | Pensjonering | Pensjoner → KA-01 | T7 | |
| 2 | `(legacy)/foresporsler` | Pensjonering | Pensjoner → AG-03/Kalender | T3 | |
| 3 | `spillere/[id]/plan` | Pensjonering | Pensjoner → Workbench | T4→T6 | |
| 4 | `spillere/[id]/plan/[planId]` | Pensjonering | Pensjoner → Workbench | T4→T6 | |
| 5 | `(legacy)/spillere/[id]/tildel-test` | Pensjonering | Pensjoner → WB TEST-blokker | T4→T6 | |
| 6 | `plans/[planId]` | Pensjonering | Pensjoner → Workbench | T6 | |
| 7 | `okter` | Pensjonering | Pensjoner → A-01/A-10 | T6 | |
| 8 | `gjennomfore` | Pensjonering | Pensjoner → AG-11/KA-03 | T6/T7 | |
| 9 | `(legacy)/drills/forslag` | Pensjonering | Pensjoner → AO-01-køen | T6→T12 | |
| 10 | `bookinger` (liste) | Pensjonering | Pensjoner → KA-lag | T7 | |
| 11 | `(legacy)/live/[id]/active` | Pensjonering | Pensjoner → AG-09 | T9 | |
| 12 | `(legacy)/live/[id]/brief` | Pensjonering | Pensjoner → A-14 | T9 | |
| 13 | `(legacy)/workspace/tildelt-meg` | Pensjonering | Pensjoner → cockpit-kø | T12 | |
| 14 | `spillere/[id]/workbench` | Pensjonering | Pensjoner etter C1 | T5 | |
| 15 | `brief` | Klasse B | Flett inn i AG-01 | T2 | |
| 16 | `queue` | Klasse B | Egen sak (T-S2) | T2 | |
| 17 | `innboks-epost` | Klasse B | Egen sak (egen fasit, PII) | T3 | |
| 18 | `spillere/[id]/tester` | Klasse B | Flett i S3-360 | T4 | |
| 19 | `spillere/[id]/turnering-kobling` | Klasse B | Egen sak (verktøy) | T4 | |
| 20 | `teknisk-plan` | Klasse B | Pensjoner (mot AG-06/2S) | T6 | |
| 21 | `drills/ny` | Klasse B | Pensjoner (2S-editor) | T6 | |
| 22 | `drills/[id]/rediger` | Klasse B | Pensjoner (2S-editor) | T6 | |
| 23 | `tester` | Klasse B | Mønster: WB TEST-blokker | T6 | |
| 24 | `tester/foreslatte` | Klasse B | Mønster: WB TEST-blokker | T6 | |
| 25 | `(legacy)/tester/benchmarks` | Klasse B | Mønster: AG-07/AG-12 | T11 | |
| 26 | `(legacy)/tester/tildel/[spillerId]` | Klasse B | Pensjoner (duplikat) | T6 | |
| 27 | `grupper` | Klasse B | Mønster: WB-09/stall | T8 | |
| 28 | `grupper/[id]` | Klasse B | Mønster: WB-09/stall | T8 | |
| 29 | `grupper/[id]/timeplan` | Klasse B | Mønster: WB-09/stall | T8 | |
| 30 | `grupper/[id]/arsplan/skoledata` | Klasse B | Mønster: A-06/WB-06 | T8 | |
| 31 | `agencyos/ak-stigen` | Klasse B | Egen sak (junior-PII) | T8 | |
| 32 | `(legacy)/live/[id]/summary` | Klasse B | Pensjoner (legacy-live) | T9 | |
| 33 | `recording` | Klasse B | Egen sak (PII-tung) | T9 | |
| 34 | `tournaments/dubletter` | Klasse B | Mønster: TU-01, minimal TL | T10 | |
| 35 | `tournaments/ny` | Klasse B | Egen sak (04.08-beslutning) | T10 | |
| 36 | `turnering-kart` | Klasse B | Mønster: minimal TL | T10 | |
| 37 | `analysere/compliance` | Klasse B | Mønster: AG-07 push-rad | T11 | |
| 38 | `reports` | Klasse B | Egen sak (overlapper EC-01) | T11 | |
| 39 | `runder` | Klasse B | Mønster: AG-07 push-rad | T11 | |
| 40 | `(legacy)/stats/moderering` | Klasse B | Mønster: AG-07 push-rad | T11 | |
| 41 | `talent/radar` | Klasse B | Egen sak (talent-omfang) | T11 | |
| 42 | `talent/discovery` | Klasse B | Egen sak (talent + PII) | T11 | |
| 43 | `talent/sammenligning` | Klasse B | Egen sak (talent-omfang) | T11 | |
| 44 | `talent/wagr-import` | Klasse B | Egen sak (talent-omfang) | T11 | |
| 45 | `agencyos/caddie` | Klasse B | Egen sak (T-S2) | T12 | |
| 46 | `agencyos/caddie/aktivitet` | Klasse B | Egen sak (T-S2) | T12 | |
| 47 | `agencyos/caddie/dashbord` | Klasse B | Egen sak (T-S2) | T12 | |
| 48 | `marketing` | Klasse B | Egen sak (bak Meg?) | T13 | |
| 49 | `videoer` | Klasse B | Egen sak (bak Meg?) | T13 | |
| 50 | `workspace` | Klasse B | Egen sak (bak Meg?) | T13 | |
| 51 | `workspace/notion` | Klasse B | Egen sak (bak Meg?) | T13 | |
| 52 | `workspace/prosjekter` | Klasse B | Egen sak (bak Meg?) | T13 | |

**AVGJORT 27.08.2026 — se § 0 øverst i dette dokumentet for alle svarene**, inkl. de ni
radene/gruppene som fikk et mer presist svar enn et rent bulk-JA. Neste steg: svarene
føres inn i `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` § 5T sine T-rader (T2–T13) slik at
hver bygge-økt ser riktig omfang direkte i sin rad, ikke bare her.
