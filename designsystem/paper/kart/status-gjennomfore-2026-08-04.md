# Status · PlayerHQ Gjennomføre-fasit · 2026-08-04

Beslutning (Anders 2026-08-04): designet gjøres ferdig i Claude Design FØR koden
bygges. Dette er de seks fasit-skjermene som manglet for Gjennomføre-flyten —
de eneste PlayerHQ-flatene uten fasit i `fase1/`.

## Levert (6 nye filer i fase1/)

| Fil | Flate | Aksenthandling |
|---|---|---|
| `fase1/playerhq-live-brief.html` | FØR økta: dagens økt, mål, drills | Start økta |
| `fase1/playerhq-live-okt.html` | UNDER: sjekkliste · rep-telling · logg som moduser, øktklokke | Avslutt og logg økta |
| `fase1/playerhq-live-summary.html` | ETTER: avvik plan/gjort, skriv-tilbake, kvittering, neste steg | Lagre i loggen |
| `fase1/playerhq-runde-live.html` | Live runde hull for hull, kun brutto | Lagre runden |
| `fase1/playerhq-runde-logg.html` | Etterregistrering: hull for hull ELLER bare totalen | Logg runden |
| `fase1/playerhq-test-gjennomfor.html` | Test-scorekort (TN Putt Gate) + kvittering «Lagret · oppdatert i TalentHQ» | Lagre testen |

Mønster: samme selvbærende HTML som `playerhq-plan.html` — telefonramme 430 px
som skalerer (fullskjerm under 641 px, 720 px lesekolonne over 1024 px), tokens
v3.1 kopiert verbatim, `data-theme` + localStorage `akhq-theme-playerhq`,
demo-brytere F/T/L/E, `data-od-id` på alt interaktivt, kilde-kommentarer i
datamodellen (TrainingPlanSession · TrainingLog · Round → HoleScore ·
TestDefinition/TestResult · IUP).

FØR/UNDER/ETTER-filene deler en sløyfe-nav (ekte lenker, `aria-current="step"`)
etter mønsteret i `playerhq-chat-desktop.html`.

## Regler fulgt
- Én aksenthandling (#d97757) per skjermtilstand — den som endrer tilstand.
  Laster-tilstand har null. Verifisert i rendret preview (se under).
- AK-formel v2-strenger gjenbrukt fra `workbench-mobil.html` (o2/o3/o5-øktene)
  — ingen L-faser, CS, M0–M5 eller PR1–PR5, ingen oppdiktede drills.
- Testen er TN Putt Gate — verbatim protokoll fra
  `scripts/seed-test-definitions.ts`; scorekortet rendres fra ScorekortSpec-
  formen i `src/lib/portal-tester/protocol.ts` ({nr, label, target?, felter[]}).
- Kun brutto score i runde-flatene. Målverdier merket «foreslått fra IUP —
  aldri låst». Ingenting sperrer: lagre-når-som-helst, hoppe-over-drill,
  avslutte tidlig — alt er lov og forklares som avvik, ikke feil.
- «Hvorfor dette tallet»-utfelling (Kilde · Beregning · Forbehold) på alle
  regnede tall: mål 9 av 12, treff 8 av 12, rundesum, foreslått testmål.
- Tom tilstand: ærlig tekst + én vei videre. Norsk bokmål. Øyvind Rohjan /
  Anders Kristiansen. Gamle Fredrikstad GK som eneste synlige lokasjon.
- Ingen `akhq-*`-klassenavn i filene (selvbærende scoped CSS per fil, som
  øvrige fase1-filer) — null kollisjon mot klasseinventaret.

## Verifisert (Playwright mot rendret preview, 2026-08-04)
Alle seks filer: 0 konsollfeil · alle fire demo-tilstander rendrer · nøyaktig
én synlig aksenthandling i fylt/tom/feil og null i laster · tema-toggle begge
veier med korrekte token-bakgrunner (#faf9f5 / #141413) · ingen interaktive
elementer uten `data-od-id`. Skjermbilder i begge temaer tatt per tilstand.

## Åpne spørsmål til Anders (ikke besvart i designet)
1. **Testlista (21 vs 20 vs 36)** — uavklart. Skjermen viser ÉN protokoll
   (TN Putt Gate) og tar ikke stilling til lista.
2. **TalentHQ** — kvitteringen lenker «Se utviklingen i TalentHQ», men
   TalentHQ-flatene er eget oppdrag som venter på menybeslutningen.
3. **Par-verdier i runde-flatene** — demoen bruker et generisk par 72-oppsett
   for Gamle Fredrikstad GK. Reelle banedata må inn fra basen ved integrasjon.
4. **Foreslått-mål-heuristikken** («sist + 1/+2») er demo-illustrasjon — den
   reelle IUP-koblingen må bekreftes før koding.
5. **«Start en fri økt»** fra tom tilstand i brief/live: starter live-økt uten
   plan. Bekreft at det er ønsket flyt.

## Utenfor scope (bekreftet i oppdraget)
DataGolf-skjermer (plassering uavklart) · TalentHQ-flatene · endringer i
eksisterende fase1-filer · alt i kodebasen · _ds_bundle-kompilering.
