# Arbeidsordre — komplett skjermdekning for AK Golf HQ

Skrevet 29.07.2026 fra Claude Code, basert på to bevisdokumenter i repoet
`~/Developer/akgolf-hq` (GitHub: akgolfsoftware/Golf_Headquarters):

- `docs/funksjonsinventar-2026-07-29.md` — hva som finnes: 282 reelle skjermer, hver rad med filsti-bevis.
- `docs/designdekning-2026-07-29.md` — hvor mye av det som er designet mot DETTE prosjektet: **2 av 233 skjermer (0,9 %)**.

Dette prosjektet (Claude Paper) er fasit, bekreftet av eier 29.07.2026. Den gamle v2-kanonen
(`AK Golf HQ Design System`, bb9b2b1d) er avviklet, men dens 89 skjermer er nyttige som
*innholdsreferanse* — de viser hvilke data og handlinger hver skjerm rommer. Tokens, fonter og
farger derfra skal ALDRI kopieres; alt oversettes til Claude Paper-språket, samme regel som for
referanse-HTML-en i readme.

## Eiers beslutninger (29.07.2026, samme dag som ordren)
1. **Klubbflatene (10 skjermer) er UTE av Claude Papers scope** — gfgk-junior, team-gfgk og
   team-wang designes i egne designsystem-prosjekter, ikke her. Fase B4-klubb utgår; nevneren for
   dette prosjektet er dermed **223**, ikke 233.
2. **De ni utsatte seksjonene står** som i `kart/ikke-bygget-enna.md`: innholdsbeslutning fra eier
   FØR design, per seksjon. Ingen design på antatt innhold.
3. **Ikonsettet utvides ved behov**: `Icon` får nye Lucide-glyffer (stroke 1,5, currentColor)
   etter hvert som skjermene krever dem — alltid inn i `Icon`, aldri løse SVG-er per skjerm.

## Nevneren

**223 skjermer** skal til slutt ha en flate i dette systemet. Fordeling:
PlayerHQ 113 · AgencyOS 84 · Foreldreportal 11 · Auth 15.
(Klubbflatenes 10 skjermer er flyttet til egne prosjekter, jf. beslutning 1; 32 ytterligere
sider i koden er redirects/interne verktøy og skal ikke designes.)

Men 223 flater betyr ikke 223 unike design. Skjermene faller i **familier** der én designet
mal dekker mange ruter — samme grep som ListRow dekker ~60 rader. Estimert: ~35 unike
skjermmaler dekker alle 223.

## Rekkefølge (fullfør Fase A-halen først)

Fase A-halen står i readme og endres ikke av denne ordren:
ConfirmDialog → lagmigrering (utført per revisjon 29.07) → template-omskriving → Port A-krav 2
(verifikatør) → Familie 2. Denne ordren definerer det som kommer ETTER: Fase B (skjermfamilier).

### Fase B1 — kjerneflyt (høyest verdi, bruker flest ubrukte komponenter)
47 av 63 komponenter brukes i dag av null skjermer. B1 velges for å teste dem:

1. **PlayerHQ Analyse** (5 faner: SG/Trening/Tester/TrackMan/Statistikk) — tar hele golfviz-familien
   (9 komponenter, null bruk i dag) + Tabs + progress-familien i ekte bruk. Referanse: v2-kanon
   `ui_kits/playerhq/phq-analyse-desktop` (kun desktop fantes — denne MÅ ha 430px-variant).
2. **PlayerHQ TrackMan** (økt-liste + sesjonsdetalj m/dispersion) — eneste kategori 3 i PlayerHQ,
   og kjernen i TrackMan Truth Layer-strategien. DispersionMap/GappingChart er bygget for dette.
3. **AgencyOS Kø/Godkjenninger** (PlanAction-diff, CaddieDraft, SessionRequest) — coachens
   viktigste daglige flate etter dashboardet. ListRow + Banner + ConfirmDialog i ekte bruk.
   NB: «ko» står i utsatt-lista — innhold avklares med eier før denne startes (beslutning 2).
4. **AgencyOS Workbench** (uke-canvas per spiller, mobil + desktop) — TimeGrid-komponentens
   eneste bestiller. Kravene står i `guidelines/kodeordre-agencyos.md` punkt 6.
5. **PlayerHQ Workbench/Planlegge** — spillersidens speil av 4.

### Fase B2 — resten av PlayerHQ (mobil-først, 430px-kolonnen)
Familiene, med antall ruter de dekker:
- **Liste+detalj-familien** (~30 ruter): runder, turneringer, mål, øvelsesbibliotek, utfordringer,
  venner, dokumenter, varsler, spørsmål/meldinger til coach. Én master-detalj-mal med ListGroup.
- **Meg/innstillinger-familien** (~25 ruter): profil, abonnement/betaling, innstillinger,
  hjelp, helse, foresatte. KeyValueGrid + FormField + ListRow-toggles.
- **Fullskjerm-familien** (~10 ruter): live økt, runde-føring, test-gjennomføring, feiring.
  Egen chrome uten TabBar — ikke designet i noen kanon, trenger eget mønster.
- **Booking-flyten** (9 ruter): utsatt — venter på innholdsbeslutning (beslutning 2).
- **Gameplan/baneguide** (3 ruter): banekart + hull-detalj m/dispersion — golfviz igjen.

### Fase B3 — resten av AgencyOS (desktop-først, rail 64px)
- **Stall-familien** (~15 ruter): stall-liste, spiller-dashboard, analyse/fremgang/tester per spiller.
- **Drift-familien** (~15 ruter): kalender, live/økter, bookinger-admin, grupper. Merk: booking,
  drift og kalender står i utsatt-lista — innholdsbeslutning per seksjon (beslutning 2).
- **Administrasjon-familien** (~20 ruter): innstillinger, team/CBAC, økonomi, rapporter, e-postmaler,
  drill-editor. Økonomi er også utsatt-seksjon; delen blokkeres i tillegg av DataTable (se komponenthull).
- **AI-familien** (~8 ruter): Caddie, agenter, agent-team. AiRecap + provenance-visning
  («Hvorfor?»-kravet fra kodeordre punkt 5). «agenticos» er utsatt-seksjon — avklar innhold først.

### Fase B4 — de to små produktene
- **Foreldreportal** (11 ruter, lese-først): én rolig mal dekker nesten alt — ukerapport-prosa i
  Lora er hjemmebane for dette systemet. Alle 11 har ferdig V2-komponent i koden som innholdsfasit.
- **Auth** (12 ruter): én kort-sentrert mal (logo + FormField + Button) dekker hele familien.
- ~~Klubbflater~~ — utgått av scope, egne designprosjekter (beslutning 1).

## Komponenthull som må tettes underveis (kjent fra revisjonen 29.07)
- **DataTable** (sorterbar kolonneheader) — bygges når økonomi-/rapportskjermene i B3 designes,
  ikke før (null skjermer etterspør den i dag). Blokkerer LedgerTable, BudgetVarianceRow,
  RankedInsightList.
- Fullskjerm-chrome (B2) og master-detalj-skall (B2/B3) er nye komposisjonsmønstre, ikke nye
  komponenter — de bygges som templates, ikke i components/.
- Ikon-utvidelser går alltid inn i `Icon` (beslutning 3).

## Regler som gjelder hele ordren
1. Alle Fase A-regler i readme står: aktør-rollene (forfatter/verifikatør), Port A-kravene
   (begge moduser × alle tilstander × to containerbredder), kaskadelagene, fokuskontrakten,
   «ikke bygget ennå»-prinsippet, skjermregelen («en komponent kommer på en skjerm fordi jobben
   krever den»).
2. Hver ny skjerm leveres som `.dc.html`-template i `templates/<navn>/`, samme format som de to
   eksisterende. Nye templates registreres i readme-indeksen i samme leveranse.
3. Innholdsfasit per skjerm: V2-komponenten i repoet (`src/components/**/…V2.tsx`) viser hvilke
   data og handlinger skjermen faktisk har — designet skal dekke den virkelige jobben, ikke en
   idealisert. Den gamle v2-kanonens ui_kits-skjerm (der den finnes) er sekundær referanse for
   komposisjon. `docs/designdekning-2026-07-29.md` Del 1–5 har filsti per skjerm.
4. Ni seksjoner står som «utsatt til implementasjon» (agenticos, booking, drift, kalender, ko,
   okonomi, plan, stall-plus — se `kart/ikke-bygget-enna.md`). Innholdsbeslutning fra eier FØR
   design, per seksjon (beslutning 2). Ikke fyll dem med antatt innhold.
5. Fremdrift måles mot nevneren 223 og rapporteres i `kart/` — samme [målt]-disiplin som
   revisjonen 29.07. «Dekning x/223» i hver fremdriftsrapport.
