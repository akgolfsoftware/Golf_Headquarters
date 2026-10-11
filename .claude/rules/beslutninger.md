# Beslutninger — AK Golf HQ

Kun det som gjelder nå. Gamle overstyrte valg er historikk, aldri byggeordre.
Ny beslutning registreres med `/beslutning` (skriver hit). `docs/MASTERPLAN-GJENSTAAENDE.md` ble fjernet i b700ce008 — krever en beslutning bygging, skriver den det eksplisitt i sin egen blokk.
Produkt- og forretningsregler eies av `docs/platform/BUSINESS-RULES.md`; ved konflikt vinner den.

## KODEGJENNOMGANGEN 06.10: TRENERE FORESLÅR, FORELDER GODKJENNER INNEN SJU DAGER, DATA GOLF BARE FOR COACHER (Anders 06.10.2026, bindende)

Svar på funnene og spørsmålene i `docs/review/kodegjennomgang-2026-10-06.md` (grenen `review/kodegjennomgang`).

- **WANG- og Team Norway-trenere kan bare anbefale endringer.** De ser bare det spilleren har delt,
  og skriver aldri direkte i spillerens plan. Gruppemedlemskap alene gir verken innsyn eller skriverett.
  Endringer går som forslag spilleren godtar eller avviser (`lagTrenerforslag`).
- **Coachvideo, AI-samtaler og andre spillerdata krever eiersjekk.** En coach når bare egne spillere.
  En bruker når bare egne samtaler.
- **Under 16 år: forelder må godkjenne innen sju dager etter at kontoen er opprettet.** Barnet kan
  bruke appen fullt ut de sju dagene. Er forelder ikke godkjent innen da, låses kontoen til
  godkjenningen kommer. Deling og opptak er alltid sperret til forelder har godkjent. Fødselsdato
  kreves for spillere og kan ikke skrives om av spilleren selv.
- **Data Golf er bare for coacher**: alle med coach-rollen, også WANG- og Team Norway-trenere, og
  ADMIN. Spillere ser det aldri, heller ikke Talent-profilen. `/stats/pga` og annen Data Golf-visning
  flyttes bak innlogging for coacher; det åpne søket viser ikke Data Golf-tall.
- **Forelderens innsyn fortsetter etter 16 år**, til spilleren selv fjerner forelderen.
- **Gamle filer som ingen levende kode bruker, slettes** (432 filer, liste i
  `docs/review/vedlegg/doedkode-filliste.txt`), i små samlede endringer på høyst 20 filer.
- **Workbench beholder de fire visningene fra 02.10** (Sesongkart · Ukeverksted · Trenerbord · Stats).
  Detaljene fra nivåtegningene (Gjenta-arket, «Egen»-merket, øktarket, periode- og månedsskjema)
  tegnes inn i dem. Svar på M1 i Workbench-beskrivelsen.
- **Tilgangsreglene kan endres i fase 2** av kodegjennomgangen, etter planen i dokumentet.

**Overstyrer:** «DataGolf vises aldri for andre enn Anders» i §PIPELINES ER ENESTE KILDE og D-19
(«bare analytiker»), «DataGolf-sammenligning» i Talent-profilen (BUSINESS-RULES §TALENT),
«Powered by Data Golf på alle offentlige statistikkflater» under §Data, den automatiske
gruppetilgangen for trenermedlemmer i `src/lib/auth/coached.ts` (G5, tredje gren), og
nivåtegningene som Workbench-ramme i `docs/workbench-handover.md` og handoff 04.10.

**Arbeidet dette utløser** (fase 2 i kodegjennomgangen, én PR per punkt, ingen legges inn uten Anders' ja):

1. **Org-trenere foreslår, skriver ikke** (PR 1a): `coachScopedPlayerWhere` og `editableGroupWhere`
   skiller AK-grupper fra WANG/TN-grupper; org-grupper krever `DelingsSamtykke` for innsyn og
   bruker forslag for endring. Testen `coached.test.ts:78` skrives om. Ferdig når en WANG-trener
   uten deling avvises i AgencyOS, låst med test (funn TO-01, TO-02, TO-04, TO-12).
2. **Eiersjekk** på AI-samtale (PR 1b, TA-01), coachvideo (PR 1c, TP-01), talenotat og slag
   (PR 1d, TP-06, TP-05).
3. **Sju dagers forelderfrist** (PR 1e): fødselsdato påkrevd for PLAYER, ikke redigerbar for
   spilleren, lås etter sju dager uten godkjent forelder, lydsamtykke for under 16 bare via forelder.
   Ferdig når en 13-åring uten godkjenning låses dag 8, og coach ikke kan registrere «SELV» for et barn
   (TA-03, TA-04, TP-02). Krever additivt felt eller bruk av `createdAt`; avklares i PR-en.
4. **Data Golf-port `kanSeDataGolf`** (PR 2): coach-rolle eller ADMIN. Brukes på
   `/portal/analysere/datagolf*`, `/stats/pga*`, `/api/stats/search` og inngangene i Analyse og
   TN-menyen. Ferdig når en spiller og en uinnlogget avvises, låst med test (TO-07, TO-08, TA-06).
5. **Forelderinnsyn etter 16:** krever ingen kodeendring — bekrefter dagens tilstand (TA-08).
   Spilleren må kunne fjerne forelderen selv; finnes ikke den knappen, bygges den i PR 1g.
6. **Sletting av døde filer** (PR 5a–5v) etter lista i vedlegget.
7. **Workbench-dokumenter** for nivåene merkes utgått og slettes i PR 9b.

## CLAUDE CODE PORTERER, IUP BARE FOR AKTIVE WANG-/TN-MEDLEMMER, BARE PH-01 ER GODKJENT (Anders 04.10.2026, bindende)

Bestilling 04.10 med design-handoff i `docs/design-handoff/` (porteringskø `regler/claude-code.md`).

- **Claude Code porterer** skjermene fra Precision Athletics til appen fra 04.10. Claude Design er fortsatt designkilde.
- **IA 28.09 gjelder.** AG-02 Kø, AG-17 Turneringer, AG-18 TrackMan og video og PH-26 Utenfor banen bygges ikke. Skjermlista i `docs/design-handoff/regler/skjermliste.md` er fasit for hva som finnes.
- **Bare PH-01 er visuelt godkjent.** Alt annet er kandidat til Anders har sett det i appen.
- **PH-IUP-01 Fireukerssjekk er godkjent for lansering** (Anders 04.10, etter skjermbilder 390 og 1280 px): «Det ser veldig kjedelig ut, men vi godkjenner.»
- **Lansering først, designløft etterpå** (Anders 04.10): skjermer som virker, godkjennes for lansering selv om uttrykket er nøkternt. Videre designutvikling skjer i bakgrunnen etter lansering, og endres når demospillere har testet noen uker.
- **IUP er et tillegg i PlayerHQ** (samme skall, ingen egen fane), og vises bare for spillere med PlayerHQ-profil som er aktive medlemmer i en WANG Toppidrett- eller Team Norway-gruppe. Ender medlemskapet, skjules IUP med en gang, også tidligere svar.
- **Trenerinnsyn uten ja fra spiller/forelder venter** (Anders 04.10: «Del opp»). Handoffen sier at gruppen får innsyn automatisk, men kravet om samtykke, og foresattes samtykke under 16, står til Anders har avklart det juridisk.
- **Regi per spiller i AgencyOS** (Privat · GFGK · WANG · Team Norway) bygges ikke før designet finnes.

**Overstyrer:** «Codex fullfører resterende prosjekt» i §CLAUDE DESIGN EIER DESIGNET, og at tidligere IUP-besvarelser gir inngang etter utmelding (`harEgenIupInngang`).

**Arbeidet dette utløser:** porteringskøen i `docs/design-handoff/regler/claude-code.md`, punkt 1–12. Juridisk avklaring av automatisk trenerinnsyn før `navngittTrenerHarTilgang` endres.

## LANSERING 05.10: SEKS AG-SKJERMER BEHOLDES, MARKEDSSIDENE FÅR PRECISION (Anders 04.10.2026, bindende)

Anders 04.10 kl. 23: «De skal med. Så tar vi det heller bort igjen.» Og bestilling om at PlayerHQ,
AgencyOS, markedssidene og innloggingen skal være lanseringsklare med riktig design 05.10.

- **AG-02 Kø, AG-17 Turneringer, AG-18 TrackMan og video, AG-21 Oppgaver, AG-22 Innsikt og talent
  og AG-24 Drift beholdes** som egne skjermer i Precision, selv om IA 28.09 sa at de utgår. De kan
  fjernes senere. PH-26 Utenfor banen er fortsatt utgått og sender til Meg.
- **Markedssidene får Precision Athletics** (Anders 04.10: «Bytt til Precision»). Det finnes ingen
  tegninger for dem, så de bygges med Precision-komponentene og blir kandidater til Anders har sett dem.
- **Lansering** betyr at hovedveiene virker og følger designet, og at ingen side krasjer, ruller sidelengs
  eller viser demodata. Port 7 (Anders har sett skjermen) gjøres fra morgenrapporten.
- IUP-køen (PH-IUP-02 og videre) kommer etter lanseringen.

**Overstyrer:** «Markedssidene venter» (23.09) under §PRECISION ATHLETICS, og «Utgår 28.09» for de
seks AG-skjermene i skjermlisten.

**Arbeidet dette utløser:** nattkjøring 04.–05.10 etter planen i økten: samle ferdige grener,
maskinsjekk av alle sider, rette røde funn med hovedveiene først, markedssidene til Precision,
prøvekjøring og morgenrapport.

## CLAUDE DESIGN EIER DESIGNET, CODEX EIER KODEN (Anders 30.09.2026, bindende)

Anders: «Claude Design er ansvarlig for design fra nå og Codex tar kode.» Anders ønsker at
Codex fullfører resterende prosjekt, og har i denne økten bestilt en plan for gjennomføringen.
Viderefører Precision Athletics og erstatter eldre omtale av Grok eller Claude Code som
kodeansvarlig. Ingen nye produkt-, skjema-, tilgangs- eller publiseringsvalg følger av rollebyttet.

**Arbeidet dette utløser:** [fullføringsplanen](../../docs/planer/codex-fullforing-claude-design-2026-09-30.md):
fersk kartlegging → felles grunnlag → komplett treningskjede → øvrige spillerverktøy →
booking/coaching → AgencyOS/AI → forelder/organisasjoner → sluttkontroll → autorisert lansering.
Codex bruker valgte, versjonerte designleveranser, bevarer funksjoner og viser app/design
side om side. Nye konkrete produktvalg avklares; allerede bestilt arbeid videreføres.
Denne økten leverer planen. Implementasjons- og kontrollstatus føres separat.

**Presisering i samme økt:** Anders vil at Codex planlegger arbeidet før Claude Design er
ferdig, undersøker alle funksjoner og kontrollerer at de virker sammen. Planens PRE-01–08
dekker funksjonsregister, isolert testmiljø, fersk teststatus, avtaler mellom moduler,
treningskjeden, roller/booking/AI, gjenoppretting og teknisk overlevering. Endelig skjermarbeid
følger valgt design; uavhengig funksjonsarbeid kan gjennomføres først.

## ORDBOKA ER LÅST: AVVIKENE MOT PRECISION ER AVGJORT (Anders 30.09.2026, bindende)

Svar på punkt 3 i §APPENS ORDBOK VINNER: alle avvik mellom masteren `docs/treningsplanlegging.md`
og Precisions `guidelines/ordmaster.md` er lagt fram og avgjort. Masteren er rettet i samme PR.

- **Stats** er fanen i PlayerHQ; i løpende tekst skrives «statistikk».
- **Målsetning** er det spilleren sikter mot. «Mål» brukes bare om måltall (TrackMan-mål, rep-mål, resultatkrav).
- **Venter på coach** er plan-status (bekrefter 26.09).
- **Nivåene heter Gratis og Full** på skjerm. Pro, Premium og Plus brukes ikke; «Pro» forveksles
  med coaching-pakken Performance Pro. TALENT / FULL / INGEN er interne tilgangsutfall.
- **Aksene:** FYS Fysisk · TEK Teknisk · SLAG Golfslag · SPILL Spill · TURN Turnering. Banespill er
  bare treningsområdet.
- **Nytt i masteren:** menyene (§2.6), kategorier A–K, SG-kategorier og dagsform (§2.7), fem
  standardplaner (§2.8), turneringstyper (§10).
- **Kondisjon** angis med pulssone S1–S5. **Styrke** skrives «4 × 6 @ 90 kg · RIR 2».
- **Teknisk fokus:** fortsatt ett per øvelse; en økt kan ha flere øvelser valgt fra spillerens
  tekniske plan. TrackMan-parametere foreslås ut fra valgt fokus.
- **Fysisk program** legger økter i planen; hver økt kan endres.

**Overstyrer:** «Gratis / Pro» i masteren §2.5, «Stats → Statistikk» og «Goal → Mål» i masteren §3.

**Arbeidet dette utløser:**

1. **Precision (`7d7c2994`):** hele prosjektet rettes etter masteren; `guidelines/ordmaster.md` og
   `assets/ak-vocabulary.js` blir avledede speil. Ferdig når et søk etter de forbudte ordene i
   masteren §3 gir 0 treff i skjermtekst, og ingen fil kaller ordmasteren autoritativ.
2. **Koden:** skjermtekst som viser nivånavn bruker Gratis / Full. Ferdig når ingen brukervendt
   tekst viser «Pro», «TALENT» eller «FULL» som nivå.
3. **TrackMan-forslag per fokus:** tabell legges fram for Anders før den bygges.
4. **Fysisk program:** datamodell og flyt planlegges når fysisk trening bygges.

## APPENS ORDBOK VINNER OVER PRECISIONS ORDMASTER (Anders 29.09.2026, bindende)

Anders: «docs/ordbok.md vinner». Svar på det uavklarte punktet i §PRECISION ATHLETICS om to ordlister.

- **Språket eies av repoet.** `docs/ordbok.md` peker til masteren `docs/treningsplanlegging.md`, som
  er eneste kilde for ord, statuser, posisjonsnavn og treningsbegreper.
- **`guidelines/ordmaster.md` i Claude Design «AK Golf Precision Athletics» (`7d7c2994`) er avledet.**
  Den er et speil for tegningene, ikke fasit. Sier den noe annet enn masteren, rettes ordmasteren.
- Posisjonsnavnene fra §POSISJONSNAVN FØLGER ORDMASTEREN (27.09) står nå i masteren §14.4, så
  navnene er de samme og kilden er repoet.

**Overstyrer:** Precisions `readme.md`, som kaller `guidelines/ordmaster.md` autoritativ.

**Arbeidet dette utløser:**

1. **Posisjonsnavn i masteren:** P1.0–P10.0 inn i `docs/treningsplanlegging.md` §14.4. Gjort i samme PR.
2. **Precision (`7d7c2994`):** `readme.md` og toppen av `guidelines/ordmaster.md` sier at masteren i
   repoet gjelder og at ordmasteren er avledet. Ferdig når ingen fil i prosjektet kaller ordmasteren
   autoritativ.
3. **Avvik mellom ordmasteren og masteren:** sammenlign ordene, legg avvikene fram for Anders, og rett
   ordmasteren etter svaret. Ferdig når de to sier det samme om hvert ord de begge har.

## Workbench over uka: årsplan, periode og måned (Anders 28.09.2026, bindende)

Anders vil ha knapper og skjema for ny årsplan, periodisering og månedsplan i Workbench.
I dag lages en årsplan bare i det skjulte ved første periode (`opprettPeriodeCore`,
`src/lib/workbench/periode-core.ts`), alltid 1. jan–31. des, og måneden kan bare leses.

- **Både coach og spiller kan opprette årsplan.** Coach for en spiller eller en gruppe; spilleren
  for seg selv. Coachen ser spillerens plan.
- **Tidsrommet velges ved opprettelse.** Forslaget er skoleåret (aug–jun) for WANG og
  kalenderåret ellers.
- **Måneden får eget innhold:** fokus og mål (koblet til Målsetninger), timer per akse
  FYS · TEK · SLAG · SPILL · TURN fordelt på ukene, tester og turneringer, og notat og evaluering
  når måneden er over.
- **«Ny årsplan» kan starte fra** kopi av fjoråret, standardplan A–K, gruppas årsplan eller tom plan.

**Arbeidet dette utløser:**

1. **Design i Precision (`7d7c2994`):** veileder «Opprett årsplan» (utgangspunkt, tidsrom, navn),
   årsplanen med perioder, periodeskjema, månedsskjema, og coachens og gruppas inngang. Samme
   Workbench for spiller (PH-11) og coach (AG-11), jf. `ui_kits/_shared/WB3.jsx`, som i dag bare
   dekker uka. Ferdig når skjermene er i `audit.html` med 0 avvik og Anders har sett dem (port 7).
2. **Årsplan i basen:** `SeasonPlan` (`prisma/schema.prisma`) har ingen `createdById` og er unik på
   `[userId, year]`. Legg til `createdById`, la `year` bety startåret og ta start/slutt fra skjemaet.
   Additivt via `db execute` (gotchas §Database). Ferdig når en plan aug 2026–jun 2027 kan lagres.
3. **Ny tabell `MonthPlan`** (finnes ikke): spiller, årsplan, år og måned, fokus, timer per akse,
   notat og evaluering; mål kobles via Målsetninger. Additivt via `db execute`. Ferdig når
   månedsskjemaet lagrer og ukene viser timene fra måneden.
4. **Opprett årsplan i koden:** én server-handling som oppretter planen fra de fire utgangspunktene.
   Kopi av fjoråret og standardplan A–K finnes ikke i dag (malene i `PlanTemplate` er 4-ukersblokker);
   gruppas plan gjenbruker `coachRullUtGruppeAarsplan` (`src/lib/workbench/gruppe-periode-actions.ts`).
   Ferdig når alle fire er låst med test.
5. **Coachen kan redigere spillerens perioder:** `coachLagrePeriode` og `coachSlettPeriode`
   (`src/lib/workbench/session-actions.ts`) har ingen kaller, og `/admin/workbench/[playerId]`
   viser år og måned uten redigering. Ferdig når coachen kan legge inn, endre og slette en periode der.
6. **Åpent:** innholdet i standardårsplanene per kategori A–K (faglig, fra Anders), jf. punkt 4 i
   §ØKONOMI BARE FOR HEAD COACH.

## ØKONOMI BARE FOR HEAD COACH, WEDGE GATE TELLER TREFF, ALLE STANDARDPLANER FOR ALLE KATEGORIER (Anders 28.09.2026, bindende)

Svar på de sju åpne spørsmålene etter fase 4 (runde 27–30 i Precision).

- **Økonomi (AG-20) vises bare for head coach.** Assistant coach ser verken menypunktet eller siden.
- **Wedge Gate teller treff.** Hvert forsøk føres som treff eller bom; resultatet er antall treff.
- **Stall-matrisen** Trenger deg · Følger planen · Hviler: bekreftet.
- **Talentradaren** får stiplet linje for Kategori C: bekreftet (bare coach, §Data).
- **Hurtigmeldingene** OK · Spørsmål · Ikke nå: bekreftet.
- **Alle fem standardplaner kan velges i alle kategorier A–K.** Spilleren velger selv; innholdet
  tilpasses kategorien (§SKJERMENE … RUNDE 8, Motoren).
- **Bildet for tellerne i live-økt** sender Anders senere. Punktet står åpent til da.

**Overstyrer:** «Wedge Gate … beholder sperren» under §Åpne punkter etter runde 19–26, og
«Hvilke fem planer som passer hvilke kategorier A–K er ikke skrevet» i §SKJERMENE … RUNDE 8 punkt 10.

**Arbeidet dette utløser:**

1. **Retting til Precision (`7d7c2994`):** de fem bekreftede punktene fjernes som «Uavklart» i
   `ui_kits/katalog.js`; AG-20 merkes «Bare head coach». Ferdig når oversikt.html ikke har dem som uavklart. **Gjort 28.09** (runde 32 og 32b; Wedge Gate også i WANG 20f og Team Norway 1e–1f, med 9 slag etter arket).
2. **Tilgang i koden:** `src/app/admin/agencyos/okonomi/page.tsx:18` slipper i dag inn `ADMIN` og
   `COACH`. Begrens til head coach-rollen, også i Mer-menyen. Ferdig når en assistant coach sendes
   bort fra siden og ikke ser menypunktet, låst med test.
3. **Wedge Gate i koden:** `src/lib/portal-tester/tn-catalog.ts` har Wedge Gate som `points` med
   poengfelt og sperre. Bytt til treff/bom per forsøk og fjern sperren. Ferdig når
   `tn-scoring.test.ts` låser at resultatet er antall treff.
4. **Standardplanene** skrives for alle kategorier A–K (faglig innhold fra Anders), jf. RUNDE 8 punkt 8.

## SLETTEDIALOG KAN VÆRE RUST, ØKONOMI FØLGER AK GOLFS TJENESTER, RAPPORTBYGGEREN FJERNES (Anders 28.09.2026, bindende)

Svar på spørsmålene etter runde 28–30 i Precision Athletics og Team Norway 1c.

- **En dialog er en egen flate.** Slett, trekk tilbake og avslutt i en dialog kan være rust selv
  når bjella er rust. «Høyst én rust» gjelder innholdsflaten. Anders: «JA».
- **Økonomi (AG-20) fordeler budsjett og regnskap på AK Golfs tjenester:** Coaching privat ·
  Grupper · GFGK-avtalen · Gruppetimer · Andre tjenester fra AK Golf. Resultat per virksomhet i
  månedsavslutningen (`.claude/rules/admin-tripletex.md`) er uendret.
- **Rapportbyggeren (AG-A07) fjernes.** Anders: «Fjern den».
- **Nivå i Team Norways utviklingssjekk:** i Norge er man junior til og med det året man fyller
  19. Spilleren får Junior-spørsmålene ut det året. Der internasjonal klasse vises, står Amatør.

**Overstyrer:** «Regelen «høyst én rust» får ikke unntak» under §Åpne punkter etter runde 19–26,
og designets plassering av AG-A07 under Spiller 360 og Grupper.

**Arbeidet dette utløser:**

1. **Retting til Precision (`7d7c2994`):** readme regel 2 (dialog er egen flate), AG-20 med de
   fem tjenestene, AG-A07 merket «Utgår 28.09» og ute av navigasjonen. Ferdig når oversikt.html
   ikke har disse som uavklart.
2. **Retting til Team Norway (`bc3e41fc`):** en spiller som fyller 19 i år står som Junior (41
   spørsmål), med Amatør som internasjonal klasse. Ferdig når demospilleren på 19 viser det.
3. **Kode når Økonomi porteres:** `/admin/reports` sender i dag til
   `/admin/agencyos/okonomi#rapporter` (`src/app/admin/reports/page.tsx`). Rapportdelen tas ut og
   adressen sender til Økonomi. Ferdig når ingen meny eller lenke viser rapportbyggeren.

## Åpne punkter etter runde 19–26 og Team Norways poengskala (Anders 28.09.2026, bindende)

Anders svarte selv på tre punkter og sa «ok» til Claudes anbefaling på resten.

- **«Neste turnering»** på I dag er neste offisielle golfturnering. Interne konkurranser
  (KjippeConk o.l.) er økter i agenda og plan, ikke turneringer.
- **Fasilitetsspørsmålene gjelder alle spillere** (oppstart og Meg), med dekning av de 19
  treningsområdene.
- **AG-12 er sammendraget etter live-økta:** utkast til coach, godkjent går det til spilleren.
- **«Svar» på innbokssak uten utkast** åpner et tomt skrivefelt og «Lag utkast» (Jarvis). Coach sender.
- **Konkurransespilleren** anbefales etter turneringsnivået fra oppstarten, ikke etter kategori.
  Spiller som ikke spiller turneringer får Klubbspilleren anbefalt. Spilleren velger selv.
- **PlayerHQ-innboksen bak bjella (PH-21) heter «Innboks».**
- **Break-tabellen** flyttes til Plan › Øvelsesbank, under putting.
- **Bjelletallet er grafitt**, rust bare når innboksen har en sak som haster (Risiko, eller
  spillerspørsmål ubesvart over 24 timer). En dialog er egen flate og kan ha rust (§SLETTEDIALOG).
- **Referanseverdi for testnivå (AG-15)** vises som «—» og «Referanse ikke satt» til A–K-nivåtallene
  er vedtatt (§Åpent).
- **Ingen egen Stats-side for coach under Mer.** Stats bor i Spiller 360 og Grupper.
- **Team Norways poengskala** kommer fra scorekort-arket på Drive («Team Norway Tester
  Treningsprotokoll Spiller.xlsx», fanen Referens). 8-ball: avstand til mål under 0,1 m = 4 ·
  0,1–0,99 = 3 · 1–1,99 = 2 · 2–2,99 = 1 · 3 m+ = 0. Putt (9 hull lengde, restavstand i fot):
  senket (0–0,1) = 6 · til 1 = 3 · til 2 = 1 · til 4 = 0,5 · over = 0. **Nærspill Gate og VISA
  Express:** arket har ingen skala; poeng føres for hånd per slag og appen summerer.

**Arbeidet dette utløser:**

1. **Retting til Precision (`7d7c2994`)** sendes med runde 28: alle punktene over fjernes som
   «Uavklart» i `ui_kits/katalog.js` og tegnes slik. Ferdig når oversikt.html viser 0 av dem.
2. **TN-poeng i koden:** `src/lib/portal-tester/tn-catalog.ts` sperrer Nærspill Gate og VISA
   Express («Poengskala og treffkriterier må bekreftes») og 9 hull lengde («poeng ved senket
   putt … må bekreftes»). Fjern sperren for disse: Gate-testene summerer førte poeng, 9 hull
   lengde bruker skalaen over. Ferdig når `tn-scoring.test.ts` låser begge, og testen
   «ukjente gate-regler produserer ikke falsk standardscore» er skrevet om.
3. **Wedge Gate teller treff** (§ØKONOMI BARE FOR HEAD COACH, 28.09). **Uavklart:** Måleenheten for målavstand i 9 hull lengde er ikke avgjort av arket.

## ÉN IUP OG ETT TESTBATTERI FOR AK GOLF, WANG OG TEAM NORWAY, OG SPILLEREN DELER SELV (Anders 28.09.2026, bindende)

Grillingen runde 9: Anders bekreftet alle seks områder og mulighetskartets anbefaling («Send dette
til de riktige Claude Design-prosjektene»). Kjernen: «Spiller står ansvarlig for å gjøre sin
individuelle IUP og dele deretter med Wang og Team Norway coach.» Fasit for detaljene er «Slik vil
du ha det» per område i `docs/beslutningsgrunnlag/grillingen-runde9-wang-tn-2026-09-28.md`;
mulighetene står i `docs/beslutningsgrunnlag/mulighetskart-wang-tn-2026-09-28.md`.

- **Én IUP** med Team Norways IUP-ark som mal. Spilleren eier den; AK Golf kan bruke dataene
  anonymisert (står i vilkårene). **Ingen IUP-fane i PlayerHQ** — delene ligger i Plan, Stats,
  Målsetning og Meg. Trenerne får fanen «IUP» i Spiller 360, WANG og Team Norway, i arkets
  rekkefølge, hentet fra PlayerHQ.
- **Fireukerssjekk** i I dag (prosessmål, målsetninger og alle utviklingssjekkens 41 spørsmål på
  spillerens nivå: Ung, Junior, Amatør eller Profesjonell) erstatter WANGs halvårsevaluering.
  **Bare for spillere i en WANG-gruppe (Ung eller Toppidrett) eller Team Norway-gruppe** (Anders
  28.09: «Alle andre brukere skal ikke ha disse spørsmålssjekkene»). Sesongevaluering uka før uke 43.
  **Nivå Ung** = spilleren går i 8., 9. eller 10. klasse dette skoleåret (skoleåret 2026/27: født
  2011–2013), med arkets 34 Ung-spørsmål; eldre spillere bruker Junior (41) og videre.
- **Ett testbatteri** for alle tre, med alle NGF-testene fra 6-årsløpet og fysisk etter
  6-årsløpet (benkpress, markløft trapbar, lengdehopp, rotasjonskast, Club Speed). Spiller og
  trener fører («Egenført» · «Kontrollert»). Nivå er AK A–K; TN-spillere ser i tillegg
  landslagsnivå per klasse. Fysisk test hver sjette uke i grunnperioden.
- **Deling:** spilleren sender delingslenke fra Meg til trenerens e-post, bare @wang.no og
  @golfforbundet.no; forelder godkjenner under 16. Innsyn er alt, også helse og meldinger, og
  samtykkesiden sier det rett ut. Trekkes tilgangen, forsvinner treneren med en gang. Spilleren
  betaler PlayerHQ selv. WANG-elevers testresultater deles automatisk med Team Norway, med navn
  (opptaksavtalen).
  Delingslenken gjelder i sju dager (Anders 28.09).
- **Ranking i IUP:** WAGR og NGFs juniorranking (Anders 28.09).
- **Poengskala** for gate-testene, VISA Express, Putt Speed og 8-ball hentes fra Team Norways
  scorekort-ark, som Anders sender. Til da vises «—»; ingen skala lages på antakelse.
- **WANG og Team Norway foreslår, spilleren bestemmer** (plan, IUP, vurdering, samtale).
  AK-coachen endrer direkte; spilleren kan angre.
- **Bare trenerskjermer** i WANG- og TN-designet; spilleren ser det samme som i PlayerHQ. Alle
  TN-trenerskjermene blir og gjøres komplette, og TN får en kartleggingsskjerm for WANG-skolenes
  testdata. Kompetansemål fra Udir bare på WANG-skjermene. Kategori A–K erstatter WANGs E–A+.

**Overstyrer:** WANGs halvårsevaluering og kategori E–A+ i `6cfa623c`, TN-tegningens fysiske
protokoller (3000 m, knebøy, CMJ, medisinball) og spillerrolle i `bc3e41fc`, og at WANG- og
TN-trenere får tilgang gjennom gruppemedlemskap.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Personvern først (haster):** WANG- og TN-tilgang må kreve delingssamtykke.
   `hentWangCoachGruppeId`/`hentWangElevGruppeId` (`src/app/team-wang/_data/wang-tilgang.ts`) og
   `hentTnSpillerTilgang` (`src/lib/domain/tn-arbeidsflate.ts`) sjekker i dag bare gruppe og
   rolle, mens `DelingsSamtykke` er et eget system. Ferdig når en trener uten samtykke ikke ser
   spilleren, og det låses med test (mulighetskart WC1–WC3).
2. **Bestillinger sendt 28.09:** WANG runde 20 (`6cfa623c`), Team Norway (`bc3e41fc`) og Precision
   runde 31 (`7d7c2994`). Ferdig når alle tre har levert og Anders har sett skjermene (port 7).
3. **Delingslenke med domenesjekk** (@wang.no, @golfforbundet.no) og forelders godkjenning under
   16. I dag finnes bare plassholdertekst (`src/components/team-norway/tn-tilgang-handlinger.tsx`).
4. **Samtykkeoversikt** for sportssjef og TN: koble `beregnDekningsgrad`
   (`src/lib/domain/deling/dekningsgrad.ts`, 0 kallere) til en skjerm.
5. **Fireukerssjekk og utviklingssjekk** i PlayerHQ, med visning for trener. Utviklingssjekk finnes
   ikke i koden. Datamodell additivt via `db execute` (gotchas §Database), først når skjermene er
   godkjent.
6. **WANG-demoøkter** blandes med ekte data uten merking (`src/app/team-wang/_data/live-sesong.ts`).
   Ferdig når demo er merket eller fjernet.
7. **Venter:** invitasjon til PlayerHQ fra WANG/TN, landslagsnivå per klasse (tallene må komme fra
   Team Norway) og kjønn i TN-ranglisten — til delingen virker.

## SKJERMENE I PLAYERHQ OG AGENCYOS ETTER GRILLINGEN RUNDE 8 (Anders 28.09.2026, bindende)

Anders gikk gjennom alle elleve områder og bekreftet hvert sammendrag. Anders: «Ting som nå evt
er låst kan endres.» Fasit for detaljene er «Slik vil du ha det» per område i
`docs/beslutningsgrunnlag/grillingen-runde8-skjermer-2026-09-28.md`; valgene i mulighetskartet
står i `docs/beslutningsgrunnlag/mulighetskart-playerhq-agencyos-2026-09-28.md`. Her står bare
reglene.

**Motoren (planforslag)**
- Ved lansering finnes ingen AI-planbygger. Spilleren velger én av fem standardplaner (Weekend
  Warrior, Klubbspilleren, Junior-aspirant, Konkurransespilleren, Practice like the pros),
  tilpasset kategori A–K, og kan alltid bygge økter selv i Workbench.
- Alder begrenser aldri plan eller mengde.
- Oppstart: alder, HCP, snittscore, turneringsnivå, SG i år og forrige sesong, fasiliteter.
  Teknikktesten (bygger på Inspill Basic) anbefales, er ikke påkrevd, og viser største svakhet
  uten å sette nivå.
- Justeringsforslag kommer bare når: SG viser gap til neste nivå (Broadie per HCP, merket
  estimat) · tre turneringsrunder på rad er minst tre slag over snittet av de ti siste tellende ·
  gjennomført tid er under 70 % av plan to uker på rad · over 130 % to uker på rad (lettere uke).
  Aldri etter én runde eller én turnering. Forslag er forslag, ikke sperrer (§Treningsfag).
- Spilleren godkjenner AI-forslag selv; «Send til coach» på forslag fjernes. Coach kan endre
  planen uten spillerens godkjenning, men spilleren kan angre. Spiller uten coach: Anders ser
  ikke planen og kan ikke skrives til.

**PlayerHQ**
- Fanene heter **I dag · Plan · Stats · Meg**.
- **I dag:** pop-up bare for melding fra coach eller endring i dagens plan. Dagens økter øverst
  med «Start». Bjella åpner én innboks med forslag, meldinger og varsler.
- **Plan** er én flate: se-modus (År · Måned · Uke · Dag) og «Rediger» som åpner komplett
  Workbench. Fysisk trening og turneringer ligger i samme plan; egne kalender-, fysisk- og
  turneringssider utgår (gamle adresser sender videre). Coach varsles når spilleren endrer en
  turnering eller en økt coachen la inn.
- **Google-kalender begge veier.** Coach ser bare opptatt tid, aldri tittel. Apple senere.
- **Stats** har fire deler: Snittscore · Strokes Gained · Trening · Tester. Standard
  sammenligning er neste kategori (Broadie, merket estimat); spilleren kan slå på PGA Tour, coach
  ser alltid begge. Nok data: under 4 runder ingen konklusjon, 4–7 «foreløpig», tee og innspill
  sikre fra 12, nærspill og putting fra 24.
- **Ytelsesbilde** (søvn, mat, energi) krever samtykke i onboarding. Banekart, GPS og
  vitnegodkjenning av tester kommer senere.
- **Meg:** «Mål» heter **Målsetning** og ligger i Workbench (start, slutt, resultat- eller
  prosessmål, fremdrift fra ekte data). Fasilitetsskjema med dekning av de 19 treningsområdene.
  Nytt onboardingsteg «Finn deg i turneringsresultatene». Talent «Min plan», roadmap,
  ukesdigest (blir melding) og «Utenfor banen» utgår.
- **Spilleren får ingen sammenligning av snittscoren mot andre, verken anonymiserte snitt eller
  navngitte spillere** (Anders 28.09 etter runde 22: «fjern sammenligning for nå»). Sammenligning
  med andre spillere og talentradaren er bare for coach (§Data uendret). Sammenligning mot neste
  kategori (Broadie, ESTIMAT) og PGA Tour i Stats består.
- **Tiger 5-reglene** «Bogey fra innenfor 130 m» og «Bom på enkel opp-og-ned» er bekreftet (28.09).
- **Live-økt:** økt- og drillklokke, fire tellere per drill (Uten ball · Lav hastighet ·
  Automatikk · Slag) mot plan, neste drill åpnes automatisk. Fysisk økt: spilleren fører vekt,
  reps og serier. Etter økta (Anders 28.09): fysisk økt får «Hvor tungt» 1–10 (opplevd belastning);
  golføkt får belastning 1–10 og fokus 1–10 (hvor konsentrert spilleren var).
- **Runderegistrering:** per slag påkrevd avstand, underlag og kølle; putt påkrevd lengde i fot,
  break, fart og miss. SG, brutto score og Tiger 5 vises rett etter runden.
  Bom på putt: Venstre · Høyre · På linja (Anders 28.09).
- **Hurtigknappen gjelder også PlayerHQ:** Spør Caddie · Ny økt · Registrer runde · Start økt.

**AgencyOS**
- Menyen: Cockpit · Innboks · Stall · Kalender · Workbench · Mer. Cockpit er startskjerm, med
  dagens kalender 05–22. Hurtigknappen får også «Ny booking».
- **Oppgaver kommer bare fra Notion** (Tasks og Prosjekter); oppgavelista i appen utgår.
- **Live coachingøkt** med opptak, teknisk plan og sammendrag. Opptak krever samtykke fra
  onboarding og spilleren ser «Opptak pågår». Sammendraget er utkast til coach; godkjent går det
  til spilleren. Navn tas ut før tekst sendes til AI.
- **Én innboks** for all kommunikasjon og alle godkjenninger: begge e-postkontoene
  (post@akgolf.no, akgolfgroup@gmail.com), spillermeldinger, forslag, varsler, leads og
  oppfølgingssaker. Kø, godkjenninger og oppfølgingskøen slås inn; kolonnene Risiko · Følg med ·
  Sjekk · Løst blir filter. Spillerspørsmål ubesvart etter 24 timer haster. Jarvis-chatten er
  egen side.
- **«Følger ikke planen»** i Cockpit viser de to siste ukene, med lenke til hele planen (Anders 28.09).
- **Stall i tre bånd:** I dag · Trener nå · Hele stallen. Coach kan sende melding under økta.
  Raden viser når planen og avtalen utløper.
- **Spiller 360** har IUP-samtale for alle spillere og fanene Plan · Stats · Teknisk plan ·
  Tester · Samtaler · Talent (bare coach).
- **Kalender:** alle coachers bookinger samlet, filter på coach. Head coach ser alt, assistant
  coach egne økter og gruppeøkter. Flytting av økt varsler spillerne automatisk, med angre i 10
  sekunder. Forslag til nye gruppeøkter med inntektsanslag kommer i Innboks; coach godkjenner.
- **Workbench:** gruppeplanen er grunnmuren og arves av medlemmene; tilpasning merkes «Egen».
  «Gjenta» ved slipp. **Pyramiden velges først og styrer kategoriseringen og øvelsesbanken.**
  Coach kan lage egne øvelser.
- **Mer** har fem punkter: Booking · Grupper · Tester · Økonomi · Oppsett. Økonomi leses fra
  budsjett, Tripletex-eksport og Stripe, aldri anslått. Turneringspåmeldinger bekreftes ikke.

**Mulighetskartet:** A1–A8, A10–A12 og B1–B8 tegnes inn. A9 (skadevarsel på køllehastighet)
er valgt bort.

**Overstyrer:** fanenavnet «Analyse» (§Produkt og tilgang), «Pyramiden er veiledende»
(§Treningsfag), «Ikke avklart: om den også gjelder PlayerHQ» (§Hurtigknappen), og de fire
hurtighandlingene i AgencyOS (nå fem med «Ny booking»).

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Bestillinger runde 19–30 til Precision Athletics (`7d7c2994`)**, én per område, lagret i
   `~/ak-brain/claude-code/prompter/precision-runde19-bestilling.txt` og videre. Ferdig når alle
   er sendt og statusraden i grillingsfila er oppdatert.
2. **Port 7:** Anders ser de nye tegningene i 390 og desktop. Ingen porting til kode før det.
3. **Personvern før annen kode (haster).** Gjort 28.09: ukeforslaget, vinn-tilbake,
   live-økt-chatten og avskriften av coachingopptak sender ikke lenger spillernavn til Anthropic,
   låst med tester. Slett konto finnes allerede: Meg › Personvern › «Slett kontoen min» sender en
   forespørsel som coach eller admin godkjenner (`opprettGdprForesporsel`); `deleteUserAccount`
   er en eldre, ubrukt vei. **Gjenstår:** fritekst brukeren selv skriver (chatmeldinger i
   coach-AI og portal-chat, øktnotater, coachnotater, AI-minne) sendes uvasket, og Caddies
   navnedetektor (`src/lib/caddie/privacy.ts`) brukes bare i Caddie-chatten. Anders' egne verktøy
   (Meg-agenten, innboksutkast, Kommando) sender navn fra e-post, kalender og Stripe; det er
   Anders' egne data, men bør vurderes.
4. **Riktighet i planforslaget:** hardkodede fasilitetsflagg (`src/lib/ai-plan/context.ts`,
   `hasBunker: false`, `hasNetAndMat: false`) og signalnavn som ikke matcher
   (`plan-builder/index.ts`, `SG_AREA`). Ferdig når fasilitetsskjemaet styrer flaggene og
   spillerens svakhet kommer med i forslaget.
5. **ACWR i stallen** er hardkodet. Vis «—» til tallet regnes ut.
6. **Runde-agentene** starter ikke etter `logRoundManual` eller turneringsrunder (mulighet A1).
7. **Fanenavnet i koden:** «Analyse» → «Stats» i `src/components/v2/shell.tsx:86` når Stats
   porteres. Adressen `/portal/analysere` beholdes eller sender videre.
8. **AI-planbyggeren skjules** for spillere ved lansering; de fem standardplanene må skrives
   (faglig innhold fra Anders, per kategori A–K).
9. **Datamodell** for målsetning med start, slutt og type, samtykke til opptak og Ytelsesbilde i
   onboarding, «Egen»-merke på arvede gruppeøkter og gjentakelse — additivt via `db execute`
   (gotchas §Database), først når skjermene er godkjent.
10. **Uavklart:** bildet Anders nevnte for tellerne i live-økt kommer senere. Alle fem planene gjelder
    alle kategorier A–K (§ØKONOMI BARE FOR HEAD COACH, 28.09).

## PERIODENE HETER GRUNNPERIODE, SPESIALPERIODE, TURNERINGSPERIODE, EVALUERING, FERIE OG RESTITUSJON (Anders 28.09.2026, bindende)

Svar på at språkmasteren sa «Spesialperiode» mens Masterbrain og teksten AI-agentene får, sa
«Spesialiseringsperiode». Anders ga lista: Grunnperiode, Spesialperiode, Turneringsperiode,
Evaluering, Ferie, Restitusjon.

- **Synlige navn:** Grunnperiode · Spesialperiode · Turneringsperiode · Evaluering · Ferie ·
  Restitusjon. «Spesialisering», «Spesialiseringsperiode» og «Evalueringsperiode» brukes ikke.
- **Kodenavnene endres ikke:** `GRUNN`, `SPESIAL`, `TURNERING`, `EVALUERING`, `FERIE`.
- **Restitusjon er ny periodetype** (Anders 28.09: ja til ny verdi i databasen). Rent tillegg:
  `RESTITUSJON` i `PeriodeType` og `LPhase`. Ingen rader endres.
- **Testuke, Treningssamling og Heldagssamling beholdes** (Anders 28.09). De er hendelser i
  årsplanen, ikke treningsperioder.
- **Lista gjelder også WANG.** Den offentlige GFGK Junior-teksten venter, fordi den er publisert.

**Overstyrer:** navnene «Spesialiseringsperiode» og «Evalueringsperiode» i koden, og raden
«Evalueringsperiode» i `docs/treningsplanlegging.md` kapittel 6.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Navnene i PlayerHQ og AgencyOS.** Gjort 28.09 i samme PR som beslutningen: tolv filer med
   periodenavn, teksten AI-agentene får (`src/lib/masterbrain/hent-kunnskap.ts`) og
   `docs/treningsplanlegging.md` kapittel 6.
2. **Restitusjon i databasen og koden.** Gjort 28.09.2026: Anders kjørte
   `scripts/add-restitusjon-periode-2026-09-28.ts` selv, og `RESTITUSJON` finnes i `PeriodeType`
   og `LPhase` (bekreftet med lesespørring). Skjema, navn, farge og ikon er lagt inn i koden.
   Antall økter per uke låses ikke (Anders 28.09): spiller og coach setter det selv, og
   plan-motoren har ikke standardtall for Restitusjon. Gjenstår: Anders ser skjermen (port 7).
3. **Masterbrain-kilden** (`akgolfsoftware/masterbrain`). Gjort 28.09 (masterbrain#13):
   «Spesialperiode» i `REDIGER-HER.md` og `canon-methodology.json`. Kodenavnet SPESIALISERING
   der oversettes fortsatt av appen.
4. **WANG.** Gjort 28.09: «Spesialperiode» i WANG-årsplanen og IUP-siden
   (`src/app/team-wang/`). Også rettet i Team Norway-månedsplanen, plan-motoren og hjelpetekstene.
5. **GFGK Junior venter.** Den offentlige teksten (`src/app/gfgk-junior/_data/`) sier
   «Spesialisering» og er publisert. Endres når Anders sier fra.

## POSISJONSNAVN FØLGER ORDMASTEREN, OG TEKNISK PLAN SPERRER INGENTING (Anders 27.09.2026, bindende)

Avklart etter to designrunder i Claude Design «AK Golf Precision Athletics» (`7d7c2994`), der
funksjoner fra prototypen «AK Golf Training Motor» (`4917465a`) ble tegnet inn. Prototypen er
idékilde, ikke visuell fasit: den bruker det gamle designsystemet `87aa23fb`.

- **Posisjonsnavn: ordmasteren gjelder.** Anders: «Ordlisten gjelder.» P1.0 Adresse / Oppstilling ·
  P2.0 Kølle parallell i baksving · P3.0 Venstre arm parallell i baksving · P4.0 Toppen av
  baksvingen · P5.0 Venstre arm parallell i nedsving · P6.0 Kølle parallell i nedsving · P7.0
  Treffpunktet · P8.0 Kølle parallell i gjennomføring · P9.0 Høyre arm parallell i oppfølging ·
  P10.0 Fullføring og balanse. Står i `docs/treningsplanlegging.md` §14.4 (kilde fra 29.09,
  §APPENS ORDBOK VINNER OVER PRECISIONS ORDMASTER).
- **Kvalitetssjekken vises bare.** Anders: «Bare vises.» Den er aldri krav for å gå videre til
  neste læringssteg. Rep-mål og treffprotokoll viser også bare status (§Treningsfag).
- **AK-formelen når en oppgave har flere læringssteg og miljøer:** formelen viser steget spilleren
  er på og hovedmiljøet. Rep-mål per steg og per miljø lagres hver for seg.
- **Demospilleren i koden heter Magnus Aasheim** (#980), samme navn som i designet.

**Overstyrer:** navnene i `src/components/teknisk-plan/constants.ts` fra 22.09.2026. De var hentet
fra `wiki/concepts/morad-posisjonssystem.md` i ak-second-brain, som har venstre arm på P9.0.
Kildene i samme kunnskapsbase (`wiki/sources/2026-05-11-morad-kb-terminology.md`) har høyre arm.
For posisjonsnavn avgjør dette også spørsmålet om to ordlister i §PRECISION ATHLETICS.

**Gjort i samme PR:** navnene er rettet i `constants.ts`, `src/lib/taxonomy.ts`,
`src/lib/domain/workbench/labels.ts` og de to utviklingsplan-visningene, med tester. Teksten «MORAD-arbeid» er fjernet fra `/admin/plan`.
Lagrede posisjonsnavn i basen leses ikke: `medFasitNavn` henter navnet fra koden.

**Arbeidet dette utløser** — detaljene står i
[porteringsplanen §9](../../docs/planer/portering-skjermer-2026-09-27.md):

1. **Portering av sju skjermtyper:** AG-10 (utvidet), AG-TP-01 Oppgaveskjema, AG-TP-02 Før og nå,
   PH-TP-01 Teknisk plan (spiller), AG-15 med testdetalj, PH-A07 og kilde på øktkort i AG-11.
   Ferdig per skjerm etter oppskriften i porteringsplanen §5, og Anders har sett den (port 7).
2. **Sju tillegg i datamodellen.** Hvert krever Anders' ja før det legges i basen (additivt via
   `db execute`, gotchas §Database): to daterte bilder per oppgave, logg for kvalitetssjekk,
   coachens svar på en registrering, publiseringstidspunkt på planen, testforhold på
   testresultatet, coachens valg per test og opphav på øvelse i økt.
3. **Navn som står igjen:** `PeriodeplanPyramideView.tsx` (demoskjerm under `/portal/toppidrett`,
   som skal videresendes) og `ak-kategorisystem.ts` (hovednavn og underposisjoner, ikke i bruk
   utenfor egen test). Rettes når filene porteres eller fjernes. Nøkkelordene i `src/lib/voice/whisper-transcribe.ts` er talegjenkjenning og
   beholdes.
4. **ak-second-brain:** P9.0 i `wiki/concepts/morad-posisjonssystem.md` rettes til høyre arm i en
   egen økt i den kunnskapsbasen.

## WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER, OG MENYEN FÅR SEKS HOVEDPUNKTER (Anders 27.09.2026, bindende)

Anders: «WANG Toppidrett-skjermene som er delt via AK Golf, så skal det være Sportssjef og Trener
skjermer, spiller har egne skjermer ved bruk av AK Golf – Player HQ.» Og om menyen: den skal ikke
«drukne i muligheter».

- **`/team-wang` har to roller: Sportssjef og Trener.** Elev, Foresatt, Åpen, Kontaktlærer, Rektor,
  Toppidrettssjef og Helsepersonell er ikke roller i `/team-wang`. Eleven bruker PlayerHQ (`/portal`).
- **Menyen har seks hovedpunkter med faner inni**, ikke 43 menypunkter. Trener: I dag · Trening ·
  Tester · Konkurranse · Meldinger · Elever. Sportssjef får i tillegg Administrasjon (trenere og
  roller, samtykke, timeplanføring, opptak). Dagens skjermer blir faner under et hovedpunkt.
- **Trening får en oversikt (WANG-42):** planlagt og gjennomført tid siste fire uker, etterlevelse
  (tid mot plan, §KARTLEGGINGSØKT FJERNES), oppmøte på morgentrening, per område og per elev.
- **Ut av WANG-menyen:** Hjem/fellesside (WANG-28, lever videre som egen åpen side, punkt 2), Foresattflaten (WANG-36), Skolefanen (WANG-25),
  Alle idretter (WANG-40), Helse og belastning (WANG-35). Tegningene beholdes.

**Overstyrer:** rollelinjen i §WANG: FEM ANSATTROLLER (26.09) for `/team-wang`, og rollelinjen i
`designsystem/wang/TILGANGSMATRISE.md`. Svarer på punkt 3 der: Rektor og Toppidrettssjef finnes
ikke i `/team-wang`, og Admins oppgaver (D2, D4, D11) ligger hos Sportssjef. Kontaktlærer-spørsmålet
fra runde 17 faller bort.

**Arbeidet dette utløser:**

1. **Design, runde 17–18 i `6cfa623c`:** ny meny, WANG-42 og bare to roller i alle filer (runde 17
   ferdig 27.09, runde 18 sendt 27.09). Ferdig når Designs måling er 0 avvik i 390/1280 og Anders
   har sett skjermene i «WANG Golf Gjennomgang» (port 7).
2. **Fellessiden `/team-wang` (`src/app/team-wang/page.tsx`) beholdes uendret og separat**
   (Anders 27.09: «den siden skal fortsatt holdes separat, den har ingenting med samarbeidssidene
   for WANG Fredrikstad å gjøre ennå»). Den er åpen uten innlogging for elever og foreldre og er
   ikke en del av trener- og sportssjefflaten. Ikke flytt, lås eller slå den sammen med menyen.
3. **Tilgang i koden:** `hentWangElevGruppeId` (`src/app/team-wang/_data/wang-tilgang.ts`) gir i dag
   eleven tilgang til egen IUP under `/team-wang`. Når elevens IUP finnes i PlayerHQ, skal
   `/team-wang` bare slippe inn trener og sportssjef. Ferdig når en elev som åpner
   `/team-wang/coach/iup/[elevId]` sendes til PlayerHQ, med test som låser det.
4. **Skjermene for elev og forelder** (WANG-28, 36, 25, og elevens side av WANG-42, WG-02, WANG-18)
   hører til PlayerHQ og tegnes i Precision Athletics (`7d7c2994`) når de trengs, ikke i WANG-systemet.

## ÉN SPILLERPROFIL (AG-08), OG PGA-SAMMENLIGNINGEN BRUKER BARE EKTE DATA GOLF-TALL (Anders 27.09.2026, bindende)

Svar på de to siste uavklarte punktene i Claude Design «AK Golf Precision Athletics» (`7d7c2994`).

- **Én spillerprofil: AG-08 Spiller 360.** Kortet i AG-03 Oppfølgingskø lenker dit. PS-01 finnes
  ikke i skjermlista og strykes. Overstyrer spørsmålet om PS-01 i §AG-03b punkt 3.
- **ST-05 PGA-sammenligning:** ekte PGA-navn fra Data Golf i appen (offentlige proffspillere).
  «Egne tall» bruker bare Data Golfs ekte fordeling, aldri en formel vi har laget selv. Mangler
  tallet, vises «—».

Krever ingen kodeendring — bekrefter dagens tilstand. `src/lib/datagolf/player-tool-data.ts`
bruker allerede ekte Data Golf-data og egne registrerte runder. Formelen fantes bare i designet
og rettes i runde 18.

## BOOKING BEKREFTES AUTOMATISK, OG BOOKINGE-POSTENE FÅR DESIGN (Anders 27.09.2026, bindende)

**Offentlig booking bekreftes automatisk når tiden er ledig og betalingen er gjennomført.**
Kunden skal ikke vente på coachen. Ingen «Venter på bekreftelse fra coach» for offentlig
booking eller flexkunder. Svar på spørsmålet etter runde 11 i Claude Design «AK Golf Precision
Athletics» (`7d7c2994`), der BK-flyten var tegnet med ventestatus.

Koden gjør dette allerede: Stripe-webhooken setter bookingen fra `PENDING` til bekreftet og
sender bekreftelsen (`src/lib/stripe/handle-event.ts`, `bookingBleBekreftet`). Ventestatusen
fantes bare i designet.

**Alle bookinge-postene skal designes, og bekreftelsen er første sted for mersalg.** Anders:
«Allerede her kan vi gjøre et mersalg på å starte i Player HQ.» Noen booker i appen (AK Golf
Academy), andre er flexkunder som booker én time på nett uten konto og trenger alt på e-post.

- **Bekreftelse:** tid, sted, tjeneste, pris og avbestillingsfrist, legg i kalender. Flexkunde
  (gjest) får lenke til å opprette PlayerHQ-konto. Appbruker får lenke til bookingen i appen.
- **Endret time:** gammel og ny tid tydelig.
- **Takk etter coachingtime** til kunde uten PlayerHQ-konto: takk for timen og treningen, og
  tilbud om å fortsette i PlayerHQ. Jarvis forbereder, et menneske sender (§Produkt og tilgang).
- Påminnelse og avbestilling sendes også i dag (`sendBookingReminder`,
  `sendBookingCancellation`) og tegnes i samme runde, så alle bookinge-postene er like.

**Overstyrer:** AG-03b punkt 4 om bookingbekreftelse i AgencyOS (AG-06) gjelder ikke offentlig
booking med betaling. Coach kan fortsatt avlyse.

**Arbeidet dette utløser:**

1. **Design, runde 16 i `7d7c2994`:** BK-03 og PH-23 bekreftet uten ventestatus og med
   PlayerHQ-tilbud til gjest. E-postene EP-01 bekreftelse (gjest og appbruker), EP-02 endret
   time, EP-03 påminnelse, EP-04 avbestilling, EP-05 takk etter coachingtime, EP-06 oppfølging.
   Ferdig når alle er i `audit.html` med null avvik og Anders har sett dem (port 7).
2. **Ny e-postmal i koden:** `tilHtml` i `src/lib/email/booking-emails.ts` bruker gamle
   hardkodede farger. Bytt til malen fra runde 16. Ferdig når alle fire bookinge-postene bruker den.
3. **Kontolenke i bekreftelsen til gjest** (`guestEmail` satt, `userId` null). Ferdig når
   lenken fører til registrering med e-posten ferdig utfylt.
4. **Takk-e-post som utkast til coachen:** bygg på `src/lib/agents/lead-oppfolging.ts`, som i
   dag bare gir coachen kopierbar tekst. Ferdig når en gjennomført gjestebooking gir et ferdig
   e-postutkast i AgencyOS-køen, som coachen sender med ett trykk (rust «Send»).

5. **Tidligere bookinger hentes inn på kontoen** når en flexkunde registrerer seg med samme
   e-post (Anders 27.09). Finnes ikke i koden i dag. Ferdig når gjestebookinger med samme
   `guestEmail` får `userId` ved registrering og vises i PlayerHQ. Kvitteringen lenker i dag til
   `/auth/signup?epost=…` med e-posten i adressen
   (`src/app/(marketing)/booking/kvittering/[bookingId]/page.tsx`); bytt til en løsning uten
   e-post i lenken.
6. **Tidspunkt for e-postene etter coachingtime** (Anders 27.09): takk (EP-05) klar som utkast
   hos coachen innen 24 timer etter timen. Én oppfølging (EP-06) etter 14 dager, bare hvis kunden
   verken har booket ny time eller kjøpt PlayerHQ. Deretter ingenting mer.

Bookinger fra appen bekreftes også automatisk (Anders 27.09): de lagres som `PENDING` til
betalingen er gjennomført (`src/app/portal/booking/actions.ts`), deretter bekreftet.

## WANG: FEM ANSATTROLLER, OG SKOLENE DELER ÉN KOORDINERINGSSIDE (Anders 26.09.2026, bindende)

Svar på spørsmålene etter runde 14 i Claude Design «WANG Golf UI prototype» (`6cfa623c`).

- **Rollene i `/team-wang` er Sportssjef og Trener** — se §WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF
  OG TRENER (27.09), som erstatter rollelinjen herfra. **Assist Coach og Admin brukes ikke i WANG.**
  «Assist Coach» (§AK-stigen, 22.09) gjelder fortsatt AK Golf utenfor `/team-wang`.
- **Skolene deler én felles side** (D3 / WANG-33). Der ser hver WANG-skole hvem som har
  stjernemerket hvilken spiller, og hvem ved hvilken skole som har kommunisert med eleven eller de
  foresatte, og når. Innholdet i kommunikasjonen, vurderingstall, notater og skolekarakterer blir
  hos skolen som eier dem (uendret fra `designsystem/wang/TILGANGSMATRISE.md`).

**Overstyrer:** `Admin`-rollen i `designsystem/wang/TILGANGSMATRISE.md`, Mia Holts Assist Coach-rolle
i prototypens batch 7, og «personvern mellom skoler er ikke avklart» i
`designsystem/wang/APNE-BESLUTNINGER.md` §6.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Prototypen, runde 15** (`6cfa623c`): ferdig 27.09 (Assist Coach og Admin fjernet, WANG-33 er
   felles side). Anders har ikke sett skjermen ennå (port 7).
2. **Tilgangsmatrisen** (`designsystem/wang/TILGANGSMATRISE.md`): rollelinjen, D2, D4 og D11 er
   rettet 27.09 til Sportssjef og Trener.
3. **Avklart 27.09:** Admins oppgaver ligger hos Sportssjef; Rektor og Toppidrettssjef finnes ikke
   i `/team-wang` (§WANG I AK GOLF HQ ER BARE FOR SPORTSSJEF OG TRENER).
4. **Datamodell før D3 kan bygges:** stjernemarkering per skole og en kontaktlogg per kandidat
   (skole, person, tidspunkt, mottaker elev/foresatt) — additivt via `db execute`, se gotchas
   §Database. Kontaktloggen lagrer aldri meldingsinnhold.

## KARTLEGGINGSØKT FJERNES, OG ETTERLEVELSE ER TID MOT PLAN (Anders 26.09.2026, bindende)

Svar på de åpne punktene etter runde 6 og 7 i Precision Athletics (AG-06, AG-09, PH-23).

- **Kartleggingsøkt finnes ikke lenger.** Anders: «Fjern alt som heter kartleggingsøkt.» Ingen
  tjeneste, knapp, pris, klipp eller tekst skal hete kartleggingsøkt — verken i appen, på
  markedssidene eller i Claude Design-prosjektet (`7d7c2994`). Det avgjør også spørsmålet om
  kartleggingsøkt trekker klipp: den finnes ikke.
- **Etterlevelse er gjennomført tid mot planlagt tid, siste fire uker.** Anders: «Ja jeg ønsker
  gjennomført til planlagt.» Minutter på gjennomførte økter delt på minutter på planlagte økter
  med passert sluttid. Fremtidige økter teller ikke. Mangler forfalte økter, vises «—».

**Overstyrer:** «Kartleggingsøkt er ikke gratis: 90 min til vanlig timepris» under §Merke og
tekst (flyttet til arkivet). Og telle-regelen i `src/lib/domain/etterlevelse.ts` («4/5 ·
publiserte økter med passert slutt», uten tidsvindu) som etterlevelsestall.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Claude Design (`7d7c2994`):** fjern kartleggingsøkt fra alle skjermer, data og
   `oversikt.html` (bl.a. AG-06 tjenester og pris, PH-23 klipp). Merk etterlevelse som avklart
   i AG-09. Ferdig når et søk etter «kartlegging» i prosjektet gir 0 treff i skjermfilene.
2. **Markedssidene:** fjern «kartleggingsøkt»/«kartleggings-økt» fra `MarkedNav.tsx` (hoved-
   knappen «Book kartleggingsøkt», to steder), `MarkedCasesV2.tsx`, `MarkedSuksessV2.tsx`,
   `MarkedKontaktV2.tsx`, `MarkedBookingV2.tsx` og metadata i `src/app/(marketing)/suksess/page.tsx`.
   Hovedknappen heter «Book time» (Anders 26.09). **Gjort 26.09** i samme PR som beslutningen.
3. **Tjenestelista i basen:** sjekk om `ServiceType` (og Stripe-produktene) har en
   kartleggingsøkt. Finnes den: deaktiver, ikke slett (eksisterende bookinger peker på den).
   Ferdig når den ikke kan bookes.
4. **Én etterlevelse i koden:** i dag finnes to mål — `etterlevelse()` teller økter uten
   tidsvindu (ukesrapport, digest, forelder), og `adherencePct()` i
   `src/lib/workbench/compliance.ts` vekter minutter (Workbench, plan-motoren). Samle dem på
   minutt-regelen med fire ukers vindu, og vis samme tall på alle flater. Ferdig når
   ukesrapport, digest, forelder, stall og Workbench viser samme prosent for samme spiller, med
   tester som låser fire-ukersvinduet.

Treff på «kartlegging» i betydningen *kartlegge noe* (arkitektur-kartlegging, datakartlegging,
kolonnekartlegging, GFGK-sesongens testperiode, øvelsestags) er ikke tjenesten og røres ikke.

## Klippekort, rust i avslutt-dialoger og «Følg med» (Anders 26.09.2026, bindende)

Svar på de åpne punktene etter runde 5 i Precision Athletics (PH-23, PH-25, AG-03).

- **Klippekortet gjelder coaching-pakkene Performance og Performance Pro**, ikke bare privattime
  60 min. Anders: «Klippekort er for subscription Performance og Pro». Klippene er pakkens
  credits (Performance 2, Performance Pro 4 per måned, BUSINESS-RULES §Coaching-pakker); én
  coachet økt trekker ett klipp. Pakkene vises aldri som app-nivå.
- **Farger følger gjeldende designsystem.** Anders: «Vil ha farger til gjeldende design system».
  Bekreftknappen i avslutt-dialogene (Avbestill i PH-23, Avslutt abonnement i PH-25) er rust,
  fordi rust er signalet for det som avslutter eller ødelegger (§PRECISION ATHLETICS).
- **Oppfølgingskøens kolonne heter «Følg med»**, ikke «Watch». Avgjør det første av fire
  navnevalg i AG-03b-blokken under.

Krever ingen kodeendring — bekrefter dagens tilstand: `src/app/admin/queue/status.ts` har
allerede etiketten «Følg med», og booking trekker klipp fra `Subscription.creditsRemaining`
(`src/lib/portal-booking/bekreft-data.ts`). I Claude Design-prosjektet (`7d7c2994`) rettes
antakelsen om klippekort i PH-23 og merket «Uavklart» på «Følg med» fjernes.

## FARGE BETYR AKSE, OG INGENTING ANNET (Anders 26.09.2026, bindende)

Workbench blandet svart-hvitt (årskurve, periodefelt) med sterke farger (ukefordeling, øktkort).
Anders: «den ser både svart hvit og med farger». Regelen gjelder hele Precision Athletics.

- Farge betyr alltid aksen FYS · TEK · SLAG · SPILL · TURN.
- Årskurven viser aksefordelingen per uke i aksefargene, dempet. Periodene er et tynt tekstbånd,
  ikke fylte blokker.
- Øktkort er nøytrale med aksefarget stripe på venstre kant, ikke fargede flater.
- Fremdriftsstreker er grafitt. Grønt og rødt er bare statussignal.

**Arbeidet dette utløser:** rettes i Claude Design-prosjektet `7d7c2994` i runde 5 (alle tegnede
skjermer + guidelines). I koden gjelder regelen når Workbench-skjermene porteres (AG-11, PH-11).

## «Venter på coach» er et statusord, og en test teller bare med alle slag (Anders 26.09.2026, bindende)

Avklart etter runde 3 i Precision Athletics (PH-11, PH-12, PH-15).

- **«Venter på coach»** er statusen på en plan spilleren har sendt til coach for godkjenning.
  Det står ved siden av «Venter på spiller» i `docs/ordbok.md` §5, rad Plan.
- **En test teller bare når alle slag er registrert.** Avsluttes testen før, blir det ikke noe
  resultat. PH-15 er tegnet med 10 slag. Koden gjør dette allerede for Team Norway-scorekortet:
  `saveTnTest` lagrer et `TestResult` bare når `tnValidate` godtar alle forsøk, ellers blir
  økten `ABORTED` uten resultat.

Krever ingen kodeendring — bekrefter dagens tilstand. Ordboka er rettet i samme PR. I Claude
Design-prosjektet (`7d7c2994`) fjernes merket «Uavklart — venter på Anders» på begge punktene.

## PIPELINES ER ENESTE KILDE FOR TURNERINGSRESULTATER (Anders 26.09.2026, bindende)

**`ak-golf-pipelines` er det eneste som henter inn turneringsresultater. HQ sin egen
GolfBox-skraper slutter å skrive resultater.** Anders: «Så vi ikke gjør dobbelt med arbeid i
fremtiden.» Bakgrunn: analysen 26.09 fant at to systemer skriver samme GolfBox-turnering til
`public.tournaments` med ulik nøkkel (HQ: GolfBox-RID; pipelines: internt løpenummer), og at
nivåtallene (mot feltet, slag bak vinner, justert for vanskelighet) bare finnes i pipelines'
rålager. Kilde: `docs/beslutningsgrunnlag/turneringsdata-spillerprofiler-analyse-2026-09-26.md`.

- **Resultater** (deltakelser, runder, plassering, score, nivåtall) skrives til `public.*` kun
  av `pipelines/golfbox/writers/public_db.py`, hver mandag. HQ-jobben
  `.github/workflows/scrape-golfbox.yml` (hver time 06–20 UTC, `syncGolfBoxLeaderboards`)
  skal ikke lenger skrive resultater.
- **Kalender og frister** (kommende turneringer, `entryCloses`, `registrationUrl`) beholdes i
  HQ: Vercel-cron `turneringer-ngf` (`syncGolfBoxSchedules`) og `norge-mandag-sync`. De henter
  ikke resultater i dag heller.
- **WANG-profiler vises i HQ `/team-wang`**, mot samme base. `wang-toppidrett` er et annet
  prosjekt med egen base og holdes utenfor. Anders: «WANG Toppidrett-appen er et komplett annet
  prosjekt som ikke har med WANG-skjermen i AK Golf å gjøre.»
- **«AK12»** i bestillingen 26.09 utgår — Anders vet ikke selv hva det var. Skjermlisten er
  PlayerHQ, AgencyOS, Team Norway, WANG og rangskjermene.

**Overstyrer:** «to eiere»-oppsettet fra 15.09 i `docs/turnering-datakilder.md` (HQ-cron eide rå
GolfBox-resultater) og «Kodet»-raden for GolfBox i `docs/PLATTFORM-KART.md`. Begge rettet 26.09.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her.
Rekkefølge og kontroller står i analysen §7; her er det beslutningen krever:

1. **Mål dublettene før byttet.** Spørringen i analysen §4b mot `public.tournaments`. Ferdig
   når tallet er kjent og eksisterende dubletter er slått sammen via `mergedIntoId`
   (`/admin/tournaments/dubletter`).
2. **Pipelines bruker samme nøkkel som HQ:** GolfBox-RID som `sourceId`, funn på tvers av
   opphav, i `pipelines/golfbox/writers/public_db.py` (i dag: `dashboard.tournaments.id`).
   Ferdig når spørringen i §4b gir 0 rader etter en mandagskjøring.
3. **Identitet og beregning inn i mandagsjobben:** `pipelines.identity` → `pipelines.sg` →
   `refresh_views` i `junior-tours-sync.yml`. Ferdig når `dashboard.modell_kjoring` får ny rad
   hver mandag.
4. **Pipelines dekker det HQ-skraperen dekket:** `SOURCE_TO_ORIGIN` utvides med ren «golfbox»
   (NM, senior, midam, klubb), `regions_tour` og `manual`; `tour` settes per kilde, ikke fast
   `junior-no`. Ferdig når hvert `sourceOrigin` HQ skrev i dag har en pipelines-kilde.
5. **HQ slutter å skrive resultater:** `scrape-golfbox.yml` settes til `--mode=schedule`
   (eller slås av), `syncGolfBoxLeaderboards` fjernes fra `scripts/scrape-golfbox.ts`, og
   `scripts/backfill-golfbox-results.ts` arkiveres. Skjer først når 1–4 er grønne, ikke før.
   Ferdig når ingen `public_player_entries` får `updatedAt` fra HQ etter byttet.
6. **Vakt:** HQ `sync-vaktbikkje` (mandag 08:00) varsler når pipelines' mandagskjede mangler
   eller er rød. Ferdig når simulert rød kjøring gir varsel.
7. **WANG-profil i `/team-wang`** bygges fra samme datamodul som PlayerHQ og AgencyOS
   (analysen §6 og §7 steg 6 og 10). Ingen kobling mot `wang-toppidrett`.

Uendret: `public.*` er fortsatt det appen leser; Prisma eier kolonnene, og pipelines legger
aldri til kolonner. DataGolf vises bare for coacher (§KODEGJENNOMGANGEN 06.10).

## PRECISION ATHLETICS ER DESIGNSYSTEMET FOR AK GOLF HQ (Anders 26.09.2026, bindende)

**Claude Design-prosjektet «AK Golf Precision Athletics» (`7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`)
er visuell fasit for AK Golf HQ** — PlayerHQ (`/portal`), AgencyOS (`/admin`), forelder, `/auth`,
booking og statistikk. Anders: «det designsystemet er for selve AK Golf HQ, både player og
agency OS». Det erstatter «AK Golf Design System» (`87aa23fb`) og «App design» (`830e7bce`) som
fasit. «App design» finnes ikke lenger i Claude Design (`get_project`: not found, 26.09.2026).
Team Norway og WANG er utenfor; de har egne systemer og egne arbeidsmapper.

- **Rust er signal, ikke handling.** Primærknappen er grafitt `#141413` med hvit tekst. Rust
  `#9B2415` brukes bare på det som haster eller ødelegger (sletting, trekk tilbake), Live-pillen
  og tellere som krever coachens handling — maks én per skjerm. Overstyrer «Rust følger
  handlingen, ikke ordet» (22.09).
- **Lyst tema er standard** i `/portal` og `/admin`. Nattema (`data-theme="night"`) brukes i
  Live-økt og slagregistrering ute; brukeren kan bytte tema selv. Overstyrer «Mørk er standard på
  `/portal` og `/admin`» (21.09).
- Markedssidene venter fortsatt (23.09); de beholder verksted-uttrykket til Anders sier noe annet.
- Ordlister: `docs/ordbok.md` (masteren `docs/treningsplanlegging.md`) vinner over prosjektets
  `guidelines/ordmaster.md` (§APPENS ORDBOK VINNER OVER PRECISIONS ORDMASTER, 29.09).
- Uendret: aldri sidelengs rulling, port 7 (Anders har sett skjermen), Codex bygger i appkoden.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Fullfør designsystemet** i `7d7c2994`: rett knapper/tema etter punktene over, legg til
   manglende komponenter (tabell som blir kortrader, ark, tidslinje, graf-grunnstykker, felt med
   feilmelding, tom/laster/feil). Fjern Toppidrett- og WANG-kitene fra prosjektet. Ferdig når
   `readme.md` og komponentkortene dekker alt skjermene under trenger.
2. **Skjermliste fra appen:** alle `page.tsx` under `/portal`, `/admin`, `/forelder`, `/auth`,
   booking og `/stats` som ikke er videresendinger, gruppert i skjermtyper. Ferdig når hver rute
   peker på én skjermtegning i prosjektet.
3. **Tegn alle skjermene** i mobil 390, iPad 768/1024 og desktop 1280/1440, lys og natt, tom,
   laster og feil. Claude Code styrer prosjektet via Chrome. Ferdig per skjerm når målingen viser
   `scrollWidth === clientWidth` i alle bredder og Anders har sett den (port 7).
4. **Temastandard i koden:** `erMorkFlate()` i `src/lib/v2/tema-default.ts` gjør `/admin` mørk
   uten lagret valg — skal bli lys. Nattema for Live-økt og slagregistrering bygges sammen med
   de skjermene.
5. **38 skjermer fra «App design» må tegnes på nytt.** Blokken «AG-03b» under viser til dem,
   men prosjektet er borte. Funksjonsfunnene i den blokken (datamodell, navnevalg, hull) står
   fortsatt; bare tegningene mangler. Dekkes av punkt 3.

Pekerne er rettet i samme PR: `design-autoritet.md`, `designsystem/README.md`, `ak-hq-design`-skillen.

## FORELDER-SKALLET BRUKER FELLES NAVIGASJON (Anders 23.09.2026, bindende)

`/forelder` skal bruke samme navigasjonsmønster som AgencyOS og PlayerHQ: hamburgermeny
på mobil og topplinje med fire mål og «Mer» på desktop. FO-01 til FO-04 skal bruke ett
delt skall, ikke fire ulike navigasjoner. Dette produktvalget gjelder innen gjeldende
designautoritet «AK Golf Precision Athletics»; eldre «App design»-tegninger er historikk.

**Arbeidet dette utløser:** Samordne FO-01 til FO-04 i gjeldende designprosjekt, bygg
skallet én gang i appen og kontroller mobil, desktop og relevante temaer. Dagens
`src/components/v2/shell.tsx` har fortsatt `BunnNavLenker`/`IkonRailNav` for forelder;
denne dokumentbeslutningen er ikke en ferdig skjermimplementasjon. Anders må se de
oppdaterte skjermene før port 7 kan regnes som bestått.

## AG-03b Oppfølgingskø: «Løst» blir egen status, og designrunden for PlayerHQ/AgencyOS er ferdig (Anders 23.09.2026, bindende)

**Oppfølgingskøens «Løst»-kolonne får en eksplisitt status på saken i basen, satt av coach
med ett trykk — aldri avledet automatisk av at spilleren igjen følger planen.** Kolonnen har
stått tom siden AG-03b ble kartlagt, fordi ingen modell fanger at en sak er løst. Foreslått
til Codex: én additiv tabell `FollowUpCase` (`userId` unik, `status`:
`RISK | WATCH | CHECK | RESOLVED`, `reasonKey`, `setById`, `setAt`, `resolvedAt`,
`resolvedById`), opprettet kirurgisk med `CREATE TABLE IF NOT EXISTS` — se gotchas §Database.
Detaljer og ytterligere fjorten funn (bl.a. at dagens `Signal`-baserte tilnærming glemmer en
løst sak etter sju dager, og ikke vet hvem som satte statusen): `agencyos-handover/AG-03b-manifest.md`.

**Samtidig: designrunden startet 21.09 er nå ferdig for tre av fem områder.** PlayerHQ (18
skjermer), AgencyOS (19 skjermer) og Lag-og-skole-koblingen (LS-03 GFGK Junior) har alle
bevis for de seks første portene i `DEKNINGSREGISTER.md` (Claude Design-prosjektet
«App design», `830e7bce`) — 38 skjermer totalt. Markedsområdet (MK-01–06, ~70 ruter) er
bevisst ikke tegnet ennå (Anders 23.09: «vent med markedssidene») og blokkerer ikke
porting av de tre ferdige områdene.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Port 7 må gjøres først, skjerm for skjerm.** Ingen av de 38 skjermene har Anders' ja
   ennå. Gjennomgangen skjer i Claude Design-prosjektet «App design» (`830e7bce`) — mobil
   390 px og desktop, lys og mørk, tom/laster/feil. Uten dette kan Codex ikke starte porting
   av en gitt skjerm, uansett hvor ferdig designet er.
2. **Fire datamodell-tillegg må inn før tilhørende skjerm kan kobles til ekte data**
   (additive, kirurgisk `db execute`, aldri `migrate`/`db push` — se gotchas §Database):
   - `FollowUpCase`-tabellen over, for AG-03b.
   - `ExerciseDefinition`: nye felt for treningsområde, motorikk, belastning og press (AK-formel
     v2), som i dag ligger på økten, ikke på øvelsen — kreves for AG-11b.
   - GFGK Junior: `hent-gfgk-data.ts` må slå opp på kanonisk gruppe-slug fra `bootstrap.ts`,
     ikke på tekststrengen «GFGK Junior Mini U10» — ellers faller fire offentlige sider
     stille tilbake til designtekst ved en omdøping. Se `gfgk-handover/LS-03-manifest.md`.
   - Caddie-samtale: `getOrCreateActiveConversation()` har null kallere i dag, og eneste
     chat-kaller sender tom `conversationId` — uten dette kan forslagsflyten i AG-14 aldri
     lagre et utkast. Se `agencyos-handover/AG-14-manifest.md`.
3. **Navnevalg som venter på Anders (ett avgjort 26.09) før tekst fryses i kode** — hver er én linje å rette
   når svaret foreligger:
   - ~~«Watch»-kolonnen i AG-03b~~ — avgjort 26.09: «Følg med» (§Klippekort, rust i avslutt-dialoger og «Følg med»).
   - Caddie-navnet i UI: koden sier «Coach AI», «AI-coach» og «AI om {fornavn}» om hverandre
     for samme funksjon (PH-16). Ordboken sier «Caddie».
   - «Merge» (AG-04) vs. «Slå sammen» (AG-10) er samme handling med to navn og to rust-svar.
   - PS-01: avgjort 27.09 — én spillerprofil (AG-08), se §ÉN SPILLERPROFIL.
4. **Fire «ingen kan gjøre X»-hull må bygges sammen med skjermen, ikke bare tegnes rundt**,
   ellers ser skjermen ferdig ut uten å virke:
   - Administrator-Caddie (AG-14): fire API-ruter og seksten verktøy finnes i koden, men
     ingen side har noensinne rendret dem.
   - Øvelsesredigering (AG-11b): ingen kan i dag opprette eller endre en øvelse noe sted i
     appen, verken admin eller coach.
   - Bookingbekreftelse i AgencyOS (AG-06): offentlig booking bekreftes automatisk etter
     betaling — se §BOOKING BEKREFTES AUTOMATISK (27.09). Coach kan fortsatt avlyse.
   - Utfordringer (PH-15): kodesiden er bygget (PR #948), men selve ny-skjermen fra
     tegningen er ikke portert ennå.
5. **Selve portingen:** hver av de 38 skjermene bygges fra sitt manifest
   (`playerhq-handover/`, `agencyos-handover/`, `auth-handover/`, `gfgk-handover/` i
   Claude Design-prosjektet) til ekte Next.js-kode, koblet til de delte skallmodulene som
   allerede er spesifisert (`fo-skall.js`, `ag-mobilmeny.css/.js`, `ag-hurtigknapp.css/.js`).
6. **Etter porting, før lansering:** full `npm run verify`, skjermsammenligning mot valgt
   Claude Design-versjon (`designsystem/README.md`-mønsteret), og Stripe-live/røyktest
   sist, som BUSINESS-RULES krever.

## Utfordringer skal leve (Anders 22.09.2026, bindende)

**Utfordringsfunksjonen beholdes og bygges ferdig.** I dag er den død: `opprettUtfordring`
i `src/app/portal/(legacy)/utfordringer/actions.ts` er ferdig skrevet med revisjonsspor og
automatisk deltakelse for eier, men **har ingen kallere** — `/portal/utfordringer/ny` er en
videresending rett tilbake til lista. Ingen kan opprette en utfordring, og finnes det ingen
utfordringer, er hele flaten tom.

- **Deltakere velges fra venner og gruppa, aldri ved delt lenke.** Du huker av hvem som skal
  få utfordringen, og de får varsel i appen. Kilder: `Friendship` med `status = "ACCEPTED"`,
  og `GroupMember` med `endedAt: null` i gruppene du selv er med i. En coach kan i tillegg
  velge fra stallen sin. **Ingen lenke som åpner en utfordring for hvem som helst** — de
  fleste deltakerne er mindreårige, og en delbar lenke omgår samtykket.
- **Scoren får en retning.** `reberegnRanger` sorterer i dag alltid synkende, og skjemaet sier
  «Høyere er bedre». Det gjør «færrest putter» og «kortest samlet avstand» umulig å rangere
  riktig. `DrillChallenge` trenger et felt som sier om høyest eller lavest vinner, satt når
  utfordringen lages.
- **«Opprett utfordring» bærer rust.** Handlingen forplikter: den lager noe andre blir med i
  og rangert i, på linje med Publiser og Send. Dette er en anvendelse av
  §Rust følger handlingen, ikke ordet — ikke et unntak fra den. **Avslutt utfordring er
  grafitt** i et kort med rustkant, som alle avslutninger.
- **En avsluttet utfordring heter «Avsluttet», ikke «Fullført».** Den er avsluttet av eieren;
  den er ikke nødvendigvis fullført av deg.
- **Utfordringer teller ikke som trening.** De går ikke inn i planen, ikke i analysene og ikke
  til coachen. Registrert score lever bare i utfordringen.

Tegningen er PH-15 i Claude Design-prosjektet «App design» (`830e7bce`), med manifest i
`playerhq-handover/PH-15-manifest.md`. Port 7 gjenstår.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. **Bygg `/portal/utfordringer/ny` som ekte skjerm** og kall `opprettUtfordring`. Fjern
   videresendingen i `src/app/portal/(legacy)/utfordringer/ny/page.tsx`. Ferdig når en spiller
   kan lage en utfordring og lande på detaljen for den, som deltaker.
2. **Legg til deltakervelgeren** i ny-skjermen: venner (`Friendship` ACCEPTED) og medlemmer av
   egne grupper (`GroupMember`, `endedAt: null`), med varsel via `notify()` til hver valgt.
   Coach ser i tillegg stallen sin. Ferdig når ingen kan bli med uten å ha blitt valgt.
3. **Gi scoren en retning** i `DrillChallenge` (additiv kolonne via `db execute`, se
   gotchas §Database), og la `reberegnRanger` sortere etter den. Ferdig når en utfordring der
   lavest vinner får riktig resultatliste.
4. **Legg en inngang fra Meg.** `/portal/utfordringer` har tilbakelenke til `/portal/meg`, men
   ingenting i Meg lenker dit — eneste veier inn er Cmd+K og `/portal/utenfor-banen`.
5. **Rett språket:** «Fullført» → «Avsluttet» i `UtfordringerV2` og `UtfordringDetaljV2`;
   manglende plassering vises som tankestrek, ikke bindestrek; fjern «Del utfordringen og
   inviter andre til å bli med» fra tomteksten, som lover noe som ikke finnes.
6. **Notatfeltet over flere linjer.** Et notat på to setninger kan i dag skrives, men ikke
   leses tilbake — feltet er enlinjes og ruller sitt eget innhold.

Port 7 (Anders har sett skjermen) gjelder som for alle andre skjermer.

## TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK (Anders 22.09.2026, bindende)

**Det skarpe Team Norway-språket eier `/team-norway/*`. Claw er utgående for appen.** Fasit blir et nytt Claude Design-prosjekt «Team Norway App», avledet av «Team Norway Golf Design System» (`3416f258`): Jost display, Lato brødtekst, IBM Plex Mono på tall, hjørner 0 · 2 · 4, ingen skygger, ingen sirkler, kvadratisk avatar, lukket ikonsett på 20.

- **Rød er `#D70232`** — målt fra logofilen. Kommunikasjonssystemets `#d40e3a` gjelder ikke i appen og rettes ved avledningen. Navy `#012B5D` er uendret i begge.
- **Sidemenyen er full navy `#012B5D`**, hvit tekst, lysere navy bak aktiv rad, rød markør. Den bor bare i `TnShell`/`TnRail` — aldri bygget på nytt per side.
- «Team Norway Golf Design System» beholder kommunikasjonsflatene (brev, e-post, plakat, presentasjon, rapport, sosiale). App-UI hører ikke hjemme der; dets egen beslutningslogg forbyr det.
- Claw (`a03bf94a`) og speilet `designsystem/team-norway/` er funksjonsinventar og historikk for appen, ikke visuell fasit. Spør ikke om dette på nytt.

**Overstyrer:** «Team Norway: eget Claw-system» under §Merke og tekst, og `designsystem/team-norway/LES-MEG.md` §Myndighet. Rødverdien er uendret fra 30.08.2026.

**Arbeidet dette utløser** — ingen arbeidsliste finnes etter b700ce008, derfor står den her:

1. Nytt prosjekt «Team Norway App»: tokens avledet av `3416f258` med rød rettet, skall TN-01 med navy sidemeny, mobil 390 px.
2. De fire internskjermene (Venter på meg, Analyse, Lisens og økonomi, Organisasjonsoppsett) tegnes om mot skallet — tokens i stedet for ~150 hardkodede farger, responsiv i stedet for fast 1440 px, menypunkter som matcher `tnHovedmeny`.
3. `src/styles/team-norway-tokens.css`: skrifter, hjørner, skygger, farger. Jost og Lato lastes i `src/app/team-norway/layout.tsx` i stedet for Schibsted Grotesk.
4. `src/components/team-norway/core.tsx`: de 18 `radius.full`-formene blir firkantede, avataren kvadratisk, `TnRail` navy.
5. Fem skjermer bygger skallet for hånd og spriker — `/team-norway`, `[groupId]`, `[groupId]/dokumenter`, `spiller/[spillerId]`, `tilgang`: to organisasjonsnavn, fire undertitler, tre innholdsbredder. Alle over på `TnShell`.
6. Maskinell måling av alle 21 TN-ruter i 390 px og desktop, tom/laster/feil: ingen sidelengs rulling, ingen node utenfor rammen, treffmål minst 44 px, kontrast godkjent på navy.
7. Rett `designsystem/team-norway/LES-MEG.md` og `ak-merkevare`-skillen — begge peker i dag på Claw for TN.

Ferdig skjerm krever fortsatt at Anders har sett den (port 7).

## AK-stigen har fire trinn, og Knøtt får egen gruppe (Anders 22.09.2026, bindende)

**Knøtt (11–12 år) er ikke et trinn i AK-stigen.** Stigen er Mini → Basis → Utvikling →
Elite. Aldersgruppen skal likevel ha sin egen gruppe, og den gruppen hører hjemme **ved siden
av stigen** — sammen med WANG Toppidrett — ikke som et hull i den.

**Rollen ASSISTANT heter «Assist Coach» på skjerm.** Tidligere sto det «Hjelpecoach» og
«Hjelpetrener» om hverandre i koden. Coach heter «Coach», spiller heter «Spiller».

Gjennomført i denne beslutningen: `AK_STIGEN_TRINN` har fire trinn, `vedSidenAv` erstatter
`overStigen` (liste, ikke ett felt), og rolleordene i `GruppeDetaljV2` er rettet. Tegningen er
AG-03c i Claude Design-prosjektet «App design».

**Gjenstår:** gruppen «GFGK Junior Knøtt U12» finnes ikke i basen ennå. Den må opprettes —
enten manuelt, eller ved at den legges inn i `GFGK_BOOTSTRAP_GRUPPER` med egen kanonisk slug.
Uavklart: om den offentlige juniorsiden (`/junior`), som i dag beskriver **fem** trinn med
Knøtt som det andre, skal skrives om. Den endrer publisert markedstekst og venter på Anders.

## Design (Anders 21.09.2026, bindende)

**Designsystemet er «AK Golf Precision Athletics» — se §PRECISION ATHLETICS øverst.** Train-lock og Paper er utgående: ingen visuell fasit, bare funksjonsinventar. Spør aldri på nytt om dette. Kilde og ID-er: [design-autoritet.md](../../docs/design-system/design-autoritet.md).
- Kode med Train-lock-/Paper-/`v2`-navn beholdes til funksjonene er flyttet. Navnene gir ingen autoritet.
- Claude Code/Design eier designet; Codex bygger det i appkoden.
- Konkret skjermvariant innen systemet kan Anders fortsatt velge før bygging.
- Ferdig skjerm = funksjonen virker og Anders har sett den (mobil 390 px + desktop, lys og mørk, tom/laster/feil).
- Paper er fjernet fra plattformen; vakten `scripts/check-ingen-paper.mjs` kjører i `npm run verify`.
- Ingen `className="dark"`; tema styres bare av `data-v2-tema` på `<html>`. Lys er standard overalt; natt i Live-økt og slagregistrering (`src/lib/v2/tema-default.ts`, se §PRECISION ATHLETICS punkt 4).
- Ikke bruk `accent` som tekstfarge på `primary`; bruk `-foreground`-paret.

## Aldri sidelengs rulling (Anders 22.09.2026, bindende)

Ingen skjerm, flate, rad, liste eller egen struktur skal kreve at brukeren drar skjermen
sidelengs. Gjelder alle områder (`/portal`, `/admin`, `/forelder`, marked, `/auth`, WANG,
Team Norway), alle bredder og alle tilstander — også piller, faner, tabeller, kortrader og
verktøyrader vi bygger selv.

- Løsningen er ombrekking (`flex-wrap`), stabling, kortere kolonner eller oppdeling.
  Aldri `overflow-x:auto` på en rad brukeren må se hele.
- Flex- og grid-beholdere med tekst som ikke brytes MÅ ha `minWidth: 0` (se gotchas §UI).
- Kontrolleres maskinelt per skjerm i begge bredder og hver tilstand: ingen node utenfor
  rammen, og `scrollWidth === clientWidth`. Bevis føres i skjermens manifest, port 4.
- Trengs sidelengs rulling likevel, er det et avvik som legges fram for Anders før det
  bygges — ikke et valg som tas underveis.

## Hurtigknappen gjelder alle AgencyOS-skjermer (Anders 22.09.2026, bindende)

Den flyttbare svarte hurtigknappen skal finnes på **alle skjermer i AgencyOS**, ikke bare Hjem.
Fem hurtighandlinger: ny økt i Workbench · ny melding til spiller · registrer runde · spør
Jarvis · ny booking (§SKJERMENE … RUNDE 8).

- Den bor i **én delt modul**, ikke som kopiert kode per skjerm: i designprosjektet
  `agencyos-handover/ag-hurtigknapp.css` og `.js`. Bygges den i appen, skal den være én
  komponent brukt av skallet — ikke én per side.
- Faste regler: 56 × 56 px grafitt, radius 2 · kan dras hvor som helst og klemmes 8 px fra
  hver kant · drag åpner ikke menyen (under fem piksler er et trykk) · menyen snur når den
  ellers ville gått utenfor flaten.
- **Gjelder også PlayerHQ** (28.09): Spør Caddie · Ny økt · Registrer runde · Start økt.
  Se §SKJERMENE I PLAYERHQ OG AGENCYOS ETTER GRILLINGEN RUNDE 8.

Byggeoppgave når AgencyOS-skallet bygges: knappen hører til skallet (`src/components/v2/shell.tsx`),
ikke til den enkelte siden. Ferdig når den står på hver `/admin`-side, husker posisjonen sin,
og ikke kan dras ut av syne.

## Treningsfag

- Ingen treningsregel er låst: ingen invarianter, tak, minimum eller plan-validering mot metodikk (18.08). Vokabularet består som frie merkelapper. Gjeninnfør aldri en regel uten ny beslutning.
- AK-formel v2: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`. Motorikk UTEN_BALL/LAV_HAST/AUTO, press ALENE/OBSERVERT/KONKURRANSE/TURNERING. L-faser, CS-koder (CS0, CS20–CS100), M0–M5 og PR1–PR5 er utgått. v3 er skrotet.
- Hastighet i læringssteg er 25, 50, 75 og 100 prosent av Club Speed (Lav hastighet 25/50/75 %, Automatikk 100 %, Uten ball ingen). Bekreftet av Anders 21.09.2026. Ikke den utgåtte CS-skalaen.
- Én master for språk og treningsplanlegging: `docs/treningsplanlegging.md` (21.09.2026). `docs/ordbok.md` er bare en peker; `docs/ordbok.json` genereres.
- Øvelsen planlegges i åtte trinn (pyramide, område, sted, måleutstyr, gjennomføring, press, mengde, mål). Pyramiden velges først og styrer kategoriseringen og øvelsesbanken (28.09, §SKJERMENE … RUNDE 8); området styrer feltene. Valgene lagres som `detaljer` i `akFormel`, uten databaseendring.
- TrackMan-parametere på engelsk med stor forbokstav (Attack Angle, Club Path, Smash Factor).
- Valgtreet fra årsplan til øvelse (åtte trinn) eies av `docs/treningsplanlegging-og-sprak-gjennomgang.md` (22.09). Puttingavstand i fot, meter kan vises i parentes. Måleutstyr er en fast liste (TrackMan og annen radar). Teknisk fokus per område er eget felt på oppgaven i teknisk plan.
- Tester planlegges i Workbench; resultat synkes til talentprofilen.

## Workbench

- Spillerens `WorkbenchV2` er den ene motoren; coach får samme komponent med stall-velger og gruppe-modus. `WorkbenchUke` bygges ikke videre.
- `WorkbenchSession` er den ene økt-tabellen (OW-3).
- Ny uke starter aldri tom: «kopier forrige uke» er standard.
- Flytting av økt skal være ekte dra-og-slipp, også på mobil (17.09).

## Produkt og tilgang

- Nivåer FULL / TALENT / INGEN, avgjort av `resolveTilgang` i `src/lib/feature-flags.ts`. FULL: 299 kr/mnd eller 2 690 kr/år for alle spillere (ingen 199 kr juniorpris, Anders 24.09.2026). ELITE finnes ikke. Detaljer: BUSINESS-RULES §Abonnement.
- PlayerHQ har fire faner: I dag · Plan · Stats · Meg (28.09). Coach-menyen følger prototypen fra 02.09 (Cockpit, Innboks, Stall, Kalender, Workbench + Mer).
- Én inngang per funksjon: én adresse, gamle adresser blir redirects, ingenting fjernes.
- Coachflaten kalles AgencyOS (`/admin`), aldri CoachHQ. Demo: spiller Øyvind Rohjan, coach Anders Kristiansen.
- Jarvis forbereder alt og sender ingenting. Alt som forlater huset eller endrer noe for et menneske krever Anders' ja.
- Forelderen er kjøperen for juniorer; forelder kan booke for barnet.
- Stripe-live og ekte kjøp verifiseres sist, rett før røyktesten.

## Merke og tekst

- MORAD og Mac O'Grady nevnes aldri offentlig. P-posisjoner som internt fagspråk består.
- Ingen vitnesbyrd, sitater eller stjerner. Vis målingen.
- Priser leses fra `ServiceType.priceOre`, aldri hardkodet. Kartleggingsøkt er fjernet (§KARTLEGGINGSØKT FJERNES).
- Mulligan knyttes ikke direkte til AK Golf-merket; AK Golf promoterer bare.
- Ingen «Vi svarer innen én virkedag» før Jarvis er i drift.
- Team Norway: eget system, rød `#D70232`, navy `#012B5D`, kun for `/team-norway/*` — visuell fasit er §TEAM NORWAY-APPEN BYTTER DESIGNSPRÅK, ikke Claw. Team Norway får kun interne skjermer gratis mot at de promoterer appen (Anders 24.09.2026). Analyse og DataGolf for TN er delte plattformflater.
- WANG har eget system (`src/styles/wang-tokens.css`). Junior Academy og GFGK Junior er ulike ting.

## Data (brytes disse, blir tallene feil)

- Kun brutto. Netto filtreres med hviteliste av faktiske nettokoder, aldri «ender på N».
- Til-par fra `public_player_entries.scoreToPar`; par utledes aldri fra baneregisteret.
- `position` er aldri persentil. Aldersstige bare fra 16 år.
- Barnevern: spillere født 2008 eller senere uten samtykke vises aldri åpent; manglende fødselsår vises ikke.
- Alt appen sier om en spiller skal ha måling, dato og kilde (TruthLayer); estimat merkes.
- Kohortsammenligning er kun coachens verktøy. «Powered by Data Golf» der Data Golf-tall vises; de vises bare for coacher (§KODEGJENNOMGANGEN 06.10).
- Økonomitall leses fra Tripletex-eksport, aldri estimert.

## Åpent (ikke besluttet, ikke bygg som fasit)

- FYS-formel og A–K-nivåtall. Dosefelter på `WorkbenchDrill` før OW-3 fase 3.
- WANG-/TN-felles kjerne (menystruktur foreslått av Codex 21.09, ikke vedtatt).
