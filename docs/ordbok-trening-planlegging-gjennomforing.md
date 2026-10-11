# Ordbok: trening, planlegging og gjennomføring

**Status 11.10.2026.** Utarbeidet fra koden i `src/` og `prisma/schema.prisma` ved commit `166ab799a`. Ingen kode eller skjermtekst er endret. Dokumentet beskriver hva appen faktisk sier i dag, og avdekker uenigheter. Det er ikke en ny fasit.

**Forutsetning som ikke stemte:** bestillingen viser til `docs/ordbok-ak-golf-konsept.md`. Den fila finnes ikke i repoet. Eneste master for språk og treningsplanlegging er [Treningsplanlegging og språk](treningsplanlegging.md). `docs/ordbok.md` er bare en peker dit.

## Innhold

1. Hvordan bruke denne ordboken
2. Planhierarkiet
3. Slik settes en økt opp
4. Slik settes et mål
5. Slik driller man
6. Gjennomføring og evaluering
7. Roller og tiltaleform
8. Statusord, knapper og verb
9. A til Å-register over alle termer
10. Konflikter og anbefalinger
11. Ordliste for eksterne flater
12. Spørsmål til Anders

## 1. Hvordan bruke denne ordboken

1. Denne fila viser hva appen sier i dag, med eksakt streng og kilde. Hva ordet skal være avgjøres av [masteren](treningsplanlegging.md) og av [beslutningene](../.claude/rules/beslutninger.md); ved konflikt vinner [produktreglene](platform/BUSINESS-RULES.md).
2. Sitater står i «gåseøyne» med `fil:linje`. Linjenumre gjelder commit `166ab799a` og flytter seg når kode endres. «ikke funnet i kode» betyr null treff i `src/`.
3. Status i registeret: **Kanonisk** (masteren eller en bindende beslutning sier dette ordet, eller ordet er det eneste appen bruker for begrepet og strider ikke mot masteren) · **Variant brukt i appen** (finnes i skjermtekst, men er ikke valgt ord) · **Foreldet** (utgått i masteren, men fortsatt i kode eller tekst) · **Forbudt** (masteren sier at ordet ikke skal brukes i ny skjermtekst) · **Ikke i kode, bare i dokument**.
4. Seksjon 10 er den viktigste: der står hver uenighet med anbefaling. Seksjon 11 er utvalget som gfgkjunior.no kan bruke. Seksjon 12 er det koden ikke kan svare på.
5. Avvik fra bestillingen: (a) bestillingen sier «Spesialiseringsperiode», men beslutningen 28.09.2026 sier **Spesialperiode**, og «Spesialisering» og «Spesialiseringsperiode» skal ikke brukes. Jeg følger beslutningen. (b) Bestillingen nevner fem områder (TEE, INNSPILL, NÆRSPILL, PUTT, BANE); koden har 19 områdekoder (se seksjon 5). (c) «Simulator» vises som sted i koden (se seksjon 5 og konflikt K16).

## 2. Planhierarkiet

Rekkefølgen i masteren (kap. 5) er Årsplan → Periode → Måned → Uke → Økt → Øvelse. «Månedsplan» og «Øktplan» er ikke egne objekter i Workbench.

| Nivå | UI-tekst | Prisma-navn | Hvem ser det |
|---|---|---|---|
| Årsplan | «Årsplan» `src/components/workbench/WorkbenchSamlet.tsx:30` | `SeasonPlan` (`prisma/schema.prisma:3597`) | Spiller (PlayerHQ, fanen Plan) og coach (AgencyOS, Workbench) |
| Sesong (visning av året) | «Sesong {år}» `src/lib/domain/workbench/labels.ts:131` | `SeasonPlan.year` | Spiller og coach |
| Sesongkart (tidslinje over året) | «Sesongkart» `src/components/workbench/WorkbenchSesongkart.tsx:54` | ingen egen modell | Spiller og coach |
| Gruppas årsplan | «Gruppas årsplan» `src/components/admin/precision/AG11Gruppe.tsx:56` | `GroupPeriodBlock` (`prisma/schema.prisma:3648`) | Coach; spillere i gruppa arver |
| Periode | «Periode» `src/lib/domain/workbench/labels.ts:100` | `PeriodBlock` (`prisma/schema.prisma:3618`), enum `PeriodeType` (`prisma/schema.prisma:442`) | Spiller og coach |
| Måned | «Måned» `src/lib/domain/workbench/labels.ts:98` | ingen modell (`MonthPlan` finnes ikke i schema) | Spiller og coach |
| Uke | «Uke» `src/lib/domain/workbench/labels.ts:97` | `WeekPlan` (`prisma/schema.prisma:3682`) | Spiller og coach |
| Ukeplan | «Ukeplan» `src/lib/domain/workbench/labels.ts:86` | `WeekPlan` + `planningDetails` (JSON) | Coach (ark «Ukeplan og mål» `src/components/admin/precision/AG11Ark.tsx:386`) |
| Økt | «Økt» `src/lib/domain/workbench/labels.ts:101` | `WorkbenchSession` (`prisma/schema.prisma:6802`). Eldre: `TrainingPlanSession` (`prisma/schema.prisma:1447`), `TrainingSessionV2` (`prisma/schema.prisma:4166`) | Spiller og coach |
| Øvelse | «Øvelse» `src/lib/domain/workbench/labels.ts:177` | `WorkbenchDrill` (`prisma/schema.prisma:6888`), bibliotek: `ExerciseDefinition` (`prisma/schema.prisma:1489`) | Spiller og coach |
| Øktplan | ikke funnet i kode | – | – |

**Flater og nivåvalg i Workbench**

| Element | UI-tekst | Kilde |
|---|---|---|
| Flater (samlet Workbench) | «Sesongkart» · «Ukeverksted» · «Trenerbord» · «Stats» | `src/components/workbench/WorkbenchSamlet.tsx:17` |
| Nivåpiller | «År» · «Periode» · «Måned» · «Uke» · «Økt» · «Volum» · «Målsetninger» | `src/lib/domain/workbench/labels.ts:97-101`, `src/components/workbench/VisningPiller.tsx:16-17` |
| Tidsnivå (overskrift) | «Tidsnivå» | `src/lib/domain/workbench/labels.ts:91` |
| Plan-hub (maler og øvelser, coach) | «Plan-hub» | `src/components/admin/precision/AG14PlanHub.tsx:189` |
| Plan-hub, faner | «Ukemaler» · «Program» · «Standardøkter» · «Øvelser» | `src/components/admin/precision/AG14PlanHub.tsx:151-154` |
| Treukerssyklus (tre uker om gangen) | «Treukerssyklus» | `src/components/workbench/WorkbenchTreukerssyklus.tsx:57` |
| Teknisk plan | «Teknisk plan» | `src/components/team-norway/tn-shell.tsx:275` |
| Nivå på målsetning | «År» · «Periode» · «Måned» · «Uke» · «Økt» | `src/lib/domain/maal-plannivaa.ts:23-26` |

**Periodetyper** (masteren kap. 6, samme sett i koden): «Grunnperiode» · «Spesialperiode» · «Turneringsperiode» · «Evaluering» · «Testuke» · «Ferie» · «Treningssamling» · «Heldagssamling» · «Restitusjon». Kilde: `src/lib/labels/taxonomy.ts:38-46`, Prisma-koder `GRUNN`, `SPESIAL`, `TURNERING`, `EVALUERING`, `TESTUKE`, `FERIE`, `TRENINGSSAMLING`, `HELDAGSSAMLING`, `RESTITUSJON` (`prisma/schema.prisma:442`). Databasefeltet på perioden heter `lPhase` (`LPhase`, `prisma/schema.prisma:85`) av historiske grunner, selv om innholdet er periodetype.

**Opprett årsplan** (Workbench): steg «Utgangspunkt» · «Tidsrom» · «Navn», valg «Tom plan» og «Kopi av forrige årsplan», felt «Fra dato» · «Til dato» · «Navn» · «Sammendrag» (`src/components/workbench/WorkbenchAar.tsx:142-149`). Sesonggrenser lagres med «Lagre årsplan» (`src/components/workbench/WorkbenchSesongkart.tsx:91`).

**Mal-begrepet er spredt over tre lagringssteder:** `PlanTemplate` (`prisma/schema.prisma:1618`, ukemal og program), `OktMal` (`prisma/schema.prisma:4519`, standardøkt) og `WorkbenchSession.isTemplate` (økt lagret som mal, «Lagre som mal» `src/lib/domain/workbench/labels.ts:225`). Se konflikt K22.

## 3. Slik settes en økt opp

Hovedveien er arket «Ny økt» i samlet Workbench (klikk i ukekalenderen). Feltene i rekkefølge:

| # | Felt (etikett) | Detalj | Kilde |
|---|---|---|---|
| 1 | «Pyramide» | Fysisk · Teknisk · Golfslag · Spill · Turnering (FYS, TEK, SLAG, SPILL, TURN) | `src/components/admin/precision/AG11Ark.tsx:273` |
| 2 | «Tittel» | Plassholder «F.eks. Wedge 60–100 m». Feil: «Økten må ha en tittel.» | `src/components/admin/precision/AG11Ark.tsx:277`, `src/lib/domain/workbench/labels.ts:243-245` |
| 3 | «Formål» | Fritekst, maks 1000 tegn. Kalles «Hensikt» i formelvisningen | `src/components/admin/precision/AG11Ark.tsx:278`, `src/lib/domain/workbench/labels.ts:108` |
| 4 | «Sted» | Maks 160 tegn. Visning: «Sted for økten» | `src/components/admin/precision/AG11Ark.tsx:279`, `src/components/workbench/WorkbenchOkt.tsx:129` |
| 5 | «Øktens målsetning» | Maks 500 tegn. Plassholder i spillerens ark: «Hva skal økten oppnå?» | `src/components/admin/precision/AG11Ark.tsx:280`, `src/components/portal/v2/WorkbenchV2Sheets.tsx:761` |
| 6 | «Dato» | – | `src/lib/domain/workbench/labels.ts:244` |
| 7 | «Start» | Klokkeslett, steg på 30 min. Feil: «Ugyldig starttidspunkt.» | `src/components/admin/precision/AG11Ark.tsx:283`, `src/lib/domain/workbench/labels.ts:246` |
| 8 | «Varighet» | Valg 30, 45, 60, 90, 120, 180 min | `src/components/admin/precision/AG11Ark.tsx:284` |
| 9 | «Gjenta?» | «Ikke gjenta» eller ukentlig i 2, 4, 6, 8 eller 12 uker | `src/components/admin/precision/AG11Ark.tsx:286`, `src/components/admin/precision/AG11Ark.tsx:288` |

Knapper: «Legg inn» (`src/components/admin/precision/AG11Ark.tsx:269`) og «Avbryt» (`src/lib/domain/workbench/labels.ts:161`). Økten lagres som utkast: «Økten lagres som utkast. Den er kun synlig for deg til du publiserer.» (`src/lib/domain/workbench/labels.ts:241`). Hint: «Formelen settes på første øvelse etter Lagre — ikke her.» (`src/lib/domain/workbench/labels.ts:271`).

**Det som ikke finnes som felt i Workbench:**

| Forventet | Funn |
|---|---|
| Gruppe | Bare i gruppeøkt-arket: felt «Gruppe» (`src/components/workbench/WorkbenchTrenerbord.tsx:67`). Ikke i vanlig ny-økt-ark |
| Periode | Ikke et felt på økta; perioden utledes av datoen mot `PeriodBlock` |
| Blokkene Oppvarming · Hoveddel · Avslutning | ikke funnet i Workbench. Finnes i WANG-skjermen «Hoveddel · {n} øvelser» (`src/app/team-wang/_components/okt-detalj.tsx:187`) og «Oppvarming» (`src/app/team-wang/_components/okt-detalj.tsx:295`), og som eksempelstruktur i offentlig GFGK-tekst (`del: "Avslutning"` `src/app/gfgk-junior/_data/gfgk-junior-data.ts:365`) |
| Coach-notat som skrivefelt | Bare lesevisning «Coach-notat» (`src/lib/domain/workbench/labels.ts:276`) |
| Suksesskriterium | ikke funnet i kode; nærmeste er «Resultatkrav» på øvelsen (`src/components/workbench/OvelseSkjema.tsx:295`) |

**Rediger økt** (ark): seksjon «Tid» (`src/components/admin/precision/AG11Ark.tsx:394`) med knapp «Flytt» (`src/components/admin/precision/AG11Ark.tsx:184`), og «Øktens innhold» (`src/components/admin/precision/AG11Ark.tsx:143`) med Formål · Sted · Øktens målsetning med knapp «Lagre øktinnhold» (`src/components/admin/precision/AG11Ark.tsx:149`). Åpne live: «Åpne økta» (`src/components/admin/precision/AG11Ark.tsx:123`). Endre i serie: «Kun denne» · «Denne og fremover» · «Hele serien» (`src/lib/domain/workbench/labels.ts:219-221`).

**Øvelser i økta:** «Øvelser» (`src/lib/domain/workbench/labels.ts:177`), «Legg til øvelse» (`src/lib/domain/workbench/labels.ts:163`), «Flytt opp» · «Flytt ned» · «Fjern øvelse» (`src/lib/domain/workbench/labels.ts:187-189`).

**Etter økta (belastning):** «Belastning (sRPE)» · «Opplevd anstrengelse» · «Planlagt tid» · «Faktisk tid» · «Beregnet belastning» (`src/components/admin/precision/AG11Ark.tsx:194-199`).

**Spillervisning mot coachvisning**

| | Spiller | Coach |
|---|---|---|
| Opprette/endre | Eget ark med «Målsetning» (`src/components/portal/v2/WorkbenchV2Sheets.tsx:757`) | Ark med «Formål» og «Øktens målsetning» (`src/components/admin/precision/AG11Ark.tsx:278-280`) |
| Leser målet som | «Mål for økta» (`src/components/portal/live/PlanSessionBrief.tsx:17`), «Mål for økten» (`src/components/portal/precision/PH10Plan.tsx:165`), «Målsetning» (`src/components/portal/precision/PH03Oktark.tsx:105`) | «Øktens målsetning» `src/components/admin/precision/AG11Ark.tsx:146` |
| Forslag fra coach/gruppe | «Forslag fra coach» · «Godta» · «Avvis» (`src/lib/domain/workbench/labels.ts:278`) | «Venter på spilleren» · «Godtatt av spilleren» · «Avvist av spilleren» (`src/lib/domain/workbench/labels.ts:289-291`) |
| Publisering | ser økta først når den er publisert | «Publiser» (`src/lib/domain/workbench/labels.ts:157`) → «Publiser til spilleren?» (`src/lib/domain/workbench/labels.ts:191`) → «Trekk tilbake» (`src/lib/domain/workbench/labels.ts:159`) |

## 4. Slik settes et mål

Målsetning finnes på fem nivåer i teorien (år, periode, måned, uke, økt, masteren kap. 5.3), men som egne ord og felt finnes bare spillermålet (`Goal`), økt-målet og øvelsesmålet. «Ukemål», «Månedsmål», «Årsmål» og «Turneringsmål» finnes ikke i kode. Nivået ligger i `planNivaa` på `Goal`.

| Måltype | Etikett i appen | Prisma | Kilde |
|---|---|---|---|
| Spillermål, side | «Målsetninger» | `Goal` (`prisma/schema.prisma:2560`) | `src/components/portal/precision/PH19Malsetninger.tsx:41` |
| Resultatmål | «Resultatmål» | `GoalCategory.OUTCOME` | `src/components/portal/precision/PH19Enkeltmal.tsx:191` |
| Prosessmål | «Prosessmål» | `GoalCategory.PROCESS` | `src/components/portal/precision/PH19Enkeltmal.tsx:199` |
| Sesongmål | «Sesongmål» (Meg), «Mål for sesongen» (profil) | `Goal` | `src/components/portal/v2/MegV2.tsx:477`, `src/components/portal/v2/MegProfilV2.tsx:432` |
| Økt-mål | «Øktens målsetning» | `WorkbenchSession.maalsetning` | `src/components/admin/precision/AG11Ark.tsx:146` |
| Øvelses-mål (trinn 8) | «8 · Mål» med «Målsetning», «Målemetode», «Resultatkrav», «Notat» | `akFormel.detaljer.mal` | `src/components/workbench/OvelseSkjema.tsx:291-296`, `src/lib/domain/workbench/labels.ts:110` |
| Periodemål (WANG) | «Fokusområde» (spiller/coach), «Mål for perioden» (årsplan) | `GroupPeriodGoal` (`prisma/schema.prisma:3723`) | `src/app/team-wang/coach/iup/[elevId]/iup-samtale.tsx:519`, `src/app/team-wang/coach/coach-arsplan.tsx:809` |
| Kompetansemål (Udir, WANG) | «Kompetansemål» | `CompetenceGoal` (`prisma/schema.prisma:3871`) | `src/app/team-wang/_components/arsplan-2026-27/arsplan-shell.tsx:31` |
| Turneringsmål (coach) | «Mål og strategi» | `WorkbenchTournamentGoal` (`prisma/schema.prisma:7184`) | `src/components/admin/precision/AG11Moduler.tsx:297` |

**Felt når spilleren endrer et mål** (`src/components/portal/precision/PH19Enkeltmal.tsx`): «Tittel» (`:205`), «Type» (`:216`), «Målverdi» (`:246`), «Frist» (`:255`), «Planleggingsnivå» (`:266`), «Treningskategori» (`:280`), «Test» med «Velg test», «SG-område» (`:236`). Typene: «Handicap-mål» · «Runder per måned» · «SG-område» · «Øktfrekvens» · «Testresultat» · «Fritekst» (`:34`).

**Knapper:** «Sett første mål» (`src/components/portal/precision/PH19Malsetninger.tsx:116`), «Endre mål» (`src/components/portal/precision/PH19Enkeltmal.tsx:604`), «Marker som oppnådd» (`src/components/portal/precision/PH19Enkeltmal.tsx:614`), «Avbryt mål» (`src/components/portal/precision/PH19Enkeltmal.tsx:624`), «Lagre endringer» (`src/components/portal/precision/PH19Enkeltmal.tsx:320`), «Lagre målene» (`src/components/portal/v2/AiMalByggerV2.tsx:454`).

**Tom-tilstand og feil:**

| Situasjon | Tekst | Kilde |
|---|---|---|
| Ingen mål på Målsetninger-siden | «Ingen målsetninger ennå» + «Lag målsetningene sammen med coachen i Workbench.» | `src/components/portal/precision/PH19Malsetninger.tsx:148-149` |
| Ingen mål i Meg | «Ingen mål satt» | `src/components/portal/v2/MegV2.tsx:488` |
| Ingen mål for coach | «Ingen aktive mål» | `src/components/portal/v2/SpillerDetaljV2.tsx:199` |
| Workbench, nivået Målsetninger | «Ingen målsetninger» | `src/components/admin/precision/AG11Workbench.tsx:335` |
| Henting feilet | «Målsetningene kunne ikke hentes» | `src/components/portal/precision/PH19Malsetninger.tsx:60` |
| Validering, mål-bygger | «Beskriv målet» · «Velg minst ett mål» | `src/app/portal/ai/mal-bygger/actions.ts:22`, `src/app/portal/ai/mal-bygger/actions.ts:30` |

**Evaluering etterpå (ord):**

| Hva | Ord i appen | Kilde |
|---|---|---|
| Lagret status på spillermål | `ACTIVE` · `ACHIEVED` · `ABANDONED`, vist som «Aktivt» · «Oppnådd» · «Avbrutt» | `src/components/portal/precision/PH19Enkeltmal.tsx:483` |
| Beregnet fremdrift (liste) | «På sporet» · «Bak plan» · «Nær mål» · «Oppnådd» · «Ingen data ennå» | `src/app/portal/mal/page.tsx:37-46` |
| Periodemål (WANG), matcher masteren | «Ikke startet» · «På vei» · «Nådd» | `src/app/team-wang/_components/ak-primitiver.tsx:71-73` |
| Teknisk plan, kølle-mål | «Oppnådd» · «På vei» · «Ikke begynt» | `src/components/teknisk-plan/sidebar.tsx:112` |
| Etter fire uker (bare WANG/Team Norway) | «Har du fulgt prosessmålene de fire siste ukene?» (`src/components/portal/precision/PHIUP01Fireukerssjekk.tsx:248`) med svar «Ja» · «Delvis» · «Nei» | `src/lib/iup/fireukerssjekk.ts:91` |
| Sesongevaluering | «Utviklingssjekk», «Sesongevaluering» | `src/components/portal/precision/iup-evaluering.tsx:24` |
| Måloppnåelse i økt | ikke funnet som egen UI-streng; kun «Ingen måloppnåelse eller Strokes Gained er beregnet her.» | `src/components/portal/live/SessionSummary.tsx:214` |

Tre statusskalaer for samme begrep (mål). Bare den tredje følger masteren (kap. 4.3: «Ikke startet · På vei · Nådd»). Se konflikt K2.

## 5. Slik driller man

Øvelsen planlegges i åtte trinn (masteren kap. 9). Begge øvelsesskjemaene i koden følger dem, og nummereringen står i selve skjemaet.

| Trinn | Etikett i Workbench-skjemaet | Etikett i coachens øvelsesark | Kilde |
|---|---|---|---|
| 1 | «1 · Hensikt» | «1 · Pyramide» | `src/components/workbench/OvelseSkjema.tsx:119`, `src/components/admin/precision/AG14Ovelseark.tsx:122` |
| 2 | «2 · Treningsområde» | «2 · Treningsområde» | `src/components/workbench/OvelseSkjema.tsx:140` |
| 3 | «3 · Sted og treningsmiljø» | «3 · Sted» | `src/components/workbench/OvelseSkjema.tsx:150`, `src/components/admin/precision/AG14Ovelseark.tsx:132` |
| 4 | «4 · Måleutstyr» | «4 · Måleutstyr» | `src/components/workbench/OvelseSkjema.tsx:170` |
| 5 | «5 · Gjennomføring» | «5 · Gjennomføring» | `src/components/workbench/OvelseSkjema.tsx:181` |
| 6 | 6 · Press (settes sammen av «6 ·» og feltnavnet `UI.formelPress`) | samme | `src/components/workbench/OvelseSkjema.tsx:228` |
| 7 | «7 · Mengde» | «7 · Mengde» | `src/components/workbench/OvelseSkjema.tsx:238` |
| 8 | «8 · Mål» | «8 · Mål» | `src/components/workbench/OvelseSkjema.tsx:291` |

Formelen som merker hver øvelse er `PYRAMIDE_OMRAADE_MOTORIKK_BELASTNING_PRESS`, eksempel `TEK_CHIP_TRENINGSOMRAADE_ALENE` (`src/lib/domain/ak-formel-v2.ts:8`). Skjermvisningen kaller den «AK-FORMEL V2» (`src/components/admin/precision/AG14Ovelseark.tsx:196`).

### 5.1 Øvelse, bibliotek og kategorier

| Begrep | UI-tekst | Kilde |
|---|---|---|
| Biblioteket (spiller) | «Øvelsesbank» · «Alle øvelser er navngitt etter AK-formelen.» · «Fra coach» · «Mine» | `src/components/portal/precision/PH13DrillBank.tsx:132`, `src/components/portal/precision/PH13DrillBank.tsx:133`, `src/components/portal/precision/PH13DrillBank.tsx:405` |
| Biblioteket (Workbench-kilder) | «Øvelsesbank» · «Maler» · «Programmer» | `src/lib/domain/workbench/labels.ts:208-210` |
| Ny/rediger (coach) | «Ny øvelse» · «Rediger øvelse» · «Opprett øvelse» · «Lagre øvelse» | `src/components/admin/precision/AG14Ovelseark.tsx:110-112` |
| Øvelse i økt | «Legg til øvelse» · «Lagre øvelse» · «Navn» | `src/lib/domain/workbench/labels.ts:163`, `src/lib/domain/workbench/labels.ts:273`, `src/lib/domain/workbench/labels.ts:180` |
| Tom bibliotek (coach) | «Ingen øvelser ennå» | `src/components/admin/precision/AG14PlanHub.tsx:180` |
| Kategori A–K (spillernivå) | brukes i skjermtekst som «Min kategori» / «Max kategori» i en eldre admin-side; Prisma-enum `NgfKategori` A–K | `src/components/admin/v2/AdminDrillDetaljV2.tsx:175-176` |
| Øvelsesnivå | ikke funnet i kode som eget begrep. Kolonnene `csMin`/`csMax` på `ExerciseDefinition` er CS-skala (uavklart, se 5.9) | `prisma/schema.prisma:1489` |
| P-posisjon | «P1.0» til «P10.0»; navn som «Treffpunktet». Ingen nivå på P-posisjon i kode | `src/lib/taxonomy.ts:146-155` |

### 5.2 Treningsområde

Koden har **19 områdekoder** (`src/lib/domain/ak-formel-v2.ts:73`), ikke fem. `NAERSPILL` finnes som gruppe (`src/lib/domain/ak-formel-v2.ts:50`) og «Nærspill» som fane (`src/components/teknisk-plan/constants.ts:21-26`), ikke som områdekode.

| Familie | Områder (UI-tekst) | Kilde |
|---|---|---|
| Utslag | «Utslag» (`TEE_TOTAL`) | `src/lib/domain/ak-formel-v2.ts:98` |
| Innspill | «Innspill 200 m og lengre» · «Innspill 150–200 m» · «Innspill 100–150 m» · «Innspill 50–100 m» | `src/lib/domain/ak-formel-v2.ts:99-102` |
| Nærspill | «Chip» · «Pitch» · «Lob» · «Bunker» | `src/lib/domain/ak-formel-v2.ts:103-106` |
| Putting | «Putt 0–3 fot» · «Putt 3–5 fot» · «Putt 5–10 fot» · «Putt 10–25 fot» · «Putt 25–40 fot» · «Putt 40+ fot» | `src/lib/domain/ak-formel-v2.ts:107-112` |
| Fysisk | «Styrke» · «Kondisjon» · «Bevegelighet» | `src/lib/domain/ak-formel-v2.ts:113-115` |
| Spill | «Banespill» (`BANE`) | `src/lib/domain/ak-formel-v2.ts:116` |
| Faner i teknisk plan | «Utslag» · «Innspill» · «Nærspill» · «Putting» | `src/components/teknisk-plan/constants.ts:19-24` |

### 5.3 Sted og treningsmiljø

| Begrep | UI-tekst | Kilde |
|---|---|---|
| Hovedvalg for sted | «Utendørs treningsområde» · «Golfbane» · «Innendørs golf» · «Fysisk treningssted» · «Hjemme / eget sted» · «Annet sted» | `src/lib/domain/workbench/ovelse-detaljer.ts:49-54` |
| Delvalg under «Innendørs golf» (`src/lib/domain/workbench/ovelse-detaljer.ts:51`) | «Simulator» · «Golfstudio» · «Innendørs treningshall» | `src/lib/domain/workbench/ovelse-detaljer.ts:60` |
| Treningsmiljø (felt) | «Treningsmiljø» med hint «Hvor og i hvilken situasjon treningen gjennomføres.» | `src/lib/domain/workbench/labels.ts:106`, `src/lib/domain/workbench/labels.ts:112` |
| Treningsmiljø (verdier) | «Innendørs» · «Treningsområde» · «Bane» · «Konkurranse» | `src/lib/domain/ak-formel-v2.ts:193-196` |
| Miljø (miljøverdi på økt) | «Range» · «Bane» · «Studio» · «Hjem» · «Simulator» · «Gym» | `src/lib/labels/taxonomy.ts:29-34` |

**Avvik mot regelen om at Simulator aldri vises som sted:** «Simulator» vises som konkret sted under «Innendørs golf» og «Simulator» (`src/lib/domain/workbench/ovelse-detaljer.ts:51-60`) og som miljøverdi «Simulator» (`src/lib/labels/taxonomy.ts:33`). «TM Simulator» finnes ikke i kode. Masteren selv lister «TM Simulator» som eksempel på sted i trinn 3 (`docs/treningsplanlegging.md:425`). Se K16 og spørsmål 4.

### 5.4 Læringssteg, hastighet, teknisk fokus

| Begrep | UI-tekst | Kilde |
|---|---|---|
| Læringssteg (felt) | «Læringssteg» med hint «Læringssteg: uten ball → lav hastighet → automatikk.» | `src/lib/domain/workbench/labels.ts:105`, `src/lib/domain/workbench/labels.ts:111` |
| Verdier | «Uten ball» · «Lav hastighet» · «Automatikk» | `src/lib/domain/ak-formel-v2.ts:143-145` |
| Hastighet | «Hastighet» med «{h} % av Club Speed», valg 25 · 50 · 75 · 100 | `src/components/workbench/OvelseSkjema.tsx:192-195` |
| Teknisk fokus | «Teknisk fokus» med hint «Ett fokus per øvelse» | `src/components/workbench/WorkbenchOkt.tsx:100` |
| Teknisk fokus (verdier) | «Sikte og oppstilling» · «Startretning» · «Kurve» · «Høyde» · «Treffpunkt» · «Lengdekontroll» · «Spinn» | `src/lib/domain/ak-formel-v2.ts:272-278` |
| Sandtrinn (bunker) | «Sandtrinn» (`src/components/workbench/OvelseSkjema.tsx:210`) · «Uten ball i sanden» · «Med ball» | `src/lib/domain/ak-formel-v2.ts:296-297` |

Læringssteg gjelder bare Utslag og Innspill (`LÆRINGSSTEG GJELDER BARE FULLSVING I TEK OG SLAG` `src/components/admin/precision/AG14Ovelseark.tsx:152`).

### 5.5 Treningsmåte (practice type)

| Kodeverdi | Etikett i øvelsesskjema (kanonisk) | Kilde |
|---|---|---|
| `BLOKK` | «Blokktrening» | `src/lib/domain/workbench/ovelse-detaljer.ts:109` |
| `VARIABEL` | «Variasjonstrening» | `src/lib/domain/workbench/ovelse-detaljer.ts:110` |
| `KONKURRANSE` | «Konkurranseform» | `src/lib/domain/workbench/ovelse-detaljer.ts:111` |
| `SPILL_TEST` | «Spill/test» | `src/lib/domain/workbench/ovelse-detaljer.ts:112` |

Felt: «Treningsmåte» (`src/components/workbench/OvelseSkjema.tsx:218`) med hint «Hvordan spilleren skal trene» (`src/components/workbench/WorkbenchOkt.tsx:102`). De samme fire verdiene har fem andre skriveformer i appen; se K14.

### 5.6 Press

Felt «Press» med spørsmålet «Hvem ser på?» (`src/components/workbench/OvelseSkjema.tsx:229`). Verdier: «Alene» · «Observert» · «Konkurranse» · «Turnering» (`src/lib/domain/ak-formel-v2.ts:222-226`).

### 5.7 Mengde, repetisjoner og tid

| Begrep | UI-tekst | Kilde |
|---|---|---|
| Enheter | «Slag» · «Putter» · «Hull» · «Minutter» · «Serier» · «Oppgaver» | `src/lib/domain/workbench/ovelse-detaljer.ts:121-126` |
| Repetisjoner (styrke) | «Repetisjoner» | `src/components/workbench/OvelseSkjema.tsx:253` |
| Vekt | «Belastning (kg)» | `src/components/workbench/OvelseSkjema.tsx:254` |
| Reserve-repetisjoner | «RIR» · «Pause (sek)» | `src/components/workbench/OvelseSkjema.tsx:255-256` |
| Kondisjon | «Kondisjonssegmenter» · «Legg til segment»; pulssoner S1 til S5 | `src/components/workbench/OvelseSkjema.tsx:263-275`, `src/lib/domain/workbench/ovelse-detaljer.ts:118` |
| Tid | «Tid» (felt), «Varighet» (økt) | `src/lib/domain/workbench/labels.ts:184`, `src/lib/domain/workbench/labels.ts:173` |
| Live, tellere | «+1 rep» · «Angre siste» | `src/components/portal/live/DrillLogger.tsx:41-44` |

### 5.8 Suksessmål og resultat

| Begrep | UI-tekst | Kilde |
|---|---|---|
| Resultatkrav | «Resultatkrav» med plassholder «For eksempel 20 av 30 innenfor målområdet» | `src/components/workbench/OvelseSkjema.tsx:295` |
| Målemetode | «Målemetode» med plassholder «For eksempel TrackMan: Launch Direction» | `src/components/workbench/OvelseSkjema.tsx:294` |
| Rep-mål (teknisk plan) | «Rep-mål» | `src/components/admin/precision/AGTP01Oppgaveskjema.tsx:226` |
| TrackMan-mål | «TrackMan-mål» · «Nedre» · «Øvre» | `src/components/admin/precision/AGTP01Oppgaveskjema.tsx:205-218` |
| Treffprotokoll | «Treffprotokoll»; valg «Rullende vindu» · «Beste av N» · «Streak» · «Økt-gate» | `src/components/admin/precision/AGTP01Oppgaveskjema.tsx:233`, `src/lib/teknisk-plan/tp-visning.ts:98-101` |
| Måleutstyr | «Med TrackMan» · «Uten TrackMan» · «Annen radar» · «Ikke relevant» | `src/lib/domain/workbench/ovelse-detaljer.ts:100-103` |

«Suksessmål» og «suksesskriterium» finnes ikke i kode.

### 5.9 Registrering underveis

| Begrep | UI-tekst | Kilde |
|---|---|---|
| Modus | «Registrer» (modus i live-økt) | `src/components/portal/live/LiveActive.tsx:187` |
| Logg repetisjon | «Logg repetisjon» · «Angre siste» · «Rett antall» | `src/components/portal/live/DrillLogger.tsx:38-46` |
| Slagteller | «ANTALL SLAG» · «ANTALL PUTTER» · «Angre én» · «Legg til video» | `src/components/portal/precision/PH05LiveAktiv.tsx:391`, `src/components/portal/precision/PH05LiveAktiv.tsx:461`, `src/components/portal/precision/PH05LiveAktiv.tsx:570` |
| Repetisjonstyper | «Full fart» · «Lav fart» · «Tørrsving» | `src/lib/domain/workbench/reps.ts:29-31` |
| Databasetabeller | `SessionBallLog`, `DrillLogV2`, `WorkbenchDrillLog` | `prisma/schema.prisma:2028`, `prisma/schema.prisma:4382`, `prisma/schema.prisma:6940` |

### 5.10 Utgåtte koder som fortsatt finnes

Masteren sier at L-faser, CS-koder, M0–M5 og PR1–PR5 er utgått (kap. 19). De finnes fortsatt i databaseenum og i noe skjermtekst. CS-nivåene er **uavklart, ikke bruk i tekst for foreldre**; her står bare det koden sier.

| Kode | Funn | Kilde |
|---|---|---|
| `LFase`: `L_KROPP` · `L_ARM` · `L_KOLLE` · `L_BALL` · `L_AUTO` | Prisma-enum, kolonner på `SessionDrill`, `TrainingDrillV2`, `DrillMal`, `ExerciseDefinition` | `prisma/schema.prisma:238` |
| `CSNivaa`: `CS50` til `CS100` | Prisma-enum; koden har ikke CS0 eller CS20 | `prisma/schema.prisma:246` |
| `MMiljo`: `M0` til `M5` | Prisma-enum | `prisma/schema.prisma:255` |
| `PRPress`: `PR1` til `PR5` | Prisma-enum | `prisma/schema.prisma:264` |
| Skjermtekst «Læringsfase» | i spillerens Workbench | `src/components/portal/v2/WorkbenchV2Sheets.tsx:860` |
| Skjermtekst «Ingen aktiv L-fase» | utviklingsplan | `src/components/portal/v2/UtviklingsplanV2.tsx:128` |
| Rå `L_AUTO` vist under «Læringssteg» | PH-13 øvelsesdetalj | `src/components/portal/precision/PH13DrillDetalj.tsx:35`, `src/lib/portal-drills/ph13-drills-data.ts:111` |
| M0–M5 og CS50–80 forklart i tooltips | WANG-årsplan | `src/app/team-wang/_data/coach-arsplan.ts:11` |
| GOBBS | 9 spørsmålslinjer i datafil, ingen forklaring i kode | `src/lib/iup/utviklingssjekk-kilder.json:1049` |
| GUBBS | ikke funnet i kode | – |

## 6. Gjennomføring og evaluering

### 6.1 Start, live og avslutning

| Handling | UI-tekst | Kilde |
|---|---|---|
| Start (I dag) | «Start økt» / «Fortsett økt» | `src/components/portal/precision/PH02Gjor.tsx:57` |
| Start (Workbench Live) | «START ØKT» · «Økten er startet» | `src/components/workbench/WorkbenchLive.tsx:88`, `src/components/workbench/WorkbenchLive.tsx:197` |
| Økt i gang | «Økt pågår» · «Økt på pause» | `src/components/workbench/WorkbenchLive.tsx:213` |
| Pause | «Pause» · «Pause økt» · «Fortsett økt» | `src/components/workbench/SessionExecutionPanel.tsx:90` |
| Neste/fullføre | «Neste øvelse» / «Fullfør økt» | `src/components/portal/precision/PH05LiveAktiv.tsx:632` |
| Avslutte-dialog | «Avslutte økta?» · «Fortsett» · «Avslutt og lagre» | `src/components/portal/precision/PH05LiveAktiv.tsx:668`, `src/components/portal/precision/PH05LiveAktiv.tsx:704`, `src/components/portal/precision/PH05LiveAktiv.tsx:721` |
| Avbryt økt | «Avbryt økt» | `src/components/workbench/SessionExecutionPanel.tsx:92` |
| Etterregistrering | «Registrert gjennomføring» med «Gjennomført» · «Ikke utført» · «Avbrutt» | `src/components/workbench/SessionExecutionPanel.tsx:94` |
| Oppsummering | «Øktoppsummering» | `src/components/portal/precision/PH07Oktoppsummering.tsx:113` |
| Coach, live-tavle | «Pågående økter» · «Ingen økter pågår nå» | `src/components/admin/precision/AG13LiveTavle.tsx:81-83` |

### 6.2 Evaluering og refleksjonsspørsmål (ordrett)

| Spørsmål/felt | Tekst | Kilde |
|---|---|---|
| Anstrengelse 1–10 | «Hvor anstrengende var økten på en skala fra 1 (veldig lett) til 10 (maksimalt)?» | `src/components/portal/workbench/OktArk.tsx:180` |
| Overskrift | «Opplevd anstrengelse (sRPE)» | `src/components/portal/workbench/OktArk.tsx:177` |
| Skala 1 og 10 | «Veldig lett» og «Maksimalt» | `src/lib/domain/workbench/load.ts:9-18` |
| Til coach | «Hvordan opplevde du økta?» · «Din side av det» · «Send svar» | `src/components/portal/v2/CoachTilbakemeldingV2.tsx:429-452`, `src/components/portal/v2/CoachTilbakemeldingV2.tsx:414` |
| Fritekst | «Hva gikk bra, hva ville du gjort annerledes?» | `src/components/portal/precision/PH24dUtfordringer.tsx:227` |
| Fritekst (logg) | «Hva jobbet du med? Hva gikk bra?» | `src/components/portal/v2/TreningLoggV2.tsx:165` |
| Notat til coach | «Notat til coach» · «Kort om hvordan det gikk.» · «Del med coach» | `src/components/portal/precision/PH07Oktoppsummering.tsx:433-469` |
| Dagsform | «Dagsform» med «Tung» · «Slapp» · «Ok» · «God» · «Topp» | `src/components/portal/precision/PH01IDag.tsx:31`, `src/components/portal/precision/PH01IDag.tsx:132` |
| Coach vurderer økta | «Vurder økten» · «Lagre vurdering» (1–5 stjerner) | `src/components/admin/precision/AG13LiveOkt.tsx:183-215` |
| Selvvurdering: spørsmål bygd, ikke vist | «Hvor til stede var du mentalt?» · «Hvor godt fikk du gjort det planlagte?» · «Fikk du til det du jobbet med?» | `src/lib/domain/okt-status.ts:97-99` |
| «Hvor tungt» og fokus 1–10 | ikke funnet i kode (besluttet 28.09.2026, ikke bygget) | – |

### 6.3 Oppmøte, tester, turneringer, samlinger

| Tema | UI-tekst | Kilde |
|---|---|---|
| Deltakelse | «Invitert» · «Bekreftet» · «Avslo» · «Kanskje» · «Deltok» · «Uteble» | `src/lib/portal-okt/okt-detalj-data.ts:134-139` |
| Testdag (Team Norway) | «Planlagt» · «Pågår» · «Avsluttet» · «Avlyst» | `src/components/team-norway/skjermer/tn-fellestesting-skjerm.tsx:44-47` |
| Testdeltaker | «I kø» · «Ført» · «Hoppet over» · «Ikke møtt» | `src/components/team-norway/tn-testdag-ko.tsx:11` |
| Test, start/avslutt | «Start testen» · «Avslutte testen?» | `src/app/portal/tren/tester/[testId]/page.tsx:289`, `src/components/portal/precision/PH15TestGjennomfor.tsx:654` |
| Turneringsstatus | «På planen» · «Venter bekreftelse» · «Bekreftet av spiller» · «Trukket» · «Gjennomført» · «Brøt» | `src/lib/portal-turnering/planlegger-data.ts:95-105` |
| Samling | «Treningssamling» · «Heldagssamling» | `src/lib/labels/taxonomy.ts:44-45` |
| Samlingsinvitasjon | «Invitasjoner til samlinger» · «Godta og legg i Workbench» · «Jeg deltar ikke» | `src/app/portal/samlinger/page.tsx:20`, `src/app/portal/samlinger/samlingsinvitasjon-liste.tsx:77`, `src/app/portal/samlinger/samlingsinvitasjon-liste.tsx:78` |
| Testuke (periode) | «Testuke» | `src/lib/labels/taxonomy.ts:42` |

### 6.4 Booking og forespørsler

| Tema | UI-tekst | Kilde |
|---|---|---|
| Book | «Book time» · «Bekreft booking» · «Gå til betaling» | `src/components/portal/precision/PH23Booking.tsx:232`, `src/components/portal/precision/PH23Booking.tsx:887` |
| Mine bookinger | «Mine timer» · «Flytt time» · «Avbestill» | `src/components/portal/precision/PH23Booking.tsx:988`, `src/components/portal/precision/PH23Booking.tsx:1053`, `src/components/portal/precision/PH23Booking.tsx:1070` |
| Avbestille | «Avbestille timen?» | `src/components/portal/precision/PH23Booking.tsx:1376` |
| Coach: bekrefte/avvise | «Bekreft booking» · «Avvis» · «Venter på deg» | `src/components/admin/precision/AG06Booking.tsx:81-127` |
| Be om økt | «Be om økt» · «Send forespørsel» | `src/components/portal/v2/KalenderV2.tsx:378`, `src/components/portal/v2/OnskeligOktV2.tsx:261` |
| Skjemaspørsmål | «Hvem skal ta økten?» · «Hva slags økt?» · «Hva vil du jobbe med?» · «Når passer det best?» | `src/components/portal/v2/OnskeligOktV2.tsx:129-180` |
| Status på forespørsel | «Venter på coach» · «Godtatt» · «Avslått» | `src/app/portal/onskeligokt/bekreftet/page.tsx:91` |

Betalte bookinger bekreftes automatisk (beslutning 27.09.2026), og coach-siden sier det: «Betalte bookinger (offentlig og PlayerHQ) bekreftes automatisk når tiden er ledig.» (`src/components/admin/precision/AG06Booking.tsx:101`). Forelder-siden sier fortsatt «Venter betyr at coachen ikke har svart ennå» (`src/components/portal/v2/ForelderBookingerV2.tsx:230`).

### 6.5 Forelder

| Tema | UI-tekst | Kilde |
|---|---|---|
| Ukerapport | «Ukerapport» · «Notat fra coachen» · «Etterlevelse · siste fire uker» | `src/components/portal/v2/ForelderUkerapportV2.tsx:25-51` |
| Bookinger | «Bookinger» · «Book ny time» · «Avlyst av coach» | `src/components/portal/v2/ForelderBookingerV2.tsx:161-218` |
| Barn | «Neste økt» · «Bekreft skoletid» | `src/components/portal/v2/ForelderBarnV2.tsx:132-198` |
| Samtykke | «Samtykke per barn du er foresatt for» · «Lagre samtykker» | `src/components/portal/v2/ForelderSamtykkeV2.tsx:218-246` |
| Avgrensning | «Rapporten viser plan og oppmøte. Detaljert analyse deles ikke med foresatte.» | `src/components/portal/v2/ForelderUkerapportV2.tsx:56` |

## 7. Roller og tiltaleform

Tall er omtrentlige forekomster i strenger i `src/**/*.tsx`, ikke eksakte. Eksemplene er ordrette.

| Rolle | Ord i appen (omtrentlig antall) | Eksempel | Merknad |
|---|---|---|---|
| Spiller | Spiller 170 · spilleren 89 | «Spilleren godkjenner før øktene legges i Workbench.» `src/components/workbench/SamlingsprogramKontroll.tsx:48` | Standardrolle (masteren kap. 2.2). Tiltales i du-form |
| Coach | Coach 202 · coachen 81 | «Coachen sender invitasjon når barnet er registrert i klubben.» `src/components/portal/v2/ForelderV2.tsx:44` | Standardord til og om coach |
| Trener | Trener 46 · treneren 19 | «Treneren din kobler resultatene.» `src/components/auth/precision/SpillerOppstart.tsx:287` | Rolleord i WANG og Team Norway, og i noen PlayerHQ-tekster |
| Assist Coach | Assist Coach 12 | «Assist Coach» `src/components/team-norway/tn-shell.tsx:151` | Beslutning 22.09.2026 |
| Hjelpetrener | Hjelpetrener 6 | «Hjelpetrener» `src/app/admin/grupper/[id]/legg-til-medlem-modal.tsx:21` | Foreldet etter beslutningen |
| Hovedcoach / head coach | Hovedcoach 6 · Head Coach 5 | «Hovedcoach» `src/components/portal/v2/CoachMeldingerV2.tsx:260` · «Bare head coach.» `src/components/admin/precision/AG24Drift.tsx:108` | Begge i bruk om samme rolle |
| Forelder | Forelder 26 · foreldre 43 | «Forelder» `src/components/portal/v2/ForelderV2.tsx:43` | Rolle og rute |
| Foresatt | foresatt 44 · foresatte 30 | «Legg til foresatt» `src/app/portal/meg/profil-form.tsx:287` | Juridisk tekst, samtykke og WANG |
| Barn | barn 49 · barnet 16 | «Ett koblet barn» `src/components/portal/v2/ForelderBarnV2.tsx:149` | Forelder om eget barn, i 3. person |
| Gruppe | gruppe 148 · gruppa 14 · gruppen 58 | «Gruppen styrer faste tider og årsplan.» `src/components/admin/precision/AG16Grupper.tsx:81` | Både gruppa og gruppen |
| Elev | elev 85 · elever 18 | «Velg elev» `src/components/wang/WangTester.tsx:293` | Bare WANG-flater |
| Utøver | Utøver 13 | «Utøver» `src/lib/domain/tn-post.ts:334` | Bare Team Norway |
| Atlet | ikke funnet i kode (utenom «atletisk») | – | – |

**Tiltaleform:** konsekvent du-form. De og deres brukes ikke. Eiendomsord står etter substantivet: «Planen din er ikke endret. Prøv igjen.» (`src/app/portal/planlegge/workbench/error.tsx:33`). «Din plan» finnes bare i Workbench-hodet: «Din plan» (`src/components/workbench/WorkbenchSamlet.tsx:92`). Faner og menyer bruker Min og Mine: «Min plan» (`src/components/portal/precision/PH19Talent.tsx:102`), «Mine timer» (`src/components/portal/precision/PH23Booking.tsx:988`). Pronomen om spiller: «hen» i AgencyOS-tekster: «planlegger du for hen i Workbench» (`src/components/admin/v2/AdminPlanleggeV2.tsx:85`). Økta (95) og økten (68) brukes om hverandre; Precision-flatene foretrekker økta («Avslutte økta?» `src/components/portal/precision/PH05LiveAktiv.tsx:668`), labels-filen økten («Økten er startet» `src/components/workbench/WorkbenchLive.tsx:197`).

## 8. Statusord, knapper og verb

### 8.1 Statusord

| Gjelder | Ord i appen | Kilde | Mot masteren (kap. 4.3) |
|---|---|---|---|
| Økt (Workbench) | «Utkast» · «Planlagt» · «Publisert» · «Pågår» · «Fullført» · «Avlyst» · «Hoppet over» · «Avbrutt» | `src/lib/domain/workbench/labels.ts:52-59` | «Fullført» og «Avbrutt» avviker fra Gjennomført; Avbrutt finnes ikke i masterlista |
| Økt (I dag) | «Planlagt» · «Pågår» · «Gjennomført» | `src/app/portal/page.tsx:43` | Følger masteren |
| Økt (øktdetalj) | «Planlagt» · «Pågår» · «Fullført» · «Avlyst» · «Hoppet over» | `src/lib/portal-okt/okt-detalj-data.ts:342-346` | «Fullført» avviker |
| Økt (AgencyOS) | «Planlagt» · «Pågår nå» · «Gjennomført» | `src/components/admin/precision/AG12Oktark.tsx:60-62` | Følger masteren |
| Økt (Team Norway) | «Planlagt» · «Pågår» · «Pauset» · «Fullført» · «Avbrutt» · «Hoppet over» · «Kansellert» | `src/app/team-norway/workbench/page.tsx:63-69` | Kansellert mot Avlyst |
| Plan (spiller til coach) | «Utkast» · «Venter på coach» | `src/components/portal/precision/PH12VelgPlan.tsx:157` | Følger masteren |
| Plan (coach til spiller) | «Godtatt» · «Avvist» · «Venter på spiller» | `src/lib/portal-coach/ph21-data.ts:64` | Følger masteren |
| Plan (eldre Workbench) | «Til godkjenning» · «Endring bedt om» · «Aktiv» · «Pause» · «Arkivert» | `src/components/portal/v2/WorkbenchV2.tsx:180-185` | «Til godkjenning» og «Endring bedt om» er ikke masterord |
| Publisering | «Publisert» · «Utkast — kun synlig for deg» · «Trekk tilbake» | `src/lib/domain/workbench/labels.ts:159-179` | Følger masteren |
| Fysisk program | «Utkast» · «Publisert» · «Endret etter publisering» · «Trukket tilbake» · «Fullført» · «Arkivert» | `src/components/admin/precision/AG11Moduler.tsx:42` | Eneste sted «Endret etter publisering» |
| Booking (spiller) | «Behandler» · «Bekreftet» · «Avbestilt» · «Gjennomført» | `src/app/portal/booking/[bookingId]/page.tsx:28-31` | Ikke definert i masteren |
| Booking (coach) | «Venter» · «Bekreftet» · «Fullført» · «Avlyst» | `src/components/admin/v2/AdminBookingerV2.tsx:82-85` | Samme enum, andre ord |
| Forespørsel om økt | «Venter på coach» · «Godtatt» · «Avslått» | `src/app/portal/onskeligokt/bekreftet/page.tsx:91` | Ikke definert i masteren |
| Deltakelse | «Invitert» · «Bekreftet» · «Avslo» · «Kanskje» · «Deltok» · «Uteble» | `src/lib/portal-okt/okt-detalj-data.ts:134-139` | Ikke definert |
| Mål | se seksjon 4 | – | Tre skalaer |

### 8.2 Knapper og verb

| Handling | Ord i appen | Kilde |
|---|---|---|
| Opprette | «Ny økt» `src/lib/domain/workbench/labels.ts:155` · «Opprett økt» `src/components/portal/v2/WorkbenchV2Sheets.tsx:345` · «Legg inn» `src/components/admin/precision/AG11Ark.tsx:269` · «Ny øvelse» `src/components/admin/precision/AG14Ovelseark.tsx:110` · «Ny mal» `src/components/admin/precision/AG14PlanHub.tsx:157` · «Ny booking» `src/components/admin/precision/AG06Booking.tsx:102` | – |
| Legge i plan | Legg i plan: ikke funnet i kode. Nærmeste: «Legg til øvelse» `src/lib/domain/workbench/labels.ts:163` · «Legg i kalender» `src/components/portal/precision/PH23Booking.tsx:534` · «Legg i kalenderen» `src/components/admin/v2/AdminGodkjenningerV2.tsx:244` | – |
| Gjøre synlig | «Publiser» `src/lib/domain/workbench/labels.ts:157` · «Publiser økt» `src/components/admin/precision/AG11Workbench.tsx:292` · «Publiser uke» `src/lib/domain/workbench/labels.ts:158` · «Publiser periode» `src/lib/domain/workbench/labels.ts:147` | – |
| Angre synlig | «Trekk tilbake» `src/lib/domain/workbench/labels.ts:159` | – |
| Bevare | «Lagre» `src/lib/domain/workbench/labels.ts:160` · «Lagre endringer» `src/components/portal/precision/PH19Enkeltmal.tsx:320` · «Lagre økt» `src/lib/domain/workbench/labels.ts:272` · «Lagret» `src/lib/domain/workbench/labels.ts:227` | – |
| Gjennomføre | «Start økt» `src/lib/domain/workbench/labels.ts:231` · «Fortsett» `src/lib/domain/workbench/labels.ts:232` · «Fullfør økt» `src/lib/domain/workbench/labels.ts:233` · «Hopp over» `src/lib/domain/workbench/labels.ts:234` · «Pause» `src/components/workbench/SessionExecutionPanel.tsx:90` · «Avslutt og lagre» `src/components/portal/precision/PH05LiveAktiv.tsx:721` | – |
| Endre | «Flytt» `src/lib/domain/workbench/labels.ts:156` · «Dupliser» `src/components/portal/v2/WorkbenchV2Sheets.tsx:1639` · «Gjenta» `src/lib/domain/workbench/labels.ts:215` · «Slett» `src/lib/domain/workbench/labels.ts:162` · «Slett økt» `src/components/portal/v2/WorkbenchV2Sheets.tsx:1660` | – |
| Avlyse og avbryte | «Avlys» `src/components/admin/precision/AG12Oktark.tsx:115` (coach) · «Avlys økta» `src/components/admin/precision/AG12Oktark.tsx:162` · «Avbestill» `src/components/portal/precision/PH23Booking.tsx:1070` (spiller) · «Avbryt» `src/lib/domain/workbench/labels.ts:161` (lukker dialog) | – |
| Dele | «Del med coach» `src/components/portal/precision/PH07Oktoppsummering.tsx:469` · «Send til spiller» `src/components/admin/precision/AG13LiveOkt.tsx:148` · «Send forespørsel» `src/components/portal/v2/OnskeligOktV2.tsx:261` · «Send ønske» `src/components/portal/precision/PH21Innboks.tsx:845` | – |
| Godta | «Godta» `src/components/admin/v2/AdminForesporslerV2.tsx:30` · «Avvis» `src/components/admin/v2/AdminForesporslerV2.tsx:33` · «Godkjenn» `src/components/admin/v2/AdminAvailabilityWeekGridV2.tsx:193` · «Bekreft» `src/components/portal/v2/BookingNyV2.tsx:456` | – |
| Book | «Book time» `src/components/portal/precision/PH23Booking.tsx:232` · «Book ny time» `src/app/portal/meg/bookinger/bookinger-tabs.tsx:106` · «Book en til» `src/components/portal/precision/PH23Booking.tsx:549` | – |
| Be om | «Be om økt» `src/components/portal/v2/KalenderV2.tsx:378` | – |

## 9. A til Å-register over alle termer

Hver term står på én rad med én status. Varianter har egne rader. Kolonnen «UI-strenger» viser strengene ordrett med kilde; «–» betyr at begrepet er kodenavn eller at strengen er sitert i seksjon 2–8.

| Term | UI-strenger (fil:linje) | Brukt hvor | Definisjon (én setning) | Relaterte | Status |
|---|---|---|---|---|---|
| Aktiv (plan) | «Aktiv» `src/components/portal/v2/WorkbenchV2.tsx:180` | PlayerHQ (eldre Workbench) | Planen gjelder nå. | Utkast, Arkivert | Kanonisk |
| Alene | «Alene» `src/lib/domain/ak-formel-v2.ts:223` | Øvelse (press) | Ingen ser på eller konkurrerer. | Observert, Press | Kanonisk |
| AgencyOS | «Side ikke funnet — AgencyOS» `src/app/admin/not-found.tsx:10` | Coach og organisasjon | Coachens arbeidsflate. | PlayerHQ | Kanonisk |
| Agency OS (med mellomrom) | `src/app/api/kommando/chat/route.ts:19` (AI-instruks) | Kommando-assistent | Skrivemåte av AgencyOS i en AI-instruks. | AgencyOS | Variant brukt i appen |
| Analyse (fanenavn) | «Analyse» `src/components/team-norway/tn-shell.tsx:101` | Team Norway-meny | Eldre navn på statistikkfanen. | Stats | Forbudt |
| Annen radar | «Annen radar» `src/lib/domain/workbench/ovelse-detaljer.ts:102` | Øvelse (måleutstyr) | Måling med annet utstyr enn TrackMan. | Med TrackMan | Kanonisk |
| Assist Coach | «Assist Coach» `src/components/team-norway/tn-shell.tsx:151` | AgencyOS, Team Norway | Coach med begrenset rolle i en gruppe. | Coach, Hjelpetrener | Kanonisk |
| Assistent (rolle) | `src/app/team-wang/_components/live-seksjoner.tsx:350` | WANG | Kort form for rollen `ASSISTANT`. | Assist Coach | Variant brukt i appen |
| Automatikk | «Automatikk» `src/lib/domain/ak-formel-v2.ts:145` | Øvelse (læringssteg) | Bevegelsen utføres i full golffart, 100 % av Club Speed. | Lav hastighet, Uten ball | Kanonisk |
| Automatisk (læringssteg) | «Automatisk» `src/components/portal/live/DrillLogger.tsx:25` | Live-økt | Annen skrivemåte av Automatikk. | Automatikk | Variant brukt i appen |
| Avbestill | «Avbestill» `src/components/portal/precision/PH23Booking.tsx:1070` | PlayerHQ booking | Avbestille en booking. | Avlys | Kanonisk |
| Avbrutt | «Avbrutt» `src/lib/domain/workbench/labels.ts:59` | Workbench (økt-status) | Økta ble stoppet underveis. | Avlyst, Hoppet over | Variant brukt i appen |
| Avlys / Avlyst | «Avlyst» `src/lib/domain/workbench/labels.ts:57` | AgencyOS, Workbench | Coachen avlyser økta; økta er avlyst. | Avbestill | Kanonisk |
| Avvist | «Avvist» `src/lib/portal-coach/ph21-data.ts:64` | PlayerHQ innboks | Planen ble ikke godtatt. | Godtatt | Kanonisk |
| Banespill | «Banespill» `src/lib/domain/ak-formel-v2.ts:116` | Øvelse (område) | Spill på bane eller banelignende. | Spill | Kanonisk |
| Belastning | «Belastning (sRPE)» `src/components/admin/precision/AG11Ark.tsx:194` | Etter økt | Intensitet, vekt og motstand. Ikke om stedet. | Treningsmiljø | Kanonisk |
| Blokktrening | «Blokktrening» `src/lib/domain/workbench/ovelse-detaljer.ts:109` | Øvelse (treningsmåte) | Samme oppgave gjentas. | Variasjonstrening | Kanonisk |
| Blokk (kort) | «Blokk» `src/components/workbench/WorkbenchOkt.tsx:66` | Workbench-økt | Kort form av Blokktrening. | Blokktrening | Variant brukt i appen |
| Book time | «Book time» `src/components/portal/precision/PH23Booking.tsx:232` | PlayerHQ booking | Hovedknappen for å bestille coachtime. | Booking | Kanonisk |
| Booking | «Ny booking» `src/components/admin/precision/AG06Booking.tsx:102` | AgencyOS | Bestilling av tid eller tjeneste. | Avbestill | Kanonisk |
| Bunker | «Bunker» `src/lib/domain/ak-formel-v2.ts:106` | Øvelse (område) | Slag ut av sand. | Nærspill | Kanonisk |
| Caddie | «Caddie» `src/app/admin/jarvis/page.tsx:26` | PlayerHQ, AgencyOS | Navnet på AI-assistenten. | AgenticOS | Kanonisk |
| Chip | «Chip» `src/lib/domain/ak-formel-v2.ts:103` | Øvelse (område) | Lavt nærspill-slag. | Pitch, Lob | Kanonisk |
| CoachHQ | ikke funnet i kode | – | Utgått navn på coachflaten. | AgencyOS | Forbudt |
| Coach | «Coach» `src/app/portal/actions.ts:389` | Alle flater | Fagpersonen som trener spilleren. | Trener | Kanonisk |
| Coach-notat | «Coach-notat» `src/lib/domain/workbench/labels.ts:276` | Økt (lesevisning) | Coachens notat på økta. | Notat til coach | Kanonisk |
| CS (CS50–CS100) | `CS50` `prisma/schema.prisma:246` | Database og noe tooltip | Gammel kodet hastighetsskala. Uavklart, ikke bruk i tekst for foreldre. | Club Speed | Foreldet |
| Club Speed | «{h} % av Club Speed» `src/components/workbench/OvelseSkjema.tsx:195` | Øvelse (hastighet) | Spillerens egen køllehastighet; læringssteg oppgis i prosent av den. | Læringssteg | Kanonisk |
| Dagsform | «Dagsform» `src/components/portal/precision/PH01IDag.tsx:132` | PlayerHQ I dag | Spillerens selvvurderte form, 1 til 5. | – | Kanonisk |
| Deltok | «Deltok» `src/lib/portal-okt/okt-detalj-data.ts:138` | Øktdetalj | Spilleren møtte opp. | Uteble | Kanonisk |
| Drill | «Drill-bibliotek» `src/components/portal/global-search-modal.tsx:135` | Søk (eldre flater) | Engelsk ord for øvelse. | Øvelse | Forbudt |
| Elev | «Velg elev» `src/components/wang/WangTester.tsx:293` | WANG | Spiller i WANG-skolen. | Spiller | Variant brukt i appen |
| ELITE (appnivå) | `ELITE` `src/lib/tier-etikett.ts:5` | Database (dødt enum) | Finnes ikke som appnivå. | Gratis, Full | Forbudt |
| Elite (AK-stigen) | «Elite» `src/lib/agencyos/ak-stigen-data.ts:34` | AgencyOS, GFGK Junior | Øverste trinn i AK-stigen. | Mini, Basis, Utvikling | Kanonisk |
| Evaluering | «Evaluering» `src/lib/labels/taxonomy.ts:41` | Årsplan, periode | Periode for oppsummering og justering. | Testuke | Kanonisk |
| Evalueringsperiode | «Evalueringsperiode» `src/components/workbench-hybrid/taxonomy.ts:76` | Eldre taksonomi | Utgått navn på Evaluering. | Evaluering | Forbudt |
| Fase | «Fase» `src/lib/v2/hjelpetekster.ts:41` | Hjelpetekst | Flertydig: periode, læringssteg eller GFGK-treningsfase. | Periode | Variant brukt i appen |
| Ferie | «Ferie» `src/lib/labels/taxonomy.ts:43` | Årsplan | Pause eller redusert plan. | Restitusjon | Kanonisk |
| Hvile (periodenavn) | «Hvile» `src/app/portal/kalender/data.ts:48` | PlayerHQ kalender | Annet navn på Ferie. | Ferie, Restitusjon | Variant brukt i appen |
| Ferdig | «Ferdig» `src/components/v2/utviklingsplan.tsx:38` | Teknisk plan (TN) | Universell status som ikke sier hva som er gjort. | Gjennomført | Forbudt |
| Fireukerssjekk | «Fireukerssjekk» `src/components/portal/precision/PHIUP01Fireukerssjekk.tsx:185` | PlayerHQ (bare WANG/TN) | Sjekk av prosessmål og målsetninger hver fjerde uke. | Utviklingssjekk | Kanonisk |
| Fokusområde | «Fokusområde» `src/app/team-wang/coach/iup/[elevId]/iup-samtale.tsx:583` | WANG | Periodemål i WANG-samtalen. | Målsetning | Variant brukt i appen |
| Forelder | «Forelder» `src/components/portal/v2/ForelderV2.tsx:43` | Forelder | Rolle og flate for foreldre. | Foresatt | Kanonisk |
| Foresatt | «Legg til foresatt» `src/app/portal/meg/profil-form.tsx:287` | Samtykke, WANG | Juridisk rolle, brukes når det rettslige er poenget. | Forelder | Kanonisk |
| Formål | «Formål» `src/components/admin/precision/AG11Ark.tsx:278` | Økt (felt) | Hvorfor økta finnes. | Hensikt, Målsetning | Kanonisk |
| Fullført | «Fullført» `src/lib/domain/workbench/labels.ts:56` | Workbench, TN, forelder | Brukt om økt som er utført; masteren sier Gjennomført. | Gjennomført | Variant brukt i appen |
| FYS | «Fysisk» `src/lib/domain/workbench/labels.ts:21` | Pyramide | Fysisk trening. | TEK, SLAG, SPILL, TURN | Kanonisk |
| Gjenta | «Gjenta?» `src/components/admin/precision/AG11Ark.tsx:286` | Ny økt | Legg økta inn flere uker på rad. | – | Kanonisk |
| Gjennomført | «Gjennomført» `src/components/admin/precision/AG12Oktark.tsx:62` | AgencyOS, I dag | Økta er utført. | Fullført | Kanonisk |
| GOBBS | «Jeg har et tydelig bilde/film av hvordan mine GOBBS skal være» `src/lib/iup/utviklingssjekk-kilder.json:1049` | Utviklingssjekk (WANG/TN) | Uavklart: betydningen står ikke i kode. | – | Variant brukt i appen |
| GUBBS | ikke funnet i kode | – | Nevnt bare i bestillingen. | GOBBS | Ikke i kode, bare i dokument |
| Golfslag | «Golfslag» `src/lib/domain/workbench/labels.ts:23` | Pyramide (SLAG) | Utvikle et bestemt golfslag. | – | Kanonisk |
| Grunnperiode | «Grunnperiode» `src/lib/labels/taxonomy.ts:38` | Årsplan | Bygge kapasitet og vaner. | Spesialperiode | Kanonisk |
| Grunn (kort) | «Grunn» `src/components/workbench/YearPeriodePanel.tsx:32` | Årsvisning | Kort periodenavn. | Grunnperiode | Variant brukt i appen |
| Grunntrening | «Grunntrening & sving» `src/components/wang/WangTrening.tsx:268` | WANG | Eldre ord for grunnperiodens trening. | Grunnperiode | Variant brukt i appen |
| Gruppe | «Gruppen styrer faste tider og årsplan.» `src/components/admin/precision/AG16Grupper.tsx:81` | AgencyOS | Spillere som trener sammen og deler plan. | Gruppeøkt | Kanonisk |
| Gruppeøkt | «Gruppeøkter» `src/components/workbench/WorkbenchTrenerbord.tsx:65` | Trenerbord | Felles økt for en gruppe. | Økt | Kanonisk |
| Gratis | «Gratis» `src/lib/portal-abonnement/ph25-abonnement-data.ts:80` | Meg, marked | Appens gratis nivå. | Full | Kanonisk |
| Full | «Full · all tilgang» `src/components/marketing/v2/MarkedPriserV2.tsx:74` | Meg, marked | Appens betalte nivå. | Gratis | Kanonisk |
| Pro (appnivå) | «Start Pro · 299 kr/mnd» `src/components/portal/v2/MegAbonnementV2.tsx:174` | PlayerHQ (v2-flater) | Gammelt navn på betalt nivå. | Full | Forbudt |
| TALENT (som nivåetikett) | «TALENT · gratis» `src/app/portal/meg/page.tsx:93` | PlayerHQ Meg | Internt tilgangsutfall vist som nivå. | Gratis | Variant brukt i appen |
| Performance Pro | «Performance Pro» `src/components/portal/v2/SignupV2.tsx:40` | Booking, marked | Coaching-pakke; ikke appnivå. | Performance | Kanonisk |
| Heldagssamling | «Heldagssamling» `src/lib/labels/taxonomy.ts:45` | Årsplan | Samling med heldagsformat. | Treningssamling | Kanonisk |
| Hensikt | «1 · Hensikt» `src/components/workbench/OvelseSkjema.tsx:119` | Øvelse (trinn 1) | Hva slags trening øvelsen er (pyramide). | Formål | Kanonisk |
| Hjelpetrener | «Hjelpetrener» `src/app/admin/grupper/[id]/legg-til-medlem-modal.tsx:21` | AgencyOS, TN | Eldre navn på Assist Coach. | Assist Coach | Foreldet |
| Hovedcoach | «Hovedcoach» `src/components/portal/v2/CoachMeldingerV2.tsx:260` | PlayerHQ | Coach med full tilgang. | Head coach | Kanonisk |
| Head coach | «Bare head coach.» `src/components/admin/precision/AG24Drift.tsx:108` | AgencyOS | Engelsk skrivemåte av Hovedcoach. | Hovedcoach | Variant brukt i appen |
| Hoppet over | «Hoppet over» `src/lib/domain/workbench/labels.ts:58` | Økt-status | Økta ble ikke gjennomført, med vilje. | Avlyst | Kanonisk |
| I dag | «I dag» `src/lib/domain/workbench/labels.ts:96` | PlayerHQ | Fane med dagens økter. | Plan | Kanonisk |
| Innspill | «Innspill 100–150 m» `src/lib/domain/ak-formel-v2.ts:101` | Øvelse (område) | Slag mot green fra 50 m og lengre. | Utslag | Kanonisk |
| Kategori (A–K) | «Min kategori» `src/components/admin/v2/AdminDrillDetaljV2.tsx:175` | Spillernivå | Spillerens nivå etter brutto snittscore. | – | Kanonisk |
| Kansellert | «Kansellert» `src/app/team-norway/workbench/page.tsx:69` | Team Norway | Annet ord for Avlyst. | Avlyst | Variant brukt i appen |
| Knøtt | «Knøtt» `src/lib/agencyos/ak-stigen-data.ts:43` | AgencyOS, GFGK | Aldersgruppe 11–12 år ved siden av stigen; ikke et trinn. | AK-stigen | Kanonisk |
| Kondisjon | «Kondisjon» `src/lib/domain/ak-formel-v2.ts:114` | Øvelse (område) | Utholdenhetstrening med pulssone. | Styrke | Kanonisk |
| Konkurranse (press) | «Konkurranse» `src/lib/domain/ak-formel-v2.ts:225` | Øvelse | Resultatet sammenlignes. | Turnering | Kanonisk |
| Konkurranseform | «Konkurranseform» `src/lib/domain/workbench/ovelse-detaljer.ts:111` | Øvelse (treningsmåte) | Øvelsen er bygd med poeng, duell eller krav. | Press | Kanonisk |
| Lagre | «Lagre» `src/lib/domain/workbench/labels.ts:160` | Overalt | Innholdet bevares; ikke automatisk delt. | Publiser | Kanonisk |
| Legg i plan | ikke funnet i kode | – | Verb nevnt i bestillingen. | Legg til øvelse | Ikke i kode, bare i dokument |
| Logg / Logge | «Logg trening» `src/components/portal/global-search-modal.tsx:70` | Søk, manifest | Føre data inn; masteren sier registrere. | Registrer | Forbudt |
| Loggfør | «Loggfør puttetest 3–6 ft» `src/components/v2/domene2.tsx:227` | Eldre flater | Føre data inn. | Registrer | Forbudt |
| L-fase | «Ingen aktiv L-fase» `src/components/portal/v2/UtviklingsplanV2.tsx:128` | Utviklingsplan | Utgått læringsstige (L_KROPP til L_AUTO). | Læringssteg | Foreldet |
| Lob | «Lob» `src/lib/domain/ak-formel-v2.ts:105` | Øvelse (område) | Høyt nærspill-slag. | Chip, Pitch | Kanonisk |
| Lav hastighet | «Lav hastighet» `src/lib/domain/ak-formel-v2.ts:144` | Øvelse (læringssteg) | Rolig utførelse, 25–75 % av Club Speed. | Automatikk | Kanonisk |
| Læringssteg | «Læringssteg» `src/lib/domain/workbench/labels.ts:105` | Øvelse | Uten ball, Lav hastighet eller Automatikk. | Læringsfase | Kanonisk |
| Læringsfase | «Læringsfase» `src/components/portal/v2/WorkbenchV2Sheets.tsx:860` | PlayerHQ Workbench | Eldre ord for Læringssteg. | Læringssteg | Foreldet |
| M0–M5 | `M0` `prisma/schema.prisma:255` | Database, tooltips | Utgått miljøkode. | Treningsmiljø | Foreldet |
| Mal (planmal) | «Ny mal» `src/components/admin/precision/AG14PlanHub.tsx:157` | Plan-hub | Gjenbrukbar uke- eller programplan. | Standardøkt | Kanonisk |
| Standardøkt | «Standardøkter» `src/components/admin/precision/AG14PlanHub.tsx:153` | Plan-hub | Lagret økt som kan gjenbrukes. | Mal | Kanonisk |
| Mengde | «7 · Mengde» `src/components/workbench/OvelseSkjema.tsx:238` | Øvelse (trinn 7) | Hvor mye som gjøres. | Repetisjoner | Kanonisk |
| Mål (om det spilleren sikter mot) | «Endre mål» `src/components/portal/precision/PH19Enkeltmal.tsx:604` | PlayerHQ | Brukes om målsetning; masteren reserverer «mål» til måltall. | Målsetning | Forbudt |
| Målemetode | «Målemetode» `src/components/workbench/OvelseSkjema.tsx:294` | Øvelse | Hvordan resultatet måles. | Resultatkrav | Kanonisk |
| Måleutstyr | «4 · Måleutstyr» `src/components/workbench/OvelseSkjema.tsx:170` | Øvelse (trinn 4) | Hvilket utstyr som måler. | TrackMan | Kanonisk |
| Målsetning | «Målsetninger» `src/components/portal/precision/PH19Malsetninger.tsx:41` | PlayerHQ, Workbench | Det spilleren sikter mot. | Resultatmål, Prosessmål | Kanonisk |
| Målsetting | «Målsetting og oppfølging» `src/components/admin/precision/AG08Faner.tsx:118` | Spillerprofil | Annen skrivemåte av Målsetning. | Målsetning | Variant brukt i appen |
| Måned | «Måned» `src/lib/domain/workbench/labels.ts:98` | Workbench | Plannivå mellom periode og uke. | Månedsplan | Kanonisk |
| Månedsplan | «Månedsplan» `src/components/team-norway/tn-shell.tsx:95` | Team Norway | Månedsvisning i TN. | Måned | Variant brukt i appen |
| Nærspill | «Nærspill» `src/components/teknisk-plan/constants.ts:24` | Teknisk plan, Workbench | Slag innenfor 50 m. | Chip, Pitch, Lob, Bunker | Kanonisk |
| Kortspill / rundt green | «rundt green» `src/lib/domain/skill-map.ts:139` | Eldre tekster | Gamle ord for Nærspill. | Nærspill | Forbudt |
| Observert | «Observert» `src/lib/domain/ak-formel-v2.ts:224` | Øvelse (press) | Coach, medspiller eller gruppe ser på. | Alene | Kanonisk |
| Oppmøte | «Oppmøte» `src/components/portal/v2/ForelderUkerapportV2.tsx:39` | Forelder, WANG | Om spilleren deltok. | Deltok | Kanonisk |
| Oppvarming (øktdel) | «Oppvarming» `src/app/team-wang/_components/okt-detalj.tsx:295` | WANG, GFGK-tekst | Første del av en økt. | Hoveddel, Avslutning | Variant brukt i appen |
| Pause | «Pause» `src/components/workbench/SessionExecutionPanel.tsx:90` | Live | Stanse økta midlertidig. | Fortsett | Kanonisk |
| Periode | «Periode» `src/lib/domain/workbench/labels.ts:100` | Årsplan | Datospenn med fokus. | Grunnperiode | Kanonisk |
| Periodeplan | «Periodeplan» `src/lib/domain/workbench/labels.ts:141` | Workbench | Visning av en periode. | Periode | Variant brukt i appen |
| Pitch | «Pitch» `src/lib/domain/ak-formel-v2.ts:104` | Øvelse (område) | Middels høyt nærspill-slag. | Chip, Lob | Kanonisk |
| Plan | «Plan» `src/components/v2/shell.tsx:85` | PlayerHQ | Fane med årsplan til økt. | Workbench | Kanonisk |
| Plan-hub | «Plan-hub» `src/components/admin/precision/AG14PlanHub.tsx:189` | AgencyOS | Coachens sted for maler og øvelser. | Mal | Kanonisk |
| Press | «Press» `src/lib/domain/workbench/labels.ts:107` | Øvelse (trinn 6) | Hvem som ser på. | Alene, Observert | Kanonisk |
| Prosessmål | «Prosessmål» `src/components/portal/precision/PH19Enkeltmal.tsx:199` | PlayerHQ | Handlinger spilleren gjør jevnlig. | Resultatmål | Kanonisk |
| Publiser | «Publiser» `src/lib/domain/workbench/labels.ts:157` | Workbench | Gjøre plan eller økt synlig for spilleren. | Trekk tilbake | Kanonisk |
| Putting | «Putting» `src/components/teknisk-plan/constants.ts:25` | Teknisk plan | Slag på green. | Putt | Kanonisk |
| Pyramide | «Pyramide» `src/components/admin/precision/AG11Ark.tsx:273` | Økt og øvelse | Hensikten: FYS, TEK, SLAG, SPILL eller TURN. | Hensikt | Kanonisk |
| Registrere | «Registrer» `src/components/portal/live/LiveActive.tsx:187` | Live | Føre resultat, oppmøte eller aktivitet inn. | Lagre | Kanonisk |
| Repetisjoner | «Repetisjoner» `src/components/workbench/OvelseSkjema.tsx:253` | Øvelse (styrke) | Antall gjentakelser. | Serier | Kanonisk |
| Resultatkrav | «Resultatkrav» `src/components/workbench/OvelseSkjema.tsx:295` | Øvelse (trinn 8) | Kravet for at øvelsen regnes som oppnådd. | Målemetode | Kanonisk |
| Resultatmål | «Resultatmål» `src/components/portal/precision/PH19Enkeltmal.tsx:191` | PlayerHQ | Resultatet spilleren vil oppnå. | Prosessmål | Kanonisk |
| Restitusjon | «Restitusjon» `src/lib/labels/taxonomy.ts:46` | Årsplan | Hvile og gjenoppbygging. | Ferie | Kanonisk |
| Sesongkart | «Sesongkart» `src/components/workbench/WorkbenchSesongkart.tsx:54` | Workbench | Tidslinje over sesongen. | Årsplan | Kanonisk |
| Sesongplan | «Ingen sesongplan registrert ennå.» `src/lib/admin-spiller/spiller-profil-panel-data.ts:310` | Spillerprofil | Annet ord for Årsplan. | Årsplan | Variant brukt i appen |
| Session | «session» `src/components/portal/global-search-modal.tsx:72` | Søkeord | Engelsk ord for økt. | Økt | Forbudt |
| Simulator (som sted) | «Simulator» `src/lib/domain/workbench/ovelse-detaljer.ts:60` | Øvelse (sted) | Innendørs sted med TrackMan-simulator. | Innendørs golf | Variant brukt i appen |
| SLAG | «Golfslag» `src/lib/domain/workbench/labels.ts:23` | Pyramide | Se Golfslag. | – | Kanonisk |
| Spesialperiode | «Spesialperiode» `src/lib/labels/taxonomy.ts:39` | Årsplan | Spesifikk trening mot spillerens behov. | Grunnperiode | Kanonisk |
| Spesialisering / Spesialiseringsperiode | «Spesialisering» `src/components/v2/kalender.tsx:166` | Kalender-demo, GFGK Junior | Utgått navn på Spesialperiode. | Spesialperiode | Forbudt |
| Spesial (kort) | «Spesial» `src/components/workbench/YearPeriodePanel.tsx:33` | Årsvisning | Kort periodenavn. | Spesialperiode | Variant brukt i appen |
| SPES | «SPES →» `src/components/v2/datavis.tsx:466` | WANG, demo | Forkortelse av spesialisering. | Spesialperiode | Variant brukt i appen |
| Spill (pyramide) | «Spill» `src/lib/domain/ak-formel-v2.ts:31` | Pyramide | Bruke ferdigheter i spillsituasjon. | Banespill | Kanonisk |
| Spill/test | «Spill/test» `src/lib/domain/workbench/ovelse-detaljer.ts:112` | Øvelse (treningsmåte) | Spillnær oppgave eller testprotokoll. | Konkurranseform | Kanonisk |
| Spiller | «Spiller» `src/components/auth/LoginView.tsx:109` | Alle flater | Personen som trener. | Elev | Kanonisk |
| Stats | «Stats» `src/components/workbench/WorkbenchSamlet.tsx:17` | PlayerHQ fane | Statistikk og analyse. | Statistikk | Kanonisk |
| Statistikk | «Statistikk» `src/components/portal/global-search-modal.tsx:183` | Søk | Løpende tekst for Stats. | Stats | Kanonisk |
| Sted | «Sted» `src/components/admin/precision/AG11Ark.tsx:279` | Økt, øvelse | Hvor økta eller øvelsen gjennomføres. | Treningsmiljø | Kanonisk |
| Start økt | «Start økt» `src/lib/domain/workbench/labels.ts:231` | I dag, live | Begynne en publisert økt. | Fortsett | Kanonisk |
| Strokes Gained (SG) | «Strokes Gained» `src/components/portal/live/SessionSummary.tsx:214` | Stats | Slag vunnet eller tapt mot et sammenligningsgrunnlag. | Stats | Kanonisk |
| Styrke | «Styrke» `src/lib/domain/ak-formel-v2.ts:113` | Øvelse (område) | Vektbasert fysisk trening. | Kondisjon | Kanonisk |
| TEK | «Teknisk» `src/lib/domain/workbench/labels.ts:22` | Pyramide | Utvikle bevegelse og teknikk. | – | Kanonisk |
| Teknisk fokus | «Teknisk fokus» `src/components/workbench/WorkbenchOkt.tsx:100` | Øvelse | Ett fokus per øvelse. | Dimensjon | Kanonisk |
| Teknisk plan | «Teknisk plan» `src/components/team-norway/tn-shell.tsx:275` | AgencyOS, TN | Spillerens plan for teknikk med P-posisjoner. | Teknikkplan | Kanonisk |
| Teknikkplan | «Teknikkplan» `src/components/admin/precision/AG08Faner.tsx:118` | Spillerprofil | Annen skrivemåte av Teknisk plan. | Teknisk plan | Variant brukt i appen |
| Testuke | «Testuke» `src/lib/labels/taxonomy.ts:42` | Årsplan | Uke for tester og målinger. | Evaluering | Kanonisk |
| TrackMan | «Med TrackMan» `src/lib/domain/workbench/ovelse-detaljer.ts:100` | Øvelse | Radarutstyr som måler slag. | Måleutstyr | Kanonisk |
| Trener | «Trener» `src/components/wang/WangAppSkall.tsx:32` | WANG, Team Norway | Rolleord i WANG og TN; masteren sier Coach for AK Golf. | Coach | Variant brukt i appen |
| Trekk tilbake | «Trekk tilbake» `src/lib/domain/workbench/labels.ts:159` | Workbench | Gjøre publisert økt usynlig for spilleren. | Publiser | Kanonisk |
| Treningsmiljø | «Treningsmiljø» `src/lib/domain/workbench/labels.ts:106` | Øvelse | Hvor og i hvilken situasjon øvelsen gjennomføres. | Sted, Belastning | Kanonisk |
| Miljø | «Velg dato, varighet og miljø. …» `src/components/admin/add-session-wizard.tsx:257` | Eldre veiviser | Eldre kort ord for Treningsmiljø. | Treningsmiljø | Variant brukt i appen |
| Treningsmåte | «Treningsmåte» `src/components/workbench/OvelseSkjema.tsx:218` | Øvelse (trinn 5) | Blokk, variasjon, konkurranse eller spill/test. | Press | Kanonisk |
| Treningsområde | «2 · Treningsområde» `src/components/workbench/OvelseSkjema.tsx:140` | Øvelse (trinn 2) | Hva spilleren trener på. | Område | Kanonisk |
| Treningssamling | «Treningssamling» `src/lib/labels/taxonomy.ts:44` | Årsplan | Samling over flere økter eller dager. | Heldagssamling | Kanonisk |
| Treukerssyklus | «Treukerssyklus» `src/components/workbench/WorkbenchTreukerssyklus.tsx:57` | Workbench | Tre sammenhengende uker planlagt samlet. | Uke | Kanonisk |
| Turnering (pyramide) | «Turnering» `src/lib/domain/workbench/labels.ts:25` | Pyramide, press | Forberede eller gjennomføre turneringsspill. | Turneringsperiode | Kanonisk |
| Turneringsperiode | «Turneringsperiode» `src/lib/labels/taxonomy.ts:40` | Årsplan | Forberedelse og gjennomføring rundt turneringer. | Evaluering | Kanonisk |
| Utkast | «Utkast» `src/lib/domain/workbench/labels.ts:52` | Workbench | Ikke publisert. | Publisert | Kanonisk |
| Utslag | «Utslag» `src/lib/domain/ak-formel-v2.ts:98` | Øvelse (område) | Første slag på hullet. | Tee Total | Kanonisk |
| Tee Total | «Tee total» `src/lib/labels/taxonomy.ts:21` | Teknisk plan, planmaler | Annet navn på Utslag. | Utslag | Variant brukt i appen |
| Utviklingssjekk | «Utviklingssjekk» `src/components/portal/precision/iup-evaluering.tsx:24` | PlayerHQ (WANG/TN) | Sjekk mot spørsmål per nivå. | Fireukerssjekk | Kanonisk |
| Utøver | «Utøver» `src/lib/domain/tn-post.ts:334` | Team Norway | Rolleord i TN. | Spiller | Variant brukt i appen |
| Uke | «Uke» `src/lib/domain/workbench/labels.ts:97` | Workbench | Plannivå for økter. | Ukeplan | Kanonisk |
| Ukeplan | «Ukeplan» `src/lib/domain/workbench/labels.ts:86` | Workbench | Plan og mål for en uke. | Treukerssyklus | Kanonisk |
| Ukesplan | «Ukesplan & Fravær» `src/app/team-wang/WangToppidrettPrecisionView.tsx:176` | WANG | Annen skrivemåte av Ukeplan. | Ukeplan | Variant brukt i appen |
| Uten ball | «Uten ball» `src/lib/domain/ak-formel-v2.ts:143` | Øvelse (læringssteg) | Bevegelsen øves uten ball. | Lav hastighet | Kanonisk |
| Variasjonstrening | «Variasjonstrening» `src/lib/domain/workbench/ovelse-detaljer.ts:110` | Øvelse (treningsmåte) | Oppgaven eller situasjonen varierer. | Blokktrening | Kanonisk |
| Venter på coach | «Venter på coach» `src/components/portal/precision/PH12VelgPlan.tsx:157` | PlayerHQ | Spillerens plan er sendt til coach. | Venter på spiller | Kanonisk |
| Venter på spiller | «Venter på spiller» `src/lib/portal-coach/ph21-data.ts:64` | PlayerHQ innboks | Coachens forslag venter på spilleren. | Venter på coach | Kanonisk |
| Workbench | «Workbench» `src/components/workbench/WorkbenchSamlet.tsx:90` | PlayerHQ, AgencyOS | Planleggingsflaten. | Plan | Kanonisk |
| Workout | ikke funnet i kode | – | Engelsk ord for økt. | Økt | Forbudt |
| Årsplan | «Årsplan» `src/components/workbench/WorkbenchSamlet.tsx:30` | Workbench | Sesong, perioder, turneringer og tester. | Sesongkart | Kanonisk |
| Økt | «Økt» `src/lib/domain/workbench/labels.ts:101` | Alle flater | Én planlagt treningsenhet. | Treningsøkt | Kanonisk |
| Treningsøkt | «Registrer en ny treningsøkt» `src/components/portal/global-search-modal.tsx:71` | Søk, kalender | Lengre form av økt i løpende tekst. | Økt | Kanonisk |
| Øktens målsetning | «Øktens målsetning» `src/components/admin/precision/AG11Ark.tsx:280` | Ny økt | Hva økta skal oppnå. | Formål | Kanonisk |
| Øvelse | «Legg til øvelse» `src/lib/domain/workbench/labels.ts:163` | Workbench | Tellbar del av en økt. | Drill | Kanonisk |
| Øvelsesbank | «Øvelsesbank» `src/components/portal/precision/PH13DrillBank.tsx:132` | PlayerHQ, AgencyOS | Biblioteket med øvelser. | Plan-hub | Kanonisk |

## 10. Konflikter og anbefalinger

Hver konflikt har variantene med kilde, en anbefaling og en begrunnelse. Anbefalingene følger masteren ([treningsplanlegging.md](treningsplanlegging.md)) og de bindende beslutningene. Der de ikke sier noe, står det uttrykkelig, og punktet gjentas i seksjon 12. Ingen kode eller skjermtekst er endret.

### K1 Økt · Trening · Treningsøkt · Session · Time

- «Økt» `src/lib/domain/workbench/labels.ts:101` (enerådende i Workbench)
- «Registrer en ny treningsøkt» `src/components/portal/global-search-modal.tsx:71`
- «Logg trening» `src/components/portal/global-search-modal.tsx:70` (trening brukt om en økt)
- «session» `src/components/portal/global-search-modal.tsx:72` (søkeord)
- «Kunne ikke flytte timen.» `src/app/portal/booking/ph23-actions.ts:48` (time = booking)

**Anbefaling:** Økt for enheten; «treningsøkt» i løpende tekst; «trening» bare om aktiviteten generelt; «time» bare om en booking hos coach. **Begrunnelse:** masteren kap. 2.2 og 3 sier Økt og forbyr session/workout; tre ord for tre ting gjør at spilleren ikke tror «timen» er det samme som «økta».

### K2 Mål · Målsetning · Målsetting · Goal (og tre statusskalaer)

- «Endre mål» `src/components/portal/precision/PH19Enkeltmal.tsx:604`
- «Ingen mål satt» `src/components/portal/v2/MegV2.tsx:488`
- «Målsetninger» `src/components/portal/precision/PH19Malsetninger.tsx:41`
- «Målsetting og oppfølging» `src/components/admin/precision/AG08Faner.tsx:118`
- «Målsetting» `src/components/v2/struktur.tsx:213`
- «Målsetninger» `src/app/portal/mal/goal/[id]/page.tsx:111` (rutenavn `goal`)
- Statusskala 1: «Aktivt» `src/components/portal/precision/PH19Enkeltmal.tsx:483`
- Statusskala 2: «På sporet» `src/app/portal/mal/page.tsx:37`
- Statusskala 3: «På vei» `src/app/team-wang/_components/ak-primitiver.tsx:72`

**Anbefaling:** Målsetning for det spilleren sikter mot; mål bare om måltall (TrackMan-mål, rep-mål, resultatkrav); skrivemåten Målsetting ut. Én statusskala: Ikke startet · På vei · Nådd. **Begrunnelse:** masteren kap. 2.2 og 4.3; `PeriodGoalStatus` sier selv «aldri to skalaer» (`prisma/schema.prisma:78`). Sluttstatusen Avbrutt (databaseverdi `ABANDONED`) mangler i masteren; se spørsmål 8.

### K3 Drill · Øvelse

- «Drill-bibliotek» `src/components/portal/global-search-modal.tsx:135`
- «Ingen driller på denne økta ennå.» `src/components/admin/precision/AG13LiveOkt.tsx:262`
- «Øvelsesbibliotek» `src/app/api/portal/search/route.ts:74` (samme rad som label «Drills»)
- «Øvelsesbank» `src/components/portal/precision/PH13DrillBank.tsx:132`
- «Legg til øvelse» `src/lib/domain/workbench/labels.ts:163`

**Anbefaling:** Øvelse og Øvelsesbank overalt i skjermtekst. «Drill» blir i kodenavn og adresse (`/portal/drills`). **Begrunnelse:** masteren kap. 2.2: «Drill» kan stå i tekniske identifikatorer, men ikke i skjermtekst. Over 100 strenger sier fortsatt drill.

### K4 Periode · Fase · Blokk · Treningsblokk · Syklus

- «Periode» `src/lib/domain/workbench/labels.ts:100`
- «Fase» `src/lib/v2/hjelpetekster.ts:41`
- «Innenfor hver periode jobber vi i fem faser …» `src/app/gfgk-junior/treningsplaner/treningsplaner-innhold.tsx:307` (fase = GFGK-treningsfase)
- «WANG-26 · Skolens timeplan og treningsblokker» `src/components/wang/WangAdmin.tsx:136`
- «Treukerssyklus» `src/components/workbench/WorkbenchTreukerssyklus.tsx:57`
- «Treningen følger en fireukers syklus …» `src/app/gfgk-junior/_data/veileder-artikler.ts:915`

**Anbefaling:** Periode for datospennet i årsplanen; «fase» brukes ikke om periode, læringssteg eller GFGK-inndelingen; «blokk» bare i Blokktrening; «syklus» bare for funksjonen Treukerssyklus. **Begrunnelse:** «Fase» betyr fem ulike ting i koden (periode, læringsfase, utgått L-fase, GFGK-treningsfase, AI-planfase). GFGK-inndelingen trenger et eget navn; se spørsmål 6. «Fireukers syklus» (GFGK) og «Tre sammenhengende kalenderuker» (Workbench) er ulike ting med samme ord.

### K5 Plan · Program · Treningsplan · Opplegg · Årsplan · Sesongplan

- «Årsplan» `src/components/workbench/WorkbenchSamlet.tsx:30`
- «Ingen sesongplan registrert ennå.» `src/lib/admin-spiller/spiller-profil-panel-data.ts:310`
- «Se denne ukens treningsplan» `src/components/portal/global-search-modal.tsx:104`
- «Programmet er lagt inn i Workbench.» `src/app/portal/samlinger/samlingsinvitasjon-liste.tsx:24`
- «Program» `src/components/admin/precision/AG14PlanHub.tsx:152`

**Anbefaling:** Årsplan om objektet, «Plan» om fanen i PlayerHQ. «Program» bare om en flerukers mal, et samlingsprogram og det fysiske programmet. «Sesongplan», «Treningsplan» og «Opplegg» som navn på planobjektet ut. **Begrunnelse:** masteren kap. 5 gir rekkefølgen Årsplan → Periode → Måned → Uke → Økt; «Program» har tre ulike betydninger i koden.

### K6 Spesialperiode · Spesialisering · Spesialiseringsperiode · Spesial · SPES

- «Spesialperiode» `src/lib/labels/taxonomy.ts:39`
- «Spesialisering» `src/app/gfgk-junior/_data/gfgk-junior-data.ts:9`
- «Spesialisering – TEST/TRANSFER mot bane» `src/lib/gfgk-junior/bootstrap.ts:66`
- «Spesialisering» `src/components/v2/kalender.tsx:166`
- «Spesial» `src/components/workbench/YearPeriodePanel.tsx:33`
- «SPES →» `src/components/v2/datavis.tsx:466`
- `SPESIALISERING` som valgtekst `src/app/team-norway/workbench/page.tsx:424` (rå kode vist i en nedtrekksliste)

**Anbefaling:** Spesialperiode overalt; kortformen «Spesial» bare i trange chips; «SPES» og «Spesialisering» ut. GFGK Junior-teksten er publisert og venter på eiers beslutning. **Begrunnelse:** beslutning 28.09.2026. Bestillingen oppga «Spesialiseringsperiode»; det er det utgåtte navnet.

### K7 Elite · ELITE · Pro · Full · Gratis · Premium · TALENT

- «Start Pro · 299 kr/mnd» `src/components/portal/v2/MegAbonnementV2.tsx:174`
- «Caddie er en del av Pro-abonnementet.» `src/components/portal/v2/CoachAIV2.tsx:227`
- «Full · all tilgang» `src/components/marketing/v2/MarkedPriserV2.tsx:74`
- «TALENT · gratis» `src/app/portal/meg/page.tsx:93`
- `ELITE` `src/lib/tier-etikett.ts:5` (databaseverdi uten visning)
- «Performance Pro» `src/components/portal/v2/SignupV2.tsx:40`
- «Elite» `src/lib/agencyos/ak-stigen-data.ts:34` (AK-stigen)

**Anbefaling:** Gratis og Full som appnivå. «Pro», «Premium» og «Plus» ut. Performance og Performance Pro er coaching-pakker. «Elite» bare som øverste trinn i AK-stigen og som gruppenavnet GFGK Elite. TALENT, FULL og INGEN er interne tilgangsutfall og vises ikke som etikett. **Begrunnelse:** masteren kap. 2.5 og beslutning 24.09 og 30.09.2026; «Pro» forveksles med Performance Pro.

### K8 CoachHQ · AgencyOS

- «Side ikke funnet — AgencyOS» `src/app/admin/not-found.tsx:10`
- «Bytt til Coach-view» `src/components/portal/global-search-modal.tsx:218`
- «AgencyOS (Trener)» `src/app/skjermer/SkjermKatalog.tsx:438`
- `src/app/api/kommando/chat/route.ts:19` (skriver «Agency OS» i to ord)
- «CoachHQ»: ikke funnet i kode (null treff)

**Anbefaling:** AgencyOS, ett ord, aldri CoachHQ. Rydd «Coach-view» og «Agency OS». **Begrunnelse:** masteren kap. 2.2 og prosjektinstruksen.

### K9 GOBBS · GUBBS

- «Jeg har et tydelig bilde/film av hvordan mine GOBBS skal være» `src/lib/iup/utviklingssjekk-kilder.json:1049`
- «Jeg vet hvordan det skal føles når jeg gjør mine korrekte GOBBS» `src/lib/iup/utviklingssjekk-kilder.json:1061`
- Leses inn av `src/lib/iup/utviklingssjekk.ts:3`; ordet er ikke definert i `docs/treningsplanlegging.md`
- GUBBS: ikke funnet i kode

**Anbefaling:** Ikke bruk GOBBS i nye tekster før betydningen er avklart; GUBBS finnes ikke og skal ikke innføres som skrivefeil-variant. **Begrunnelse:** ordet er ikke forklart i kode eller master (spørsmål 5).

### K10 Roller: Trener · Coach · Assist Coach · Hjelpetrener · Assistent · Hovedcoach · Head coach · Elev · Spiller · Utøver

- «Trener» `src/components/wang/WangAppSkall.tsx:32`
- «Coach» `src/app/portal/actions.ts:389`
- «Assist Coach» `src/components/team-norway/tn-shell.tsx:151`
- «Hjelpetrener» `src/app/admin/grupper/[id]/legg-til-medlem-modal.tsx:21`
- «Hovedcoach» `src/components/portal/v2/CoachMeldingerV2.tsx:260`
- «Bare head coach.» `src/components/admin/precision/AG24Drift.tsx:108`
- «Velg elev» `src/components/wang/WangTester.tsx:293`
- «Utøver» `src/lib/domain/tn-post.ts:334`

**Anbefaling:** Coach, Assist Coach, Hovedcoach og Spiller i all tekst. I `/team-wang` beholdes rolleordene Trener og Sportssjef. «Hjelpetrener», «Assistent», «Head coach», «Elev» og «Utøver» ut av PlayerHQ, AgencyOS og forelderflaten. **Begrunnelse:** masteren kap. 2.2, beslutning 22.09 (Assist Coach) og 27.09 (WANG-rollene).

### K11 Treningsmiljø · Belastning · Miljø · Sted · Lokasjon · Fasilitet · Arena

- «Treningsmiljø» `src/lib/domain/workbench/labels.ts:106`
- «Belastning (sRPE)» `src/components/admin/precision/AG11Ark.tsx:194` (opplevd anstrengelse)
- «Belastning i kg» `src/components/fys-plan/ovelse-tabell.tsx:169` (vekt)
- «Neste belastning» `src/app/portal/meg/abonnement/kort/ny/page.tsx:76` (kortbetaling)
- «Velg dato, varighet og miljø. …» `src/components/admin/add-session-wizard.tsx:257`
- «Sted» `src/components/admin/precision/AG11Ark.tsx:279`
- «Lokasjon» `src/components/portal/v2/NyTestV2.tsx:631`

**Anbefaling:** Treningsmiljø for hvor og i hvilken situasjon; Sted for konkret sted; Lokasjon og Fasilitet bare i booking; Belastning bare om intensitet, vekt og motstand; «Arena» og «Miljø» ut. **Begrunnelse:** masteren kap. 2.5, 3 og 12. Koden har fire parallelle miljøsett (M0–M5, `SessionEnvironment`, `TrackManEnvironment`, `belastning`).

### K12 Gjennomført · Fullført · Ferdig · Utført · Avlyst · Avbestilt · Kansellert · Avbrutt

- «Gjennomført» `src/components/admin/precision/AG12Oktark.tsx:62`
- «Fullført» `src/lib/domain/workbench/labels.ts:56`
- «Ferdig» `src/components/v2/utviklingsplan.tsx:38`
- «Avlyst» `src/lib/domain/workbench/labels.ts:57`
- «Kansellert» `src/app/team-norway/workbench/page.tsx:69`
- «Avbrutt» `src/lib/domain/workbench/labels.ts:59`
- «Avbestilt» `src/app/portal/booking/[bookingId]/page.tsx:30`

**Anbefaling:** Økt: Planlagt · Pågår · Gjennomført · Avlyst · Hoppet over. Avbestilt bare om booking. «Kansellert» og «Ferdig» ut. «Fullført» bare i løpende tekst. «Avbrutt» (økt stoppet underveis) må enten inn i masteren eller erstattes; se spørsmål 8. **Begrunnelse:** masteren kap. 3 og 4.3. I dag viser samme enum `COMPLETED` både «Fullført» og «Gjennomført».

### K13 Registrere · Logge · Loggfør · Føre · Lagre

- «Registrer» `src/components/portal/live/LiveActive.tsx:187`
- «Logg trening» `src/components/portal/global-search-modal.tsx:70`
- «Logg ny runde» `src/app/manifest.ts:51`
- «Loggfør puttetest 3–6 ft» `src/components/v2/domene2.tsx:227`
- «Ført» `src/components/team-norway/tn-testdag-ko.tsx:11`
- «Lagre» `src/lib/domain/workbench/labels.ts:160`

**Anbefaling:** Registrere for å føre data inn, Lagre for å bevare, Publisere for å gjøre synlig. «Logg inn» og «logg ut» beholdes. **Begrunnelse:** masteren kap. 3 og 4.1. «Logg» og «loggfør» står i over 150 strenger.

### K14 Treningsmåte: seks skrivemåter for fire verdier

- «Blokktrening» `src/lib/domain/workbench/ovelse-detaljer.ts:109`, «Variasjonstrening» `src/lib/domain/workbench/ovelse-detaljer.ts:110`
- «Variabel» `src/components/workbench/WorkbenchOkt.tsx:67`, «Spilltest» `src/components/workbench/WorkbenchOkt.tsx:69`
- «Blokkpraksis» `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts:59`, «Tilfeldig praksis» `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts:60`
- «Repetisjon» `src/lib/portal/translate-taxonomy.ts:58`
- «Komparativ» `src/lib/portal/training/ak-taxonomy.ts:127`
- To enum: `DrillPracticeType` (`prisma/schema.prisma:150`) og `PracticeType` (`prisma/schema.prisma:433`, har `RANDOM`)

**Anbefaling:** Blokktrening · Variasjonstrening · Konkurranseform · Spill/test overalt (etikettene i øvelsesskjemaet). **Begrunnelse:** masteren kap. 14.2 og 20. «Random», «Komparativ» og «Simulator/Test» er utgåtte navn.

### K15 Læringssteg · Læringsfase · Motorikk · L-fase; Automatikk · Auto · Automatisk; fart · hastighet

- «Læringssteg» `src/lib/domain/workbench/labels.ts:105`
- «Læringsfase» `src/components/portal/v2/WorkbenchV2Sheets.tsx:860`
- «Motorikk (læringssteg)» `src/components/workbench/DrillListEditor.tsx:595`
- «Automatikk» `src/lib/domain/ak-formel-v2.ts:145`, «Automatisk» `src/components/portal/live/DrillLogger.tsx:25`
- «Full fart» `src/lib/domain/workbench/reps.ts:29`, «Lav hastighet» `src/lib/domain/ak-formel-v2.ts:144`

**Anbefaling:** Læringssteg, Automatikk og hastighet (prosent av Club Speed). «Motorikk» og «Læringsfase» ut av skjermtekst. **Begrunnelse:** masteren kap. 3, 14.1 og 19.

### K16 Simulator som sted

- «Simulator» `src/lib/domain/workbench/ovelse-detaljer.ts:60` (delvalg under Innendørs golf)
- «Simulator» `src/lib/labels/taxonomy.ts:33` (miljøverdi)
- «Simulator» `src/lib/portal/translate-taxonomy.ts:23` (M2) mot «Simulator» `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts:55` (M5)
- «Simulator (innendørs)» `src/lib/sg-hub/environment-labels.ts:4`

**Anbefaling:** Sted skal være Innendørs golf; simulator er utstyr eller arena inni, ikke et eget sted. Ta bort «Simulator» som sted- og miljøvalg i nye skjermer og eksterne tekster. **Begrunnelse:** regelen i bestillingen. Masteren selv lister «TM Simulator» som sted (`docs/treningsplanlegging.md:425`) og må rettes samtidig; se spørsmål 4. M2 og M5 gir motstridende betydning av «Simulator» i to filer.

### K17 Områdenavn: Utslag · Tee Total · Tee-slag · TEE; Putt · Putting; antall områder

- «Utslag» `src/lib/domain/ak-formel-v2.ts:98`
- «Tee total» `src/lib/labels/taxonomy.ts:21`
- «Putting» `src/components/teknisk-plan/constants.ts:25`
- «Putt 0–3 fot» `src/lib/domain/ak-formel-v2.ts:107`
- 19 områdekoder `src/lib/domain/ak-formel-v2.ts:73`

**Anbefaling:** Utslag; Putting som fane og familie, «Putt 0–3 fot» osv. som område. Områdelisten er de 19 kodene i AK-formel v2; den eldre 17-listen og hybrid-listen utgår. **Begrunnelse:** masteren kap. 11 og 20. Bestillingen oppgir fem områder (TEE, INNSPILL, NÆRSPILL, PUTT, BANE); det er familier, ikke områdekoder.

### K18 Stats · Analyse · Statistikk

- «Stats» `src/components/workbench/WorkbenchSamlet.tsx:17`
- «Analyse» `src/components/team-norway/tn-shell.tsx:101`
- «Analyse · AK Golf» `src/app/portal/analysere/layout.tsx:9`
- «Statistikk» `src/components/portal/global-search-modal.tsx:183`

**Anbefaling:** Stats som fanenavn, statistikk i løpende tekst, «Analyse» ut. **Begrunnelse:** masteren kap. 2.2 og 2.6 (beslutning 28.09.2026).

### K19 Booking: fem ord for samme status

- «Behandler» `src/app/portal/booking/[bookingId]/page.tsx:28`
- «Venter» `src/components/admin/v2/AdminBookingerV2.tsx:82`
- «Forespørsel» `src/components/admin/v2/AdminBookingDetaljV2.tsx:21`
- «Venter på deg» `src/components/admin/precision/AG06Booking.tsx:81`
- «Venter på bekreftelse» `src/components/v2/domene.tsx:202`
- «Venter betyr at coachen ikke har svart ennå.» `src/components/portal/v2/ForelderBookingerV2.tsx:230`

**Anbefaling:** Ett ord per tilstand. Betalte bookinger er bekreftet automatisk, så «venter» gjelder bare bookinger uten betaling: «Venter på coach». Spiller og coach bruker samme ord for gjennomført og avlyst. **Begrunnelse:** beslutning 27.09.2026; forelderteksten er misvisende i dag.

### K20 AK-stigen: fire eller fem trinn, og A-koder

- «AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i fem trinn med navn: Mini, Knøtt, Basis, Utvikling og Elite.» `src/app/(marketing)/junior/page.tsx:13`
- «Knøtt» `src/lib/agencyos/ak-stigen-data.ts:43` (ved siden av stigen)
- «Mini» `src/lib/agencyos/ak-stigen-data.ts:31`
- A-kodene brukes i tre betydninger: `src/lib/agencyos/ak-stigen-data.ts:31`, `src/lib/domain/grupper.ts:71`, `src/components/admin/v2/AdminNySpillerV2.tsx:44`

**Anbefaling:** Fire trinn (Mini · Basis · Utvikling · Elite) og Knøtt som egen aldersgruppe ved siden av. Én kodebruk for A1–A4. **Begrunnelse:** beslutning 22.09.2026. Den offentlige juniorsiden venter på eiers beslutning (spørsmål 7).

### K21 Utgåtte koder i skjermtekst

- «Velg L-fase.» `src/components/admin/add-session-wizard.tsx:259`
- «Ingen aktiv L-fase» `src/components/portal/v2/UtviklingsplanV2.tsx:128`
- «Miljø/kontekst fra M0 (isolert) til M5 (helt banelikt).» `src/app/team-wang/_data/wang-plan.ts:624`
- `L_AUTO` vist rått `src/lib/portal-drills/ph13-drills-data.ts:111`
- M0–M5 i fire tekstsett: `src/lib/taxonomy.ts:173`, `src/lib/portal/translate-taxonomy.ts:21`, `src/lib/portal-okt/okt-detalj-data.ts:110`, `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts:49`

**Anbefaling:** Fjern L-fase, CS, M0–M5 og PR1–PR5 fra all skjermtekst og erstatt med Læringssteg, Treningsmiljø og Press. CS er uavklart og skal ikke stå i tekster til foreldre. **Begrunnelse:** masteren kap. 19; koden sier selv at de fire M0–M5-settene «ikke er enige».

### K22 Mal-ord

- «Maler» `src/lib/domain/workbench/labels.ts:209`
- «Programmer» `src/lib/domain/workbench/labels.ts:210`
- «Øktmaler» `src/components/workbench/WorkbenchUkeverksted.tsx:25`
- «Ukemaler» `src/components/admin/precision/AG14PlanHub.tsx:151`
- «Standardøkter» `src/components/admin/precision/AG14PlanHub.tsx:153`
- «Ny planmal» `src/components/admin/precision/AG14MalNy.tsx:59`

**Anbefaling:** Overbegrep «mal» med tre navngitte typer: Ukemal, Program (flere uker) og Standardøkt. «Øktmaler» byttes til «Standardøkter». **Begrunnelse:** tre lagringssteder (`PlanTemplate`, `OktMal`, `isTemplate`) og fem ord gjør det uklart hva spilleren eller coachen får.

### K23 Uke · Ukeplan · Ukesplan · Måned · Månedsplan · Uketype

- «Ukeplan» `src/lib/domain/workbench/labels.ts:86`
- «Ukesplan & Fravær» `src/app/team-wang/WangToppidrettPrecisionView.tsx:176`
- «Måned» `src/lib/domain/workbench/labels.ts:98`
- «Månedsplan» `src/components/team-norway/tn-shell.tsx:95`
- «Uketype» `src/components/admin/precision/AG11Ark.tsx:389` (nytt sett) mot «Tidligere uketype» `src/components/admin/precision/AG11Ark.tsx:394` (eldre sett)

**Anbefaling:** Ukeplan og Måned; «Månedsplan» bare der en egen månedsflate finnes (Team Norway) til det er besluttet. Ett uketypesett. **Begrunnelse:** masteren kap. 5 har ikke «Månedsplan»; to uketypesett vises i samme ark.

### K24 Planstatus

- «Til godkjenning» `src/components/portal/v2/WorkbenchV2.tsx:182`
- «Endring bedt om» `src/components/portal/v2/WorkbenchV2.tsx:183`
- «Venter på spiller» `src/lib/portal-coach/ph21-data.ts:64`
- «Venter på coach» `src/components/portal/precision/PH12VelgPlan.tsx:157`

**Anbefaling:** Utkast · Venter på spiller · Venter på coach · Godtatt · Avvist · Aktiv · Arkivert. **Begrunnelse:** masteren kap. 4.3 (beslutning 26.09.2026). Enum-navnet `PENDING_PLAYER` (`prisma/schema.prisma:228`) betyr venter på spiller, men vises som Venter på coach for spillerens egen innsending.

### K25 Økta · økten

- «Avslutte økta?» `src/components/portal/precision/PH05LiveAktiv.tsx:668`
- «Økten er startet» `src/components/workbench/WorkbenchLive.tsx:197`
- «Økta er fullført.» `src/lib/portal-live/brief-state.ts:6`

**Anbefaling:** «økten» i all skjermtekst. **Begrunnelse:** masteren skriver «Økten er gjennomført.» (kap. 4.2); begge former er riktig bokmål, men blandingen virker uferdig. Dette er en anbefaling uten bindende kilde; se spørsmål 12.

### K26 Oppmøte med to betydninger

- «Oppmøte» `src/components/portal/v2/ForelderUkerapportV2.tsx:39` (antall gjennomførte økter)
- «Ikke møtt» `src/components/team-norway/tn-testdag-ko.tsx:11` (fysisk fremmøte)

**Anbefaling:** «Oppmøte» bare om fysisk fremmøte; i ukerapporten brukes «Gjennomført». **Begrunnelse:** masteren kap. 2.5 skiller oppmøte og deltakelse fra gjennomføringsstatus.

### Funn som ikke er navnekonflikter

**Anbefaling:** rettes som egne oppgaver, utenfor språkarbeidet.

- Hardkodet fornavn på coach i tekst til spilleren: `src/components/portal/precision/PH04LiveBrief.tsx:155`, `src/components/portal/precision/PH21Innboks.tsx:755`. Teksten blir feil for spillere med annen coach.
- Intern prosesstekst vist til spiller: «Tegnes ferdig i Workbench i runde 29.» `src/components/portal/precision/PH19Malsetninger.tsx:106`.
- Beslutningen 28.09.2026 om Hvor tungt og fokus 1–10 etter økt er ikke bygget; selvvurderingen 1–5 («Hvor til stede var du mentalt?» `src/lib/domain/okt-status.ts:97`) har ingen skjerm.

## 11. Ordliste for eksterne flater

Utvalg på 58 termer for gfgkjunior.no. Forklaringene er skrevet for en forelder uten golfbakgrunn. Termene følger masteren; der nettstedet i dag har et annet ord, står det i kolonnen «Merk». CS-nivåer, P-posisjoner og interne koder er ikke med.

| # | Term | Forklaring for forelder | Merk |
|---|---|---|---|
| 1 | Årsplan | Hele treningsåret samlet på ett sted: periodene, turneringene og testene. | – |
| 2 | Periode | Et tidsrom på noen uker med ett hovedfokus. | Nettstedet sier «fase» enkelte steder |
| 3 | Grunnperiode | Perioden der barnet bygger styrke, teknikk og treningsvaner. | – |
| 4 | Spesialperiode | Perioden der treningen rettes mot det barnet trenger mest. | Nettstedet sier i dag «Spesialisering» |
| 5 | Turneringsperiode | Perioden rundt konkurranser, med forberedelse og spill. | – |
| 6 | Evaluering | Perioden der vi ser tilbake, måler og justerer planen. | – |
| 7 | Testuke | En uke der barnets ferdigheter måles med faste tester. | – |
| 8 | Ferie | Pause eller redusert trening. | – |
| 9 | Restitusjon | Hvile og gjenoppbygging etter harde uker. | – |
| 10 | Treningssamling | Flere treningsøkter samlet over noen dager. | – |
| 11 | Heldagssamling | Treningssamling som varer hele dagen. | – |
| 12 | Uke | Vanlig kalenderuke; her ligger øktene. | – |
| 13 | Økt | En enkelt trening med start, varighet og innhold. | – |
| 14 | Gruppeøkt | En økt som alle i gruppen er med på. | – |
| 15 | Øvelse | En oppgave inne i en økt, for eksempel å slå ti slag mot et mål. | Ikke «drill» |
| 16 | Plan | Det som er lagt inn for barnet: økter, uker og perioder. | – |
| 17 | Spiller | Barnet som trener. | Ikke «elev» utenfor WANG |
| 18 | Coach | Treneren som planlegger og følger opp barnet. | – |
| 19 | Assist Coach | Hjelpetrener med begrenset rolle i gruppen. | Ikke «hjelpetrener» |
| 20 | Forelder | Du som har barnet; du ser plan, oppmøte og betaling. | – |
| 21 | Gruppe | Barna som trener sammen etter alder og nivå. | – |
| 22 | AK-stigen | Fire trinn: Mini, Basis, Utvikling og Elite. Barnet flyttes opp etter alder og nivå. | Offentlig side sier i dag fem trinn |
| 23 | Mini | Første trinn: golfskole for de yngste. | – |
| 24 | Basis | Andre trinn: grunnleggende ferdigheter. | – |
| 25 | Utvikling | Tredje trinn: mer målrettet trening. | – |
| 26 | Elite | Fjerde trinn: konkurransespillere. Ikke et abonnement. | – |
| 27 | Knøtt | Aldersgruppen 11–12 år. Egen gruppe ved siden av stigen, ikke et eget trinn. | Offentlig side regner den som trinn |
| 28 | Fysisk | Styrke, kondisjon og bevegelighet. | Kort: FYS |
| 29 | Teknisk | Arbeid med selve svingen og bevegelsen. | Kort: TEK |
| 30 | Golfslag | Trening på ett bestemt slag, for eksempel et innspill. | Kort: SLAG |
| 31 | Spill | Å bruke ferdighetene i en spillsituasjon, for eksempel på bane. | – |
| 32 | Turnering | Forberedelse til og spill i konkurranse. | Kort: TURN |
| 33 | Pyramide | Hva slags trening øvelsen er: fysisk, teknisk, golfslag, spill eller turnering. | – |
| 34 | Utslag | Det første slaget på et hull. | Ikke «Tee Total» |
| 35 | Innspill | Slag mot green fra 50 meter og lengre. | – |
| 36 | Nærspill | Korte slag inn mot green, innenfor 50 meter: chip, pitch, lob og bunker. | Ikke «kortspill» |
| 37 | Putting | Slag på green, der ballen rulles mot hullet. | – |
| 38 | Banespill | Å spille på selve golfbanen. | – |
| 39 | Treningsmiljø | Hvor og i hvilken situasjon treningen skjer: inne, på treningsområdet eller på banen. | – |
| 40 | Press | Hvem som ser på: alene, observert, konkurranse eller turnering. | – |
| 41 | Blokktrening | Samme oppgave gjentas mange ganger. | – |
| 42 | Variasjonstrening | Oppgaven endres underveis for å ligne på ekte spill. | – |
| 43 | Repetisjoner | Hvor mange ganger en oppgave gjentas. | – |
| 44 | Læringssteg | Stegene en bevegelse læres i: uten ball, rolig med ball, og i full fart. | – |
| 45 | Målsetning | Det barnet sikter mot, skrevet ned og fulgt opp. | Ikke «mål» alene |
| 46 | Resultatmål | Resultatet barnet vil oppnå, for eksempel et handicap. | – |
| 47 | Prosessmål | Det barnet skal gjøre jevnlig, for eksempel tre puttingøkter i uka. | – |
| 48 | Teknisk plan | Plan for hva barnet jobber med i svingen, steg for steg. | – |
| 49 | TrackMan | Radar som måler slagene: avstand, retning og hastighet. | – |
| 50 | Club Speed | Hvor fort køllehodet beveger seg i treffet. | – |
| 51 | Strokes Gained | Et tall som viser hvor mange slag spilleren vinner eller taper mot et sammenligningsgrunnlag. | Må alltid oppgi referanse |
| 52 | Handicap (HCP) | Tallet som viser hvor god en golfspiller er; lavere er bedre. | – |
| 53 | Brutto score | Antall slag spilleren faktisk brukte, uten handicap-fratrekk. | Aldri netto |
| 54 | Kategori A–K | Nivåinndeling etter snittscore; A er høyest, K lavest. | – |
| 55 | Booking | Bestilling av en time hos coach. | Ikke «Venter» for betalte |
| 56 | Avbestilling | Å avlyse en booking du har gjort. Avlysning er når coach avlyser. | – |
| 57 | Oppmøte | Om barnet møtte opp på økta. | – |
| 58 | Samtykke | Foreldrenes godkjenning, for eksempel for bilder og deling av data. | Kreves for barn under 16 |

## 12. Spørsmål til Anders

Disse kan ikke besvares av koden eller dokumentene. Hvert spørsmål har en anbefaling jeg legger til grunn til du sier noe annet.

1. **Navn på perioden:** bestillingen sier «Spesialiseringsperiode», beslutning 28.09.2026 sier «Spesialperiode». Bekreft Spesialperiode også for gfgkjunior.no, og når den publiserte GFGK-teksten skal rettes. *Anbefaling:* Spesialperiode.
2. **Områdeliste:** bestillingen nevner fem områder (TEE, INNSPILL, NÆRSPILL, PUTT, BANE). Koden og masteren har 19 områder i fem familier. Skal eksterne tekster bruke familiene (Utslag, Innspill, Nærspill, Putting, Banespill)? *Anbefaling:* ja, familiene.
3. **CS-nivåer (CS0, CS20–CS100):** uavklart. Skal de aldri brukes i tekst til foreldre, og skal databasekolonnene fjernes? *Anbefaling:* aldri i foreldretekst.
4. **Simulator som sted:** bestillingen sier at simulator aldri vises som sted. Masteren kap. 12 lister «TM Simulator» og «Simulator» som sted, og koden viser «Simulator» som delvalg under Innendørs golf. Hvilken regel gjelder? *Anbefaling:* bestillingens regel, og at masteren rettes.
5. **GOBBS:** hva betyr ordet, og skal det forklares for spillere? Det står bare i spørsmålene i utviklingssjekken. GUBBS finnes ikke i noen kilde.
6. **GFGK-treningsfasene LEK · BUILD · STAB · TEST · TRANSFER · PERFORM:** er dette et eget begrep ved siden av periodene, og hva skal det hete på norsk? *Anbefaling:* eget navn, ikke «fase» og ikke «periode».
7. **Offentlig juniorside:** den beskriver fem trinn med Knøtt som trinn (`src/app/(marketing)/junior/page.tsx:13`). Når skal den rettes til fire trinn og Knøtt som egen gruppe?
8. **Sluttstatus på mål og økter:** hva heter en målsetning som er avsluttet uten å nås, og en økt som er stoppet underveis? Koden har «Avbrutt», masteren har ikke ordet.
9. **Blokkene Oppvarming · Hoveddel · Avslutning:** de finnes i WANG-skjermer og i GFGK-tekst, ikke i Workbench. Skal Workbench-økta ha dem, og skal de få fast navn?
10. **Månedsplan:** skal «Månedsplan» innføres som begrep (finnes i Team Norway), eller er «Måned» riktig?
11. **«Hvor tungt» og fokus 1–10:** besluttet 28.09.2026 men ikke i kode. Ønsker du dem bygget, og skal selvvurderingen 1–5 (Fokus, Gjennomføring, Mestring) som er laget uten skjerm, brukes eller fjernes?
12. **Økta eller økten:** begge er riktig bokmål. Skal skjermtekst samles på én form? *Anbefaling:* økten.
13. **Hovedcoach eller head coach:** to ord for samme rolle. *Anbefaling:* Hovedcoach, i tråd med masteren.
14. **Sesongmål, Fokusområde og Mål for perioden:** tre ord for målsetning på periodenivå. Skal bare «Målsetning» brukes, med nivå (år, periode, måned, uke, økt) som egen merkelapp?
15. **Hardkodet coachnavn i tekst til spiller** (`src/components/portal/precision/PH04LiveBrief.tsx:155`): skal det rettes som del av språkarbeidet, eller i egen oppgave?
