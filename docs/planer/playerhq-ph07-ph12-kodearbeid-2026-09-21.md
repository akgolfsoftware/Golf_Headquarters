# PlayerHQ PH-07–PH-12 — kodearbeid 21.09.2026

Gren: `codex/playerhq-ph01-20260921`. Ikke integrert, ikke pushet, ikke deployet.

Grunnlag: designkontrollene i `Documents/Codex/2026-09-21/ak-golf-hq-designverksted/outputs/`
(`playerhq-fordypning-kontroll.md`, `playerhq-meg-fordypning-kontrakt.md`,
`playerhq-skjermstatus.md`). Gjeldende designsystem er AK Golf Design System;
Train-lock og Paper er utgående og er ikke brukt som visuell kilde her.

Dette dokumentet gjelder **datariktighet og sannferdighet** i eksisterende kode —
ikke visuell port av de nye skjermene. Skjermdesignene ligger i Claude Design
(«App design») og er fortsatt kandidater; ingen av dem er bygget her.

## Rettet

### PH-07 Runder — par fra scorekortet
`Round` har ingen «antall hull»-kolonne. Både rundelisten og detaljsiden antok
18 hull og banens totalpar når scorekortet manglet, så en nihullsrunde med
brutto 42 ble vist som −30 mot par 72.

Ny felles regel: `src/lib/portal-runder/runde-omfang.ts`.

- Antall hull er kjent bare med ekte `HoleScore`-rader.
- Par er summen av par for de spilte hullene.
- Uten scorekort er par og mot par ukjent → «—».
- Brutto er summen av de spilte hullene.
- SG vises bare med lagret verdi **og** kjent metode (`sgSource`).
- Bruttosnittet i listen gjelder 18-hullsrunder alene.

Registreringen fabrikkerer ikke lenger SG: den syntetiske 18-hulls kjeden som
ga `sgSource: "estimert"` for en totalrunde er fjernet. Eldre estimerte rader
beholdes og merkes eksplisitt som estimat ved visning.

### PH-08 TrackMan — kartpunkt koblet til riktig slag
`computeTrackManDispersionMap` slo opp `points[i]` med indeksen i den
**ufiltrerte** slaglista, mens `trackmanToPoints` filtrerer bort slag uten side
eller carry. Ett slag uten måling forskjøv derfor alle etterfølgende slag over
på feil punkt og feil bøtte — og da kan ikke kart og tabell peke på samme slag.

Punktene lages nå fra den filtrerte lista. Resultatet oppgir også hvilken kølle
kartet gjelder (`kolle`) og flagger blanding (`blandedeKoller`). 1σ/2σ forklares
som spredningsbeskrivelse for den målte økta, ikke som prosentgaranti.

### Statistikk — «Snitt A1» uten kilde fjernet
`/portal/statistikk/[metric]` sammenlignet spillerens 30-dagerstall mot fem
hardkodede timetall (12/22/18/14/8) under etiketten «Snitt A1 = 12,0 t
(referanse)», med avviket i grønt eller rødt. Tallene hadde ingen måling, dato
eller kilde. Pyramide-disiplinene har nå ingen referanse og viser «—» uten
fargevurdering; SG-disiplinene beholder nullpunktet, men kalles referansefeltet.

### PH-12 Meg — symptomregistrering later ikke som den lagrer
`logSymptom` gjorde `void input` og redirectet til helsesiden. Det så ut som en
vellykket lagring. Skjermen sier nå fra før utfyllingen at funksjonen ikke er i
drift, og handlingen avviser. Samtykkeporten for helseopplysninger står før
avvisningen.

## Verifisert uten funn

- **PH-09 Tester:** PEI krever positiv målavstand (`test-scoring.ts`), Gate
  bruker eksplisitt `ok`-boolean med `miss_side`, FYS scores uten benchmark.
- **PH-11 DataGolf:** driverdistanse presenteres som relative yards, nøyaktighet
  som prosentpoeng, og egne SG-tall trekkes ikke fra proffens nivå når
  sammenligningsgrunnlaget er ukjent.
- **PH-12 booking:** ombooking krever strengt mer enn 24 timer (`h > 24`);
  nøyaktig 24 nektes. Kontosletting er formulert som forespørsel.

## Ikke gjort

- **PH-10 Min kurve:** ikke gjennomgått.
- **PH-12 Meg for øvrig:** mål, utstyr, venner, varsler, personvern,
  integrasjoner, abonnement — kontrakten dekker ~30 underskjermer og er ikke
  behandlet utover symptom-stubben og de to verifiserte punktene over.
- **PH-02 harmonisering:** de 20 statiske referansene mot Live-/FYS-modellene er
  ikke rørt. De ligger i Claude Design-prototypen, ikke i appkoden.
- **Visuell port** av PH-07–PH-11 mot de nye skjermdesignene.
- **Kjent, ikke rørt:** `rundeOppsummering` i `lib/datagolf/player-tool.ts`
  konverterer DataGolfs relative `distance` til meter. Verdien vises ingen
  steder i dag, så det er død kode — men den ville vært villedende om den ble
  tatt i bruk.

## Kontroll

`npx tsc --noEmit` 0 feil · `npm test` 3378 + 4 tester, alle grønne ·
`npm run lint` 0 errors (3 forhåndseksisterende warnings i `scripts/` og en
booking-side som ikke er rørt) · `git diff --check` rent ·
`check-fasit-sitering`, `check-token-gap`, `check-signalfarge-tekst`,
`check-ingen-paper`, `check-action-auth`, `check-critical-imports`,
`check-sensitive-route-guards` alle OK.

`npm run build` er **ikke** kjørt: worktreen har node_modules-symlink som
Turbopack ikke tåler. Bygget må verifiseres av CI.
