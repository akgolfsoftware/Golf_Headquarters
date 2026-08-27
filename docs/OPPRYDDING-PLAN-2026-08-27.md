# Oppryddingsplan — dokumenter og utgått innhold (27.08.2026)

**Formål:** fjerne alt som ikke lenger styrer arbeidet, slik at lanseringsplanen kan skrives
mot et repo der hvert gjenværende dokument faktisk gjelder. Ingen kodeendringer i denne jobben
utover kommentar-/lenkeretting.

**Målt, ikke antatt** (27.08.2026, mot `main`-linjen):

| Måling | Tall |
|---|---|
| Markdown-filer i `docs/` | 140 |
| Døde lenker (peker på filer som ikke finnes) | 43 |
| Foreldreløse dokumenter (ingen refererer til dem) | 27 |
| Filer i `docs/port/` (hele mappen supersedert 25.08) | 16 |
| Filer i `docs/natt/` — hvorav rene DONE-rapporter | 34 / 24 |
| `designsystem/paper/` | 845 filer, 9,8 MB |
| Kode-kommentarer som peker på `designsystem/paper/` | 122 filer (0 imports) |
| Skript i `scripts/` — hvorav daterte engangsjobber | 156 / ~35 |

---

## Fire aktive feilkilder funnet under kartleggingen

Disse er ikke bare rot — de kan få en agent eller en Claude-økt til å bygge feil:

1. **To motstridende «fasit»-dokumenter.** `docs/FASIT-AK-GOLF-HQ.md` (gjeldende, redigert av
   Anders 19.08) sier spillerkategorier **A–K, 11 nivåer**. `docs/ak-golf-hq-fasit-2026-08-19.md`
   (utkastet Anders redigerte *fra*) sier **A–L, 12 nivåer**. Begge ligger i repoet, ingen av dem
   peker på den andre.
2. **`START-HER.md` i roten er direkte feil.** Den sier «Claude Paper er designfasit» (supersedert
   25.08) og peker på to filer som er slettet. Dette er den første fila en ny økt leser.
3. **Fire konkurrerende lanseringsplaner i `docs/natt/`:** `LAUNCH-PLAN-FULL-2026-08-25.md`
   (gjeldende), `UTVIKLINGSPLAN-LANSERING.md`, `KOMPLETT-PLAN.md`, `OVERNIGHT-CODING-LOOP.md`.
   Kun README-en sier hvilken som vinner.
4. **43 døde lenker** — bl.a. i `.claude/rules/`, som lastes i hver eneste økt.

---

## Stegene

### Steg 1 · Rett de fire feilkildene (høyest verdi, minst arbeid)
- Slett `docs/ak-golf-hq-fasit-2026-08-19.md` (utkastet). `docs/FASIT-AK-GOLF-HQ.md` er fasit.
- Skriv `START-HER.md` om til 10 linjer: Train-lock som designfasit, `docs/STATUS-NÅ.md` +
  `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` som eneste to inngangsdører.
- Sett supersedert-banner øverst i `UTVIKLINGSPLAN-LANSERING.md`, `KOMPLETT-PLAN.md` og
  `OVERNIGHT-CODING-LOOP.md` som peker til LAUNCH-PLAN.
- **Verifiser:** `grep` etter «Paper er fasit»/«605a48cc» i rot og `.claude/` gir null aktive treff.

### Steg 2 · Fjern alle 43 døde lenker
Rett dem der målet finnes under nytt navn, fjern setningen der dokumentet er slettet.
Prioritet: `.claude/rules/*` og `CLAUDE.md` først (leses hver økt), deretter `docs/`.
- **Verifiser:** lenkesjekk-kommandoen i steg 8 gir 0 treff.

### Steg 3 · Arkiver Paper-porten (`docs/port/`, 16 filer)
Hele mappen er supersedert 25.08 — Paper-porten er stanset. Rutekartleggingen har
referanseverdi, resten ikke.
- Behold og flytt til `docs/arkiv/paper-port/`: `PORTPLAN.md`, `rutefasit.md`,
  `fasit-liste-paper.md` (rute-inventar), `arkiv/`-innholdet.
- Slett: `PIXEL-PERFECT-PLAN-COMPLETE.md`, `PAPER-ZIP-CHECKLIST.md`, `PP-W3/W4/W5-VARIANTS.md`,
  `monsterdokument-paper.md`, `typografi-skala-paper.md`, `GYLDIGHET.md`, `README.md`.
- Behold i `docs/`: `BOOKING-POLICY.md` + `BOOKING-SLOT-HOLD.md` (forretningsregler, ikke design)
  → flyttes til `docs/platform/`.

### Steg 4 · Komprimer `docs/natt/` (34 → ~10 filer)
De 24 DONE-rapportene er kvitteringer for ferdig arbeid — verdien er i git-historikken.
- Slå sammen til ÉN `docs/natt/LEVERANSELOGG.md`: én rad per loop (hva, PR-nummer, dato).
- Slett de 24 enkeltfilene + `LOOP-1-PROMPT.md` (merket «ferdig brukt»).
- Behold: `README.md`, `LAUNCH-PLAN-FULL-*.md`, `SKJERM-STATUS-2026-08-26.md`,
  `D-LYS-OG-5T-BESLUTNING.md`, `D2-TOKENS-DONE.md`, `D2-UNDERLAG-*.md`,
  `OVERNIGHT-CODING-LOOP-BOLGE2.md`, `workbench/ACCESS-AND-GROUPS.md`.
- Slett `docs/natt/workbench/arkiv/` (frossen spec — koden er fasit).

### Steg 5 · Slå sammen treningsplanleggings-klyngen (10 → 2 filer)
Ti dokumenter fra 18.–20.08 dekker samme sak i lag på lag.
- **Behold:** `vokabular-planlegging-2026-08-18.md` (fasit for ordforrådet, referert fra regler)
  og `spec-treningsplanlegging-2026-08-19.md` (den mest komplette speccen).
- **Slett:** `analyse-`, `gap-evaluering-`, `gap-designfasit-`, `relevans-matrise-`,
  `fase1-grunnmur-`, `forslag-parameterbok-`, `kanon-revisjon-`,
  `samlet-metodikk-og-parameterbok-`, `metodikk-planlegging-komplett-`.
- **Sjekk før sletting:** `parameterbok-planlegging-2026-08-18.md` (566 linjer) — inneholder den
  parametre som ikke finnes i speccen? Hvis ja: flett inn, ikke slett.

### Steg 6 · Rydd rot og foreldreløse dokumenter
- Slett `natt-rapport.md` fra roten (16.08-rapport, «IKKE ferdig», arbeidet er siden levert).
- Gjennomgå de 27 foreldreløse: slett rapporter og engangsanalyser
  (`VEIKART-BESTE-VERKTOY.md`, `platform/screen-context/all-screens.md`,
  `platform/SKJERM-KNAPP-KART.md`, `ux-arkitektur.md`, `wang-arsplan-innlegging.md` m.fl.);
  behold og lenk opp fra `AGENT-BRIEF.md` de som fortsatt har verdi
  (`gdpr/behandlingsregister.md`, `sikkerhet/action-audit.md`,
  `skjermtekst/skjerm-tekst-hovedskjermer.md` — copy-kilde, `integrasjoner/whoop-garmin-oppsett.md`).
- Én linje per beslutning i selve utførelsen, så ingenting forsvinner ubemerket.

### Steg 7 · Arkiver ferdige engangsskript
Flytt ~35 daterte skript (`add-*-2026-*.ts`, `backfill-*`, `bootstrap-*`, `migrate-*`) til
`scripts/arkiv/`. De er kvitteringen på DDL som er kjørt mot prod (jf. `.claude/rules/gotchas.md`)
— derfor arkiv, ikke sletting. `scripts/`-roten skal kun inneholde skript som fortsatt kjøres.
- **Verifiser:** ingen av de flyttede er referert fra `package.json` eller `vercel.json`.

### Steg 8 · Legg inn en lenkevakt så dette ikke skjer igjen
Nytt skript `scripts/check-doc-lenker.mjs` som feiler hvis en `docs/…md`-referanse i
`CLAUDE.md`, `.claude/` eller `docs/` peker på en fil som ikke finnes. Kobles inn i
`npm run verify`.
- **Verifiser:** `npm run verify` er grønn, og et bevisst innført dødt lenkenavn får den til å ryke.

---

## Egen beslutning: `designsystem/paper/` (9,8 MB, 845 filer)

**Anbefaling: IKKE slett nå.** 234 av 240 skjermer har fortsatt Paper-innhold og er ikke portet
til Train-lock. Fasit-filene brukes fortsatt til å lese av oppførsel og copy for de skjermene,
og 122 kodefiler har headerkommentarer som peker dit. Sletter vi nå, får vi 122 døde stier i
koden og mister referansen midt i porten.

**Riktig tidspunkt:** som siste steg av Train-lock-porten (T-bølgen). Da erstattes kommentarene
skjerm for skjerm likevel. Legges inn som en rad i lanseringsplanen, ikke i denne ryddejobben.

---

## Hva som IKKE røres

`docs/platform/` (AGENT-BRIEF, BUSINESS-RULES, DATA-MODEL, PLATFORM-PRD, stripe-cutover) ·
`docs/STATUS-NÅ.md` · `docs/AAPNE-SPORSMAAL.md` · `docs/feillogg.md` · `docs/ordbok-ak-golf-konsept.md` ·
`docs/FASIT-AK-GOLF-HQ.md` · `docs/gdpr/` · `docs/testing.md` · `docs/runbook.md` ·
`docs/turnering-datakilder.md` · `designsystem/train-lock/` · all kode.

---

## Resultat når planen er kjørt

- `docs/`: fra 140 til rundt 55 filer, hver med en eier og en rolle.
- Null døde lenker, med en vakt i `verify` som holder det slik.
- Én lanseringsplan, én fasit, én inngangsdør — ingen konkurrerende dokumenter.
- Alt slettet lever i git-historikken; ingenting er tapt, bare ute av veien.

**Utføres på egen gren, én PR.** Deretter skrives den oppdaterte lanseringsplanen.
