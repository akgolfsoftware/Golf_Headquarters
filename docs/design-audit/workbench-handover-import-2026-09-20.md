# Workbench — kildeimport og kontroll 20.09.2026

## Resultat

24 kildefiler er kopiert uendret fra den korrigerte Claude Design-eksporten til
[`workbench-handover`](../design/workbench-handover/manifest.md): én HTML-master,
16 PNG-er, to logoer, tre CSS-filer, manifest og SKILL. Filnavnene er bevart etter
den uttrykkelige bestillingen. Ingen appkode er endret.

Kilde: [Workbench uke-kroppen](https://claude.ai/design/p/830e7bce-eaba-465b-848c-26f73bd0f2d3).
Eksport: `Workbench uke-kroppen (1).zip`.
SHA-256: `bf1ab3b3122abf87c6c2b89e042cfd3ec6c0ffe4113cc99c85085bade6336ceb`.
Alle kildefiler har kontrollsummer i
[`import-kontroll.json`](../design/workbench-handover/import-kontroll.json).
Utgangspunkt i kode: `96aa1503f` på ren `main`.

## Rettet i Claude Design

Anders avklarte uttrykkelig at designloven vinner: rustfargede kortkanter skal
være grafitt. Samme retting ble gjennomført på fordelinger, nå-linje og lenkehover,
slik at eldre domeneunntak ikke overstyrer loven. «Åpne periode» er grafitt.
Periode-inspektøren er «Valgt periode» i begge formater og i manifestet.
Manglende SKILL er lagt inn i eksportmappen. Ingen ny master eller skjerm-ID.
`selectedForBuilding` er ikke endret.

Eksportert HTML har rustbruk bare i handlingsklassen `.pub` og dens hoverregel.
Uke desktop, Uke mobil og Periode desktop er visuelt inspisert etter eksport.
Dette bekrefter de kontrollerte rettingene, ikke at alle åtte skjermer eller
alle tilstander er godkjent. Mobil-PNG viser en rullbar dagsvisning med bunnark;
hele tidsaksen er ikke synlig samtidig.

## Designmål og kodebevis

Alle åtte desktopbilder er 2880 × 1760 og mobilbildene 780 × 1688.
CSS-formatene er dermed 1440 × 880 og 390 × 844 ved 2×.

| Egenskap | Designmål | Kode ved 96aa1503f | Live-avvik i px |
|---|---|---|---|
| Topplinje | 56 px | Ikke målt i nettleser | Ikke målt |
| Kildepanel | 236 px | `train-lock-valgt.css`: 236 px | Ikke målt |
| Inspektør | 340 px, toleranse ±8 | `train-lock-valgt.css`: 340 px | Ikke målt |
| Ukeakse | 05–22, 32 px/time | `WeekGrid.tsx`: 5 / 22 / 32 | Ikke målt |
| Kort | Minst 44 px | `WeekGrid.tsx`: minHeight 44 | Ikke målt |

`timeGridBlockStyle` bruker samme start kl. 05 som rutenettet; ingen
startforskyvning er påvist. Den aktive coach-ruten monterer `WorkbenchUke`.
Den leser bare `uke`, ikke `vis`, selv om pillene lager URL-er med `vis`.
Åtte lenker er derfor ikke bevis på åtte implementerte kropper.

## Dekning i aktiv coach-rute

| Pille | Design | Kode | pixel_ok | Rest |
|---|---|---|---|---|
| Uke | Ja | Delvis | Ikke målt | Live-sammenligning 1440/390 |
| Periode | Ja | Nei | Ikke målt | Egen kropp og rutevalg |
| Måned | Ja | Nei | Ikke målt | Egen kropp og rutevalg |
| År | Ja | Nei | Ikke målt | Egen kropp og rutevalg |
| Økt | Ja | Nei | Ikke målt | Egen kropp og rutevalg |
| Stall | Ja | Nei | Ikke målt | Egen kropp uten kildepanel |
| Live | Ja | Nei | Ikke målt | Egen mørk kropp uten kildepanel |
| Min kalender | Ja | Nei | Ikke målt | Egen kropp uten Publiser |

Tabellen gjelder portering til den valgte fasiten i coach-ruten, ikke fravær
av tilsvarende funksjoner andre steder i appen. Rekkefølgen over følger bestillingen.

## Kvalitetskontroll

- `npm run verify`: Prisma-validering/generering og typesjekk bestod.
- Lint: 0 feil, 3 eksisterende advarsler. Tilgangskontrollen bestod.
- Deretter stopp på eksisterende hardkodede farger i `CoachWorkbenchMount.tsx`,
  `SessionInspector.tsx` og `WorkbenchUke.tsx`. Tester og bygg ble ikke nådd.
- `npm run prosjekt:sjekk`: strukturkontrollen bestod, dokumentlenkekontrollen
  fant 137 brutte lenker før importen. Feilene var altså til stede i ren `main`.
- Etter import: samme 137 brutte lenker, ingen nye. `git diff --check` bestod;
  kontrollsummene for alle 24 importerte kildefiler stemte med eksporten.
- Ingen commit, push eller deploy. Verify-og-commit tillater ikke commit med rød gate.

## Vercel og tilgang

`vercel inspect https://akgolf-hq.vercel.app` viste produksjon **Ready**,
deployment `dpl_EGsFRF6Rb7etjyFBwW9qKnE9SpvF`, opprettet 20.09.2026 kl. 21:22 CEST.
Dette beviser tilgjengelig deployment, ikke pikselmessig samsvar.
Nettleserens eksisterende spillerinnlogging ble sendt fra `/admin` til `/portal`.
Coach/admin-tilgang er etterspurt; det er ikke forsøkt å omgå rollen eller endre
produksjonsdata. Ingen spillerdata er kopiert inn i designprosjektet.

## Git-kommandoer i denne arbeidsrunden

```sh
git status --short --branch
git rev-parse --short HEAD
git pull --ff-only origin main
git status --short
git diff --check
git diff --stat
git status --short
```

Pull svarte `Already up to date.`.

## Neste handling

Åpne Uke med autorisert coach/admin-innlogging og sammenlign mot den importerte
`WB-uke-coach-normal-1440.png`, deretter mobil. Registrer målte avvik i px før
appkode endres. Den øvrige porteringen og PlayerHQ følger først når Uke er verifisert.

Skill-anbefaling: oppdater eksisterende AK HQ Design med en avgrenset
Workbench-referanse; ikke opprett en konkurrerende hovedskill. Denne anbefalingen
er gitt til Anders, men prosjektets operative skill er ikke endret i denne runden.
