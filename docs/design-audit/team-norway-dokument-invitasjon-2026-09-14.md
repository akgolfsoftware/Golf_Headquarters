# Team Norway — dokument/vedlegg/invitasjon, oppfølging 2026-09-14

Avgrenset Claude Code-oppgave, parallelt med hovedøktens testdag/trenerføring-arbeid
(`ak-hq-tn-dokument-invitasjon-cc.md`, senere `ak-hq-tn-dokument-invitasjon-review.md`).
Eksklusivt fileierskap: se invitasjonsfilen. Ingen `.env.local`, ekte database/Storage/mail,
schema/tilgangsregler, seed, git-operasjoner eller `npm run verify`/build er rørt — jf.
avgrensningen.

**Runde 2 (Codex-review, samme dag) — fem reelle rester rettet, se §5.**

## 1. Vedlegg-GET: foresatt-hullet i gruppestien rettet

`hentTnVedleggForViewer` (`src/lib/domain/tn-post.ts`) sjekket for gruppeposter kun
`erAktivtMedlem` — en godkjent foresatt uten eget gruppemedlemskap fikk dermed **404**
på et vedlegg hen allerede kunne se i selve gruppetidslinjen (som går via
`hentViewerRolleIGruppe`, som korrekt regner foresatte som gyldige lesere). Samme avvik
fantes i `hentGruppetidslinje` selv — den brukte også bare `erAktivtMedlem`, ikke
`hentViewerRolleIGruppe`, så en godkjent foresatt kunne i praksis heller ikke se
gruppepostene sine i utgangspunktet (kun 1:1-spillerposter fungerte for foresatte).

**Retting:** begge funksjonene bruker nå samme rolleoppslag
(`hentViewerRolleIGruppe`) — én kilde til «har denne brukeren lov til å lese noe fra
denne gruppen», delt mellom tidslinjen og vedleggs-nedlastingen. Konsekvens, verifisert
med tester: **GUEST**-medlemmer (og enhver annen rolle enn COACH/ASSISTANT/PLAYER) mister
tilgang til gruppens poster/vedlegg med mindre de også er godkjent foresatt — dette er en
innstramming, ikke en svekkelse, og matcher oppdraget («GUEST … avvises»). Individuelle
1:1-spillerposter er urørt (samme kode/tester som før).

Ruten selv (`src/app/api/team-norway/vedlegg/[attachmentId]/route.ts`) var allerede solid:
401 uinnlogget, 403 uten foresattsamtykke, regex på `attachmentId` før domeneoppslag,
`.download()` (aldri `.getPublicUrl()`/offentlig URL), `nosniff`, `Cache-Control: private,
no-store`, restriktiv CSP-sandbox, og lagringsstien kommer utelukkende fra DB-oppslaget —
klienten kan aldri velge sti. Ingen endring var nødvendig i selve ruten.

**Bevis:**
- `src/lib/domain/tn-vedlegg.test.ts` — utvidet fra 5 til 9 tester: gruppe-trener (fantes),
  spiller-medlem, GUEST avvist, godkjent foresatt uten medlemskap godkjent, ikke-godkjent
  foresatt avvist, pluss de eksisterende outsider/fremmed-gruppe/manipulert-id/individuell-post.
- Ny `src/app/api/team-norway/vedlegg/tn-vedlegg-route.test.ts` (6 tester): 401/403/404-stiene,
  at `getPublicUrl` aldri kalles (mocken har den bevisst ikke — et faktisk kall ville krasjet
  testen med TypeError), private headere, og at en Storage-feil aldri lekker rå feiltekst.

Kommando: `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/tn-vedlegg.test.ts src/app/api/team-norway/vedlegg/tn-vedlegg-route.test.ts` → 15/15 grønt.

## 2. Opplasting: allerede solid, ny routenivå-dekning lagt til

`src/app/api/team-norway/dokumenter/route.ts` og `src/lib/domain/tn-dokument-lagring.ts`
fantes fra Codex-forsøket og var reelt godt bygget: origin-sjekk → coach-auth →
`krevDokumentOpplastingstilgang` (kanonisk TN-gruppe + skriverolle) FØR body leses,
`content-length`-sjekk FØR strømming, streamet størrelsesgrense med `reader.cancel()`
ved overskridelse, innhold+signatur+MIME-validering (`samsvarerFiltype`), servergenerert
unik sti (`${groupId}/${randomUUID()}`), og opprydding i Storage ved DB-feil etter
opplasting. 50 MB-grensen er isolert til denne ene ruten (`MAKS_TN_DOKUMENT_BYTES` fra
bucket-konfigurasjonen) — ingen global `serverActions.bodySizeLimit` er rørt.

**Reell gap funnet og lukket:** `[groupId]/dokumenter/page.tsx` sendte fortsatt opplastingen
gjennom den GAMLE server action-innpakningen (`opprettGruppeDokumentAction` i
`tn-post-actions.ts`, en `"use server"`-funksjon som tar imot en `File` i `FormData`) i
stedet for den nye POST-ruten — nøyaktig arven oppdraget ba om å fjerne. En serverhandling
med filopplasting er underlagt Next sin globale `serverActions.bodySizeLimit`
(standard langt under 50 MB), som vi eksplisitt ikke skal endre — den gamle veien var derfor
enten allerede ødelagt for større filer, eller avhengig av en global grense vi ikke har
kontroll på. `TnDokumentOpplasting`-komponenten hadde allerede en `groupId`-vei via
`fetch(...POST...)`, men fikk aldri `groupId` sendt inn fra siden.

**Retting:**
- `page.tsx` sender nå `groupId` til `TnDokumentOpplasting` og har ikke lenger noen
  server-action-wrapper for opplasting.
- `TnDokumentOpplasting` forenklet til kun å støtte POST-rute-veien (`groupId: string`,
  påkrevd) — `last`-fallbacken var etter dette uten kallere og fjernet.
- `opprettGruppeDokumentAction` i `tn-post-actions.ts` var etter dette uten kallere og
  fjernet, sammen med det nå ubrukte `lagreTnDokument`-importet i samme fil.
  `tn-post-actions.test.ts` (hovedøktens/tidligere Codex-fil, ikke i mitt eierskap) tester
  ikke denne funksjonen og er upåvirket — kjørt for å bekrefte (3/3 grønt).

**Bevis (nytt):** `src/app/api/team-norway/dokumenter/tn-dokumenter-route.test.ts` (9 tester):
feil/manglende origin avvist FØR auth/body, ikke-trener avvist FØR gruppeporten, ugyldig
`groupId` → 400, ingen skrivetilgang → 403 uten at body konsumeres eller `lagreTnDokument`
kalles, `content-length` over grensen → 413 uten lesing, ekte strøm over grensen (løgnaktig
eller manglende `content-length`) → 413 med avbrutt lesing, vellykket kall videresender riktig
`groupId`/`forfatterId`/`fileSize`, tomt skjema → 400. Ingen ekte Storage brukt —
`lagreTnDokument` og `MAKS_TN_DOKUMENT_BYTES` er mocket (en liten testgrense, siden selve
50 MB-tallet allerede er dekket i `tn-dokument-lagring.test.ts`).

Kommando: `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/tn-dokument-lagring.test.ts src/app/api/team-norway/dokumenter/tn-dokumenter-route.test.ts src/app/team-norway/tn-post-actions.test.ts` → 18/18 grønt.

## 3. Invitasjon: backend-logikken var allerede riktig, UI var koblet feil

`inviterSpillereTilGruppe` (`src/app/admin/grupper/[id]/actions.ts`) skiller allerede
korrekt mellom `lagtTil` (eksisterende bruker, kun medlemskap), `opprettet` (ny pending-
profil opprettet, uavhengig av e-postutfall), `invitert` (e-post bekreftet sendt av
leverandøren) og `feilet` (med presis feiltekst per adresse). En `resend`-`resolved error`
(`levert.error`), en kastet feil fra e-postklienten, og manglende `RESEND_API_KEY` havner
alle i `feilet` — ALDRI i `invitert` — og medlemskapet/profilen består uansett
e-postutfallet. Invitasjonsretten gjenbruker `eierGruppen` (hovedtrener ELLER aktivt
COACH-medlem i gruppen); ASSISTANT/GUEST har ikke `User.role` COACH/ADMIN og stoppes
allerede av `requireCoachActionUser`, en fremmed coach uten eierskap stoppes av
`eierGruppen`. Dette var alt allerede riktig bygget — ingen endring i selve tilgangs-
eller sende-logikken var nødvendig.

**Reelt gap: UI-en slo sammen alt til én tekst.** `TnInviterSpiller` viste kun
`lagtTil.length + invitert.length` som ett tall («X spillere er lagt til eller
invitert»), uten å skille faktisk sendt e-post fra kun-medlemskap, uten detalj per feilet
adresse, og tømte hele tekstfeltet ved enhver suksess — de feilede adressene måtte skrives
inn på nytt for et nytt forsøk.

**Retting (`src/components/team-norway/tn-inviter-spiller.tsx`):** viser nå tre atskilte
linjer — antall faktisk sendte invitasjoner (med adresser), antall lagt til direkte (med
forklaring om at ingen e-post sendes for disse), og en liste per feilet adresse med
nøyaktig årsakstekst fra serveren. Feltet fylles automatisk med KUN de feilede adressene
etter innsending, slik at et nytt forsøk er ett trykk unna. Ingen adresse kan noensinne
vises under «sendt» uten å faktisk stå i `invitert`-lista fra serveren.

**Om retry på en adresse som allerede har pending-profil** (forrige forsøks e-post
feilet): et nytt forsøk finner brukeren via e-post, ruter via `leggTilGruppemedlem`, som
ser at medlemskapet allerede er aktivt og returnerer en ærlig «allerede medlem»-feil — det
rapporteres ALDRI som en ny sending. Dette er dekket eksplisitt i den nye testen.
Systemet har fortsatt ingen egen «send e-post på nytt uten å røre medlemskapet»-handling;
det var utenfor det som var bedt om («vær varsom», ikke «bygg reell resend»), og er notert
som gjenstående nedenfor.

**Bevis (nytt):** `src/app/admin/grupper/tn-inviter-tilgang-og-epost.test.ts` (8 tester,
mocket prisma/e-post/audit, ingen ekte database/mail):
ny e-post → opprettet+sendt rapportert separat; resolved provider-feil → aldri sendt,
adresse bevart i feilet; e-postklient kaster → samme garanti; ingen `RESEND_API_KEY` →
samme garanti; retry på adresse med eksisterende pending-profil → rapportert som
medlemskap, aldri som ny sending; aktivt COACH-medlem (ikke hovedtrener) har
invitasjonsrett; ASSISTANT/PLAYER-rolle avvist på systemnivå; fremmed coach uten
eierskap/medlemskap avvist.

Kommando: `npx tsx --conditions=react-server --experimental-test-module-mocks --test src/app/admin/grupper/tn-inviter-tilgang-og-epost.test.ts` → 8/8 grønt.

## 4. Ingen rå database/providerfeil eller PII i logger

`audit()`/`logError()` (uendret, ikke i mitt eierskap) sanerer allerede PII fra
meldinger/metadata (S-20). Feilmeldingene som når klienten i alle tre punktene over er
egne, klarspråklige norske tekster — aldri `error.message` fra Prisma/Resend/Storage
direkte. Alle nye tester bruker syntetiske e-postadresser (`@eksempel.no`) og oppdiktede
id-er, ingen ekte brukerdata.

## 5. Runde 2 (Codex-review) — fem reelle rester rettet

1. **`visSeHvem` manglet fortsatt på siden.** `[groupId]/dokumenter/page.tsx` kalte
   `TnDokumentTabell` uten prop-en — komponentens default `false` betydde at ingen trener
   noensinne så «Se hvem»-lenken på et dokument, stikk i strid med den opprinnelige
   bestillingen. Rettet: `visSeHvem={rolle === "TRENER"}`. Verifisert med rolle TRENER (vises)
   og SPILLER/FORESATT (skjules) — se test 3 i punkt 4 under.

2. **`opprettet`-feltet ble aldri vist, og modalen brukte ikke de nye feltene.**
   `TnInvitasjonResultat` viste kun `invitert`/`lagtTil`/`feilet`; en adresse der profilen ble
   opprettet men e-posten feilet, dukket derfor bare opp som én linje i feilet-lista uten at
   selve medlemskapet ble fremhevet. `admin/grupper/[id]/legg-til-medlem-modal.tsx` (i mitt
   eierskap, upåvirket av runde 1) brukte fortsatt kun `lagtTil`/`invitert`/`feilet` uten
   `opprettet` og uten å skille «allerede medlem» fra en reell sendefeil. Begge stedene viser nå
   `opprettet` som egen linje, og modalen bygger samme oppsummeringstekst
   (`X invitasjoner sendt · Y nye testprofiler opprettet · Z lagt til direkte`) som
   `TnInviterSpiller`.

3. **Retry på en pending-profil ble aldri en reell ny sending — nå er den det.**
   `inviterSpillereTilGruppe` (`admin/grupper/[id]/actions.ts`) skiller nå eksplisitt mellom
   en ORDINÆR eksisterende bruker (uendret: stille `leggTilGruppemedlem`, ingen e-post) og en
   UKLAIMET invitasjon (`authId` starter med `pending-`, `role` er `PLAYER` — vår egen
   placeholder fra et tidligere kall som aldri ble fullført av mottakeren). For sistnevnte:
   samme tilgangskontrollerte `leggTilGruppemedlem`-port kalles på nytt (idempotent —
   «allerede medlem» tolkes som «medlemskapet står riktig», ikke en feil), INGEN ny bruker
   opprettes, INGEN rolle/samtykke røres, og et NYTT forsøk på å sende invitasjons-e-posten
   kjøres via den samme (mockede i test) `resendKlient()`-veien som førstegangsutsendingen.
   Lykkes sendingen: adressen havner i `invitert` (ikke `opprettet`, siden ingenting ble
   opprettet nå). Feiler den igjen: egen tekst («…kunne ikke sendes på nytt») som ikke påstår
   at profilen ble opprettet i dette kallet. Ingen ny databasemodell, ingen ny e-postleverandør
   — kun gjenbruk av eksisterende infrastruktur, slik oppdraget presiserte.

4. **UI-en manglet en catch for nettverk/server-action-throw, og copyen var upresis.**
   Både `TnInviterSpiller` og modalen fanger nå en kastet feil fra selve kallet (nettverksbrudd,
   server action-feil) uten å nullstille et tidligere vist resultat — kun en ny, tydelig
   feiltekst («Kunne ikke nå serveren…») legges til. Feltet/knappen er sperret mens en
   forespørsel er i gang (`disabled={venter}`/`disabled={inviterPending}`, gjaldt fra før for
   knappen, nå også for tekstfeltet begge steder). Copy endret fra «faktisk sendt» til «sendt»
   (ordet «faktisk» droppet, ingen påstand om levering til innboks). `feilet`-rader som betyr
   «allerede medlem» vises nå atskilt fra reelle sendefeil, med egen, nøytral tekst — og kun de
   reelle sendefeilene legges tilbake i feltet for retry (en «allerede medlem»-adresse ville
   bare gitt samme svar på nytt).

5. **Testene for ASSISTANT/GUEST var feil modellert — rettet til gruppe-roller.** Runde 1s
   rapport/tester behandlet feilaktig ASSISTANT/GUEST som om de var `User.role`
   (platform-roller). De er `GroupMember.role` (gruppe-roller) — en bruker med platform-rolle
   COACH kan fritt sitte som ASSISTANT eller GUEST i ÉN gruppe. Testfilen er skrevet om: mocken
   for `prisma.group.findFirst` evaluerer nå det FAKTISKE `OR`-uttrykket fra `eierGruppen`
   (`coachId === hovedtrener` ELLER `members.some({userId, role:"COACH", endedAt:null})`) mot en
   simulert medlemsrolle-tabell, i stedet for en oppdiktet snarvei-boolean. Nye/rettede tester:
   hovedtrener uten eget `GroupMember` har rett, et aktivt COACH-gruppemedlem (ikke hovedtrener)
   har rett, en platform-COACH med GRUPPE-rolle ASSISTANT eller GUEST i akkurat denne gruppen
   avvises (verifisert: `opprettedeBrukere.length === 0` og `sendKall === 0` — ingen bruker
   skrives og ingen e-post sendes før avvisningen), en fremmed platform-COACH uten noe
   medlemskap avvises, og en bruker uten platform-rolle COACH/ADMIN avvises av
   `requireCoachActionUser` (en reell, annen sperre — nå riktig navngitt i testen). Capability-
   porten `MANAGE_GROUPS` (`assertCapability` i `krevCoach`) er urørt og fortsatt mocket som
   alltid bestått i disse testene — selve gjennomføringsretten er `eierGruppen`, som er det
   testene nå faktisk øver på.

## Samlet testkjøring for berørte filer (etter runde 2)

```
npx tsx --conditions=react-server --experimental-test-module-mocks --test \
  src/lib/domain/tn-post*.test.ts \
  src/lib/domain/tn-vedlegg.test.ts \
  src/lib/domain/tn-dokument-lagring.test.ts \
  src/app/admin/grupper/tn-inviter-tilgang-og-epost.test.ts \
  src/app/team-norway/tn-post-actions.test.ts \
  src/app/api/team-norway/vedlegg/tn-vedlegg-route.test.ts \
  src/app/api/team-norway/dokumenter/tn-dokumenter-route.test.ts \
  src/lib/team-norway/tn-reise.test.ts \
  src/lib/domain/tn-tilgang-mutations.test.ts
```
→ **75/75 grønt** (69 fra runde 1 + 6 nye/utvidede i `tn-inviter-tilgang-og-epost.test.ts`:
3 gruppe-rolle-tester + 3 retry-tester, samt de 8 eksisterende testene der omskrevet for riktig
mock). `eslint` på alle endrede filer → ingen funn. `tsc --noEmit -p tsconfig.json` → ingen feil
i noen fil i dette eierskapet (samme to urelaterte feil i hovedøktens testdag-filer som i
runde 1, uendret av dette arbeidet).

## Filer endret/lagt til (kumulativt, begge runder)

Endret:
- `src/lib/domain/tn-post.ts` — `hentGruppetidslinje` og `hentTnVedleggForViewer` bruker
  nå `hentViewerRolleIGruppe` konsekvent for gruppeposter (foresatt-fiks, runde 1).
- `src/lib/domain/tn-vedlegg.test.ts` — utvidet til rollebevisst mock + 4 nye tester (runde 1).
- `src/app/team-norway/[groupId]/dokumenter/page.tsx` — sender `groupId` til opplastings-
  komponenten uten server-action-wrapper (runde 1); sender nå `visSeHvem={rolle === "TRENER"}`
  til `TnDokumentTabell` (runde 2, punkt 1).
- `src/components/team-norway/tn-dokument-opplasting.tsx` — kun POST-rute-veien igjen (runde 1).
- `src/app/team-norway/tn-post-actions.ts` — fjernet ubrukt `opprettGruppeDokumentAction`
  (runde 1).
- `src/app/admin/grupper/[id]/actions.ts` — `inviterSpillereTilGruppe` skiller nå ordinær
  eksisterende bruker fra uklaimet pending-invitasjon og sender reelt på nytt for sistnevnte;
  ny delt `sendInvitasjonsEpost`-hjelper (runde 2, punkt 3).
- `src/app/admin/grupper/[id]/legg-til-medlem-modal.tsx` — bruker nå `opprettet`, fanger
  nettverks-/throw-feil uten å tape status, sperrer tekstfeltet mens pending, skiller
  «allerede medlem» fra reell sendefeil ved retry (runde 2, punkt 2 og 4).
- `src/components/team-norway/tn-inviter-spiller.tsx` — viser nå `invitert`/`opprettet`/
  `lagtTil`/«allerede medlem»/reell sendefeil hver for seg, fanger nettverks-/throw-feil uten
  å nullstille forrige resultat, sperrer feltet mens pending, copy uten «faktisk» eller
  innboks-påstand (runde 1 + runde 2, punkt 2 og 4).
- `src/app/admin/grupper/tn-inviter-tilgang-og-epost.test.ts` — skrevet om for å modellere
  ASSISTANT/GUEST korrekt som gruppe-roller (runde 2, punkt 5) og utvidet med retry-tester
  (runde 2, punkt 3).

Nye tester (runde 1, uendret av runde 2):
- `src/app/api/team-norway/vedlegg/tn-vedlegg-route.test.ts`
- `src/app/api/team-norway/dokumenter/tn-dokumenter-route.test.ts`

## Gjenstående (utenfor dette eierskapet)

- Ekte nettleserverifisering (innlogget godkjent-foresatt-reise, faktisk 50 MB-fil, «Se hvem»
  synlig for en ekte trener-innlogging) er ikke kjørt i denne økten — utenfor avgrensningen
  («ekte lokal nettleserreise» eies av hovedøkten).
- `TnSeHvem`-komponenten selv (`tn-post-tidslinje.tsx`) er urørt av denne runden — den hentet
  fra før navnelisten via den allerede IDOR-sikrede `hentPostLesekvitteringNavnForViewer`, og
  `visSeHvem`-fiksen i punkt 1 var kun manglende prop-viderekobling på siden.
