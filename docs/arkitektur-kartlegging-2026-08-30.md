# Arkitektur-kartlegging — PlayerHQ og AgencyOS

**Dato:** 30. august 2026
**Kjørt av:** sju kartleggere og fire analytikere som leste koden fil for fil, pluss denne rapporten som samler funnene.
**Metode:** hver påstand er sporet til en konkret fil og linje. Der ingen fikk sett etter, står det «ukjent» — ikke en gjetning.

**Hva den dekker:** alle sider i spillerappen (PlayerHQ, `/portal`), coach-appen (AgencyOS, `/admin`), foreldreportalen (`/forelder`) og de eksterne flatene (`/innsyn`, `/meg`, `/team-wang`, `/team-gfgk`, `/gfgk-junior`, `/onboard`, `/inviter`, `/intern`). Til sammen 352 sider. I tillegg er datalaget under skjermene gjennomgått: hvilke tabeller hver skjerm leser fra, og hvor to skjermer henter samme tall fra ulike steder.

**Hva den IKKE dekker:** markedssidene (akgolf.no og landingssidene) er holdt utenfor med vilje. Selve designet — om en skjerm ser riktig ut mot fasiten — er heller ikke vurdert; her er det kun målt om skjermen bruker riktig fargesett (Train-lock) eller det gamle (Paper).

---

## Kort fortalt

- 352 sider finnes. 107 av dem er bare veivisere til andre sider. 245 er ekte skjermer.
- Spillerappen er den store: 125 ekte skjermer, mot 92 i coach-appen.
- 36 ferdige skjermer har ingen vei inn. De virker, men ingen kan finne dem uten å skrive adressen manuelt.
- «Analyse» i spillerappen har 17 innganger. «Meg» har 34 undersider. «Kø» i coach-appen har 8.
- Én treningsøkt lagres i tre forskjellige tabeller samtidig. En forelder kan se tre ulike svar på «hvor mange økter trente barnet denne uka» inne i samme app.
- Strokes Gained regnes over fem forskjellige tidsvinduer avhengig av hvilken skjerm som spør. Ingen av dem er feil — de er bare ikke samme tall.
- Estimerte SG-tall lagres uten merke i samme kolonner som målte tall, og blandes stille inn i snittene. Det bryter kravet om at estimat skal merkes.
- To sikkerhetsfunn, begge etterkontrollert i koden 30.08: en innlogget spiller kan åpne en hvilken som helst annen spillers profil med runder og HCP (bekreftet), og WANG-elevvurderingene mangler rollesperre slik at enhver innlogget bruker kan lese dem (agentens påstand om at de lå åpent *uten* innlogging var feil — det ble lukket 17.08).
- Designporten er nesten ferdig: 220 av 245 ekte skjermer (90 %) er på Train-lock. 25 gjenstår, de fleste på de eksterne flatene.
- Ryddingen har allerede kommet langt uten at det er synlig: 107 gamle adresser er alt gjort om til veivisere.

---

## Tilstanden i tall

| App | Sider totalt | Veivisere (redirects) | Ekte skjermer | Innganger i menyen | Skjermer uten vei inn | På Train-lock |
|---|---|---|---|---|---|---|
| AgencyOS (`/admin`) | 154 | 62 | 92 | 11 | 10 | 88 av 92 |
| PlayerHQ (`/portal`) | 168 | 43 | 125 | 4 (3 på Mac) | 17 | 120 av 125 |
| Forelderportal (`/forelder`) | 11 | 0 | 11 | 4 + 6 i «Mer» | 0 | 11 av 11 |
| Eksterne flater | 19 | 2 | 17 | ingen felles meny | 9 | 1 av 17 |
| **Sum** | **352** | **107** | **245** | — | **36** | **220 (90 %)** |

Merknader til tallene:

- «Innganger i menyen» er antall destinasjoner selve menyen tilbyr, ikke antall skjermer som er nåbare. AgencyOS: 5 punkter i skinnen + 4 rader under Meg + profil + fotlenka til AgenticOS. PlayerHQ: 4 faner i bunnen, men Mac-versjonen viser bare 3 (Meg er filtrert bort og ligger på avataren i stedet).
- «Skjermer uten vei inn» er telt manuelt ved å søke etter lenker til hver adresse i hele koden. De 9 på eksterne flater inkluderer 6 demoer under `/intern/komponenter` og 2 onboarding-veivisere som er duplikater av den som faktisk brukes.
- De 4 skjermene i AgencyOS og 5 i PlayerHQ som ikke er ren Train-lock er «blandet» — de bruker det nye fargesettet i hovedsak, men drar med seg én gammel verdi fra en delt komponent.
- Ekstra funn på siden: AgencyOS har to konkurrerende menylister i koden. Bare den ene tegnes; den andre (7 punkter) sendes fortsatt fra rundt 50 steder og brukes kun til å markere hvilken fane som er aktiv. Og en tredje meny («Mer», 5 rom) er død kode som aldri rendres.

---

## De 21 funksjonene, og hvor mange dører de har

Her er hver funksjon som finnes i produktet, med antall adresser den har i dag, og forslag til den ene som bør overleve. Dette er målt mot beslutning 1 fra runde 6: én inngang per funksjon, ingenting fjernes, gamle adresser blir veivisere.

| Funksjon | Dører i dag | Hvor de ligger nå | Den ene som bør overleve | Hva som blir faner inne i den |
|---|---|---|---|---|
| Analyse (spiller) | 17 | `/portal/analysere` + historikk, hull, trackman, datagolf, turneringer, statistikk, tre SG-hub-varianter, gapping, ukesdigest, break-tabell, putte-lab | `/portal/analysere` | Oversikt · TrackMan · Runder · Hull · DataGolf · Turneringer. SG-hub, gapping og labverktøyene blir paneler. |
| Meg (spiller) | 34 | `/portal/meg` + 10 innstillinger, 7 abonnement, 4 hjelp, 2 helse, 2 sikkerhet, 2 bookinger, resten løse | `/portal/meg` | Profil · Konto og abonnement · Varsler og personvern · Helse og utstyr · Hjelp |
| Oppsett (coach) | 19 | `/admin/settings` + klubb, tjenester, integrasjoner, team, tilgang, API, kalendersynk, periodenavn, sikkerhet, logg, feillogg, GDPR, opptak, e-postmaler, hjelp | `/admin/oppsett` | Klubb · Tjenester og priser · Team og tilgang · Integrasjoner · Personvern og logger |
| Booking | 14 | `/portal/booking` (7), `/portal/meg/bookinger` (2), `/portal/onskeligokt`, `/admin` (4) | `/portal/booking` og `/admin/booking` | Spiller: Kommende · Historikk · Book ny. Coach: Kalender · Tjenester · Tilgjengelighet. |
| Talent | 15 | 5 i PlayerHQ, 8 i AgencyOS, 2 under `/innsyn` | `/innsyn` for eksterne, faner i `/portal/analysere` for spilleren | Nivå · Roadmap · Sammenligning. `/admin/talent/*` utgår som meny (beslutning 9). |
| Coach-kontakt (spiller) | 12 | `/portal/coach` med hub, meldinger, spørsmål, tilbakemelding, videoer, øvelser, planer, SG-hub, AI | `/portal/coach` | Meldinger · Spørsmål · Tilbakemelding · Delt materiell |
| Kalender | 11 | `/admin/kalender` (uke, måned, hendelser), tilgjengelighet, gruppetimeplan, øktdetalj, Google-synk, `/portal/kalender`, opptatt-blokker | `/admin/kalender` og en fane i `/portal/planlegge` | Uke · Måned · Tilgjengelighet. Hendelser blir ark, ikke sider. |
| Turnering | 10 | 6 i AgencyOS, 4 i PlayerHQ | `/admin/turneringer` og en fane i `/portal/analysere` | Coach: Liste · Kart · Dubletter. Spiller: påmelding som handling i samme flate. |
| Tester | 10 | 5 i PlayerHQ, 5 i AgencyOS | `/portal/tester` og `/admin/tester` | Spiller: liste, detalj og gjennomføring som steg. Coach: Resultater · Benchmarks · Tildeling. |
| Gjennomføring av økt | 9 | Gjør-lista, økt-detaljen, workbench-arket, live med tre understeg, tapperen, manuell logg | `/portal/gjennomfore/[id]` | Planlagt → i gang → ferdig som tilstander. Brief, live og oppsummering blir moduser, ikke egne sider. |
| Mål og utvikling | 9 | Mål-hub, måldetalj, ledertavle, utfordringer (2), utenfor banen, utviklingsplan, teknisk plan (2) | Fane i `/portal/planlegge` + én utviklingsplan-adresse | Mål · Utfordringer. «Utenfor banen» blir et filter, ikke en side. |
| Kø (coach) | 8 | Godkjenninger, innboks, varsler, oppfølging, handlingssenter, to AgenticOS-faner, Jarvis-innboksen | `/admin/ko` | Godkjenning · E-post · Varsler · Oppfølging. Oppgaver flyttes UT (beslutning 2). |
| Planlegging / Workbench | 8 | `/portal/planlegge`, `/portal/planlegge/workbench`, `/portal/tren/wb` (2), `/admin/planlegge`, `/admin/workbench/[spiller]`, gruppe-workbench, coach-planer | `/portal/planlegge` og `/admin/workbench` | Coach åpner på spillerlisten med ukestatus (beslutning 4). Gruppe blir en modus, ikke en egen adresse (beslutning 3). |
| Runder | 8 | Live-scorekort, to identiske loggeskjemaer, liste, detalj, hull, slag, deling | `/portal/runde/logg` for registrering + Runder-fane i Analyse | Logg · Live · Historikk |
| Spillerprofil | 7 | Stall-liste, spillerprofil, dagsvisning, gruppeliste, gruppedetalj, to profilvisninger inne i PlayerHQ | `/admin/spillere/[id]` for coach, `/portal/spiller/[id]` for spiller | Coach: Kort · Plan · Analyse · Tester. Spiller: én profil med venne-handlinger som knapper. |
| Jarvis og AI-godkjenning | 7 | AgenticOS med 6 faner + `/admin/godkjenninger` | `/admin/agenticos` for agentene, `/admin/ko` for godkjenning | Agenter · Kjøringer · Skills. All godkjenning ut til Kø — ett sted Anders sier ja (beslutning 6). |
| Drill / øvelser | 6 | `/portal/drills` (2), `/portal/coach/ovelser`, AI-forslag, to gamle adresser | `/portal/drills` | Bibliotek · Mine · AI-forslag som panel |
| Morgenflate (coach) | 4 | Cockpit, daglig brief, AgenticOS-cockpit, Jarvis-innboksen | `/admin` (cockpit) | Kø øverst, dagens plan under, mobil først (beslutning 5 og 7). Brief og Jarvis-tråd blir seksjoner. |
| Oppgaver (coach) | 4 | Handlingssenter, workspace, prosjekter, Notion-kobling | `/admin/oppgaver` | Rutiner · Prosjekter. Skilt fra Kø på tid (beslutning 2). |
| Utstyr | 4 | `/portal/meg/utstyr`, utstyrsbag, gapping, SG-hub utstyr | `/portal/meg/utstyr` | Bag · Lengdetrapp. Gapping vises som panel i Analyse. |
| Fysisk | 2 | `/portal/fysisk`, `/portal/tren/fys-plan` | Fane i `/portal/planlegge` | Plan øverst, logging under |

**Sum:** rundt 222 adresser dekker 21 funksjoner. Noen adresser telles i to funksjoner (for eksempel ligger SG-hub både under Analyse og under Coach-kontakt), så tallet er ikke helt rent — men størrelsesordenen er riktig: **omtrent ti ganger flere adresser enn funksjoner.**

Ett funn skiller seg ut i denne tabellen: **elleve skjermer peker fortsatt på en femte spillerfane som ikke finnes.** PlayerHQ har fire faner, men elleve sider setter seg som «Gjør» — en fane som ble fjernet. På disse sidene lyser ingen fane opp i bunnen. Det er nøyaktig de sidene som ellers hadde vært paneler inne i Plan eller Analyse.

---

## Skjermer ingen kan finne

36 ferdige eller halvferdige skjermer har ingen lenke inn fra noe sted i koden. De nås bare ved å skrive adressen manuelt.

### Bygget og virker — mangler bare en dør

**AgencyOS (10 skjermer)**

| Skjerm | Hva den gjør | Hva den bør bli |
|---|---|---|
| `/admin/gdpr` | Behandler forespørsler om at noen vil ha ut eller slettet dataene sine | Rad under Oppsett → Personvern |
| `/admin/videoer` | Videobibliotek, last opp og se treningsvideo per spiller | Fane på spillerkortet i Stall |
| `/admin/settings/api` | Administrerer API-nøkler | Rad under Oppsett → Integrasjoner |
| `/admin/settings/security` | Sikkerhetsinnstillinger for admin-kontoen | Rad under Oppsett |
| `/admin/team/ekstern` | Gir eksterne lesere (Team Norway, WANG) tilgang til utvalgte spillere | Rad under Oppsett → Team og tilgang |
| `/admin/talent/wagr-import` | Importerer WAGR-rangeringer | Handling inne i talent-flaten under `/innsyn` |
| `/admin/agencyos/ak-stigen` | Viser AK-stigen for juniorene | Fane i Stall |
| `/admin/spillere/[id]/turnering-kobling` | Kobler en spiller mot turneringsdatabasen | Handling på spillerkortet |
| `/admin/kalender/hendelse/ny` | Opprett ny kalenderhendelse | Lenken finnes, men i en komponent ingen side lenger bruker. Flytt knappen inn i den levende kalenderen. |
| `/admin/stats/moderering` | Godkjenner eller avviser innmeldte statistikk-saker | Fane i Kø |

**PlayerHQ (17 skjermer)**

- **Talent (3):** min-plan, roadmap og sammenligning. Veien inn stopper på første skjerm — «Mitt nivå» har ikke én eneste lenke videre. De tre siste er ferdig bygget mot ekte data og er usynlige. Bør bli faner på samme side.
- **SG-hub coach-modus (3):** de tre skjermene lenker bare til hverandre. Ingen utenfor klyngen peker inn. Coachens SG bor allerede i AgencyOS, så disse bør enten kobles fra Stall eller avvikles.
- **Flyt-endepunkter (9):** verst er kvitteringen etter «be om økt» — når spilleren sender inn, sender systemet ham til forespørselssiden igjen i stedet for til kvitteringen. Den 171 linjer lange takkeskjermen vises aldri. Samme mønster for treningsloggen, egen-test-veiviseren, AI-coachen, coach-tilbakemeldingen, statistikk-detaljen, feiringsskjermen, gapping og «utenfor banen».
- **Booking-detaljer (2):** anleggssiden og coach-siden i booking har ingen lenke inn. Løsning: gjør anleggsnavnet og coach-navnet i bookingveiviseren klikkbart.

**Eksterne flater (2)**

- `/onboard/coach` og `/onboard/klubb` er ferdige veivisere for ny coach og ny klubb — men den som faktisk brukes ligger på `/auth/onboarding`. Dette er et duplikat, ikke bare en manglende lenke. Bestem hvilken som gjelder, la den andre bli veiviser.

### Aldri gjort ferdig — bør fjernes, ikke lenkes

- `/portal/meg/innstillinger/okter` — en ærlig «kommer snart»-side uten data bak. Fjern til apparatstøtten faktisk finnes.
- `/intern/komponenter` med 5 underskjermer — demoer med oppdiktede data, bygget fra en mappe som siden er slettet. Koden sier selv «bør fjernes før produksjon». Slett hele treet.
- `/kommando/*` (6 adresser) er allerede tomme veivisere. Kommandosenteret som eget produkt er reelt avviklet; bare adressene står igjen.

### Nås bare utenfra — ikke feil

- `/inviter/forelder/[token]` — foreldre kommer hit via lenke i e-post. Riktig at den ikke ligger i noen meny.
- `/team-gfgk` — B2B-presentasjon som deles manuelt.

---

## Der appen kan vise to ulike svar på samme spørsmål

Dette er den farligste klassen av funn, og grunnen er enkel: **når to skjermer viser forskjellig tall for samme ting, kan ingen av dem være til å stole på — og da blir alle tallene mistenkelige.** En coach som oppdager at Stall sier 60 % etterlevelse mens Etterlevelse-fanen sier 45 %, slutter å bruke begge. Beslutning 7 fra runde 6 (TruthLayer) sier at alt appen påstår om et menneske skal kunne spores til én måling med dato og kilde. Disse elleve funnene er stedene der det ikke holder.

**1. Én økt lagres tre steder samtidig.** «Økt» finnes i tre tabeller: den gamle planen, gjennomførings-tabellen og den nye Workbench-tabellen. To av dem holdes i synk automatisk; den tredje gjør det ikke. Foreldreportalen alene leser alle tre — forsiden fra én, barnelista fra en annen, ukerapporten fra en tredje. **En forelder kan derfor se tre forskjellige svar på «hvor mange økter trente barnet denne uka» inne i samme app.** Dette er den viktigste enkeltfeilen i hele kartleggingen.

**2. Etterlevelse regnes med tre ulike formler.** «Hvor mye av planen ble fulgt» beregnes tre steder: som minutter i planmotoren, som antall økter på Etterlevelse-fanen, og som antall økter med hoppet/ulogget skilt ut i ukesrapporten. Stall-varianten teller i tillegg med økter som ikke har skjedd ennå — så en spiller viser lav prosent mandag morgen selv om hele uka ligger på plan.

**3. SG snittes over fem forskjellige tidsvinduer.** Samme spiller: 10 runder på ett sted, 8 uker på et annet, 30 dager, siste 5 runder, 20 runder. Coachens Innsikt og spillerens Analyse kan vise ulike SG-tall for samme spiller på samme dag, uten at noen av dem er feil.

**4. Stall leser kopien i stedet for originalen.** Regelen sier at SG beregnet fra faktiske runder vinner, og at selvrapporterte tall bare er nødløsning. Stall gjør det motsatt: har spilleren to eller flere selvrapporterte rader, brukes de i stedet for rundene. Samtidig skriver systemet automatisk inn en selvrapportert rad basert på 20 runder — så trendlinja i Stall kan blande et 20-runders snitt med håndtastede enkelttall.

**5. Estimerte SG-tall lagres uten merke.** Registrerer en spiller bare totalscore, dikter appen opp en fordeling over 18 hull og skriver den til samme kolonner som målte tall. Merket «estimert» finnes i databasen, men ingen av skjermene filtrerer på det, og rundedetaljen kaster merket bort før visning. Estimat og måling snittes stille sammen. Dette bryter direkte med TruthLayer-kravet om at estimat skal merkes eksplisitt.

**6. TrackMan-slag leses fra to fysiske kilder med ulike lengdemål.** Noen skjermer leser den ryddede tabellen, andre leser den rå importfila. Spredningsmotoren prøver rå fil først. I tillegg måler gapping «carry» mens kølletrenden måler total lengde — og fallbacket blander de to. Samme økt kan gi ulike kølletall avhengig av hvilken skjerm som viser den.

**7. Turneringsresultat lagres fire steder.** Samme plassering finnes i fire tabeller. Spillerens turneringshistorikk leser den ene, coachens turneringsdetalj leser den andre. **Retter coachen et resultat i AgencyOS, endrer ikke tallet spilleren ser under Analyse.**

**8. «Neste økt» finnes i to versjoner som spør ulike tabeller.** Forsiden bruker den ene, gjennomførings- og oppsummeringsskjermene den andre. En økt som bare finnes i Workbench er usynlig for den siste.

**9. Barnets coach utledes fra bookinger, ikke fra coach-regelen.** Appen har én kanonisk regel for hvem som er spillerens coach. Foreldreportalen bruker den ikke — den gjetter fra neste booking. Foreldre og spiller kan få oppgitt ulik coach.

**10. Kø-tallet og kø-lista teller ulike ting.** Merket over Kø summerer tre kilder; lista bygger saker av seks. Merket kan si sju mens lista viser femten.

**11. Økonomi teller økter uten avgrensning.** Nøkkeltallet «gjennomførte økter» på Økonomi teller alle fullførte økter i hele databasen — ingen coach-avgrensning, ingen periode, og bare den ene av de tre økt-tabellene. Tallet kan ikke sammenlignes med noe annet øktantall i appen.

### To sikkerhetsfunn som må rettes uansett hva som skjer med arkitekturen

> **Etterkontroll 30.08.2026 (Claude, i økt).** Begge funnene under er lest i koden
> på nytt etter at agenten leverte. Det første stemte. Det andre var beskrevet feil og
> er rettet her — se korreksjonen.

- **BEKREFTET — en spiller kan åpne en annen spillers profil.** Adressen
  `/portal/spiller/[spillerId]` viser navn, HCP, hjemmeklubb, ambisjon, siste ti runder
  med full SG-fordeling, aktiv treningsplan og siste fem coaching-økter. Siden kaller
  `requirePortalUser()` uten rolleliste og uten eierskapssjekk; den innloggede brukeren
  brukes kun til å tegne menyen (navn og avatar), aldri til å begrense hva som vises.
  Enhver innlogget bruker som kjenner en spiller-ID ser alt.
  Bevis: `src/app/portal/spiller/[spillerId]/page.tsx:26` (kun innlogging), `:28-40`
  (profil), `:45-60` (runder + SG), `:62-67` (plan), `:69-74` (coaching-økter),
  `:161` (eneste bruk av `user`). Til sammenligning gjør `/portal/venner/[spillerId]`
  det riktig — den går via `hentVennProfil` med et `synligAv`-felt.

- **KORRIGERT — WANG-elevvurderingene ligger IKKE åpent uten innlogging.**
  Agenten leste kodekommentaren i `src/app/team-wang/coach/iup/[elevId]/page.tsx:6-12`
  («MIDLERTIDIG åpnet uten innlogging, Anders 2026-08-15») og rapporterte det som
  gjeldende tilstand. Det hullet ble lukket 17.08.2026 i commit `7d72caaef`
  («fix(wang): steng elevnavn ute igjen», løser #406): `src/proxy.ts:182-190` sperrer nå
  hele `/team-wang/coach/`-prefikset, og fellessiden `/team-wang` er åpen med vilje fordi
  den ikke viser navn.

  **Men det står igjen et reelt, mindre hull:** proxyen sjekker kun at brukeren er
  *innlogget* (`src/proxy.ts:207` — `if (!user)`), ikke hvilken rolle hen har.
  `coach/page.tsx:24` har i tillegg `requirePortalUser({ allow: ["ADMIN", "COACH"] })`,
  men IUP-siden har ingen tilsvarende sjekk — rollesperren der ble fjernet 15.08 og aldri
  satt tilbake. Konsekvens: **enhver innlogget bruker, også en vanlig spiller, kan åpne
  `/team-wang/coach/iup/<elevId>` og lese egenvurdering og trenervurdering for en navngitt
  mindreårig.** ID-en er en tilfeldig streng, så den må være delt eller kjent — men
  forsvar-i-dybden mangler, og kommentaren i `coach/page.tsx:9` sier eksplisitt at de to
  lagene ikke skal fjernes hver for seg.

  **Dette krever Anders' beslutning, ikke bare en kodefiks:** åpningen 15.08 var hans
  eget, bevisste valg («pr nå»). Dagens tilstand oppfyller verken intensjonen (siden er
  ikke lenger delbar uten innlogging) eller personvernkravet (den er åpen for alle
  innloggede). Den er i verste mellomting og bør avgjøres bevisst.

---

## Overlapp mellom de to appene

Noe overlapp er riktig og skal beholdes: samme data, to publikum.

**Riktig overlapp — behold, men del koden:**

- **TrackMan-detaljen** er mønsteret å kopiere. Begge apper bruker samme visning og samme spredningsberegning, så coach og spiller ser identisk analyse av samme økt.
- **Live-økt** skal ha to visninger — coachen ser noe annet enn spilleren under en økt. Men de bruker i dag hver sin datahenter mot delvis ulike tabeller, så «hva skjer nå» kan spisse seg ulikt. Én kilde, to visninger er riktig svar.
- **Booking** er riktig at finnes i tre versjoner (marked, spiller, coach) — men bare to av dem er sunne, se under.

**Dobbeltarbeid — bygget to ganger:**

- **Workbench.** Coachens og spillerens workbench er ikke to visninger av samme motor, men to helt separate systemer med hver sin datamodell. I tillegg har spilleren to workbencher som leser hver sin tabell.
- **Listene.** TrackMan-lista, runde-lista og analyse-huben er bygget hver for seg i de to appene, selv om detaljvisningen deles.
- **Talent-sammenligning** er bygget to ganger fra bunnen — ingen delt kode, ingen delt datahenter.
- **Booking-ledighet.** Marked og spiller går begge gjennom den delte motoren som tar hensyn til når coachen er ledig, hvilke bookinger som finnes og hva Google-kalenderen sier. **Coachens egen veiviser gjør det ikke** — den lar coachen skrive inn klokkeslett fritt. Coachen kan legge en booking i et vindu spilleren aldri ville fått se.
- **Tester.** Spillerens testliste går gjennom den ene tilgangsregelen. Ingen fil i AgencyOS bruker den. Coachens tildelingsskjerm henter alle tester uten filter — **coachen kan tildele en test spilleren ikke ser i appen sin.**

**Feilplassert — coach-jobber som ligger i spillerappen:**

- `/portal/coach/sporsmal` er låst til coach og admin. Det er en ren AgencyOS-funksjon på en PlayerHQ-adresse. Det samme gjelder hele SG-hubens coach-modus.
- Verre: **spillerens spørsmål og meldinger når aldri Kø i AgencyOS.** Kø leser fem kilder, men verken spørsmål eller coach-meldinger. Beslutning 2 sier Kø er alt som krever Anders i dag — da må disse to inn.
- AgencyOS henter i fem tilfeller kode direkte fra PlayerHQ-mappene. Flytter eller rydder man en PlayerHQ-side, brekker AgencyOS uten varsel.

---

## Målbildet — forslag til ny arkitektur

Arkitekturen er ikke låst. Verken AgencyOS-skinnens fem punkter eller PlayerHQs fire faner er fredet. Under er det jeg mener er riktig, med begrunnelse. Alt måles mot de ti låste beslutningene fra runde 6.

### AgencyOS — seks destinasjoner, mobil først

Beslutning 7 sier morgenflaten er en mobilflate. Da må skinnen tåle å være en bunnrad på telefon. Seks punkter er grensen.

| Destinasjon | Adresse | Hva den samler |
|---|---|---|
| **I dag** | `/admin` | Kø øverst, dagens plan under (beslutning 5). Daglig brief og Jarvis-tråden blir seksjoner her, ikke egne sider. |
| **Kø** | `/admin/ko` | Alt som krever Anders i dag: e-post, SMS, forespørsler, tilbakemeldinger, oppfølginger, godkjenninger — pluss spillerspørsmål og coach-meldinger som i dag mangler. Filterpiller, ikke faner. |
| **Stall** | `/admin/stall` | Spillerlista (navn, neste økt, siste aktivitet, én varsel-prikk — beslutning 5), grupper, dagsvisning, AK-stigen. Spillerkortet får videoer, tester, plan og turneringskobling som faner. |
| **Workbench** | `/admin/workbench` | Åpner på spillerlisten med ukestatus per spiller (beslutning 4). Gruppe er en modus inne i planleggingen, ikke et eget sted (beslutning 3). Kalenderen blir en fane her. |
| **Innsikt** | `/admin/innsikt` | Slagfordeling per spiller og for kullet, tester, TrackMan, runder, etterlevelse, turneringer. Svarer på «hvor taper hen slag». |
| **Meg** | `/admin/meg` | Oppsett (19 sider til 5 faner), Økonomi, Oppgaver, agent-administrasjonen, profil. |

**Det som forsvinner som egen destinasjon: Jarvis.** Beslutning 6 sier Jarvis forbereder alt og sender ingenting — alt som forlater huset krever Anders' ja. Da er Jarvis' resultat nettopp Kø. Å ha både «Jarvis» og «Kø» i menyen ber Anders om å se på samme liste to steder. Forslaget er: Jarvis-forslagene lander i Kø, og administrasjonen av agentene (hvilke som kjører, hvilke ferdigheter de har) blir en side under Meg. **Dette er et forslag, ikke en beslutning — det krever Anders' ja.**

Bonuseffekt: det rydder også opp i at «Meg»-fanen i dag markeres som aktiv både på coach-profilen og på Jarvis-appen, mens «Jarvis»-fanen peker på agent-registeret. Navnene i menyen svarer i dag ikke til innholdet i sidene.

**FØR → ETTER:** 154 adresser, 11 innganger, 92 ekte skjermer → 6 destinasjoner, rundt 30 ekte skjermer, resten som faner og ark. De 62 veiviserne blir stående, og 60 nye kommer til.

### PlayerHQ — fem faner

Dagens fire er I dag · Plan · Analyse · Meg. Problemet er målt: elleve skjermer peker på en femte fane som ikke finnes, og en hel coach-kontaktflate på 12 skjermer har ingen dør i det hele tatt.

| Fane | Adresse | Hva den samler |
|---|---|---|
| **I dag** | `/portal` | Dagens økt, start og fullfør, neste. Publiserte økter, aldri utkast (beslutning 10). |
| **Plan** | `/portal/planlegge` | Uke og år, mål, utfordringer, fysisk, teknisk plan, kalender, drills. De elleve hjemløse «Gjør»-sidene lander her eller i Analyse. |
| **Analyse** | `/portal/analysere` | Oversikt · TrackMan · Runder · Hull · DataGolf · Turneringer · Talentnivå. 17 dører blir 1. |
| **Coach** | `/portal/coach` | Meldinger, spørsmål, tilbakemelding, delt materiell. Får endelig en dør. |
| **Meg** | `/portal/meg` | Profil, konto og abonnement, varsler og personvern, helse og utstyr, booking, hjelp. 34 sider blir 1. |

Alternativet er å beholde fire faner og legge Coach som et panel i I dag. Da holder du menyen minimal, men skjuler noe spilleren faktisk bruker. Jeg anbefaler fem, fordi coach-kontakt er et selvstendig behov — men det er en avveining, ikke et fasitsvar.

**FØR → ETTER:** 168 adresser, 4 faner (3 på Mac), 125 ekte skjermer → 5 faner, rundt 35 ekte skjermer.

### Forelderportalen — uendret struktur, én sammenslåing

11 skjermer, alle på Train-lock, ingen foreldreløse. Den er i best stand av alle. Ett grep: Økonomi og Fakturaer viser begge betalingsdata for de samme barna og bør bli én side med to faner. 4 + 6 destinasjoner blir 4 + 5.

### Eksterne flater — den tredje kategorien

`/innsyn`, `/team-wang`, `/team-gfgk` og `/gfgk-junior` er verken produkt eller marked: de er ekstern visning av produktdata for elever, foreldre og klubb. Den kategorien er ikke nevnt i prosjektbeskrivelsen i det hele tatt, og det er grunnen til at 13 av 17 skjermer der fortsatt kjører gammelt design. De bør navngis som en egen flate med egen fasit, ikke behandles som restene.

---

## Rekkefølge — hva som bør gjøres først

Datafeil før arkitektur. Grunnen: flytter du en skjerm som viser feil tall, får du en pen skjerm som viser feil tall.

**1. Tett de to sikkerhetsfunnene.** Sperr spillerprofilen bak en eierskaps-/samtykkesjekk (mønsteret finnes allerede i `/portal/venner/[spillerId]`), og gi IUP-siden samme rollesperre som `coach/page.tsx` har. Merk at IUP-siden krever en beslutning fra Anders først — se korreksjonen i forrige seksjon.
*Løser:* åpne personopplysninger om mindreårige. *Størrelse:* lite — to filer.

**2. Én sannhet for «økt».** Utpek Workbench-tabellen som eneste lagringssted (beslutning 3), la de to andre bli lesevisninger som genereres fra den, og legg all øktlesing bak én henter alle skjermer må bruke.
*Løser:* funn 1 og 8 — foreldre og coach ser samme uke. *Størrelse:* stort. Dette er jobben.

**3. Ett SG-tall, ett vindu, merkede estimater.** Én vei inn til SG-snitt, vinduet skrevet synlig på skjermen («siste 10 runder»), og estimerte runder enten holdt utenfor snittet eller merket i visningen.
*Løser:* funn 3, 4 og 5 — og oppfyller TruthLayer. *Størrelse:* middels.

**4. Én etterlevelsesformel.** Den delte formelen finnes allerede og har tre brukere. La Stall og Etterlevelse-fanen bruke den også, og vis alltid nevneren i klartekst.
*Løser:* funn 2. *Størrelse:* lite.

**5. Definer Kø og Oppgaver som to lister med hver sine kilder.** Kø får spillerspørsmål og coach-meldinger inn (de mangler i dag), Oppgaver flyttes ut av Kø-huben til egen adresse.
*Løser:* funn 10, beslutning 2, og åtte dører blir to. *Størrelse:* middels.

**6. Slå sammen Analyse i PlayerHQ.** 17 dører til én adresse med faner, og én felles SG-henter under.
*Løser:* det største enkeltgrepet for beslutning 1. *Størrelse:* stort.

**7. Slå sammen Meg i PlayerHQ.** 34 sider til én adresse med fem faner, alle gamle adresser som veivisere.
*Løser:* beslutning 1, og fjerner den doble hub-en (profil og innstillinger overlapper i dag).
*Størrelse:* middels — mange filer, lite risiko.

**8. Gi de 36 hjemløse skjermene en dør eller fjern dem.** Start med den ødelagte kvitteringen etter «be om økt» (den vises aldri) og talent-kjeden (tre ferdige skjermer uten inngang). Slett `/intern/komponenter` og `/kommando`.
*Løser:* ferdig arbeid som ingen kan bruke. *Størrelse:* lite per skjerm.

**9. Rydd de 25 gjenstående designavvikene.** 6 blandede skjermer, 13 eksterne flater på gammelt design, én hardkodet farge, 5 uten fargesett.
*Løser:* siste 10 % av Train-lock-porten. *Størrelse:* lite — restlista er kort og konkret.

**10. Bygg de nye skallene.** Seks destinasjoner i AgencyOS, fem faner i PlayerHQ, gamle adresser som veivisere. Til slutt, når innholdet under er ryddet.
*Løser:* selve arkitekturen. *Størrelse:* middels — mest flytting.

---

## Det jeg ikke fikk verifisert

Ærlig liste. Ikke bruk disse punktene som fasit uten å sjekke først.

1. **«Nås fra menyen» er ikke målt per skjerm.** Vi telte destinasjoner i menyene og søkte etter lenker for de skjermene som så mistenkelige ut. En skjerm som har én lenke fra en dyp underside teller som «nåbar» her, selv om den i praksis er umulig å finne.

2. **Ett tall spriker i grunnlaget.** Analysen av AgencyOS-skjermer uten inngang har overskriften «ni» men lister åtte adresser. Jeg har brukt åtte. Sjekk om det finnes en niende.

3. **Datakilden er «ukjent» for en god del skjermer.** Flere kartleggere leste bare selve sidefilen og importlinjene, ikke komponenten under. Det gjelder blant annet cockpiten, innboksen, live-visningen, kalenderen og økonomiflaten i AgencyOS. Disse må verifiseres før de brukes som grunnlag for beslutninger om datamodell.

4. **Designtilstanden er målt maskinelt, ikke visuelt.** Vi målte hvilke fargeverdier koden importerer — ikke om skjermen faktisk ser ut som fasiten. En skjerm kan bruke riktige farger og likevel ha feil layout. Ingen skjermbilder er tatt i denne kartleggingen.

5. **Antall «dører» per funksjon overlapper.** Noen adresser er telt i to funksjoner. Summen på 222 er derfor litt for høy, men rangeringen mellom funksjonene stemmer.

6. **Markedssidene er ikke sett på.** Booking finnes også på markedssiden og er nevnt i overlapp-avsnittet, men resten av markedsflaten er utenfor.

7. **Databasen er ikke spurt.** Alle funn om datamodell kommer fra å lese koden og skjemafila. Ingen har kjørt en spørring mot produksjonsdata for å måle hvor stort spriket faktisk er — for eksempel hvor mange økter som finnes i én tabell og ikke i de andre. Det bør gjøres før steg 2 i rekkefølgen.

8. **Den døde koden er identifisert, ikke tømt.** Rundt 30 filer har ingen brukere i det hele tatt, og en hel kalender-klynge henger igjen uten leser. Det er kartlagt, men ikke verifisert linje for linje at ingenting brekker om de fjernes.

9. **Forslagene til nytt skall er forslag.** Særlig at Jarvis går ut som egen destinasjon, og at PlayerHQ får en femte fane. Begge er begrunnet, ingen av dem er testet mot hvordan Anders faktisk jobber om morgenen.
