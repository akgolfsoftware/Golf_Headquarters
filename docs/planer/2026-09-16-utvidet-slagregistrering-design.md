# Utvidet slagregistrering — end-shot-kategorier og putting-detaljer

Status: godkjent av Anders 2026-09-16 (i økt). Dekker kun datafangst.

## Bakgrunn

Anders ønsker at stats/SG-tallene i AK Golf HQ etter hvert skal dekke de samme
analysekategoriene som TrackMans "Pro Analysis"-modul (11 hovedområder).
Kartlegging viste at 3 av 11 kategorier (SG-oversikt, dashboard/insights-faner,
trendgrafer) kan bygges videre på eksisterende data. 4 kategorier (tee-analyse
på banen, approach-analyse, short game-analyse, putting-analyse) mangler
datagrunnlaget helt — ingen end-shot-resultatkategorier, ingen putting-detaljer
(break/slope/linje/fart) finnes i skjemaet i dag.

Dette dokumentet dekker KUN steg for å fange denne rådataen. Selve
analyseskjermene (trendgrafer, dispersion-visning, proximity-nedbrytning) er
egne, senere leveranser som bygges når ekte data finnes å vise.

## Formål og bruk

- Primærbruker: Anders selv, for coaching-innsikt på egne spillere (WANG,
  GFGK, Academy) — høy detaljgrad er greit fordi han eller spilleren fører
  aktivt under/etter runde.
- Sekundærbruk: spillere fyller selv ut senere, samme skjermer.
- Registreres **underveis i runden**, hull for hull, på mobil — bygger videre
  på den eksisterende live-flyten (`runde-live-klient.tsx`), ikke en ny skjerm
  eller en egen etterregistreringsflyt.

## Datamodell

### `Shot` — nytt felt

```prisma
enum EndShotKategori {
  IN_PLAY
  MINOR_MISS
  MAJOR_MISS
  GREEN_HIT
  LETT
  MIDDELS
  VANSKELIG
  PENALTY_1
  PENALTY_2
}
```

`Shot.endShotKategori EndShotKategori?` — nullable, ett felt for alle
slagtyper. UI-laget avgjør hvilket delsett som er gyldig for et gitt slag:

- Tee-slag (`shotType = DRIVE`): IN_PLAY / MINOR_MISS / MAJOR_MISS /
  PENALTY_1 / PENALTY_2 (5 kategorier, speiler TrackMans Tee Analysis).
- Approach/short game (`shotType` i APPROACH/CHIP/PITCH/BUNKER): GREEN_HIT /
  LETT / MIDDELS / VANSKELIG / PENALTY_1 / PENALTY_2 (6 kategorier, speiler
  TrackMans Approach/Short Game Analysis — "Easy/Medium/Hard" oversatt).

Ingen egen enum per slagtype — én delt enum holder skjemaet enkelt, gyldighet
er en UI-/valideringsregel, ikke en databasebegrensning.

### Ny modell `PuttDetail` — 1:1 mot `Shot`

Kun opprettet når slaget er en putt (`shotType = PUTT`, dvs. `lie = GREEN`).

```prisma
enum PuttBreakRetning {
  VENSTRE_HOYRE
  HOYRE_VENSTRE
  OPPOVER
  NEDOVER
}

enum PuttSlopeAlvorlighet {
  SVAK
  MODERAT
  KRAFTIG
}

enum PuttLinjeMiss {
  VENSTRE
  HOYRE
  PAA_LINJE
}

enum PuttFartUtfall {
  HOLED
  FORBI
  KORT
  SONE_FORBI
  SONE_KORT
}

model PuttDetail {
  id                String                @id @default(cuid())
  shotId            String                @unique
  lengdeFot         Float
  breakRetning      PuttBreakRetning
  slopeAlvorlighet  PuttSlopeAlvorlighet
  linjeMiss         PuttLinjeMiss?
  fartUtfall        PuttFartUtfall
  createdAt         DateTime              @default(now())

  shot Shot @relation(fields: [shotId], references: [id], onDelete: Cascade)

  @@map("putt_details")
}
```

`linjeMiss` er nullable — settes ikke når `fartUtfall = HOLED`.

`lengdeFot` i fot, samme enhet TrackMan bruker — avviker bevisst fra
`Shot.distanceToPin` (meter, jf. øvrig app), fordi putting-lengdeanalyse i
denne modulen skal sammenlignes direkte med TrackMans fot-baserte
avstandsvinduer. UI-et viser fot kun i putt-under-flyten.

### Migreringsvei

Additiv endring (ny tabell + ett nullable felt på eksisterende tabell) —
følger den dokumenterte trygge veien i `.claude/rules/gotchas.md`
(§«Schema-endringer»): `CREATE TABLE IF NOT EXISTS`/`ALTER TABLE ADD COLUMN
IF NOT EXISTS` kjørt via tsx-skript med `PrismaPg`-adapter mot `DIRECT_URL`,
deretter `npx prisma generate`. IKKE `prisma migrate dev/deploy` eller
`db push` — begge er kjent blokkert i dette repoet.

## Fangst-UI

Alt bygges inn i eksisterende `src/components/portal/runde-logg/`-flyt:

1. **`slag-editor.tsx`** (full slag-editor, vises i "Slag for slag ·
   detaljer"-modus i `hull-foring.tsx`): nytt valgsteg for
   `endShotKategori` etter eksisterende felt, med kun gyldige verdier for
   `shotType` vist som store, tommel-vennlige knapper (samme mønster som
   `tommel-sone.tsx`).
2. Når slaget er en putt: egen liten under-flyt i `slag-editor.tsx` (eller ny
   `putt-detaljer.tsx`-komponent etter samme mønster) — lengde i fot
   (gjenbruker `avstand-velger.tsx`), så tre raske knappevalg for break,
   slope og fartutfall; linjemiss vises kun hvis fartutfall ≠ HOLED.
3. Autosave-kladden (`lagreKladd`/`lesKladdCached` i `runde-live-klient.tsx`)
   utvides til å inkludere de nye feltene i samme mønster som resten av
   slag-objektet, slik at feltføring overlever reload midt i runden.
4. **Hurtigmodus** (kun slagtall, uten "Slag for slag") berøres ikke — de nye
   feltene er kun tilgjengelige i detaljmodus, konsistent med at hurtigmodus
   allerede hopper over slagdetaljer i dag.
5. GPS-koordinatene (`startX/Y/endX/Y/targetX/Y`) fanges av eksisterende
   `src/lib/gameplan/shot-coords.ts` — ingen endring her. Dispersion-visning
   (kart, ellipser) er en senere leveranse og gjenbruker
   `src/lib/gameplan/dispersion.ts`, som allerede finnes.

## Ikke i denne leveransen

- Analyseskjermer/dashboards for tee/approach/short game/putting-kategoriene
  (TrackMan-kategori 7/8/10/11) — egne runder, tegnes i Claude Design før
  bygging (fast regel).
- Diamond/sikkert-siktepunkt-verktøyet (kategori 9).
- SG-beregning basert på de nye feltene — eksisterende granulære SG-bøtter på
  `Round` (`sgChip/sgPitch/sgLob/sgBunker/sgPutt0_3…40plus`) dekker allerede
  SG-siden; denne leveransen legger til kategorisering/kvalitetsdata ved
  siden av, ikke en ny SG-modell.

## Testing

- Utvid eksisterende tester for `runde-logg`-flyten (kladd-lagring,
  `slag-editor`) med de nye feltene.
- Server actions som skriver `PuttDetail`/`endShotKategori` følger samme
  eierskaps-/tilgangsmønster som eksisterende `Shot`-skriving — hvis dette
  skjer via en admin-/server-mutasjon med tilgangskontroll, legg til
  R-I-avvisningstest etter eksisterende mønster i repoet
  (`docs/design-audit/`-kontrolldokumentene beskriver mønsteret).
- `npm run verify` grønt før commit, som vanlig.

## Rekkefølge

1. Skjemaendring (additivt skript + `prisma generate`).
2. `endShotKategori`-steg i `slag-editor.tsx` for tee/approach/short game.
3. `PuttDetail`-fangst (egen under-flyt) for putt-slag.
4. Kladd/autosave utvidet med de nye feltene.
5. Tester for de fire punktene over.
