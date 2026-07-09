# Workbench 10/10 — konsept (Anders' bestilling 9. juli 2026)

Grunnlag: komplett funksjons-inventar fra koden (WorkbenchHybrid 1558 linjer = kanon,
én komposisjon m/ role player|coach; tre konkurrerende implementasjoner der to ryddes).
Alle funksjoner under FINNES i dag og skal med — konseptet endrer UTTRYKK og FLYT, ikke innhold.

## 1. Én flate, fem zoom-nivåer — «lerretet»

Dagens 8 faner (tek/sesongmål/maler/standardøkter/årsplan/uke/dag/økt) omorganiseres til
ETT sammenhengende lerret med fem zoom-nivåer + to sidespor:

```
MÅL-SPORET (alltid synlig topp): resultatmål → prosessmål → ukens fokus
┌──────────────────────────────────────────────────────────────┐
│ ÅR (sesongbånd/periodisering) → MÅNED → UKE → DAG → ØKT       │  zoom-lerret
└──────────────────────────────────────────────────────────────┘
VERKTØY-SPORET (venstre panel): øktbibliotek/maler · tester · teknisk plan (P1–P10)
```

- **Zoom = klikk eller klyp:** klikk en periode i årsbåndet → måneden vokser ut av den
  (delt element-transisjon); klikk en uke → ukegrid; klikk en dag → dagstidslinje; klikk
  en økt → økt-detalj i høyrepanelet (Inspector), aldri sidebytte. Breadcrumb-zoom
  øverst (År › Juli › Uke 28 › Ons › Økt) — trykk hvor som helst for å hoppe ut.
- **Mål-sporet** (Goal-modellen: OUTCOME + PROCESS finnes allerede) ligger som smal
  stripe over lerretet på ALLE nivåer: resultatmålet (NM topp 10) med nedtelling +
  prosessmålene med ukes-progresjon. Planen ses alltid MOT målene.
- **Data-bevart:** SeasonPlan/PeriodBlock = årsbåndet · scheduledAt+weekOffset = måned/
  uke · TrainingPlanSession = øktene · Goal = mål-sporet. Ingen skjemaendring.

## 2. Smooth overganger (motion-språket)

- **Zoom-transisjoner:** delt-element (perioden du klikker morfer til månedsvisningen),
  240 ms, samme kurve som resten (cubic-bezier(0.2,0,0,1)). Aldri hard sidebytte.
- **Panelene:** Inspector glir inn fra høyre (desktop) / opp som ark (mobil); palett
  kollapser til ikonstripe når du drar (mer lerret under drag).
- **Koreografert entré** per nivå (stagger 40 ms), count-up på KPI-stripen, draw-in på
  belastningsgrafen. Reduced-motion = alt øyeblikkelig.

## 3. Drag-and-drop v2

Dagens DnD (palett→dag, økt↔dag, dag→klokkeslett, persistDrop/session-move-math) beholdes
funksjonelt og løftes:
- **Løft:** kortet skalerer 1,03 + dyp skygge + 2° tilt; kilde-plassen får stiplet spøkelse.
- **Snap-guides:** gyldige slipp-soner lyser svakt (hairline-glow); dagens kapasitet vises
  live («2,5 av 3 t») mens du holder over.
- **Klarspråk-varsel under drag:** kolliderer slippet med compliance (hviledag, ACWR-sone,
  turneringsnærhet) → gul chip på slippsonen «Tett på NM — vurder lettere økt». ALDRI
  blokkering (kanon: anbefaling, aldri sperre).
- **Multi-drop:** dra en UKE-mal inn på ukegridet → alle øktene lander animert i sekvens.
- **Mobil-motpart (ny komponentfamilie):** langt trykk → økta løftes → «Flytt til»-ark
  nederst med dag/tid-velger (44 px mål). Dra-på-touch er reserve, arket er primær.

## 4. Økt-preview

- **Hover (desktop) / langtrykk (mobil)** på enhver økt-brikke → flytende preview-kort:
  øvelsesliste m/ mål, AK-formel-chips (akse/L-fase/CS/PR/miljø), varighet, compliance-
  status, «sist gjennomført»-kvalitet. Uten å forlate lerretet.
- **Hurtighandlinger i previewen:** Rediger (Inspector) · Dupliser · Flytt · Til mal.

## 5. Stats/SG-føring — «Føring uten friksjon»

Dagens tilfang: liveSnapshot/tapper (trening), Round m/ granulære SG-felter, BrukerSgInput,
TigerFive (kun visning). Løftet:
- **Trening (live):** tapper-modus v2 — helskjerm, tommel-soner (Treff høyre / Bom venstre),
  haptisk-stil feedback (puls-animasjon), auto-lagring per tap til liveSnapshot, drill-mål
  som ring som fylles. Byttes drill → sveip.
- **Konkurranse (runde):** hull-for-hull hurtigføring: score-stepper + 4 SG-hurtigknapper
  (Tee/Innspill/Nærspill/Putt: vinn/tap) per hull — 3 sekunder per hull. TigerFive-hendelser
  som ett-trykks-chips (3-putt, dobbel+, …). Fyller Round-feltene som allerede finnes.
- **Etterregistrering:** BrukerSgInput-skjema forenkles til fire slidere + total — og
  «hent fra TrackMan»-knapp der kilde finnes.

## 6. Gamification — «Progresjon, ikke poeng»

Bygger KUN på eksisterende modeller (Achievement m/ kind-strenger, streak.ts,
DrillChallenge/ChallengeParticipant, Goal, P-milepæler, CS-nivåer). Whoop-klassen, aldri barnslig:
- **Streak-flamme** i Hjem-KPI (finnes: STREAK_7/14) med «beste: 21»-skygge-tall.
- **Nivåbånd:** CS-stigen og P-milepælene ER nivåsystemet — vis dem som progresjonsbånd
  med neste-krav («2 krav igjen til P6 godkjent»). Milepæl fullført → rolig konfetti-puls
  i lime (én gang, 800 ms) + Achievement-kort i feed.
- **Prosessmål-ringer:** ukens prosessmål som ringer der fullførte økter fyller
  (gjennomføring finnes i adherencePct).
- **Utfordringer:** DrillChallenge-leaderboard som stille modul i Gjør-fanen; venner via
  Friendship. Rank-endring animeres (pil opp).
- **Aldri:** XP-tall, coins, maskoter, støyende badges. Feiring er typografisk og kort.

## 7. Roller

- **Coach (AgencyOS):** alt over + roster-hopper i toppen (SpillerGruppeVeksler),
  publiser-flyt (DRAFT→PENDING_PLAYER m/ varsel), plan-kvalitetskort, AI-panelet
  (generer/periodiser, agent-forslag m/ full anbefalingskontrakt), overstyr m/ historikk.
- **Spiller:** samme lerret (kan bygge/justere/publisere egen plan — som i dag), coach-
  publiserte uker merket; «be om endring» på enhver økt; godta/avvis plan m/ kommentar.
- Delt komposisjon = én implementasjon m/ role-prop (som WorkbenchHybrid i dag) — kanon.

## 8. Mobil (alltid, egne komponenter der mønsteret krever)

Nye mobil-komponenter (flate-skille-regelen): ZoomBrødsmule (kompakt), UkeListe (dag-for-
dag m/ sveip), FlyttTilArk (DnD-erstatter), TapperV2 (tommel-soner), HullFørerArk
(konkurranseføring), PreviewArk (økt-preview som bunn-ark), MålStripe (kollapser til chip).

## 9. Hjelpesystemet «?» (Anders 9. juli — brukervennlighet for nye brukere)

- **Hver funksjon/verdi som ikke er selvforklarende får et diskret «?»** (HjelpPopover-
  komponenten, finnes i v2-struktur): 14 px sirkel i muted, hover/trykk → kort popover
  med 1–3 setninger i KLARSPRÅK. Eksempler: SG («Strokes Gained — hvor mange slag du
  vinner eller taper mot referansenivået, per kategori»), ACWR, CS-nivå, L-fase,
  P-milepæl, AK-formelen, adherence.
- Regler: forklaringen bruker ordboken, aldri sirkeldefinisjon; maks 3 setninger; alltid
  et eksempel med tall der det passer; «Lær mer»-lenke kun når en dypere side finnes.
- Førstegangsbrukere: første besøk på en skjerm viser 2–3 «?» med svak puls én gang —
  aldri tvungen omvisning.
- Innholdet vedlikeholdes ETT sted: `docs/redesign-v2/hjelpetekster.md` (bygges under
  fase 6) — samme tekst i mockup og app.

## 10. ORDBOK-REGELEN (LÅST — Anders 9. juli)

**Under design OG bygging skal ordboken (`skills/ak-terminologi/ordbok.md` i design-
prosjektet) alltid brukes. ALDRI finn opp egne ord og uttrykk.** Gjelder all UI-tekst,
hjelpetekster, chips, tomtilstander og varsler. Kjente ankere: Nærspill (aldri «kort
spill») · Situasjon (aldri «Arena») · P1–P10/MORAD · brutto score · anbefaling (aldri
sperre/brudd-språk) · «økt» (aldri «øving»). Ved tvil: slå opp i ordboken eller spør
Anders — aldri gjett. Terminologi-lint (kvalitetsplan §8) håndhever forbudsordene.

## 11. Fysisk treningsplan — verdensledende (Anders 9. juli)

Datagrunnlag som finnes: `FysOkt`/`FysOvelseRad` (skjema), fysisk.html-modulen (AgencyOS-
kit, sett×reps-steppere, ACWR live, CS-kobling) + phq-fysisk.jsx (spiller-speil). Løftet:

- **Fysisk plan som kilde i Workbench:** i verktøy-sporet velges «Fysisk treningsplan» →
  planens økter (styrke/rotasjon/mobilitet/kondisjon) vises som brikker → **dras rett inn
  på dager i kalenderen** (samme DnD v2 som golf-øktene, samme kapasitets-/ACWR-varsling).
- **Øvelsesbanken utvides med fysiske øvelser:** samme bank som driller (OvelsesbankModal),
  ny type FYSISK med felter: muskelgruppe/bevegelse, utstyr, video, standard sett×reps,
  CS-kobling. Coach og spiller kan legge til.
- **Styrkeøkt-struktur:** Oppvarming → Hoveddel → (Avslutning). HVER øvelse — også
  oppvarming — logges manuelt med **vekt × reps per sett** (stepper, 44 px, forrige økt
  som spøkelsesverdi «sist: 60 kg × 8»). Økta regner live: **total belastning (tonnasje,
  kg løftet) + volum (sett × reps)** — vises som count-up-hero når økta avsluttes, og
  mates inn i ACWR/ukevolum.
- **Kondisjonsøkt-struktur:** Oppvarming (varighet + sone) → **Hovedaktivitet: X serier ×
  Y minutter i puls Z / pulssone S1–S5** (m/ pause-definisjon) → Nedtrapping. Bygges med
  intervall-blokker som kan dupliseres/dras. Logging: faktisk puls per intervall (manuell
  føring; felt for snitt/makspuls), økt-total = tid i sone.
- **Nye v2-komponenter:** SettRepsLogger (vekt×reps m/ spøkelsesverdi), TonnasjeHero,
  IntervallBlokk (serier×tid×sone), PulsSoneVelger (S1–S5-bånd), FysOktKort (brikke til
  DnD m/ type-ikon), MuskelgruppeChip.
- **Verdensledende-listen** (det som skiller oss): forrige-verdier overalt (aldri huske
  selv) · auto-progresjon-forslag («+2,5 kg neste gang» som anbefaling) · belastning
  kobles til golf (ACWR på tvers av golf+fys — finnes i fysisk-modulen) · CS-koblingen
  (styrke → klubbhastighet-mål) · WANG-regelen (mandag etter turnering = alltid FYS)
  respekteres i DnD-varslene.

## Leveranseplan

1. Mockups desktop+mobil: coach-Workbench (år→uke→dag→økt-zoomen) + spiller-speilet — retning C, v2-biblioteket + de nye komponentene over.
2. Interaktiv prototype i designprosjektet (zoom + DnD-følelse demonstreres).
3. Dommer-runde (kvalitetsplan §17) til ≥9 → Anders godkjenner → bygges i appen (fase 6-bølge 2).
