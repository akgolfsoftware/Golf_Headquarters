repo: akgolfsoftware/Golf_Headquarters
branch: main
path: src/app/team-wang

## Last sync
date: 2026-09-08T10:24:00Z

### Updated in this project
- Alle 35 skjermer har nå både mobil 390 og desktop 1280 — 25 desktop-rammer tegnet i denne runden (b2–b6, b8, b9, c1–c9, d1, d3, d4, d6–d10, d12). Skjermbilde-gaten krever begge bredder.
- Porteringspakken skrevet: `PORTING.md`, `SKJERMREGISTER.md`, `TILGANGSMATRISE.md`, `DATAMODELL.md`, `APNE-BESLUTNINGER.md`. Ny `LES-MEG.md` som ikke lenger peker på `3935e216` eller `6061a53c`.
- `tokens/wang-tokens.css` rettet til byte-eksakt kopi av `src/styles/wang-tokens.css` — speilet manglet seks tokens og ett keyframe. `diff` er nå tom.
- Fasiten rettet på to punkter: farget topplinje fjernet fra hvite kort (tre steder), og hendelsestypene skilt i fem (`konkurranse` tatt i bruk, `hendelse` er rosa). Turneringer i årshjulet var typet `prove` og er nå `konkurranse`.
- `eksport/designsystem-wang/` er hele `designsystem/wang/` klar til å kopieres inn, med `ERSTATTER.md` som sier eksplisitt hva som slettes og erstattes.
- Ingen repo-fil er endret. Alle skjermer er forslag som navngir datamodell-hullet de forutsetter.

## Screen map
| Skjerm i dette prosjektet | Repo-filer den er bygget fra |
|---|---|
| `skjermer/a1-skall.html` … `a6-uke.html` | `src/app/team-wang/_components/arsplan-2026-27/arsplan-shell.tsx`, `fane-trening.tsx`, `fane-kalender-arsplan.tsx` |
| `skjermer-batch1/b1-testdag-foring.html` | ingen — ny skjerm; kontrakt fra `coach/iup/[elevId]/page.tsx` (`testResult`) |
| `skjermer-batch1/b2-protokoller.html` | ingen — ny modell foreslått |
| `skjermer-batch1/b3-resultater-elev.html` | `coach/iup/[elevId]/page.tsx` |
| `skjermer-batch1/b4-ukessammendrag.html` | `_components/arsplan-2026-27/fane-foreldre-arsplan.tsx`, `_data/arsplan-fasit-2026-27.ts` (`UKESRAPPORTER`) |
| `skjermer-batch1/b5-dokumenter.html` | ingen — ny modell foreslått |
| `skjermer-batch1/b6-statistikk-skinn.html` | `src/styles/wang-tokens.css` (`.wang-tp`-scope) |
| `skjermer-batch1/b7-turneringer.html` | `src/lib/gruppe-kalender/wang-turneringer.ts` |
| `skjermer-batch1/b8-elev-ark.html` | `_components/live-seksjoner.tsx` (`GruppeRoster`), `coach/iup/[elevId]/iup-samtale.tsx` |
| `skjermer-batch1/b9-samlinger.html` | `_data/arsplan-fasit-2026-27.ts` (samlingsuker) |
| `skjermer-batch2/c1-elevliste.html` | `_components/live-seksjoner.tsx` (`GruppeRoster`), `coach/coach-arsplan.tsx:513` |
| `skjermer-batch2/c2-samling-uttak.html` | `_components/fane-samlinger.tsx` (urutet), `_data/arsplan-fasit-2026-27.ts` |
| `skjermer-batch2/c3-okt-detalj.html` | `_components/okt-detalj.tsx` (urutet), `fane-kalender-arsplan.tsx` |
| `skjermer-batch2/c4-turnering-detalj.html` | `src/lib/gruppe-kalender/wang-turneringer.ts` |
| `skjermer-batch2/c5-iup-kildelinje.html` | `coach/iup/[elevId]/page.tsx:127`, `coach/iup/[elevId]/iup-samtale.tsx` |
| `skjermer-batch2/c6-trenerflate.html` | `coach/coach-arsplan.tsx`, `coach/_data/coach-arsplan.ts` |
| `skjermer-batch2/c7-logg-inn.html` | `logg-inn/wang-login.tsx` |
| `skjermer-batch2/c8-systemtilstander.html` | `_components/arsplan-2026-27/arsplan-shell.tsx`, alle fire `fane-*.tsx` |
| `skjermer-batch2/c9-skole-390.html` | `_components/arsplan-2026-27/fane-skole.tsx`, `SchoolScheduleEntry` |
| `skjermer-batch3/d1-rekruttering.html` | ingen — ny modell foreslått (`Kandidat`, `Vurderingspunkt`) |
| `skjermer-batch3/d2-plasser.html` | ingen — nytt skoleregister foreslått |
| `skjermer-batch3/d3-koordinering.html` | ingen — `SkoleInteresse` + `KoordineringsTråd` foreslått |
| `skjermer-batch3/d4-timeplan.html` | `SchoolScheduleEntry` (mangler skole, klokkeslett, fag) |
| `skjermer-batch3/d5-proveplan.html` | `SchoolScheduleEntry` (`PRØVE`, `HELDAGSPRØVE`, `EKSAMEN`) |
| `skjermer-batch3/d6-foreldremote.html` | årshjulets `hendelse`-events i `_data/arsplan-fasit-2026-27.ts` |
| `skjermer-batch3/d7-gruppeposter.html` | `Gruppe` finnes; `GruppePost` foreslått |
| `skjermer-batch3/d8-post-elev.html` | ingen — `PostTråd` + `Foresatt` foreslått |
| `skjermer-batch3/d9-periodeplan.html` | `_data/arsplan-fasit-2026-27.ts` (fasene er hardkodet fasittekst) |
| `skjermer-batch3/d10-manedsplan.html` | samme som d9; krever varighet per gjennomført økt |
| `skjermer-batch3/d11-trenere.html` | `GroupMember.role` |
| `skjermer-batch3/d12-inviter-elev.html` | `GroupMember`, grensen mot PlayerHQ er udefinert |
| `tokens/wang-tokens.css` | `src/styles/wang-tokens.css` (byte-eksakt speil per 08.09.2026) |
| `PORTING.md` | mønster: `designsystem/train-lock/PORTING.md` |

## Sync history
### 2026-09-07
- Batch 2 tegnet: ni skjermer i `skjermer-batch2/`. `skjermkart.html` samlet 23 skjermer. Speilet manglet 6 tokens + 1 keyframe (rettet 08.09).
