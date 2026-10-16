# Precision → AK Golf HQ · integrasjonskontroll 11.10.2026

## Grunnlag og omfang

- Repo: `akgolfsoftware/Golf_Headquarters`.
- Kontrollert `main`: `166ab799ad5a5298223e98296a2e2f52749f6767`, likt i GitHub og `git ls-remote`.
- Arbeidsgren: `codex/precision-kontroller-2026-10-11`, separat klon fra denne committen.
- Valgt design: retning A, Precision / skjermprosjektets leveranse 3.1.0-l.
- [Designautoriteten](../design-system/design-autoritet.md) fører prosjekt-ID-er og pakkeidentitet.
- MacBook Air og Mac mini er ikke tilgjengelige her. Upushet arbeid, lokale grener og
  worktrees på disse maskinene er **ikke kontrollert**. GitHub er ikke bevist å inneholde alt lokalt arbeid.

## Gjenbruk av arbeid som allerede finnes

GitHub-listingen viste 70 grener og minst 30 åpne PR-er. Dette er en oversikt, ikke en
kodegjennomgang av hver gren. Ingen gren eller worktree er slettet eller automatisk flettet.

- PR #1205 med Workbench Live-lagring er allerede på `main`. Den skal ikke bygges på nytt.
- PR #1210, `codex/plan-ferdigstilling-2026-10-09`, har en samlet ferdigstillingsplan.
  Den er lest som underlag. Versjonsreferansen 2.32.0 og påstanden om at Live-lagring
  mangler må avstemmes mot nyere design og #1205 før planen brukes videre.
- Flere åpne PR-er gjelder eierskap, samtykke og tilgang. Dette kontrollarbeidet
  erstatter ikke sikkerhetsgjennomgangen eller fletter dem som en bieffekt av UI-portering.
- WANG/TN- og eldre PlayerHQ-porter ligger også på grener. Funksjonsdekningen må
  sammenlignes før det bestilles nytt arbeid for samme rute.

## Endret i denne avgrensede porteringen

| Endring | Hvorfor | Omfang |
|---|---|---|
| `Knapp` lar ikke `disabled={false}` overstyre `loading` | En pågående handling kunne bli trykkbar | Felles Precision-knapp |
| Normaltekst, ikonplass og ventetekst beholder samme layoutplass | Knappen skal holde bredden under lagring | Begge eksisterende knappstilark er samordnet |
| Lokale klasser kombineres med variant og størrelse | `className` kunne fjerne systemets knappeklasser | Native attributter som `type`, `name` og `value` bevares |
| `SegmentertValg` har radiogruppe, ett Tab-stopp og piltaster | Enkeltvalg får én forståelig tastaturmodell | Hjem/slutt og ombryting ved lite plass støttes |
| Periode i AG-08 bruker den delte velgeren | Perioder får samme kontrollmønster | Datainnhenting og filtrering er uendret |
| Valgt, fokus og treffflate er skilt | Valgt har fyll og fet skrift; fokus har egen ring med luft | Bruker eksisterende semantiske fargetokens; ingen ny AK-palett |

UI-sperren er ikke en garanti for idempotent lagring i databasen. Serverens eierskaps-
og lagringsregler er uendret. Ingen nye felter, logger, API-kall, miljøfiler eller ekte
spillerdata er lagt til. Testene bruker bare syntetisk innhold.

## Kontrollstatus

- Fire nye komponenttester feilet mot uendret kode og består etter retting.
- To ekstra tester kontrollerer piltasthåndtereren og at Tab/native aktivering ikke fanges.
- Målrettet kjøring: 16/16 tester for kontrollene, PH-16 og Spiller 360-treningsvolum.
- Første `npm run verify` stoppet ved Node sin 2 GB minnegrense under Prisma-generering.
- Ny kjøring med `NODE_OPTIONS=--max-old-space-size=6144` besto Prisma-validering,
  klientgenerering, TypeScript, lint og de statiske vaktene. Den stoppet ved siste
  `tsx`-kommando fordi miljøet avviser lokal IPC (`listen EPERM`). Det samme skjer
  med tempmappen flyttet inn i det skrivbare arbeidsområdet.
- Ordboksgeneratoren besto kjørt som `node --import tsx scripts/ordbok-json.ts`.
  Den endret bare genereringsdato; dette støyavviket er tilbakestilt.
- Hele kildekodetestsettet besto **4 643/4 643**, kjørt med
  `node --import tsx --conditions=react-server --experimental-test-module-mocks --test 'src/**/*.test.ts'`.
- Hele komponenttestsettet besto **191/191**, kjørt med
  `node --import tsx --experimental-test-module-mocks --test 'tests/komponenter/*.test.ts'`.
  De 16 målrettede testene er en delmengde av disse 191, ikke ekstra tester.
- `npm run build` ble startet separat. Prisma-genereringen besto; Next stoppet før
  fullført bygg med `ENOENT: uv_resident_set_memory`. Bygget er **ikke bestått**.
- Testene over er direkte Node-kjøringer uten `tsx`-CLI-ens IPC-server. De er ikke
  et grønt resultat for den uendrede `npm run verify`. Ingen kontroll er fjernet,
  ingen pakkeversjon er oppgradert, og ingen godkjenning er omgått.
- Native tastaturkontroll og pikselmåling: **ikke gjennomført**. Playwright-nedlastingen
  ga ugyldige arkiver; Chrome tillot ikke lokal `file:`-prøve. Sperren er ikke omgått.
- Prøvefil for videre kontroll: `tests/visual/precision/skjermer/KONTROLLER.tsx`.
  Kjør `node tests/visual/precision/maal.mjs KONTROLLER` i et miljø med fungerende Chromium.
  Den eksisterende måleren kontrollerer layout, ikke hele tastaturflyten.
- CI, full visuell skjermgodkjenning og produksjon er ikke kontrollert i denne porteringen.
- Repoets `verify-og-commit` krever normalt grønn full gate før commit. Anders svarte
  «resume» 11.10.2026 på det konkrete spørsmålet om unntak for en tydelig merket
  utkast-PR, slik at GitHub CI kan kontrollere bygget. Dette brukes som godkjenning
  av utkast-PR-en, ikke som godkjenning av fletting eller lansering.
- Arbeidskopien måtte gjenopprettes i neste økt. Før denne statusoppdateringen ble
  patchen kontrollert identisk med den tidligere testede endringen: 28 030 byte,
  SHA-256 `f995fa42d172bdbf0a314e859d5b2e6ae2224dfc26689e56d9f9ec8b14121940`.
  Testtallene over gjelder forrige kjøring av dette kodeinnholdet; de er ikke en ny CI-kjøring.

## Kontroller som må fullføres

1. Bestå hele kvalitetsgaten på samme endring og kontroller CI før fletting.
2. Mål faktisk knappbredde før/under/etter lagring, også med ikon, lang ventetekst og
   `fullWidth`. Prøv gjentatt klikk og at kun riktig etikett leses opp.
3. Bruk ekte Tab/Shift+Tab og piltaster gjennom periodevelgeren. Bekreft én valgt verdi,
   at Tab går videre, synlig fokus, fyll uavhengig av fokus, 44 px treffflate og ingen
   tekstklipping i 390, 768, 1024, 1280 og 1440, samt stor tekst.
4. Kontroller hele AG-08 med ekte tillatte datakoblinger og de eksisterende tom-, laste-
   og feiltilstandene. Komponentprøven er ikke et produksjonsbevis.
5. Fortsett overføringen av 3.1.0-l: flater/fokus/tokens, responsive skall, tabeller,
   måltall, meldinger og AK-formelen. Avstem hvert punkt mot eksisterende PR-er først.

## Arbeidsrutine mellom to Mac-er

Før ny økt på **hver** maskin: hent fjernreferanser, les `git status -sb`,
`git worktree list`, `git branch -vv` og loggen mellom arbeidsgren og `origin/main`.
Undersøk arbeidskopiene som har endringer; ikke nullstill, flytt eller slett dem.
Bekreft repo-URL og både lokal og ekstern SHA før integrasjon.

Når arbeid er ferdig: test på navngitt arbeidsgren, lag én avgrenset commit/PR og
registrer hvilken commit som faktisk er flettet. Ved bytte av maskin hentes den
committen før videre arbeid. «Laget i en worktree» og «på main» er separate statuser.
En gren ryddes først når den er sammenlignet med main og unikt arbeid er bevart.

Ingen del av dette notatet er et vedtak om at hele designsystemet, alle skjermer eller
appen er ferdig eller klar for lansering.
