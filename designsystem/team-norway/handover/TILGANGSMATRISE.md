# TILGANGSMATRISE — hvem ser hva, og hva som er skjult

**Dette er pakkens viktigste dokument.** Flere av skjermene viser måledata om mindreårige.
Feil her er ikke en visningsfeil, det er en utlevering.

Leses før en skjerm bygges, ikke etter.

---

## 0 · Regelen som gjelder over alt annet

**Rollen bor på gruppen, aldri på brukeren.**

```ts
// FEIL — åpner hele AgencyOS
if (user.role === UserRole.COACH) { /* … */ }

// RIKTIG — rollen er per gruppe, og bare aktive medlemskap teller
const medlemskap = await prisma.groupMember.findFirst({
  where: { groupId, userId, endedAt: null, role: { in: ["COACH", "ASSISTANT"] } },
});
```

`UserRole` (`ADMIN | COACH | PLAYER | PARENT | GUEST`) er **plattformrollen**. En bruker med
`UserRole.COACH` er coach i AK Golf HQ — det sier ingenting om hvilke Team Norway-grupper
personen når. Leses den som tilgang, får hver coach i systemet innsyn i hele landslaget.

Fasiten er `GroupMember`:

| Felt | Verdi | Betyr |
|---|---|---|
| `role` | `COACH` | Trener på gruppen — innsyn og redigering |
| `role` | `ASSISTANT` | Hjelpetrener — innsyn, ikke publisering |
| `role` | `PLAYER` | Spiller i gruppen |
| `endedAt` | `null` | Aktivt medlemskap |
| `endedAt` | satt | Utmeldt. Raden beholdes for historikk |

**Alle spørringer som mener «medlem nå» MÅ filtrere på `endedAt: null`.** Bruk fragmentene i
`src/lib/domain/grupper.ts` (`gruppemedlemRolleSchema`), aldri håndskrevne where-klausuler.
Dette er ikke en stilpreferanse: et utmeldt medlemskap som fortsatt gir innsyn er en
tilgangsfeil som ingen test fanger, fordi raden ser gyldig ut.

### De seks rollene i skjermene

| Kode | Rolle | Hvor den bor i data |
|---|---|---|
| **SS** | Sportssjef | `GroupMember.role = COACH` på alle TN-gruppene, eller `UserRole.ADMIN` |
| **TR** | Trener på gruppen | `GroupMember.role = COACH` på **den** gruppen |
| **HJ** | Hjelpetrener | `GroupMember.role = ASSISTANT` på den gruppen |
| **SP** | Spiller | `GroupMember.role = PLAYER` |
| **FO** | Foresatt | `ParentRelation` (`parentId` → `childId`), `approved` |
| **EL** | Ekstern leser | `EksternLeserGruppe` (`revokedAt: null`) — GUEST med lesetilgang til samtykkede data |

Sportssjef finnes **ikke** som egen rolleverdi. Det er en trener med `COACH` på alle
TN-gruppene. Trenger flaten å skille dem, er svaret et eget felt eller en egen kanonisk
gruppe — ikke en ny `UserRole`.

### Samtykke er en egen port, ikke en rolle

`DelingsSamtykke` er append-only: et trukket samtykke er en **ny rad** med `gitt = false`,
aldri en oppdatering. Nyeste rad per `(userId, scope, mottakerGruppeId)` vinner. For
mindreårige (`User.requiresGuardianConsent`) kreves `gittAvRolle = FORESATT`.

**Håndheves i ekstern-leser-scopet, aldri bare i UI.** En skjerm som skjuler en kolonne har
ikke hindret utleveringen — API-et og loaderen har fortsatt sendt tallet.

---

## 1 · Matrisen

| Skjerm | Hvem ser den | Hva de ser | Hva som er skjult |
|---|---|---|---|
| **TN-00** Workdesk | SS, TR, HJ | Spillere i **egne** grupper med siste aktivitet, trinn og flagg. Spiller-ark med testtall, turneringer, poster | Spillere i grupper man ikke er trener for. HJ ser samme som TR, men kan ikke publisere. Ingen skoledata utenfor egne grupper |
| **TN-01** Skall | alle innloggede | Menyen filtrert til gruppene rollen når. Stripen «du ser 2 av 6 grupper» sier hvor stort utsnittet er | Menypunkter for grupper uten medlemskap. **Tomtilstanden «ingen grupper tildelt» er den ærlige** — 0 av 6, ikke en tom liste uten forklaring |
| **TN-02** Oversikt | alle innloggede | Dekningsgrad som **aggregat** (4 av 11 med profil). Kommende samlinger for egne grupper | Hvilke navngitte spillere som mangler profil, for alle andre enn TR/HJ på gruppen |
| **TN-03** Fellestesting | SS, TR, HJ | Føringskø med navn — dette er en arbeidsflate inne i egen gruppe | Spillere utenfor gruppen. Resultater fra andre organisasjoners protokollbruk |
| **TN-04** Protokollbibliotek | SS, TR, HJ | Protokoller med eier, versjon, batteri og hvem de er delt med | Resultatene målt under andre organisasjoners protokoller. Deling gir tilgang til **protokollen**, aldri til dataene |
| **TN-05** Protokolldetalj | SS, TR | Versjonshistorikk, låsedato, attestering | Redigering for HJ. En låst versjon kan ikke endres av noen |
| **TN-06** Uttaksliste | SS, TR | Vurderingsmatrisen per spiller, med begrunnelse | **Spilleren ser ikke sin egen vurdering her.** Uttak er underlag for trenerbeslutning; spilleren ser resultatet av uttaket (TN-14), ikke vurderingsteksten. HJ ser matrisen, kan ikke vurdere |
| **TN-07** Rangliste | SS, TR, HJ | Rangering på målte størrelser, med kildelinje per tall, for spillere i egne grupper | **Spilleren ser ikke ranglisten.** Den er trenerens flate. En 15-åring som ser seg selv på plass 11 av 14 har fått et vurderingsuttrykk systemet har lovet å ikke gi |
| **TN-08** Skoleoversikt | SS, TR, HJ, EL | Antall TN-utøvere og dekningsgrad **per skole, aggregert**. Skoler med under tre utøvere står som «under 3» | **Alle navn.** Se §TN-08 under — dette er dokumentets kjerne |
| **TN-09** Gruppeposter | SS, TR, HJ, SP | Poster til gruppen, vedlegg, lesekvitteringsbrøk | Poster til andre grupper. Spiller ser brøken, ikke hvem som ikke har lest |
| **TN-10** Post til enkeltspiller | SS, TR, HJ, SP, FO | 1:1-post. **Foresatt står i mottakerlinjen og ser posten** | Posting er **sperret** hvis spilleren er mindreårig og ingen foresatt er koblet. Håndheves i `src/lib/domain/tn-post.ts`, aldri bare i UI |
| **TN-11** Dokumentdeling | SS, TR, HJ, SP | Filer til gruppen med kvitteringsbrøk, «mangler» øverst | Hvem som mangler, for spiller. Filer i andre grupper |
| **TN-12** Samtykke | SP, FO | Hva som deles og hva som ikke deles, per organisasjon. To brytere | For mindreårige er bryteren **foresattes** — spilleren ser den, kan ikke sette den (`gittAvRolle = FORESATT`) |
| **TN-13** Turneringer | SS, TR, HJ, SP | Kommende med påmeldte, historikk med runder og til par, for egne grupper | Spiller ser **egne** resultater og feltets kommende turneringer, ikke lagkameratenes historikk |
| **TN-14** Samlingspunkt | SS, TR, HJ, SP | Uttatte med bekreftet / venter / meldt av, program time for time | Spiller ser **hvem som er uttatt** (laget er offentlig internt) men ikke reserveliste eller vurderingene bak uttaket |
| **TN-15** Collegegruppen | SS, TR, SP | Seks spillere, studieår, NCAA-kollisjon mot norsk sesong | Karakterer og opptaksdokumenter. Skolens vurdering holdes utenfor — se terminologiregelen |
| **TN-16** Månedsplan | SS, TR, HJ, SP | Måned, uke, fokus, avvik mot publisert plan | Spiller ser **egen** plan og eget avvik, aldri gruppens avviksliste |
| **TN-17** Legg til turnering | SS, TR, SP | Skjema + forhåndsvisning av raden | Spiller kan legge inn **egen** rad, aldri en annens. Uten belegg blir raden utkast og teller ikke i rangliste eller uttak |
| **TN-18** Trenere og tilgang | SS | Alle med tilgang, rolle per gruppe, aktiv periode | **TR og HJ ser ikke denne skjermen.** Å kunne gi tilgang er å kunne gi seg selv tilgang. Se B2 |
| **TN-19** Inviter spiller | SS | Invitasjoner med mottaker, gruppe, avsender, status | TR og HJ kan ikke invitere. Registreringen skjer i PlayerHQ og vises aldri her |
| **TN-20** Trenerkatalog | SS, TR, HJ, SP | Ni roller med kontaktinfo | **Katalogen gir ingen tilgang.** Å stå i den betyr ikke at man når en gruppe |
| **TN-21** Referansenivåer | SS, TR, HJ, SP | Median PEI per bånd, treff, forventet slag per underlag | Ingen individuelle tall. Referansesettet er tour-benchmark, ikke TN-spillere |

---

## 2 · TN-08 — den låste navn-varianten

Skjermen viser **aggregat på skolenivå**: antall TN-utøvere og dekningsgrad per skole.
Navn-varianten er tegnet inn som en **låst tilstand** med grå streker der navnene ville stått,
en samtykkekolonne som viser null av ni, og en «Vis navn»-knapp som er deaktivert.

### Hvorfor den er låst

Spilleren samtykker til at **sin egen skole** følger utviklingen. Det samtykket dekker ikke
forbundet: **NGF er en annen behandlingsansvarlig.** En navngitt skoleliste hos forbundet
ville vært en ny utlevering til en ny part, uten eget grunnlag.

Derfor teller flaten, og navngir ikke.

### Hvorfor terskelen på tre finnes

En skole med to TN-utøvere er ikke anonymisert av at tallet står som «2». Er det to elever
på linja, vet alle hvem de er. Under tre står derfor som **«under 3»** framfor eksakt tall.

Terskelen er personvernmekanismen, ikke en visningspreferanse. Den kan ikke slås av per
skole, og den er grunnen til at `TnSkole` bør normaliseres (`DATAMODELL.md` §6) — på
fritekst kan den ikke håndheves trygt.

### Hva koden skal gjøre

1. **Aggregat er standard.** Ikke en innstilling som husker forrige valg.
2. **Knappen er deaktivert fordi hjemmelen mangler**, ikke fordi noe mangler i
   grensesnittet. Teksten sier det: null av ni har samtykket til at NGF ser navnet i en
   skoleliste.
3. Åpnes varianten en gang i framtiden, er den **fortsatt ikke standard**: aggregat er
   utgangspunktet, navn er et bevisst valg med eget spor i loggen.
4. Filteret ligger i **loaderen**, ikke i komponenten. En loader som returnerer navn og en
   komponent som skjuler dem har allerede sendt navnene til nettleseren.
5. Ekstern leser (`EL`, skolekontakt) ser **kun** sin egen skoles aggregat, og bare hvis
   `EksternLeserGruppe.revokedAt` er `null`.

---

## 3 · Fem regler som ikke står i noen enkelt rad

**Mindreårig 1:1-post krever foresatt.** Er spilleren under 18 og ingen `ParentRelation`
finnes, er posting til spilleren sperret — ikke skjult, sperret. Håndheves i
`src/lib/domain/tn-post.ts`.

**Vurdering er ikke karakterer.** Coach-vurderingen heter «vurdering». Skolens karakterer
holdes utenfor systemet, også i TN-15 der spillerne er collegesøkere.

**Uttak er alltid underlag.** Ingen skjerm viser en totalscore, og ingen kolonne skal kunne
bli en. `TnUttakVurdering` er derfor tegnet uten numerisk verdi (`DATAMODELL.md` §4).

**Aggregat kan ikke reverseres av en snarvei.** En CSV-eksport, et API-endepunkt eller en
Caddie-spørring som returnerer navn der flaten viser aggregat, omgår hele mekanismen.
Eksport arver flatens tilgang, aldri loaderens råtilgang.

**Ravgul er en grense, rød er en feil.** «Ingen grupper tildelt», «avgrenset tilgang»,
«under 3», «lagt inn selv» er ravgule fordi de er grenser systemet har satt med vilje. Rødt
er forbeholdt noe som er galt. Blandes de, leser brukeren en tilgangsgrense som en systemfeil
og ber om hjelp med noe som virker som det skal.
